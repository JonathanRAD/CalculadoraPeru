'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { CONSENT_STORAGE_KEY, applyConsent } from '@/shared/lib/cookie-consent';

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getConsentSnapshot() {
  try {
    return !localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

export function CookieBanner() {
  const [dismissed, setDismissed] = useState(false);
  const isConsentMissing = useSyncExternalStore(subscribeStorage, getConsentSnapshot, getServerSnapshot);

  const choose = (accepted: boolean) => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, accepted ? 'accepted' : 'rejected');
    } catch {}
    applyConsent(accepted);
    setDismissed(true);
  };

  if (!isConsentMissing || dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies y privacidad"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white dark:bg-[#131A35] border border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-2xl text-slate-800 dark:text-slate-200 text-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Cookie className="h-4 w-4 text-[#00875A] dark:text-[#00C853] shrink-0" />
            <span>Aviso de Cookies y Privacidad</span>
          </div>
          <button
            onClick={() => choose(false)}
            aria-label="Cerrar sin aceptar cookies opcionales"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Usamos almacenamiento propio para recordar tu tema. Si aceptas, Google Analytics y Google AdSense pueden usar cookies para medir el uso del sitio y mostrar anuncios personalizados. Si rechazas, seguiremos midiendo visitas de forma limitada y los anuncios no serán personalizados.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Link
            href="/politica-de-privacidad"
            className="text-[11px] text-sky-700 dark:text-sky-400 hover:underline font-semibold"
          >
            Leer Política de Privacidad
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => choose(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Rechazar
            </button>
            <button
              onClick={() => choose(true)}
              className="px-4 py-2 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
