import { roundTo } from '../math/formatters';

export interface CompoundInterestInput {
  initialPrincipal: number; // Monto inicial ahorrado o invertido (S/)
  monthlyContribution: number; // Aporte o ahorro mensual constante (S/)
  annualRatePercentage: number; // Tasa de Rendimiento Efectiva Anual (TREA %) (ej: 6.5%, 8%)
  years: number; // Plazo en años (ej: 1, 3, 5, 10)
}

export interface CompoundYearRow {
  year: number;
  totalContributions: number;
  totalInterest: number;
  finalBalance: number;
}

export interface CompoundInterestResult {
  totalContributions: number; // Total de dinero aportado de tu bolsillo
  totalInterestEarned: number; // Total de ganancias por intereses generados
  finalBalance: number; // Monto total acumulado al finalizar el periodo
  yearlyBreakdown: CompoundYearRow[];
}

/**
 * Calcula el Interés Compuesto y crecimiento patrimonial con aportes mensuales.
 */
export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const initial = Math.max(0, input.initialPrincipal || 0);
  const monthly = Math.max(0, input.monthlyContribution || 0);
  const annualRate = Math.max(0, input.annualRatePercentage || 0);
  const years = Math.max(1, Math.min(30, input.years || 1));

  // Tasa Efectiva Mensual (TEM) a partir de la TREA: TEM = (1 + TREA)^(1/12) - 1
  const monthlyRate = annualRate > 0 ? Math.pow(1 + annualRate / 100, 1 / 12) - 1 : 0;

  let balance = initial;
  let totalDeposited = initial;
  const breakdown: CompoundYearRow[] = [];

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      balance = balance * (1 + monthlyRate) + monthly;
      totalDeposited += monthly;
    }

    const totalInterest = Math.max(0, balance - totalDeposited);
    breakdown.push({
      year: y,
      totalContributions: roundTo(totalDeposited, 2),
      totalInterest: roundTo(totalInterest, 2),
      finalBalance: roundTo(balance, 2),
    });
  }

  const finalBalance = roundTo(balance, 2);
  const totalContributions = roundTo(totalDeposited, 2);
  const totalInterestEarned = roundTo(Math.max(0, finalBalance - totalContributions), 2);

  return {
    totalContributions,
    totalInterestEarned,
    finalBalance,
    yearlyBreakdown: breakdown,
  };
}
