'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateRoi, RoiInput } from '@/core/calculators/roi';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { PiggyBank } from 'lucide-react';

export default function RecuperacionDeInversionPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'recuperacion-de-inversion')!;

  const [form, setForm] = useState<RoiInput>({
    initialInvestment: 15000,
    monthlyNetProfit: 1200,
  });

  const result = calculateRoi(form);

  const shareSummary = `Retorno de Inversión (ROI) y Payback:
• Tiempo de Recuperación: ${result.paybackMonths.toFixed(1)} meses (~${(result.paybackMonths / 12).toFixed(1)} años)
• Rendimiento del Flujo Anual: ${formatPercent(result.annualCashFlowReturnRate)}
• Retorno Neto Año 1: ${formatPercent(result.roiPercentage)}
• Inversión Inicial: ${formatCurrency(form.initialInvestment)}
• Flujo Neto Mensual: ${formatCurrency(form.monthlyNetProfit)}`;

  const faqs = [
    {
      question: '¿Qué es el periodo de Payback o tiempo de recuperación?',
      answer: 'Es el plazo de tiempo (medido en meses o años) necesario para que el flujo de efectivo neto generado por un proyecto o adquisición cubra exactamente el 100% del capital invertido inicialmente. A partir de ese momento, la inversión se considera amortizada y todos los ingresos futuros constituyen utilidad neta pura.',
    },
    {
      question: '¿Cómo se calcula el ROI (Retorno de Inversión) anualizado?',
      answer: 'El ROI porcentual anual se calcula dividiendo la ganancia neta acumulada en 12 meses entre el monto total invertido al inicio: ROI = (Flujo Mensual × 12) ÷ Inversión Inicial × 100. Un ROI anual superior al 20% suele considerarse muy atractivo en el mercado empresarial peruano.',
    },
    {
      question: '¿Qué costos deben incluirse en la inversión inicial?',
      answer: 'Debes sumar todos los desembolsos requeridos para poner en marcha el activo o proyecto: costo de compra de maquinarias o equipos, flete de transporte, instalación eléctrica o técnica, acondicionamiento de local, licencias municipales y el capital de trabajo inicial necesario para operar los primeros meses.',
    },
    {
      question: '¿Por qué el flujo mensual debe ser "ganancia neta" y no "ingreso bruto"?',
      answer: 'Muchos emprendedores cometen el error de calcular el retorno usando la facturación bruta total. El retorno solo se financia con el flujo de caja líquido remanente después de haber pagado insumos, sueldos, servicios, mantenimiento y los tributos correspondientes a la SUNAT.',
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
              ¿Cómo evaluar el Retorno de Inversión (ROI) y Payback en el Perú?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Evaluar con rigor financiero la <strong>Recuperación de Inversión</strong> (Payback) y el <strong>ROI</strong> permite a pequeños y medianos empresarios determinar si la compra de una máquina, la remodelación de un local comercial o el lanzamiento de una nueva línea de negocio es financieramente viable y en cuánto tiempo recuperarán su capital.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Fórmulas de Evaluación Financiera
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Periodo de Recuperación (Payback):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Meses requeridos para amortizar el capital invertido al 100%.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Payback (meses) = Inversión Inicial ÷ Ganancia Neta Mensual
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-800 dark:text-sky-400 block">• Retorno de Inversión Anual (ROI):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Rendimiento porcentual de la inversión a lo largo de un año calendario.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  ROI % = ((Ganancia Mensual × 12) ÷ Inversión Inicial) × 100
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico (Horno industrial para panadería en Arequipa)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Una panadería invierte S/ 15,000.00 en un nuevo horno rotatorio con el cual proyecta un incremento en su ganancia neta mensual de S/ 1,200.00 (después de deducir harina, gas e impuestos):
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Métrica Financiera</th>
                    <th className="p-2.5">Valor Proyectado</th>
                    <th className="p-2.5">Interpretación Práctica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">Inversión Inicial Total</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">S/ 15,000.00</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">Costo del equipo e instalación</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Ganancia Neta Mensual</td>
                    <td className="p-2.5 font-mono font-semibold text-emerald-700 dark:text-emerald-400">S/ 1,200.00</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">Flujo de caja libre mensual adicional</td>
                  </tr>
                  <tr className="bg-emerald-50/60 dark:bg-emerald-950/30">
                    <td className="p-2.5 font-bold text-emerald-950 dark:text-emerald-300">Tiempo de Recuperación (Payback)</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">12.5 meses</td>
                    <td className="p-2.5 font-bold text-emerald-800 dark:text-emerald-400">Recupera la inversión en ~1 año</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Rendimiento del Flujo Anual</td>
                    <td className="p-2.5 font-mono font-semibold text-sky-700 dark:text-sky-400">96.00% anual</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">Flujo anual / Capital (S/ 14,400 / S/ 15,000)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Retorno Neto al Año 1 (ROI)</td>
                    <td className="p-2.5 font-mono font-semibold text-amber-700 dark:text-amber-400">-4.00%</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">Faltan S/ 600 (0.5 meses) para cubrir la inversión inicial</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <PiggyBank className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos de la Inversión</h2>
          </div>

          <InputNumber
            id="initialInvestment"
            label="Monto de la inversión inicial total"
            prefix="S/"
            value={form.initialInvestment}
            onChange={(initialInvestment) => setForm({ ...form, initialInvestment })}
            helpText="Compra de equipos, acondicionamiento, stock inicial"
            placeholder="15000.00"
            required
          />

          <InputNumber
            id="monthlyNetProfit"
            label="Ganancia neta promedio estimada al mes"
            prefix="S/"
            value={form.monthlyNetProfit}
            onChange={(monthlyNetProfit) => setForm({ ...form, monthlyNetProfit })}
            helpText="Utilidad líquida mensual libre generada"
            placeholder="1200.00"
            required
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Periodo de Recuperación
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                Payback
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Tiempo para Recuperar Inversión
              </span>
              <div className="text-3xl sm:text-5xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-mono tabular-nums break-words leading-tight">
                {result.paybackMonths.toFixed(1)} meses
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Equivale a aproximadamente {(result.paybackMonths / 12).toFixed(1)} años de operación
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Rendimiento Flujo Anual"
                value={formatPercent(result.annualCashFlowReturnRate)}
                type="success"
                subValue="Flujo 12 meses / capital"
              />
              <ResultMetricCard
                label="Retorno Neto Año 1"
                value={formatPercent(result.roiPercentage)}
                type={result.roiPercentage >= 0 ? "success" : "warning"}
                subValue={result.roiPercentage >= 0 ? "Ganancia sobre capital" : "En amortización (mes 12.5)"}
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-2xl bg-white/90 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5 border border-emerald-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex justify-between font-medium">
                <span>Inversión Inicial Total:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">{formatCurrency(form.initialInvestment)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Flujo neto mensual estimado:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums font-mono">{formatCurrency(form.monthlyNetProfit)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Amortización mensual:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">{formatPercent(form.initialInvestment > 0 ? (form.monthlyNetProfit / form.initialInvestment) * 100 : 0)} / mes</span>
              </div>
            </div>

            <ShareButtons title="Retorno de Inversión y Payback" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
