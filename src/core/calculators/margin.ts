import { PERU_CONSTANTS } from '../constants/peru';
import { roundTo } from '../math/formatters';

export interface MarginInput {
  salePrice: number; // Precio de venta (S/)
  cost: number; // Costo del producto (S/)
  priceIncludesIgv: boolean; // ¿El precio de venta ingresado ya tiene IGV (18%)?
}

export interface MarginResult {
  profitPerUnit: number; // Ganancia en Soles por unidad vendida
  profitMarginPercentage: number; // Margen de ganancia sobre el precio de venta (%)
  markupPercentage: number; // Mark-up (margen sobre el costo) (%)
  priceWithoutIgv: number; // Precio neto sin IGV
  igvAmount: number; // Monto de IGV
  cost: number;
}

/**
 * Calcula el Margen de Ganancia real (Profit Margin) y el Mark-up comercial.
 * 
 * Fórmulas:
 * - Margen de Utilidad = (Precio Neto - Costo) / Precio Neto * 100
 * - Mark-up = (Precio Neto - Costo) / Costo * 100
 */
export function calculateProfitMargin(input: MarginInput): MarginResult {
  const rawPrice = Math.max(0, input.salePrice || 0);
  const cost = Math.max(0, input.cost || 0);

  let priceWithoutIgv = rawPrice;
  let igvAmount = 0;

  if (input.priceIncludesIgv && rawPrice > 0) {
    priceWithoutIgv = rawPrice / (1 + PERU_CONSTANTS.IGV_RATE);
    igvAmount = rawPrice - priceWithoutIgv;
  }

  const profitPerUnit = priceWithoutIgv - cost;
  
  const profitMarginPercentage = priceWithoutIgv > 0 
    ? (profitPerUnit / priceWithoutIgv) * 100 
    : 0;

  const markupPercentage = cost > 0 
    ? (profitPerUnit / cost) * 100 
    : 0;

  return {
    profitPerUnit: roundTo(profitPerUnit, 2),
    profitMarginPercentage: roundTo(profitMarginPercentage, 2),
    markupPercentage: roundTo(markupPercentage, 2),
    priceWithoutIgv: roundTo(priceWithoutIgv, 2),
    igvAmount: roundTo(igvAmount, 2),
    cost: roundTo(cost, 2),
  };
}
