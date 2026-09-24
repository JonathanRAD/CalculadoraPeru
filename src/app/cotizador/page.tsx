'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Building,
  Package,
  History,
  Save,
  Download,
  FileSpreadsheet,
  MessageCircle,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Lock,
  ShieldCheck,
  Store,
  Eye,
} from 'lucide-react';

import { usePro } from '@/features/premium/context/ProContext';
import {
  calculateQuote,
  QuoteCalculatedItem,
  DiscountType,
  QuoteStatus,
  QuoteItemInput,
} from '@/core/calculators/quote';
import { QuoteItemRow } from '@/features/cotizador/components/QuoteItemRow';
import { ClientModal } from '@/features/cotizador/components/ClientModal';
import { CatalogModal } from '@/features/cotizador/components/CatalogModal';
import { QuoteHistoryModal } from '@/features/cotizador/components/QuoteHistoryModal';
import { WhatsAppShareModal } from '@/features/cotizador/components/WhatsAppShareModal';
import { QuoteBetaSection } from '@/features/cotizador/components/QuoteBetaSection';
import { generateQuotePdf, buildQuotePdfDoc } from '@/shared/utils/quotePdfGenerator';
import { downloadQuoteCsv } from '@/shared/utils/quoteCsvGenerator';
import { ClientRecord, CatalogItemRecord, QuoteItemRecord } from '@/features/cotizador/types';

const INITIAL_ITEM: QuoteItemInput = {
  description: '',
  type: 'product',
  unit: 'unit',
  quantity: 1,
  unitPrice: 0,
  discountType: 'none',
  discountValue: 0,
  isIgvAffected: true,
};

export default function CotizadorProPage() {
  const { user, isPro, openAuthModal, openActivationModal, openProfileModal } = usePro();

  // Storage key con aislamiento de usuario para dispositivos compartidos
  const draftStorageKey = useMemo(() => {
    return user?.id ? `calculaperu_quote_draft_v2_${user.id}` : 'calculaperu_quote_draft_v2_guest';
  }, [user?.id]);

  // Quote Metadata
  const [quoteId, setQuoteId] = useState<string | undefined>(undefined);
  const [quoteNumber, setQuoteNumber] = useState<string | undefined>(undefined);
  const [prefix, setPrefix] = useState('COT-');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<QuoteStatus>('draft');

  // Client Data
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [clientName, setClientName] = useState('');
  const [clientDocType, setClientDocType] = useState<'none' | 'dni' | 'ruc' | 'other'>('none');
  const [clientDocNumber, setClientDocNumber] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Items: Se inicia en blanco sin datos ficticios
  const [items, setItems] = useState<QuoteItemInput[]>([
    {
      description: '',
      type: 'product',
      unit: 'unit',
      quantity: 1,
      unitPrice: 0,
      discountType: 'none',
      discountValue: 0,
      isIgvAffected: true,
    },
  ]);

  // Tax and Global Discounts
  const [includeIgv, setIncludeIgv] = useState(false);
  const [igvRate] = useState(0.18);
  const [globalDiscountType, setGlobalDiscountType] = useState<DiscountType>('none');
  const [globalDiscountValue, setGlobalDiscountValue] = useState(0);

  // Commercial Terms
  const [paymentTerms, setPaymentTerms] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [publicNotes, setPublicNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [hasDraftRestored, setHasDraftRestored] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modals
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [pdfPreviewBlobUrl, setPdfPreviewBlobUrl] = useState<string | null>(null);

  // Cálculo central
  const calculatedResult = useMemo(() => {
    return calculateQuote({
      items,
      includeIgv,
      igvRate,
      globalDiscountType,
      globalDiscountValue,
    });
  }, [items, includeIgv, igvRate, globalDiscountType, globalDiscountValue]);

  // 1. Restaurar borrador de la clave específica de la cuenta o visitante
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(draftStorageKey);
        if (raw) {
          const saved = JSON.parse(raw);
          // Expiración a 7 días
          if (saved && saved.savedTimestamp && Date.now() - saved.savedTimestamp < 7 * 24 * 60 * 60 * 1000) {
            if (Array.isArray(saved.items) && saved.items.length > 0) {
              setClientName(saved.clientName || '');
              setClientDocType(saved.clientDocType || 'none');
              setClientDocNumber(saved.clientDocNumber || '');
              setClientPhone(saved.clientPhone || '');
              setClientEmail(saved.clientEmail || '');
              setClientAddress(saved.clientAddress || '');
              setIssueDate(saved.issueDate || new Date().toISOString().slice(0, 10));
              setValidUntil(saved.validUntil || '');
              setItems(saved.items);
              setIncludeIgv(saved.includeIgv !== undefined ? Boolean(saved.includeIgv) : false);
              setGlobalDiscountType(saved.globalDiscountType || 'none');
              setGlobalDiscountValue(saved.globalDiscountValue || 0);
              setPaymentTerms(saved.paymentTerms || '');
              setDeliveryTime(saved.deliveryTime || '');
              setPublicNotes(saved.publicNotes || '');
              setInternalNotes(saved.internalNotes || '');
              setDraftSavedAt(saved.savedAtFormatted || null);
              setHasDraftRestored(true);
            }
          }
        }
      } catch {}
    });
    return () => {
      cancelled = true;
    };
  }, [draftStorageKey]);

  // 2. Guardado automático local debounced
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setHasUnsavedChanges(true);

    const timer = setTimeout(() => {
      try {
        const now = new Date();
        const savedAtFormatted = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        const draft = {
          savedTimestamp: now.getTime(),
          savedAtFormatted,
          clientName,
          clientDocType,
          clientDocNumber,
          clientPhone,
          clientEmail,
          clientAddress,
          issueDate,
          validUntil,
          items,
          includeIgv,
          globalDiscountType,
          globalDiscountValue,
          paymentTerms,
          deliveryTime,
          publicNotes,
          internalNotes,
        };
        localStorage.setItem(draftStorageKey, JSON.stringify(draft));
        setDraftSavedAt(savedAtFormatted);
      } catch {}
    }, 600);

    return () => clearTimeout(timer);
  }, [
    draftStorageKey,
    clientName,
    clientDocType,
    clientDocNumber,
    clientPhone,
    clientEmail,
    clientAddress,
    issueDate,
    validUntil,
    items,
    includeIgv,
    globalDiscountType,
    globalDiscountValue,
    paymentTerms,
    deliveryTime,
    publicNotes,
    internalNotes,
  ]);

  // Advertencia antes de abandonar con cambios no guardados en la nube
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Limpiar borrador local voluntariamente
  const handleClearLocalDraft = () => {
    try {
      localStorage.removeItem(draftStorageKey);
      setDraftSavedAt(null);
      setHasDraftRestored(false);
      handleNewQuote();
    } catch {}
  };

  const handleAddItem = () => {
    if (items.length >= 100) {
      setSaveErrorMessage('Se ha alcanzado el límite máximo de 100 conceptos por cotización.');
      return;
    }
    setItems((prev) => [...prev, { ...INITIAL_ITEM, sortOrder: prev.length }]);
  };

  const handleUpdateItem = (index: number, updated: Partial<QuoteCalculatedItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      return next;
    });
  };

  const handleDuplicateItem = (index: number) => {
    if (items.length >= 100) return;
    setItems((prev) => {
      const next = [...prev];
      const target = next[index];
      next.splice(index + 1, 0, { ...target, id: undefined });
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setItems([{ ...INITIAL_ITEM }]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleSelectClient = (client: ClientRecord) => {
    setClientId(client.id);
    setClientName(client.name);
    setClientDocType(client.docType);
    setClientDocNumber(client.docNumber || '');
    setClientPhone(client.phone || '');
    setClientEmail(client.email || '');
    setClientAddress(client.address || '');
    setIsClientModalOpen(false);
  };

  const handleSelectCatalogItem = (catItem: CatalogItemRecord) => {
    const newItem: QuoteItemInput = {
      catalogItemId: catItem.id,
      description: catItem.name,
      type: catItem.type,
      unit: catItem.unit,
      quantity: 1,
      unitPrice: catItem.price,
      isIgvAffected: catItem.isIgvAffected,
      discountType: 'none',
      discountValue: 0,
    };

    setItems((prev) => {
      if (prev.length === 1 && !prev[0].description.trim() && prev[0].unitPrice === 0) {
        return [newItem];
      }
      return [...prev, newItem];
    });

    setIsCatalogModalOpen(false);
  };

  const handleNewQuote = () => {
    setQuoteId(undefined);
    setQuoteNumber(undefined);
    setClientId(undefined);
    setClientName('');
    setClientDocType('none');
    setClientDocNumber('');
    setClientPhone('');
    setClientEmail('');
    setClientAddress('');
    setIssueDate(new Date().toISOString().slice(0, 10));
    setValidUntil('');
    setStatus('draft');
    setPaymentTerms('');
    setDeliveryTime('');
    setPublicNotes('');
    setInternalNotes('');
    setGlobalDiscountType('none');
    setGlobalDiscountValue(0);
    setIncludeIgv(false);
    setItems([{ ...INITIAL_ITEM }]);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);
    setHasUnsavedChanges(false);
  };

  const handleLoadQuoteFromHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/quotes/${id}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.quote && data.items) {
        const q = data.quote;
        setQuoteId(q.id);
        setQuoteNumber(q.quoteNumber);
        setPrefix(q.prefix || 'COT-');
        setClientId(q.clientId);
        setClientName(q.clientName);
        setClientDocType(q.clientDocType);
        setClientDocNumber(q.clientDocNumber || '');
        setClientPhone(q.clientPhone || '');
        setClientEmail(q.clientEmail || '');
        setClientAddress(q.clientAddress || '');
        setIssueDate(q.issueDate);
        setValidUntil(q.validUntil || '');
        setStatus(q.status);
        setIncludeIgv(q.igvAmount > 0);
        setGlobalDiscountType(q.globalDiscountType || 'none');
        setGlobalDiscountValue(q.globalDiscountValue || 0);
        setPaymentTerms(q.paymentTerms || '');
        setDeliveryTime(q.deliveryTime || '');
        setPublicNotes(q.publicNotes || '');
        setInternalNotes(q.internalNotes || '');
        setItems(
          data.items.map((it: QuoteItemRecord) => ({
            id: it.id,
            catalogItemId: it.catalogItemId,
            sortOrder: it.sortOrder,
            description: it.description,
            type: it.type,
            unit: it.unit,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            discountType: it.discountType,
            discountValue: it.discountValue,
            isIgvAffected: it.isIgvAffected,
          }))
        );
        setSaveSuccessMessage(`Cotización ${q.quoteNumber} cargada en el editor.`);
        setHasUnsavedChanges(false);
      }
    } catch {
      setSaveErrorMessage('Error al cargar la cotización seleccionada.');
    }
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!isPro) {
      const hasHadPro = Boolean(user.proExpiresAt || user.activatedCode);
      if (hasHadPro) {
        setSaveErrorMessage('Tu membresía PRO ha expirado. Puedes consultar y exportar tus proformas en Modo Solo Lectura, pero guardar en la nube requiere reactivar el plan PRO.');
        return;
      }
      openActivationModal();
      return;
    }

    if (!clientName.trim()) {
      setSaveErrorMessage('Ingresa el nombre o razón social del cliente para guardar.');
      return;
    }

    if (items.length === 0 || !items.some((i) => i.description.trim())) {
      setSaveErrorMessage('Agrega al menos un concepto con descripción para guardar.');
      return;
    }

    setIsSaving(true);
    setSaveErrorMessage(null);
    setSaveSuccessMessage(null);

    const payload = {
      prefix,
      clientId,
      clientName: clientName.trim(),
      clientDocType,
      clientDocNumber: clientDocNumber.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
      clientAddress: clientAddress.trim() || undefined,
      issueDate,
      validUntil: validUntil || undefined,
      items,
      includeIgv,
      igvRate,
      globalDiscountType,
      globalDiscountValue,
      paymentTerms: paymentTerms.trim() || undefined,
      deliveryTime: deliveryTime.trim() || undefined,
      publicNotes: publicNotes.trim() || undefined,
      internalNotes: internalNotes.trim() || undefined,
      status,
    };

    try {
      const url = quoteId ? `/api/quotes/${quoteId}` : '/api/quotes';
      const method = quoteId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.quote) {
        setQuoteId(data.quote.id);
        setQuoteNumber(data.quote.quoteNumber);
        setSaveSuccessMessage(data.message || 'Cotización guardada exitosamente.');
        setHasUnsavedChanges(false);
        try {
          localStorage.removeItem(draftStorageKey);
          setDraftSavedAt(null);
        } catch {}
      } else {
        setSaveErrorMessage(data.message || 'Error al guardar la cotización.');
      }
    } catch {
      setSaveErrorMessage('Error de conexión al guardar en la nube.');
    } finally {
      setIsSaving(false);
    }
  };

  const validateBeforeExport = (): boolean => {
    if (!clientName.trim()) {
      setSaveErrorMessage('Ingresa el nombre del cliente para generar el documento.');
      return false;
    }
    const senderName = user?.companyName || user?.name;
    if (!senderName || !senderName.trim()) {
      setSaveErrorMessage('Configura el nombre o razón social de tu empresa en "Mi Empresa" antes de descargar.');
      openProfileModal();
      return false;
    }
    return true;
  };

  const handleExportPdf = () => {
    if (!validateBeforeExport()) return;

    const companyData = {
      companyName: user?.companyName || user?.name || '',
      companyRuc: user?.companyRuc,
      companyAddress: user?.companyAddress,
      companyLogoBase64: user?.companyLogoBase64,
      name: user?.name,
      email: user?.email,
      phone: user?.companyAddress ? undefined : undefined,
    };

    generateQuotePdf({
      quoteNumber: quoteNumber || 'BORRADOR SIN NÚMERO',
      issueDate,
      validUntil: validUntil || undefined,
      company: companyData,
      client: {
        name: clientName.trim(),
        docType: clientDocType,
        docNumber: clientDocNumber.trim() || undefined,
        phone: clientPhone.trim() || undefined,
        email: clientEmail.trim() || undefined,
        address: clientAddress.trim() || undefined,
      },
      items: calculatedResult.items,
      totals: calculatedResult.totals,
      paymentTerms: paymentTerms.trim() || undefined,
      deliveryTime: deliveryTime.trim() || undefined,
      publicNotes: publicNotes.trim() || undefined,
    });
  };

  const handlePreviewPdf = () => {
    if (!validateBeforeExport()) return;

    const companyData = {
      companyName: user?.companyName || user?.name || '',
      companyRuc: user?.companyRuc,
      companyAddress: user?.companyAddress,
      companyLogoBase64: user?.companyLogoBase64,
      name: user?.name,
      email: user?.email,
    };

    const doc = buildQuotePdfDoc({
      quoteNumber: quoteNumber || 'BORRADOR SIN NÚMERO',
      issueDate,
      validUntil: validUntil || undefined,
      company: companyData,
      client: {
        name: clientName.trim(),
        docType: clientDocType,
        docNumber: clientDocNumber.trim() || undefined,
        phone: clientPhone.trim() || undefined,
        email: clientEmail.trim() || undefined,
        address: clientAddress.trim() || undefined,
      },
      items: calculatedResult.items,
      totals: calculatedResult.totals,
      paymentTerms: paymentTerms.trim() || undefined,
      deliveryTime: deliveryTime.trim() || undefined,
      publicNotes: publicNotes.trim() || undefined,
    });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfPreviewBlobUrl(url);
  };

  const handleExportCsv = () => {
    if (!validateBeforeExport()) return;

    const companyData = {
      companyName: user?.companyName || user?.name || '',
      companyRuc: user?.companyRuc,
      companyAddress: user?.companyAddress,
      name: user?.name,
      email: user?.email,
    };

    downloadQuoteCsv({
      quoteNumber: quoteNumber || 'BORRADOR SIN NÚMERO',
      issueDate,
      validUntil: validUntil || undefined,
      company: companyData,
      client: {
        name: clientName.trim(),
        docType: clientDocType,
        docNumber: clientDocNumber.trim() || undefined,
        phone: clientPhone.trim() || undefined,
        email: clientEmail.trim() || undefined,
        address: clientAddress.trim() || undefined,
      },
      items: calculatedResult.items,
      totals: calculatedResult.totals,
      paymentTerms: paymentTerms.trim() || undefined,
      deliveryTime: deliveryTime.trim() || undefined,
      publicNotes: publicNotes.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#070D1F] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* 🌟 Header Toolbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0D152D]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 transition-colors">
                <Store className="h-4 w-4 text-[#00875A] dark:text-[#00C853]" />
              </span>
              <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
                CalculaPerú <span className="text-[#00875A] dark:text-[#00C853]">Cotizador PRO</span>
              </span>
            </Link>

            <span className={`rounded-md px-2.5 py-0.5 text-xs font-mono font-bold border ${
              quoteNumber
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-[#00875A] dark:text-[#00C853] border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              {quoteNumber || 'BORRADOR SIN NÚMERO'}
            </span>

            {hasUnsavedChanges && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                • Cambios sin guardar
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleNewQuote}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
              <span>Nueva</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isPro) {
                  openActivationModal();
                } else {
                  setIsHistoryModalOpen(true);
                }
              }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <History className="h-3.5 w-3.5 text-[#00875A] dark:text-[#00C853]" />
              <span>Mis Cotizaciones</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isPro) {
                  openActivationModal();
                } else {
                  setIsCatalogModalOpen(true);
                }
              }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Catálogo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isPro) {
                  openActivationModal();
                } else {
                  setIsClientModalOpen(true);
                }
              }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Building className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline">Clientes</span>
            </button>

            <button
              type="button"
              onClick={openProfileModal}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Configurar membrete, logo y RUC"
            >
              <Building className="h-3.5 w-3.5 text-[#00875A] dark:text-[#00C853]" />
              <span className="hidden md:inline">Mi Empresa</span>
            </button>
          </div>

        </div>
      </header>

      {/* Aviso de borrador restaurado y control de privacidad */}
      {hasDraftRestored && !quoteId && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 text-center text-xs text-slate-700 dark:text-slate-300 flex flex-wrap items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#00875A] dark:text-[#00C853]" />
          <span>
            Borrador conservado en tu navegador{draftSavedAt ? ` (guardado a las ${draftSavedAt})` : ''}.
          </span>
          <button
            type="button"
            onClick={handleClearLocalDraft}
            className="text-rose-600 dark:text-rose-400 hover:underline font-bold cursor-pointer text-[11px] ml-2"
          >
            Eliminar borrador local
          </button>
        </div>
      )}

      {/* Mensajes de retroalimentación */}
      {saveSuccessMessage && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 p-3.5 text-xs text-[#00875A] dark:text-[#00C853] flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveSuccessMessage(null)}
              className="text-[#00875A] hover:opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {saveErrorMessage && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
          <div className="rounded-2xl bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-800 p-3.5 text-xs text-red-700 dark:text-red-300 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{saveErrorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveErrorMessage(null)}
              className="text-red-700 hover:opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Layout Principal de Trabajo */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================
              COLUMNA IZQUIERDA: Formulario Editor
             ======================================================== */}
          <div className="lg:col-span-8 space-y-6">

            {/* 1. Datos de la Cotización */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#00875A] dark:text-[#00C853]" />
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">Datos de la Cotización</h2>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Moneda: <strong className="text-slate-800 dark:text-slate-200">Soles (PEN)</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label htmlFor="quote-prefix" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prefijo / Serie
                  </label>
                  <input
                    id="quote-prefix"
                    type="text"
                    maxLength={10}
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    placeholder="COT-"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono uppercase focus:border-[#00875A] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="quote-issue-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha de Emisión <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quote-issue-date"
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#00875A] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="quote-valid-until" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vigencia hasta <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    id="quote-valid-until"
                    type="date"
                    min={issueDate}
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#00875A] outline-none"
                  />
                </div>
              </div>

              {/* Selector de Estado */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <label htmlFor="quote-status" className="font-semibold text-slate-700 dark:text-slate-300">
                    Estado de seguimiento:
                  </label>
                  <select
                    id="quote-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="draft">Borrador</option>
                    <option value="sent">Enviada al cliente</option>
                    <option value="accepted">Aceptada por el cliente</option>
                    <option value="rejected">Rechazada</option>
                    <option value="expired">Vencida</option>
                    <option value="canceled">Anulada</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Datos del Cliente */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">Datos del Cliente</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isPro) {
                      openActivationModal();
                    } else {
                      setIsClientModalOpen(true);
                    }
                  }}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-[#00875A] dark:text-[#00C853] px-3 py-1 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Building className="h-3.5 w-3.5" />
                  <span>Elegir de mi directorio</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-8">
                  <label htmlFor="client-name-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre o Razón Social del Cliente <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="client-name-input"
                    type="text"
                    required
                    minLength={2}
                    maxLength={150}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej: Distribuidora Los Andes S.A.C."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="client-doctype-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    id="client-doctype-input"
                    value={clientDocType}
                    onChange={(e) => setClientDocType(e.target.value as 'none' | 'dni' | 'ruc' | 'other')}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="none">Sin documento</option>
                    <option value="dni">DNI (8 dígitos)</option>
                    <option value="ruc">RUC (11 dígitos)</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label htmlFor="client-docnumber-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    N° de Documento
                  </label>
                  <input
                    id="client-docnumber-input"
                    type="text"
                    maxLength={20}
                    value={clientDocNumber}
                    onChange={(e) => setClientDocNumber(e.target.value)}
                    placeholder={clientDocType === 'dni' ? '8 dígitos' : clientDocType === 'ruc' ? '11 dígitos' : 'Opcional'}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="client-phone-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    id="client-phone-input"
                    type="tel"
                    maxLength={15}
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ej: 987654321"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="client-email-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    id="client-email-input"
                    type="email"
                    maxLength={254}
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="cliente@empresa.pe"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="client-address-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dirección de Entrega / Facturación
                </label>
                <input
                  id="client-address-input"
                  type="text"
                  maxLength={180}
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Ej: Av. Los Conquistadores 450, San Isidro, Lima"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
                />
              </div>
            </div>

            {/* 3. Conceptos a Cotizar */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                    Conceptos a Cotizar ({items.length} de 100)
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isPro) {
                        openActivationModal();
                      } else {
                        setIsCatalogModalOpen(true);
                      }
                    }}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-[#00875A] dark:text-[#00C853] px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Package className="h-3.5 w-3.5" />
                    <span>+ Del Catálogo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="rounded-xl bg-[#00875A] hover:bg-[#00704A] text-white px-3.5 py-1.5 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Concepto Manual</span>
                  </button>
                </div>
              </div>

              {/* Lista de Filas */}
              <div className="space-y-3">
                {calculatedResult.items.map((item, idx) => (
                  <QuoteItemRow
                    key={item.id || `item-${idx}`}
                    index={idx}
                    totalItems={items.length}
                    item={item}
                    onChange={(updated) => handleUpdateItem(idx, updated)}
                    onDuplicate={() => handleDuplicateItem(idx)}
                    onRemove={() => handleRemoveItem(idx)}
                    onMoveUp={() => handleMoveUp(idx)}
                    onMoveDown={() => handleMoveDown(idx)}
                  />
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#00875A] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-[#00875A]" />
                  <span>Añadir otra línea o concepto</span>
                </button>
              </div>
            </div>

            {/* 4. Condiciones y Observaciones */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">Condiciones y Observaciones</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="quote-payment-terms" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Forma / Condiciones de Pago
                  </label>
                  <input
                    id="quote-payment-terms"
                    type="text"
                    maxLength={500}
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="Ej: Contado, crédito a 15 días, 50% anticipo..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="quote-delivery-time" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tiempo Estimado de Entrega
                  </label>
                  <input
                    id="quote-delivery-time"
                    type="text"
                    maxLength={150}
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="Ej: Inmediato, 48 horas, según coordinación..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quote-public-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nota u Observación Pública (Visible en el PDF)
                </label>
                <textarea
                  id="quote-public-notes"
                  rows={2}
                  maxLength={700}
                  value={publicNotes}
                  onChange={(e) => setPublicNotes(e.target.value)}
                  placeholder="Aclaraciones para el cliente sobre garantía, traslado, vigencia, etc."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="quote-internal-notes" className="block text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    Notas Internas Privadas (Solo para ti)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    🔒 No aparecerá en PDF, CSV ni WhatsApp
                  </span>
                </div>
                <textarea
                  id="quote-internal-notes"
                  rows={2}
                  maxLength={700}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Anotaciones confidenciales: costo de compra, proveedor, margen, comisión del vendedor..."
                  className="w-full rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 outline-none resize-none"
                />
              </div>
            </div>

          </div>

          {/* ========================================================
              COLUMNA DERECHA: Resumen y Acciones (Sticky)
             ======================================================== */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">

            {/* Resumen Económico */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  RESUMEN DE COTIZACIÓN
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {calculatedResult.totals.itemsCount} {calculatedResult.totals.itemsCount === 1 ? 'concepto' : 'conceptos'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Subtotal Bruto:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">
                    S/ {calculatedResult.totals.subtotalGross.toFixed(2)}
                  </span>
                </div>

                {calculatedResult.totals.itemsDiscountTotal > 0 && (
                  <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                    <span>Descuentos en conceptos:</span>
                    <span className="font-mono font-semibold">
                      -S/ {calculatedResult.totals.itemsDiscountTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Descuento Global */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Descuento global:</span>
                    <select
                      aria-label="Tipo de descuento global"
                      value={globalDiscountType}
                      onChange={(e) => {
                        const t = e.target.value as DiscountType;
                        setGlobalDiscountType(t);
                        if (t === 'none') setGlobalDiscountValue(0);
                      }}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-0.5 text-[11px] text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="none">Sin descuento</option>
                      <option value="percent">% Porcentaje</option>
                      <option value="fixed">S/ Monto fijo</option>
                    </select>
                  </div>

                  {globalDiscountType !== 'none' && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Valor de descuento:</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        value={globalDiscountValue === 0 ? '' : globalDiscountValue}
                        onChange={(e) => setGlobalDiscountValue(parseFloat(e.target.value) || 0)}
                        placeholder={globalDiscountType === 'percent' ? '5%' : 'S/ 50'}
                        className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-xs text-right font-mono text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                      />
                    </div>
                  )}

                  {calculatedResult.totals.globalDiscountAmount > 0 && (
                    <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 text-xs">
                      <span>Descuento global aplicado:</span>
                      <span className="font-mono font-semibold">
                        -S/ {calculatedResult.totals.globalDiscountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Subtotal Neto:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">
                    S/ {calculatedResult.totals.subtotalNet.toFixed(2)}
                  </span>
                </div>

                {/* Switch de IGV */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                        Aplicar IGV (18%)
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        La aplicación del IGV depende de la operación y de la situación tributaria del emisor.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncludeIgv(!includeIgv)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        includeIgv ? 'bg-[#00875A]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      role="switch"
                      aria-checked={includeIgv}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          includeIgv ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {includeIgv && (
                    <div className="space-y-1 pl-2 border-l-2 border-emerald-500 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Base gravada:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          S/ {calculatedResult.totals.taxableBase.toFixed(2)}
                        </span>
                      </div>
                      {calculatedResult.totals.exemptBase > 0 && (
                        <div className="flex justify-between">
                          <span>Base inafecta:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            S/ {calculatedResult.totals.exemptBase.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-900 dark:text-white font-semibold">
                        <span>IGV (18%):</span>
                        <span className="font-mono text-[#00875A] dark:text-[#00C853]">
                          S/ {calculatedResult.totals.igvAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Caja de Total */}
                <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    TOTAL ESTIMADO:
                  </span>
                  <div className="text-3xl font-black font-mono text-[#00875A] dark:text-[#00C853]">
                    S/ {calculatedResult.totals.totalAmount.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Expresado en moneda nacional (PEN)
                  </span>
                </div>

              </div>

              {/* Botones Principales */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {/* Guardar en la Nube */}
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveToCloud}
                  className="w-full rounded-2xl bg-[#00875A] hover:bg-[#00704A] text-white font-bold py-3 px-4 text-xs transition-all cursor-pointer shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Guardando...' : quoteId ? 'Actualizar Cotización' : 'Guardar Cotización PRO'}</span>
                </button>

                {/* Vista previa y Descarga PDF */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handlePreviewPdf}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-3 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#00875A] dark:text-[#00C853]" />
                    <span>Vista previa</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-3 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-[#00875A] dark:text-[#00C853]" />
                    <span>Descargar PDF</span>
                  </button>
                </div>

                {/* CSV & WhatsApp */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-3 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Exportar CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWhatsAppModalOpen(true)}
                    className="rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 px-3 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>

              </div>

              {/* Leyenda Transparente */}
              <div className="pt-2 text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                Este documento es una cotización comercial o proforma y no constituye un comprobante de pago.
              </div>

            </div>

            {/* Aviso Prudente de Asesoría */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#00875A]" />
                <span>Orientación comercial y tributaria</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                La aplicación del IGV depende de la operación y de la situación tributaria del emisor. Configúrala según corresponda y consulta a un profesional cuando tengas dudas contables.
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* Sección de Sugerencias y Mejoras del Cotizador */}
      <QuoteBetaSection />

      {/* Modal de Vista Previa PDF */}
      {pdfPreviewBlobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl h-[85vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#00875A]" />
                <span>Vista Previa de la Proforma</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="rounded-xl bg-[#00875A] hover:bg-[#00704A] text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Descargar archivo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(pdfPreviewBlobUrl);
                    setPdfPreviewBlobUrl(null);
                  }}
                  className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <iframe
              src={pdfPreviewBlobUrl}
              className="w-full flex-1 rounded-2xl border border-slate-200 dark:border-slate-800"
              title="Vista previa del documento PDF"
            />
          </div>
        </div>
      )}

      {/* Modales */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelectClient={handleSelectClient}
      />

      <CatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        onSelectItem={handleSelectCatalogItem}
      />

      <QuoteHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onLoadQuote={handleLoadQuoteFromHistory}
        companyProfile={{
          companyName: user?.companyName,
          companyRuc: user?.companyRuc,
          companyAddress: user?.companyAddress,
          companyLogoBase64: user?.companyLogoBase64,
          name: user?.name,
          email: user?.email,
        }}
        onOpenWhatsApp={(q, qItems) => {
          setIsHistoryModalOpen(false);
          setQuoteNumber(q.quoteNumber);
          setClientName(q.clientName);
          setClientPhone(q.clientPhone || '');
          setItems(qItems);
          setIsWhatsAppModalOpen(true);
        }}
      />

      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        quoteNumber={quoteNumber || 'BORRADOR'}
        clientName={clientName || 'Cliente'}
        clientPhone={clientPhone}
        items={calculatedResult.items}
        totals={calculatedResult.totals}
        paymentTerms={paymentTerms}
        validUntil={validUntil}
        businessName={user?.companyName || user?.name}
      />

    </div>
  );
}
