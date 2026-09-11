'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import {
  calculateSeverancePay,
  LaborRegime,
  SeparationReason,
} from '@/core/calculators/severancePay';
import { calculateCompleteGratificationMonths } from '@/core/calculators/laborPeriods';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { ExportPdfButton } from '@/shared/components/ui/ExportPdfButton';
import { Briefcase, AlertCircle } from 'lucide-react';

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
  const [employmentStartDate, setEmploymentStartDate] = useState<string>('');
  const [terminationDate, setTerminationDate] = useState<string>('');

  // Despido arbitrario
  const [totalYearsWorked, setTotalYearsWorked] = useState<number>(2);
  const [totalMonthsWorked, setTotalMonthsWorked] = useState<number>(6);

  const automaticGratiMonths = employmentStartDate && terminationDate
    ? calculateCompleteGratificationMonths(employmentStartDate, terminationDate)
    : null;
  const hasInvalidDateRange = Boolean(employmentStartDate && terminationDate && automaticGratiMonths === null);
  const effectiveGratiMonths = automaticGratiMonths ?? monthsInLastSemesterGrati;

  const result = calculateSeverancePay({
    baseSalary,
    hasFamilyAllowance,
    laborRegime,
    separationReason,
    hasEps,
    monthsInLastSemesterCts,
    monthsInLastSemesterGrati: effectiveGratiMonths,
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
      question: '¿Qué conceptos integran legalmente la liquidación de beneficios sociales en el Perú?',
      answer: 'Al cesar una relación laboral por renuncia, mutuo disenso, vencimiento de contrato o despido, la liquidación debe integrar obligatoriamente: 1) CTS trunca (fracción de meses y días transcurridos desde el último depósito semestral de mayo o noviembre); 2) Gratificación trunca del semestre en curso (enero-junio o julio-diciembre) más la bonificación extraordinaria de EsSalud (9%) o EPS (6.75%); 3) Vacaciones truncas proporcionales a los meses laborados y vacaciones vencidas no gozadas si las hubiere; 4) Días laborados en el mes pendientes de remuneración; y 5) En caso de despido arbitrario injustificado, la indemnización legal correspondiente.',
    },
    {
      question: '¿Cuál es el plazo legal que tiene la empresa para pagar la liquidación?',
      answer: 'El artículo 56 del Reglamento de la Ley de Fomento del Empleo establece que el empleador cuenta con un plazo máximo perentorio de 48 horas posteriores al cese de la relación laboral para abonar el íntegro de la liquidación de beneficios sociales y entregar la constancia de cese para la liberación de la CTS en el banco. Si la empresa excede las 48 horas, se generan automáticamente intereses legales laborales fijados por la SBS y el trabajador puede formular una denuncia formal ante la SUNAFIL.',
    },
    {
      question: '¿Cómo se calcula la indemnización por despido arbitrario en el Régimen General?',
      answer: 'Conforme al artículo 38 del D.L. N° 728: 1) En contratos a plazo indeterminado, la indemnización equivale a una remuneración y media ordinaria mensual (1.5 sueldos) por cada año completo de servicios, abonándose las fracciones de año por dozavos y treintavos, con un tope legal máximo absoluto de 12 remuneraciones; 2) En contratos sujetos a modalidad (plazo fijo), equivale a una remuneración y media mensual por cada mes que falte para el vencimiento del contrato, también con tope de 12 sueldos.',
    },
    {
      question: '¿Qué descuentos se aplican sobre el monto total de la liquidación?',
      answer: 'La CTS trunca y las gratificaciones truncas con su bonificación extraordinaria están 100% inafectas de descuentos para AFP u ONP. Sin embargo, las vacaciones truncas y los días laborados pendientes sí están sujetos a los descuentos de ley para pensiones (13% ONP o ~12% AFP) y a la retención de Impuesto a la Renta de 5ta Categoría si los ingresos anuales superan las 7 UIT. La indemnización por despido arbitrario es un concepto reparatorio 100% inafecto de tributos y descuentos previsionales.',
    },
    {
      question: '¿Los trabajadores de Pequeñas Empresas o Microempresas reciben indemnización por despido?',
      answer: 'Sí, pero con escalas especiales: En la Pequeña Empresa formal inscrita en el REMYPE, la indemnización por despido arbitrario equivale a 20 días de remuneración por cada año laborado con un tope de 120 días (4 sueldos). En la Microempresa acreditada, equivale a 10 días de sueldo por año laborado con un tope máximo de 90 días (3 sueldos).',
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
              Guía de Derechos Laborales: ¿Cómo se calcula la Liquidación en el Perú (D.L. 728)?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              La <strong>Liquidación de Beneficios Sociales</strong> es el documento legal y económico mediante el cual el empleador salda todas las deudas laborales acumuladas con el colaborador al finalizar el vínculo contractual, ya sea por renuncia voluntaria con preaviso, mutuo disenso, no renovación de contrato o despido intempestivo (Decreto Supremo N° 003-97-TR).
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Componentes esenciales de la liquidación por renuncia o despido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• 1. CTS Trunca:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Meses y días computables desde el último depósito (mayo o noviembre). Base = Sueldo + Asig. Fam. + (Grati ÷ 6).
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-sky-800 dark:text-sky-400 block">• 2. Gratificación Trunca:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Un sexto por cada mes calendario completo laborado en el semestre, más la bonificación del 9% de EsSalud (inafecto a AFP).
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-purple-800 dark:text-purple-400 block">• 3. Vacaciones Truncas:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Fracción de días por el récord vacacional en curso que no llegó a gozarse. Sujeto a aportes de pensión (AFP/ONP).
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico numérico (Renuncia voluntaria en Régimen General)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Trabajador que renuncia tras 4 meses del último depósito de CTS (noviembre a febrero), con 4 meses transcurridos del periodo de gratificación, 8 meses de récord vacacional pendiente y sueldo ordinario mensual de <strong>S/ 3,000.00</strong>:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Beneficio Social Trunco</th>
                    <th className="p-2.5">Fórmula de Fracción</th>
                    <th className="p-2.5">Monto Líquido (PEN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-semibold">CTS Trunca Acumulada</td>
                    <td className="p-2.5 text-slate-500">(S/ 3,500 base ÷ 12) × 4 meses</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">S/ 1,166.67</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Gratificación Trunca Legal</td>
                    <td className="p-2.5 text-slate-500">(S/ 3,000 ÷ 6) × 4 meses</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">S/ 2,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Bonificación Extraordinaria EsSalud (9%)</td>
                    <td className="p-2.5 text-slate-500">9% de S/ 2,000</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">+ S/ 180.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Vacaciones Truncas Pendientes</td>
                    <td className="p-2.5 text-slate-500">(S/ 3,000 ÷ 12) × 8 meses</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">S/ 2,000.00</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950 font-bold text-slate-900 dark:text-white">
                    <td className="p-2.5 text-emerald-800 dark:text-emerald-300">Total Liquidación de Beneficios Sociales</td>
                    <td className="p-2.5 text-slate-500 font-normal">Suma de conceptos truncos</td>
                    <td className="p-2.5 font-mono text-emerald-800 dark:text-emerald-300 text-sm">S/ 5,346.67</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Normas laborales oficiales:</span>
            <p>
              • <strong>Decreto Supremo N° 003-97-TR:</strong> Texto Único Ordenado del D.L. 728, Ley de Productividad y Competitividad Laboral.<br />
              • <strong>Decreto Supremo N° 001-96-TR:</strong> Reglamento del Texto Único Ordenado de la Ley de Fomento del Empleo (Plazo de 48 horas).<br />
              • <strong>Decreto Legislativo N° 713:</strong> Legislación sobre descansos remunerados y vacaciones anuales pagadas.
            </p>
          </div>
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

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
              <div className="mb-3">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Calcular gratificación desde fechas</p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">Ingresa el inicio laboral y el cese; se contarán únicamente los meses calendario completos del semestre.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-200 sm:text-sm">
                  Fecha de inicio laboral
                  <input
                    type="date"
                    value={employmentStartDate}
                    max={terminationDate || undefined}
                    onInput={(event) => setEmploymentStartDate(event.currentTarget.value)}
                    onChange={(event) => setEmploymentStartDate(event.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-200 sm:text-sm">
                  Fecha de cese
                  <input
                    type="date"
                    value={terminationDate}
                    min={employmentStartDate || undefined}
                    onInput={(event) => setTerminationDate(event.currentTarget.value)}
                    onChange={(event) => setTerminationDate(event.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
              </div>
              {hasInvalidDateRange && (
                <p className="mt-3 text-xs font-semibold text-rose-700 dark:text-rose-300">La fecha de cese debe ser igual o posterior al inicio laboral.</p>
              )}
              {automaticGratiMonths !== null && (
                <p className="mt-3 text-xs font-semibold text-indigo-800 dark:text-indigo-300">
                  Gratificación trunca: {automaticGratiMonths} {automaticGratiMonths === 1 ? 'mes calendario completo' : 'meses calendario completos'} en el semestre del cese.
                </p>
              )}
            </div>

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
                helpText={automaticGratiMonths !== null ? 'Calculado por fechas' : 'Desde enero o julio'}
                value={effectiveGratiMonths}
                onChange={(val) => setMonthsInLastSemesterGrati(val)}
                min={0}
                max={6}
                placeholder="4"
                disabled={automaticGratiMonths !== null}
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
              label="Asignación Familiar (+S/ 113.00)"
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
                subValue={`${effectiveGratiMonths} meses · Bono ${hasEps ? '6.75%' : '9%'}`}
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
                    { label: 'Asignación Familiar', value: hasFamilyAllowance ? 'S/ 113.00' : 'S/ 0.00' },
                    { label: 'Régimen Laboral', value: laborRegime === 'general' ? 'Régimen General (100%)' : laborRegime === 'pequena_empresa' ? 'Pequeña Empresa MYPE (50%)' : 'Microempresa' },
                    ...(employmentStartDate && terminationDate && !hasInvalidDateRange ? [
                      { label: 'Fecha de inicio laboral', value: employmentStartDate },
                      { label: 'Fecha de cese', value: terminationDate },
                      { label: 'Meses completos para gratificación', value: String(effectiveGratiMonths) },
                    ] : []),
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
