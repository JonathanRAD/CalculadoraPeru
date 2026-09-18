import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey));

let adminInstance: SupabaseClient | null = null;
let clientInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!adminInstance) {
    adminInstance = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminInstance;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
      },
    });
  }
  return clientInstance;
}
