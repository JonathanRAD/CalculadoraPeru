'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, ArrowRight, ShieldCheck, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { usePro } from '@/features/premium/context/ProContext';
import { useModalAnimation } from '@/shared/hooks/useModalAnimation';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login, register } = usePro();
  const { shouldRender, backdropClass, modalClass } = useModalAnimation(isAuthModalOpen);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!shouldRender) return null;


  const isLogin = authModalTab === 'login';

  // Password Security Criteria
  const isLengthValid = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatch = !isLogin ? password === confirmPassword && confirmPassword.length > 0 : true;
  const isPasswordSecure = isLengthValid && hasUpper && hasLower && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isLogin) {
      if (!isPasswordSecure) {
        setErrorMessage('La contraseña debe cumplir con todos los requisitos de seguridad (8+ caracteres, mayúscula, minúscula y número).');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            closeAuthModal();
          }, 600);
        } else {
          setErrorMessage(res.message);
        }
      } else {
        const res = await register(name, email, password);
        if (res.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            closeAuthModal();
          }, 600);
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch {
      setErrorMessage('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeAuthModal(); }}

      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs ${backdropClass}`}
    >
      <div className={`relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 text-xs max-h-[92vh] overflow-y-auto ${modalClass}`}>

        
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00875A] to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta Gratis'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Accede a tus beneficios PRO desde cualquier dispositivo
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setErrorMessage('');
              openAuthModal('login');
            }}
            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              isLogin
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMessage('');
              openAuthModal('register');
            }}
            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              !isLogin
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* PRO benefit reminder */}
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500" />
          <span>
            {isLogin
              ? 'Inicia sesión para sincronizar tus boletas con membrete y suscripción.'
              : 'Crea tu cuenta para solicitar y vincular tu suscripción PRO con seguridad.'}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Nombre o Razón Social *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez / Estudio Contable"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
              />
            </div>
          </div>

          {/* Password Field with Eye Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-600 dark:text-slate-400 font-semibold">
                Contraseña *
              </label>
              {!isLogin && (
                <span className="text-[10px] text-slate-400">Mín. 8 caracteres</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={isLogin ? 6 : 8}
                placeholder={isLogin ? '••••••••' : 'Crea una contraseña segura'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-10 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Registration Password Requirements Checklist */}
          {!isLogin && password.length > 0 && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Requisitos de seguridad:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${isLengthValid ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${isLengthValid ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    {isLengthValid ? '✓' : '•'}
                  </span>
                  <span>8+ caracteres</span>
                </div>

                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasUpper ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    {hasUpper ? '✓' : '•'}
                  </span>
                  <span>Una mayúscula (A-Z)</span>
                </div>

                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasLower ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    {hasLower ? '✓' : '•'}
                  </span>
                  <span>Una minúscula (a-z)</span>
                </div>

                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasNumber ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    {hasNumber ? '✓' : '•'}
                  </span>
                  <span>Al menos un número</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password (Registration Only) */}
          {!isLogin && (
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Reingresa tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl pl-9 pr-10 py-2 text-slate-900 dark:text-white outline-none transition-colors ${
                    confirmPassword.length > 0
                      ? isMatch
                        ? 'border-emerald-500 focus:border-emerald-500'
                        : 'border-red-400 focus:border-red-500'
                      : 'border-slate-300 dark:border-slate-700 focus:border-[#00875A]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  title={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !isMatch && (
                <p className="text-[10px] text-red-500 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (!isLogin && (!isPasswordSecure || !isMatch))}
            className="w-full py-3 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Procesando...</span>
            ) : (
              <>
                <span>{isLogin ? 'Entrar a mi Cuenta' : 'Registrarme y Continuar'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="text-center pt-2 text-slate-500 border-t border-slate-100 dark:border-slate-800">
          {isLogin ? (
            <span>
              ¿Aún no tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  openAuthModal('register');
                }}
                className="font-bold text-[#00875A] dark:text-[#00C853] hover:underline"
              >
                Regístrate gratis
              </button>
            </span>
          ) : (
            <span>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  openAuthModal('login');
                }}
                className="font-bold text-[#00875A] dark:text-[#00C853] hover:underline"
              >
                Inicia sesión
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
