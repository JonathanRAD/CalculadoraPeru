import { LicenseCode } from '@/features/auth/types';
import { getSupabaseAdmin, isSupabaseConfigured, requireDurableStorage } from '../config/supabase';
import * as localStorage from '@/features/auth/server/storage';

export class LicenseRepository {
  async findAll(): Promise<LicenseCode[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('licenses')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map(row => ({
            id: row.id,
            code: row.code,
            plan: row.plan,
            durationDays: row.duration_days,
            assignedClientName: row.assigned_client_name,
            assignedClientEmail: row.assigned_client_email || undefined,
            status: row.status,
            redeemedByUserId: row.redeemed_by_user_id || undefined,
            redeemedByUserEmail: row.redeemed_by_user_email || undefined,
            redeemedAt: row.redeemed_at || undefined,
            createdAt: row.created_at,
            createdBy: row.created_by || undefined,
          }));
        }
      }
    }

    requireDurableStorage();
    // Local fallback for development only.
    return localStorage.getAllLicenses();
  }

  async findByCode(code: string): Promise<LicenseCode | null> {
    const cleanCode = code.trim().toUpperCase();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('licenses')
          .select('*')
          .eq('code', cleanCode)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            code: data.code,
            plan: data.plan,
            durationDays: data.duration_days,
            assignedClientName: data.assigned_client_name,
            assignedClientEmail: data.assigned_client_email || undefined,
            status: data.status,
            redeemedByUserId: data.redeemed_by_user_id || undefined,
            redeemedByUserEmail: data.redeemed_by_user_email || undefined,
            redeemedAt: data.redeemed_at || undefined,
            createdAt: data.created_at,
            createdBy: data.created_by || undefined,
          };
        }
        if (!error) return null;
      }
    }

    requireDurableStorage();
    // Local fallback for development only.
    return localStorage.findLicenseByCode(cleanCode);
  }

  async create(license: LicenseCode): Promise<LicenseCode> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(license.id);
        const insertPayload: Record<string, unknown> = {
          code: license.code,
          plan: license.plan,
          duration_days: license.durationDays,
          assigned_client_name: license.assignedClientName,
          assigned_client_email: license.assignedClientEmail || null,
          status: license.status,
          created_by: license.createdBy || 'Admin Panel',
          created_at: license.createdAt,
        };

        if (isUUID) {
          insertPayload.id = license.id;
        }

        const { data, error } = await supabase
          .from('licenses')
          .insert(insertPayload)
          .select()
          .single();

        if (!error && data) {
          return {
            ...license,
            id: data.id,
          };
        }

        if (error) {
          console.error('Error insertando licencia en Supabase:', error);
          throw new Error(`Error en base de datos al generar licencia: ${error.message}`);
        }
      }
    }

    requireDurableStorage();
    // Local fallback (dev only)
    return localStorage.createLicense({
      plan: license.plan,
      clientName: license.assignedClientName,
      clientEmail: license.assignedClientEmail,
      durationDays: license.durationDays,
      createdBy: license.createdBy,
    });
  }

  async update(code: string, updates: Partial<LicenseCode>): Promise<LicenseCode | null> {
    const cleanCode = code.trim().toUpperCase();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const dbPayload: Record<string, unknown> = {};
        if (updates.status) dbPayload.status = updates.status;
        if (updates.redeemedByUserId) dbPayload.redeemed_by_user_id = updates.redeemedByUserId;
        if (updates.redeemedByUserEmail) dbPayload.redeemed_by_user_email = updates.redeemedByUserEmail;
        if (updates.redeemedAt) dbPayload.redeemed_at = updates.redeemedAt;

        const { error } = await supabase
          .from('licenses')
          .update(dbPayload)
          .eq('code', cleanCode);

        if (!error) {
          return this.findByCode(cleanCode);
        }
      }
    }

    requireDurableStorage();
    // Local fallback for development only.
    return localStorage.updateLicense(cleanCode, updates);
  }

  async delete(code: string): Promise<boolean> {
    const cleanCode = code.trim().toUpperCase();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase.from('licenses').delete().eq('code', cleanCode);
        return !error;
      }
    }

    requireDurableStorage();
    return localStorage.deleteLicense(cleanCode);
  }
}

export const licenseRepository = new LicenseRepository();
