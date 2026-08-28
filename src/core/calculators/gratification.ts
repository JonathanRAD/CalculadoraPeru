import { roundTo } from '../math/formatters';

export type CompanyRegime = 'general' | 'pequena_empresa' | 'microempresa';
export type HealthInsurance = 'essalud' | 'eps';

export interface GratificationInput {
  baseSalary: number; // Sueldo bruto mensual (S/)
  hasFamilyAllowance?: boolean; // Asignación familiar (+S/ 102.50)
  monthsWorkedInSemester: number; // Meses completos laborados (1 a 6)
  companyRegime: CompanyRegime; // Régimen laboral
  healthInsurance: HealthInsurance; // EsSalud (9%) o EPS (6.75%)
}

export interface GratificationResult {
  baseComputableSalary: number; // Remuneración computable (Sueldo + Asig. Fam)
  rawGratification: number; // Gratificación proporcional legal
  extraordinaryBonus: number; // Bonificación extraordinaria (9% EsSalud o 6.75% EPS)
  bonusPercentage: number; // 9% o 6.75%
  totalToReceive: number; // Monto total neto en cuenta
  isExemptFromTaxes: boolean; // Las gratificaciones no están afectas a AFP/ONP
}

/**
 * Calcula la Gratificación Legal de Fiestas Patrias (Julio) o Navidad (Diciembre).
 */
export function calculateGratification(input: GratificationInput): GratificationResult {
  const salary = Math.max(0, input.baseSalary || 0);
  const familyAllowance = input.hasFamilyAllowance ? 102.5 : 0;
  const computableSalary = salary + familyAllowance;
  const months = Math.max(1, Math.min(6, input.monthsWorkedInSemester || 6));

  if (input.companyRegime === 'microempresa') {
    return {
      baseComputableSalary: computableSalary,
      rawGratification: 0,
      extraordinaryBonus: 0,
      bonusPercentage: 0,
      totalToReceive: 0,
      isExemptFromTaxes: true,
    };
  }

  // Factor según régimen (Régimen General: 1 sueldo completo / Pequeña empresa: 50% de sueldo)
  const regimeMultiplier = input.companyRegime === 'pequena_empresa' ? 0.5 : 1.0;
  const rawGratification = roundTo(((computableSalary * regimeMultiplier) / 6) * months, 2);

  const bonusPercentage = input.healthInsurance === 'eps' ? 6.75 : 9.0;
  const extraordinaryBonus = roundTo((rawGratification * bonusPercentage) / 100, 2);
  const totalToReceive = roundTo(rawGratification + extraordinaryBonus, 2);

  return {
    baseComputableSalary: roundTo(computableSalary, 2),
    rawGratification,
    extraordinaryBonus,
    bonusPercentage,
    totalToReceive,
    isExemptFromTaxes: true,
  };
}
