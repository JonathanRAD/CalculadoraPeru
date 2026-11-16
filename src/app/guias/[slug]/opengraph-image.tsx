import { ImageResponse } from 'next/og';
import { GUIDES, getGuide } from '@/features/guias/data';

export const alt = 'Guía de CalculaPerú';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

/** Imagen para compartir cada guía en redes y mensajería, con su título y categoría. */
export default async function GuideOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  const title = guide?.metaTitle ?? guide?.title ?? 'Guías laborales y tributarias';
  const category = guide?.category ?? 'Guía';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: '#08142f',
          color: '#ffffff',
          padding: '72px 78px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ position: 'absolute', right: '-120px', top: '-160px', width: '560px', height: '560px', borderRadius: '50%', background: 'rgba(16,185,129,0.16)' }} />
        <div style={{ position: 'absolute', right: '130px', bottom: '-220px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(14,165,233,0.10)' }} />

        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 30, fontWeight: 700 }}>
            <div style={{ display: 'flex', width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 14, border: '2px solid rgba(52,211,153,0.5)', background: 'rgba(16,185,129,0.14)', color: '#34d399', fontSize: 25 }}>S/</div>
            <span>Calcula<span style={{ color: '#34d399' }}>Perú</span></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 960 }}>
            <div style={{ color: '#6ee7b7', fontSize: 22, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{`Guía · ${category}`}</div>
            <div style={{ marginTop: 18, fontSize: 66, lineHeight: 1.06, fontWeight: 800, letterSpacing: '-0.03em' }}>{title}</div>
          </div>

          <div style={{ display: 'flex', gap: 14, color: '#cbd5e1', fontSize: 21 }}>
            {['Ejemplos en soles', 'Fuentes oficiales', 'Calculadora incluida'].map((label) => (
              <span key={label} style={{ padding: '10px 17px', border: '1px solid #334155', borderRadius: 999 }}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
