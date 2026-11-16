/**
 * Consentimiento de cookies.
 *
 * El script de inicio (layout) declara Consent Mode v2 con todas las señales denegadas
 * salvo que el visitante ya haya aceptado. Estas funciones actualizan el estado cuando
 * el visitante elige o cambia su preferencia.
 */

export const CONSENT_STORAGE_KEY = 'calculaperu-cookie-consent';

type ConsentValue = 'granted' | 'denied';

interface ConsentWindow extends Window {
  gtag?: (...args: unknown[]) => void;
  adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
}

export function consentSignals(accepted: boolean) {
  const value: ConsentValue = accepted ? 'granted' : 'denied';
  return {
    ad_storage: value,
    analytics_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  };
}

/** Actualiza Consent Mode v2 y la personalización de AdSense según la elección. */
export function applyConsent(accepted: boolean) {
  if (typeof window === 'undefined') return;
  const w = window as ConsentWindow;

  try {
    w.gtag?.('consent', 'update', consentSignals(accepted));
  } catch {}

  try {
    const queue = (w.adsbygoogle = w.adsbygoogle || []);
    queue.requestNonPersonalizedAds = accepted ? 0 : 1;
  } catch {}
}

/** Borra la elección guardada y recarga para volver a mostrar el aviso. */
export function resetConsent() {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {}
  window.location.reload();
}
