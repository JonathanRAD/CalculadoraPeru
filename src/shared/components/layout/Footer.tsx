import React from 'react';
import Link from 'next/link';
import { Calculator, ShieldCheck, Heart } from 'lucide-react';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';

export function Footer() {
  const comercioCalcs = CALCULATORS_REGISTRY.filter(c => c.category === 'comercio');
  const finanzasCalcs = CALCULATORS_REGISTRY.filter(c => c.category === 'finanzas');
  const tributariasCalcs = CALCULATORS_REGISTRY.filter(c => c.category === 'tributaria' || c.category === 'hogar');

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      {/* Main Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Columna 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <Calculator className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Calcula<span className="text-emerald-400">Perú</span>
              </span>
              <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                🇵🇪 PERÚ
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              El portal de calculadoras financieras, comerciales y tributarias #1 del Perú. 
              Convierte cada cálculo en mejores decisiones para tu negocio, emprendimiento o finanzas personales.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Adaptado 100% a la normativa peruana (IGV 18%, UIT y pliegos Osinergmin).</span>
            </div>
          </div>

          {/* Columna 3: Comercio & Negocios */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
              Comercio & Ventas
            </h3>
            <ul className="space-y-2 text-sm">
              {comercioCalcs.map((calc) => (
                <li key={calc.id}>
                  <Link href={calc.slug} className="text-slate-400 hover:text-white transition-colors">
                    {calc.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Finanzas & Metas */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
              Finanzas & Inversión
            </h3>
            <ul className="space-y-2 text-sm">
              {finanzasCalcs.map((calc) => (
                <li key={calc.id}>
                  <Link href={calc.slug} className="text-slate-400 hover:text-white transition-colors">
                    {calc.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 5: Impuestos & Hogar */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
              Impuestos & Hogar
            </h3>
            <ul className="space-y-2 text-sm">
              {tributariasCalcs.map((calc) => (
                <li key={calc.id}>
                  <Link href={calc.slug} className="text-slate-400 hover:text-white transition-colors">
                    {calc.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 CalculaPerú. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1">
            <span>Hecho con</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>para las micro, pequeñas empresas y emprendedores del Perú.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
