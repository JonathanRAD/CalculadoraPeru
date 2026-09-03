'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Search, X } from 'lucide-react';
import type { CalculatorMeta } from '@/features/calculators/registry';

interface HomeSearchProps {
  calculators: CalculatorMeta[];
}

function normalizeSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('es-PE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function HomeSearch({ calculators }: HomeSearchProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return [];

    return calculators
      .map((calculator) => {
        const title = normalizeSearch(`${calculator.shortTitle} ${calculator.title}`);
        const keywords = normalizeSearch(calculator.keywords.join(' '));
        const description = normalizeSearch(calculator.description);
        const score =
          (title.startsWith(normalizedQuery) ? 140 : 0) +
          (title.includes(normalizedQuery) ? 100 : 0) +
          (keywords.includes(normalizedQuery) ? 60 : 0) +
          (description.includes(normalizedQuery) ? 20 : 0);
        return { calculator, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ calculator }) => calculator)
      .slice(0, 6);
  }, [calculators, query]);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  const showResults = isOpen && query.trim().length > 0;

  function clearSearch() {
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      clearSearch();
      event.currentTarget.blur();
      return;
    }

    if (!results.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % results.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      router.push(results[activeIndex].slug);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <label htmlFor="home-calculator-search" className="sr-only">
        Buscar una calculadora
      </label>
      <div className="flex min-h-14 items-center rounded-2xl border border-slate-300/90 bg-white px-4 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.55)] transition-[border-color,box-shadow] focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/10 dark:border-slate-700 dark:bg-[#101a38] dark:shadow-black/20 dark:focus-within:border-emerald-400">
        <Search className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
        <input
          id="home-calculator-search"
          type="search"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="¿Qué necesitas calcular? Ej. sueldo, IGV o CTS"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showResults}
          aria-controls="home-search-results"
          aria-activedescendant={activeIndex >= 0 ? `home-search-result-${activeIndex}` : undefined}
          className="ml-3 min-w-0 flex-1 bg-transparent py-4 text-sm font-semibold text-slate-950 outline-none placeholder:font-normal placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400 sm:text-base"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Limpiar búsqueda"
            className="ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {showResults && (
        <div
          id="home-search-results"
          role="listbox"
          aria-label="Resultados de búsqueda"
          className="home-search-results absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-[#101a38] dark:shadow-black/40"
        >
          {results.length > 0 ? (
            results.map((calculator, index) => (
              <Link
                id={`home-search-result-${index}`}
                key={calculator.id}
                href={calculator.slug}
                role="option"
                aria-selected={activeIndex === index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={clearSearch}
                className={`group flex min-h-14 items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors ${
                  activeIndex === index
                    ? 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/50 dark:text-white'
                    : 'text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800'
                }`}
              >
                <span className="min-w-0">
                  <strong className="block truncate text-sm">{calculator.shortTitle}</strong>
                  <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                    {calculator.cardSummary}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-emerald-700 transition-transform group-hover:translate-x-0.5 dark:text-emerald-400" aria-hidden="true" />
              </Link>
            ))
          ) : (
            <p className="px-3 py-4 text-sm text-slate-600 dark:text-slate-300">
              No encontramos una herramienta con ese término. Prueba con “sueldo”, “IGV” o “préstamo”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
