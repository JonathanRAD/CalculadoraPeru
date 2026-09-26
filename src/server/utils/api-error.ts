/**
 * api-error.ts
 *
 * Utilidades para manejar errores en rutas API de forma segura.
 * Garantiza que los detalles internos (mensajes de Supabase, PostgreSQL,
 * nombres de RPC, restricciones, hints, stack traces, etc.) nunca lleguen al cliente.
 *
 * Registro seguro en servidor:
 * - Sanitiza y redacta información sensible (correos, teléfonos, tokens, cookies, credenciales).
 * - Neutraliza saltos de línea para prevenir log injection (CWE-117).
 * - Limita la longitud del mensaje para prevenir denegación de servicio por flooding de logs.
 * - Registra el incidentId de correlación, tipo de error y código técnico si existe.
 */

import { RequestBodyError } from '../validators/request-body';

export interface ApiErrorResponse {
  success: false;
  message: string;
  incidentId: string;
}

/**
 * Sanitiza un mensaje de error antes de escribirlo en los logs del servidor.
 * Elimina PII, secretos, tokens, cookies, credenciales y saltos de línea.
 */
export function sanitizeLogMessage(input: string, maxLength = 300): string {
  if (!input) return '';

  let sanitized = input
    // 1. Reemplazar saltos de línea y tabuladores por espacios simples (prevención de Log Injection CWE-117)
    .replace(/[\r\n\t]+/g, ' ')
    // 2. Redactar URLs con credenciales (ej. postgres://user:pass@host o https://user:pass@host)
    .replace(/([a-zA-Z][a-zA-Z0-9+.-]*:\/\/)[^\s/@:]+:[^\s/@:]+@/gi, '$1[REDACTED_CREDENTIALS]@')
    // 3. Redactar cabeceras de autorización Bearer antes de JWT
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+/gi, 'Bearer [REDACTED_TOKEN]')
    // 4. Redactar tokens JWT independientes
    .replace(/\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[REDACTED_JWT]')
    // 5. Redactar cookies
    .replace(/(?:cookie|cookies|set-cookie)\s*[:=]\s*[^;,\s]+/gi, 'cookie=[REDACTED_COOKIE]')
    // 6. Redactar claves API, passwords, secrets
    .replace(/(api[_-]?key|secret|password|auth_token)\s*[:=]\s*['"]?[^\s"',;]+['"]?/gi, '$1=[REDACTED]')
    // 7. Redactar correos electrónicos
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    // 8. Redactar números de teléfono peruanos y formatos habituales
    .replace(/(?:\+?51\s*)?9\d{8}\b/g, '[REDACTED_PHONE]')
    .replace(/\b\d{3}[-.\s]\d{3}[-.\s]\d{3,4}\b/g, '[REDACTED_PHONE]');

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength) + '...[TRUNCATED]';
  }

  return sanitized.trim();
}

/**
 * Extrae un código técnico seguro si existe en el error (ej. códigos SQL '23505', '42P01', etc.).
 */
export function extractTechnicalCode(err: unknown): string | null {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const raw = (err as { code: unknown }).code;
    if (typeof raw === 'string' || typeof raw === 'number') {
      const codeStr = String(raw).trim();
      // Permitir únicamente códigos alfanuméricos cortos seguros
      if (/^[A-Za-z0-9_-]{2,20}$/.test(codeStr)) {
        return codeStr;
      }
    }
  }
  return null;
}

/**
 * Procesa un error capturado en un catch y retorna:
 * - Para RequestBodyError: el mensaje seguro del error y su status HTTP.
 * - Para cualquier otro error: un mensaje genérico + incidentId para correlación.
 *
 * Registra en el servidor: operación, incidentId, tipo de error, código técnico
 * y mensaje sanitizado (sin tokens, cookies ni datos personales).
 */
export function handleApiError(
  err: unknown,
  operation: string,
  genericMessage: string
): { body: ApiErrorResponse | { success: false; message: string }; status: number } {
  if (err instanceof RequestBodyError) {
    // Mensaje redactado por nuestra propia lógica de validación — seguro de exponer.
    return {
      body: { success: false, message: err.message },
      status: err.status,
    };
  }

  // Error inesperado: generar UUID único para correlación
  const incidentId = crypto.randomUUID();
  const errorType = err instanceof Error ? err.constructor.name : typeof err;
  const technicalCode = extractTechnicalCode(err);
  const rawMessage = err instanceof Error ? err.message : String(err);
  const safeMessage = sanitizeLogMessage(rawMessage);

  // Registro seguro en consola del servidor (sin log injection ni PII/credenciales)
  console.error(
    `[API Error] op=${operation} incidentId=${incidentId} type=${errorType} code=${technicalCode || 'NONE'}: ${safeMessage}`
  );

  return {
    body: {
      success: false,
      message: genericMessage,
      incidentId,
    },
    status: 500,
  };
}
