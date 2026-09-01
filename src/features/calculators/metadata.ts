import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CALCULATORS_REGISTRY, type CalculatorMeta } from './registry';

const SITE_URL = 'https://www.calculaperu.com.pe';

export function buildCalculatorMetadata(id: CalculatorMeta['id']): Metadata {
  const calculator = CALCULATORS_REGISTRY.find((item) => item.id === id);

  if (!calculator) return {};

  return {
    title: calculator.title,
    description: calculator.description,
    keywords: calculator.keywords,
    alternates: { canonical: calculator.slug },
    openGraph: {
      type: 'website',
      locale: 'es_PE',
      siteName: 'CalculaPerú',
      title: calculator.title,
      description: calculator.description,
      url: `${SITE_URL}${calculator.slug}`,
      images: [{ url: '/logo-calc.png', width: 1200, height: 630, alt: calculator.shortTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: calculator.title,
      description: calculator.description,
      images: ['/logo-calc.png'],
    },
  };
}

export function CalculatorRouteLayout({ children }: { children: ReactNode }) {
  return children;
}
