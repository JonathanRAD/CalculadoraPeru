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
    estimatedMonthlyUnits: 150,
    advertisingCostPerUnit: 5,
  });

  const result = calculateProfitPerProduct(form);

  const shareSummary = `Ganancia por Unidad: ${formatCurrency(result.unitProfit)} (Margen: ${formatPercent(result.marginPercentage)})
Ganancia Mensual Proyectada: ${formatCurrency(result.estimatedMonthlyTotalProfit)}
Facturación Mensual: ${formatCurrency(result.estimatedMonthlyGrossRevenue)}`;

  const faqs = [
    {
      question: '¿Por qué debo incluir la publicidad unitaria (CPA/Pauta)?',
      answer: 'Si vendes por internet (Facebook Ads, TikTok, Mercado Libre), el costo de adquisición de cliente es un costo directo por venta. Si no lo descuentas por unidad, tus proyecciones de ganancia mensual no reflejarán el flujo de caja real.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Te permite proyectar la rentabilidad total mensual de un producto específico multiplicando su ganancia unitaria neta por el volumen de ventas proyectado.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PackageCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Costos unitarios y volumen</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="costPrice"
              label="Costo del producto (compra)"
              prefix="S/"
              value={form.costPrice}
              onChange={(costPrice) => setForm({ ...form, costPrice })}
              placeholder="25.00"
              required
            />

            <InputNumber
              id="salePrice"
              label="Precio de venta cobrado"
              prefix="S/"
              value={form.salePrice}
              onChange={(salePrice) => setForm({ ...form, salePrice })}
              placeholder="60.00"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="advertising"
              label="Gasto en publicidad por venta (opcional)"
              prefix="S/"
              value={form.advertisingCostPerUnit || 0}
              onChange={(advertisingCostPerUnit) => setForm({ ...form, advertisingCostPerUnit })}
              helpText="Costo pauta digital / ads"
              placeholder="5.00"
            />

            <InputNumber
              id="monthlyUnits"
              label="Ventas estimadas al mes"
              suffix="unidades"
              value={form.estimatedMonthlyUnits}
              onChange={(estimatedMonthlyUnits) => setForm({ ...form, estimatedMonthlyUnits })}
              placeholder="150"
              required
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-white to-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Proyección de Ganancia
              </span>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                E-commerce
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white border border-emerald-200/60 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Ganancia Neta Mensual
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1">
                {formatCurrency(result.estimatedMonthlyTotalProfit)}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Vendiendo {formatNumber(form.estimatedMonthlyUnits)} unidades al mes
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Ganancia por unidad"
                value={formatCurrency(result.unitProfit)}
                type="success"
                subValue={`Margen: ${formatPercent(result.marginPercentage)}`}
              />
              <ResultMetricCard
                label="Facturación Bruta"
                value={formatCurrency(result.estimatedMonthlyGrossRevenue)}
                type="neutral"
                subValue="Ventas totales al mes"
              />
            </div>

            <ShareButtons title="Ganancia por Producto" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
