import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Cotizador Comercial PRO para Negocios y MYPES',
  description:
    'Prepara cotizaciones y proformas comerciales en Soles (PEN) con cálculo automático de IGV, descuentos por concepto, directorio de clientes, PDF personalizado y exportación compatible con Excel y WhatsApp.',
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
