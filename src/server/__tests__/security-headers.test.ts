import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  buildCsp,
  getSecurityHeaders,
  getApiSecurityHeaders,
  resolveCspHeaderName,
  EXTERNAL_ORIGINS,
} from '../config/security-headers';

describe('Configuración de Cabeceras de Seguridad y CSP', () => {
  const originalEnvCspMode = process.env.CSP_MODE;

  beforeEach(() => {
    delete process.env.CSP_MODE;
  });

  afterEach(() => {
    if (originalEnvCspMode !== undefined) {
      process.env.CSP_MODE = originalEnvCspMode;
    } else {
      delete process.env.CSP_MODE;
    }
  });

  describe('Content-Security-Policy (buildCsp)', () => {
    it('incluye directivas esenciales y restrictivas', () => {
      const csp = buildCsp({ isProd: false });

      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("report-uri /api/security/csp-report");
      expect(csp).toContain("report-to default");
    });

    it('permite blob: únicamente donde es estrictamente necesario (frame-src y worker-src)', () => {
      const csp = buildCsp({ isProd: false });

      // Permitido en frame-src (previsualización PDF cliente)
      expect(csp).toMatch(/frame-src[^;]*blob:/);
      // Permitido en worker-src (compilación cliente de pdf/canvas)
      expect(csp).toMatch(/worker-src[^;]*blob:/);

      // Estrictamente PROHIBIDO en el resto de directivas
      expect(csp).not.toMatch(/default-src[^;]*blob:/);
      expect(csp).not.toMatch(/script-src[^;]*blob:/);
      expect(csp).not.toMatch(/connect-src[^;]*blob:/);
      expect(csp).not.toMatch(/img-src[^;]*blob:/);
      expect(csp).not.toMatch(/style-src[^;]*blob:/);
    });

    it('no contiene comodines inseguros (* o https: sin origen)', () => {
      const csp = buildCsp({ isProd: false });

      // No debe contener asteriscos como orígenes (* o *.)
      expect(csp).not.toMatch(/(^|[\s;])\*(?=[\s;]|$)/);
      // No debe tener comodín genérico https: sin dominio
      expect(csp).not.toMatch(/(^|[\s;])https:(?=[\s;]|$)/);
    });

    it('no incluye BCRP en connect-src del cliente (la llamada es puramente server-side)', () => {
      const csp = buildCsp({ isProd: false });
      expect(csp).not.toContain('bcrp');
      expect(csp).not.toContain('estadisticas.bcrp.gob.pe');
    });

    it('limita los dominios externos a las integraciones reales auditadas', () => {
      const csp = buildCsp({ isProd: false });

      // GA4
      expect(csp).toContain(EXTERNAL_ORIGINS.GA_DOMAIN);
      expect(csp).toContain(EXTERNAL_ORIGINS.GA_ANALYTICS);
      expect(csp).toContain(EXTERNAL_ORIGINS.GA_COLLECT);

      // AdSense
      expect(csp).toContain(EXTERNAL_ORIGINS.ADSENSE_DOMAIN);
      expect(csp).toContain(EXTERNAL_ORIGINS.ADSENSE_FRAME);

      // Vercel Analytics / Speed Insights
      expect(csp).toContain(EXTERNAL_ORIGINS.VERCEL_ANALYTICS);
      expect(csp).toContain(EXTERNAL_ORIGINS.VERCEL_VITALS);

      // Google Fonts
      expect(csp).toContain(EXTERNAL_ORIGINS.GOOGLE_FONTS_CSS);
      expect(csp).toContain(EXTERNAL_ORIGINS.GOOGLE_FONTS_STATIC);
    });

    it('añade upgrade-insecure-requests únicamente en entorno de producción', () => {
      const devCsp = buildCsp({ isProd: false });
      expect(devCsp).not.toContain('upgrade-insecure-requests');

      const prodCsp = buildCsp({ isProd: true });
      expect(prodCsp).toContain('upgrade-insecure-requests');
    });
  });

  describe('Despliegue Progresivo de CSP (resolveCspHeaderName)', () => {
    it('emite Content-Security-Policy-Report-Only por defecto para transición segura', () => {
      expect(resolveCspHeaderName()).toBe('Content-Security-Policy-Report-Only');
      expect(resolveCspHeaderName({ isProd: true })).toBe('Content-Security-Policy-Report-Only');
    });

    it('emite Content-Security-Policy cuando cspMode es enforce en la configuración', () => {
      expect(resolveCspHeaderName({ isProd: true, cspMode: 'enforce' })).toBe('Content-Security-Policy');
      expect(resolveCspHeaderName({ isProd: false, cspMode: 'enforce' })).toBe('Content-Security-Policy');
    });

    it('emite Content-Security-Policy-Report-Only cuando cspMode es report-only en la configuración', () => {
      expect(resolveCspHeaderName({ isProd: true, cspMode: 'report-only' })).toBe('Content-Security-Policy-Report-Only');
    });

    it('reconoce la variable de entorno CSP_MODE=enforce para activación global', () => {
      process.env.CSP_MODE = 'enforce';
      expect(resolveCspHeaderName()).toBe('Content-Security-Policy');
      expect(resolveCspHeaderName({ isProd: true })).toBe('Content-Security-Policy');
    });

    it('permite que la configuración explícita anule la variable de entorno', () => {
      process.env.CSP_MODE = 'enforce';
      expect(resolveCspHeaderName({ isProd: true, cspMode: 'report-only' })).toBe('Content-Security-Policy-Report-Only');
    });
  });

  describe('Cabeceras Generales de Documento (getSecurityHeaders)', () => {
    it('incluye protecciones estándar nosniff, DENY y referrer con CSP en Report-Only por defecto', () => {
      const headers = getSecurityHeaders({ isProd: false });
      const map = new Map(headers.map((h) => [h.key, h.value]));

      expect(map.get('X-Content-Type-Options')).toBe('nosniff');
      expect(map.get('X-Frame-Options')).toBe('DENY');
      expect(map.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(map.get('Permissions-Policy')).toContain('camera=()');
      expect(map.get('Cross-Origin-Opener-Policy')).toBe('same-origin-allow-popups');
      expect(map.get('Reporting-Endpoints')).toBe('default="/api/security/csp-report"');

      // Modo por defecto seguro para no bloquear AdSense ni Next.js
      expect(map.has('Content-Security-Policy-Report-Only')).toBe(true);
      expect(map.has('Content-Security-Policy')).toBe(false);
    });

    it('emite Content-Security-Policy cuando se solicita explícitamente modo enforce', () => {
      const headers = getSecurityHeaders({ isProd: true, cspMode: 'enforce' });
      const map = new Map(headers.map((h) => [h.key, h.value]));

      expect(map.has('Content-Security-Policy')).toBe(true);
      expect(map.has('Content-Security-Policy-Report-Only')).toBe(false);
    });

    it('emite Strict-Transport-Security (HSTS) únicamente en producción', () => {
      const devHeaders = getSecurityHeaders({ isProd: false });
      const hasHstsDev = devHeaders.some((h) => h.key === 'Strict-Transport-Security');
      expect(hasHstsDev).toBe(false);

      const prodHeaders = getSecurityHeaders({ isProd: true });
      const hstsProd = prodHeaders.find((h) => h.key === 'Strict-Transport-Security');
      expect(hstsProd).toBeDefined();
      expect(hstsProd?.value).toBe('max-age=63072000; includeSubDomains');
    });

    it('no incluye claves ni secretos en las cabeceras', () => {
      const headers = getSecurityHeaders({ isProd: true });

      for (const h of headers) {
        expect(h.value).not.toMatch(/secret|api[_-]?key|password/i);
        expect(h.value).not.toContain('eyJ');
        expect(h.value).not.toContain('Bearer');
      }
    });
  });

  describe('Cabeceras Especializadas de API (getApiSecurityHeaders)', () => {
    it('aplica protección nosniff, DENY, CORP y no incluye CSP HTML redundante', () => {
      const apiHeaders = getApiSecurityHeaders({ isProd: false });
      const map = new Map(apiHeaders.map((h) => [h.key, h.value]));

      expect(map.get('X-Content-Type-Options')).toBe('nosniff');
      expect(map.get('X-Frame-Options')).toBe('DENY');
      expect(map.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(map.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
      // No debe cargar directivas CSP de scripts/frames a respuestas JSON puras
      expect(map.has('Content-Security-Policy')).toBe(false);
      expect(map.has('Content-Security-Policy-Report-Only')).toBe(false);
    });

    it('emite HSTS en endpoints de API únicamente en producción', () => {
      const devApiHeaders = getApiSecurityHeaders({ isProd: false });
      expect(devApiHeaders.some((h) => h.key === 'Strict-Transport-Security')).toBe(false);

      const prodApiHeaders = getApiSecurityHeaders({ isProd: true });
      expect(prodApiHeaders.some((h) => h.key === 'Strict-Transport-Security')).toBe(true);
    });
  });
});
