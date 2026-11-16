import React from 'react';
import Link from 'next/link';
import { Mail, Clock, MapPin, ArrowLeft, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contacto y Soporte',
  description:
    'Comunícate con el equipo de CalculaPerú. Envíanos tus dudas, reportes de cálculo o sugerencias de nuevas herramientas para MYPES y trabajadores peruanos.',
  alternates: {
    canonical: '/contacto',
  },
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#121820] text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 transition-colors">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Main Card */}
        <div className="app-card bg-white dark:bg-[#18202A] rounded-lg p-6 sm:p-10 border border-slate-200 dark:border-[#2C3744] space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-100 dark:border-[#2C3744] pb-6">
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-950 dark:text-white tracking-tight">
              Ponte en contacto con CalculaPerú
            </h1>
            <p className="text-[15px] sm:text-base text-slate-600 dark:text-slate-300 mt-2 font-normal leading-relaxed">
              ¿Tienes alguna duda sobre alguna fórmula, encontraste un error en una tasa o deseas proponer una nueva calculadora para la comunidad peruana? Estamos para ayudarte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Info Column */}
            <div className="md:col-span-5 space-y-6 text-[15px] text-slate-700 dark:text-slate-300">
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-[13px]">Correo oficial</h3>
                    <p className="font-mono text-[13px] sm:text-[15px] text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                      contacto@calculaperu.com.pe
                    </p>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Atención para consultas generales y alianzas editoriales.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded bg-slate-50 dark:bg-[#0E141B] flex items-center justify-center text-brand-700 dark:text-brand-300 shrink-0 mt-0.5">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-[13px]">Tiempos de respuesta</h3>
                    <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Lunes a Viernes: 08:30 a 18:00 (Hora de Lima, Perú). Respondemos en un plazo máximo de 24 a 48 horas laborables.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded bg-slate-50 dark:bg-[#0E141B] flex items-center justify-center text-brand-700 dark:text-brand-300 shrink-0 mt-0.5">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-[13px]">Sede y Operaciones</h3>
                    <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Lima, Perú. Plataforma 100% digital desarrollada para trabajadores, contadores y MYPES de las 25 regiones del país.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-[#2C3744] space-y-2 text-[13px]">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-brand-600" />
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
