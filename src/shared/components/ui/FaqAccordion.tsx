'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
    <section aria-label="Preguntas frecuentes" className="rounded-lg border border-stone-300 bg-[#FFFEFB] p-6 sm:p-8 dark:border-slate-700 dark:bg-[#18202A]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
        {title}
      </h2>

      <ol className="divide-y divide-stone-300 border-y border-stone-900 dark:divide-slate-700 dark:border-slate-400">
        {items.map((item, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="flex min-h-14 w-full cursor-pointer items-baseline gap-4 py-4 text-left text-slate-900 hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-400"
              >
                <span aria-hidden="true" className="w-6 shrink-0 font-mono text-[13px] text-slate-600 dark:text-slate-400">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-base font-semibold leading-snug sm:text-lg">{item.question}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-5 w-5 shrink-0 translate-y-1 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-brand-700 dark:text-brand-400' : 'text-slate-500'
                  }`}
                />
              </button>

              {isOpen && (
                <div className="pb-5 pl-10 pr-8 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                  {item.answer}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
