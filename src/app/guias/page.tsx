import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Clock } from 'lucide-react';
import { GUIDES, type Guide } from '@/features/guias/data';
import { calculateNetSalary } from '@/core/calculators/payroll';
import { calculateGratification } from '@/core/calculators/gratification';
import { calculateCts } from '@/core/calculators/cts';
import { calculateIgv } from '@/core/calculators/tax';
import { calculateProfitMargin } from '@/core/calculators/margin';
import { calculateFuelCost } from '@/core/calculators/fuel';
import { formatCurrency } from '@/core/math/formatters';
import { PERU_CONSTANTS } from '@/core/constants/peru';

export const metadata: Metadata = {
  title: 'Guías laborales y tributarias para Perú',
  description:
    'Guías paso a paso sobre descuentos de sueldo, gratificaciones, CTS y regímenes tributarios en Perú, con ejemplos en soles y fuentes oficiales.',
  alternates: { canonical: '/guias' },
};

type Category = Guide['category'];

const CATEGORY_INFO: Record<Category, { id: string; blurb: string }> = {
  Laboral: { id: 'laboral', blurb: 'Sueldo, gratificación, CTS y horas extras.' },
  Tributario: { id: 'tributario', blurb: 'IGV y regímenes de SUNAT para tu negocio.' },
  Negocios: { id: 'negocios', blurb: 'Precios, márgenes y comisiones de cobro.' },
  Cotidiano: { id: 'cotidiano', blurb: 'Combustible y consumo eléctrico en casa.' },
};

const CATEGORY_ORDER: Category[] = ['Laboral', 'Tributario', 'Negocios', 'Cotidiano'];

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Cifras de portada: se calculan con las mismas funciones que las calculadoras. */
function buildCovers(): Record<string, { kicker: string; figure: string; caption: string }> {
  const salary = calculateNetSalary({ grossSalary: 3000, pensionSystem: 'onp' });
  const grati = calculateGratification({ baseSalary: 2400, hasFamilyAllowance: true, monthsWorkedInSemester: 6, companyRegime: 'general', healthInsurance: 'essalud' });
  const cts = calculateCts({ baseSalary: 2400, hasFamilyAllowance: true, monthsWorkedInSemester: 6, companyRegime: 'general' });
  const igv = calculateIgv({ amount: 100, mode: 'add_igv' });
  const margin = calculateProfitMargin({ salePrice: 100, cost: 80, priceIncludesIgv: false });
  const fuel = calculateFuelCost({ distanceKm: 300, efficiencyKmPerGallon: 40, fuelPricePerUnit: 21, numberOfPassengers: 1, isRoundTrip: false });

  return {
    'cuanto-me-descuentan-de-mi-sueldo': { kicker: 'Sueldo S/ 3,000 · ONP', figure: formatCurrency(salary.netSalary), caption: 'llegan a tu cuenta' },
    'gratificacion-julio-diciembre-como-se-calcula': { kicker: 'Sueldo S/ 2,400 · 6 meses', figure: formatCurrency(grati.totalToReceive), caption: 'con bonificación del 9 %' },
    'que-regimen-tributario-elegir-rus-rer-rmt': { kicker: 'Comparativa', figure: 'RUS · RER · RMT', caption: 'y Régimen General, con un ejemplo' },
    'cts-como-se-calcula-y-cuando-se-deposita': { kicker: 'Sueldo S/ 2,400 · 6 meses', figure: formatCurrency(cts.ctsAmountToDeposit), caption: 'de depósito semestral' },
    'horas-extras-como-se-pagan': { kicker: 'Recargo por hora', figure: '+25 % · +35 %', caption: 'primeras 2 horas y siguientes' },
    'igv-18-como-calcularlo-y-desglosarlo': { kicker: 'Base S/ 100.00', figure: formatCurrency(igv.totalAmount), caption: 'total con IGV de 18 %' },
    'margen-vs-recargo-como-fijar-precio-de-venta': {
      kicker: 'Costo S/ 80 · precio S/ 100',
      figure: `${margin.profitMarginPercentage.toFixed(0)} % de margen`,
      caption: `equivale a ${margin.markupPercentage.toFixed(0)} % de recargo`,
    },
    'cuanto-gasta-tu-auto-en-combustible-por-km': { kicker: '300 km · 40 km/gal · S/ 21', figure: `${formatCurrency(fuel.totalFuelCost / 300)} / km`, caption: 'costo de combustible' },
    'comisiones-yape-pos-como-calcular-lo-que-recibes': { kicker: 'Comparativa', figure: 'Yape · Culqi · Izipay', caption: 'y Mercado Pago: lo que realmente recibes' },
    'consumo-electrico-electrodomesticos-cuanto-cuesta': { kicker: 'Tarifa de referencia', figure: `${formatCurrency(PERU_CONSTANTS.DEFAULT_KWH_COST)} / kWh`, caption: 'cuánto cuesta cada aparato' },
  };
}

export default function GuiasPage() {
  const covers = buildCovers();
  const featured = GUIDES[0];
  const salary = calculateNetSalary({ grossSalary: 3000, pensionSystem: 'onp' });
  const total = salary.totalGrossIncome;
  const parts = [
    { label: 'Llega a tu cuenta', value: salary.netSalary, className: 'bg-brand-600' },
    { label: 'Aporte ONP (13 %)', value: salary.pensionDeduction, className: 'bg-slate-500 dark:bg-slate-400' },
    { label: 'Quinta categoría', value: salary.fifthCategoryTaxMonthly, className: 'bg-stamp' },
  ];
  const latest = GUIDES.map((g) => g.updated).sort().at(-1)!;

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#121820] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Cabecera */}
      <header className="border-b border-stone-300 dark:border-slate-700">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Guías laborales y tributarias</h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
            Entiende tus descuentos, beneficios e impuestos con ejemplos en soles. Cada guía enlaza la calculadora correspondiente, cita sus fuentes y muestra la fecha de su última revisión.
          </p>

          <nav aria-label="Temas" className="mt-8 flex flex-wrap gap-x-6 gap-y-1 border-t border-stone-300 pt-2 dark:border-slate-700">
            {CATEGORY_ORDER.map((category) => (
              <a
                key={category}
                href={`#${CATEGORY_INFO[category].id}`}
                className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-slate-800 hover:text-brand-700 dark:text-slate-200 dark:hover:text-brand-400"
              >
                {category}
                <span className="font-mono text-[13px] font-normal text-slate-600 dark:text-slate-400">
                  {GUIDES.filter((g) => g.category === category).length}
                </span>
              </a>
            ))}
            <span className="ml-auto inline-flex min-h-11 items-center text-[13px] text-slate-600 dark:text-slate-400">
              {GUIDES.length} guías · revisadas el {formatDate(latest)}
            </span>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-14">
        {/* Guía destacada con gráfico real */}
        <section aria-labelledby="featured-guide" className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="font-mono text-[13px] text-brand-700 dark:text-brand-400">Empieza por aquí · {featured.category}</p>
            <h2 id="featured-guide" className="mt-2 text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
              {featured.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700 dark:text-slate-300">{featured.description}</p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-slate-600 dark:text-slate-400">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {featured.readingMinutes} min de lectura · Actualizada el {formatDate(featured.updated)}
            </p>
            <div className="mt-5">
              <Link
                href={`/guias/${featured.slug}`}
                className="inline-flex min-h-12 items-center gap-2 rounded bg-brand-600 px-5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Leer la guía <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <figure className="lg:col-span-5 rounded-lg border border-stone-300 bg-[#FFFEFB] p-5 dark:border-slate-700 dark:bg-[#18202A]">
            <figcaption className="font-mono text-[13px] text-slate-600 dark:text-slate-400">
              ¿A dónde se va un sueldo de S/ 3,000?
            </figcaption>
            <div
              role="img"
              aria-label={parts.map((p) => `${p.label}: ${formatCurrency(p.value)}`).join('. ')}
              className="mt-4 flex h-10 w-full overflow-hidden rounded-xs border border-slate-900 dark:border-slate-400"
            >
              {parts.map((part) => (
                <div
                  key={part.label}
                  className={part.className}
                  style={{ width: `${Math.max((part.value / total) * 100, 1)}%` }}
                />
              ))}
            </div>
            <dl className="mt-4 space-y-2 text-[15px]">
              {parts.map((part) => (
                <div key={part.label} className="flex items-center gap-3 border-b border-dashed border-stone-300 pb-2 last:border-0 last:pb-0 dark:border-slate-600">
                  <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-xs ${part.className}`} />
                  <dt className="flex-1 text-slate-700 dark:text-slate-300">{part.label}</dt>
                  <dd className="font-mono tabular-nums font-semibold">{formatCurrency(part.value)}</dd>
                </div>
              ))}
            </dl>
          </figure>
        </section>

        {/* Guías por tema */}
        {CATEGORY_ORDER.map((category) => {
          const guides = GUIDES.filter((g) => g.category === category && g.slug !== featured.slug);
          if (guides.length === 0) return null;
          return (
            <section key={category} id={CATEGORY_INFO[category].id} aria-labelledby={`${CATEGORY_INFO[category].id}-title`} className="scroll-mt-24">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-stone-900 pb-3 dark:border-slate-400">
                <h2 id={`${CATEGORY_INFO[category].id}-title`} className="text-2xl font-bold tracking-tight">{category}</h2>
                <p className="text-[15px] text-slate-600 dark:text-slate-400">{CATEGORY_INFO[category].blurb}</p>
              </div>

              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {guides.map((guide) => {
                  const cover = covers[guide.slug];
                  return (
                    <li key={guide.slug} className="h-full">
                      <Link
                        href={`/guias/${guide.slug}`}
                        className="lift-card group flex h-full flex-col rounded-lg border border-stone-300 bg-[#FFFEFB] dark:border-slate-700 dark:bg-[#18202A]"
                      >
                        {cover && (
                          <div className="border-b border-stone-300 bg-[#ECE9E2] px-5 py-4 dark:border-slate-700 dark:bg-[#0E141B]">
                            <p className="font-mono text-[13px] text-slate-600 dark:text-slate-400">{cover.kicker}</p>
                            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight text-brand-700 dark:text-brand-400">
                              {cover.figure}
                            </p>
                            <p className="text-[13px] text-slate-700 dark:text-slate-300">{cover.caption}</p>
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="text-lg font-semibold leading-snug">{guide.title}</h3>
                          <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">{guide.description}</p>
                          <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[13px] text-slate-600 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-4 w-4" aria-hidden="true" />
                              {guide.readingMinutes} min
                            </span>
                            <span className="inline-flex items-center gap-1 text-[15px] font-semibold text-brand-700 dark:text-brand-400">
                              Leer guía <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <p className="border-t border-stone-300 pt-6 text-[15px] text-slate-600 dark:border-slate-700 dark:text-slate-400">
          ¿Echas de menos un tema?{' '}
          <Link href="/contacto" className="font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-400">Cuéntanos</Link>.
          {' '}También puedes revisar el{' '}
          <Link href="/actualizaciones" className="font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-400">registro de actualizaciones</Link>.
        </p>
      </div>
    </div>
  );
}
