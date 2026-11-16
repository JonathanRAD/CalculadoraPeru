'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { GUIDE_WIDGETS, type WidgetValues } from '../widgets';

interface GuideWidgetProps {
  slug: string;
  calculatorHref: string;
  calculatorLabel: string;
}

/** Mini calculadora dentro de la guía: recalcula al instante con las fórmulas de la calculadora completa. */
export function GuideWidget({ slug, calculatorHref, calculatorLabel }: GuideWidgetProps) {
  const config = GUIDE_WIDGETS[slug];

  const [values, setValues] = useState<WidgetValues>(() =>
    Object.fromEntries((config?.fields ?? []).map((field) => [field.key, field.defaultValue])),
  );

  const rows = useMemo(() => (config ? config.compute(values) : []), [config, values]);

  if (!config) return null;

  return (
    <section aria-label={config.title} className="border border-slate-900 bg-[#FFFEFB] dark:border-slate-500 dark:bg-[#18202A]">
      <header className="bg-brand-900 px-5 py-3 text-white">
        <h2 className="font-mono text-sm font-semibold">{config.title}</h2>
        <p className="mt-0.5 text-[13px] text-brand-100">{config.description}</p>
      </header>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {config.fields.map((field) =>
          field.type === 'number' ? (
            <InputNumber
              key={field.key}
              id={`widget-${slug}-${field.key}`}
              label={field.label}
              prefix={field.prefix}
              suffix={field.suffix}
              max={field.max}
              value={values[field.key] as number}
              onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
            />
          ) : (
            <div key={field.key}>
              <label htmlFor={`widget-${slug}-${field.key}`} className="mb-1.5 block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                {field.label}
              </label>
              <select
                id={`widget-${slug}-${field.key}`}
                value={String(values[field.key])}
                onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                className="select-field w-full rounded border border-slate-400 bg-white pl-3 text-[15px] text-slate-900 focus:border-brand-600 focus:outline-2 focus:outline-offset-1 focus:outline-brand-600 dark:border-slate-600 dark:bg-[#0E141B] dark:text-slate-100"
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ),
        )}
      </div>

      <dl className="divide-y divide-dashed divide-stone-300 border-t border-slate-900 px-5 dark:divide-slate-600 dark:border-slate-500" aria-live="polite">
        {rows.map((row) => (
          <div key={row.label} className={`flex items-baseline justify-between gap-4 py-2.5 ${row.strong ? 'text-base' : 'text-[15px]'}`}>
            <dt className={row.strong ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}>{row.label}</dt>
            <dd className={`text-right font-mono ${row.strong ? 'font-semibold text-brand-800 dark:text-brand-300' : 'font-medium text-slate-900 dark:text-white'}`}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <Link
        href={calculatorHref}
        className="m-5 mb-2 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-400"
      >
        Ver el cálculo completo en la {calculatorLabel.toLowerCase()} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
      <p className="px-5 pb-4 text-[13px] text-slate-600 dark:text-slate-400">Resultado referencial; no sustituye asesoría profesional.</p>
    </section>
  );
}
