import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  EditableQuoteItem,
  createEmptyQuoteItem,
  buildRowViewModels,
  validateItemsForAction,
  addItem,
  updateItem,
  duplicateItem,
  removeItem,
  moveItemUp,
  moveItemDown,
  normalizeSortOrders,
} from '../utils/quoteEditor';
import { QuoteItemRow } from '../components/QuoteItemRow';
import { calculateQuote } from '@/core/calculators/quote';

describe('Editor de Conceptos del Cotizador PRO', () => {
  // a. Al abrir una cotización nueva aparece una fila editable vacía
  it('a. al abrir una cotización nueva aparece una fila editable vacía con identidad estable', () => {
    const initialItems: EditableQuoteItem[] = [createEmptyQuoteItem(0)];

    expect(initialItems).toHaveLength(1);
    expect(initialItems[0].clientId).toBeDefined();
    expect(typeof initialItems[0].clientId).toBe('string');
    expect(initialItems[0].clientId.length).toBeGreaterThan(0);
    expect(initialItems[0].description).toBe('');
    expect(initialItems[0].unitPrice).toBe(0);
    expect(initialItems[0].quantity).toBe(1);

    // Motor de cálculo no valida la fila vacía
    const calc = calculateQuote({ items: initialItems });
    expect(calc.items).toHaveLength(0); // Filtrado en motor central

    // Sin embargo, el modelo de vista combinado preserva la fila en la pantalla
    const viewModels = buildRowViewModels(initialItems, calc.items);
    expect(viewModels).toHaveLength(1);
    expect(viewModels[0].clientId).toBe(initialItems[0].clientId);
    expect(viewModels[0].description).toBe('');
    expect(viewModels[0].grossAmount).toBe(0);
    expect(viewModels[0].netAmount).toBe(0);

    // Verificación de renderizado de componente: genera inputs editables sin colapsar
    const html = renderToString(
      <QuoteItemRow
        index={0}
        totalItems={1}
        item={viewModels[0]}
        onChange={vi.fn()}
        onDuplicate={vi.fn()}
        onRemove={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
      />
    );

    expect(html).toContain('id="desc-0"');
    expect(html).toContain('id="qty-0"');
    expect(html).toContain('id="price-0"');
    expect(html).toContain('Descripción del concepto');
  });

  // b. El botón “Concepto manual” agrega una fila visible
  it('b. el botón "Concepto manual" agrega una fila visible con identificador único', () => {
    let items: EditableQuoteItem[] = [createEmptyQuoteItem(0)];
    expect(items).toHaveLength(1);

    items = addItem(items);
    expect(items).toHaveLength(2);

    expect(items[0].clientId).not.toBe(items[1].clientId);
    expect(items[1].description).toBe('');

    // Ambas filas se proyectan en el modelo de vista
    const calc = calculateQuote({ items });
    const viewModels = buildRowViewModels(items, calc.items);
    expect(viewModels).toHaveLength(2);
    expect(viewModels[0].clientId).toBe(items[0].clientId);
    expect(viewModels[1].clientId).toBe(items[1].clientId);
  });

  // c. Escribir una descripción y un precio convierte la fila en válida sin recrearla incorrectamente
  it('c. escribir una descripción y precio convierte la fila en válida conservando su clientId', () => {
    let items: EditableQuoteItem[] = [createEmptyQuoteItem(0)];
    const originalClientId = items[0].clientId;

    // Usuario tipea descripción
    items = updateItem(items, originalClientId, { description: 'Consultoría TI Especializada' });
    expect(items[0].clientId).toBe(originalClientId);
    expect(items[0].description).toBe('Consultoría TI Especializada');

    // Usuario define precio y cantidad
    items = updateItem(items, originalClientId, { unitPrice: 250, quantity: 2 });
    expect(items[0].clientId).toBe(originalClientId);
    expect(items[0].unitPrice).toBe(250);

    // Ahora calculateQuote la reconoce como válida
    const calc = calculateQuote({ items });
    expect(calc.isValid).toBe(true);
    expect(calc.items).toHaveLength(1);
    expect(calc.items[0].clientId).toBe(originalClientId);
    expect(calc.items[0].grossAmount).toBe(500);
    expect(calc.items[0].netAmount).toBe(500);

    const viewModels = buildRowViewModels(items, calc.items);
    expect(viewModels[0].clientId).toBe(originalClientId);
    expect(viewModels[0].netAmount).toBe(500);
  });

  // d. Una fila inválida seguida de una válida no altera los índices ni actualiza la fila equivocada
  it('d. una fila inválida seguida de una válida no altera índices ni actualiza la fila equivocada', () => {
    const item0 = createEmptyQuoteItem(0); // Fila 0: vacía e inválida
    const item1 = {
      ...createEmptyQuoteItem(1),
      description: 'Mantenimiento Preventivo',
      unitPrice: 120,
      quantity: 1,
    }; // Fila 1: válida

    let items: EditableQuoteItem[] = [item0, item1];

    // calculateQuote solo devuelve 1 elemento calculado (el item1 válido)
    const calc = calculateQuote({ items });
    expect(calc.items).toHaveLength(1);
    expect(calc.items[0].clientId).toBe(item1.clientId);

    // El modelo de vista combinado mantiene ambas filas en sus posiciones originales
    const viewModels = buildRowViewModels(items, calc.items);
    expect(viewModels).toHaveLength(2);
    expect(viewModels[0].clientId).toBe(item0.clientId);
    expect(viewModels[1].clientId).toBe(item1.clientId);

    // Cuando el usuario edita la fila 1 por su clientId, la fila 0 NO se modifica
    items = updateItem(items, item1.clientId, { unitPrice: 150 });

    expect(items[0].description).toBe('');
    expect(items[0].unitPrice).toBe(0);
    expect(items[1].description).toBe('Mantenimiento Preventivo');
    expect(items[1].unitPrice).toBe(150);

    // Si edita la fila 0, la fila 1 permanece intacta
    items = updateItem(items, item0.clientId, { description: 'Nuevo Servicio' });
    expect(items[0].description).toBe('Nuevo Servicio');
    expect(items[1].description).toBe('Mantenimiento Preventivo');
    expect(items[1].unitPrice).toBe(150);
  });

  // e. Duplicar, eliminar y reordenar conserva la identidad correcta
  it('e. duplicar, eliminar y reordenar conserva la identidad correcta y claves estables', () => {
    const itemA = { ...createEmptyQuoteItem(0), description: 'Item Alpha', unitPrice: 50 };
    const itemB = { ...createEmptyQuoteItem(1), description: 'Item Beta', unitPrice: 100 };
    const itemC = { ...createEmptyQuoteItem(2), description: 'Item Gamma', unitPrice: 150 };

    let items: EditableQuoteItem[] = [itemA, itemB, itemC];

    // Duplicar Item B: se inserta en posición 2 con nuevo clientId
    items = duplicateItem(items, itemB.clientId);
    expect(items).toHaveLength(4);
    expect(items[0].clientId).toBe(itemA.clientId);
    expect(items[1].clientId).toBe(itemB.clientId);
    expect(items[2].description).toBe('Item Beta');
    expect(items[2].clientId).not.toBe(itemB.clientId);
    expect(items[3].clientId).toBe(itemC.clientId);

    // Reordenar: mover Item C hacia arriba y luego hacia abajo
    const duplicatedBId = items[2].clientId;
    items = moveItemUp(items, itemC.clientId);
    expect(items[2].clientId).toBe(itemC.clientId);
    expect(items[3].clientId).toBe(duplicatedBId);

    items = moveItemDown(items, itemC.clientId);
    expect(items[3].clientId).toBe(itemC.clientId);
    expect(items[2].clientId).toBe(duplicatedBId);

    // Eliminar Item A
    items = removeItem(items, itemA.clientId);
    expect(items).toHaveLength(3);
    expect(items.find((i) => i.clientId === itemA.clientId)).toBeUndefined();
    expect(items[0].clientId).toBe(itemB.clientId);

    // Eliminar todo hasta que quede 1 y comprobar reseteo limpio
    items = removeItem(items, items[0].clientId);
    items = removeItem(items, items[0].clientId);
    items = removeItem(items, items[0].clientId); // Último elemento
    expect(items).toHaveLength(1);
    expect(items[0].clientId).toBeDefined();
    expect(items[0].description).toBe('');
  });

  // f. Los totales solamente consideran conceptos válidos
  it('f. los totales de calculateQuote solamente consideran conceptos válidos', () => {
    const invalidEmpty = createEmptyQuoteItem(0);
    const validItem1 = {
      ...createEmptyQuoteItem(1),
      description: 'Licencia Anual Software',
      unitPrice: 1000,
      quantity: 1,
    };
    const invalidShortDesc = {
      ...createEmptyQuoteItem(2),
      description: 'x', // Menor a 2 caracteres
      unitPrice: 500,
      quantity: 2,
    };
    const validItem2 = {
      ...createEmptyQuoteItem(3),
      description: 'Instalación y Configuración',
      unitPrice: 300,
      quantity: 1,
    };

    const items = [invalidEmpty, validItem1, invalidShortDesc, validItem2];

    const calc = calculateQuote({
      items,
      includeIgv: true,
    });

    // Solo deben calcularse las 2 líneas válidas (1000 + 300 = 1300)
    expect(calc.items).toHaveLength(2);
    expect(calc.totals.subtotalGross).toBe(1300);
    expect(calc.totals.subtotalNet).toBe(1300);
    expect(calc.totals.igvAmount).toBe(234); // 1300 * 0.18
    expect(calc.totals.totalAmount).toBe(1534);

    // En el modelo de vista combinado, las 4 líneas existen para ser corregidas por el usuario
    const viewModels = buildRowViewModels(items, calc.items);
    expect(viewModels).toHaveLength(4);
    expect(viewModels[0].netAmount).toBe(0);
    expect(viewModels[1].netAmount).toBe(1000);
    expect(viewModels[2].netAmount).toBe(1000); // 500 * 2 estimado en UI mientras corrige
    expect(viewModels[3].netAmount).toBe(300);
  });

  // g. Guardar y exportar queda bloqueado con un mensaje útil si existe una fila incompleta
  it('g. guardar y exportar queda bloqueado con mensaje claro señalando el concepto afectado', () => {
    // Caso 1: Lista vacía
    const emptyCheck = validateItemsForAction([], 'guardar');
    expect(emptyCheck.isValid).toBe(false);
    expect(emptyCheck.error).toContain('al menos un concepto');

    // Caso 2: Fila 1 incompleta (descripción vacía)
    const row0Incomplete: EditableQuoteItem[] = [createEmptyQuoteItem(0)];
    const saveCheck1 = validateItemsForAction(row0Incomplete, 'guardar');
    expect(saveCheck1.isValid).toBe(false);
    expect(saveCheck1.error).toContain('concepto #1');
    expect(saveCheck1.error).toContain('descripción');

    // Caso 3: Fila 1 válida pero Fila 2 inválida (precio negativo o excedido)
    const row1Valid = {
      ...createEmptyQuoteItem(0),
      description: 'Servicio Contable Mensual',
      unitPrice: 400,
      quantity: 1,
    };
    const row2Invalid = {
      ...createEmptyQuoteItem(1),
      description: 'Auditoría',
      unitPrice: -50,
      quantity: 1,
    };

    const exportCheck = validateItemsForAction([row1Valid, row2Invalid], 'exportar');
    expect(exportCheck.isValid).toBe(false);
    expect(exportCheck.error).toContain('concepto #2');
    expect(exportCheck.error).toContain('precio unitario');

    // Caso 4: Todas las filas válidas -> Aprobado para guardar y exportar
    const row2Fixed = {
      ...row2Invalid,
      unitPrice: 500,
    };
    const validCheck = validateItemsForAction([row1Valid, row2Fixed], 'guardar');
    expect(validCheck.isValid).toBe(true);
    expect(validCheck.error).toBeUndefined();
  });

  describe('Normalización determinista de sortOrder en el editor', () => {
    // a. A, B, C mantienen sortOrder 0, 1, 2.
    it('a. A, B, C mantienen sortOrder 0, 1, 2', () => {
      const itemA = { ...createEmptyQuoteItem(0), description: 'A' };
      const itemB = { ...createEmptyQuoteItem(1), description: 'B' };
      const itemC = { ...createEmptyQuoteItem(2), description: 'C' };

      const normalized = normalizeSortOrders([itemA, itemB, itemC]);
      expect(normalized.map((i) => i.sortOrder)).toEqual([0, 1, 2]);
      expect(normalized.map((i) => i.description)).toEqual(['A', 'B', 'C']);
    });

    // b. Duplicar B produce A, B, copia B, C con 0, 1, 2, 3.
    it('b. duplicar B produce A, B, copia B, C con 0, 1, 2, 3', () => {
      let items: EditableQuoteItem[] = [
        { ...createEmptyQuoteItem(0), description: 'A' },
        { ...createEmptyQuoteItem(1), description: 'B' },
        { ...createEmptyQuoteItem(2), description: 'C' },
      ];
      const bClientId = items[1].clientId;

      items = duplicateItem(items, bClientId);
      expect(items).toHaveLength(4);
      expect(items.map((i) => i.description)).toEqual(['A', 'B', 'B', 'C']);
      expect(items.map((i) => i.sortOrder)).toEqual([0, 1, 2, 3]);
    });

    // c. Eliminar B y añadir D no genera valores duplicados.
    it('c. eliminar B y añadir D no genera valores duplicados', () => {
      let items: EditableQuoteItem[] = [
        { ...createEmptyQuoteItem(0), description: 'A' },
        { ...createEmptyQuoteItem(1), description: 'B' },
        { ...createEmptyQuoteItem(2), description: 'C' },
      ];

      items = removeItem(items, items[1].clientId);
      expect(items.map((i) => i.description)).toEqual(['A', 'C']);
      expect(items.map((i) => i.sortOrder)).toEqual([0, 1]);

      items = addItem(items);
      const lastIndex = items.length - 1;
      items = updateItem(items, items[lastIndex].clientId, { description: 'D' });

      expect(items.map((i) => i.description)).toEqual(['A', 'C', 'D']);
      expect(items.map((i) => i.sortOrder)).toEqual([0, 1, 2]);
      // Comprobar que no hay duplicados en sortOrder
      const sortOrders = items.map((i) => i.sortOrder);
      expect(new Set(sortOrders).size).toBe(sortOrders.length);
    });

    // d. Mover C arriba persiste el nuevo orden con sortOrder 0, 1, 2.
    it('d. mover C arriba persiste el nuevo orden con sortOrder consecutivo', () => {
      let items: EditableQuoteItem[] = [
        { ...createEmptyQuoteItem(0), description: 'A' },
        { ...createEmptyQuoteItem(1), description: 'B' },
        { ...createEmptyQuoteItem(2), description: 'C' },
      ];
      const cClientId = items[2].clientId;

      items = moveItemUp(items, cClientId);
      expect(items.map((i) => i.description)).toEqual(['A', 'C', 'B']);
      expect(items.map((i) => i.sortOrder)).toEqual([0, 1, 2]);
    });

    // e. Después de serializar, guardar y volver a ordenar por sortOrder se obtiene exactamente el orden visual.
    it('e. después de serializar, guardar y volver a ordenar por sortOrder se obtiene el orden visual exacto', () => {
      let items: EditableQuoteItem[] = [
        { ...createEmptyQuoteItem(0), description: 'Servicio 1', unitPrice: 100 },
        { ...createEmptyQuoteItem(1), description: 'Servicio 2', unitPrice: 200 },
        { ...createEmptyQuoteItem(2), description: 'Servicio 3', unitPrice: 300 },
      ];
      // Mover el último hacia arriba
      items = moveItemUp(items, items[2].clientId); // Ahora: Servicio 1, Servicio 3, Servicio 2

      // Construcción defensiva del payload de guardado asignando sortOrder: index
      const savePayloadItems = items.map((it, idx) => ({
        description: it.description,
        unitPrice: it.unitPrice,
        sortOrder: idx,
      }));

      // Serialización y deserialización simulando guardado en BD / API
      const serialized = JSON.stringify(savePayloadItems);
      const loadedFromDb: Array<{ description: string; unitPrice: number; sortOrder: number }> = JSON.parse(serialized);

      // Repositorio ordena por sort_order
      const reordered = [...loadedFromDb].sort((a, b) => a.sortOrder - b.sortOrder);

      expect(reordered.map((i) => i.description)).toEqual(['Servicio 1', 'Servicio 3', 'Servicio 2']);
      expect(reordered.map((i) => i.sortOrder)).toEqual([0, 1, 2]);
    });

    // f. Ninguna operación muta el array original.
    it('f. ninguna operación muta el array original', () => {
      const original: EditableQuoteItem[] = Object.freeze([
        Object.freeze({ ...createEmptyQuoteItem(0), description: 'Original A' }),
        Object.freeze({ ...createEmptyQuoteItem(1), description: 'Original B' }),
      ]) as unknown as EditableQuoteItem[];

      const clonedBefore = JSON.parse(JSON.stringify(original));

      const added = addItem(original);
      expect(original).toEqual(clonedBefore);
      expect(added).not.toBe(original);

      const duplicated = duplicateItem(original, original[0].clientId);
      expect(original).toEqual(clonedBefore);
      expect(duplicated).not.toBe(original);

      const removed = removeItem(original, original[0].clientId);
      expect(original).toEqual(clonedBefore);
      expect(removed).not.toBe(original);

      const moved = moveItemDown(original, original[0].clientId);
      expect(original).toEqual(clonedBefore);
      expect(moved).not.toBe(original);

      const normalized = normalizeSortOrders(original);
      expect(original).toEqual(clonedBefore);
      expect(normalized).not.toBe(original);
    });

    // g. Los clientId se mantienen estables salvo en una duplicación o fila nueva.
    it('g. los clientId se mantienen estables salvo en duplicación o fila nueva', () => {
      let items: EditableQuoteItem[] = [
        { ...createEmptyQuoteItem(0), description: 'A' },
        { ...createEmptyQuoteItem(1), description: 'B' },
      ];
      const idA = items[0].clientId;
      const idB = items[1].clientId;

      // Actualizar no cambia clientId
      items = updateItem(items, idA, { description: 'A modificado' });
      expect(items[0].clientId).toBe(idA);

      // Mover no cambia clientIds
      items = moveItemDown(items, idA);
      expect(items[0].clientId).toBe(idB);
      expect(items[1].clientId).toBe(idA);

      // Duplicar conserva los existentes y crea uno nuevo único para la copia
      items = duplicateItem(items, idA);
      expect(items[1].clientId).toBe(idA);
      const newCopyId = items[2].clientId;
      expect(newCopyId).not.toBe(idA);
      expect(newCopyId).not.toBe(idB);

      // Agregar fila crea un clientId nuevo único
      items = addItem(items);
      const addedId = items[items.length - 1].clientId;
      expect(addedId).not.toBe(idA);
      expect(addedId).not.toBe(idB);
      expect(addedId).not.toBe(newCopyId);
    });
  });
});
