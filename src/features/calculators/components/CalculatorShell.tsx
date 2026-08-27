'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
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
  // Related calculators (same category or popular)
  const related = CALCULATORS_REGISTRY
    .filter((c) => c.id !== meta.id)
    .slice(0, 3);

  // Schema.org SoftwareApplication JSON-LD
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
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      {/* Header Banner */}
      <div className="border-b border-slate-200/80 bg-white pt-6 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-4">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link href="/" className="hover:text-emerald-600 transition-colors capitalize">
              {meta.category}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold">{meta.shortTitle}</span>
          </nav>

          {/* Title and Badges */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200/60">
                  🇵🇪 PERÚ {meta.tag}
                </span>
                {meta.badge && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                    <Sparkles className="h-3 w-3" />
                    {meta.badge}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
                {meta.title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
                {meta.description}
              </p>
            </div>

            {/* Formula Pill */}
            {meta.formulaSummary && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 max-w-xs shrink-0">
                <div className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] mb-1">
                  Fórmula estándar
                </div>
                <code className="font-mono font-semibold text-emerald-900 text-xs break-all">
                  {meta.formulaSummary}
                </code>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Grid: Calculator Inputs & Results */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {children}

        {/* Educational Content Section */}
        {educationalContent && (
          <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <BookOpen className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Guía Práctica: ¿Cómo entender este cálculo en Perú?
              </h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm sm:text-base space-y-4">
              {educationalContent}
            </div>
          </section>
        )}

        {/* FAQs */}
        {faqs && faqs.length > 0 && (
          <FaqAccordion items={faqs} title={`Preguntas frecuentes sobre ${meta.shortTitle}`} />
        )}

        {/* Related Calculators */}
        <section className="mt-12">
          <h2 className="text-lg font-extrabold text-slate-900 mb-4">
            Otras calculadoras que te pueden interesar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((calc) => (
              <Link
                key={calc.id}
                href={calc.slug}
                className="rounded-2xl border border-slate-200 bg-white p-4.5 transition-all hover:border-emerald-500 hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {calc.tag}
                    </span>
                    <span className="text-xs text-slate-400">🇵🇪 S/</span>
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">
                    {calc.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {calc.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span>Abrir calculadora</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
