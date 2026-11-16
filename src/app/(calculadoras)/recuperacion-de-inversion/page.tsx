'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateRoi, RoiInput } from '@/core/calculators/roi';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { PayslipResult } from '@/shared/components/ui/PayslipResult';
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
      answer: 'Es el plazo de tiempo (en meses o años) que tarda el flujo de caja neto generado en cubrir el 100% del capital invertido inicialmente. En nuestro ejemplo (S/ 15,000 de inversión y S/ 1,200 de flujo mensual), el payback es de 12.5 meses. Antes de ese mes, el capital aún se está amortizando; a partir del mes 13, todo flujo adicional representa utilidad neta sobre el capital.',
    },
    {
      question: '¿Por qué el ROI del Año 1 es -4.00% si el proyecto genera un flujo anual de 96.00%?',
      answer: 'Porque miden dos conceptos financieros distintos: la Tasa de Flujo Anual (96%) compara los ingresos acumulados del año (S/ 14,400) contra la inversión (S/ 15,000), indicando que ya recuperaste el 96% de lo desembolsado. En cambio, el ROI financiero clásico mide la ganancia neta por encima del capital: ((Flujos - Inversión) / Inversión). Como en 12 meses recaudaste S/ 14,400 y tu costo fue S/ 15,000, aún tienes un saldo negativo de S/ 600 (-4.00%). El ROI pasa a terreno positivo en el mes 12.5 (payback) y alcanza rentabilidad neta acumulada en los meses posteriores.',
    },
    {
      question: '¿Qué conceptos deben incluirse en la inversión inicial?',
      answer: 'Debes sumar todos los desembolsos requeridos para poner en marcha el activo o proyecto: costo de compra de maquinarias o equipos, flete de transporte, instalación técnica, acondicionamiento de local, licencias municipales y el capital de trabajo inicial necesario para operar.',
    },
    {
      question: '¿Por qué debe ingresarse el "flujo de caja neto" y no las ventas brutas?',
      answer: 'El retorno de capital solo se financia con el dinero líquido que efectivamente queda libre en caja tras descontar el costo de mercaderías/insumos, salarios, alquiler, servicios operativos e impuestos a la SUNAT. Utilizar la facturación bruta distorsionaría el tiempo real de amortización.',
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
              ¿Cómo evaluar el Retorno de Inversión (ROI) y Payback en proyectos y MYPES?
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Al evaluar la compra de maquinaria, la apertura de una sucursal o una mejora operativa, es fundamental no confundir la <strong>velocidad de recuperación de la caja</strong> con el <strong>retorno neto sobre la inversión</strong>.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-[#18202A] p-5 border border-slate-200 dark:border-[#2C3744] space-y-3 text-[13px] leading-relaxed">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              1. Fórmulas Financieras y Diferenciación de Conceptos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1.5 p-3 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Periodo de Payback:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Meses para amortizar el 100% del desembolso inicial.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Payback = Inversión ÷ Flujo Mensual
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Rendimiento del Flujo Anual:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Porcentaje del capital recuperado vía flujos en 12 meses.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Tasa Flujo = ((Flujo × 12) ÷ Inversión) × 100
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-amber-800 dark:text-amber-400 block">• Retorno Neto Año 1 (ROI):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Ganancia neta por encima de la inversión al mes 12.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  ROI = ((Flujo 12m - Inversión) ÷ Inversión) × 100
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              2. Caso práctico numérico (Horno industrial para panadería en Arequipa)
            </h3>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Una panadería invierte <strong>S/ 15,000.00</strong> en un nuevo horno rotatorio con el cual genera un flujo de caja neto mensual de <strong>S/ 1,200.00</strong> (ingresos adicionales menos insumos, energía y tributos):
            </p>

            <div className="overflow-x-auto rounded border border-slate-200 dark:border-[#2C3744]">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Métrica Financiera</th>
                    <th className="p-2.5">Valor Numérico</th>
                    <th className="p-2.5">Interpretación Financiera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">Inversión Inicial Total</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">S/ 15,000.00</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">Capital desembolsado en equipamiento e instalación</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Flujo de Caja Neto Mensual</td>
                    <td className="p-2.5 font-mono font-semibold text-brand-700 dark:text-brand-400">S/ 1,200.00</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">Excedente operativo mensual disponible para amortizar</td>
                  </tr>
                  <tr className="bg-brand-50/60 dark:bg-brand-950/30">
                    <td className="p-2.5 font-bold text-brand-950 dark:text-brand-300">Tiempo de Recuperación (Payback)</td>
                    <td className="p-2.5 font-mono font-bold text-brand-800 dark:text-brand-400">12.5 meses</td>
                    <td className="p-2.5 font-bold text-brand-800 dark:text-brand-400">Punto de equilibrio exacto (S/ 15,000 ÷ S/ 1,200)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Rendimiento del Flujo Anual</td>
                    <td className="p-2.5 font-mono font-semibold text-brand-700 dark:text-brand-400">96.00% anual</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">En 12 meses ingresan S/ 14,400 (el 96% de la inversión)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Retorno Neto al Año 1 (ROI)</td>
                    <td className="p-2.5 font-mono font-semibold text-amber-700 dark:text-amber-400">-4.00%</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">Al mes 12 faltan S/ 600 para empatar; el ROI es positivo desde el mes 13 (+4%)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-[#2C3744] p-4 space-y-2 text-[13px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Supuestos y límites financieros del modelo:</span>
              <ul className="space-y-1 list-disc pl-4">
                <li>
                  <strong>Flujos constantes:</strong> El cálculo asume que el flujo neto mensual se mantiene invariable mes a mes, sin considerar estacionalidad ni caídas imprevistas de demanda.
                </li>
                <li>
                  <strong>Sin valor temporal del dinero:</strong> Esta simulación simple no descuenta los flujos futuros mediante tasa de descuento o inflación. Para proyectos de gran envergadura o financiamiento bancario se debe evaluar el Valor Actual Neto (VAN) y la Tasa Interna de Retorno (TIR).
                </li>
                <li>
                  <strong>Sin valor residual del activo:</strong> No computa el valor de rescate, liquidación o reventa que pueda conservar el activo o equipo al finalizar su vida útil.
                </li>
                <li>
                  <strong>Alcance:</strong> Es una guía de orientación rápida para amortización de capital, no una medida universal o concluyente para decisiones de inversión corporativa.
                </li>
              </ul>
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
            label="Flujo de caja neto mensual generado"
            prefix="S/"
            value={form.monthlyNetProfit}
            onChange={(monthlyNetProfit) => setForm({ ...form, monthlyNetProfit })}
            helpText="Excedente libre mensual (ingresos menos costos operativos) destinado a recuperar el capital"
            placeholder="1200.00"
            required
          />
        </div>
        {/* Resultado con forma de boleta */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <PayslipResult
            title={"Periodo de Recuperación"}
            period={"Payback"}
            amountHeader="Valor"
            lines={[
              { label: "Rendimiento Flujo Anual", amount: formatPercent(result.annualCashFlowReturnRate), note: "Flujo 12 meses / capital" },
              { label: "Retorno Neto Año 1", amount: formatPercent(result.roiPercentage), note: result.roiPercentage >= 0 ? "Ganancia sobre capital" : "En amortización (mes 12.5)" },
              { label: "Inversión Inicial Total", amount: formatCurrency(form.initialInvestment) },
              { label: "Flujo neto mensual estimado", amount: formatCurrency(form.monthlyNetProfit) },
              { label: "Amortización mensual", amount: `${formatPercent(form.initialInvestment > 0 ? (form.monthlyNetProfit / form.initialInvestment) * 100 : 0)} / mes` },
            ]}
            totalLabel={"Tiempo para Recuperar Inversión"}
            totalAmount={`${result.paybackMonths.toFixed(1)} meses`}
            footnote={`Equivale a aproximadamente ${(result.paybackMonths / 12).toFixed(1)} años de operación`}
          >
            <ShareButtons title="Retorno de Inversión y Payback" shareText={shareSummary} />
          </PayslipResult>
        </div>

      </div>
    </CalculatorShell>
  );
}
