'use client';

import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  FileSpreadsheet,
  Sparkles,
  Share2,
  Loader2,
  Lock,
} from 'lucide-react';
import { usePro } from '@/features/premium/context/ProContext';
import { exportTableToCsv } from '@/shared/utils/exportToExcel';

interface CalculationActionToolbarProps {
  calculatorType: string;
  title: string;
  summaryText: string;
  totalAmount?: number;
  data: Record<string, unknown>;
  csvFilename?: string;
  csvColumns?: { key: string; header: string }[];
  csvRows?: Record<string, unknown>[];
  whatsappText?: string;
  className?: string;
}

export function CalculationActionToolbar({
  calculatorType,
  title,
  summaryText,
  totalAmount,
  data,
  csvFilename,
  csvColumns,
  csvRows,
  whatsappText,
  className = '',
}: CalculationActionToolbarProps) {
  const { user, isPro, openAuthModal, openActivationModal } = usePro();

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [copiedWa, setCopiedWa] = useState(false);

  const handleSaveToCloud = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    if (!isPro) {
      openActivationModal();
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculatorType,
          title,
          summaryText,
          totalAmount,
          data,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsSaved(true);
        setSaveMessage('¡Cálculo guardado en tu cuenta!');
        setTimeout(() => setIsSaved(false), 4000);
      } else {
        setSaveMessage(json.error || 'No se pudo guardar');
      }
    } catch {
      setSaveMessage('Error al conectar con el servidor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportExcel = () => {
    if (!isPro) {
      openActivationModal();
      return;
    }

    const filename = csvFilename || `Calculo_${calculatorType}_${new Date().toISOString().slice(0, 10)}`;
    const columns = csvColumns || [
      { key: 'parametro', header: 'Concepto / Parámetro' },
      { key: 'valor', header: 'Detalle o Importe' },
    ];
    const rows =
      csvRows ||
      Object.entries(data).map(([key, val]) => ({
        parametro: key,
        valor: typeof val === 'object' ? JSON.stringify(val) : String(val),
      }));

    exportTableToCsv(filename, columns, rows);
  };

  const handleWhatsAppShare = () => {
    if (!whatsappText) return;
    const encoded = encodeURIComponent(whatsappText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 3000);
  };

  return (
    <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Acciones Profesionales (PRO)</span>
        </span>
        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          S/ 16 / mes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Save to Cloud Button */}
        <button
          type="button"
          onClick={handleSaveToCloud}
          disabled={isSaving}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            isSaved
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : isSaved ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 text-white" />
              <span>¡Guardado en Nube!</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 text-blue-600" />
              <span>Guardar en Mis Cálculos</span>
              {!isPro && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
            </>
          )}
        </button>

        {/* Export Excel Button */}
        <button
          type="button"
          onClick={handleExportExcel}
          className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Exportar a Excel (.CSV)</span>
          {!isPro && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
        </button>
      </div>

      {whatsappText && (
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="w-full py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{copiedWa ? '¡Abriendo WhatsApp!' : 'Enviar Resumen a WhatsApp'}</span>
        </button>
      )}

      {saveMessage && !isSaved && (
        <p className="text-[11px] text-center font-medium text-slate-500 dark:text-slate-400">
          {saveMessage}
        </p>
      )}
    </div>
  );
}
