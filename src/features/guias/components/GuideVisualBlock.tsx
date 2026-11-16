import React from 'react';
import type { GuideVisual, VisualFormat } from '../visuals';

function formatValue(value: number, format: VisualFormat): string {
  if (format === 'currency') {
    return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (format === 'percent') {
    return `${value.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} %`;
  }
  return value.toLocaleString('es-PE', { maximumFractionDigits: 2 });
}

const STACK_COLORS = ['bg-emerald-600', 'bg-sky-600', 'bg-amber-500', 'bg-violet-600'];
const STACK_DOTS = ['bg-emerald-600', 'bg-sky-600', 'bg-amber-500', 'bg-violet-600'];

/**
 * Gráficos de las guías. Se dibujan con HTML y CSS (sin librerías ni imágenes), por lo que se
 * leen con lectores de pantalla, funcionan sin JavaScript y se ven en modo claro y oscuro.
 * Las cifras se calculan con las mismas fórmulas que las calculadoras.
 */
export function GuideVisualBlock({ visual }: { visual: GuideVisual }) {
  return (
    <figure className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5">
      <figcaption className="mb-3">
        <span className="block text-sm font-bold text-slate-900 dark:text-white">{visual.title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">{visual.caption}</span>
      </figcaption>

      {visual.type === 'bars' && <Bars visual={visual} />}
      {visual.type === 'stack' && <Stack visual={visual} />}
      {visual.type === 'timeline' && <Timeline visual={visual} />}
    </figure>
  );
}

function Bars({ visual }: { visual: Extract<GuideVisual, { type: 'bars' }> }) {
  const max = Math.max(...visual.items.map((item) => item.value), 1);
  return (
    <ul className="space-y-2.5">
      {visual.items.map((item, index) => {
        const width = Math.max(2, (item.value / max) * 100);
        const highlighted = visual.highlight === index;
        return (
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{formatValue(item.value, visual.format)}</span>
            </div>
            <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" aria-hidden="true">
              <div
                className={`h-full rounded-full ${highlighted ? 'bg-amber-500' : 'bg-emerald-600'}`}
                style={{ width: `${width}%` }}
              />
            </div>
            {item.note && <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">{item.note}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function Stack({ visual }: { visual: Extract<GuideVisual, { type: 'stack' }> }) {
  const total = visual.items.reduce((sum, item) => sum + item.value, 0) || 1;
  return (
    <div>
      <div className="flex h-8 w-full overflow-hidden rounded-xl" aria-hidden="true">
        {visual.items.map((item, index) => (
          <div
            key={item.label}
            className={`${STACK_COLORS[index % STACK_COLORS.length]} flex items-center justify-center text-[11px] font-bold text-white`}
            style={{ width: `${Math.max(3, (item.value / total) * 100)}%` }}
            title={`${item.label}: ${formatValue(item.value, visual.format)}`}
          >
            {(item.value / total) * 100 >= 12 ? `${Math.round((item.value / total) * 100)} %` : ''}
          </div>
        ))}
      </div>
      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {visual.items.map((item, index) => (
          <li key={item.label} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
              <span className={`h-2.5 w-2.5 rounded-sm ${STACK_DOTS[index % STACK_DOTS.length]}`} aria-hidden="true" />
              {item.label}
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{formatValue(item.value, visual.format)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
        Total: <span className="font-mono font-bold">{formatValue(total, visual.format)}</span>
      </p>
    </div>
  );
}

function Timeline({ visual }: { visual: Extract<GuideVisual, { type: 'timeline' }> }) {
  return (
    <ol className="relative ml-2 space-y-4 border-l-2 border-emerald-600/40 pl-5">
      {visual.steps.map((step, index) => (
        <li key={step.title} className="relative">
          <span
            className={`absolute -left-[1.72rem] top-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950 ${index % 2 === 1 ? 'bg-amber-500' : 'bg-emerald-600'}`}
            aria-hidden="true"
          />
          <span className="block text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">{step.when}</span>
          <span className="block text-sm font-bold text-slate-900 dark:text-white">{step.title}</span>
          <span className="block text-xs leading-relaxed text-slate-600 dark:text-slate-300">{step.detail}</span>
        </li>
      ))}
    </ol>
  );
}
