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

  const shareSummary = `Precio Original: ${formatCurrency(form.originalPrice)}
Descuento Total: ${formatCurrency(result.totalSavings)} (${formatPercent(result.effectiveDiscountPercentage)})
Precio Final de Oferta: ${formatCurrency(result.finalPrice)}`;

  const faqs = [
    {
      question: '¿Cómo funcionan los descuentos sucesivos (ej: 20% + 10%)?',
      answer: 'Un descuento de 20% + 10% adicional NO equivale a 30%. Primero se aplica el 20% sobre el precio original y luego el 10% sobre el saldo restante. Por ejemplo, sobre S/ 100: 20% baja a S/ 80, y el 10% de S/ 80 es S/ 8, dejando el precio final en S/ 72 (Descuento real acumulado: 28%).',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Calcular descuentos y rebajas sucesivas con exactitud te permite lanzar promociones atractivas para tus clientes sin sacrificar inesperadamente tus márgenes de ganancia.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Tag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
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
              helpText="Ej: 10% con tarjeta o cupón"
              placeholder="10"
              max={100}
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 dark:border-slate-800 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Liquidación de Oferta
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                🇵🇪 En Soles
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border border-emerald-200/60 dark:border-slate-800 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Precio Final a Cobrar
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {formatCurrency(result.finalPrice)}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                Ahorro total del cliente: {formatCurrency(result.totalSavings)}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Descuento Efectivo"
                value={formatPercent(result.effectiveDiscountPercentage)}
                type="success"
                subValue="Rebaja real acumulada"
              />
              <ResultMetricCard
                label="Monto Ahorrado"
                value={formatCurrency(result.totalSavings)}
                type="neutral"
                subValue="Menos que el original"
              />
            </div>

            <ShareButtons title="Descuentos y Ofertas" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
