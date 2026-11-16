import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, BriefcaseBusiness,
  Calculator, ChevronDown, CircleDollarSign, Gift, PiggyBank, Receipt, ReceiptText,
  Store, Tag, TrendingUp, Wallet,
} from 'lucide-react';
import { CALCULATORS_REGISTRY, CATEGORIES, type CalculatorCategory } from '@/features/calculators/registry';
import { GUIDES } from '@/features/guias/data';
import { HomeSearch } from '@/features/home/components/HomeSearch';
import { ResponsiveDetails } from '@/features/home/components/ResponsiveDetails';
import { FadeIn } from '@/shared/components/ui/FadeIn';
import { PayslipResult } from '@/shared/components/ui/PayslipResult';
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
  {
    id: 'sueldo-neto', icon: Wallet, question: '¿Cuánto me descuentan del sueldo?',
    from: { label: 'Sueldo bruto', value: 'S/ 3,000.00' }, to: { label: 'Neto estimado (ONP)', value: 'S/ 2,583.07' },
  },
  {
    id: 'calculadora-igv', icon: Receipt, question: '¿Cuánto es el IGV de una venta?',
    from: { label: 'Base imponible', value: 'S/ 100.00' }, to: { label: 'Total con IGV 18 %', value: 'S/ 118.00' },
  },
  {
    id: 'calculadora-cts', icon: PiggyBank, question: '¿Cuánto me depositan de CTS?',
    from: { label: 'Sueldo S/ 3,000 · 6 meses', value: '' }, to: { label: 'Depósito semestral', value: 'S/ 1,750.00' },
  },
  {
    id: 'gratificacion', icon: Gift, question: '¿Cuánto me toca de gratificación?',
    from: { label: 'Sueldo S/ 3,000 · 6 meses', value: '' }, to: { label: 'Con bonificación del 9 %', value: 'S/ 3,270.00' },
  },
  {
    id: 'precio-de-venta', icon: Tag, question: '¿A cuánto debo vender mi producto?',
    from: { label: 'Costo S/ 50 · margen 30 %', value: '' }, to: { label: 'Precio de venta', value: 'S/ 71.43' },
  },
  {
    id: 'tipo-de-cambio-dolar-sunat', icon: CircleDollarSign, question: '¿A cuánto equivale el dólar hoy?',
    from: { label: 'Monto en dólares', value: 'US$ 100' }, to: { label: 'Equivalente en soles', value: 'al cambio del día' },
  },
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

export default function HomePage() {
  const categories = CATEGORIES.filter(
    (category): category is (typeof CATEGORIES)[number] & { id: CalculatorCategory } => category.id !== 'todas',
  );

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-slate-950 transition-colors duration-200 dark:bg-[#121820] dark:text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeItemListJsonLd) }} />

      {/* Hero: pregunta, búsqueda y una boleta de ejemplo como producto real */}
      <section className="relative isolate z-10 border-b border-stone-300 dark:border-slate-700">
        <div aria-hidden="true" className="hero-photo pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <Image
            src="/machu_pichu.jpg"
            alt=""
            fill
            fetchPriority="low"
            quality={70}
            sizes="(min-width: 1280px) 1100px, 100vw"
            className="object-cover object-[center_40%]"
          />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">

            <div className="space-y-5 lg:col-span-6">
              <h1 className="rise-in text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                ¿Qué necesitas calcular?
              </h1>

              <p className="rise-in-2 text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed max-w-xl">
                Herramientas laborales, tributarias, comerciales y financieras con parámetros 2026 de SUNAT, MTPE, SBS y BCRP.
              </p>

              <div className="rise-in-3 relative z-20 w-full max-w-xl">
                <HomeSearch calculators={CALCULATORS_REGISTRY} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px]">
                <span className="text-slate-600 dark:text-slate-400">Más usadas:</span>
                {POPULAR_PILLS.map((pill) => (
                  <Link
                    key={pill.href}
                    href={pill.href}
                    className="inline-flex min-h-11 items-center font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-400"
                  >
                    {pill.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="slip-print lg:col-span-6">
              <PayslipResult
                title="BOLETA CALCULADA · EJEMPLO"
                period="Sueldo bruto S/ 3,000 · ONP"
                lines={[
                  { label: 'Remuneración bruta', amount: '3,000.00' },
                  { label: 'Descuento ONP 13 %', amount: '390.00', kind: 'deduction' },
                  { label: 'Retención de quinta categoría', note: 'Incluye bonificación extraordinaria del 9 %', amount: '26.93', kind: 'deduction' },
                ]}
                subtotalLabel="Total descuentos"
                subtotalAmount="416.93"
                totalLabel="Sueldo neto estimado"
                totalAmount="S/ 2,583.07"
                footnote={
                  <>
                    Ejemplo ilustrativo.{' '}
                    <Link href="/sueldo-neto" className="font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-400">
                      Calcula con tus datos
                    </Link>
                  </>
                }
              />
            </div>

          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* FEATURED TOOLS — COMPACT CLEAN GRID (NO GENERIC STOCK PHOTOS) */}
      {/* ========================================================================= */}
      <section aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <FadeIn direction="up">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
            <div>
              <h2 id="featured-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Calculadoras más consultadas
              </h2>
              <p className="mt-1 text-[15px] text-slate-600 dark:text-slate-400">
                Fórmulas con parámetros oficiales 2026.
              </p>
            </div>
            <SmoothScrollLink
              targetId="todas-las-calculadoras"
              className="group inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-brand-700 hover:underline underline-offset-4 dark:text-brand-400 cursor-pointer"
            >
              <span>Ver las 25 calculadoras</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </SmoothScrollLink>
          </div>
        </FadeIn>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_CALCULATORS.map(({ calculator, question, icon: Icon, from, to }) => (
            <li key={calculator.id} className="h-full">
              <Link
                href={calculator.slug}
                className="lift-card group flex h-full flex-col rounded-lg border border-stone-300 bg-[#FFFEFB] dark:border-slate-700 dark:bg-[#18202A]"
              >
                <div className="flex-1 p-5">
                  <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-400">
                    <Icon className="h-5 w-5 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                    <span>{calculator.shortTitle}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold leading-snug text-slate-900 dark:text-white">{question}</h3>

                  <dl className="mt-5 border-t border-dashed border-stone-300 pt-3 font-mono text-[15px] dark:border-slate-600">
                    {from.value ? (
                      <div className="flex items-baseline justify-between gap-3 py-1 text-slate-700 dark:text-slate-300">
                        <dt className="font-sans text-[13px]">{from.label}</dt>
                        <dd className="tabular-nums">{from.value}</dd>
                      </div>
                    ) : (
                      <div className="py-1 font-sans text-[13px] text-slate-700 dark:text-slate-300">{from.label}</div>
                    )}
                    <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-slate-900 pt-2 font-semibold text-slate-900 dark:border-slate-400 dark:text-white">
                      <dt className="font-sans text-[13px] font-medium">{to.label}</dt>
                      <dd className="tabular-nums text-brand-700 dark:text-brand-400">{to.value}</dd>
                    </div>
                  </dl>
                </div>
                <span className="relative flex min-h-12 items-center justify-between border-t border-stone-300 px-5 text-[15px] font-semibold text-brand-700 dark:border-slate-700 dark:text-brand-400">
                  Calcular con tus datos
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ========================================================================= */}
      {/* FULL DIRECTORY OF 25 CALCULATORS — 4 COMPACT FUNCTIONAL CATEGORIES */}
      {/* ========================================================================= */}
      <section id="todas-las-calculadoras" aria-labelledby="directory-title" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <FadeIn direction="up">
          <div className="max-w-2xl mb-8">
            <span className="text-[13px] font-bold text-brand-700 dark:text-brand-400">
              Directorio completo
            </span>
            <h2 id="directory-title" className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Las 25 calculadoras de CalculaPerú
            </h2>
            <p className="mt-1 text-[13px] sm:text-[15px] text-slate-600 dark:text-slate-400">
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
                  className="directory-details group scroll-mt-24 rounded-lg border border-stone-300 bg-[#FFFEFB] p-5 dark:border-slate-700 dark:bg-[#18202A] h-full"
                >
                  <summary className="flex min-h-12 cursor-pointer list-none items-start justify-between gap-3 marker:content-none focus-visible:outline-2 focus-visible:outline-brand-600">
                    <span className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center text-brand-700 dark:text-brand-400">
                        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-[15px] font-bold text-slate-950 dark:text-white">
                          {category.label}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-slate-500 dark:text-slate-400">
                          {calculators.length} herramientas
                        </span>
                      </span>
                    </span>
                    <ChevronDown className="mt-2 h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180 md:hidden" aria-hidden="true" />
                  </summary>

                  <ul className="mt-4 space-y-1 border-t border-slate-100 pt-3 dark:border-[#2C3744]">
                    {calculators.map((calculator) => (
                      <li key={calculator.id}>
                        <Link
                          href={calculator.slug}
                          className="group/link flex min-h-10 items-center justify-between gap-3 rounded-lg px-2 text-[13px] sm:text-[15px] font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-brand-600 dark:text-slate-300 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
                        >
                          <span>{calculator.shortTitle}</span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-hover/link:translate-x-0.5 group-hover/link:text-brand-700 dark:group-hover/link:text-brand-400" aria-hidden="true" />
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
      {/* GUIDES SECTION */}
      {/* ========================================================================= */}
      <section aria-labelledby="guides-title" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <span className="text-[13px] font-bold text-brand-700 dark:text-brand-400">
              Guías
            </span>
            <h2 id="guides-title" className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Entiende tus números paso a paso
            </h2>
            <p className="mt-1 text-[13px] sm:text-[15px] text-slate-600 dark:text-slate-400">
              Explicaciones con ejemplos en soles y fuentes oficiales.
            </p>
          </div>
          <Link href="/guias" className="group inline-flex items-center gap-2 text-[13px] sm:text-[15px] font-bold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300">
            <span>Ver todas las guías</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.slice(0, 6).map((guide) => (
            <li key={guide.slug}>
              <Link href={`/guias/${guide.slug}`} className="app-card h-full p-5 flex flex-col gap-2 group hover:border-brand-700 transition-all">
                <span className="text-[13px] font-bold text-brand-700 dark:text-brand-400">{guide.category}</span>
                <h3 className="text-[15px] sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">{guide.title}</h3>
                <span className="mt-auto text-[13px] text-slate-500 dark:text-slate-400">{guide.readingMinutes} min de lectura</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ========================================================================= */}
      {/* METHODOLOGY & FAQS SECTION */}
      {/* ========================================================================= */}
      <section aria-labelledby="method-title" className="border-t border-stone-300 bg-[#ECE9E2] dark:border-slate-700 dark:bg-[#0E141B]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[13px] font-bold text-brand-700 dark:text-brand-400">
              Transparencia y Rigor
            </span>
            <h2 id="method-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Metodología y fuentes de cálculo
            </h2>
            <p className="text-[13px] sm:text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
              Cada herramienta detalla su fórmula matemática, los parámetros normativos utilizados y su alcance referencial. Diseñadas para brindar claridad en tus decisiones cotidianas.
            </p>
            <div className="pt-2">
              <Link
                href="/sobre-nosotros"
                className="group inline-flex items-center gap-2 text-[13px] sm:text-[15px] font-bold text-brand-700 dark:text-brand-400 hover:underline"
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
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 py-3 text-[15px] sm:text-base font-bold text-slate-950 marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-white">
                    <span>{faq.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-brand-700 transition-transform group-open:rotate-180 dark:text-brand-400" aria-hidden="true" />
                  </summary>
                  <p className="max-w-3xl pb-5 pr-8 text-[13px] sm:text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
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
