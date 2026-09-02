import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/shared/components/layout/Navbar';
import { Footer } from '@/shared/components/layout/Footer';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import { Analytics } from '@vercel/analytics/next';
import { PwaInstallBanner } from '@/shared/components/ui/PwaInstallBanner';
import { PwaRegistration } from '@/shared/components/ui/PwaRegistration';

const inter = Inter({
  variable: '--font-inter',
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
    default: 'CalculaPerú | Calculadoras para Perú',
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
    title: 'CalculaPerú | Calculadoras para Perú',
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
    title: 'CalculaPerú | Calculadoras para Perú',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
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
          <PwaRegistration />
          <PwaInstallBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
