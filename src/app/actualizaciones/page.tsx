import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { SITE_UPDATES } from '@/core/constants/site-updates';

export const metadata: Metadata = {
  title: 'Actualizaciones y mantenimiento de parámetros',
  description:
    'Registro público de los cambios en parámetros legales, tasas y contenido de CalculaPerú: UIT, RMV, AFP y nuevas guías.',
  alternates: { canonical: '/actualizaciones' },
};

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ActualizacionesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 transition-colors">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver al inicio
        </Link>
        <header>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Actualizaciones y mantenimiento</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Aquí registramos cada cambio de parámetros legales y de contenido, con su fuente oficial. Es la forma de que puedas comprobar qué tan al día están las calculadoras.
          </p>
        </header>
        <ol className="space-y-4">
          {SITE_UPDATES.map((entry) => (
            <li key={`${entry.date}-${entry.title}`} className="app-card p-6 space-y-2">
              <time dateTime={entry.date} className="text-xs font-bold text-brand-700 dark:text-emerald-400">{formatDate(entry.date)}</time>
              <h2 className="text-base sm:text-lg font-bold">{entry.title}</h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{entry.detail}</p>
              {entry.source && (
                <a href={entry.source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-emerald-400 hover:underline">
                  {entry.source.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
