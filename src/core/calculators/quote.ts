/**
 * CALCULAPERÚ - MOTOR DE CÁLCULO MONETARIO PARA COTIZACIONES
 * 
 * Reglas de cálculo financiero:
 * 1. Los cálculos internos se realizan en céntimos enteros (integer cents: valor * 100) para evitar
 *    imprecisiones acumulativas por aritmética de coma flotante IEEE-754.
 * 2. Redondeo: Half-up estándar a 2 decimales para importes monetarios (Math.round(x + EPSILON)).
 *    Se documenta explícitamente que NO es redondeo bancario (round-to-even), sino redondeo comercial
 *    tradicional requerido en facturación y proformas peruanas.
 * 3. Identidades contables garantizadas sin excepción:
 *    - subtotalGross - itemsDiscountTotal = subtotalAfterLinesDiscount
 *    - subtotalAfterLinesDiscount - globalDiscountAmount = subtotalNet
 *    - subtotalGross - discountTotal = subtotalNet
 *    - taxableBase + exemptBase = subtotalNet (los residuos por distribución de descuento global se asignan
 *      de forma determinista al ítem con mayor peso para cerrar exactamente en subtotalNet).
 *    - totalAmount = subtotalNet + igvAmount
 * 4. Tasa de IGV fijada estrictamente en 18% (0.18) mientras no exista legislación variable.
 */

export type DiscountType = 'none' | 'percent' | 'fixed';
export type UnitType = 'unit' | 'service' | 'hour' | 'day' | 'kg' | 'meter' | 'pack' | 'other';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'canceled';

export interface QuoteItemInput {
  id?: string;
  clientId?: string;
  catalogItemId?: string | null;
  sortOrder?: number;
  description: string;
  type?: 'product' | 'service';
  unit?: UnitType;
  quantity: number;
  unitPrice: number;
  discountType?: DiscountType;
  discountValue?: number;
  isIgvAffected?: boolean;
}

export interface QuoteCalculatedItem {
  id?: string;
  clientId?: string;
  catalogItemId?: string | null;
  sortOrder: number;
  description: string;
  type: 'product' | 'service';
  unit: UnitType;
  quantity: number;
  unitPrice: number;
  discountType: DiscountType;
  discountValue: number;
  isIgvAffected: boolean;
  grossAmount: number; // cantidad * precio unitario redondeado
  discountAmount: number; // descuento específico de la línea
  netAmount: number; // grossAmount - discountAmount
}

export interface QuoteCalculationOptions {
  items: QuoteItemInput[];
  includeIgv?: boolean; // si el usuario elige aplicar IGV al documento comercial
  igvRate?: number; // Tasa permitida: 0.18 fijada
  globalDiscountType?: DiscountType;
  globalDiscountValue?: number;
}

export interface QuoteTotals {
  subtotalGross: number; // Suma de grossAmount de todas las líneas
  itemsDiscountTotal: number; // Suma de descuentos individuales
  globalDiscountAmount: number; // Descuento global aplicado
  discountTotal: number; // itemsDiscountTotal + globalDiscountAmount
  subtotalNet: number; // subtotalGross - discountTotal
  taxableBase: number; // Base imponible gravada exacta
  exemptBase: number; // Base inafecta exacta
  igvRate: number; // 0.18 o 0
  igvAmount: number; // taxableBase * igvRate
  totalAmount: number; // subtotalNet + igvAmount
  itemsCount: number;
  totalQuantity: number;
}

export interface QuoteCalculationResult {
  items: QuoteCalculatedItem[];
  totals: QuoteTotals;
  isValid: boolean;
  errors: string[];
}

export const QUOTE_LIMITS = {
  MAX_ITEMS: 100,
  MAX_QUANTITY: 999999.999,
  MIN_QUANTITY: 0.001,
  MAX_PRICE: 999999999.99,
  MIN_PRICE: 0,
  MAX_DESCRIPTION_LENGTH: 200,
  MIN_DESCRIPTION_LENGTH: 2,
  DEFAULT_IGV_RATE: 0.18,
};

/**
 * Convierte un número a céntimos enteros (integer cents) con redondeo comercial half-up.
 */
export function toCents(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100);
}

/**
 * Convierte céntimos enteros a número con 2 decimales.
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Redondeo half-up para cantidades decimales (como unidades físicas hasta 3 decimales).
 */
export function roundHalfUp(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Valida un concepto individual de cotización verificando rangos estrictos y consistencia.
 */
export function validateQuoteItemInput(
  item: unknown,
  index = 0
): { isValid: boolean; error?: string; cleanItem?: QuoteItemInput } {
  if (!item || typeof item !== 'object') {
    return { isValid: false, error: `El concepto #${index + 1} no es un objeto válido.` };
  }

  const raw = item as Record<string, unknown>;
  const description = typeof raw.description === 'string' ? raw.description.trim() : '';

  if (
    description.length < QUOTE_LIMITS.MIN_DESCRIPTION_LENGTH ||
    description.length > QUOTE_LIMITS.MAX_DESCRIPTION_LENGTH
  ) {
    return {
      isValid: false,
      error: `La descripción del concepto #${index + 1} debe tener entre ${QUOTE_LIMITS.MIN_DESCRIPTION_LENGTH} y ${QUOTE_LIMITS.MAX_DESCRIPTION_LENGTH} caracteres.`,
    };
  }

  const quantity = Number(raw.quantity);
  if (!Number.isFinite(quantity) || quantity < QUOTE_LIMITS.MIN_QUANTITY || quantity > QUOTE_LIMITS.MAX_QUANTITY) {
    return {
      isValid: false,
      error: `La cantidad del concepto #${index + 1} debe estar entre ${QUOTE_LIMITS.MIN_QUANTITY} y ${QUOTE_LIMITS.MAX_QUANTITY}.`,
    };
  }

  // Comprobar que no tenga más de 3 decimales
  const qtyStr = typeof raw.quantity === 'number' ? raw.quantity.toString() : String(raw.quantity);
  const parts = qtyStr.split('.');
  if (parts[1] && parts[1].length > 3) {
    return {
      isValid: false,
      error: `La cantidad del concepto #${index + 1} no puede tener más de 3 decimales.`,
    };
  }

  const unitPrice = Number(raw.unitPrice);
  if (!Number.isFinite(unitPrice) || unitPrice < QUOTE_LIMITS.MIN_PRICE || unitPrice > QUOTE_LIMITS.MAX_PRICE) {
    return {
      isValid: false,
      error: `El precio unitario del concepto #${index + 1} no puede ser negativo ni superar ${QUOTE_LIMITS.MAX_PRICE}.`,
    };
  }

  // Comprobar que no tenga más de 2 decimales
  const priceStr = typeof raw.unitPrice === 'number' ? raw.unitPrice.toString() : String(raw.unitPrice);
  const priceParts = priceStr.split('.');
  if (priceParts[1] && priceParts[1].length > 2) {
    return {
      isValid: false,
      error: `El precio unitario del concepto #${index + 1} no puede tener más de 2 decimales.`,
    };
  }

  let discountType: DiscountType = 'none';
  if (raw.discountType === 'percent' || raw.discountType === 'fixed') {
    discountType = raw.discountType;
  }

  let discountValue = Number(raw.discountValue ?? 0);
  if (!Number.isFinite(discountValue) || discountValue < 0) {
    discountValue = 0;
    discountType = 'none';
  }

  if (discountType === 'percent' && discountValue > 100) {
    return {
      isValid: false,
      error: `El descuento porcentual del concepto #${index + 1} no puede superar el 100%.`,
    };
  }

  // Bruto de línea en céntimos
  const grossCents = Math.round(roundHalfUp(quantity, 3) * unitPrice * 100);
  const fixedDiscountCents = toCents(discountValue);

  if (discountType === 'fixed' && fixedDiscountCents > grossCents) {
    return {
      isValid: false,
      error: `El descuento fijo del concepto #${index + 1} (S/ ${discountValue.toFixed(2)}) no puede exceder el importe bruto de la línea (S/ ${(grossCents / 100).toFixed(2)}).`,
    };
  }

  const validUnits: UnitType[] = ['unit', 'service', 'hour', 'day', 'kg', 'meter', 'pack', 'other'];
  const unit: UnitType =
    typeof raw.unit === 'string' && validUnits.includes(raw.unit as UnitType)
      ? (raw.unit as UnitType)
      : 'unit';

  const type: 'product' | 'service' = raw.type === 'service' ? 'service' : 'product';
  const isIgvAffected = raw.isIgvAffected !== undefined ? Boolean(raw.isIgvAffected) : true;

  return {
    isValid: true,
    cleanItem: {
      id: typeof raw.id === 'string' ? raw.id : undefined,
      clientId: typeof raw.clientId === 'string' ? raw.clientId : undefined,
      catalogItemId: typeof raw.catalogItemId === 'string' ? raw.catalogItemId : null,
      sortOrder: typeof raw.sortOrder === 'number' && Number.isFinite(raw.sortOrder) ? raw.sortOrder : index,
      description,
      type,
      unit,
      quantity: roundHalfUp(quantity, 3),
      unitPrice: roundHalfUp(unitPrice, 2),
      discountType,
      discountValue: discountType === 'none' ? 0 : roundHalfUp(discountValue, 2),
      isIgvAffected,
    },
  };
}

/**
 * Función central de cálculo para cotizaciones comerciales de CalculaPerú.
 * 
 * Garantiza de forma estricta:
 * 1. subtotalGross - itemsDiscountTotal = subtotalAfterLinesDiscount
 * 2. subtotalAfterLinesDiscount - globalDiscountAmount = subtotalNet
 * 3. taxableBase + exemptBase === subtotalNet
 * 4. totalAmount === subtotalNet + igvAmount
 */
export function calculateQuote(options: QuoteCalculationOptions): QuoteCalculationResult {
  const errors: string[] = [];
  const rawItems = options.items || [];

  if (rawItems.length === 0) {
    return {
      items: [],
      totals: {
        subtotalGross: 0,
        itemsDiscountTotal: 0,
        globalDiscountAmount: 0,
        discountTotal: 0,
        subtotalNet: 0,
        taxableBase: 0,
        exemptBase: 0,
        igvRate: options.includeIgv ? QUOTE_LIMITS.DEFAULT_IGV_RATE : 0,
        igvAmount: 0,
        totalAmount: 0,
        itemsCount: 0,
        totalQuantity: 0,
      },
      isValid: true,
      errors: [],
    };
  }

  if (rawItems.length > QUOTE_LIMITS.MAX_ITEMS) {
    errors.push(`Una cotización no puede contener más de ${QUOTE_LIMITS.MAX_ITEMS} conceptos.`);
  }

  const calculatedItems: QuoteCalculatedItem[] = [];
  let subtotalGrossCents = 0;
  let itemsDiscountCents = 0;
  let totalQuantityAcc = 0;

  for (let i = 0; i < rawItems.length; i++) {
    const val = validateQuoteItemInput(rawItems[i], i);
    if (!val.isValid || !val.cleanItem) {
      errors.push(val.error || `Error en concepto #${i + 1}`);
      continue;
    }

    const item = val.cleanItem;
    // Multiplicación exacta: cantidad (3 dec) * unitPrice (2 dec) -> céntimos enteros
    const rawGross = item.quantity * item.unitPrice;
    const grossCents = toCents(rawGross);

    let lineDiscountCents = 0;
    if (item.discountType === 'percent') {
      const pct = Math.max(0, Math.min(100, item.discountValue || 0));
      lineDiscountCents = Math.round((grossCents * pct) / 100);
    } else if (item.discountType === 'fixed') {
      lineDiscountCents = Math.min(grossCents, toCents(item.discountValue || 0));
    }

    const netCents = Math.max(0, grossCents - lineDiscountCents);

    calculatedItems.push({
      id: item.id,
      clientId: item.clientId,
      catalogItemId: item.catalogItemId,
      sortOrder: item.sortOrder ?? i,
      description: item.description,
      type: item.type ?? 'product',
      unit: item.unit ?? 'unit',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountType: item.discountType ?? 'none',
      discountValue: item.discountValue ?? 0,
      isIgvAffected: Boolean(item.isIgvAffected),
      grossAmount: fromCents(grossCents),
      discountAmount: fromCents(lineDiscountCents),
      netAmount: fromCents(netCents),
    });

    subtotalGrossCents += grossCents;
    itemsDiscountCents += lineDiscountCents;
    totalQuantityAcc += item.quantity;
  }

  const subtotalAfterLinesCents = Math.max(0, subtotalGrossCents - itemsDiscountCents);

  // Descuento global
  let globalDiscountCents = 0;
  const globalDiscountType = options.globalDiscountType || 'none';
  const globalDiscountVal = Math.max(0, options.globalDiscountValue || 0);

  if (globalDiscountType === 'percent') {
    if (globalDiscountVal > 100) {
      errors.push('El descuento global porcentual no puede superar el 100%.');
    } else {
      globalDiscountCents = Math.round((subtotalAfterLinesCents * globalDiscountVal) / 100);
    }
  } else if (globalDiscountType === 'fixed') {
    const fixedCents = toCents(globalDiscountVal);
    if (fixedCents > subtotalAfterLinesCents) {
      errors.push(
        `El descuento global fijo (S/ ${globalDiscountVal.toFixed(2)}) no puede exceder el subtotal neto de líneas (S/ ${fromCents(subtotalAfterLinesCents).toFixed(2)}).`
      );
    } else {
      globalDiscountCents = fixedCents;
    }
  }

  // Límites de seguridad: global discount nunca mayor al subtotal restante
  globalDiscountCents = Math.min(subtotalAfterLinesCents, globalDiscountCents);

  const discountTotalCents = itemsDiscountCents + globalDiscountCents;
  const subtotalNetCents = Math.max(0, subtotalGrossCents - discountTotalCents);

  // Distribuir el descuento global de forma proporcional y determinista entre las líneas
  // para calcular exactamente la base gravada y la base inafecta, garantizando:
  // taxableBaseCents + exemptBaseCents === subtotalNetCents
  let taxableBaseCents = 0;
  let exemptBaseCents = 0;

  if (subtotalAfterLinesCents === 0 || globalDiscountCents === 0) {
    for (const item of calculatedItems) {
      const itemNetCents = toCents(item.netAmount);
      if (item.isIgvAffected) {
        taxableBaseCents += itemNetCents;
      } else {
        exemptBaseCents += itemNetCents;
      }
    }
  } else {
    // Reparto del descuento proporcional con distribución de residuos al ítem de mayor importe
    let allocatedDiscountCents = 0;
    const lineDiscountDeltas: number[] = [];

    for (let i = 0; i < calculatedItems.length; i++) {
      const lineNet = toCents(calculatedItems[i].netAmount);
      if (lineNet === 0) {
        lineDiscountDeltas.push(0);
        continue;
      }
      // Porción del descuento global que le corresponde a la línea
      const share = Math.floor((lineNet * globalDiscountCents) / subtotalAfterLinesCents);
      lineDiscountDeltas.push(share);
      allocatedDiscountCents += share;
    }

    // Residual por diferencias de redondeo entero: se distribuye de 1 en 1 céntimo a los ítems con mayor fracción no asignada
    let remainder = globalDiscountCents - allocatedDiscountCents;
    if (remainder > 0) {
      const sortedIndices = calculatedItems
        .map((it, idx) => ({
          idx,
          fraction: ((toCents(it.netAmount) * globalDiscountCents) % subtotalAfterLinesCents),
          amount: toCents(it.netAmount),
        }))
        .filter(entry => entry.amount > 0)
        .sort((a, b) => b.fraction - a.fraction || b.amount - a.amount);

      let rIdx = 0;
      while (remainder > 0 && sortedIndices.length > 0) {
        const target = sortedIndices[rIdx % sortedIndices.length];
        lineDiscountDeltas[target.idx] += 1;
        remainder--;
        rIdx++;
      }
    }

    for (let i = 0; i < calculatedItems.length; i++) {
      const lineNet = toCents(calculatedItems[i].netAmount);
      const discountForLine = lineDiscountDeltas[i] || 0;
      const finalLineNet = Math.max(0, lineNet - discountForLine);

      if (calculatedItems[i].isIgvAffected) {
        taxableBaseCents += finalLineNet;
      } else {
        exemptBaseCents += finalLineNet;
      }
    }
  }

  // Verificación estricta de identidad contable en céntimos:
  // taxableBaseCents + exemptBaseCents SIEMPRE debe ser exactamente subtotalNetCents
  const baseDiff = subtotalNetCents - (taxableBaseCents + exemptBaseCents);
  if (baseDiff !== 0) {
    if (taxableBaseCents > 0) {
      taxableBaseCents += baseDiff;
    } else {
      exemptBaseCents += baseDiff;
    }
  }

  // Tasa de IGV: fijada en 18% estricto si includeIgv es true
  const includeIgv = Boolean(options.includeIgv);
  const igvRate = includeIgv ? QUOTE_LIMITS.DEFAULT_IGV_RATE : 0;
  const igvAmountCents = includeIgv ? Math.round(taxableBaseCents * QUOTE_LIMITS.DEFAULT_IGV_RATE) : 0;
  const totalAmountCents = subtotalNetCents + igvAmountCents;

  return {
    items: calculatedItems,
    totals: {
      subtotalGross: fromCents(subtotalGrossCents),
      itemsDiscountTotal: fromCents(itemsDiscountCents),
      globalDiscountAmount: fromCents(globalDiscountCents),
      discountTotal: fromCents(discountTotalCents),
      subtotalNet: fromCents(subtotalNetCents),
      taxableBase: fromCents(taxableBaseCents),
      exemptBase: fromCents(exemptBaseCents),
      igvRate,
      igvAmount: fromCents(igvAmountCents),
      totalAmount: fromCents(totalAmountCents),
      itemsCount: calculatedItems.length,
      totalQuantity: roundHalfUp(totalQuantityAcc, 3),
    },
    isValid: errors.length === 0,
    errors,
  };
}
