import { PERU_CONSTANTS } from '../constants/peru';
import { roundTo } from '../math/formatters';

export type IgvCalculationMode = 'add_igv' | 'extract_igv';

export interface IgvInput {
  amount: number; // Monto ingresado (S/)
  mode: IgvCalculationMode; // 'add_igv' (Base Imponible -> Calcular IGV y Total) | 'extract_igv' (Total Facturado -> Extraer Subtotal e IGV)
  customIgvRate?: number; // Tasa de IGV (por defecto 18%)
}

export interface IgvResult {
  baseAmount: number; // Subtotal / Base Imponible (S/)
  igvAmount: number; // Monto del Impuesto General a las Ventas (18%)
  totalAmount: number; // Monto Total a cobrar/facturar (S/)
  mode: IgvCalculationMode;
  rateApplied: number;
}

/**
 * Calcula o Extrae el IGV (18%) conforme a las directivas de SUNAT Perú.
 * 
 * Fórmulas:
 * - Modo Directo: IGV = Base * 0.18 | Total = Base + IGV
 * - Modo Inverso: Base = Total / 1.18 | IGV = Total - Base
 */
export function calculateIgv(input: IgvInput): IgvResult {
  const amount = Math.max(0, input.amount || 0);
  const rate = input.customIgvRate && input.customIgvRate > 0 ? input.customIgvRate / 100 : PERU_CONSTANTS.IGV_RATE;

  let baseAmount = 0;
  let igvAmount = 0;
  let totalAmount = 0;

  if (input.mode === 'add_igv') {
    baseAmount = amount;
    igvAmount = baseAmount * rate;
    totalAmount = baseAmount + igvAmount;
  } else {
    // Extraer IGV
    totalAmount = amount;
    baseAmount = totalAmount / (1 + rate);
    igvAmount = totalAmount - baseAmount;
  }

  return {
    baseAmount: roundTo(baseAmount, 2),
    igvAmount: roundTo(igvAmount, 2),
    totalAmount: roundTo(totalAmount, 2),
    mode: input.mode,
    rateApplied: rate * 100,
  };
}
