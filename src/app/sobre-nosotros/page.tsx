import React from 'react';
import Link from 'next/link';
import { Heart, Code2, Mail, ArrowLeft, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre CalculaPerú: quién está detrás y cómo trabajamos',
  description:
    'Conoce la historia detrás de CalculaPerú: la misión de simplificar los números para emprendedores, trabajadores y MYPES de todo el Perú.',
  alternates: {
    canonical: '/sobre-nosotros',
  },
};

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-[#eef2f6] dark:bg-[#0E141B] text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 transition-colors">
      <div className="mx-auto max-w-4xl bg-white dark:bg-[#18202A] rounded-lg p-6 sm:p-10 border-2 border-slate-200/90 dark:border-[#2C3744] space-y-8">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-800 dark:text-brand-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Header */}
        <div className="border-b border-slate-100 dark:border-[#2C3744] pb-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-950 dark:text-white tracking-tight">
            Sobre CalculaPerú
          </h1>
          <p className="text-[15px] sm:text-base text-slate-600 dark:text-slate-300 mt-2 font-normal leading-relaxed">
            El portal de herramientas financieras, comerciales y laborales diseñado a la medida de la realidad peruana.
          </p>
        </div>

        {/* Story Section */}
        <div className="space-y-6 text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
              ¿Por qué nació CalculaPerú?
            </h2>
            <p>
              En el Perú existen más de <strong>3.5 millones de micro y pequeñas empresas (MYPES)</strong>, además de millones de trabajadores en planilla y profesionales independientes. Sin embargo, la mayoría de herramientas financieras en internet están pensadas para otros países o utilizan fórmulas desactualizadas.
            </p>
            <p>
              <strong>CalculaPerú</strong> nació con un objetivo simple y claro: <em>democratizar el acceso a cálculos rápidos, transparentes y rigurosamente fundamentados en la normativa peruana vigente</em> (tasas de SUNAT, UIT actualizada, tablas de AFP/ONP publicadas por la SBS, decretos del Ministerio de Trabajo y tarifas de Osinergmin).
            </p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              Desarrollado y mantenido de forma independiente por <strong>Jonathan Rujel</strong>, el portal ofrece simuladores abiertos con desgloses paso a paso para que cada usuario comprenda el origen de sus descuentos e impuestos sin depender de cajas negras. Los cálculos tienen carácter informativo y referencial, diseñados para empoderar decisiones cotidianas con parámetros oficiales verificables.
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-lg border border-slate-200 dark:border-[#2C3744] bg-slate-50 dark:bg-[#0E141B] p-5 space-y-2">
              <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">100% Peruano</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                Adaptado a soles (S/), IGV del 18%, retenciones de 4ta y 5ta categoría y beneficios laborales de ley.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-[#2C3744] bg-slate-50 dark:bg-[#0E141B] p-5 space-y-2">
              <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">Rápido y Gratuito</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                Sin registros obligatorios para calcular, sin publicidad invasiva y con respuesta instantánea.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-[#2C3744] bg-slate-50 dark:bg-[#0E141B] p-5 space-y-2">
              <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">Privacidad Total</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                En uso libre, tus números y sueldos se calculan localmente en tu propio dispositivo. En el Plan PRO, los cálculos se guardan únicamente si tú decides almacenarlos voluntariamente.
              </p>
            </div>
          </div>

          {/* Method Section */}
          <div className="border-t border-slate-100 dark:border-[#2C3744] pt-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Cómo mantenemos las calculadoras
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Una sola fuente de parámetros.</strong> UIT, RMV, asignación familiar, ONP y tasas AFP viven en un único archivo del código, de modo que cada calculadora y cada guía usan el mismo valor.
              </li>
              <li>
                <strong>Pruebas automáticas.</strong> Las fórmulas laborales y tributarias tienen pruebas de regresión con casos numéricos para detectar cambios no intencionados antes de publicar.
              </li>
              <li>
                <strong>Fuentes oficiales.</strong> Los parámetros salen de SUNAT, MTPE, SBS y BCRP. Los cambios se anotan en el{' '}
                <Link href="/actualizaciones" className="font-bold text-brand-800 dark:text-brand-400 hover:underline">registro de actualizaciones</Link>.
              </li>
              <li>
                <strong>Alcance.</strong> Los resultados son referenciales. Tu caso puede variar por contratos, convenios o situaciones especiales; ante una decisión importante, consulta a un contador o abogado laboral.
              </li>
              <li>
                <strong>Correcciones.</strong> Si encuentras un error, escríbenos por el formulario de contacto y lo revisamos. Las explicaciones paso a paso están en las{' '}
                <Link href="/guias" className="font-bold text-brand-800 dark:text-brand-400 hover:underline">guías</Link>.
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="border-t border-slate-100 dark:border-[#2C3744] pt-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand-700 dark:text-brand-400" />
              Contacto y Sugerencias
            </h2>
            <p>
              ¿Tienes alguna sugerencia de una nueva calculadora que te gustaría ver en la plataforma? ¿Encontraste algún detalle que podamos mejorar? Escríbenos directamente:
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded bg-brand-700 hover:bg-brand-800 text-white px-4 py-2.5 text-[13px] font-bold transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Formulario de Contacto</span>
                <span>→</span>
              </Link>

              <a
                href="https://github.com/JonathanRAD"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded bg-[#18202A] dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 text-[13px] font-bold hover:bg-slate-800 transition-colors"
              >
                <Code2 className="h-4 w-4" />
                <span>Perfil de GitHub (JonathanRAD)</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>

              <Link
                href="/cotizador"
                className="inline-flex items-center gap-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-[13px] font-bold hover:bg-slate-200 transition-colors"
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
