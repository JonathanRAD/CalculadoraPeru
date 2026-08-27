'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateTargetSales, TargetSalesInput } from '@/core/calculators/targetSales';
import { formatCurrency, formatNumber } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Target } from 'lucide-react';

export default function VentasNecesariasPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'ventas-necesarias')!;

  const [form, setForm] = useState<TargetSalesInput>({
    targetNetProfit: 5000,
    fixedMonthlyCosts: 3000,
    unitSalePrice: 50,
    unitVariableCost: 30,
  });

  const result = calculateTargetSales(form);

  const shareSummary = `Meta de Ganancia: ${formatCurrency(form.targetNetProfit)}/mes
Unidades a Vender: ${formatNumber(result.unitsToSell)} unidades
Facturación Necesaria: ${formatCurrency(result.totalSalesRequired)} (sin IGV)`;

  const faqs = [
    {
      question: '¿En qué se diferencia del Punto de Equilibrio?',
      answer: 'El Punto de Equilibrio calcula las ventas para no ganar ni perder (Utilidad = 0). Las Ventas Necesarias calculan las unidades requeridas para alcanzar una ganancia neta deseada específica por encima de todos tus costos fijos.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Te permite planificar con exactitud cuántas ventas diarias y mensuales necesitas cerrar para alcanzar tu meta de ingresos netos en el Perú.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Define tu meta y estructura</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="targetNetProfit"
              label="Ganancia neta deseada al mes"
              prefix="S/"
              value={form.targetNetProfit}
              onChange={(targetNetProfit) => setForm({ ...form, targetNetProfit })}
              helpText="Tu sueldo o utilidad neta"
              placeholder="5000.00"
              required
            />

            <InputNumber
              id="fixedMonthlyCosts"
              label="Costos fijos mensuales"
              prefix="S/"
              value={form.fixedMonthlyCosts}
              onChange={(fixedMonthlyCosts) => setForm({ ...form, fixedMonthlyCosts })}
              helpText="Alquiler, sueldos, servicios"
              placeholder="3000.00"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="unitSalePrice"
              label="Precio de venta unitario (sin IGV)"
              prefix="S/"
              value={form.unitSalePrice}
              onChange={(unitSalePrice) => setForm({ ...form, unitSalePrice })}
              placeholder="50.00"
              required
            />

            <InputNumber
              id="unitVariableCost"
              label="Costo variable por unidad"
              prefix="S/"
              value={form.unitVariableCost}
              onChange={(unitVariableCost) => setForm({ ...form, unitVariableCost })}
              placeholder="30.00"
              required
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 dark:border-slate-800 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Meta Comercial
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                🇵🇪 En Soles
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border border-emerald-200/60 dark:border-slate-800 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Unidades a Vender Requeridas
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {formatNumber(result.unitsToSell)} unidades
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                Vender mínimo {result.dailyUnitsToSell} unidades por día (26 días hábiles)
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Facturación requerida"
                value={formatCurrency(result.totalSalesRequired)}
                type="success"
                subValue="Venta neta sin IGV"
              />
              <ResultMetricCard
                label="Margen Contribución"
                value={formatCurrency(result.contributionMarginUnit)}
                type="neutral"
                subValue="Por cada unidad"
              />
            </div>

            <ShareButtons title="Ventas Necesarias para Ganancia" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
