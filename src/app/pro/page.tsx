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
  ChevronDown,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ReceiptPrinter from '@/features/premium/components/ReceiptPrinter';
import { usePro } from '@/features/premium/context/ProContext';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    q: '¿Cómo se activa mi cuenta PRO tras realizar el pago por Yape o Plin?',
    a: 'Al enviar tu solicitud con tu número o código de operación de Yape/Plin, nuestro equipo valida el abono en minutos y te enviamos tu código de activación por WhatsApp o correo. Si ya tienes cuenta registrada en CalculaPerú, podemos activarla directamente a tu correo.',
  },
  {
    q: '¿Puedo usar mi cuenta PRO en varias computadoras o en mi celular?',
    a: '¡Sí, totalmente! A diferencia de otros sistemas que te atan a una sola máquina, tu membresía está vinculada a tu cuenta de usuario (correo y contraseña). Puedes iniciar sesión desde tu laptop de casa, la computadora de tu oficina o tu teléfono móvil y disfrutar de todas las funciones PRO sin pagar de más.',
  },
  {
    q: '¿Las boletas de pago y liquidaciones tienen validez legal ante SUNAFIL?',
    a: 'Sí, 100%. Todos los cálculos y documentos se generan en estricto cumplimiento del D.S. N° 001-98-TR (norma de boletas de pago), D.S. N° 009-2011-TR (validez de boletas electrónicas), el D.L. 728 y la Ley N° 27735, incluyendo recuadros formales para firma, huella digital y códigos PLAME de SUNAT.',
  },
  {
    q: '¿Quedan guardados el logotipo y la Razón Social de mi empresa?',
    a: 'Sí. Al tener cuenta PRO, puedes guardar tus datos corporativos (Razón Social, RUC, Dirección y Logotipo) en tu perfil. Al generar boletas de pago o informes en cualquier momento, el sistema los carga automáticamente para que no tengas que escribirlos cada vez.',
  },
  {
    q: '¿Existe algún contrato de permanencia forzosa?',
    a: 'Ninguno. No hay permanencia obligatoria ni renovaciones automáticas sorpresivas. Tú decides si deseas renovar al vencer tu periodo (mensual o anual) sin ninguna penalidad.',
  },
];

export default function ProSubscriptionPage() {
  const { isPro, subscriberName: proUserName, openActivationModal, openAuthModal, user } = usePro();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
      alert('Cupón no válido o expirado.');
    }
  };

  const handleConfirmSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subscriberName,
          email: subscriberEmail,
          motive: 'alianza',
          message: `SOLICITUD DE SUSCRIPCIÓN PRO:\nPlan: ${selectedPlan === 'yearly' ? 'ANUAL (S/ 199)' : 'MENSUAL (S/ 29)'}\nCelular: ${subscriberPhone}\nCódigo Op: ${operationCode || 'CUPÓN'}\nCupón: ${isCouponApplied ? couponCode : 'Ninguno'}\nUsuario registrado: ${user ? `${user.email} (ID: ${user.id})` : 'No registrado aún'}`,
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 transition-colors selection:bg-emerald-500 selection:text-white">
      <div className="mx-auto max-w-6xl space-y-16">
        
        {/* ========================================================================= */}
        {/* HERO SECTION: TEXT + INTERACTIVE PRINTER (ORIGINAL SIDE-BY-SIDE LAYOUT) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left pt-2">
          
          {/* Left Column: Value Proposition & Switchers */}
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
              <span className={`text-xs font-bold transition-colors ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                Mensual
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-14 h-7 bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
                aria-label="Alternar facturación mensual y anual"
              >
                <div
                  className={`w-5 h-5 bg-[#00875A] rounded-full transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold transition-colors ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                  Anual
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#00875A] dark:text-[#00C853] text-[10px] font-black tracking-wider">
                  AHORRA 40% (S/ 149)
                </span>
              </div>
            </div>

            {/* Activation & Account Shortcuts */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs">
              {isPro ? (
                <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
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
                <>
                  <button
                    type="button"
                    onClick={openActivationModal}
                    className="inline-flex items-center gap-1.5 text-xs text-[#00875A] dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>¿Ya realizaste tu pago o tienes un código? Activar aquí</span>
                  </button>
                  {!user && (
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    >
                      • Iniciar sesión
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column: Original Interactive POS Thermal Receipt Printer */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <ReceiptPrinter
              initialPlan={billingCycle}
              key={billingCycle}
              onCheckoutClick={(chosenPlan) => handleOpenCheckout(chosenPlan)}
            />
          </div>

        </div>

        {/* ========================================================================= */}
        {/* PRICING CARDS (FREE VS PRO) */}
        {/* ========================================================================= */}
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
                  <span className="w-4 text-center font-bold text-red-400">✕</span>
                  <span>Sin personalización de logo ni membrete</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <span className="w-4 text-center font-bold text-red-400">✕</span>
                  <span>Sin exportación de archivos estructurados para SUNAT</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <span className="w-4 text-center font-bold text-red-400">✕</span>
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

        {/* ========================================================================= */}
        {/* INTERACTIVE COMPARISON TABLE (GRATUITO VS PRO) */}
        {/* ========================================================================= */}
        <div className="space-y-6 pt-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Comparativa Detallada: Gratuito vs PRO
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Conoce con total transparencia las diferencias entre ambos planes
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden max-w-4xl mx-auto text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 font-bold w-1/2 text-sm">Funcionalidad</th>
                    <th className="p-4 font-bold text-center w-1/4 text-slate-500">Plan Gratuito</th>
                    <th className="p-4 font-bold text-center w-1/4 text-[#00875A] dark:text-[#00C853] bg-emerald-50/50 dark:bg-emerald-950/30">
                      CalculaPerú PRO
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  
                  {/* Category 1 */}
                  <tr className="bg-slate-50/70 dark:bg-slate-950/40 font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                    <td colSpan={3} className="p-3 pl-4">1. Documentos y Planillas</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 pl-4 font-medium">Boletas de Pago para Trabajadores (PDF)</td>
                    <td className="p-3.5 text-center text-slate-400">Con Marca de Agua</td>
                    <td className="p-3.5 text-center font-bold text-[#00875A] dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                      ✓ Ilimitadas sin marca
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 pl-4 font-medium">Membrete con RUC y Logotipo Corporativo</td>
                    <td className="p-3.5 text-center text-red-500 font-bold">✕</td>
                    <td className="p-3.5 text-center font-bold text-[#00875A] dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                      ✓ Tu Logo e Imagen
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 pl-4 font-medium">Formato Legal SUNAFIL (D.S. N° 001-98-TR) con Firmas y Huella</td>
                    <td className="p-3.5 text-center text-slate-400">Parcial</td>
                    <td className="p-3.5 text-center font-bold text-[#00875A] dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                      ✓ 100% Certificado
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 pl-4 font-medium">Liquidaciones Laborales Oficiales D.L. 728</td>
                    <td className="p-3.5 text-center text-slate-500">S/ 9.90 por informe</td>
                    <td className="p-3.5 text-center font-bold text-[#00875A] dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                      ✓ S/ 0.00 Ilimitadas
                    </td>
                  </tr>

                  {/* Category 2 */}
                  <tr className="bg-slate-50/70 dark:bg-slate-950/40 font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                    <td colSpan={3} className="p-3 pl-4">2. Herramientas Comerciales y Acceso</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 pl-4 font-medium">Cotizador Comercial de Presupuestos para Clientes</td>
                    <td className="p-3.5 text-center text-slate-400">Básico</td>
                    <td className="p-3.5 text-center font-bold text-[#00875A] dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                      ✓ Membretado formal
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 pl-4 font-medium">Exportación a Excel (.CSV) estructurado para SUNAT / PLAME</td>
                    <td className="p-3.5 text-center text-red-500 font-bold">✕</td>
                    <td className="p-3.5 text-center font-bold text-[#00875A] dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                      ✓ Sí, en 1 clic
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 pl-4 font-medium">Acceso en Múltiples Computadoras (Oficina, Casa y Móvil)</td>
                    <td className="p-3.5 text-center text-slate-400">Solo navegador local</td>
                    <td className="p-3.5 text-center font-bold text-[#00875A] dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                      ✓ Cuenta en la Nube
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 pl-4 font-medium">Experiencia Sin Anuncios Publicitarios</td>
                    <td className="p-3.5 text-center text-red-500 font-bold">✕ Con anuncios</td>
                    <td className="p-3.5 text-center font-bold text-[#00875A] dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                      ✓ 100% Libre de ads
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FEATURE HIGHLIGHTS GRID */}
        {/* ========================================================================= */}
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

        {/* ========================================================================= */}
        {/* INTERACTIVE ACCORDION FAQS */}
        {/* ========================================================================= */}
        <div className="max-w-3xl mx-auto space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Preguntas Frecuentes sobre CalculaPerú PRO
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Respuestas claras para tomar la mejor decisión para tu negocio
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_LIST.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-emerald-500' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* CHECKOUT MODAL (YAPE / PLIN DIRECT PAYMENT) */}
      {/* ========================================================================= */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-xs max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#00875A] dark:text-[#00C853]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Activar Suscripción CalculaPerú PRO
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pago 100% seguro mediante Yape o Plin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isSuccess ? (
              <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto text-[#00875A] dark:text-[#00C853]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  ¡Solicitud Recibida con Éxito!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Hemos registrado tu pago de <strong>{selectedPlan === 'yearly' ? 'S/ 199 (Plan Anual)' : 'S/ 29 (Plan Mensual)'}</strong>. Validaremos la operación en unos momentos y recibirás tu código de activación por WhatsApp y correo.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="py-2.5 px-6 rounded-xl bg-[#00875A] text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Entendido, cerrar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Plan Summary Pill */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block tracking-wider">
                      PLAN SELECCIONADO:
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {selectedPlan === 'yearly' ? 'CalculaPerú PRO Anual (365 días)' : 'CalculaPerú PRO Mensual (30 días)'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-[#00875A] dark:text-[#00C853]">
                      {isCouponApplied ? 'S/ 0.00' : selectedPlan === 'yearly' ? 'S/ 199.00' : 'S/ 29.00'}
                    </span>
                    {isCouponApplied && (
                      <span className="text-[10px] text-emerald-600 block font-bold">100% CORTESÍA</span>
                    )}
                  </div>
                </div>

                {/* Yape / Plin instructions */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-purple-600" />
                      <span>Número para Yapear o Plinear:</span>
                    </span>
                    <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-md">
                      YAPE / PLIN
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-base font-black font-mono text-slate-900 dark:text-white tracking-wider block">
                        {yapeNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Titular: {yapeHolder}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedPhone ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Submission Form */}
                <form onSubmit={handleConfirmSubscription} className="space-y-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                      Tu Nombre Completo o Razón Social *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Carlos Pérez / Estudio Contable"
                      value={subscriberName}
                      onChange={(e) => setSubscriberName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        Tu Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="tu@correo.com"
                        value={subscriberEmail}
                        onChange={(e) => setSubscriberEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        Celular / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 987 654 321"
                        value={subscriberPhone}
                        onChange={(e) => setSubscriberPhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                      Código de Operación Yape/Plin (o número de referencia)
                    </label>
                    <input
                      type="text"
                      required={!isCouponApplied}
                      placeholder="Ej. Op. 4819203"
                      value={operationCode}
                      onChange={(e) => setOperationCode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Enviando confirmación...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirmar y Activar CalculaPerú PRO</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Coupon option */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="¿Tienes un cupón promocional?"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none uppercase font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
