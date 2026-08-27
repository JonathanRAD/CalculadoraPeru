/**
 * Constantes financieras, tributarias y tarifarias de la República del Perú.
 * Actualizadas para normas vigentes y tarifas referenciales de Osinergmin / SUNAT.
 */

export const PERU_CONSTANTS = {
  IGV_RATE: 0.18, // 18% (16% IGV + 2% IPM)
  UIT_2024: 5150, // S/ 5,150
  UIT_2025: 5350, // S/ 5,350
  UIT_2026: 5350, // S/ 5,350
  DEFAULT_KWH_COST: 0.72, // S/ 0.72 por kWh (Promedio Lima Luz del Sur / Enel Pliego BT5B)
  CURRENCY_SYMBOL: 'S/',
  CURRENCY_CODE: 'PEN',
  LOCALE: 'es-PE',
} as const;

export const ELECTRIC_APPLIANCES = [
  { id: 'refrigeradora', name: 'Refrigeradora (No Frost estándar)', watts: 250, defaultHours: 8, icon: '❄️' },
  { id: 'aire_acondicionado', name: 'Aire Acondicionado (12,000 BTU)', watts: 1200, defaultHours: 6, icon: '💨' },
  { id: 'terma', name: 'Terma Eléctrica (50 Litros)', watts: 1500, defaultHours: 2, icon: '🚿' },
  { id: 'microondas', name: 'Horno Microondas', watts: 1000, defaultHours: 0.5, icon: '🍲' },
  { id: 'hervidor', name: 'Hervidor Eléctrico de Agua', watts: 1500, defaultHours: 0.3, icon: '☕' },
  { id: 'lavadora', name: 'Lavadora Automática', watts: 500, defaultHours: 1.5, icon: '🧺' },
  { id: 'tv_led', name: 'Televisor LED 55 pulgadas', watts: 100, defaultHours: 5, icon: '📺' },
  { id: 'computadora', name: 'PC de Escritorio / Gaming', watts: 300, defaultHours: 8, icon: '🖥️' },
  { id: 'laptop', name: 'Laptop de Oficina', watts: 65, defaultHours: 8, icon: '💻' },
  { id: 'ventilador', name: 'Ventilador de Pedestal', watts: 60, defaultHours: 8, icon: '🌀' },
  { id: 'foco_led', name: 'Foco LED (10W equivalente a 100W)', watts: 10, defaultHours: 6, icon: '💡' },
  { id: 'plancha', name: 'Plancha Eléctrica', watts: 1200, defaultHours: 1, icon: '👔' },
] as const;
