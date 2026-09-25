import type { NextConfig } from "next";

// Orígenes externos requeridos por la aplicación.
// Se declaran aquí como constantes para mantener DRY y facilitar auditorías.
const GA_DOMAIN = "https://www.googletagmanager.com";
const GA_ANALYTICS = "https://www.google-analytics.com";
const ADSENSE_DOMAIN = "https://pagead2.googlesyndication.com";
const ADSENSE_FRAME = "https://tpc.googlesyndication.com";
const GOOGLE_FONTS_CSS = "https://fonts.googleapis.com";
const GOOGLE_FONTS_STATIC = "https://fonts.gstatic.com";
const VERCEL_ANALYTICS = "https://va.vercel-scripts.com";
const VERCEL_VITALS = "https://vitals.vercel-insights.com";

// Content-Security-Policy defensiva.
// Se usa report-uri + report-only sería ideal en producción, pero para
// esta fase se aplica directamente con enforce.
// nonce dinámico NO se usa aquí porque Next.js App Router con RSC y
// scripts externos de GA/AdSense requiere 'unsafe-inline' o nonces.
// Se opta por 'unsafe-inline' limitado solo a los contextos necesarios.
const csp = [
  "default-src 'self'",
  // Scripts: propios + GA + AdSense + Vercel
  `script-src 'self' 'unsafe-inline' ${GA_DOMAIN} ${GA_ANALYTICS} ${ADSENSE_DOMAIN} ${VERCEL_ANALYTICS}`,
  // Estilos: propios + Google Fonts
  `style-src 'self' 'unsafe-inline' ${GOOGLE_FONTS_CSS}`,
  // Fuentes
  `font-src 'self' ${GOOGLE_FONTS_CSS} ${GOOGLE_FONTS_STATIC}`,
  // Imágenes: propios + data URIs (logos base64) + Google
  "img-src 'self' data: https:",
  // Conexiones de datos: propios + GA + Vercel + BCRP (tipo de cambio)
  `connect-src 'self' ${GA_ANALYTICS} ${VERCEL_VITALS} https://estadisticas.bcrp.gob.pe`,
  // Frames: AdSense iframes
  `frame-src 'self' ${ADSENSE_FRAME} ${ADSENSE_DOMAIN}`,
  // Sin workers externos
  "worker-src 'self' blob:",
  // Sin object/embed
  "object-src 'none'",
  // Base URI restringida
  "base-uri 'self'",
  // Form action solo a propios
  "form-action 'self'",
  // Sin framing externo (complementa X-Frame-Options)
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  // Evita sniffing de tipo MIME
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Sin framing externo (para navegadores que no soportan CSP frame-ancestors)
  { key: "X-Frame-Options", value: "DENY" },
  // Solo origen completo en peticiones al propio dominio, no a terceros
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HSTS: 2 años, incluye subdominios (sin preload hasta verificar)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Limitar APIs sensibles del navegador
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=(self)",
      "usb=()",
    ].join(", "),
  },
  // CSP
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 412, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

