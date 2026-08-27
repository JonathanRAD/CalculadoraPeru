'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateProfitPerProduct, ProfitPerProductInput } from '@/core/calculators/profitPerProduct';
import { formatCurrency, formatNumber, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { PackageCheck } from 'lucide-react';

export default function GananciaPorProductoPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'ganancia-por-producto')!;

  const [form, setForm] = useState<ProfitPerProductInput>({
    costPrice: 25,
    salePrice: 60,
    estimatedMonthlyUnits: 100,
    advertisingCostPerUnit: 2,
  });

  const result = calculateProfitPerProduct(form);

  const shareSummary = `Ganancia Total Proyectada: ${formatCurrency(result.estimatedMonthlyTotalProfit)}
Ventas Totales: ${formatCurrency(result.estimatedMonthlyGrossRevenue)} (${formatNumber(form.estimatedMonthlyUnits)} unidades)
Ganancia Neta por Unidad: ${formatCurrency(result.unitProfit)}`;

  const faqs = [
    {
      question: '¿Qué es el costo de publicidad por unidad?',
      answer: 'Es el gasto promedio en anuncios de Facebook, TikTok o volantes necesario para generar una venta. Si gastas S/ 200 en pauta y vendes 100 productos, tu costo de publicidad por unidad es S/ 2.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Te permite proyectar la ganancia neta unitaria y total que dejará un producto considerando el costo de adquisición o fabricación y los gastos de marketing.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <PackageCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Costos y Unidades</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="costPrice"
              label="Costo unitario de compra/fabricación"
              prefix="S/"
              value={form.costPrice}
              onChange={(costPrice) => setForm({ ...form, costPrice })}
              placeholder="25.00"
              required
            />

            <InputNumber
              id="salePrice"
              label="Precio de venta unitario cobrado"
              prefix="S/"
              value={form.salePrice}
              onChange={(salePrice) => setForm({ ...form, salePrice })}
              placeholder="60.00"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="estimatedMonthlyUnits"
              label="Cantidad de unidades estimadas al mes"
              value={form.estimatedMonthlyUnits}
              onChange={(estimatedMonthlyUnits) => setForm({ ...form, estimatedMonthlyUnits })}
              placeholder="100"
              required
            />

            <InputNumber
              id="advertisingCostPerUnit"
              label="Gasto en publicidad por venta (opcional)"
              prefix="S/"
              value={form.advertisingCostPerUnit || 0}
              onChange={(advertisingCostPerUnit) => setForm({ ...form, advertisingCostPerUnit })}
              helpText="Pauta digital por unidad"
              placeholder="2.00"
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 dark:border-slate-800 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Utilidad Mensual
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                🇵🇪 En Soles
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border border-emerald-200/60 dark:border-slate-800 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Ganancia Neta Mensual
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {formatCurrency(result.estimatedMonthlyTotalProfit)}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                Por las {formatNumber(form.estimatedMonthlyUnits)} unidades estimadas
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Ganancia por Unidad"
                value={formatCurrency(result.unitProfit)}
                type="success"
                subValue={`Margen: ${formatPercent(result.marginPercentage)}`}
              />
              <ResultMetricCard
                label="Ingreso Total Bruto"
                value={formatCurrency(result.estimatedMonthlyGrossRevenue)}
                type="neutral"
                subValue="Venta acumulada"
              />
            </div>

            <ShareButtons title="Ganancia por Producto" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
