'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator, Search, Sparkles, X, ArrowRight, Menu } from 'lucide-react';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';

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
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Calcula<span className="text-emerald-600">Perú</span>
                </span>
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  🇵🇪 PERÚ
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Portal #1 de calculadoras para negocios y finanzas
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
            <Link 
              href="/precio-de-venta" 
              className="rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Precio de Venta
            </Link>
            <Link 
              href="/margen-de-ganancia" 
              className="rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Margen de Ganancia
            </Link>
            <Link 
              href="/punto-de-equilibrio" 
              className="rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Punto de Equilibrio
            </Link>
            <Link 
              href="/calculadora-igv" 
              className="rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              IGV 18%
            </Link>
            <Link 
              href="/consumo-electrico" 
              className="rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Luz / kWh
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar calculadora"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900"
            >
              <Search className="h-4 w-4 text-slate-500" />
              <span className="hidden md:inline font-semibold">Buscar calculadora...</span>
              <kbd className="hidden rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 md:inline">
                Ctrl K
              </kbd>
            </button>

            {/* Free Badge / CTA */}
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow"
            >
              <Sparkles className="h-3.5 w-3.5" />
              100% Gratis
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 lg:hidden rounded-lg hover:bg-slate-100"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Calculadoras Principales</div>
            {CALCULATORS_REGISTRY.slice(0, 7).map((calc) => (
              <Link
                key={calc.id}
                href={calc.slug}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 border-b border-slate-100 last:border-0"
              >
                <span>{calc.shortTitle}</span>
                <span className="text-[11px] text-slate-400">{calc.tag}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 pt-20 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="flex items-center border-b border-slate-100 px-4 py-3.5">
              <Search className="h-5 w-5 text-emerald-600" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe lo que deseas calcular (ej: igv, luz, precio, ganancia)..."
                className="ml-3 flex-1 text-base font-medium text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {searchQuery.trim() === '' ? 'Calculadoras Populares' : `Resultados (${filteredCalculators.length})`}
              </div>
              {filteredCalculators.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No encontramos calculadoras para <span className="font-semibold text-slate-700">"{searchQuery}"</span>.
                </div>
              ) : (
                filteredCalculators.map((calc) => (
                  <Link
                    key={calc.id}
                    href={calc.slug}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-emerald-50/70 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Calculator className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 group-hover:text-emerald-900">
                          {calc.title}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {calc.description}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 flex justify-between items-center">
              <span>Selecciona una calculadora para abrirla al instante</span>
              <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">ESC para cerrar</kbd>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
