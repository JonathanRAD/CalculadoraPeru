'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { CALCULATORS_REGISTRY, CalculatorMeta } from '../registry';
import { FaqAccordion, FaqItem } from '@/shared/components/ui/FaqAccordion';

interface CalculatorShellProps {
  meta: CalculatorMeta;
  children: React.ReactNode; // Inputs & Results
  educationalContent?: React.ReactNode;
  faqs?: FaqItem[];
}

export function CalculatorShell({
  meta,
  children,
  educationalContent,
  faqs,
}: CalculatorShellProps) {
  const related = CALCULATORS_REGISTRY
    .filter((c) => c.id !== meta.id && c.category === meta.category)
    .slice(0, 3);

  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: meta.title,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PEN',
    },
    description: meta.description,
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      {/* Header Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1736] pt-8 pb-10 shadow-2xs">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">

          {/* Breadcrumb */}
          <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold">
            <Link href="/" className="hover:text-[#00875A] dark:hover:text-[#00C853] transition-colors">
              Inicio
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link href="/#todas-las-calculadoras" className="hover:text-[#00875A] dark:hover:text-[#00C853] transition-colors capitalize">
              {meta.category}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-bold truncate">
              {meta.shortTitle}
            </span>
          </nav>

          {/* Title & Official Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-bold text-[#00875A] dark:text-[#00C853] border border-emerald-200 dark:border-emerald-800">
              {meta.tag}
            </span>
            {meta.badge && (
              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                {meta.badge}
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-[#00875A] dark:text-[#00C853] font-bold ml-auto">
              <ShieldCheck className="h-4 w-4" />
              <span>Parámetros referenciales para Perú</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {meta.title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl font-normal leading-relaxed">
            {meta.description}
          </p>

        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 -mt-4">

        {/* Calculator Interactive Card */}
        <div className="app-card p-6 sm:p-8 mb-8 shadow-sm">
          {children}
        </div>

        {/* Educational Content & Law Breakdown */}
        {educationalContent && (
          <section aria-label="Guía del cálculo" className="app-card p-6 sm:p-8 mb-8 prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {educationalContent}
          </section>
        )}

        {/* FAQs */}
        {faqs && faqs.length > 0 && (
          <section aria-label="Preguntas Frecuentes" className="app-card p-6 sm:p-8 mb-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">
              Preguntas Frecuentes
            </h2>
            <FaqAccordion items={faqs} />
          </section>
        )}

        {/* Related Calculators */}
        {related.length > 0 && (
          <section aria-label="Otras calculadoras útiles" className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Otras calculadoras de {meta.category} que te pueden interesar:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((calc) => (
                <Link
                  key={calc.id}
                  href={calc.slug}
                  className="app-card p-4 hover:border-[#00875A] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00875A] dark:text-[#00C853]">
                      {calc.tag}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 group-hover:text-[#00875A] dark:group-hover:text-[#00C853] transition-colors">
                      {calc.shortTitle}
                    </h3>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-[#00875A] dark:group-hover:text-[#00C853]">
                    <span>Calcular</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
