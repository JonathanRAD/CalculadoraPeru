import { roundTo } from '../math/formatters';

export interface PercentBasicResult {
  percentOfTotal: number; // ¿Cuánto es el X% de Y?
  whatPercentIs: number; // ¿Qué porcentaje es X de Y?
  percentageChange: number; // ¿Cuál es el incremento o decremento porcentual de X a Y?
  isIncrease: boolean;
}

/**
 * Operaciones porcentuales universales de uso frecuente en comercio y finanzas.
 */
export function calculatePercentOfTotal(percentage: number, total: number): number {
  return roundTo((percentage / 100) * total, 2);
}

export function calculateWhatPercentIs(part: number, total: number): number {
  if (total === 0) return 0;
  return roundTo((part / total) * 100, 2);
}

export function calculatePercentageChange(initialValue: number, finalValue: number): { change: number; isIncrease: boolean } {
  if (initialValue === 0) return { change: 0, isIncrease: finalValue >= 0 };
  const diff = finalValue - initialValue;
  const change = (diff / Math.abs(initialValue)) * 100;
  return {
    change: roundTo(Math.abs(change), 2),
    isIncrease: diff >= 0,
  };
}
