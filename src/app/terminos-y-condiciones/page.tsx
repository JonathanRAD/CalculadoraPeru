import React from 'react';
import Link from 'next/link';
import { Scale, AlertTriangle, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones de Uso | CalculaPerú',
  description:
    'Términos y condiciones de uso de CalculaPerú: descargo de responsabilidad sobre cálculos tributarios, laborales y comerciales.',
  alternates: {
    canonical: '/terminos-y-condiciones',
  },
};

export default function TerminosCondicionesPage() {
  return (
    <div className="min-h-screen bg-[#eef2f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 transition-colors">
      <div className="mx-auto max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border-2 border-slate-200/90 dark:border-slate-800 shadow-md">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
            <Scale className="h-4 w-4" />
            <span>TÉRMINOS LEGALES Y CONDICIONES</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            Términos y Condiciones
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Última actualización: 28 de agosto de 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder y utilizar el portal web <strong>CalculaPerú</strong> (https://www.calculaperu.com.pe), aceptas quedar vinculado por estos Términos y Condiciones de Uso, todas las leyes y regulaciones aplicables en la República del Perú. Si no estás de acuerdo con alguno de estos términos, te recomendamos abstenerte de utilizar este sitio.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
              2. Carácter Informativo y Descargo de Responsabilidad
            </h2>
            <p>
              Todas las calculadoras, simuladores, fórmulas y contenidos educativos proporcionados en CalculaPerú tienen una finalidad exclusivamente <strong>informativa, didáctica y referencial</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <strong>No sustituyen asesoría profesional:</strong> Los resultados obtenidos no constituyen asesoría tributaria, contable, laboral ni financiera formal. Para trámites oficiales, declaraciones juradas o controversias laborales, se recomienda consultar directamente con un contador colegiado, abogado laboralista o recurrir a los canales oficiales de la SUNAT o Ministerio de Trabajo.
              </li>
              <li>
                <strong>Variaciones en regulaciones:</strong> Aunque realizamos constantes actualizaciones basadas en las tasas oficiales (IGV 18%, UIT vigente, tablas de AFP/ONP), las normas legales pueden sufrir modificaciones por decretos legislativos.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Propiedad Intelectual
            </h2>
            <p>
              El código fuente, diseño de interfaz, logotipos, arquitectura de software y selección de contenidos de CalculaPerú están protegidos por las leyes de propiedad intelectual y derechos de autor. Queda prohibida la reproducción total o parcial sin la autorización expresa del titular del proyecto.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              4. Uso Correcto de la Plataforma
            </h2>
            <p>
              El usuario se compromete a hacer un uso lícito y ético de las herramientas disponibles, sin intentar vulnerar la seguridad de la infraestructura ni utilizar scripts automatizados que puedan afectar la disponibilidad del servicio para otros usuarios.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              5. Modificaciones de los Términos
            </h2>
            <p>
              CalculaPerú se reserva el derecho de revisar y actualizar estos Términos y Condiciones en cualquier momento y sin previo aviso. Al utilizar este sitio web, aceptas quedar sujeto a la versión vigente en ese momento.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
