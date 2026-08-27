import { roundTo } from '../math/formatters';

export interface DiscountInput {
  originalPrice: number; // Precio original (S/)
  discount1: number; // Primer descuento (%)
  discount2?: number; // Segundo descuento sucesivo (%) (ej: 20% + 10% adicional)
}

export interface DiscountResult {
  finalPrice: number; // Precio final a pagar (S/)
  totalSavings: number; // Ahorro total en Soles (S/)
  effectiveDiscountPercentage: number; // Porcentaje de descuento único equivalente (%)
  priceAfterFirstDiscount: number;
}

/**
 * Calcula Descuentos Simples y Descuentos Sucesivos acumulados.
 * 
 * Fórmulas:
 * - Descuento Único Equivalente = d1 + d2 - (d1 * d2 / 100)
 */
export function calculateDiscount(input: DiscountInput): DiscountResult {
  const original = Math.max(0, input.originalPrice || 0);
  const d1 = Math.max(0, Math.min(100, input.discount1 || 0));
  const d2 = Math.max(0, Math.min(100, input.discount2 || 0));

  const priceAfterFirst = original * (1 - d1 / 100);
  const finalPrice = priceAfterFirst * (1 - d2 / 100);
  const totalSavings = original - finalPrice;
  const effectiveDiscountPercentage = original > 0 ? (totalSavings / original) * 100 : 0;

  return {
    finalPrice: roundTo(finalPrice, 2),
    totalSavings: roundTo(totalSavings, 2),
    effectiveDiscountPercentage: roundTo(effectiveDiscountPercentage, 2),
    priceAfterFirstDiscount: roundTo(priceAfterFirst, 2),
  };
}
