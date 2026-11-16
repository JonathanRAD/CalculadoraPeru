import { describe, expect, it } from 'vitest';
import { calculateVacations } from '@/core/calculators/vacations';
import { PERU_CONSTANTS, getIgvIpmSplit } from '@/core/constants/peru';
import { calculateCts } from '@/core/calculators/cts';
import { calculateExchangeRate } from '@/core/calculators/exchangeRate';
import { calculateGratification } from '@/core/calculators/gratification';
import { calculatePosCommission } from '@/core/calculators/posCommissions';
import { calculateHonorarios } from '@/core/calculators/honorarios';
import { calculateCompleteGratificationMonths } from '@/core/calculators/laborPeriods';
import { analyzeAtypicalSchedule } from '@/core/calculators/overtime';
import { calculateNetSalary } from '@/core/calculators/payroll';
import { calculateSeverancePay } from '@/core/calculators/severancePay';
import { calculateGeneralAnnualIncomeTax, calculateRmtAnnualIncomeTax, calculateTaxRegimes } from '@/core/calculators/taxRegimes';

describe('parámetros regulatorios 2026', () => {
  it('usa UIT S/ 5,500 y asignación familiar S/ 123', () => {
    expect(PERU_CONSTANTS.CURRENT_UIT).toBe(5500);
    expect(PERU_CONSTANTS.FAMILY_ALLOWANCE).toBe(123);
  });

  it('calcula ONP y asignación familiar sobre la remuneración asegurable', () => {
    const result = calculateNetSalary({
      grossSalary: 1230,
      pensionSystem: 'onp',
      hasDependents: true,
    });

    expect(result.totalGrossIncome).toBe(1353);
    expect(result.pensionDeduction).toBe(175.89);
    expect(result.fifthCategoryTaxMonthly).toBe(0);
    expect(result.netSalary).toBe(1177.11);
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
  it('cuenta solo meses calendario completos para la gratificación trunca', () => {
    expect(calculateCompleteGratificationMonths('2026-07-01', '2026-09-30')).toBe(3);
    expect(calculateCompleteGratificationMonths('2026-07-15', '2026-09-30')).toBe(2);
    expect(calculateCompleteGratificationMonths('2025-01-01', '2026-09-15')).toBe(2);
  });

  it('respeta los límites de ambos semestres de gratificación', () => {
    expect(calculateCompleteGratificationMonths('2026-01-01', '2026-06-30')).toBe(6);
    expect(calculateCompleteGratificationMonths('2025-02-10', '2026-07-31')).toBe(1);
    expect(calculateCompleteGratificationMonths('2026-07-15', '2026-09-15')).toBe(1);
    expect(calculateCompleteGratificationMonths('2026-07-01', '2026-07-15')).toBe(0);
  });

  it('rechaza fechas inválidas y rangos laborales invertidos', () => {
    expect(calculateCompleteGratificationMonths('2026-09-01', '2026-08-31')).toBeNull();
    expect(calculateCompleteGratificationMonths('2026-02-30', '2026-08-31')).toBeNull();
  });

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

describe('quinta categoría incluye la bonificación extraordinaria (Ley 30334)', () => {
  it('proyecta 12 sueldos, 2 gratificaciones y 9 % de bonificación menos 7 UIT', () => {
    // 3,000 × 14 + 540 = 42,540; menos 38,500 = 4,040; × 8 % = 323.20; ÷ 12 = 26.93
    const result = calculateNetSalary({ grossSalary: 3000, pensionSystem: 'onp' });
    expect(result.pensionDeduction).toBe(390);
    expect(result.fifthCategoryTaxMonthly).toBe(26.93);
    expect(result.netSalary).toBe(2583.07);
  });
});

describe('régimen MYPE no retroactivo (contratados antes de la inscripción en REMYPE)', () => {
  const cts = { baseSalary: 2400, hasFamilyAllowance: true, monthsWorkedInSemester: 6 } as const;

  it('CTS: el contratado antes de la inscripción conserva el régimen general', () => {
    const general = calculateCts({ ...cts, companyRegime: 'general' });
    const smallBefore = calculateCts({ ...cts, companyRegime: 'pequena_empresa', hiredBeforeRemype: true });
    const microBefore = calculateCts({ ...cts, companyRegime: 'microempresa', hiredBeforeRemype: true });
    expect(smallBefore.ctsAmountToDeposit).toBe(general.ctsAmountToDeposit);
    expect(microBefore.ctsAmountToDeposit).toBe(general.ctsAmountToDeposit);
  });

  it('CTS: el contratado después aplica 50 % en pequeña empresa y 0 en microempresa', () => {
    const general = calculateCts({ ...cts, companyRegime: 'general' });
    const small = calculateCts({ ...cts, companyRegime: 'pequena_empresa' });
    const micro = calculateCts({ ...cts, companyRegime: 'microempresa' });
    expect(small.ctsAmountToDeposit).toBeLessThan(general.ctsAmountToDeposit);
    expect(micro.ctsAmountToDeposit).toBe(0);
  });

  it('gratificación: el contratado antes conserva una remuneración completa', () => {
    const base = { baseSalary: 2400, hasFamilyAllowance: true, monthsWorkedInSemester: 6, healthInsurance: 'essalud' } as const;
    const general = calculateGratification({ ...base, companyRegime: 'general' });
    const smallBefore = calculateGratification({ ...base, companyRegime: 'pequena_empresa', hiredBeforeRemype: true });
    const small = calculateGratification({ ...base, companyRegime: 'pequena_empresa' });
    expect(smallBefore.rawGratification).toBe(general.rawGratification);
    expect(small.rawGratification).toBe(1261.5);
    expect(general.rawGratification).toBe(2523);
  });

  it('liquidación: el contratado antes de la inscripción conserva el régimen general', () => {
    const input = {
      baseSalary: 2400, hasFamilyAllowance: true, monthsInLastSemesterCts: 6, monthsInLastSemesterGrati: 6,
      monthsInLastYearVacations: 12, separationReason: 'despido_arbitrario', totalYearsWorkedForIndemnity: 2,
    } as const;
    const general = calculateSeverancePay({ ...input, laborRegime: 'general' });
    const before = calculateSeverancePay({ ...input, laborRegime: 'microempresa', hiredBeforeRemype: true });
    expect(before.totalSettlement).toBe(general.totalSettlement);
  });
});

describe('comisiones de cobro con cargo fijo e IGV según operador', () => {
  it('Yape: 2.95 % + IGV sobre S/ 100 deja S/ 96.52', () => {
    const result = calculatePosCommission({ amount: 100, gateway: 'yape', mode: 'deduct_from_sale' });
    expect(result.totalCommissionFee).toBe(3.48);
    expect(result.netReceived).toBe(96.52);
  });

  it('Izipay: 3.44 % + S/ 0.69, más IGV, sobre S/ 200 cuesta S/ 8.93 (comparativo CONIT)', () => {
    const result = calculatePosCommission({ amount: 200, gateway: 'izipay', mode: 'deduct_from_sale' });
    expect(result.totalCommissionFee).toBe(8.93);
  });

  it('Mercado Pago: 3.49 % + S/ 1.00 sin IGV sobre S/ 200 cuesta S/ 7.98 (comparativo CONIT)', () => {
    const result = calculatePosCommission({ amount: 200, gateway: 'mercadopago', mode: 'deduct_from_sale' });
    expect(result.totalCommissionFee).toBe(7.98);
    expect(result.igvOnCommission).toBe(0);
  });

  it('cobrar para recibir un neto: el neto que resulta coincide con el deseado', () => {
    for (const gateway of ['yape', 'izipay', 'culqi', 'mercadopago'] as const) {
      const charge = calculatePosCommission({ amount: 100, gateway, mode: 'add_to_charge' });
      const check = calculatePosCommission({ amount: charge.chargeAmount, gateway, mode: 'deduct_from_sale' });
      expect(Math.abs(check.netReceived - 100)).toBeLessThanOrEqual(0.02);
    }
  });

  it('comisión personalizada usa la tasa y el cargo fijo ingresados', () => {
    const result = calculatePosCommission({
      amount: 100, gateway: 'personalizado', mode: 'deduct_from_sale', customRatePercentage: 2, customFixedFee: 0.5,
    });
    // (100 × 2 % + 0.50) × 1.18 = 2.95
    expect(result.totalCommissionFee).toBe(2.95);
  });
});

describe('regularización anual: RMT frente a Régimen General y RER', () => {
  it('RMT: 10 % hasta 15 UIT y 29.5 % por el exceso', () => {
    // 15 UIT = 82,500. Utilidad de 100,000: 8,250 + 17,500 × 29.5 % = 13,412.50
    expect(calculateRmtAnnualIncomeTax(100000)).toBe(13412.5);
    expect(calculateRmtAnnualIncomeTax(60000)).toBe(6000);
    expect(calculateGeneralAnnualIncomeTax(60000)).toBe(17700);
  });

  it('con utilidad baja conviene RMT; con utilidad alta sobre ventas conviene RER', () => {
    const base = {
      estimatedMonthlyRevenue: 20000,
      estimatedMonthlyPurchases: 8000,
      clientType: 'both',
      activityType: 'commerce_trade',
      workerCount: 3,
    } as const;
    const low = calculateTaxRegimes({ ...base, estimatedMonthlyProfit: 1000 });
    expect(low.recommendedRegimeId).toBe('rmt');
    expect(low.regimes.find((item) => item.regimeId === 'rmt')?.annualIncomeTax).toBe(1200);

    const high = calculateTaxRegimes({ ...base, estimatedMonthlyProfit: 5000 });
    expect(high.regimes.find((item) => item.regimeId === 'rer')?.annualIncomeTax).toBe(3600);
    expect(high.recommendedRegimeId).toBe('rer');
    expect(high.recommendedReason).toContain('pagos a cuenta');
  });

  it('sin utilidad indicada no se calcula impuesto anual', () => {
    const result = calculateTaxRegimes({
      estimatedMonthlyRevenue: 20000,
      estimatedMonthlyPurchases: 8000,
      clientType: 'both',
      activityType: 'commerce_trade',
    });
    expect(result.regimes.every((item) => item.annualIncomeTax === undefined)).toBe(true);
  });
});

describe('vacaciones y régimen MYPE', () => {
  it('pequeña empresa: 15 días; si fue contratado antes de la inscripción, conserva 30', () => {
    const base = { baseSalary: 2400, monthsWorked: 12, companyRegime: 'pequena_empresa' } as const;
    const mype = calculateVacations(base);
    const before = calculateVacations({ ...base, hiredBeforeRemype: true });
    const general = calculateVacations({ ...base, companyRegime: 'general' });
    expect(mype.annualVacationDays).toBe(15);
    expect(before.annualVacationDays).toBe(30);
    expect(before.totalPay).toBe(general.totalPay);
  });
});

describe('reparto del IGV entre IGV e IPM (Ley 32387)', () => {
  it('2026: 15.5 % de IGV y 2.5 % de IPM suman el 18 %', () => {
    const split = getIgvIpmSplit(2026);
    expect(split).toEqual({ igv: 0.155, ipm: 0.025 });
    expect(Math.round((split.igv + split.ipm) * 1000) / 1000).toBe(PERU_CONSTANTS.IGV_RATE);
  });

  it('2027 y 2028 mantienen el total en 18 %', () => {
    for (const year of [2027, 2028, 2030]) {
      const split = getIgvIpmSplit(year);
      expect(Math.round((split.igv + split.ipm) * 1000) / 1000, String(year)).toBe(0.18);
    }
    expect(getIgvIpmSplit(2027)).toEqual({ igv: 0.15, ipm: 0.03 });
  });
});
