'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { CALCULATORS_REGISTRY, CalculatorMeta } from '../registry';
import { FaqAccordion, FaqItem } from '@/shared/components/ui/FaqAccordion';
import { SITE_LAST_UPDATED } from '@/core/constants/site-updates';
import { GUIDES } from '@/features/guias/data';

interface CalculatorShellProps {
  meta: CalculatorMeta;
  children: React.ReactNode; // Inputs & Results
  educationalContent?: React.ReactNode;
  faqs?: FaqItem[];
  /** Contenido promocional (PRO) que se muestra debajo de la guía y las preguntas frecuentes. */
  afterContent?: React.ReactNode;
  /** Aviso sobre datos variables (precios, tarifas, comisiones), mostrado bajo la calculadora. */
  dataNote?: React.ReactNode;
}

export function CalculatorShell({
  meta,
  children,
  educationalContent,
  faqs,
  afterContent,
  dataNote,
}: CalculatorShellProps) {
  const related = CALCULATORS_REGISTRY
    .filter((c) => c.id !== meta.id && c.category === meta.category)
    .slice(0, 3);

  const relatedGuides = GUIDES.filter((guide) => guide.calculator.href === meta.slug);

  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: meta.title,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PEN',
    },
    description: meta.description,
    provider: {
      '@type': 'Organization',
      name: 'CalculaPerú',
      url: 'https://www.calculaperu.com.pe',
    },
  };

  const faqJsonLd = faqs && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#121820] text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Cabecera: migas, título, descripción y fecha de revisión */}
      <div className="border-b border-stone-300 dark:border-slate-700 pt-6 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav aria-label="Migas de pan" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/" className="hover:text-brand-700 hover:underline dark:hover:text-brand-400">Inicio</Link>
            <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <Link href="/#todas-las-calculadoras" className="capitalize hover:text-brand-700 hover:underline dark:hover:text-brand-400">
              {meta.category}
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">{meta.shortTitle}</span>
          </nav>

          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {meta.title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {meta.description}
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-stone-300 pt-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-700 dark:text-brand-400" aria-hidden="true" />
              Parámetros revisados el{' '}
              <time dateTime={SITE_LAST_UPDATED}>
                {new Date(`${SITE_LAST_UPDATED}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
            </span>
            <Link href="/actualizaciones" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">Ver cambios</Link>
            <Link href="/guias" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">Guías</Link>
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">

        {/* Calculator Interactive Card */}
        <div className="mb-8">
          {children}
        </div>

        {dataNote}

        {relatedGuides.length > 0 && (
          <section aria-label="Guías relacionadas" className="app-card p-5 sm:p-6 mb-8">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Entiende cómo se calcula</h2>
            <ul className="space-y-2">
              {relatedGuides.map((guide) => (
                <li key={guide.slug}>
                  <Link href={`/guias/${guide.slug}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 dark:text-emerald-400 hover:underline">
                    {guide.title} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

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

        {afterContent &&<div className="mb-8">{afterContent}</div>}

        {/* Related Calculators */}
        {related.length > 0 && (
          <section aria-label="Otras calculadoras útiles" className="mt-10 pt-6 border-t border-slate-200 dark:border-[#2C3744]">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Otras calculadoras de {meta.category} que te pueden interesar:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((calc) => (
                <Link
                  key={calc.id}
                  href={calc.slug}
                  className="app-card p-4 hover:border-brand-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-emerald-400">
                      {calc.tag}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 group-hover:text-brand-700 dark:group-hover:text-emerald-400 transition-colors">
                      {calc.shortTitle}
                    </h3>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-brand-700 dark:group-hover:text-emerald-400">
                    <span>Calcular</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
