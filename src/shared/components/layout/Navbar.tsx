'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Search,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
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

  const { isPro, openActivationModal, user, openAuthModal, openProfileModal } = usePro();
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
        className={`sticky top-0 z-50 border-b bg-[#F4F1EA] dark:bg-[#121820] ${
          isScrolled ? 'border-slate-900 dark:border-slate-500' : 'border-stone-300 dark:border-slate-700'
        }`}
      >
        {/* Full-width container using navbar extremes */}
        <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10">
          
          {/* ========================================================================= */}
          {/* LEFT EXTREME: Minimalist Crisp Brand Logo */}
          {/* ========================================================================= */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <Image
              src="/calculaperu-icon-192.png"
              alt=""
              width={36}
              height={36}
              priority
              className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Calcula<span className="text-brand-700 dark:text-[#00c853]">Perú</span>
            </span>
          </Link>

          {/* ========================================================================= */}
          {/* CENTER: Clean, Spaced Desktop Navigation */}
          {/* ========================================================================= */}
          <nav ref={dropdownRef} className="hidden xl:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            {navCategories.map((cat) => {
              const isOpen = activeDropdown === cat.id;
              const calcsInCat = CALCULATORS_REGISTRY.filter((c) => c.category === cat.id);

              return (
                <div key={cat.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : (cat.id as CalculatorCategory))}
                    className={`flex min-h-10 items-center gap-1 px-3 py-2 rounded transition-colors cursor-pointer ${
                      isOpen
                        ? 'text-slate-900 bg-stone-200 dark:text-white dark:bg-slate-800'
                        : 'hover:text-slate-900 hover:bg-stone-200/70 dark:hover:text-white dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="whitespace-nowrap">{cat.label.split(" ")[0]}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-150 ${
                        isOpen ? 'rotate-180 text-brand-700 dark:text-brand-400' : 'text-slate-500'
                      }`}
                    />
                  </button>

                  {/* Clean, Lightweight Floating Dropdown */}
                  {isOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 rounded-lg bg-white dark:bg-[#18202A] text-slate-900 dark:text-slate-100 shadow-lg p-2 z-50 border border-stone-300 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-100">
                      <div className="text-[13px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 px-3 py-1 mb-1 border-b border-stone-300 dark:border-slate-700">
                        {cat.label} ({calcsInCat.length})
                      </div>
                      <div className="space-y-0.5 max-h-72 overflow-y-auto">
                        {calcsInCat.map((calc) => (
                          <Link
                            key={calc.id}
                            href={calc.slug}
                            onClick={() => setActiveDropdown(null)}
                            className="flex min-h-10 items-center justify-between px-2 py-2 rounded hover:bg-stone-100 dark:hover:bg-slate-800/80 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group"
                          >
                            <span className="truncate">{calc.shortTitle}</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-brand-700 dark:text-brand-400 transition-opacity shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href="/guias"
              className="flex min-h-10 items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded text-slate-700 dark:text-slate-200 hover:text-slate-900 hover:bg-stone-200/70 dark:hover:text-white dark:hover:bg-slate-800/50 transition-colors font-semibold"
            >
              <span>Guías</span>
            </Link>

            <Link
              href="/pro/beneficios"
              className="flex min-h-10 items-center gap-1.5 px-3 py-2 rounded text-brand-700 dark:text-brand-400 hover:bg-stone-200/70 dark:hover:bg-slate-800/50 transition-colors font-semibold"
            >
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
              aria-label="Buscar (Ctrl + K)"
              className="hidden sm:flex min-h-10 items-center gap-2 px-3 py-2 rounded bg-white dark:bg-slate-900 hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-stone-300 dark:border-slate-700 transition-colors text-sm cursor-pointer"
              title="Buscar (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-slate-600 dark:text-slate-400" aria-hidden="true" />
              <span className="hidden xl:inline">Buscar</span>
              <kbd aria-hidden="true" className="hidden sm:inline-block text-[13px] font-mono text-slate-700 dark:text-slate-200 bg-stone-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-xs border border-stone-300 dark:border-slate-600">
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
                className="flex min-h-10 items-center gap-1.5 px-3 py-2 rounded text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-stone-200/70 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={`Mi Cuenta: ${user.name}`}
              >
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-[13px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="min-h-10 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded hover:bg-stone-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Entrar
              </button>
            )}

            {/* Clean PRO Button */}
            {isPro ? (
              <button
                type="button"
                onClick={openActivationModal}
                className="flex min-h-10 items-center gap-1 px-4 py-2 rounded border border-brand-600 text-brand-700 dark:text-brand-400 text-sm font-semibold hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors cursor-pointer"
                title="Tu suscripción PRO está activa"
              >
                <span>PRO activo</span>
              </button>
            ) : (
              <Link
                href="/pro"
                className="flex min-h-10 items-center gap-1.5 px-4 py-2 rounded bg-brand-600 hover:bg-brand-800 text-white text-sm font-semibold transition-colors"
              >
                <span>PRO</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden flex h-10 w-10 items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800 rounded cursor-pointer transition-colors"
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
          <div className="border-t border-stone-300 dark:border-slate-700 bg-[#F4F1EA] dark:bg-[#121820] px-4 py-4 xl:hidden max-h-[82vh] overflow-y-auto space-y-3">
            
            {/* Quick Search Tap */}
            <div
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="flex min-h-11 items-center gap-2.5 px-3 rounded bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Buscar calculadora...</span>
            </div>

            {/* PRO Link */}
            <Link
              href="/pro/beneficios"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex min-h-11 items-center justify-between px-3 rounded border border-brand-600 text-brand-700 dark:text-brand-400 text-sm font-semibold"
            >
              <span>Beneficios PRO</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Category Accordions */}
            <div className="space-y-1.5">
              {navCategories.map((cat) => {
                const calcsInCat = CALCULATORS_REGISTRY.filter((c) => c.category === cat.id);
                const isExpanded = mobileExpandedCat === cat.id;

                return (
                  <div key={cat.id} className="rounded bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                      className="w-full flex min-h-11 items-center justify-between px-3 text-sm font-semibold text-slate-900 dark:text-white text-left cursor-pointer"
                    >
                      <span>{cat.label}</span>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[13px]">
                        <span>{calcsInCat.length}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-2 pt-2 space-y-0.5 border-t border-stone-300 dark:border-slate-700">
                        {calcsInCat.map((calc) => (
                          <Link
                            key={calc.id}
                            href={calc.slug}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block min-h-11 px-2 py-2.5 rounded hover:bg-stone-100 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
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
            <div className="flex items-center justify-between px-3 py-2 rounded bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700">
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Tema (Día / Noche)</span>
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
          <div className={`w-full max-w-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg shadow-lg p-4 border border-slate-200 dark:border-slate-800 space-y-3 ${searchModalClass}`}>

            
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Search className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por 'sueldo', 'cts', 'dólar', 'igv'..."
                className="w-full bg-transparent text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Cerrar búsqueda"
                className="text-[13px] font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-2"
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
                  className="flex min-h-11 items-center justify-between px-3 py-2 rounded hover:bg-stone-100 dark:hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-700 dark:group-hover:text-brand-400">
                      {calc.title}
                    </div>
                    <div className="text-[13px] text-slate-600 dark:text-slate-400 truncate">
                      {calc.cardSummary || calc.description}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-brand-700 shrink-0" />
                </Link>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
