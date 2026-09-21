'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  User,
  Sparkles,
  Building2,
  Upload,
  Trash2,
  Check,
  LogOut,
  KeyRound,
  Calendar,
  Image as ImageIcon,
  FolderOpen,
  FileSpreadsheet,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';
import { usePro } from '@/features/premium/context/ProContext';
import { exportTableToCsv } from '@/shared/utils/exportToExcel';
import { SubscriptionRequest } from '@/features/auth/types';
import { useModalAnimation } from '@/shared/hooks/useModalAnimation';

interface SavedCalc {
  id: string;
  calculatorType: string;
  title: string;
  summaryText: string;
  totalAmount?: number;
  data: Record<string, any>;
  createdAt: string;
}

export function ProfileModal() {
  const {
    user,
    isPro,
    plan,
    expiresAt,
    isProfileModalOpen,
    closeProfileModal,
    logout,
    activatePro,
    updateCompanyProfile,
  } = usePro();

  const { shouldRender, backdropClass, modalClass } = useModalAnimation(Boolean(isProfileModalOpen && user));


  const [activeTab, setActiveTab] = useState<'calcs' | 'company' | 'license'>('calcs');

  // Company state
  const [companyName, setCompanyName] = useState('');
  const [companyRuc, setCompanyRuc] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyLogoBase64, setCompanyLogoBase64] = useState<string | null>(null);

  // License redemption state
  const [codeToRedeem, setCodeToRedeem] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemFeedback, setRedeemFeedback] = useState<{ success?: boolean; message?: string }>({});

  // Profile save state
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Saved calculations state
  const [savedCalcs, setSavedCalcs] = useState<SavedCalc[]>([]);
  const [isLoadingCalcs, setIsLoadingCalcs] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // User payment / subscription requests traceability
  const [mySubscriptions, setMySubscriptions] = useState<SubscriptionRequest[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);

  // Sync company data when user changes
  useEffect(() => {
    if (user) {
      setCompanyName(user.companyName || '');
      setCompanyRuc(user.companyRuc || '');
      setCompanyAddress(user.companyAddress || '');
      setCompanyLogoBase64(user.companyLogoBase64 || null);
    }
  }, [user]);

  // Load calculations and subscriptions
  useEffect(() => {
    if (isProfileModalOpen && user) {
      loadCalculations();
      loadMySubscriptions();
    }
  }, [isProfileModalOpen, user]);

  const loadCalculations = async () => {
    setIsLoadingCalcs(true);
    try {
      const res = await fetch('/api/calculations');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSavedCalcs(json.data);
      }
    } catch {
      // Fallback silent
    } finally {
      setIsLoadingCalcs(false);
    }
  };

  const loadMySubscriptions = async () => {
    setIsLoadingSubscriptions(true);
    try {
      const res = await fetch('/api/pro/subscriptions/my-status');
      const json = await res.json();
      if (json.success && Array.isArray(json.subscriptions)) {
        setMySubscriptions(json.subscriptions);
      }
    } catch {
      // Fallback silent
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const handleDeleteCalc = async (id: string) => {
    if (!confirm('¿Deseas eliminar este cálculo guardado?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/calculations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedCalcs((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      alert('No se pudo eliminar el cálculo.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCalcCsv = (calc: SavedCalc) => {
    const flatRows = Object.entries(calc.data || {}).map(([key, val]) => ({
      parametro: key,
      valor: typeof val === 'object' ? JSON.stringify(val) : String(val),
    }));

    exportTableToCsv(
      `Calculo_${calc.calculatorType}_${calc.title.replace(/\s+/g, '_')}`,
      [
        { key: 'parametro', header: 'Parámetro / Concepto' },
        { key: 'valor', header: 'Detalle Registrado' },
      ],
      flatRows
    );
  };

  if (!isProfileModalOpen || !user) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen del logotipo debe pesar menos de 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCompanyLogoBase64(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCompanyData = async () => {
    setIsSavingProfile(true);
    setSaveFeedback(null);
    try {
      const res = await updateCompanyProfile({
        companyName,
        companyRuc,
        companyAddress,
        companyLogoBase64: companyLogoBase64 || undefined,
      });
      if (res.success) {
        setSaveFeedback('✓ Datos y logotipo guardados correctamente en tu cuenta.');
        setTimeout(() => setSaveFeedback(null), 3500);
      } else {
        setSaveFeedback(`Error: ${res.message}`);
      }
    } catch {
      setSaveFeedback('Error al guardar datos.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeToRedeem.trim()) return;
    setIsRedeeming(true);
    setRedeemFeedback({});

    const res = await activatePro(codeToRedeem.trim());
    setRedeemFeedback(res);
    setIsRedeeming(false);
    if (res.success) {
      setCodeToRedeem('');
    }
  };

  const getCalcBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cts':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'liquidacion':
      case 'liquidacion-laboral':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'boleta':
      case 'boleta-pago':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'renta':
      case 'renta-5ta':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  if (!shouldRender || !user) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeProfileModal(); }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs ${backdropClass}`}
    >
      <div className={`relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 text-xs max-h-[92vh] overflow-y-auto ${modalClass}`}>

        
        {/* Close Button */}
        <button
          type="button"
          onClick={closeProfileModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User Profile Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00875A] to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {user.name}
              </h3>
              {isPro ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                  PRO ({plan === 'yearly' ? 'ANUAL' : 'MENSUAL'})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px]">
                  PLAN GRATUITO
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs">{user.email}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('calcs')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'calcs'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Mis Cálculos ({savedCalcs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'company'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mi Empresa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('license')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeTab === 'license'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Membresía PRO</span>
            {mySubscriptions.some(s => s.status === 'rejected') ? (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            ) : mySubscriptions.some(s => s.status === 'pending') ? (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            ) : null}
          </button>
        </div>

        {/* TAB 1: Mis Cálculos Guardados */}
        {activeTab === 'calcs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Historial y Cálculos Guardados en la Nube
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Accede a tus liquidaciones, cálculos de CTS, boletas y cotizaciones desde cualquier dispositivo.
                </p>
              </div>
              <button
                type="button"
                onClick={loadCalculations}
                disabled={isLoadingCalcs}
                className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
              >
                Actualizar
              </button>
            </div>

            {isLoadingCalcs ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Cargando tus cálculos guardados...</span>
              </div>
            ) : savedCalcs.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
                <FolderOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Aún no tienes cálculos guardados
                </p>
                <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
                  Al usar cualquier calculadora (CTS, Liquidación, Boleta de Pago, etc.), haz clic en el botón <strong>"Guardar en Mis Cálculos"</strong> para sincronizarlo aquí.
                </p>
                <div className="pt-2">
                  <Link
                    href="/#todas-las-calculadoras"
                    onClick={closeProfileModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90"
                  >
                    Ir a Calculadoras
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {savedCalcs.map((calc) => (
                  <div
                    key={calc.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${getCalcBadgeColor(calc.calculatorType)}`}>
                          {calc.calculatorType}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {calc.title}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-1">
                        {calc.summaryText}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>{new Date(calc.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {calc.totalAmount !== undefined && (
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            Total: S/ {Number(calc.totalAmount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleExportCalcCsv(calc)}
                        title="Exportar a Excel / CSV"
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Excel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCalc(calc.id)}
                        disabled={deletingId === calc.id}
                        title="Eliminar cálculo"
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Mi Empresa */}
        {activeTab === 'company' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Datos Predeterminados de Tu Empresa
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Se rellenan automáticamente en tus boletas de pago, liquidaciones y cotizaciones.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Razón Social / Empresa
                </label>
                <input
                  type="text"
                  placeholder="Ej. Corporación Perú S.A.C."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  RUC de la Empresa (11 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={11}
                  placeholder="Ej. 20601928371"
                  value={companyRuc}
                  onChange={(e) => setCompanyRuc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Dirección Fiscal
              </label>
              <input
                type="text"
                placeholder="Ej. Av. Javier Prado Este 1420, San Isidro, Lima"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
              />
            </div>

            {/* Logo uploader */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Logotipo Corporativo Guardado en Cuenta</span>
              </label>
              {companyLogoBase64 ? (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <img src={companyLogoBase64} alt="Logo" className="w-14 h-10 object-contain rounded bg-white p-0.5 border border-slate-100" />
                  <div className="flex-1 text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Logotipo guardado en tu cuenta</span>
                    <span className="text-[10px] text-slate-400">Aparecerá en tus documentos oficiales en cualquier dispositivo</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompanyLogoBase64(null)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar logo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-900 cursor-pointer transition-colors text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Cargar Logotipo de la Empresa (PNG/JPG máx 2MB)</span>
                  <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleLogoUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleSaveCompanyData}
                disabled={isSavingProfile}
                className="py-2.5 px-4 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-white" />
                <span>{isSavingProfile ? 'Guardando...' : 'Guardar Datos en mi Cuenta'}</span>
              </button>
              {saveFeedback && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {saveFeedback}
                </span>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Membresía PRO */}
        {activeTab === 'license' && (
          <div className="space-y-4">
            {isPro ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Membresía PRO Activa</span>
                  </span>
                  <span className="text-[11px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-2.5 py-0.5 rounded-full font-extrabold">
                    {plan === 'yearly' ? 'Plan Anual' : 'Plan Mensual (S/ 16.00/mes)'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  {expiresAt ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Vigencia hasta el: <strong>{new Date(expiresAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                    </span>
                  ) : (
                    'Licencia sin fecha límite'
                  )}
                </p>
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 grid grid-cols-2 gap-2 text-[11px] text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Exportación Excel ilimitada</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cálculos guardados en nube</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Semáforo SUNAFIL 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PDF oficial con membrete</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      Pásate a PRO por solo S/ 16.00 / mes
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
                      AHORRA TIEMPO
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Desbloquea guardado en nube, exportación directa a Excel con fórmulas, semáforo de contingencias SUNAFIL 2026 y membretes personalizados.
                  </p>
                  <Link
                    href="/pro"
                    onClick={closeProfileModal}
                    className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <span>Ver Planes y Beneficios PRO</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>¿Ya compraste tu suscripción? Canjea tu Código</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Ingresa el código que te enviamos al pagar por Yape o Plin para activar tu cuenta al instante.
                  </p>
                  <form onSubmit={handleRedeem} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Ej. PRO-2026-A8K2-9M4Q"
                      value={codeToRedeem}
                      onChange={(e) => setCodeToRedeem(e.target.value)}
                      className="flex-1 uppercase font-mono bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={isRedeeming}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {isRedeeming ? 'Canjeando...' : 'Canjear'}
                    </button>
                  </form>
                  {redeemFeedback.message && (
                    <p className={`text-[11px] font-semibold ${redeemFeedback.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}>
                      {redeemFeedback.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SECCIÓN DE TRAZABILIDAD DE SOLICITUDES Y PAGOS YAPE / PLIN */}
            {mySubscriptions.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00875A]" />
                    <span>Trazabilidad de tus Pagos (Yape / Plin)</span>
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {mySubscriptions.length} {mySubscriptions.length === 1 ? 'solicitud' : 'solicitudes'}
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {mySubscriptions.map((sub) => {
                    const isPending = sub.status === 'pending';
                    const isRejected = sub.status === 'rejected';
                    const isApproved = sub.status === 'approved';

                    return (
                      <div
                        key={sub.id}
                        className={`p-3 rounded-xl border transition-all text-xs space-y-2 ${
                          isRejected
                            ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900/60'
                            : isPending
                            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                            : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              Op. {sub.operationCode}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {sub.plan === 'yearly' ? 'Plan Anual (S/ 149)' : 'Plan Mensual (S/ 16)'}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] flex items-center gap-1 ${
                              isRejected
                                ? 'bg-red-100 dark:bg-red-900/70 text-red-700 dark:text-red-300'
                                : isPending
                                ? 'bg-amber-100 dark:bg-amber-900/70 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {isRejected && <AlertTriangle className="w-3 h-3" />}
                            {isPending && <Clock className="w-3 h-3 animate-spin" />}
                            {isApproved && <Check className="w-3 h-3" />}
                            {isRejected
                              ? 'Observada'
                              : isPending
                              ? 'En Verificación'
                              : 'Aprobada'}
                          </span>
                        </div>

                        {isRejected && (
                          <div className="space-y-2">
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-red-100 dark:border-red-950 text-red-800 dark:text-red-300 text-[11px] leading-relaxed">
                              <strong>Observación:</strong>{' '}
                              {sub.notes || 'No se pudo corroborar el abono en el extracto bancario.'}
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <span className="text-[10px] text-slate-500">
                                Regulariza tu comprobante:
                              </span>
                              <a
                                href={`https://wa.me/51913544715?text=${encodeURIComponent(
                                  `Hola, mi solicitud PRO (Op: ${sub.operationCode}) fue observada por el motivo: "${sub.notes || ''}". Adjunto mi comprobante de pago para validar mi suscripción.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp Soporte</span>
                              </a>
                            </div>
                          </div>
                        )}

                        {isPending && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            Tu transferencia está en cola de verificación contable. Se activará automáticamente en un lapso de 5 a 15 minutos.
                          </p>
                        )}

                        {isApproved && sub.generatedLicenseCode && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Código Oficial:</span>
                            <span className="font-mono font-bold text-[#00875A] dark:text-emerald-400">
                              {sub.generatedLicenseCode}
                            </span>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 text-right">
                          Registrado el {new Date(sub.createdAt).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}


        {/* Logout Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">CalculaPerú Cloud</span>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 font-bold text-red-600 hover:text-red-700 text-xs cursor-pointer p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </div>
    </div>
  );
}
