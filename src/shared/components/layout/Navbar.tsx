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
  Calculator,
  User,
} from 'lucide-react';
import {
  CALCULATORS_REGISTRY,
  CATEGORIES,
  CalculatorCategory,
} from '@/features/calculators/registry';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { usePro } from '@/features/premium/context/ProContext';
import { trackSearchQuery } from '@/shared/components/analytics/NativeAnalyticsTracker';
import { useModalAnimation } from '@/shared/hooks/useModalAnimation';

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { shouldRender: shouldRenderSearch, backdropClass: searchBackdropClass, modalClass: searchModalClass } = useModalAnimation(isSearchOpen);
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
      setIsScrolled(window.scrollY > 10);
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
        className={`sticky top-0 z-50 transition-colors duration-200 border-b ${
          isScrolled
            ? 'bg-[#0A1128]/95 backdrop-blur-md border-slate-800 shadow-md shadow-black/20'
            : 'bg-[#0A1128] border-slate-800/80'
        }`}
      >
        {/* Full-width container using navbar extremes */}
        <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10">
          
          {/* ========================================================================= */}
          {/* LEFT EXTREME: Minimalist Crisp Brand Logo */}
          {/* ========================================================================= */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center p-1.5 shadow-xs group-hover:border-emerald-500/60 transition-colors">
              <Calculator className="w-4 h-4 text-emerald-400 group-hover:scale-105 transition-transform" />
            </div>
            <span className="text-base sm:text-lg font-black tracking-tight text-white">
              Calcula<span className="text-[#00C853]">Perú</span>
            </span>
          </Link>

          {/* ========================================================================= */}
          {/* CENTER: Clean, Spaced Desktop Navigation */}
          {/* ========================================================================= */}
          <nav ref={dropdownRef} className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-medium text-slate-300">
            {navCategories.map((cat) => {
              const isOpen = activeDropdown === cat.id;
              const calcsInCat = CALCULATORS_REGISTRY.filter((c) => c.category === cat.id);

              return (
                <div key={cat.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : (cat.id as CalculatorCategory))}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      isOpen ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-150 ${
                        isOpen ? 'rotate-180 text-emerald-400' : 'text-slate-500'
                      }`}
                    />
                  </button>

                  {/* Clean, Lightweight Floating Dropdown */}
                  {isOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 rounded-2xl bg-[#0E1736] text-slate-100 shadow-2xl p-2 z-50 border border-slate-800 animate-in fade-in zoom-in-95 duration-100">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 mb-1 border-b border-slate-800/80">
                        {cat.label} ({calcsInCat.length})
                      </div>
                      <div className="space-y-0.5 max-h-72 overflow-y-auto">
                        {calcsInCat.map((calc) => (
                          <Link
                            key={calc.id}
                            href={calc.slug}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 text-xs text-slate-300 hover:text-white transition-colors group"
                          >
                            <span className="truncate">{calc.shortTitle}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href="/pro/beneficios"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/50 transition-colors font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Beneficios PRO</span>
            </Link>
          </nav>

          {/* ========================================================================= */}
          {/* RIGHT EXTREME: Actions nicely balanced without clutter */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Quick Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar calculadora (Ctrl+K)"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors text-xs cursor-pointer"
              title="Buscar (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden xl:inline text-slate-400">Buscar</span>
              <kbd className="hidden sm:inline-block text-[9px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <div className="hidden sm:flex items-center">
              <ThemeToggle />
            </div>

            {/* User Account / Login */}
            {user ? (
              <button
                type="button"
                onClick={openProfileModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={`Mi Cuenta: ${user.name}`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Entrar
              </button>
            )}

            {/* Clean PRO Button */}
            {isPro ? (
              <button
                type="button"
                onClick={openActivationModal}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold hover:bg-emerald-900/60 transition-colors cursor-pointer"
                title="Tu suscripción PRO está activa"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>PRO</span>
              </button>
            ) : (
              <Link
                href="/pro"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>PRO</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
              aria-label="Abrir Menú"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MOBILE MENU DRAWER: Lightweight & Responsive */}
        {/* ========================================================================= */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-800 bg-[#0A1128] px-4 py-4 lg:hidden max-h-[82vh] overflow-y-auto space-y-3">
            
            {/* Quick Search Tap */}
            <div
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs cursor-pointer"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Buscar calculadora...</span>
            </div>

            {/* PRO Link */}
            <Link
              href="/pro/beneficios"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Guía de Beneficios PRO</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
            </Link>

            {/* Category Accordions */}
            <div className="space-y-1.5">
              {navCategories.map((cat) => {
                const calcsInCat = CALCULATORS_REGISTRY.filter((c) => c.category === cat.id);
                const isExpanded = mobileExpandedCat === cat.id;

                return (
                  <div key={cat.id} className="rounded-xl bg-slate-900/80 border border-slate-800/80 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                      className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white text-left cursor-pointer"
                    >
                      <span>{cat.label}</span>
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
                            className="block p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                          >
                            {calc.shortTitle}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Theme Toggle on Mobile */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">Tema (Día / Noche)</span>
              <ThemeToggle />
            </div>

          </div>
        )}
      </header>

      {/* Global Quick Search Modal */}
      {shouldRenderSearch && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buscar calculadora"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch();
          }}
          className={`fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 bg-slate-950/70 backdrop-blur-xs p-4 ${searchBackdropClass}`}
        >
          <div className={`w-full max-w-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 ${searchModalClass}`}>

            
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Search className="h-4 w-4 text-emerald-500" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por 'sueldo', 'cts', 'dólar', 'igv'..."
                className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Cerrar búsqueda"
                className="text-xs font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                ESC
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
              {filteredCalculators.map((calc) => (
                <Link
                  key={calc.id}
                  href={calc.slug}
                  onClick={() => {
                    trackSearchQuery(searchQuery);
                    closeSearch();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {calc.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {calc.cardSummary || calc.description}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 shrink-0" />
                </Link>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
