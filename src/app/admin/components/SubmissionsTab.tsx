'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Inbox,
  Search,
  RefreshCw,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Eye,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { ContactSubmissionRecord } from '@/server/repositories/contact_submission.repository';

export function SubmissionsTab() {
  const [submissions, setSubmissions] = useState<ContactSubmissionRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [emailFilter, setEmailFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');

  // Modal / Action states
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmissionRecord | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingSubmission, setDeletingSubmission] = useState<ContactSubmissionRecord | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '15');
      if (search.trim()) params.set('q', search.trim());
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (reviewFilter !== 'all') params.set('reviewStatus', reviewFilter);
      if (emailFilter !== 'all') params.set('emailStatus', emailFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);

      const res = await fetch(`/api/admin/submissions?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setFeedback(null);

      if (data.success) {
        setSubmissions(data.submissions || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      } else {
        setFeedback({ type: 'error', message: data.message || 'Error al cargar solicitudes.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error de conexión al cargar solicitudes.' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, categoryFilter, reviewFilter, emailFilter, dateFrom]);

  useEffect(() => {
    let isCancelled = false;
    void Promise.resolve().then(() => {
      if (!isCancelled) {
        fetchSubmissions();
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [fetchSubmissions]);

  const handleUpdateStatus = async (
    id: string,
    newStatus: 'pending' | 'in_progress' | 'resolved' | 'discarded'
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewStatus: newStatus }),
      });
      const data = await res.json();

      if (data.success && data.submission) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? data.submission : s))
        );
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(data.submission);
        }
        setFeedback({ type: 'success', message: `Estado actualizado a "${newStatus}".` });
      } else {
        setFeedback({ type: 'error', message: data.message || 'Error al actualizar estado.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error de conexión al actualizar estado.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRetryEmail = async (id: string) => {
    setRetryingId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();

      if (data.submission) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? data.submission : s))
        );
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(data.submission);
        }
      }

      if (data.success) {
        setFeedback({ type: 'success', message: 'Notificación reenviada con éxito.' });
      } else {
        setFeedback({ type: 'error', message: data.message || 'No se pudo reenviar la notificación.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error de conexión al reintentar correo.' });
    } finally {
      setRetryingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingSubmission) return;
    if (deleteConfirmText.trim() !== deletingSubmission.publicRequestId) {
      setFeedback({
        type: 'error',
        message: `Debes ingresar exactamente "${deletingSubmission.publicRequestId}" para confirmar la eliminación.`,
      });
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/submissions/${deletingSubmission.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmDelete: true,
          confirmationText: deleteConfirmText.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSubmissions((prev) => prev.filter((s) => s.id !== deletingSubmission.id));
        setTotalCount((c) => Math.max(0, c - 1));
        if (selectedSubmission?.id === deletingSubmission.id) {
          setSelectedSubmission(null);
        }
        setFeedback({ type: 'success', message: `Solicitud ${deletingSubmission.publicRequestId} eliminada definitivamente.` });
        setDeletingSubmission(null);
        setDeleteConfirmText('');
      } else {
        setFeedback({ type: 'error', message: data.message || 'Error al eliminar solicitud.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error de conexión al eliminar solicitud.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[#00875A]" />
            <span>Bandeja Unificada de Contacto & Feedback</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total registrado: <span className="font-semibold text-slate-700 dark:text-slate-300">{totalCount}</span> solicitudes centralizadas (contacto web, soporte y feedback del cotizador PRO).
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchSubmissions()}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-70 text-slate-400 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        {/* Barra de búsqueda */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por ID (CP-...), correo, nombre o negocio..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Categoria */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold">Categoría:</span>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="all">Todas</option>
            <option value="consulta_general">Consulta General</option>
            <option value="calculadora">Calculadora</option>
            <option value="cotizador">Cotizador Comercial</option>
            <option value="cotizador_feedback">Cotizador PRO (Feedback)</option>
            <option value="cuenta_pro">Cuenta PRO</option>
            <option value="error_report">Reporte de Error</option>
            <option value="privacidad">Privacidad</option>
            <option value="alianza">Alianza</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Estado de Revisión */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold">Atención:</span>
          <select
            value={reviewFilter}
            onChange={(e) => {
              setReviewFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Proceso</option>
            <option value="resolved">Resuelta</option>
            <option value="discarded">Descartada</option>
          </select>
        </div>

        {/* Estado Correo Resend */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold">Correo Resend:</span>
          <select
            value={emailFilter}
            onChange={(e) => {
              setEmailFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="all">Todos</option>
            <option value="sent">Enviado</option>
            <option value="pending">Pendiente</option>
            <option value="failed">Fallo de envío</option>
          </select>
        </div>

        {/* Fecha Desde / Hasta */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold">Desde:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="px-2 py-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>

      {/* Listado */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Cargando solicitudes...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <div className="font-semibold text-slate-700 dark:text-slate-300">No hay solicitudes encontradas</div>
            <p className="mt-1 text-slate-400">Prueba ajustando los filtros de búsqueda.</p>
          </div>
        ) : (
          submissions.map((sub) => {
            const isUpdating = updatingId === sub.id;
            const isRetrying = retryingId === sub.id;

            return (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                {/* Info Principal */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {sub.publicRequestId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {sub.category === 'cotizador_feedback' ? 'Cotizador PRO Feedback' : sub.category}
                    </span>

                    {sub.businessType && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                        <Briefcase className="w-2.5 h-2.5" />
                        <span>{sub.businessType}</span>
                      </span>
                    )}

                    {/* Review Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        sub.reviewStatus === 'resolved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : sub.reviewStatus === 'in_progress'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                          : sub.reviewStatus === 'discarded'
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {sub.reviewStatus === 'resolved'
                        ? 'Resuelta'
                        : sub.reviewStatus === 'in_progress'
                        ? 'En Proceso'
                        : sub.reviewStatus === 'discarded'
                        ? 'Descartada'
                        : 'Pendiente'}
                    </span>

                    {/* Email Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        sub.emailStatus === 'sent'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : sub.emailStatus === 'failed'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                      <span>{sub.emailStatus === 'sent' ? 'Resend Enviado' : sub.emailStatus === 'failed' ? 'Resend Falló' : 'Resend Pendiente'}</span>
                    </span>

                    <span className="text-slate-400 text-[11px] flex items-center gap-1 ml-auto md:ml-0">
                      <Clock className="w-3 h-3" />
                      {new Date(sub.createdAt).toLocaleString('es-PE')}
                    </span>
                  </div>

                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {sub.name} • <span className="font-mono font-normal text-slate-500">{sub.email}</span>
                    {sub.phone && <span className="font-mono text-slate-400 font-normal"> • {sub.phone}</span>}
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2 italic text-[11px]">
                    &ldquo;{sub.message}&rdquo;
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                  {/* Select status rápido */}
                  <select
                    disabled={isUpdating}
                    value={sub.reviewStatus}
                    onChange={(e) => handleUpdateStatus(sub.id, e.target.value as 'pending' | 'in_progress' | 'resolved' | 'discarded')}
                    className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 text-xs outline-none cursor-pointer"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Proceso</option>
                    <option value="resolved">Resuelta</option>
                    <option value="discarded">Descartar</option>
                  </select>

                  {/* Reintentar correo si falló */}
                  {sub.emailStatus !== 'sent' && (
                    <button
                      type="button"
                      disabled={isRetrying}
                      onClick={() => handleRetryEmail(sub.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Reintentar notificación por Resend"
                    >
                      <Send className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                      <span>{isRetrying ? 'Reenviando...' : 'Reintentar'}</span>
                    </button>
                  )}

                  {/* Ver detalle */}
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(sub)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Ver detalle completo"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Eliminar permanentemente (reforzado) */}
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingSubmission(sub);
                      setDeleteConfirmText('');
                    }}
                    className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer"
                    title="Eliminar permanentemente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Página <span className="font-semibold text-slate-700 dark:text-slate-300">{page}</span> de {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETALLE COMPLETO */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-[#00875A]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Solicitud {selectedSubmission.publicRequestId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Remitente:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSubmission.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Correo:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedSubmission.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Teléfono:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedSubmission.phone || 'No indicado'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Categoría:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSubmission.category}</span>
              </div>
              {selectedSubmission.businessType && (
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Giro / Tipo de Negocio:</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">{selectedSubmission.businessType}</span>
                </div>
              )}
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Fecha de Registro:</span>
                <span className="text-slate-600 dark:text-slate-300">{new Date(selectedSubmission.createdAt).toLocaleString('es-PE')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Ruta de Origen:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">{selectedSubmission.sourcePath || '/contacto'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Consentimiento Legal:</span>
                <span className="text-emerald-600 font-semibold">
                  Aceptado ({selectedSubmission.consentVersion})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Estado Resend:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {selectedSubmission.emailStatus} {selectedSubmission.resendMessageId ? `(${selectedSubmission.resendMessageId})` : ''}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Mensaje o Detalle:</span>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedSubmission.message}
              </div>
            </div>

            {selectedSubmission.emailErrorCode && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300">
                <strong>Error técnico en notificación:</strong> {selectedSubmission.emailErrorCode}
              </div>
            )}

            {/* Acciones de la solicitud */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Atención:</span>
                <select
                  value={selectedSubmission.reviewStatus}
                  onChange={(e) => handleUpdateStatus(selectedSubmission.id, e.target.value as 'pending' | 'in_progress' | 'resolved' | 'discarded')}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En Proceso</option>
                  <option value="resolved">Resuelta</option>
                  <option value="discarded">Descartada</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN DE ELIMINACIÓN REFORZADA (Fase 11) */}
      {deletingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
              <Trash2 className="w-5 h-5 shrink-0" />
              <span>Confirmar Eliminación Definitiva</span>
            </div>

            <p className="text-slate-600 dark:text-slate-300">
              ¿Estás seguro de que deseas eliminar permanentemente la solicitud{' '}
              <strong className="font-mono text-slate-900 dark:text-white">{deletingSubmission.publicRequestId}</strong> de{' '}
              <strong className="text-slate-900 dark:text-white">{deletingSubmission.name}</strong>?
            </p>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300">
              Esta acción es irreversible y permanente. Antes de continuar, un evento de auditoría registrará la fecha y el código de solicitud sin guardar datos personales.
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 dark:text-slate-300 text-xs font-semibold block">
                Escribe el código <span className="font-mono font-bold text-rose-600 dark:text-rose-400 select-all">{deletingSubmission.publicRequestId}</span> para confirmar:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={deletingSubmission.publicRequestId}
                className="w-full px-3 py-2 font-mono rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/30 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeletingSubmission(null);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting || deleteConfirmText.trim() !== deletingSubmission.publicRequestId}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
