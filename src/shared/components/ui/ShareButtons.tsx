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
    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80">
      <button
        onClick={handleWhatsApp}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
      >
        <MessageCircle className="h-4 w-4" />
        Compartir en WhatsApp
      </button>

      <button
        onClick={handleCopy}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700">¡Enlace copiado!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 text-slate-500" />
            <span>Copiar Enlace</span>
          </>
        )}
      </button>
    </div>
  );
}
