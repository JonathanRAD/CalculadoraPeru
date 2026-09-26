/**
 * quoteDetailsCache.ts
 *
 * Servicio de caché LRU para detalles de cotizaciones (Quote + Items).
 * Implementa:
 * - Cancelación de peticiones obsoletas mediante AbortController.
 * - Contador de versión/generación por cotización para evitar que respuestas lentas
 *   sobreescriban datos tras una invalidación o edición.
 * - Deduplicación de peticiones simultáneas sobre el mismo ID.
 * - Política de expulsión LRU con capacidad máxima configurable (por defecto 20).
 * - Aislamiento estricto de usuario: limpia la caché al cambiar de sesión o cerrar sesión.
 */

import { QuoteRecord, QuoteItemRecord } from '../types';

export interface QuoteDetails {
  quote: QuoteRecord;
  items: QuoteItemRecord[];
}

interface InflightEntry {
  promise: Promise<QuoteDetails | null>;
  controller: AbortController;
  generation: number;
}

export class QuoteDetailsCacheService {
  private cache: Map<string, QuoteDetails> = new Map();
  private inflight: Map<string, InflightEntry> = new Map();
  private generations: Map<string, number> = new Map();
  private currentUserId: string | null = null;
  private readonly maxSize: number;

  constructor(maxSize = 20) {
    this.maxSize = maxSize;
  }

  /**
   * Asocia la caché al usuario actual.
   * Si cambia el usuario o se pasa null (logout), limpia completamente toda la caché
   * y aborta las peticiones pendientes para garantizar que los datos de un usuario
   * nunca queden disponibles para otra cuenta en la misma pestaña.
   */
  public setUser(userId: string | null | undefined): void {
    const normalized = userId || null;
    if (this.currentUserId !== normalized) {
      this.clear();
      this.currentUserId = normalized;
    }
  }

  /**
   * Obtiene los detalles de una cotización.
   * 1. Si está en caché: retorna inmediatamente y refresca la posición LRU.
   * 2. Si ya hay una petición en curso para este quoteId: retorna la promesa compartida (dedup).
   * 3. Si no: inicia la petición pasando signal y guardando la generación inicial.
   */
  public async get(
    quoteId: string,
    fetcher?: (signal: AbortSignal) => Promise<QuoteDetails | null>
  ): Promise<QuoteDetails | null> {
    // 1. Cache hit
    const cached = this.cache.get(quoteId);
    if (cached) {
      // Refrescar posición en LRU (el más reciente al final)
      this.cache.delete(quoteId);
      this.cache.set(quoteId, cached);
      return cached;
    }

    // 2. Dedup de peticiones simultáneas
    const existing = this.inflight.get(quoteId);
    if (existing) {
      return existing.promise;
    }

    const controller = new AbortController();
    const startGeneration = this.generations.get(quoteId) || 0;

    const doFetch = fetcher || (async (signal: AbortSignal): Promise<QuoteDetails | null> => {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        credentials: 'include',
        signal,
      });
      const data = await res.json();
      if (data.success && data.quote && data.items) {
        return {
          quote: data.quote as QuoteRecord,
          items: data.items as QuoteItemRecord[],
        };
      }
      return null;
    });

    const promise = (async (): Promise<QuoteDetails | null> => {
      try {
        const details = await doFetch(controller.signal);

        // Si fue cancelada antes de terminar
        if (controller.signal.aborted) {
          return null;
        }

        // Si la generación avanzó (se invalidó o editó mientras la petición estaba en vuelo),
        // descartar la respuesta y NO escribir en caché.
        const currentGeneration = this.generations.get(quoteId) || 0;
        if (currentGeneration !== startGeneration) {
          return null;
        }

        if (details) {
          this.writeToCache(quoteId, details);
          return details;
        }

        return null;
      } catch (err: unknown) {
        // Una cancelación esperada no debe propagar un error
        if (err instanceof Error && err.name === 'AbortError') {
          return null;
        }
        return null;
      } finally {
        // Limpiar el mapa inflight para permitir reintentos posteriores
        const current = this.inflight.get(quoteId);
        if (current?.controller === controller) {
          this.inflight.delete(quoteId);
        }
      }
    })();

    this.inflight.set(quoteId, {
      promise,
      controller,
      generation: startGeneration,
    });

    return promise;
  }

  /**
   * Actualiza o escribe directamente los datos en la caché (por ejemplo tras guardar con PUT/POST).
   * Invalida peticiones en vuelo e incrementa la generación.
   */
  public set(quoteId: string, details: QuoteDetails): void {
    const existing = this.inflight.get(quoteId);
    if (existing) {
      existing.controller.abort();
      this.inflight.delete(quoteId);
    }

    // Avanzar versión para invalidar cualquier petición en vuelo previa
    const nextGen = (this.generations.get(quoteId) || 0) + 1;
    this.generations.set(quoteId, nextGen);

    this.writeToCache(quoteId, details);
  }

  /**
   * Invalida la entrada de caché y cancela peticiones en vuelo para un quoteId.
   */
  public invalidate(quoteId: string): void {
    const existing = this.inflight.get(quoteId);
    if (existing) {
      existing.controller.abort();
      this.inflight.delete(quoteId);
    }

    const nextGen = (this.generations.get(quoteId) || 0) + 1;
    this.generations.set(quoteId, nextGen);
    this.cache.delete(quoteId);
  }

  /**
   * Limpia toda la caché y aborta todas las solicitudes en vuelo.
   */
  public clear(): void {
    for (const [, item] of this.inflight) {
      item.controller.abort();
    }
    this.inflight.clear();
    this.cache.clear();
    this.generations.clear();
  }

  public has(quoteId: string): boolean {
    return this.cache.has(quoteId);
  }

  public size(): number {
    return this.cache.size;
  }

  public getInflightCount(): number {
    return this.inflight.size;
  }

  private writeToCache(quoteId: string, details: QuoteDetails): void {
    if (this.cache.has(quoteId)) {
      this.cache.delete(quoteId);
    } else if (this.cache.size >= this.maxSize) {
      // Política LRU: desalojar la entrada más antigua (primera llave del Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(quoteId, details);
  }
}

export const quoteDetailsCache = new QuoteDetailsCacheService(20);
