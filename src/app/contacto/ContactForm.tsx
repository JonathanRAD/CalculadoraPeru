'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, CheckCircle2, AlertCircle, Loader2, MessageSquare } from 'lucide-react';

const CATEGORIES = [
  { value: 'consulta_general', label: 'Consulta general' },
  { value: 'calculadora', label: 'Ayuda con una calculadora' },
  { value: 'cotizador', label: 'Acceso o consulta sobre el Cotizador' },
  { value: 'cuenta_pro', label: 'Cuenta o suscripción PRO' },
  { value: 'error_report', label: 'Reportar un error o tasa' },
  { value: 'mejora', label: 'Sugerir una mejora o nueva función' },
  { value: 'privacidad', label: 'Privacidad o eliminación de mis datos' },
  { value: 'alianza', label: 'Colaboración o alianzas' },
  { value: 'otro', label: 'Otro asunto' },
];

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

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('consulta_general');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Campo anti-bot invisible
  const [idempotencyKey, setIdempotencyKey] = useState(generateClientUuid);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [responseInfo, setResponseInfo] = useState<{ message?: string; requestId?: string; warning?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!consent) {
      setErrorMessage('Debes aceptar la Política de Privacidad para enviar tu consulta.');
      setStatus('error');
      return;
    }

    if (message.trim().length < 20) {
      setErrorMessage('Por favor ingresa al menos 20 caracteres detallando tu consulta.');
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone.trim() ? phone : undefined,
          category,
          message,
          sourcePath: typeof window !== 'undefined' ? window.location.pathname : '/contacto',
          consent: true,
          honeypot,
          idempotencyKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo procesar tu mensaje. Puedes intentar nuevamente.');
      }

      setStatus('success');
      setResponseInfo({ message: data.message, requestId: data.requestId, warning: data.warning });
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setConsent(false);
      setIdempotencyKey(generateClientUuid());
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Ocurrió un error inesperado al enviar el mensaje.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-8 text-center space-y-4 animate-in fade-in duration-300">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-[#00875A] dark:text-[#00C853] mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Consulta recibida correctamente
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          {responseInfo.message || 'Recibimos tu consulta. Si requiere respuesta, podremos contactarte mediante el correo proporcionado.'}
        </p>
        {responseInfo.warning && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl text-xs text-amber-800 dark:text-amber-200 text-left max-w-md mx-auto flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>{responseInfo.warning}</span>
          </div>
        )}
        {responseInfo.requestId && (
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 inline-block">
            Código de seguimiento: <span className="font-bold text-[#00875A] dark:text-[#00C853]">{responseInfo.requestId}</span>
          </p>
        )}
        <div>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-2 text-xs font-bold text-[#00875A] dark:text-[#00C853] hover:underline cursor-pointer"
          >
            Enviar otra consulta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-[#00875A]" />
        <span>Envíanos un mensaje o consulta</span>
      </h2>

      {status === 'error' && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Campo Honeypot para neutralizar bots */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website_hp">No llenar si eres humano</label>
          <input
            id="website_hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Nombre completo o de tu empresa <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. María Sánchez - Negocio MYPE"
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#00875A] transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#00875A] transition-colors"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Teléfono o WhatsApp <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="tel"
              maxLength={15}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 987654321"
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#00875A] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Categoría de tu consulta <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#00875A] transition-colors cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              ¿Qué necesitas o cuál es tu consulta? <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-[11px] ${
                message.length < 20
                  ? 'text-amber-600 dark:text-amber-400'
                  : message.length > 1900
                  ? 'text-red-500'
                  : 'text-slate-400'
              }`}
            >
              {message.length} / 2000 car. (mínimo 20)
            </span>
          </div>
          <textarea
            rows={5}
            required
            minLength={20}
            maxLength={2000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Explica aquí tu consulta, duda sobre cálculos, función que te gustaría ver en el cotizador o reporte técnico..."
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#00875A] transition-colors resize-y"
          />
        </div>

        {/* Consentimiento expreso no marcado por defecto */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-[#00875A] focus:ring-[#00875A]"
            />
            <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              He leído y acepto la{' '}
              <Link href="/politica-de-privacidad" target="_blank" className="text-[#00875A] dark:text-[#00C853] underline font-medium">
                Política de Privacidad
              </Link>
              . Acepto que CalculaPerú use los datos ingresados exclusivamente para responder y atender mi consulta.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !consent || message.trim().length < 20}
          className="w-full py-3 rounded-xl bg-[#00875A] hover:bg-[#00704A] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Enviando mensaje...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Enviar consulta a CalculaPerú</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-slate-400 leading-relaxed">
          Tus datos se procesan de forma confidencial. No realizamos llamadas no solicitadas ni compartimos tu correo con terceros comerciales.
        </p>
      </form>
    </div>
  );
}
