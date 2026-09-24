'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Info,
} from 'lucide-react';
import { QuoteCalculatedItem, QuoteTotals } from '../types';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteNumber: string;
  clientName: string;
  clientPhone?: string;
  items: QuoteCalculatedItem[];
  totals: QuoteTotals;
  paymentTerms?: string;
  validUntil?: string;
  businessName?: string;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  quoteNumber,
  clientName,
  clientPhone,
  items,
  totals,
  paymentTerms,
  validUntil,
  businessName,
}) => {
  const [prevClientPhone, setPrevClientPhone] = useState(clientPhone);
  const [phone, setPhone] = useState(clientPhone || '');
  const [copied, setCopied] = useState(false);

  if (clientPhone !== prevClientPhone) {
    setPrevClientPhone(clientPhone);
    setPhone(clientPhone || '');
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Construcción de mensaje verídico y ordenado
  const lines: string[] = [];
  lines.push(`*COTIZACIÓN COMERCIAL - ${quoteNumber || 'BORRADOR'}*`);
  if (businessName) lines.push(`_Emisor: ${businessName}_`);
  lines.push(`_Cliente: ${clientName || 'Cliente'}_`);
  lines.push('');
  lines.push('*DETALLE DE CONCEPTOS:*');

  items.slice(0, 15).forEach((item) => {
    lines.push(`• ${item.quantity} ${item.unit} x ${item.description} : S/ ${item.netAmount.toFixed(2)}`);
  });

  if (items.length > 15) {
    lines.push(`• ... y ${items.length - 15} conceptos adicionales en la proforma completa.`);
  }

  lines.push('');
  lines.push(`Subtotal: S/ ${totals.subtotalNet.toFixed(2)}`);
  if (totals.igvAmount > 0) {
    lines.push(`IGV (${(totals.igvRate * 100).toFixed(0)}%): S/ ${totals.igvAmount.toFixed(2)}`);
  }
  lines.push(`*TOTAL A PAGAR: S/ ${totals.totalAmount.toFixed(2)}*`);

  if (validUntil) {
    lines.push('');
    lines.push(`📅 Validez de la oferta hasta: ${validUntil}`);
  }
  if (paymentTerms) {
    lines.push(`💳 Condiciones de pago: ${paymentTerms}`);
  }

  lines.push('');
  lines.push('_Documento comercial referencial. No constituye comprobante de pago._');

  const fullMessage = lines.join('\n');

  // Normalización inteligente de teléfono:
  // Si el usuario introduce 9 dígitos exactos (formato móvil Perú), se añade el prefijo 51.
  // Si ya tiene código de país (más de 9 dígitos o empieza con '+'), se conserva limpio sin duplicar +51.
  const rawClean = phone.replace(/[^\d]/g, '');
  let formattedPhone = '';
  if (rawClean.length === 9) {
    formattedPhone = `51${rawClean}`;
  } else if (rawClean.length > 9) {
    formattedPhone = rawClean;
  }

  const handleOpenWhatsApp = () => {
    const baseUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}`
      : `https://api.whatsapp.com/send`;
    const targetUrl = `${baseUrl}?text=${encodeURIComponent(fullMessage)}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wa-modal-title"
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h2 id="wa-modal-title" className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-950 dark:text-white">
              <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Abrir WhatsApp con mensaje preparado</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Se abrirá la aplicación oficial de WhatsApp con el texto listo para que lo revises antes de enviar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Phone */}
        <div className="mb-3 space-y-1">
          <label htmlFor="wa-phone-dest" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Número de WhatsApp del cliente <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <input
              id="wa-phone-dest"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 987654321 o +51987654321"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] dark:focus:border-[#00C853] outline-none font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Si lo dejas en blanco, WhatsApp te permitirá seleccionar cualquier contacto o chat directamente.
          </p>
        </div>

        {/* Message Preview */}
        <div className="flex-1 overflow-y-auto mb-3 space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Mensaje preparado para WhatsApp:
          </label>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed">
            {fullMessage}
          </div>
        </div>

        {/* Aviso transparente */}
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 p-3 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2 mb-4">
          <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p className="leading-relaxed">
            WhatsApp Web y App no permiten adjuntar archivos PDF de forma automática. Te sugerimos descargar el <strong>PDF de la cotización</strong> y adjuntarlo en la conversación.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-400" />
                <span>Copiar texto</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="rounded-xl bg-[#00875A] hover:bg-[#00704A] px-5 py-2.5 text-xs font-bold text-white transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Abrir WhatsApp con mensaje preparado</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};
