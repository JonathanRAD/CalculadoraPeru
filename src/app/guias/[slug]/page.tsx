import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, ChevronRight, ExternalLink } from 'lucide-react';
import { GUIDES, getGuide } from '@/features/guias/data';
import { FaqAccordion } from '@/shared/components/ui/FaqAccordion';
import { GuideVisualBlock } from '@/features/guias/components/GuideVisualBlock';
import { GuideWidget } from '@/features/guias/components/GuideWidget';
import { visualsForSection } from '@/features/guias/visuals';
import { GUIDE_WIDGETS } from '@/features/guias/widgets';

const SITE_URL = 'https://www.calculaperu.com.pe';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.metaTitle ?? guide.title,
    description: guide.description,
    alternates: { canonical: `/guias/${guide.slug}` },
    openGraph: {
      type: 'article',
      locale: 'es_PE',
      siteName: 'CalculaPerú',
      title: guide.metaTitle ?? guide.title,
      description: guide.description,
      url: `${SITE_URL}/guias/${guide.slug}`,
      publishedTime: guide.published,
      modifiedTime: guide.updated,
    },
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.updated,
    inLanguage: 'es-PE',
    author: { '@type': 'Person', name: 'Jonathan Rujel' },
    publisher: { '@type': 'Organization', name: 'CalculaPerú', url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/guias/${guide.slug}`,
  };

  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 transition-colors">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <article className="mx-auto max-w-3xl space-y-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <Link href="/" className="hover:text-[#08734F] dark:hover:text-emerald-400">Inicio</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link href="/guias" className="hover:text-[#08734F] dark:hover:text-emerald-400">Guías</Link>
        </nav>

        <header className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#08734F] dark:text-emerald-400">{guide.category}</span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">{guide.title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Por <Link href="/sobre-nosotros" className="font-bold hover:underline">Jonathan Rujel</Link> · Publicada el {formatDate(guide.published)} · Actualizada el {formatDate(guide.updated)} · {guide.readingMinutes} min de lectura
          </p>
          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">{guide.intro}</p>
          <Link href={guide.calculator.href} className="inline-flex items-center gap-1.5 rounded-lg bg-[#08734F] px-4 py-2 text-sm font-bold text-white hover:bg-[#065c3f] transition-colors">
            Ir a: {guide.calculator.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        {GUIDE_WIDGETS[guide.slug] && (
          <GuideWidget slug={guide.slug} calculatorHref={guide.calculator.href} calculatorLabel={guide.calculator.label} />
        )}

        {guide.sections.map((section) => (
          <section key={section.heading} className="app-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold">{section.heading}</h2>
            {section.paragraphs?.map((p) => (
              <p key={p} className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">{p}</p>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {section.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
            {visualsForSection(guide.slug, section.heading).map((visual) => (
              <GuideVisualBlock key={visual.title} visual={visual} />
            ))}
            {section.table && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <caption className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{section.table.caption}</caption>
                  <thead>
                    <tr>
                      {section.table.headers.map((h) => (
                        <th key={h} scope="col" className="text-left border-b-2 border-slate-200 dark:border-slate-700 py-2 pr-4 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row) => (
                      <tr key={row.join('|')} className="border-b border-slate-100 dark:border-slate-800">
                        {row.map((cell, i) => (
                          <td key={`${row[0]}-${i}`} className="py-2 pr-4 align-top text-slate-700 dark:text-slate-300">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        <section className="app-card p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Preguntas frecuentes</h2>
          <FaqAccordion items={guide.faqs} />
        </section>

        <section className="app-card p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-bold">Fuentes oficiales</h2>
          <ul className="space-y-2 text-sm">
            {guide.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[#08734F] dark:text-emerald-400 hover:underline">
                  {s.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Esta guía es informativa y referencial; no sustituye asesoría legal, contable ni la información de cada entidad. Las cifras corresponden a los parámetros 2026 publicados al momento de la revisión; si detectas un error, escríbenos desde <Link href="/contacto" className="font-bold hover:underline">Contacto</Link>.
          </p>
        </section>

        {others.length > 0 && (
          <section aria-label="Otras guías" className="space-y-3">
            <h2 className="text-sm font-bold">Otras guías</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {others.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guias/${g.slug}`} className="app-card p-4 block text-sm font-bold hover:border-[#08734F] transition-all">{g.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link href="/guias" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Todas las guías
        </Link>
      </article>
    </div>
  );
}
