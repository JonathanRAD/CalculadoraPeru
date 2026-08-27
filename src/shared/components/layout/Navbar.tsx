'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight, Menu } from 'lucide-react';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredCalculators = searchQuery.trim() === ''
    ? CALCULATORS_REGISTRY.slice(0, 6)
    : CALCULATORS_REGISTRY.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors shadow-2xs">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          
          {/* Logo & Brand */}
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

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/" className="text-slate-900 dark:text-white font-bold hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
              Inicio
            </Link>
            <Link href="/precio-de-venta" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
              Precio de Venta
            </Link>
            <Link href="/margen-de-ganancia" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
              Margen
            </Link>
            <Link href="/punto-de-equilibrio" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
              Punto de Equilibrio
            </Link>
            <Link href="/calculadora-igv" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
              IGV 18%
            </Link>
          </nav>

          {/* Right Actions: Search + ThemeToggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar calculadora"
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-emerald-600 dark:hover:border-emerald-500 transition-all cursor-pointer"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <span className="hidden sm:inline">Buscar...</span>
              <kbd className="hidden sm:inline-block rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                Ctrl K
              </kbd>
            </button>

            {/* Tactile Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 md:hidden space-y-1 shadow-xl">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Calculadoras Principales</div>
            {CALCULATORS_REGISTRY.slice(0, 8).map((calc) => (
              <Link
                key={calc.id}
                href={calc.slug}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
              >
                <span>{calc.shortTitle}</span>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  {calc.tag}
                </span>
              </Link>
            ))}
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
                placeholder="Escribe lo que deseas calcular (ej: igv, luz, precio)..."
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
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      {calc.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {calc.description}
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
