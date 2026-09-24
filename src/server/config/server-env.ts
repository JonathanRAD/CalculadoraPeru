/**
 * Validación y configuración centralizada de variables de entorno del servidor.
 * 
 * Reglas de seguridad:
 * 1. Las variables secretas NUNCA deben llevar prefijo NEXT_PUBLIC_.
 * 2. En producción (NODE_ENV === 'production'), cualquier variable requerida que falte
 *    arroja un error controlado sin exponer nombres ni valores de secretos.
 * 3. Nunca se exponen nombres de variables faltantes ni valores en mensajes devueltos al cliente.
 * 4. No se usan fallbacks predecibles como 'calculaperu_rate_secret' o correos hardcodeados.
 * 5. Se desacopla la validación por capacidades (Auth, Supabase, Email) para evitar que
 *    un fallo en variables de correo impida el inicio de sesión o consultas de base de datos.
 */

import crypto from 'crypto';

export interface AuthEnvironment {
  isProduction: boolean;
  authTokenSecret: string;
}

export interface SupabaseEnvironment {
  isProduction: boolean;
  supabaseUrl: string | null;
  supabaseServiceRoleKey: string | null;
  isConfigured: boolean;
}

export interface EmailEnvironment {
  isProduction: boolean;
  resendApiKey: string | null;
  resendFromEmail: string | null;
  contactRecipientEmail: string | null;
  isConfigured: boolean;
}

export interface ServerEnvironment {
  isProduction: boolean;
  authTokenSecret: string;
  supabaseUrl: string | null;
  supabaseServiceRoleKey: string | null;
  resendApiKey: string | null;
  resendFromEmail: string | null;
  contactRecipientEmail: string | null;
}

let devRandomAuthSecret: string | null = null;
let hasWarnedLegacyAuthSecret = false;
let hasWarnedDevRandomAuthSecret = false;

/**
 * Función de utilidad para pruebas automatizadas que resetea el estado en memoria.
 */
export function _resetDevAuthSecretForTesting(): void {
  devRandomAuthSecret = null;
  hasWarnedLegacyAuthSecret = false;
  hasWarnedDevRandomAuthSecret = false;
}

export function resolveAuthSecret(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const canonical = process.env.AUTH_SECRET?.trim();
  const legacy = process.env.AUTH_TOKEN_SECRET?.trim();

  // 1. Si AUTH_SECRET existe, exigir al menos 32 caracteres
  if (canonical) {
    if (canonical.length < 32) {
      throw new Error('Configuración de seguridad del servidor inválida: AUTH_SECRET debe tener al menos 32 caracteres.');
    }
    return canonical;
  }

  // 2. Compatibilidad temporal obsoleta con AUTH_TOKEN_SECRET (remoción: 2026-12-31)
  if (legacy) {
    if (legacy.length < 32) {
      throw new Error('Configuración de seguridad del servidor inválida: AUTH_TOKEN_SECRET debe tener al menos 32 caracteres.');
    }
    if (!hasWarnedLegacyAuthSecret) {
      console.warn('[Configuración de Seguridad - OBSOLETA] Se está utilizando la variable heredada AUTH_TOKEN_SECRET. Esta variable quedará obsoleta y será removida el 2026-12-31. Configure AUTH_SECRET en su entorno.');
      hasWarnedLegacyAuthSecret = true;
    }
    return legacy;
  }

  // 3. En producción, es un fallo crítico si no existe secreto válido
  if (isProduction) {
    throw new Error('Configuración de seguridad del servidor inválida o incompleta (se requiere AUTH_SECRET de al menos 32 caracteres).');
  }

  // 4. En desarrollo, generar una clave criptográficamente aleatoria por proceso y conservarla en memoria
  if (!devRandomAuthSecret) {
    devRandomAuthSecret = crypto.randomBytes(32).toString('hex');
  }

  if (!hasWarnedDevRandomAuthSecret) {
    console.warn('[Configuración de Seguridad - Desarrollo] No se detectó AUTH_SECRET; se generó una clave criptográfica aleatoria temporal en memoria para esta sesión. Las sesiones activas se invalidarán al reiniciar el servidor.');
    hasWarnedDevRandomAuthSecret = true;
  }

  return devRandomAuthSecret;
}

export function getAuthEnv(): AuthEnvironment {
  const isProduction = process.env.NODE_ENV === 'production';
  const secret = resolveAuthSecret();

  return {
    isProduction,
    authTokenSecret: secret,
  };
}

export function getSupabaseEnv(): SupabaseEnvironment {
  const isProduction = process.env.NODE_ENV === 'production';
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim() || null;
  const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)?.trim() || null;
  const isConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

  if (isProduction && !isConfigured) {
    throw new Error('Configuración de persistencia durable del servidor inválida o incompleta.');
  }

  return {
    isProduction,
    supabaseUrl,
    supabaseServiceRoleKey,
    isConfigured,
  };
}

export function getEmailEnv(): EmailEnvironment {
  const isProduction = process.env.NODE_ENV === 'production';
  const resendApiKey = process.env.RESEND_API_KEY?.trim() || null;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim() || null;
  const contactRecipientEmail = process.env.CONTACT_RECIPIENT_EMAIL?.trim() || null;
  const isConfigured = Boolean(resendApiKey && resendFromEmail && contactRecipientEmail);

  if (isProduction && !isConfigured) {
    throw new Error('Configuración del servicio de correo del servidor incompleta.');
  }

  return {
    isProduction,
    resendApiKey,
    resendFromEmail,
    contactRecipientEmail,
    isConfigured,
  };
}

export function getServerEnv(): ServerEnvironment {
  const auth = getAuthEnv();
  const supabase = getSupabaseEnv();
  const isProduction = process.env.NODE_ENV === 'production';
  const resendApiKey = process.env.RESEND_API_KEY?.trim() || null;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim() || null;
  const contactRecipientEmail = process.env.CONTACT_RECIPIENT_EMAIL?.trim() || null;

  return {
    isProduction,
    authTokenSecret: auth.authTokenSecret,
    supabaseUrl: supabase.supabaseUrl,
    supabaseServiceRoleKey: supabase.supabaseServiceRoleKey,
    resendApiKey,
    resendFromEmail,
    contactRecipientEmail,
  };
}
