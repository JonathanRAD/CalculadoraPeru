import { describe, expect, it } from 'vitest';
import { calculateNetSalary } from '../payroll';
import { calculateCts } from '../cts';
import { calculateGratification } from '../gratification';
import { calculateVacations } from '../vacations';
import { calculateSeverancePay } from '../severancePay';
import { calculateOvertime } from '../overtime';
import { calculateHonorarios } from '../honorarios';
import { calculateIgv } from '../tax';
import { calculateTaxRegimes } from '../taxRegimes';
import { calculateLoan } from '../loan';
import { calculateCompoundInterest } from '../compoundInterest';
import { calculateRoi } from '../roi';
import { calculateBreakEven } from '../breakeven';
import { calculateProfitMargin } from '../margin';
import { calculateSalePrice } from '../pricing';
import { calculateDiscount } from '../discounts';
import { calculateTargetSales } from '../targetSales';
import { calculateSplitBill } from '../splitBill';
import { calculateProfitPerProduct } from '../profitPerProduct';
import { calculateRecipeCost } from '../recipeCost';
import { calculateExchangeRate } from '../exchangeRate';
import { calculateFuelCost } from '../fuel';
import { calculateElectricity } from '../electricity';
import { calculatePosCommission } from '../posCommissions';

type AnyRecord = Record<string, unknown>;

const CASES: Array<[string, (input: never) => unknown, AnyRecord]> = [
  ['payroll', calculateNetSalary as never, { grossSalary: 3000, pensionSystem: 'afp_integra', hasDependents: true, variableRemuneration: 200, otherDeductions: 50 }],
  ['cts', calculateCts as never, { baseSalary: 2400, monthsWorkedInSemester: 6, companyRegime: 'general', hasFamilyAllowance: true }],
  ['gratification', calculateGratification as never, { baseSalary: 2400, monthsWorkedInSemester: 6, companyRegime: 'general', healthInsurance: 'essalud' }],
  ['vacations', calculateVacations as never, { baseSalary: 2400, monthsWorked: 8, daysWorked: 10, companyRegime: 'general', daysToSell: 5 }],
  ['severance', calculateSeverancePay as never, {
    baseSalary: 2400, monthsInLastSemesterCts: 4, daysInLastSemesterCts: 10, monthsInLastSemesterGrati: 4,
    monthsInLastYearVacations: 8, daysInLastYearVacations: 5, laborRegime: 'general', separationReason: 'despido_arbitrario',
    totalYearsWorkedForIndemnity: 3, totalMonthsWorkedForIndemnity: 4,
  }],
  ['overtime', calculateOvertime as never, { baseMonthlySalary: 2400, hoursFirstTwo: 10, hoursAfterTwo: 5, holidayHours: 8 }],
  ['honorarios', calculateHonorarios as never, { grossAmount: 3000 }],
  ['igv', calculateIgv as never, { amount: 118, mode: 'extract_igv' }],
  ['taxRegimes', calculateTaxRegimes as never, { estimatedMonthlyRevenue: 20000, estimatedMonthlyPurchases: 8000, clientType: 'both', activityType: 'commerce_trade', workerCount: 3 }],
  ['loan', calculateLoan as never, { loanAmount: 20000, annualInterestRate: 20, termMonths: 24, monthlyInsuranceRate: 0.08 }],
  ['compoundInterest', calculateCompoundInterest as never, { initialPrincipal: 1000, monthlyContribution: 200, annualRatePercentage: 6, years: 5 }],
  ['roi', calculateRoi as never, { initialInvestment: 15000, monthlyNetProfit: 1200, expectedDurationMonths: 12 }],
  ['breakeven', calculateBreakEven as never, { fixedCosts: 1000, salePricePerUnit: 50, variableCostPerUnit: 30 }],
  ['margin', calculateProfitMargin as never, { salePrice: 100, cost: 80, priceIncludesIgv: true }],
  ['pricing', calculateSalePrice as never, { cost: 60, marginPercentage: 30, includeIgv: true, salesCommissionPercentage: 3.5, otherCosts: 2 }],
  ['discounts', calculateDiscount as never, { originalPrice: 200, discount1: 20, discount2: 10 }],
  ['targetSales', calculateTargetSales as never, { targetNetProfit: 2000, fixedMonthlyCosts: 1000, unitSalePrice: 50, unitVariableCost: 30 }],
  ['splitBill', calculateSplitBill as never, { totalBill: 240, tipPercentage: 10, numberOfPeople: 4 }],
  ['profitPerProduct', calculateProfitPerProduct as never, { costPrice: 20, salePrice: 35, estimatedMonthlyUnits: 100, advertisingCostPerUnit: 3 }],
  ['recipeCost', calculateRecipeCost as never, { ingredientsTotalCost: 40, portionsYield: 4, wastePercentage: 5, laborAndPackagingPerPortion: 1, desiredMarginPercentage: 60 }],
  ['exchangeRate', calculateExchangeRate as never, { amount: 100, conversionMode: 'usd_to_pen', source: 'custom', customBuyRate: 3.5, customSellRate: 3.6 }],
  ['fuel', calculateFuelCost as never, { distanceKm: 300, efficiencyKmPerGallon: 40, fuelPricePerUnit: 18, numberOfPassengers: 4, isRoundTrip: true }],
  ['electricity', calculateElectricity as never, { powerWatts: 1200, hoursPerDay: 5, daysPerMonth: 30, kwhRate: 0.75 }],
  ['posCommissions', calculatePosCommission as never, { amount: 100, gateway: 'yape', mode: 'add_to_charge' }],
];

const EDGE_VALUES: Array<[string, number]> = [
  ['cero', 0],
  ['negativo', -5],
  ['NaN', Number.NaN],
  ['enorme', 1e12],
];

function collectNonFinite(value: unknown, path: string, found: string[]) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) found.push(`${path}=${value}`);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => collectNonFinite(item, `${path}[${index}]`, found));
  } else if (value && typeof value === 'object') {
    for (const [key, inner] of Object.entries(value as AnyRecord)) collectNonFinite(inner, `${path}.${key}`, found);
  }
}

describe('casos límite: ninguna calculadora devuelve NaN o Infinity', () => {
  for (const [name, fn, base] of CASES) {
    it(`${name}: resultado base finito`, () => {
      const found: string[] = [];
      collectNonFinite(fn(base as never), name, found);
      expect(found).toEqual([]);
    });

    for (const [field, original] of Object.entries(base)) {
      if (typeof original !== 'number') continue;
      for (const [label, edge] of EDGE_VALUES) {
        it(`${name}.${field} = ${label}`, () => {
          const found: string[] = [];
          collectNonFinite(fn({ ...base, [field]: edge } as never), name, found);
          expect(found).toEqual([]);
        });
      }
    }
  }
});

describe('valores en cero ingresados por el usuario se respetan', () => {
  it('préstamo con seguro de desgravamen en 0 % no aplica el valor por defecto', () => {
    const withoutInsurance = calculateLoan({ loanAmount: 10000, annualInterestRate: 20, termMonths: 12, monthlyInsuranceRate: 0 });
    expect(withoutInsurance.totalInsurancePaid).toBe(0);
  });
});

describe('comparador de regímenes', () => {
  it('siempre explica la recomendación, también para clientes de consumidor final', () => {
    const result = calculateTaxRegimes({
      estimatedMonthlyRevenue: 30000,
      estimatedMonthlyPurchases: 10000,
      clientType: 'final_consumer',
      activityType: 'commerce_trade',
      workerCount: 2,
    });
    expect(result.recommendedReason.length).toBeGreaterThan(20);
  });
});
