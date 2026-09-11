'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateHonorarios } from '@/core/calculators/honorarios';
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
      question: '¿A partir de qué monto se aplica obligatoriamente la retención del 8% en recibos por honorarios?',
      answer: 'Conforme a la normativa de SUNAT, la retención del 8% del Impuesto a la Renta de Cuarta Categoría es obligatoria cuando el importe bruto pactado en un único recibo por honorarios electrónico supera los S/ 1,500.00 y el pagador es una persona jurídica (empresa) o persona natural con negocio obligada a llevar contabilidad.',
    },
    {
      question: '¿Cómo se tramita la Suspensión de Retenciones de 4ta Categoría (Formulario 1609)?',
      answer: 'El trámite es 100% digital y gratuito a través del portal de SUNAT Operaciones en Línea con tu Clave SOL. Se presenta el Formulario Virtual N° 1609 ingresando la fecha de tu primer cobro del año y los ingresos anuales proyectados por cuarta categoría. Si no superas el tope anual establecido por SUNAT (aproximadamente S/ 45,063 anuales o ~S/ 3,755 mensuales), el sistema emite inmediatamente la constancia en PDF que debes adjuntar a tus clientes para que no te retengan el 8%.',
    },
    {
      question: '¿Qué sucede si emito varios recibos por honorarios de S/ 1,000 en el mismo mes a diferentes clientes?',
      answer: 'Si cada recibo individual es igual o menor a S/ 1,500.00, ninguna empresa te retendrá el 8% en el momento del pago. Sin embargo, si al finalizar el mes el total de tus ingresos por cuarta categoría supera el límite mensual fijado por SUNAT (S/ 3,755 aprox.), estarás obligado a realizar el pago a cuenta mensual del 8% directamente mediante el Formulario Virtual Declara Fácil 616.',
    },
    {
      question: '¿Cómo funciona la deducción del 20% y las 7 UIT en la Declaración Jurada Anual de Renta?',
      answer: 'Al término del ejercicio fiscal, las personas con rentas de cuarta categoría tienen derecho a descontar automáticamente un 20% de sus ingresos brutos por concepto de gastos operativos inherentes a su profesión (con un límite máximo de 24 UIT), y sobre la diferencia se descuentan adicionalmente 7 UIT inafectas (más hasta 3 UIT por gastos adicionales sustentados con boleta electrónica en restaurantes, hoteles o alquileres). Si tras estas deducciones tus ingresos anuales quedan cubiertos por el tramo inafecto, la SUNAT te devolverá el 100% de las retenciones del 8% efectuadas durante el año.',
    },
    {
      question: '¿Un trabajador en planilla (5ta categoría) puede emitir recibos por honorarios (4ta categoría)?',
      answer: 'Sí. Es completamente legal percibir simultáneamente rentas de 5ta categoría (dependiente en planilla) y rentas de 4ta categoría (servicios independientes), siempre que los servicios por honorarios no se presten a la misma empresa donde se labora en subordinación y no exista incompatibilidad horaria o cláusula de exclusividad.',
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
              Guía Tributaria: ¿Cómo opera la retención del 8% de Cuarta Categoría ante la SUNAT?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              El <strong>Recibo por Honorarios Electrónico (RHE)</strong> es el comprobante de pago oficial emitido por personas naturales que ejercen una profesión, arte, ciencia u oficio de manera independiente y sin relación de subordinación laboral, generando <strong>Rentas de Cuarta Categoría</strong> conforme al Texto Único Ordenado de la Ley del Impuesto a la Renta (Decreto Supremo N° 179-2004-EF).
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Parámetros y reglas de retención oficial de SUNAT
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Recibos hasta S/ 1,500.00:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  No se aplica retención en la fuente. El profesional percibe el 100% íntegro del monto pactado.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Retención = S/ 0.00 (Tasa 0%)
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-amber-800 dark:text-amber-400 block">• Recibos mayores a S/ 1,500.00:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  La empresa contratante retiene obligatoriamente el 8% y lo declara ante SUNAT. El profesional recibe el 92% neto en cuenta.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Retención = Monto Bruto × 0.08<br />
                  Neto a Cobrar = Monto Bruto × 0.92
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico numérico con y sin retención
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Un diseñador gráfico independiente cotiza dos servicios en el mes a clientes corporativos: uno por <strong>S/ 1,200.00</strong> y otro por <strong>S/ 3,500.00</strong>:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Comprobante Emitido</th>
                    <th className="p-2.5">Importe Bruto</th>
                    <th className="p-2.5">Retención SUNAT (8%)</th>
                    <th className="p-2.5">Neto Cobrado</th>
                    <th className="p-2.5">Condición Legal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-semibold">Recibo 1: Consultoría web</td>
                    <td className="p-2.5 font-mono">S/ 1,200.00</td>
                    <td className="p-2.5 font-mono text-slate-400">S/ 0.00 (0%)</td>
                    <td className="p-2.5 font-mono font-semibold">S/ 1,200.00</td>
                    <td className="p-2.5 text-emerald-700 dark:text-emerald-400 text-[11px]">Menor o igual a S/ 1,500</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Recibo 2: Branding integral</td>
                    <td className="p-2.5 font-mono">S/ 3,500.00</td>
                    <td className="p-2.5 font-mono text-red-600 dark:text-red-400">- S/ 280.00 (8%)</td>
                    <td className="p-2.5 font-mono font-semibold">S/ 3,220.00</td>
                    <td className="p-2.5 text-amber-700 dark:text-amber-400 text-[11px]">Mayor a S/ 1,500 sin suspensión</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950 font-bold">
                    <td className="p-2.5 text-slate-900 dark:text-white">Recibo 2 con Suspensión Form. 1609</td>
                    <td className="p-2.5 font-mono">S/ 3,500.00</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">S/ 0.00 (Exonerado)</td>
                    <td className="p-2.5 font-mono text-emerald-800 dark:text-emerald-300 text-sm">S/ 3,500.00</td>
                    <td className="p-2.5 text-emerald-700 dark:text-emerald-400 text-[11px]">Acreditado con constancia SOL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Base legal y resoluciones de SUNAT:</span>
            <p>
              • <strong>Decreto Supremo N° 179-2004-EF:</strong> Texto Único Ordenado de la Ley del Impuesto a la Renta (Artículos 33 y 74).<br />
              • <strong>Resolución de Superintendencia N° 013-2007/SUNAT:</strong> Régimen de suspensión de retenciones y pagos a cuenta del Impuesto a la Renta sobre rentas de cuarta categoría.<br />
              • <strong>Resolución de Superintendencia N° 182-2008/SUNAT:</strong> Implementación y emisión del Sistema de Emisión Electrónica de Recibos por Honorarios (SEE-SOL).
            </p>
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
