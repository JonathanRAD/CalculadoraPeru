import { describe, it, expect } from 'vitest';
import {
  validateClientInput,
  validateCatalogItemInput,
  validateQuoteInput,
  validateBetaRequestInput,
} from '../validators/quote.validator';
import { clientRepository } from '../repositories/client.repository';
import { catalogRepository } from '../repositories/catalog.repository';
import { quoteRepository } from '../repositories/quote.repository';
import { calculateQuote } from '@/core/calculators/quote';

describe('Cotizador PRO - Validaciones de Seguridad', () => {
  it('valida documentos de clientes estrictamente (DNI 8 dígitos, RUC 11 dígitos)', () => {
    // DNI válido
    const validDni = validateClientInput({
      name: 'Juan Pérez',
      docType: 'dni',
      docNumber: '45678912',
    });
    expect(validDni.isValid).toBe(true);

    // DNI inválido (7 dígitos)
    const invalidDni = validateClientInput({
      name: 'Juan Pérez',
      docType: 'dni',
      docNumber: '1234567',
    });
    expect(invalidDni.isValid).toBe(false);
    expect(invalidDni.error).toContain('8 dígitos');

    // RUC válido
    const validRuc = validateClientInput({
      name: 'Distribuidora Lima S.A.C.',
      docType: 'ruc',
      docNumber: '20601234567',
    });
    expect(validRuc.isValid).toBe(true);

    // RUC inválido (10 dígitos)
    const invalidRuc = validateClientInput({
      name: 'Distribuidora Lima S.A.C.',
      docType: 'ruc',
      docNumber: '2060123456',
    });
    expect(invalidRuc.isValid).toBe(false);
    expect(invalidRuc.error).toContain('11 dígitos');
  });

  it('valida ítems del catálogo de productos y servicios', () => {
    // Ítem válido
    const validItem = validateCatalogItemInput({
      type: 'product',
      name: 'Polo Pique Manga Corta',
      price: 45.5,
      unit: 'unit',
      isIgvAffected: true,
    });
    expect(validItem.isValid).toBe(true);

    // Nombre demasiado corto
    const invalidName = validateCatalogItemInput({
      type: 'product',
      name: 'a',
      price: 10,
    });
    expect(invalidName.isValid).toBe(false);

    // Precio negativo
    const negativePrice = validateCatalogItemInput({
      type: 'service',
      name: 'Asesoría Técnica',
      price: -10,
    });
    expect(negativePrice.isValid).toBe(false);
  });

  it('valida la estructura completa de una cotización y fechas', () => {
    const validQuote = validateQuoteInput({
      clientName: 'Corporación Andina',
      clientDocType: 'ruc',
      clientDocNumber: '20100012345',
      issueDate: '2026-05-10',
      validUntil: '2026-05-25',
      items: [
        { description: 'Mantenimiento de Servidores', quantity: 2, unitPrice: 350 },
      ],
      includeIgv: true,
    });
    expect(validQuote.isValid).toBe(true);

    // Fecha de vencimiento anterior a emisión
    const invalidDates = validateQuoteInput({
      clientName: 'Cliente Ejemplo',
      issueDate: '2026-05-20',
      validUntil: '2026-05-10',
      items: [{ description: 'Servicio', quantity: 1, unitPrice: 100 }],
    });
    expect(invalidDates.isValid).toBe(false);
    expect(invalidDates.error).toContain('vencimiento no puede ser anterior');
  });

  it('requiere consentimiento explícito en solicitudes beta y separa email de teléfono', () => {
    // Sin consentimiento
    const noConsent = validateBetaRequestInput({
      email: 'test@negocio.pe',
      consent: false,
    });
    expect(noConsent.isValid).toBe(false);
    expect(noConsent.error).toContain('Política de Privacidad');

    // Con consentimiento y teléfono opcional
    const withConsent = validateBetaRequestInput({
      email: 'test@negocio.pe',
      phone: '987654321',
      consent: true,
    });
    expect(withConsent.isValid).toBe(true);
    expect(withConsent.data?.email).toBe('test@negocio.pe');
    expect(withConsent.data?.phone).toBe('987654321');
  });
});

describe('Cotizador PRO - Repositorios y Aislamiento por Usuario', () => {
  const userA = 'user-test-aaa-111';
  const userB = 'user-test-bbb-222';

  it('impide que un usuario acceda o modifique clientes de otro usuario', async () => {
    const client = await clientRepository.create({
      userId: userA,
      name: 'Cliente Privado de A',
      docType: 'dni',
      docNumber: '11223344',
      status: 'active',
    });

    // Usuario A puede ver su cliente
    const foundA = await clientRepository.findById(client.id, userA);
    expect(foundA).not.toBeNull();
    expect(foundA?.name).toBe('Cliente Privado de A');

    // Usuario B NO puede ver el cliente de A
    const foundB = await clientRepository.findById(client.id, userB);
    expect(foundB).toBeNull();

    // Usuario B NO puede editar el cliente de A
    const updateB = await clientRepository.update(client.id, userB, { name: 'Hackeado' });
    expect(updateB).toBeNull();

    // El cliente sigue intacto
    const verifyA = await clientRepository.findById(client.id, userA);
    expect(verifyA?.name).toBe('Cliente Privado de A');
  });

  it('genera correlativos secuenciales sin duplicados y permite duplicar cotizaciones', async () => {
    const calc = calculateQuote({
      items: [{ description: 'Producto Demo', quantity: 3, unitPrice: 50 }],
      includeIgv: true,
    });

    const quoteA1 = await quoteRepository.create(
      {
        userId: userA,
        prefix: 'COT-',
        clientName: 'Cliente A1',
        clientDocType: 'none',
        issueDate: '2026-06-01',
        currency: 'PEN',
        subtotalGross: calc.totals.subtotalGross,
        itemsDiscountTotal: calc.totals.itemsDiscountTotal,
        globalDiscountType: 'none',
        globalDiscountValue: 0,
        globalDiscountAmount: 0,
        discountTotal: calc.totals.discountTotal,
        subtotalNet: calc.totals.subtotalNet,
        taxableBase: calc.totals.taxableBase,
        exemptBase: calc.totals.exemptBase,
        igvRate: calc.totals.igvRate,
        igvAmount: calc.totals.igvAmount,
        totalAmount: calc.totals.totalAmount,
        status: 'draft',
      },
      calc.items.map(i => ({
        sortOrder: i.sortOrder,
        description: i.description,
        type: i.type,
        unit: i.unit,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discountType: i.discountType,
        discountValue: i.discountValue,
        discountAmount: i.discountAmount,
        isIgvAffected: i.isIgvAffected,
        grossAmount: i.grossAmount,
        netAmount: i.netAmount,
      }))
    );

    expect(quoteA1.quote.correlative).toBeGreaterThanOrEqual(1);

    // Duplicar cotización crea una nueva con fecha actual y nuevo correlativo
    const duplicated = await quoteRepository.duplicate(quoteA1.quote.id, userA);
    expect(duplicated).not.toBeNull();
    expect(duplicated?.quote.id).not.toBe(quoteA1.quote.id);
    expect(duplicated?.quote.correlative).toBe(quoteA1.quote.correlative + 1);
    expect(duplicated?.items.length).toBe(1);
    expect(duplicated?.items[0].description).toBe('Producto Demo');
  });

  it('genera CSV con BOM UTF-8 y jamás incluye notas internas privadas', async () => {
    const { generateQuoteCsvString } = await import('@/shared/utils/quoteCsvGenerator');
    const calc = calculateQuote({
      items: [{ description: 'Servicio con tilde: Instalación', quantity: 2, unitPrice: 150 }],
      includeIgv: true,
    });

    const csv = generateQuoteCsvString({
      quoteNumber: 'COT-00042',
      issueDate: '2026-06-15',
      company: { companyName: 'Mi Empresa Perú S.A.C.', companyRuc: '20601234567' },
      client: { name: 'Cliente Arequipa' },
      items: calc.items,
      totals: calc.totals,
      publicNotes: 'Garantía de 6 meses incluida.',
    });

    // Debe comenzar con BOM UTF-8
    expect(csv.startsWith('\uFEFF')).toBe(true);
    // Debe incluir datos reales y caracteres españoles
    expect(csv).toContain('Instalación');
    expect(csv).toContain('COT-00042');
    expect(csv).toContain('Mi Empresa Perú S.A.C.');
    expect(csv).toContain('Garantía de 6 meses incluida.');
    // No debe contener notas internas
    expect(csv).not.toContain('internalNotes');
    expect(csv).not.toContain('Margen de ganancia confidencial');
  });

  it('permite crear y archivar productos en el catálogo persistente con aislamiento por usuario', async () => {
    const item = await catalogRepository.create({
      userId: userA,
      type: 'product',
      name: 'Polo Piqué Algodón 24/1',
      price: 35.0,
      unit: 'unit',
      isIgvAffected: true,
      status: 'active',
    });

    expect(item.id).toBeDefined();
    expect(item.name).toBe('Polo Piqué Algodón 24/1');

    // Usuario B no puede ver el ítem del catálogo de A
    const foundB = await catalogRepository.findById(item.id, userB);
    expect(foundB).toBeNull();

    // Archivar ítem
    const archived = await catalogRepository.archive(item.id, userA);
    expect(archived).toBe(true);

    const activeList = await catalogRepository.findByUserId(userA, { status: 'active' });
    expect(activeList.some(i => i.id === item.id)).toBe(false);
  });
});

