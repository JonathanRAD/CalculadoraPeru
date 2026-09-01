'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateIgv, IgvCalculationMode } from '@/core/calculators/tax';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Receipt, CheckCircle2 } from 'lucide-react';

export default function CalculadoraIgvPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'calculadora-igv')!;

  const [amount, setAmount] = useState<number>(100);
  const [mode, setMode] = useState<IgvCalculationMode>('add_igv');

  const result = calculateIgv({ amount, mode });

  const shareSummary = `Base Imponible: ${formatCurrency(result.baseAmount)}
IGV (18% SUNAT): ${formatCurrency(result.igvAmount)}
Total Facturado: ${formatCurrency(result.totalAmount)}`;

  const faqs = [
    {
      question: '¿Cómo se compone la tasa del IGV del 18% en el Perú?',
      answer: 'La tasa oficial del 18% está compuesta por un 16% de IGV (Impuesto General a las Ventas) más un 2% de IPM (Impuesto de Promoción Municipal). Ambos se recaudan conjuntamente por la SUNAT en todas las facturas y boletas.',
    },
    {
      question: '¿Cómo extraer el IGV de un total facturado?',
      answer: 'Para saber la base imponible de un producto con precio final en soles, se divide el monto total entre 1.18. Por ejemplo: S/ 118 / 1.18 = S/ 100 de Base Imponible y S/ 18 de IGV.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El <strong>Impuesto General a las Ventas (IGV)</strong> grava todas las transferencias de bienes y prestación de servicios en el Perú con una tasa del <strong>18%</strong>.
          </p>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200">Fórmulas del IGV:</div>
            <div>• <strong>Agregar IGV</strong>: Total = Base Imponible × 1.18</div>
            <div>• <strong>Extraer IGV</strong>: Base Imponible = Total / 1.18 | IGV = Total - Base Imponible</div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Selecciona la operación de IGV</h2>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 dark:bg-slate-950 p-1.5 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMode('add_igv')}
              className={`rounded-xl py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'add_igv'
                  ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ➕ Agregar IGV (a subtotal)
            </button>
            <button
              type="button"
              onClick={() => setMode('extract_igv')}
              className={`rounded-xl py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'extract_igv'
                  ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ✂️ Extraer IGV (de total)
            </button>
          </div>

          <InputNumber
            id="amount"
            label={mode === 'add_igv' ? 'Monto Subtotal (Base Imponible sin IGV)' : 'Monto Total Facturado (con IGV incluido)'}
            prefix="S/"
            value={amount}
            onChange={(amount) => setAmount(amount)}
            helpText={mode === 'add_igv' ? 'Monto neto a facturar' : 'Precio final de la boleta/factura'}
            placeholder="100.00"
            required
          />

          <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 p-4 border border-emerald-200/80 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Desglose Legal Tributario Perú:</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              • IGV (16%): {formatCurrency(result.baseAmount * 0.16)} | • IPM (2%): {formatCurrency(result.baseAmount * 0.02)}
            </p>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 dark:border-slate-800 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Liquidación Tributaria
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                SUNAT 18%
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-amber-200 dark:border-amber-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {mode === 'add_igv' ? 'Monto Total Facturado (con IGV)' : 'Base Imponible Neta'}
              </span>
              <div
                title={formatCurrency(mode === 'add_igv' ? result.totalAmount : result.baseAmount)}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-900 dark:text-amber-400 mt-1 font-mono tracking-tight truncate max-w-full px-2"
              >
                {formatCurrency(mode === 'add_igv' ? result.totalAmount : result.baseAmount)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                {mode === 'add_igv'
                  ? `Incluye ${formatCurrency(result.igvAmount)} de IGV (18%)`
                  : `IGV extraído: ${formatCurrency(result.igvAmount)}`}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Base Imponible"
                value={formatCurrency(result.baseAmount)}
                type="neutral"
                subValue="Ingreso neto de tu negocio"
              />
              <ResultMetricCard
                label="Monto del IGV (18%)"
                value={formatCurrency(result.igvAmount)}
                type="warning"
                subValue="Para declarar a SUNAT"
              />
            </div>

            <ShareButtons title="Cálculo de IGV (18%)" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
