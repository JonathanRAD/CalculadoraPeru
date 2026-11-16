import React from 'react';

export interface PayslipLine {
  label: string;
  /** Importe ya formateado, sin signo. */
  amount: string;
  /** 'deduction' antepone el signo menos; 'income' el signo más. */
  kind?: 'neutral' | 'income' | 'deduction';
  note?: string;
}

interface PayslipResultProps {
  title: string;
  period?: string;
  lines: PayslipLine[];
  subtotalLabel?: string;
  subtotalAmount?: string;
  totalLabel: string;
  totalAmount: string;
  footnote?: React.ReactNode;
  /** Rótulo de la columna de importes; por defecto "Importe S/". */
  amountHeader?: string;
  children?: React.ReactNode;
}

const SIGN: Record<NonNullable<PayslipLine['kind']>, string> = {
  neutral: '',
  income: '+ ',
  deduction: '− ',
};

/**
 * Resultado con forma de boleta de pago: cabecera, conceptos con filete
 * punteado, subtotal y línea de total con doble filete. Un solo nivel de
 * contenedor, sin tarjetas anidadas.
 */
export function PayslipResult({
  title,
  period,
  lines,
  subtotalLabel,
  subtotalAmount,
  totalLabel,
  totalAmount,
  footnote,
  amountHeader = 'Importe S/',
  children,
}: PayslipResultProps) {
  return (
    <section
      aria-label={title}
      className="relative border border-slate-900 bg-[#FFFEFB] text-slate-900 dark:border-slate-500 dark:bg-[#18202A] dark:text-slate-100"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-brand-900 px-4 py-3 text-white">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wide">{title}</h2>
        {period && <span className="font-mono text-sm text-emerald-100">{period}</span>}
      </header>

      <table className="w-full border-collapse text-base">
        <thead>
          <tr className="border-b border-slate-900 dark:border-slate-500">
            <th scope="col" className="px-4 pb-2 pt-3 text-left font-mono text-[13px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Concepto
            </th>
            <th scope="col" className="px-4 pb-2 pt-3 text-right font-mono text-[13px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {amountHeader}
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.label} className="border-b border-dashed border-stone-300 dark:border-slate-700">
              <td className="px-4 py-3 pr-2">
                {line.label}
                {line.note && <small className="block text-sm text-slate-600 dark:text-slate-300">{line.note}</small>}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums">
                {SIGN[line.kind ?? 'neutral']}
                {line.amount}
              </td>
            </tr>
          ))}
          {subtotalLabel && subtotalAmount && (
            <tr className="border-b border-slate-900 font-semibold dark:border-slate-500">
              <td className="px-4 py-3">{subtotalLabel}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums">− {subtotalAmount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t-4 border-double border-slate-900 bg-brand-100 px-4 py-4 dark:border-slate-400 dark:bg-brand-900">
        <div>
          <span className="block font-semibold">{totalLabel}</span>
          <span className="mt-1 inline-block -rotate-3 rounded-xs border-2 border-stamp px-2 py-0.5 font-mono text-[13px] font-semibold tracking-widest text-stamp dark:border-red-300 dark:text-red-300">
            REFERENCIAL
          </span>
        </div>
        <strong
          title={totalAmount}
          className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-brand-900 dark:text-white sm:text-4xl"
        >
          {totalAmount}
        </strong>
      </div>

      {footnote && (
        <p className="border-t border-stone-300 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          {footnote}
        </p>
      )}

      {children && <div className="space-y-3 border-t border-stone-300 p-4 dark:border-slate-700">{children}</div>}
    </section>
  );
}
