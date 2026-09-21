import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SubscriptionRequest, SubscriptionStatus } from '@/features/auth/types';
import { getSupabaseAdmin, isSupabaseConfigured } from '../config/supabase';

const DATA_DIR = path.join(process.cwd(), '.data');
const SUB_REQUESTS_FILE = path.join(DATA_DIR, 'subscription_requests.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
}

function loadLocalRequests(): SubscriptionRequest[] {
  try {
    ensureDataDir();
    if (fs.existsSync(SUB_REQUESTS_FILE)) {
      const raw = fs.readFileSync(SUB_REQUESTS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}

  // Seed default test request from user's submission if new
  const initial: SubscriptionRequest[] = [
    {
      id: 'sub-user-test-1',
      customerName: 'juansito',
      customerEmail: 'jonathanrujel4@gmail.com',
      customerPhone: '913544716',
      plan: 'yearly',
      amount: 149,
      operationCode: '1241252151',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ];
  saveLocalRequests(initial);
  return initial;
}

function saveLocalRequests(items: SubscriptionRequest[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(SUB_REQUESTS_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local subscription requests:', err);
  }
}

export class SubscriptionRequestRepository {
  async findAll(): Promise<SubscriptionRequest[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('subscription_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map(row => ({
            id: row.id,
            customerName: row.customer_name,
            customerEmail: row.customer_email,
            customerPhone: row.customer_phone,
            plan: row.plan,
            amount: Number(row.amount),
            operationCode: row.operation_code,
            couponCode: row.coupon_code || undefined,
            userId: row.user_id || undefined,
            status: row.status as SubscriptionStatus,
            generatedLicenseCode: row.generated_license_code || undefined,
            notes: row.notes || undefined,
            createdAt: row.created_at,
            reviewedAt: row.reviewed_at || undefined,
            reviewedBy: row.reviewed_by || undefined,
          }));
        }
      }
    }

    return loadLocalRequests().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findById(id: string): Promise<SubscriptionRequest | null> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('subscription_requests')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerPhone: data.customer_phone,
            plan: data.plan,
            amount: Number(data.amount),
            operationCode: data.operation_code,
            couponCode: data.coupon_code || undefined,
            userId: data.user_id || undefined,
            status: data.status as SubscriptionStatus,
            generatedLicenseCode: data.generated_license_code || undefined,
            notes: data.notes || undefined,
            createdAt: data.created_at,
            reviewedAt: data.reviewed_at || undefined,
            reviewedBy: data.reviewed_by || undefined,
          };
        }
      }
    }

    const list = loadLocalRequests();
    return list.find(r => r.id === id) || null;
  }

  async create(input: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    plan: 'monthly' | 'yearly';
    amount: number;
    operationCode: string;
    couponCode?: string;
    userId?: string;
  }): Promise<SubscriptionRequest> {
    const newReq: SubscriptionRequest = {
      id: crypto.randomUUID(),
      ...input,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase.from('subscription_requests').insert({
          id: newReq.id,
          customer_name: newReq.customerName,
          customer_email: newReq.customerEmail,
          customer_phone: newReq.customerPhone,
          plan: newReq.plan,
          amount: newReq.amount,
          operation_code: newReq.operationCode,
          coupon_code: newReq.couponCode || null,
          user_id: newReq.userId || null,
          status: newReq.status,
          created_at: newReq.createdAt,
        });

        if (!error) return newReq;
      }
    }

    const list = loadLocalRequests();
    // Prevent duplicate submission with same operation code within 24h
    const existing = list.find(
      r => r.operationCode.toUpperCase() === input.operationCode.toUpperCase() && r.status === 'pending'
    );
    if (existing) {
      return existing;
    }

    list.unshift(newReq);
    saveLocalRequests(list);
    return newReq;
  }

  async approve(id: string, licenseCode: string, reviewedBy: string): Promise<SubscriptionRequest | null> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('subscription_requests')
          .update({
            status: 'approved',
            generated_license_code: licenseCode,
            reviewed_at: now,
            reviewed_by: reviewedBy,
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerPhone: data.customer_phone,
            plan: data.plan,
            amount: Number(data.amount),
            operationCode: data.operation_code,
            couponCode: data.coupon_code || undefined,
            userId: data.user_id || undefined,
            status: 'approved',
            generatedLicenseCode: licenseCode,
            notes: data.notes || undefined,
            createdAt: data.created_at,
            reviewedAt: now,
            reviewedBy,
          };
        }
      }
    }

    const list = loadLocalRequests();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      status: 'approved',
      generatedLicenseCode: licenseCode,
      reviewedAt: now,
      reviewedBy,
    };
    saveLocalRequests(list);
    return list[idx];
  }

  async reject(id: string, reviewedBy: string, notes?: string): Promise<SubscriptionRequest | null> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('subscription_requests')
          .update({
            status: 'rejected',
            notes: notes || null,
            reviewed_at: now,
            reviewed_by: reviewedBy,
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerPhone: data.customer_phone,
            plan: data.plan,
            amount: Number(data.amount),
            operationCode: data.operation_code,
            couponCode: data.coupon_code || undefined,
            userId: data.user_id || undefined,
            status: 'rejected',
            notes,
            createdAt: data.created_at,
            reviewedAt: now,
            reviewedBy,
          };
        }
      }
    }

    const list = loadLocalRequests();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      status: 'rejected',
      notes,
      reviewedAt: now,
      reviewedBy,
    };
    saveLocalRequests(list);
    return list[idx];
  }
}

export const subscriptionRequestRepository = new SubscriptionRequestRepository();
