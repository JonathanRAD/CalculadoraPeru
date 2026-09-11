'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('calculaperu-cookie-consent');
      if (!consent) {
        setShowBanner(true);
      }
    } catch {
      // localStorage disabled or private mode
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('calculaperu-cookie-consent', 'accepted');
    } catch {}
    setShowBanner(false);
  };

  if (!showBanner) return null;

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
            onClick={handleAccept}
            aria-label="Cerrar aviso de cookies"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          CalculaPerú utiliza cookies propias y de terceros (como Google Analytics y Google AdSense) para personalizar contenido, anuncios y analizar nuestro tráfico conforme a las normativas de privacidad.
        </p>

        <div className="flex items-center justify-between gap-3 pt-1">
          <Link
            href="/politica-de-privacidad"
            className="text-[11px] text-sky-700 dark:text-sky-400 hover:underline font-semibold"
          >
            Leer Política de Privacidad
          </Link>

          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
          >
            Aceptar y continuar
          </button>
        </div>
      </div>
    </div>
  );
}
