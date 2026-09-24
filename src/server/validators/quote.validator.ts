import { validateQuoteItemInput, QuoteItemInput, DiscountType, UnitType, QuoteStatus, QUOTE_LIMITS } from '@/core/calculators/quote';

export function normalizePhone(raw?: string): string | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  const clean = raw.trim().replace(/[^\d+]/g, '');
  if (clean.length < 7 || clean.length > 15) return undefined;
  return clean;
}

export function isValidEmail(raw?: string): boolean {
  if (!raw || typeof raw !== 'string') return false;
  const clean = raw.trim();
  if (clean.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

export function isValidUuid(id?: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim());
}

export function isValidDateString(dateStr?: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export function validateDocNumber(docType: string, docNumber?: string): { isValid: boolean; error?: string } {
  if (!docNumber || !docNumber.trim()) return { isValid: true };
  const clean = docNumber.trim();

  if (docType === 'dni') {
    if (!/^\d{8}$/.test(clean)) {
      return { isValid: false, error: 'El DNI debe contener exactamente 8 dígitos numéricos.' };
    }
  } else if (docType === 'ruc') {
    if (!/^\d{11}$/.test(clean)) {
      return { isValid: false, error: 'El RUC debe contener exactamente 11 dígitos numéricos.' };
    }
  } else if (docType === 'other') {
    if (clean.length < 3 || clean.length > 20 || !/^[A-Za-z0-9_-]+$/.test(clean)) {
      return { isValid: false, error: 'El documento debe contener entre 3 y 20 caracteres alfanuméricos.' };
    }
  }

  return { isValid: true };
}

export interface ValidatedClientPayload {
  name: string;
  docType: 'none' | 'dni' | 'ruc' | 'other';
  docNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export function validateClientInput(data: unknown): { isValid: boolean; error?: string; data?: ValidatedClientPayload } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos de cliente inválidos.' };
  }

  const raw = data as Record<string, unknown>;
  if (typeof raw.name !== 'string') {
    return { isValid: false, error: 'El nombre del cliente es obligatorio.' };
  }
  const name = raw.name.trim();
  if (name.length < 2 || name.length > 150) {
    return { isValid: false, error: 'El nombre o razón social del cliente debe tener entre 2 y 150 caracteres.' };
  }

  const validDocTypes = ['none', 'dni', 'ruc', 'other'];
  const docType = typeof raw.docType === 'string' && validDocTypes.includes(raw.docType)
    ? (raw.docType as 'none' | 'dni' | 'ruc' | 'other')
    : 'none';

  const docNumber = typeof raw.docNumber === 'string' && raw.docNumber.trim() ? raw.docNumber.trim() : undefined;
  const docCheck = validateDocNumber(docType, docNumber);
  if (!docCheck.isValid) {
    return { isValid: false, error: docCheck.error };
  }

  let phone: string | undefined = undefined;
  if (raw.phone && typeof raw.phone === 'string' && raw.phone.trim()) {
    phone = normalizePhone(raw.phone);
    if (!phone) {
      return { isValid: false, error: 'El teléfono debe contener entre 7 y 15 dígitos numéricos.' };
    }
  }

  let email: string | undefined = undefined;
  if (raw.email && typeof raw.email === 'string' && raw.email.trim()) {
    if (!isValidEmail(raw.email)) {
      return { isValid: false, error: 'El correo electrónico del cliente no tiene un formato válido o excede 254 caracteres.' };
    }
    email = raw.email.trim().toLowerCase();
  }

  let address: string | undefined = undefined;
  if (raw.address !== undefined && raw.address !== null) {
    if (typeof raw.address !== 'string') {
      return { isValid: false, error: 'La dirección debe ser una cadena de texto.' };
    }
    const cleanAddr = raw.address.trim();
    if (cleanAddr.length > 180) {
      return { isValid: false, error: 'La dirección no puede exceder los 180 caracteres.' };
    }
    if (cleanAddr.length > 0) address = cleanAddr;
  }

  let notes: string | undefined = undefined;
  if (raw.notes !== undefined && raw.notes !== null) {
    if (typeof raw.notes !== 'string') {
      return { isValid: false, error: 'Las notas deben ser una cadena de texto.' };
    }
    const cleanNotes = raw.notes.trim();
    if (cleanNotes.length > 500) {
      return { isValid: false, error: 'Las notas no pueden exceder los 500 caracteres.' };
    }
    if (cleanNotes.length > 0) notes = cleanNotes;
  }

  return {
    isValid: true,
    data: {
      name,
      docType,
      docNumber,
      phone,
      email,
      address,
      notes,
    },
  };
}

export interface ValidatedCatalogItemPayload {
  type: 'product' | 'service';
  name: string;
  description?: string;
  sku?: string;
  unit: UnitType;
  price: number;
  isIgvAffected: boolean;
}

export function validateCatalogItemInput(data: unknown): { isValid: boolean; error?: string; data?: ValidatedCatalogItemPayload } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos de producto o servicio inválidos.' };
  }

  const raw = data as Record<string, unknown>;
  if (typeof raw.name !== 'string') {
    return { isValid: false, error: 'El nombre del ítem es obligatorio.' };
  }
  const name = raw.name.trim();
  if (name.length < 2 || name.length > 120) {
    return { isValid: false, error: 'El nombre del ítem debe tener entre 2 y 120 caracteres.' };
  }

  const type: 'product' | 'service' = raw.type === 'service' ? 'service' : 'product';

  const validUnits: UnitType[] = ['unit', 'service', 'hour', 'day', 'kg', 'meter', 'pack', 'other'];
  const unit: UnitType = typeof raw.unit === 'string' && validUnits.includes(raw.unit as UnitType)
    ? (raw.unit as UnitType)
    : 'unit';

  const price = Number(raw.price);
  if (!Number.isFinite(price) || price < 0 || price > 999999999.99) {
    return { isValid: false, error: 'El precio debe ser un número positivo de hasta S/ 999,999,999.99.' };
  }

  const priceStr = String(raw.price);
  const parts = priceStr.split('.');
  if (parts[1] && parts[1].length > 2) {
    return { isValid: false, error: 'El precio no puede tener más de 2 decimales.' };
  }

  let description: string | undefined = undefined;
  if (raw.description !== undefined && raw.description !== null) {
    if (typeof raw.description !== 'string') {
      return { isValid: false, error: 'La descripción debe ser un texto.' };
    }
    const cleanDesc = raw.description.trim();
    if (cleanDesc.length > 300) {
      return { isValid: false, error: 'La descripción no puede superar los 300 caracteres.' };
    }
    if (cleanDesc.length > 0) description = cleanDesc;
  }

  let sku: string | undefined = undefined;
  if (raw.sku !== undefined && raw.sku !== null) {
    if (typeof raw.sku !== 'string') {
      return { isValid: false, error: 'El código SKU debe ser un texto.' };
    }
    const cleanSku = raw.sku.trim();
    if (cleanSku.length > 40) {
      return { isValid: false, error: 'El SKU no puede superar los 40 caracteres.' };
    }
    if (cleanSku.length > 0) sku = cleanSku;
  }

  const isIgvAffected = raw.isIgvAffected !== undefined ? Boolean(raw.isIgvAffected) : true;

  return {
    isValid: true,
    data: {
      type,
      name,
      description,
      sku,
      unit,
      price: Math.round(price * 100) / 100,
      isIgvAffected,
    },
  };
}

export interface ValidatedQuotePayload {
  prefix: string;
  clientId?: string;
  clientName: string;
  clientDocType: 'none' | 'dni' | 'ruc' | 'other';
  clientDocNumber?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  issueDate: string;
  validUntil?: string;
  items: QuoteItemInput[];
  includeIgv: boolean;
  igvRate: number;
  globalDiscountType: DiscountType;
  globalDiscountValue: number;
  paymentTerms?: string;
  deliveryTime?: string;
  publicNotes?: string;
  internalNotes?: string;
  status: QuoteStatus;
}

export function validateQuoteInput(data: unknown): { isValid: boolean; error?: string; data?: ValidatedQuotePayload } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos de la cotización inválidos.' };
  }

  const raw = data as Record<string, unknown>;

  if (typeof raw.clientName !== 'string') {
    return { isValid: false, error: 'El nombre del cliente es obligatorio para guardar o emitir la cotización.' };
  }
  const clientName = raw.clientName.trim();
  if (clientName.length < 2 || clientName.length > 150) {
    return { isValid: false, error: 'El nombre o razón social del cliente debe tener entre 2 y 150 caracteres.' };
  }

  const validDocTypes = ['none', 'dni', 'ruc', 'other'];
  const clientDocType = typeof raw.clientDocType === 'string' && validDocTypes.includes(raw.clientDocType)
    ? (raw.clientDocType as 'none' | 'dni' | 'ruc' | 'other')
    : 'none';

  const clientDocNumber = typeof raw.clientDocNumber === 'string' && raw.clientDocNumber.trim() ? raw.clientDocNumber.trim() : undefined;
  const docCheck = validateDocNumber(clientDocType, clientDocNumber);
  if (!docCheck.isValid) {
    return { isValid: false, error: docCheck.error };
  }

  let clientPhone: string | undefined = undefined;
  if (raw.clientPhone && typeof raw.clientPhone === 'string' && raw.clientPhone.trim()) {
    clientPhone = normalizePhone(raw.clientPhone);
    if (!clientPhone) {
      return { isValid: false, error: 'El teléfono del cliente debe tener entre 7 y 15 dígitos numéricos.' };
    }
  }

  let clientEmail: string | undefined = undefined;
  if (raw.clientEmail && typeof raw.clientEmail === 'string' && raw.clientEmail.trim()) {
    if (!isValidEmail(raw.clientEmail)) {
      return { isValid: false, error: 'El correo electrónico del cliente no tiene un formato válido o excede 254 caracteres.' };
    }
    clientEmail = raw.clientEmail.trim().toLowerCase();
  }

  let clientAddress: string | undefined = undefined;
  if (raw.clientAddress !== undefined && raw.clientAddress !== null) {
    if (typeof raw.clientAddress !== 'string') {
      return { isValid: false, error: 'La dirección del cliente debe ser un texto.' };
    }
    const cleanAddr = raw.clientAddress.trim();
    if (cleanAddr.length > 180) {
      return { isValid: false, error: 'La dirección del cliente no puede exceder 180 caracteres.' };
    }
    if (cleanAddr.length > 0) clientAddress = cleanAddr;
  }

  let clientId: string | undefined = undefined;
  if (raw.clientId !== undefined && raw.clientId !== null) {
    if (typeof raw.clientId !== 'string' || !isValidUuid(raw.clientId)) {
      return { isValid: false, error: 'El identificador de cliente seleccionado no es válido (UUID requerido).' };
    }
    clientId = raw.clientId.trim();
  }

  // Prefijo: 1 a 10 caracteres alfanuméricos o guión. No convertir silenciosamente un prefijo inválido en COT
  let prefix = 'COT';
  if (raw.prefix !== undefined && raw.prefix !== null) {
    if (typeof raw.prefix !== 'string' || !/^[A-Za-z0-9_-]{1,10}$/.test(raw.prefix.trim())) {
      return { isValid: false, error: 'El prefijo de la cotización debe contener entre 1 y 10 caracteres alfanuméricos (ej: COT, SER-).' };
    }
    prefix = raw.prefix.trim().toUpperCase();
  }

  // Fechas reales comprobadas con calendario gregoriano
  if (typeof raw.issueDate !== 'string' || !isValidDateString(raw.issueDate)) {
    return { isValid: false, error: 'La fecha de emisión debe ser una fecha real válida en formato YYYY-MM-DD.' };
  }
  const issueDate = raw.issueDate;

  let validUntil: string | undefined = undefined;
  if (raw.validUntil !== undefined && raw.validUntil !== null && String(raw.validUntil).trim() !== '') {
    if (typeof raw.validUntil !== 'string' || !isValidDateString(raw.validUntil)) {
      return { isValid: false, error: 'La fecha de vigencia debe ser una fecha real válida en formato YYYY-MM-DD.' };
    }
    if (raw.validUntil < issueDate) {
      return { isValid: false, error: 'La fecha de vencimiento no puede ser anterior a la fecha de emisión.' };
    }
    validUntil = raw.validUntil;
  }

  if (!Array.isArray(raw.items) || raw.items.length === 0) {
    return { isValid: false, error: 'La cotización debe contener al menos un concepto o ítem.' };
  }

  if (raw.items.length > QUOTE_LIMITS.MAX_ITEMS) {
    return { isValid: false, error: `La cotización no puede tener más de ${QUOTE_LIMITS.MAX_ITEMS} conceptos.` };
  }

  const validatedItems: QuoteItemInput[] = [];
  for (let i = 0; i < raw.items.length; i++) {
    const itemVal = validateQuoteItemInput(raw.items[i], i);
    if (!itemVal.isValid || !itemVal.cleanItem) {
      return { isValid: false, error: itemVal.error || `Error en el concepto #${i + 1}` };
    }
    if (itemVal.cleanItem.catalogItemId && !isValidUuid(itemVal.cleanItem.catalogItemId)) {
      return { isValid: false, error: `El producto de catálogo del concepto #${i + 1} no tiene un UUID válido.` };
    }
    validatedItems.push(itemVal.cleanItem);
  }

  // Boolean estricto sin permitir "false" como truthy
  const includeIgv = raw.includeIgv === true || raw.includeIgv === 1 || raw.includeIgv === 'true';
  const igvRate = includeIgv ? QUOTE_LIMITS.DEFAULT_IGV_RATE : 0;

  let globalDiscountType: DiscountType = 'none';
  if (raw.globalDiscountType === 'percent' || raw.globalDiscountType === 'fixed') {
    globalDiscountType = raw.globalDiscountType;
  }

  let globalDiscountValue = 0;
  if (raw.globalDiscountValue !== undefined && raw.globalDiscountValue !== null) {
    const gdVal = Number(raw.globalDiscountValue);
    if (!Number.isFinite(gdVal) || gdVal < 0) {
      return { isValid: false, error: 'El valor del descuento global no puede ser negativo ni inválido.' };
    }
    if (globalDiscountType === 'percent' && gdVal > 100) {
      return { isValid: false, error: 'El descuento global porcentual no puede exceder el 100%.' };
    }
    globalDiscountValue = Math.round(gdVal * 100) / 100;
  }

  const validStatuses: QuoteStatus[] = ['draft', 'sent', 'accepted', 'rejected', 'expired', 'canceled'];
  if (raw.status !== undefined && raw.status !== null) {
    if (typeof raw.status !== 'string' || !validStatuses.includes(raw.status as QuoteStatus)) {
      return { isValid: false, error: 'El estado de la cotización no es válido.' };
    }
  }
  const status: QuoteStatus = (raw.status as QuoteStatus) || 'draft';

  const checkMaxLength = (val: unknown, max: number, label: string): string | undefined => {
    if (val === undefined || val === null) return undefined;
    if (typeof val !== 'string') throw new Error(`El campo ${label} debe ser un texto.`);
    const clean = val.trim();
    if (clean.length > max) throw new Error(`El campo ${label} no puede superar los ${max} caracteres.`);
    return clean.length > 0 ? clean : undefined;
  };

  try {
    const paymentTerms = checkMaxLength(raw.paymentTerms, 500, 'Condiciones de pago');
    const deliveryTime = checkMaxLength(raw.deliveryTime, 150, 'Tiempo de entrega');
    const publicNotes = checkMaxLength(raw.publicNotes, 700, 'Observaciones');
    const internalNotes = checkMaxLength(raw.internalNotes, 700, 'Notas internas');

    return {
      isValid: true,
      data: {
        prefix,
        clientId,
        clientName,
        clientDocType,
        clientDocNumber,
        clientPhone,
        clientEmail,
        clientAddress,
        issueDate,
        validUntil,
        items: validatedItems,
        includeIgv,
        igvRate,
        globalDiscountType,
        globalDiscountValue,
        paymentTerms,
        deliveryTime,
        publicNotes,
        internalNotes,
        status,
      },
    };
  } catch (err: unknown) {
    return { isValid: false, error: err instanceof Error ? err.message : 'Error de validación.' };
  }
}

export function validateBetaRequestInput(data: unknown): {
  isValid: boolean;
  error?: string;
  data?: {
    email: string;
    phone?: string;
    businessType?: string;
    featureNeeded?: string;
    consent: boolean;
    consentTextVersion: string;
  };
} {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos de solicitud inválidos.' };
  }

  const raw = data as Record<string, unknown>;
  const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Ingresa un correo electrónico de contacto válido.' };
  }

  let phone: string | undefined = undefined;
  if (raw.phone && typeof raw.phone === 'string' && raw.phone.trim()) {
    phone = normalizePhone(raw.phone);
    if (!phone) {
      return { isValid: false, error: 'El número de teléfono debe tener entre 7 y 15 dígitos numéricos.' };
    }
  }

  let businessType: string | undefined = undefined;
  if (raw.businessType !== undefined && raw.businessType !== null) {
    if (typeof raw.businessType !== 'string') {
      return { isValid: false, error: 'El tipo de negocio debe ser texto.' };
    }
    const cleanB = raw.businessType.trim();
    if (cleanB.length > 100) {
      return { isValid: false, error: 'El tipo de negocio no puede superar los 100 caracteres.' };
    }
    if (cleanB.length > 0) businessType = cleanB;
  }

  let featureNeeded: string | undefined = undefined;
  if (raw.featureNeeded !== undefined && raw.featureNeeded !== null) {
    if (typeof raw.featureNeeded !== 'string') {
      return { isValid: false, error: 'La necesidad o función debe ser texto.' };
    }
    const cleanF = raw.featureNeeded.trim();
    if (cleanF.length > 0) {
      if (cleanF.length < 10 || cleanF.length > 1000) {
        return { isValid: false, error: 'Cuéntanos qué función necesitas (entre 10 y 1,000 caracteres).' };
      }
      featureNeeded = cleanF;
    }
  }

  if (raw.consent !== true) {
    return { isValid: false, error: 'Debes aceptar la Política de Privacidad de forma expresa para registrar tu solicitud.' };
  }

  return {
    isValid: true,
    data: {
      email,
      phone,
      businessType,
      featureNeeded,
      consent: true,
      consentTextVersion: '2026-v2',
    },
  };
}
