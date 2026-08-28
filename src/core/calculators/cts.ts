import { roundTo } from '../math/formatters';
import { CompanyRegime } from './gratification';

export interface CtsInput {
  baseSalary: number; // Sueldo bruto mensual (S/)
  hasFamilyAllowance?: boolean; // Asignación familiar (+S/ 102.50)
  monthsWorkedInSemester: number; // Meses completos laborados en el semestre (1 a 6)
  companyRegime: CompanyRegime; // Régimen laboral
}

export interface CtsResult {
  computableSalary: number; // Sueldo + Asig. Familiar
  oneSixthGratification: number; // 1/6 de la última gratificación
  totalComputableBasis: number; // Base computable completa para CTS
  ctsAmountToDeposit: number; // Monto a depositar en el banco
  periodDescription: string;
}

/**
 * Calcula el depósito semestral de CTS (Mayo: Noviembre-Abril / Noviembre: Mayo-Octubre).
 * Fórmula oficial Perú: (Sueldo + 1/6 Gratificación) / 12 * Meses laborados
 */
export function calculateCts(input: CtsInput): CtsResult {
  const salary = Math.max(0, input.baseSalary || 0);
  const familyAllowance = input.hasFamilyAllowance ? 102.5 : 0;
  const computableSalary = salary + familyAllowance;
  const months = Math.max(1, Math.min(6, input.monthsWorkedInSemester || 6));

  if (input.companyRegime === 'microempresa') {
    return {
      computableSalary,
      oneSixthGratification: 0,
      totalComputableBasis: computableSalary,
      ctsAmountToDeposit: 0,
      periodDescription: 'En microempresa no corresponde depósito de CTS según ley D.L. 1086.',
    };
  }

  const regimeFactor = input.companyRegime === 'pequena_empresa' ? 0.5 : 1.0;
  const oneSixthGratification = roundTo((computableSalary * regimeFactor) / 6, 2);
  const totalComputableBasis = roundTo(computableSalary + oneSixthGratification, 2);

  const ctsAmountToDeposit = roundTo(
    ((totalComputableBasis * regimeFactor) / 12) * months,
    2
  );

  return {
    computableSalary: roundTo(computableSalary, 2),
    oneSixthGratification,
    totalComputableBasis,
    ctsAmountToDeposit,
    periodDescription: `Cálculo semestral proporcional por ${months} mes(es) laborados.`,
  };
}
