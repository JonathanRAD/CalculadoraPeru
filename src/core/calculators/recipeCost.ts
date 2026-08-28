import { roundTo } from '../math/formatters';

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface RecipeCostInput {
  recipeName?: string;
  ingredientsTotalCost: number; // Suma de insumos e ingredientes (S/)
  portionsYield: number; // Cantidad de porciones que rinde la receta (ej: 4 porciones o 12 pasteles)
  wastePercentage?: number; // Merma / Desperdicio habitual (%) (ej: 5% a 10%)
  laborAndPackagingPerPortion?: number; // Empaque descartable, mano de obra o gas por porción (S/)
  desiredMarginPercentage: number; // Margen de ganancia deseado (%) (ej: 40%, 50%, 60%)
}

export interface RecipeCostResult {
  recipeTotalCost: number; // Costo total de la preparación completa
  costPerPortion: number; // Costo neto por porción / plato individual
  suggestedSalePricePerPortion: number; // Precio sugerido de venta en carta (sin IGV)
  suggestedSalePriceWithIgv: number; // Precio sugerido con IGV (18%)
  profitPerPortion: number; // Ganancia neta en Soles por cada plato vendido
}

/**
 * Calcula el costo por porción, merma y precio sugerido en carta para gastronomía y pastelería en Perú.
 */
export function calculateRecipeCost(input: RecipeCostInput): RecipeCostResult {
  const rawCost = Math.max(0, input.ingredientsTotalCost || 0);
  const wastePct = Math.max(0, input.wastePercentage || 0);
  const portions = Math.max(1, input.portionsYield || 1);
  const extraPerPortion = Math.max(0, input.laborAndPackagingPerPortion || 0);
  const marginPct = Math.min(95, Math.max(5, input.desiredMarginPercentage || 40));

  // Costo con factor de merma
  const costWithWaste = rawCost * (1 + wastePct / 100);
  const basePortionCost = costWithWaste / portions;
  const costPerPortion = basePortionCost + extraPerPortion;

  // Precio sugerido según margen comercial: Precio = Costo / (1 - Margen%)
  const marginFactor = 1 - marginPct / 100;
  const suggestedSalePricePerPortion = marginFactor > 0 ? costPerPortion / marginFactor : costPerPortion * 2;
  const suggestedSalePriceWithIgv = suggestedSalePricePerPortion * 1.18;
  const profitPerPortion = suggestedSalePricePerPortion - costPerPortion;

  return {
    recipeTotalCost: roundTo(costWithWaste + extraPerPortion * portions, 2),
    costPerPortion: roundTo(costPerPortion, 2),
    suggestedSalePricePerPortion: roundTo(suggestedSalePricePerPortion, 2),
    suggestedSalePriceWithIgv: roundTo(suggestedSalePriceWithIgv, 2),
    profitPerPortion: roundTo(profitPerPortion, 2),
  };
}
