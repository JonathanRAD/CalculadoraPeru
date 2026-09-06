import { MetadataRoute } from 'next';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';

const LAST_SIGNIFICANT_UPDATE = new Date('2026-09-06T05:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.calculaperu.com.pe';

  const calculatorRoutes = CALCULATORS_REGISTRY.map((calc) => ({
    url: `${baseUrl}${calc.slug}`,
    lastModified: LAST_SIGNIFICANT_UPDATE,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: LAST_SIGNIFICANT_UPDATE,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cotizador`,
      lastModified: LAST_SIGNIFICANT_UPDATE,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: LAST_SIGNIFICANT_UPDATE,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/politica-de-privacidad`,
      lastModified: LAST_SIGNIFICANT_UPDATE,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminos-y-condiciones`,
      lastModified: LAST_SIGNIFICANT_UPDATE,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    ...calculatorRoutes,
  ];
}
