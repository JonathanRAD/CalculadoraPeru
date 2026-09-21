import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Cotizador Comercial para MYPES (Demo Interactiva) | CalculaPerú',
  description:
    'Simula la generación de cotizaciones comerciales para micro y pequeñas empresas peruanas. Calcula subtotal, 18% de IGV SUNAT y exporta a formato ticket para WhatsApp o Excel.',
  alternates: {
    canonical: '/cotizador',
  },
};

export default function CotizadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
