import { roundTo } from '../math/formatters';

export type LaborRegime = 'general' | 'pequena_empresa' | 'microempresa';
export type SeparationReason = 'renuncia' | 'fin_contrato' | 'mutuo_disenso' | 'despido_arbitrario';

export interface SeverancePayInput {
  baseSalary: number;
  hasFamilyAllowance?: boolean;
  monthsInLastSemesterCts: number; // 0 a 6 meses
  daysInLastSemesterCts?: number; // 0 a 29 días
  monthsInLastSemesterGrati: number; // 0 a 6 meses
  monthsInLastYearVacations: number; // 0 a 12 meses
  daysInLastYearVacations?: number; // 0 a 29 días
  laborRegime: LaborRegime;
  separationReason: SeparationReason;
  hasEps?: boolean; // 6.75% en lugar de 9% EsSalud
  totalYearsWorkedForIndemnity?: number; // Años totales trabajados (si es despido arbitrario)
  totalMonthsWorkedForIndemnity?: number; // Meses adicionales
}

export interface SeverancePayResult {
  computableSalaryForGrati: number;
  computableSalaryForCts: number;
  truncatedCts: number;
  truncatedGrati: number;
  essaludBonus: number;
  truncatedVacations: number;
  arbitraryDismissalIndemnity: number;
  subtotalBenefits: number; // CTS + Grati + Bono + Vacaciones
  totalSettlement: number; // Subtotal + Indemnización
}

/**
 * Calcula la Liquidación Laboral Integral (Todo en 1) bajo legislación peruana (D.L. 650, D.L. 713, D.L. 728 y Ley 27735).
 */
export function calculateSeverancePay(input: SeverancePayInput): SeverancePayResult {
  const salary = Math.max(0, input.baseSalary || 0);
  const familyAllowance = input.hasFamilyAllowance ? 102.5 : 0;
  const baseComputable = salary + familyAllowance;

  const regimeFactor = input.laborRegime === 'general' ? 1.0 : input.laborRegime === 'pequena_empresa' ? 0.5 : 0.0;
  const vacationRegimeFactor = input.laborRegime === 'general' ? 1.0 : 0.5;

  // 1. Gratificación Trunca
  const gratiMonths = Math.max(0, Math.min(6, input.monthsInLastSemesterGrati || 0));
  const truncatedGrati = input.laborRegime === 'microempresa'
    ? 0
    : ((baseComputable * regimeFactor) / 6) * gratiMonths;

  // Bonificación EsSalud (9% o 6.75% EPS)
  const bonusRate = input.hasEps ? 0.0675 : 0.09;
  const essaludBonus = truncatedGrati * bonusRate;

  // 2. CTS Trunca (Remuneración computable incluye 1/6 de gratificación)
  const sixthOfGrati = input.laborRegime === 'microempresa' ? 0 : baseComputable / 6;
  const computableForCts = baseComputable + sixthOfGrati;

  const ctsMonths = Math.max(0, Math.min(6, input.monthsInLastSemesterCts || 0));
  const ctsDays = Math.max(0, Math.min(29, input.daysInLastSemesterCts || 0));

  const ctsFromMonths = input.laborRegime === 'microempresa'
    ? 0
    : ((computableForCts * regimeFactor) / 12) * ctsMonths;
  const ctsFromDays = input.laborRegime === 'microempresa'
    ? 0
    : ((computableForCts * regimeFactor) / 360) * ctsDays;

  const truncatedCts = ctsFromMonths + ctsFromDays;

  // 3. Vacaciones Truncas
  const vacMonths = Math.max(0, Math.min(12, input.monthsInLastYearVacations || 0));
  const vacDays = Math.max(0, Math.min(29, input.daysInLastYearVacations || 0));

  const vacFromMonths = ((baseComputable * vacationRegimeFactor) / 12) * vacMonths;
  const vacFromDays = ((baseComputable * vacationRegimeFactor) / 360) * vacDays;
  const truncatedVacations = vacFromMonths + vacFromDays;

  // 4. Indemnización por Despido Arbitrario (si aplica)
  let arbitraryDismissalIndemnity = 0;
  if (input.separationReason === 'despido_arbitrario') {
    const years = Math.max(0, input.totalYearsWorkedForIndemnity || 0);
    const months = Math.max(0, Math.min(11, input.totalMonthsWorkedForIndemnity || 0));

    if (input.laborRegime === 'general') {
      // 1.5 remuneraciones por año, tope 12 sueldos
      const perYear = 1.5 * baseComputable;
      const perMonth = perYear / 12;
      const totalRaw = (perYear * years) + (perMonth * months);
      arbitraryDismissalIndemnity = Math.min(12 * baseComputable, totalRaw);
    } else if (input.laborRegime === 'pequena_empresa') {
      // 20 días de sueldo por año, tope 120 días (4 sueldos)
      const dailyRate = baseComputable / 30;
      const perYear = 20 * dailyRate;
      const perMonth = perYear / 12;
      const totalRaw = (perYear * years) + (perMonth * months);
      arbitraryDismissalIndemnity = Math.min(120 * dailyRate, totalRaw);
    } else if (input.laborRegime === 'microempresa') {
      // 10 días de sueldo por año, tope 90 días (3 sueldos)
      const dailyRate = baseComputable / 30;
      const perYear = 10 * dailyRate;
      const perMonth = perYear / 12;
      const totalRaw = (perYear * years) + (perMonth * months);
      arbitraryDismissalIndemnity = Math.min(90 * dailyRate, totalRaw);
    }
  }

  const subtotalBenefits = truncatedCts + truncatedGrati + essaludBonus + truncatedVacations;
  const totalSettlement = subtotalBenefits + arbitraryDismissalIndemnity;

  return {
    computableSalaryForGrati: roundTo(baseComputable, 2),
    computableSalaryForCts: roundTo(computableForCts, 2),
    truncatedCts: roundTo(truncatedCts, 2),
    truncatedGrati: roundTo(truncatedGrati, 2),
    essaludBonus: roundTo(essaludBonus, 2),
    truncatedVacations: roundTo(truncatedVacations, 2),
    arbitraryDismissalIndemnity: roundTo(arbitraryDismissalIndemnity, 2),
    subtotalBenefits: roundTo(subtotalBenefits, 2),
    totalSettlement: roundTo(totalSettlement, 2),
  };
}
