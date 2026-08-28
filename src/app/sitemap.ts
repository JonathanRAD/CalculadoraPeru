import { MetadataRoute } from 'next';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.calculaperu.com.pe';

  const calculatorRoutes = CALCULATORS_REGISTRY.map((calc) => ({
    url: `${baseUrl}${calc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cotizador`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/politica-de-privacidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminos-y-condiciones`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    ...calculatorRoutes,
  ];
}
