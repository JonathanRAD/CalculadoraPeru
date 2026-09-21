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
              2. Cálculos Locales, URLs y Tratamiento de Información Financiera
            </h2>
            <p>
              En la versión pública y gratuita, todas las operaciones matemáticas realizadas en nuestras calculadoras (Sueldo Neto, Gratificación, CTS, Liquidación, IGV, Renta, etc.) se procesan de forma <strong>100% local en el navegador de tu dispositivo (client-side)</strong> mediante JavaScript. No registramos, almacenamos ni transmitimos a servidores externos las cifras monetarias ni datos remunerativos que ingresas al calcular.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <strong>Enlaces compartidos:</strong> Los botones para compartir herramientas en redes sociales o WhatsApp envían únicamente la dirección web de la calculadora. No incluyen tus montos, salarios ni resultados en la URL ni en parámetros de búsqueda.
              </li>
              <li>
                <strong>Herramientas de analítica web:</strong> Google Analytics y nuestros registros técnicos capturan únicamente vistas de página y términos de búsqueda internos para evaluar el rendimiento técnico. No se envían importes, ingresos ni datos personales a ningún sistema de analítica.
              </li>
              <li>
                <strong>Cuentas CalculaPerú PRO:</strong> Si dispones de una cuenta PRO activa, la información de un cálculo o cotización únicamente se almacena en nuestra base de datos protegida (PostgreSQL alojado en Supabase con cifrado en tránsito y en reposo) cuando pulsas voluntariamente el botón <em>&ldquo;Guardar en Mis Cálculos&rdquo;</em>. <strong>No existe guardado automático</strong> en segundo plano.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cookie className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-400" />
              3. Cookies y Publicidad de Terceros (Google AdSense)
            </h2>
            <p>
              CalculaPerú utiliza almacenamiento local y cookies técnicas para recordar tus preferencias (como el Modo Claro u Oscuro). Asimismo, proveedores externos, incluido <strong>Google</strong>, utilizan cookies para publicar anuncios cuando visitas nuestro sitio web:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <strong>Cookies publicitarias de Google:</strong> Google y sus socios utilizan cookies para mostrar anuncios basados en tus visitas a este y otros sitios web en internet.
              </li>
              <li>
                <strong>Control del usuario:</strong> Puedes consultar y modificar la personalización de anuncios en cualquier momento visitando la{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 dark:text-emerald-400 underline"
                >
                  Configuración de anuncios de Google
                </a>{' '}
                o en el portal de autorregulación{' '}
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
              4. Formularios, Cuentas y Destino de los Datos
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <p>
                CalculaPerú recopila datos personales exclusivamente cuando el usuario decide interactuar de forma voluntaria:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Formulario de contacto (/contacto):</strong> Tu nombre, correo y mensaje son transmitidos de forma segura mediante la API transaccional de Resend para responder directamente a tus dudas operativas o reportes técnicos. No se emplean con fines publicitarios.
                </li>
                <li>
                  <strong>Registro y autenticación PRO (/pro):</strong> Guardamos tu correo electrónico y tu contraseña cifrada mediante algoritmos seguros de derivación de claves (bcrypt con sal) a través de Supabase Auth.
                </li>
                <li>
                  <strong>Lista informativa del Cotizador (/cotizador):</strong> Si decides dejar tu correo para recibir novedades de la herramienta MYPE, el contacto se gestiona mediante Formspree con estricta confidencialidad.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              5. Derechos ARCO y Supresión de Datos
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Conforme a la Ley N° 29733 (Ley de Protección de Datos Personales de Perú) y su reglamento, tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <strong>Usuarios de la versión gratuita:</strong> Al no registrarse cuentas ni almacenarse cálculos en servidores, no existe información personal retenida susceptible de supresión.
              </li>
              <li>
                <strong>Eliminación de cálculos guardados (Autogestión PRO):</strong> Puedes eliminar individualmente cualquiera de tus cálculos guardados en cualquier momento desde el panel de perfil de tu cuenta PRO, haciendo clic en el icono de papelera. La eliminación en base de datos es inmediata.
              </li>
              <li>
                <strong>Eliminación completa de cuenta y datos:</strong> Si deseas dar de baja definitiva tu cuenta de usuario PRO y borrar todos tus registros asociados, puedes solicitarlo enviando un mensaje a través de nuestro <Link href="/contacto" className="text-emerald-700 dark:text-emerald-400 underline">formulario de contacto</Link> o vía WhatsApp de soporte. Atendemos y procesamos las solicitudes de supresión en un plazo máximo de 48 horas hábiles.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              6. Enlaces a Sitios Externos e Institucionales
            </h2>
            <p>
              Nuestro portal contiene enlaces informativos a fuentes y entidades públicas (SUNAT, Ministerio de Trabajo, SBS, Osinergmin, Banco de la Nación). Dichos enlaces tienen finalidad didáctica y de verificación de fuentes normativas; CalculaPerú no administra ni se responsabiliza por las políticas de privacidad de los portales gubernamentales externos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              7. Canales de Consulta y Soporte
            </h2>
            <p>
              Para cualquier consulta sobre esta política, ejercicio de derechos sobre tus datos o aclaraciones técnicas, puedes contactarnos a través de nuestra página de <Link href="/contacto" className="text-emerald-700 dark:text-emerald-400 underline">Contacto</Link> o revisar la misión del proyecto en <Link href="/sobre-nosotros" className="text-emerald-700 dark:text-emerald-400 underline">Sobre Nosotros</Link>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
