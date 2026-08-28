'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateGratification, GratificationInput, CompanyRegime, HealthInsurance } from '@/core/calculators/gratification';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Gift } from 'lucide-react';

export default function GratificacionPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'gratificacion')!;

  const [baseSalary, setBaseSalary] = useState<number>(2500);
  const [hasFamilyAllowance, setHasFamilyAllowance] = useState<boolean>(false);
  const [monthsWorkedInSemester, setMonthsWorkedInSemester] = useState<number>(6);
  const [companyRegime, setCompanyRegime] = useState<CompanyRegime>('general');
  const [healthInsurance, setHealthInsurance] = useState<HealthInsurance>('essalud');

  const result = calculateGratification({
    baseSalary,
    hasFamilyAllowance,
    monthsWorkedInSemester,
    companyRegime,
    healthInsurance,
  });

  const shareSummary = `Gratificación Legal: ${formatCurrency(result.rawGratification)}
Bonificación EsSalud (${result.bonusPercentage}%): ${formatCurrency(result.extraordinaryBonus)}
Total en Mano: ${formatCurrency(result.totalToReceive)} (100% libre de descuentos)`;

  const faqs = [
    {
      question: '¿Cuándo se pagan las gratificaciones en Perú?',
      answer: 'Por ley (Ley 27735), la gratificación de Fiestas Patrias debe pagarse como plazo máximo el 15 de julio, y la de Navidad el 15 de diciembre.',
    },
    {
      question: '¿Por qué la gratificación incluye un bono del 9%?',
      answer: 'La Ley 30334 desgravó las gratificaciones de aportes a AFP/ONP y estableció que el 9% que el empleador normalmente paga a EsSalud se le entrega directamente al trabajador como Bonificación Extraordinaria (o 6.75% si tiene EPS).',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            La <strong>Gratificación Legal</strong> equivale a una remuneración mensual completa (Régimen General) o media remuneración (Pequeña Empresa MYPE) más la bonificación extraordinaria de EsSalud.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Gift className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos para la Gratificación</h2>
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
                Régimen de la Empresa
              </label>
              <select
                value={companyRegime}
                onChange={(e) => setCompanyRegime(e.target.value as CompanyRegime)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="general">Régimen General (1 sueldo)</option>
                <option value="pequena_empresa">Pequeña Empresa MYPE (50% sueldo)</option>
                <option value="microempresa">Microempresa (Sin gratificación)</option>
              </select>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
                Seguro de Salud
              </label>
              <select
                value={healthInsurance}
                onChange={(e) => setHealthInsurance(e.target.value as HealthInsurance)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="essalud">EsSalud (+9% Bono)</option>
                <option value="eps">EPS (+6.75% Bono)</option>
              </select>
            </div>
          </div>

          <InputNumber
            id="months"
            label="Meses completos laborados en el semestre"
            value={monthsWorkedInSemester}
            onChange={(monthsWorkedInSemester) => setMonthsWorkedInSemester(monthsWorkedInSemester)}
            min={1}
            max={6}
            helpText="Enero a Junio (Julio) o Julio a Diciembre (Diciembre)"
            placeholder="6"
            required
          />

          <SwitchToggle
            id="hasFamilyAllowance"
            label="¿Percibes Asignación Familiar (+S/ 102.50)?"
            description="Se suma a la base computable para el cálculo de la gratificación"
            checked={hasFamilyAllowance}
            onChange={(hasFamilyAllowance) => setHasFamilyAllowance(hasFamilyAllowance)}
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-300 dark:border-blue-800/80 bg-blue-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-blue-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Monto Total a Cobrar
              </span>
              <span className="rounded-full bg-blue-700 dark:bg-blue-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                100% Libre de Impuestos
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Gratificación Total en Mano
              </span>
              <div className="text-3xl sm:text-5xl font-black text-blue-900 dark:text-blue-400 mt-1 font-mono tracking-tight">
                {formatCurrency(result.totalToReceive)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Sin descuentos de AFP, ONP ni EsSalud
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Gratificación Legal"
                value={formatCurrency(result.rawGratification)}
                type="neutral"
                subValue="Monto base legal"
              />
              <ResultMetricCard
                label={`Bono Salud (${result.bonusPercentage}%)`}
                value={formatCurrency(result.extraordinaryBonus)}
                type="success"
                subValue="Bono de EsSalud/EPS"
              />
            </div>

            <ShareButtons title="Cálculo de Gratificación Perú" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
