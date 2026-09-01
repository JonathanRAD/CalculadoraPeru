import { describe, expect, it } from 'vitest';
import { PERU_CONSTANTS } from '@/core/constants/peru';
import { calculateCts } from '@/core/calculators/cts';
import { calculateExchangeRate } from '@/core/calculators/exchangeRate';
import { calculateHonorarios } from '@/core/calculators/honorarios';
import { analyzeAtypicalSchedule } from '@/core/calculators/overtime';
import { calculateNetSalary } from '@/core/calculators/payroll';
import { calculateSeverancePay } from '@/core/calculators/severancePay';
import { calculateTaxRegimes } from '@/core/calculators/taxRegimes';

describe('parámetros regulatorios 2026', () => {
  it('usa UIT S/ 5,500 y asignación familiar S/ 113', () => {
    expect(PERU_CONSTANTS.CURRENT_UIT).toBe(5500);
    expect(PERU_CONSTANTS.FAMILY_ALLOWANCE).toBe(113);
  });

  it('calcula ONP y asignación familiar sobre la remuneración asegurable', () => {
    const result = calculateNetSalary({
      grossSalary: 1130,
      pensionSystem: 'onp',
      hasDependents: true,
    });

    expect(result.totalGrossIncome).toBe(1243);
    expect(result.pensionDeduction).toBe(161.59);
    expect(result.fifthCategoryTaxMonthly).toBe(0);
    expect(result.netSalary).toBe(1081.41);
  });

  it('aplica la tasa AFP Prima sobre flujo publicada para julio de 2026', () => {
    const result = calculateNetSalary({ grossSalary: 3000, pensionSystem: 'afp_prima' });
    expect(result.pensionRate).toBeCloseTo(12.97, 5);
    expect(result.pensionDeduction).toBe(389.1);
  });

  it('aplica 11.37% al sueldo para afiliados en comisión mixta/saldo', () => {
    const result = calculateNetSalary({
      grossSalary: 3000,
      pensionSystem: 'afp_prima',
      afpCommissionScheme: 'balance',
    });
    expect(result.pensionRate).toBeCloseTo(11.37, 5);
    expect(result.pensionDeduction).toBe(341.1);
  });

  it('separa ingresos afectos, no remunerativos y otros descuentos', () => {
    const result = calculateNetSalary({
      grossSalary: 2000,
      pensionSystem: 'onp',
      variableRemuneration: 500,
      nonRemunerativeIncome: 100,
      otherDeductions: 50,
      fifthCategoryMode: 'none',
    });
    expect(result.pensionableIncome).toBe(2500);
    expect(result.totalGrossIncome).toBe(2600);
    expect(result.pensionDeduction).toBe(325);
    expect(result.totalDeductions).toBe(375);
    expect(result.netSalary).toBe(2225);
  });

  it('permite usar la retención exacta de quinta categoría de la boleta', () => {
    const result = calculateNetSalary({
      grossSalary: 6000,
      pensionSystem: 'onp',
      fifthCategoryMode: 'manual',
      manualFifthCategoryTax: 275.5,
    });
    expect(result.fifthCategoryTaxMonthly).toBe(275.5);
  });
});

describe('beneficios laborales', () => {
  it('mantiene consistente la CTS de pequeña empresa', () => {
    const standalone = calculateCts({
      baseSalary: 3000,
      monthsWorkedInSemester: 6,
      companyRegime: 'pequena_empresa',
    });
    const settlement = calculateSeverancePay({
      baseSalary: 3000,
      monthsInLastSemesterCts: 6,
      monthsInLastSemesterGrati: 0,
      monthsInLastYearVacations: 0,
      laborRegime: 'pequena_empresa',
      separationReason: 'renuncia',
    });

    expect(standalone.totalComputableBasis).toBe(3250);
    expect(standalone.ctsAmountToDeposit).toBe(812.5);
    expect(settlement.computableSalaryForCts).toBe(3250);
    expect(settlement.truncatedCts).toBe(812.5);
  });
});

describe('tributación', () => {
  it('respeta el límite 2026 de 1,700 UIT para el RMT', () => {
    const belowLimit = calculateTaxRegimes({
      estimatedMonthlyRevenue: 770000,
      estimatedMonthlyPurchases: 0,
      clientType: 'businesses_factura',
      activityType: 'services',
      taxpayerType: 'legal_entity',
    });
    const aboveLimit = calculateTaxRegimes({
      estimatedMonthlyRevenue: 780000,
      estimatedMonthlyPurchases: 0,
      clientType: 'businesses_factura',
      activityType: 'services',
      taxpayerType: 'legal_entity',
    });

    expect(belowLimit.regimes.find((item) => item.regimeId === 'rmt')?.isEligible).toBe(true);
    expect(aboveLimit.regimes.find((item) => item.regimeId === 'rmt')?.isEligible).toBe(false);
  });

  it('no recomienda Nuevo RUS a una persona jurídica', () => {
    const result = calculateTaxRegimes({
      estimatedMonthlyRevenue: 3000,
      estimatedMonthlyPurchases: 1000,
      clientType: 'final_consumer',
      activityType: 'commerce_trade',
      taxpayerType: 'legal_entity',
    });
    expect(result.regimes.find((item) => item.regimeId === 'rus')?.isEligible).toBe(false);
  });

  it('no recomienda Nuevo RUS para servicios profesionales o técnicos', () => {
    const result = calculateTaxRegimes({
      estimatedMonthlyRevenue: 3000,
      estimatedMonthlyPurchases: 500,
      clientType: 'final_consumer',
      activityType: 'services',
      taxpayerType: 'natural_person',
    });
    expect(result.regimes.find((item) => item.regimeId === 'rus')?.isEligible).toBe(false);
  });

  it('aplica retención de cuarta categoría solo cuando supera S/ 1,500', () => {
    expect(calculateHonorarios({ grossAmount: 1500 }).retentionAmount).toBe(0);
    expect(calculateHonorarios({ grossAmount: 1501 }).retentionAmount).toBe(120.08);
  });
});

describe('tipo de cambio', () => {
  it('convierte usando las tasas recibidas sin fabricar spreads', () => {
    const result = calculateExchangeRate({
      amount: 100,
      conversionMode: 'usd_to_pen',
      source: 'sbs',
      customBuyRate: 3.4,
      customSellRate: 3.41,
    });
    expect(result.convertedAmount).toBe(340);
    expect(result.spreadDifference).toBe(0.01);
  });

  it('recalcula automáticamente al invertir de soles a dólares', () => {
    const result = calculateExchangeRate({
      amount: 336,
      conversionMode: 'pen_to_usd',
      source: 'market',
      customBuyRate: 3.36,
      customSellRate: 3.36,
    });
    expect(result.convertedAmount).toBe(100);
  });

  it('no inventa una conversión cuando falta una tasa', () => {
    const result = calculateExchangeRate({
      amount: 100,
      conversionMode: 'pen_to_usd',
      source: 'custom',
      customBuyRate: 3.36,
      customSellRate: 0,
    });
    expect(result.convertedAmount).toBe(0);
  });
});

describe('jornadas acumulativas o atípicas', () => {
  it('considera un rol 14x14 de 12 horas dentro del promedio general', () => {
    const result = analyzeAtypicalSchedule({ workDays: 14, restDays: 14, hoursPerShift: 12 });
    expect(result.averageWeeklyHours).toBe(42);
    expect(result.excessHoursPerCycle).toBe(0);
    expect(result.isWithinGeneralWeeklyLimit).toBe(true);
  });

  it('advierte que un rol 14x7 de 12 horas supera el promedio general', () => {
    const result = analyzeAtypicalSchedule({ workDays: 14, restDays: 7, hoursPerShift: 12 });
    expect(result.averageWeeklyHours).toBe(56);
    expect(result.excessHoursPerCycle).toBe(24);
    expect(result.isWithinGeneralWeeklyLimit).toBe(false);
  });

  it('evalúa la duración del turno y no solo el nombre del rol', () => {
    const result = analyzeAtypicalSchedule({ workDays: 14, restDays: 7, hoursPerShift: 10 });
    expect(result.averageWeeklyHours).toBe(46.67);
    expect(result.isWithinGeneralWeeklyLimit).toBe(true);
  });
});
