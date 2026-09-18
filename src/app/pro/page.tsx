'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Check,
  ShieldCheck,
  FileText,
  Building2,
  Receipt,
  DownloadCloud,
  Zap,
  Clock,
  HelpCircle,
  Copy,
  Tag,
  ArrowRight,
  UserCheck,
  FileSpreadsheet,
  KeyRound,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ReceiptPrinter from '@/features/premium/components/ReceiptPrinter';
import { usePro } from '@/features/premium/context/ProContext';

export default function ProSubscriptionPage() {
  const { isPro, subscriberName: proUserName, openActivationModal, logoutPro } = usePro();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Checkout form
  const [subscriberName, setSubscriberName] = useState('');
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscriberPhone, setSubscriberPhone] = useState('');
  const [operationCode, setOperationCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const yapeNumber = '913 544 715';
  const yapeHolder = 'Jonathan Rujel';

  const monthlyPrice = 29;
  const yearlyPrice = 199; // equiv to ~16.50/mo

  const handleOpenCheckout = (cycle: 'monthly' | 'yearly') => {
    setSelectedPlan(cycle);
    setIsCheckoutOpen(true);
    setIsSuccess(false);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('913544715');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'PROMO' || clean === 'CALCULA100' || clean === 'VIP') {
      setIsCouponApplied(true);
    } else {
      alert('Cupón no válido.');
    }
  };

  const handleConfirmSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send notification via /api/contacto
      await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subscriberName,
          email: subscriberEmail,
          motive: 'alianza',
          message: `NUEVA SUSCRIPCIÓN PRO SOLICITADA:\nPlan: ${selectedPlan === 'yearly' ? 'ANUAL (S/ 199)' : 'MENSUAL (S/ 29)'}\nCelular: ${subscriberPhone}\nCódigo Op Yape: ${operationCode || 'CUPÓN PROMO'}\nCupón: ${isCouponApplied ? couponCode : 'Ninguno'}`,
        }),
      });

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('Error al suscribir:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 transition-colors">
      <div className="mx-auto max-w-6xl space-y-16">
        
          {/* Hero Content & Interactive Receipt Printer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left pt-2">
            
            {/* Left Column: Value Proposition & Toggles */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-1.5 text-xs font-bold text-[#00875A] dark:text-[#00C853] shadow-xs">
                <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>LA SUITE DEFINITIVA PARA MYPES Y PROFESIONALES DEL PERÚ</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.1]">
                Automatiza tus planillas, cotizaciones y finanzas con{' '}
                <span className="bg-gradient-to-r from-[#00875A] via-emerald-500 to-teal-400 bg-clip-text text-transparent">
                  CalculaPerú PRO
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Emite liquidaciones oficiales con formato SUNAFIL, boletas de pago para tus trabajadores con tu propio logo, cotizaciones comerciales y exportaciones a Excel para SUNAT. Todo en un solo plan ilimitado.
              </p>

              {/* Quick Feature Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                  ⚖️ Formato Ley D.L. 728
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                  🏢 Tu RUC y Logo
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                  ⚡ 0% Publicidad
                </span>
              </div>

              {/* Billing Switcher */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-3">
                <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                  Mensual
                </span>
                <button
                  type="button"
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative w-14 h-7 bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  <div
                    className={`w-5 h-5 bg-[#00875A] rounded-full transition-transform ${
                      billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                    Anual
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#00875A] dark:text-[#00C853] text-[10px] font-black tracking-wider">
                    AHORRA 40%
                  </span>
                </div>
              </div>

              {/* Activation Trigger Link */}
              <div className="pt-2 flex justify-center lg:justify-start">
                {isPro ? (
                  <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Tu cuenta PRO está activa ({proUserName || 'VIP'}).</span>
                    <button
                      type="button"
                      onClick={openActivationModal}
                      className="font-bold underline text-emerald-950 dark:text-white ml-1 cursor-pointer"
                    >
                      Ver estado / Salir
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openActivationModal}
                    className="inline-flex items-center gap-1.5 text-xs text-[#00875A] dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>¿Ya realizaste tu pago o tienes un código? Activar aquí</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Interactive POS Thermal Receipt Printer Component */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <ReceiptPrinter
                initialPlan={billingCycle}
                key={billingCycle}
                onCheckoutClick={(chosenPlan) => handleOpenCheckout(chosenPlan)}
              />
            </div>

          </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* Free Plan Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Plan Gratuito</h3>
                  <p className="text-xs text-slate-500 mt-1">Para consultas ocasionales y cálculos rápidos</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Estándar
                </span>
              </div>

              <div className="pt-2">
                <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">S/ 0</span>
                <span className="text-xs text-slate-500 ml-1">/ para siempre</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Acceso libre a las 25 calculadoras web</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cálculos y simulaciones inmediatas en pantalla</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <span className="w-4 text-center font-bold">✕</span>
                  <span>Sin personalización de logo ni membrete</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <span className="w-4 text-center font-bold">✕</span>
                  <span>Sin exportación de archivos estructurados para SUNAT</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <span className="w-4 text-center font-bold">✕</span>
                  <span>Con anuncios publicitarios en pantalla</span>
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs text-center text-slate-800 dark:text-slate-200 transition-colors"
            >
              Continuar con Plan Gratuito
            </Link>
          </div>

          {/* PRO Plan Card (Featured) */}
          <div className="relative rounded-3xl border-2 border-emerald-500 bg-white dark:bg-slate-900 p-8 shadow-xl shadow-emerald-950/10 flex flex-col justify-between space-y-6">
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#00875A] to-teal-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              MÁS RECOMENDADO POR MYPES
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>CalculaPerú PRO</span>
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Suite ilimitada para negocios, contadores y profesionales</p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black font-mono text-[#00875A] dark:text-[#00C853]">
                    {billingCycle === 'yearly' ? 'S/ 199' : 'S/ 29'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {billingCycle === 'yearly' ? '/ año (S/ 16.50/mes)' : '/ mes'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                    🎉 Pago único anual. Ahorras S/ 149 al año.
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200 font-medium">
                  <Check className="w-4 h-4 text-[#00875A] shrink-0 mt-0.5 font-bold" />
                  <span><strong>Liquidaciones Oficiales Ilimitadas:</strong> Formato formal certificado conforme a SUNAFIL y D.L. 728.</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200 font-medium">
                  <Check className="w-4 h-4 text-[#00875A] shrink-0 mt-0.5 font-bold" />
                  <span><strong>Boletas de Pago para tus Trabajadores:</strong> Con tu Logo, RUC y detalle de aportes de ley.</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200 font-medium">
                  <Check className="w-4 h-4 text-[#00875A] shrink-0 mt-0.5 font-bold" />
                  <span><strong>Cotizador Comercial Profesional:</strong> Emite presupuestos membretados para enviar a tus clientes.</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200 font-medium">
                  <Check className="w-4 h-4 text-[#00875A] shrink-0 mt-0.5 font-bold" />
                  <span><strong>Exportación a Excel / SUNAT:</strong> Tablas estructuradas para importar al PDT PLAME sin errores.</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200 font-medium">
                  <Check className="w-4 h-4 text-[#00875A] shrink-0 mt-0.5 font-bold" />
                  <span><strong>100% Sin Publicidad:</strong> Experiencia ultrarrápida sin anuncios en ninguna herramienta.</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200 font-medium">
                  <Check className="w-4 h-4 text-[#00875A] shrink-0 mt-0.5 font-bold" />
                  <span><strong>Soporte Prioritario por WhatsApp:</strong> Asistencia directa ante cualquier consulta operativa.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenCheckout(billingCycle)}
              className="w-full py-3.5 rounded-xl bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/15 hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Suscribirme a CalculaPerú PRO con Yape / Plin</span>
            </button>
          </div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-8 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Todo lo que necesitas para tu negocio en un solo lugar
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Ahorra miles de soles en softwares corporativos costosos y multas de SUNAFIL
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#00875A] dark:text-[#00C853]">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Documentos Legales Certificados</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Liquidaciones laborales bajo el D.L. 728, boletas de pago y certificados de cese con cláusulas de 48 horas de ley para evitar multas de SUNAFIL.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Cotizador y Presupuestos PRO</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Arma propuestas comerciales para tus clientes en 2 minutos con cálculo automático de IGV, detalle de ítems y descarga formal para WhatsApp.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Tu Marca y Logo en Todo</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Personaliza cada archivo con la Razón Social y Logo de tu negocio. Envía documentos con apariencia de empresa formal y consolidada.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Compatibilidad con SUNAT</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Exporta la estructura de sueldos y aportes lista para importar al PDT PLAME mensual, reduciendo horas de trabajo contable manual.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Experiencia Limpia Sin Anuncios</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cero publicidad de AdSense en tus pantallas para que tú y tu equipo trabajen con máxima concentración, fluidez y velocidad.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Soporte WhatsApp Dedicado</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Acceso prioritario a nuestro canal de soporte para ayudarte a configurar tus formatos y absolver dudas sobre el uso de la plataforma.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="max-w-3xl mx-auto space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-900 dark:text-white">
            Preguntas Frecuentes sobre CalculaPerú PRO
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">¿Cómo se activa mi suscripción tras pagar con Yape o Plin?</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Al enviar tu solicitud con tu número o comprobante de Yape, nuestro sistema valida la operación y activa tu cuenta de inmediato. También te enviamos un correo de confirmación con tu clave de acceso PRO.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">¿Los documentos en PDF tienen validez legal en Perú?</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Sí. Todos los cálculos y modelos de Liquidación de Beneficios Sociales y Boletas de Pago están estructurados bajo las leyes laborales vigentes (D.L. 728, D.S. 001-97-TR, Ley 27735 y normas de SUNAFIL).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">¿Puedo cancelar mi suscripción cuando quiera?</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Totalmente. No hay contratos de permanencia obligatoria ni letras chicas. Si contratas el plan mensual, puedes cancelarlo en cualquier momento sin penalidad alguna.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-xs max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#00875A] dark:text-[#00C853]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Activar CalculaPerú PRO
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Plan {selectedPlan === 'yearly' ? 'Anual (S/ 199/año)' : 'Mensual (S/ 29/mes)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {isSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  ¡Solicitud PRO Recibida con Éxito!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Muchas gracias, <strong>{subscriberName}</strong>. Hemos registrado tu pago. En breve recibirás la confirmación de activación en tu correo <strong>{subscriberEmail}</strong> y WhatsApp.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#00875A] text-white font-bold"
                >
                  Entendido, volver al portal
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmSubscription} className="space-y-4">
                
                {/* Yape Payment Box */}
                {!isCouponApplied && (
                  <div className="p-4 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                          Y
                        </div>
                        <div>
                          <span className="font-black text-slate-900 dark:text-white text-xs block">
                            Yape / Plin: S/ {selectedPlan === 'yearly' ? yearlyPrice : monthlyPrice}.00
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Titular: <strong>{yapeHolder}</strong>
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 font-bold text-[10px]">
                        0% comisión
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800">
                      <div className="font-mono text-xs font-bold text-purple-900 dark:text-purple-300">
                        📱 {yapeNumber}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyPhone}
                        className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold text-[10px] flex items-center gap-1 hover:bg-purple-200 transition-colors"
                      >
                        {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPhone ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Input details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Tu nombre completo o de tu empresa
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez - Empresa MYPE"
                      value={subscriberName}
                      onChange={(e) => setSubscriberName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Correo de activación
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="tu@correo.com"
                        value={subscriberEmail}
                        onChange={(e) => setSubscriberEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Número de WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 912345678"
                        value={subscriberPhone}
                        onChange={(e) => setSubscriberPhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                      />
                    </div>
                  </div>

                  {!isCouponApplied && (
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Número o Código de Operación de Yape
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Op: 748192 o captura"
                        value={operationCode}
                        onChange={(e) => setOperationCode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-600"
                      />
                    </div>
                  )}
                </div>

                {/* Coupon */}
                {!isCouponApplied && (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="¿Tienes cupón de cortesía? (PROMO)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 text-xs"
                    >
                      Aplicar
                    </button>
                  </div>
                )}

                {isCouponApplied && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                    🎉 ¡Cupón aplicado! Activación sin costo por cortesía promocional.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#00875A] hover:bg-[#00704A] disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/20"
                >
                  {isSubmitting ? (
                    <span>Registrando suscripción...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Confirmar y Activar CalculaPerú PRO</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
