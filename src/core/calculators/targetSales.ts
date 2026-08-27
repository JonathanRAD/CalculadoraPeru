import { roundTo } from '../math/formatters';

export interface TargetSalesInput {
  targetNetProfit: number; // Meta de ganancia mensual deseada (S/)
  fixedMonthlyCosts: number; // Costos fijos del negocio (S/)
  unitSalePrice: number; // Precio de venta por producto (S/)
  unitVariableCost: number; // Costo variable por producto (S/)
}

export interface TargetSalesResult {
  unitsToSell: number; // Unidades requeridas a vender al mes
  dailyUnitsToSell: number; // Unidades diarias a vender (asumiendo 26 días laborales)
  totalSalesRequired: number; // Facturación bruta total necesaria (S/)
  contributionMarginUnit: number; // Margen de contribución unitario (S/)
  isFeasible: boolean;
}

/**
 * Calcula las ventas y unidades necesarias para alcanzar una meta de ganancia neta en Soles.
 * 
 * Fórmula:
 * Unidades = (Costos Fijos + Meta de Ganancia) / Margen de Contribución Unitario
 */
export function calculateTargetSales(input: TargetSalesInput): TargetSalesResult {
  const targetProfit = Math.max(0, input.targetNetProfit || 0);
  const fixedCosts = Math.max(0, input.fixedMonthlyCosts || 0);
  const price = Math.max(0, input.unitSalePrice || 0);
  const variableCost = Math.max(0, input.unitVariableCost || 0);

  const contributionMarginUnit = price - variableCost;
  const isFeasible = contributionMarginUnit > 0;

  let unitsToSell = 0;
  let totalSalesRequired = 0;

  if (isFeasible && (targetProfit + fixedCosts) > 0) {
    unitsToSell = Math.ceil((fixedCosts + targetProfit) / contributionMarginUnit);
    totalSalesRequired = unitsToSell * price;
  }

  const dailyUnitsToSell = Math.ceil(unitsToSell / 26);

  return {
    unitsToSell,
    dailyUnitsToSell,
    totalSalesRequired: roundTo(totalSalesRequired, 2),
    contributionMarginUnit: roundTo(contributionMarginUnit, 2),
    isFeasible,
  };
}
