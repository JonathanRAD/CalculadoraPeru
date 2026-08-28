import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Heart } from 'lucide-react';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';

export function Footer() {
  const negociosCalcs = CALCULATORS_REGISTRY.filter(c => c.category === 'negocios');
  const laboralCalcs = CALCULATORS_REGISTRY.filter(c => c.category === 'laboral');
  const finanzasCalcs = CALCULATORS_REGISTRY.filter(c => c.category === 'finanzas');
  const tributariasCalcs = CALCULATORS_REGISTRY.filter(c => c.category === 'tributario');

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors">
      {/* Main Grid */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Columna 1: Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 p-0.5 shadow-md shadow-emerald-950/20">
                <Image
                  src="/logo-calc.png"
                  alt="CalculaPerú Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain rounded-lg"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Calcula<span className="text-emerald-700 dark:text-emerald-400">Perú</span>
              </span>
            </Link>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              El portal oficial con 22 calculadoras financieras, laborales y tributarias del Perú.
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-400 font-bold pt-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Normas SUNAT, Ley Laboral y Osinergmin.</span>
            </div>
          </div>

          {/* Columna 2: Negocios & Comercio */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Negocios & Comercio
            </h3>
            <ul className="space-y-2 text-xs">
              {negociosCalcs.map((calc) => (
                <li key={calc.id}>
                  <Link href={calc.slug} className="text-slate-600 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                    {calc.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Laboral & Planilla */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Laboral & Planilla
            </h3>
            <ul className="space-y-2 text-xs">
              {laboralCalcs.map((calc) => (
                <li key={calc.id}>
                  <Link href={calc.slug} className="text-slate-600 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                    {calc.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Finanzas & Inversión */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Finanzas & Metas
            </h3>
            <ul className="space-y-2 text-xs">
              {finanzasCalcs.map((calc) => (
                <li key={calc.id}>
                  <Link href={calc.slug} className="text-slate-600 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                    {calc.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 5: Tributario & Servicios */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Tributario & Diario
            </h3>
            <ul className="space-y-2 text-xs">
              {tributariasCalcs.map((calc) => (
                <li key={calc.id}>
                  <Link href={calc.slug} className="text-slate-600 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                    {calc.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-100 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 CalculaPerú. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1.5 font-medium">
            <span>Hecho con</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>para las microempresas, trabajadores y estudiantes del Perú.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
