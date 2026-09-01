import Link from 'next/link';
import { Calculator, LockKeyhole, ShieldCheck } from 'lucide-react';
import {
  CALCULATORS_REGISTRY,
  CATEGORIES,
  type CalculatorCategory,
} from '@/features/calculators/registry';

const FOOTER_CATEGORIES = CATEGORIES.filter(
  (category): category is (typeof CATEGORIES)[number] & { id: CalculatorCategory } =>
    category.id !== 'todas',
);

const LEGAL_LINKS = [
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/terminos-y-condiciones', label: 'Términos y condiciones' },
  { href: '/politica-de-privacidad', label: 'Política de privacidad' },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#060B1D] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label="Ir al inicio de CalculaPerú"
              className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
                <Calculator className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xl font-black tracking-tight text-white">
                Calcula<span className="text-emerald-400">Perú</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
              Calculadoras gratuitas para negocios, trabajo, finanzas y obligaciones tributarias del Perú.
            </p>

            <div className="mt-5 flex items-start gap-2 text-xs font-semibold leading-5 text-emerald-400">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Parámetros basados en fuentes oficiales peruanas.</span>
            </div>
          </div>

          {FOOTER_CATEGORIES.map((category) => {
            const calculators = CALCULATORS_REGISTRY.filter(
              (calculator) => calculator.category === category.id,
            );

            return (
              <nav key={category.id} aria-label={`Calculadoras de ${category.label}`}>
                <h2 className="text-xs font-black uppercase tracking-wide text-white">
                  {category.label}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {calculators.map((calculator) => (
                    <li key={calculator.id}>
                      <Link
                        href={calculator.slug}
                        className="text-xs leading-5 text-slate-400 transition-colors hover:text-emerald-400 focus-visible:text-emerald-400 focus-visible:outline-none"
                      >
                        {calculator.shortTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                100% gratis
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Sin registro</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Calcula mejor, decide mejor</span>
            </div>

            <nav aria-label="Información institucional y legal">
              <ul className="flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-300 transition-colors hover:text-emerald-400 focus-visible:text-emerald-400 focus-visible:outline-none"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <p className="mt-6 text-[11px] leading-5 text-slate-500">
            © 2026 CalculaPerú. Los resultados son referenciales y no sustituyen asesoría profesional ni la información publicada por cada entidad competente.
          </p>
        </div>
      </div>
    </footer>
  );
}
