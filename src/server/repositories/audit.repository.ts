import { getSupabaseAdmin, isSupabaseConfigured } from '../config/supabase';

export interface AuditLogEntry {
  id?: string;
  action: string;
  performedBy: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export class AuditRepository {
  private inMemoryLogs: AuditLogEntry[] = [];

  async logAction(action: string, performedBy: string, targetId?: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry: AuditLogEntry = {
      action,
      performedBy,
      targetId,
      metadata,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase.from('audit_logs').insert({
          action: entry.action,
          performed_by: entry.performedBy,
          target_id: entry.targetId,
          metadata: entry.metadata || {},
          created_at: entry.createdAt,
        });
        return;
      }
    }

    // In-memory fallback
    this.inMemoryLogs.unshift(entry);
    if (this.inMemoryLogs.length > 200) {
      this.inMemoryLogs.pop();
    }
  }

  async getRecentLogs(limit = 50): Promise<AuditLogEntry[]> {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data.map(row => ({
            id: row.id,
            action: row.action,
            performedBy: row.performed_by,
            targetId: row.target_id,
            metadata: row.metadata,
            createdAt: row.created_at,
          }));
        }
      }
    }

    return this.inMemoryLogs.slice(0, limit);
  }
}

export const auditRepository = new AuditRepository();
