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

  const shareSummary = `Proyección de Ganancia por Producto:
• Utilidad Neta Mensual: ${formatCurrency(result.estimatedMonthlyTotalProfit)}
• Facturación Total: ${formatCurrency(result.estimatedMonthlyGrossRevenue)} (${formatNumber(form.estimatedMonthlyUnits)} u./mes)
• Ganancia por Unidad: ${formatCurrency(result.unitProfit)}
• Margen sobre Venta: ${formatPercent(result.marginPercentage)} | Mark-up: ${formatPercent(result.markupPercentage)}`;

  const faqs = [
    {
      question: '¿Qué es el costo de publicidad por unidad (CAC unitario)?',
      answer: 'Es el presupuesto de marketing invertido (en Facebook Ads, TikTok Ads, Google o volantes) dividido entre el número total de unidades efectivamente vendidas. Si inviertes S/ 200 en pauta publicitaria para vender 100 unidades de un artículo, tu costo de publicidad unitario es de S/ 2.00, el cual debe deducirse directamente de tu margen.',
    },
    {
      question: '¿Cuál es la diferencia entre el Margen sobre Venta y el Mark-up?',
      answer: 'El Margen sobre Venta mide qué porcentaje del precio final cobrado al cliente te queda como ganancia neta en caja. El Mark-up mide el porcentaje de recargo que aplicaste sobre tu costo de adquisición. Ambos son útiles, pero para estados de resultados y rentabilidad contable siempre se utiliza el Margen sobre Venta.',
    },
    {
      question: '¿Qué otros costos variables deben considerarse por cada producto?',
      answer: 'Además del costo de compra o manufactura y la publicidad, deben sumarse los costos de empaque (caja o bolsa de despacho), comisión de pasarela o POS (3% a 4%), flete de distribución y una pequeña reserva para mermas o devoluciones (~2%).',
    },
    {
      question: '¿Cómo proyectar el volumen de ventas mensual para nuevos productos?',
      answer: 'Para productos nuevos se recomienda realizar un análisis de sensibilidad en tres escenarios: Conservador (30 a 50 unidades), Moderado (100 unidades) y Optimista (250+ unidades). Esto te permite saber si el producto genera suficiente flujo para justificar el capital de trabajo inmovilizado.',
    },
    {
      question: '¿El cálculo debe hacerse con o sin IGV?',
      answer: 'Para una evaluación de rentabilidad comercial limpia, el análisis debe formularse sobre valores netos sin IGV. El IGV recaudado le pertenece a la SUNAT y distorsiona el margen real si se contabiliza como ingreso propio.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              ¿Cómo calcular la Ganancia Neta Unitaria y Proyectada de un Producto?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Comprender la <strong>economía unitaria (Unit Economics)</strong> de cada producto es vital para emprendedores de comercio electrónico, tiendas físicas y distribuidores en el Perú. Permite saber con exactitud cuánto dinero deja cada venta después de cubrir la fabricación o importación, el empaque y la inversión en publicidad digital.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Fórmulas de Economía Unitaria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Ganancia Neta por Unidad:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Precio de venta neto cobrado menos la suma de todos los costos directos y marketing.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Ganancia Unit. = Precio Venta - Costo Producto - Publicidad Unit.
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-800 dark:text-sky-400 block">• Utilidad Total Mensual Proyectada:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Ganancia líquida total multiplicada por el volumen estimado de colocación mensual.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Utilidad Mes = Ganancia Unit. × Unidades Vendidas
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico comercial (Tienda de accesorios en redes sociales)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Un negocio vende mochilas urbanas con un costo de adquisición de S/ 25.00 y las comercializa a S/ 60.00 neto. Invierte en pauta de TikTok Ads un equivalente a S/ 2.00 por venta y coloca 100 mochilas al mes:
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Indicador Unitario</th>
                    <th className="p-2.5">Valor por Mochila</th>
                    <th className="p-2.5">Total Mes (100 u.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">Precio de Venta Neto</td>
                    <td className="p-2.5 font-mono font-semibold">S/ 60.00</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">S/ 6,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Costo de Adquisición / Fabricación</td>
                    <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">-S/ 25.00</td>
                    <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">-S/ 2,500.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Costo de Publicidad Digital (Ads)</td>
                    <td className="p-2.5 font-mono text-amber-700 dark:text-amber-400">-S/ 2.00</td>
                    <td className="p-2.5 font-mono text-amber-700 dark:text-amber-400">-S/ 200.00</td>
                  </tr>
                  <tr className="bg-emerald-50/60 dark:bg-emerald-950/30">
                    <td className="p-2.5 font-bold text-emerald-950 dark:text-emerald-300">Ganancia Neta Líquida</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">S/ 33.00 / u.</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">S/ 3,300.00 libres</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <PackageCheck className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Costos y Proyección de Unidades</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="costPrice"
              label="Costo unitario de compra o fabricación"
              prefix="S/"
              value={form.costPrice}
              onChange={(costPrice) => setForm({ ...form, costPrice })}
              helpText="Insumos o compra a proveedor"
              placeholder="25.00"
              required
            />

            <InputNumber
              id="salePrice"
              label="Precio de venta unitario cobrado"
              prefix="S/"
              value={form.salePrice}
              onChange={(salePrice) => setForm({ ...form, salePrice })}
              helpText="Precio neto sin IGV"
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
              min={1}
              helpText="Ventas proyectadas del artículo"
              placeholder="100"
              required
            />

            <InputNumber
              id="adCost"
              label="Costo publicitario por unidad (opcional)"
              prefix="S/"
              value={form.advertisingCostPerUnit || 0}
              onChange={(advertisingCostPerUnit) => setForm({ ...form, advertisingCostPerUnit })}
              helpText="Gasto en pauta publicitaria por venta"
              placeholder="2.00"
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Proyección de Ganancia
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                Mensual
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Utilidad Total Estimada al Mes
              </span>
              <div className="text-3xl sm:text-5xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-mono tabular-nums break-words leading-tight">
                {formatCurrency(result.estimatedMonthlyTotalProfit)}
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Ganancia neta por unidad: {formatCurrency(result.unitProfit)}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Facturación Total"
                value={formatCurrency(result.estimatedMonthlyGrossRevenue)}
                type="neutral"
                subValue={`${formatNumber(form.estimatedMonthlyUnits)} unidades`}
              />
              <ResultMetricCard
                label="Margen Comercial"
                value={formatPercent(result.marginPercentage)}
                type="success"
                subValue={`Mark-up: ${formatPercent(result.markupPercentage)}`}
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-2xl bg-white/90 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5 border border-emerald-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex justify-between font-medium">
                <span>Costo total en mercadería:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">{formatCurrency(form.costPrice * form.estimatedMonthlyUnits)}</span>
              </div>
              {(form.advertisingCostPerUnit || 0) > 0 && (
                <div className="flex justify-between font-medium">
                  <span>Gasto mensual en pauta publicitaria:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400 tabular-nums font-mono">
                    {formatCurrency((form.advertisingCostPerUnit || 0) * form.estimatedMonthlyUnits)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Rendimiento sobre costo (Mark-up):</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums font-mono">{formatPercent(result.markupPercentage)}</span>
              </div>
            </div>

            <ShareButtons title="Ganancia Proyectada por Producto" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
