'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateLoan } from '@/core/calculators/loan';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { PayslipResult } from '@/shared/components/ui/PayslipResult';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Landmark } from 'lucide-react';

export default function PrestamoBancarioPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'prestamo-bancario')!;

  const [loanAmount, setLoanAmount] = useState<number>(10000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(24);
  const [termMonths, setTermMonths] = useState<number>(24);
  const [monthlyInsuranceRate, setMonthlyInsuranceRate] = useState<number>(0.075);

  const result = calculateLoan({
    loanAmount,
    annualInterestRate,
    termMonths,
    monthlyInsuranceRate,
  });

  const shareSummary = `Préstamo: ${formatCurrency(loanAmount)} a ${termMonths} meses
Cuota Mensual Estimada: ${formatCurrency(result.monthlyPaymentWithInsurance)} (con desgravamen)
Total de Intereses a Pagar: ${formatCurrency(result.totalInterestPaid)} (TEA: ${annualInterestRate}%)`;

  const faqs = [
    {
      question: '¿Cuál es la diferencia entre la TEA y la TCEA en los bancos del Perú?',
      answer: 'La TEA (Tasa Efectiva Anual) mide únicamente el interés cobrado por el dinero prestado. La TCEA (Tasa de Costo Efectivo Anual) es la tasa real total que pagarás, ya que incluye la TEA más todos los costos adicionales obligatorios: seguro de desgravamen, comisiones bancarias, gastos administrativos y portes. Según la SBS, siempre debes comparar créditos evaluando la TCEA.',
    },
    {
      question: '¿Cómo funciona el Sistema Francés de amortización en el Perú?',
      answer: 'Es el sistema bancario estándar en el Perú (utilizado por BCP, BBVA, Interbank, Scotiabank, Banco de la Nación y Cajas Municipales). Se caracteriza por mantener cuotas mensuales fijas e iguales durante todo el plazo del crédito. En las primeras cuotas la mayor parte del pago corresponde a intereses, mientras que hacia el final del plazo la mayor parte amortiza el capital.',
    },
    {
      question: '¿Es obligatorio contratar el seguro de desgravamen con el mismo banco?',
      answer: 'No. Por regulación de la Superintendencia de Banca, Seguros y AFP (SBS), tienes el derecho legal de endosar una póliza de seguro de vida independiente que ya poseas, siempre que cumpla con las coberturas mínimas exigidas por la entidad financiera, evitando pagar la prima interna del banco.',
    },
    {
      question: '¿Puedo hacer pagos anticipados o prepagos sin penalidad en Perú?',
      answer: 'Sí. La Ley de Protección al Consumidor Financiero prohíbe el cobro de penalidades, comisiones o intereses futuros por amortizaciones extraordinarias o cancelación total anticipada de un crédito. Puedes elegir entre reducir el monto de la cuota mensual o reducir el plazo restante de la deuda.',
    },
    {
      question: '¿Qué es el Impuesto a las Transacciones Financieras (ITF)?',
      answer: 'El ITF es un tributo nacional con tasa de 0.005% que se aplica a toda acreditación o débito en cuentas del sistema financiero peruano (Ley 28194). Se descuenta de forma automática al momento del desembolso del crédito y con cada abono de cuota.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            Al solicitar un préstamo personal, crédito vehicular o financiamiento para capital de trabajo en el sistema financiero peruano, es fundamental comprender la estructura de las cuotas y los costos regulados por la <strong>Superintendencia de Banca, Seguros y AFP (SBS)</strong>.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            Estructura de la Cuota Mensual Bancaria
          </h3>
          <p>
            Bajo el sistema francés de cuota constante, cada pago mensual que realizas al banco se descompone en tres partes esenciales:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Amortización de Capital:</strong> Reducción directa del saldo deudor adeudado.</li>
            <li><strong>Interés Compensatorio:</strong> Ganancia de la entidad financiera calculada sobre el saldo pendiente (derivada de la TEA).</li>
            <li><strong>Seguro de Desgravamen y Cargos:</strong> Cobertura ante fallecimiento e invalidez exigida para proteger el saldo pendiente.</li>
          </ul>

          <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-[#2C3744]">
            <table className="w-full text-left text-[13px] sm:text-[15px]">
              <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                <tr>
                  <th className="p-3">Concepto Financiero</th>
                  <th className="p-3">¿Qué incluye?</th>
                  <th className="p-3">Impacto en el Deudor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold">TEA (Tasa Efectiva Anual)</td>
                  <td className="p-3">Solo costo financiero del dinero</td>
                  <td className="p-3">Tasa referencial pactada</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">TCEA (Costo Efectivo Anual)</td>
                  <td className="p-3">TEA + Desgravamen + Comisiones + Gastos</td>
                  <td className="p-3 font-bold text-brand-700 dark:text-brand-400">El costo real definitivo a pagar</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Amortización Anticipada</td>
                  <td className="p-3">Abono directo al capital sin penalidad (SBS)</td>
                  <td className="p-3">Ahorro drástico de intereses futuros</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            Recomendación para Solicitar Préstamos en Perú
          </h3>
          <p>
            Antes de firmar un pagaré o contrato de crédito, solicita la <strong>Hoja Resumen</strong> a la entidad bancaria o caja municipal. Compara siempre la TCEA entre al menos tres entidades del mercado antes de tomar una decisión de endeudamiento.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-lg border border-slate-200/90 dark:border-[#2C3744] bg-white dark:bg-[#18202A] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#2C3744] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
              <Landmark className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos del Préstamo Bancario</h2>
          </div>

          <InputNumber
            id="loanAmount"
            label="Monto del préstamo solicitado"
            prefix="S/"
            value={loanAmount}
            onChange={(loanAmount) => setLoanAmount(loanAmount)}
            placeholder="10000.00"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="tea"
              label="Tasa de Interés Efectiva Anual (TEA)"
              suffix="%"
              value={annualInterestRate}
              onChange={(annualInterestRate) => setAnnualInterestRate(annualInterestRate)}
              helpText="Tasa pactada con el banco"
              placeholder="24.0"
              required
            />

            <InputNumber
              id="termMonths"
              label="Plazo de pago en meses"
              value={termMonths}
              onChange={(termMonths) => setTermMonths(termMonths)}
              min={1}
              max={120}
              helpText="Ej: 12, 24, 36, 48 meses"
              placeholder="24"
              required
            />
          </div>

          <InputNumber
            id="insurance"
            label="Seguro de Desgravamen mensual"
            suffix="%"
            value={monthlyInsuranceRate}
            onChange={(monthlyInsuranceRate) => setMonthlyInsuranceRate(monthlyInsuranceRate)}
            helpText="Tasa referencial (~0.075% mensual)"
            placeholder="0.075"
          />
        </div>
        {/* Resultado con forma de boleta */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <PayslipResult
            title={"Cuota Mensual Fija"}
            period={"Sistema Francés"}
            amountHeader="Valor"
            lines={[
              { label: "Total Intereses", amount: formatCurrency(result.totalInterestPaid), note: `TEA: ${annualInterestRate}%` },
              { label: "Total a Devolver", amount: formatCurrency(result.totalAmountToRepay), note: `En ${termMonths} meses` },
            ]}
            totalLabel={"Cuota Mensual Estimada"}
            totalAmount={formatCurrency(result.monthlyPaymentWithInsurance)}
            footnote={"Cuota fija mensual con seguro incluido"}
          >
            <ShareButtons title="Simulador de Préstamos Bancarios" shareText={shareSummary} />
          </PayslipResult>
        </div>

      </div>
    </CalculatorShell>
  );
}
