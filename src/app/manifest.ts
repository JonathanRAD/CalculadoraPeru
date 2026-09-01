import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CalculaPerú - Calculadoras para Perú',
    short_name: 'CalculaPerú',
    description: 'Calculadoras financieras, tributarias, laborales y comerciales adaptadas al Perú.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f6f8',
    theme_color: '#059669',
    orientation: 'portrait-primary',
    lang: 'es-PE',
    icons: [
      { src: '/calculaperu-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/calculaperu-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/calculaperu-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
