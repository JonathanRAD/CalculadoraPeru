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
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Percent } from 'lucide-react';

export default function PorcentajesPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'porcentajes')!;

  const [mode, setMode] = useState<'percentOf' | 'whatPercent' | 'change'>('percentOf');

  // Mode 1: What is X% of Y?
  const [percentX, setPercentX] = useState<number>(18);
  const [totalY, setTotalY] = useState<number>(250);

  // Mode 2: What percent is X of Y?
  const [partA, setPartA] = useState<number>(45);
  const [totalB, setTotalB] = useState<number>(180);

  // Mode 3: Percentage change from A to B
  const [oldVal, setOldVal] = useState<number>(100);
  const [newVal, setNewVal] = useState<number>(135);

  const res1 = calculatePercentOfTotal(percentX, totalY);
  const res2 = calculateWhatPercentIs(partA, totalB);
  const res3 = calculatePercentageChange(oldVal, newVal);

  return (
    <CalculatorShell
      meta={meta}
      educationalContent={
        <div className="space-y-3">
          <p>
            Herramienta multipropósito para resolver rápidamente las 3 operaciones con porcentajes más comunes en negocios y finanzas.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Percent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Operación con Porcentajes</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 dark:bg-slate-950 p-1.5 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMode('percentOf')}
              className={`rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                mode === 'percentOf'
                  ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ¿Cuánto es X% de Y?
            </button>
            <button
              type="button"
              onClick={() => setMode('whatPercent')}
              className={`rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                mode === 'whatPercent'
                  ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ¿Qué % es A de B?
            </button>
            <button
              type="button"
              onClick={() => setMode('change')}
              className={`rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                mode === 'change'
                  ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Variación % (A a B)
            </button>
          </div>

          {mode === 'percentOf' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputNumber
                id="pX"
                label="Porcentaje deseado"
                suffix="%"
                value={percentX}
                onChange={(percentX) => setPercentX(percentX)}
                placeholder="18"
                required
              />
              <InputNumber
                id="tY"
                label="Cantidad o Monto total"
                value={totalY}
                onChange={(totalY) => setTotalY(totalY)}
                placeholder="250"
                required
              />
            </div>
          )}

          {mode === 'whatPercent' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputNumber
                id="pA"
                label="Parte o porción (A)"
                value={partA}
                onChange={(partA) => setPartA(partA)}
                placeholder="45"
                required
              />
              <InputNumber
                id="tB"
                label="Total de referencia (B)"
                value={totalB}
                onChange={(totalB) => setTotalB(totalB)}
                placeholder="180"
                required
              />
            </div>
          )}

          {mode === 'change' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputNumber
                id="oV"
                label="Valor Inicial (anterior)"
                value={oldVal}
                onChange={(oldVal) => setOldVal(oldVal)}
                placeholder="100"
                required
              />
              <InputNumber
                id="nV"
                label="Valor Final (actual)"
                value={newVal}
                onChange={(newVal) => setNewVal(newVal)}
                placeholder="135"
                required
              />
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 dark:border-slate-800 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Resultado del Cálculo
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Porcentajes
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border border-emerald-200/60 dark:border-slate-800 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {mode === 'percentOf' && `El ${percentX}% de ${totalY}`}
                {mode === 'whatPercent' && `${partA} respecto a ${totalB}`}
                {mode === 'change' && `Variación de ${oldVal} a ${newVal}`}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {mode === 'percentOf' && formatNumber(res1)}
                {mode === 'whatPercent' && formatPercent(res2)}
                {mode === 'change' && `${res3.isIncrease ? '+' : '-'}${formatPercent(res3.change)}`}
              </div>
            </div>

            <ShareButtons
              title="Cálculo de Porcentajes"
              shareText={`Resultado Porcentajes: ${mode === 'percentOf' ? res1 : mode === 'whatPercent' ? res2 + '%' : res3.change + '%'}`}
            />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
