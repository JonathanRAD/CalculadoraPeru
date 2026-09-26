'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  X,
  Search,
  FileText,
  Calendar,
  Download,
  Copy,
  Trash2,
  Archive,
  MessageCircle,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { QuoteRecord, QuoteStatus, QuoteItemRecord } from '../types';
import { generateQuotePdf } from '@/shared/utils/quotePdfGenerator';
import { downloadQuoteCsv } from '@/shared/utils/quoteCsvGenerator';
import { CompanyProfile } from '@/features/auth/types';
import { quoteDetailsCache } from '../services/quoteDetailsCache';

interface QuoteHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadQuote: (quoteId: string) => void;
  companyProfile: CompanyProfile & { name?: string; phone?: string; email?: string };
  onOpenWhatsApp: (quote: QuoteRecord, items: QuoteItemRecord[]) => void;
}

const STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  draft: { label: 'Borrador', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' },
  sent: { label: 'Enviada', bg: 'bg-blue-50 dark:bg-blue-950/70', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/60' },
  accepted: { label: 'Aceptada', bg: 'bg-emerald-50 dark:bg-emerald-950/70', text: 'text-[#00875A] dark:text-[#00C853]', border: 'border-emerald-200 dark:border-emerald-800/60' },
  rejected: { label: 'Rechazada', bg: 'bg-rose-50 dark:bg-rose-950/70', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/60' },
  expired: { label: 'Vencida', bg: 'bg-amber-50 dark:bg-amber-950/70', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/60' },
  canceled: { label: 'Anulada', bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-600 dark:text-zinc-400', border: 'border-zinc-300 dark:border-zinc-700' },
};

export const QuoteHistoryModal: React.FC<QuoteHistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadQuote,
  companyProfile,
  onOpenWhatsApp,
}) => {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyQuoteId, setBusyQuoteId] = useState<string | null>(null);

  // Debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      params.set('page', page.toString());
      params.set('limit', '15');

      const res = await fetch(`/api/quotes?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setQuotes(data.quotes || []);
        setIsReadOnly(Boolean(data.isReadOnly));
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      } else {
        setError(data.message || 'Error cargando historial de cotizaciones.');
      }
    } catch {
      setError('Error de conexión al consultar cotizaciones.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    void Promise.resolve().then(() => {
      if (!isCancelled) {
        fetchQuotes();
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [isOpen, fetchQuotes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getQuoteDetails = async (quoteId: string): Promise<{ quote: QuoteRecord; items: QuoteItemRecord[] } | null> => {
    return quoteDetailsCache.get(quoteId);
  };

  const handleDuplicate = async (quote: QuoteRecord) => {
    setBusyQuoteId(quote.id);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.quote) {
        quoteDetailsCache.invalidate(data.quote.id);
        setActionMessage(`Cotización duplicada con éxito como ${data.quote.quoteNumber}.`);
        await fetchQuotes();
        onLoadQuote(data.quote.id);
        onClose();
      } else {
        setError(data.message || 'No se pudo duplicar la cotización.');
      }
    } catch {
      setError('Error de conexión al duplicar la proforma.');
    } finally {
      setBusyQuoteId(null);
    }
  };

  const handleAnular = async (quote: QuoteRecord) => {
    setBusyQuoteId(quote.id);
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'canceled' }),
      });
      const data = await res.json();
      if (data.success) {
        quoteDetailsCache.invalidate(quote.id);
        setActionMessage(`Cotización ${quote.quoteNumber} anulada correctamente.`);
        await fetchQuotes();
      } else {
        setError(data.message || 'No se pudo anular la cotización.');
      }
    } catch {
      setError('Error de conexión al anular la cotización.');
    } finally {
      setBusyQuoteId(null);
    }
  };

  const handleDelete = async (quote: QuoteRecord) => {
    setBusyQuoteId(quote.id);
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        quoteDetailsCache.invalidate(quote.id);
        setActionMessage(`Cotización ${quote.quoteNumber} eliminada definitivamente.`);
        await fetchQuotes();
      } else {
        setError(data.message || 'No se pudo eliminar la cotización.');
      }
    } catch {
      setError('Error de conexión al eliminar.');
    } finally {
      setBusyQuoteId(null);
    }
  };

  const handleDownloadPdf = async (quote: QuoteRecord) => {
    setBusyQuoteId(quote.id);
    try {
      const data = await getQuoteDetails(quote.id);
      if (data && data.quote && data.items) {
        generateQuotePdf({
          quoteNumber: data.quote.quoteNumber,
          issueDate: data.quote.issueDate,
          validUntil: data.quote.validUntil,
          company: companyProfile,
          client: {
            name: data.quote.clientName,
            docType: data.quote.clientDocType,
            docNumber: data.quote.clientDocNumber,
            phone: data.quote.clientPhone,
            email: data.quote.clientEmail,
            address: data.quote.clientAddress,
          },
          items: data.items,
          totals: {
            subtotalGross: data.quote.subtotalGross,
            itemsDiscountTotal: data.quote.itemsDiscountTotal,
            globalDiscountAmount: data.quote.globalDiscountAmount,
            discountTotal: data.quote.discountTotal,
            subtotalNet: data.quote.subtotalNet,
            taxableBase: data.quote.taxableBase,
            exemptBase: data.quote.exemptBase,
            igvRate: data.quote.igvRate,
            igvAmount: data.quote.igvAmount,
            totalAmount: data.quote.totalAmount,
            itemsCount: data.items.length,
            totalQuantity: data.items.reduce((acc: number, it: QuoteItemRecord) => acc + (it.quantity || 0), 0),
          },
          paymentTerms: data.quote.paymentTerms,
          deliveryTime: data.quote.deliveryTime,
          publicNotes: data.quote.publicNotes,
        });
      } else {
        setError('No se pudo obtener el detalle de la cotización para descargar el PDF.');
      }
    } catch {
      setError('Error descargando el PDF de la cotización.');
    } finally {
      setBusyQuoteId(null);
    }
  };

  const handleDownloadCsv = async (quote: QuoteRecord) => {
    setBusyQuoteId(quote.id);
    try {
      const data = await getQuoteDetails(quote.id);
      if (data && data.quote && data.items) {
        downloadQuoteCsv({
          quoteNumber: data.quote.quoteNumber,
          issueDate: data.quote.issueDate,
          validUntil: data.quote.validUntil,
          company: companyProfile,
          client: {
            name: data.quote.clientName,
            docType: data.quote.clientDocType,
            docNumber: data.quote.clientDocNumber,
            phone: data.quote.clientPhone,
            email: data.quote.clientEmail,
            address: data.quote.clientAddress,
          },
          items: data.items,
          totals: {
            subtotalGross: data.quote.subtotalGross,
            itemsDiscountTotal: data.quote.itemsDiscountTotal,
            globalDiscountAmount: data.quote.globalDiscountAmount,
            discountTotal: data.quote.discountTotal,
            subtotalNet: data.quote.subtotalNet,
            taxableBase: data.quote.taxableBase,
            exemptBase: data.quote.exemptBase,
            igvRate: data.quote.igvRate,
            igvAmount: data.quote.igvAmount,
            totalAmount: data.quote.totalAmount,
            itemsCount: data.items.length,
            totalQuantity: data.items.reduce((acc: number, it: QuoteItemRecord) => acc + (it.quantity || 0), 0),
          },
          paymentTerms: data.quote.paymentTerms,
          deliveryTime: data.quote.deliveryTime,
          publicNotes: data.quote.publicNotes,
        });
      } else {
        setError('No se pudo obtener el detalle de la cotización para exportar el CSV.');
      }
    } catch {
      setError('Error descargando el archivo CSV.');
    } finally {
      setBusyQuoteId(null);
    }
  };

  const handleShareWhatsApp = async (quote: QuoteRecord) => {
    setBusyQuoteId(quote.id);
    try {
      const data = await getQuoteDetails(quote.id);
      if (data && data.quote && data.items) {
        onOpenWhatsApp(data.quote, data.items);
      } else {
        setError('No se pudo obtener el detalle de la cotización.');
      }
    } catch {
      setError('Error al preparar la cotización para WhatsApp.');
    } finally {
      setBusyQuoteId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
        className="relative w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl p-6 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h2 id="history-modal-title" className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#00875A] dark:text-[#00C853]" />
              Historial de Cotizaciones Comerciales
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Total de registros: <span className="font-semibold text-slate-700 dark:text-slate-200">{totalCount}</span> • Consulta, duplica o exporta proformas registradas.
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

        {/* Notificaciones */}
        {isReadOnly && (
          <div className="mb-3 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 p-3.5 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  Acceso de Solo Lectura (PRO vencido)
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5">
                  Puedes consultar y exportar en PDF/CSV todas tus cotizaciones emitidas. Para crear nuevas proformas, duplicar o editar en la nube, reactiva tu plan PRO.
                </div>
              </div>
            </div>
            <Link
              href="/pro"
              className="inline-flex items-center justify-center rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 text-xs transition-colors shrink-0 shadow-sm"
            >
              Reactivar PRO
            </Link>
          </div>
        )}
        {actionMessage && (
          <div className="mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-[#00875A] dark:text-[#00C853] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}
        {error && (
          <div className="mb-3 rounded-xl bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-4">
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por N° cotización o cliente..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              aria-label="Filtrar por estado"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as QuoteStatus | 'all');
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borradores</option>
              <option value="sent">Enviadas</option>
              <option value="accepted">Aceptadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="expired">Vencidas</option>
              <option value="canceled">Anuladas</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <input
              type="date"
              aria-label="Desde fecha"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="date"
              aria-label="Hasta fecha"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Lista de Cotizaciones */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-[#00875A]" />
              <span className="text-xs">Cargando cotizaciones...</span>
            </div>
          ) : quotes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-12 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">No se encontraron cotizaciones</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {search || statusFilter !== 'all' || dateFrom || dateTo
                  ? 'No hay registros que coincidan con los filtros aplicados.'
                  : 'Crea tu primera cotización comercial desde el editor y haz clic en "Guardar en la nube".'}
              </p>
            </div>
          ) : (
            quotes.map((q) => {
              const statusCfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.draft;
              const isBusy = busyQuoteId === q.id;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 transition-all hover:border-[#00875A]/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  {/* Info Principal */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {q.quoteNumber}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {statusCfg.label}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {q.issueDate}
                      </span>
                    </div>

                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {q.clientName}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      {q.clientDocNumber && (
                        <span>
                          {q.clientDocType.toUpperCase()}: {q.clientDocNumber}
                        </span>
                      )}
                      {q.clientPhone && <span>Tel: {q.clientPhone}</span>}
                      {q.validUntil && <span>Vence: {q.validUntil}</span>}
                    </div>
                  </div>

                  {/* Totales */}
                  <div className="md:text-right shrink-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-4">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Proforma:</span>
                    <span className="text-lg font-black font-mono text-[#00875A] dark:text-[#00C853]">
                      S/ {q.totalAmount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Subtotal S/ {q.subtotalNet.toFixed(2)} • IGV S/ {q.igvAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 md:pt-0">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        quoteDetailsCache.invalidate(q.id);
                        onLoadQuote(q.id);
                        onClose();
                      }}
                      className="rounded-xl bg-[#00875A] hover:bg-[#00704A] text-white font-bold px-3 py-2 text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                      title="Abrir en el editor"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Abrir</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy || isReadOnly}
                      onClick={() => handleDuplicate(q)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-2.5 py-2 text-xs transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={isReadOnly ? 'Duplicar requiere suscripción PRO activa' : 'Duplicar proforma'}
                    >
                      <Copy className="h-3.5 w-3.5 text-[#00875A] dark:text-[#00C853]" />
                      <span className="hidden sm:inline">Duplicar</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDownloadPdf(q)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2 text-xs transition-colors cursor-pointer disabled:opacity-50"
                      title="Descargar PDF"
                      aria-label="Descargar PDF"
                    >
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#00875A]" />
                      ) : (
                        <Download className="h-4 w-4 text-[#00875A] dark:text-[#00C853]" />
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDownloadCsv(q)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2 text-xs transition-colors cursor-pointer"
                      title="Exportar CSV compatible con Excel"
                      aria-label="Exportar Excel CSV"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleShareWhatsApp(q)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2 text-xs transition-colors cursor-pointer"
                      title="Preparar mensaje WhatsApp"
                      aria-label="Compartir WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </button>

                    {q.status !== 'canceled' && (
                      <button
                        type="button"
                        disabled={isBusy || isReadOnly}
                        onClick={() => handleAnular(q)}
                        className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 p-2 text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title={isReadOnly ? 'Anular requiere suscripción PRO activa' : 'Anular cotización'}
                        aria-label="Anular cotización"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isBusy || isReadOnly}
                      onClick={() => handleDelete(q)}
                      className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 p-2 text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title={isReadOnly ? 'Eliminar requiere suscripción PRO activa' : 'Eliminar definitivamente'}
                      aria-label="Eliminar definitivamente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Página {page} de {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                Siguiente
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
