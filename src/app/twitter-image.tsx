import { ImageResponse } from 'next/og';

export const alt = 'CalculaPerú | El Portal de Calculadoras #1 del Perú';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 60%, #090e1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
          padding: '40px 60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            borderRadius: '30px',
            padding: '10px 24px',
            fontSize: '18px',
            fontWeight: 800,
            color: '#34d399',
            marginBottom: '24px',
          }}
        >
          🇵🇪 EL PORTAL DE CALCULADORAS #1 DEL PERÚ
        </div>

        <div
          style={{
            fontSize: '64px',
            fontWeight: 900,
            letterSpacing: '-2px',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <span>Calcula</span>
          <span style={{ color: '#10b981' }}>Perú</span>
        </div>

        <div
          style={{
            fontSize: '26px',
            color: '#cbd5e1',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.4,
            fontWeight: 400,
          }}
        >
          Precio de Venta • Margen de Ganancia • IGV 18% SUNAT • Punto de Equilibrio • Luz en Soles (S/)
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
