import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { GUIDES } from '@/features/guias/data';

export const metadata: Metadata = {
  title: 'Guías laborales y tributarias para Perú',
  description:
    'Guías paso a paso sobre descuentos de sueldo, gratificaciones, CTS y regímenes tributarios en Perú, con ejemplos en soles y fuentes oficiales.',
  alternates: { canonical: '/guias' },
};

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function GuiasPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 transition-colors">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>GUÍAS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Guías laborales y tributarias</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Explicaciones con ejemplos en soles para entender tus descuentos, beneficios e impuestos. Cada guía enlaza la calculadora correspondiente, cita sus fuentes y muestra la fecha de su última revisión.
          </p>
        </header>

        <ul className="grid gap-4">
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Link href={`/guias/${guide.slug}`} className="app-card p-6 flex flex-col gap-2 group hover:border-[#08734F] transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#08734F] dark:text-emerald-400">{guide.category}</span>
                <h2 className="text-lg font-bold group-hover:text-[#08734F] dark:group-hover:text-emerald-400 transition-colors">{guide.title}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{guide.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{guide.readingMinutes} min de lectura</span>
                  <span>Actualizada el {formatDate(guide.updated)}</span>
                  <span className="ml-auto inline-flex items-center gap-1 font-bold text-[#08734F] dark:text-emerald-400">Leer guía <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          ¿Echas de menos un tema? <Link href="/contacto" className="font-bold text-[#08734F] dark:text-emerald-400 hover:underline">Cuéntanos</Link>. También puedes revisar el <Link href="/actualizaciones" className="font-bold text-[#08734F] dark:text-emerald-400 hover:underline">registro de actualizaciones</Link>.
        </p>
      </div>
    </div>
  );
}
