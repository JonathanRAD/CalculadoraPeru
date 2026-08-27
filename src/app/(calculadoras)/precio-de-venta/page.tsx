'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateSalePrice, SalePriceInput } from '@/core/calculators/pricing';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { ShoppingBag, TrendingUp, DollarSign, Percent, ShieldAlert } from 'lucide-react';

export default function PrecioDeVentaPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'precio-de-venta')!;

  const [form, setForm] = useState<SalePriceInput>({
    cost: 10,
    marginPercentage: 30,
    includeIgv: true,
    salesCommissionPercentage: 3.5,
    otherCosts: 0.5,
  });

  const result = calculateSalePrice(form);

  const shareSummary = `Precio Venta Sugerido: ${formatCurrency(result.recommendedSalePrice)}
Ganancia Neta: ${formatCurrency(result.profitPerUnit)} (${formatPercent(result.realMarginPercentage)})
IGV (18%): ${formatCurrency(result.igvAmount)}`;

  const faqs = [
    {
      question: '¿Por qué no debo sumar simplemente el porcentaje al costo?',
      answer: 'Si un producto cuesta S/ 100 y le sumas el 30% (S/ 130), al venderlo por S/ 130 tu margen real sobre la venta será solo del 23.07%, no del 30%. La fórmula comercial profesional divide el costo entre (1 - Margen%), garantizando que tu utilidad sobre el precio final sea exactamente la deseada.',
    },
    {
      question: '¿Cómo afecta el IGV (18%) al precio de venta al público en Perú?',
      answer: 'En Perú, las ventas al consumidor final (boleta) deben mostrar obligatoriamente el precio con IGV incluido. El 18% no es ganancia para ti, sino un impuesto retenido que se declara mensualmente a la SUNAT.',
    },
    {
      question: '¿Qué comisión debo ingresar si cobro por Yape, Plin o POS?',
      answer: 'Las pasarelas y POS físicos como Niubiz, Izipay o Mercado Pago cobran entre 3.2% y 3.99% + IGV por transacción. Yape para empresas cobra una pequeña comisión si superas los límites mensuales. Puedes ingresar ese porcentaje en el campo opcional para que la calculadora lo cubra sin tocar tu margen de ganancia.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Fijar un precio de venta incorrecto es una de las principales causas de quiebra en las MYPES peruanas.
            Al calcular tu precio ideal debes contemplar 4 elementos indispensables:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Costo directo del producto</strong>: Lo que pagas a tu proveedor o lo que te cuesta fabricarlo.</li>
            <li><strong>Costos operativos adicionales</strong>: Empaque, etiquetas, bolsa ecológica, packaging y delivery.</li>
            <li><strong>Comisión por cobrar</strong>: Si aceptas pagos digitales (Yape, Plin, tarjeta), debes cubrir el ~3.5%.</li>
            <li><strong>IGV 18% (SUNAT)</strong>: Si emites boleta o factura, este monto se añade al precio final.</li>
          </ul>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShoppingBag className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Ingresa los datos de tu producto</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="cost"
              label="Costo del producto (sin IGV)"
              prefix="S/"
              value={form.cost}
              onChange={(cost) => setForm({ ...form, cost })}
              helpText="Costo de compra o insumos"
              placeholder="10.00"
              required
            />

            <InputNumber
              id="margin"
              label="Margen de ganancia deseado"
              suffix="%"
              value={form.marginPercentage}
              onChange={(marginPercentage) => setForm({ ...form, marginPercentage })}
              helpText="Ej: 30% a 50%"
              placeholder="30"
              max={99}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="otherCosts"
              label="Costos adicionales (opcional)"
              prefix="S/"
              value={form.otherCosts || 0}
              onChange={(otherCosts) => setForm({ ...form, otherCosts })}
              helpText="Empaque, caja, delivery"
              placeholder="0.50"
            />

            <InputNumber
              id="commission"
              label="Comisión de venta (opcional)"
              suffix="%"
              value={form.salesCommissionPercentage || 0}
              onChange={(salesCommissionPercentage) => setForm({ ...form, salesCommissionPercentage })}
              helpText="Yape, Niubiz, POS (3.5%)"
              placeholder="3.5"
            />
          </div>

          <SwitchToggle
            id="includeIgv"
            label="¿El precio al público debe incluir IGV (18%)?"
            description="Actívalo si emites boleta de venta con IGV incluido"
            checked={form.includeIgv}
            onChange={(includeIgv) => setForm({ ...form, includeIgv })}
            badge="SUNAT"
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-white to-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Resultado sugerido
              </span>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                🇵🇪 En Soles
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white border border-emerald-200/60 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Precio de Venta Recomendado
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1">
                {formatCurrency(result.recommendedSalePrice)}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                {form.includeIgv ? '(Incluye IGV 18%)' : '(Precio Neto sin IGV)'}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Ganancia por unidad"
                value={formatCurrency(result.profitPerUnit)}
                type="success"
                subValue={`Margen real: ${formatPercent(result.realMarginPercentage)}`}
              />
              <ResultMetricCard
                label="IGV a pagar (18%)"
                value={formatCurrency(result.igvAmount)}
                type="neutral"
                subValue={result.igvAmount > 0 ? 'Para declarar a SUNAT' : 'No incluido'}
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 space-y-2 mb-5 border border-slate-100">
              <div className="flex justify-between">
                <span>Costo Total Unitario:</span>
                <span className="font-bold text-slate-800">{formatCurrency(result.totalCostPerUnit)}</span>
              </div>
              {result.commissionAmount > 0 && (
                <div className="flex justify-between">
                  <span>Comisión Pasarela ({form.salesCommissionPercentage}%):</span>
                  <span className="font-bold text-slate-800">{formatCurrency(result.commissionAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Precio Base (sin IGV):</span>
                <span className="font-bold text-slate-800">{formatCurrency(result.basePriceWithoutIgv)}</span>
              </div>
            </div>

            {/* Share and Copy Actions */}
            <ShareButtons title="Cálculo de Precio de Venta" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
