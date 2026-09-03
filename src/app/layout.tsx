import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/shared/components/layout/Navbar';
import { Footer } from '@/shared/components/layout/Footer';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import { Analytics } from '@vercel/analytics/next';
import { PwaInstallBanner } from '@/shared/components/ui/PwaInstallBanner';
import { PwaRegistration } from '@/shared/components/ui/PwaRegistration';
import { GoogleAnalyticsPageViews } from '@/shared/components/analytics/GoogleAnalytics';

const plexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  weight: 'variable',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Calculadoras Perú 2026: sueldo, IGV y finanzas | CalculaPerú',
    template: '%s | CalculaPerú',
  },
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
    icon: [
      { url: '/calculaperu-icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/calculaperu-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/calculaperu-icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CalculaPerú',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: 'CalculaPerú',
    title: 'Calculadoras Perú 2026 | CalculaPerú',
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
        alt: 'CalculaPerú - Calculadoras para Perú',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadoras Perú 2026 | CalculaPerú',
    description:
      'Calculadoras financieras, comerciales y tributarias adaptadas al Perú: IGV 18%, precio de venta y luz.',
    images: ['/logo-calc.png'],
  },
  verification: {
    google: 'google95fd4173f084d844',
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
};

const rootWebsiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CalculaPerú',
  alternateName: 'Calcula Peru',
  url: 'https://www.calculaperu.com.pe',
  description:
    'Portal de calculadoras financieras, comerciales y tributarias para MYPES, trabajadores y emprendedores del Perú.',
};

const rootOrganizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CalculaPerú',
  alternateName: 'Calcula Peru',
  url: 'https://www.calculaperu.com.pe',
  logo: 'https://www.calculaperu.com.pe/calculaperu-icon-512.png',
  description: 'Portal peruano de calculadoras gratuitas para trabajo, negocios, finanzas y obligaciones tributarias.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-PE" className={`${plexSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootOrganizationJsonLd) }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1171972985538083"
          crossOrigin="anonymous"
        />
        {/* Google Analytics 4 (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-Q9EC3XKGJH"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-Q9EC3XKGJH', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200" suppressHydrationWarning>
        <ThemeProvider>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <GoogleAnalyticsPageViews />
          <Analytics />
          <PwaRegistration />
          <PwaInstallBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
