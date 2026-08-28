'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateVacations, VacationsInput } from '@/core/calculators/vacations';
import { CompanyRegime } from '@/core/calculators/gratification';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Palmtree } from 'lucide-react';

export default function CalculadoraVacacionesPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'calculadora-vacaciones')!;

  const [baseSalary, setBaseSalary] = useState<number>(2500);
  const [hasFamilyAllowance, setHasFamilyAllowance] = useState<boolean>(false);
  const [monthsWorked, setMonthsWorked] = useState<number>(8);
  const [daysWorked, setDaysWorked] = useState<number>(0);
  const [companyRegime, setCompanyRegime] = useState<CompanyRegime>('general');
  const [daysToSell, setDaysToSell] = useState<number>(0);

  const result = calculateVacations({
    baseSalary,
    hasFamilyAllowance,
    monthsWorked,
    daysWorked,
    companyRegime,
    daysToSell,
  });

  const shareSummary = `Liquidación de Vacaciones:
Vacaciones Truncas: ${formatCurrency(result.totalTruncatedVacations)} (${monthsWorked} meses)
Venta de Vacaciones: ${formatCurrency(result.soldVacationsPay)} (${daysToSell} días)
Total a Percibir: ${formatCurrency(result.totalPay)}`;

  const faqs = [
    {
      question: '¿Cuántos días de vacaciones corresponden por ley en Perú?',
      answer: 'En el Régimen General corresponden 30 días calendario de descanso remunerado por cada año completo de servicios (D.L. 713). En el régimen de Pequeña Empresa MYPE y Microempresa corresponden 15 días calendario.',
    },
    {
      question: '¿Se pueden vender las vacaciones?',
      answer: 'Sí, el trabajador puede acordar por escrito con su empleador la venta de hasta 15 días de sus vacaciones en el Régimen General (descansando obligatoriamente los otros 15 días). La empresa paga la remuneración normal más la compensación por los días vendidos.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Calcula el monto correspondiente por vacaciones truncas ante el término del vínculo laboral o la compra/venta legal de días de descanso.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Palmtree className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos de tus Vacaciones</h2>
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
                <option value="general">Régimen General (30 días año)</option>
                <option value="pequena_empresa">Pequeña Empresa (15 días año)</option>
                <option value="microempresa">Microempresa (15 días año)</option>
              </select>
            </div>

            <InputNumber
              id="monthsWorked"
              label="Meses laborados en el periodo"
              value={monthsWorked}
              onChange={(monthsWorked) => setMonthsWorked(monthsWorked)}
              min={0}
              max={12}
              placeholder="8"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="daysWorked"
              label="Días adicionales laborados"
              value={daysWorked}
              onChange={(daysWorked) => setDaysWorked(daysWorked)}
              min={0}
              max={29}
              placeholder="0"
            />

            <InputNumber
              id="daysToSell"
              label="Días de vacaciones a vender (opcional)"
              value={daysToSell}
              onChange={(daysToSell) => setDaysToSell(daysToSell)}
              min={0}
              max={15}
              helpText="Máximo 15 días según ley"
              placeholder="0"
            />
          </div>

          <SwitchToggle
            id="hasFamilyAllowance"
            label="¿Percibes Asignación Familiar (+S/ 102.50)?"
            description="Forma parte de la remuneración computable para las vacaciones"
            checked={hasFamilyAllowance}
            onChange={(hasFamilyAllowance) => setHasFamilyAllowance(hasFamilyAllowance)}
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-300 dark:border-blue-800/80 bg-blue-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-blue-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Liquidación de Vacaciones
              </span>
              <span className="rounded-full bg-blue-700 dark:bg-blue-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                D.L. 713
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Total Pago de Vacaciones
              </span>
              <div
                title={formatCurrency(result.totalPay)}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-900 dark:text-blue-400 mt-1 font-mono tracking-tight truncate max-w-full px-2"
              >
                {formatCurrency(result.totalPay)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                Por {monthsWorked} meses laborados {daysToSell > 0 ? `+ ${daysToSell} días vendidos` : ''}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Vacaciones Truncas"
                value={formatCurrency(result.totalTruncatedVacations)}
                type="neutral"
                subValue="Por periodo laborado"
              />
              <ResultMetricCard
                label="Venta de Vacaciones"
                value={formatCurrency(result.soldVacationsPay)}
                type="success"
                subValue={`${daysToSell} días`}
              />
            </div>

            <ShareButtons title="Liquidación de Vacaciones Perú" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
