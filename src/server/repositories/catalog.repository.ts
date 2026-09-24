import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabaseAdmin, isSupabaseConfigured, requireDurableStorage } from '../config/supabase';
import { UnitType } from '@/core/calculators/quote';

export interface CatalogItemRecord {
  id: string;
  userId: string;
  type: 'product' | 'service';
  name: string;
  description?: string;
  sku?: string;
  unit: UnitType;
  price: number;
  isIgvAffected: boolean;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  }
}

function loadLocalCatalog(): CatalogItemRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(CATALOG_FILE)) {
      const raw = fs.readFileSync(CATALOG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

function saveLocalCatalog(items: CatalogItemRecord[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(items, null, 2));
  } catch {}
}

export class CatalogRepository {
  async create(data: Omit<CatalogItemRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CatalogItemRecord> {
    const now = new Date().toISOString();
    const newItem: CatalogItemRecord = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data: dbData, error } = await supabase
          .from('catalog_items')
          .insert({
            id: newItem.id,
            user_id: newItem.userId,
            type: newItem.type,
            name: newItem.name,
            description: newItem.description || null,
            sku: newItem.sku || null,
            unit: newItem.unit,
            price: newItem.price,
            is_igv_affected: newItem.isIgvAffected,
            status: newItem.status,
            created_at: newItem.createdAt,
            updated_at: newItem.updatedAt,
          })
          .select()
          .single();

        if (!error && dbData) {
          return {
            id: dbData.id,
            userId: dbData.user_id,
            type: dbData.type,
            name: dbData.name,
            description: dbData.description || undefined,
            sku: dbData.sku || undefined,
            unit: dbData.unit,
            price: Number(dbData.price),
            isIgvAffected: Boolean(dbData.is_igv_affected),
            status: dbData.status,
            createdAt: dbData.created_at,
            updatedAt: dbData.updated_at,
          };
        }
      }
    }

    requireDurableStorage();
    const list = loadLocalCatalog();
    list.unshift(newItem);
    saveLocalCatalog(list);
    return newItem;
  }

  async findById(id: string, userId: string): Promise<CatalogItemRecord | null> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('catalog_items')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            type: data.type,
            name: data.name,
            description: data.description || undefined,
            sku: data.sku || undefined,
            unit: data.unit,
            price: Number(data.price),
            isIgvAffected: Boolean(data.is_igv_affected),
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
        return null;
      }
    }

    requireDurableStorage();
    const list = loadLocalCatalog();
    return list.find(item => item.id === id && item.userId === userId) || null;
  }

  async findByUserId(userId: string, options?: { status?: 'active' | 'archived' | 'all'; query?: string }): Promise<CatalogItemRecord[]> {
    const statusFilter = options?.status || 'active';
    const searchQuery = options?.query?.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        let q = supabase
          .from('catalog_items')
          .select('*')
          .eq('user_id', userId)
          .order('name', { ascending: true });

        if (statusFilter !== 'all') {
          q = q.eq('status', statusFilter);
        }

        if (searchQuery) {
          q = q.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
        }

        const { data, error } = await q;
        if (!error && data) {
          return data.map(dbData => ({
            id: dbData.id,
            userId: dbData.user_id,
            type: dbData.type,
            name: dbData.name,
            description: dbData.description || undefined,
            sku: dbData.sku || undefined,
            unit: dbData.unit,
            price: Number(dbData.price),
            isIgvAffected: Boolean(dbData.is_igv_affected),
            status: dbData.status,
            createdAt: dbData.created_at,
            updatedAt: dbData.updated_at,
          }));
        }
      }
    }

    requireDurableStorage();
    let list = loadLocalCatalog().filter(i => i.userId === userId);
    if (statusFilter !== 'all') {
      list = list.filter(i => i.status === statusFilter);
    }
    if (searchQuery) {
      list = list.filter(i =>
        i.name.toLowerCase().includes(searchQuery) ||
        (i.description && i.description.toLowerCase().includes(searchQuery)) ||
        (i.sku && i.sku.toLowerCase().includes(searchQuery))
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  async update(id: string, userId: string, updates: Partial<CatalogItemRecord>): Promise<CatalogItemRecord | null> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const payload: Record<string, unknown> = { updated_at: now };
        if (updates.type !== undefined) payload.type = updates.type;
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.description !== undefined) payload.description = updates.description || null;
        if (updates.sku !== undefined) payload.sku = updates.sku || null;
        if (updates.unit !== undefined) payload.unit = updates.unit;
        if (updates.price !== undefined) payload.price = updates.price;
        if (updates.isIgvAffected !== undefined) payload.is_igv_affected = updates.isIgvAffected;
        if (updates.status !== undefined) payload.status = updates.status;

        const { data, error } = await supabase
          .from('catalog_items')
          .update(payload)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            type: data.type,
            name: data.name,
            description: data.description || undefined,
            sku: data.sku || undefined,
            unit: data.unit,
            price: Number(data.price),
            isIgvAffected: Boolean(data.is_igv_affected),
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
        return null;
      }
    }

    requireDurableStorage();
    const list = loadLocalCatalog();
    const idx = list.findIndex(i => i.id === id && i.userId === userId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: now,
    };
    saveLocalCatalog(list);
    return list[idx];
  }

  async archive(id: string, userId: string): Promise<boolean> {
    return (await this.update(id, userId, { status: 'archived' })) !== null;
  }
}

export const catalogRepository = new CatalogRepository();
