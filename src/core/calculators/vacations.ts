import { roundTo } from '../math/formatters';
import { CompanyRegime } from './gratification';

export interface VacationsInput {
  baseSalary: number; // Sueldo bruto mensual (S/)
  hasFamilyAllowance?: boolean; // Asignación familiar (+S/ 102.50)
  monthsWorked: number; // Meses laborados en el periodo (1 a 12)
  daysWorked?: number; // Días adicionales laborados (0 a 29)
  companyRegime: CompanyRegime; // Régimen general (30 días) o pequeña empresa (15 días)
  daysToSell?: number; // Días de vacaciones que se compran/venden a la empresa (máx 15)
}

export interface VacationsResult {
  computableSalary: number; // Remuneración computable mensual
  dailyRate: number; // Valor remuneración diaria
  vacationPayForMonths: number; // Pago por meses laborados
  vacationPayForDays: number; // Pago por días laborados
  totalTruncatedVacations: number; // Total vacaciones truncas
  soldVacationsPay: number; // Pago por venta de días de vacaciones
  totalPay: number; // Total a liquidar
}

/**
 * Calcula las Vacaciones Truncas y Venta de Vacaciones en Perú (D.L. 713).
 */
export function calculateVacations(input: VacationsInput): VacationsResult {
  const salary = Math.max(0, input.baseSalary || 0);
  const familyAllowance = input.hasFamilyAllowance ? 102.5 : 0;
  const computableSalary = salary + familyAllowance;
  const dailyRate = computableSalary / 30;

  // Factor de régimen: Régimen General (1 sueldo completo por 12 meses) / Pequeña empresa (15 días = 50% de sueldo) / Microempresa (15 días = 50% de sueldo)
  const regimeFactor = input.companyRegime === 'general' ? 1.0 : 0.5;

  const months = Math.max(0, Math.min(12, input.monthsWorked || 0));
  const days = Math.max(0, Math.min(29, input.daysWorked || 0));

  // Vacaciones por meses = (Sueldo * Factor / 12) * Meses
  const vacationPayForMonths = ((computableSalary * regimeFactor) / 12) * months;

  // Vacaciones por días = (Sueldo * Factor / 360) * Días
  const vacationPayForDays = ((computableSalary * regimeFactor) / 360) * days;

  const totalTruncatedVacations = vacationPayForMonths + vacationPayForDays;

  // Venta de vacaciones (máximo 15 días según ley)
  const daysToSell = Math.max(0, Math.min(15, input.daysToSell || 0));
  const soldVacationsPay = daysToSell * dailyRate * regimeFactor;

  const totalPay = totalTruncatedVacations + soldVacationsPay;

  return {
    computableSalary: roundTo(computableSalary, 2),
    dailyRate: roundTo(dailyRate, 2),
    vacationPayForMonths: roundTo(vacationPayForMonths, 2),
    vacationPayForDays: roundTo(vacationPayForDays, 2),
    totalTruncatedVacations: roundTo(totalTruncatedVacations, 2),
    soldVacationsPay: roundTo(soldVacationsPay, 2),
    totalPay: roundTo(totalPay, 2),
  };
}
