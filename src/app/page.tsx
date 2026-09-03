import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, BadgeCheck, Banknote, BookOpenCheck, BriefcaseBusiness,
  Building2, Calculator, ChevronDown, Clock3, Percent, ReceiptText,
  ShieldCheck, Store, TrendingUp,
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
];

const FAQS = [
  {
    question: '¿De dónde salen las tasas y los parámetros?',
    answer: 'Las fórmulas indican sus referencias y utilizan parámetros publicados por entidades peruanas como SUNAT, MTPE, SBS, BCRP y normas laborales vigentes, según corresponda.',
  },
  {
    question: '¿Los resultados tienen validez legal?',
    answer: 'Los resultados son estimaciones informativas. Sirven para planificar y comprobar escenarios, pero no reemplazan una declaración oficial ni la asesoría de un profesional.',
  },
  {
    question: '¿Necesito registrarme o entregar mis datos?',
    answer: 'No. Puedes usar las calculadoras gratuitamente y sin crear una cuenta. Los datos ingresados en los formularios se procesan para mostrar el cálculo solicitado.',
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
    <div className="min-h-screen bg-[#f6f7f9] text-slate-950 transition-colors dark:bg-[#091127] dark:text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeItemListJsonLd) }} />

      <section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#eef4f3] dark:border-slate-800 dark:bg-[#0b1530]">
        <div className="pointer-events-none absolute inset-0 lg:left-auto lg:w-[58%]" aria-hidden="true">
          <Image src="/machu_pichu.jpg" alt="" fill priority sizes="(max-width: 1023px) 100vw, 58vw" className="object-cover object-[62%_center] opacity-90 saturate-[1.08] dark:opacity-55 lg:object-center lg:opacity-85 dark:lg:opacity-48" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#eef4f3]/82 via-[#eef4f3]/52 to-[#eef4f3]/84 dark:from-[#0b1530]/88 dark:via-[#0b1530]/66 dark:to-[#0b1530]/88 lg:hidden" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-[#eef4f3] via-[#eef4f3]/50 to-transparent dark:from-[#0b1530] dark:via-[#0b1530]/62 lg:block" />
          <div className="absolute inset-0 hidden bg-gradient-to-t from-[#eef4f3]/75 via-transparent to-[#eef4f3]/10 dark:from-[#0b1530]/78 dark:to-[#0b1530]/10 lg:block" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-20">
          <div className="home-hero-copy lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-white/75 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-400/25 dark:bg-slate-950/35 dark:text-emerald-300">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              25 herramientas gratuitas · Perú 2026
            </div>
            <h1 className="mt-5 max-w-3xl text-[2.45rem] font-bold leading-[1.05] tracking-[-0.045em] text-[#08152f] dark:text-white sm:text-5xl lg:text-[3.65rem]">
              Calculadoras para Perú, claras desde el primer número
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-300 sm:text-lg sm:leading-8">
              Calcula sueldo, IGV, beneficios laborales, precios y finanzas con herramientas adaptadas a parámetros publicados por SUNAT, MTPE, SBS y BCRP.
            </p>
            <div className="mt-7"><HomeSearch calculators={CALCULATORS_REGISTRY} /></div>
            <nav aria-label="Calculadoras populares" className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold text-slate-600 dark:text-slate-400">Más buscadas</span>
              {POPULAR_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="inline-flex min-h-9 items-center rounded-full border border-slate-300 bg-white/70 px-3 text-xs font-semibold text-slate-700 transition-[border-color,background-color,color] hover:border-emerald-600 hover:bg-white hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:bg-slate-900 dark:hover:text-emerald-300">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /> Sin registro</span>
              <span className="inline-flex items-center gap-2"><BookOpenCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /> Fórmulas explicadas</span>
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /> Resultados inmediatos</span>
            </div>
          </div>
          <div className="home-hero-calculator lg:col-span-5"><QuickSalaryCalculator /></div>
        </div>
      </section>

      <section aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">Empieza por aquí</p>
            <h2 id="featured-title" className="mt-2 text-2xl font-bold tracking-[-0.025em] text-slate-950 dark:text-white sm:text-3xl">Las calculadoras más utilizadas</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">Accesos directos para las decisiones más frecuentes.</p>
          </div>
          <Link href="#todas-las-calculadoras" className="group inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-emerald-800 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300 sm:self-auto">
            Ver las 25 herramientas <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FEATURED_CALCULATORS.map(({ calculator, label, eyebrow, image, imageAlt }, index) => (
            <Link key={calculator.id} href={calculator.slug} className="home-feature-card group overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white shadow-[0_12px_34px_-28px_rgba(15,23,42,0.55)] transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-[0_20px_42px_-30px_rgba(15,23,42,0.55)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-600 dark:border-slate-700 dark:bg-[#111a31] dark:hover:border-slate-500">
              <div className="relative aspect-[16/8.5] overflow-hidden bg-slate-200 dark:bg-slate-800">
                <Image src={image} alt={imageAlt} fill sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" aria-hidden="true" />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/92 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-slate-700 shadow-sm backdrop-blur-sm dark:bg-slate-950/82 dark:text-slate-200">
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">0{index + 1}</span> · {eyebrow}
                </span>
              </div>
              <div className="flex min-h-48 flex-col p-5">
                <h3 className="text-lg font-bold tracking-tight text-slate-950 transition-colors group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-300">{label}</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">{calculator.cardSummary}</p>
                <span className="mt-auto pt-5 text-sm font-bold text-slate-800 dark:text-slate-200">Abrir calculadora <ArrowRight className="ml-1 inline h-4 w-4 text-emerald-700 transition-transform group-hover:translate-x-1 dark:text-emerald-400" aria-hidden="true" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Confianza y parámetros" className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0d1732]">
        <div className="mx-auto grid max-w-7xl gap-px bg-slate-200 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 dark:bg-slate-800">
          {[
            { label: 'IGV vigente', value: '18%', detail: 'Tasa general SUNAT', icon: Percent },
            { label: 'UIT 2026', value: 'S/ 5,500', detail: 'Valor oficial', icon: Banknote },
            { label: 'Cobertura', value: '25', detail: 'Calculadoras gratuitas', icon: Calculator },
            { label: 'Fuentes', value: 'Oficiales', detail: 'SUNAT, MTPE, SBS y BCRP', icon: Building2 },
          ].map(({ label, value, detail, icon: Icon }) => (
            <div key={label} className="flex items-center gap-4 bg-white px-3 py-6 dark:bg-[#0d1732] sm:px-5">
              <Icon className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
              <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 font-mono text-xl font-bold text-slate-950 dark:text-white">{value}</p><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{detail}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="todas-las-calculadoras" aria-labelledby="directory-title" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">Directorio completo</p>
          <h2 id="directory-title" className="mt-2 text-2xl font-bold tracking-[-0.025em] text-slate-950 dark:text-white sm:text-3xl">Encuentra la herramienta según tu necesidad</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">Organizamos las 25 calculadoras en cuatro áreas para que llegues al resultado sin recorrer listas interminables.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => {
            const calculators = CALCULATORS_REGISTRY.filter((calculator) => calculator.category === category.id);
            const Icon = CATEGORY_ICONS[category.id];
            return (
              <ResponsiveDetails id={category.id} key={category.id} defaultMobileOpen={index === 0} className="directory-details group scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0e1834]">
                <summary className="flex min-h-12 cursor-pointer list-none items-start justify-between gap-4 marker:content-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-600">
                  <span className="flex min-w-0 items-start gap-3"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"><Icon className="h-4.5 w-4.5" aria-hidden="true" /></span><span><span className="block text-sm font-bold text-slate-950 dark:text-white">{category.label}</span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{calculators.length} herramientas</span></span></span>
                  <ChevronDown className="mt-2 h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180 md:hidden" aria-hidden="true" />
                </summary>
                <ul className="mt-4 space-y-1 border-t border-slate-100 pt-3 dark:border-slate-800">
                  {calculators.map((calculator) => (
                    <li key={calculator.id}><Link href={calculator.slug} className="group/link flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 text-sm font-medium leading-5 text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-emerald-600 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"><span>{calculator.shortTitle}</span><ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-hover/link:translate-x-0.5 group-hover/link:text-emerald-700 dark:group-hover/link:text-emerald-400" aria-hidden="true" /></Link></li>
                  ))}
                </ul>
              </ResponsiveDetails>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="method-title" className="border-t border-slate-200 bg-[#edf2f1] dark:border-slate-800 dark:bg-[#0b1530]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">Transparencia antes que promesas</p>
            <h2 id="method-title" className="mt-3 text-2xl font-bold tracking-[-0.025em] text-slate-950 dark:text-white sm:text-3xl">Sabes qué se calcula y con qué referencia</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">Cada herramienta explica su fórmula, los parámetros utilizados y el alcance del resultado. Así puedes revisar el cálculo, no solamente aceptarlo.</p>
            <Link href="/sobre-nosotros" className="group mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-400">Conoce cómo trabaja CalculaPerú <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></Link>
          </div>
          <div className="lg:col-span-8">
            <div className="divide-y divide-slate-200 border-y border-slate-300 dark:divide-slate-700 dark:border-slate-700">
              {FAQS.map((faq, index) => (
                <details key={faq.question} className="group py-1" open={index === 0}>
                  <summary className="flex min-h-15 cursor-pointer list-none items-center justify-between gap-5 py-3 text-base font-bold text-slate-950 marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-white">{faq.question}<ChevronDown className="h-4 w-4 shrink-0 text-emerald-700 transition-transform group-open:rotate-180 dark:text-emerald-400" aria-hidden="true" /></summary>
                  <p className="max-w-3xl pb-5 pr-8 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
