'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  TrendingUp,
  Receipt,
  Store,
  Layers,
  Clock,
  Compass,
  Briefcase,
  Check,
  Utensils,
  Fuel,
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
    description: 'Catálogo de 25 calculadoras',
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
    description: 'Liquidación, sueldos, gratificación, CTS y horas extras',
    calcIds: ['liquidacion-laboral', 'sueldo-neto', 'gratificacion', 'calculadora-cts', 'horas-extras', 'calculadora-vacaciones'],
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
    description: 'Tipo de cambio, regímenes SUNAT, IGV 18% y luz',
    calcIds: ['tipo-de-cambio-dolar-sunat', 'regimenes-tributarios-sunat', 'calculadora-igv', 'recibo-por-honorarios', 'dividir-cuenta', 'gasto-combustible', 'consumo-electrico'],
  },
];

// Rich Tag Theming matching reference UI
const TAG_THEMES: Record<string, {
  iconBg: string;
  iconColor: string;
  tagColor: string;
  badgeStyle: string;
  btnStyle: string;
}> = {
  COMERCIAL: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-100 dark:border-emerald-900',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    tagColor: 'text-emerald-600 dark:text-emerald-400',
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    btnStyle: 'bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  RENTABILIDAD: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-100 dark:border-emerald-900',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    tagColor: 'text-emerald-600 dark:text-emerald-400',
    badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    btnStyle: 'bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  OFERTAS: {
    iconBg: 'bg-rose-50 dark:bg-rose-950/70 border-rose-100 dark:border-rose-900',
    iconColor: 'text-rose-500 dark:text-rose-400',
    tagColor: 'text-rose-600 dark:text-rose-400',
    badgeStyle: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    btnStyle: 'bg-rose-50/70 hover:bg-rose-100/90 text-rose-800 border-rose-200/80 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-800',
  },
  VENTAS: {
    iconBg: 'bg-sky-50 dark:bg-sky-950/70 border-sky-100 dark:border-sky-900',
    iconColor: 'text-sky-500 dark:text-sky-400',
    tagColor: 'text-sky-600 dark:text-sky-400',
    badgeStyle: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    btnStyle: 'bg-sky-50/70 hover:bg-sky-100/90 text-sky-800 border-sky-200/80 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 dark:text-sky-300 dark:border-sky-800',
  },
  PASARELAS: {
    iconBg: 'bg-purple-50 dark:bg-purple-950/70 border-purple-100 dark:border-purple-900',
    iconColor: 'text-purple-600 dark:text-purple-400',
    tagColor: 'text-purple-600 dark:text-purple-400',
    badgeStyle: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    btnStyle: 'bg-purple-50/70 hover:bg-purple-100/90 text-purple-800 border-purple-200/80 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 dark:text-purple-300 dark:border-purple-800',
  },
  GASTRONOMÍA: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/70 border-amber-100 dark:border-amber-900',
    iconColor: 'text-amber-600 dark:text-amber-400',
    tagColor: 'text-amber-600 dark:text-amber-400',
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    btnStyle: 'bg-amber-50/70 hover:bg-amber-100/90 text-amber-800 border-amber-200/80 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-300 dark:border-amber-800',
  },
  PLANILLA: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/70 border-amber-100 dark:border-amber-900',
    iconColor: 'text-amber-600 dark:text-amber-400',
    tagColor: 'text-amber-600 dark:text-amber-400',
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    btnStyle: 'bg-amber-50/70 hover:bg-amber-100/90 text-amber-800 border-amber-200/80 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-300 dark:border-amber-800',
  },
  BENEFICIOS: {
    iconBg: 'bg-teal-50 dark:bg-teal-950/70 border-teal-100 dark:border-teal-900',
    iconColor: 'text-teal-600 dark:text-teal-400',
    tagColor: 'text-teal-600 dark:text-teal-400',
    badgeStyle: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
    btnStyle: 'bg-teal-50/70 hover:bg-teal-100/90 text-teal-800 border-teal-200/80 dark:bg-teal-950/50 dark:hover:bg-teal-900/60 dark:text-teal-300 dark:border-teal-800',
  },
  SOBRETASA: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-100 dark:border-indigo-900',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    tagColor: 'text-indigo-600 dark:text-indigo-400',
    badgeStyle: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    btnStyle: 'bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-800',
  },
  DESCANSO: {
    iconBg: 'bg-blue-50 dark:bg-blue-950/70 border-blue-100 dark:border-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400',
    tagColor: 'text-blue-600 dark:text-blue-400',
    badgeStyle: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    btnStyle: 'bg-blue-50/70 hover:bg-blue-100/90 text-blue-800 border-blue-200/80 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 dark:border-blue-800',
  },
  SUNAT: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/70 border-amber-100 dark:border-amber-900',
    iconColor: 'text-amber-600 dark:text-amber-400',
    tagColor: 'text-amber-700 dark:text-amber-400',
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    btnStyle: 'bg-amber-50/70 hover:bg-amber-100/90 text-amber-800 border-amber-200/80 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-300 dark:border-amber-800',
  },
  FINANZAS: {
    iconBg: 'bg-blue-50 dark:bg-blue-950/70 border-blue-100 dark:border-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400',
    tagColor: 'text-blue-600 dark:text-blue-400',
    badgeStyle: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    btnStyle: 'bg-blue-50/70 hover:bg-blue-100/90 text-blue-800 border-blue-200/80 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 dark:border-blue-800',
  },
  METAS: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-100 dark:border-emerald-900',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    tagColor: 'text-emerald-600 dark:text-emerald-400',
    badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    btnStyle: 'bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  INVERSIÓN: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-100 dark:border-indigo-900',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    tagColor: 'text-indigo-600 dark:text-indigo-400',
    badgeStyle: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    btnStyle: 'bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-800',
  },
  CRÉDITO: {
    iconBg: 'bg-sky-50 dark:bg-sky-950/70 border-sky-100 dark:border-sky-900',
    iconColor: 'text-sky-600 dark:text-sky-400',
    tagColor: 'text-sky-600 dark:text-sky-400',
    badgeStyle: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    btnStyle: 'bg-sky-50/70 hover:bg-sky-100/90 text-sky-800 border-sky-200/80 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 dark:text-sky-300 dark:border-sky-800',
  },
  AHORRO: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-100 dark:border-emerald-900',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    tagColor: 'text-emerald-600 dark:text-emerald-400',
    badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    btnStyle: 'bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  VIAJES: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/70 border-amber-100 dark:border-amber-900',
    iconColor: 'text-amber-600 dark:text-amber-400',
    tagColor: 'text-amber-600 dark:text-amber-400',
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    btnStyle: 'bg-amber-50/70 hover:bg-amber-100/90 text-amber-800 border-amber-200/80 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-300 dark:border-amber-800',
  },
  SERVICIOS: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-100 dark:border-indigo-900',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    tagColor: 'text-indigo-600 dark:text-indigo-400',
    badgeStyle: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    btnStyle: 'bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-800',
  },
  DIARIO: {
    iconBg: 'bg-orange-50 dark:bg-orange-950/70 border-orange-100 dark:border-orange-900',
    iconColor: 'text-orange-600 dark:text-orange-400',
    tagColor: 'text-orange-600 dark:text-orange-400',
    badgeStyle: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
    btnStyle: 'bg-orange-50/70 hover:bg-orange-100/90 text-orange-800 border-orange-200/80 dark:bg-orange-950/50 dark:hover:bg-orange-900/60 dark:text-orange-300 dark:border-orange-800',
  },
  UTILIDAD: {
    iconBg: 'bg-purple-50 dark:bg-purple-950/70 border-purple-100 dark:border-purple-900',
    iconColor: 'text-purple-600 dark:text-purple-400',
    tagColor: 'text-purple-600 dark:text-purple-400',
    badgeStyle: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    btnStyle: 'bg-purple-50/70 hover:bg-purple-100/90 text-purple-800 border-purple-200/80 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 dark:text-purple-300 dark:border-purple-800',
  },
  DÓLAR: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-100 dark:border-emerald-900',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    tagColor: 'text-emerald-600 dark:text-emerald-400',
    badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    btnStyle: 'bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800',
  },
};

const DEFAULT_THEME = {
  iconBg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-100 dark:border-emerald-900',
  iconColor: 'text-emerald-600 dark:text-emerald-400',
  tagColor: 'text-emerald-600 dark:text-emerald-400',
  badgeStyle: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  btnStyle: 'bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800',
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
        calc.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    <div className="min-h-screen bg-[#eef2f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
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
                  • 25 Calculadoras 100% Gratuitas
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

      {/* 📦 DIRECTORY & CLEAN MINIMALIST CARDS */}
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

        {/* CALCULATOR CARDS (Clean Minimalist Style) */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalculators.map((calc) => {
              const theme = TAG_THEMES[calc.tag] || DEFAULT_THEME;

              return (
                <Link
                  key={calc.id}
                  href={calc.slug}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 shadow-sm shadow-slate-900/5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-150"
                >
                  <div>
                    
                    {/* Card Top: Large Rounded Icon + Tag + Badge */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform group-hover:scale-105 ${theme.iconBg} ${theme.iconColor}`}>
                          <DynamicIcon name={calc.icon} className="h-6 w-6" />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-wider ${theme.tagColor}`}>
                          {calc.tag}
                        </span>
                      </div>

                      {calc.badge && (
                        <span className={`rounded-xl px-2.5 py-0.5 text-[11px] font-extrabold border shadow-2xs ${theme.badgeStyle}`}>
                          {calc.badge}
                        </span>
                      )}
                    </div>

                    {/* Clean Title */}
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                      {calc.shortTitle}
                    </h2>

                    {/* Short 1-line description */}
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal line-clamp-2">
                      {calc.cardSummary || calc.description}
                    </p>

                  </div>

                  {/* Full-width Action Button Pill */}
                  <div className="mt-6">
                    <div className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all group-hover:shadow-xs ${theme.btnStyle}`}>
                      <span>Calcular</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
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
