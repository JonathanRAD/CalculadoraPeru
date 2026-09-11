'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateGratification, CompanyRegime, HealthInsurance } from '@/core/calculators/gratification';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Gift } from 'lucide-react';

export default function GratificacionPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'gratificacion')!;

  const [baseSalary, setBaseSalary] = useState<number>(2500);
  const [hasFamilyAllowance, setHasFamilyAllowance] = useState<boolean>(false);
  const [monthsWorkedInSemester, setMonthsWorkedInSemester] = useState<number>(6);
  const [companyRegime, setCompanyRegime] = useState<CompanyRegime>('general');
  const [healthInsurance, setHealthInsurance] = useState<HealthInsurance>('essalud');

  const result = calculateGratification({
    baseSalary,
    hasFamilyAllowance,
    monthsWorkedInSemester,
    companyRegime,
    healthInsurance,
  });

  const shareSummary = `Gratificación Legal: ${formatCurrency(result.rawGratification)}
Bonificación EsSalud (${result.bonusPercentage}%): ${formatCurrency(result.extraordinaryBonus)}
Total en Mano: ${formatCurrency(result.totalToReceive)} (100% libre de descuentos)`;

  const faqs = [
    {
      question: '¿Hasta qué fecha exacta se paga la gratificación en el Perú?',
      answer: 'Conforme al artículo 5 de la Ley N° 27735, la gratificación legal de Fiestas Patrias debe abonarse íntegramente a más tardar el 15 de julio, mientras que la gratificación por Navidad debe depositarse como plazo máximo el 15 de diciembre. Este plazo es improrrogable; si la fecha cae en día no laborable o fin de semana, el empleador debe anticipar el pago al día hábil anterior.',
    },
    {
      question: '¿Por qué la gratificación no tiene descuentos de AFP u ONP y suma un 9% adicional?',
      answer: 'La Ley N° 30334 consagró la desgravación permanente de las gratificaciones en el Perú. Esto significa que están 100% inafectas de aportes a los fondos de pensiones (AFP u ONP). Además, el aporte del 9% que la empresa abona habitualmente a EsSalud no se entrega al seguro social, sino que se transfiere íntegramente al bolsillo del trabajador bajo el concepto de "Bonificación Extraordinaria Temporal". Si el colaborador cuenta con una Entidad Prestadora de Salud (EPS), la bonificación extraordinaria es del 6.75%.',
    },
    {
      question: '¿Cuánto le corresponde de gratificación a un trabajador de una MYPE o Microempresa?',
      answer: 'Bajo el Texto Único Ordenado de la Ley de Impulso al Desarrollo Productivo y al Crecimiento Empresarial (D.S. N° 013-2013-PRODUCE): 1) Los trabajadores de una Pequeña Empresa formal inscrita en el REMYPE tienen derecho a percibir media remuneración mensual (50% de la gratificación ordinaria) más la bonificación extraordinaria proporcional del 9%; 2) Los trabajadores de una Microempresa legalmente acreditada no tienen derecho al pago de gratificaciones legales.',
    },
    {
      question: '¿Qué es la gratificación trunca y cuándo se cancela?',
      answer: 'Si el trabajador cesa en su empleo antes de completar el semestre (antes del 30 de junio o 30 de noviembre), la empresa debe liquidar la gratificación trunca en forma proporcional a los meses y días calendarios efectivamente laborados, abonándose conjuntamente dentro de las 48 horas siguientes al cese como parte de su liquidación de beneficios sociales.',
    },
    {
      question: '¿La gratificación está sujeta a la retención de Impuesto a la Renta de 5ta Categoría?',
      answer: 'Sí. Aunque la Ley 30334 inafectó a las gratificaciones de descuentos previsionales (AFP/ONP), no las exoneró del Impuesto a la Renta de Quinta Categoría de la SUNAT. Por tanto, para los trabajadores cuyos ingresos anuales proyectados superen las 7 UIT, el monto percibido por gratificación sí se incluye en la base imponible del cálculo del impuesto a la renta.',
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
              Guía Legal: ¿Cómo se calculan las Gratificaciones de Julio y Diciembre (Ley 27735)?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Las <strong>Gratificaciones Legales</strong> de Fiestas Patrias y Navidad son beneficios sociales obligatorios que los empleadores del régimen laboral de la actividad privada deben otorgar a sus trabajadores dos veces al año. Están reguladas por la Ley N° 27735, su Reglamento (Decreto Supremo N° 005-2002-TR) y la Ley N° 30334 de desgravación tributaria previsional.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Base computable y fórmula de liquidación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Base Remunerativa Computable:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Es el sueldo básico vigente al 30 de junio (para julio) o al 30 de noviembre (para diciembre), más la Asignación Familiar y el promedio de remuneraciones variables si se percibieron al menos en 3 meses del semestre.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Base = Sueldo Básico + Asignación Familiar
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-800 dark:text-sky-400 block">• Bonificación Extraordinaria (Ley 30334):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Se adiciona un 9.00% sobre el monto de la gratificación si estás asegurado en EsSalud, o un 6.75% si cuentas con cobertura médica privada mediante una EPS.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Total = Gratificación Legal + Bonificación (9% o 6.75%)
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico real (Régimen General con Asignación Familiar)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Trabajador del sector privado con sueldo ordinario mensual de <strong>S/ 3,500.00</strong>, acreditado con un hijo menor (recibe Asignación Familiar de S/ 102.50), asegurado en EsSalud y con el semestre completo laborado (enero a junio):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Concepto Liquidado</th>
                    <th className="p-2.5">Fórmula Aplicada</th>
                    <th className="p-2.5">Monto Líquido (PEN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-semibold">Sueldo Básico Ordinario</td>
                    <td className="p-2.5 text-slate-500">Haber mensual pactado</td>
                    <td className="p-2.5 font-mono">S/ 3,500.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Asignación Familiar (Ley 25129)</td>
                    <td className="p-2.5 text-slate-500">10% de la RMV vigente</td>
                    <td className="p-2.5 font-mono">+ S/ 102.50</td>
                  </tr>
                  <tr className="bg-slate-50/60 dark:bg-slate-900/60 font-bold">
                    <td className="p-2.5">Subtotal Gratificación Legal</td>
                    <td className="p-2.5 text-slate-500 font-normal">S/ 3,602.50 × (6/6 meses)</td>
                    <td className="p-2.5 font-mono">S/ 3,602.50</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Bonificación Extraordinaria EsSalud (9%)</td>
                    <td className="p-2.5 text-slate-500">9% de S/ 3,602.50</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">+ S/ 324.23</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Descuentos Previsionales (AFP/ONP)</td>
                    <td className="p-2.5 text-slate-500">Inafecto por Ley 30334</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">S/ 0.00 (Inafecto)</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950 font-bold text-slate-900 dark:text-white">
                    <td className="p-2.5 text-emerald-800 dark:text-emerald-300">Total Efectivo a Cobrar en Cuenta</td>
                    <td className="p-2.5 text-slate-500 font-normal">Gratificación + Bonificación</td>
                    <td className="p-2.5 font-mono text-emerald-800 dark:text-emerald-300 text-sm">S/ 3,926.73</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Normas laborales de referencia:</span>
            <p>
              • <strong>Ley N° 27735:</strong> Ley que regula el otorgamiento de las Gratificaciones para los trabajadores del régimen de la actividad privada.<br />
              • <strong>Decreto Supremo N° 005-2002-TR:</strong> Reglamento de la Ley de Gratificaciones.<br />
              • <strong>Ley N° 30334:</strong> Ley que establece medidas para dinamizar la economía en materia de desgravación de gratificaciones.
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
              <Gift className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos para la Gratificación</h2>
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
                Régimen de la Empresa
              </label>
              <select
                value={companyRegime}
                onChange={(e) => setCompanyRegime(e.target.value as CompanyRegime)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="general">Régimen General (1 sueldo)</option>
                <option value="pequena_empresa">Pequeña Empresa MYPE (50% sueldo)</option>
                <option value="microempresa">Microempresa (Sin gratificación)</option>
              </select>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
                Seguro de Salud
              </label>
              <select
                value={healthInsurance}
                onChange={(e) => setHealthInsurance(e.target.value as HealthInsurance)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="essalud">EsSalud (+9% Bono)</option>
                <option value="eps">EPS (+6.75% Bono)</option>
              </select>
            </div>
          </div>

          <InputNumber
            id="months"
            label="Meses completos laborados en el semestre"
            value={monthsWorkedInSemester}
            onChange={(monthsWorkedInSemester) => setMonthsWorkedInSemester(monthsWorkedInSemester)}
            min={1}
            max={6}
            helpText="Enero a Junio (Julio) o Julio a Diciembre (Diciembre)"
            placeholder="6"
            required
          />

          <SwitchToggle
            id="hasFamilyAllowance"
            label="¿Percibes Asignación Familiar (+S/ 113.00)?"
            description="Se suma a la base computable para el cálculo de la gratificación"
            checked={hasFamilyAllowance}
            onChange={(hasFamilyAllowance) => setHasFamilyAllowance(hasFamilyAllowance)}
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-300 dark:border-blue-800/80 bg-blue-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-blue-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Monto Total a Cobrar
              </span>
              <span className="rounded-full bg-blue-700 dark:bg-blue-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                100% Libre de Impuestos
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Gratificación Total en Mano
              </span>
              <div className="text-3xl sm:text-5xl font-black text-blue-900 dark:text-blue-400 mt-1 font-mono tracking-tight">
                {formatCurrency(result.totalToReceive)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Sin descuentos de AFP, ONP ni EsSalud
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Gratificación Legal"
                value={formatCurrency(result.rawGratification)}
                type="neutral"
                subValue="Monto base legal"
              />
              <ResultMetricCard
                label={`Bono Salud (${result.bonusPercentage}%)`}
                value={formatCurrency(result.extraordinaryBonus)}
                type="success"
                subValue="Bono de EsSalud/EPS"
              />
            </div>

            <ShareButtons title="Cálculo de Gratificación Perú" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
