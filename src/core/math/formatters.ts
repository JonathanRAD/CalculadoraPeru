/**
 * Utilidades matemáticas y formateadores de moneda con precisión financiera.
 * Evita bugs de punto flotante en JavaScript y redondea de acuerdo a normas bancarias.
 */

import { PERU_CONSTANTS } from '../constants/peru';

/**
 * Redondea un número a N decimales con seguridad aritmética (evita 1.005 -> 1.00).
 */
export function roundTo(value: number, decimals: number = 2): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Formatea un número como Moneda Peruana (ej: S/ 1,250.00).
 */
export function formatCurrency(
  amount: number,
  includeSymbol: boolean = true,
  decimals: number = 2
): string {
  if (isNaN(amount) || !isFinite(amount)) return includeSymbol ? 'S/ 0.00' : '0.00';
  
  const formatted = new Intl.NumberFormat(PERU_CONSTANTS.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(roundTo(amount, decimals));

  return includeSymbol ? `${PERU_CONSTANTS.CURRENCY_SYMBOL} ${formatted}` : formatted;
}

/**
 * Formatea un porcentaje (ej: 18.00% o 35%).
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${roundTo(value, decimals)}%`;
}

/**
 * Formatea números enteros o decimales con separador de miles.
 */
export function formatNumber(value: number, decimals: number = 0): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  return new Intl.NumberFormat(PERU_CONSTANTS.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(roundTo(value, decimals));
}

/**
 * Limpia y parsea de forma segura un string a número flotante positivo.
 */
export function parseCleanNumber(val: string | number, fallback: number = 0): number {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  const clean = val.toString().replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? fallback : parsed;
}
