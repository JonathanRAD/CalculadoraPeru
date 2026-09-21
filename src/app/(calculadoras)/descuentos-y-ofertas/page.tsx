'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateDiscount, DiscountInput } from '@/core/calculators/discounts';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Tag } from 'lucide-react';

export default function DescuentosYOfertasPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'descuentos-y-ofertas')!;

  const [form, setForm] = useState<DiscountInput>({
    originalPrice: 120,
    discount1: 20,
    discount2: 10,
  });

  const result = calculateDiscount(form);

  const shareSummary = `Liquidación y Descuentos Comerciales:
• Precio Original: ${formatCurrency(form.originalPrice)}
• Descuento Efectivo Total: ${formatCurrency(result.totalSavings)} (${formatPercent(result.effectiveDiscountPercentage)})
• Precio Final de Oferta: ${formatCurrency(result.finalPrice)}`;

  const faqs = [
    {
      question: '¿Por qué un descuento de 20% + 10% adicional NO suma 30%?',
      answer: 'Es el error conceptual más frecuente en compras comerciales. En promociones con descuentos sucesivos, el segundo descuento (10%) no se aplica sobre el precio original, sino sobre el saldo ya rebajado tras el primer descuento (80% restante). Por ejemplo: sobre S/ 100.00, el 20% reduce el precio a S/ 80.00; luego el 10% de S/ 80.00 es S/ 8.00, resultando en un precio final de S/ 72.00. El descuento único equivalente real es del 28%, no del 30%.',
    },
    {
      question: '¿Qué exige INDECOPI respecto a las promociones y ofertas en Perú?',
      answer: 'La Ley de Protección y Defensa del Consumidor (Ley 29571) prohíbe la publicidad engañosa y el inflado artificial previo de precios para simular falsas ofertas ("rebajas ficticias"). Todo descuento debe tomar como base el precio ordinario habitual cobrado durante las últimas semanas, y las condiciones de la promoción (como stock mínimo disponible o vigencia de fechas) deben informarse con claridad.',
    },
    {
      question: '¿Cómo afecta ofrecer descuentos al margen de ganancia del comerciante?',
      answer: 'Los descuentos impactan directamente sobre la ganancia neta, no sobre el costo de adquisición del producto. Si tu producto te deja un 25% de margen y otorgas un 20% de rebaja al cliente, estás sacrificando el 80% de tu ganancia en Soles. Por ello, toda campaña promocional de liquidación debe planificarse conociendo el margen de contribución previo.',
    },
    {
      question: '¿El descuento aplica sobre el precio con IGV o sin IGV?',
      answer: 'En ventas al por menor y consumo masivo en el Perú, los precios en etiqueta incluyen obligatoriamente el 18% de IGV. Por ende, el porcentaje de descuento se aplica directamente sobre el precio final exhibido con IGV, lo que reduce proporcionalmente tanto la base imponible como el monto de IGV facturado en la boleta electrónica.',
    },
    {
      question: '¿Cómo se calcula el Descuento Único Equivalente (DUE)?',
      answer: 'La fórmula matemática para dos descuentos sucesivos D1 y D2 es: DUE = [D1 + D2 - (D1 × D2 ÷ 100)]%. Para 20% y 10%: DUE = 20 + 10 - (200 ÷ 100) = 30 - 2 = 28% exacto.',
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
              ¿Cómo calcular Descuentos Sucesivos y Rebajas de Oferta en Perú?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Tanto para consumidores que buscan verificar el ahorro real en campañas comerciales (Cyber Days, Black Friday, liquidaciones de temporada) como para comerciantes que diseñan promociones atractivas, dominar la matemática de los <strong>descuentos sucesivos</strong> evita falsas expectativas y protege la rentabilidad de las ventas.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Fórmulas Matemáticas de Descuento Sucesivo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Precio Final de Oferta:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Multiplica el precio original por los factores residuales de cada descuento sucesivo.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Precio Final = Precio Original × (1 - D1%) × (1 - D2%)
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-800 dark:text-sky-400 block">• Descuento Único Equivalente (DUE %):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Porcentaje total efectivo de rebaja consolidada sobre el valor original.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  DUE% = [D1 + D2 - ((D1 × D2) ÷ 100)]%
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico: Prenda de vestir con oferta y cupón bancario
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Un producto tiene un precio de lista de S/ 120.00. La tienda ofrece un 20% de descuento de liquidación más un 10% adicional pagando con una tarjeta de crédito específica:
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Etapa del Cálculo</th>
                    <th className="p-2.5">Operación Aritmética</th>
                    <th className="p-2.5">Monto Resultante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">Precio Original de Lista</td>
                    <td className="p-2.5 text-slate-500">Precio base en etiqueta</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">S/ 120.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Primer Descuento (-20%)</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">S/ 120.00 × 0.20 = Ahorro S/ 24.00</td>
                    <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">S/ 96.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Segundo Descuento (-10% sobre S/ 96)</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">S/ 96.00 × 0.10 = Ahorro S/ 9.60</td>
                    <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">S/ 86.40</td>
                  </tr>
                  <tr className="bg-emerald-50/60 dark:bg-emerald-950/30">
                    <td className="p-2.5 font-bold text-emerald-950 dark:text-emerald-300">Precio Final a Pagar en Caja</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">Ahorro Total: S/ 33.60</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">S/ 86.40 (DUE: 28.00%)</td>
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
              <Tag className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ingresa los datos de la oferta</h2>
          </div>

          <InputNumber
            id="originalPrice"
            label="Precio original del producto"
            prefix="S/"
            value={form.originalPrice}
            onChange={(originalPrice) => setForm({ ...form, originalPrice })}
            placeholder="120.00"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="discount1"
              label="Descuento principal"
              suffix="%"
              value={form.discount1}
              onChange={(discount1) => setForm({ ...form, discount1 })}
              placeholder="20"
              max={100}
              required
            />

            <InputNumber
              id="discount2"
              label="Descuento adicional (opcional)"
              suffix="%"
              value={form.discount2 || 0}
              onChange={(discount2) => setForm({ ...form, discount2 })}
              helpText="Ej: 10% con tarjeta, app o cupón"
              placeholder="10"
              max={100}
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Liquidación de Oferta
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                🇵🇪 En Soles
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Precio Final con Descuento
              </span>
              <div className="text-3xl sm:text-5xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-mono tabular-nums break-words leading-tight">
                {formatCurrency(result.finalPrice)}
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Ahorras en total {formatCurrency(result.totalSavings)} ({formatPercent(result.effectiveDiscountPercentage)})
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Ahorro Total"
                value={formatCurrency(result.totalSavings)}
                type="success"
                subValue="Descuento monetario"
              />
              <ResultMetricCard
                label="Descuento Real Único"
                value={formatPercent(result.effectiveDiscountPercentage)}
                type="neutral"
                subValue="Equivalente acumulado"
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-2xl bg-white/90 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5 border border-emerald-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex justify-between font-medium">
                <span>Precio de lista original:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">{formatCurrency(form.originalPrice)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Primer descuento ({form.discount1}%):</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">-{formatCurrency((form.originalPrice * form.discount1) / 100)}</span>
              </div>
              {form.discount2 ? (
                <div className="flex justify-between font-medium">
                  <span>Segundo descuento ({form.discount2}% s/ saldo):</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                    -{formatCurrency(((form.originalPrice * (100 - form.discount1)) / 100 * form.discount2) / 100)}
                  </span>
                </div>
              ) : null}
            </div>

            <ShareButtons title="Cálculo de Descuentos y Ofertas" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
