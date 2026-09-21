import { describe, expect, it } from 'vitest';
import { calculateRoi } from '@/core/calculators/roi';
import { calculateCompoundInterest } from '@/core/calculators/compoundInterest';
import { calculateProfitMargin } from '@/core/calculators/margin';
import { PERU_CONSTANTS } from '@/core/constants/peru';

describe('Pruebas de regresión para correcciones numéricas observadas', () => {
  describe('Retorno de Inversión y Payback (ROI)', () => {
    it('calcula exactamente tanto el rendimiento de flujo (96%) como el retorno neto del año 1 (-4%)', () => {
      const result = calculateRoi({
        initialInvestment: 15000,
        monthlyNetProfit: 1200,
        expectedDurationMonths: 12,
      });

      // Tiempo de recuperación: 15,000 / 1,200 = 12.5 meses
      expect(result.paybackMonths).toBe(12.5);

      // Rendimiento del flujo anual sobre el capital: (1,200 * 12 / 15,000) * 100 = 96.00%
      expect(result.annualCashFlowReturnRate).toBe(96);

      // Retorno neto acumulado en mes 12: ((14,400 - 15,000) / 15,000) * 100 = -4.00%
      expect(result.roiPercentage).toBe(-4);
      expect(result.totalNetProfitAtPeriod).toBe(-600);
      expect(result.monthlyReturnRate).toBe(8); // 1,200 / 15,000 = 8% mensual
    });
  });

  describe('Interés Compuesto según capitalización mensual SBS', () => {
    it('calcula saldo final de S/ 28,797.76 con depósito 5,000, aporte 300, TREA 7.5% a 5 años', () => {
      const result = calculateCompoundInterest({
        initialPrincipal: 5000,
        monthlyContribution: 300,
        annualRatePercentage: 7.5,
        years: 5,
      });

      expect(result.totalContributions).toBe(23000);
      expect(result.finalBalance).toBe(28797.76);
      expect(result.totalInterestEarned).toBe(5797.76);
    });
  });

  describe('Margen de Ganancia Comercial con IGV', () => {
    it('desglosa correctamente la ganancia neta S/ 34.75 y margen del 41.00% sobre base neta', () => {
      const result = calculateProfitMargin({
        salePrice: 100,
        cost: 50,
        priceIncludesIgv: true,
      });

      // Precio neto sin IGV: 100 / 1.18 = 84.75
      expect(result.priceWithoutIgv).toBe(84.75);
      // Ganancia neta por unidad: 84.75 - 50.00 = 34.75
      expect(result.profitPerUnit).toBe(34.75);
      // Margen sobre base neta: (34.75 / 84.75) * 100 = 41.00%
      expect(result.profitMarginPercentage).toBe(41);
      // Mark-up sobre costo: (34.75 / 50.00) * 100 = 69.49%
      expect(result.markupPercentage).toBe(69.49);
    });
  });

  describe('Parámetros regulatorios UIT 2026', () => {
    it('utiliza la UIT oficial 2026 de S/ 5,500 de manera uniforme', () => {
      expect(PERU_CONSTANTS.CURRENT_UIT).toBe(5500);
    });
  });
});
