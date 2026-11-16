import { PERU_CONSTANTS } from '../constants/peru';
import { roundTo } from '../math/formatters';

export type PosGateway = 'yape' | 'niubiz' | 'izipay' | 'culqi' | 'mercadopago' | 'personalizado';

export interface PosCommissionInput {
  amount: number; // Monto a cobrar o recibir (S/)
  gateway: PosGateway; // Pasarela seleccionada
  customRatePercentage?: number; // Tasa personalizada si aplica
  customFixedFee?: number; // Cargo fijo por venta personalizado (S/), sin IGV
  mode: 'deduct_from_sale' | 'add_to_charge'; // 'deduct_from_sale' (cobro S/ 100 y me descuentan) o 'add_to_charge' (quiero recibir S/ 100 limpios)
}

export interface PosCommissionResult {
  chargeAmount: number; // Monto que paga el cliente
  netReceived: number; // Monto que llega a tu cuenta bancaria
  commissionRate: number; // Tasa base publicada (%)
  effectiveRatePercentage: number; // Tasa con IGV, si el operador lo aplica (%)
  fixedFee: number; // Cargo fijo por venta (S/), sin IGV
  igvApplies: boolean; // Si la tarifa del operador suma IGV
  commissionFeeBeforeTax: number; // Comisión sin IGV (tasa + cargo fijo)
  igvOnCommission: number; // IGV (18%) sobre la comisión
  totalCommissionFee: number; // Comisión total descontada
  gatewayName: string;
}

export interface GatewayInfo {
  name: string;
  rate: number; // Tasa publicada (%)
  fixedFee: number; // Cargo fijo por venta (S/)
  igvApplies: boolean; // La tarifa publicada se cobra más IGV
}

/**
 * Tarifas referenciales. Fuentes: Yape (2.95 % + IGV) y comparativo de pasarelas de CONIT
 * con tarifas publicadas en octubre de 2026 (Culqi, Mercado Pago, Izipay).
 * Niubiz no publica una tasa online fija: se muestra una tasa referencial editable.
 * El cargo fijo de Culqi (US$ 0.20) se expresa como equivalente aproximado en soles.
 * Cada negocio debe usar la tarifa de su contrato.
 */
export const GATEWAY_RATES: Record<PosGateway, GatewayInfo> = {
  yape: { name: 'Yape para Empresas', rate: 2.95, fixedFee: 0, igvApplies: true },
  niubiz: { name: 'Niubiz (tasa referencial, se negocia)', rate: 3.45, fixedFee: 0, igvApplies: true },
  izipay: { name: 'Izipay POS / Link', rate: 3.44, fixedFee: 0.69, igvApplies: true },
  culqi: { name: 'Culqi Pasarela', rate: 3.44, fixedFee: 0.68, igvApplies: false },
  mercadopago: { name: 'Mercado Pago (cobro al instante)', rate: 3.49, fixedFee: 1, igvApplies: false },
  personalizado: { name: 'Comisión Personalizada', rate: 3.5, fixedFee: 0, igvApplies: true },
};

/**
 * Calcula las comisiones de cobros digitales con POS y billeteras en Perú.
 *
 * Comisión = (monto × tasa + cargo fijo) × (1 + IGV si aplica).
 * Para recibir un neto exacto: cobro = (neto + cargo fijo × k) ÷ (1 − tasa × k), con k = 1.18 o 1.
 */
export function calculatePosCommission(input: PosCommissionInput): PosCommissionResult {
  const info = GATEWAY_RATES[input.gateway] || GATEWAY_RATES.niubiz;
  const customRate = Number(input.customRatePercentage);
  const rate = input.gateway === 'personalizado' && Number.isFinite(customRate) && input.customRatePercentage !== undefined
    ? Math.max(0, customRate)
    : info.rate;

  const isCustom = input.gateway === 'personalizado';
  const fixedFee = isCustom ? Math.max(0, Number(input.customFixedFee) || 0) : info.fixedFee;
  const rawAmount = Math.max(0, input.amount || 0);
  const k = info.igvApplies ? 1 + PERU_CONSTANTS.IGV_RATE : 1;
  const effectiveRate = (rate / 100) * k; // tasa con IGV, en fracción
  const fixedFeeWithTax = fixedFee * k;

  let chargeAmount = rawAmount;
  let netReceived = rawAmount;
  let totalCommissionFee = 0;

  if (input.mode === 'deduct_from_sale') {
    // Si cobro S/ 100, me descuentan la comisión
    totalCommissionFee = roundTo(rawAmount > 0 ? rawAmount * effectiveRate + fixedFeeWithTax : 0, 2);
    netReceived = roundTo(Math.max(0, rawAmount - totalCommissionFee), 2);
  } else {
    // Si quiero recibir S/ 100 limpios
    chargeAmount = effectiveRate < 1 && rawAmount > 0
      ? roundTo((rawAmount + fixedFeeWithTax) / (1 - effectiveRate), 2)
      : rawAmount;
    totalCommissionFee = roundTo(chargeAmount - rawAmount, 2);
    netReceived = rawAmount;
  }

  const commissionFeeBeforeTax = roundTo(totalCommissionFee / k, 2);
  const igvOnCommission = roundTo(totalCommissionFee - commissionFeeBeforeTax, 2);

  return {
    chargeAmount,
    netReceived,
    commissionRate: rate,
    effectiveRatePercentage: roundTo(effectiveRate * 100, 3),
    fixedFee,
    igvApplies: info.igvApplies,
    commissionFeeBeforeTax,
    igvOnCommission,
    totalCommissionFee,
    gatewayName: info.name,
  };
}
