'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import {
  calculateSeverancePay,
  LaborRegime,
  SeparationReason,
} from '@/core/calculators/severancePay';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { ExportPdfButton } from '@/shared/components/ui/ExportPdfButton';
import { Briefcase, AlertCircle, FileCheck2 } from 'lucide-react';

export default function LiquidacionLaboralPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'liquidacion-laboral') || {
    id: 'liquidacion-laboral',
    slug: '/liquidacion-laboral',
    title: 'Calculadora de Liquidación Laboral Todo en 1 (Beneficios y Despido)',
    shortTitle: 'Liquidación Laboral Todo en 1',
    description: 'Calcula tu liquidación completa ante cese o despido: CTS trunca, gratificación, bono EsSalud, vacaciones truncas e indemnización legal.',
    cardSummary: 'Calcula tu liquidación total: CTS, Grati, Vacaciones y Despido',
    category: 'laboral' as const,
    tag: 'PLANILLA',
    icon: 'Briefcase',
    badge: 'Completo',
    keywords: ['liquidacion laboral peru', 'calcular liquidacion', 'cuanto me pagan por renuncia', 'indemnizacion despido arbitrario', 'cts grati vacaciones truncas'],
  };

  const [baseSalary, setBaseSalary] = useState<number>(3000);
  const [hasFamilyAllowance, setHasFamilyAllowance] = useState<boolean>(false);
  const [laborRegime, setLaborRegime] = useState<LaborRegime>('general');
  const [separationReason, setSeparationReason] = useState<SeparationReason>('renuncia');
  const [hasEps, setHasEps] = useState<boolean>(false);

  // Semestres y periodos
  const [monthsInLastSemesterCts, setMonthsInLastSemesterCts] = useState<number>(4);
  const [monthsInLastSemesterGrati, setMonthsInLastSemesterGrati] = useState<number>(4);
  const [monthsInLastYearVacations, setMonthsInLastYearVacations] = useState<number>(8);

  // Despido arbitrario
  const [totalYearsWorked, setTotalYearsWorked] = useState<number>(2);
  const [totalMonthsWorked, setTotalMonthsWorked] = useState<number>(6);

  const result = calculateSeverancePay({
    baseSalary,
    hasFamilyAllowance,
    laborRegime,
    separationReason,
    hasEps,
    monthsInLastSemesterCts,
    monthsInLastSemesterGrati,
    monthsInLastYearVacations,
    totalYearsWorkedForIndemnity: totalYearsWorked,
    totalMonthsWorkedForIndemnity: totalMonthsWorked,
  });

  const isDismissal = separationReason === 'despido_arbitrario';

  const shareSummary = `Liquidación Laboral Calculada:
Total Beneficios Sociales: ${formatCurrency(result.subtotalBenefits)}
${isDismissal ? `Indemnización por Despido: ${formatCurrency(result.arbitraryDismissalIndemnity)}\n` : ''}Total Liquidación a Percibir: ${formatCurrency(result.totalSettlement)}`;

  const faqs = [
    {
      question: '¿Qué conceptos integran la liquidación de beneficios sociales en Perú?',
      answer: 'La liquidación incluye: 1) CTS trunca acumulada desde el último depósito, 2) Gratificación trunca del semestre en curso más su 9% de bonificación EsSalud, 3) Vacaciones truncas y no gozadas, y 4) Remuneraciones o días pendientes de pago.',
    },
    {
      question: '¿En cuánto tiempo la empresa debe pagar la liquidación?',
      answer: 'El empleador tiene un plazo legal máximo de 48 horas posteriores al cese o término del vínculo laboral para efectuar el pago y entregar la constancia de liquidación y certificado de trabajo.',
    },
    {
      question: '¿Cuánto corresponde por despido arbitrario (sin causa justa)?',
      answer: 'En contratos a plazo indeterminado del Régimen General, corresponde 1.5 sueldos por cada año completo laborado (más dozavos por meses), con un tope máximo legal de 12 sueldos.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Te permite conocer el monto exacto de tu liquidación ante una renuncia voluntaria, fin de contrato o despido intempestivo, desglosando cada derecho según el régimen laboral y la ley del MTPE.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos Laborales del Trabajador</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="baseSalary"
              label="Último Sueldo Básico Mensual"
              prefix="S/"
              value={baseSalary}
              onChange={(val) => setBaseSalary(val)}
              placeholder="3000.00"
              required
            />

            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
                Régimen Laboral
              </label>
              <select
                value={laborRegime}
                onChange={(e) => setLaborRegime(e.target.value as LaborRegime)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-600"
              >
                <option value="general">Régimen General (100% beneficios)</option>
                <option value="pequena_empresa">Pequeña Empresa MYPE (50% beneficios)</option>
                <option value="microempresa">Microempresa (Solo vacaciones)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
              Motivo de Término Laboral
            </label>
            <select
              value={separationReason}
              onChange={(e) => setSeparationReason(e.target.value as SeparationReason)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-600"
            >
              <option value="renuncia">Renuncia Voluntaria (Carta de renuncia)</option>
              <option value="fin_contrato">Término / No renovación de Contrato</option>
              <option value="mutuo_disenso">Mutuo Acuerdo / Disenso</option>
              <option value="despido_arbitrario">Despido Arbitrario / Sin causa justa (+ Indemnización)</option>
            </select>
          </div>

          {/* Dismissal specific inputs */}
          {isDismissal && (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                <AlertCircle className="h-4 w-4" />
                <span>Tiempo Total en la Empresa (Para Indemnización)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputNumber
                  id="totalYears"
                  label="Años completos laborados"
                  value={totalYearsWorked}
                  onChange={(val) => setTotalYearsWorked(val)}
                  min={0}
                  max={40}
                  placeholder="2"
                />
                <InputNumber
                  id="totalMonths"
                  label="Meses adicionales"
                  value={totalMonthsWorked}
                  onChange={(val) => setTotalMonthsWorked(val)}
                  min={0}
                  max={11}
                  placeholder="6"
                />
              </div>
            </div>
          )}

          {/* Semesters Worked */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Meses laborados pendientes de liquidar:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputNumber
                id="ctsMonths"
                label="Meses para CTS"
                helpText="Desde mayo o nov."
                value={monthsInLastSemesterCts}
                onChange={(val) => setMonthsInLastSemesterCts(val)}
                min={0}
                max={6}
                placeholder="4"
              />
              <InputNumber
                id="gratiMonths"
                label="Meses para Grati"
                helpText="Desde enero o julio"
                value={monthsInLastSemesterGrati}
                onChange={(val) => setMonthsInLastSemesterGrati(val)}
                min={0}
                max={6}
                placeholder="4"
              />
              <InputNumber
                id="vacMonths"
                label="Meses para Vacaciones"
                helpText="Periodo anual"
                value={monthsInLastYearVacations}
                onChange={(val) => setMonthsInLastYearVacations(val)}
                min={0}
                max={12}
                placeholder="8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <SwitchToggle
              id="hasFamilyAllowance"
              label="Asignación Familiar (+S/ 102.50)"
              description="Hijos menores o universitarios"
              checked={hasFamilyAllowance}
              onChange={(val) => setHasFamilyAllowance(val)}
            />
            <SwitchToggle
              id="hasEps"
              label="Afiliado a EPS (Bono 6.75%)"
              description="Por defecto 9% EsSalud"
              checked={hasEps}
              onChange={(val) => setHasEps(val)}
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-indigo-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                Liquidación Final
              </span>
              <span className="rounded-full bg-indigo-700 dark:bg-indigo-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                Plazo 48h MTPE
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-indigo-200 dark:border-indigo-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Total Neto a Liquidar
              </span>
              <div
                title={formatCurrency(result.totalSettlement)}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-900 dark:text-indigo-400 mt-1 font-mono tracking-tight break-words px-2"
              >
                {formatCurrency(result.totalSettlement)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                {isDismissal ? 'Incluye indemnización legal por despido' : 'Beneficios sociales truncos de ley'}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="CTS Trunca"
                value={formatCurrency(result.truncatedCts)}
                type="neutral"
                subValue={`${monthsInLastSemesterCts} meses`}
              />
              <ResultMetricCard
                label="Gratificación + Bono"
                value={formatCurrency(result.truncatedGrati + result.essaludBonus)}
                type="success"
                subValue={`Grati + Bono ${hasEps ? '6.75%' : '9%'}`}
              />
              <ResultMetricCard
                label="Vacaciones Truncas"
                value={formatCurrency(result.truncatedVacations)}
                type="neutral"
                subValue={`${monthsInLastYearVacations} meses`}
              />
              {isDismissal ? (
                <ResultMetricCard
                  label="Indemnización Despido"
                  value={formatCurrency(result.arbitraryDismissalIndemnity)}
                  type="warning"
                  subValue="1.5 sueldos / año"
                />
              ) : (
                <ResultMetricCard
                  label="Remun. Computable"
                  value={formatCurrency(result.computableSalaryForGrati)}
                  type="neutral"
                  subValue="Base de cálculo"
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <ExportPdfButton
                className="flex-1"
                getReportOptions={() => ({
                  title: 'Hoja de Liquidación de Beneficios Sociales',
                  subtitle: `Liquidación integral laboral calculada bajo normativa MTPE Perú`,
                  items: [
                    { label: 'Último Sueldo Básico', value: formatCurrency(baseSalary) },
                    { label: 'Asignación Familiar', value: hasFamilyAllowance ? 'S/ 102.50' : 'S/ 0.00' },
                    { label: 'Régimen Laboral', value: laborRegime === 'general' ? 'Régimen General (100%)' : laborRegime === 'pequena_empresa' ? 'Pequeña Empresa MYPE (50%)' : 'Microempresa' },
                    { label: 'CTS Trunca', value: formatCurrency(result.truncatedCts) },
                    { label: 'Gratificación Trunca', value: formatCurrency(result.truncatedGrati) },
                    { label: `Bonificación EsSalud (${hasEps ? '6.75%' : '9%'})`, value: formatCurrency(result.essaludBonus) },
                    { label: 'Vacaciones Truncas', value: formatCurrency(result.truncatedVacations) },
                    ...(isDismissal ? [{ label: 'Indemnización por Despido Arbitrario', value: formatCurrency(result.arbitraryDismissalIndemnity), isHighlight: true }] : []),
                    { label: 'Total Liquidación a Percibir', value: formatCurrency(result.totalSettlement), isHighlight: true },
                  ],
                  totalLabel: 'Total Liquidación',
                  totalValue: formatCurrency(result.totalSettlement),
                  notes: [
                    'El pago de la liquidación de beneficios sociales debe efectuarse dentro de las 48 horas siguientes al cese laboral (D.L. 650 y D.L. 728).',
                    'Las gratificaciones extraordinarias y CTS no están afectas a descuentos de AFP/ONP.',
                  ],
                })}
              />
            </div>

            <div className="mt-3">
              <ShareButtons title="Liquidación Laboral Perú Todo en 1" shareText={shareSummary} />
            </div>
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
