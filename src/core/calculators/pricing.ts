import { PERU_CONSTANTS } from '../constants/peru';
import { roundTo } from '../math/formatters';

export interface SalePriceInput {
  cost: number; // Costo base del producto (S/)
  marginPercentage: number; // Margen de ganancia deseado (ej: 30%)
  includeIgv: boolean; // ¿El precio de venta final debe incluir IGV (18%)?
  salesCommissionPercentage?: number; // Comisión de pasarela o marketplace (ej: 3.5% Yape/Niubiz/MercadoLibre)
  otherCosts?: number; // Costos adicionales (empaque, delivery, packaging) en S/
}

export interface SalePriceResult {
  recommendedSalePrice: number; // Precio de venta final sugerido al público
  basePriceWithoutIgv: number; // Precio base antes de IGV
  profitPerUnit: number; // Ganancia neta en soles por unidad
  realMarginPercentage: number; // Margen de utilidad real obtenido
  igvAmount: number; // Monto de IGV 18% (si aplica)
  commissionAmount: number; // Monto retenido por comisión
  totalCostPerUnit: number; // Costo total unitario (Costo base + otros costos)
}

/**
 * Calcula el Precio de Venta recomendado con margen comercial real,
 * comisiones de pasarela, costos de empaque y desglose de IGV peruano.
 * 
 * Fórmula comercial estándar:
 * Precio Base = (Costo Total) / (1 - Margen% - Comisión%)
 */
export function calculateSalePrice(input: SalePriceInput): SalePriceResult {
  const cost = Math.max(0, input.cost || 0);
  const otherCosts = Math.max(0, input.otherCosts || 0);
  const totalCost = cost + otherCosts;
  
  const marginRate = Math.max(0, Math.min(99, input.marginPercentage || 0)) / 100;
  const commissionRate = Math.max(0, Math.min(90, input.salesCommissionPercentage || 0)) / 100;

  // Denominador para margen sobre ventas (Mark-on): 1 - margen - comisión
  const denominator = 1 - marginRate - commissionRate;
  
  let basePriceWithoutIgv = 0;
  if (denominator > 0) {
    basePriceWithoutIgv = totalCost / denominator;
  } else {
    // Si la suma supera 100%, calculamos con mark-up simple para evitar división por cero o negativo
    basePriceWithoutIgv = totalCost * (1 + marginRate + commissionRate);
  }

  const commissionAmount = basePriceWithoutIgv * commissionRate;
  const profitPerUnit = basePriceWithoutIgv - totalCost - commissionAmount;
  const realMarginPercentage = basePriceWithoutIgv > 0 ? (profitPerUnit / basePriceWithoutIgv) * 100 : 0;

  let igvAmount = 0;
  let recommendedSalePrice = basePriceWithoutIgv;

  if (input.includeIgv) {
    igvAmount = basePriceWithoutIgv * PERU_CONSTANTS.IGV_RATE;
    recommendedSalePrice = basePriceWithoutIgv + igvAmount;
  }

  return {
    recommendedSalePrice: roundTo(recommendedSalePrice, 2),
    basePriceWithoutIgv: roundTo(basePriceWithoutIgv, 2),
    profitPerUnit: roundTo(profitPerUnit, 2),
    realMarginPercentage: roundTo(realMarginPercentage, 2),
    igvAmount: roundTo(igvAmount, 2),
    commissionAmount: roundTo(commissionAmount, 2),
    totalCostPerUnit: roundTo(totalCost, 2),
  };
}
