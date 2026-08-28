'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateCompoundInterest, CompoundInterestInput } from '@/core/calculators/compoundInterest';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { LineChart, TrendingUp, PiggyBank } from 'lucide-react';

export default function InteresCompuestoPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'interes-compuesto')!;

  const [initialPrincipal, setInitialPrincipal] = useState<number>(5000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(300);
  const [annualRatePercentage, setAnnualRatePercentage] = useState<number>(7.5);
  const [years, setYears] = useState<number>(5);

  const result = calculateCompoundInterest({
    initialPrincipal,
    monthlyContribution,
    annualRatePercentage,
    years,
  });

  const shareSummary = `Simulación de Interés Compuesto:
Capital Final Acumulado: ${formatCurrency(result.finalBalance)} (en ${years} años)
Ganancia en Intereses: ${formatCurrency(result.totalInterestEarned)} (TREA: ${annualRatePercentage}%)
Total Aportado: ${formatCurrency(result.totalContributions)}`;

  const faqs = [
    {
      question: '¿Qué es la TREA (Tasa de Rendimiento Efectiva Anual)?',
      answer: 'Es la tasa que te permite saber cuánto ganarás realmente por tu dinero en un banco o Caja Municipal de Ahorro y Crédito en Perú, descontando comisiones y gastos de mantenimiento.',
    },
    {
      question: '¿Por qué el interés compuesto hace crecer tanto el dinero?',
      answer: 'Porque los intereses ganados en cada periodo se reinvierten automáticamente y comienzan a generar nuevos intereses por sí mismos, acelerando el crecimiento de tu capital de forma exponencial con el paso de los años.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El <strong>Interés Compuesto</strong> es la herramienta de ahorro e inversión más potente para multiplicar tu patrimonio a mediano y largo plazo en depósitos a plazo fijo o fondos de inversión en Perú.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <LineChart className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Parámetros del Ahorro</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="initial"
              label="Monto inicial ahorrado"
              prefix="S/"
              value={initialPrincipal}
              onChange={(initialPrincipal) => setInitialPrincipal(initialPrincipal)}
              placeholder="5000.00"
              required
            />

            <InputNumber
              id="monthly"
              label="Aporte mensual adicional"
              prefix="S/"
              value={monthlyContribution}
              onChange={(monthlyContribution) => setMonthlyContribution(monthlyContribution)}
              helpText="Ahorro fijo cada mes"
              placeholder="300.00"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="rate"
              label="Tasa de Rendimiento Anual (TREA)"
              suffix="%"
              value={annualRatePercentage}
              onChange={(annualRatePercentage) => setAnnualRatePercentage(annualRatePercentage)}
              helpText="Tasa de la Caja o Banco"
              placeholder="7.5"
              required
            />

            <InputNumber
              id="years"
              label="Tiempo de ahorro en años"
              value={years}
              onChange={(years) => setYears(years)}
              min={1}
              max={30}
              helpText="Horizonte de inversión"
              placeholder="5"
              required
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-300 dark:border-blue-800/80 bg-blue-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-blue-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Capital Final Acumulado
              </span>
              <span className="rounded-full bg-blue-700 dark:bg-blue-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                📈 Crecimiento
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Monto Total al Finalizar
              </span>
              <div
                title={formatCurrency(result.finalBalance)}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-900 dark:text-blue-400 mt-1 font-mono tracking-tight truncate max-w-full px-2"
              >
                {formatCurrency(result.finalBalance)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                En {years} años con TREA del {annualRatePercentage}%
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Ganancia en Intereses"
                value={formatCurrency(result.totalInterestEarned)}
                type="success"
                subValue="Dinero generado"
              />
              <ResultMetricCard
                label="Total Aportado"
                value={formatCurrency(result.totalContributions)}
                type="neutral"
                subValue="De tu propio bolsillo"
              />
            </div>

            <ShareButtons title="Simulador de Interés Compuesto" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
