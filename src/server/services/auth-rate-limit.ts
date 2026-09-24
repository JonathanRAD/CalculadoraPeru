import crypto from 'crypto';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/server/config/supabase';
import { resolveAuthSecret } from '@/server/config/server-env';

export type AuthRateLimitAction =
  | 'login'
  | 'register'
  | 'contact'
  | 'contact_general'
  | 'cotizador_feedback'
  | 'coupon'
  | string;

export async function checkAuthRateLimit(
  req: Request,
  action: AuthRateLimitAction,
  email: string
): Promise<boolean> {
  if (!isSupabaseConfigured) {
    if (process.env.NODE_ENV === 'production') throw new Error('Limitador de autenticación no configurado.');
    return true;
  }

  const secret = resolveAuthSecret();

  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
  const buckets = [
    { key: `${action}:ip:${ip}`, limit: action === 'login' ? 20 : 5, windowSeconds: 900 },
    { key: `${action}:email:${email}`, limit: action === 'login' ? 8 : 3, windowSeconds: 900 },
  ];
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Limitador de autenticación no disponible.');

  for (const bucket of buckets) {
    const hashed = crypto.createHmac('sha256', secret).update(bucket.key).digest('hex');
    const { data, error } = await supabase.rpc('consume_auth_rate_limit', {
      p_bucket: hashed,
      p_limit: bucket.limit,
      p_window_seconds: bucket.windowSeconds,
    });
    if (error) throw new Error('Limitador de autenticación no disponible.');
    if (data !== true) return false;
  }

  return true;
}
