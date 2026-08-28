import { roundTo } from '../math/formatters';

export type FuelType = 'gasolina_regular' | 'gasolina_premium' | 'glp' | 'gnv' | 'diesel';

export interface FuelInput {
  distanceKm: number; // Distancia a recorrer en Kilómetros (ej: 300 km)
  efficiencyKmPerGallon: number; // Rendimiento del vehículo (Km por galón / m3) (ej: 40 km/gal)
  fuelPricePerUnit: number; // Precio por galón o m3 en Soles (S/)
  numberOfPassengers?: number; // Cantidad de personas para compartir el gasto
  isRoundTrip?: boolean; // ¿Es viaje de ida y vuelta?
}

export interface FuelResult {
  totalDistanceKm: number; // Distancia total (ida o ida y vuelta)
  unitsNeeded: number; // Galones o m3 necesarios
  totalFuelCost: number; // Gasto total de combustible en Soles (S/)
  costPerKm: number; // Costo en Soles por cada kilómetro recorrido
  costPerPassenger: number; // Costo por persona si se comparte el viaje
}

/**
 * Calcula el consumo de combustible y costo en Soles para traslados y viajes en Perú.
 */
export function calculateFuelCost(input: FuelInput): FuelResult {
  const baseDistance = Math.max(0, input.distanceKm || 0);
  const totalDistanceKm = input.isRoundTrip ? baseDistance * 2 : baseDistance;
  const efficiency = Math.max(1, input.efficiencyKmPerGallon || 35);
  const price = Math.max(0, input.fuelPricePerUnit || 16.5);
  const passengers = Math.max(1, input.numberOfPassengers || 1);

  const unitsNeeded = totalDistanceKm / efficiency;
  const totalFuelCost = unitsNeeded * price;
  const costPerKm = totalDistanceKm > 0 ? totalFuelCost / totalDistanceKm : 0;
  const costPerPassenger = totalFuelCost / passengers;

  return {
    totalDistanceKm: roundTo(totalDistanceKm, 1),
    unitsNeeded: roundTo(unitsNeeded, 2),
    totalFuelCost: roundTo(totalFuelCost, 2),
    costPerKm: roundTo(costPerKm, 2),
    costPerPassenger: roundTo(costPerPassenger, 2),
  };
}
