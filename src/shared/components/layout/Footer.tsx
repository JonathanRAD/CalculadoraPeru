import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';

export function Footer() {
  const comercioCalcs = CALCULATORS_REGISTRY.filter(c => c.category === 'comercio');
  const finanzasCalcs = CALCULATORS_REGISTRY.filter(c => c.category === 'finanzas');
  const tributariasCalcs = CALCULATORS_REGISTRY.filter(c => c.category === 'tributaria' || c.category === 'hogar');

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      {/* Main Grid */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Columna 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3 group inline-flex">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 p-0.5 shadow-md shadow-emerald-950/40">
                <Image
                  src="/logo-calc.png"
                  alt="CalculaPerú Logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain rounded-lg"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Calcula<span className="text-emerald-400">Perú</span>
              </span>
              <span className="rounded-md bg-emerald-950/80 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-800/80">
                🇵🇪 PERÚ
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm font-normal">
              El portal de calculadoras financieras, comerciales y tributarias #1 del Perú. 
              Convierte cada cálculo en mejores decisiones para tu negocio, emprendimiento o finanzas personales.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-300 pt-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Adaptado a la normativa peruana (IGV 18%, UIT y pliegos Osinergmin).</span>
            </div>
          </div>

          {/* Columna 3: Comercio & Negocios */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Comercio & Ventas
            </h3>
            <ul className="space-y-2.5 text-sm">
              {comercioCalcs.map((calc) => (
                <li key={calc.id}>
                  <Link href={calc.slug} className="text-slate-400 hover:text-white hover:translate-x-0.5 inline-flex items-center gap-1 transition-all">
                    <span>{calc.shortTitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Finanzas & Metas */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Finanzas & Inversión
            </h3>
            <ul className="space-y-2.5 text-sm">
              {finanzasCalcs.map((calc) => (
                <li key={calc.id}>
                  <Link href={calc.slug} className="text-slate-400 hover:text-white hover:translate-x-0.5 inline-flex items-center gap-1 transition-all">
                    <span>{calc.shortTitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 5: Impuestos & Hogar */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Impuestos & Hogar
            </h3>
            <ul className="space-y-2.5 text-sm">
              {tributariasCalcs.map((calc) => (
                <li key={calc.id}>
                  <Link href={calc.slug} className="text-slate-400 hover:text-white hover:translate-x-0.5 inline-flex items-center gap-1 transition-all">
                    <span>{calc.shortTitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-14 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 CalculaPerú. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1.5 font-medium">
            <span>Hecho con</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>para las micro, pequeñas empresas y emprendedores del Perú.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
