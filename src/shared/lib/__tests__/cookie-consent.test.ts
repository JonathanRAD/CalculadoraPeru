// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONSENT_STORAGE_KEY, applyConsent, consentSignals } from '../cookie-consent';

type TestWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
};

afterEach(() => {
  const w = window as TestWindow;
  delete w.gtag;
  delete w.adsbygoogle;
  localStorage.clear();
});

describe('consentimiento de cookies', () => {
  it('rechazar mantiene las cuatro señales de Consent Mode v2 denegadas', () => {
    expect(consentSignals(false)).toEqual({
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });

  it('aceptar concede las cuatro señales', () => {
    expect(Object.values(consentSignals(true))).toEqual(['granted', 'granted', 'granted', 'granted']);
  });

  it('al aceptar actualiza Consent Mode y activa anuncios personalizados', () => {
    const w = window as TestWindow;
    w.gtag = vi.fn();
    applyConsent(true);
    expect(w.gtag).toHaveBeenCalledWith('consent', 'update', consentSignals(true));
    expect(w.adsbygoogle?.requestNonPersonalizedAds).toBe(0);
  });

  it('al rechazar fuerza anuncios no personalizados y no concede señales', () => {
    const w = window as TestWindow;
    w.gtag = vi.fn();
    applyConsent(false);
    expect(w.gtag).toHaveBeenCalledWith('consent', 'update', consentSignals(false));
    expect(w.adsbygoogle?.requestNonPersonalizedAds).toBe(1);
  });

  it('no falla si Google Analytics no está cargado', () => {
    expect(() => applyConsent(true)).not.toThrow();
  });

  it('usa una clave de almacenamiento estable', () => {
    expect(CONSENT_STORAGE_KEY).toBe('calculaperu-cookie-consent');
  });
});
