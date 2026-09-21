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

  const shareSummary = `Análisis de Rentabilidad Comercial:
• Margen de Ganancia Real: ${formatPercent(result.profitMarginPercentage)} sobre la venta
• Mark-up sobre Costo: ${formatPercent(result.markupPercentage)}
• Ganancia Líquida por Unidad: ${formatCurrency(result.profitPerUnit)}
• Precio Neto sin IGV: ${formatCurrency(result.priceWithoutIgv)}`;

  const faqs = [
    {
      question: '¿Cuál es la diferencia crítica entre Margen de Ganancia y Mark-up?',
      answer: 'El Margen de Ganancia mide qué porcentaje del precio final cobrado al cliente corresponde a utilidad neta en tu bolsillo (Fórmula: Ganancia ÷ Precio de Venta). El Mark-up, en cambio, mide el sobreprecio porcentual aplicado por encima del costo de compra (Fórmula: Ganancia ÷ Costo). Por ejemplo: si compras un producto a S/ 50.00 y lo vendes a S/ 100.00, tu Mark-up es del 100%, pero tu Margen de Ganancia real es del 50%.',
    },
    {
      question: '¿Por qué el IGV (18%) altera drásticamente el margen si no se desglosa?',
      answer: 'El 18% de IGV que pagó el cliente en una boleta de venta le pertenece íntegramente a la SUNAT y no forma parte de los ingresos propios de tu negocio. Si vendes a S/ 100.00 con IGV, tu ingreso neto real es de S/ 84.75. Si calculas tu ganancia restando S/ 50.00 a los S/ 100.00, creerás falsamente que ganas S/ 50.00, cuando tu ganancia líquida real es únicamente de S/ 34.75.',
    },
    {
      question: '¿Qué margen de ganancia es considerado saludable para una MYPE en Perú?',
      answer: 'Depende del sector económico: en comercio minorista (retail y abarrotes) los márgenes netos saludables oscilan entre el 15% y el 25%; en manufactura y confecciones textiles entre el 30% y el 45%; y en servicios profesionales o consultoría pueden superar el 50% al 70%, debido a que su estructura de costos directos es menor.',
    },
    {
      question: '¿Cómo afecta ofrecer descuentos promocionales sobre el margen real?',
      answer: 'Si tu producto tiene un margen de ganancia del 25% y ofreces un descuento del 20% en una campaña publicitaria, no estás reduciendo tu ganancia en un 20%: estás eliminando el 80% de tu utilidad neta. Por ello, antes de lanzar promociones o liquidaciones, es indispensable conocer el margen neto exacto de cada línea de producto.',
    },
    {
      question: '¿Qué sucede si el margen de ganancia resulta negativo?',
      answer: 'Un margen negativo indica que el precio de venta cobrado (descontando impuestos) es inferior al costo directo del producto. En este escenario, cada venta realizada genera una pérdida directa para la empresa. Se requiere de inmediato renegociar costos de insumos con proveedores o reestructurar la lista de precios.',
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
              ¿Cómo calcular y optimizar el Margen de Ganancia en el Perú?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              El <strong>Margen de Ganancia</strong> es el termómetro fundamental de la salud financiera de cualquier negocio comercial o empresa en el Perú. Permite determinar con absoluta precisión cuánto dinero queda en caja tras pagar el costo de los productos y los tributos de ley ante la <strong>SUNAT</strong>.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-4 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Comparativa Conceptual: Margen sobre Venta vs. Mark-up sobre Costo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Margen de Utilidad sobre la Venta (%):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Porcentaje de cada Sol ingresado que se transforma en beneficio neto libre.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Margen % = ((Precio Neto - Costo) ÷ Precio Neto) × 100
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-800 dark:text-sky-400 block">• Mark-up sobre el Costo (%):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Porcentaje de recargo aplicado sobre el valor de adquisición del insumo o producto.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Mark-up % = ((Precio Neto - Costo) ÷ Costo) × 100
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico con desglose de IGV (SUNAT)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Un comerciante adquiere una prenda de vestir al por mayor a un costo de S/ 50.00 y la ofrece al público a S/ 100.00 con boleta de venta (incluye 18% de IGV):
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Rubro Comercial</th>
                    <th className="p-2.5">Monto en Soles</th>
                    <th className="p-2.5">Porcentaje Efectivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">Precio Cobrado al Cliente (con IGV)</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">S/ 100.00</td>
                    <td className="p-2.5 font-mono text-slate-500">100.00%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">IGV a pagar a SUNAT (18% desglosado: 100 / 1.18 × 0.18)</td>
                    <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">S/ 15.25</td>
                    <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">15.25%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Ingreso Neto Real de la Empresa (sin IGV)</td>
                    <td className="p-2.5 font-mono font-semibold text-slate-800 dark:text-slate-200">S/ 84.75</td>
                    <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">84.75%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Costo de Adquisición del Producto</td>
                    <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">S/ 50.00</td>
                    <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">50.00%</td>
                  </tr>
                  <tr className="bg-emerald-50/60 dark:bg-emerald-950/30">
                    <td className="p-2.5 font-bold text-emerald-950 dark:text-emerald-300">Ganancia Neta por Unidad</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">S/ 34.75</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">Margen Real: 41.00%</td>
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
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ingresa los precios de tu producto</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="cost"
              label="Costo del producto (sin IGV)"
              prefix="S/"
              value={form.cost}
              onChange={(cost) => setForm({ ...form, cost })}
              helpText="Costo de compra al proveedor o insumos"
              placeholder="50.00"
              required
            />

            <InputNumber
              id="salePrice"
              label="Precio de venta cobrado"
              prefix="S/"
              value={form.salePrice}
              onChange={(salePrice) => setForm({ ...form, salePrice })}
              helpText="Precio al público en tienda o catálogo"
              placeholder="100.00"
              required
            />
          </div>

          <SwitchToggle
            id="priceIncludesIgv"
            label="¿El precio de venta incluye IGV (18%)?"
            description="Recomendado para calcular el margen real neto descontando el tributo fiscal ante SUNAT"
            checked={form.priceIncludesIgv}
            onChange={(priceIncludesIgv) => setForm({ ...form, priceIncludesIgv })}
            badge="SUNAT"
          />

          {result.profitMarginPercentage < 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 p-4 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>
                <strong>Margen Negativo:</strong> Estás vendiendo por debajo del costo neto. Incurres en pérdidas directas por cada transacción.
              </span>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Rentabilidad Comercial
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                🇵🇪 En Soles
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Margen de Ganancia Real
              </span>
              <div className="text-3xl sm:text-5xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-mono tabular-nums break-words leading-tight">
                {formatPercent(result.profitMarginPercentage)}
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                De cada S/ 100 vendidos, te quedan {formatCurrency(result.profitMarginPercentage)} limpios
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Ganancia neta / unidad"
                value={formatCurrency(result.profitPerUnit)}
                type="success"
                subValue="Utilidad líquida en caja"
              />
              <ResultMetricCard
                label="Mark-up sobre costo"
                value={formatPercent(result.markupPercentage)}
                type="neutral"
                subValue="Recargo sobre compra"
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-2xl bg-white/90 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5 border border-emerald-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex justify-between font-medium">
                <span>Precio neto sin IGV:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">{formatCurrency(result.priceWithoutIgv)}</span>
              </div>
              {form.priceIncludesIgv && (
                <div className="flex justify-between font-medium">
                  <span>IGV (18% para SUNAT):</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums font-mono">{formatCurrency(result.igvAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Costo directo del producto:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">{formatCurrency(form.cost)}</span>
              </div>
            </div>

            <ShareButtons title="Cálculo de Margen de Ganancia MYPE" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
