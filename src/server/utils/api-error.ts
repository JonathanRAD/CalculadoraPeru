/**
 * api-error.ts
 *
 * Utilidades para manejar errores en rutas API de forma segura.
 * Garantiza que los detalles internos (mensajes de Supabase, PostgreSQL,
 * nombres de RPC, restricciones, etc.) nunca lleguen al cliente.
 *
 * Solo los errores de validación controlados (RequestBodyError) pueden
 * devolver su mensaje al cliente, ya que son mensajes redactados de forma
 * segura por el propio código de la aplicación.
 */

import { RequestBodyError } from '../validators/request-body';

export interface ApiErrorResponse {
  success: false;
  message: string;
  incidentId: string;
}

/**
 * Procesa un error capturado en un catch y retorna:
 * - Para RequestBodyError: el mensaje seguro del error y su status HTTP.
 * - Para cualquier otro error: un mensaje genérico + incidentId para correlación.
 *
 * Registra en el servidor: operación, incidentId y el error interno (sin datos personales).
 */
export function handleApiError(
  err: unknown,
  operation: string,
  genericMessage: string
): { body: ApiErrorResponse | { success: false; message: string }; status: number } {
  if (err instanceof RequestBodyError) {
    // Mensaje redactado por nuestra propia lógica — seguro de exponer.
    return {
      body: { success: false, message: err.message },
      status: err.status,
    };
  }

  // Error inesperado: registrar internamente, nunca exponer al cliente.
  const incidentId = crypto.randomUUID();
  const internalMessage = err instanceof Error ? err.message : String(err);

  // Log: solo en servidor. No incluir tokens, cookies ni datos personales.
  console.error(`[API Error] op=${operation} incidentId=${incidentId}`, internalMessage);

  return {
    body: {
      success: false,
      message: genericMessage,
      incidentId,
    },
    status: 500,
  };
}
