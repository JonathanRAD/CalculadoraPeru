import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/shared/components/layout/Navbar';
import { Footer } from '@/shared/components/layout/Footer';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import { Analytics } from '@vercel/analytics/next';
import { PwaInstallBanner } from '@/shared/components/ui/PwaInstallBanner';

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
  metadataBase: new URL('https://www.calculaperu.com.pe'),
  icons: {
    icon: '/logo-calc.png',
    apple: '/logo-calc.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: 'CalculaPerú',
    title: 'CalculaPerú | El Portal de Calculadoras #1 del Perú',
    description:
      'Calculadoras financieras, comerciales y tributarias del Perú: IGV 18%, precio de venta y luz en Soles.',
    url: 'https://www.calculaperu.com.pe',
    locale: 'es_PE',
    type: 'website',
    images: [
      {
        url: '/logo-calc.png',
        width: 1200,
        height: 630,
        alt: 'CalculaPerú - Portal de Calculadoras #1 del Perú',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalculaPerú | El Portal de Calculadoras #1 del Perú',
    description:
      'Calculadoras financieras, comerciales y tributarias adaptadas al Perú: IGV 18%, precio de venta y luz.',
    images: ['/logo-calc.png'],
  },
};

const rootWebsiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CalculaPerú',
  alternateName: 'Calcula Peru',
  url: 'https://www.calculaperu.com.pe',
  description:
    'El portal de calculadoras financieras, comerciales y tributarias #1 del Perú para MYPES y emprendedores.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.calculaperu.com.pe/?q={search_term_string}',
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
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('calculaperu-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootWebsiteJsonLd) }}
        />
        {/* PWA Manifest & Theme */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1171972985538083"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200" suppressHydrationWarning>
        <ThemeProvider>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <Analytics />
          <PwaInstallBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
