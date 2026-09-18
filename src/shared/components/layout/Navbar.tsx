'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  KeyRound,
  User,
  Calculator,
  Briefcase,
  Store,
  Receipt,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  CALCULATORS_REGISTRY,
  CATEGORIES,
  CalculatorCategory,
  CalculatorMeta,
} from '@/features/calculators/registry';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { usePro } from '@/features/premium/context/ProContext';
import { trackSearchQuery } from '@/shared/components/analytics/NativeAnalyticsTracker';

const CATEGORY_META_ICONS: Record<string, React.ElementType> = {
  laboral: Briefcase,
  negocios: Store,
  tributario: Receipt,
  finanzas: TrendingUp,
};

const CATEGORY_HIGHLIGHTS: Record<string, { title: string; desc: string; href: string }> = {
  laboral: {
    title: 'Semáforo de Multas SUNAFIL',
    desc: 'Simula el riesgo por falta de depósito de CTS o liquidaciones con la UIT 2026.',
    href: '/calculadora-cts',
  },
  tributario: {
    title: 'Deducción de 3 UITs SUNAT',
    desc: 'Calcula el ahorro tributario en 4ta y 5ta categoría.',
    href: '/recibo-por-honorarios',
  },
  negocios: {
    title: 'Cotizador con WhatsApp',
    desc: 'Crea proformas con IGV y envíalas directo a tus clientes en 1 clic.',
    href: '/cotizador',
  },
  finanzas: {
    title: 'Punto de Equilibrio 2026',
    desc: 'Conoce cuántas ventas necesitas para cubrir tus costos fijos.',
    href: '/punto-de-equilibrio',
  },
};

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<CalculatorCategory | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);

  const { isPro, openActivationModal, subscriberName, user, openAuthModal, openProfileModal } = usePro();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
  }, []);

  // Listen for scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Ctrl+K / Cmd+K listener to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search on escape
  useEffect(() => {
    if (!isSearchOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeSearch();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeSearch, isSearchOpen]);

  // Telemetry: Debounce-track search query
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    const timer = setTimeout(() => {
      trackSearchQuery(searchQuery);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Don't show public navbar on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navCategories = CATEGORIES.filter((c) => c.id !== 'todas');

  const filteredCalculators =
    searchQuery.trim() === ''
      ? CALCULATORS_REGISTRY.slice(0, 8)
      : CALCULATORS_REGISTRY.filter(
          (c) =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
        );

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-250 ${
          isScrolled
            ? 'bg-[#0A1128]/90 backdrop-blur-xl shadow-xl shadow-black/20 border-b border-slate-800/80'
            : 'bg-[#0A1128] border-b border-slate-800/60'
        }`}
      >
        <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
          
          {/* Brand Logo & Live 2026 Badge */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex items-center justify-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <div className="w-full h-full bg-[#0A1128] rounded-[10px] flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                </div>
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  Calcula<span className="bg-gradient-to-r from-[#00C853] to-teal-300 bg-clip-text text-transparent">Perú</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-extrabold text-emerald-300 tracking-wider">
                  2026
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none hidden sm:block">
                Cálculos oficiales SUNAT & MTPE
              </span>
            </div>
          </Link>

          {/* Desktop Categories Navigation with Enhanced Mega Menu */}
          <nav ref={dropdownRef} className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-200">
            {navCategories.map((cat) => {
              const isOpen = activeDropdown === cat.id;
              const calcsInCat = CALCULATORS_REGISTRY.filter((c) => c.category === cat.id);
              const CatIcon = CATEGORY_META_ICONS[cat.id] || Calculator;
              const highlight = CATEGORY_HIGHLIGHTS[cat.id];

              return (
                <div key={cat.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : (cat.id as CalculatorCategory))}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                      isOpen
                        ? 'bg-slate-800 text-white font-bold'
                        : 'hover:bg-slate-800/60 hover:text-white text-slate-300'
                    }`}
                  >
                    <CatIcon className={`w-3.5 h-3.5 ${isOpen ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{cat.label}</span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {/* Mega Menu Dropdown */}
                  {isOpen && (
                    <div className="absolute left-0 top-full mt-2 w-[480px] rounded-2xl bg-white/95 dark:bg-[#0B132B]/95 text-slate-900 dark:text-slate-100 shadow-2xl dark:shadow-black/60 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl">
                      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                            <CatIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                            {cat.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {calcsInCat.length} herramientas
                        </span>
                      </div>

                      <div className="grid grid-cols-12 gap-3">
                        {/* Left Column: Calculator List */}
                        <div className="col-span-7 space-y-1 max-h-72 overflow-y-auto pr-1">
                          {calcsInCat.map((calc) => (
                            <Link
                              key={calc.id}
                              href={calc.slug}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group"
                            >
                              <div className="flex flex-col truncate pr-2">
                                <span className="font-bold truncate">{calc.shortTitle}</span>
                                <span className="text-[10px] text-slate-400 line-clamp-1">
                                  {calc.cardSummary || calc.tag}
                                </span>
                              </div>
                              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-emerald-600 dark:text-emerald-400 transition-opacity shrink-0" />
                            </Link>
                          ))}
                        </div>

                        {/* Right Column: Featured Callout */}
                        {highlight && (
                          <div className="col-span-5 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col justify-between text-left">
                            <div className="space-y-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[9px] uppercase tracking-wider inline-block">
                                Destacado PRO
                              </span>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                                {highlight.title}
                              </h4>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                                {highlight.desc}
                              </p>
                            </div>
                            <Link
                              href={highlight.href}
                              onClick={() => setActiveDropdown(null)}
                              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                            >
                              <span>Abrir herramienta</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Direct Link to Master Benefits Guide */}
            <Link
              href="/pro/beneficios"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-emerald-400 hover:text-white hover:bg-slate-800/60 transition-all font-bold group"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300 group-hover:scale-110 transition-transform" />
              <span>Guía PRO</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold border border-emerald-500/30">
                Nuevo
              </span>
            </Link>
          </nav>

          {/* Right Actions: PRO CTA, Quick Search, Account & Theme */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Quick Search Button (with Cmd+K badge) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar calculadora (Ctrl+K)"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-all cursor-pointer shadow-2xs group"
              title="Buscar calculadora (Ctrl + K)"
            >
              <Search className="h-3.5 w-3.5 text-emerald-400 group-hover:text-emerald-300" />
              <span className="text-xs text-slate-300 hidden xl:inline">Buscar...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-slate-400 border border-slate-700">
                <span>⌘</span>K
              </kbd>
            </button>

            {/* PRO CTA Button */}
            {isPro ? (
              <button
                type="button"
                onClick={openActivationModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 text-emerald-300 px-3 py-1.5 text-xs font-bold border border-emerald-500/40 shadow-sm transition-all hover:bg-emerald-500/30 cursor-pointer"
                title="Tu suscripción PRO está activa"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
                <span className="hidden sm:inline">PRO ACTIVO</span>
                <span className="sm:hidden text-xs font-black">PRO ✓</span>
                <span className="hidden md:inline text-[9px] bg-black/40 px-1.5 py-0.5 rounded font-black text-amber-200 uppercase tracking-wider">
                  VIP
                </span>
              </button>
            ) : (
              <Link
                href="/pro"
                className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-[#00875A] to-teal-600 p-px font-bold text-white shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.02] hover:shadow-emerald-600/20 shrink-0"
              >
                <div className="relative flex items-center gap-1.5 rounded-[11px] bg-gradient-to-r from-emerald-600 via-[#00875A] to-teal-700 px-3 py-1.5 text-xs transition-colors">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300 shrink-0" />
                  <span className="hidden sm:inline">CalculaPerú PRO</span>
                  <span className="sm:hidden text-xs font-black">PRO</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-emerald-300 text-[9px] font-black border border-emerald-400/30">
                    S/ 16
                  </span>
                </div>
              </Link>
            )}

            {/* Account Button (Login or Profile) */}
            {user ? (
              <button
                type="button"
                onClick={openProfileModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer border border-slate-700 shrink-0"
                title={`Mi Cuenta: ${user.name}`}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#00875A] to-emerald-400 text-white font-black flex items-center justify-center text-[10px] shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline truncate max-w-[85px]">{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer border border-slate-700/70 shrink-0"
                title="Iniciar sesión o crear cuenta"
              >
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            {/* Day / Night Theme Switch */}
            <div className="hidden sm:flex items-center pl-1 border-l border-slate-800 shrink-0">
              <ThemeToggle />
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl cursor-pointer shrink-0 flex items-center justify-center transition-colors"
              aria-label="Abrir Menú"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Menu Drawer with Smooth Transitions */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-800/80 bg-[#0A1128]/95 backdrop-blur-2xl px-4 py-4 lg:hidden max-h-[82vh] overflow-y-auto space-y-4 animate-in slide-in-from-top-2 duration-150">
            
            {/* Quick Search on Mobile */}
            <div
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs cursor-pointer"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Buscar entre 25 calculadoras...</span>
            </div>

            {/* PRO Banner in Mobile */}
            {isPro ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openActivationModal();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-white text-xs font-bold shadow-md cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300" />
                  <span>CalculaPerú PRO ACTIVO ({subscriberName || 'VIP'})</span>
                </div>
                <span className="text-[10px] bg-black/40 text-amber-200 px-2 py-0.5 rounded font-black tracking-wider">
                  ESTADO →
                </span>
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/pro"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-[#00875A] to-teal-600 text-white text-xs font-bold shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300" />
                    <span>CalculaPerú PRO (S/ 16 / mes)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-200 px-2.5 py-0.5 rounded font-black tracking-wider">
                    PLANES →
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openActivationModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>¿Ya tienes un código PRO? Canjear aquí</span>
                </button>
              </div>
            )}

            {/* Mobile User Profile Button */}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openProfileModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00875A] to-emerald-400 text-white font-black flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="font-bold block">{user.name}</span>
                    <span className="text-[10px] text-slate-400">{user.email}</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">Mi Cuenta →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold text-xs"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>Iniciar Sesión / Registrarme</span>
              </button>
            )}

            {/* Direct Link to Master Benefits Guide on Mobile */}
            <Link
              href="/pro/beneficios"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300 shrink-0" />
                <span>Guía Maestra de Beneficios PRO</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
            </Link>

            {/* Theme Toggle on Mobile */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-300 font-semibold">Tema de color</span>
              <ThemeToggle />
            </div>

            {/* Accordion Categories on Mobile */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-1">
                Explorar Calculadoras
              </div>
              {navCategories.map((cat) => {
                const calcsInCat = CALCULATORS_REGISTRY.filter((c) => c.category === cat.id);
                const isExpanded = mobileExpandedCat === cat.id;
                const CatIcon = CATEGORY_META_ICONS[cat.id] || Calculator;

                return (
                  <div key={cat.id} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                      className="w-full flex items-center justify-between p-3 text-xs font-bold text-white text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <CatIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{cat.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                        <span>{calcsInCat.length}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-2 pt-0 space-y-0.5 border-t border-slate-800/60">
                        {calcsInCat.map((calc) => (
                          <Link
                            key={calc.id}
                            href={calc.slug}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                          >
                            <span>{calc.shortTitle}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </header>

      {/* Global Quick Search Modal with Ctrl+K support */}
      {isSearchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buscar calculadora"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch();
          }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Search className="h-5 w-5 text-emerald-500" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por 'horas extras', 'sueldo', 'cts', 'dólar', 'igv'..."
                className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
              />
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Cerrar búsqueda"
                className="text-xs font-mono text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ESC
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
              {filteredCalculators.map((calc) => (
                <Link
                  key={calc.id}
                  href={calc.slug}
                  onClick={() => {
                    trackSearchQuery(searchQuery);
                    closeSearch();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-2">
                      <span>{calc.title}</span>
                      <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold">
                        {calc.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {calc.cardSummary || calc.description}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Presiona <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">ESC</kbd> para salir</span>
              <span>{CALCULATORS_REGISTRY.length} calculadoras disponibles</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
