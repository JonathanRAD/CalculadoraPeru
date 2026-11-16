'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateVacations, VacationRegime } from '@/core/calculators/vacations';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { PayslipResult } from '@/shared/components/ui/PayslipResult';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Palmtree } from 'lucide-react';

export default function CalculadoraVacacionesPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'calculadora-vacaciones')!;

  const [baseSalary, setBaseSalary] = useState<number>(2500);
  const [hasFamilyAllowance, setHasFamilyAllowance] = useState<boolean>(false);
  const [monthsWorked, setMonthsWorked] = useState<number>(8);
  const [daysWorked, setDaysWorked] = useState<number>(0);
  const [hiredBeforeRemype, setHiredBeforeRemype] = useState<boolean>(false);
  const [companyRegime, setCompanyRegime] = useState<VacationRegime>('general');
  const [customDaysPerYear, setCustomDaysPerYear] = useState<number>(20);
  const [daysToSell, setDaysToSell] = useState<number>(0);

  const result = calculateVacations({
    baseSalary,
    hasFamilyAllowance,
    monthsWorked,
    daysWorked,
    companyRegime,
    hiredBeforeRemype,
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
      answer: 'Sí. La asignación familiar (S/ 123.00, equivalente al 10% de la Remuneración Mínima Vital de S/ 1,230) tiene naturaleza remunerativa ordinaria y computable para todos los beneficios sociales, incluyendo vacaciones gozadas, venta de vacaciones y vacaciones truncas.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
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

          <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-[#2C3744]">
            <table className="w-full text-left text-[13px] sm:text-[15px]">
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
        <div className="lg:col-span-7 rounded-lg border border-slate-200/90 dark:border-[#2C3744] bg-white dark:bg-[#18202A] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#2C3744] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
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
            <div className="sm:col-span-2">
              <label htmlFor="companyRegime" className="mb-1.5 block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                Régimen Laboral / Días al año
              </label>
              <select
                id="companyRegime"
                value={companyRegime}
                onChange={(e) => setCompanyRegime(e.target.value as VacationRegime)}
                className="select-field w-full rounded border border-slate-400 bg-white pl-3 text-[15px] text-slate-900 focus:border-brand-600 focus:outline-2 focus:outline-offset-1 focus:outline-brand-600 dark:border-slate-600 dark:bg-[#0E141B] dark:text-slate-100"
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

          {(companyRegime === 'pequena_empresa' || companyRegime === 'microempresa') && (
            <SwitchToggle
              id="hiredBeforeRemype"
              label="¿Fue contratado antes de la inscripción de la empresa en el REMYPE?"
              description="El régimen MYPE no es retroactivo: si fue contratado antes, conserva los 30 días del régimen general."
              checked={hiredBeforeRemype}
              onChange={(value) => setHiredBeforeRemype(value)}
            />
          )}

          <SwitchToggle
            id="hasFamilyAllowance"
            label="¿Percibes Asignación Familiar (+S/ 123.00)?"
            description="Forma parte de la remuneración computable para las vacaciones"
            checked={hasFamilyAllowance}
            onChange={(hasFamilyAllowance) => setHasFamilyAllowance(hasFamilyAllowance)}
          />
        </div>
        {/* Resultado con forma de boleta */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <PayslipResult
            title={"Liquidación de Vacaciones"}
            period={`${result.annualVacationDays} días/año`}
            amountHeader="Valor"
            lines={[
              { label: "Vacaciones Truncas", amount: formatCurrency(result.totalTruncatedVacations), note: `Base: ${result.annualVacationDays} días/año` },
              { label: "Venta de Vacaciones", amount: formatCurrency(result.soldVacationsPay), note: `${daysToSell} días vendidos` },
            ]}
            totalLabel={"Total Pago de Vacaciones"}
            totalAmount={formatCurrency(result.totalPay)}
            footnote={`Por ${monthsWorked} meses laborados (${result.annualVacationDays} días anuales)`}
          >
            <ShareButtons title="Liquidación de Vacaciones Perú" shareText={shareSummary} />
          </PayslipResult>
        </div>

      </div>
    </CalculatorShell>
  );
}
