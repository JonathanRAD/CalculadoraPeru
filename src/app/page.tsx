import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, BadgeCheck, Banknote, BookOpenCheck, BriefcaseBusiness,
  Building2, Calculator, ChevronDown, Clock3, Percent, ReceiptText,
  ShieldCheck, Store, TrendingUp, Sparkles, Check, FileText, Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { CALCULATORS_REGISTRY, CATEGORIES, type CalculatorCategory } from '@/features/calculators/registry';
import { HomeSearch } from '@/features/home/components/HomeSearch';
import { QuickSalaryCalculator } from '@/features/home/components/QuickSalaryCalculator';
import { ResponsiveDetails } from '@/features/home/components/ResponsiveDetails';

export const metadata: Metadata = {
  title: 'Calculadoras Perú 2026: sueldo, IGV, negocios y finanzas',
  description: 'Calcula sueldo neto, IGV, CTS, precios, préstamos y obligaciones tributarias con 25 herramientas gratuitas adaptadas al Perú.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Calculadoras Perú 2026 | CalculaPerú',
    description: '25 calculadoras gratuitas para trabajo, negocios, finanzas e impuestos en Perú.',
    url: 'https://www.calculaperu.com.pe',
  },
};

const FEATURED_CALCULATORS = [
  { id: 'sueldo-neto', label: 'Sueldo neto', eyebrow: 'Trabajo', image: '/home/featured-sueldo-v2.webp', imageAlt: 'Planilla, calculadora, calendario y monedas para calcular el sueldo neto' },
  { id: 'calculadora-igv', label: 'IGV 18%', eyebrow: 'SUNAT', image: '/home/featured-igv-v2.webp', imageAlt: 'Recibo, calculadora y documentos para calcular el IGV de una venta' },
  { id: 'precio-de-venta', label: 'Precio de venta', eyebrow: 'Negocios', image: '/home/featured-precio-venta-v2.webp', imageAlt: 'Producto, etiqueta y calculadora para definir un precio de venta' },
  { id: 'punto-de-equilibrio', label: 'Punto de equilibrio', eyebrow: 'Finanzas', image: '/home/featured-punto-equilibrio-v2.webp', imageAlt: 'Balanza equilibrando productos, costos y monedas de un negocio' },
  { id: 'calculadora-cts', label: 'CTS', eyebrow: 'Beneficios', image: '/home/featured-cts-v2.webp', imageAlt: 'Alcancía, monedas, calendario y documentos relacionados con la CTS' },
  { id: 'tipo-de-cambio-dolar-sunat', label: 'Dólar a soles', eyebrow: 'Actualizado', image: '/home/featured-dolar-v2.webp', imageAlt: 'Billetes y monedas junto a una calculadora de tipo de cambio' },
].map((featured) => ({
  ...featured,
  calculator: CALCULATORS_REGISTRY.find((calculator) => calculator.id === featured.id)!,
}));

const CATEGORY_ICONS: Record<CalculatorCategory, typeof Calculator> = {
  negocios: Store,
  laboral: BriefcaseBusiness,
  finanzas: TrendingUp,
  tributario: ReceiptText,
};

const POPULAR_LINKS = [
  { label: 'Sueldo neto', href: '/sueldo-neto' },
  { label: 'IGV 18%', href: '/calculadora-igv' },
  { label: 'CTS', href: '/calculadora-cts' },
  { label: 'Precio de venta', href: '/precio-de-venta' },
  { label: 'Liquidación laboral', href: '/liquidacion-laboral' },
];

const FAQS = [
  {
    question: '¿De dónde salen las tasas y los parámetros?',
    answer: 'Las fórmulas indican sus referencias y utilizan parámetros publicados por entidades peruanas oficiales como SUNAT, MTPE, SBS, BCRP y la legislación laboral vigente (D.L. 728, Ley 27735 y D.S. N° 001-98-TR).',
  },
  {
    question: '¿Los resultados tienen validez legal?',
    answer: 'Los resultados son simulaciones y cálculos de alta precisión según la normativa. Para empresas y empleadores que requieren documentos formales con validez jurídica ante SUNAFIL (boletas y liquidaciones con firmas y membrete), disponemos de la suite CalculaPerú PRO.',
  },
  {
    question: '¿Necesito registrarme para usar las calculadoras gratuitas?',
    answer: 'No. Puedes usar las 25 calculadoras web de forma 100% gratuita y sin necesidad de crear una cuenta. Si deseas guardar tus datos de empresa o emitir boletas sin marcas de agua, puedes activar una cuenta PRO.',
  },
];

const homeItemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Calculadoras más utilizadas de CalculaPerú',
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 transition-colors dark:bg-[#070D1E] dark:text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeItemListJsonLd) }} />

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative isolate overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-[#eef4f3] via-[#f1f6f5] to-[#f8fafc] dark:border-slate-800/80 dark:from-[#09122a] dark:via-[#080f24] dark:to-[#070D1E]">
        {/* Peruvian Machu Picchu atmospheric background */}
        <div className="pointer-events-none absolute inset-0 lg:left-auto lg:w-[58%]" aria-hidden="true">
          <Image
            src="/machu_pichu.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 58vw"
            className="object-cover object-[62%_center] opacity-85 saturate-[1.1] dark:opacity-40 lg:object-center lg:opacity-80 dark:lg:opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#eef4f3]/85 via-[#eef4f3]/55 to-[#f8fafc] dark:from-[#09122a]/90 dark:via-[#09122a]/70 dark:to-[#070D1E] lg:hidden" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-[#eef4f3] via-[#eef4f3]/55 to-transparent dark:from-[#09122a] dark:via-[#09122a]/70 lg:block" />
          <div className="absolute inset-0 hidden bg-gradient-to-t from-[#f8fafc] via-transparent to-transparent dark:from-[#070D1E] lg:block" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-20">
          
          {/* Hero Left Column: Copy & Search */}
          <div className="home-hero-copy lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-white/85 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs backdrop-blur-sm dark:border-emerald-500/30 dark:bg-slate-900/80 dark:text-emerald-300">
              <BadgeCheck className="h-4 w-4 text-[#00875A] dark:text-[#00C853]" aria-hidden="true" />
              <span>25 herramientas gratuitas · Parámetros Perú 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.6rem] font-black leading-[1.08] tracking-tight text-slate-950 dark:text-white">
              Calculadoras para Perú,{' '}
              <span className="bg-gradient-to-r from-[#00875A] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                claras desde el primer número
              </span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
              Calcula sueldo neto, IGV, liquidaciones, beneficios laborales, precios y finanzas con herramientas adaptadas a parámetros oficiales publicados por <strong>SUNAT, MTPE, SBS y BCRP</strong>.
            </p>

            {/* Instant Search Bar */}
            <div className="pt-1">
              <HomeSearch calculators={CALCULATORS_REGISTRY} />
            </div>

            {/* Popular quick links */}
            <nav aria-label="Calculadoras populares" className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 mr-1">Más buscadas:</span>
              {POPULAR_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center rounded-full border border-slate-300/80 bg-white/90 px-3 py-1 font-semibold text-slate-700 transition-all hover:border-emerald-600 hover:bg-emerald-50/50 hover:text-emerald-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-300 shadow-2xs"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Trust highlights */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#00875A] dark:text-emerald-400" aria-hidden="true" />
                Sin registro obligatorio
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpenCheck className="h-4 w-4 text-[#00875A] dark:text-emerald-400" aria-hidden="true" />
                Fórmulas explicadas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-[#00875A] dark:text-emerald-400" aria-hidden="true" />
                Simulaciones en tiempo real
              </span>
            </div>
          </div>

          {/* Hero Right Column: Interactive Quick Salary Calculator */}
          <div className="home-hero-calculator lg:col-span-5 flex justify-center lg:justify-end">
            <QuickSalaryCalculator />
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURED CALCULATORS SECTION */}
      {/* ========================================================================= */}
      <section aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00875A] dark:text-emerald-400">
              Accesos directos
            </span>
            <h2 id="featured-title" className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Las calculadoras más utilizadas del Perú
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Herramientas financieras y laborales actualizadas a la normativa 2026.
            </p>
          </div>
          <Link
            href="#todas-las-calculadoras"
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#00875A] hover:text-[#006644] dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <span>Ver las 25 herramientas</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {FEATURED_CALCULATORS.map(({ calculator, label, eyebrow, image, imageAlt }, index) => (
            <Link
              key={calculator.id}
              href={calculator.slug}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div className="relative aspect-[16/8.5] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" aria-hidden="true" />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700 shadow-xs backdrop-blur-xs dark:bg-slate-950/90 dark:text-slate-200">
                  <span className="font-mono text-[#00875A] dark:text-emerald-400">0{index + 1}</span> · {eyebrow}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between space-y-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white group-hover:text-[#00875A] dark:group-hover:text-emerald-400 transition-colors">
                    {label}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {calculator.cardSummary}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800/80">
                  <span>Abrir calculadora</span>
                  <ArrowRight className="h-4 w-4 text-[#00875A] transition-transform group-hover:translate-x-1 dark:text-emerald-400" aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* HIGH-CONVERTING SAAS PRO BANNER */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#06241a] via-[#0b1b36] to-[#041226] border border-emerald-500/30 p-8 sm:p-10 shadow-2xl text-white">
          {/* Subtle background glow effect */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Pro Value Proposition */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>NUEVA SUITE PROFESIONAL PARA EMPRESAS Y CONTADORES</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Emite boletas de pago y liquidaciones con{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  CalculaPerú PRO
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Evita multas de SUNAFIL de hasta S/ 8,250. Genera boletas de pago membretadas con tu propio Logo y RUC, liquidaciones bajo el D.L. 728 con huella digital y archivos listos para importar al PDT PLAME de SUNAT.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Boletas formales D.S. N° 001-98-TR</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tu RUC, Razón Social y Logotipo</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Liquidaciones ilimitadas D.L. 728</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multi-dispositivo y 0% Publicidad</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/pro"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-950/40 hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Conocer Planes CalculaPerú PRO</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/pro"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-semibold underline underline-offset-4 transition-colors"
                >
                  <span>Desde S/ 16.50 al mes (Plan Anual)</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Mock Preview Badge */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-2xl space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-sans">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#00875A] flex items-center justify-center text-white font-bold text-[10px]">
                      CP
                    </div>
                    <span className="font-bold text-white text-xs">Boleta Oficial SUNAFIL</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    VÁLIDO 2026
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">EMPRESA:</span>
                    <span className="text-white font-bold font-sans">TU LOGO Y RUC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">TRABAJADOR:</span>
                    <span className="text-slate-200 font-sans">Planilla General</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RÉGIMEN:</span>
                    <span className="text-emerald-400">D.L. 728 / SUNAT</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>TOTAL HABERES:</span>
                    <span className="text-white font-bold">S/ 3,500.00</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>DESCUENTOS LEY:</span>
                    <span className="text-red-400 font-bold">- S/ 416.50</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold text-xs pt-1 border-t border-slate-800">
                    <span>NETO A PAGAR:</span>
                    <span>S/ 3,083.50</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans pt-1">
                  <span>✓ Con firma y huella de ley</span>
                  <span className="text-[#00875A] font-bold">Sin marca de agua</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* OFFICIAL PARAMETERS AND TRUST BAR */}
      {/* ========================================================================= */}
      <section aria-label="Confianza y parámetros oficiales" className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0c1630]">
        <div className="mx-auto grid max-w-7xl gap-px bg-slate-200 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 dark:bg-slate-800">
          {[
            { label: 'IGV vigente', value: '18%', detail: 'Tasa general SUNAT', icon: Percent },
            { label: 'UIT oficial 2026', value: 'S/ 5,500', detail: 'D.S. N° 309-2025-EF', icon: Banknote },
            { label: 'Calculadoras', value: '25 Libres', detail: 'Acceso gratuito ilimitado', icon: Calculator },
            { label: 'Normativa Legal', value: 'Oficial', detail: 'SUNAT, MTPE, SBS y BCRP', icon: Building2 },
          ].map(({ label, value, detail, icon: Icon }) => (
            <div key={label} className="flex items-center gap-4 bg-white px-4 py-6 dark:bg-[#0c1630] sm:px-6">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#00875A] dark:text-emerald-400 shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className="mt-0.5 font-mono text-xl font-black text-slate-950 dark:text-white">
                  {value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FULL DIRECTORY OF 25 CALCULATORS */}
      {/* ========================================================================= */}
      <section id="todas-las-calculadoras" aria-labelledby="directory-title" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00875A] dark:text-emerald-400">
            Directorio completo
          </span>
          <h2 id="directory-title" className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            Encuentra la herramienta según tu necesidad
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Organizamos las 25 calculadoras en cuatro áreas para que llegues al resultado de inmediato.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => {
            const calculators = CALCULATORS_REGISTRY.filter((calculator) => calculator.category === category.id);
            const Icon = CATEGORY_ICONS[category.id];
            return (
              <ResponsiveDetails
                id={category.id}
                key={category.id}
                defaultMobileOpen={index === 0}
                className="directory-details group scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs"
              >
                <summary className="flex min-h-12 cursor-pointer list-none items-start justify-between gap-4 marker:content-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-600">
                  <span className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#00875A] dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
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
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-hover/link:translate-x-0.5 group-hover/link:text-emerald-700 dark:group-hover/link:text-emerald-400" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </ResponsiveDetails>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* METHODOLOGY & FAQS */}
      {/* ========================================================================= */}
      <section aria-labelledby="method-title" className="border-t border-slate-200 bg-[#edf2f1] dark:border-slate-800 dark:bg-[#09122a]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00875A] dark:text-emerald-400">
              Transparencia y Rigor
            </span>
            <h2 id="method-title" className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Sabes qué se calcula y con qué referencia
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
              Cada herramienta explica su fórmula, los parámetros utilizados y el alcance del resultado. Así puedes revisar el cálculo con total certeza contable.
            </p>
            <div className="pt-2">
              <Link
                href="/sobre-nosotros"
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#00875A] dark:text-emerald-400 hover:underline"
              >
                <span>Conoce cómo trabaja CalculaPerú</span>
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
                    <ChevronDown className="h-4 w-4 shrink-0 text-[#00875A] transition-transform group-open:rotate-180 dark:text-emerald-400" aria-hidden="true" />
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
