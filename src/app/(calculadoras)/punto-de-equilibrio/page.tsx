'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateBreakEven, BreakEvenInput } from '@/core/calculators/breakeven';
import { formatCurrency, formatNumber, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Scale, AlertCircle } from 'lucide-react';

export default function PuntoDeEquilibrioPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'punto-de-equilibrio')!;

  const [form, setForm] = useState<BreakEvenInput>({
    fixedCosts: 3000,
    salePricePerUnit: 50,
    variableCostPerUnit: 30,
  });

  const result = calculateBreakEven(form);

  const shareSummary = `Punto de Equilibrio: ${formatNumber(result.unitsNeeded)} unidades/mes
Ventas Mínimas: ${formatCurrency(result.minimumSalesAmount)} (sin IGV)
Margen Contribución: ${formatCurrency(result.contributionMarginUnit)} por unidad`;

  const faqs = [
    {
      question: '¿Qué son los Costos Fijos mensuales?',
      answer: 'Son los gastos que pagas obligatoriamente todos los meses vendas o no vendas: Alquiler del local o taller, sueldos fijos o tu propia remuneración, internet, luz básica, contador, software, etc.',
    },
    {
      question: '¿Qué son los Costos Variables por unidad?',
      answer: 'Son los costos que solo se generan cuando vendes una unidad: Materia prima, costo de compra al por mayor, empaque, comisión por venta, bolsas, etc.',
    },
    {
      question: '¿Qué pasa si mi precio de venta es menor a mi costo variable?',
      answer: 'Tu negocio tendrá un margen de contribución negativo. Significa que por cada producto que vendes estás perdiendo dinero directamente, por lo que nunca alcanzarás el punto de equilibrio hasta subir el precio o bajar los costos.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El <strong>Punto de Equilibrio</strong> es el nivel mínimo de ventas necesario para que los ingresos de tu empresa cubran la totalidad de los costos fijos y variables.
          </p>
          <p>
            En este punto no ganas ni pierdes dinero (Utilidad = 0). A partir de la unidad {result.unitsNeeded + 1}, cada venta se convierte en ganancia neta para tu bolsillo.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Scale className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ingresa los costos de tu negocio</h2>
          </div>

          <InputNumber
            id="fixedCosts"
            label="Costos fijos mensuales totales"
            prefix="S/"
            value={form.fixedCosts}
            onChange={(fixedCosts) => setForm({ ...form, fixedCosts })}
            helpText="Alquiler, sueldos fijos, servicios"
            placeholder="3000.00"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="price"
              label="Precio de venta unitario (sin IGV)"
              prefix="S/"
              value={form.salePricePerUnit}
              onChange={(salePricePerUnit) => setForm({ ...form, salePricePerUnit })}
              helpText="Precio cobrado neto"
              placeholder="50.00"
              required
            />

            <InputNumber
              id="variableCost"
              label="Costo variable por unidad"
              prefix="S/"
              value={form.variableCostPerUnit}
              onChange={(variableCostPerUnit) => setForm({ ...form, variableCostPerUnit })}
              helpText="Insumo + empaque unitario"
              placeholder="30.00"
              required
            />
          </div>

          {!result.isFeasible && (
            <div className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 p-4 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>
                <strong>Atención:</strong> El precio de venta debe ser mayor al costo variable por unidad para que el negocio sea viable.
              </span>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-300 dark:border-blue-800/80 bg-blue-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-blue-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Meta mínima de ventas
              </span>
              <span className="rounded-full bg-blue-700 dark:bg-blue-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                MYPE Perú
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Punto de Equilibrio Requerido
              </span>
              <div className="text-3xl sm:text-5xl font-black text-blue-800 dark:text-blue-400 mt-1 font-mono tracking-tight">
                {formatNumber(result.unitsNeeded)} unidades
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Vender mínimo {Math.ceil(result.unitsNeeded / 26)} unidades por día (26 días al mes)
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Ventas mínimas (sin IGV)"
                value={formatCurrency(result.minimumSalesAmount)}
                type="neutral"
                subValue="Para cubrir todos tus costos"
              />
              <ResultMetricCard
                label="Margen Contribución"
                value={formatCurrency(result.contributionMarginUnit)}
                type="success"
                subValue={`Ratio: ${formatPercent(result.contributionMarginRatio)}`}
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-2xl bg-white/90 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5 border border-blue-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex justify-between font-medium">
                <span>Ventas mínimas facturadas (con IGV 18%):</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(result.minimumSalesWithIgv)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Costos fijos a cubrir:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(form.fixedCosts)}</span>
              </div>
            </div>

            <ShareButtons title="Punto de Equilibrio" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
