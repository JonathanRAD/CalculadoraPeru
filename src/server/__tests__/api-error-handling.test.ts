import { describe, it, expect, vi } from 'vitest';
import { handleApiError, sanitizeLogMessage, extractTechnicalCode } from '../utils/api-error';
import { RequestBodyError } from '../validators/request-body';

describe('Manejo Seguro de Errores y Sanitización de Logs (api-error.ts)', () => {
  describe('handleApiError - Respuestas al Cliente', () => {
    it('RequestBodyError conserva su mensaje seguro y su estado HTTP original', () => {
      const customError = new RequestBodyError('JSON inválido o malformado.', 400);
      const result = handleApiError(customError, 'POST /test', 'Mensaje genérico');

      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        success: false,
        message: 'JSON inválido o malformado.',
      });
      // No debe añadir incidentId en errores de validación de cliente controlados
      expect('incidentId' in result.body).toBe(false);
    });

    it('un error PostgreSQL simulado no filtra detalles internos en la respuesta', () => {
      const pgError = new Error(
        'relation "public.quotes" does not exist at character 15, query: select * from public.quotes where id = $1'
      );
      (pgError as unknown as Record<string, unknown>).code = '42P01';
      (pgError as unknown as Record<string, unknown>).hint = 'Check table spelling.';
      (pgError as unknown as Record<string, unknown>).detail = 'Key (id)=(123) not found.';

      const result = handleApiError(pgError, 'POST /api/quotes', 'Error al guardar cotización.');

      expect(result.status).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.message).toBe('Error al guardar cotización.');

      const bodyStr = JSON.stringify(result.body);
      expect(bodyStr).not.toContain('42P01');
      expect(bodyStr).not.toContain('quotes');
      expect(bodyStr).not.toContain('Check table spelling');
      expect(bodyStr).not.toContain('relation');
      expect(bodyStr).not.toContain('character 15');
    });

    it('un error Supabase simulado no filtra RPCs, esquemas ni restricciones en la respuesta', () => {
      const supabaseError = {
        code: '23505',
        details: 'Key (user_id, prefix)=(usr-1, COT-) already exists in public.quote_sequences',
        hint: 'Use a different prefix.',
        message: 'duplicate key value violates unique constraint "quote_sequences_pkey"',
        rpc: 'save_quote_atomic',
      };

      const result = handleApiError(supabaseError, 'POST /api/quotes', 'Error al guardar cotización.');

      expect(result.status).toBe(500);
      const bodyStr = JSON.stringify(result.body);

      // Verificación estricta de ausencia de términos técnicos y nombres internos
      expect(bodyStr).not.toContain('save_quote_atomic');
      expect(bodyStr).not.toContain('quote_sequences');
      expect(bodyStr).not.toContain('quote_sequences_pkey');
      expect(bodyStr).not.toContain('23505');
      expect(bodyStr).not.toContain('unique constraint');
      expect(bodyStr).not.toContain('hint');
      expect(bodyStr).not.toContain('details');
      expect(bodyStr).not.toContain('rpc');
    });

    it('cada error inesperado recibe un UUID válido conforme a RFC 4122', () => {
      const err = new Error('Database connection failed');
      const result = handleApiError(err, 'POST /api/quotes', 'Error interno');

      expect('incidentId' in result.body).toBe(true);
      if ('incidentId' in result.body) {
        expect(result.body.incidentId).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        );
      }
    });

    it('dos errores distintos reciben identificadores incidentId distintos', () => {
      const err1 = new Error('Error A');
      const err2 = new Error('Error B');

      const res1 = handleApiError(err1, 'op1', 'Mensaje genérico');
      const res2 = handleApiError(err2, 'op2', 'Mensaje genérico');

      expect('incidentId' in res1.body && 'incidentId' in res2.body).toBe(true);
      if ('incidentId' in res1.body && 'incidentId' in res2.body) {
        expect(res1.body.incidentId).not.toBe(res2.body.incidentId);
      }
    });

    it('el servidor registra exactamente el mismo incidentId devuelto al cliente', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const err = new Error('Simulated failure');

      const result = handleApiError(err, 'TEST_OP', 'Mensaje cliente');

      expect('incidentId' in result.body).toBe(true);
      if ('incidentId' in result.body) {
        const loggedCall = consoleSpy.mock.calls[0]?.[0];
        expect(loggedCall).toContain(`incidentId=${result.body.incidentId}`);
      }

      consoleSpy.mockRestore();
    });

    it('la respuesta nunca incluye tokens, cookies, contraseñas ni objetos del proveedor', () => {
      const sensitiveError = new Error(
        'Failed auth with token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and cookie session=secret123'
      );

      const result = handleApiError(sensitiveError, 'POST /api/quotes', 'Error al procesar.');
      const bodyStr = JSON.stringify(result.body);

      expect(bodyStr).not.toContain('eyJ');
      expect(bodyStr).not.toContain('secret123');
      expect(bodyStr).not.toContain('session');
      expect(bodyStr).not.toContain('token');
      expect(bodyStr).not.toContain('cookie');
    });
  });

  describe('Registro Seguro y Sanitización de Logs (sanitizeLogMessage)', () => {
    it('elimina saltos de línea para prevenir log injection (CWE-117)', () => {
      const maliciousInput = 'Error line 1\r\n[CRITICAL] Admin logged in with fake privileges\nLine 3';
      const sanitized = sanitizeLogMessage(maliciousInput);

      expect(sanitized).not.toContain('\r');
      expect(sanitized).not.toContain('\n');
      expect(sanitized).toContain('Error line 1 [CRITICAL] Admin logged in with fake privileges Line 3');
    });

    it('redacta correos electrónicos de usuarios', () => {
      const input = 'User jonathan.rad@gmail.com failed authentication for client empresa@sunat.gob.pe';
      const sanitized = sanitizeLogMessage(input);

      expect(sanitized).not.toContain('jonathan.rad@gmail.com');
      expect(sanitized).not.toContain('empresa@sunat.gob.pe');
      expect(sanitized).toContain('[REDACTED_EMAIL]');
    });

    it('redacta números de teléfono peruanos', () => {
      const input = 'Customer phone +51 987654321 or 912345678 in quote details';
      const sanitized = sanitizeLogMessage(input);

      expect(sanitized).not.toContain('987654321');
      expect(sanitized).not.toContain('912345678');
      expect(sanitized).toContain('[REDACTED_PHONE]');
    });

    it('redacta tokens JWT y cabeceras Bearer', () => {
      const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozGz3asdf';
      const input = `Authorization failed: Bearer ${jwt} and raw JWT token ${jwt} in header`;
      const sanitized = sanitizeLogMessage(input);

      expect(sanitized).not.toContain(jwt);
      expect(sanitized).toContain('Bearer [REDACTED_TOKEN]');
      expect(sanitized).toContain('[REDACTED_JWT]');
    });

    it('redacta cookies, claves API y secretos', () => {
      const input = 'Request error with cookie: sb-auth-token=xyz123; api_key="sk_live_998877" and password=supersecret';
      const sanitized = sanitizeLogMessage(input);

      expect(sanitized).not.toContain('xyz123');
      expect(sanitized).not.toContain('sk_live_998877');
      expect(sanitized).not.toContain('supersecret');
      expect(sanitized).toContain('cookie=[REDACTED_COOKIE]');
      expect(sanitized).toContain('api_key=[REDACTED]');
      expect(sanitized).toContain('password=[REDACTED]');
    });

    it('redacta credenciales embebidas en URLs', () => {
      const input = 'Connection to postgres://admin:super_secret_db_pass@db.supabase.co:5432/postgres failed';
      const sanitized = sanitizeLogMessage(input);

      expect(sanitized).not.toContain('admin:super_secret_db_pass');
      expect(sanitized).toContain('[REDACTED_CREDENTIALS]@');
    });

    it('limita la longitud máxima y trunca mensajes excesivamente largos', () => {
      const longInput = 'A'.repeat(500);
      const sanitized = sanitizeLogMessage(longInput, 100);

      expect(sanitized.length).toBeLessThanOrEqual(120);
      expect(sanitized).toContain('...[TRUNCATED]');
    });
  });

  describe('Extracción de Códigos Técnicos (extractTechnicalCode)', () => {
    it('extrae códigos técnicos SQL o de red estándar', () => {
      expect(extractTechnicalCode({ code: '23505' })).toBe('23505');
      expect(extractTechnicalCode({ code: '42P01' })).toBe('42P01');
      expect(extractTechnicalCode({ code: 'ECONNREFUSED' })).toBe('ECONNREFUSED');
    });

    it('rechaza códigos que no cumplan el formato seguro', () => {
      expect(extractTechnicalCode({ code: 'SELECT * FROM users' })).toBeNull();
      expect(extractTechnicalCode({ code: '<script>alert(1)</script>' })).toBeNull();
      expect(extractTechnicalCode({})).toBeNull();
      expect(extractTechnicalCode(null)).toBeNull();
    });
  });
});
