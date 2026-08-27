'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  shareText: string;
}

export function ShareButtons({ title, shareText }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `📊 *${title} - CalculaPerú*\n\n${shareText}\n\n👉 Realiza o ajusta tu cálculo aquí:\n${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
      <button
        onClick={handleWhatsApp}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 dark:bg-emerald-700 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-[0.98] cursor-pointer"
      >
        <MessageCircle className="h-4 w-4" />
        Compartir en WhatsApp
      </button>

      <button
        onClick={handleCopy}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98] cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-400">¡Copiado!</span>
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
