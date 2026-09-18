'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { usePro } from '@/features/premium/context/ProContext';

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

  const [companyName, setCompanyName] = useState('');
  const [companyRuc, setCompanyRuc] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyLogoBase64, setCompanyLogoBase64] = useState<string | null>(null);

  const [codeToRedeem, setCodeToRedeem] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemFeedback, setRedeemFeedback] = useState<{ success?: boolean; message?: string }>({});

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      setCompanyName(user.companyName || '');
      setCompanyRuc(user.companyRuc || '');
      setCompanyAddress(user.companyAddress || '');
      setCompanyLogoBase64(user.companyLogoBase64 || null);
    }
  }, [user]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-xs max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={closeProfileModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User Profile Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 dark:border-slate-800 pb-5">
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

        {/* PRO Status Box */}
        {isPro ? (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Membresía PRO Activa</span>
              </span>
              <span className="text-[11px] bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded-md">
                Acceso Ilimitado
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
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>¿Tienes un Código de Suscripción PRO?</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">
              Canjea el código que te entregamos al adquirir tu plan para activar todas las funciones oficiales y vincularlas a tu cuenta.
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
        )}

        {/* Company Profile Saved Data */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Datos Predeterminados de Tu Empresa</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Se sincronizan en todos tus dispositivos
            </span>
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
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Logotipo Corporativo Guardado en Cuenta</span>
            </label>
            {companyLogoBase64 ? (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <img src={companyLogoBase64} alt="Logo" className="w-14 h-10 object-contain rounded bg-white p-0.5 border border-slate-100" />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Logotipo guardado en tu cuenta</span>
                  <span className="text-[10px] text-slate-400">Aparecerá en tus boletas en cualquier computadora</span>
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
                <span>Cargar Logotipo de la Empresa (PNG/JPG)</span>
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleLogoUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleSaveCompanyData}
              disabled={isSavingProfile}
              className="py-2 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isSavingProfile ? 'Guardando...' : 'Guardar Datos en mi Cuenta'}</span>
            </button>
            {saveFeedback && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {saveFeedback}
              </span>
            )}
          </div>
        </div>

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
