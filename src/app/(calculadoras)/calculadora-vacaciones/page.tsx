'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateVacations, VacationRegime } from '@/core/calculators/vacations';
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
  const [companyRegime, setCompanyRegime] = useState<VacationRegime>('general');
  const [customDaysPerYear, setCustomDaysPerYear] = useState<number>(20);
  const [daysToSell, setDaysToSell] = useState<number>(0);

  const result = calculateVacations({
    baseSalary,
    hasFamilyAllowance,
    monthsWorked,
    daysWorked,
    companyRegime,
    customDaysPerYear,
    daysToSell,
  });

  const maxSellAllowed = Math.floor(result.annualVacationDays / 2);

  const shareSummary = `Liquidación de Vacaciones (${result.annualVacationDays} días/año):
Vacaciones Truncas: ${formatCurrency(result.totalTruncatedVacations)} (${monthsWorked} meses)
Venta de Vacaciones: ${formatCurrency(result.soldVacationsPay)} (${daysToSell} días)
Total a Percibir: ${formatCurrency(result.totalPay)}`;

  const faqs = [
    {
      question: '¿Cuántos días de vacaciones corresponden según cada régimen laboral en Perú?',
      answer: 'En el Régimen Laboral General (D.L. 713) todo trabajador en planilla tiene derecho a 30 días calendario de descanso físico remunerado por cada año completo de servicios. En el régimen de Pequeña y Microempresa (REMYPE) corresponden 15 días calendario anuales. En regímenes especiales, como el régimen agrario (Ley 31110), pueden ser de 20 o 30 días según el subrégimen específico.',
    },
    {
      question: '¿Qué son las vacaciones truncas y cómo se calculan?',
      answer: 'Las vacaciones truncas son la compensación económica que recibe el trabajador cuando cesa en sus funciones sin haber completado el año de servicios requerido para gozar del descanso físico, pero habiendo laborado al menos un mes completo. Se calculan dividiendo la remuneración mensual entre 12 y multiplicándola por el número de meses completos trabajados, sumando la parte proporcional por días.',
    },
    {
      question: '¿Qué es la "triple vacacional" o indemnización por vacaciones no gozadas?',
      answer: 'Según el artículo 23 del Decreto Legislativo 713, si el trabajador cumple el récord vacacional pero el empleador no le otorga el descanso físico durante el año siguiente al que se generó el derecho, el trabajador adquiere derecho a una triple remuneración: 1) La remuneración por el trabajo realizado durante ese mes, 2) La remuneración por el descanso vacacional ganado no gozado, y 3) Una indemnización equivalente a una remuneración completa por no haber gozado oportunamente de las vacaciones (no sujeta a descuentos previsionales de AFP u ONP).',
    },
    {
      question: '¿Se pueden vender o compensar las vacaciones por dinero?',
      answer: 'Sí. La legislación laboral peruana autoriza la "compra-venta" de vacaciones mediante convenio escrito previo entre ambas partes. Sin embargo, solo se puede vender hasta un máximo de la mitad del periodo vacacional (hasta 15 días en régimen general de 30 días, o hasta 7 días en régimen de 15 días). Los 15 días restantes deben ser obligatoriamente descansados.',
    },
    {
      question: '¿La asignación familiar ingresa en el cálculo de vacaciones?',
      answer: 'Sí. La asignación familiar (S/ 102.50, equivalente al 10% de la Remuneración Mínima Vital) tiene naturaleza remunerativa ordinaria y computable para todos los beneficios sociales, incluyendo vacaciones gozadas, venta de vacaciones y vacaciones truncas.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            El derecho al descanso vacacional anual remunerado en el Perú está regulado por el <strong>Decreto Legislativo N° 713</strong> y su reglamento (Decreto Supremo N° 012-92-TR). Todo colaborador en relación de subordinación formal acumula días de descanso por cada ciclo laboral anual concluido, condicionado al cumplimiento del récord vacacional respectivo.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            Base Legal del Récord Vacacional
          </h3>
          <p>
            Para generar el derecho a los 30 días de vacaciones, el trabajador debe cumplir una jornada mínima de 4 horas diarias y acreditar un mínimo de días efectivamente laborados dentro del año:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Jornada de 6 días a la semana:</strong> Haber realizado labor efectiva por lo menos 260 días al año.</li>
            <li><strong>Jornada de 5 días a la semana:</strong> Haber realizado labor efectiva por lo menos 210 días al año.</li>
            <li><strong>Jornada de 3 o 4 días a la semana:</strong> No registrar más de 10 faltas injustificadas en el periodo anual.</li>
          </ul>

          <div className="my-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                <tr>
                  <th className="p-3">Régimen Laboral</th>
                  <th className="p-3">Días al Año</th>
                  <th className="p-3">Venta Máxima Permitida</th>
                  <th className="p-3">Fórmula Mensual Trunca</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold">Régimen General (D.L. 713)</td>
                  <td className="p-3">30 días calendario</td>
                  <td className="p-3">Hasta 15 días</td>
                  <td className="p-3 font-mono">Remuneración / 12</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Pequeña Empresa (REMYPE)</td>
                  <td className="p-3">15 días calendario</td>
                  <td className="p-3">Hasta 7 días</td>
                  <td className="p-3 font-mono">(Remuneración / 12) × 0.5</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Microempresa (REMYPE)</td>
                  <td className="p-3">15 días calendario</td>
                  <td className="p-3">Hasta 7 días</td>
                  <td className="p-3 font-mono">(Remuneración / 12) × 0.5</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            Descuentos aplicables al pago vacacional
          </h3>
          <p>
            Tanto el sueldo vacacional ordinario como las vacaciones truncas y la venta de días libres están sujetos a los aportes previsionales obligatorios de ley (<strong>AFP u ONP</strong>) y a la retención del Impuesto a la Renta de Quinta Categoría de corresponder. La única remuneración por descanso que no está afecta a estos descuentos es la <strong>indemnización por vacaciones no gozadas</strong> (la tercera remuneración de la triple vacacional), por tratarse de un concepto estrictamente indemnizatorio y no remunerativo.
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
                Régimen Laboral / Días al año
              </label>
              <select
                value={companyRegime}
                onChange={(e) => setCompanyRegime(e.target.value as VacationRegime)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-600"
              >
                <option value="general">Régimen General (30 días/año)</option>
                <option value="especial_20">Régimen Especial / Agrario (20 días/año)</option>
                <option value="pequena_empresa">Pequeña Empresa MYPE (15 días/año)</option>
                <option value="microempresa">Microempresa (15 días/año)</option>
                <option value="personalizado">Personalizado (Ingresar días)</option>
              </select>
            </div>

            {companyRegime === 'personalizado' ? (
              <InputNumber
                id="customDays"
                label="Días de vacaciones por año"
                value={customDaysPerYear}
                onChange={(customDaysPerYear) => setCustomDaysPerYear(customDaysPerYear)}
                min={1}
                max={60}
                placeholder="20"
                required
              />
            ) : (
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
            )}
          </div>

          {companyRegime === 'personalizado' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputNumber
                id="monthsWorkedCustom"
                label="Meses laborados en el periodo"
                value={monthsWorked}
                onChange={(monthsWorked) => setMonthsWorked(monthsWorked)}
                min={0}
                max={12}
                placeholder="8"
                required
              />
              <InputNumber
                id="daysWorked"
                label="Días adicionales laborados"
                value={daysWorked}
                onChange={(daysWorked) => setDaysWorked(daysWorked)}
                min={0}
                max={29}
                placeholder="0"
              />
            </div>
          )}

          {companyRegime !== 'personalizado' && (
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
                max={maxSellAllowed}
                helpText={`Máximo ${maxSellAllowed} días según ley`}
                placeholder="0"
              />
            </div>
          )}

          {companyRegime === 'personalizado' && (
            <InputNumber
              id="daysToSellCustom"
              label="Días de vacaciones a vender (opcional)"
              value={daysToSell}
              onChange={(daysToSell) => setDaysToSell(daysToSell)}
              min={0}
              max={maxSellAllowed}
              helpText={`Máximo ${maxSellAllowed} días`}
              placeholder="0"
            />
          )}

          <SwitchToggle
            id="hasFamilyAllowance"
            label="¿Percibes Asignación Familiar (+S/ 113.00)?"
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
                {result.annualVacationDays} días/año
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Total Pago de Vacaciones
              </span>
              <div
                title={formatCurrency(result.totalPay)}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-900 dark:text-blue-400 mt-1 font-mono tracking-tight break-words px-2"
              >
                {formatCurrency(result.totalPay)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                Por {monthsWorked} meses laborados ({result.annualVacationDays} días anuales)
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Vacaciones Truncas"
                value={formatCurrency(result.totalTruncatedVacations)}
                type="neutral"
                subValue={`Base: ${result.annualVacationDays} días/año`}
              />
              <ResultMetricCard
                label="Venta de Vacaciones"
                value={formatCurrency(result.soldVacationsPay)}
                type="success"
                subValue={`${daysToSell} días vendidos`}
              />
            </div>

            <ShareButtons title="Liquidación de Vacaciones Perú" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
