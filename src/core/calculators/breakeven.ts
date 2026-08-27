import { PERU_CONSTANTS } from '../constants/peru';
import { roundTo } from '../math/formatters';

export interface BreakEvenInput {
  fixedCosts: number; // Costos fijos mensuales (Alquiler, sueldos, servicios, etc.) en S/
  salePricePerUnit: number; // Precio de venta unitario (sin IGV) en S/
  variableCostPerUnit: number; // Costo variable unitario (insumos, empaque) en S/
}

export interface BreakEvenResult {
  unitsNeeded: number; // Unidades mínimas a vender para no ganar ni perder (redondeado hacia arriba)
  minimumSalesAmount: number; // Ventas mínimas en Soles sin IGV
  minimumSalesWithIgv: number; // Ventas mínimas facturadas con IGV (18%)
  contributionMarginUnit: number; // Margen de contribución unitario en S/
  contributionMarginRatio: number; // Ratio de contribución marginal (%)
  isFeasible: boolean; // ¿Es viable el modelo? (Precio > Costo Variable)
}

/**
 * Calcula el Punto de Equilibrio (Break-Even Point) para negocios y MYPES.
 * 
 * Fórmulas:
 * - Margen Contribución Unitario = Precio Venta - Costo Variable
 * - Unidades = Costos Fijos / Margen Contribución Unitario
 * - Ventas Totales = Unidades * Precio Venta
 */
export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  const fixedCosts = Math.max(0, input.fixedCosts || 0);
  const price = Math.max(0, input.salePricePerUnit || 0);
  const variableCost = Math.max(0, input.variableCostPerUnit || 0);

  const contributionMarginUnit = price - variableCost;
  const isFeasible = contributionMarginUnit > 0;

  let unitsNeeded = 0;
  let minimumSalesAmount = 0;
  let contributionMarginRatio = 0;

  if (isFeasible && fixedCosts > 0) {
    unitsNeeded = Math.ceil(fixedCosts / contributionMarginUnit);
    minimumSalesAmount = unitsNeeded * price;
    contributionMarginRatio = (contributionMarginUnit / price) * 100;
  }

  const minimumSalesWithIgv = minimumSalesAmount * (1 + PERU_CONSTANTS.IGV_RATE);

  return {
    unitsNeeded,
    minimumSalesAmount: roundTo(minimumSalesAmount, 2),
    minimumSalesWithIgv: roundTo(minimumSalesWithIgv, 2),
    contributionMarginUnit: roundTo(contributionMarginUnit, 2),
    contributionMarginRatio: roundTo(contributionMarginRatio, 2),
    isFeasible,
  };
}
