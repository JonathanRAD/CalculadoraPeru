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
    initialInvestment: 12000,
    monthlyNetProfit: 1500,
    expectedDurationMonths: 12,
  });

  const result = calculateRoi(form);

  const shareSummary = `Recuperación de Inversión: ${result.paybackMonths} meses
ROI en ${form.expectedDurationMonths} meses: ${formatPercent(result.roiPercentage)}
Ganancia Neta Acumulada: ${formatCurrency(result.totalNetProfitAtPeriod)}`;

  const faqs = [
    {
      question: '¿Qué es el Período de Recuperación (Payback)?',
      answer: 'Es el tiempo exacto (en meses o años) que le toma a tu negocio generar suficientes ganancias netas para igualar y devolver la inversión de capital inicial.',
    },
    {
      question: '¿Qué se considera un buen ROI para un negocio en Perú?',
      answer: 'Un ROI anualizado superior al 25% a 35% se considera muy atractivo en el mercado peruano para microempresas y proyectos comerciales, superando con creces la rentabilidad de depósitos a plazo fijo bancarios (5% a 7%).',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El <strong>Retorno de Inversión (ROI)</strong> te permite saber si vale la pena arriesgar tu capital en una nueva idea de negocio o compra de maquinaria.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PiggyBank className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Ingresa la inversión y flujo estimado</h2>
          </div>

          <InputNumber
            id="initialInvestment"
            label="Inversión Inicial Total"
            prefix="S/"
            value={form.initialInvestment}
            onChange={(initialInvestment) => setForm({ ...form, initialInvestment })}
            helpText="Maquinaria, local, inventario inicial"
            placeholder="12000.00"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="monthlyNetProfit"
              label="Ganancia neta mensual esperada"
              prefix="S/"
              value={form.monthlyNetProfit}
              onChange={(monthlyNetProfit) => setForm({ ...form, monthlyNetProfit })}
              helpText="Utilidad libre al mes"
              placeholder="1500.00"
              required
            />

            <InputNumber
              id="duration"
              label="Periodo a evaluar"
              suffix="meses"
              value={form.expectedDurationMonths || 12}
              onChange={(expectedDurationMonths) => setForm({ ...form, expectedDurationMonths })}
              helpText="Ej: 12 meses (1 año)"
              placeholder="12"
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-white to-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Tiempo de Retorno
              </span>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Finanzas
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white border border-emerald-200/60 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Recuperación Estimada (Payback)
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1">
                {result.paybackMonths} meses
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                {result.paybackMonths <= (form.expectedDurationMonths || 12)
                  ? '✅ Inversión recuperada dentro del plazo evaluado'
                  : '⚠️ Requiere más tiempo del evaluado para recuperar capital'}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label={`ROI (${form.expectedDurationMonths} meses)`}
                value={formatPercent(result.roiPercentage)}
                type="success"
                subValue={`Rendimiento mensual: ${formatPercent(result.monthlyReturnRate)}`}
              />
              <ResultMetricCard
                label="Ganancia neta neta al final"
                value={formatCurrency(result.totalNetProfitAtPeriod)}
                type="neutral"
                subValue="Descontando inversión inicial"
              />
            </div>

            <ShareButtons title="Recuperación de Inversión (ROI)" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
