'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator } from 'lucide-react';
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
    <section
      aria-label={config.title}
      className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-900 p-5 sm:p-7 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white">
          <Calculator className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{config.title}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">{config.description}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
              <label htmlFor={`widget-${slug}-${field.key}`} className="mb-2 block text-xs font-bold text-slate-900 dark:text-slate-200 sm:text-sm">
                {field.label}
              </label>
              <select
                id={`widget-${slug}-${field.key}`}
                value={String(values[field.key])}
                onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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

      <dl className="mt-5 divide-y divide-emerald-200/70 dark:divide-slate-700 rounded-2xl bg-white dark:bg-slate-950 px-4" aria-live="polite">
        {rows.map((row) => (
          <div key={row.label} className={`flex items-baseline justify-between gap-4 py-2.5 ${row.strong ? 'text-base' : 'text-sm'}`}>
            <dt className={row.strong ? 'font-black text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}>{row.label}</dt>
            <dd className={`text-right font-mono ${row.strong ? 'font-black text-emerald-800 dark:text-emerald-300' : 'font-bold text-slate-900 dark:text-white'}`}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <Link
        href={calculatorHref}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline dark:text-emerald-400"
      >
        Ver el cálculo completo en la {calculatorLabel.toLowerCase()} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Resultado referencial; no sustituye asesoría profesional.</p>
    </section>
  );
}
