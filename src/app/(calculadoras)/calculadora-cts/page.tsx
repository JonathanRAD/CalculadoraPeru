'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateCts } from '@/core/calculators/cts';
import { CompanyRegime } from '@/core/calculators/gratification';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { PiggyBank } from 'lucide-react';

export default function CalculadoraCtsPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'calculadora-cts')!;

  const [baseSalary, setBaseSalary] = useState<number>(2500);
  const [hasFamilyAllowance, setHasFamilyAllowance] = useState<boolean>(false);
  const [monthsWorkedInSemester, setMonthsWorkedInSemester] = useState<number>(6);
  const [companyRegime, setCompanyRegime] = useState<CompanyRegime>('general');

  const result = calculateCts({
    baseSalary,
    hasFamilyAllowance,
    monthsWorkedInSemester,
    companyRegime,
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
      answer: 'No tienen derecho al depósito de CTS los trabajadores sujetos a regímenes especiales de tiempo parcial (part-time) que laboran una jornada promedio menor a 4 horas diarias, los trabajadores de la microempresa inscrita formalmente en el REMYPE, y aquellos trabajadores contratados bajo el régimen CAS o locadores de servicios independientes que emiten recibos por honorarios.',
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
      faqs={faqs}
      educationalContent={
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Guía Legal Oficial: ¿Cómo se calcula la CTS según el D.L. 650?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              La <strong>Compensación por Tiempo de Servicios (CTS)</strong> es un beneficio social obligatorio fundamental contemplado en el Texto Único Ordenado del Decreto Legislativo N° 650 (Decreto Supremo N° 001-97-TR). Su finalidad primordial es funcionar como un seguro de desempleo que proteja al trabajador y a su familia ante el cese laboral.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Fórmulas de la remuneración computable y depósito semestral
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Base Computable Semestral:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Es la suma del sueldo básico mensual percibido al 30 de abril o al 31 de octubre, más la Asignación Familiar y el sexto (1/6) de la última gratificación percibida.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Base = Sueldo + Asig. Fam. + (Gratificación ÷ 6)
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-800 dark:text-sky-400 block">• Monto del Depósito Semestral:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Se divide la base computable entre los 12 meses del año y se multiplica por la cantidad de meses completos laborados durante el respectivo semestre.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  CTS = (Base Computable ÷ 12) × Meses Laborados
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico con liquidación de depósito real
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tomemos como referencia a un colaborador del régimen general privado con sueldo básico de <strong>S/ 2,400.00</strong>, Asignación Familiar de <strong>S/ 102.50</strong>, que laboró el semestre completo (6 meses) y cuya última gratificación fue de <strong>S/ 2,502.50</strong>:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
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
                    <td className="p-2.5 text-slate-500">Sueldo en contrato</td>
                    <td className="p-2.5 font-mono">S/ 2,400.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Asignación Familiar (Ley 25129)</td>
                    <td className="p-2.5 text-slate-500">10% de la RMV vigente</td>
                    <td className="p-2.5 font-mono">+ S/ 102.50</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Sexto de Gratificación (1/6)</td>
                    <td className="p-2.5 text-slate-500">S/ 2,502.50 ÷ 6</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">+ S/ 417.08</td>
                  </tr>
                  <tr className="bg-slate-50/60 dark:bg-slate-900/60 font-bold">
                    <td className="p-2.5">Total Base Computable</td>
                    <td className="p-2.5 text-slate-500 font-normal">Suma de conceptos</td>
                    <td className="p-2.5 font-mono">S/ 2,919.58</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950 font-bold text-slate-900 dark:text-white">
                    <td className="p-2.5 text-emerald-800 dark:text-emerald-300">Depósito Semestral de CTS (Mayo / Noviembre)</td>
                    <td className="p-2.5 text-slate-500 font-normal">(S/ 2,919.58 ÷ 12) × 6 meses</td>
                    <td className="p-2.5 font-mono text-emerald-800 dark:text-emerald-300 text-sm">S/ 1,459.79</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Normativa peruana vinculante:</span>
            <p>
              • <strong>Decreto Supremo N° 001-97-TR:</strong> Texto Único Ordenado de la Ley de Compensación por Tiempo de Servicios.<br />
              • <strong>Decreto Supremo N° 004-97-TR:</strong> Reglamento del Texto Único Ordenado de la Ley de CTS.<br />
              • <strong>Ley N° 25129:</strong> Régimen de Asignación Familiar para trabajadores de la actividad privada.
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
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
                Régimen Laboral
              </label>
              <select
                value={companyRegime}
                onChange={(e) => setCompanyRegime(e.target.value as CompanyRegime)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="general">Régimen General (CTS Completa)</option>
                <option value="pequena_empresa">Pequeña Empresa MYPE (50% de CTS)</option>
                <option value="microempresa">Microempresa (Sin CTS)</option>
              </select>
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

          <SwitchToggle
            id="hasFamilyAllowance"
            label="¿Percibes Asignación Familiar (+S/ 113.00)?"
            description="Se incorpora como remuneración computable para el cálculo de la CTS"
            checked={hasFamilyAllowance}
            onChange={(hasFamilyAllowance) => setHasFamilyAllowance(hasFamilyAllowance)}
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-300 dark:border-blue-800/80 bg-blue-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-blue-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Depósito Bancario de CTS
              </span>
              <span className="rounded-full bg-blue-700 dark:bg-blue-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                Mayo / Noviembre
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Monto de CTS a Depositar
              </span>
              <div className="text-3xl sm:text-5xl font-black text-blue-900 dark:text-blue-400 mt-1 font-mono tracking-tight">
                {formatCurrency(result.ctsAmountToDeposit)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                En tu entidad financiera (Banco o Caja)
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Base Computable Total"
                value={formatCurrency(result.totalComputableBasis)}
                type="neutral"
                subValue="Sueldo + 1/6 Gratificación"
              />
              <ResultMetricCard
                label="1/6 de Gratificación"
                value={formatCurrency(result.oneSixthGratification)}
                type="success"
                subValue="Componente legal"
              />
            </div>

            <ShareButtons title="Cálculo de CTS Perú" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
