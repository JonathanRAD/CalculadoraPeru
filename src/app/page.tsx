import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, BadgeCheck, Banknote, BookOpenCheck, BriefcaseBusiness,
  Building2, Calculator, ChevronDown, Clock3, Percent, ReceiptText,
  ShieldCheck, Store, TrendingUp, Sparkles, Check,
} from 'lucide-react';
import { CALCULATORS_REGISTRY, CATEGORIES, type CalculatorCategory } from '@/features/calculators/registry';
import { HomeSearch } from '@/features/home/components/HomeSearch';
import { ResponsiveDetails } from '@/features/home/components/ResponsiveDetails';
import { FadeIn } from '@/shared/components/ui/FadeIn';
import { SmoothScrollLink } from '@/shared/components/ui/SmoothScrollLink';

export const metadata: Metadata = {
  title: 'Calculadoras Perú 2026: sueldo, IGV, negocios y finanzas | CalculaPerú',
  description: 'Calcula sueldo neto, IGV 18%, CTS, gratificaciones, precios y obligaciones tributarias con 25 herramientas gratuitas adaptadas a la normativa peruana.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Calculadoras Perú 2026 | CalculaPerú',
    description: '25 calculadoras gratuitas para trabajo, negocios, finanzas e impuestos en Perú.',
    url: 'https://www.calculaperu.com.pe',
  },
};

const FEATURED_CALCULATORS = [
  { id: 'sueldo-neto', label: 'Sueldo neto', category: 'laboral', description: 'Estima tu remuneración líquida tras descuentos de AFP u ONP y retención de 5ta categoría.' },
  { id: 'calculadora-igv', label: 'IGV 18%', category: 'tributario', description: 'Calcula o desglosa el Impuesto General a las Ventas sobre el subtotal o importe total.' },
  { id: 'calculadora-cts', label: 'CTS semestral', category: 'laboral', description: 'Proyecta el depósito semestral de Compensación por Tiempo de Servicios de mayo o noviembre.' },
  { id: 'gratificacion', label: 'Gratificaciones', category: 'laboral', description: 'Calcula la gratificación legal de julio o diciembre más la bonificación extraordinaria de EsSalud/EPS.' },
  { id: 'precio-de-venta', label: 'Precio de venta', category: 'negocios', description: 'Define precios comerciales considerando costo unitario, margen deseado y comisiones POS.' },
  { id: 'tipo-de-cambio-dolar-sunat', label: 'Dólar a soles', category: 'tributario', description: 'Convierte montos USD/PEN con cotizaciones actualizadas del mercado y referencia SBS.' },
].map((featured) => ({
  ...featured,
  calculator: CALCULATORS_REGISTRY.find((calc) => calc.id === featured.id)!,
}));

const CATEGORY_ICONS: Record<CalculatorCategory, typeof Calculator> = {
  negocios: Store,
  laboral: BriefcaseBusiness,
  finanzas: TrendingUp,
  tributario: ReceiptText,
};

const POPULAR_PILLS = [
  { label: 'Sueldo neto', href: '/sueldo-neto' },
  { label: 'IGV 18%', href: '/calculadora-igv' },
  { label: 'CTS', href: '/calculadora-cts' },
  { label: 'Gratificación', href: '/gratificacion' },
  { label: 'Dólar a soles', href: '/tipo-de-cambio-dolar-sunat' },
  { label: 'Precio de venta', href: '/precio-de-venta' },
];

const FAQS = [
  {
    question: '¿De dónde salen las tasas y los parámetros de cálculo?',
    answer: 'Nuestras calculadoras aplican fórmulas basadas en la normativa oficial peruana: Texto Único Ordenado de la Ley de Productividad Laboral (D.L. 728), Ley de Gratificaciones (Ley 27735), Texto Único Ordenado de la Ley de CTS (D.S. N° 001-97-TR), Ley del Impuesto a la Renta y tablas previsionales de la SBS y SUNAT.',
  },
  {
    question: '¿Los resultados son exactos y tienen validez vinculante?',
    answer: 'Los resultados son simulaciones referenciales de alta fidelidad matemática diseñadas para orientar tus decisiones. No sustituyen la asesoría legal o contable colegiada ni constituyen liquidaciones vinculantes ante juzgados laborales o SUNAFIL.',
  },
  {
    question: '¿Mis datos o montos ingresados se guardan en sus servidores?',
    answer: 'No. Todas las operaciones aritméticas y simulaciones se procesan localmente en el navegador de tu propio dispositivo. CalculaPerú no almacena ni transmite a servidores externos los montos de tus sueldos o finanzas privadas.',
  },
  {
    question: '¿Necesito registrarme para utilizar las calculadoras?',
    answer: 'No. Las 25 herramientas del portal son 100% abiertas, gratuitas e inmediatas sin necesidad de registro ni descargas.',
  },
];

const homeItemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Calculadoras más consultadas de CalculaPerú',
  numberOfItems: FEATURED_CALCULATORS.length,
  itemListElement: FEATURED_CALCULATORS.map(({ calculator }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: calculator.title,
    url: `https://www.calculaperu.com.pe${calculator.slug}`,
  })),
};

interface HomePageProps {
  searchParams?: Promise<{ hero?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const showWithoutImage = resolvedParams?.hero === 'no-image';

  const categories = CATEGORIES.filter(
    (category): category is (typeof CATEGORIES)[number] & { id: CalculatorCategory } => category.id !== 'todas',
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 transition-colors duration-200 dark:bg-[#070D1E] dark:text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeItemListJsonLd) }} />

      {/* ========================================================================= */}
      {/* HERO SECTION                                                              */}
      {/* ·  Mobile  (<640px) : franja panorámica 128 px encima del texto          */}
      {/* ·  Tablet  (640-1023px) : franja 180 px                                  */}
      {/* ·  Desktop (≥1024px) : columna derecha aspect-[16/11]                    */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0B132B] transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">

            {/* CONTENT COLUMN: Appears second on mobile (after photo banner), first on desktop */}
            <div className={`space-y-4 sm:space-y-5 text-left order-2 lg:order-1 ${showWithoutImage ? 'lg:col-span-12 max-w-3xl' : 'lg:col-span-7 xl:col-span-7'}`}>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <BadgeCheck className="h-3.5 w-3.5 text-[#08734F] dark:text-[#00C853]" aria-hidden="true" />
                <span>25 calculadoras gratuitas · Parámetros Perú 2026</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
                ¿Qué necesitas calcular?
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl">
                Herramientas laborales, tributarias, comerciales y financieras adaptadas a la normativa oficial de <strong>SUNAT, MTPE, SBS y BCRP</strong>.
              </p>

              {/* Left-Aligned Instant Search */}
              <div className="pt-1 w-full max-w-xl">
                <HomeSearch calculators={CALCULATORS_REGISTRY} />
              </div>

              {/* Quick Filter Pills */}
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">Directos:</span>
                {POPULAR_PILLS.map((pill) => (
                  <Link
                    key={pill.href}
                    href={pill.href}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-900 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:text-emerald-300 shadow-2xs"
                  >
                    {pill.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* UNIFIED HERO PHOTO: Appears as compact panoramic banner above title on mobile, right column on desktop */}
            {!showWithoutImage && (
              <div className="order-1 lg:order-2 w-full lg:col-span-5 xl:col-span-5">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md lg:shadow-xl shadow-slate-200/50 dark:shadow-slate-950/60 w-full h-32 sm:h-44 lg:h-auto lg:aspect-[16/11] group">
                  <Image
                    src="/machu_pichu.jpg"
                    alt="Machu Picchu — Paisaje emblemático del Perú"
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1023px) 90vw, (max-width: 1280px) 42vw, 560px"
                    className="object-cover object-[center_35%] transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle mobile vignette and bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25 lg:hidden pointer-events-none" />
                  {/* Desktop gradients for smooth edge blending */}
                  <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent dark:from-[#0B132B]/50 pointer-events-none" />
                  <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent pointer-events-none" />

                  {/* Discreet badge overlay */}
                  <div className="absolute bottom-2 sm:bottom-3 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-white/95 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/60 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 sm:py-1 border border-white/10">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Parámetros Perú 2026
                    </span>
                    <span className="rounded-full bg-slate-950/60 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 sm:py-1 border border-white/10 text-white/80">
                      Cálculos locales
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* FEATURED TOOLS — COMPACT CLEAN GRID (NO GENERIC STOCK PHOTOS) */}
      {/* ========================================================================= */}
      <section aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <FadeIn direction="up">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#08734F] dark:text-emerald-400">
                Herramientas destacadas
              </span>
              <h2 id="featured-title" className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                Calculadoras más consultadas
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Acceso directo con fórmulas actualizadas bajo parámetros oficiales 2026.
              </p>
            </div>
            <SmoothScrollLink
              targetId="todas-las-calculadoras"
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#08734F] hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
            >
              <span>Ver las 25 calculadoras</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </SmoothScrollLink>
          </div>
        </FadeIn>

        {/* 6 COMPACT CARDS IN RESPONSIVE GRID — NO HEAVY IMAGES */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_CALCULATORS.map(({ calculator, label, description }, index) => (
            <FadeIn key={calculator.id} delay={index * 50} direction="up">
              <Link
                href={calculator.slug}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 h-full"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-[#08734F] uppercase tracking-wider dark:bg-emerald-950/60 dark:text-emerald-300">
                      {calculator.tag}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      2026
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-950 group-hover:text-[#08734F] dark:text-white dark:group-hover:text-emerald-400 transition-colors">
                    {label}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-[#08734F] dark:text-emerald-400">
                  <span>Calcular ahora</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FULL DIRECTORY OF 25 CALCULATORS — 4 COMPACT FUNCTIONAL CATEGORIES */}
      {/* ========================================================================= */}
      <section id="todas-las-calculadoras" aria-labelledby="directory-title" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <FadeIn direction="up">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#08734F] dark:text-emerald-400">
              Directorio completo
            </span>
            <h2 id="directory-title" className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Las 25 calculadoras de CalculaPerú
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Agrupadas en cuatro áreas de trabajo para acceder directamente a la que necesitas.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => {
            const calculators = CALCULATORS_REGISTRY.filter((calculator) => calculator.category === category.id);
            const Icon = CATEGORY_ICONS[category.id];
            return (
              <FadeIn key={category.id} delay={index * 60} direction="up">
                <ResponsiveDetails
                  id={category.id}
                  defaultMobileOpen={index === 0}
                  className="directory-details group scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs h-full transition-all duration-200 hover:border-emerald-500/40"
                >
                  <summary className="flex min-h-12 cursor-pointer list-none items-start justify-between gap-3 marker:content-none focus-visible:outline-2 focus-visible:outline-emerald-600">
                    <span className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#08734F] dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-slate-950 dark:text-white">
                          {category.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                          {calculators.length} herramientas
                        </span>
                      </span>
                    </span>
                    <ChevronDown className="mt-2 h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180 md:hidden" aria-hidden="true" />
                  </summary>

                  <ul className="mt-4 space-y-1 border-t border-slate-100 pt-3 dark:border-slate-800">
                    {calculators.map((calculator) => (
                      <li key={calculator.id}>
                        <Link
                          href={calculator.slug}
                          className="group/link flex min-h-10 items-center justify-between gap-3 rounded-lg px-2 text-xs sm:text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-emerald-600 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                        >
                          <span>{calculator.shortTitle}</span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-hover/link:translate-x-0.5 group-hover/link:text-[#08734F] dark:group-hover/link:text-emerald-400" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </ResponsiveDetails>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* METHODOLOGY & FAQS SECTION */}
      {/* ========================================================================= */}
      <section aria-labelledby="method-title" className="border-t border-slate-200 bg-[#F1F5F9] dark:border-slate-800 dark:bg-[#09122a] transition-colors">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#08734F] dark:text-emerald-400">
              Transparencia y Rigor
            </span>
            <h2 id="method-title" className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Metodología y fuentes de cálculo
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
              Cada herramienta detalla su fórmula matemática, los parámetros normativos utilizados y su alcance referencial. Diseñadas para brindar claridad en tus decisiones cotidianas.
            </p>
            <div className="pt-2">
              <Link
                href="/sobre-nosotros"
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#08734F] dark:text-emerald-400 hover:underline"
              >
                <span>Conoce la metodología de CalculaPerú</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="divide-y divide-slate-200 border-y border-slate-300 dark:divide-slate-700 dark:border-slate-700">
              {FAQS.map((faq, index) => (
                <details key={faq.question} className="group py-1" open={index === 0}>
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 py-3 text-sm sm:text-base font-bold text-slate-950 marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-white">
                    <span>{faq.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-[#08734F] transition-transform group-open:rotate-180 dark:text-emerald-400" aria-hidden="true" />
                  </summary>
                  <p className="max-w-3xl pb-5 pr-8 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
