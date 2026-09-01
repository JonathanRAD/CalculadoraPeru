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
      question: '¿Cómo se calcula el valor de una hora de trabajo ordinaria en Perú?',
      answer: 'Se toma la remuneración mensual computable (Sueldo + Asignación Familiar) y se divide entre 240 (considerando una jornada de 8 horas diarias por 30 días laborales).',
    },
    {
      question: '¿Cuáles son las sobretasas legales para horas extras?',
      answer: 'Por ley (D.S. 007-2002-TR), las 2 primeras horas extras del día se pagan con una sobretasa del 25% sobre el valor hora ordinaria. A partir de la tercera hora extra, la sobretasa sube al 35%. Si trabajas en tu día de descanso o feriado sin descanso sustitutorio, la sobretasa es del 100%.',
    },
    {
      question: '¿Cómo se evalúa una jornada atípica 14×7, 14×14 o 20×10?',
      answer: 'Se consideran los días trabajados, los días de descanso y las horas efectivas por turno. El total del ciclo se convierte a un promedio semanal, que bajo la regla general no debe superar 48 horas. El nombre del rol por sí solo no permite concluir si existe sobretiempo.',
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
          <p>
            En jornadas acumulativas o atípicas, el diagnóstico usa el promedio del ciclo indicado por el artículo 25 de la Constitución y el D.S. 007-2002-TR. El resultado es orientativo: convenios colectivos, regímenes sectoriales y labores excluidas de la jornada máxima pueden cambiar el análisis.
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
