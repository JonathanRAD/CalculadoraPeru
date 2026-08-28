import { roundTo } from '../math/formatters';

export type PensionSystem = 'onp' | 'afp_integra' | 'afp_prima' | 'afp_profuturo' | 'afp_habitat';

export interface PayrollInput {
  grossSalary: number; // Sueldo bruto mensual (S/)
  pensionSystem: PensionSystem; // ONP o AFP
  hasDependents?: boolean; // Hijos / Asignación familiar
}

export interface PayrollResult {
  grossSalary: number; // Sueldo bruto
  familyAllowance: number; // Asignación familiar (10% de RMV: S/ 102.50)
  totalGrossIncome: number; // Total ingresos imponibles
  pensionDeduction: number; // Descuento ONP o AFP
  pensionRate: number; // Tasa porcentual efectiva del descuento de pensión (%)
  fifthCategoryTaxMonthly: number; // Retención mensual estimada de 5ta Categoría
  netSalary: number; // Sueldo neto a recibir en cuenta
  essaludContributionEmployer: number; // Aporte de EsSalud 9% a cargo del empleador
}

// Tasas referenciales AFP Perú (Aporte obligatorio 10% + Seguro de invalidez ~1.84% + Comisión sobre flujo)
const PENSION_RATES: Record<PensionSystem, { rate: number; name: string }> = {
  onp: { rate: 13.0, name: 'ONP (13.0%)' },
  afp_integra: { rate: 12.68, name: 'AFP Integra (~12.68%)' },
  afp_prima: { rate: 12.78, name: 'AFP Prima (~12.78%)' },
  afp_profuturo: { rate: 12.89, name: 'AFP Profuturo (~12.89%)' },
  afp_habitat: { rate: 12.67, name: 'AFP Habitat (~12.67%)' },
};

/**
 * Calcula el Sueldo Neto mensual en Perú deduciendo aportes de pensión (AFP/ONP) y 5ta categoría.
 */
export function calculateNetSalary(input: PayrollInput): PayrollResult {
  const gross = Math.max(0, input.grossSalary || 0);
  const familyAllowance = input.hasDependents ? 102.5 : 0; // 10% de RMV vigente
  const totalGrossIncome = gross + familyAllowance;

  // Deducción previsional (AFP o ONP)
  const pensionInfo = PENSION_RATES[input.pensionSystem] || PENSION_RATES.onp;
  const pensionDeduction = roundTo((totalGrossIncome * pensionInfo.rate) / 100, 2);

  // Estimación Impuesto a la Renta de 5ta Categoría (SUNAT)
  // Proyección anual: (12 sueldos + 2 gratificaciones) - 7 UIT
  const annualIncome = totalGrossIncome * 14;
  const uit2026 = 5350;
  const exempt7Uit = 7 * uit2026; // S/ 37,450 no afectos
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

  const fifthCategoryTaxMonthly = roundTo(annualTax / 12, 2);
  const netSalary = roundTo(totalGrossIncome - pensionDeduction - fifthCategoryTaxMonthly, 2);
  const essaludContributionEmployer = roundTo(totalGrossIncome * 0.09, 2);

  return {
    grossSalary: roundTo(gross, 2),
    familyAllowance: roundTo(familyAllowance, 2),
    totalGrossIncome: roundTo(totalGrossIncome, 2),
    pensionDeduction,
    pensionRate: pensionInfo.rate,
    fifthCategoryTaxMonthly,
    netSalary,
    essaludContributionEmployer,
  };
}
