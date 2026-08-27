'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import {
  calculatePercentOfTotal,
  calculateWhatPercentIs,
  calculatePercentageChange,
} from '@/core/calculators/percentages';
import { formatNumber, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function PorcentajesPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'porcentajes')!;

  // Caso 1: ¿Cuánto es el X% de Y?
  const [c1Percent, setC1Percent] = useState<number>(18);
  const [c1Total, setC1Total] = useState<number>(250);

  // Caso 2: ¿Qué porcentaje es X de Y?
  const [c2Part, setC2Part] = useState<number>(45);
  const [c2Total, setC2Total] = useState<number>(180);

  // Caso 3: Aumento o Disminución Porcentual
  const [c3Initial, setC3Initial] = useState<number>(100);
  const [c3Final, setC3Final] = useState<number>(135);

  const res1 = calculatePercentOfTotal(c1Percent, c1Total);
  const res2 = calculateWhatPercentIs(c2Part, c2Total);
  const res3 = calculatePercentageChange(c3Initial, c3Final);

  const shareSummary = `El ${c1Percent}% de ${c1Total} es ${res1}
${c2Part} representa el ${formatPercent(res2)} de ${c2Total}
Variación de ${c3Initial} a ${c3Final}: ${res3.isIncrease ? '+' : '-'}${formatPercent(res3.change)}`;

  const faqs = [
    {
      question: '¿Cómo calcular el porcentaje de una cantidad rápidamente?',
      answer: 'Multiplica el porcentaje por el valor total y divídelo entre 100. Por ejemplo, el 18% de 250 = (18 * 250) / 100 = 45.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Herramienta rápida 3 en 1 para resolver cualquier cálculo porcentual frecuente en compras, ventas o impuestos.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: X% de Y */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">¿Cuánto es el X% de Y?</h3>
            </div>

            <div className="space-y-4">
              <InputNumber
                id="c1Percent"
                label="Porcentaje (%)"
                suffix="%"
                value={c1Percent}
                onChange={setC1Percent}
                placeholder="18"
              />
              <InputNumber
                id="c1Total"
                label="De la cantidad"
                value={c1Total}
                onChange={setC1Total}
                placeholder="250"
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-4 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase">Resultado</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              {formatNumber(res1, 2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              El {c1Percent}% de {c1Total} es {res1}
            </div>
          </div>
        </div>

        {/* Card 2: Qué % es X de Y */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">¿Qué porcentaje es X de Y?</h3>
            </div>

            <div className="space-y-4">
              <InputNumber
                id="c2Part"
                label="La cantidad parcial (X)"
                value={c2Part}
                onChange={setC2Part}
                placeholder="45"
              />
              <InputNumber
                id="c2Total"
                label="Del total (Y)"
                value={c2Total}
                onChange={setC2Total}
                placeholder="180"
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-4 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase">Resultado</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              {formatPercent(res2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {c2Part} representa el {formatPercent(res2)} de {c2Total}
            </div>
          </div>
        </div>

        {/* Card 3: Variación % */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Variación Porcentual</h3>
            </div>

            <div className="space-y-4">
              <InputNumber
                id="c3Initial"
                label="Valor Inicial"
                value={c3Initial}
                onChange={setC3Initial}
                placeholder="100"
              />
              <InputNumber
                id="c3Final"
                label="Valor Final"
                value={c3Final}
                onChange={setC3Final}
                placeholder="135"
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-4 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {res3.isIncrease ? 'Incremento' : 'Disminución'}
            </span>
            <div className={`text-2xl sm:text-3xl font-black mt-1 flex items-center justify-center gap-1 ${
              res3.isIncrease ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {res3.isIncrease ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
              {formatPercent(res3.change)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              De {c3Initial} a {c3Final} ({res3.isIncrease ? '+ aumento' : '- descuento'})
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8">
        <ShareButtons title="Calculadora de Porcentajes Básicos" shareText={shareSummary} />
      </div>
    </CalculatorShell>
  );
}
