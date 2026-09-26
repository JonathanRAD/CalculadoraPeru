import type { NextConfig } from "next";
import { getSecurityHeaders, getApiSecurityHeaders } from "./src/server/config/security-headers";

const isProd = process.env.NODE_ENV === "production";

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
        // Endpoints de API: cabeceras específicas de API (sin CSP HTML redundante)
        source: "/api/:path*",
        headers: getApiSecurityHeaders({ isProd }),
      },
      {
        // Documentos y recursos generales: CSP completa con soporte PDF blob y protección contra clickjacking
        source: "/((?!api/).*)",
        headers: getSecurityHeaders({ isProd }),
      },
    ];
  },
};

export default nextConfig;
