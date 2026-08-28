'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
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
    .filter((c) => c.id !== meta.id)
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
    <div className="min-h-screen bg-[#eef2f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      {/* Header Banner with contrasting surface */}
      <div className="border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 pt-8 pb-10 shadow-xs">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          
          {/* Breadcrumb */}
          <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold">
            <Link href="/" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link href="/#directorio" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors capitalize">
              {meta.category}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-bold">{meta.shortTitle}</span>
          </nav>

          {/* Title and Description */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-950 px-3 py-1 text-xs font-extrabold text-emerald-900 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 mb-2.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>🇵🇪 PERÚ {meta.tag}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                {meta.title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {meta.description}
              </p>
            </div>

            {meta.formulaSummary && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-xs max-w-xs shrink-0 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Fórmula de referencia
                </div>
                <code className="font-mono text-xs text-slate-900 dark:text-slate-200 break-all font-bold">
                  {meta.formulaSummary}
                </code>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Grid: Calculator Inputs & Results */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 mt-10 space-y-10">
        {children}

        {/* 🌟 Cotizador MYPE Banner Callout */}
        <div className="rounded-3xl border-2 border-amber-400/70 dark:border-amber-500/40 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold border border-amber-400/40">
              <Sparkles className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-950 dark:text-white">
                  ¿Haces cotizaciones a menudo para tus clientes?
                </span>
                <span className="rounded bg-[#E3A62F] text-slate-950 px-1.5 py-0.2 text-[9px] font-black uppercase">
                  Nuevo
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Guarda tus productos y arma proformas formales con IGV para WhatsApp en 30 segundos.
              </p>
            </div>
          </div>
          <Link
            href="/cotizador"
            className="rounded-xl bg-[#E3A62F] hover:bg-[#f0b443] px-4 py-2.5 text-xs font-black text-slate-950 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            <span>Probar Cotizador Gratis</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Educational Guide */}
        {educationalContent && (
          <section aria-label="Guía práctica" className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              ¿Cómo funciona este cálculo en el Perú?
            </h2>
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm space-y-3 font-normal">
              {educationalContent}
            </div>
          </section>
        )}

        {/* FAQs */}
        {faqs && faqs.length > 0 && (
          <FaqAccordion items={faqs} title={`Preguntas frecuentes sobre ${meta.shortTitle}`} />
        )}

        {/* Related */}
        <section aria-label="Calculadoras relacionadas" className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Otras calculadoras útiles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((calc) => (
              <Link
                key={calc.id}
                href={calc.slug}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-emerald-700 dark:hover:border-emerald-500 hover:shadow-md transition-all group shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                    {calc.shortTitle}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                    {calc.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 mt-4 group-hover:translate-x-0.5 transition-transform">
                  <span>Abrir calculadora</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
