'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateOvertime } from '@/core/calculators/overtime';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Clock } from 'lucide-react';

export default function HorasExtrasPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'horas-extras')!;

  const [baseMonthlySalary, setBaseMonthlySalary] = useState<number>(2000);
  const [hasFamilyAllowance, setHasFamilyAllowance] = useState<boolean>(false);
  const [hoursFirstTwo, setHoursFirstTwo] = useState<number>(10);
  const [hoursAfterTwo, setHoursAfterTwo] = useState<number>(4);
  const [holidayHours, setHolidayHours] = useState<number>(0);

  const result = calculateOvertime({
    baseMonthlySalary,
    hasFamilyAllowance,
    hoursFirstTwo,
    hoursAfterTwo,
    holidayHours,
  });

  const shareSummary = `Horas Extras en Perú:
Valor Hora Ordinaria: ${formatCurrency(result.hourlyRate)}
Pago Horas (25%): ${formatCurrency(result.pay25Percent)} (${hoursFirstTwo} hrs)
Pago Horas (35%): ${formatCurrency(result.pay35Percent)} (${hoursAfterTwo} hrs)
Total Horas Extras a Cobrar: ${formatCurrency(result.totalOvertimePay)}`;

  const faqs = [
    {
      question: '¿Cómo se calcula el valor de una hora de trabajo ordinaria en Perú?',
      answer: 'Se toma la remuneración mensual computable (Sueldo + Asignación Familiar) y se divide entre 240 (considerando una jornada de 8 horas diarias por 30 días laborales).',
    },
    {
      question: '¿Cuáles son las sobretasas legales para horas extras?',
      answer: 'Por ley (D.S. 007-2002-TR), las 2 primeras horas extras del día se pagan con una sobretasa del 25% sobre el valor hora ordinaria. A partir de la tercera hora extra, la sobretasa sube al 35%. Si trabajas en tu día de descanso o feriado sin descanso sustitutorio, la sobretasa es del 100%.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El trabajo en sobretiempo (horas extras) es voluntario y debe ser remunerado en la misma boleta de pago del mes con las sobretasas de ley vigentes.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos de tu Jornada</h2>
          </div>

          <InputNumber
            id="baseSalary"
            label="Sueldo básico mensual"
            prefix="S/"
            value={baseMonthlySalary}
            onChange={(baseMonthlySalary) => setBaseMonthlySalary(baseMonthlySalary)}
            placeholder="2000.00"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="h25"
              label="Horas extras al 25% (2 primeras hrs)"
              suffix="hrs"
              value={hoursFirstTwo}
              onChange={(hoursFirstTwo) => setHoursFirstTwo(hoursFirstTwo)}
              helpText="Primeras 2 horas diarias"
              placeholder="10"
            />

            <InputNumber
              id="h35"
              label="Horas extras al 35% (3ra hora a más)"
              suffix="hrs"
              value={hoursAfterTwo}
              onChange={(hoursAfterTwo) => setHoursAfterTwo(hoursAfterTwo)}
              helpText="A partir de la 3ra hora diaria"
              placeholder="4"
            />
          </div>

          <InputNumber
            id="holiday"
            label="Horas trabajadas en Feriado o Descanso (100%)"
            suffix="hrs"
            value={holidayHours}
            onChange={(holidayHours) => setHolidayHours(holidayHours)}
            helpText="Sobretasa del 100%"
            placeholder="0"
          />

          <SwitchToggle
            id="hasFamilyAllowance"
            label="¿Percibes Asignación Familiar (+S/ 113.00)?"
            description="Se suma al sueldo para calcular el valor de la hora ordinaria"
            checked={hasFamilyAllowance}
            onChange={(hasFamilyAllowance) => setHasFamilyAllowance(hasFamilyAllowance)}
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-300 dark:border-blue-800/80 bg-blue-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-blue-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Pago Total de Horas Extras
              </span>
              <span className="rounded-full bg-blue-700 dark:bg-blue-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                🇵🇪 En Soles
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Total Adicional a Cobrar
              </span>
              <div
                title={formatCurrency(result.totalOvertimePay)}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-900 dark:text-blue-400 mt-1 font-mono tracking-tight truncate max-w-full px-2"
              >
                {formatCurrency(result.totalOvertimePay)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                Por {hoursFirstTwo + hoursAfterTwo + holidayHours} horas extras laboradas
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Valor Hora Ordinaria"
                value={formatCurrency(result.hourlyRate)}
                type="neutral"
                subValue="Sueldo / 240 hrs"
              />
              <ResultMetricCard
                label="Pago al 25%"
                value={formatCurrency(result.pay25Percent)}
                type="success"
                subValue={`${hoursFirstTwo} horas`}
              />
            </div>

            <ShareButtons title="Cálculo de Horas Extras Perú" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
