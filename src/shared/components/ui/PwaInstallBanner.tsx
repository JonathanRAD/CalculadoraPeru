'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('calculaperu_pwa_dismissed') === 'true';
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('calculaperu_pwa_dismissed', 'true');
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in fade-in slide-in-bg-bottom-5 duration-300">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-300 dark:border-brand-800 bg-brand-950/95 p-3.5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-brand-600/30 text-brand-400 border border-brand-500/40 shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[13px] font-bold block leading-tight">Instala CalculaPerú</span>
            <span className="text-[13px] text-brand-200/80 block">Acceso rápido desde tu celular</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded bg-brand-500 hover:bg-brand-400 px-3 py-1.5 text-[13px] font-bold text-slate-950 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Instalar</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar aviso"
            className="rounded-lg p-1.5 text-brand-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
