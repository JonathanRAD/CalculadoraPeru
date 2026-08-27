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
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Scale className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Ingresa los costos de tu negocio</h2>
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
            <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-4 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>
                <strong>Atención:</strong> El precio de venta debe ser mayor al costo variable por unidad para que el negocio sea viable.
              </span>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-white to-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Meta mínima de ventas
              </span>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                MYPE Perú
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white border border-emerald-200/60 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Punto de Equilibrio Requerido
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1">
                {formatNumber(result.unitsNeeded)} unidades
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
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
            <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 space-y-2 mb-5 border border-slate-100">
              <div className="flex justify-between">
                <span>Ventas mínimas facturadas (con IGV 18%):</span>
                <span className="font-bold text-slate-800">{formatCurrency(result.minimumSalesWithIgv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costos fijos a cubrir:</span>
                <span className="font-bold text-slate-800">{formatCurrency(form.fixedCosts)}</span>
              </div>
            </div>

            <ShareButtons title="Punto de Equilibrio" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
