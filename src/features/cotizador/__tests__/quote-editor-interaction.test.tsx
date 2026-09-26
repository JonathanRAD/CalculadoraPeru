// @vitest-environment jsdom
import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  EditableQuoteItem,
  createEmptyQuoteItem,
  addItem,
  updateItem,
  duplicateItem,
  removeItem,
  moveItemUp,
  moveItemDown,
  normalizeSortOrders,
  buildRowViewModels,
} from '../utils/quoteEditor';
import { calculateQuote } from '@/core/calculators/quote';
import { QuoteItemRow } from '../components/QuoteItemRow';

interface SavePayload {
  items: Array<{
    clientId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    sortOrder: number;
  }>;
}

/**
 * Componente interactivo representativo del Cotizador PRO para pruebas de interacción en DOM real.
 * Utiliza el mismo flujo de estado, normalización, reactividad y construcción de payload defensiva.
 */
function RepresentativeQuoteEditor({
  onSave,
}: {
  onSave?: (payload: SavePayload) => void;
}) {
  const [items, setItems] = useState<EditableQuoteItem[]>(() => [createEmptyQuoteItem(0)]);

  const calc = calculateQuote({ items });
  const viewModels = buildRowViewModels(items, calc.items);

  const handleAddItem = () => {
    setItems((prev) => addItem(prev));
  };

  const handleSave = () => {
    // Construcción defensiva del payload: sortOrder se asigna estrictamente según index visual actual
    const payload: SavePayload = {
      items: items.map((it, idx) => ({
        clientId: it.clientId,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        sortOrder: idx,
      })),
    };
    if (onSave) {
      onSave(payload);
    }
  };

  return (
    <div data-testid="quote-editor-container">
      <div data-testid="rows-container">
        {viewModels.map((item, index) => {
          const cId = item.clientId || '';
          return (
            <div key={cId} data-testid={`item-row-wrapper-${cId}`}>
              <span data-testid={`row-clientid-${index}`}>{cId}</span>
              <QuoteItemRow
                index={index}
                totalItems={viewModels.length}
                item={item}
                onChange={(updated) => setItems((prev) => updateItem(prev, cId, updated))}
                onDuplicate={() => setItems((prev) => duplicateItem(prev, cId))}
                onRemove={() => setItems((prev) => removeItem(prev, cId))}
                onMoveUp={() => setItems((prev) => moveItemUp(prev, cId))}
                onMoveDown={() => setItems((prev) => moveItemDown(prev, cId))}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          data-testid="btn-add-item"
          onClick={handleAddItem}
        >
          Concepto manual
        </button>
        <button
          type="button"
          data-testid="btn-save-payload"
          onClick={handleSave}
        >
          Guardar cotización
        </button>
      </div>
    </div>
  );
}

describe('Pruebas de Interacción DOM Real del Editor de Conceptos (React Testing Library + jsdom)', () => {
  it('permite escribir datos, agregar segunda fila, reordenar, mantener datos por clientId y serializar con sortOrder consecutivo', async () => {
    const handleSaveMock = vi.fn();
    render(<RepresentativeQuoteEditor onSave={handleSaveMock} />);

    // 1. Confirmar que arranca con una fila editable
    const desc0 = screen.getByLabelText(/descripción del concepto/i) as HTMLInputElement;
    const qty0 = screen.getByLabelText(/cantidad/i) as HTMLInputElement;
    const price0 = screen.getByLabelText(/p\. unit\./i) as HTMLInputElement;
    const clientId0 = screen.getByTestId('row-clientid-0').textContent;

    expect(desc0).toBeDefined();
    expect(clientId0).toBeTruthy();

    // 2. Usuario escribe en la primera fila: Descripción, Cantidad y Precio
    fireEvent.change(desc0, { target: { value: 'Auditoría Técnica y Contable' } });
    fireEvent.change(qty0, { target: { value: '2' } });
    fireEvent.change(price0, { target: { value: '850' } });

    expect(desc0.value).toBe('Auditoría Técnica y Contable');
    expect(qty0.value).toBe('2');
    expect(price0.value).toBe('850');

    // 3. Agregar una segunda fila mediante click en el botón "Concepto manual"
    const addBtn = screen.getByTestId('btn-add-item');
    fireEvent.click(addBtn);

    // Deben existir dos filas
    const descInputs = screen.getAllByLabelText(/descripción del concepto/i) as HTMLInputElement[];
    const qtyInputs = screen.getAllByLabelText(/cantidad/i) as HTMLInputElement[];
    const priceInputs = screen.getAllByLabelText(/p\. unit\./i) as HTMLInputElement[];

    expect(descInputs).toHaveLength(2);
    expect(qtyInputs).toHaveLength(2);
    expect(priceInputs).toHaveLength(2);

    const clientId1 = screen.getByTestId('row-clientid-1').textContent;
    expect(clientId1).toBeTruthy();
    expect(clientId1).not.toBe(clientId0);

    // 4. Usuario llena los datos de la segunda fila
    fireEvent.change(descInputs[1], { target: { value: 'Configuración de Servidor Cloud' } });
    fireEvent.change(qtyInputs[1], { target: { value: '1' } });
    fireEvent.change(priceInputs[1], { target: { value: '1400' } });

    expect(descInputs[1].value).toBe('Configuración de Servidor Cloud');
    expect(qtyInputs[1].value).toBe('1');
    expect(priceInputs[1].value).toBe('1400');

    // 5. Reordenar las filas: Mover la segunda fila hacia arriba usando el botón Subir
    const moveUpBtn = screen.getByLabelText(/mover concepto #2 hacia arriba/i);
    fireEvent.click(moveUpBtn);

    // 6. Confirmar que cada clientId mantiene sus datos intactos tras el intercambio de posición
    const descInputsAfterMove = screen.getAllByLabelText(/descripción del concepto/i) as HTMLInputElement[];
    const qtyInputsAfterMove = screen.getAllByLabelText(/cantidad/i) as HTMLInputElement[];
    const priceInputsAfterMove = screen.getAllByLabelText(/p\. unit\./i) as HTMLInputElement[];

    // Ahora la fila 0 debe ser "Configuración de Servidor Cloud" (clientId1)
    expect(screen.getByTestId('row-clientid-0').textContent).toBe(clientId1);
    expect(descInputsAfterMove[0].value).toBe('Configuración de Servidor Cloud');
    expect(qtyInputsAfterMove[0].value).toBe('1');
    expect(priceInputsAfterMove[0].value).toBe('1400');

    // Y la fila 1 debe ser "Auditoría Técnica y Contable" (clientId0)
    expect(screen.getByTestId('row-clientid-1').textContent).toBe(clientId0);
    expect(descInputsAfterMove[1].value).toBe('Auditoría Técnica y Contable');
    expect(qtyInputsAfterMove[1].value).toBe('2');
    expect(priceInputsAfterMove[1].value).toBe('850');

    // 7. Serializar el payload para guardado
    const saveBtn = screen.getByTestId('btn-save-payload');
    fireEvent.click(saveBtn);

    expect(handleSaveMock).toHaveBeenCalledTimes(1);
    const payload: SavePayload = handleSaveMock.mock.calls[0][0];

    // Comprobar sortOrder consecutivo y orden determinista
    expect(payload.items).toHaveLength(2);
    expect(payload.items[0]).toEqual({
      clientId: clientId1,
      description: 'Configuración de Servidor Cloud',
      quantity: 1,
      unitPrice: 1400,
      sortOrder: 0,
    });
    expect(payload.items[1]).toEqual({
      clientId: clientId0,
      description: 'Auditoría Técnica y Contable',
      quantity: 2,
      unitPrice: 850,
      sortOrder: 1,
    });

    // 8. Simular recarga desde backend/historial ordenando por sortOrder
    const serializedPayload = JSON.stringify(payload);
    const restoredPayload: SavePayload = JSON.parse(serializedPayload);

    // Simular que el repositorio devuelve los registros ordenados por sortOrder
    const sortedFromRepo = [...restoredPayload.items].sort((a, b) => a.sortOrder - b.sortOrder);
    expect(sortedFromRepo[0].description).toBe('Configuración de Servidor Cloud');
    expect(sortedFromRepo[0].sortOrder).toBe(0);
    expect(sortedFromRepo[1].description).toBe('Auditoría Técnica y Contable');
    expect(sortedFromRepo[1].sortOrder).toBe(1);

    // Normalización defensiva al cargar
    const normalizedAfterReload = normalizeSortOrders(
      sortedFromRepo.map((it) => ({
        ...createEmptyQuoteItem(it.sortOrder),
        clientId: it.clientId,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        sortOrder: it.sortOrder,
      }))
    );

    expect(normalizedAfterReload.map((i) => i.sortOrder)).toEqual([0, 1]);
    expect(normalizedAfterReload.map((i) => i.description)).toEqual([
      'Configuración de Servidor Cloud',
      'Auditoría Técnica y Contable',
    ]);
  });
});
