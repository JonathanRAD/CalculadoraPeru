'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight, Menu, ChevronDown, Sparkles } from 'lucide-react';
import { CALCULATORS_REGISTRY, CATEGORIES, CalculatorCategory } from '@/features/calculators/registry';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { DynamicIcon } from '@/shared/components/ui/DynamicIcon';

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<CalculatorCategory | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const navCategories = CATEGORIES.filter(c => c.id !== 'todas');

  const filteredCalculators = searchQuery.trim() === ''
    ? CALCULATORS_REGISTRY.slice(0, 6)
    : CALCULATORS_REGISTRY.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors shadow-2xs">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 p-0.5 shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
              <Image
                src="/logo-calc.png"
                alt="CalculaPerú"
                width={36}
                height={36}
                className="h-full w-full object-contain rounded-lg"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Calcula<span className="text-emerald-700 dark:text-emerald-400">Perú</span>
                </span>
                <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.2 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  🇵🇪 PERÚ
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Categories Navigation with Dropdowns */}
          <nav ref={dropdownRef} className="hidden lg:flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-200">
            {navCategories.map((cat) => {
              const isOpen = activeDropdown === cat.id;
              const calcsInCat = CALCULATORS_REGISTRY.filter(c => c.category === cat.id);

              return (
                <div key={cat.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : (cat.id as CalculatorCategory))}
                    onMouseEnter={() => setActiveDropdown(cat.id as CalculatorCategory)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all cursor-pointer ${
                      isOpen
                        ? 'bg-slate-100 dark:bg-slate-800 text-emerald-800 dark:text-emerald-400'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180 text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`} />
                  </button>

                  {/* Dropdown Menu Popover */}
                  {isOpen && (
                    <div
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full left-0 mt-1.5 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl shadow-slate-900/10 dark:shadow-slate-950/50 animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                        {cat.label} ({calcsInCat.length})
                      </div>
                      <div className="space-y-0.5">
                        {calcsInCat.map((calc) => (
                          <Link
                            key={calc.id}
                            href={calc.slug}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 group transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                <DynamicIcon name={calc.icon} className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                                {calc.shortTitle}
                              </span>
                            </div>
                            {calc.badge && (
                              <span className="rounded bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:text-emerald-300">
                                {calc.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Actions: Search + ThemeToggle + Mobile Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar calculadora"
              className="flex items-center gap-2 rounded-xl border border-slate-300/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-700 dark:hover:border-emerald-500 transition-all cursor-pointer shadow-2xs"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <span className="hidden sm:inline">Buscar...</span>
              <kbd className="hidden sm:inline-block rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                /
              </kbd>
            </button>

            {/* Tactile Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

        </div>

        {/* Mobile Menu Drawer (Grouped by 4 Categories) */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 lg:hidden max-h-[80vh] overflow-y-auto space-y-4 shadow-xl">
            {navCategories.map((cat) => {
              const calcsInCat = CALCULATORS_REGISTRY.filter(c => c.category === cat.id);
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 px-2">
                    {cat.label}
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {calcsInCat.map((calc) => (
                      <Link
                        key={calc.id}
                        href={calc.slug}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300"
                      >
                        <div className="flex items-center gap-2">
                          <DynamicIcon name={calc.icon} className="h-4 w-4 text-slate-400" />
                          <span>{calc.shortTitle}</span>
                        </div>
                        {calc.badge && (
                          <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-slate-600 dark:text-slate-400">
                            {calc.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 pt-20 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4 py-3.5">
              <Search className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe lo que deseas calcular (ej: sueldo neto, igv, cts, precio)..."
                className="ml-3 flex-1 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none bg-transparent"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
                aria-label="Cerrar búsqueda"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCalculators.map((calc) => (
                <Link
                  key={calc.id}
                  href={calc.slug}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center justify-between rounded-xl p-3 hover:bg-emerald-50 dark:hover:bg-slate-800/80 group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                      <DynamicIcon name={calc.icon} className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {calc.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {calc.description}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-700 dark:group-hover:text-emerald-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
