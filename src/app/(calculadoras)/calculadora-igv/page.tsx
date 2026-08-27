'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateIgv, IgvInput, IgvCalculationMode } from '@/core/calculators/tax';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Receipt, Check, ArrowLeftRight } from 'lucide-react';

export default function CalculadoraIgvPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'calculadora-igv')!;

  const [mode, setMode] = useState<IgvCalculationMode>('add_igv');
  const [amount, setAmount] = useState<number>(100);

  const result = calculateIgv({
    amount,
    mode,
  });

  const shareSummary = mode === 'add_igv'
    ? `Base Imponible: ${formatCurrency(result.baseAmount)}
IGV (18%): ${formatCurrency(result.igvAmount)}
Total a Facturar: ${formatCurrency(result.totalAmount)}`
    : `Total Facturado: ${formatCurrency(result.totalAmount)}
Subtotal (sin IGV): ${formatCurrency(result.baseAmount)}
IGV Extraído (18%): ${formatCurrency(result.igvAmount)}`;

  const faqs = [
    {
      question: '¿Cómo se desglosa el 18% del IGV en Perú?',
      answer: 'El 18% está compuesto por un 16% correspondiente al Impuesto General a las Ventas (IGV propiamente dicho) y un 2% al Impuesto de Promoción Municipal (IPM). Ambos se liquidan de forma unificada ante la SUNAT.',
    },
    {
      question: '¿Cómo extraer el IGV de un precio total manualmente?',
      answer: 'Para obtener la Base Imponible a partir del Total con IGV, divide el monto total entre 1.18. Por ejemplo: S/ 118 / 1.18 = S/ 100 de Base, y la diferencia (S/ 18) es el IGV.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El <strong>Impuesto General a las Ventas (IGV)</strong> grava el valor agregado de todas las transacciones comerciales en el Perú con una tasa oficial del 18%.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <h4 className="font-bold text-emerald-900 text-sm">Modo: Calcular IGV (Agregar)</h4>
              <p className="text-xs text-emerald-800 mt-1">
                Ingresas el valor de tus servicios o productos sin impuestos (Subtotal) y la herramienta le suma el 18% para obtener el total a cobrar en tu factura.
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              <h4 className="font-bold text-blue-900 text-sm">Modo: Extraer IGV (Desglosar)</h4>
              <p className="text-xs text-blue-800 mt-1">
                Ingresas el total ya cobrado o el monto final de una boleta y la herramienta extrae cuánto es la base real y cuánto debes declarar a SUNAT.
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
            <Receipt className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Selecciona la operación tributaria</h2>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setMode('add_igv')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                mode === 'add_igv'
                  ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-emerald-600" />
              Calcular IGV (Agregar 18%)
            </button>

            <button
              type="button"
              onClick={() => setMode('extract_igv')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                mode === 'extract_igv'
                  ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-emerald-600" />
              Extraer IGV (Desglosar)
            </button>
          </div>

          <InputNumber
            id="amount"
            label={mode === 'add_igv' ? 'Monto Subtotal / Base Imponible (sin IGV)' : 'Monto Total Facturado (con IGV incluido)'}
            prefix="S/"
            value={amount}
            onChange={(val) => setAmount(val)}
            helpText="Monto en Soles"
            placeholder="100.00"
            required
          />

          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-900 border border-emerald-200/60">
            <span className="font-bold">Tasa Oficial SUNAT:</span> 18.00% (16% IGV + 2% Impuesto de Promoción Municipal).
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-white to-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Desglose SUNAT
              </span>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Tributario
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white border border-emerald-200/60 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {mode === 'add_igv' ? 'Total Factura a Cobrar' : 'Subtotal Neto (Base)'}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1">
                {formatCurrency(mode === 'add_igv' ? result.totalAmount : result.baseAmount)}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                {mode === 'add_igv' ? 'Monto total con IGV incluido' : 'Valor real antes del impuesto'}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="IGV (18%)"
                value={formatCurrency(result.igvAmount)}
                type="warning"
                subValue="A declarar ante SUNAT"
              />
              <ResultMetricCard
                label={mode === 'add_igv' ? 'Base Imponible' : 'Total Cobrado'}
                value={formatCurrency(mode === 'add_igv' ? result.baseAmount : result.totalAmount)}
                type="neutral"
                subValue={mode === 'add_igv' ? 'Subtotal original' : 'Monto total boleta'}
              />
            </div>

            <ShareButtons title="Cálculo de IGV 18% SUNAT" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
