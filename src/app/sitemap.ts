import { MetadataRoute } from 'next';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.calculaperu.com.pe';

  const calculatorRoutes = CALCULATORS_REGISTRY.map((calc) => ({
    url: `${baseUrl}${calc.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cotizador`,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/politica-de-privacidad`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminos-y-condiciones`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    ...calculatorRoutes,
  ];
}
