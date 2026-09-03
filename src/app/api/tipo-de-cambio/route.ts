import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const REVALIDATE_SECONDS = 1800;
const REQUEST_TIMEOUT_MS = 7000;
const MAX_FETCH_ATTEMPTS = 2;

interface BcrpPeriod {
  name: string;
  values: Array<string | number>;
}

interface BcrpResponse {
  periods?: BcrpPeriod[];
}

interface MarketResponse {
  result?: string;
  time_last_update_utc?: string;
  rates?: { PEN?: number };
}

interface RateQuote {
  buyRate: number;
  sellRate: number;
  effectiveDate: string;
  sourceName: string;
}

function parseRate(value: string | number | undefined) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

async function fetchJsonWithRetry<T>(url: string, providerName: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        next: { revalidate: REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`${providerName} respondió con estado ${response.status}`);
      }

      const responseText = await response.text();

      try {
        return JSON.parse(responseText) as T;
      } catch (parseError) {
        // BCRPData puede anexar avisos HTML de su servidor después de un JSON válido.
        // Conservamos únicamente el bloque JSON y nunca intentamos interpretar el HTML.
        const htmlSuffixIndex = responseText.search(/<br\s*\/?\s*>|<font\b|<!doctype\b|<html\b/i);
        if (htmlSuffixIndex > 0) {
          return JSON.parse(responseText.slice(0, htmlSuffixIndex).trim()) as T;
        }
        throw parseError;
      }
    } catch (error) {
      lastError = error;
      if (attempt < MAX_FETCH_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`${providerName} no está disponible`);
}

async function fetchBcrpQuote(): Promise<RateQuote> {
  const data = await fetchJsonWithRetry<BcrpResponse>(
    'https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04639PD-PD04640PD/json/',
    'BCRP',
  );
  const latest = [...(data.periods ?? [])].reverse().find((period) => {
    return parseRate(period.values[0]) !== null && parseRate(period.values[1]) !== null;
  });
  const buyRate = parseRate(latest?.values[0]);
  const sellRate = parseRate(latest?.values[1]);

  if (!latest || buyRate === null || sellRate === null) {
    throw new Error('BCRP no devolvió una cotización completa');
  }

  return {
    buyRate,
    sellRate,
    effectiveDate: latest.name,
    sourceName: 'SBS vía BCRPData',
  };
}

async function fetchMarketQuote(): Promise<RateQuote> {
  const data = await fetchJsonWithRetry<MarketResponse>(
    'https://open.er-api.com/v6/latest/USD',
    'Proveedor de mercado',
  );
  const midRate = parseRate(data.rates?.PEN);

  if (data.result !== 'success' || midRate === null) {
    throw new Error('El proveedor de mercado no devolvió USD/PEN');
  }

  // Es una tasa media, no una cotización de ventanilla: no fabricamos un spread.
  return {
    buyRate: midRate,
    sellRate: midRate,
    effectiveDate: data.time_last_update_utc ?? new Date().toISOString(),
    sourceName: 'Mercado USD/PEN',
  };
}

export async function GET() {
  const [marketResult, bcrpResult] = await Promise.allSettled([
    fetchMarketQuote(),
    fetchBcrpQuote(),
  ]);

  const market = marketResult.status === 'fulfilled' ? marketResult.value : null;
  const sbs = bcrpResult.status === 'fulfilled' ? bcrpResult.value : null;

  if (marketResult.status === 'rejected') {
    console.warn('La cotización de mercado USD/PEN no estuvo disponible', String(marketResult.reason));
  }
  if (bcrpResult.status === 'rejected') {
    console.warn('La cotización SBS/BCRP no estuvo disponible', String(bcrpResult.reason));
  }

  if (!market && !sbs) {
    console.error('No se pudo obtener ninguna cotización USD/PEN', {
      market: marketResult.status === 'rejected' ? String(marketResult.reason) : null,
      bcrp: bcrpResult.status === 'rejected' ? String(bcrpResult.reason) : null,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'No fue posible actualizar la cotización. Puedes ingresar una tasa manual.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(
    {
      success: true,
      fetchedAt: new Date().toISOString(),
      defaultSource: market ? 'market' : 'sbs',
      rates: {
        ...(market ? { market } : {}),
        ...(sbs ? { sbs } : {}),
      },
    },
    {
      headers: {
        'Cache-Control': `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
      },
    },
  );
}
