'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateCts } from '@/core/calculators/cts';
import { CompanyRegime } from '@/core/calculators/gratification';
import { PERU_CONSTANTS } from '@/core/constants/peru';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { PayslipResult } from '@/shared/components/ui/PayslipResult';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { PiggyBank } from 'lucide-react';
import { CalculationActionToolbar } from '@/features/premium/components/CalculationActionToolbar';
import { SunafilFinesCard } from '@/features/premium/components/SunafilFinesCard';

export default function CalculadoraCtsPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'calculadora-cts')!;

  const [baseSalary, setBaseSalary] = useState<number>(2500);
  const [hasFamilyAllowance, setHasFamilyAllowance] = useState<boolean>(false);
  const [monthsWorkedInSemester, setMonthsWorkedInSemester] = useState<number>(6);
  const [hiredBeforeRemype, setHiredBeforeRemype] = useState<boolean>(false);
  const [companyRegime, setCompanyRegime] = useState<CompanyRegime>('general');

  const result = calculateCts({
    baseSalary,
    hasFamilyAllowance,
    monthsWorkedInSemester,
    companyRegime,
    hiredBeforeRemype,
  });

  const shareSummary = `Depósito de CTS: ${formatCurrency(result.ctsAmountToDeposit)}
Base Computable: ${formatCurrency(result.totalComputableBasis)} (Sueldo + 1/6 Grati)
Periodo: ${monthsWorkedInSemester} meses laborados`;

  const faqs = [
    {
      question: '¿En qué fechas exactas se deposita la CTS en el Perú y qué periodos abarca?',
      answer: 'Por mandato del TUO del Decreto Legislativo N° 650 (D.S. 001-97-TR), la CTS se deposita obligatoriamente de forma semestral en la entidad financiera elegida por el trabajador en dos plazos máximos improrrogables: 1) Hasta el 15 de mayo de cada año, correspondiente al semestre laborado entre el 1 de noviembre del año anterior y el 30 de abril; 2) Hasta el 15 de noviembre de cada año, correspondiente al semestre laborado entre el 1 de mayo y el 31 de octubre.',
    },
    {
      question: '¿Por qué se suma un sexto (1/6) de la gratificación a la base computable de CTS?',
      answer: 'El artículo 18 del D.S. N° 001-97-TR establece que las remuneraciones de periodicidad semestral, como las gratificaciones legales de Fiestas Patrias (julio) y Navidad (diciembre), deben incorporarse a la base computable a razón de un sexto (1/6) de lo percibido en el semestre respectivo. Esto garantiza que el beneficio de previsión contemple los ingresos extraordinarios ordinarios del trabajador.',
    },
    {
      question: '¿Qué trabajadores del sector privado no tienen derecho a percibir CTS?',
      answer: 'No tienen derecho al depósito de CTS los trabajadores sujetos a regímenes especiales de tiempo parcial (part-time) que laboran una jornada promedio menor a 4 horas diarias, los trabajadores contratados después de que su microempresa se inscribió en el REMYPE (si la empresa no está inscrita, o si fueron contratados antes, rige el régimen general), y aquellos trabajadores contratados bajo el régimen CAS o locadores de servicios independientes que emiten recibos por honorarios.',
    },
    {
      question: '¿Qué ocurre si la empresa no deposita la CTS en el plazo legal?',
      answer: 'El incumplimiento en el depósito íntegro y oportuno de la CTS es calificado por la Superintendencia Nacional de Fiscalización Laboral (SUNAFIL) como una infracción grave en materia de relaciones laborales. La empresa infractora debe asumir el pago inmediato del capital adeudado más los intereses financieros compensatorios devengados a la tasa fijada por la SBS, además de multas administrativas escalonadas según la cantidad de trabajadores afectados.',
    },
    {
      question: '¿Puedo retirar libremente los fondos depositados en mi cuenta de CTS?',
      answer: 'La naturaleza originaria de la CTS es constituir un fondo de contingencia por desempleo que solo puede retirarse al término de la relación laboral. No obstante, la normativa ordinaria permite el retiro del excedente de cuatro sueldos brutos intangibles. En periodos con leyes extraordinarias aprobadas por el Congreso (como la Ley de libre disponibilidad), se han habilitado retiros temporales de hasta el 100% de los fondos acumulados.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      afterContent={<SunafilFinesCard obligationType="cts" />}
      faqs={faqs}
      educationalContent={
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Guía Legal Oficial: ¿Cómo se calcula la CTS según el D.L. 650?
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              La <strong>Compensación por Tiempo de Servicios (CTS)</strong> es un beneficio social obligatorio fundamental contemplado en el Texto Único Ordenado del Decreto Legislativo N° 650 (Decreto Supremo N° 001-97-TR). Su finalidad primordial es funcionar como un seguro de desempleo que proteja al trabajador y a su familia ante el cese laboral.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-[#18202A] p-5 border border-slate-200 dark:border-[#2C3744] space-y-3 text-[13px] leading-relaxed">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              1. Fórmulas de la remuneración computable y depósito semestral
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Base Computable Semestral:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Es la suma del sueldo básico mensual percibido al 30 de abril o al 31 de octubre, más la Asignación Familiar y el sexto (1/6) de la última gratificación percibida.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Base = Sueldo + Asig. Fam. + (Gratificación ÷ 6)
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Monto del Depósito Semestral:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Se divide la base computable entre los 12 meses del año y se multiplica por la cantidad de meses completos laborados durante el respectivo semestre.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  CTS = (Base Computable ÷ 12) × Meses Laborados
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              2. Caso práctico con liquidación de depósito real (Normativa 2026)
            </h3>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Tomemos como referencia a un colaborador del régimen general privado con sueldo básico de <strong>S/ 2,400.00</strong>, Asignación Familiar de <strong>S/ 123.00</strong> (10% de la RMV S/ 1,230), que laboró el semestre completo (6 meses) y cuya última gratificación percibida fue de <strong>S/ 2,513.00</strong>:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border border-slate-200 dark:border-[#2C3744] rounded overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Rubro de la CTS</th>
                    <th className="p-2.5">Detalle o Fórmula</th>
                    <th className="p-2.5">Importe (PEN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-semibold">Remuneración Ordinaria Mensual</td>
                    <td className="p-2.5 text-slate-500">Sueldo contratado computable</td>
                    <td className="p-2.5 font-mono">S/ 2,400.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Asignación Familiar (Ley 25129)</td>
                    <td className="p-2.5 text-slate-500">10% de la RMV vigente</td>
                    <td className="p-2.5 font-mono">+ S/ 123.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Sexto de Gratificación (1/6)</td>
                    <td className="p-2.5 text-slate-500">S/ 2,523.00 ÷ 6</td>
                    <td className="p-2.5 font-mono text-brand-700 dark:text-brand-400">+ S/ 420.50</td>
                  </tr>
                  <tr className="bg-slate-50/60 dark:bg-slate-900/60 font-bold">
                    <td className="p-2.5">Total Base Computable Semestral</td>
                    <td className="p-2.5 text-slate-500 font-normal">Suma de conceptos afectos</td>
                    <td className="p-2.5 font-mono">S/ 2,943.50</td>
                  </tr>
                  <tr className="bg-brand-50 dark:bg-brand-950 font-bold text-slate-900 dark:text-white">
                    <td className="p-2.5 text-brand-800 dark:text-brand-300">Depósito Semestral de CTS (Mayo / Noviembre)</td>
                    <td className="p-2.5 text-slate-500 font-normal">(S/ 2,943.50 ÷ 12) × 6 meses</td>
                    <td className="p-2.5 font-mono text-brand-800 dark:text-brand-300 text-[15px]">S/ 1,471.75</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-[#2C3744] p-4 space-y-2 text-[13px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Normativa peruana y fuentes oficiales:</span>
            <ul className="space-y-1 list-disc pl-4">
              <li>
                <strong>Ley de Compensación por Tiempo de Servicios (D.S. N° 001-97-TR):</strong> Reglas sobre depósito semestral y cómputo de 1/6 de gratificación en el{' '}
                <a
                  href="https://www.gob.pe/institucion/mtpe/informes-publicaciones/221736"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 dark:text-brand-400 underline hover:text-brand-800"
                >
                  texto oficial del TUO publicado por el MTPE
                </a>.
              </li>
              <li>
                <strong>Fiscalización del depósito oportuno de CTS:</strong> Verificación de plazos (máximo 15 de mayo y 15 de noviembre) en la{' '}
                <a
                  href="https://www.gob.pe/9972-denunciar-incumplimientos-laborales-de-una-empresa-privada"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 dark:text-brand-400 underline hover:text-brand-800"
                >
                  guía de SUNAFIL para denunciar incumplimientos laborales
                </a>.
              </li>
            </ul>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-lg border border-slate-200/90 dark:border-[#2C3744] bg-white dark:bg-[#18202A] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#2C3744] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
              <PiggyBank className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos para el Depósito de CTS</h2>
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
                Régimen Laboral
              </label>
              <select
                id="companyRegime"
                value={companyRegime}
                onChange={(e) => setCompanyRegime(e.target.value as CompanyRegime)}
                className="select-field w-full rounded border border-slate-400 bg-white pl-3 text-[15px] text-slate-900 focus:border-brand-600 focus:outline-2 focus:outline-offset-1 focus:outline-brand-600 dark:border-slate-600 dark:bg-[#0E141B] dark:text-slate-100"
              >
                <option value="general">Régimen General (CTS completa)</option>
                <option value="pequena_empresa">Pequeña empresa REMYPE (50 % de la CTS)</option>
                <option value="microempresa">Microempresa REMYPE (sin CTS)</option>
              </select>
                <p className="mt-1.5 text-[13px] text-slate-600 dark:text-slate-400">¿Tu empresa no está inscrita en REMYPE? Elige Régimen General.</p>
            </div>

            <InputNumber
              id="months"
              label="Meses laborados en el semestre"
              value={monthsWorkedInSemester}
              onChange={(monthsWorkedInSemester) => setMonthsWorkedInSemester(monthsWorkedInSemester)}
              min={1}
              max={6}
              helpText="Máximo 6 meses por periodo"
              placeholder="6"
              required
            />
          </div>

          {companyRegime !== 'general' && (
            <SwitchToggle
              id="hiredBeforeRemype"
              label="¿Fue contratado antes de la inscripción de la empresa en el REMYPE?"
              description="El régimen MYPE no es retroactivo: si fue contratado antes, conserva el régimen general (100 %)."
              checked={hiredBeforeRemype}
              onChange={(value) => setHiredBeforeRemype(value)}
            />
          )}

          <SwitchToggle
            id="hasFamilyAllowance"
            label="¿Percibes Asignación Familiar (+S/ 123.00)?"
            description="Se incorpora como remuneración computable para el cálculo de la CTS"
            checked={hasFamilyAllowance}
            onChange={(hasFamilyAllowance) => setHasFamilyAllowance(hasFamilyAllowance)}
          />
        </div>
        {/* Resultado con forma de boleta */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <PayslipResult
            title={"Depósito Bancario de CTS"}
            period={"Mayo / Noviembre"}
            amountHeader="Valor"
            lines={[
              { label: "Base Computable Total", amount: formatCurrency(result.totalComputableBasis), note: "Sueldo + 1/6 Gratificación" },
              { label: "1/6 de Gratificación", amount: formatCurrency(result.oneSixthGratification), note: "Componente de ley" },
            ]}
            totalLabel={"Monto de CTS a Depositar"}
            totalAmount={formatCurrency(result.ctsAmountToDeposit)}
            footnote={"En tu entidad financiera (Banco o Caja)"}
          >
            <ShareButtons title="Cálculo de CTS Perú" shareText={shareSummary} />
          </PayslipResult>

          {/* PRO Actions Toolbar */}
          <CalculationActionToolbar
            calculatorType="cts"
            title={`Cálculo CTS (${companyRegime === 'general' ? 'Régimen General' : companyRegime === 'pequena_empresa' ? 'Pequeña Empresa' : 'Microempresa'})`}
            summaryText={`Depósito: ${formatCurrency(result.ctsAmountToDeposit)} | Base: ${formatCurrency(result.totalComputableBasis)} | ${monthsWorkedInSemester} meses`}
            totalAmount={result.ctsAmountToDeposit}
            data={{
              baseSalary,
              hasFamilyAllowance,
              monthsWorkedInSemester,
              companyRegime,
    hiredBeforeRemype,
              ctsToDeposit: result.ctsAmountToDeposit,
              computableBasis: result.totalComputableBasis,
              oneSixthGrati: result.oneSixthGratification,
            }}
            csvFilename={`CTS_${monthsWorkedInSemester}meses_${new Date().toISOString().slice(0, 10)}`}
            csvColumns={[
              { key: 'concepto', header: 'Concepto' },
              { key: 'monto', header: 'Monto (PEN)' },
            ]}
            csvRows={[
              { concepto: 'Sueldo Básico Mensual', monto: baseSalary },
              { concepto: 'Asignación Familiar (+10%)', monto: hasFamilyAllowance ? PERU_CONSTANTS.FAMILY_ALLOWANCE : 0 },
              { concepto: 'Sexto (1/6) de Gratificación', monto: result.oneSixthGratification },
              { concepto: 'Base Computable Total', monto: result.totalComputableBasis },
              { concepto: 'Meses Laborados en Semestre', monto: monthsWorkedInSemester },
              { concepto: 'MONTO DE CTS A DEPOSITAR', monto: result.ctsAmountToDeposit },
            ]}
            whatsappText={`*CÁLCULO DE CTS PERÚ (D.L. 650)*\n` +
              `• Sueldo Básico: ${formatCurrency(baseSalary)}\n` +
              `• Base Computable: ${formatCurrency(result.totalComputableBasis)}\n` +
              `• Meses computados: ${monthsWorkedInSemester} meses\n` +
              `*TOTAL CTS A DEPOSITAR: ${formatCurrency(result.ctsAmountToDeposit)}*\n` +
              `_Generado en CalculaPerú (calculaperu.com.pe)_`}
          />
        </div>

      </div>
    </CalculatorShell>
  );
}
