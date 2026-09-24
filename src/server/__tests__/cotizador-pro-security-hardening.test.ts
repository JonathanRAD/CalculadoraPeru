import { describe, it, expect } from 'vitest';
import { quoteRepository } from '../repositories/quote.repository';
import { clientRepository } from '../repositories/client.repository';
import { catalogRepository } from '../repositories/catalog.repository';
import { sanitizePostgrestSearch } from '../utils/search-sanitizer';
import { escapeCsvCell, generateQuoteCsvString } from '@/shared/utils/quoteCsvGenerator';
import { calculateQuote } from '@/core/calculators/quote';
import { validateQuoteInput } from '../validators/quote.validator';

describe('Cotizador PRO - Multitenant Security Isolation', () => {
  const userA = 'user-owner-aaa-111';
  const userB = 'user-attacker-bbb-222';

  it('rechaza asociar un cliente perteneciente a otro usuario (cross-tenant client)', async () => {
    // 1. Usuario B crea un cliente propio
    const clientB = await clientRepository.create({
      userId: userB,
      name: 'Cliente Exclusivo de B',
      docType: 'ruc',
      docNumber: '20609999991',
      status: 'active',
    });

    // 2. Usuario A intenta asociar el cliente de B en su cotización
    const validation = await quoteRepository.validateOwnerships(userA, clientB.id, []);
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('no pertenece a tu cuenta');
  });

  it('rechaza asociar un producto del catálogo perteneciente a otro usuario (cross-tenant product)', async () => {
    // 1. Usuario B crea un producto propio en su catálogo
    const itemB = await catalogRepository.create({
      userId: userB,
      type: 'product',
      name: 'Software Confidencial B',
      price: 1500,
      unit: 'unit',
      isIgvAffected: true,
      status: 'active',
    });

    // 2. Usuario A intenta usar el producto del catálogo de B
    const validation = await quoteRepository.validateOwnerships(userA, undefined, [itemB.id]);
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('no pertenecen a tu cuenta');
  });

  it('impide que un usuario acceda, modifique o anule una cotización ajena', async () => {
    // 1. Usuario A crea una cotización
    const calc = calculateQuote({
      items: [{ description: 'Servicio Cloud A', quantity: 1, unitPrice: 800 }],
      includeIgv: true,
    });

    const quoteA = await quoteRepository.create(
      {
        userId: userA,
        prefix: 'COT-',
        clientName: 'Cliente Privado A',
        clientDocType: 'none',
        issueDate: '2026-07-01',
        currency: 'PEN',
        subtotalGross: calc.totals.subtotalGross,
        itemsDiscountTotal: 0,
        globalDiscountType: 'none',
        globalDiscountValue: 0,
        globalDiscountAmount: 0,
        discountTotal: 0,
        subtotalNet: calc.totals.subtotalNet,
        taxableBase: calc.totals.taxableBase,
        exemptBase: 0,
        igvRate: 0.18,
        igvAmount: calc.totals.igvAmount,
        totalAmount: calc.totals.totalAmount,
        status: 'draft',
      },
      calc.items.map(it => ({
        sortOrder: it.sortOrder,
        description: it.description,
        type: it.type,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountType: it.discountType,
        discountValue: it.discountValue,
        discountAmount: it.discountAmount,
        isIgvAffected: it.isIgvAffected,
        grossAmount: it.grossAmount,
        netAmount: it.netAmount,
      }))
    );

    // 2. Usuario B intenta consultar la cotización de A
    const foundByB = await quoteRepository.findById(quoteA.quote.id, userB);
    expect(foundByB).toBeNull();

    // 3. Usuario B intenta modificar la cotización de A
    const updatedByB = await quoteRepository.update(quoteA.quote.id, userB, {
      clientName: 'Cliente Alterado por B',
    });
    expect(updatedByB).toBeNull();

    // 4. Usuario B intenta anular o archivar la cotización de A
    const archivedByB = await quoteRepository.archive(quoteA.quote.id, userB);
    expect(archivedByB).toBe(false);

    // 5. La cotización de A permanece inalterada
    const verifiedA = await quoteRepository.findById(quoteA.quote.id, userA);
    expect(verifiedA).not.toBeNull();
    expect(verifiedA?.quote.clientName).toBe('Cliente Privado A');
    expect(verifiedA?.quote.status).toBe('draft');
  });
});

describe('Cotizador PRO - Atomicidad y Correlativos', () => {
  const user = 'user-correlative-tester';

  it('asigna correlativo único en la creación y lo conserva en la actualización', async () => {
    const calc = calculateQuote({
      items: [{ description: 'Consultoría Técnica', quantity: 2, unitPrice: 200 }],
      includeIgv: true,
    });

    // Crear cotización
    const created = await quoteRepository.create(
      {
        userId: user,
        prefix: 'COT-',
        clientName: 'Empresa Test SAC',
        clientDocType: 'ruc',
        clientDocNumber: '20501112223',
        issueDate: '2026-07-15',
        currency: 'PEN',
        subtotalGross: calc.totals.subtotalGross,
        itemsDiscountTotal: 0,
        globalDiscountType: 'none',
        globalDiscountValue: 0,
        globalDiscountAmount: 0,
        discountTotal: 0,
        subtotalNet: calc.totals.subtotalNet,
        taxableBase: calc.totals.taxableBase,
        exemptBase: 0,
        igvRate: 0.18,
        igvAmount: calc.totals.igvAmount,
        totalAmount: calc.totals.totalAmount,
        status: 'draft',
      },
      calc.items.map(it => ({
        sortOrder: it.sortOrder,
        description: it.description,
        type: it.type,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountType: it.discountType,
        discountValue: it.discountValue,
        discountAmount: it.discountAmount,
        isIgvAffected: it.isIgvAffected,
        grossAmount: it.grossAmount,
        netAmount: it.netAmount,
      }))
    );

    const initialCorrelative = created.quote.correlative;
    const initialQuoteNumber = created.quote.quoteNumber;
    expect(initialCorrelative).toBeGreaterThanOrEqual(1);
    expect(initialQuoteNumber).toContain(`COT-${String(initialCorrelative).padStart(5, '0')}`);

    // Actualizar cotización (no debe cambiar el correlativo ni número)
    const updated = await quoteRepository.update(created.quote.id, user, {
      paymentTerms: 'Crédito a 30 días',
      publicNotes: 'Nota adicional agregada',
    });

    expect(updated).not.toBeNull();
    expect(updated?.quote.correlative).toBe(initialCorrelative);
    expect(updated?.quote.quoteNumber).toBe(initialQuoteNumber);
    expect(updated?.quote.paymentTerms).toBe('Crédito a 30 días');
  });

  it('asigna un nuevo correlativo al duplicar una proforma', async () => {
    const calc = calculateQuote({
      items: [{ description: 'Licencia de Software', quantity: 1, unitPrice: 500 }],
      includeIgv: false,
    });

    const original = await quoteRepository.create(
      {
        userId: user,
        prefix: 'COT-',
        clientName: 'Cliente Base',
        clientDocType: 'none',
        issueDate: '2026-07-10',
        currency: 'PEN',
        subtotalGross: 500,
        itemsDiscountTotal: 0,
        globalDiscountType: 'none',
        globalDiscountValue: 0,
        globalDiscountAmount: 0,
        discountTotal: 0,
        subtotalNet: 500,
        taxableBase: 0,
        exemptBase: 500,
        igvRate: 0,
        igvAmount: 0,
        totalAmount: 500,
        status: 'accepted',
      },
      calc.items.map(it => ({
        sortOrder: it.sortOrder,
        description: it.description,
        type: it.type,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountType: it.discountType,
        discountValue: it.discountValue,
        discountAmount: it.discountAmount,
        isIgvAffected: false,
        grossAmount: 500,
        netAmount: 500,
      }))
    );

    const duplicated = await quoteRepository.duplicate(original.quote.id, user);
    expect(duplicated).not.toBeNull();
    expect(duplicated?.quote.id).not.toBe(original.quote.id);
    expect(duplicated?.quote.correlative).toBeGreaterThan(original.quote.correlative);
    expect(duplicated?.quote.status).toBe('draft');
  });
});

describe('Cotizador PRO - Sanitización de Búsqueda PostgREST', () => {
  it('neutraliza caracteres de inyección de sintaxis y comodines en PostgREST', () => {
    // Caracteres especiales de sintaxis PostgREST y SQL
    const dangerousInput = 'COT-001%,(client_name.eq.admin)",_escape;\'\\';
    const sanitized = sanitizePostgrestSearch(dangerousInput);

    expect(sanitized).not.toContain('%');
    expect(sanitized).not.toContain('_');
    expect(sanitized).not.toContain('(');
    expect(sanitized).not.toContain(')');
    expect(sanitized).not.toContain(',');
    expect(sanitized).not.toContain('"');
    expect(sanitized).not.toContain(';');
    expect(sanitized).not.toContain('\\');
    expect(sanitized).toBe('COT-001 client name eq admin escape');
  });

  it('normaliza caracteres Unicode (NFKC) y colapsa espacios', () => {
    const unicodeInput = '  Distribuidora　ＳＡＣ   Arequipa  ';
    const sanitized = sanitizePostgrestSearch(unicodeInput);
    expect(sanitized).toBe('Distribuidora SAC Arequipa');
  });

  it('limita la longitud máxima de búsqueda para prevenir abusos de DoS', () => {
    const longInput = 'a'.repeat(200);
    const sanitized = sanitizePostgrestSearch(longInput, 50);
    expect(sanitized.length).toBe(50);
  });
});

describe('Cotizador PRO - Seguridad CSV y Exclusión de Datos Privados', () => {
  it('neutraliza vectores de CSV / Formula Injection anteponiendo apóstrofe', () => {
    expect(escapeCsvCell('=SUM(A1:A10)')).toBe(`"'=SUM(A1:A10)"`);
    expect(escapeCsvCell('+cmd|/c calc')).toBe(`"'+cmd|/c calc"`);
    expect(escapeCsvCell('-10%')).toBe(`"'-10%"`);
    expect(escapeCsvCell('@SUM(1+1)')).toBe(`"'@SUM(1+1)"`);
    expect(escapeCsvCell('Texto Normal')).toBe(`"Texto Normal"`);
  });

  it('garantiza que las notas internas jamás se exportan a CSV', () => {
    const calc = calculateQuote({
      items: [{ description: 'Consultoría Financiera', quantity: 1, unitPrice: 1000 }],
      includeIgv: true,
    });

    const csvOutput = generateQuoteCsvString({
      quoteNumber: 'COT-00099',
      issueDate: '2026-08-01',
      company: { companyName: 'Mi Empresa Perú' },
      client: { name: 'Cliente Lima' },
      items: calc.items,
      totals: calc.totals,
      publicNotes: 'Condiciones públicas: pago 50% anticipo.',
    });

    expect(csvOutput).toContain('Condiciones públicas: pago 50% anticipo.');
    expect(csvOutput).not.toContain('Margen');
    expect(csvOutput).not.toContain('internalNotes');
    expect(csvOutput).not.toContain('privada');
  });
});

describe('Cotizador PRO - Validaciones de Negocio y Límites', () => {
  it('rechaza más de 100 conceptos por cotización', () => {
    const items = Array.from({ length: 101 }, (_, i) => ({
      description: `Concepto ${i + 1}`,
      quantity: 1,
      unitPrice: 10,
    }));

    const result = validateQuoteInput({
      clientName: 'Cliente Grande',
      issueDate: '2026-08-01',
      items,
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('100 conceptos');
  });

  it('rechaza cantidades con más de 3 decimales o valores inválidos (NaN, Infinity)', () => {
    const invalidDecimals = validateQuoteInput({
      clientName: 'Cliente Test',
      issueDate: '2026-08-01',
      items: [{ description: 'Producto', quantity: 1.1234, unitPrice: 10 }],
    });
    expect(invalidDecimals.isValid).toBe(false);
    expect(invalidDecimals.error).toContain('3 decimales');

    const nanQuantity = validateQuoteInput({
      clientName: 'Cliente Test',
      issueDate: '2026-08-01',
      items: [{ description: 'Producto', quantity: NaN, unitPrice: 10 }],
    });
    expect(nanQuantity.isValid).toBe(false);

    const infinitePrice = validateQuoteInput({
      clientName: 'Cliente Test',
      issueDate: '2026-08-01',
      items: [{ description: 'Producto', quantity: 1, unitPrice: Infinity }],
    });
    expect(infinitePrice.isValid).toBe(false);
  });

  it('rechaza descuentos que superan el valor del concepto o subtotal', () => {
    // Descuento porcentual mayor a 100%
    const invalidPercentage = validateQuoteInput({
      clientName: 'Cliente Test',
      issueDate: '2026-08-01',
      items: [{ description: 'Producto', quantity: 1, unitPrice: 100, discountType: 'percent', discountValue: 120 }],
    });
    expect(invalidPercentage.isValid).toBe(false);
    expect(invalidPercentage.error).toContain('no puede superar el 100%');

    // Descuento fijo mayor al importe bruto del ítem
    const invalidFixed = validateQuoteInput({
      clientName: 'Cliente Test',
      issueDate: '2026-08-01',
      items: [{ description: 'Producto', quantity: 1, unitPrice: 50, discountType: 'fixed', discountValue: 80 }],
    });
    expect(invalidFixed.isValid).toBe(false);
    expect(invalidFixed.error).toContain('no puede exceder el importe');
  });
});
