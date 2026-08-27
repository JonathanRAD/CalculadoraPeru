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
    'Calculadoras financieras, comerciales y tributarias del Perú: precio de venta, IGV 18%, margen de ganancia, punto de equilibrio y luz en Soles (S/).',
  keywords: [
    'calculadora peru',
    'calculadora igv 18',
    'precio de venta peru',
    'margen de ganancia',
    'punto de equilibrio peru',
    'consumo electrico luz del sur enel',
    'mypes peru',
  ],
  authors: [{ name: 'CalculaPerú' }],
  metadataBase: new URL('https://calculaperu.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: 'CalculaPerú',
    title: 'CalculaPerú | El Portal de Calculadoras #1 del Perú',
    description:
      'Calculadoras financieras, comerciales y tributarias del Perú: IGV 18%, precio de venta y luz en Soles.',
    url: 'https://calculaperu.vercel.app',
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalculaPerú | El Portal de Calculadoras #1 del Perú',
    description:
      'Calculadoras financieras, comerciales y tributarias adaptadas al Perú: IGV 18%, precio de venta y luz.',
  },
};

const rootWebsiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CalculaPerú',
  alternateName: 'Calcula Peru',
  url: 'https://calculaperu.vercel.app',
  description:
    'El portal de calculadoras financieras, comerciales y tributarias #1 del Perú para MYPES y emprendedores.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://calculaperu.vercel.app/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootWebsiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans" suppressHydrationWarning>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
