import { roundTo } from '../math/formatters';

export interface ProfitPerProductInput {
  costPrice: number; // Costo de compra o fabricación (S/)
  salePrice: number; // Precio de venta cobrado (S/)
  estimatedMonthlyUnits: number; // Unidades estimadas a vender por mes
  advertisingCostPerUnit?: number; // Gasto en publicidad o pauta por venta (S/)
}

export interface ProfitPerProductResult {
  unitProfit: number; // Ganancia neta por cada unidad (S/)
  marginPercentage: number; // Margen neto por unidad (%)
  estimatedMonthlyGrossRevenue: number; // Ingresos brutos mensuales (S/)
  estimatedMonthlyTotalProfit: number; // Ganancia neta mensual proyectada (S/)
}

/**
 * Calcula la ganancia unitaria por producto y la proyección de rentabilidad mensual.
 */
export function calculateProfitPerProduct(input: ProfitPerProductInput): ProfitPerProductResult {
  const cost = Math.max(0, input.costPrice || 0);
  const price = Math.max(0, input.salePrice || 0);
  const ads = Math.max(0, input.advertisingCostPerUnit || 0);
  const units = Math.max(0, input.estimatedMonthlyUnits || 0);

  const totalUnitCost = cost + ads;
  const unitProfit = price - totalUnitCost;
  const marginPercentage = price > 0 ? (unitProfit / price) * 100 : 0;
  
  const estimatedMonthlyGrossRevenue = price * units;
  const estimatedMonthlyTotalProfit = unitProfit * units;

  return {
    unitProfit: roundTo(unitProfit, 2),
    marginPercentage: roundTo(marginPercentage, 2),
    estimatedMonthlyGrossRevenue: roundTo(estimatedMonthlyGrossRevenue, 2),
    estimatedMonthlyTotalProfit: roundTo(estimatedMonthlyTotalProfit, 2),
  };
}
