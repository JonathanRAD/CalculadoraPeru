'use client';

import React, { useState } from 'react';
import { usePro } from '@/features/premium/context/ProContext';
import { KeyRound, Check, X, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useModalAnimation } from '@/shared/hooks/useModalAnimation';

export default function ProActivationModal() {
  const { isActivationModalOpen, closeActivationModal, activatePro, isPro, subscriberName, plan, user, openAuthModal } = usePro();
  const { shouldRender, backdropClass, modalClass } = useModalAnimation(isActivationModalOpen);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!shouldRender) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const result = await activatePro(code);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        closeActivationModal();
      }, 1600);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeActivationModal(); }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs ${backdropClass}`}
    >
      <div className={`relative w-full max-w-md bg-white dark:bg-[#111625] rounded-lg border border-slate-200 dark:border-[#2C3744] shadow-lg p-6 sm:p-7 text-slate-900 dark:text-slate-100 space-y-5 ${modalClass}`}>

        
        {/* Close Button */}
        <button
          type="button"
          onClick={closeActivationModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* If already PRO, show membership status */}
        {isPro ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 bg-brand-100 dark:bg-brand-950/80 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 mx-auto shadow-inner">
              
            </div>

            <div className="space-y-1">
              <span className="text-[13px] font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400 font-bold">
                MEMBRESÍA ACTIVA
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                CalculaPerú PRO
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                Titular: <strong>{subscriberName}</strong> · Plan {plan === 'yearly' ? 'Anual' : 'Mensual'}
              </p>
            </div>

            <div className="p-3.5 rounded bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/80 text-[13px] text-brand-800 dark:text-brand-300 flex items-center gap-2.5 text-left">
              <ShieldCheck className="w-5 h-5 shrink-0 text-brand-600" />
              <span>Tienes acceso ilimitado a todas las descargas oficiales, boletas con logo y cero publicidad.</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={closeActivationModal}
                className="flex-1 py-2.5 rounded bg-brand-600 hover:bg-brand-800 text-white font-bold text-[13px] transition-colors"
              >
                Continuar usando PRO
              </button>
            </div>
          </div>
        ) : !user ? (
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-bold">Activa tu código PRO en tu cuenta</h3>
            <p className="text-[15px] text-slate-600 dark:text-slate-300">Inicia sesión o crea una cuenta gratuita para conservar tu acceso en cualquier dispositivo.</p>
            <button type="button" onClick={() => { closeActivationModal(); openAuthModal('login'); }} className="w-full rounded bg-brand-600 px-4 py-3 text-[15px] font-bold text-white hover:bg-brand-800">Iniciar sesión</button>
          </div>
        ) : (
          /* Normal code input form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Activar CalculaPerú PRO
                </h3>
                <p className="text-[13px] text-slate-500">
                  Ingresa tu código de licencia o suscripción
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                Código de Activación
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ingresa tu código"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full uppercase font-mono font-bold tracking-wider bg-slate-50 dark:bg-[#18202A] border border-slate-300 dark:border-slate-700 rounded px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 text-[15px]"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-[13px] font-medium animate-in fade-in">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 rounded text-brand-700 dark:text-brand-300 text-[13px] font-medium flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-brand-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="w-full py-3.5 rounded bg-brand-600 hover:bg-brand-800 disabled:opacity-60 text-white font-bold text-[13px] sm:text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando código...</span>
                </>
              ) : successMsg ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Activado con Éxito!</span>
                </>
              ) : (
                <>
                  
                  <span>Validar y Activar Cuenta PRO</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
