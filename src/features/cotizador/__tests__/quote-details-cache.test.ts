import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuoteDetailsCacheService, QuoteDetails } from '../services/quoteDetailsCache';
import { QuoteRecord, QuoteItemRecord } from '../types';

function createMockQuoteDetails(id: string, quoteNumber = 'COT-00001', totalAmount = 100): QuoteDetails {
  const quote: QuoteRecord = {
    id,
    userId: 'user-1',
    quoteNumber,
    prefix: 'COT-',
    correlative: 1,
    clientName: 'Cliente Prueba',
    clientDocType: 'none',
    issueDate: '2026-09-24',
    currency: 'PEN',
    subtotalGross: totalAmount,
    itemsDiscountTotal: 0,
    globalDiscountType: 'none',
    globalDiscountValue: 0,
    globalDiscountAmount: 0,
    discountTotal: 0,
    subtotalNet: totalAmount,
    taxableBase: totalAmount,
    exemptBase: 0,
    igvRate: 0.18,
    igvAmount: totalAmount * 0.18,
    totalAmount: totalAmount * 1.18,
    status: 'draft',
    createdAt: '2026-09-24T00:00:00Z',
    updatedAt: '2026-09-24T00:00:00Z',
  };

  const items: QuoteItemRecord[] = [
    {
      id: `item-${id}-1`,
      quoteId: id,
      userId: 'user-1',
      sortOrder: 1,
      description: 'Concepto 1',
      type: 'product',
      unit: 'unit',
      quantity: 1,
      unitPrice: totalAmount,
      discountType: 'none',
      discountValue: 0,
      discountAmount: 0,
      isIgvAffected: true,
      grossAmount: totalAmount,
      netAmount: totalAmount,
      createdAt: '2026-09-24T00:00:00Z',
    },
  ];

  return { quote, items };
}

describe('QuoteDetailsCacheService', () => {
  let cache: QuoteDetailsCacheService;

  beforeEach(() => {
    cache = new QuoteDetailsCacheService(3); // maxSize = 3 para pruebas de LRU
    cache.setUser('user-1');
  });

  // 1. La primera consulta llama a la API.
  it('1. la primera consulta llama a la API', async () => {
    const fetcher = vi.fn().mockResolvedValue(createMockQuoteDetails('q-1'));

    const result = await cache.get('q-1', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result?.quote.id).toBe('q-1');
    expect(cache.has('q-1')).toBe(true);
  });

  // 2. Una segunda consulta sin cambios usa caché.
  it('2. una segunda consulta sin cambios usa caché', async () => {
    const fetcher = vi.fn().mockResolvedValue(createMockQuoteDetails('q-1'));

    await cache.get('q-1', fetcher);
    const result2 = await cache.get('q-1', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1); // No vuelve a llamar
    expect(result2?.quote.id).toBe('q-1');
  });

  // 3. Dos consultas simultáneas producen una sola petición.
  it('3. dos consultas simultáneas producen una sola petición (deduplicación)', async () => {
    let resolvePromise: (value: QuoteDetails) => void = () => {};
    const fetcher = vi.fn().mockImplementation(() => {
      return new Promise<QuoteDetails>((resolve) => {
        resolvePromise = resolve;
      });
    });

    const promise1 = cache.get('q-1', fetcher);
    const promise2 = cache.get('q-1', fetcher);

    expect(cache.getInflightCount()).toBe(1);
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Resolver la petición en curso
    resolvePromise(createMockQuoteDetails('q-1'));

    const [res1, res2] = await Promise.all([promise1, promise2]);
    expect(res1).toEqual(res2);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(cache.getInflightCount()).toBe(0);
  });

  // 4. Una edición invalida o actualiza la entrada.
  it('4. una edición invalida o actualiza la entrada canónicamente', async () => {
    const initial = createMockQuoteDetails('q-1', 'COT-00001', 100);
    cache.set('q-1', initial);

    expect(cache.has('q-1')).toBe(true);

    // Actualización tras edición (PUT canónico)
    const updated = createMockQuoteDetails('q-1', 'COT-00001', 250);
    cache.set('q-1', updated);

    const cached = await cache.get('q-1');
    expect(cached?.quote.subtotalGross).toBe(250);
  });

  // 5. La descarga posterior utiliza datos nuevos.
  it('5. la descarga posterior utiliza datos nuevos tras invalidación o actualización', async () => {
    const fetcherInitial = vi.fn().mockResolvedValue(createMockQuoteDetails('q-1', 'COT-00001', 100));
    await cache.get('q-1', fetcherInitial);

    // Invalida la cotización (por ejemplo, después de guardar cambios)
    cache.invalidate('q-1');
    expect(cache.has('q-1')).toBe(false);

    // Siguiente descarga consulta de nuevo y recibe los datos nuevos
    const fetcherFresh = vi.fn().mockResolvedValue(createMockQuoteDetails('q-1', 'COT-00001', 500));
    const downloaded = await cache.get('q-1', fetcherFresh);

    expect(fetcherFresh).toHaveBeenCalledTimes(1);
    expect(downloaded?.quote.subtotalGross).toBe(500);
  });

  // 6. Una invalidación durante una petición impide que la respuesta antigua escriba en caché.
  it('6. una invalidación durante una petición impide que la respuesta antigua escriba en caché', async () => {
    let finishSlowFetch: (value: QuoteDetails) => void = () => {};
    const slowFetcher = vi.fn().mockImplementation(() => {
      return new Promise<QuoteDetails>((resolve) => {
        finishSlowFetch = resolve;
      });
    });

    // Inicia petición lenta
    const slowPromise = cache.get('q-1', slowFetcher);

    // Ocurre una invalidación mientras la petición está en vuelo
    cache.invalidate('q-1');
    expect(cache.has('q-1')).toBe(false);

    // La petición lenta termina tarde
    finishSlowFetch(createMockQuoteDetails('q-1', 'COT-00001', 100));
    await slowPromise;

    // La respuesta vieja NO debe haber escrito en caché
    expect(cache.has('q-1')).toBe(false);

    // Una nueva llamada realiza una nueva consulta fresca
    const freshFetcher = vi.fn().mockResolvedValue(createMockQuoteDetails('q-1', 'COT-00001', 999));
    const result = await cache.get('q-1', freshFetcher);

    expect(freshFetcher).toHaveBeenCalledTimes(1);
    expect(result?.quote.subtotalGross).toBe(999);
  });

  // 7. Una petición cancelada no deja una promesa almacenada.
  it('7. una petición cancelada no deja una promesa almacenada', async () => {
    const abortFetcher = vi.fn().mockImplementation((signal: AbortSignal) => {
      return new Promise<QuoteDetails | null>((_, reject) => {
        signal.addEventListener('abort', () => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });

    const pendingPromise = cache.get('q-1', abortFetcher);
    expect(cache.getInflightCount()).toBe(1);

    // Cancelar/invalidar
    cache.invalidate('q-1');

    await pendingPromise;
    expect(cache.getInflightCount()).toBe(0);
    expect(cache.has('q-1')).toBe(false);
  });

  // 8. Un error de red permite reintentar.
  it('8. un error de red permite reintentar y no bloquea consultas futuras', async () => {
    const failingFetcher = vi.fn().mockRejectedValue(new Error('Network error 500'));

    const res1 = await cache.get('q-1', failingFetcher);
    expect(res1).toBeNull();
    expect(cache.getInflightCount()).toBe(0); // Limpiado
    expect(cache.has('q-1')).toBe(false);

    // Reintento exitoso
    const successFetcher = vi.fn().mockResolvedValue(createMockQuoteDetails('q-1'));
    const res2 = await cache.get('q-1', successFetcher);

    expect(successFetcher).toHaveBeenCalledTimes(1);
    expect(res2?.quote.id).toBe('q-1');
    expect(cache.has('q-1')).toBe(true);
  });

  // 9. Anular y eliminar invalidan.
  it('9. anular y eliminar invalidan correctamente la entrada', async () => {
    cache.set('q-1', createMockQuoteDetails('q-1'));
    cache.set('q-2', createMockQuoteDetails('q-2'));

    expect(cache.has('q-1')).toBe(true);
    expect(cache.has('q-2')).toBe(true);

    // Simula flujo de anular
    cache.invalidate('q-1');
    expect(cache.has('q-1')).toBe(false);
    expect(cache.has('q-2')).toBe(true);

    // Simula flujo de eliminar
    cache.invalidate('q-2');
    expect(cache.has('q-2')).toBe(false);
  });

  // 10. Cambiar de usuario limpia toda la caché.
  it('10. cambiar de usuario limpia toda la caché para prevenir fugas multitenant', async () => {
    cache.set('q-1', createMockQuoteDetails('q-1'));
    cache.set('q-2', createMockQuoteDetails('q-2'));
    expect(cache.size()).toBe(2);

    // Cambia a otro usuario
    cache.setUser('user-2');

    expect(cache.size()).toBe(0);
    expect(cache.has('q-1')).toBe(false);
    expect(cache.has('q-2')).toBe(false);
  });

  // 11. Logout limpia toda la caché.
  it('11. logout limpia toda la caché', async () => {
    cache.set('q-1', createMockQuoteDetails('q-1'));
    expect(cache.has('q-1')).toBe(true);

    // Logout
    cache.setUser(null);

    expect(cache.size()).toBe(0);
    expect(cache.has('q-1')).toBe(false);
  });

  // 12. El límite de tamaño expulsa entradas antiguas (LRU).
  it('12. el límite de tamaño expulsa entradas antiguas siguiendo política LRU', async () => {
    // maxSize configurado en 3
    cache.set('q-1', createMockQuoteDetails('q-1'));
    cache.set('q-2', createMockQuoteDetails('q-2'));
    cache.set('q-3', createMockQuoteDetails('q-3'));

    expect(cache.size()).toBe(3);

    // Acceder a q-1 para refrescar su uso en LRU
    await cache.get('q-1');

    // Insertar un 4to elemento: debe desalojar el más antiguo (q-2, ya que q-1 fue refrescado)
    cache.set('q-4', createMockQuoteDetails('q-4'));

    expect(cache.size()).toBe(3);
    expect(cache.has('q-2')).toBe(false); // Desalojado por LRU
    expect(cache.has('q-1')).toBe(true);  // Conservado por acceso reciente
    expect(cache.has('q-3')).toBe(true);
    expect(cache.has('q-4')).toBe(true);
  });
});
