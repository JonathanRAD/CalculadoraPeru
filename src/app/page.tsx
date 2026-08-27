'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users,
  Store,
  Receipt,
  PiggyBank,
  ChevronRight,
} from 'lucide-react';
import { CALCULATORS_REGISTRY, CATEGORIES } from '@/features/calculators/registry';
import { DynamicIcon } from '@/shared/components/ui/DynamicIcon';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCalculators = useMemo(() => {
    return CALCULATORS_REGISTRY.filter((calc) => {
      const matchesCategory =
        selectedCategory === 'todas' || calc.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        calc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 selection:bg-emerald-500 selection:text-white">
      
      {/* HERO SECTION */}
      <section aria-label="Introducción" className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 pt-16 pb-20 text-white">
        
        {/* Subtle decorative glow & grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-900/80 px-4 py-1.5 text-xs font-bold text-emerald-200 backdrop-blur-md shadow-lg shadow-emerald-950/50 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            EL PORTAL DE CALCULADORAS #1 DEL PERÚ 🇵🇪
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Todas las calculadoras que necesitas, <span className="text-emerald-400">en un solo lugar.</span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Convierte cada cálculo en <strong className="text-white font-bold">mejores decisiones</strong> para tu negocio, emprendimiento y finanzas en el Perú.
          </p>

          {/* Interactive Search Bar in Hero */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative flex items-center rounded-2xl bg-white p-2 shadow-2xl shadow-emerald-950/50 ring-1 ring-slate-200">
              <Search className="ml-3 h-5 w-5 text-slate-500" />
              <input
                id="hero-search-input"
                type="text"
                aria-label="Buscar calculadora por nombre o palabra clave"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por 'precio de venta', 'igv 18', 'luz kwh', 'punto de equilibrio'..."
                className="w-full bg-transparent px-3 py-2 text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="mr-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Quick Value Props Banner */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-3.5 backdrop-blur-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-900/80 text-emerald-300 border border-emerald-600/50">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">100% Gratuitas</div>
                <div className="text-slate-300">Sin registros molestos</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-3.5 backdrop-blur-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-900/80 text-emerald-300 border border-emerald-600/50">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Contexto Peruano</div>
                <div className="text-slate-300">Soles S/, IGV 18%, UIT</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-3.5 backdrop-blur-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-900/80 text-emerald-300 border border-emerald-600/50">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Tiempo Real (0ms)</div>
                <div className="text-slate-300">Cálculo instantáneo</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-3.5 backdrop-blur-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-900/80 text-emerald-300 border border-emerald-600/50">
                <Store className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Para +3.5M MYPES</div>
                <div className="text-slate-300">Comercio y finanzas</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CALCULATOR HUB & GRID */}
      <section aria-label="Catálogo de calculadoras" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Calculadoras Destacadas
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Selecciona una herramienta o filtra por categoría para comenzar tu cálculo instantáneo.
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto" role="tablist" aria-label="Categorías de calculadoras">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/20'
                      : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <DynamicIcon name={cat.icon} className="h-4 w-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-semibold text-slate-600">
            Mostrando <strong>{filteredCalculators.length}</strong> de <strong>{CALCULATORS_REGISTRY.length}</strong> calculadoras
          </div>
        </div>

        {/* Calculators Cards Grid */}
        {filteredCalculators.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <Calculator className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No encontramos calculadoras</h3>
            <p className="text-sm text-slate-600 mt-1">
              Intenta buscar con otro término como "precio", "igv", "luz" o cambia la categoría.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('todas');
              }}
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
            >
              Ver todas las calculadoras
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalculators.map((calc) => (
              <Link
                key={calc.id}
                href={calc.slug}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/5"
              >
                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <DynamicIcon name={calc.icon} className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {calc.tag}
                      </span>
                      {calc.badge && (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200/50">
                          {calc.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {calc.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {calc.description}
                  </p>
                </div>

                {/* Bottom Formula & Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 font-mono line-clamp-1 max-w-[190px]">
                    🇵🇪 S/ Soles
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 group-hover:text-emerald-950 group-hover:translate-x-1 transition-all">
                    <span>Calcular</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </section>

      {/* WHY CALCULAPERU / VALUE PROPOSITION SECTION */}
      <section aria-label="Por qué CalculaPerú" className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Impacto y Oportunidad
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              ¿Por qué los peruanos eligen CalculaPerú?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Emprendedores, profesionales y estudiantes en el Perú pierden tiempo y cometen errores costosos al calcular márgenes, IGV o puntos de equilibrio con fórmulas desactualizadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">100% Contextualizado al Perú</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Calcula con el 18% de IGV oficial, tarifas de luz de Osinergmin (Luz del Sur/Enel) y valores de UIT vigentes.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Comparte tus cálculos por WhatsApp</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Envía tus proformas, márgenes y presupuestos con un solo clic a clientes, socios o colaboradores.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Diseño Limpio y sin Distracciones</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sin publicidad invasiva, carga en menos de 1 segundo y funciona de forma fluida en cualquier smartphone.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
