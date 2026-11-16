/**
 * Reglas para mostrar el aviso de «sistemas a medida».
 *
 * Principios:
 * - Siempre en el mismo sitio (abajo a la izquierda) y pequeño, para no estorbar.
 * - Se queda visible en todas las páginas hasta que el visitante lo cierre con la X.
 * - Espera unos segundos al llegar, para no aparecer de golpe sobre la página que se está cargando.
 * - Nunca junto al aviso de cookies: primero se resuelve el consentimiento.
 * - Nunca en páginas de trabajo (admin, cotizador, PRO, contacto).
 * - Una vez cerrado, no vuelve a aparecer durante 30 días.
 * - Abrir el detalle no lo quita: solo lo cierra la X.
 */

export const PROMPT_STORAGE_KEY = 'calculaperu-systems-prompt';
export const OPEN_EVENT = 'calculaperu:open-custom-systems';

const DAY = 24 * 60 * 60 * 1000;
export const SNOOZE_AFTER_DISMISS_MS = 30 * DAY;

export const MIN_SECONDS_ON_SITE = 5;

const HIDDEN_PREFIXES = ['/admin', '/contacto', '/cotizador', '/pro', '/api'];

export interface PromptMemory {
  /** Hasta cuándo no se muestra (marca de tiempo en ms). */
  snoozedUntil?: number;
}

export interface PromptContext {
  now: number;
  pathname: string;
  secondsOnSite: number;
  consentChosen: boolean;
  reducedDataRequested?: boolean;
  memory: PromptMemory;
}

export function isHiddenPath(pathname: string): boolean {
  return HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function shouldShowPrompt(context: PromptContext): boolean {
  if (isHiddenPath(context.pathname)) return false;
  if (!context.consentChosen) return false;
  if (context.reducedDataRequested) return false;
  if (context.memory.snoozedUntil && context.now < context.memory.snoozedUntil) return false;
  if (context.secondsOnSite < MIN_SECONDS_ON_SITE) return false;
  return true;
}

export function readMemory(raw: string | null): PromptMemory {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as PromptMemory;
    return { snoozedUntil: Number.isFinite(parsed.snoozedUntil) ? parsed.snoozedUntil : undefined };
  } catch {
    return {};
  }
}

/** El visitante lo cerró con la X: no se vuelve a mostrar durante 30 días. */
export function afterDismiss(now: number): PromptMemory {
  return { snoozedUntil: now + SNOOZE_AFTER_DISMISS_MS };
}
