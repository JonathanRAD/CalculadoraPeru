import { UserAccount, SafeUser } from '@/features/auth/types';
import { getSupabaseAdmin, isSupabaseConfigured } from '../config/supabase';
import * as localStorage from '@/features/auth/server/storage';

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

        if (!error && data) {
          return {
            id: data.id,
            email: data.email,
            name: data.name,
            passwordHash: '',
            salt: '',
            role: data.role,
            isPro: data.is_pro,
            plan: data.plan,
            proExpiresAt: data.pro_expires_at,
            activatedCode: data.activated_code,
            companyName: data.company_name,
            companyRuc: data.company_ruc,
            companyAddress: data.company_address,
            companyLogoBase64: data.company_logo_url,
            createdAt: data.created_at,
          };
        }
      }
    }

    return localStorage.findUserById(id);
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

        if (!error && data) {
          return {
            id: data.id,
            email: data.email,
            name: data.name,
            passwordHash: '',
            salt: '',
            role: data.role,
            isPro: data.is_pro,
            plan: data.plan,
            proExpiresAt: data.pro_expires_at,
            activatedCode: data.activated_code,
            companyName: data.company_name,
            companyRuc: data.company_ruc,
            companyAddress: data.company_address,
            companyLogoBase64: data.company_logo_url,
            createdAt: data.created_at,
          };
        }
      }
    }

    return localStorage.findUserByEmail(cleanEmail);
  }

  async create(user: UserAccount): Promise<SafeUser> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_pro: user.isPro,
          created_at: user.createdAt,
          updated_at: user.createdAt,
        });

        if (!error) {
          return localStorage.toSafeUser(user);
        }
      }
    }

    return localStorage.createUser({
      email: user.email,
      name: user.name,
      password: 'managed-password',
      role: user.role,
    });
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

        const { error } = await supabase
          .from('profiles')
          .update(dbPayload)
          .eq('id', id);

        if (!error) {
          const updated = await this.findById(id);
          return updated ? localStorage.toSafeUser(updated) : null;
        }
      }
    }

    return localStorage.updateUser(id, updates);
  }

  async findAll(): Promise<SafeUser[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

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
          }));
        }
      }
    }

    return localStorage.getAllUsers();
  }
}

export const userRepository = new UserRepository();
