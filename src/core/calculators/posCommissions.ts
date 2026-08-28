import { roundTo } from '../math/formatters';

export type PosGateway = 'yape' | 'niubiz' | 'izipay' | 'culqi' | 'mercadopago' | 'personalizado';

export interface PosCommissionInput {
  amount: number; // Monto a cobrar o recibir (S/)
  gateway: PosGateway; // Pasarela seleccionada
  customRatePercentage?: number; // Tasa personalizada si aplica
  mode: 'deduct_from_sale' | 'add_to_charge'; // 'deduct_from_sale' (cobro S/ 100 y me descuentan) o 'add_to_charge' (quiero recibir S/ 100 limpios)
}

export interface PosCommissionResult {
  chargeAmount: number; // Monto que paga el cliente
  netReceived: number; // Monto que llega a tu cuenta bancaria
  commissionRate: number; // Tasa base (%)
  commissionFeeBeforeTax: number; // Comisión neta
  igvOnCommission: number; // IGV (18%) sobre la comisión
  totalCommissionFee: number; // Comisión total descontada con IGV
  gatewayName: string;
}

export const GATEWAY_RATES: Record<PosGateway, { name: string; rate: number; hasIgv: boolean }> = {
  yape: { name: 'Yape para Empresas', rate: 2.95, hasIgv: true },
  niubiz: { name: 'Niubiz POS / Online', rate: 3.45, hasIgv: true },
  izipay: { name: 'Izipay POS / Link', rate: 3.45, hasIgv: true },
  culqi: { name: 'Culqi Pasarela', rate: 3.79, hasIgv: true },
  mercadopago: { name: 'Mercado Pago Point / Link', rate: 3.99, hasIgv: true },
  personalizado: { name: 'Comisión Personalizada', rate: 3.5, hasIgv: true },
};

/**
 * Calcula las comisiones exactas de cobros digitales con POS y billeteras en Perú.
 */
export function calculatePosCommission(input: PosCommissionInput): PosCommissionResult {
  const info = GATEWAY_RATES[input.gateway] || GATEWAY_RATES.niubiz;
  const rate = input.gateway === 'personalizado' && input.customRatePercentage !== undefined
    ? input.customRatePercentage
    : info.rate;

  const rawAmount = Math.max(0, input.amount || 0);

  // Tasa efectiva con 18% de IGV (En Perú las pasarelas cobran tasa + IGV)
  const effectiveRateWithIgv = (rate * 1.18) / 100;

  let chargeAmount = rawAmount;
  let netReceived = rawAmount;
  let totalCommissionFee = 0;

  if (input.mode === 'deduct_from_sale') {
    // Si cobro S/ 100, me descuentan la comisión
    chargeAmount = rawAmount;
    totalCommissionFee = roundTo(chargeAmount * effectiveRateWithIgv, 2);
    netReceived = roundTo(chargeAmount - totalCommissionFee, 2);
  } else {
    // Si quiero recibir S/ 100 limpios: Monto a Cobrar = Neto / (1 - TasaConIgv)
    chargeAmount = effectiveRateWithIgv < 1 ? roundTo(rawAmount / (1 - effectiveRateWithIgv), 2) : rawAmount;
    totalCommissionFee = roundTo(chargeAmount - rawAmount, 2);
    netReceived = rawAmount;
  }

  const commissionFeeBeforeTax = roundTo(totalCommissionFee / 1.18, 2);
  const igvOnCommission = roundTo(totalCommissionFee - commissionFeeBeforeTax, 2);

  return {
    chargeAmount,
    netReceived,
    commissionRate: rate,
    commissionFeeBeforeTax,
    igvOnCommission,
    totalCommissionFee,
    gatewayName: info.name,
  };
}
