'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateRoi, RoiInput } from '@/core/calculators/roi';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { PiggyBank } from 'lucide-react';

export default function RecuperacionDeInversionPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'recuperacion-de-inversion')!;

  const [form, setForm] = useState<RoiInput>({
    initialInvestment: 15000,
    monthlyNetProfit: 1200,
  });

  const result = calculateRoi(form);

  const shareSummary = `Retorno de Inversión (ROI): ${formatPercent(result.roiPercentage)} anual
Tiempo de Recuperación (Payback): ${result.paybackMonths.toFixed(1)} meses (~${(result.paybackMonths / 12).toFixed(1)} años)
Inversión Inicial: ${formatCurrency(form.initialInvestment)}`;

  const faqs = [
    {
      question: '¿Qué es el periodo de Payback?',
      answer: 'Es el tiempo exacto que toma recuperar el 100% del dinero invertido inicialmente con base en el flujo de ganancias netas mensuales generadas.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El <strong>ROI (Retorno de Inversión)</strong> mide la rentabilidad del capital invertido en maquinarias, apertura de locales o compras de inventario.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <PiggyBank className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos de la Inversión</h2>
          </div>

          <InputNumber
            id="initialInvestment"
            label="Monto de la inversión inicial total"
            prefix="S/"
            value={form.initialInvestment}
            onChange={(initialInvestment) => setForm({ ...form, initialInvestment })}
            helpText="Local, maquinaria, stock inicial"
            placeholder="15000.00"
            required
          />

          <InputNumber
            id="monthlyNetProfit"
            label="Ganancia neta promedio estimada al mes"
            prefix="S/"
            value={form.monthlyNetProfit}
            onChange={(monthlyNetProfit) => setForm({ ...form, monthlyNetProfit })}
            helpText="Utilidad líquida mensual libre"
            placeholder="1200.00"
            required
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 dark:border-slate-800 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Periodo de Recuperación
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Payback
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border border-emerald-200/60 dark:border-slate-800 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Tiempo para Recuperar Inversión
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {result.paybackMonths.toFixed(1)} meses
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                Equivale a aproximadamente {(result.paybackMonths / 12).toFixed(1)} años
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="ROI Anualizado"
                value={formatPercent(result.roiPercentage)}
                type="success"
                subValue="Rendimiento del capital"
              />
              <ResultMetricCard
                label="Ganancia Anual"
                value={formatCurrency(form.monthlyNetProfit * 12)}
                type="neutral"
                subValue="12 meses de utilidad"
              />
            </div>

            <ShareButtons title="Recuperación de Inversión (ROI)" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
