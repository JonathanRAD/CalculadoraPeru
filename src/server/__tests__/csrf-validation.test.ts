import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateAdminCsrf } from '../services/auth.service';

describe('Validación Robusta de CSRF Administrativo (validateAdminCsrf)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://calculaperu.com.pe';
    delete process.env.ALLOWED_ADMIN_ORIGINS;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('permite métodos seguros (GET, HEAD, OPTIONS) sin requerir Origin ni Referer', () => {
    const getReq = new Request('https://calculaperu.com.pe/api/admin/metrics', { method: 'GET' });
    const headReq = new Request('https://calculaperu.com.pe/api/admin/metrics', { method: 'HEAD' });
    const optionsReq = new Request('https://calculaperu.com.pe/api/admin/metrics', { method: 'OPTIONS' });

    expect(validateAdminCsrf(getReq)).toBe(true);
    expect(validateAdminCsrf(headReq)).toBe(true);
    expect(validateAdminCsrf(optionsReq)).toBe(true);
  });

  it('permite origen canónico en peticiones POST', () => {
    const postReq = new Request('https://calculaperu.com.pe/api/admin/action', {
      method: 'POST',
      headers: {
        origin: 'https://calculaperu.com.pe',
      },
    });
    expect(validateAdminCsrf(postReq)).toBe(true);
  });

  it('rechaza origen malicioso externo', () => {
    const maliciousReq = new Request('https://calculaperu.com.pe/api/admin/action', {
      method: 'POST',
      headers: {
        origin: 'https://malicious-site.com',
      },
    });
    expect(validateAdminCsrf(maliciousReq)).toBe(false);
  });

  it('rechaza dominios parecidos o con sufijos engañosos (ej. calculaperu.com.pe.atacante.com)', () => {
    const lookalikeReq = new Request('https://calculaperu.com.pe/api/admin/action', {
      method: 'POST',
      headers: {
        origin: 'https://calculaperu.com.pe.atacante.com',
      },
    });
    expect(validateAdminCsrf(lookalikeReq)).toBe(false);

    const prefixLookalike = new Request('https://calculaperu.com.pe/api/admin/action', {
      method: 'POST',
      headers: {
        origin: 'https://atacante-calculaperu.com.pe',
      },
    });
    expect(validateAdminCsrf(prefixLookalike)).toBe(false);
  });

  it('rechaza cuando Origin es inválido aunque Referer sea válido (Origin tiene prioridad estricta)', () => {
    const spoofedReq = new Request('https://calculaperu.com.pe/api/admin/action', {
      method: 'POST',
      headers: {
        origin: 'https://evil.com',
        referer: 'https://calculaperu.com.pe/admin',
      },
    });
    expect(validateAdminCsrf(spoofedReq)).toBe(false);
  });

  it('rechaza cuando faltan ambos encabezados (Origin y Referer) en una mutación', () => {
    const noHeaderReq = new Request('https://calculaperu.com.pe/api/admin/action', {
      method: 'POST',
    });
    expect(validateAdminCsrf(noHeaderReq)).toBe(false);
  });

  it('maneja localhost adecuadamente según el entorno (rechazado en prod, permitido en dev)', () => {
    const localhostReq = new Request('http://localhost:3000/api/admin/action', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
      },
    });

    // En producción (NODE_ENV = 'production') debe ser rechazado
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    expect(validateAdminCsrf(localhostReq)).toBe(false);

    // En desarrollo (NODE_ENV = 'development') es permitido
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    expect(validateAdminCsrf(localhostReq)).toBe(true);
  });

  it('rechaza protocolo o puerto incorrecto', () => {
    // Protocolo http inseguro en producción hacia dominio canónico
    const httpReq = new Request('https://calculaperu.com.pe/api/admin/action', {
      method: 'POST',
      headers: {
        origin: 'http://calculaperu.com.pe',
      },
    });
    expect(validateAdminCsrf(httpReq)).toBe(false);

    // Puerto anómalo no autorizado
    const portReq = new Request('https://calculaperu.com.pe/api/admin/action', {
      method: 'POST',
      headers: {
        origin: 'https://calculaperu.com.pe:8443',
      },
    });
    expect(validateAdminCsrf(portReq)).toBe(false);
  });

  it('soporta despliegues Preview sólo a través de orígenes explícitamente autorizados y sin comodines', () => {
    process.env.ALLOWED_ADMIN_ORIGINS = 'https://preview-123.calculaperu.com.pe, https://staging.calculaperu.com.pe';

    const previewReq = new Request('https://calculaperu.com.pe/api/admin/action', {
      method: 'POST',
      headers: {
        origin: 'https://preview-123.calculaperu.com.pe',
      },
    });
    expect(validateAdminCsrf(previewReq)).toBe(true);

    const unauthorizedPreview = new Request('https://calculaperu.com.pe/api/admin/action', {
      method: 'POST',
      headers: {
        origin: 'https://preview-unauthorized.calculaperu.com.pe',
      },
    });
    expect(validateAdminCsrf(unauthorizedPreview)).toBe(false);
  });
});
