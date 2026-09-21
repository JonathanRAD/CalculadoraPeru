import type { Metadata } from 'next';
import Link from 'next/link';
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
    answer: 'Nuestras calculadoras aplican fórmulas basadas estrictamente en la normativa oficial peruana: Texto Único Ordenado de la Ley de Productividad Laboral (D.L. 728), Ley de Gratificaciones (Ley 27735), Texto Único Ordenado de la Ley de CTS (D.S. N° 001-97-TR), Ley del Impuesto a la Renta y tablas previsionales de la SBS y SUNAT.',
  },
  {
    question: '¿Los resultados son exactos y tienen validez vinculante?',
    answer: 'Los resultados son simulaciones referenciales de alta fidelidad matemática. Te permiten conocer con claridad el desglose de conceptos remunerativos y tributarios. No reemplazan la asesoría legal o contable colegiada ni constituyen liquidaciones vinculantes ante juzgados laborales o SUNAFIL.',
  },
  {
    question: '¿Mis datos o montos ingresados se guardan en sus servidores?',
    answer: 'No. Todas las operaciones aritméticas y simulaciones se procesan localmente en el navegador de tu propio dispositivo. CalculaPerú no registra ni transmite a servidores externos los montos de tus sueldos o finanzas.',
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 transition-colors duration-200 dark:bg-[#070D1E] dark:text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeItemListJsonLd) }} />

      {/* ========================================================================= */}
      {/* HERO SECTION — PROPOSAL A (MINIMALIST, SEARCH-CENTRIC, PRISTINE SURFACE) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-16 sm:py-24 dark:border-slate-800/80 dark:bg-[#0B132B] transition-colors">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 mb-6">
            <BadgeCheck className="h-4 w-4 text-[#08734F] dark:text-[#00C853]" aria-hidden="true" />
            <span>25 calculadoras gratuitas · Parámetros Perú 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
            ¿Qué necesitas calcular?
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Herramientas laborales, tributarias, comerciales y financieras adaptadas a la normativa oficial de <strong>SUNAT, MTPE, SBS y BCRP</strong>.
          </p>

          {/* Centered Instant Search */}
          <div className="mt-8 flex justify-center">
            <HomeSearch calculators={CALCULATORS_REGISTRY} />
          </div>

          {/* Quick Filter Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="font-semibold text-slate-400 dark:text-slate-500 mr-1">Directos:</span>
            {POPULAR_PILLS.map((pill) => (
              <Link
                key={pill.href}
                href={pill.href}
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 font-semibold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-900 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:text-emerald-300 shadow-2xs"
              >
                {pill.label}
              </Link>
            ))}
          </div>

          {/* Trust Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#08734F] dark:text-emerald-400" aria-hidden="true" />
              Sin registro obligatorio
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpenCheck className="h-4 w-4 text-[#08734F] dark:text-emerald-400" aria-hidden="true" />
              Fórmulas y leyes verificadas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-[#08734F] dark:text-emerald-400" aria-hidden="true" />
              Privacidad: cálculo en tu dispositivo
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURED TOOLS — COMPACT CLEAN GRID (NO GENERIC STOCK PHOTOS) */}
      {/* ========================================================================= */}
      <section aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
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
              <span>Ver las 25 herramientas</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </SmoothScrollLink>
          </div>
        </FadeIn>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_CALCULATORS.map(({ calculator, label, description }, index) => {
            const Icon = CATEGORY_ICONS[calculator.category] || Calculator;
            return (
              <FadeIn key={calculator.id} delay={index * 50} direction="up">
                <Link
                  href={calculator.slug}
                  className="group flex flex-col justify-between h-full rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-950/5 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center text-[#08734F] dark:text-emerald-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {calculator.category}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-950 dark:text-white group-hover:text-[#08734F] dark:group-hover:text-emerald-400 transition-colors">
                        {label}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                        {description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 flex items-center justify-between text-xs font-bold text-[#08734F] dark:text-emerald-400 border-t border-slate-100 dark:border-slate-800">
                    <span>Abrir herramienta</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* OFFICIAL PARAMETERS AND TRUST METRICS */}
      {/* ========================================================================= */}
      <section aria-label="Parámetros oficiales peruanos" className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0c1630] transition-colors">
        <div className="mx-auto grid max-w-7xl gap-px bg-slate-200 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 dark:bg-slate-800">
          {[
            { label: 'IGV vigente', value: '18%', detail: 'Tasa general SUNAT', icon: Percent },
            { label: 'UIT oficial 2026', value: 'S/ 5,500', detail: 'D.S. N° 309-2025-EF', icon: Banknote },
            { label: 'RMV vigente', value: 'S/ 1,130', detail: 'Asig. Familiar: S/ 113', icon: Calculator },
            { label: 'Marco normativo', value: 'Oficial', detail: 'SUNAT, MTPE, SBS y BCRP', icon: Building2 },
          ].map(({ label, value, detail, icon: Icon }, idx) => (
            <FadeIn key={label} delay={idx * 50} direction="up">
              <div className="flex items-center gap-4 bg-white px-4 py-5 dark:bg-[#0c1630] sm:px-6 h-full transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#08734F] dark:text-emerald-400 shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-black text-slate-950 dark:text-white">
                    {value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {detail}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CALCULAPERÚ PRO BENEFIT SHOWCASE */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <FadeIn direction="up">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 p-8 sm:p-10 shadow-sm transition-colors duration-200 dark:border-emerald-500/25 dark:from-[#09152b] dark:via-[#0c1833] dark:to-[#081224]">
            <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              
              <div className="space-y-4 lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-100/70 px-3.5 py-1 text-xs font-bold text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>SUITE PARA EMPRESAS, CONTADORES Y MYPES</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-slate-950 dark:text-white">
                  Emite boletas de pago y liquidaciones con{' '}
                  <span className="text-[#08734F] dark:text-emerald-400">
                    CalculaPerú PRO
                  </span>
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  Genera boletas de pago membretadas con tu propio Logo y RUC bajo el D.S. N° 001-98-TR, liquidaciones laborales D.L. 728 con firmas y huella digital, y exportaciones para el PDT PLAME sin publicidad.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                    <Check className="w-4 h-4 text-[#08734F] dark:text-emerald-400 shrink-0 font-bold" />
                    <span>Boletas formales D.S. N° 001-98-TR</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                    <Check className="w-4 h-4 text-[#08734F] dark:text-emerald-400 shrink-0 font-bold" />
                    <span>Tu RUC, Razón Social y Logotipo</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                    <Check className="w-4 h-4 text-[#08734F] dark:text-emerald-400 shrink-0 font-bold" />
                    <span>Liquidaciones completas D.L. 728</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                    <Check className="w-4 h-4 text-[#08734F] dark:text-emerald-400 shrink-0 font-bold" />
                    <span>Multi-dispositivo y 0% Publicidad</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/pro"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#08734F] hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-700/20"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Ver Planes CalculaPerú PRO</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Precios transparentes:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Plan Mensual: S/ 29 / mes</span>
                    <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Plan Anual: S/ 199 / año <span className="text-[#08734F] dark:text-emerald-400 font-bold">(Ahorras 40%)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Mini Boleta Preview */}
              <div className="flex justify-center lg:col-span-5">
                <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 space-y-3.5 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 font-sans">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#08734F] flex items-center justify-center text-white font-bold text-xs">
                        CP
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">Boleta Oficial SUNAFIL</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 text-[10px] font-bold">
                      VÁLIDO 2026
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">EMPRESA:</span>
                      <span className="font-bold font-sans text-slate-900 dark:text-white">TU LOGO Y RUC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">RÉGIMEN:</span>
                      <span className="text-[#08734F] dark:text-emerald-400 font-bold">D.L. 728 / SUNAT</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/90 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                      <span>TOTAL HABERES:</span>
                      <span className="font-bold text-slate-900 dark:text-white">S/ 3,500.00</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                      <span>DESCUENTOS LEY:</span>
                      <span className="text-red-500 dark:text-red-400 font-bold">- S/ 416.50</span>
                    </div>
                    <div className="flex justify-between text-[#08734F] dark:text-emerald-400 font-bold text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span>NETO A PAGAR:</span>
                      <span>S/ 3,083.50</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                    <span>✓ Con firma y huella</span>
                    <span className="text-[#08734F] dark:text-emerald-400 font-bold">Sin marcas de agua</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </FadeIn>
      </section>

      {/* ========================================================================= */}
      {/* FULL DIRECTORY OF 25 CALCULATORS — 4 COMPACT FUNCTIONAL CATEGORIES */}
      {/* ========================================================================= */}
      <section id="todas-las-calculadoras" aria-labelledby="directory-title" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
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
              Metodología y fuentes comprobables
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
              Cada herramienta detalla su fórmula, los parámetros vigentes utilizados y su alcance referencial. Diseñadas para brindar claridad en tus decisiones cotidianas.
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
