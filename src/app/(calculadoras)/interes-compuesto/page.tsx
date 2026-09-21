'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateCompoundInterest } from '@/core/calculators/compoundInterest';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { LineChart } from 'lucide-react';

export default function InteresCompuestoPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'interes-compuesto')!;

  const [initialPrincipal, setInitialPrincipal] = useState<number>(5000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(300);
  const [annualRatePercentage, setAnnualRatePercentage] = useState<number>(7.5);
  const [years, setYears] = useState<number>(5);

  const result = calculateCompoundInterest({
    initialPrincipal,
    monthlyContribution,
    annualRatePercentage,
    years,
  });

  const shareSummary = `Simulación de Interés Compuesto:
Capital Final Acumulado: ${formatCurrency(result.finalBalance)} (en ${years} años)
Ganancia en Intereses: ${formatCurrency(result.totalInterestEarned)} (TREA: ${annualRatePercentage}%)
Total Aportado: ${formatCurrency(result.totalContributions)}`;

  const faqs = [
    {
      question: '¿Qué es la TREA (Tasa de Rendimiento Efectiva Anual) en el Perú?',
      answer: 'La TREA es el indicador financiero oficial fijado por la SBS que mide el rendimiento real neto de un depósito de ahorro o a plazo fijo. A diferencia de la TEA, la TREA descuenta de forma previa las comisiones bancarias, portes y gastos por mantenimiento de cuenta, permitiendo conocer exactamente cuánto dinero líquido rendirá tu capital al cabo de un año.',
    },
    {
      question: '¿Cómo opera la capitalización de intereses en el interés compuesto?',
      answer: 'En el interés compuesto, los intereses devengados al final de cada periodo de capitalización (mensual, trimestral o anual) no se retiran, sino que se integran al capital principal inicial. Durante el siguiente periodo, los nuevos intereses se liquidan sobre este monto acumulado mayor, produciendo una aceleración geométrica o exponencial del saldo.',
    },
    {
      question: '¿Hasta qué monto cubre el Fondo de Seguro de Depósitos (FSD) en Perú?',
      answer: 'En el sistema financiero regulado por la SBS (bancos, financieras y cajas municipales autorizadas), los depósitos de las personas naturales están protegidos por el Fondo de Seguro de Depósitos (FSD). El monto de cobertura máxima se actualiza trimestralmente y supera los S/ 120,000 por entidad y titular, respaldando el capital más los intereses acumulados sin costo para el ahorrista.',
    },
    {
      question: '¿Los intereses ganados en cuentas bancarias pagan impuesto en el Perú?',
      answer: 'No. Conforme al artículo 19 del Texto Único Ordenado de la Ley del Impuesto a la Renta, los intereses y ganancias de capital provenientes de depósitos de personas naturales en entidades del sistema financiero nacional regulado (cuentas de ahorros, depósitos a plazo fijo y CTS) se encuentran legalmente exonerados del pago de Impuesto a la Renta.',
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
              Guía Financiera: El poder del Interés Compuesto para tus Ahorros en Perú
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              El <strong>Interés Compuesto</strong> es el principio multiplicador según el cual los rendimientos generados por un capital se reinvierten sistemáticamente, sumándose al saldo base para generar a su vez nuevos intereses en cada ciclo de tiempo sucesivo.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Fórmula de capitalización con aportaciones periódicas
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Cuando ahorras un monto inicial e inyectas abonos mensuales fijos, el saldo final al vencimiento se calcula integrando el crecimiento del capital inicial y la anualidad de los depósitos:
            </p>
            <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 space-y-1">
              <div>VF = Principal × (1 + r/12)^(12×t) + AporteMensual × [((1 + r/12)^(12×t) - 1) / (r/12)]</div>
              <div className="text-[10px] text-slate-500 font-sans pt-1">
                Donde <strong>VF</strong> es el valor final acumulado, <strong>r</strong> es la tasa efectiva anual equivalente mensual y <strong>t</strong> es el número de años.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico numérico (Ahorro disciplinado en Caja Municipal)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Inversión inicial de <strong>S/ 5,000.00</strong> con aportes recurrentes de <strong>S/ 300.00 mensuales</strong> a una TREA anual del <strong>7.50%</strong> durante un plazo de <strong>5 años</strong>:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Componente del Ahorro</th>
                    <th className="p-2.5">Fórmula de Acumulación</th>
                    <th className="p-2.5">Monto (PEN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-semibold">Depósito Inicial de Apertura</td>
                    <td className="p-2.5 text-slate-500">Monto aportado en el mes cero</td>
                    <td className="p-2.5 font-mono">S/ 5,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Total de Aportes Mensuales (60 meses)</td>
                    <td className="p-2.5 text-slate-500">S/ 300.00 × 60 meses</td>
                    <td className="p-2.5 font-mono">+ S/ 18,000.00</td>
                  </tr>
                  <tr className="bg-slate-50/60 dark:bg-slate-900/60 font-bold">
                    <td className="p-2.5">Total de Dinero Propio Desembolsado</td>
                    <td className="p-2.5 text-slate-500 font-normal">Suma de aportes de bolsillo</td>
                    <td className="p-2.5 font-mono">S/ 23,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Intereses Ganados por Capitalización</td>
                    <td className="p-2.5 text-slate-500">Rendimiento compuesto (TEM SBS s/ TREA 7.5%)</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">+ S/ 5,797.76</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950 font-bold text-slate-900 dark:text-white">
                    <td className="p-2.5 text-emerald-800 dark:text-emerald-300">Saldo Final Acumulado Disponible</td>
                    <td className="p-2.5 text-slate-500 font-normal">Capital total + Intereses ganados</td>
                    <td className="p-2.5 font-mono text-emerald-800 dark:text-emerald-300 text-sm">S/ 28,797.76</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Marco de supervisión financiera:</span>
            <p>
              • <strong>Ley N° 26702:</strong> Ley General del Sistema Financiero y del Sistema de Seguros y Orgánica de la Superintendencia de Banca y Seguros.<br />
              • <strong>Circular SBS N° B-2224-2013:</strong> Normas para la transparencia de información y cálculo de la TREA en operaciones pasivas.<br />
              • <strong>Decreto Supremo N° 179-2004-EF:</strong> Exoneración tributaria de intereses bancarios para personas naturales (Ley del IR).
            </p>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[#08734F] dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              <LineChart className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Parámetros del Ahorro</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="initial"
              label="Monto inicial ahorrado"
              prefix="S/"
              value={initialPrincipal}
              onChange={(initialPrincipal) => setInitialPrincipal(initialPrincipal)}
              placeholder="5000.00"
              required
            />

            <InputNumber
              id="monthly"
              label="Aporte mensual adicional"
              prefix="S/"
              value={monthlyContribution}
              onChange={(monthlyContribution) => setMonthlyContribution(monthlyContribution)}
              helpText="Ahorro fijo cada mes"
              placeholder="300.00"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="rate"
              label="Tasa de Rendimiento Anual (TREA)"
              suffix="%"
              value={annualRatePercentage}
              onChange={(annualRatePercentage) => setAnnualRatePercentage(annualRatePercentage)}
              helpText="Tasa de la Caja o Banco"
              placeholder="7.5"
              required
            />

            <InputNumber
              id="years"
              label="Tiempo de ahorro en años"
              value={years}
              onChange={(years) => setYears(years)}
              min={1}
              max={30}
              helpText="Horizonte de inversión"
              placeholder="5"
              required
            />
          </div>
        </div>

        {/* Results Column — Proposal A */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-200/90 dark:border-emerald-800/80 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-300">
                Capital Final Acumulado
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold text-[#08734F] dark:text-emerald-300">
                📈 Crecimiento
              </span>
            </div>

            {/* Big Main Result Box (Non-truncated tabular numerals) */}
            <div className="rounded-2xl bg-emerald-50/50 dark:bg-slate-950 border border-emerald-100 dark:border-emerald-900/60 p-5 sm:p-6 text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Monto Total al Finalizar
              </span>
              <div
                title={formatCurrency(result.finalBalance)}
                className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-[#08734F] dark:text-emerald-400 mt-1.5 font-mono tracking-tight tabular-nums break-words leading-tight"
              >
                {formatCurrency(result.finalBalance)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                En {years} años con TREA del {annualRatePercentage}%
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Ganancia en Intereses"
                value={formatCurrency(result.totalInterestEarned)}
                type="success"
                subValue="Dinero generado"
              />
              <ResultMetricCard
                label="Total Aportado"
                value={formatCurrency(result.totalContributions)}
                type="neutral"
                subValue="De tu propio bolsillo"
              />
            </div>

            <ShareButtons title="Simulador de Interés Compuesto" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
