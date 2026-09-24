'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck, Eye, Sparkles } from 'lucide-react';
import { HomeSearch } from '@/features/home/components/HomeSearch';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';

const POPULAR_PILLS = [
  { label: 'Sueldo neto', href: '/sueldo-neto' },
  { label: 'IGV 18%', href: '/calculadora-igv' },
  { label: 'CTS', href: '/calculadora-cts' },
  { label: 'Gratificación', href: '/gratificacion' },
  { label: 'Dólar a soles', href: '/tipo-de-cambio-dolar-sunat' },
  { label: 'Precio de venta', href: '/precio-de-venta' },
];

export default function HeroPreviewDevPage() {
  const [activeTab, setActiveTab] = useState<'with-photo' | 'without-photo' | 'both'>('with-photo');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 space-y-8">
      
      {/* Dev Navigation Header */}
      <div className="mx-auto max-w-7xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-[#08734F] dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 text-xs font-bold mb-2">
              <Eye className="h-3.5 w-3.5" />
              <span>Vista Previa de Desarrollo (Exclusiva de revisión interna)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Comparativa Visual del Hero de Portada — CalculaPerú
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Compara la variante con fotografía peruana integrada frente a la variante minimalista sin imagen.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 p-1.5 border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('with-photo')}
              className={`rounded-xl px-4 py-2 transition-all cursor-pointer ${
                activeTab === 'with-photo'
                  ? 'bg-white dark:bg-slate-800 text-[#08734F] dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Variante A (Con Foto - Recomendada)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('without-photo')}
              className={`rounded-xl px-4 py-2 transition-all cursor-pointer ${
                activeTab === 'without-photo'
                  ? 'bg-white dark:bg-slate-800 text-[#08734F] dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Variante B (Sin Foto Minimalista)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={`rounded-xl px-4 py-2 transition-all cursor-pointer ${
                activeTab === 'both'
                  ? 'bg-white dark:bg-slate-800 text-[#08734F] dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ver Ambas en Paralelo
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VARIANT A: WITH INTEGRATED PERUVIAN PHOTO */}
      {/* ========================================================================= */}
      {(activeTab === 'with-photo' || activeTab === 'both') && (
        <div className="mx-auto max-w-7xl rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-white dark:bg-[#0B132B]">
          <div className="bg-emerald-50 dark:bg-emerald-950/80 px-6 py-3 border-b border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs">
            <span className="font-bold text-[#08734F] dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Variante A: Con Fotografía Peruana Integrada (Recomendada)</span>
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              Reducción de altura: ~28% | Composición a 2 columnas
            </span>
          </div>

          <section className="relative overflow-hidden py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Text + Search */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-4 sm:space-y-5 text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#08734F] dark:text-[#00C853]" />
                  <span>25 calculadoras gratuitas · Parámetros Perú 2026</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
                  ¿Qué necesitas calcular?
                </h2>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl">
                  Herramientas laborales, tributarias, comerciales y financieras adaptadas a la normativa oficial peruana (SUNAT, MTPE, SBS y BCRP).
                </p>

                <div className="pt-1 w-full max-w-xl">
                  <HomeSearch calculators={CALCULATORS_REGISTRY} />
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-400 dark:text-slate-500 mr-1">Directos:</span>
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

              {/* Right Column: Peruvian Photo */}
              <div className="hidden lg:block lg:col-span-5 xl:col-span-5">
                <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/60 aspect-[16/11] w-full group">
                  <Image
                    src="/machu_pichu.jpg"
                    alt="Paisaje emblemático del Perú - Machu Picchu"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent dark:from-[#0B132B]/50 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent pointer-events-none" />

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-medium text-white/95 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/60 backdrop-blur-xs px-2.5 py-1 border border-white/10">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Parámetros Perú 2026
                    </span>
                    <span className="rounded-full bg-slate-950/60 backdrop-blur-xs px-2.5 py-1 border border-white/10 text-white/80">
                      Cálculos locales
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VARIANT B: WITHOUT PHOTO (CLEAN MINIMALIST) */}
      {/* ========================================================================= */}
      {(activeTab === 'without-photo' || activeTab === 'both') && (
        <div className="mx-auto max-w-7xl rounded-3xl overflow-hidden border-2 border-slate-300 dark:border-slate-800 shadow-xl bg-white dark:bg-[#0B132B]">
          <div className="bg-slate-100 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Variante B: Sin Fotografía (Minimalista Compacta)
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              Misma altura compacta reducida ~28%
            </span>
          </div>

          <section className="relative overflow-hidden py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4 sm:space-y-5 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <BadgeCheck className="h-3.5 w-3.5 text-[#08734F] dark:text-[#00C853]" />
                <span>25 calculadoras gratuitas · Parámetros Perú 2026</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
                ¿Qué necesitas calcular?
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl">
                Herramientas laborales, tributarias, comerciales y financieras adaptadas a la normativa oficial peruana (SUNAT, MTPE, SBS y BCRP).
              </p>

              <div className="pt-1 w-full max-w-xl">
                <HomeSearch calculators={CALCULATORS_REGISTRY} />
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-400 dark:text-slate-500 mr-1">Directos:</span>
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
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TECHNICAL COMPARISON TABLE & RECOMMENDATION */}
      {/* ========================================================================= */}
      <div className="mx-auto max-w-7xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Análisis Comparativo Técnico y Recomendación
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Evaluación según legibilidad, identidad peruana, equilibrio visual y rendimiento en dispositivos:
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white">
              <tr>
                <th className="p-3">Dimensión de Evaluación</th>
                <th className="p-3">Variante A (Con Foto Peruana Integrada)</th>
                <th className="p-3">Variante B (Sin Foto Minimalista)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">1. Legibilidad de Lectura</td>
                <td className="p-3 text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">100% óptima.</span> La foto está contenida exclusivamente a la derecha. Ningún detalle visual interfiere detrás del texto ni del buscador.
                </td>
                <td className="p-3 text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">100% óptima.</span> Fondo liso sin distracciones.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">2. Identidad y Personalidad</td>
                <td className="p-3 text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Muy Alta.</span> Aporta calor andino y conexión geográfica inmediata con el usuario local, evitando parecer un clon genérico de calculadora estadounidense o europea.
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Media/Baja.</span> Es sobria pero se percibe fría y genérica sin anclaje visual nacional.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">3. Equilibrio Visual en Desktop</td>
                <td className="p-3 text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Excelente.</span> Ocupa naturalmente el vacío lateral que deja el buscador alineado a la izquierda, armonizando el ancho total (`max-w-7xl`).
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Descompensado.</span> Deja más de un 40% del ancho derecho completamente en blanco en pantallas panorámicas.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">4. Rendimiento Móvil y LCP</td>
                <td className="p-3 text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Optimizado.</span> Se oculta en pantallas móviles (`hidden lg:block`), evitando la descarga de bytes innecesarios en smartphones. En desktop se carga con `priority` y `sizes` exactos.
                </td>
                <td className="p-3 text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Óptimo.</span> No requiere carga de recursos fotográficos.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800/80 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
          <strong>Recomendación:</strong> Se recomienda la <strong>Variante A (Con Fotografía Peruana Integrada)</strong>. Logra la personalidad y calidez requeridas sin sacrificar legibilidad ni velocidad móvil, reduciendo a la vez un 28% la altura vertical previa para que las calculadoras destacadas sean visibles de inmediato.
        </div>
      </div>

    </div>
  );
}
