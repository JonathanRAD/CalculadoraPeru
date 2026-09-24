import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin, isSupabaseConfigured, requireDurableStorage } from '../config/supabase';

export interface AnalyticsEvent {
  id?: string;
  eventType: 'page_view' | 'search' | 'calculator_use' | 'pro_click';
  path: string;
  query?: string;
  referrer?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
  sessionId?: string;
  createdAt?: string;
}

export interface AnalyticsSummary {
  liveActiveVisitors: number;
  totalPeriodVisits: number;
  trafficHistory: Array<{
    date: string;
    dayName: string;
    visits: number;
    uniqueUsers: number;
  }>;
  topPages: Array<{
    path: string;
    name: string;
    visits: number;
    share: number;
  }>;
  topSearches: Array<{
    query: string;
    count: number;
    lastSearched: string;
  }>;
  deviceShare: {
    mobile: number;
    desktop: number;
  };
}

const CALCULATOR_NAME_MAP: Record<string, string> = {
  '/': 'Página de Inicio',
  '/pro': 'CalculaPerú PRO',
  '/cotizador': 'Cotizador Comercial',
  '/calculadora-cts': 'CTS (Compensación por Tiempo de Servicios)',
  '/calculadora-igv': 'Calculadora de IGV (18% SUNAT)',
  '/sueldo-neto': 'Sueldo Neto y Boletas de Pago',
  '/liquidacion-laboral': 'Liquidación Laboral (D.L. 728)',
  '/gratificacion': 'Gratificación Legal (Julio/Diciembre)',
  '/horas-extras': 'Horas Extras y Nocturnas',
  '/recibo-por-honorarios': 'Recibo por Honorarios (4ta Cat)',
  '/tipo-de-cambio-dolar-sunat': 'Tipo de Cambio Dólar SUNAT',
  '/precio-de-venta': 'Precio de Venta y Margen Comercial',
  '/comisiones-pos-yape': 'Comisiones POS / Yape / Tarjetas',
  '/prestamo-bancario': 'Préstamo Bancario (Cuotas)',
  '/interes-compuesto': 'Interés Compuesto e Inversiones',
  '/calculadora-vacaciones': 'Cálculo de Vacaciones Truncas',
  '/consumo-electrico': 'Consumo Eléctrico en Soles',
  '/costeo-recetas': 'Costeo de Recetas Gastronómicas',
  '/descuentos-y-ofertas': 'Descuentos y Ofertas Comerciales',
  '/dividir-cuenta': 'Dividir Cuenta y Propinas',
  '/ganancia-por-producto': 'Ganancia Neta por Producto',
  '/gasto-combustible': 'Gasto de Combustible por KM',
  '/margen-de-ganancia': 'Margen Bruto vs Margen Neto',
  '/porcentajes': 'Calculadora de Porcentajes',
  '/punto-de-equilibrio': 'Punto de Equilibrio Empresarial',
  '/recuperacion-de-inversion': 'Retorno de Inversión (ROI)',
  '/regimenes-tributarios-sunat': 'Guía de Regímenes Tributarios',
  '/ventas-necesarias': 'Ventas Necesarias para Meta',
};

const DATA_DIR = path.join(process.cwd(), '.data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
}

function loadLocalEvents(): AnalyticsEvent[] {
  try {
    ensureDataDir();
    if (fs.existsSync(ANALYTICS_FILE)) {
      const raw = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

function saveLocalEvents(events: AnalyticsEvent[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(events.slice(0, 5000), null, 2));
  } catch {}
}

export class AnalyticsRepository {
  async recordEvent(event: AnalyticsEvent): Promise<void> {
    const entry: AnalyticsEvent = {
      ...event,
      device: event.device || 'desktop',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase.from('analytics_events').insert({
          event_type: entry.eventType,
          path: entry.path,
          query: entry.query || null,
          referrer: entry.referrer || null,
          device: entry.device,
          session_id: entry.sessionId || null,
          created_at: entry.createdAt,
        });
        if (!error) return;
      }
    }

    requireDurableStorage();
    // Local fallback store (persisted to .data/analytics.json)
    const local = loadLocalEvents();
    local.unshift(entry);
    saveLocalEvents(local);
  }

  async getAnalyticsSummary(days = 14): Promise<AnalyticsSummary> {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const liveCutoff = new Date(now.getTime() - 15 * 60 * 1000); // last 15 min

    let events: AnalyticsEvent[] = [];

    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('analytics_events')
          .select('*')
          .gte('created_at', cutoffDate.toISOString())
          .order('created_at', { ascending: false });

        if (error) throw new Error('No se pudieron consultar las métricas.');
        if (data) {
          events = data.map(r => ({
            id: r.id,
            eventType: r.event_type,
            path: r.path,
            query: r.query || undefined,
            referrer: r.referrer || undefined,
            device: r.device,
            sessionId: r.session_id || undefined,
            createdAt: r.created_at,
          }));
        }
      }
    }

    // Only the development-only local mode reads local events.
    if (!isSupabaseConfigured) {
      requireDurableStorage();
      const local = loadLocalEvents();
      events = local.filter(e => e.createdAt && new Date(e.createdAt) >= cutoffDate);
    }

    // 1. Live Active Visitors (last 15 minutes) - purely real
    const liveSessions = new Set<string>();
    let livePageViews = 0;
    events.forEach(e => {
      if (e.createdAt && new Date(e.createdAt) >= liveCutoff) {
        if (e.eventType === 'page_view') livePageViews++;
        if (e.eventType === 'page_view' && e.sessionId) liveSessions.add(e.sessionId);
      }
    });
    const liveActiveVisitors = liveSessions.size > 0 ? liveSessions.size : (livePageViews > 0 ? 1 : 0);

    // 2. Traffic History for the last N days
    const daysMap = new Map<string, { visits: number; sessions: Set<string>; dayName: string }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - (days - 1 - i));
      const key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()];
      daysMap.set(key, { visits: 0, sessions: new Set<string>(), dayName });
    }

    // Populate counts
    events.forEach(e => {
      if (!e.createdAt || e.eventType !== 'page_view') return;
      const d = new Date(e.createdAt);
      const key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const existing = daysMap.get(key);
      if (existing) {
        existing.visits++;
        if (e.sessionId) existing.sessions.add(e.sessionId);
      }
    });

    const trafficHistory = Array.from(daysMap.entries()).map(([date, val]) => ({
      date,
      dayName: val.dayName,
      visits: val.visits,
      uniqueUsers: val.sessions.size,
    }));

    const totalPeriodVisits = trafficHistory.reduce((acc, curr) => acc + curr.visits, 0);

    // 3. Top Pages Breakdown
    const pageCounts = new Map<string, number>();
    events.forEach(e => {
      if (e.eventType === 'page_view' && !e.path.startsWith('/admin')) {
        pageCounts.set(e.path, (pageCounts.get(e.path) || 0) + 1);
      }
    });

    const totalPageViews = Array.from(pageCounts.values()).reduce((a, b) => a + b, 0) || 1;
    const sortedPages = Array.from(pageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topPages = sortedPages.map(([path, visits]) => ({
      path,
      name: CALCULATOR_NAME_MAP[path] || path,
      visits,
      share: Math.round((visits / totalPageViews) * 100),
    }));

    // 4. Top Search Queries
    const searchCounts = new Map<string, { count: number; lastSearched: string }>();
    events.forEach(e => {
      if (e.eventType === 'search' && e.query) {
        const cleanQ = e.query.trim().toLowerCase();
        if (cleanQ.length >= 2) {
          const prev = searchCounts.get(cleanQ) || { count: 0, lastSearched: e.createdAt || '' };
          searchCounts.set(cleanQ, {
            count: prev.count + 1,
            lastSearched: e.createdAt || prev.lastSearched,
          });
        }
      }
    });

    const topSearches = Array.from(searchCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15)
      .map(([query, data]) => ({
        query,
        count: data.count,
        lastSearched: data.lastSearched,
      }));

    // 5. Device Share
    let mobileCount = 0;
    let desktopCount = 0;
    events.forEach(e => {
      if (e.eventType !== 'page_view') return;
      if (e.device === 'mobile') mobileCount++;
      else desktopCount++;
    });
    const totalDevices = mobileCount + desktopCount || 1;
    const deviceShare = {
      mobile: Math.round((mobileCount / totalDevices) * 100),
      desktop: Math.round((desktopCount / totalDevices) * 100),
    };

    return {
      liveActiveVisitors,
      totalPeriodVisits,
      trafficHistory,
      topPages,
      topSearches,
      deviceShare,
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
