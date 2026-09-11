'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, MessageSquare } from 'lucide-react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [motive, setMotive] = useState('sugerencia');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, motive, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo enviar el mensaje.');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Ocurrió un error inesperado al enviar el mensaje.');
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
          ¡Mensaje enviado con éxito!
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          Muchas gracias por escribirnos. Hemos recibido tu consulta y nuestro equipo te responderá directamente a tu correo en un plazo máximo de 24 a 48 horas hábiles.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-2 text-xs font-bold text-[#00875A] dark:text-[#00C853] hover:underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-[#00875A]" />
        <span>Envíanos un mensaje</span>
      </h2>

      {status === 'error' && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Tu nombre completo o de tu empresa
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Juan Pérez - Empresa MYPE"
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#00875A] transition-colors"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Tu correo electrónico de contacto
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@ejemplo.com"
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#00875A] transition-colors"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            A este correo te responderemos directamente.
          </span>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Motivo de tu consulta
          </label>
          <select
            value={motive}
            onChange={(e) => setMotive(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#00875A] transition-colors"
          >
            <option value="sugerencia">Sugerir una nueva calculadora</option>
            <option value="correccion">Reportar una observación o tasa desactualizada</option>
            <option value="alianza">Consulta editorial o comercial</option>
            <option value="otro">Otra consulta</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Detalle de tu mensaje
          </label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe con detalle tu consulta, duda o la herramienta que te gustaría que incorporemos en CalculaPerú..."
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#00875A] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-[#00875A] hover:bg-[#00704A] disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Enviando mensaje...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Enviar mensaje</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-slate-400">
          Tu información se procesa de forma segura a través de los servidores oficiales de CalculaPerú.
        </p>
      </form>
    </div>
  );
}
