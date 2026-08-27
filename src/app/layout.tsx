import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/shared/components/layout/Navbar';
import { Footer } from '@/shared/components/layout/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CalculaPerú | El Portal de Calculadoras #1 del Perú',
  description:
    'Todas las calculadoras financieras, comerciales y tributarias que necesitas en un solo lugar. Calcula precio de venta, IGV 18%, margen de ganancia, punto de equilibrio y consumo de luz en Soles (S/).',
  keywords: [
    'calculadora peru',
    'calculadora igv 18',
    'precio de venta peru',
    'margen de ganancia',
    'punto de equilibrio peru',
    'consumo electrico luz del sur enel',
    'calculadora financiera peru',
    'mypes peru',
  ],
  authors: [{ name: 'CalculaPerú' }],
  metadataBase: new URL('https://calculaperu.com.pe'),
  openGraph: {
    title: 'CalculaPerú | El Portal de Calculadoras #1 del Perú',
    description:
      'Convierte cada cálculo en mejores decisiones. Calculadoras gratuitas de precio de venta, margen, punto de equilibrio e IGV adaptadas al Perú.',
    locale: 'es_PE',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans" suppressHydrationWarning>
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
