import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';

/**
 * Receptor first-party de reportes CSP.
 *
 * CSP_REPORT_LOGGING=disabled (predeterminado): recibe y descarta reportes válidos.
 * CSP_REPORT_LOGGING=enabled: emite únicamente un resumen estructurado y sanitizado
 * en los logs del servidor. No existe persistencia durable en este endpoint.
 *
 * El limitador es deliberadamente best-effort y local a cada instancia serverless;
 * no debe presentarse como un rate limit distribuido.
 */

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;
const MAX_RATE_LIMIT_ENTRIES = 1_000;
const MAX_IP_KEY_LENGTH = 64;

const ALLOWED_CONTENT_TYPES = new Set([
  'application/csp-report',
  'application/reports+json',
  'application/json',
]);

const SAFE_BLOCKED_URI_TOKENS = new Set([
  'about',
  'blob',
  'data',
  'eval',
  'inline',
  'self',
  'wasm-eval',
  'wasm-unsafe-eval',
]);

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiter {
  private readonly entries = new Map<string, RateLimitRecord>();

  constructor(
    private readonly maxRequests = MAX_REQUESTS_PER_WINDOW,
    private readonly windowMs = RATE_LIMIT_WINDOW_MS,
    private readonly maxEntries = MAX_RATE_LIMIT_ENTRIES
  ) {}

  clear(): void {
    this.entries.clear();
  }

  isRateLimited(key: string, now = Date.now()): boolean {
    this.pruneExpired(now);

    const existing = this.entries.get(key);
    if (existing) {
      if (existing.count >= this.maxRequests) {
        return true;
      }
      existing.count += 1;
      return false;
    }

    if (this.entries.size >= this.maxEntries) {
      this.evictOldest();
    }

    this.entries.set(key, {
      count: 1,
      resetAt: now + this.windowMs,
    });
    return false;
  }

  get size(): number {
    return this.entries.size;
  }

  private pruneExpired(now: number): void {
    for (const [key, record] of this.entries) {
      if (record.resetAt <= now) {
        this.entries.delete(key);
      }
    }
  }

  private evictOldest(): void {
    let oldestKey: string | undefined;
    let oldestResetAt = Number.POSITIVE_INFINITY;

    for (const [key, record] of this.entries) {
      if (record.resetAt < oldestResetAt) {
        oldestKey = key;
        oldestResetAt = record.resetAt;
      }
    }

    if (oldestKey !== undefined) {
      this.entries.delete(oldestKey);
    }
  }
}

export class RequestBodyTooLargeError extends Error {
  constructor() {
    super('Request body exceeds the allowed byte limit.');
    this.name = 'RequestBodyTooLargeError';
  }
}

const rateLimiter = new InMemoryRateLimiter();

export function resetRateLimiter(): void {
  rateLimiter.clear();
}

function emptyResponse(status: number, extraHeaders?: HeadersInit): Response {
  const headers = new Headers(extraHeaders);
  headers.set('Cache-Control', 'no-store');
  return new Response(null, { status, headers });
}

function normalizeClientKey(req: Request | NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const candidate = forwarded || req.headers.get('x-real-ip')?.trim() || 'unknown';
  const limited = candidate.slice(0, MAX_IP_KEY_LENGTH);

  // Solo IPv4/IPv6 textual. Cualquier valor arbitrario comparte una clave neutra.
  return /^[0-9a-f:.]+$/i.test(limited) ? limited.toLowerCase() : 'unknown';
}

function validateDeclaredContentLength(req: Request | NextRequest): 'ok' | 'invalid' | 'too-large' {
  const header = req.headers.get('content-length');
  if (header === null) return 'ok';

  const normalized = header.trim();
  if (!/^\d+$/.test(normalized)) return 'invalid';

  const length = Number(normalized);
  if (!Number.isSafeInteger(length)) return 'invalid';
  return length > MAX_BODY_BYTES ? 'too-large' : 'ok';
}

/**
 * Lee el stream sin almacenar más de maxBytes y cuenta bytes UTF-8 reales.
 */
export async function readRequestBodyWithLimit(
  req: Request | NextRequest,
  maxBytes = MAX_BODY_BYTES
): Promise<string> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new TypeError('maxBytes must be a non-negative safe integer.');
  }
  if (!req.body) return '';

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // El límite ya fue detectado; un fallo al cancelar no cambia la respuesta.
        }
        throw new RequestBodyTooLargeError();
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder('utf-8', { fatal: true }).decode(body);
}

export function sanitizeCspString(raw: string, maxLength = 160): string {
  if (typeof raw !== 'string') return '';

  return raw
    .replace(/[\r\n\t\x00-\x1f\x7f]/g, ' ')
    .replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '[REDACTED_JWT]')
    .replace(/bearer\s+[a-zA-Z0-9_.-]+/gi, 'Bearer [REDACTED]')
    .replace(/(session|token|auth|cookie|key|secret|password|access_token)=[^\s;&]+/gi, '$1=[REDACTED]')
    .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi, '[REDACTED_EMAIL]')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function sanitizeDirective(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const value = sanitizeCspString(raw, 80).toLowerCase();
  return /^[a-z0-9' _-]+$/.test(value) ? value : undefined;
}

function sanitizeDisposition(raw: unknown): string | undefined {
  return raw === 'report' || raw === 'enforce' ? raw : undefined;
}

function sanitizeStatusCode(raw: unknown): string | undefined {
  const value = typeof raw === 'number' ? raw : Number(raw);
  return Number.isInteger(value) && value >= 100 && value <= 599 ? String(value) : undefined;
}

function sanitizeHttpLocation(raw: unknown, includePathname: boolean): string | undefined {
  if (typeof raw !== 'string' || raw.length === 0) return undefined;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === 'blob:' || parsed.protocol === 'data:' || parsed.protocol === 'about:') {
      const proto = parsed.protocol.slice(0, -1);
      return SAFE_BLOCKED_URI_TOKENS.has(proto) ? proto : undefined;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return undefined;

    const origin = parsed.origin;
    if (!includePathname) return origin.slice(0, 200);

    const pathname = sanitizeCspString(parsed.pathname || '/', 200);
    return `${origin}${pathname.startsWith('/') ? pathname : `/${pathname}`}`.slice(0, 300);
  } catch {
    const token = raw.trim().toLowerCase().replace(/^['"]|['"]$/g, '');
    return SAFE_BLOCKED_URI_TOKENS.has(token) ? token : undefined;
  }
}

function extractReportSource(payload: unknown): Record<string, unknown> | undefined {
  if (!payload || typeof payload !== 'object') return undefined;

  if (Array.isArray(payload)) {
    const first = payload[0];
    if (!first || typeof first !== 'object') return undefined;
    const body = (first as Record<string, unknown>).body;
    return body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : undefined;
  }

  const object = payload as Record<string, unknown>;
  const legacy = object['csp-report'];
  if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
    return legacy as Record<string, unknown>;
  }

  const body = object.body;
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }

  return object;
}

/**
 * Extrae solo metadatos operativos mínimos. No conserva referrer, sample,
 * original-policy, query strings, fragmentos, credenciales ni el cuerpo original.
 */
export function sanitizeCspReport(payload: unknown): Record<string, string> {
  const source = extractReportSource(payload);
  if (!source) return {};

  const result: Record<string, string> = {};
  const documentLocation = sanitizeHttpLocation(
    source['document-uri'] ?? source.documentURL,
    true
  );
  const blockedLocation = sanitizeHttpLocation(
    source['blocked-uri'] ?? source.blockedURL,
    false
  );
  const violatedDirective = sanitizeDirective(source['violated-directive']);
  const effectiveDirective = sanitizeDirective(
    source['effective-directive'] ?? source.effectiveDirective
  );
  const disposition = sanitizeDisposition(source.disposition);
  const statusCode = sanitizeStatusCode(source['status-code'] ?? source.statusCode);

  if (documentLocation) result.documentLocation = documentLocation;
  if (blockedLocation) result.blockedLocation = blockedLocation;
  if (violatedDirective) result.violatedDirective = violatedDirective;
  if (effectiveDirective) result.effectiveDirective = effectiveDirective;
  if (disposition) result.disposition = disposition;
  if (statusCode) result.statusCode = statusCode;

  return result;
}

function isLoggingEnabled(): boolean {
  return process.env.CSP_REPORT_LOGGING?.trim().toLowerCase() === 'enabled';
}

export async function handleCspReport(
  req: Request | NextRequest,
  customLimiter = rateLimiter,
  now?: number
): Promise<Response> {
  const contentType = (req.headers.get('content-type') || '').toLowerCase().split(';')[0].trim();
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return emptyResponse(415);
  }

  if (customLimiter.isRateLimited(normalizeClientKey(req), now)) {
    return emptyResponse(429, { 'Retry-After': '60' });
  }

  const declaredLength = validateDeclaredContentLength(req);
  if (declaredLength === 'invalid') return emptyResponse(400);
  if (declaredLength === 'too-large') return emptyResponse(413);

  let rawBody: string;
  try {
    rawBody = await readRequestBodyWithLimit(req);
  } catch (error) {
    return emptyResponse(error instanceof RequestBodyTooLargeError ? 413 : 400);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return emptyResponse(400);
  }

  if (!parsedJson || typeof parsedJson !== 'object') {
    return emptyResponse(400);
  }

  const sanitizedReport = sanitizeCspReport(parsedJson);
  if (isLoggingEnabled() && Object.keys(sanitizedReport).length > 0) {
    console.warn('[CSP Violation]', {
      incidentId: randomUUID(),
      timestamp: new Date().toISOString(),
      ...sanitizedReport,
    });
  }

  return emptyResponse(204);
}

export async function POST(req: Request | NextRequest): Promise<Response> {
  return handleCspReport(req);
}

function methodNotAllowed(): Response {
  return emptyResponse(405, { Allow: 'POST' });
}

export async function GET(): Promise<Response> {
  return methodNotAllowed();
}

export async function PUT(): Promise<Response> {
  return methodNotAllowed();
}

export async function DELETE(): Promise<Response> {
  return methodNotAllowed();
}

export async function PATCH(): Promise<Response> {
  return methodNotAllowed();
}
