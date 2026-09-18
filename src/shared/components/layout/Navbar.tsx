'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, Receipt, ArrowRight, Menu, X, Sparkles, KeyRound, User } from 'lucide-react';
import { CALCULATORS_REGISTRY, CATEGORIES, CalculatorCategory } from '@/features/calculators/registry';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { usePro } from '@/features/premium/context/ProContext';
import { trackSearchQuery } from '@/shared/components/analytics/NativeAnalyticsTracker';

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<CalculatorCategory | null>(null);
  const { isPro, openActivationModal, subscriberName, user, openAuthModal, openProfileModal } = usePro();

  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

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

  useEffect(() => {
    if (!isSearchOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeSearch();
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeSearch, isSearchOpen]);

  // Telemetry: Debounce-track user search intent after typing in quick search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    const timer = setTimeout(() => {
      trackSearchQuery(searchQuery);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navCategories = CATEGORIES.filter(c => c.id !== 'todas');

  const filteredCalculators = searchQuery.trim() === ''
    ? CALCULATORS_REGISTRY.slice(0, 8)
    : CALCULATORS_REGISTRY.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <>
      <header className="bg-[#0A1128] text-white sticky top-0 z-50 border-b border-slate-800">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center p-1.5 shadow-sm shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <rect x="7" y="5" width="10" height="4" fill="#38BDF8" stroke="none" />
                <circle cx="8" cy="13" r="1" fill="currentColor" />
                <circle cx="12" cy="13" r="1" fill="currentColor" />
                <circle cx="16" cy="13" r="1" fill="currentColor" />
                <circle cx="8" cy="17" r="1" fill="currentColor" />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
                <circle cx="16" cy="17" r="1" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight leading-none text-white">
                Calcula<span className="text-[#00C853]">Perú</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5 leading-none hidden sm:block">
                Calcula mejor, decide mejor.
              </span>
            </div>
          </Link>

          {/* Desktop Categories Navigation with Dropdowns */}
          <nav ref={dropdownRef} className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-200">
            {navCategories.map((cat) => {
              const isOpen = activeDropdown === cat.id;
              const calcsInCat = CALCULATORS_REGISTRY.filter(c => c.category === cat.id);

              return (
                <div key={cat.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : (cat.id as CalculatorCategory))}
                    className={`flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-2 ${
                      isOpen ? 'text-[#00C853] font-bold' : ''
                    }`}
                  >
                    <span>{cat.label}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180 text-[#00C853]' : 'text-slate-400'}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl dark:shadow-black/40 p-2 z-50 animate-in fade-in zoom-in-95 border border-slate-100 dark:border-slate-700">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800">
                        {cat.label} ({calcsInCat.length})
                      </div>
                      <div className="space-y-0.5">
                        {calcsInCat.map((calc) => (
                          <Link
                            key={calc.id}
                            href={calc.slug}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 hover:text-[#00875A] dark:hover:text-emerald-400 transition-colors group"
                          >
                            <span className="truncate">{calc.shortTitle}</span>
                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-[#00875A] dark:text-emerald-400 transition-opacity shrink-0" />
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
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-2 text-emerald-400 hover:text-emerald-300 font-bold"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              <span>Beneficios PRO</span>
            </Link>
          </nav>

          {/* Right Actions: PRO Button + Search + ThemeToggle + Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {isPro ? (
              <button
                type="button"
                onClick={openActivationModal}
                className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 text-white px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all shadow-sm shadow-emerald-950/20 hover:scale-[1.02] border border-amber-300/40 shrink-0 cursor-pointer"
                title="Tu suscripción PRO está activa. Haz clic para ver detalles o cerrar sesión"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-200 fill-amber-200 shrink-0 animate-pulse" />
                <span className="hidden sm:inline">PRO ACTIVO</span>
                <span className="sm:hidden text-xs font-black">PRO ✓</span>
                <span className="hidden md:inline text-[9px] bg-black/40 px-1.5 py-0.5 rounded font-black text-amber-200 uppercase tracking-wider">
                  VIP
                </span>
              </button>
            ) : (
              <Link
                href="/pro"
                className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 via-[#00875A] to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all shadow-sm shadow-emerald-950/20 hover:scale-[1.02] border border-emerald-400/30 shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300 shrink-0" />
                <span className="hidden sm:inline">CalculaPerú PRO</span>
                <span className="sm:hidden text-xs font-extrabold">PRO</span>
                <span className="hidden md:inline text-[9px] bg-emerald-950/70 px-1.5 py-0.5 rounded font-black text-emerald-300 uppercase tracking-wider">
                  PLAN
                </span>
              </Link>
            )}

            {/* Account Button (Login or Profile) */}
            {user ? (
              <button
                type="button"
                onClick={openProfileModal}
                className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer border border-slate-700 shrink-0"
                title={`Mi Cuenta: ${user.name}`}
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline truncate max-w-[85px]">{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer border border-slate-700/60 shrink-0"
                title="Iniciar sesión o crear cuenta"
              >
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar calculadora"
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Search className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </button>

            {/* Day / Night Animated Theme Switch */}
            <div className="hidden sm:flex items-center pl-1 border-l border-slate-800 shrink-0">
              <ThemeToggle />
            </div>

            {/* Mobile Hamburger Toggle - ALWAYS VISIBLE ON MOBILE */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-lg cursor-pointer shrink-0 flex items-center justify-center"
              aria-label="Menú"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-800 bg-[#0A1128] px-4 py-4 lg:hidden max-h-[80vh] overflow-y-auto space-y-4">
            {isPro ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openActivationModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-200 fill-amber-200" />
                  <span>CalculaPerú PRO ACTIVO ({subscriberName || 'VIP'})</span>
                </div>
                <span className="text-[10px] bg-black/40 text-amber-200 px-2 py-0.5 rounded font-black tracking-wider">
                  VER ESTADO →
                </span>
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/pro"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-600 via-[#00875A] to-teal-600 text-white text-xs font-bold shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300" />
                    <span>CalculaPerú PRO (Ilimitado)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950/60 text-emerald-200 px-2 py-0.5 rounded font-black tracking-wider">
                    VER PLANES →
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
                  <span>¿Ya tienes un código PRO? Activar aquí</span>
                </button>
              </div>
            )}

            {/* Mobile User Account Button */}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openProfileModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="font-bold block">{user.name}</span>
                    <span className="text-[10px] text-slate-400">{user.email}</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">MI PERFIL →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>Iniciar Sesión / Crear Cuenta</span>
              </button>
            )}

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-300 font-semibold">Tema (Día / Noche)</span>
              <ThemeToggle />
            </div>

            <div className="pb-3 border-b border-slate-800">
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
            </div>

            {navCategories.map((cat) => {
              const calcsInCat = CALCULATORS_REGISTRY.filter(c => c.category === cat.id);
              return (
                <div key={cat.id} className="pt-2">
                  <div className="text-xs font-bold uppercase text-[#00C853] mb-2">
                    {cat.label}
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {calcsInCat.map((calc) => (
                      <Link
                        key={calc.id}
                        href={calc.slug}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200"
                      >
                        {calc.shortTitle}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Quick Search Modal */}
      {isSearchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buscar calculadora"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch();
          }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100"
        >
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl dark:shadow-black/50 p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
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
                className="text-xs font-mono text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                ESC
              </button>
            </div>

            <div className="mt-3 max-h-80 overflow-y-auto space-y-1 dark:[color-scheme:dark]">
              {filteredCalculators.map((calc) => (
                <Link
                  key={calc.id}
                  href={calc.slug}
                  onClick={() => {
                    trackSearchQuery(searchQuery);
                    closeSearch();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#00875A] dark:group-hover:text-emerald-400">
                      {calc.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {calc.cardSummary || calc.description}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-[#00875A] dark:group-hover:text-emerald-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
