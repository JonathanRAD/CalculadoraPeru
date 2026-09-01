/**
 * Constantes financieras, tributarias y tarifarias de la República del Perú.
 * Actualizadas para normas vigentes y tarifas referenciales de Osinergmin / SUNAT.
 */

export const PERU_CONSTANTS = {
  CURRENT_YEAR: 2026,
  IGV_RATE: 0.18, // 18% (16% IGV + 2% IPM)
  UIT_2024: 5150, // S/ 5,150
  UIT_2025: 5350, // S/ 5,350
  UIT_2026: 5500, // D.S. N.° 301-2025-EF
  CURRENT_UIT: 5500,
  RMV: 1130, // Vigente desde el 1 de enero de 2025
  FAMILY_ALLOWANCE_RATE: 0.1,
  FAMILY_ALLOWANCE: 113, // 10% de la RMV
  ONP_RATE: 0.13,
  ESSALUD_RATE: 0.09,
  EPS_EXTRAORDINARY_BONUS_RATE: 0.0675,
  FOURTH_CATEGORY_RETENTION_RATE: 0.08,
  FOURTH_CATEGORY_RECEIPT_THRESHOLD: 1500,
  RMT_MAX_UIT: 1700,
  RMT_REDUCED_PAYMENT_UIT: 300,
  DEFAULT_KWH_COST: 0.72, // S/ 0.72 por kWh (Promedio Lima Luz del Sur / Enel Pliego BT5B)
  CURRENCY_SYMBOL: 'S/',
  CURRENCY_CODE: 'PEN',
  LOCALE: 'es-PE',
} as const;

/**
 * Descuento mensual AFP para afiliados bajo comisión sobre flujo.
 * Composición: aporte obligatorio (10%) + prima de seguro (1.37%) + comisión.
 * Fuente: tabla SBS, mes de devengue julio de 2026.
 */
export const AFP_FLOW_RATES_2026 = {
  afp_habitat: { rate: 0.1284, name: 'AFP Habitat (flujo 12.84%)' },
  afp_integra: { rate: 0.1292, name: 'AFP Integra (flujo 12.92%)' },
  afp_prima: { rate: 0.1297, name: 'AFP Prima (flujo 12.97%)' },
  afp_profuturo: { rate: 0.1306, name: 'AFP Profuturo (flujo 13.06%)' },
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
