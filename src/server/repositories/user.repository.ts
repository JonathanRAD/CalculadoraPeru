import { UserAccount, SafeUser } from '@/features/auth/types';
import { getSupabaseAdmin, isSupabaseConfigured } from '../config/supabase';
import * as localStorage from '@/features/auth/server/storage';

// Helper: safe local storage access (fails gracefully on Vercel's read-only FS)
function safeLocalFindById(id: string): UserAccount | null {
  try { return localStorage.findUserById(id); } catch { return null; }
}
function safeLocalFindByEmail(email: string): UserAccount | null {
  try { return localStorage.findUserByEmail(email); } catch { return null; }
}
function safeLocalUpdate(id: string, updates: Partial<UserAccount>): SafeUser | null {
  try { return localStorage.updateUser(id, updates); } catch { return null; }
}
function safeLocalGetAll(): SafeUser[] {
  try { return localStorage.getAllUsers(); } catch { return []; }
}

// Supabase is authoritative whenever configured; never mix credentials from local files.
function mapRow(data: Record<string, unknown>): UserAccount {
  return {
    id: data.id as string,
    email: data.email as string,
    name: data.name as string,
    passwordHash: (data.password_hash as string) || '',
    salt: (data.salt as string) || '',
    role: data.role as 'user' | 'admin',
    isPro: data.is_pro as boolean,
    plan: data.plan as 'monthly' | 'yearly' | null,
    proExpiresAt: data.pro_expires_at as string | null,
    activatedCode: data.activated_code as string | null,
    companyName: data.company_name as string | undefined,
    companyRuc: data.company_ruc as string | undefined,
    companyAddress: data.company_address as string | undefined,
    companyLogoBase64: data.company_logo_url as string | undefined,
    createdAt: data.created_at as string,
    sessionVersion: Number(data.session_version ?? 0),
  };
}

export class UserRepository {
  async findById(id: string): Promise<UserAccount | null> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw new Error('No se pudo consultar el perfil.');
        if (!error && data) {
          return mapRow(data as Record<string, unknown>);
        }
        return null;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      if (!isSupabaseConfigured) throw new Error('La base de datos de usuarios no está configurada.');
      return null;
    }
    return safeLocalFindById(id);
  }

  async findByEmail(email: string): Promise<UserAccount | null> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (error) throw new Error('No se pudo consultar el perfil.');
        if (!error && data) {
          return mapRow(data as Record<string, unknown>);
        }
        return null;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      if (!isSupabaseConfigured) throw new Error('La base de datos de usuarios no está configurada.');
      return null;
    }
    return safeLocalFindByEmail(cleanEmail);
  }

  async create(user: UserAccount): Promise<SafeUser> {
    // Always try to persist in Supabase first (production path)
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_pro: user.isPro,
          password_hash: user.passwordHash,
          salt: user.salt,
          session_version: user.sessionVersion ?? 0,
          created_at: user.createdAt,
          updated_at: user.createdAt,
        });

        if (!error) {
          return localStorage.toSafeUser(user);
        }
        throw new Error('No se pudo crear la cuenta.');
      }
    }

    if (process.env.NODE_ENV === 'production') throw new Error('La base de datos de usuarios no está configurada.');
    return localStorage.insertUser(user);
  }

  async update(id: string, updates: Partial<UserAccount>): Promise<SafeUser | null> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const dbPayload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (updates.name !== undefined) dbPayload.name = updates.name;
        if (updates.role !== undefined) dbPayload.role = updates.role;
        if (updates.isPro !== undefined) dbPayload.is_pro = updates.isPro;
        if (updates.plan !== undefined) dbPayload.plan = updates.plan;
        if (updates.proExpiresAt !== undefined) dbPayload.pro_expires_at = updates.proExpiresAt;
        if (updates.activatedCode !== undefined) dbPayload.activated_code = updates.activatedCode;
        if (updates.companyName !== undefined) dbPayload.company_name = updates.companyName;
        if (updates.companyRuc !== undefined) dbPayload.company_ruc = updates.companyRuc;
        if (updates.companyAddress !== undefined) dbPayload.company_address = updates.companyAddress;
        if (updates.companyLogoBase64 !== undefined) dbPayload.company_logo_url = updates.companyLogoBase64;
        // Update password hash if changed (e.g. after password reset)
        if (updates.passwordHash !== undefined) dbPayload.password_hash = updates.passwordHash;
        if (updates.salt !== undefined) dbPayload.salt = updates.salt;
        if (updates.sessionVersion !== undefined) dbPayload.session_version = updates.sessionVersion;

        const { error } = await supabase
          .from('profiles')
          .update(dbPayload)
          .eq('id', id);

        if (!error) {
          const updated = await this.findById(id);
          return updated ? localStorage.toSafeUser(updated) : null;
        }
        throw new Error('No se pudo actualizar la cuenta.');
      }
    }

    if (process.env.NODE_ENV === 'production') throw new Error('La base de datos de usuarios no está configurada.');
    return safeLocalUpdate(id, updates);
  }

  async findAll(): Promise<SafeUser[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw new Error('No se pudo consultar usuarios.');
        if (!error && data) {
          return data.map(row => ({
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
            isPro: row.is_pro,
            plan: row.plan,
            proExpiresAt: row.pro_expires_at,
            activatedCode: row.activated_code,
            companyName: row.company_name,
            companyRuc: row.company_ruc,
            companyAddress: row.company_address,
            companyLogoBase64: row.company_logo_url,
            createdAt: row.created_at,
            sessionVersion: Number(row.session_version ?? 0),
          }));
        }
      }
    }

    if (process.env.NODE_ENV === 'production') throw new Error('La base de datos de usuarios no está configurada.');
    return safeLocalGetAll();
  }
}

export const userRepository = new UserRepository();
