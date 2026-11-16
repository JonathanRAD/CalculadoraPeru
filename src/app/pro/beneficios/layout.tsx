import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Beneficios PRO: funciones por calculadora',
  description:
    'Conoce qué funciones adicionales ofrece el Plan PRO en cada calculadora laboral, tributaria y comercial de CalculaPerú, con enlaces directos para probarlas.',
  alternates: { canonical: '/pro/beneficios' },
};

export default function ProBenefitsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
