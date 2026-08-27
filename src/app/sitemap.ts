import { MetadataRoute } from 'next';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://calculaperu.com.pe';

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
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...calculatorRoutes,
  ];
}
