'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import {
  AfpCommissionScheme,
  calculateNetSalary,
  FifthCategoryMode,
  PensionSystem,
} from '@/core/calculators/payroll';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { ExportPdfButton } from '@/shared/components/ui/ExportPdfButton';
import { Briefcase, ChevronDown, Settings2 } from 'lucide-react';

export default function SueldoNetoPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'sueldo-neto')!;

  const [grossSalary, setGrossSalary] = useState<number>(2500);
  const [pensionSystem, setPensionSystem] = useState<PensionSystem>('afp_integra');
  const [hasDependents, setHasDependents] = useState<boolean>(false);
  const [afpCommissionScheme, setAfpCommissionScheme] = useState<AfpCommissionScheme>('flow');
  const [showPayrollDetails, setShowPayrollDetails] = useState<boolean>(false);
  const [variableRemuneration, setVariableRemuneration] = useState<number>(0);
  const [nonRemunerativeIncome, setNonRemunerativeIncome] = useState<number>(0);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  const [fifthCategoryMode, setFifthCategoryMode] = useState<FifthCategoryMode>('estimated');
  const [manualFifthCategoryTax, setManualFifthCategoryTax] = useState<number>(0);

  const result = calculateNetSalary({
    grossSalary,
    pensionSystem,
    hasDependents,
    afpCommissionScheme,
    variableRemuneration,
    nonRemunerativeIncome,
    otherDeductions,
    fifthCategoryMode,
    manualFifthCategoryTax,
  });

  const shareSummary = `Sueldo Bruto: ${formatCurrency(result.totalGrossIncome)}
Descuento Pensión: ${formatCurrency(result.pensionDeduction)} (${formatPercent(result.pensionRate)})
Otros descuentos: ${formatCurrency(result.otherDeductions)}
Sueldo Neto en Cuenta: ${formatCurrency(result.netSalary)}`;

  const faqs = [
    {
      question: '¿Qué descuentos se aplican al sueldo bruto en planilla en Perú?',
      answer: 'Principalmente el aporte previsional: 13% si estás en la ONP; en AFP depende de si permaneces en comisión sobre flujo o en comisión mixta/saldo. También puede corresponder retención de quinta categoría y otros descuentos autorizados o registrados en la boleta.',
    },
    {
      question: '¿Qué es la Asignación Familiar?',
      answer: 'Es un beneficio legal equivalente al 10% de la Remuneración Mínima Vital (RMV) vigente (actualmente S/ 113.00) para los trabajadores que tengan a su cargo uno o más hijos menores de 18 años (o hasta 24 si estudian).',
    },
    {
      question: '¿El 9% de EsSalud se le descuenta al trabajador?',
      answer: 'NO. El aporte del 9% a EsSalud lo paga íntegramente el empleador sobre tu sueldo computable; no se resta de tu salario en mano.',
    },
    {
      question: '¿Por qué el neto puede ser diferente al de mi boleta?',
      answer: 'La boleta puede incluir horas extras, comisiones, bonos, tardanzas, adelantos, préstamos, ingresos no remunerativos y una retención de quinta categoría calculada según el mes y tus ingresos acumulados. Abre “Personalizar otros conceptos de planilla” para incorporarlos o usar la retención exacta indicada por tu empleador.',
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
            <div>• <strong>Base afecta</strong> = Sueldo + Asignación Familiar + conceptos remunerativos variables</div>
            <div>• <strong>Total Ingreso</strong> = Base afecta + conceptos no remunerativos ingresados</div>
            <div>• <strong>Descuentos</strong> = AFP/ONP + quinta categoría + otros descuentos de boleta</div>
            <div>• <strong>Sueldo Neto</strong> = Total Ingreso - Descuentos</div>
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
                { id: 'afp_integra', name: 'AFP Integra' },
                { id: 'afp_prima', name: 'AFP Prima' },
                { id: 'afp_profuturo', name: 'AFP Profuturo' },
                { id: 'afp_habitat', name: 'AFP Habitat' },
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

          {pensionSystem !== 'onp' && (
            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <legend className="px-1 text-xs font-bold text-slate-900 dark:text-slate-200">
                Esquema de comisión AFP
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAfpCommissionScheme('flow')}
                  className={`rounded-xl border p-3 text-left text-xs transition-colors ${
                    afpCommissionScheme === 'flow'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  <strong className="block">Comisión sobre flujo</strong>
                  <span className="mt-1 block opacity-80">La comisión se descuenta de tu remuneración.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAfpCommissionScheme('balance')}
                  className={`rounded-xl border p-3 text-left text-xs transition-colors ${
                    afpCommissionScheme === 'balance'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  <strong className="block">Comisión mixta / saldo</strong>
                  <span className="mt-1 block opacity-80">En la boleta se descuenta 10% + seguro; la comisión anual va al fondo.</span>
                </button>
              </div>
            </fieldset>
          )}

          <SwitchToggle
            id="hasDependents"
            label="¿Tienes hijos menores de edad o dependientes?"
            description="Agrega el 10% de Asignación Familiar legal (+S/ 113.00)"
            checked={hasDependents}
            onChange={(hasDependents) => setHasDependents(hasDependents)}
            badge="Beneficio"
          />

          <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowPayrollDetails((current) => !current)}
              aria-expanded={showPayrollDetails}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-bold text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                Personalizar otros conceptos de planilla
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showPayrollDetails ? 'rotate-180' : ''}`} />
            </button>

            {showPayrollDetails && (
              <div className="mt-4 space-y-5 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputNumber
                    id="variableRemuneration"
                    label="Ingresos remunerativos variables"
                    prefix="S/"
                    value={variableRemuneration}
                    onChange={setVariableRemuneration}
                    helpText="Horas extra, bonos, comisiones"
                    placeholder="0.00"
                  />
                  <InputNumber
                    id="nonRemunerativeIncome"
                    label="Ingresos no remunerativos"
                    prefix="S/"
                    value={nonRemunerativeIncome}
                    onChange={setNonRemunerativeIncome}
                    helpText="Solo conceptos no afectos"
                    placeholder="0.00"
                  />
                  <InputNumber
                    id="otherDeductions"
                    label="Otros descuentos de boleta"
                    prefix="S/"
                    value={otherDeductions}
                    onChange={setOtherDeductions}
                    helpText="Adelantos, préstamos u otros"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="fifthCategoryMode" className="mb-2 block text-xs font-bold text-slate-900 dark:text-slate-200">
                    Impuesto de quinta categoría
                  </label>
                  <select
                    id="fifthCategoryMode"
                    value={fifthCategoryMode}
                    onChange={(event) => setFifthCategoryMode(event.target.value as FifthCategoryMode)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="estimated">Estimar automáticamente</option>
                    <option value="manual">Usar retención exacta de mi boleta</option>
                    <option value="none">No aplicar retención este mes</option>
                  </select>
                </div>

                {fifthCategoryMode === 'manual' && (
                  <InputNumber
                    id="manualFifthCategoryTax"
                    label="Retención de quinta indicada en tu boleta"
                    prefix="S/"
                    value={manualFifthCategoryTax}
                    onChange={setManualFifthCategoryTax}
                    placeholder="0.00"
                    required
                  />
                )}

                <p className="text-[11px] leading-5 text-slate-600 dark:text-slate-400">
                  Clasifica como no remunerativo solo un concepto que legalmente no integre la remuneración computable. Si tienes dudas, usa la opción remunerativa o compárala con tu boleta.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-300 dark:border-blue-800/80 bg-blue-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-blue-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Sueldo Neto a Recibir
              </span>
              <span className="rounded-full bg-blue-700 dark:bg-blue-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                {showPayrollDetails ? 'Personalizado' : 'Estimación rápida'}
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
                Neto estimado luego de los conceptos ingresados
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
                subValue={fifthCategoryMode === 'manual'
                  ? 'Monto de tu boleta'
                  : fifthCategoryMode === 'none'
                    ? 'No aplicada'
                    : result.fifthCategoryTaxMonthly > 0
                      ? 'Proyección simplificada'
                      : 'Sin retención estimada'}
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-2xl bg-white/90 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5 border border-blue-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex justify-between font-medium">
                <span>Sueldo básico:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(grossSalary)}</span>
              </div>
              {hasDependents && (
                <div className="flex justify-between font-medium text-emerald-700 dark:text-emerald-400">
                  <span>Asignación Familiar:</span>
                  <span className="font-bold">+{formatCurrency(result.familyAllowance)}</span>
                </div>
              )}
              {result.variableRemuneration > 0 && (
                <div className="flex justify-between font-medium text-blue-700 dark:text-blue-400">
                  <span>Ingresos variables:</span>
                  <span className="font-bold">+{formatCurrency(result.variableRemuneration)}</span>
                </div>
              )}
              {result.nonRemunerativeIncome > 0 && (
                <div className="flex justify-between font-medium text-emerald-700 dark:text-emerald-400">
                  <span>Ingresos no remunerativos:</span>
                  <span className="font-bold">+{formatCurrency(result.nonRemunerativeIncome)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-slate-500 dark:text-slate-400">
                <span>Base afecta a aportes:</span>
                <span className="font-semibold">{formatCurrency(result.pensionableIncome)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-medium dark:border-slate-800">
                <span>Total antes de descuentos:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(result.totalGrossIncome)}</span>
              </div>
              <div className="flex justify-between font-medium text-rose-700 dark:text-rose-400">
                <span>Descuentos totales:</span>
                <span className="font-bold">−{formatCurrency(result.totalDeductions)}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-500">
                <span>Aporte EsSalud (Paga la empresa 9%):</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(result.essaludContributionEmployer)}</span>
              </div>
            </div>

            <div className="mb-4">
              <ExportPdfButton
                className="w-full"
                label="Descargar estimación en PDF"
                getReportOptions={() => ({
                  title: 'Resumen Estimado de Sueldo Neto',
                  subtitle: `Desglose de remuneración y aportes según legislación laboral de Perú`,
                  items: [
                    { label: 'Sueldo Básico Mensual', value: formatCurrency(grossSalary) },
                    { label: 'Asignación Familiar', value: hasDependents ? 'S/ 113.00' : 'S/ 0.00' },
                    ...(result.variableRemuneration > 0 ? [{ label: 'Ingresos Remunerativos Variables', value: formatCurrency(result.variableRemuneration) }] : []),
                    ...(result.nonRemunerativeIncome > 0 ? [{ label: 'Ingresos No Remunerativos', value: formatCurrency(result.nonRemunerativeIncome) }] : []),
                    { label: 'Remuneración Bruta Total', value: formatCurrency(result.totalGrossIncome), isHighlight: true },
                    { label: `Descuento de Pensión (${pensionSystem === 'onp' ? 'ONP 13%' : 'AFP'})`, value: `- ${formatCurrency(result.pensionDeduction)}` },
                    ...(result.fifthCategoryTaxMonthly > 0 ? [{ label: 'Retención 5ta Categoría (SUNAT)', value: `- ${formatCurrency(result.fifthCategoryTaxMonthly)}` }] : []),
                    ...(result.otherDeductions > 0 ? [{ label: 'Otros Descuentos de Boleta', value: `- ${formatCurrency(result.otherDeductions)}` }] : []),
                    { label: 'SUELDO NETO A RECIBIR (EN MANO)', value: formatCurrency(result.netSalary), isHighlight: true },
                    { label: 'Aporte Empleador a EsSalud (9%)', value: formatCurrency(result.essaludContributionEmployer) },
                  ],
                  totalLabel: 'Neto a Percibir',
                  totalValue: formatCurrency(result.netSalary),
                  notes: [
                    'Documento informativo generado mediante CalculaPerú.',
                    fifthCategoryMode === 'estimated'
                      ? 'La quinta categoría mostrada es una proyección simplificada; la retención real depende del mes, ingresos previos y retenciones acumuladas.'
                      : fifthCategoryMode === 'manual'
                        ? 'Se utilizó la retención de quinta categoría ingresada por el usuario según su boleta.'
                        : 'No se aplicó retención de quinta categoría por elección del usuario.',
                  ],
                })}
              />
            </div>

            <ShareButtons title="Cálculo de Sueldo Neto Perú" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
