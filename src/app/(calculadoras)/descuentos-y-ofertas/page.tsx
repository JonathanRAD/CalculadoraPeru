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
    originalPrice: 150,
    discount1: 20,
    discount2: 10,
  });

  const result = calculateDiscount(form);

  const shareSummary = `Precio Final con Rebaja: ${formatCurrency(result.finalPrice)}
Ahorro Total: ${formatCurrency(result.totalSavings)}
Descuento Real Equivalente: ${formatPercent(result.effectiveDiscountPercentage)}`;

  const faqs = [
    {
      question: '¿Por qué un descuento de 20% + 10% adicional NO es igual a 30%?',
      answer: 'Porque el segundo descuento del 10% se aplica sobre el precio ya rebajado, no sobre el precio original. Por ejemplo, en un producto de S/ 100: primero baja a S/ 80, y luego se le descuenta el 10% de S/ 80 (S/ 8), dando un precio final de S/ 72 (un descuento real del 28%, no del 30%).',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Esta herramienta te ayuda a verificar rebajas de Cyber Days, Black Friday o calcular el impacto de promociones comerciales en tu tienda.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Tag className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Ingresa el precio y los descuentos</h2>
          </div>

          <InputNumber
            id="originalPrice"
            label="Precio original (sin descuento)"
            prefix="S/"
            value={form.originalPrice}
            onChange={(originalPrice) => setForm({ ...form, originalPrice })}
            placeholder="150.00"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="discount1"
              label="Primer Descuento"
              suffix="%"
              value={form.discount1}
              onChange={(discount1) => setForm({ ...form, discount1 })}
              helpText="Descuento principal (ej: 20%)"
              placeholder="20"
              max={100}
              required
            />

            <InputNumber
              id="discount2"
              label="Segundo Descuento (opcional)"
              suffix="%"
              value={form.discount2 || 0}
              onChange={(discount2) => setForm({ ...form, discount2 })}
              helpText="Descuento adicional con tarjeta/cupón"
              placeholder="10"
              max={100}
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-white to-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Precio con Descuento
              </span>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Oferta
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white border border-emerald-200/60 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Precio Final a Pagar
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1">
                {formatCurrency(result.finalPrice)}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Descuento real total del {formatPercent(result.effectiveDiscountPercentage)}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Ahorro Total"
                value={formatCurrency(result.totalSavings)}
                type="success"
                subValue="Dinero que te ahorras"
              />
              <ResultMetricCard
                label="Precio tras 1er Descuento"
                value={formatCurrency(result.priceAfterFirstDiscount)}
                type="neutral"
                subValue={`Con ${form.discount1}%`}
              />
            </div>

            <ShareButtons title="Calculadora de Descuentos y Ofertas" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
