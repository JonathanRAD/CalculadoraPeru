import { roundTo } from '../math/formatters';

export type VacationRegime = 'general' | 'especial_20' | 'pequena_empresa' | 'microempresa' | 'personalizado';

export interface VacationsInput {
  baseSalary: number; // Sueldo bruto mensual (S/)
  hasFamilyAllowance?: boolean; // Asignación familiar (+S/ 102.50)
  monthsWorked: number; // Meses laborados en el periodo (1 a 12)
  daysWorked?: number; // Días adicionales laborados (0 a 29)
  companyRegime: VacationRegime; // Régimen general (30d), especial (20d), MYPE (15d) o personalizado
  customDaysPerYear?: number; // Días de vacaciones al año si es personalizado
  daysToSell?: number; // Días de vacaciones que se compran/venden a la empresa
}

export interface VacationsResult {
  computableSalary: number; // Remuneración computable mensual
  dailyRate: number; // Valor remuneración diaria
  annualVacationDays: number; // Días de vacaciones que corresponden al año
  vacationPayForMonths: number; // Pago por meses laborados
  vacationPayForDays: number; // Pago por días laborados
  totalTruncatedVacations: number; // Total vacaciones truncas
  soldVacationsPay: number; // Pago por venta de días de vacaciones
  totalPay: number; // Total a liquidar
}

/**
 * Calcula las Vacaciones Truncas y Venta de Vacaciones en Perú para todos los regímenes laborales.
 */
export function calculateVacations(input: VacationsInput): VacationsResult {
  const salary = Math.max(0, input.baseSalary || 0);
  const familyAllowance = input.hasFamilyAllowance ? 102.5 : 0;
  const computableSalary = salary + familyAllowance;
  const dailyRate = computableSalary / 30;

  // Determinar días de vacaciones por año según régimen
  let annualVacationDays = 30;
  if (input.companyRegime === 'pequena_empresa' || input.companyRegime === 'microempresa') {
    annualVacationDays = 15;
  } else if (input.companyRegime === 'especial_20') {
    annualVacationDays = 20;
  } else if (input.companyRegime === 'personalizado') {
    annualVacationDays = Math.max(1, Math.min(60, input.customDaysPerYear || 30));
  }

  // Factor de proporción sobre el mes de 30 días
  const regimeFactor = annualVacationDays / 30;

  const months = Math.max(0, Math.min(12, input.monthsWorked || 0));
  const days = Math.max(0, Math.min(29, input.daysWorked || 0));

  // Vacaciones por meses = (Sueldo * Factor / 12) * Meses
  const vacationPayForMonths = ((computableSalary * regimeFactor) / 12) * months;

  // Vacaciones por días = (Sueldo * Factor / 360) * Días
  const vacationPayForDays = ((computableSalary * regimeFactor) / 360) * days;

  const totalTruncatedVacations = vacationPayForMonths + vacationPayForDays;

  // Venta de vacaciones (máximo la mitad de sus días anuales según ley)
  const maxSellDays = Math.floor(annualVacationDays / 2);
  const daysToSell = Math.max(0, Math.min(maxSellDays, input.daysToSell || 0));
  const soldVacationsPay = daysToSell * dailyRate;

  const totalPay = totalTruncatedVacations + soldVacationsPay;

  return {
    computableSalary: roundTo(computableSalary, 2),
    dailyRate: roundTo(dailyRate, 2),
    annualVacationDays,
    vacationPayForMonths: roundTo(vacationPayForMonths, 2),
    vacationPayForDays: roundTo(vacationPayForDays, 2),
    totalTruncatedVacations: roundTo(totalTruncatedVacations, 2),
    soldVacationsPay: roundTo(soldVacationsPay, 2),
    totalPay: roundTo(totalPay, 2),
  };
}
