import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabaseAdmin, isSupabaseConfigured, requireDurableStorage } from '../config/supabase';

export interface ClientRecord {
  id: string;
  userId: string;
  name: string;
  docType: 'none' | 'dni' | 'ruc' | 'other';
  docNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  }
}

function loadLocalClients(): ClientRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(CLIENTS_FILE)) {
      const raw = fs.readFileSync(CLIENTS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

function saveLocalClients(items: ClientRecord[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(items, null, 2));
  } catch {}
}

export class ClientRepository {
  async create(data: Omit<ClientRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientRecord> {
    const now = new Date().toISOString();
    const newClient: ClientRecord = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data: dbData, error } = await supabase
          .from('clients')
          .insert({
            id: newClient.id,
            user_id: newClient.userId,
            name: newClient.name,
            doc_type: newClient.docType,
            doc_number: newClient.docNumber || null,
            phone: newClient.phone || null,
            email: newClient.email || null,
            address: newClient.address || null,
            notes: newClient.notes || null,
            status: newClient.status,
            created_at: newClient.createdAt,
            updated_at: newClient.updatedAt,
          })
          .select()
          .single();

        if (!error && dbData) {
          return {
            id: dbData.id,
            userId: dbData.user_id,
            name: dbData.name,
            docType: dbData.doc_type,
            docNumber: dbData.doc_number || undefined,
            phone: dbData.phone || undefined,
            email: dbData.email || undefined,
            address: dbData.address || undefined,
            notes: dbData.notes || undefined,
            status: dbData.status,
            createdAt: dbData.created_at,
            updatedAt: dbData.updated_at,
          };
        }
      }
    }

    requireDurableStorage();
    const list = loadLocalClients();
    list.unshift(newClient);
    saveLocalClients(list);
    return newClient;
  }

  async findById(id: string, userId: string): Promise<ClientRecord | null> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            docType: data.doc_type,
            docNumber: data.doc_number || undefined,
            phone: data.phone || undefined,
            email: data.email || undefined,
            address: data.address || undefined,
            notes: data.notes || undefined,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
        return null;
      }
    }

    requireDurableStorage();
    const list = loadLocalClients();
    return list.find(c => c.id === id && c.userId === userId) || null;
  }

  async findByUserId(userId: string, search?: string): Promise<ClientRecord[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        let query = supabase
          .from('clients')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('name', { ascending: true });

        if (search && search.trim()) {
          const s = search.trim();
          query = query.or(`name.ilike.%${s}%,doc_number.ilike.%${s}%,phone.ilike.%${s}%`);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(d => ({
            id: d.id,
            userId: d.user_id,
            name: d.name,
            docType: d.doc_type,
            docNumber: d.doc_number || undefined,
            phone: d.phone || undefined,
            email: d.email || undefined,
            address: d.address || undefined,
            notes: d.notes || undefined,
            status: d.status,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      }
    }

    requireDurableStorage();
    let list = loadLocalClients().filter(c => c.userId === userId && c.status === 'active');
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(s) ||
        (c.docNumber && c.docNumber.includes(s)) ||
        (c.phone && c.phone.includes(s))
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  async update(id: string, userId: string, updates: Partial<ClientRecord>): Promise<ClientRecord | null> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const payload: Record<string, unknown> = { updated_at: now };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.docType !== undefined) payload.doc_type = updates.docType;
        if (updates.docNumber !== undefined) payload.doc_number = updates.docNumber || null;
        if (updates.phone !== undefined) payload.phone = updates.phone || null;
        if (updates.email !== undefined) payload.email = updates.email || null;
        if (updates.address !== undefined) payload.address = updates.address || null;
        if (updates.notes !== undefined) payload.notes = updates.notes || null;
        if (updates.status !== undefined) payload.status = updates.status;

        const { data, error } = await supabase
          .from('clients')
          .update(payload)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            docType: data.doc_type,
            docNumber: data.doc_number || undefined,
            phone: data.phone || undefined,
            email: data.email || undefined,
            address: data.address || undefined,
            notes: data.notes || undefined,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
        return null;
      }
    }

    requireDurableStorage();
    const list = loadLocalClients();
    const idx = list.findIndex(c => c.id === id && c.userId === userId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: now,
    };
    saveLocalClients(list);
    return list[idx];
  }

  async delete(id: string, userId: string): Promise<boolean> {
    return (await this.update(id, userId, { status: 'archived' })) !== null;
  }
}

export const clientRepository = new ClientRepository();
