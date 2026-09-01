import React from 'react';
import Link from 'next/link';
import { Heart, Code2, Sparkles, Mail, ArrowLeft, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nosotros y Contacto | CalculaPerú',
  description:
    'Conoce la historia detrás de CalculaPerú: la misión de simplificar los números para emprendedores, trabajadores y MYPES de todo el Perú.',
  alternates: {
    canonical: '/sobre-nosotros',
  },
};

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-[#eef2f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 transition-colors">
      <div className="mx-auto max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border-2 border-slate-200/90 dark:border-slate-800 shadow-md space-y-8">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
            <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <span>NUESTRA MISIÓN EN EL PERÚ</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            Sobre CalculaPerú
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 font-normal leading-relaxed">
            El portal de herramientas financieras, comerciales y laborales diseñado a la medida de la realidad peruana.
          </p>
        </div>

        {/* Story Section */}
        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
              ¿Por qué nació CalculaPerú?
            </h2>
            <p>
              En el Perú existen más de <strong>3.5 millones de micro y pequeñas empresas (MYPES)</strong>, además de millones de trabajadores en planilla y profesionales independientes. Sin embargo, la mayoría de herramientas financieras en internet están pensadas para otros países o utilizan fórmulas desactualizadas.
            </p>
            <p>
              <strong>CalculaPerú</strong> nació con un objetivo simple y claro: <em>democratizar el acceso a cálculos rápidos, transparentes y 100% exactos bajo la legislación peruana vigente</em> (tasas de SUNAT, UIT actualizada, tablas de AFP/ONP, normas del Ministerio de Trabajo y tarifas de Osinergmin).
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold">
                🇵🇪
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">100% Peruano</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adaptado a soles (S/), IGV del 18%, retenciones de 4ta y 5ta categoría y beneficios laborales de ley.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-2">
              <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-800 dark:text-indigo-300 font-bold">
                ⚡
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Rápido y Gratuito</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sin registros obligatorios para calcular, sin publicidad invasiva y con respuesta instantánea.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-2">
              <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-800 dark:text-amber-300 font-bold">
                🔒
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Privacidad Total</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tus números y sueldos se calculan localmente en tu propio dispositivo. Nunca guardamos tus montos.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              Contacto y Sugerencias
            </h2>
            <p>
              ¿Tienes alguna sugerencia de una nueva calculadora que te gustaría ver en la plataforma? ¿Encontraste algún detalle que podamos mejorar? Escríbenos directamente:
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="https://github.com/JonathanRAD"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                <Code2 className="h-4 w-4" />
                <span>Perfil de GitHub (JonathanRAD)</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>

              <Link
                href="/cotizador"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-xs font-bold transition-colors"
              >
                <span>Conocer el Cotizador para MYPES</span>
                <span>→</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
