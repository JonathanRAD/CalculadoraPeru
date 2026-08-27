'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateProfitMargin, MarginInput } from '@/core/calculators/margin';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function MargenDeGananciaPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'margen-de-ganancia')!;

  const [form, setForm] = useState<MarginInput>({
    cost: 50,
    salePrice: 100,
    priceIncludesIgv: true,
  });

  const result = calculateProfitMargin(form);

  const shareSummary = `Margen de Ganancia: ${formatPercent(result.profitMarginPercentage)}
Mark-up sobre costo: ${formatPercent(result.markupPercentage)}
Ganancia Neta: ${formatCurrency(result.profitPerUnit)} por unidad`;

  const faqs = [
    {
      question: '¿Cuál es la diferencia entre Margen de Ganancia y Mark-up?',
      answer: 'El Margen de Ganancia mide cuánto de tu precio de venta final es utilidad real (Ganancia / Precio de Venta). El Mark-up mide cuánto le estás recargando a tu costo de compra (Ganancia / Costo). Por ejemplo: si compras a S/ 50 y vendes a S/ 100, tu Mark-up es 100%, pero tu Margen real es 50%.',
    },
    {
      question: '¿Por qué el IGV altera mi margen si no lo desgloso?',
      answer: 'El 18% de IGV que cobras en una boleta le pertenece a la SUNAT. Si vendes a S/ 100 con IGV, tu ingreso neto real es S/ 84.75. Si no descuentas el IGV antes de calcular tu ganancia, creerás que estás ganando más de lo que realmente ingresa a tu cuenta.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El <strong>Margen de Ganancia</strong> es el indicador de rentabilidad más importante para cualquier comerciante o empresa en el Perú.
          </p>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200">Fórmulas Oficiales:</div>
            <div>• <strong>Margen de Utilidad (%)</strong> = (Precio Neto - Costo) / Precio Neto × 100</div>
            <div>• <strong>Mark-up sobre Costo (%)</strong> = (Precio Neto - Costo) / Costo × 100</div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ingresa los precios de tu producto</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="cost"
              label="Costo del producto (sin IGV)"
              prefix="S/"
              value={form.cost}
              onChange={(cost) => setForm({ ...form, cost })}
              helpText="Costo de compra o insumos"
              placeholder="50.00"
              required
            />

            <InputNumber
              id="salePrice"
              label="Precio de venta cobrado"
              prefix="S/"
              value={form.salePrice}
              onChange={(salePrice) => setForm({ ...form, salePrice })}
              helpText="Precio al público"
              placeholder="100.00"
              required
            />
          </div>

          <SwitchToggle
            id="priceIncludesIgv"
            label="¿El precio de venta incluye IGV (18%)?"
            description="Recomendado para calcular el margen real neto descontando SUNAT"
            checked={form.priceIncludesIgv}
            onChange={(priceIncludesIgv) => setForm({ ...form, priceIncludesIgv })}
            badge="SUNAT"
          />

          {result.profitMarginPercentage < 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 p-4 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>
                <strong>Margen Negativo:</strong> Estás vendiendo por debajo del costo. Estás perdiendo dinero por cada venta.
              </span>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 dark:border-slate-800 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Rentabilidad Comercial
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                🇵🇪 En Soles
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border border-emerald-200/60 dark:border-slate-800 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Margen de Ganancia Real
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {formatPercent(result.profitMarginPercentage)}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                De cada S/ 100 vendidos, te quedan {formatCurrency(result.profitMarginPercentage)} limpios
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Ganancia neta / unidad"
                value={formatCurrency(result.profitPerUnit)}
                type="success"
                subValue="Utilidad líquida"
              />
              <ResultMetricCard
                label="Mark-up sobre costo"
                value={formatPercent(result.markupPercentage)}
                type="neutral"
                subValue="Recargo sobre compra"
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 text-xs text-slate-600 dark:text-slate-300 space-y-2 mb-5 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Precio neto sin IGV:</span>
                <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(result.priceWithoutIgv)}</span>
              </div>
              {form.priceIncludesIgv && (
                <div className="flex justify-between">
                  <span>IGV (18% para SUNAT):</span>
                  <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(result.igvAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Costo del producto:</span>
                <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(form.cost)}</span>
              </div>
            </div>

            <ShareButtons title="Cálculo de Margen de Ganancia" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
