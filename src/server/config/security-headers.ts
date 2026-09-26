/**
 * security-headers.ts
 *
 * Configuración centralizada y comprobable de cabeceras de seguridad HTTP y CSP.
 * Aplica políticas estrictas según entorno (producción vs desarrollo) y según tipo
 * de recurso (documentos HTML vs endpoints de API JSON).
 *
 * ============================================================================
 * DESPLIEGUE PROGRESIVO DE CSP Y COMPATIBILIDAD CON GOOGLE ADSENSE:
 * ============================================================================
 * 1. Despliegue en Fases (Report-Only vs Enforce):
 *    - `CSP_MODE=report-only` (modo por defecto):
 *      Diagnóstico pasivo. Emite `Content-Security-Policy-Report-Only` y envía
 *      reportes de violaciones al endpoint first-party `/api/security/csp-report`.
 *      NO bloquea recursos ni renderizado.
 *      IMPORTANTE: Report-Only NO sustituye una CSP activa y no mitiga ataques XSS;
 *      su propósito es estrictamente auditoría y diagnóstico previo.
 *    - `CSP_MODE=enforce`:
 *      Protección activa. Emite `Content-Security-Policy` bloqueante que impide
 *      la ejecución de cualquier recurso o script no permitido.
 *    - NOTA DE DESPLIEGUE EN VERCEL:
 *      Cambiar la variable de entorno `CSP_MODE` en Vercel (o en `.env`) requiere
 *      un nuevo despliegue/build, dado que las cabeceras se inyectan estáticamente
 *      en la fase de compilación de `next.config.ts`.
 *
 * 2. Evaluación de Nonce / 'strict-dynamic' frente a Arquitectura Next.js:
 *    - La guía oficial de Google para CSP recomienda usar `'strict-dynamic'` junto con
 *      un nonce criptográfico aleatorio generado por solicitud (`'nonce-{random}'`).
 *    - En Next.js (App Router con páginas estáticas SSG e ISR para calculadoras públicas),
 *      la inyección de nonces por solicitud en `middleware.ts` forza a todas las páginas
 *      a ejecución dinámica en servidor o requiere hidratación parcial de scripts.
 *    - Una migración apresurada a nonce/'strict-dynamic' rompería los chunks estáticos
 *      generados en build time por Next.js 16 y los scripts embebidos de Google Analytics / AdSense.
 *    - Se mantiene por ende una política basada en lista estricta de orígenes reales sin comodines,
 *      planificando la transición a nonce/'strict-dynamic' cuando Next.js estabilice
 *      el soporte nativo de nonces en componentes de servidor prerenderizados.
 *
 * 3. Aislamiento de 'blob:' para previsualización PDF:
 *    - Se autoriza `blob:` exclusivamente en `frame-src` (para el iframe donde el usuario
 *      previsualiza la proforma en tiempo real antes de descargar) y en `worker-src` (para jsPDF).
 *    - Se prohíbe estrictamente `blob:` en `script-src`, `connect-src` e `img-src`.
 */

export type CspMode = 'enforce' | 'report-only';

export interface SecurityHeadersConfig {
  isProd: boolean;
  cspMode?: CspMode;
}

// Orígenes externos reales utilizados por la aplicación
export const EXTERNAL_ORIGINS = {
  GA_DOMAIN: "https://www.googletagmanager.com",
  GA_ANALYTICS: "https://www.google-analytics.com",
  GA_COLLECT: "https://analytics.google.com",
  ADSENSE_DOMAIN: "https://pagead2.googlesyndication.com",
  ADSENSE_FRAME: "https://tpc.googlesyndication.com",
  GOOGLE_FONTS_CSS: "https://fonts.googleapis.com",
  GOOGLE_FONTS_STATIC: "https://fonts.gstatic.com",
  VERCEL_ANALYTICS: "https://va.vercel-scripts.com",
  VERCEL_VITALS: "https://vitals.vercel-insights.com",
} as const;

/**
 * Resuelve el nombre del encabezado CSP a emitir según configuración explícita
 * o variable de entorno documentada (CSP_MODE=enforce | report-only).
 *
 * Por defecto emite 'Content-Security-Policy-Report-Only' como transición segura
 * hasta verificar la entrega real de AdSense en producción.
 */
export function resolveCspHeaderName(
  config?: SecurityHeadersConfig
): 'Content-Security-Policy' | 'Content-Security-Policy-Report-Only' {
  if (config?.cspMode) {
    return config.cspMode === 'enforce'
      ? 'Content-Security-Policy'
      : 'Content-Security-Policy-Report-Only';
  }

  const envMode = process.env.CSP_MODE?.trim().toLowerCase();
  if (envMode === 'enforce') {
    return 'Content-Security-Policy';
  }

  return 'Content-Security-Policy-Report-Only';
}

/**
 * Construye la Content-Security-Policy estricta para documentos HTML.
 *
 * Decisiones de diseño:
 * 1. frame-src: Incluye 'self', blob: (para la vista previa del PDF generado en cliente)
 *    y los dominios de frames de Google AdSense.
 * 2. connect-src: No incluye BCRP porque la consulta al BCRP ocurre exclusivamente
 *    desde el servidor en Node.js (/api/tipo-de-cambio), nunca desde el navegador.
 * 3. img-src: No usa comodines (como https: o *). Se restringe a 'self', data:
 *    y los dominios de AdSense / Analytics necesarios para creativos y balizas.
 * 4. upgrade-insecure-requests: Solo se añade en producción HTTPS para no romper
 *    entornos locales HTTP.
 */
export function buildCsp(config: SecurityHeadersConfig): string {
  const directives: string[] = [
    "default-src 'self'",
    // Scripts: propios + GA4 + AdSense + Vercel Analytics
    `script-src 'self' 'unsafe-inline' ${EXTERNAL_ORIGINS.GA_DOMAIN} ${EXTERNAL_ORIGINS.GA_ANALYTICS} ${EXTERNAL_ORIGINS.ADSENSE_DOMAIN} ${EXTERNAL_ORIGINS.VERCEL_ANALYTICS}`,
    // Estilos: propios + Google Fonts
    `style-src 'self' 'unsafe-inline' ${EXTERNAL_ORIGINS.GOOGLE_FONTS_CSS}`,
    // Fuentes: Google Fonts
    `font-src 'self' ${EXTERNAL_ORIGINS.GOOGLE_FONTS_CSS} ${EXTERNAL_ORIGINS.GOOGLE_FONTS_STATIC}`,
    // Imágenes: propios + data URIs (logos empresa base64) + balizas/creativos AdSense/Analytics (sin comodines)
    `img-src 'self' data: ${EXTERNAL_ORIGINS.ADSENSE_DOMAIN} ${EXTERNAL_ORIGINS.ADSENSE_FRAME} ${EXTERNAL_ORIGINS.GA_ANALYTICS} ${EXTERNAL_ORIGINS.GA_DOMAIN}`,
    // Conexiones de datos: propios + GA4 / beacons + AdSense + Vercel Insights (sin BCRP client-side)
    `connect-src 'self' ${EXTERNAL_ORIGINS.GA_ANALYTICS} ${EXTERNAL_ORIGINS.GA_COLLECT} ${EXTERNAL_ORIGINS.ADSENSE_DOMAIN} ${EXTERNAL_ORIGINS.VERCEL_VITALS}`,
    // Frames: 'self' + blob: (vista previa PDF Cotizador PRO) + AdSense
    `frame-src 'self' blob: ${EXTERNAL_ORIGINS.ADSENSE_FRAME} ${EXTERNAL_ORIGINS.ADSENSE_DOMAIN}`,
    // Web Workers: propios + blob (generación cliente)
    "worker-src 'self' blob:",
    // Plugin objects deshabilitados
    "object-src 'none'",
    // Base URI restringida al propio origen
    "base-uri 'self'",
    // Formularios solo al propio origen
    "form-action 'self'",
    // Previene que terceros incrusten la página (defensa contra clickjacking)
    "frame-ancestors 'none'",
    // Destino de reportes first-party (Reporting API y legacy CSP)
    "report-uri /api/security/csp-report",
    "report-to default",
  ];

  if (config.isProd) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

/**
 * Cabeceras de seguridad para páginas y documentos HTML.
 *
 * Documentación sobre HSTS y Vercel:
 * Vercel inyecta HSTS automáticamente en *.vercel.app y en dominios con SSL administrado.
 * Sin embargo, definir Strict-Transport-Security condicionalmente a producción (NODE_ENV === 'production')
 * garantiza conformidad RFC 6797 sin importar el proxy inverso o despliegue,
 * evitando estrictamente emitirlo en localhost sobre HTTP (donde causaría problemas de navegación local).
 *
 * COOP: 'same-origin-allow-popups' para permitir flujos de popups (OAuth, AdSense) sin desproteger el origen.
 * COEP: NO se incluye 'require-corp' porque bloquearía recursos de terceros como AdSense y Google Fonts.
 */
export function getSecurityHeaders(config: SecurityHeadersConfig): Array<{ key: string; value: string }> {
  const cspHeaderName = resolveCspHeaderName(config);

  const headers: Array<{ key: string; value: string }> = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(self), usb=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
    { key: "Reporting-Endpoints", value: 'default="/api/security/csp-report"' },
    { key: cspHeaderName, value: buildCsp(config) },
  ];

  if (config.isProd) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    });
  }

  return headers;
}

/**
 * Cabeceras de seguridad especializadas para respuestas API JSON (/api/*).
 *
 * Las respuestas API no renderizan HTML ni ejecutan scripts en el contexto del navegador,
 * por lo que no requieren una directiva CSP completa de documentos. Se les aplican
 * cabeceras de endurecimiento contra sniffing, clickjacking, fugas de referrer y CORP.
 */
export function getApiSecurityHeaders(config: SecurityHeadersConfig): Array<{ key: string; value: string }> {
  const headers: Array<{ key: string; value: string }> = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  ];

  if (config.isProd) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    });
  }

  return headers;
}
