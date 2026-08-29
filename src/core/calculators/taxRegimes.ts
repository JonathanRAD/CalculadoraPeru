import { roundTo } from '../math/formatters';

export type ClientType = 'final_consumer' | 'businesses_factura' | 'both';
export type ActivityType = 'commerce_trade' | 'services' | 'manufacturing';

export interface TaxRegimesInput {
  estimatedMonthlyRevenue: number; // Ingresos brutos estimados mensuales (S/)
  estimatedMonthlyPurchases: number; // Compras con factura mensuales (S/)
  clientType: ClientType; // Clientes a los que vende
  activityType: ActivityType;
  workerCount?: number;
}

export interface RegimeComparisonItem {
  regimeId: 'rus' | 'rer' | 'rmt' | 'general';
  name: string;
  isEligible: boolean;
  ineligibleReason?: string;
  monthlyIncomeTax: number; // Pago a cuenta mensual de impuesto a la renta
  monthlyIgv: number; // Pago estimado de IGV
  totalMonthlyTax: number; // Renta + IGV
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

/**
 * Simula y compara los 4 regímenes tributarios de la SUNAT recomendando el más económico y legal para el negocio.
 */
export function calculateTaxRegimes(input: TaxRegimesInput): TaxRegimesResult {
  const rev = Math.max(0, input.estimatedMonthlyRevenue || 0);
  const purchases = Math.max(0, input.estimatedMonthlyPurchases || 0);
  const annualRev = rev * 12;
  const annualPurchases = purchases * 12;
  const workers = Math.max(0, input.workerCount || 1);

  // 1. NUEVO RUS
  const isRusEligible =
    annualRev <= 96000 &&
    annualPurchases <= 96000 &&
    rev <= 8000 &&
    purchases <= 8000 &&
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
      ? (input.clientType === 'businesses_factura'
          ? 'Tus clientes te piden factura (el RUS solo emite boletas)'
          : 'Tus ingresos o compras mensuales superan los S/ 8,000 (S/ 96,000 al año)')
      : undefined,
    monthlyIncomeTax: rusMonthlyTax,
    monthlyIgv: 0, // En RUS está incluido en la cuota fija
    totalMonthlyTax: rusMonthlyTax,
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
      ? 'Tus ingresos o compras anuales superan los S/ 525,000 o tienes más de 10 trabajadores'
      : undefined,
    monthlyIncomeTax: roundTo(rerMonthlyIncomeTax, 2),
    monthlyIgv: roundTo(estimatedIgvPay, 2),
    totalMonthlyTax: roundTo(rerTotalMonthly, 2),
    canIssueFactura: true,
    annualDeclarationRequired: false, // En RER los pagos mensuales son cancelatorios
    accountingBooksRequired: '2 Libros (Registro de Compras y Registro de Ventas)',
    annualRevenueLimitText: 'Hasta S/ 525,000 / año',
  };

  // 3. RMT (Régimen MYPE Tributario)
  // Tope: 1,700 UIT (S/ 8.75M)
  const isRmtEligible = annualRev <= 8755000;
  // Si ingresos anuales < 300 UIT paga 1% a cuenta mensual de Renta, si no 1.5%
  const rmtRate = annualRev <= 1545000 ? 0.01 : 0.015;
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
    canIssueFactura: true,
    annualDeclarationRequired: true,
    accountingBooksRequired: 'Compras, Ventas y Libro Diario simplificado',
    annualRevenueLimitText: 'Hasta 1,700 UIT (S/ 8,755,000 / año)',
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
  } else if (input.clientType === 'businesses_factura' || input.clientType === 'both') {
    // Si emite facturas
    if (isRerEligible && purchases < rev * 0.4) {
      // Si tiene pocas compras con factura, RER con 1.5% sin DJ anual de renta puede ser más simple
      recommendedRegimeId = 'rer';
      recommendedRegimeName = 'RER (Régimen Especial)';
      recommendedReason = 'Te permite emitir facturas y boletas con solo 2 libros contables y sin tener que presentar balance anual de Renta.';
      monthlyEstimatedTax = rerTotalMonthly;
    } else {
      recommendedRegimeId = 'rmt';
      recommendedRegimeName = 'Régimen MYPE Tributario (RMT)';
      recommendedReason = 'Pagas solo el 1% de pago a cuenta mensual de Renta y una tasa reducida del 10% anual sobre tus utilidades netas reales deduciendo todos tus gastos operativos.';
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
