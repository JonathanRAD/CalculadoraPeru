/**
 * quoteEditor.ts
 *
 * Utilidades puras de gestión de estado del editor de cotizaciones.
 * Garantiza identidad estable del lado del cliente (clientId), modelo de vista combinado
 * para filas incompletas y validaciones estrictas antes de persistir o exportar.
 */

import {
  QuoteItemInput,
  QuoteCalculatedItem,
  validateQuoteItemInput,
} from '@/core/calculators/quote';

export type EditableQuoteItem = QuoteItemInput & { clientId: string };

/**
 * Genera un identificador único y estable para cada fila en el navegador.
 */
export function generateClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Crea un concepto vacío editable con valores por defecto y clave estable.
 */
export function createEmptyQuoteItem(sortOrder = 0): EditableQuoteItem {
  return {
    clientId: generateClientId(),
    description: '',
    type: 'product',
    unit: 'unit',
    quantity: 1,
    unitPrice: 0,
    discountType: 'none',
    discountValue: 0,
    isIgvAffected: true,
    sortOrder,
  };
}

/**
 * Construye el modelo de vista combinado para renderizar las filas en la interfaz.
 * Se alimenta de la colección fuente `items` para que las filas incompletas o vacías
 * sigan siendo visibles y editables, asociando los cálculos monetarios por `clientId`.
 */
export function buildRowViewModels(
  items: EditableQuoteItem[],
  calculatedItems: QuoteCalculatedItem[]
): QuoteCalculatedItem[] {
  const calcMap = new Map<string, QuoteCalculatedItem>();
  for (const calc of calculatedItems) {
    if (calc.clientId) {
      calcMap.set(calc.clientId, calc);
    }
  }

  return items.map((rawItem, idx) => {
    const calc = rawItem.clientId ? calcMap.get(rawItem.clientId) : undefined;
    if (calc) {
      return calc;
    }

    // Estimación preventiva para filas en edición/incompletas
    const quantity = Number(rawItem.quantity) || 0;
    const unitPrice = Number(rawItem.unitPrice) || 0;
    const grossCents = Math.round(quantity * unitPrice * 100);
    let lineDiscountCents = 0;
    if (rawItem.discountType === 'percent') {
      const pct = Math.max(0, Math.min(100, Number(rawItem.discountValue) || 0));
      lineDiscountCents = Math.round((grossCents * pct) / 100);
    } else if (rawItem.discountType === 'fixed') {
      lineDiscountCents = Math.min(grossCents, Math.round((Number(rawItem.discountValue) || 0) * 100));
    }
    const netCents = Math.max(0, grossCents - lineDiscountCents);

    return {
      id: rawItem.id,
      clientId: rawItem.clientId,
      catalogItemId: rawItem.catalogItemId ?? null,
      sortOrder: typeof rawItem.sortOrder === 'number' ? rawItem.sortOrder : idx,
      description: rawItem.description || '',
      type: rawItem.type || 'product',
      unit: rawItem.unit || 'unit',
      quantity: rawItem.quantity,
      unitPrice: rawItem.unitPrice,
      discountType: rawItem.discountType || 'none',
      discountValue: rawItem.discountValue || 0,
      isIgvAffected: rawItem.isIgvAffected !== false,
      grossAmount: grossCents / 100,
      discountAmount: lineDiscountCents / 100,
      netAmount: netCents / 100,
    };
  });
}

/**
 * Valida de forma integral que todos los conceptos sean válidos antes de guardar o exportar.
 * Devuelve un mensaje claro señalando el número de concepto afectado.
 */
export function validateItemsForAction(
  items: EditableQuoteItem[],
  actionLabel = 'guardar'
): { isValid: boolean; error?: string } {
  if (items.length === 0) {
    return {
      isValid: false,
      error: `La cotización debe contener al menos un concepto para ${actionLabel}.`,
    };
  }

  for (let i = 0; i < items.length; i++) {
    const val = validateQuoteItemInput(items[i], i);
    if (!val.isValid) {
      return {
        isValid: false,
        error: val.error || `El concepto #${i + 1} está incompleto o no es válido para ${actionLabel}.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Normaliza los índices de ordenación sortOrder de manera determinista y consecutiva (0..n-1)
 * basándose estrictamente en la posición actual de cada elemento en la colección.
 * Retorna siempre una nueva colección sin mutar el array de entrada.
 */
export function normalizeSortOrders(items: EditableQuoteItem[]): EditableQuoteItem[] {
  return items.map((item, index) => {
    if (item.sortOrder === index) {
      return item;
    }
    return {
      ...item,
      sortOrder: index,
    };
  });
}

/**
 * Añade una nueva fila al final de la lista respetando el límite máximo y normalizando sortOrder.
 */
export function addItem(items: EditableQuoteItem[]): EditableQuoteItem[] {
  if (items.length >= 100) return items;
  return normalizeSortOrders([...items, createEmptyQuoteItem(items.length)]);
}

/**
 * Actualiza una fila identificada de manera unívoca por su `clientId`.
 */
export function updateItem(
  items: EditableQuoteItem[],
  clientId: string,
  updated: Partial<QuoteItemInput>
): EditableQuoteItem[] {
  return items.map((it) => (it.clientId === clientId ? { ...it, ...updated } : it));
}

/**
 * Duplica una fila específica asignándole un nuevo `clientId` único e insertándola a continuación,
 * normalizando de inmediato todos los sortOrders posteriores de forma determinista (0..n-1).
 */
export function duplicateItem(items: EditableQuoteItem[], clientId: string): EditableQuoteItem[] {
  if (items.length >= 100) return items;
  const idx = items.findIndex((it) => it.clientId === clientId);
  if (idx === -1) return items;

  const target = items[idx];
  const duplicated: EditableQuoteItem = {
    ...target,
    id: undefined,
    clientId: generateClientId(),
    sortOrder: idx + 1,
  };

  const next = [...items];
  next.splice(idx + 1, 0, duplicated);
  return normalizeSortOrders(next);
}

/**
 * Elimina una fila por su `clientId` y normaliza los sortOrders para eliminar huecos.
 * Si queda vacía, la restablece a una fila limpia en la posición 0.
 */
export function removeItem(items: EditableQuoteItem[], clientId: string): EditableQuoteItem[] {
  if (items.length <= 1) {
    return [createEmptyQuoteItem(0)];
  }
  const filtered = items.filter((it) => it.clientId !== clientId);
  return normalizeSortOrders(filtered);
}

/**
 * Mueve una fila una posición hacia arriba conservando su identidad y actualizando sortOrder deterministamente.
 */
export function moveItemUp(items: EditableQuoteItem[], clientId: string): EditableQuoteItem[] {
  const idx = items.findIndex((it) => it.clientId === clientId);
  if (idx <= 0) return items;

  const next = [...items];
  const temp = next[idx - 1];
  next[idx - 1] = next[idx];
  next[idx] = temp;
  return normalizeSortOrders(next);
}

/**
 * Mueve una fila una posición hacia abajo conservando su identidad y actualizando sortOrder deterministamente.
 */
export function moveItemDown(items: EditableQuoteItem[], clientId: string): EditableQuoteItem[] {
  const idx = items.findIndex((it) => it.clientId === clientId);
  if (idx === -1 || idx >= items.length - 1) return items;

  const next = [...items];
  const temp = next[idx + 1];
  next[idx + 1] = next[idx];
  next[idx] = temp;
  return normalizeSortOrders(next);
}
