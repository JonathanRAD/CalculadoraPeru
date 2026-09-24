import { describe, it, expect } from 'vitest';
import {
  calculateQuote,
  validateQuoteItemInput,
  toCents,
  fromCents,
  roundHalfUp,
} from '../quote';

describe('Calculador de Cotizaciones Comerciales (quote.ts)', () => {
  it('toCents y fromCents convierten con precisión de céntimos sin errores de flotante', () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(fromCents(30)).toBe(0.3);
    expect(toCents(10.555)).toBe(1056); // Half-up commercial
    expect(toCents(10.554)).toBe(1055);
  });

  it('calcula cotización vacía con totales en 0', () => {
    const result = calculateQuote({ items: [] });
    expect(result.isValid).toBe(true);
    expect(result.items).toHaveLength(0);
    expect(result.totals.subtotalGross).toBe(0);
    expect(result.totals.subtotalNet).toBe(0);
    expect(result.totals.totalAmount).toBe(0);
  });

  it('calcula un concepto simple con IGV al 18%', () => {
    const result = calculateQuote({
      items: [
        {
          description: 'Consultoría Especializada',
          quantity: 2,
          unitPrice: 150,
          isIgvAffected: true,
        },
      ],
      includeIgv: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.totals.subtotalGross).toBe(300);
    expect(result.totals.subtotalNet).toBe(300);
    expect(result.totals.taxableBase).toBe(300);
    expect(result.totals.exemptBase).toBe(0);
    expect(result.totals.igvAmount).toBe(54); // 300 * 0.18
    expect(result.totals.totalAmount).toBe(354);
    // Garantía contable
    expect(result.totals.taxableBase + result.totals.exemptBase).toBe(result.totals.subtotalNet);
    expect(result.totals.subtotalNet + result.totals.igvAmount).toBe(result.totals.totalAmount);
  });

  it('maneja unidades mínimas de S/ 0.01 y cantidades con tres decimales', () => {
    const result = calculateQuote({
      items: [
        {
          description: 'Tornillo de Precisión',
          quantity: 1.555,
          unitPrice: 0.01,
          isIgvAffected: true,
        },
      ],
      includeIgv: true,
    });

    expect(result.isValid).toBe(true);
    // 1.555 * 0.01 = 0.01555 -> 0.02
    expect(result.totals.subtotalGross).toBe(0.02);
    expect(result.totals.subtotalNet).toBe(0.02);
    expect(result.totals.taxableBase).toBe(0.02);
    expect(result.totals.igvAmount).toBe(0); // round(0.02 * 0.18) = round(0.0036) = 0
    expect(result.totals.totalAmount).toBe(0.02);
  });

  it('distribuye un descuento global de S/ 0.01 de manera determinista y garantiza base gravada + inafecta === subtotal neto', () => {
    const result = calculateQuote({
      items: [
        { description: 'Item A (Afecto)', quantity: 1, unitPrice: 10.00, isIgvAffected: true },
        { description: 'Item B (Inafecto)', quantity: 1, unitPrice: 10.00, isIgvAffected: false },
        { description: 'Item C (Afecto)', quantity: 1, unitPrice: 10.00, isIgvAffected: true },
      ],
      includeIgv: true,
      globalDiscountType: 'fixed',
      globalDiscountValue: 0.01,
    });

    expect(result.isValid).toBe(true);
    expect(result.totals.subtotalGross).toBe(30.00);
    expect(result.totals.globalDiscountAmount).toBe(0.01);
    expect(result.totals.subtotalNet).toBe(29.99);

    // Identidades fundamentales
    expect(roundHalfUp(result.totals.taxableBase + result.totals.exemptBase, 2)).toBe(result.totals.subtotalNet);
    expect(roundHalfUp(result.totals.subtotalNet + result.totals.igvAmount, 2)).toBe(result.totals.totalAmount);
    expect(roundHalfUp(result.totals.subtotalGross - result.totals.discountTotal, 2)).toBe(result.totals.subtotalNet);
  });

  it('mezcla conceptos afectos e inafectos con descuentos porcentuales y globales', () => {
    const result = calculateQuote({
      items: [
        {
          description: 'Licencia Software (Afecta)',
          quantity: 1,
          unitPrice: 100,
          discountType: 'percent',
          discountValue: 10, // neto = 90
          isIgvAffected: true,
        },
        {
          description: 'Libro de Formación (Inafecto Ley del Libro)',
          quantity: 2,
          unitPrice: 50,
          discountType: 'fixed',
          discountValue: 20, // bruto = 100, neto = 80
          isIgvAffected: false,
        },
      ],
      includeIgv: true,
      globalDiscountType: 'percent',
      globalDiscountValue: 10, // 10% sobre 170 = 17.00
    });

    expect(result.isValid).toBe(true);
    expect(result.totals.subtotalGross).toBe(200);
    expect(result.totals.itemsDiscountTotal).toBe(30); // 10 + 20
    expect(result.totals.globalDiscountAmount).toBe(17);
    expect(result.totals.discountTotal).toBe(47);
    expect(result.totals.subtotalNet).toBe(153);

    // Verificación exacta de bases
    expect(result.totals.taxableBase + result.totals.exemptBase).toBe(153);
    expect(result.totals.subtotalNet + result.totals.igvAmount).toBe(result.totals.totalAmount);
  });

  it('funciona correctamente con IGV desactivado (tasa 0%)', () => {
    const result = calculateQuote({
      items: [
        { description: 'Servicio MYPE', quantity: 1, unitPrice: 500, isIgvAffected: true },
      ],
      includeIgv: false,
    });

    expect(result.isValid).toBe(true);
    expect(result.totals.igvRate).toBe(0);
    expect(result.totals.igvAmount).toBe(0);
    expect(result.totals.totalAmount).toBe(500);
  });

  it('soporta 100 conceptos sin degradación ni pérdida de céntimos', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({
      description: `Concepto industrial #${i + 1}`,
      quantity: 1.125,
      unitPrice: 13.75,
      isIgvAffected: i % 2 === 0, // 50 afectos, 50 inafectos
    }));

    const result = calculateQuote({
      items,
      includeIgv: true,
      globalDiscountType: 'percent',
      globalDiscountValue: 5,
    });

    expect(result.isValid).toBe(true);
    expect(result.items).toHaveLength(100);
    expect(result.totals.taxableBase + result.totals.exemptBase).toBe(result.totals.subtotalNet);
    expect(result.totals.subtotalGross - result.totals.discountTotal).toBe(result.totals.subtotalNet);
    expect(result.totals.subtotalNet + result.totals.igvAmount).toBe(result.totals.totalAmount);
  });

  it('rechaza cantidades mayores al límite máximo o más de 100 conceptos', () => {
    const excessItems = Array.from({ length: 101 }, (_, i) => ({
      description: `Item #${i}`,
      quantity: 1,
      unitPrice: 10,
    }));

    const result = calculateQuote({ items: excessItems });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('más de 100 conceptos'))).toBe(true);
  });

  it('validación estricta de validateQuoteItemInput', () => {
    // Más de 3 decimales en cantidad debe fallar
    const resDec = validateQuoteItemInput({
      description: 'Prueba',
      quantity: 1.0001,
      unitPrice: 10,
    });
    expect(resDec.isValid).toBe(false);

    // Precio negativo debe fallar
    const resNeg = validateQuoteItemInput({
      description: 'Prueba',
      quantity: 1,
      unitPrice: -5,
    });
    expect(resNeg.isValid).toBe(false);

    // Descuento porcentual > 100 debe fallar
    const resPct = validateQuoteItemInput({
      description: 'Prueba',
      quantity: 1,
      unitPrice: 10,
      discountType: 'percent',
      discountValue: 105,
    });
    expect(resPct.isValid).toBe(false);

    // Descuento fijo mayor al bruto debe fallar
    const resFix = validateQuoteItemInput({
      description: 'Prueba',
      quantity: 1,
      unitPrice: 10,
      discountType: 'fixed',
      discountValue: 15,
    });
    expect(resFix.isValid).toBe(false);
  });
});
