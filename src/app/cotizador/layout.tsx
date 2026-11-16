import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Cotizador Comercial PRO para Negocios y MYPES',
  description:
    'Prepara cotizaciones y proformas en soles con IGV automático, descuentos, directorio de clientes, PDF personalizado y envío por WhatsApp o Excel.',
  alternates: {
    canonical: '/cotizador',
  },
};

export default function CotizadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <h1 className="sr-only">Cotizador comercial PRO para negocios y MYPES</h1>
      {children}
    </>
  );
}
