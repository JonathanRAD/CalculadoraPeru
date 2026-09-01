'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateLoan } from '@/core/calculators/loan';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Landmark } from 'lucide-react';

export default function PrestamoBancarioPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'prestamo-bancario')!;

  const [loanAmount, setLoanAmount] = useState<number>(10000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(24);
  const [termMonths, setTermMonths] = useState<number>(24);
  const [monthlyInsuranceRate, setMonthlyInsuranceRate] = useState<number>(0.075);

  const result = calculateLoan({
    loanAmount,
    annualInterestRate,
    termMonths,
    monthlyInsuranceRate,
  });

  const shareSummary = `Préstamo: ${formatCurrency(loanAmount)} a ${termMonths} meses
Cuota Mensual Estimada: ${formatCurrency(result.monthlyPaymentWithInsurance)} (con desgravamen)
Total de Intereses a Pagar: ${formatCurrency(result.totalInterestPaid)} (TEA: ${annualInterestRate}%)`;

  const faqs = [
    {
      question: '¿Qué es el Sistema Francés de amortización?',
      answer: 'Es el método estándar utilizado por los bancos en Perú (BCP, BBVA, Interbank, Scotiabank, Cajas), donde pagas una cuota fija constante todos los meses. Al inicio se amortiza más interés y al final más capital.',
    },
    {
      question: '¿Qué es el seguro de desgravamen?',
      answer: 'Es un seguro obligatorio en créditos bancarios que cancela la deuda pendiente en caso de fallecimiento o invalidez total y permanente del titular del crédito.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Simula las cuotas mensuales de préstamos personales, vehiculares o capital de trabajo para MYPES en entidades financieras del Perú.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Landmark className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos del Préstamo Bancario</h2>
          </div>

          <InputNumber
            id="loanAmount"
            label="Monto del préstamo solicitado"
            prefix="S/"
            value={loanAmount}
            onChange={(loanAmount) => setLoanAmount(loanAmount)}
            placeholder="10000.00"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="tea"
              label="Tasa de Interés Efectiva Anual (TEA)"
              suffix="%"
              value={annualInterestRate}
              onChange={(annualInterestRate) => setAnnualInterestRate(annualInterestRate)}
              helpText="Tasa pactada con el banco"
              placeholder="24.0"
              required
            />

            <InputNumber
              id="termMonths"
              label="Plazo de pago en meses"
              value={termMonths}
              onChange={(termMonths) => setTermMonths(termMonths)}
              min={1}
              max={120}
              helpText="Ej: 12, 24, 36, 48 meses"
              placeholder="24"
              required
            />
          </div>

          <InputNumber
            id="insurance"
            label="Seguro de Desgravamen mensual"
            suffix="%"
            value={monthlyInsuranceRate}
            onChange={(monthlyInsuranceRate) => setMonthlyInsuranceRate(monthlyInsuranceRate)}
            helpText="Tasa referencial (~0.075% mensual)"
            placeholder="0.075"
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-300 dark:border-blue-800/80 bg-blue-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-blue-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Cuota Mensual Fija
              </span>
              <span className="rounded-full bg-blue-700 dark:bg-blue-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                Sistema Francés
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Cuota Mensual Estimada
              </span>
              <div className="text-3xl sm:text-5xl font-black text-blue-900 dark:text-blue-400 mt-1 font-mono tracking-tight">
                {formatCurrency(result.monthlyPaymentWithInsurance)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Cuota fija mensual con seguro incluido
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Total Intereses"
                value={formatCurrency(result.totalInterestPaid)}
                type="warning"
                subValue={`TEA: ${annualInterestRate}%`}
              />
              <ResultMetricCard
                label="Total a Devolver"
                value={formatCurrency(result.totalAmountToRepay)}
                type="neutral"
                subValue={`En ${termMonths} meses`}
              />
            </div>

            <ShareButtons title="Simulador de Préstamos Bancarios" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
