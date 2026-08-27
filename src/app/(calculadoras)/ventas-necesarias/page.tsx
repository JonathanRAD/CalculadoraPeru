'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateTargetSales, TargetSalesInput } from '@/core/calculators/targetSales';
import { formatCurrency, formatNumber } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Target, AlertCircle } from 'lucide-react';

export default function VentasNecesariasPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'ventas-necesarias')!;

  const [form, setForm] = useState<TargetSalesInput>({
    targetNetProfit: 5000,
    fixedMonthlyCosts: 2000,
    unitSalePrice: 80,
    unitVariableCost: 35,
  });

  const result = calculateTargetSales(form);

  const shareSummary = `Meta de Ganancia: ${formatCurrency(form.targetNetProfit)}
Unidades a Vender: ${formatNumber(result.unitsToSell)} al mes (${result.dailyUnitsToSell}/día)
Facturación Necesaria: ${formatCurrency(result.totalSalesRequired)}`;

  const faqs = [
    {
      question: '¿Por qué esta fórmula es más precisa que solo dividir la meta entre el precio?',
      answer: 'Porque tiene en cuenta que cada producto vendido incurre en un costo variable y que primero debes pagar la totalidad de tus costos fijos antes de poder quedarte con tu meta de ganancia líquida.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Cálculo financiero inverso para fijar metas comerciales claras y alcanzables para tu equipo de ventas o tu tienda.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Target className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Define tu objetivo financiero</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="targetProfit"
              label="Meta de ganancia neta deseada"
              prefix="S/"
              value={form.targetNetProfit}
              onChange={(targetNetProfit) => setForm({ ...form, targetNetProfit })}
              helpText="Tu sueldo o utilidad libre al mes"
              placeholder="5000.00"
              required
            />

            <InputNumber
              id="fixedCosts"
              label="Costos fijos mensuales"
              prefix="S/"
              value={form.fixedMonthlyCosts}
              onChange={(fixedMonthlyCosts) => setForm({ ...form, fixedMonthlyCosts })}
              helpText="Alquiler, sueldos fijos, luz"
              placeholder="2000.00"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="unitPrice"
              label="Precio de venta por producto"
              prefix="S/"
              value={form.unitSalePrice}
              onChange={(unitSalePrice) => setForm({ ...form, unitSalePrice })}
              placeholder="80.00"
              required
            />

            <InputNumber
              id="unitCost"
              label="Costo variable por producto"
              prefix="S/"
              value={form.unitVariableCost}
              onChange={(unitVariableCost) => setForm({ ...form, unitVariableCost })}
              placeholder="35.00"
              required
            />
          </div>

          {!result.isFeasible && (
            <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-4 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>
                El precio de venta debe ser superior al costo variable unitario.
              </span>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-white to-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Meta Comercial
              </span>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Objetivo
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white border border-emerald-200/60 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Unidades a Vender al Mes
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1">
                {formatNumber(result.unitsToSell)} unidades
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Meta diaria: ~{result.dailyUnitsToSell} unidades / día (26 días hábiles)
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Facturación Requerida"
                value={formatCurrency(result.totalSalesRequired)}
                type="neutral"
                subValue="Ventas brutas a generar"
              />
              <ResultMetricCard
                label="Margen Contribución"
                value={formatCurrency(result.contributionMarginUnit)}
                type="success"
                subValue="Por cada producto vendido"
              />
            </div>

            <ShareButtons title="Ventas Necesarias para Ganar S/ X" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
