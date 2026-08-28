import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Cookie, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad | CalculaPerú',
  description:
    'Conoce cómo protegemos tu privacidad, el uso de cookies y la recopilación de datos en CalculaPerú conforme a las leyes peruanas y estándares de Google.',
  alternates: {
    canonical: '/politica-de-privacidad',
  },
};

export default function PoliticaPrivacidadPage() {
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
            <ShieldCheck className="h-4 w-4" />
            <span>PROTECCIÓN DE DATOS Y PRIVACIDAD</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            Política de Privacidad
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Última actualización: 28 de agosto de 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-400" />
              1. Compromiso con tu Privacidad
            </h2>
            <p>
              En <strong>CalculaPerú</strong> (accesible desde <Link href="https://www.calculaperu.com.pe" className="text-emerald-700 dark:text-emerald-400 underline">https://www.calculaperu.com.pe</Link>), una de nuestras principales prioridades es la privacidad de nuestros visitantes. Este documento describe los tipos de información que recopilamos y cómo la utilizamos, en estricto cumplimiento de la Ley de Protección de Datos Personales del Perú (Ley N° 29733) y las políticas de proveedores de publicidad digital como Google.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-400" />
              2. Cálculos Locales y Sin Almacenamiento
            </h2>
            <p>
              Todas las operaciones matemáticas realizadas en nuestras calculadoras (Sueldo Neto, Gratificación, CTS, IGV, Precios, etc.) se procesan directamente en el navegador de tu dispositivo (client-side). <strong>CalculaPerú no recopila, guarda ni transmite a servidores externos los números, ingresos ni montos financieros que ingresas para realizar tus cálculos.</strong>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cookie className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-400" />
              3. Cookies y Publicidad de Terceros (Google AdSense)
            </h2>
            <p>
              CalculaPerú utiliza cookies para almacenar información sobre las preferencias de los visitantes (como el Modo Claro u Oscuro) y para permitir que proveedores externos, incluido <strong>Google</strong>, publiquen anuncios relevantes en función de las visitas previas de los usuarios a este u otros sitios web.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <strong>Cookies de Google:</strong> Google y sus socios utilizan cookies publicitarias (como la cookie de DART) para mostrar anuncios basados en tu navegación en internet.
              </li>
              <li>
                <strong>Inhabilitación voluntaria:</strong> Puedes inhabilitar el uso de publicidad personalizada visitando la{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 dark:text-emerald-400 underline"
                >
                  Configuración de anuncios de Google
                </a>{' '}
                o a través del portal{' '}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 dark:text-emerald-400 underline"
                >
                  www.aboutads.info
                </a>.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              4. Recopilación de Correos en Formularios
            </h2>
            <p>
              Cuando te registras voluntariamente para acceder a la lista de espera del Cotizador de MYPES, recopilamos únicamente tu dirección de correo electrónico mediante servicios seguros de terceros (como Formspree). Tu correo se utiliza exclusivamente para notificarte sobre el lanzamiento de la herramienta y nunca será vendido, cedido ni transferido a terceros para fines de spam.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              5. Enlaces a Sitios Externos
            </h2>
            <p>
              Nuestro portal puede contener enlaces a instituciones oficiales (como SUNAT, Ministerio de Trabajo u Osinergmin). No nos hacemos responsables de las prácticas de privacidad ni del contenido de dichos sitios externos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              6. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre nuestra política de privacidad, puedes comunicarte con el equipo de desarrollo a través de nuestro correo oficial de contacto o visitando la sección de <Link href="/sobre-nosotros" className="text-emerald-700 dark:text-emerald-400 underline">Sobre Nosotros</Link>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
