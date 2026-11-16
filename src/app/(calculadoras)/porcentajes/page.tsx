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
import { PayslipResult } from '@/shared/components/ui/PayslipResult';
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

  const faqs = [
    {
      question: '¿Cómo calcular rápidamente el 18% de IGV de un importe?',
      answer: 'Para calcular el 18% de IGV sobre un subtotal neto, simplemente multiplica la base imponible por 0.18 (por ejemplo: S/ 250 × 0.18 = S/ 45.00 de IGV). Si deseas obtener el precio final con IGV incluido directamente, multiplica por 1.18 (S/ 250 × 1.18 = S/ 295.00).',
    },
    {
      question: '¿Cómo calcular qué porcentaje representa una cantidad sobre el total?',
      answer: 'Divide la porción o subtotal entre el importe total de referencia y multiplica el resultado por 100. Por ejemplo, si tuviste 45 ventas efectivas sobre 180 cotizaciones enviadas: (45 ÷ 180) × 100 = 25.00% de tasa de conversión.',
    },
    {
      question: '¿Cómo se calcula la tasa de variación porcentual (crecimiento o caída)?',
      answer: 'La fórmula matemática es: [(Valor Final - Valor Inicial) ÷ Valor Inicial] × 100. Si las ventas del mes pasado fueron de S/ 10,000 y este mes subieron a S/ 13,500: [(13,500 - 10,000) ÷ 10,000] × 100 = +35.00% de crecimiento.',
    },
    {
      question: '¿Cuáles son las tasas de detracción más comunes de SUNAT en Perú?',
      answer: 'El Sistema de Pago de Obligaciones Tributarias (SPOT o Detracciones) de la SUNAT aplica tasas porcentuales sobre el valor total de facturas de servicios y bienes sujetos: 4% para arrendamiento de bienes muebles, 10% para demás servicios empresariales y mantenimiento, y 12% para intermediación laboral o tercerización.',
    },
    {
      question: '¿Por qué un aumento de 50% seguido de una reducción de 50% no regresa al valor original?',
      answer: 'Porque las bases sobre las que se calcula el porcentaje cambian: si un activo de S/ 100.00 sube 50%, alcanza S/ 150.00. Luego, si cae 50%, la reducción se aplica sobre S/ 150.00 (-S/ 75.00), quedando en S/ 75.00 (una pérdida acumulada del 25% respecto a los S/ 100 iniciales).',
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
              ¿Cómo calcular Porcentajes, Proporciones y Variaciones Financieras?
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              El cálculo de porcentajes es una operación cotidiana fundamental en el comercio, la contabilidad y las finanzas en el Perú. Permite determinar el impacto de impuestos tributarios (<strong>IGV 18%</strong>, detracciones, percepciones), calcular comisiones de venta, tasas de interés bancarias y medir el crecimiento de metas empresariales.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-[#18202A] p-5 border border-slate-200 dark:border-[#2C3744] space-y-3 text-[13px] leading-relaxed">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              1. Fórmulas Matemáticas de Porcentajes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1.5 p-3.5 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Porcentaje de un Total:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  ¿Cuánto es el X% de una cifra total Y?
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Resultado = (X × Y) ÷ 100
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Proporción Porcentual:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  ¿Qué porcentaje representa A respecto a B?
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  % = (A ÷ B) × 100
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-amber-800 dark:text-amber-400 block">• Variación Porcentual:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Crecimiento o caída entre valor inicial y actual.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Δ% = ((V2 - V1) ÷ V1) × 100
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-lg border-2 border-slate-200/90 dark:border-[#2C3744] bg-white dark:bg-[#18202A] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#2C3744] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
              <Percent className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Operación con Porcentajes</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-100 dark:bg-[#0E141B] p-1.5 border border-slate-200 dark:border-[#2C3744]">
            <button
              type="button"
              onClick={() => setMode('percentOf')}
              className={`rounded py-2.5 text-[13px] font-bold transition-all cursor-pointer ${
                mode === 'percentOf'
                  ? 'bg-white dark:bg-slate-800 text-brand-800 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ¿Cuánto es X% de Y?
            </button>
            <button
              type="button"
              onClick={() => setMode('whatPercent')}
              className={`rounded py-2.5 text-[13px] font-bold transition-all cursor-pointer ${
                mode === 'whatPercent'
                  ? 'bg-white dark:bg-slate-800 text-brand-800 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ¿Qué % es A de B?
            </button>
            <button
              type="button"
              onClick={() => setMode('change')}
              className={`rounded py-2.5 text-[13px] font-bold transition-all cursor-pointer ${
                mode === 'change'
                  ? 'bg-white dark:bg-slate-800 text-brand-800 dark:text-brand-300'
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
          <PayslipResult
            title="Resultado del cálculo"
            amountHeader="Valor"
            lines={[
              {
                label: 'Operación',
                amount:
                  mode === 'percentOf'
                    ? `(${percentX} × ${totalY}) ÷ 100`
                    : mode === 'whatPercent'
                      ? `(${partA} ÷ ${totalB}) × 100`
                      : `(${newVal} − ${oldVal}) ÷ ${oldVal} × 100`,
              },
            ]}
            totalLabel={
              mode === 'percentOf'
                ? `El ${percentX}% de ${totalY}`
                : mode === 'whatPercent'
                  ? `${partA} respecto a ${totalB}`
                  : `Variación de ${oldVal} a ${newVal}`
            }
            totalAmount={
              mode === 'percentOf'
                ? formatNumber(res1)
                : mode === 'whatPercent'
                  ? formatPercent(res2)
                  : `${res3.isIncrease ? '+' : '-'}${formatPercent(res3.change)}`
            }
            footnote={
              mode === 'change'
                ? res3.isIncrease
                  ? `Incremento de ${formatNumber(newVal - oldVal)} unidades`
                  : `Reducción de ${formatNumber(oldVal - newVal)} unidades`
                : undefined
            }
          >
            <ShareButtons
              title="Cálculo de Porcentajes"
              shareText={`Resultado Porcentajes: ${mode === 'percentOf' ? `${percentX}% de ${totalY} = ${res1}` : mode === 'whatPercent' ? `${partA} de ${totalB} = ${res2}%` : `Variación de ${oldVal} a ${newVal} = ${res3.isIncrease ? '+' : '-'}${res3.change}%`}`}
            />
          </PayslipResult>
        </div>

      </div>
    </CalculatorShell>
  );
}
