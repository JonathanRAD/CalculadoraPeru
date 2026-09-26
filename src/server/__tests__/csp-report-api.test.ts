import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  POST,
  handleCspReport,
  GET,
  PUT,
  DELETE,
  PATCH,
  sanitizeCspString,
  sanitizeCspReport,
  InMemoryRateLimiter,
  resetRateLimiter,
} from '@/app/api/security/csp-report/route';

function createJsonPayloadOfExactBytes(targetBytes: number): string {
  const encoder = new TextEncoder();
  const prefix = '{"blocked-uri":"eval","padding":"';
  const suffix = '"}';
  const baseBytes = encoder.encode(prefix + suffix).byteLength;
  if (targetBytes < baseBytes) {
    throw new Error(`Target bytes (${targetBytes}) too small for base payload (${baseBytes})`);
  }
  const paddingLength = targetBytes - baseBytes;
  const padding = 'a'.repeat(paddingLength);
  const result = prefix + padding + suffix;
  expect(encoder.encode(result).byteLength).toBe(targetBytes);
  return result;
}

function createChunkedStream(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
}

describe('Endpoint First-Party de Reportes CSP y Endurecimiento de Seguridad', () => {
  const originalCspLogging = process.env.CSP_REPORT_LOGGING;

  beforeEach(() => {
    resetRateLimiter();
    delete process.env.CSP_REPORT_LOGGING;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalCspLogging !== undefined) {
      process.env.CSP_REPORT_LOGGING = originalCspLogging;
    } else {
      delete process.env.CSP_REPORT_LOGGING;
    }
    vi.restoreAllMocks();
  });

  describe('1. Control Estricto de Tamaño de Cuerpo en Bytes (16 384 bytes)', () => {
    it('acepta un cuerpo válido menor a 16 KiB (responde 204 y Cache-Control: no-store)', async () => {
      const payload = createJsonPayloadOfExactBytes(1024); // 1 KiB
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '1024',
        },
        body: payload,
      });

      const res = await POST(req);
      expect(res.status).toBe(204);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
      expect(res.body).toBeNull();
    });

    it('acepta un cuerpo de exactamente 16 384 bytes reales (frontera máxima permitida)', async () => {
      const payload = createJsonPayloadOfExactBytes(16384);
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '16384',
        },
        body: payload,
      });

      const res = await POST(req);
      expect(res.status).toBe(204);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    });

    it('rechaza un cuerpo de 16 385 bytes reales con 413 Payload Too Large', async () => {
      const payload = createJsonPayloadOfExactBytes(16385);
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '16385',
        },
        body: payload,
      });

      const res = await POST(req);
      expect(res.status).toBe(413);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    });

    it('procesa correctamente un cuerpo enviado en múltiples chunks', async () => {
      const encoder = new TextEncoder();
      const part1 = encoder.encode('{"blocked-uri":"eval",');
      const part2 = encoder.encode('"effective-directive":"script-src"}');

      const stream = createChunkedStream([part1, part2]);
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stream,
        // @ts-expect-error duplex is required in Node fetch for ReadableStream bodies
        duplex: 'half',
      });

      const res = await POST(req);
      expect(res.status).toBe(204);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    });

    it('funciona y detiene la lectura con 413 en cuerpo chunked SIN Content-Length si excede 16 384 bytes', async () => {
      const chunk1 = new Uint8Array(10000).fill(120); // 'x'
      const chunk2 = new Uint8Array(7000).fill(120);  // total: 17000 > 16384

      const stream = createChunkedStream([chunk1, chunk2]);
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Sin Content-Length
        body: stream,
        // @ts-expect-error duplex is required in Node fetch
        duplex: 'half',
      });

      const res = await POST(req);
      expect(res.status).toBe(413);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    });

    it('rechaza con 413 un contenido con 6000 emojis que supera el límite en bytes aunque tenga menos caracteres en JavaScript', async () => {
      const emojiStr = '😀'.repeat(6000);
      // En JS string.length es 12000 (menor a 16384)
      expect(emojiStr.length).toBe(12000);
      const utf8Bytes = new TextEncoder().encode(emojiStr).byteLength;
      // En UTF-8 son 24000 bytes (mayor a 16384)
      expect(utf8Bytes).toBe(24000);

      const payload = JSON.stringify({ 'blocked-uri': 'eval', padding: emojiStr });
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      const res = await POST(req);
      expect(res.status).toBe(413);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    });

    it('decodifica correctamente secuencias UTF-8 multibyte válidas', async () => {
      const payload = JSON.stringify({
        'blocked-uri': 'eval',
        'document-uri': 'https://calculaperu.pe/cotizador/proforma-diseño-gráfica',
      });
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      const res = await POST(req);
      expect(res.status).toBe(204);
    });

    it('rechaza secuencias de bytes que violan UTF-8 con 400 Bad Request', async () => {
      // Secuencia de bytes no válida en UTF-8
      const invalidUtf8Bytes = new Uint8Array([0x7b, 0x22, 0xff, 0xfe, 0x22, 0x7d]);
      const stream = createChunkedStream([invalidUtf8Bytes]);
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stream,
        // @ts-expect-error duplex is required in Node fetch
        duplex: 'half',
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    });
  });

  describe('2. Validación de Content-Length, Sintaxis JSON y Cuerpo Vacío', () => {
    it('rechaza Content-Length negativo con 400', async () => {
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '-10',
        },
        body: '{"blocked-uri":"eval"}',
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    });

    it('rechaza Content-Length decimal con 400', async () => {
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '12.34',
        },
        body: '{"blocked-uri":"eval"}',
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rechaza Content-Length no numérico con 400', async () => {
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': 'dieciseis-kb',
        },
        body: '{"blocked-uri":"eval"}',
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rechaza Content-Length que excede los enteros seguros con 400', async () => {
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '999999999999999999999999',
        },
        body: '{"blocked-uri":"eval"}',
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rechaza de inmediato si Content-Length declarado es mayor al límite (16385) con 413', async () => {
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '25000',
        },
        body: '{"blocked-uri":"eval"}',
      });

      const res = await POST(req);
      expect(res.status).toBe(413);
    });

    it('rechaza JSON malformado con 400', async () => {
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ "csp-report": { invalid syntax... ',
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('rechaza cuerpo vacío con 400', async () => {
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '',
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('3. Content-Type y Métodos HTTP', () => {
    it('admite application/csp-report con 204', async () => {
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/csp-report; charset=utf-8' },
        body: JSON.stringify({ 'blocked-uri': 'eval' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(204);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    });

    it('admite application/reports+json con 204', async () => {
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/reports+json' },
        body: JSON.stringify([{ type: 'csp-violation', body: { blockedURL: 'eval' } }]),
      });
      const res = await POST(req);
      expect(res.status).toBe(204);
    });

    it('admite application/json con 204', async () => {
      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'blocked-uri': 'self' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(204);
    });

    it('rechaza Content-Type no permitido (text/plain, text/html, application/xml) con 415', async () => {
      const badTypes = ['text/plain', 'text/html', 'application/xml', 'application/x-www-form-urlencoded'];
      for (const ct of badTypes) {
        const req = new Request('http://localhost:3000/api/security/csp-report', {
          method: 'POST',
          headers: { 'Content-Type': ct },
          body: JSON.stringify({ 'blocked-uri': 'eval' }),
        });
        const res = await POST(req);
        expect(res.status).toBe(415);
        expect(res.headers.get('Cache-Control')).toBe('no-store');
      }
    });

    it('rechaza métodos GET, PUT, PATCH y DELETE con 405 y cabecera Allow: POST', async () => {
      const responses = [
        await GET(),
        await PUT(),
        await PATCH(),
        await DELETE(),
      ];

      for (const res of responses) {
        expect(res.status).toBe(405);
        expect(res.headers.get('Allow')).toBe('POST');
        expect(res.headers.get('Cache-Control')).toBe('no-store');
      }
    });
  });

  describe('4. Rate Limiting en Memoria y Expulsión Determinista', () => {
    it('responde 429 Too Many Requests con cabecera Retry-After cuando se supera el límite', async () => {
      const customLimiter = new InMemoryRateLimiter(2, 60000); // máx 2 peticiones
      const makeReq = () =>
        new Request('http://localhost:3000/api/security/csp-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': '192.168.1.100',
          },
          body: JSON.stringify({ 'blocked-uri': 'eval' }),
        });

      // Peticiones 1 y 2 permitidas
      const res1 = await handleCspReport(makeReq(), customLimiter);
      expect(res1.status).toBe(204);

      const res2 = await handleCspReport(makeReq(), customLimiter);
      expect(res2.status).toBe(204);

      // Petición 3 bloqueada
      const res3 = await handleCspReport(makeReq(), customLimiter);
      expect(res3.status).toBe(429);
      expect(res3.headers.get('Retry-After')).toBe('60');
      expect(res3.headers.get('Cache-Control')).toBe('no-store');
    });

    it('expira el rate limit usando tiempo inyectado sin requerir sleeps reales', () => {
      const limiter = new InMemoryRateLimiter(2, 60000); // 2 peticiones por minuto
      const ip = '10.0.0.1';

      expect(limiter.isRateLimited(ip, 1000)).toBe(false); // pet 1
      expect(limiter.isRateLimited(ip, 2000)).toBe(false); // pet 2
      expect(limiter.isRateLimited(ip, 3000)).toBe(true);  // pet 3 bloqueada

      // Simular que avanzó el tiempo 61 segundos (t = 62000)
      expect(limiter.isRateLimited(ip, 62000)).toBe(false); // reiniciado
    });

    it('respeta el máximo de entradas del rate limiter y expulsa las entradas más antiguas', () => {
      const limiter = new InMemoryRateLimiter(5, 60000, 3); // capacidad máxima de 3 IPs

      // Agregar 3 IPs en tiempos sucesivos
      limiter.isRateLimited('ip-1', 1000); // resetAt: 61000
      limiter.isRateLimited('ip-2', 2000); // resetAt: 62000
      limiter.isRateLimited('ip-3', 3000); // resetAt: 63000
      expect(limiter.size).toBe(3);

      // Insertar una 4ta IP debe forzar la expulsión de la más antigua (ip-1)
      limiter.isRateLimited('ip-4', 4000);
      expect(limiter.size).toBe(3);

      // ip-1 debe haber sido expulsada, por lo que una nueva llamada de ip-1 se comporta como entrada nueva
      expect(limiter.isRateLimited('ip-1', 5000)).toBe(false);
    });
  });

  describe('5. Sanitización de Datos No Confiables y Privacidad', () => {
    it('elimina query strings, fragmentos y credenciales de document-uri conservando solo origen y pathname', () => {
      const payload = {
        'csp-report': {
          'document-uri': 'https://admin:secreto123@calculaperu.pe/cotizador/proforma?token=jwt123&session=abc#seccion-1',
          'blocked-uri': 'https://superUser:pass456@malicious.com/api/steal?param=1#frag',
          'violated-directive': 'script-src',
        },
      };

      const sanitized = sanitizeCspReport(payload);
      // documentLocation conserva origen y pathname, pero NADA de query, credenciales ni hash
      expect(sanitized.documentLocation).toBe('https://calculaperu.pe/cotizador/proforma');
      expect(sanitized.documentLocation).not.toContain('admin');
      expect(sanitized.documentLocation).not.toContain('secreto123');
      expect(sanitized.documentLocation).not.toContain('token');
      expect(sanitized.documentLocation).not.toContain('session');
      expect(sanitized.documentLocation).not.toContain('#');

      // blockedLocation conserva ÚNICAMENTE el origen
      expect(sanitized.blockedLocation).toBe('https://malicious.com');
      expect(sanitized.blockedLocation).not.toContain('superUser');
      expect(sanitized.blockedLocation).not.toContain('steal');
      expect(sanitized.blockedLocation).not.toContain('param');
    });

    it('conserva tokens CSP seguros en blockedLocation como eval, inline, self, blob, data', () => {
      const tokens = ['eval', 'inline', 'self', 'blob', 'data', 'about', 'wasm-eval', 'wasm-unsafe-eval'];
      for (const token of tokens) {
        const sanitized = sanitizeCspReport({
          'csp-report': { 'blocked-uri': `'${token}'` },
        });
        expect(sanitized.blockedLocation).toBe(token);
      }

      // Con esquema URL blob: o data:
      const blobSanitized = sanitizeCspReport({
        'csp-report': { 'blocked-uri': 'blob:https://calculaperu.pe/uuid-1234' },
      });
      expect(blobSanitized.blockedLocation).toBe('blob');

      const dataSanitized = sanitizeCspReport({
        'csp-report': { 'blocked-uri': 'data:text/javascript;base64,xxxx' },
      });
      expect(dataSanitized.blockedLocation).toBe('data');
    });

    it('elimina estrictamente sample, referrer y original-policy del reporte', () => {
      const payload = {
        'csp-report': {
          'document-uri': 'https://calculaperu.pe/contacto',
          'blocked-uri': 'eval',
          'violated-directive': 'script-src',
          'referrer': 'https://google.com/search?q=calculaperu',
          'sample': 'function evil() { doSteal(); }',
          'original-policy': "default-src 'self'; script-src 'self' https://trusted.com",
        },
      };

      const sanitized = sanitizeCspReport(payload);
      expect(sanitized).not.toHaveProperty('referrer');
      expect(sanitized).not.toHaveProperty('sample');
      expect(sanitized).not.toHaveProperty('original-policy');
      expect(JSON.stringify(sanitized)).not.toContain('doSteal');
      expect(JSON.stringify(sanitized)).not.toContain('google.com');
    });

    it('redacta JWTs, tokens Bearer, correos y contraseñas en cadenas', () => {
      const rawJwt = 'auth token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc';
      const rawBearer = 'Authorization: Bearer opaque_api_token_12345';
      const rawEmail = 'Usuario afectado juan.perez@empresa.com.pe en login';
      const rawSecret = 'https://calculaperu.pe/api?password=secreto123&token=xyz987';

      expect(sanitizeCspString(rawJwt)).toContain('[REDACTED_JWT]');
      expect(sanitizeCspString(rawBearer)).toContain('Bearer [REDACTED]');
      expect(sanitizeCspString(rawEmail)).toContain('[REDACTED_EMAIL]');
      expect(sanitizeCspString(rawSecret)).toContain('password=[REDACTED]');
      expect(sanitizeCspString(rawSecret)).toContain('token=[REDACTED]');
      expect(sanitizeCspString(rawSecret)).not.toContain('secreto123');
      expect(sanitizeCspString(rawEmail)).not.toContain('juan.perez');
    });

    it('soporta tanto formato CSP legacy como formato Reporting API moderno', () => {
      // Legacy
      const legacy = sanitizeCspReport({
        'csp-report': {
          'document-uri': 'https://calculaperu.pe/sueldo-neto',
          'blocked-uri': 'https://malicious.org/ad.js',
          'violated-directive': 'script-src',
          'status-code': 200,
        },
      });
      expect(legacy.documentLocation).toBe('https://calculaperu.pe/sueldo-neto');
      expect(legacy.blockedLocation).toBe('https://malicious.org');
      expect(legacy.violatedDirective).toBe('script-src');
      expect(legacy.statusCode).toBe('200');

      // Modern Reporting API
      const modern = sanitizeCspReport([
        {
          type: 'csp-violation',
          body: {
            documentURL: 'https://calculaperu.pe/cotizador',
            blockedURL: 'eval',
            effectiveDirective: 'script-src-elem',
            disposition: 'report',
            statusCode: 200,
          },
        },
      ]);
      expect(modern.documentLocation).toBe('https://calculaperu.pe/cotizador');
      expect(modern.blockedLocation).toBe('eval');
      expect(modern.effectiveDirective).toBe('script-src-elem');
      expect(modern.disposition).toBe('report');
      expect(modern.statusCode).toBe('200');
    });
  });

  describe('6. Control de Logging (CSP_REPORT_LOGGING)', () => {
    it('NO emite logs cuando CSP_REPORT_LOGGING está desactivado o ausente', async () => {
      delete process.env.CSP_REPORT_LOGGING;
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'blocked-uri': 'eval',
          'document-uri': 'https://calculaperu.pe/cotizador',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(204);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('NO emite logs si CSP_REPORT_LOGGING tiene cualquier valor distinto a enabled (ej: disabled, false, 0)', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      for (const val of ['disabled', 'false', '0', 'true', 'DEBUG']) {
        process.env.CSP_REPORT_LOGGING = val;
        const req = new Request('http://localhost:3000/api/security/csp-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 'blocked-uri': 'eval' }),
        });
        await POST(req);
      }

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('emite log con incidentId y timestamp solo cuando CSP_REPORT_LOGGING=enabled y el resumen es válido', async () => {
      process.env.CSP_REPORT_LOGGING = 'enabled';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const req = new Request('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '203.0.113.195',
        },
        body: JSON.stringify({
          'document-uri': 'https://calculaperu.pe/cotizador?token=secret123',
          'blocked-uri': 'https://attacker.com/malicious.js',
          'violated-directive': 'script-src',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(204);
      expect(warnSpy).toHaveBeenCalledTimes(1);

      const logCall = warnSpy.mock.calls[0];
      expect(logCall[0]).toBe('[CSP Violation]');
      const loggedData = logCall[1] as Record<string, unknown>;

      // Genera incidentId (UUID) y timestamp ISO
      expect(loggedData.incidentId).toBeDefined();
      expect(typeof loggedData.incidentId).toBe('string');
      expect(loggedData.timestamp).toBeDefined();
      expect(new Date(loggedData.timestamp as string).getTime()).not.toBeNaN();

      // Contiene únicamente resumen sanitizado
      expect(loggedData.documentLocation).toBe('https://calculaperu.pe/cotizador');
      expect(loggedData.blockedLocation).toBe('https://attacker.com');
      expect(loggedData.violatedDirective).toBe('script-src');

      // CONFIRMACIÓN EXPRESA: NUNCA contiene el cuerpo original, IP del cliente ni secretos
      const serializedLog = JSON.stringify(loggedData);
      expect(serializedLog).not.toContain('203.0.113.195'); // IP
      expect(serializedLog).not.toContain('secret123');     // Token en query
      expect(serializedLog).not.toContain('malicious.js');  // Path de blocked-uri
    });
  });
});
