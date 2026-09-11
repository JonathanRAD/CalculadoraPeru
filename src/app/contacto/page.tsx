import React from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Clock, MapPin, ArrowLeft, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contacto y Soporte | CalculaPerú',
  description:
    'Comunícate con el equipo de CalculaPerú. Envíanos tus dudas, reportes de cálculo o sugerencias de nuevas herramientas para MYPES y trabajadores peruanos.',
  alternates: {
    canonical: '/contacto',
  },
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 transition-colors">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00875A] dark:text-[#00C853] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Main Card */}
        <div className="app-card bg-white dark:bg-[#131A35] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 text-xs font-bold text-[#00875A] dark:text-[#00C853] border border-emerald-200 dark:border-emerald-800 mb-3">
              <Mail className="h-4 w-4" />
              <span>ATENCIÓN AL USUARIO Y SUGERENCIAS</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Ponte en contacto con CalculaPerú
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 font-normal leading-relaxed">
              ¿Tienes alguna duda sobre alguna fórmula, encontraste un error en una tasa o deseas proponer una nueva calculadora para la comunidad peruana? Estamos para ayudarte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Info Column */}
            <div className="md:col-span-5 space-y-6 text-sm text-slate-700 dark:text-slate-300">
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-[#00875A] dark:text-[#00C853] shrink-0 mt-0.5">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Correo oficial</h3>
                    <p className="font-mono text-xs sm:text-sm text-[#00875A] dark:text-[#00C853] font-semibold mt-0.5">
                      contacto@calculaperu.com.pe
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Atención para consultas generales y alianzas editoriales.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0 mt-0.5">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Tiempos de respuesta</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Lunes a Viernes: 08:30 a 18:00 (Hora de Lima, Perú). Respondemos en un plazo máximo de 24 a 48 horas laborables.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0 mt-0.5">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Sede y Operaciones</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Lima, Perú. Plataforma 100% digital desarrollada para trabajadores, contadores y MYPES de las 25 regiones del país.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-[#00875A]" />
                  <span>Aviso sobre asesoría legal</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Nuestras herramientas ofrecen simulaciones referenciales basadas en las normas vigentes de SUNAT, MTPE y SBS. Si requieres asesoría legal o contable vinculante para litigios, te recomendamos consultar con un contador colegiado o abogado especialista.
                </p>
              </div>

            </div>

            {/* Form Column */}
            <div className="md:col-span-7">
              <ContactForm />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
