import { roundTo } from '../math/formatters';

export interface LoanInput {
  loanAmount: number; // Monto del préstamo solicitado en Soles (S/)
  annualInterestRate: number; // Tasa de Interés Efectiva Anual (TEA %)
  termMonths: number; // Plazo en meses (ej: 12, 24, 36)
  monthlyInsuranceRate?: number; // Seguro de desgravamen mensual (%) (ej: 0.08%)
}

export interface LoanAmortizationRow {
  month: number;
  monthlyPayment: number;
  principal: number;
  interest: number;
  insurance: number;
  remainingBalance: number;
}

export interface LoanResult {
  monthlyPayment: number; // Cuota mensual fija aproximada (S/)
  monthlyPaymentWithInsurance: number; // Cuota mensual con desgravamen (S/)
  totalInterestPaid: number; // Total de intereses pagados al banco (S/)
  totalInsurancePaid: number; // Total seguro de desgravamen (S/)
  totalAmountToRepay: number; // Total desembolsado al final del préstamo (S/)
  schedule: LoanAmortizationRow[]; // Cronograma resumido
}

/**
 * Calcula la cuota mensual fija de un préstamo bancario en Perú mediante el Sistema Francés.
 */
export function calculateLoan(input: LoanInput): LoanResult {
  const principal = Math.max(0, input.loanAmount || 0);
  const tea = Math.max(0, input.annualInterestRate || 0);
  const months = Math.max(1, input.termMonths || 12);
  const insuranceRate = (input.monthlyInsuranceRate || 0.075) / 100;

  // Convertir TEA a TEM (Tasa Efectiva Mensual): TEM = (1 + TEA)^(1/12) - 1
  const tem = tea > 0 ? Math.pow(1 + tea / 100, 1 / 12) - 1 : 0;

  // Cuota mensual francesa: R = P * [tem * (1+tem)^n] / [(1+tem)^n - 1]
  let monthlyPayment = 0;
  if (tem > 0 && principal > 0) {
    const factor = Math.pow(1 + tem, months);
    monthlyPayment = (principal * (tem * factor)) / (factor - 1);
  } else if (principal > 0) {
    monthlyPayment = principal / months;
  }

  let balance = principal;
  let totalInterest = 0;
  let totalInsurance = 0;
  const schedule: LoanAmortizationRow[] = [];

  for (let m = 1; m <= months; m++) {
    const interest = balance * tem;
    const insurance = balance * insuranceRate;
    const principalPaid = monthlyPayment - interest;
    balance = Math.max(0, balance - principalPaid);

    totalInterest += interest;
    totalInsurance += insurance;

    if (m <= 6 || m === months) {
      schedule.push({
        month: m,
        monthlyPayment: roundTo(monthlyPayment, 2),
        principal: roundTo(principalPaid, 2),
        interest: roundTo(interest, 2),
        insurance: roundTo(insurance, 2),
        remainingBalance: roundTo(balance, 2),
      });
    }
  }

  const roundedMonthly = roundTo(monthlyPayment, 2);
  const roundedInsuranceAvg = roundTo(totalInsurance / months, 2);
  const monthlyPaymentWithInsurance = roundTo(roundedMonthly + roundedInsuranceAvg, 2);
  const totalAmountToRepay = roundTo(principal + totalInterest + totalInsurance, 2);

  return {
    monthlyPayment: roundedMonthly,
    monthlyPaymentWithInsurance,
    totalInterestPaid: roundTo(totalInterest, 2),
    totalInsurancePaid: roundTo(totalInsurance, 2),
    totalAmountToRepay,
    schedule,
  };
}
