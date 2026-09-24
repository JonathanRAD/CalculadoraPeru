import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabaseAdmin, isSupabaseConfigured, requireDurableStorage } from '../config/supabase';
import { QuoteStatus, UnitType, DiscountType } from '@/core/calculators/quote';
import { sanitizePostgrestSearch } from '../utils/search-sanitizer';
import { clientRepository } from './client.repository';
import { catalogRepository } from './catalog.repository';

export interface QuoteRecord {
  id: string;
  userId: string;
  quoteNumber: string;
  prefix: string;
  correlative: number;
  clientId?: string;
  clientName: string;
  clientDocType: 'none' | 'dni' | 'ruc' | 'other';
  clientDocNumber?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  issueDate: string; // YYYY-MM-DD
  validUntil?: string; // YYYY-MM-DD
  currency: 'PEN';
  subtotalGross: number;
  itemsDiscountTotal: number;
  globalDiscountType: DiscountType;
  globalDiscountValue: number;
  globalDiscountAmount: number;
  discountTotal: number;
  subtotalNet: number;
  taxableBase: number;
  exemptBase: number;
  igvRate: number;
  igvAmount: number;
  totalAmount: number;
  paymentTerms?: string;
  deliveryTime?: string;
  publicNotes?: string;
  internalNotes?: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItemRecord {
  id: string;
  quoteId: string;
  userId: string;
  catalogItemId?: string;
  sortOrder: number;
  description: string;
  type: 'product' | 'service';
  unit: UnitType;
  quantity: number;
  unitPrice: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  isIgvAffected: boolean;
  grossAmount: number;
  netAmount: number;
  createdAt: string;
}

export interface QuoteWithItems {
  quote: QuoteRecord;
  items: QuoteItemRecord[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.json');
const QUOTE_ITEMS_FILE = path.join(DATA_DIR, 'quote_items.json');
const QUOTE_SEQUENCES_FILE = path.join(DATA_DIR, 'quote_sequences.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  }
}

function loadLocalQuotes(): QuoteRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(QUOTES_FILE)) {
      return JSON.parse(fs.readFileSync(QUOTES_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveLocalQuotes(items: QuoteRecord[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(QUOTES_FILE, JSON.stringify(items, null, 2));
  } catch {}
}

function loadLocalQuoteItems(): QuoteItemRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(QUOTE_ITEMS_FILE)) {
      return JSON.parse(fs.readFileSync(QUOTE_ITEMS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveLocalQuoteItems(items: QuoteItemRecord[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(QUOTE_ITEMS_FILE, JSON.stringify(items, null, 2));
  } catch {}
}

function getLocalAtomicCorrelative(userId: string, prefix: string): number {
  ensureDataDir();
  let seqMap: Record<string, number> = {};
  try {
    if (fs.existsSync(QUOTE_SEQUENCES_FILE)) {
      seqMap = JSON.parse(fs.readFileSync(QUOTE_SEQUENCES_FILE, 'utf-8'));
    }
  } catch {}

  const key = `${userId}_${prefix.toUpperCase()}`;
  const current = seqMap[key] || 0;
  const next = current + 1;
  seqMap[key] = next;

  try {
    fs.writeFileSync(QUOTE_SEQUENCES_FILE, JSON.stringify(seqMap, null, 2));
  } catch {}

  return next;
}

function mapQuoteDb(row: Record<string, unknown>): QuoteRecord {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    quoteNumber: row.quote_number as string,
    prefix: (row.prefix as string) || 'COT-',
    correlative: Number(row.correlative),
    clientId: (row.client_id as string) || undefined,
    clientName: row.client_name as string,
    clientDocType: (row.client_doc_type as 'none' | 'dni' | 'ruc' | 'other') || 'none',
    clientDocNumber: (row.client_doc_number as string) || undefined,
    clientPhone: (row.client_phone as string) || undefined,
    clientEmail: (row.client_email as string) || undefined,
    clientAddress: (row.client_address as string) || undefined,
    issueDate: row.issue_date as string,
    validUntil: (row.valid_until as string) || undefined,
    currency: 'PEN',
    subtotalGross: Number(row.subtotal_gross || 0),
    itemsDiscountTotal: Number(row.items_discount_total || 0),
    globalDiscountType: (row.global_discount_type as DiscountType) || 'none',
    globalDiscountValue: Number(row.global_discount_value || 0),
    globalDiscountAmount: Number(row.global_discount_amount || 0),
    discountTotal: Number(row.discount_total || 0),
    subtotalNet: Number(row.subtotal_net || 0),
    taxableBase: Number(row.taxable_base || 0),
    exemptBase: Number(row.exempt_base || 0),
    igvRate: Number(row.igv_rate ?? 0.18),
    igvAmount: Number(row.igv_amount || 0),
    totalAmount: Number(row.total_amount || 0),
    paymentTerms: (row.payment_terms as string) || undefined,
    deliveryTime: (row.delivery_time as string) || undefined,
    publicNotes: (row.public_notes as string) || undefined,
    internalNotes: (row.internal_notes as string) || undefined,
    status: (row.status as QuoteStatus) || 'draft',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapItemDb(row: Record<string, unknown>): QuoteItemRecord {
  return {
    id: row.id as string,
    quoteId: row.quote_id as string,
    userId: row.user_id as string,
    catalogItemId: (row.catalog_item_id as string) || undefined,
    sortOrder: Number(row.sort_order || 0),
    description: row.description as string,
    type: (row.type as 'product' | 'service') || 'product',
    unit: (row.unit as UnitType) || 'unit',
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    discountType: (row.discount_type as DiscountType) || 'none',
    discountValue: Number(row.discount_value || 0),
    discountAmount: Number(row.discount_amount || 0),
    isIgvAffected: Boolean(row.is_igv_affected),
    grossAmount: Number(row.gross_amount || 0),
    netAmount: Number(row.net_amount || 0),
    createdAt: row.created_at as string,
  };
}

export interface QuoteCorrelativeResult {
  prefix: string;
  correlative: number;
  quoteNumber: string;
}

export class QuoteRepository {
  /**
   * Valida estrictamente la propiedad de clientId y catalogItemIds para evitar
   * que un usuario enlace entidades de otra cuenta (Cross-tenant security).
   */
  async validateEntityOwnership(
    userId: string,
    clientId?: string,
    catalogItemIds: string[] = []
  ): Promise<{ isValid: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const clientPromise = clientId
          ? supabase
              .from('clients')
              .select('id')
              .eq('id', clientId)
              .eq('user_id', userId)
              .maybeSingle()
          : Promise.resolve({ data: { id: clientId }, error: null });

        const validCatalogIds = catalogItemIds.filter(Boolean);
        const catalogPromise = validCatalogIds.length > 0
          ? supabase
              .from('catalog_items')
              .select('id')
              .in('id', validCatalogIds)
              .eq('user_id', userId)
          : Promise.resolve({ data: [], error: null });

        const [clientRes, catalogRes] = await Promise.all([clientPromise, catalogPromise]);

        if (clientId && (clientRes.error || !clientRes.data)) {
          return { isValid: false, error: 'El cliente seleccionado no pertenece a tu cuenta o no existe.' };
        }

        if (validCatalogIds.length > 0 && (catalogRes.error || !catalogRes.data || catalogRes.data.length !== new Set(validCatalogIds).size)) {
          return { isValid: false, error: 'Uno o más productos del catálogo no pertenecen a tu cuenta.' };
        }
      }
    } else {
      if (clientId) {
        const client = await clientRepository.findById(clientId, userId);
        if (!client) {
          return { isValid: false, error: 'El cliente seleccionado no pertenece a tu cuenta o no existe.' };
        }
      }
      for (const catId of catalogItemIds) {
        if (catId) {
          const item = await catalogRepository.findById(catId, userId);
          if (!item) {
            return { isValid: false, error: 'Uno o más productos del catálogo no pertenecen a tu cuenta.' };
          }
        }
      }
    }
    return { isValid: true };
  }

  async validateOwnerships(
    userId: string,
    clientId?: string,
    catalogItemIds: string[] = []
  ): Promise<{ isValid: boolean; error?: string }> {
    return this.validateEntityOwnership(userId, clientId, catalogItemIds);
  }

  async getNextCorrelative(userId: string, prefix = 'COT-'): Promise<QuoteCorrelativeResult> {
    const cleanPrefix = prefix.trim().toUpperCase() || 'COT-';

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        // Invocar la función RPC atómica get_next_quote_correlative que devuelve jsonb { prefix, correlative, quoteNumber }
        const { data: rpcVal, error: rpcErr } = await supabase.rpc('get_next_quote_correlative', {
          p_user_id: userId,
          p_prefix: cleanPrefix,
        });

        if (rpcErr) {
          throw new Error(`Error generando correlativo atómico en Supabase: ${rpcErr.message}`);
        }

        if (rpcVal && typeof rpcVal === 'object' && 'correlative' in rpcVal) {
          const res = rpcVal as { prefix?: string; correlative?: number; quoteNumber?: string };
          const num = Number(res.correlative);
          const pfx = String(res.prefix || cleanPrefix);
          const qNum = String(res.quoteNumber || `${pfx}${String(num).padStart(5, '0')}`);
          return {
            prefix: pfx,
            correlative: num,
            quoteNumber: qNum,
          };
        }

        throw new Error('Respuesta inesperada al generar correlativo atómico en Supabase.');
      }
    }

    requireDurableStorage();
    const correlative = getLocalAtomicCorrelative(userId, cleanPrefix);
    const quoteNumber = `${cleanPrefix}${String(correlative).padStart(5, '0')}`;
    return {
      prefix: cleanPrefix,
      correlative,
      quoteNumber,
    };
  }

  async create(
    quoteData: Omit<QuoteRecord, 'id' | 'createdAt' | 'updatedAt' | 'quoteNumber' | 'correlative'> & { prefix?: string },
    itemsData: Omit<QuoteItemRecord, 'id' | 'quoteId' | 'userId' | 'createdAt'>[]
  ): Promise<QuoteWithItems> {
    const now = new Date().toISOString();
    const prefix = (quoteData.prefix || 'COT-').trim().toUpperCase();

    // 1. Verificación de propiedad (Cross-Tenant check)
    const catalogIds = itemsData.map(i => i.catalogItemId).filter(Boolean) as string[];
    const ownership = await this.validateEntityOwnership(quoteData.userId, quoteData.clientId, catalogIds);
    if (!ownership.isValid) {
      throw new Error(ownership.error);
    }

    const quoteId = crypto.randomUUID();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        // Invocación transaccional atómica: save_quote_atomic genera el correlativo atómicamente
        const { error: rpcErr } = await supabase.rpc('save_quote_atomic', {
          p_quote_id: quoteId,
          p_user_id: quoteData.userId,
          p_prefix: prefix,
          p_client_id: quoteData.clientId || null,
          p_client_name: quoteData.clientName,
          p_client_doc_type: quoteData.clientDocType,
          p_client_doc_number: quoteData.clientDocNumber || null,
          p_client_phone: quoteData.clientPhone || null,
          p_client_email: quoteData.clientEmail || null,
          p_client_address: quoteData.clientAddress || null,
          p_issue_date: quoteData.issueDate,
          p_valid_until: quoteData.validUntil || null,
          p_currency: 'PEN',
          p_subtotal_gross: quoteData.subtotalGross,
          p_items_discount_total: quoteData.itemsDiscountTotal,
          p_global_discount_type: quoteData.globalDiscountType,
          p_global_discount_value: quoteData.globalDiscountValue,
          p_global_discount_amount: quoteData.globalDiscountAmount,
          p_discount_total: quoteData.discountTotal,
          p_subtotal_net: quoteData.subtotalNet,
          p_taxable_base: quoteData.taxableBase,
          p_exempt_base: quoteData.exemptBase,
          p_igv_rate: quoteData.igvRate,
          p_igv_amount: quoteData.igvAmount,
          p_total_amount: quoteData.totalAmount,
          p_payment_terms: quoteData.paymentTerms || null,
          p_delivery_time: quoteData.deliveryTime || null,
          p_public_notes: quoteData.publicNotes || null,
          p_internal_notes: quoteData.internalNotes || null,
          p_status: quoteData.status,
          p_items: itemsData.map((it, idx) => ({
            id: crypto.randomUUID(),
            catalogItemId: it.catalogItemId || null,
            sortOrder: it.sortOrder ?? idx + 1,
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
          })),
        });

        if (rpcErr) {
          throw new Error(`Error en persistencia atómica de cotización: ${rpcErr.message}`);
        }

        const created = await this.findById(quoteId, quoteData.userId);
        if (!created) {
          throw new Error('Error recuperando la cotización creada en persistencia atómica.');
        }
        return created;
      }
    }

    requireDurableStorage();
    const nextSeq = await this.getNextCorrelative(quoteData.userId, prefix);
    const quoteRecord: QuoteRecord = {
      ...quoteData,
      id: quoteId,
      prefix: nextSeq.prefix,
      correlative: nextSeq.correlative,
      quoteNumber: nextSeq.quoteNumber,
      createdAt: now,
      updatedAt: now,
    };
    const quotes = loadLocalQuotes();
    quotes.unshift(quoteRecord);
    saveLocalQuotes(quotes);

    const quoteItems: QuoteItemRecord[] = itemsData.map((it, idx) => ({
      ...it,
      id: crypto.randomUUID(),
      quoteId,
      userId: quoteData.userId,
      sortOrder: it.sortOrder ?? idx + 1,
      createdAt: now,
    }));

    const allItems = loadLocalQuoteItems();
    allItems.push(...quoteItems);
    saveLocalQuoteItems(allItems);

    return { quote: quoteRecord, items: quoteItems };
  }

  async findById(id: string, userId: string): Promise<QuoteWithItems | null> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const [quoteRes, itemsRes] = await Promise.all([
          supabase
            .from('quotes')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .maybeSingle(),
          supabase
            .from('quote_items')
            .select('*')
            .eq('quote_id', id)
            .eq('user_id', userId)
            .order('sort_order', { ascending: true }),
        ]);

        if (quoteRes.error || !quoteRes.data || itemsRes.error) return null;

        return {
          quote: mapQuoteDb(quoteRes.data as Record<string, unknown>),
          items: (itemsRes.data || []).map(r => mapItemDb(r as Record<string, unknown>)),
        };
      }
    }

    requireDurableStorage();
    const quotes = loadLocalQuotes();
    const quote = quotes.find(q => q.id === id && q.userId === userId);
    if (!quote) return null;

    const items = loadLocalQuoteItems()
      .filter(i => i.quoteId === id && i.userId === userId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return { quote, items };
  }

  async findByUserId(
    userId: string,
    options?: {
      query?: string;
      status?: QuoteStatus | 'all';
      limit?: number;
      offset?: number;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{ quotes: QuoteRecord[]; total: number }> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    const status = options?.status ?? 'all';
    const search = options?.query?.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        let q = supabase
          .from('quotes')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (status !== 'all') {
          q = q.eq('status', status);
        }
        if (options?.dateFrom) {
          q = q.gte('issue_date', options.dateFrom);
        }
        if (options?.dateTo) {
          q = q.lte('issue_date', options.dateTo);
        }
        if (search) {
          const sanitizedSearch = sanitizePostgrestSearch(search, 50);
          if (sanitizedSearch.length > 0) {
            q = q.or(`quote_number.ilike.%${sanitizedSearch}%,client_name.ilike.%${sanitizedSearch}%`);
          }
        }

        q = q.range(offset, offset + limit - 1);

        const { data, count, error } = await q;
        if (!error && data) {
          return {
            quotes: data.map(r => mapQuoteDb(r as Record<string, unknown>)),
            total: count ?? data.length,
          };
        }
      }
    }

    requireDurableStorage();
    let quotes = loadLocalQuotes().filter(q => q.userId === userId);
    if (status !== 'all') {
      quotes = quotes.filter(q => q.status === status);
    }
    if (options?.dateFrom) {
      quotes = quotes.filter(q => q.issueDate >= options.dateFrom!);
    }
    if (options?.dateTo) {
      quotes = quotes.filter(q => q.issueDate <= options.dateTo!);
    }
    if (search) {
      quotes = quotes.filter(
        q =>
          q.quoteNumber.toLowerCase().includes(search) ||
          q.clientName.toLowerCase().includes(search)
      );
    }

    const total = quotes.length;
    const paged = quotes.slice(offset, offset + limit);
    return { quotes: paged, total };
  }

  async update(
    id: string,
    userId: string,
    quoteUpdates: Partial<QuoteRecord>,
    itemsData?: Omit<QuoteItemRecord, 'id' | 'quoteId' | 'userId' | 'createdAt'>[]
  ): Promise<QuoteWithItems | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();

    // Verificación de propiedad (Cross-tenant check)
    if (quoteUpdates.clientId !== undefined) {
      const catalogIds = itemsData ? (itemsData.map(i => i.catalogItemId).filter(Boolean) as string[]) : [];
      const ownership = await this.validateEntityOwnership(userId, quoteUpdates.clientId, catalogIds);
      if (!ownership.isValid) {
        throw new Error(ownership.error);
      }
    }

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const finalItems = itemsData || existing.items;

        const { error: rpcErr } = await supabase.rpc('save_quote_atomic', {
          p_quote_id: id,
          p_user_id: userId,
          p_prefix: existing.quote.prefix,
          p_client_id: quoteUpdates.clientId !== undefined ? (quoteUpdates.clientId || null) : (existing.quote.clientId || null),
          p_client_name: quoteUpdates.clientName ?? existing.quote.clientName,
          p_client_doc_type: quoteUpdates.clientDocType ?? existing.quote.clientDocType,
          p_client_doc_number: quoteUpdates.clientDocNumber !== undefined ? (quoteUpdates.clientDocNumber || null) : (existing.quote.clientDocNumber || null),
          p_client_phone: quoteUpdates.clientPhone !== undefined ? (quoteUpdates.clientPhone || null) : (existing.quote.clientPhone || null),
          p_client_email: quoteUpdates.clientEmail !== undefined ? (quoteUpdates.clientEmail || null) : (existing.quote.clientEmail || null),
          p_client_address: quoteUpdates.clientAddress !== undefined ? (quoteUpdates.clientAddress || null) : (existing.quote.clientAddress || null),
          p_issue_date: quoteUpdates.issueDate ?? existing.quote.issueDate,
          p_valid_until: quoteUpdates.validUntil !== undefined ? (quoteUpdates.validUntil || null) : (existing.quote.validUntil || null),
          p_currency: 'PEN',
          p_subtotal_gross: quoteUpdates.subtotalGross ?? existing.quote.subtotalGross,
          p_items_discount_total: quoteUpdates.itemsDiscountTotal ?? existing.quote.itemsDiscountTotal,
          p_global_discount_type: quoteUpdates.globalDiscountType ?? existing.quote.globalDiscountType,
          p_global_discount_value: quoteUpdates.globalDiscountValue ?? existing.quote.globalDiscountValue,
          p_global_discount_amount: quoteUpdates.globalDiscountAmount ?? existing.quote.globalDiscountAmount,
          p_discount_total: quoteUpdates.discountTotal ?? existing.quote.discountTotal,
          p_subtotal_net: quoteUpdates.subtotalNet ?? existing.quote.subtotalNet,
          p_taxable_base: quoteUpdates.taxableBase ?? existing.quote.taxableBase,
          p_exempt_base: quoteUpdates.exemptBase ?? existing.quote.exemptBase,
          p_igv_rate: quoteUpdates.igvRate ?? existing.quote.igvRate,
          p_igv_amount: quoteUpdates.igvAmount ?? existing.quote.igvAmount,
          p_total_amount: quoteUpdates.totalAmount ?? existing.quote.totalAmount,
          p_payment_terms: quoteUpdates.paymentTerms !== undefined ? (quoteUpdates.paymentTerms || null) : (existing.quote.paymentTerms || null),
          p_delivery_time: quoteUpdates.deliveryTime !== undefined ? (quoteUpdates.deliveryTime || null) : (existing.quote.deliveryTime || null),
          p_public_notes: quoteUpdates.publicNotes !== undefined ? (quoteUpdates.publicNotes || null) : (existing.quote.publicNotes || null),
          p_internal_notes: quoteUpdates.internalNotes !== undefined ? (quoteUpdates.internalNotes || null) : (existing.quote.internalNotes || null),
          p_status: quoteUpdates.status ?? existing.quote.status,
          p_items: finalItems.map((it, idx) => ({
            id: ('id' in it && typeof (it as { id?: unknown }).id === 'string' ? (it as { id: string }).id : crypto.randomUUID()),
            catalogItemId: it.catalogItemId || null,
            sortOrder: it.sortOrder ?? idx + 1,
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
          })),
        });

        if (rpcErr) {
          throw new Error(`Error en actualización atómica de cotización: ${rpcErr.message}`);
        }

        return this.findById(id, userId);
      }
    }

    requireDurableStorage();
    const quotes = loadLocalQuotes();
    const idx = quotes.findIndex(q => q.id === id && q.userId === userId);
    if (idx === -1) return null;

    quotes[idx] = {
      ...quotes[idx],
      ...quoteUpdates,
      updatedAt: now,
    };
    saveLocalQuotes(quotes);

    if (itemsData) {
      const items = loadLocalQuoteItems().filter(i => !(i.quoteId === id && i.userId === userId));
      const freshItems: QuoteItemRecord[] = itemsData.map((item, iIdx) => ({
        id: crypto.randomUUID(),
        quoteId: id,
        userId,
        catalogItemId: item.catalogItemId,
        sortOrder: item.sortOrder ?? iIdx,
        description: item.description,
        type: item.type,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountType: item.discountType,
        discountValue: item.discountValue,
        discountAmount: item.discountAmount,
        isIgvAffected: item.isIgvAffected,
        grossAmount: item.grossAmount,
        netAmount: item.netAmount,
        createdAt: now,
      }));
      items.push(...freshItems);
      saveLocalQuoteItems(items);
    }

    return this.findById(id, userId);
  }

  async duplicate(id: string, userId: string): Promise<QuoteWithItems | null> {
    const original = await this.findById(id, userId);
    if (!original) return null;

    const today = new Date().toISOString().slice(0, 10);
    const { quote, items } = original;

    const cloned = await this.create(
      {
        userId,
        prefix: quote.prefix,
        clientId: quote.clientId,
        clientName: quote.clientName,
        clientDocType: quote.clientDocType,
        clientDocNumber: quote.clientDocNumber,
        clientPhone: quote.clientPhone,
        clientEmail: quote.clientEmail,
        clientAddress: quote.clientAddress,
        issueDate: today,
        validUntil: undefined,
        currency: 'PEN',
        subtotalGross: quote.subtotalGross,
        itemsDiscountTotal: quote.itemsDiscountTotal,
        globalDiscountType: quote.globalDiscountType,
        globalDiscountValue: quote.globalDiscountValue,
        globalDiscountAmount: quote.globalDiscountAmount,
        discountTotal: quote.discountTotal,
        subtotalNet: quote.subtotalNet,
        taxableBase: quote.taxableBase,
        exemptBase: quote.exemptBase,
        igvRate: quote.igvRate,
        igvAmount: quote.igvAmount,
        totalAmount: quote.totalAmount,
        paymentTerms: quote.paymentTerms,
        deliveryTime: quote.deliveryTime,
        publicNotes: quote.publicNotes,
        internalNotes: quote.internalNotes ? `[Duplicado de ${quote.quoteNumber}] ${quote.internalNotes}` : undefined,
        status: 'draft',
      },
      items.map(it => ({
        catalogItemId: it.catalogItemId,
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

    return cloned;
  }

  async archive(id: string, userId: string): Promise<boolean> {
    const res = await this.update(id, userId, { status: 'canceled' });
    return res !== null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase
          .from('quotes')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        return !error;
      }
    }

    requireDurableStorage();
    const quotes = loadLocalQuotes();
    const filteredQuotes = quotes.filter(q => !(q.id === id && q.userId === userId));
    saveLocalQuotes(filteredQuotes);

    const items = loadLocalQuoteItems();
    const filteredItems = items.filter(i => !(i.quoteId === id && i.userId === userId));
    saveLocalQuoteItems(filteredItems);

    return true;
  }
}

export const quoteRepository = new QuoteRepository();
