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
import { LineChart, DollarSign, Percent } from 'lucide-react';

export default function MargenDeGananciaPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'margen-de-ganancia')!;

  const [form, setForm] = useState<MarginInput>({
    salePrice: 50,
    cost: 32,
    priceIncludesIgv: true,
  });

  const result = calculateProfitMargin(form);

  const shareSummary = `Margen de Ganancia: ${formatPercent(result.profitMarginPercentage)}
Ganancia por Unidad: ${formatCurrency(result.profitPerUnit)}
Mark-up sobre costo: ${formatPercent(result.markupPercentage)}`;

  const faqs = [
    {
      question: '¿Cuál es la diferencia entre Margen de Ganancia y Mark-up?',
      answer: 'El Margen de Ganancia mide qué porcentaje del precio final es tu beneficio neto ((Precio - Costo) / Precio). El Mark-up mide qué porcentaje le agregaste encima a tu costo ((Precio - Costo) / Costo). Por ejemplo, un 100% de Mark-up equivale a un 50% de Margen de ganancia.',
    },
    {
      question: '¿Por qué debo restar el IGV antes de calcular mi margen?',
      answer: 'Porque el IGV (18%) pertenece al Estado (SUNAT). Si calculas tu ganancia sobre un precio que tiene IGV, estarás inflando falsamente tu margen y asumiendo como propio un dinero que deberás pagar en tu liquidación mensual.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El <strong>Margen de Ganancia Bruto</strong> es el indicador de salud financiera más crítico de cualquier comercio en Perú.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <h4 className="font-bold text-emerald-900 text-sm">Margen de Ganancia</h4>
              <p className="text-xs text-emerald-800 mt-1">
                Representa el porcentaje de cada Sol vendido que queda en tu bolsillo.
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              <h4 className="font-bold text-blue-900 text-sm">Mark-up</h4>
              <p className="text-xs text-blue-800 mt-1">
                Representa el multiplicador que le sumas a tu costo de compra para fijar el precio.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <LineChart className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Ingresa tus precios actuales</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="salePrice"
              label="Precio de venta cobrado"
              prefix="S/"
              value={form.salePrice}
              onChange={(salePrice) => setForm({ ...form, salePrice })}
              helpText="Precio al que vendes el producto"
              placeholder="50.00"
              required
            />

            <InputNumber
              id="cost"
              label="Costo del producto (sin IGV)"
              prefix="S/"
              value={form.cost}
              onChange={(cost) => setForm({ ...form, cost })}
              helpText="Costo que pagas al proveedor"
              placeholder="32.00"
              required
            />
          </div>

          <SwitchToggle
            id="priceIncludesIgv"
            label="¿El precio de venta ingresado incluye IGV (18%)?"
            description="Si es precio final de boleta, la calculadora extraerá el IGV para darte tu margen real"
            checked={form.priceIncludesIgv}
            onChange={(priceIncludesIgv) => setForm({ ...form, priceIncludesIgv })}
            badge="Recomendado"
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-white to-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Margen Obtenido
              </span>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Rentabilidad
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white border border-emerald-200/60 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Margen de Ganancia Real
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1">
                {formatPercent(result.profitMarginPercentage)}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                De cada S/ 100 vendidos ganas {formatCurrency(result.profitMarginPercentage)} netos
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Ganancia por unidad"
                value={formatCurrency(result.profitPerUnit)}
                type="success"
                subValue="Utilidad neta en Soles"
              />
              <ResultMetricCard
                label="Mark-up sobre costo"
                value={formatPercent(result.markupPercentage)}
                type="warning"
                subValue="Sobreprecio aplicado"
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 space-y-2 mb-5 border border-slate-100">
              <div className="flex justify-between">
                <span>Precio Neto (sin IGV):</span>
                <span className="font-bold text-slate-800">{formatCurrency(result.priceWithoutIgv)}</span>
              </div>
              {form.priceIncludesIgv && (
                <div className="flex justify-between">
                  <span>IGV (18%) contenido:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(result.igvAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Costo del Producto:</span>
                <span className="font-bold text-slate-800">{formatCurrency(result.cost)}</span>
              </div>
            </div>

            <ShareButtons title="Cálculo de Margen de Ganancia" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
