import { PERU_CONSTANTS } from '../constants/peru';
import { roundTo } from '../math/formatters';

export interface ElectricityInput {
  powerWatts: number; // Potencia del artefacto en Watts (ej: 1200 W)
  hoursPerDay: number; // Horas de uso al día (ej: 5 horas)
  daysPerMonth: number; // Días de uso al mes (ej: 30 días)
  kwhRate?: number; // Costo por kWh según empresa eléctrica (Luz del Sur / Enel S/ 0.72)
}

export interface ElectricityResult {
  monthlyKwh: number; // Consumo total mensual en Kilovatios-hora (kWh)
  dailyKwh: number; // Consumo diario en kWh
  estimatedMonthlyCost: number; // Costo estimado en el recibo de luz (S/)
  estimatedAnnualCost: number; // Costo estimado al año (S/)
  costPerHour: number; // Costo en Soles por cada hora de uso
}

/**
 * Calcula el Consumo Eléctrico de electrodomésticos en kWh y su costo en Soles (Perú).
 * 
 * Fórmulas:
 * - kWh diario = (Watts * Horas) / 1000
 * - kWh mensual = kWh diario * Días
 * - Costo Mensual = kWh mensual * Tarifa kWh
 */
export function calculateElectricity(input: ElectricityInput): ElectricityResult {
  const watts = Math.max(0, input.powerWatts || 0);
  const hours = Math.max(0, Math.min(24, input.hoursPerDay || 0));
  const days = Math.max(1, Math.min(31, input.daysPerMonth || 30));
  const rate = input.kwhRate && input.kwhRate > 0 ? input.kwhRate : PERU_CONSTANTS.DEFAULT_KWH_COST;

  const dailyKwh = (watts * hours) / 1000;
  const monthlyKwh = dailyKwh * days;
  const estimatedMonthlyCost = monthlyKwh * rate;
  const estimatedAnnualCost = estimatedMonthlyCost * 12;
  const costPerHour = (watts / 1000) * rate;

  return {
    monthlyKwh: roundTo(monthlyKwh, 2),
    dailyKwh: roundTo(dailyKwh, 3),
    estimatedMonthlyCost: roundTo(estimatedMonthlyCost, 2),
    estimatedAnnualCost: roundTo(estimatedAnnualCost, 2),
    costPerHour: roundTo(costPerHour, 3),
  };
}
