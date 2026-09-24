import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabaseAdmin, isSupabaseConfigured, requireDurableStorage } from '../config/supabase';
import { sanitizePostgrestSearch } from '../utils/search-sanitizer';

export type ContactEmailStatus = 'pending' | 'sent' | 'failed';

export interface ContactSubmissionRecord {
  id: string;
  publicRequestId: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  businessType?: string;
  message: string;
  sourcePath?: string;
  consent: boolean;
  consentAt: string;
  consentVersion: string;
  reviewStatus: 'pending' | 'in_progress' | 'resolved' | 'discarded';
  emailStatus: ContactEmailStatus;
  resendMessageId?: string;
  emailErrorCode?: string;
  emailSentAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionInput {
  publicRequestId: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  businessType?: string;
  message: string;
  sourcePath?: string;
  consent: boolean;
  consentAt?: string;
  consentVersion?: string;
  emailStatus?: ContactEmailStatus;
  idempotencyKey?: string;
  ipHash?: string;
}

export interface CreateSubmissionResult {
  success: boolean;
  id: string;
  publicRequestId: string;
  isDuplicate: boolean;
  submission: ContactSubmissionRecord;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'contact_submissions.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
}

function loadLocalSubmissions(): ContactSubmissionRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveLocalSubmissions(items: ContactSubmissionRecord[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(items, null, 2));
  } catch {}
}

export interface FindSubmissionsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  reviewStatus?: string;
  emailStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class ContactSubmissionRepository {
  async create(input: CreateSubmissionInput): Promise<CreateSubmissionResult> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        // Inserción directa aprovechando la restricción UNIQUE(idempotency_key)
        const { data: inserted, error: insertErr } = await supabase
          .from('contact_submissions')
          .insert({
            public_request_id: input.publicRequestId,
            ip_hash: input.ipHash || 'unknown',
            name: input.name.trim(),
            email: input.email.trim().toLowerCase(),
            phone: input.phone || null,
            category: input.category,
            business_type: input.businessType || null,
            message: input.message.trim(),
            source_path: input.sourcePath || '/contacto',
            consent: true,
            consent_version: input.consentVersion || '2026-v2',
            review_status: 'pending',
            email_status: 'pending',
            idempotency_key: input.idempotencyKey || null,
          })
          .select('*')
          .maybeSingle();

        if (insertErr) {
          // Idempotencia atómica: Si PostgreSQL devuelve 23505 (unique_violation), recuperar registro existente
          if (insertErr.code === '23505' && input.idempotencyKey) {
            const { data: existing, error: queryErr } = await supabase
              .from('contact_submissions')
              .select('*')
              .eq('idempotency_key', input.idempotencyKey)
              .maybeSingle();

            if (!queryErr && existing) {
              const rec = this.mapFromDb(existing);
              return {
                success: true,
                id: rec.id,
                publicRequestId: rec.publicRequestId,
                isDuplicate: true,
                submission: rec,
              };
            }
          }
          console.error('[ContactSubmissionRepository] Error en inserción durable:', insertErr.message);
          throw new Error(`Error en persistencia durable: ${insertErr.message}`);
        }

        if (!inserted) {
          throw new Error('Fallo al obtener el registro insertado de contact_submissions.');
        }

        const rec = this.mapFromDb(inserted);
        return {
          success: true,
          id: rec.id,
          publicRequestId: rec.publicRequestId,
          isDuplicate: false,
          submission: rec,
        };
      }
    }

    requireDurableStorage();
    const list = loadLocalSubmissions();

    if (input.idempotencyKey) {
      const existing = list.find((s) => s.idempotencyKey === input.idempotencyKey);
      if (existing) {
        return {
          success: true,
          id: existing.id,
          publicRequestId: existing.publicRequestId,
          isDuplicate: true,
          submission: existing,
        };
      }
    }

    const newRecord: ContactSubmissionRecord = {
      id: crypto.randomUUID(),
      publicRequestId: input.publicRequestId,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone,
      category: input.category,
      businessType: input.businessType,
      message: input.message.trim(),
      sourcePath: input.sourcePath || '/contacto',
      consent: true,
      consentAt: now,
      consentVersion: input.consentVersion || '2026-v2',
      reviewStatus: 'pending',
      emailStatus: 'pending',
      idempotencyKey: input.idempotencyKey,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newRecord);
    saveLocalSubmissions(list);

    return {
      success: true,
      id: newRecord.id,
      publicRequestId: newRecord.publicRequestId,
      isDuplicate: false,
      submission: newRecord,
    };
  }

  async findByIdempotencyKey(key: string): Promise<ContactSubmissionRecord | null> {
    if (!key || typeof key !== 'string') return null;
    const cleanKey = key.trim();
    if (!cleanKey) return null;

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('contact_submissions')
          .select('*')
          .eq('idempotency_key', cleanKey)
          .maybeSingle();

        if (error || !data) return null;
        return this.mapFromDb(data);
      }
    }

    requireDurableStorage();
    const list = loadLocalSubmissions();
    const found = list.find((s) => s.idempotencyKey === cleanKey);
    return found || null;
  }

  async findAll(params: FindSubmissionsParams = {}): Promise<{
    submissions: ContactSubmissionRecord[];
    total: number;
  }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        let query = supabase
          .from('contact_submissions')
          .select('*', { count: 'exact' });

        if (params.category && params.category !== 'all') {
          query = query.eq('category', params.category);
        }
        if (params.reviewStatus && params.reviewStatus !== 'all') {
          query = query.eq('review_status', params.reviewStatus);
        }
        if (params.emailStatus && params.emailStatus !== 'all') {
          query = query.eq('email_status', params.emailStatus);
        }
        if (params.dateFrom) {
          query = query.gte('created_at', params.dateFrom);
        }
        if (params.dateTo) {
          query = query.lte('created_at', `${params.dateTo}T23:59:59.999Z`);
        }
        if (params.search?.trim()) {
          const sanitized = sanitizePostgrestSearch(params.search, 50);
          if (sanitized) {
            query = query.or(`public_request_id.ilike.%${sanitized}%,email.ilike.%${sanitized}%,name.ilike.%${sanitized}%,business_type.ilike.%${sanitized}%`);
          }
        }

        const { data, count, error } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (!error && data) {
          return {
            submissions: data.map(this.mapFromDb),
            total: count ?? 0,
          };
        }
        if (error) {
          console.error('[ContactSubmissionRepository] Error en findAll:', error.message);
        }
      }
    }

    requireDurableStorage();
    let list = loadLocalSubmissions();

    if (params.category && params.category !== 'all') {
      list = list.filter((s) => s.category === params.category);
    }
    if (params.reviewStatus && params.reviewStatus !== 'all') {
      list = list.filter((s) => s.reviewStatus === params.reviewStatus);
    }
    if (params.emailStatus && params.emailStatus !== 'all') {
      list = list.filter((s) => s.emailStatus === params.emailStatus);
    }
    if (params.dateFrom) {
      list = list.filter((s) => s.createdAt >= params.dateFrom!);
    }
    if (params.dateTo) {
      list = list.filter((s) => s.createdAt <= `${params.dateTo!}T23:59:59.999Z`);
    }
    if (params.search?.trim()) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.publicRequestId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.businessType && s.businessType.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const paginated = list.slice(offset, offset + limit);

    return {
      submissions: paginated,
      total,
    };
  }

  async findById(id: string): Promise<ContactSubmissionRecord | null> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('contact_submissions')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return this.mapFromDb(data);
        }
        if (error) {
          console.error('[ContactSubmissionRepository] Error en findById:', error.message);
        }
      }
    }

    requireDurableStorage();
    const list = loadLocalSubmissions();
    return list.find((s) => s.id === id) || null;
  }

  async updateReviewStatus(
    id: string,
    reviewStatus: 'pending' | 'in_progress' | 'resolved' | 'discarded',
    reviewedBy?: string
  ): Promise<ContactSubmissionRecord | null> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const updatePayload: Record<string, unknown> = {
          review_status: reviewStatus,
          reviewed_at: now,
          updated_at: now,
        };
        if (reviewedBy) {
          updatePayload.reviewed_by = reviewedBy;
        }

        const { data, error } = await supabase
          .from('contact_submissions')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) {
          console.error('[ContactSubmissionRepository] Error actualizando review_status:', error.message);
          return null;
        }
        if (data) {
          return this.mapFromDb(data);
        }
      }
    }

    requireDurableStorage();
    const list = loadLocalSubmissions();
    const idx = list.findIndex((s) => s.id === id);
    if (idx !== -1) {
      list[idx].reviewStatus = reviewStatus;
      list[idx].reviewedAt = now;
      list[idx].reviewedBy = reviewedBy;
      list[idx].updatedAt = now;
      saveLocalSubmissions(list);
      return list[idx];
    }
    return null;
  }

  async updateEmailStatus(
    id: string,
    emailStatus: 'sent' | 'failed',
    resendMessageId?: string,
    errorCode?: string
  ): Promise<ContactSubmissionRecord | null> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('contact_submissions')
          .update({
            email_status: emailStatus,
            resend_message_id: resendMessageId || null,
            email_sent_at: emailStatus === 'sent' ? now : null,
            email_error_code: errorCode || null,
            updated_at: now,
          })
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) {
          console.error('[ContactSubmissionRepository] Error técnico actualizando email_status:', error.message);
          return null;
        }
        if (data) {
          return this.mapFromDb(data);
        }
      }
    }

    requireDurableStorage();
    const list = loadLocalSubmissions();
    const idx = list.findIndex((s) => s.id === id);
    if (idx !== -1) {
      list[idx].emailStatus = emailStatus;
      list[idx].resendMessageId = resendMessageId;
      list[idx].emailSentAt = emailStatus === 'sent' ? now : undefined;
      list[idx].emailErrorCode = errorCode;
      list[idx].updatedAt = now;
      saveLocalSubmissions(list);
      return list[idx];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase
          .from('contact_submissions')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('[ContactSubmissionRepository] Error eliminando solicitud:', error.message);
          return false;
        }
        return true;
      }
    }

    requireDurableStorage();
    const list = loadLocalSubmissions();
    const filtered = list.filter((s) => s.id !== id);
    if (filtered.length !== list.length) {
      saveLocalSubmissions(filtered);
      return true;
    }
    return false;
  }

  private mapFromDb(row: Record<string, unknown>): ContactSubmissionRecord {
    return {
      id: String(row.id),
      publicRequestId: String(row.public_request_id),
      name: String(row.name),
      email: String(row.email),
      phone: row.phone ? String(row.phone) : undefined,
      category: String(row.category),
      businessType: row.business_type ? String(row.business_type) : undefined,
      message: String(row.message),
      sourcePath: row.source_path ? String(row.source_path) : undefined,
      consent: Boolean(row.consent),
      consentAt: String(row.consent_at),
      consentVersion: String(row.consent_version),
      reviewStatus: row.review_status as ContactSubmissionRecord['reviewStatus'],
      emailStatus: row.email_status as ContactSubmissionRecord['emailStatus'],
      resendMessageId: row.resend_message_id ? String(row.resend_message_id) : undefined,
      emailErrorCode: row.email_error_code ? String(row.email_error_code) : undefined,
      emailSentAt: row.email_sent_at ? String(row.email_sent_at) : undefined,
      reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
      reviewedBy: row.reviewed_by ? String(row.reviewed_by) : undefined,
      idempotencyKey: row.idempotency_key ? String(row.idempotency_key) : undefined,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  }
}

export const contactSubmissionRepository = new ContactSubmissionRepository();
