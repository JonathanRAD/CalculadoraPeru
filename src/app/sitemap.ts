import { MetadataRoute } from 'next';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { GUIDES } from '@/features/guias/data';
import { SITE_LAST_UPDATED } from '@/core/constants/site-updates';

/**
 * lastModified se basa en fechas reales:
 * - calculadoras y páginas generales: última actualización registrada del sitio;
 * - guías: su propia fecha de revisión.
 * Google ignora changefreq y priority, por lo que no se declaran.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.calculaperu.com.pe';
  const siteDate = new Date(`${SITE_LAST_UPDATED}T12:00:00.000Z`);

  const calculatorRoutes = CALCULATORS_REGISTRY.map((calc) => ({
    url: `${baseUrl}${calc.slug}`,
    lastModified: siteDate,
  }));

  const guideRoutes = GUIDES.map((guide) => ({
    url: `${baseUrl}/guias/${guide.slug}`,
    lastModified: new Date(`${guide.updated}T12:00:00.000Z`),
  }));

  const staticPaths = [
    '',
    '/guias',
    '/actualizaciones',
    '/cotizador',
    '/pro',
    '/sobre-nosotros',
    '/contacto',
    '/politica-de-privacidad',
    '/terminos-y-condiciones',
  ];

  return [
    ...staticPaths.map((path) => ({ url: `${baseUrl}${path}`, lastModified: siteDate })),
    ...guideRoutes,
    ...calculatorRoutes,
  ];
}
