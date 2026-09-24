'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquarePlus,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
} from 'lucide-react';

interface QuoteBetaSectionProps {
  variant?: 'banner' | 'card' | 'bottom';
}

function generateClientUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const QuoteBetaSection: React.FC<QuoteBetaSectionProps> = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [featureNeeded, setFeatureNeeded] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(generateClientUuid);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    if (!consent) {
      setStatus('error');
      setStatusMessage('Debes aceptar la Política de Privacidad para continuar.');
      return;
    }

    setStatus('loading');
    setStatusMessage(null);
    setWarningMessage(null);

    try {
      const res = await fetch('/api/cotizador/beta-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim() || undefined,
          businessType: businessType.trim() || undefined,
          featureNeeded: featureNeeded.trim() || undefined,
          consent: true,
          honeypot,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setStatusMessage(data.message);
        setWarningMessage(data.warning || null);
        setEmail('');
        setPhone('');
        setBusinessType('');
        setFeatureNeeded('');
        setConsent(false);
        setIdempotencyKey(generateClientUuid());
      } else {
        setStatus('error');
        setStatusMessage(data.message || data.error || 'Hubo un error al procesar tu solicitud. Puedes intentar nuevamente.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Error de conexión. Inténtalo nuevamente.');
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-slate-900 dark:bg-[#070D1F] border-t border-slate-800 text-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 px-3.5 py-1 text-xs font-bold text-[#00C853] border border-emerald-800">
          <MessageSquarePlus className="h-3.5 w-3.5" />
          <span>SUGERENCIAS Y MEJORAS COMERCIALES</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          ¿Qué función necesitas en el Cotizador Comercial?
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Cuéntanos qué herramientas, integraciones o formatos de cotización te ayudarían a vender más en tu negocio peruano. Las evaluaremos para incorporarlas en las próximas actualizaciones.
        </p>

        <div className="max-w-md mx-auto text-left">
          {status === 'success' ? (
            <div className="rounded-2xl bg-emerald-950/80 border border-emerald-700 p-6 space-y-3 animate-in fade-in shadow-xl">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-[#00C853]" />
                <span>¡Sugerencia recibida con éxito!</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {statusMessage || 'Muchas gracias por tus comentarios. Hemos registrado tu aporte para el desarrollo de nuevas funciones.'}
              </p>
              {warningMessage && (
                <div className="p-3 bg-amber-950/60 border border-amber-700 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>{warningMessage}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-2 text-xs font-bold text-[#00C853] hover:underline cursor-pointer"
              >
                Enviar otra sugerencia
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/80 dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-700 shadow-xl">
              {/* Honeypot */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="feature_hp">No llenar</label>
                <input
                  id="feature_hp"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {status === 'error' && (
                <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl flex items-start gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Tu correo electrónico <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@tunegocio.pe"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00C853] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    WhatsApp o Teléfono <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={15}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="987654321"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00C853] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Rubro de tu negocio <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="Ej. Servicios, Textil, Consultoría"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00C853] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  ¿Qué función o plantilla necesitas? <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={featureNeeded}
                  onChange={(e) => setFeatureNeeded(e.target.value)}
                  placeholder="Ej: Enviar proformas con foto del producto, cotizar en dólares USD, o exportar a notas de venta..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00C853] transition-colors resize-y"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-[#00C853] focus:ring-[#00C853]"
                  />
                  <span className="text-[11px] text-slate-400 leading-normal">
                    Acepto la{' '}
                    <Link href="/politica-de-privacidad" target="_blank" className="text-[#00C853] underline font-medium">
                      Política de Privacidad
                    </Link>
                    . Autorizo a CalculaPerú a contactarme exclusivamente respecto a novedades y mejoras de esta herramienta.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || !consent}
                className="w-full py-3 rounded-xl bg-[#00875A] hover:bg-[#00704A] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enviando sugerencia...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Enviar comentarios al equipo</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
