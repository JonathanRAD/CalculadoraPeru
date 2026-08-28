'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateHonorarios, HonorariosInput } from '@/core/calculators/honorarios';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { FileText, CheckCircle2 } from 'lucide-react';

export default function ReciboPorHonorariosPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'recibo-por-honorarios')!;

  const [grossAmount, setGrossAmount] = useState<number>(2000);
  const [hasSuspension, setHasSuspension] = useState<boolean>(false);

  const result = calculateHonorarios({
    grossAmount,
    hasSuspension,
  });

  const shareSummary = `Recibo por Honorarios:
Monto Bruto: ${formatCurrency(result.grossAmount)}
Retención 4ta Categoría (8%): ${formatCurrency(result.retentionAmount)}
Neto a Cobrar: ${formatCurrency(result.netAmountToReceive)}`;

  const faqs = [
    {
      question: '¿Cuándo aplica la retención del 8% en recibos por honorarios?',
      answer: 'Aplica cuando el monto individual del recibo supera los S/ 1,500 y no cuentas con la constancia de suspensión de retenciones de 4ta categoría emitida por la SUNAT.',
    },
    {
      question: '¿Cómo tramitar la Suspensión de Retenciones de 4ta Categoría?',
      answer: 'Se tramita gratuitamente en la web de SUNAT con tu Clave SOL (Formulario Virtual 1609), siempre que tus ingresos anuales proyectados por rentas de 4ta categoría no superen el límite anual fijado por SUNAT (aprox. S/ 45,063 al año).',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El <strong>Recibo por Honorarios Electrónico</strong> es el comprobante de pago que emiten las personas naturales que prestan servicios de manera independiente en el Perú (Rentas de Cuarta Categoría).
          </p>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200">Reglas SUNAT:</div>
            <div>• Si el monto es <strong>≤ S/ 1,500</strong>: No hay retención (cobras el 100%).</div>
            <div>• Si el monto es <strong>&gt; S/ 1,500</strong>: La empresa retiene el 8% y paga el 92% restante.</div>
            <div>• Con <strong>Suspensión de 4ta</strong>: No hay retención sin importar el monto del recibo.</div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos del Recibo por Honorarios</h2>
          </div>

          <InputNumber
            id="grossAmount"
            label="Monto pactado o bruto del servicio"
            prefix="S/"
            value={grossAmount}
            onChange={(grossAmount) => setGrossAmount(grossAmount)}
            helpText="Monto total antes de la retención"
            placeholder="2000.00"
            required
          />

          <SwitchToggle
            id="hasSuspension"
            label="¿Cuentas con Suspensión de Retenciones de 4ta Categoría?"
            description="Formulario 1609 de SUNAT (aplica 0% de retención)"
            checked={hasSuspension}
            onChange={(hasSuspension) => setHasSuspension(hasSuspension)}
            badge="SUNAT"
          />

          {result.isRetentionApplicable ? (
            <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              <strong>Aplica retención del 8%:</strong> Por ser mayor a S/ 1,500.00, la empresa te retendrá {formatCurrency(result.retentionAmount)} para declararlo ante la SUNAT.
            </div>
          ) : (
            <div className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span><strong>Sin retención:</strong> Cobras el 100% íntegro del monto pactado.</span>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-amber-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Neto a Cobrar en Cuenta
              </span>
              <span className="rounded-full bg-amber-700 dark:bg-amber-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                4ta Categoría
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-amber-200 dark:border-amber-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Monto Neto a Recibir
              </span>
              <div className="text-3xl sm:text-5xl font-black text-amber-900 dark:text-amber-400 mt-1 font-mono tracking-tight">
                {formatCurrency(result.netAmountToReceive)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Importe neto transferido por la empresa
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Retención 8% SUNAT"
                value={formatCurrency(result.retentionAmount)}
                type="warning"
                subValue={result.retentionAmount > 0 ? 'Pago a cuenta de Renta' : 'S/ 0.00 (Exonerado)'}
              />
              <ResultMetricCard
                label="Monto Bruto Total"
                value={formatCurrency(result.grossAmount)}
                type="neutral"
                subValue="Importe en recibo"
              />
            </div>

            <ShareButtons title="Recibo por Honorarios (SUNAT)" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
