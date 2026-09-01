import { roundTo } from '../math/formatters';
import { PERU_CONSTANTS } from '../constants/peru';

export interface OvertimeInput {
  baseMonthlySalary: number; // Sueldo básico mensual (S/)
  hasFamilyAllowance?: boolean; // Asignación familiar (10% de la RMV)
  hoursFirstTwo: number; // Horas extras al 25% (primeras 2 horas del día)
  hoursAfterTwo: number; // Horas extras al 35% (a partir de la 3era hora)
  holidayHours: number; // Horas trabajadas en feriado o día de descanso (sobretasa 100%)
}

export interface OvertimeResult {
  computableSalary: number; // Remuneración computable
  hourlyRate: number; // Valor hora ordinaria (Sueldo / 240)
  pay25Percent: number; // Pago por horas al 25%
  pay35Percent: number; // Pago por horas al 35%
  payHoliday: number; // Pago por horas en feriado / descanso
  totalOvertimePay: number; // Total a cobrar por horas extras
}

export interface AtypicalScheduleInput {
  workDays: number;
  restDays: number;
  hoursPerShift: number;
}

export interface AtypicalScheduleResult {
  cycleDays: number;
  workedHoursPerCycle: number;
  averageWeeklyHours: number;
  maximumOrdinaryHoursPerCycle: number;
  excessHoursPerCycle: number;
  isWithinGeneralWeeklyLimit: boolean;
}

/**
 * Evalúa una jornada acumulativa usando el límite general promedio de 48 horas semanales.
 * Es un diagnóstico del rol; no determina por sí solo una deuda de horas extras.
 */
export function analyzeAtypicalSchedule(input: AtypicalScheduleInput): AtypicalScheduleResult {
  const workDays = Math.max(0, input.workDays || 0);
  const restDays = Math.max(0, input.restDays || 0);
  const hoursPerShift = Math.max(0, input.hoursPerShift || 0);
  const cycleDays = workDays + restDays;
  const workedHoursPerCycle = workDays * hoursPerShift;
  const averageWeeklyHours = cycleDays > 0 ? (workedHoursPerCycle / cycleDays) * 7 : 0;
  const maximumOrdinaryHoursPerCycle = cycleDays > 0 ? (48 / 7) * cycleDays : 0;
  const excessHoursPerCycle = Math.max(0, workedHoursPerCycle - maximumOrdinaryHoursPerCycle);

  return {
    cycleDays: roundTo(cycleDays, 2),
    workedHoursPerCycle: roundTo(workedHoursPerCycle, 2),
    averageWeeklyHours: roundTo(averageWeeklyHours, 2),
    maximumOrdinaryHoursPerCycle: roundTo(maximumOrdinaryHoursPerCycle, 2),
    excessHoursPerCycle: roundTo(excessHoursPerCycle, 2),
    isWithinGeneralWeeklyLimit: cycleDays > 0 && averageWeeklyHours <= 48,
  };
}

/**
 * Calcula las horas extras en Perú según D.S. 007-2002-TR.
 * Valor hora = Sueldo / 240 (asumiendo jornada de 8 horas diarias por 30 días).
 */
export function calculateOvertime(input: OvertimeInput): OvertimeResult {
  const baseSalary = Math.max(0, input.baseMonthlySalary || 0);
  const familyAllowance = input.hasFamilyAllowance ? PERU_CONSTANTS.FAMILY_ALLOWANCE : 0;
  const computableSalary = baseSalary + familyAllowance;

  // Valor hora ordinaria = Remuneración mensual / 240
  const hourlyRate = computableSalary > 0 ? computableSalary / 240 : 0;

  // Tasas
  const rate25 = hourlyRate * 1.25;
  const rate35 = hourlyRate * 1.35;
  const rateHoliday = hourlyRate * 2.0; // Sobretasa del 100%

  const pay25Percent = (input.hoursFirstTwo || 0) * rate25;
  const pay35Percent = (input.hoursAfterTwo || 0) * rate35;
  const payHoliday = (input.holidayHours || 0) * rateHoliday;

  const totalOvertimePay = pay25Percent + pay35Percent + payHoliday;

  return {
    computableSalary: roundTo(computableSalary, 2),
    hourlyRate: roundTo(hourlyRate, 2),
    pay25Percent: roundTo(pay25Percent, 2),
    pay35Percent: roundTo(pay35Percent, 2),
    payHoliday: roundTo(payHoliday, 2),
    totalOvertimePay: roundTo(totalOvertimePay, 2),
  };
}
