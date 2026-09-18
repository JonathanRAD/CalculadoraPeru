import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabaseAdmin, isSupabaseConfigured } from '../config/supabase';

export interface SavedCalculation {
  id: string;
  userId: string;
  calculatorType: string;
  title: string;
  summaryText?: string;
  totalAmount?: number;
  data: Record<string, unknown>;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const SAVED_CALCS_FILE = path.join(DATA_DIR, 'saved_calculations.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
}

function loadLocalCalculations(): SavedCalculation[] {
  try {
    ensureDataDir();
    if (fs.existsSync(SAVED_CALCS_FILE)) {
      const raw = fs.readFileSync(SAVED_CALCS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

function saveLocalCalculations(items: SavedCalculation[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(SAVED_CALCS_FILE, JSON.stringify(items, null, 2));
  } catch {}
}

export class SavedCalculationRepository {
  async save(calc: Omit<SavedCalculation, 'id' | 'createdAt'>): Promise<SavedCalculation> {
    const newEntry: SavedCalculation = {
      id: crypto.randomUUID(),
      ...calc,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('saved_calculations')
          .insert({
            user_id: newEntry.userId,
            calculator_type: newEntry.calculatorType,
            title: newEntry.title,
            summary_text: newEntry.summaryText || null,
            total_amount: newEntry.totalAmount ?? null,
            data: newEntry.data,
            created_at: newEntry.createdAt,
          })
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            calculatorType: data.calculator_type,
            title: data.title,
            summaryText: data.summary_text,
            totalAmount: data.total_amount ? Number(data.total_amount) : undefined,
            data: data.data || {},
            createdAt: data.created_at,
          };
        }
      }
    }

    // Local fallback store
    const list = loadLocalCalculations();
    list.unshift(newEntry);
    saveLocalCalculations(list);
    return newEntry;
  }

  async findByUserId(userId: string): Promise<SavedCalculation[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('saved_calculations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(r => ({
            id: r.id,
            userId: r.user_id,
            calculatorType: r.calculator_type,
            title: r.title,
            summaryText: r.summary_text,
            totalAmount: r.total_amount ? Number(r.total_amount) : undefined,
            data: r.data || {},
            createdAt: r.created_at,
          }));
        }
      }
    }

    const list = loadLocalCalculations();
    return list.filter(item => item.userId === userId);
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase
          .from('saved_calculations')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (!error) return true;
      }
    }

    const list = loadLocalCalculations();
    const filtered = list.filter(item => !(item.id === id && item.userId === userId));
    saveLocalCalculations(filtered);
    return true;
  }
}

export const savedCalculationRepository = new SavedCalculationRepository();
