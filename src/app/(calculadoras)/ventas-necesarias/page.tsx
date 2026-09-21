'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateTargetSales, TargetSalesInput } from '@/core/calculators/targetSales';
import { formatCurrency, formatNumber } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Target, AlertCircle } from 'lucide-react';

export default function VentasNecesariasPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'ventas-necesarias')!;

  const [form, setForm] = useState<TargetSalesInput>({
    targetNetProfit: 5000,
    fixedMonthlyCosts: 3000,
    unitSalePrice: 50,
    unitVariableCost: 30,
  });

  const result = calculateTargetSales(form);

  const shareSummary = `Plan de Ventas y Ganancia Requerida:
• Meta de Ganancia Neta: ${formatCurrency(form.targetNetProfit)}/mes
• Unidades a Vender: ${formatNumber(result.unitsToSell)} unidades
• Meta Diaria: ${result.dailyUnitsToSell} unidades/día (26 días)
• Facturación Mínima Neta: ${formatCurrency(result.totalSalesRequired)} (sin IGV)
• Facturación Facturada con IGV: ${formatCurrency(result.totalSalesWithIgv)}`;

  const faqs = [
    {
      question: '¿En qué se diferencia el cálculo de Ventas Necesarias del Punto de Equilibrio?',
      answer: 'El Punto de Equilibrio calcula el volumen estricto de ventas necesario para que tu empresa no pierda dinero (Utilidad = S/ 0.00). La calculadora de Ventas Necesarias va un paso adelante: calcula las unidades y facturación requeridas para generar una ganancia neta deseada específica (tu sueldo empresarial o dividendos libres de fin de mes) por encima de todos los costos operativos.',
    },
    {
      question: '¿Cómo deben estimarse los costos fijos al planificar metas de ventas?',
      answer: 'Debes incluir la totalidad de egresos fijos del mes: alquiler comercial, luz, agua, telefonía, internet, planillas de trabajadores o sueldos del personal de soporte, asesoría contable, suscripciones de software y cuotas de préstamos financieros.',
    },
    {
      question: '¿Por qué la meta diaria se calcula típicamente sobre 26 días útiles?',
      answer: 'En el sector comercial y productivo del Perú, la mayoría de negocios operan de lunes a sábado, sumando un promedio de 26 días laborables por mes calendario. Dividir la meta mensual entre 26 días permite fijar una cuota de ventas diaria accesible y medible para tu equipo de ventas.',
    },
    {
      question: '¿Qué hacer si el número de unidades a vender supera la capacidad del negocio?',
      answer: 'Si la meta de unidades calculada supera la capacidad de producción o el flujo de clientes diario, tienes tres palancas financieras: 1) Elevar el precio unitario aportando mayor valor o mejor empaque, 2) Reducir el costo variable de insumos negociando compras por volumen, o 3) Optimizar y reducir costos fijos superfluos.',
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
              ¿Cómo planificar las Ventas Necesarias para alcanzar tu meta de ingresos?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              El análisis de <strong>Ventas Necesarias</strong> (Target Sales) permite a fundadores, comerciantes y gerentes comerciales convertir una aspiración de ingresos en un plan de acción cuantitativo y diario. En lugar de vender a ciegas, sabrás con precisión matemática cuántos pedidos o clientes necesitas cerrar cada jornada para financiar tu negocio y obtener la rentabilidad deseada.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Fórmula de Ventas Requeridas con Meta de Utilidad
            </h3>
            <div className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Unidades Requeridas (Q):</span>
              <p className="text-slate-600 dark:text-slate-300">
                Suma de los costos fijos más el beneficio neto deseado, dividida entre el margen de contribución unitario.
              </p>
              <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                Q = (Costos Fijos + Meta de Ganancia Neta) ÷ (Precio Unitario - Costo Variable Unitario)
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico comercial (Distribuidora en Lima)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Un emprendedor tiene costos fijos de S/ 3,000.00 al mes y desea una ganancia neta líquida de S/ 5,000.00. Vende cada producto a S/ 50.00 con un costo variable unitario de S/ 30.00:
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Variable del Plan</th>
                    <th className="p-2.5">Valor Unitario</th>
                    <th className="p-2.5">Total Mensual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">Costos Fijos Mensuales</td>
                    <td className="p-2.5 text-slate-500">-</td>
                    <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">S/ 3,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Meta de Ganancia Neta Deseada</td>
                    <td className="p-2.5 text-slate-500">-</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">S/ 5,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Margen de Contribución por Unidad (50 - 30)</td>
                    <td className="p-2.5 font-mono font-semibold">S/ 20.00</td>
                    <td className="p-2.5 font-mono text-slate-500">-</td>
                  </tr>
                  <tr className="bg-emerald-50/60 dark:bg-emerald-950/30">
                    <td className="p-2.5 font-bold text-emerald-950 dark:text-emerald-300">Meta de Ventas Requerida</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">400 unidades</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">S/ 20,000.00 netos (~16 u./día)</td>
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
              <Target className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Define tu meta y estructura</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="targetNetProfit"
              label="Ganancia neta deseada al mes"
              prefix="S/"
              value={form.targetNetProfit}
              onChange={(targetNetProfit) => setForm({ ...form, targetNetProfit })}
              helpText="Tu remuneración o utilidad neta libre"
              placeholder="5000.00"
              required
            />

            <InputNumber
              id="fixedMonthlyCosts"
              label="Costos fijos mensuales"
              prefix="S/"
              value={form.fixedMonthlyCosts}
              onChange={(fixedMonthlyCosts) => setForm({ ...form, fixedMonthlyCosts })}
              helpText="Alquiler, sueldos, servicios, contador"
              placeholder="3000.00"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="unitSalePrice"
              label="Precio de venta unitario (sin IGV)"
              prefix="S/"
              value={form.unitSalePrice}
              onChange={(unitSalePrice) => setForm({ ...form, unitSalePrice })}
              placeholder="50.00"
              required
            />

            <InputNumber
              id="unitVariableCost"
              label="Costo variable por unidad"
              prefix="S/"
              value={form.unitVariableCost}
              onChange={(unitVariableCost) => setForm({ ...form, unitVariableCost })}
              placeholder="30.00"
              required
            />
          </div>

          {!result.isFeasible && (
            <div className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 p-4 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>
                <strong>Atención:</strong> El precio unitario debe superar al costo variable para generar margen de contribución positivo.
              </span>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Meta de Ventas
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                MYPE Perú
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Unidades a Vender al Mes
              </span>
              <div className="text-3xl sm:text-5xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-mono tabular-nums break-words leading-tight">
                {formatNumber(result.unitsToSell)} unidades
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Meta diaria: vender {result.dailyUnitsToSell} unidades al día (26 días útiles)
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Facturación Neta"
                value={formatCurrency(result.totalSalesRequired)}
                type="neutral"
                subValue="Ventas sin IGV requeridas"
              />
              <ResultMetricCard
                label="Facturado con IGV (18%)"
                value={formatCurrency(result.totalSalesWithIgv)}
                type="success"
                subValue="Monto en boletas al público"
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-2xl bg-white/90 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5 border border-emerald-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex justify-between font-medium">
                <span>Ganancia Neta Planeada:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums font-mono">{formatCurrency(form.targetNetProfit)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Costos fijos a cubrir:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">{formatCurrency(form.fixedMonthlyCosts)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Margen de contribución unitario:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">{formatCurrency(form.unitSalePrice - form.unitVariableCost)}</span>
              </div>
            </div>

            <ShareButtons title="Ventas Necesarias para Ganancia Deseada" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
