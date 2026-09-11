'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { analyzeAtypicalSchedule, calculateOvertime } from '@/core/calculators/overtime';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock } from 'lucide-react';

type ScheduleType = 'regular' | 'atypical';

const ATYPICAL_PRESETS = [
  { label: '14×7', workDays: 14, restDays: 7 },
  { label: '14×14', workDays: 14, restDays: 14 },
  { label: '20×10', workDays: 20, restDays: 10 },
];

export default function HorasExtrasPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'horas-extras')!;

  const [baseMonthlySalary, setBaseMonthlySalary] = useState<number>(2000);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('regular');
  const [workDays, setWorkDays] = useState<number>(14);
  const [restDays, setRestDays] = useState<number>(7);
  const [hoursPerShift, setHoursPerShift] = useState<number>(12);
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

  const atypicalSchedule = analyzeAtypicalSchedule({ workDays, restDays, hoursPerShift });

  const shareSummary = `Horas Extras en Perú:${scheduleType === 'atypical' ? `
Rol atípico: ${workDays}×${restDays}, ${hoursPerShift} h por turno
Promedio semanal del ciclo: ${atypicalSchedule.averageWeeklyHours} h` : ''}
Valor Hora Ordinaria: ${formatCurrency(result.hourlyRate)}
Pago Horas (25%): ${formatCurrency(result.pay25Percent)} (${hoursFirstTwo} hrs)
Pago Horas (35%): ${formatCurrency(result.pay35Percent)} (${hoursAfterTwo} hrs)
Total Horas Extras a Cobrar: ${formatCurrency(result.totalOvertimePay)}`;

  const faqs = [
    {
      question: '¿Cómo se determina legalmente el valor de una hora ordinaria de trabajo en el Perú?',
      answer: 'De acuerdo con el artículo 12 del D.S. N° 007-2002-TR, el valor de la hora de trabajo ordinaria se obtiene dividiendo la remuneración ordinaria mensual (sueldo básico mensual más la Asignación Familiar y conceptos remunerativos fijos) entre 30 días, y ese resultado entre el número de horas de la jornada ordinaria diaria del trabajador (usualmente 8 horas, lo que equivale a dividir la base mensual entre 240).',
    },
    {
      question: '¿Cuáles son los porcentajes de sobretasa fijados por ley para las horas extras?',
      answer: 'La legislación laboral peruana establece dos tramos de recargo mínimo obligatorio: 1) Para las dos primeras horas extras laboradas en el día, el valor de la hora se remunera con una sobretasa del 25% sobre el valor hora ordinaria; 2) A partir de la tercera hora extra en adelante en el mismo día, la sobretasa legal aumenta al 35% sobre el valor hora ordinaria.',
    },
    {
      question: '¿Cuánto se debe pagar por laborar en día feriado o día de descanso semanal obligatorio?',
      answer: 'Conforme al Decreto Legislativo N° 713, si un trabajador presta servicios durante su día de descanso semanal obligatorio o en un feriado no laborable de ámbito nacional sin que se le otorgue un día de descanso sustitutorio posterior, la empresa debe abonarle una triple remuneración: una por el día feriado (ya incluida en el sueldo mensual básico), otra por el trabajo efectivamente realizado, y una tercera como sobretasa o indemnización del 100%.',
    },
    {
      question: '¿El trabajo en sobretiempo (horas extras) es obligatorio o voluntario?',
      answer: 'El trabajo en sobretiempo es de naturaleza estrictamente voluntaria tanto para el trabajador como para el empleador. Ningún colaborador puede ser forzado a quedarse más allá de su jornada pactada, salvo en casos excepcionales calificados de fuerza mayor o peligro inminente que pongan en riesgo a las personas o los bienes del centro laboral. Imponer horas extras obligatorias constituye una falta laboral grave sancionable por la SUNAFIL.',
    },
    {
      question: '¿Las horas extras pueden compensarse con descanso físico en lugar de dinero?',
      answer: 'Sí. El artículo 26 del Reglamento de la Ley de Jornada de Trabajo permite que, previo acuerdo escrito celebrado entre el empleador y el trabajador, el sobretiempo realizado pueda compensarse con el otorgamiento de periodos equivalentes de descanso físico dentro del mes siguiente a aquel en que se realizó el trabajo adicional.',
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
              Guía Laboral: ¿Cómo se calculan las Horas Extras según el D.S. 007-2002-TR?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              El <strong>Trabajo en Sobretiempo</strong> (horas extras) es aquel servicio prestado más allá de la jornada ordinaria máxima legal (8 horas diarias o 48 horas semanales) establecida por el artículo 25 de la Constitución Política del Perú y el Texto Único Ordenado del Decreto Legislativo N° 854 (aprobado por Decreto Supremo N° 007-2002-TR).
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Fórmulas de liquidación horaria y sobretasas legales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Primeras 2 horas del día (+25%):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Cada una de las primeras 2 horas extraordinarias diarias se abona con un recargo del 25% sobre la hora ordinaria.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Valor Hora 25% = (Sueldo Mensual ÷ 240) × 1.25
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-800 dark:text-sky-400 block">• De la 3ra hora en adelante (+35%):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Por el mayor desgaste físico y mental, a partir de la tercera hora consecutiva la sobretasa aumenta al 35%.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Valor Hora 35% = (Sueldo Mensual ÷ 240) × 1.35
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico con liquidación mensual en boleta
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Un empleado con sueldo básico de <strong>S/ 2,400.00</strong> mensuales realiza 10 horas extras al 25% y 4 horas extras al 35% durante el mes de trabajo:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Tramo de Sobretiempo</th>
                    <th className="p-2.5">Valor Unitario por Hora</th>
                    <th className="p-2.5">Horas Efectivas</th>
                    <th className="p-2.5">Subtotal a Percibir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-semibold">Valor Hora Ordinaria (Base)</td>
                    <td className="p-2.5 font-mono">S/ 2,400 ÷ 240 = S/ 10.00</td>
                    <td className="p-2.5 text-slate-400">-</td>
                    <td className="p-2.5 font-mono">S/ 10.00 / hora</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Tramo 1: Horas con Sobretasa del 25%</td>
                    <td className="p-2.5 font-mono">S/ 10.00 × 1.25 = S/ 12.50</td>
                    <td className="p-2.5 font-semibold">10 horas</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">+ S/ 125.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Tramo 2: Horas con Sobretasa del 35%</td>
                    <td className="p-2.5 font-mono">S/ 10.00 × 1.35 = S/ 13.50</td>
                    <td className="p-2.5 font-semibold">4 horas</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">+ S/ 54.00</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950 font-bold text-slate-900 dark:text-white">
                    <td className="p-2.5 text-emerald-800 dark:text-emerald-300">Total Adicional de Horas Extras en Boleta</td>
                    <td className="p-2.5 text-slate-500 font-normal">S/ 125.00 + S/ 54.00</td>
                    <td className="p-2.5 font-semibold">14 horas</td>
                    <td className="p-2.5 font-mono text-emerald-800 dark:text-emerald-300 text-sm">+ S/ 179.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Marco legal y jurisprudencia laboral peruana:</span>
            <p>
              • <strong>Decreto Supremo N° 007-2002-TR:</strong> Texto Único Ordenado de la Ley de Jornada de Trabajo, Horario y Trabajo en Sobretiempo.<br />
              • <strong>Decreto Supremo N° 008-2002-TR:</strong> Reglamento de la Ley de Jornada de Trabajo y Horas Extras.<br />
              • <strong>Decreto Legislativo N° 713:</strong> Régimen de descansos remunerados en feriados y fines de semana.
            </p>
          </div>
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

          <fieldset>
            <legend className="mb-2 text-xs font-bold text-slate-900 dark:text-slate-200">
              Tipo de jornada
            </legend>
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setScheduleType('regular')}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  scheduleType === 'regular'
                    ? 'bg-white text-blue-800 shadow-sm dark:bg-slate-800 dark:text-blue-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Jornada regular
              </button>
              <button
                type="button"
                onClick={() => setScheduleType('atypical')}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  scheduleType === 'atypical'
                    ? 'bg-white text-blue-800 shadow-sm dark:bg-slate-800 dark:text-blue-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Sistema atípico
              </button>
            </div>
          </fieldset>

          {scheduleType === 'atypical' && (
            <div className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900 dark:bg-blue-950/30">
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-700 dark:text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Configura el ciclo completo</h3>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    Selecciona un rol frecuente o ingresa tus propios días y horas efectivas.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {ATYPICAL_PRESETS.map((preset) => {
                  const isActive = workDays === preset.workDays && restDays === preset.restDays;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setWorkDays(preset.workDays);
                        setRestDays(preset.restDays);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                        isActive
                          ? 'border-blue-700 bg-blue-700 text-white dark:border-blue-500 dark:bg-blue-600'
                          : 'border-blue-200 bg-white text-blue-800 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InputNumber
                  id="atypicalWorkDays"
                  label="Días trabajados"
                  suffix="días"
                  value={workDays}
                  onChange={setWorkDays}
                  min={1}
                  max={90}
                  required
                />
                <InputNumber
                  id="atypicalRestDays"
                  label="Días de descanso"
                  suffix="días"
                  value={restDays}
                  onChange={setRestDays}
                  min={1}
                  max={90}
                  required
                />
                <InputNumber
                  id="atypicalShiftHours"
                  label="Horas por turno"
                  suffix="hrs"
                  value={hoursPerShift}
                  onChange={setHoursPerShift}
                  min={1}
                  max={24}
                  step={0.5}
                  required
                />
              </div>
            </div>
          )}

          <InputNumber
            id="baseSalary"
            label="Sueldo básico mensual"
            prefix="S/"
            value={baseMonthlySalary}
            onChange={(baseMonthlySalary) => setBaseMonthlySalary(baseMonthlySalary)}
            placeholder="2000.00"
            required
          />

          {scheduleType === 'atypical' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
              Ingresa debajo únicamente las horas adicionales realizadas fuera del rol pactado o reconocidas en tu control de asistencia. El posible exceso promedio del ciclo se muestra aparte y requiere revisión laboral antes de asignarle una sobretasa.
            </div>
          )}

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
          {scheduleType === 'atypical' && (
            <div
              className={`rounded-3xl border-2 p-6 shadow-sm ${
                atypicalSchedule.isWithinGeneralWeeklyLimit
                  ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/20'
                  : 'border-amber-300 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Diagnóstico del ciclo {workDays}×{restDays}
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    {atypicalSchedule.isWithinGeneralWeeklyLimit ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                    )}
                    <strong className="text-sm text-slate-900 dark:text-white">
                      {atypicalSchedule.isWithinGeneralWeeklyLimit
                        ? 'Dentro del límite general promedio'
                        : 'Supera el límite general promedio'}
                    </strong>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white dark:bg-slate-800">
                  Referencial
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-white/70 bg-white/80 p-5 text-center dark:border-slate-800 dark:bg-slate-950/70">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Promedio semanal del ciclo
                </span>
                <div className={`mt-1 font-mono text-4xl font-black ${
                  atypicalSchedule.isWithinGeneralWeeklyLimit
                    ? 'text-emerald-800 dark:text-emerald-400'
                    : 'text-amber-800 dark:text-amber-400'
                }`}>
                  {atypicalSchedule.averageWeeklyHours} h
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Límite general usado: 48 h/semana</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                  <span className="block text-slate-500 dark:text-slate-400">Horas del ciclo</span>
                  <strong className="mt-1 block text-base text-slate-900 dark:text-white">
                    {atypicalSchedule.workedHoursPerCycle} h
                  </strong>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                  <span className="block text-slate-500 dark:text-slate-400">Máximo proporcional</span>
                  <strong className="mt-1 block text-base text-slate-900 dark:text-white">
                    {atypicalSchedule.maximumOrdinaryHoursPerCycle} h
                  </strong>
                </div>
              </div>

              {!atypicalSchedule.isWithinGeneralWeeklyLimit && (
                <p className="mt-4 rounded-xl bg-amber-100 p-3 text-xs leading-5 text-amber-950 dark:bg-amber-950/50 dark:text-amber-200">
                  Diferencia orientativa: <strong>{atypicalSchedule.excessHoursPerCycle} horas por ciclo</strong>. No se suman automáticamente al pago porque debe revisarse el contrato, el régimen aplicable y la distribución diaria del sobretiempo.
                </p>
              )}
            </div>
          )}

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
                Por {hoursFirstTwo + hoursAfterTwo + holidayHours} horas adicionales ingresadas
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
