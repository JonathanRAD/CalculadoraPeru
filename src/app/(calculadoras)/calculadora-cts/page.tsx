'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateCts } from '@/core/calculators/cts';
import { CompanyRegime } from '@/core/calculators/gratification';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { PiggyBank } from 'lucide-react';

export default function CalculadoraCtsPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'calculadora-cts')!;

  const [baseSalary, setBaseSalary] = useState<number>(2500);
  const [hasFamilyAllowance, setHasFamilyAllowance] = useState<boolean>(false);
  const [monthsWorkedInSemester, setMonthsWorkedInSemester] = useState<number>(6);
  const [companyRegime, setCompanyRegime] = useState<CompanyRegime>('general');

  const result = calculateCts({
    baseSalary,
    hasFamilyAllowance,
    monthsWorkedInSemester,
    companyRegime,
  });

  const shareSummary = `Depósito de CTS: ${formatCurrency(result.ctsAmountToDeposit)}
Base Computable: ${formatCurrency(result.totalComputableBasis)} (Sueldo + 1/6 Grati)
Periodo: ${monthsWorkedInSemester} meses laborados`;

  const faqs = [
    {
      question: '¿Cuándo se deposita la CTS en Perú?',
      answer: 'La CTS se deposita dos veces al año: la primera hasta el 15 de mayo (periodo noviembre a abril) y la segunda hasta el 15 de noviembre (periodo mayo a octubre).',
    },
    {
      question: '¿Cómo se calcula la base de la CTS?',
      answer: 'Se toma tu sueldo mensual básico, se suma la Asignación Familiar (si la tienes) y se le añade un sexto (1/6) de la última gratificación percibida.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            La <strong>Compensación por Tiempo de Servicios (CTS)</strong> es un beneficio social de previsión para contingencias originadas por el cese en el trabajo.
          </p>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200">Fórmula Legal (D.S. 001-97-TR):</div>
            <div>• <strong>Base Computable</strong> = Sueldo + Asig. Familiar + 1/6 Gratificación</div>
            <div>• <strong>Monto Semestral</strong> = (Base Computable / 12) × Meses laborados</div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <PiggyBank className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos para el Depósito de CTS</h2>
          </div>

          <InputNumber
            id="baseSalary"
            label="Sueldo básico mensual"
            prefix="S/"
            value={baseSalary}
            onChange={(baseSalary) => setBaseSalary(baseSalary)}
            placeholder="2500.00"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
                Régimen Laboral
              </label>
              <select
                value={companyRegime}
                onChange={(e) => setCompanyRegime(e.target.value as CompanyRegime)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="general">Régimen General (CTS Completa)</option>
                <option value="pequena_empresa">Pequeña Empresa MYPE (50% de CTS)</option>
                <option value="microempresa">Microempresa (Sin CTS)</option>
              </select>
            </div>

            <InputNumber
              id="months"
              label="Meses laborados en el semestre"
              value={monthsWorkedInSemester}
              onChange={(monthsWorkedInSemester) => setMonthsWorkedInSemester(monthsWorkedInSemester)}
              min={1}
              max={6}
              helpText="Máximo 6 meses por periodo"
              placeholder="6"
              required
            />
          </div>

          <SwitchToggle
            id="hasFamilyAllowance"
            label="¿Percibes Asignación Familiar (+S/ 113.00)?"
            description="Se incorpora como remuneración computable para el cálculo de la CTS"
            checked={hasFamilyAllowance}
            onChange={(hasFamilyAllowance) => setHasFamilyAllowance(hasFamilyAllowance)}
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-300 dark:border-blue-800/80 bg-blue-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-blue-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Depósito Bancario de CTS
              </span>
              <span className="rounded-full bg-blue-700 dark:bg-blue-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                Mayo / Noviembre
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Monto de CTS a Depositar
              </span>
              <div className="text-3xl sm:text-5xl font-black text-blue-900 dark:text-blue-400 mt-1 font-mono tracking-tight">
                {formatCurrency(result.ctsAmountToDeposit)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                En tu entidad financiera (Banco o Caja)
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Base Computable Total"
                value={formatCurrency(result.totalComputableBasis)}
                type="neutral"
                subValue="Sueldo + 1/6 Gratificación"
              />
              <ResultMetricCard
                label="1/6 de Gratificación"
                value={formatCurrency(result.oneSixthGratification)}
                type="success"
                subValue="Componente legal"
              />
            </div>

            <ShareButtons title="Cálculo de CTS Perú" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
