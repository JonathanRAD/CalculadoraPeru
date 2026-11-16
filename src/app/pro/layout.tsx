import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Plan PRO: documentos laborales y cotizaciones',
  description:
    'Plan PRO de CalculaPerú desde S/ 16 al mes: guarda tus cálculos, exporta a Excel y PDF, genera documentos laborales referenciales con tu logo y usa el cotizador comercial.',
  alternates: { canonical: '/pro' },
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
