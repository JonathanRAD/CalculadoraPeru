import { roundTo } from '../math/formatters';

export interface HonorariosInput {
  grossAmount: number; // Monto pactado o bruto (S/)
  hasSuspension?: boolean; // ¿Cuenta con suspensión de 4ta categoría emitida por SUNAT?
}

export interface HonorariosResult {
  grossAmount: number; // Monto bruto del recibo por honorarios
  retentionAmount: number; // Retención del 8% de SUNAT
  netAmountToReceive: number; // Monto neto que depositan al trabajador
  isRetentionApplicable: boolean; // Si supera S/ 1,500 y no tiene suspensión
  retentionRate: number; // 8%
}

/**
 * Calcula la retención del Impuesto a la Renta de 4ta Categoría (Recibo por Honorarios SUNAT).
 * Norma Perú: Retención del 8% si el recibo supera los S/ 1,500 (salvo constancia de suspensión de retenciones).
 */
export function calculateHonorarios(input: HonorariosInput): HonorariosResult {
  const gross = Math.max(0, input.grossAmount || 0);
  const isRetentionApplicable = gross > 1500 && !input.hasSuspension;
  const retentionRate = isRetentionApplicable ? 8.0 : 0;
  const retentionAmount = roundTo((gross * retentionRate) / 100, 2);
  const netAmountToReceive = roundTo(gross - retentionAmount, 2);

  return {
    grossAmount: roundTo(gross, 2),
    retentionAmount,
    netAmountToReceive,
    isRetentionApplicable,
    retentionRate,
  };
}
