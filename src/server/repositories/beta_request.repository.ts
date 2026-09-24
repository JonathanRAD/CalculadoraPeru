import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabaseAdmin, isSupabaseConfigured, requireDurableStorage } from '../config/supabase';

export interface BetaRequestRecord {
  id: string;
  email: string;
  phone?: string;
  businessType?: string;
  featureNeeded?: string;
  source: string;
  consent: boolean;
  consentTextVersion?: string;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  benefitGranted?: string;
  emailStatus?: 'pending' | 'sent' | 'failed';
  resendMessageId?: string;
  emailSentAt?: string;
  emailErrorCode?: string;
  createdAt: string;
  updatedAt?: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const BETA_FILE = path.join(DATA_DIR, 'beta_requests.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  }
}

function loadLocalBeta(): BetaRequestRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(BETA_FILE)) {
      return JSON.parse(fs.readFileSync(BETA_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveLocalBeta(items: BetaRequestRecord[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(BETA_FILE, JSON.stringify(items, null, 2));
  } catch {}
}

export class BetaRequestRepository {
  async create(data: {
    email: string;
    phone?: string;
    businessType?: string;
    featureNeeded?: string;
    source?: string;
    consent: boolean;
    consentTextVersion?: string;
    idempotencyKey?: string;
    publicRequestId?: string;
  }): Promise<{ success: boolean; id?: string; isDuplicate?: boolean; currentCount: number }> {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone?.trim() || undefined;
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        // Verificar por idempotencyKey si se proporcionó
        if (data.idempotencyKey) {
          const { data: existingIdemp } = await supabase
            .from('beta_requests')
            .select('id')
            .eq('idempotency_key', data.idempotencyKey)
            .maybeSingle();

          if (existingIdemp) {
            const { count } = await supabase.from('beta_requests').select('*', { count: 'exact', head: true });
            return { success: true, id: existingIdemp.id, isDuplicate: true, currentCount: count ?? 0 };
          }
        }

        // Verificar si ya existe por email
        const { data: existing } = await supabase
          .from('beta_requests')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        const { count } = await supabase
          .from('beta_requests')
          .select('*', { count: 'exact', head: true });

        const currentCount = count ?? 0;

        if (existing) {
          return { success: true, id: existing.id, isDuplicate: true, currentCount };
        }

        const id = crypto.randomUUID();
        const { error } = await supabase.from('beta_requests').insert({
          id,
          public_request_id: data.publicRequestId || null,
          email: cleanEmail,
          phone: cleanPhone || null,
          business_type: data.businessType || null,
          feature_needed: data.featureNeeded || null,
          source: data.source || 'cotizador',
          consent: data.consent,
          consent_version: data.consentTextVersion || '2026-v2',
          consent_at: now,
          status: 'pending',
          email_status: 'pending',
          idempotency_key: data.idempotencyKey || null,
          created_at: now,
        });

        if (error) {
          throw new Error(`Error guardando solicitud: ${error.message}`);
        }

        return { success: true, id, isDuplicate: false, currentCount: currentCount + 1 };
      }
    }

    requireDurableStorage();
    const list = loadLocalBeta();
    const found = list.find(r => r.email === cleanEmail);
    if (found) {
      return { success: true, id: found.id, isDuplicate: true, currentCount: list.length };
    }

    const id = crypto.randomUUID();
    const newEntry: BetaRequestRecord = {
      id,
      email: cleanEmail,
      phone: cleanPhone,
      businessType: data.businessType,
      featureNeeded: data.featureNeeded,
      source: data.source || 'cotizador',
      consent: data.consent,
      consentTextVersion: data.consentTextVersion || '2026-v2',
      status: 'pending',
      emailStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newEntry);
    saveLocalBeta(list);

    return { success: true, id, isDuplicate: false, currentCount: list.length };
  }

  async updateEmailDeliveryStatus(
    id: string,
    status: 'sent' | 'failed',
    resendMessageId?: string,
    errorCode?: string
  ): Promise<void> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase
          .from('beta_requests')
          .update({
            email_status: status,
            resend_message_id: resendMessageId || null,
            email_sent_at: status === 'sent' ? now : null,
            email_error_code: errorCode || null,
            updated_at: now,
          })
          .eq('id', id);

        if (error) {
          console.error('[BetaRequestRepository] Error técnico actualizando email_status:', error.message);
        }
        return;
      }
    }

    requireDurableStorage();
    const list = loadLocalBeta();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx].emailStatus = status;
      list[idx].resendMessageId = resendMessageId;
      list[idx].emailSentAt = status === 'sent' ? now : undefined;
      list[idx].emailErrorCode = errorCode;
      list[idx].updatedAt = now;
      saveLocalBeta(list);
    }
  }

  async countValid(): Promise<number> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { count } = await supabase
          .from('beta_requests')
          .select('*', { count: 'exact', head: true });
        return count ?? 0;
      }
    }

    requireDurableStorage();
    return loadLocalBeta().length;
  }
}

export const betaRequestRepository = new BetaRequestRepository();
