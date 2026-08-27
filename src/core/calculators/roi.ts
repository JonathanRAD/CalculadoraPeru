import { roundTo } from '../math/formatters';

export interface RoiInput {
  initialInvestment: number; // Inversión total inicial (S/)
  monthlyNetProfit: number; // Ganancia neta promedio esperada por mes (S/)
  expectedDurationMonths?: number; // Periodo de evaluación en meses (por defecto 12 o 24)
}

export interface RoiResult {
  roiPercentage: number; // Retorno de inversión en % durante el periodo evaluado
  paybackMonths: number; // Tiempo exacto de recuperación en meses
  isProfitable: boolean; // ¿Genera retorno positivo?
  totalNetProfitAtPeriod: number; // Ganancia acumulada al final del periodo
  monthlyReturnRate: number; // Rentabilidad mensual (%)
}

/**
 * Calcula el Retorno de Inversión (ROI) y el Período de Recuperación (Payback Period).
 * 
 * Fórmulas:
 * - Meses de Recuperación = Inversión Inicial / Ganancia Neta Mensual
 * - ROI (%) = ((Ganancia Total del Periodo - Inversión) / Inversión) * 100
 */
export function calculateRoi(input: RoiInput): RoiResult {
  const investment = Math.max(0, input.initialInvestment || 0);
  const monthlyProfit = Math.max(0, input.monthlyNetProfit || 0);
  const durationMonths = Math.max(1, input.expectedDurationMonths || 12);

  let paybackMonths = 0;
  let roiPercentage = 0;
  let totalNetProfitAtPeriod = 0;
  let monthlyReturnRate = 0;

  if (investment > 0 && monthlyProfit > 0) {
    paybackMonths = investment / monthlyProfit;
    const totalAccumulated = monthlyProfit * durationMonths;
    totalNetProfitAtPeriod = totalAccumulated - investment;
    roiPercentage = ((totalAccumulated - investment) / investment) * 100;
    monthlyReturnRate = (monthlyProfit / investment) * 100;
  }

  return {
    roiPercentage: roundTo(roiPercentage, 2),
    paybackMonths: roundTo(paybackMonths, 1),
    isProfitable: monthlyProfit > 0 && paybackMonths <= durationMonths,
    totalNetProfitAtPeriod: roundTo(totalNetProfitAtPeriod, 2),
    monthlyReturnRate: roundTo(monthlyReturnRate, 2),
  };
}
