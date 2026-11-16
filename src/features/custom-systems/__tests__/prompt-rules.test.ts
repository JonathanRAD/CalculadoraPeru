import { describe, expect, it } from 'vitest';
import {
  MIN_SECONDS_ON_SITE,
  SNOOZE_AFTER_DISMISS_MS,
  afterDismiss,
  isHiddenPath,
  readMemory,
  shouldShowPrompt,
  type PromptContext,
} from '../prompt-rules';

const NOW = 1_800_000_000_000;

const ready: PromptContext = {
  now: NOW,
  pathname: '/sueldo-neto',
  secondsOnSite: 12,
  consentChosen: true,
  memory: {},
};

describe('aviso de sistemas a medida: cuándo se muestra', () => {
  it('se muestra en cualquier página de contenido, sin exigir scroll', () => {
    for (const pathname of ['/', '/sueldo-neto', '/guias', '/guias/horas-extras-como-se-pagan', '/sobre-nosotros']) {
      expect(shouldShowPrompt({ ...ready, pathname }), pathname).toBe(true);
    }
  });

  it('no aparece de golpe al cargar: espera unos segundos', () => {
    expect(shouldShowPrompt({ ...ready, secondsOnSite: MIN_SECONDS_ON_SITE - 1 })).toBe(false);
    expect(shouldShowPrompt({ ...ready, secondsOnSite: MIN_SECONDS_ON_SITE })).toBe(true);
  });

  it('se queda visible visita tras visita hasta que lo cierren', () => {
    // Mismo estado guardado (sin cierre) en una visita posterior: sigue apareciendo.
    expect(shouldShowPrompt({ ...ready, now: NOW + 5 * 24 * 60 * 60 * 1000, memory: {} })).toBe(true);
    expect(shouldShowPrompt({ ...ready, now: NOW + 200 * 24 * 60 * 60 * 1000, memory: {} })).toBe(true);
  });

  it('no aparece mientras el aviso de cookies sigue pendiente', () => {
    expect(shouldShowPrompt({ ...ready, consentChosen: false })).toBe(false);
  });

  it('no aparece en páginas de trabajo', () => {
    for (const pathname of ['/admin', '/admin/users', '/contacto', '/cotizador', '/pro', '/pro/beneficios']) {
      expect(isHiddenPath(pathname), pathname).toBe(true);
      expect(shouldShowPrompt({ ...ready, pathname }), pathname).toBe(false);
    }
    expect(isHiddenPath('/profesionales')).toBe(false);
  });

  it('respeta la petición de ahorro de datos', () => {
    expect(shouldShowPrompt({ ...ready, reducedDataRequested: true })).toBe(false);
  });
});

describe('aviso de sistemas a medida: cuando lo cierran', () => {
  it('cerrarlo con la X lo oculta durante 30 días y luego vuelve', () => {
    const memory = afterDismiss(NOW);
    expect(memory.snoozedUntil).toBe(NOW + SNOOZE_AFTER_DISMISS_MS);
    expect(shouldShowPrompt({ ...ready, memory })).toBe(false);
    expect(shouldShowPrompt({ ...ready, memory, now: NOW + SNOOZE_AFTER_DISMISS_MS - 1 })).toBe(false);
    expect(shouldShowPrompt({ ...ready, memory, now: NOW + SNOOZE_AFTER_DISMISS_MS + 1 })).toBe(true);
  });

  it('un valor guardado dañado no rompe nada', () => {
    expect(readMemory(null)).toEqual({});
    expect(readMemory('no es json')).toEqual({});
    expect(readMemory('{"snoozedUntil":"mañana"}')).toEqual({ snoozedUntil: undefined });
    expect(readMemory(JSON.stringify({ snoozedUntil: NOW }))).toEqual({ snoozedUntil: NOW });
  });
});
