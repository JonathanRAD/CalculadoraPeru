import React from 'react';
import { Info, ExternalLink } from 'lucide-react';

interface ReferenceDataNoteProps {
  /** Fecha ISO (yyyy-mm-dd) en que se revisaron los valores de referencia. */
  reviewed: string;
  children: React.ReactNode;
  sources: { label: string; url: string }[];
}

/**
 * Aviso visible sobre datos que cambian con frecuencia (precios, tarifas, comisiones).
 * Deja claro que los valores son editables, de dónde obtener el dato oficial y cuándo se revisó.
 */
export function ReferenceDataNote({ reviewed, children, sources }: ReferenceDataNoteProps) {
  const date = new Date(`${reviewed}T12:00:00`).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <aside
      aria-label="Datos de referencia"
      className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="space-y-2">
          <p>{children}</p>
          <p className="text-[11px] opacity-80">Valores de referencia revisados el {date}.</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold underline-offset-2 hover:underline"
                >
                  {source.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
