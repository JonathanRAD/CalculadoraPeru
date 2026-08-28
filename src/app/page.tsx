'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  TrendingUp,
  Receipt,
  Store,
  Zap,
  Percent,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Tag,
  Scale,
  DollarSign,
  PackageCheck,
  Target,
  PiggyBank,
  LineChart,
  ShoppingCart,
  Compass,
  Briefcase,
  Layers,
  Clock,
  ChevronRight,
  Filter,
  Check,
  Share2,
  Utensils,
  Fuel,
  Palmtree,
} from 'lucide-react';
import { CALCULATORS_REGISTRY, CATEGORIES, CalculatorMeta } from '@/features/calculators/registry';
import { DynamicIcon } from '@/shared/components/ui/DynamicIcon';
import { calculateIgv } from '@/core/calculators/tax';
import { formatCurrency } from '@/core/math/formatters';

const USE_CASES = [
  {
    id: 'todos',
    title: 'Ver Todo',
    icon: Layers,
    description: 'Catálogo de 22 calculadoras',
  },
  {
    id: 'negocios',
    title: 'Negocios & Comercio',
    icon: Store,
    description: 'Precios, márgenes, recetas y POS',
    calcIds: ['precio-de-venta', 'margen-de-ganancia', 'descuentos-y-ofertas', 'ganancia-por-producto', 'comisiones-pos-yape', 'costeo-recetas'],
  },
  {
    id: 'laboral',
    title: 'Laboral & Planilla',
    icon: Briefcase,
    description: 'Sueldos, gratificación, CTS y horas extras',
    calcIds: ['sueldo-neto', 'gratificacion', 'calculadora-cts', 'horas-extras', 'calculadora-vacaciones'],
  },
  {
    id: 'finanzas',
    title: 'Finanzas & Metas',
    icon: TrendingUp,
    description: 'Punto de equilibrio, préstamos y ahorro',
    calcIds: ['punto-de-equilibrio', 'ventas-necesarias', 'recuperacion-de-inversion', 'prestamo-bancario', 'interes-compuesto', 'porcentajes'],
  },
  {
    id: 'tributario',
    title: 'Tributario & Diario',
    icon: Receipt,
    description: 'IGV 18%, 4ta, combustible y propinas',
    calcIds: ['calculadora-igv', 'recibo-por-honorarios', 'dividir-cuenta', 'gasto-combustible', 'consumo-electrico'],
  },
];

// Distinct category theme colors
const CATEGORY_STYLES = {
  negocios: {
    badge: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 group-hover:bg-emerald-700 group-hover:text-white',
    link: 'text-emerald-800 dark:text-emerald-400 group-hover:text-emerald-950 dark:group-hover:text-emerald-300',
  },
  laboral: {
    badge: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    iconBg: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 group-hover:bg-indigo-700 group-hover:text-white',
    link: 'text-indigo-800 dark:text-indigo-400 group-hover:text-indigo-950 dark:group-hover:text-indigo-300',
  },
  finanzas: {
    badge: 'bg-blue-50 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 group-hover:bg-blue-700 group-hover:text-white',
    link: 'text-blue-800 dark:text-blue-400 group-hover:text-blue-950 dark:group-hover:text-blue-300',
  },
  tributario: {
    badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 group-hover:bg-amber-700 group-hover:text-white',
    link: 'text-amber-800 dark:text-amber-400 group-hover:text-amber-950 dark:group-hover:text-amber-300',
  },
};

export default function HomePage() {
  const [activeUseCase, setActiveUseCase] = useState<string>('todos');
  const [activeCategory, setActiveCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick live IGV simulator
  const [quickAmount, setQuickAmount] = useState<number>(100);
  const quickIgv = useMemo(() => calculateIgv({ amount: quickAmount, mode: 'add_igv' }), [quickAmount]);

  const filteredCalculators = useMemo(() => {
    return CALCULATORS_REGISTRY.filter((calc) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        calc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesUseCase = true;
      if (activeUseCase !== 'todos') {
        const selectedCase = USE_CASES.find((c) => c.id === activeUseCase);
        matchesUseCase = selectedCase?.calcIds ? selectedCase.calcIds.includes(calc.id) : true;
      }

      const matchesCategory =
        activeCategory === 'todas' || calc.category === activeCategory;

      return matchesSearch && matchesUseCase && matchesCategory;
    });
  }, [searchQuery, activeUseCase, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* 🇵🇪 HERO & SEARCH SECTION */}
      <section className="border-b border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-2xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-10">
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  PORTAL OFICIAL DEL PERÚ
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden sm:inline">
                  • 22 Calculadoras 100% Gratuitas
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
                ¿Qué necesitas calcular hoy?
              </h1>

              <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                Herramientas hechas a la medida de los negocios y familias peruanas: precios, sueldos, gratificaciones, horas extras, IGV 18%, combustible y préstamos.
              </p>

            </div>

            {/* Quick Live IGV Widget */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 shrink-0 max-w-xs hidden lg:block shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                  IGV Rápido (18%)
                </span>
                <span className="text-emerald-800 dark:text-emerald-400 font-mono font-bold">Base: S/ {quickAmount}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={quickAmount === 0 ? '' : quickAmount}
                  onChange={(e) => setQuickAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-700 font-mono"
                  placeholder="100"
                />
                <div className="flex-1 text-right">
                  <span className="text-[11px] text-slate-500 block">Total con IGV:</span>
                  <span className="text-sm font-black text-emerald-800 dark:text-emerald-400 font-mono">{formatCurrency(quickIgv.totalAmount)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Unified Fast Search Bar */}
          <div className="mt-8">
            <div className="relative flex items-center rounded-2xl border-2 border-slate-300/90 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 shadow-xs focus-within:border-emerald-700 dark:focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-700/10 transition-all">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                aria-label="Buscar calculadora..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeUseCase !== 'todos') setActiveUseCase('todos');
                }}
                placeholder="Busca por 'horas extras', 'sueldo neto', 'dividir cuenta', 'combustible', 'cts', 'recetas'..."
                className="ml-3 w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 🧭 GUIDED USE-CASE BUTTONS */}
      <section aria-label="Casos de uso" className="border-b border-slate-200/90 dark:border-slate-800/80 bg-slate-200/40 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <span>Explorar por necesidad:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {USE_CASES.map((uc) => {
              const isActive = activeUseCase === uc.id;
              const IconComp = uc.icon;
              return (
                <button
                  key={uc.id}
                  type="button"
                  onClick={() => {
                    setActiveUseCase(uc.id);
                    setActiveCategory('todas');
                  }}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    isActive
                      ? 'border-emerald-700 dark:border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/70 shadow-xs ring-1 ring-emerald-700 dark:ring-emerald-500'
                      : 'border-slate-300/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <IconComp className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-500'}`} />
                    {isActive && <Check className="h-4 w-4 text-emerald-800 dark:text-emerald-400" />}
                  </div>
                  <span className="text-xs font-bold leading-tight text-slate-900 dark:text-white">{uc.title}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-normal">
                    {uc.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 📦 DIRECTORY & CALCULATOR CARDS */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        
        {/* Category Pills Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0" role="tablist">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              const count = cat.id === 'todas'
                ? filteredCalculators.length
                : CALCULATORS_REGISTRY.filter(c => c.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (activeUseCase !== 'todos') setActiveUseCase('todos');
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-slate-800 text-slate-200 dark:bg-slate-200 dark:text-slate-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {filteredCalculators.length} calculadoras disponibles
          </div>
        </div>

        {/* CALCULATOR CARDS */}
        {filteredCalculators.length === 0 ? (
          <div className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center my-4 shadow-sm">
            <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No encontramos herramientas con esos filtros</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Prueba limpiando los filtros para ver las 22 calculadoras.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveUseCase('todos');
                setActiveCategory('todas');
              }}
              className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 cursor-pointer shadow-xs"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCalculators.map((calc) => {
              const catStyle = CATEGORY_STYLES[calc.category as keyof typeof CATEGORY_STYLES] || CATEGORY_STYLES.negocios;

              return (
                <Link
                  key={calc.id}
                  href={calc.slug}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm shadow-slate-900/5 hover:border-emerald-600 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-150"
                >
                  <div>
                    
                    {/* Card Top: Icon + Category Badge */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 dark:border-slate-800 transition-colors ${catStyle.iconBg}`}>
                          <DynamicIcon name={calc.icon} className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {calc.tag}
                        </span>
                      </div>

                      {calc.badge && (
                        <span className="rounded-md bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 text-[11px] font-extrabold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {calc.badge}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                      {calc.title}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-2">
                      {calc.description}
                    </p>

                    {/* Formula Preview Box */}
                    {calc.formulaSummary && (
                      <div className="mt-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/80 p-2.5 text-[11px] font-mono text-slate-600 dark:text-slate-300 line-clamp-1">
                        <span className="font-bold text-slate-400 not-mono mr-1">Fórmula:</span>
                        {calc.formulaSummary}
                      </div>
                    )}

                  </div>

                  {/* Card Footer Action */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 font-mono">
                      🇵🇪 {calc.category === 'tributario' ? 'SUNAT & Servicios' : calc.category === 'laboral' ? 'Planilla Perú' : 'En Soles (S/)'}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold group-hover:translate-x-0.5 transition-all ${catStyle.link}`}>
                      <span>Calcular</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </main>

      {/* 💡 FREQUENT USE-CASES */}
      <section aria-label="Guía práctica" className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-14 transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
              GUÍA PRÁCTICA DEL PERÚ
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              Herramientas diseñadas para la vida real en el Perú
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Cálculos confiables con base en normas de SUNAT, ley laboral y el día a día peruano:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/80 dark:bg-slate-950 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm mb-2">
                <Clock className="h-4 w-4 text-indigo-700 dark:text-indigo-400" />
                <h3>Horas Extras y Planilla</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Calcula la sobretasa del 25% y 35% por horas extras trabajadas, y el 100% de recargo si laboraste en domingos o feriados oficiales.
              </p>
              <Link href="/horas-extras" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 dark:text-indigo-400 mt-3 hover:underline">
                Calcular Horas Extras →
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/80 dark:bg-slate-950 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm mb-2">
                <Utensils className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <h3>Costeo Gastronómico y Recetas</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Calcula el costo por porción considerando merma de insumos, mano de obra y el precio de carta para ganar el margen que necesitas.
              </p>
              <Link href="/costeo-recetas" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-3 hover:underline">
                Costear Receta / Plato →
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/80 dark:bg-slate-950 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm mb-2">
                <Fuel className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                <h3>Viajes y Gasto de Gasolina</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Planifica tu presupuesto de viaje en carretera: galones necesarios, costo por kilómetro y división del gasto por pasajero.
              </p>
              <Link href="/gasto-combustible" className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 mt-3 hover:underline">
                Calcular Combustible →
              </Link>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
