'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Tag,
  TrendingUp,
  Scale,
  Percent,
  Zap,
  User,
  Clock,
  MapPin,
  CheckCircle2,
  BookOpen,
  Edit3,
  Store,
  Building2,
  Briefcase,
} from 'lucide-react';
import { CALCULATORS_REGISTRY, CATEGORIES } from '@/features/calculators/registry';
import { calculateNetSalary, PensionSystem } from '@/core/calculators/payroll';
import { formatCurrency } from '@/core/math/formatters';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 💼 Hero Interactive Calculator State
  const [grossSalary, setGrossSalary] = useState<number>(3000);
  const [pensionSystem, setPensionSystem] = useState<'onp' | 'afp'>('afp');
  const [afpProvider, setAfpProvider] = useState<PensionSystem>('afp_prima');
  const [showExtras, setShowExtras] = useState<boolean>(false);
  const [hasDependents, setHasDependents] = useState<boolean>(false);

  // Live calculation
  const payrollResult = useMemo(() => {
    const system: PensionSystem = pensionSystem === 'onp' ? 'onp' : afpProvider;
    return calculateNetSalary({
      grossSalary: grossSalary,
      pensionSystem: system,
      hasDependents: hasDependents,
    });
  }, [grossSalary, pensionSystem, afpProvider, hasDependents]);

  const filteredCalculators = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLocaleLowerCase('es-PE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (!query) return CALCULATORS_REGISTRY;

    return CALCULATORS_REGISTRY.filter((calculator) => {
      const searchableText = [
        calculator.title,
        calculator.shortTitle,
        calculator.description,
        calculator.category,
        ...calculator.keywords,
      ]
        .join(' ')
        .toLocaleLowerCase('es-PE')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return searchableText.includes(query);
    });
  }, [searchQuery]);

  // Main 6 Highlighted Calculators (Matching Screenshot)
  const MAIN_CALCULATORS = [
    {
      title: 'Precio de venta',
      desc: 'Define el precio ideal de tu producto o servicio.',
      slug: '/precio-de-venta',
      icon: Tag,
      iconBg: 'bg-[#00875A]',
      arrowColor: 'text-[#00875A]',
    },
    {
      title: 'Margen de ganancia',
      desc: 'Calcula tu margen y mejora tu rentabilidad.',
      slug: '/margen-de-ganancia',
      icon: TrendingUp,
      iconBg: 'bg-[#0052CC]',
      arrowColor: 'text-[#0052CC]',
    },
    {
      title: 'Punto de equilibrio',
      desc: 'Descubre cuánto debes vender para no perder ni ganar.',
      slug: '/punto-de-equilibrio',
      icon: Scale,
      iconBg: 'bg-[#6554C0]',
      arrowColor: 'text-[#6554C0]',
    },
    {
      title: 'IGV 18%',
      desc: 'Calcula IGV, precios con y sin impuestos fácilmente.',
      slug: '/calculadora-igv',
      icon: Percent,
      iconBg: 'bg-[#FF5630]',
      arrowColor: 'text-[#FF5630]',
    },
    {
      title: 'Consumo eléctrico',
      desc: 'Estima el costo de tus artefactos y consumo de energía.',
      slug: '/consumo-electrico',
      icon: Zap,
      iconBg: 'bg-[#FFAB00]',
      arrowColor: 'text-[#FFAB00]',
    },
    {
      title: 'Sueldo neto',
      desc: 'Calcula tu sueldo neto según leyes laborales vigentes.',
      slug: '/sueldo-neto',
      icon: User,
      iconBg: 'bg-[#00B8D9]',
      arrowColor: 'text-[#00B8D9]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 transition-colors">

      {/* 🏔️ HERO SECTION WITH MACHU PICCHU BACKGROUND & INTERACTIVE CALCULATOR */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#EBF3FA] via-[#F0F6FC] to-[#F7FAFD] dark:from-[#0B132B] dark:via-[#101B3D] dark:to-[#0E1736] border-b border-slate-200 dark:border-slate-800">

        {/* Machu Picchu Background Image positioned on the right */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 z-0 pointer-events-none opacity-40 lg:opacity-75">
          <Image
            src="/machu_pichu.jpg"
            alt="Machu Picchu Perú"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
            className="object-cover object-center"
          />
          {/* Soft gradient fade from left to right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#EBF3FA] via-[#EBF3FA]/90 lg:via-[#EBF3FA]/60 to-transparent dark:from-[#0B132B] dark:via-[#0B132B]/90 dark:lg:via-[#0B132B]/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#EBF3FA] via-transparent to-transparent dark:from-[#0B132B] lg:hidden" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

            {/* LEFT COLUMN: TITLE, SEARCH, AND SOCIAL PROOF */}
            <div className="lg:col-span-6 space-y-6">

              <h1 className="text-3xl sm:text-5xl font-black text-[#0A1128] dark:text-white tracking-tight leading-[1.12]">
                Todas las calculadoras <br />
                que necesitas, en un solo lugar
              </h1>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
                Herramientas <strong>100% gratuitas</strong> adaptadas a parámetros publicados por SUNAT, MTPE, SBS y BCRP.
              </p>

              {/* Big Search Bar */}
              <div className="pt-2 max-w-xl">
                <div className="flex items-center bg-white dark:bg-[#0E1736] rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3.5 shadow-sm focus-within:border-[#00875A] focus-within:ring-2 focus-within:ring-[#00875A]/20 transition-all">
                  <Search className="h-5 w-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar calculadora (ej. IGV, sueldo neto, ROI...)"
                    className="ml-3 w-full bg-transparent text-sm sm:text-base font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {searchQuery.trim() && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E1736] shadow-lg" role="listbox" aria-label="Resultados de búsqueda">
                    {filteredCalculators.length > 0 ? (
                      filteredCalculators.slice(0, 6).map((calculator) => (
                        <Link
                          key={calculator.id}
                          href={calculator.slug}
                          className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-3 text-sm last:border-0 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                          <span>
                            <strong className="block text-slate-900 dark:text-white">{calculator.shortTitle}</strong>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{calculator.cardSummary}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-[#00875A]" />
                        </Link>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">No encontramos una calculadora con ese término.</p>
                    )}
                  </div>
                )}

                {/* Búsquedas Populares */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Búsquedas populares:</span>
                  {[
                    { label: 'Sueldo neto', slug: '/sueldo-neto' },
                    { label: 'IGV 18%', slug: '/calculadora-igv' },
                    { label: 'CTS', slug: '/calculadora-cts' },
                    { label: 'Liquidación', slug: '/liquidacion-laboral' },
                  ].map((tag) => (
                    <Link
                      key={tag.label}
                      href={tag.slug}
                      className="px-2.5 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-medium transition-colors"
                    >
                      {tag.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Social Proof & Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white font-bold text-xs">👨🏻</div>
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white font-bold text-xs">👩🏻</div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white font-bold text-xs">👨🏽</div>
                  </div>
                  <div>
                    <strong className="font-bold text-slate-900 dark:text-white">{CALCULATORS_REGISTRY.length} herramientas</strong> gratuitas <br />
                    para decisiones cotidianas y de negocio.
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/80 dark:bg-[#0E1736]/85 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <ShieldCheck className="h-5 w-5 text-[#00875A] shrink-0" />
                  <div>
                    <strong className="font-bold text-slate-900 dark:text-white">Información segura</strong> <br />
                    y sin registro.
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: HERO FEATURED INTERACTIVE CALCULATOR (SUELDO NETO) */}
            <div className="lg:col-span-6">
              <div className="bg-white dark:bg-[#0E1736] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-7 max-w-lg mx-auto lg:ml-auto">

                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#00875A] text-white flex items-center justify-center shadow-xs">
                      <span className="font-bold text-sm">S/</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block leading-tight">
                        Calculadora destacada
                      </span>
                      <span className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        Sueldo neto mensual
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/sueldo-neto"
                    className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                  >
                    <span>Ver calculadora completa</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* Form Fields */}
                <div className="space-y-3.5 text-xs">

                  {/* Row 1: Remuneración Bruta */}
                  <div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                        Remuneración bruta mensual
                      </label>
                      <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-slate-50/50 dark:bg-slate-950/50 focus-within:border-[#00875A] focus-within:bg-white dark:focus-within:bg-slate-950 transition-all">
                        <span className="font-mono text-slate-500 dark:text-slate-400 mr-2">S/</span>
                        <input
                          type="number"
                          step="100"
                          value={grossSalary}
                          onChange={(e) => setGrossSalary(Number(e.target.value) || 0)}
                          className="w-full bg-transparent font-mono font-bold text-slate-900 dark:text-white text-sm outline-none"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Row 2: Sistema Pensionario & AFP Select */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                        Sistema pensionario
                      </label>
                      <div className="flex items-center gap-4 py-1.5">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                          <input
                            type="radio"
                            name="hero_pension"
                            checked={pensionSystem === 'onp'}
                            onChange={() => setPensionSystem('onp')}
                            className="accent-[#00875A]"
                          />
                          <span>ONP</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                          <input
                            type="radio"
                            name="hero_pension"
                            checked={pensionSystem === 'afp'}
                            onChange={() => setPensionSystem('afp')}
                            className="accent-[#00875A]"
                          />
                          <span>AFP</span>
                        </label>
                      </div>
                    </div>

                    {pensionSystem === 'afp' ? (
                      <div>
                        <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                          AFP
                        </label>
                        <select
                          value={afpProvider}
                          onChange={(e) => setAfpProvider(e.target.value as PensionSystem)}
                          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white font-semibold text-xs outline-none cursor-pointer"
                        >
                          <option value="afp_prima">Prima AFP</option>
                          <option value="afp_integra">AFP Integra</option>
                          <option value="afp_profuturo">Profuturo AFP</option>
                          <option value="afp_habitat">Habitat AFP</option>
                        </select>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-3">
                        Tasa única nacional 13.0%
                      </div>
                    )}
                  </div>

                  {/* Extra Toggle Link */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowExtras(!showExtras)}
                      className="text-[#0052CC] dark:text-sky-400 hover:underline font-semibold text-xs cursor-pointer"
                    >
                      + Agregar asignación familiar
                    </button>
                    {showExtras && (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasDependents}
                            onChange={(e) => setHasDependents(e.target.checked)}
                            className="accent-[#00875A]"
                          />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">Tiene asignación familiar (+S/ 113.00)</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Results Box */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2">
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Tu sueldo neto estimado</span>
                        <span className="font-mono text-2xl sm:text-3xl font-black text-[#00875A]">
                          {formatCurrency(payrollResult.netSalary)}
                        </span>
                      </div>

                      <div className="flex sm:flex-col gap-4 sm:gap-1 text-[11px] text-slate-600 dark:text-slate-300 sm:text-right">
                        <div>
                          <span className="text-slate-400">Aportes del trabajador:</span>{' '}
                          <strong className="font-mono text-slate-800 dark:text-slate-100">
                            {formatCurrency(payrollResult.pensionDeduction + payrollResult.fifthCategoryTaxMonthly)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Aportes del empleador:</span>{' '}
                          <strong className="font-mono text-slate-800 dark:text-slate-100">
                            {formatCurrency(payrollResult.essaludContributionEmployer)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Big Green CTA Button */}
                  <Link
                    href="/sueldo-neto"
                    className="w-full py-3 rounded-lg bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Calcular sueldo neto</span>
                  </Link>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🌟 SECTION 2: CALCULADORAS PRINCIPALES (6 CARDS GRID) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Calculadoras principales
          </h2>
          <Link
            href="/#todas-las-calculadoras"
            className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
          >
            <span>Ver todas las calculadoras</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {MAIN_CALCULATORS.map((item) => {
            const IconComp = item.icon;
            return (
              <Link
                key={item.title}
                href={item.slug}
                className="bg-white dark:bg-[#0E1736] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-8 h-8 rounded-lg ${item.iconBg} text-white flex items-center justify-center mb-3 shadow-2xs`}>
                    <IconComp className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#00875A] dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-3 text-right">
                  <ArrowRight className={`h-3.5 w-3.5 inline-block ${item.arrowColor} transition-transform group-hover:translate-x-1`} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 🇵🇪 SECTION 3: VALUE PROPS HORIZONTAL BAR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <div className="bg-white dark:bg-[#0E1736] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">Datos actualizados</strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">Parámetros y tasas actualizados constantemente.</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">Parámetros oficiales</strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">Basados en SUNAT, MTPE, SBS y otras entidades.</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-700 dark:text-rose-300 shrink-0">
              <span className="font-bold text-sm">🇵🇪</span>
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">Hecho en Perú</strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">Diseñado para la realidad empresarial peruana.</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-300 shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 dark:text-white block">+ 25 herramientas</strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">Para empresas, emprendedores y profesionales.</span>
            </div>
          </div>

        </div>
      </section>

      {/* 📊 SECTION 4: ¿POR QUÉ ELEGIR CALCULAPERÚ? & PARÁMETROS ACTUALES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: ¿Por qué elegir CalculaPerú? */}
          <div className="lg:col-span-6 bg-white dark:bg-[#0E1736] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">
              ¿Por qué elegir CalculaPerú?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#00875A] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <strong className="font-bold text-slate-900 dark:text-white block">Rápido y fácil</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Resultados al instante con una experiencia simple e intuitiva.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <strong className="font-bold text-slate-900 dark:text-white block">Contexto peruano</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Calculadoras adaptadas a nuestras leyes, tasas y normas locales.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <strong className="font-bold text-slate-900 dark:text-white block">Resultados confiables</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Fórmulas con fuentes identificadas y pruebas automatizadas de regresión.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <strong className="font-bold text-slate-900 dark:text-white block">Contenido útil</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Guías, ejemplos y tips para tomar mejores decisiones.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Parámetros y tasas actuales */}
          <div className="lg:col-span-6 bg-white dark:bg-[#0E1736] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Parámetros y tasas actuales
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Actualizado al 2026
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center mb-5">
                <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">IGV</span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-[#00875A] dark:text-emerald-400">18%</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">Tasa vigente</span>
                </div>

                <div className="bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 block uppercase">UIT 2026</span>
                  <span className="font-mono text-lg sm:text-xl font-black text-sky-900 dark:text-sky-200">S/ 5,500</span>
                  <span className="text-[10px] text-sky-700 dark:text-sky-400 block mt-0.5">Valor oficial</span>
                </div>

                <div className="bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 block uppercase leading-tight">Asignación familiar</span>
                  <span className="font-mono text-lg sm:text-xl font-black text-purple-900 dark:text-purple-200">S/ 113.00</span>
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 block mt-0.5">Monto mensual</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-sky-700 dark:text-sky-400">
              <Link href="/regimenes-tributarios-sunat" className="hover:underline flex items-center gap-1">
                <span>Ver todos los parámetros</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link href="/cotizador" className="hover:underline flex items-center gap-1">
                <Edit3 className="h-3 w-3" />
                <span>Sugerir calculadora</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 📚 SECTION 5: COMPLETE DIRECTORY OF ALL 25 TOOLS */}
      <section id="todas-las-calculadoras" className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Catálogo completo de las {CALCULATORS_REGISTRY.length} calculadoras
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Explora todas las herramientas clasificadas por rubro.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.filter(c => c.id !== 'todas').map((cat) => {
            const calcs = filteredCalculators.filter(c => c.category === cat.id);
            return (
              <div key={cat.id} className="bg-white dark:bg-[#0E1736] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>{cat.label}</span>
                  <span className="text-xs font-mono text-slate-400">({calcs.length})</span>
                </h3>
                <ul className="space-y-2">
                  {calcs.map((calc) => (
                    <li key={calc.id}>
                      <Link
                        href={calc.slug}
                        className="text-xs text-slate-600 dark:text-slate-300 hover:text-[#00875A] dark:hover:text-emerald-400 font-medium transition-colors flex items-center justify-between group"
                      >
                        <span className="truncate">{calc.shortTitle}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        {filteredCalculators.length === 0 && (
          <p className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1736] p-5 text-center text-sm text-slate-600 dark:text-slate-300">
            No hay resultados para “{searchQuery}”. Prueba con IGV, sueldo, CTS o préstamos.
          </p>
        )}
      </section>

    </div>
  );
}
