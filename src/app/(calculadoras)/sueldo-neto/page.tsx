'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateNetSalary, PayrollInput, PensionSystem } from '@/core/calculators/payroll';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Briefcase, Building, ShieldCheck } from 'lucide-react';

export default function SueldoNetoPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'sueldo-neto')!;

  const [grossSalary, setGrossSalary] = useState<number>(2500);
  const [pensionSystem, setPensionSystem] = useState<PensionSystem>('afp_integra');
  const [hasDependents, setHasDependents] = useState<boolean>(false);

  const result = calculateNetSalary({
    grossSalary,
    pensionSystem,
    hasDependents,
  });

  const shareSummary = `Sueldo Bruto: ${formatCurrency(result.totalGrossIncome)}
Descuento Pensión: ${formatCurrency(result.pensionDeduction)} (${formatPercent(result.pensionRate)})
Sueldo Neto en Cuenta: ${formatCurrency(result.netSalary)}`;

  const faqs = [
    {
      question: '¿Qué descuentos se aplican al sueldo bruto en planilla en Perú?',
      answer: 'Principalmente el aporte de pensiones obligatorio: 13% si estás en la ONP, o entre 12.67% y 12.89% si estás en una AFP (10% fondo individual + seguro de invalidez + comisión). Además, si tus ingresos anuales proyectados superan las 7 UIT (S/ 37,450), se descuenta el Impuesto a la Renta de 5ta Categoría.',
    },
    {
      question: '¿Qué es la Asignación Familiar?',
      answer: 'Es un beneficio legal equivalente al 10% de la Remuneración Mínima Vital (RMV) vigente (actualmente S/ 102.50) para los trabajadores que tengan a su cargo uno o más hijos menores de 18 años (o hasta 24 si estudian).',
    },
    {
      question: '¿El 9% de EsSalud se le descuenta al trabajador?',
      answer: 'NO. El aporte del 9% a EsSalud lo paga íntegramente el empleador sobre tu sueldo computable; no se resta de tu salario en mano.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El <strong>Sueldo Neto</strong> es la cantidad líquida de dinero que el trabajador recibe directamente en su cuenta bancaria al final de cada mes tras descontar aportes de ley.
          </p>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200">Estructura del cálculo:</div>
            <div>• <strong>Total Ingreso</strong> = Sueldo Básico + Asignación Familiar (S/ 102.50)</div>
            <div>• <strong>Descuentos de Ley</strong> = Pensión (AFP ~12.8% u ONP 13%) + Impuesto de 5ta Categoría</div>
            <div>• <strong>Sueldo Neto</strong> = Total Ingreso - Descuentos de Ley</div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos de tu Sueldo en Planilla</h2>
          </div>

          <InputNumber
            id="grossSalary"
            label="Sueldo bruto pactado mensual"
            prefix="S/"
            value={grossSalary}
            onChange={(grossSalary) => setGrossSalary(grossSalary)}
            helpText="Monto en contrato antes de descuentos"
            placeholder="2500.00"
            required
          />

          {/* Pension System Selection */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
              Sistema de Pensiones (AFP u ONP)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'afp_integra', name: 'AFP Integra (~12.68%)' },
                { id: 'afp_prima', name: 'AFP Prima (~12.78%)' },
                { id: 'afp_profuturo', name: 'AFP Profuturo (~12.89%)' },
                { id: 'afp_habitat', name: 'AFP Habitat (~12.67%)' },
                { id: 'onp', name: 'ONP (13.00%)' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPensionSystem(p.id as PensionSystem)}
                  className={`rounded-xl p-2.5 text-xs font-bold text-left border transition-all cursor-pointer ${
                    pensionSystem === p.id
                      ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-700'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <SwitchToggle
            id="hasDependents"
            label="¿Tienes hijos menores de edad o dependientes?"
            description="Agrega el 10% de Asignación Familiar legal (+S/ 102.50)"
            checked={hasDependents}
            onChange={(hasDependents) => setHasDependents(hasDependents)}
            badge="Beneficio"
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-300 dark:border-blue-800/80 bg-blue-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-blue-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Sueldo Neto a Recibir
              </span>
              <span className="rounded-full bg-blue-700 dark:bg-blue-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                En Cuenta
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Sueldo Neto Mensual
              </span>
              <div
                title={formatCurrency(result.netSalary)}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-900 dark:text-blue-400 mt-1 font-mono tracking-tight truncate max-w-full px-2"
              >
                {formatCurrency(result.netSalary)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                Líquido depositado en tu cuenta sueldo
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Descuento Pensión"
                value={formatCurrency(result.pensionDeduction)}
                type="warning"
                subValue={`Tasa: ${formatPercent(result.pensionRate)}`}
              />
              <ResultMetricCard
                label="5ta Categoría (SUNAT)"
                value={formatCurrency(result.fifthCategoryTaxMonthly)}
                type="neutral"
                subValue={result.fifthCategoryTaxMonthly > 0 ? 'Retención mensual' : 'Exonerado (≤7 UIT)'}
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-2xl bg-white/90 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5 border border-blue-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex justify-between font-medium">
                <span>Ingreso Total Bruto:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(result.totalGrossIncome)}</span>
              </div>
              {hasDependents && (
                <div className="flex justify-between font-medium text-emerald-700 dark:text-emerald-400">
                  <span>Asignación Familiar:</span>
                  <span className="font-bold">+{formatCurrency(result.familyAllowance)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-slate-500">
                <span>Aporte EsSalud (Paga la empresa 9%):</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(result.essaludContributionEmployer)}</span>
              </div>
            </div>

            <ShareButtons title="Cálculo de Sueldo Neto Perú" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
