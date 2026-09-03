'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, WalletCards } from 'lucide-react';
import { calculateNetSalary, type PensionSystem } from '@/core/calculators/payroll';
import { formatCurrency } from '@/core/math/formatters';

export function QuickSalaryCalculator() {
  const [grossSalary, setGrossSalary] = useState(3000);
  const [pensionSystem, setPensionSystem] = useState<PensionSystem>('afp_prima');
  const [hasDependents, setHasDependents] = useState(false);

  const result = useMemo(
    () => calculateNetSalary({ grossSalary, pensionSystem, hasDependents }),
    [grossSalary, pensionSystem, hasDependents],
  );

  return (
    <aside className="home-calculator-card mx-auto w-full max-w-lg rounded-[1.4rem] border border-white/80 bg-white/95 p-5 shadow-[0_28px_80px_-38px_rgba(15,23,42,0.65)] backdrop-blur-sm dark:border-slate-700 dark:bg-[#101a38]/95 dark:shadow-black/40 sm:p-6" aria-labelledby="quick-salary-title">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white dark:bg-emerald-500 dark:text-slate-950">
            <WalletCards className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">Cálculo rápido</p>
            <h2 id="quick-salary-title" className="mt-0.5 text-lg font-bold tracking-tight text-slate-950 dark:text-white">Sueldo neto mensual</h2>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Referencial</span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Remuneración bruta mensual</span>
          <span className="flex min-h-12 items-center rounded-xl border border-slate-300 bg-slate-50 px-3 focus-within:border-emerald-600 focus-within:ring-3 focus-within:ring-emerald-600/10 dark:border-slate-700 dark:bg-slate-950/50">
            <span className="mr-2 font-mono text-sm text-slate-500 dark:text-slate-400">S/</span>
            <input
              type="number"
              min="0"
              step="100"
              inputMode="decimal"
              value={grossSalary}
              onChange={(event) => setGrossSalary(Math.max(0, Number(event.target.value) || 0))}
              className="w-full bg-transparent py-3 font-mono text-base font-bold text-slate-950 outline-none dark:text-white"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Sistema pensionario</span>
          <select
            value={pensionSystem}
            onChange={(event) => setPensionSystem(event.target.value as PensionSystem)}
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/10 dark:border-slate-700 dark:bg-slate-950/50 dark:text-white"
          >
            <option value="onp">ONP</option>
            <option value="afp_prima">Prima AFP</option>
            <option value="afp_integra">AFP Integra</option>
            <option value="afp_profuturo">Profuturo AFP</option>
            <option value="afp_habitat">Habitat AFP</option>
          </select>
        </label>

        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200">
          <input
            type="checkbox"
            checked={hasDependents}
            onChange={(event) => setHasDependents(event.target.checked)}
            className="h-4 w-4 accent-emerald-700"
          />
          Asignación familiar
        </label>
      </div>

      <div aria-live="polite" className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/35">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-300">Neto estimado</p>
            <p className="home-result-number mt-1 font-mono text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-300">
              {formatCurrency(result.netSalary)}
            </p>
          </div>
          <div className="text-right text-xs leading-5 text-slate-600 dark:text-slate-300">
            <p>Descuentos: <strong className="font-mono text-slate-900 dark:text-white">{formatCurrency(result.totalDeductions)}</strong></p>
            <p className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300"><Check className="h-3.5 w-3.5" aria-hidden="true" /> Actualización 2026</p>
          </div>
        </div>
      </div>

      <Link href="/sueldo-neto" className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400">
        Abrir calculadora completa
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}
