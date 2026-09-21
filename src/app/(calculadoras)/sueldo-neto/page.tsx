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
import { Briefcase, ChevronDown, Settings2, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';

const PayrollSlipModal = dynamic(
  () => import('@/features/premium/components/PayrollSlipModal').then((mod) => mod.PayrollSlipModal),
  { ssr: false }
);

export default function SueldoNetoPage() {
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
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
      question: '¿Qué descuentos obligatorios se aplican al sueldo bruto en planilla en Perú?',
      answer: 'Todo trabajador bajo el régimen laboral general de la actividad privada (D.L. 728) tiene descuentos por concepto de aportes previsionales obligatorios. Si estás afiliado al Sistema Nacional de Pensiones (ONP), el descuento es una tasa fija del 13.00% sobre tu remuneración asegurable. Si estás en el Sistema Privado de Pensiones (AFP: Integra, Prima, Profuturo o Habitat), el aporte se compone del fondo de jubilación obligatorio (10.00%), la prima de seguro de invalidez y sobrevivencia (~1.39%) y la comisión de la administradora (comisión mixta o sobre flujo). Adicionalmente, si tus ingresos brutos anuales superan las 7 UIT vigentes, la empresa está obligada a retener el Impuesto a la Renta de Quinta Categoría según escalas progresivas del 8% al 30%.',
    },
    {
      question: '¿Qué es la Asignación Familiar y quiénes tienen derecho a cobrarla?',
      answer: 'La Asignación Familiar es un beneficio social de carácter remunerativo amparado en la Ley N° 25129. Equivale exactamente al 10% de la Remuneración Mínima Vital (RMV) vigente en el Perú. Tienen derecho a percibirla todos los trabajadores del sector privado con hijos menores de 18 años a su cargo, o hasta los 24 años si los hijos se encuentran cursando estudios superiores o universitarios con acreditación. Este monto no se multiplica por la cantidad de hijos; es un importe único mensual que forma parte del cálculo para gratificaciones, CTS y aportes a la seguridad social.',
    },
    {
      question: '¿El aporte del 9% a EsSalud se le resta al sueldo del trabajador?',
      answer: 'No. El aporte a EsSalud (9%) es una contribución patronal a cargo exclusivo del empleador conforme a la Ley N° 26790. La empresa debe asumir y pagar este 9% por encima de tu sueldo bruto acordado. No debe aparecer descontado de tu remuneración neta bajo ninguna circunstancia en tu boleta de pago.',
    },
    {
      question: '¿A partir de qué monto mensual se empieza a retener el Impuesto a la Renta de 5ta Categoría?',
      answer: 'En el Perú, la Ley del Impuesto a la Renta establece una deducción inafecta de 7 UIT anuales (más hasta 3 UIT adicionales por gastos deducibles de sustento). Si proyectando tus 12 sueldos del año más las dos gratificaciones legales (julio y diciembre) el ingreso bruto no supera las 7 UIT (aproximadamente S/ 36,050 anuales o sueldos brutos menores a ~S/ 2,575 al mes sin otros ingresos), no se te aplicará ninguna retención de quinta categoría. Quienes perciban salarios superiores ingresan al primer tramo impositivo del 8% sobre el excedente.',
    },
    {
      question: '¿Cuál es la diferencia entre comisión por flujo y comisión mixta en las AFP?',
      answer: 'En la comisión sobre flujo, la AFP cobra un porcentaje mensual directamente deducido del sueldo bruto del afiliado por la administración de sus fondos. En la comisión mixta (saldo), el cobro mensual sobre el sueldo es 0.00% para las comisiones sobre remuneración en las AFP activas, y la administradora cobra un porcentaje anual sobre el saldo total acumulado en el fondo individual de pensiones.',
    },
    {
      question: '¿Por qué mi sueldo neto real en boleta puede diferir levemente del simulador?',
      answer: 'Una boleta de pago oficial en planilla electrónica (PLAME) puede contener rubros variables como horas extras al 25% y 35%, comisiones de ventas, bonificaciones extraordinarias de ley (9% sobre gratificación), tardanzas o faltas injustificadas, adelantos de quincena, préstamos de empresa, retenciones judiciales por alimentos o aportes sindicales. Nuestra calculadora te permite activar la sección de personalización para incluir estos conceptos exactos.',
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
              Guía Laboral: ¿Cómo se calcula el Sueldo Neto en planilla en el Perú?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              El <strong>Sueldo Neto</strong> (también denominado salario líquido o dinero en mano) representa el importe final que el empleador deposita en la cuenta bancaria del trabajador tras efectuar las retenciones y deducciones establecidas por la legislación laboral y tributaria peruana (Decreto Legislativo N° 728, TUO de la Ley de Productividad y Competitividad Laboral).
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Estructura matemática del cálculo en boleta de pago
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Total Ingresos Remunerativos:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Comprende el sueldo básico pactado más la Asignación Familiar (10% de la RMV si corresponde) y remuneraciones variables computables (comisiones y horas extras).
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="font-bold text-red-700 dark:text-red-400 block">• Deducciones de Ley al Trabajador:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Descuento previsional predeterminado: 13.00% para ONP o entre 11.37% (esquema mixto / saldo) y 12.84% a 13.06% en AFP bajo esquema de flujo (10% fondo obligatorio + 1.37% prima seguro + comisión de administradora), sumado a la retención de Impuesto a la Renta de Quinta Categoría de SUNAT si la proyección anual supera las 7 UIT vigentes.
                </p>
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200">
              Fórmula: Sueldo Neto = (Sueldo Básico + Asignación Familiar + Conceptos Remunerativos) - (Descuento Previsional AFP/ONP + Retención 5ta Categoría + Otros Descuentos)
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico de aplicación (Ejemplo ilustrativo 2026)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Imaginemos un trabajador del régimen privado general con un sueldo bruto básico de <strong>S/ 3,000.00</strong> mensuales, con carga familiar acreditada (recibe Asignación Familiar del 10% de la RMV) y afiliado a AFP Integra bajo comisión por flujo (12.92% total):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Concepto en Boleta</th>
                    <th className="p-2.5">Monto (PEN)</th>
                    <th className="p-2.5">Naturaleza / Base Legal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5">Sueldo Básico Contratado</td>
                    <td className="p-2.5 font-mono">S/ 3,000.00</td>
                    <td className="p-2.5 text-emerald-700 dark:text-emerald-400 font-semibold">Haber computable principal</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Asignación Familiar (Ley 25129 - 10% RMV S/ 1,130)</td>
                    <td className="p-2.5 font-mono">S/ 113.00</td>
                    <td className="p-2.5 text-emerald-700 dark:text-emerald-400 font-semibold">Beneficio social remunerativo</td>
                  </tr>
                  <tr className="bg-slate-50/60 dark:bg-slate-900/60 font-bold">
                    <td className="p-2.5">Total Remuneración Bruta Afecta</td>
                    <td className="p-2.5 font-mono">S/ 3,113.00</td>
                    <td className="p-2.5">Base imponible mensual</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Descuento Previsional AFP Integra (Flujo: 12.92%)</td>
                    <td className="p-2.5 font-mono text-red-600 dark:text-red-400">- S/ 402.20</td>
                    <td className="p-2.5 text-slate-500">10% fondo + 1.37% seguro + 1.55% comisión</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Retención Proyectada 5ta Categoría SUNAT (Tramo 1: 8%)</td>
                    <td className="p-2.5 font-mono text-red-600 dark:text-red-400">- S/ 33.88</td>
                    <td className="p-2.5 text-slate-500">Proyección anual (14 sueldos) menos 7 UIT</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950 font-bold text-slate-900 dark:text-white">
                    <td className="p-2.5 text-emerald-800 dark:text-emerald-300">Sueldo Neto Líquido a Depositar</td>
                    <td className="p-2.5 font-mono text-emerald-800 dark:text-emerald-300 text-sm">S/ 2,676.92</td>
                    <td className="p-2.5 text-emerald-800 dark:text-emerald-300">Ingreso efectivo mensual en cuenta</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              * Nota: Si el afiliado estuviese en comisión mixta (saldo), la tasa en planilla sería 11.37% (-S/ 353.95), resultando en un neto de S/ 2,725.17. El empleador aporta adicionalmente EsSalud (9% = S/ 280.17) sin descontarlo del trabajador.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Marco legal y referencias oficiales:</span>
            <p>
              • <strong>D.L. 728:</strong> Ley de Productividad y Competitividad Laboral.<br />
              • <strong>D.S. N° 054-97-EF:</strong> Texto Único Ordenado de la Ley del Sistema Privado de Administración de Fondos de Pensiones.<br />
              • <strong>D.L. 19990:</strong> Sistema Nacional de Pensiones administrado por la Oficina de Normalización Previsional (ONP).<br />
              • <strong>D.S. N° 179-2004-EF:</strong> Texto Único Ordenado de la Ley del Impuesto a la Renta (Quinta Categoría).
            </p>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[#08734F] dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
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

        {/* Results Column — Proposal A (Resumen de Boleta de Pago) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-200/90 dark:border-emerald-800/80 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#08734F] dark:text-emerald-400" />
                Resumen de Boleta de Pago
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold text-[#08734F] dark:text-emerald-300">
                {showPayrollDetails ? 'Personalizado' : 'Estimación base'}
              </span>
            </div>

            {/* Big Main Result Box (Non-truncated tabular numerals) */}
            <div className="rounded-2xl bg-emerald-50/50 dark:bg-slate-950 border border-emerald-100 dark:border-emerald-900/60 p-5 sm:p-6 text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Sueldo Neto Líquido en Cuenta
              </span>
              <div
                title={formatCurrency(result.netSalary)}
                className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-[#08734F] dark:text-emerald-400 mt-1.5 font-mono tracking-tight tabular-nums break-words leading-tight"
              >
                {formatCurrency(result.netSalary)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Importe a percibir luego de deducciones de ley
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
                label="5ta Categoría SUNAT"
                value={formatCurrency(result.fifthCategoryTaxMonthly)}
                type="neutral"
                subValue={fifthCategoryMode === 'manual'
                  ? 'Monto de tu boleta'
                  : fifthCategoryMode === 'none'
                    ? 'No aplicada'
                    : result.fifthCategoryTaxMonthly > 0
                      ? 'Proyección anual'
                      : 'Sin retención estimada'}
              />
            </div>

            {/* Breakdown Detail Table */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between font-medium">
                <span>Sueldo básico mensual:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(grossSalary)}</span>
              </div>
              {hasDependents && (
                <div className="flex justify-between font-medium text-emerald-700 dark:text-emerald-400">
                  <span>Asignación Familiar (10% RMV):</span>
                  <span className="font-bold font-mono">+{formatCurrency(result.familyAllowance)}</span>
                </div>
              )}
              {result.variableRemuneration > 0 && (
                <div className="flex justify-between font-medium text-emerald-700 dark:text-emerald-400">
                  <span>Ingresos variables (horas extra/bonos):</span>
                  <span className="font-bold font-mono">+{formatCurrency(result.variableRemuneration)}</span>
                </div>
              )}
              {result.nonRemunerativeIncome > 0 && (
                <div className="flex justify-between font-medium text-emerald-700 dark:text-emerald-400">
                  <span>Ingresos no remunerativos (movilidad):</span>
                  <span className="font-bold font-mono">+{formatCurrency(result.nonRemunerativeIncome)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total remuneración bruta afecta:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{formatCurrency(result.totalGrossIncome)}</span>
              </div>
              <div className="flex justify-between font-medium text-rose-700 dark:text-rose-400">
                <span>Descuento previsional ({pensionSystem === 'onp' ? 'ONP' : 'AFP'}):</span>
                <span className="font-bold font-mono">−{formatCurrency(result.pensionDeduction)}</span>
              </div>
              {result.fifthCategoryTaxMonthly > 0 && (
                <div className="flex justify-between font-medium text-rose-700 dark:text-rose-400">
                  <span>Retención Impuesto 5ta Categoría:</span>
                  <span className="font-bold font-mono">−{formatCurrency(result.fifthCategoryTaxMonthly)}</span>
                </div>
              )}
              {result.otherDeductions > 0 && (
                <div className="flex justify-between font-medium text-rose-700 dark:text-rose-400">
                  <span>Otros descuentos:</span>
                  <span className="font-bold font-mono">−{formatCurrency(result.otherDeductions)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-rose-700 dark:text-rose-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total deducciones de ley:</span>
                <span className="font-mono">−{formatCurrency(result.totalDeductions)}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-500 pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-800 text-[11px]">
                <span>Aporte EsSalud (Asume empleador 9%):</span>
                <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">{formatCurrency(result.essaludContributionEmployer)}</span>
              </div>
            </div>

            {/* Official Payroll Slip CTA Banner */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 p-4 space-y-2.5 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#08734F] text-white text-xs font-bold shadow-xs">
                    ✓
                  </span>
                  <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                    Boleta de Pago Formato D.S. 001-98-TR
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-200/70 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200">
                  D.S. N° 001-98-TR
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                Genera tu <strong>Boleta de Pago en PDF o Excel</strong> con estructura formal de 3 columnas (haberes, deducciones y aportaciones patronales).
              </p>
              <button
                type="button"
                onClick={() => setIsSlipModalOpen(true)}
                className="w-full py-3 rounded-xl bg-[#08734F] hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Emitir Boleta de Pago (PDF / Excel)</span>
              </button>
            </div>

            <div className="mb-4">
              <ExportPdfButton
                className="w-full"
                label="Descargar estimación rápida en PDF"
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

      <PayrollSlipModal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        calculationData={{
          baseSalary: grossSalary,
          familyAllowance: result.familyAllowance,
          variableIncome: result.variableRemuneration,
          nonRemunerativeIncome: result.nonRemunerativeIncome,
          totalGross: result.totalGrossIncome,
          pensionDeduction: result.pensionDeduction,
          pensionRatePercent: formatPercent(result.pensionRate),
          fifthCategoryTax: result.fifthCategoryTaxMonthly,
          otherDeductions: result.otherDeductions,
          totalDeductions: result.totalDeductions,
          essaludContribution: result.essaludContributionEmployer,
          netSalary: result.netSalary,
          pensionSystemName:
            pensionSystem === 'onp'
              ? 'ONP (Sistema Nacional de Pensiones 13%)'
              : pensionSystem === 'afp_integra'
                ? 'AFP Integra'
                : pensionSystem === 'afp_prima'
                  ? 'AFP Prima'
                  : pensionSystem === 'afp_profuturo'
                    ? 'AFP Profuturo'
                    : 'AFP Habitat',
        }}
      />
    </CalculatorShell>
  );
}
