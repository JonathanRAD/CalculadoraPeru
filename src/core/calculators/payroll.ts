import { roundTo } from '../math/formatters';
import { AFP_FLOW_RATES_2026, PERU_CONSTANTS } from '../constants/peru';

export type PensionSystem = 'onp' | 'afp_integra' | 'afp_prima' | 'afp_profuturo' | 'afp_habitat';
export type AfpCommissionScheme = 'flow' | 'balance';
export type FifthCategoryMode = 'estimated' | 'manual' | 'none';

export interface PayrollInput {
  grossSalary: number; // Sueldo bruto mensual (S/)
  pensionSystem: PensionSystem; // ONP o AFP
  hasDependents?: boolean; // Hijos / Asignación familiar
  afpCommissionScheme?: AfpCommissionScheme;
  variableRemuneration?: number; // Horas extras, comisiones o bonos remunerativos
  nonRemunerativeIncome?: number; // Movilidad condicionada u otros conceptos no afectos
  otherDeductions?: number; // Préstamos, adelantos u otros descuentos de boleta
  fifthCategoryMode?: FifthCategoryMode;
  manualFifthCategoryTax?: number;
}

export interface PayrollResult {
  grossSalary: number; // Sueldo bruto
  familyAllowance: number; // Asignación familiar (10% de la RMV)
  variableRemuneration: number;
  nonRemunerativeIncome: number;
  pensionableIncome: number;
  totalGrossIncome: number; // Total de ingresos antes de descuentos
  pensionDeduction: number; // Descuento ONP o AFP
  pensionRate: number; // Tasa porcentual efectiva del descuento de pensión (%)
  fifthCategoryTaxMonthly: number; // Retención mensual estimada de 5ta Categoría
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number; // Sueldo neto a recibir en cuenta
  essaludContributionEmployer: number; // Aporte de EsSalud 9% a cargo del empleador
}

// Tasas de descuento sobre la remuneración para comisión sobre flujo.
const PENSION_RATES: Record<PensionSystem, { rate: number; name: string }> = {
  onp: { rate: PERU_CONSTANTS.ONP_RATE * 100, name: 'ONP (13.00%)' },
  afp_integra: { rate: AFP_FLOW_RATES_2026.afp_integra.rate * 100, name: AFP_FLOW_RATES_2026.afp_integra.name },
  afp_prima: { rate: AFP_FLOW_RATES_2026.afp_prima.rate * 100, name: AFP_FLOW_RATES_2026.afp_prima.name },
  afp_profuturo: { rate: AFP_FLOW_RATES_2026.afp_profuturo.rate * 100, name: AFP_FLOW_RATES_2026.afp_profuturo.name },
  afp_habitat: { rate: AFP_FLOW_RATES_2026.afp_habitat.rate * 100, name: AFP_FLOW_RATES_2026.afp_habitat.name },
};

/**
 * Calcula el Sueldo Neto mensual en Perú deduciendo aportes de pensión (AFP/ONP) y 5ta categoría.
 */
export function calculateNetSalary(input: PayrollInput): PayrollResult {
  const gross = Math.max(0, input.grossSalary || 0);
  const familyAllowance = input.hasDependents ? PERU_CONSTANTS.FAMILY_ALLOWANCE : 0;
  const variableRemuneration = Math.max(0, input.variableRemuneration || 0);
  const nonRemunerativeIncome = Math.max(0, input.nonRemunerativeIncome || 0);
  const otherDeductions = Math.max(0, input.otherDeductions || 0);
  const pensionableIncome = gross + familyAllowance + variableRemuneration;
  const totalGrossIncome = pensionableIncome + nonRemunerativeIncome;

  // Deducción previsional (AFP o ONP)
  const pensionInfo = PENSION_RATES[input.pensionSystem] || PENSION_RATES.onp;
  const afpBalancePayrollRate = (
    PERU_CONSTANTS.AFP_MANDATORY_CONTRIBUTION_RATE + PERU_CONSTANTS.AFP_INSURANCE_RATE
  ) * 100;
  const pensionRate = input.pensionSystem !== 'onp' && input.afpCommissionScheme === 'balance'
    ? afpBalancePayrollRate
    : pensionInfo.rate;
  const pensionDeduction = roundTo((pensionableIncome * pensionRate) / 100, 2);

  // Estimación Impuesto a la Renta de 5ta Categoría (SUNAT)
  // Proyección anual: (12 sueldos + 2 gratificaciones) - 7 UIT
  const annualIncome = pensionableIncome * 14;
  const uit2026 = PERU_CONSTANTS.CURRENT_UIT;
  const exempt7Uit = 7 * uit2026; // S/ 38,500 no afectos en 2026
  const taxableAnnual = Math.max(0, annualIncome - exempt7Uit);

  let annualTax = 0;
  if (taxableAnnual > 0) {
    // Escala progresiva acumulativa SUNAT
    const tramo1 = Math.min(taxableAnnual, 5 * uit2026); // Hasta 5 UIT (8%)
    const tramo2 = Math.min(Math.max(0, taxableAnnual - 5 * uit2026), 15 * uit2026); // De 5 a 20 UIT (14%)
    const tramo3 = Math.min(Math.max(0, taxableAnnual - 20 * uit2026), 15 * uit2026); // De 20 a 35 UIT (17%)
    const tramo4 = Math.min(Math.max(0, taxableAnnual - 35 * uit2026), 10 * uit2026); // De 35 a 45 UIT (20%)
    const tramo5 = Math.max(0, taxableAnnual - 45 * uit2026); // Más de 45 UIT (30%)

    annualTax =
      tramo1 * 0.08 +
      tramo2 * 0.14 +
      tramo3 * 0.17 +
      tramo4 * 0.20 +
      tramo5 * 0.30;
  }

  const fifthCategoryMode = input.fifthCategoryMode ?? 'estimated';
  const fifthCategoryTaxMonthly = fifthCategoryMode === 'manual'
    ? roundTo(Math.max(0, input.manualFifthCategoryTax || 0), 2)
    : fifthCategoryMode === 'none'
      ? 0
      : roundTo(annualTax / 12, 2);
  const totalDeductions = pensionDeduction + fifthCategoryTaxMonthly + otherDeductions;
  const netSalary = roundTo(Math.max(0, totalGrossIncome - totalDeductions), 2);
  const essaludContributionEmployer = roundTo(pensionableIncome * PERU_CONSTANTS.ESSALUD_RATE, 2);

  return {
    grossSalary: roundTo(gross, 2),
    familyAllowance: roundTo(familyAllowance, 2),
    variableRemuneration: roundTo(variableRemuneration, 2),
    nonRemunerativeIncome: roundTo(nonRemunerativeIncome, 2),
    pensionableIncome: roundTo(pensionableIncome, 2),
    totalGrossIncome: roundTo(totalGrossIncome, 2),
    pensionDeduction,
    pensionRate,
    fifthCategoryTaxMonthly,
    otherDeductions: roundTo(otherDeductions, 2),
    totalDeductions: roundTo(totalDeductions, 2),
    netSalary,
    essaludContributionEmployer,
  };
}
