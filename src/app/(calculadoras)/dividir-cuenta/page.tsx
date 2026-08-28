'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateSplitBill, SplitBillInput } from '@/core/calculators/splitBill';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Utensils, Users } from 'lucide-react';

export default function DividirCuentaPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'dividir-cuenta')!;

  const [totalBill, setTotalBill] = useState<number>(180);
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(4);

  const result = calculateSplitBill({
    totalBill,
    tipPercentage,
    numberOfPeople,
  });

  const shareSummary = `Dividir Cuenta Restaurante:
Cuenta Total: ${formatCurrency(result.totalWithTip)} (con ${tipPercentage}% propina)
Total Personas: ${numberOfPeople}
Cada uno debe Yapear: ${formatCurrency(result.amountPerPerson)}`;

  const faqs = [
    {
      question: '¿Es obligatoria la propina en los restaurantes en Perú?',
      answer: 'No, la propina en Perú es voluntaria y suele ser del 10% del consumo como agradecimiento por una buena atención. Algunos locales incluyen un recargo al consumo legal de hasta 13%, el cual ya viene impreso en la pre-cuenta.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Divide rápidamente el consumo en restaurantes, pollerías o reuniones entre amigos y calcula el monto exacto que cada uno debe transferir por Yape o Plin.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Utensils className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos de la Cuenta</h2>
          </div>

          <InputNumber
            id="totalBill"
            label="Monto total del consumo (Boleta/Pre-cuenta)"
            prefix="S/"
            value={totalBill}
            onChange={(totalBill) => setTotalBill(totalBill)}
            placeholder="180.00"
            required
          />

          {/* Quick Tip Selection */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
              Propina sugerida
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTipPercentage(pct)}
                  className={`rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer border ${
                    tipPercentage === pct
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 ring-1 ring-amber-600'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {pct === 0 ? 'Sin propina' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          <InputNumber
            id="people"
            label="Número de personas para dividir"
            value={numberOfPeople}
            onChange={(numberOfPeople) => setNumberOfPeople(numberOfPeople)}
            min={1}
            max={50}
            helpText="¿Entre cuántos se divide?"
            placeholder="4"
            required
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-amber-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Monto Individual a Pagar
              </span>
              <span className="rounded-full bg-amber-700 dark:bg-amber-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                📲 Yape / Plin
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-amber-200 dark:border-amber-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Cada uno debe pagar
              </span>
              <div
                title={formatCurrency(result.amountPerPerson)}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-900 dark:text-amber-400 mt-1 font-mono tracking-tight truncate max-w-full px-2"
              >
                {formatCurrency(result.amountPerPerson)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                Dividido entre {numberOfPeople} personas
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Total a Pagar en Caja"
                value={formatCurrency(result.totalWithTip)}
                type="neutral"
                subValue={`Propina: ${formatCurrency(result.tipAmount)}`}
              />
              <ResultMetricCard
                label="Propina por Persona"
                value={formatCurrency(result.tipPerPerson)}
                type="success"
                subValue={`Tasa: ${tipPercentage}%`}
              />
            </div>

            <ShareButtons title="Dividir Cuenta y Propina" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
