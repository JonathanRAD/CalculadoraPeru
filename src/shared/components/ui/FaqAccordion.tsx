'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  title?: string;
}

export function FaqAccordion({
  items,
  title = 'Preguntas frecuentes sobre este cálculo',
}: FaqAccordionProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggle = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Schema.org FAQPage JSON-LD
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section aria-label="Preguntas frecuentes" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <HelpCircle className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between p-4 text-left font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-400 cursor-pointer"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-emerald-700 dark:text-emerald-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 px-4 pt-3 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
