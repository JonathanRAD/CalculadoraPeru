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

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
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
  const sectionIds = guide.sections.map((section) => slugify(section.heading));
  const toc = [
    ...guide.sections.map((section, i) => ({ id: sectionIds[i], label: section.heading })),
    { id: 'preguntas-frecuentes', label: 'Preguntas frecuentes' },
    { id: 'fuentes-oficiales', label: 'Fuentes oficiales' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#121820] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 transition-colors">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Migas de pan" className="mb-6 flex flex-wrap items-center gap-1.5 text-[13px] text-slate-600 dark:text-slate-400">
          <Link href="/" className="hover:text-brand-700 hover:underline dark:hover:text-brand-400">Inicio</Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <Link href="/guias" className="hover:text-brand-700 hover:underline dark:hover:text-brand-400">Guías</Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">{guide.category}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
          <article className="min-w-0 space-y-10">
            <header className="space-y-4">
              <p className="font-mono text-[13px] text-brand-700 dark:text-brand-400">
                {guide.category} · {guide.readingMinutes} min de lectura
              </p>
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{guide.title}</h1>
              <p className="text-[13px] text-slate-600 dark:text-slate-400">
                Por{' '}
                <Link href="/sobre-nosotros" className="font-semibold text-slate-900 hover:underline dark:text-slate-100">
                  Jonathan Rujel
                </Link>{' '}
                · Publicada el {formatDate(guide.published)} · Actualizada el {formatDate(guide.updated)}
              </p>
              <p className="border-l-4 border-brand-600 pl-4 text-lg leading-relaxed text-slate-800 dark:text-slate-200">{guide.intro}</p>
            </header>

            {GUIDE_WIDGETS[guide.slug] && (
              <GuideWidget slug={guide.slug} calculatorHref={guide.calculator.href} calculatorLabel={guide.calculator.label} />
            )}

            {guide.sections.map((section, index) => (
              <section
                key={section.heading}
                id={sectionIds[index]}
                className="scroll-mt-24 space-y-4 border-t border-stone-900 pt-6 dark:border-slate-400"
              >
                <h2 className="flex items-baseline gap-3 text-2xl font-bold leading-snug tracking-tight">
                  <span aria-hidden="true" className="font-mono text-base font-medium text-slate-500 dark:text-slate-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{section.heading}</span>
                </h2>
                {section.paragraphs?.map((p) => (
                  <p key={p} className="text-base leading-[1.75] text-slate-800 dark:text-slate-300">{p}</p>
                ))}
                {section.bullets && (
                  <ul className="list-disc space-y-2 pl-5 text-base leading-[1.75] text-slate-800 marker:text-brand-700 dark:text-slate-300 dark:marker:text-brand-400">
                    {section.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                )}
                {visualsForSection(guide.slug, section.heading).map((visual) => (
                  <GuideVisualBlock key={visual.title} visual={visual} />
                ))}
                {section.table && (
                  <div className="overflow-x-auto rounded-lg border border-stone-300 bg-[#FFFEFB] dark:border-slate-700 dark:bg-[#18202A]">
                    <table className="w-full border-collapse text-[15px]">
                      <caption className="px-4 pt-3 text-left font-mono text-[13px] text-slate-600 dark:text-slate-400">{section.table.caption}</caption>
                      <thead>
                        <tr>
                          {section.table.headers.map((h) => (
                            <th key={h} scope="col" className="border-b border-slate-900 px-4 py-2 text-left font-semibold dark:border-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row) => (
                          <tr key={row.join('|')} className="border-b border-dashed border-stone-300 last:border-0 dark:border-slate-600">
                            {row.map((cell, i) => (
                              <td key={`${row[0]}-${i}`} className="px-4 py-2.5 align-top text-slate-800 dark:text-slate-300">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            <section id="preguntas-frecuentes" className="scroll-mt-24">
              <FaqAccordion items={guide.faqs} title="Preguntas frecuentes" />
            </section>

            <section id="fuentes-oficiales" className="scroll-mt-24 space-y-3 border-t border-stone-900 pt-6 dark:border-slate-400">
              <h2 className="text-2xl font-bold tracking-tight">Fuentes oficiales</h2>
              <ol className="space-y-2 text-[15px]">
                {guide.sources.map((src, i) => (
                  <li key={src.url} className="flex gap-3">
                    <span aria-hidden="true" className="pt-0.5 font-mono text-[13px] text-slate-500 dark:text-slate-400">[{i + 1}]</span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-400"
                    >
                      {src.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ol>
              <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                Esta guía es informativa y referencial; no sustituye asesoría legal, contable ni la información de cada entidad. Las cifras corresponden a los parámetros 2026 publicados al momento de la revisión; si detectas un error, escríbenos desde{' '}
                <Link href="/contacto" className="font-semibold underline-offset-4 hover:underline">Contacto</Link>.
              </p>
            </section>

            {others.length > 0 && (
              <section aria-label="Otras guías" className="border-t border-stone-900 pt-6 dark:border-slate-400">
                <h2 className="mb-3 text-2xl font-bold tracking-tight">Otras guías</h2>
                <ul className="divide-y divide-stone-300 dark:divide-slate-700">
                  {others.map((g) => (
                    <li key={g.slug}>
                      <Link
                        href={`/guias/${g.slug}`}
                        className="group flex min-h-14 items-baseline justify-between gap-4 py-3 hover:text-brand-700 dark:hover:text-brand-400"
                      >
                        <span className="text-[15px] font-semibold leading-snug">{g.title}</span>
                        <span className="shrink-0 font-mono text-[13px] text-slate-600 dark:text-slate-400">{g.category}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Link href="/guias" className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-400">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Todas las guías
            </Link>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <nav aria-label="En esta guía" className="rounded-lg border border-stone-300 bg-[#FFFEFB] p-5 dark:border-slate-700 dark:bg-[#18202A]">
              <p className="font-mono text-[13px] text-slate-600 dark:text-slate-400">En esta guía</p>
              <ol className="mt-3 space-y-1">
                {toc.map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex min-h-10 items-baseline gap-3 py-1.5 text-[15px] leading-snug text-slate-800 hover:text-brand-700 dark:text-slate-200 dark:hover:text-brand-400"
                    >
                      <span aria-hidden="true" className="w-5 shrink-0 font-mono text-[13px] text-slate-500 dark:text-slate-400">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="rounded-lg border border-brand-600 bg-brand-50 p-5 dark:border-brand-500 dark:bg-brand-950/40">
              <p className="font-mono text-[13px] text-brand-800 dark:text-brand-300">Calcula con tus datos</p>
              <p className="mt-2 text-[15px] leading-snug text-slate-800 dark:text-slate-200">{guide.calculator.label}</p>
              <Link
                href={guide.calculator.href}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-between rounded bg-brand-600 px-4 text-[15px] font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Abrir calculadora <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
