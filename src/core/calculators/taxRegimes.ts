import { roundTo } from '../math/formatters';
import { PERU_CONSTANTS } from '../constants/peru';

export type ClientType = 'final_consumer' | 'businesses_factura' | 'both';
export type ActivityType = 'commerce_trade' | 'services' | 'manufacturing';
export type TaxpayerType = 'natural_person' | 'legal_entity';

export interface TaxRegimesInput {
  estimatedMonthlyRevenue: number; // Ingresos brutos estimados mensuales (S/)
  estimatedMonthlyPurchases: number; // Compras con factura mensuales (S/)
  clientType: ClientType; // Clientes a los que vende
  activityType: ActivityType;
  taxpayerType?: TaxpayerType;
  workerCount?: number;
  /** Utilidad neta mensual estimada (antes de impuesto a la renta). Opcional: permite estimar la regularización anual. */
  estimatedMonthlyProfit?: number;
}

export interface RegimeComparisonItem {
  regimeId: 'rus' | 'rer' | 'rmt' | 'general';
  name: string;
  isEligible: boolean;
  ineligibleReason?: string;
  monthlyIncomeTax: number; // Pago a cuenta mensual de impuesto a la renta
  monthlyIgv: number; // Pago estimado de IGV
  totalMonthlyTax: number; // Renta + IGV
  /** Impuesto a la renta anual estimado (solo si se indicó utilidad). En RMT y General es el impuesto anual del que se descuentan los pagos a cuenta. */
  annualIncomeTax?: number;
  canIssueFactura: boolean;
  annualDeclarationRequired: boolean;
  accountingBooksRequired: string;
  annualRevenueLimitText: string;
}

export interface TaxRegimesResult {
  recommendedRegimeId: 'rus' | 'rer' | 'rmt' | 'general';
  recommendedRegimeName: string;
  recommendedReason: string;
  monthlyEstimatedTax: number;
  regimes: RegimeComparisonItem[];
}

/** Impuesto anual del RMT: 10 % hasta 15 UIT de renta neta y 29.5 % por el exceso. */
export function calculateRmtAnnualIncomeTax(annualNetIncome: number): number {
  const profit = Math.max(0, annualNetIncome || 0);
  const threshold = 15 * PERU_CONSTANTS.CURRENT_UIT;
  return roundTo(Math.min(profit, threshold) * 0.1 + Math.max(0, profit - threshold) * 0.295, 2);
}

/** Impuesto anual del Régimen General: 29.5 % de la renta neta anual. */
export function calculateGeneralAnnualIncomeTax(annualNetIncome: number): number {
  return roundTo(Math.max(0, annualNetIncome || 0) * 0.295, 2);
}

/**
 * Simula y compara los 4 regímenes tributarios de la SUNAT recomendando el más económico y legal para el negocio.
 */
export function calculateTaxRegimes(input: TaxRegimesInput): TaxRegimesResult {
  const rev = Math.max(0, input.estimatedMonthlyRevenue || 0);
  const purchases = Math.max(0, input.estimatedMonthlyPurchases || 0);
  const annualRev = rev * 12;
  const annualPurchases = purchases * 12;
  const workers = Math.max(0, input.workerCount || 1);
  const taxpayerType = input.taxpayerType ?? 'natural_person';
  const profitProvided = Number.isFinite(input.estimatedMonthlyProfit) && Number(input.estimatedMonthlyProfit) > 0;
  // La utilidad no puede superar las ventas del mes
  const annualProfit = profitProvided ? Math.min(Number(input.estimatedMonthlyProfit), rev) * 12 : 0;

  // 1. NUEVO RUS
  const isRusEligible =
    annualRev <= 96000 &&
    annualPurchases <= 96000 &&
    rev <= 8000 &&
    purchases <= 8000 &&
    taxpayerType === 'natural_person' &&
    input.activityType !== 'services' &&
    input.clientType !== 'businesses_factura'; // RUS no puede emitir facturas

  let rusMonthlyTax = 0;
  if (isRusEligible) {
    rusMonthlyTax = rev <= 5000 && purchases <= 5000 ? 20 : 50;
  }

  const rusItem: RegimeComparisonItem = {
    regimeId: 'rus',
    name: 'Nuevo RUS (Régimen Único Simplificado)',
    isEligible: isRusEligible,
    ineligibleReason: !isRusEligible
      ? (taxpayerType === 'legal_entity'
          ? 'El Nuevo RUS está disponible únicamente para personas naturales'
          : input.activityType === 'services'
          ? 'Las actividades profesionales o técnicas descritas no pueden acogerse al Nuevo RUS'
          : input.clientType === 'businesses_factura'
          ? 'Tus clientes te piden factura (el RUS solo emite boletas)'
          : 'Tus ingresos o compras mensuales superan los S/ 8,000 (S/ 96,000 al año)')
      : undefined,
    monthlyIncomeTax: rusMonthlyTax,
    monthlyIgv: 0, // En RUS está incluido en la cuota fija
    totalMonthlyTax: rusMonthlyTax,
    annualIncomeTax: profitProvided && isRusEligible ? roundTo(rusMonthlyTax * 12, 2) : undefined,
    canIssueFactura: false,
    annualDeclarationRequired: false,
    accountingBooksRequired: 'Ninguno (0 libros contables)',
    annualRevenueLimitText: 'Hasta S/ 96,000 / año (S/ 8,000 / mes)',
  };

  // 2. RER (Régimen Especial de Renta)
  const isRerEligible = annualRev <= 525000 && annualPurchases <= 525000 && workers <= 10;
  const igvSales = rev * 0.18;
  const igvPurchases = purchases * 0.18;
  const estimatedIgvPay = Math.max(0, igvSales - igvPurchases);

  const rerMonthlyIncomeTax = rev * 0.015; // 1.5% cuota fija mensual definitiva
  const rerTotalMonthly = rerMonthlyIncomeTax + estimatedIgvPay;

  const rerItem: RegimeComparisonItem = {
    regimeId: 'rer',
    name: 'RER (Régimen Especial de Renta)',
    isEligible: isRerEligible,
    ineligibleReason: !isRerEligible
      ? 'Tus ingresos o compras anuales superan los S/ 525,000 o tienes más de 10 trabajadores por turno'
      : undefined,
    monthlyIncomeTax: roundTo(rerMonthlyIncomeTax, 2),
    monthlyIgv: roundTo(estimatedIgvPay, 2),
    totalMonthlyTax: roundTo(rerTotalMonthly, 2),
    annualIncomeTax: profitProvided ? roundTo(rerMonthlyIncomeTax * 12, 2) : undefined,
    canIssueFactura: true,
    annualDeclarationRequired: false, // En RER los pagos mensuales son cancelatorios
    accountingBooksRequired: '2 Libros (Registro de Compras y Registro de Ventas)',
    annualRevenueLimitText: 'Hasta S/ 525,000 / año',
  };

  // 3. RMT (Régimen MYPE Tributario)
  const rmtAnnualLimit = PERU_CONSTANTS.RMT_MAX_UIT * PERU_CONSTANTS.CURRENT_UIT;
  const rmtReducedPaymentLimit = PERU_CONSTANTS.RMT_REDUCED_PAYMENT_UIT * PERU_CONSTANTS.CURRENT_UIT;
  const isRmtEligible = annualRev <= rmtAnnualLimit;
  // Si ingresos anuales < 300 UIT paga 1% a cuenta mensual de Renta, si no 1.5%
  const rmtRate = annualRev <= rmtReducedPaymentLimit ? 0.01 : 0.015;
  const rmtMonthlyIncomeTax = rev * rmtRate;
  const rmtTotalMonthly = rmtMonthlyIncomeTax + estimatedIgvPay;

  const rmtItem: RegimeComparisonItem = {
    regimeId: 'rmt',
    name: 'RMT (Régimen MYPE Tributario)',
    isEligible: isRmtEligible,
    ineligibleReason: !isRmtEligible ? 'Tus ingresos anuales superan las 1,700 UIT' : undefined,
    monthlyIncomeTax: roundTo(rmtMonthlyIncomeTax, 2),
    monthlyIgv: roundTo(estimatedIgvPay, 2),
    totalMonthlyTax: roundTo(rmtTotalMonthly, 2),
    annualIncomeTax: profitProvided ? calculateRmtAnnualIncomeTax(annualProfit) : undefined,
    canIssueFactura: true,
    annualDeclarationRequired: true,
    accountingBooksRequired: 'Compras, Ventas y Libro Diario simplificado',
    annualRevenueLimitText: `Hasta 1,700 UIT (S/ ${rmtAnnualLimit.toLocaleString('es-PE')} / año)`,
  };

  // 4. Régimen General (RG)
  const rgMonthlyIncomeTax = rev * 0.015;
  const rgTotalMonthly = rgMonthlyIncomeTax + estimatedIgvPay;

  const rgItem: RegimeComparisonItem = {
    regimeId: 'general',
    name: 'Régimen General (RG)',
    isEligible: true,
    monthlyIncomeTax: roundTo(rgMonthlyIncomeTax, 2),
    monthlyIgv: roundTo(estimatedIgvPay, 2),
    totalMonthlyTax: roundTo(rgTotalMonthly, 2),
    annualIncomeTax: profitProvided ? calculateGeneralAnnualIncomeTax(annualProfit) : undefined,
    canIssueFactura: true,
    annualDeclarationRequired: true,
    accountingBooksRequired: 'Contabilidad Completa',
    annualRevenueLimitText: 'Sin límite de ingresos ni compras',
  };

  // Elección del régimen recomendado
  let recommendedRegimeId: 'rus' | 'rer' | 'rmt' | 'general' = 'rmt';
  let recommendedRegimeName = 'RMT (Régimen MYPE Tributario)';
  let recommendedReason = '';
  let monthlyEstimatedTax = rmtTotalMonthly;

  if (isRusEligible) {
    recommendedRegimeId = 'rus';
    recommendedRegimeName = 'Nuevo RUS';
    recommendedReason = `Es la opción más económica para tu volumen de ventas. Solo pagas una cuota fija de S/ ${rusMonthlyTax} al mes (incluye IGV y Renta) y no estás obligado a llevar libros contables ni presentar declaración jurada anual.`;
    monthlyEstimatedTax = rusMonthlyTax;
  } else if (!isRmtEligible) {
    recommendedRegimeId = 'general';
    recommendedRegimeName = 'Régimen General (RG)';
    recommendedReason = 'Tus ingresos anuales estimados superan el límite del RMT (1,700 UIT), por lo que corresponde el Régimen General.';
    monthlyEstimatedTax = rgTotalMonthly;
  } else if (profitProvided) {
    // Con utilidad estimada se compara el impuesto a la renta anual de cada régimen elegible.
    const money = (value: number) => `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const options: Array<{ id: 'rer' | 'rmt' | 'general'; name: string; tax: number; monthly: number }> = [];
    if (isRerEligible) options.push({ id: 'rer', name: 'RER (Régimen Especial)', tax: rerItem.annualIncomeTax ?? 0, monthly: rerTotalMonthly });
    options.push({ id: 'rmt', name: 'Régimen MYPE Tributario (RMT)', tax: rmtItem.annualIncomeTax ?? 0, monthly: rmtTotalMonthly });
    options.push({ id: 'general', name: 'Régimen General (RG)', tax: rgItem.annualIncomeTax ?? 0, monthly: rgTotalMonthly });
    const best = options.reduce((lowest, option) => (option.tax < lowest.tax ? option : lowest), options[0]);

    recommendedRegimeId = best.id;
    recommendedRegimeName = best.name;
    monthlyEstimatedTax = best.monthly;
    recommendedReason =
      `Con una utilidad anual estimada de ${money(annualProfit)}, el impuesto a la renta anual sería: ` +
      options.map((option) => `${option.name.split(' (')[0]} ${money(option.tax)}`).join('; ') +
      `. ${best.name.split(' (')[0]} resulta el más bajo. En RMT y Régimen General los pagos mensuales son pagos a cuenta que se descuentan al regularizar en la declaración anual; en el RER el pago mensual es definitivo.`;
  } else {
    // Si no califica al RUS, se compara RER frente a RMT
    if (isRerEligible && purchases < rev * 0.4) {
      // Si tiene pocas compras con factura, RER con 1.5% sin DJ anual de renta puede ser más simple
      recommendedRegimeId = 'rer';
      recommendedRegimeName = 'RER (Régimen Especial)';
      recommendedReason = 'Te permite emitir facturas y boletas con solo 2 libros contables y sin tener que presentar balance anual de Renta.';
      monthlyEstimatedTax = rerTotalMonthly;
    } else {
      recommendedRegimeId = 'rmt';
      recommendedRegimeName = 'Régimen MYPE Tributario (RMT)';
      recommendedReason = 'El pago a cuenta puede ser 1% mensual mientras no superes 300 UIT y el impuesto anual aplica 10% sobre las primeras 15 UIT de renta neta; el exceso tiene la tasa general vigente.';
      monthlyEstimatedTax = rmtTotalMonthly;
    }
  }

  return {
    recommendedRegimeId,
    recommendedRegimeName,
    recommendedReason,
    monthlyEstimatedTax: roundTo(monthlyEstimatedTax, 2),
    regimes: [rusItem, rerItem, rmtItem, rgItem],
  };
}
