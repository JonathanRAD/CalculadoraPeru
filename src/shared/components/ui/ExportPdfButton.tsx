'use client';

import React, { useState } from 'react';
import { FileDown, Check, Loader2 } from 'lucide-react';
import { generateOfficialPdf, PdfReportOptions } from '@/shared/utils/pdfGenerator';

interface ExportPdfButtonProps {
  getReportOptions: () => PdfReportOptions;
  label?: string;
  className?: string;
}

export function ExportPdfButton({
  getReportOptions,
  label = 'Descargar Reporte en PDF',
  className = '',
}: ExportPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleExport = () => {
    try {
      setIsGenerating(true);
      const options = getReportOptions();
      generateOfficialPdf(options);
      setIsDone(true);
      setTimeout(() => setIsDone(false), 3000);
    } catch (error) {
      console.error('Error generando PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isGenerating}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 transition-all cursor-pointer shadow-2xs ${className}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          <span>Generando PDF...</span>
        </>
      ) : isDone ? (
        <>
          <Check className="h-4 w-4 text-emerald-600" />
          <span>¡PDF Descargado!</span>
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 text-emerald-600" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
