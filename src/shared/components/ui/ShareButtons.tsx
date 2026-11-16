'use client';

import React, { useState } from 'react';
import { Check, Copy, MessageCircle } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  shareText: string;
}

export function ShareButtons({ title, shareText }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getCleanUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCleanUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `📊 *${title} - CalculaPerú*\n\n${shareText}\n\n👉 Realiza o ajusta tu cálculo aquí:\n${getCleanUrl()}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-[#2C3744]">
      <button
        onClick={handleWhatsApp}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-brand-600 dark:bg-brand-700 px-3.5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-brand-700 dark:hover:bg-brand-600 active:scale-[0.98] cursor-pointer"
      >
        <MessageCircle className="h-4 w-4" />
        Compartir en WhatsApp
      </button>

      <button
        onClick={handleCopy}
        className="inline-flex items-center justify-center gap-2 rounded border border-slate-200 dark:border-[#2C3744] bg-white dark:bg-[#18202A] px-3.5 py-2.5 text-[13px] font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98] cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-brand-700 dark:text-brand-400">¡Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span>Copiar Enlace</span>
          </>
        )}
      </button>
    </div>
  );
}
