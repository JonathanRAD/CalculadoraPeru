import { NextResponse } from 'next/server';

export const revalidate = 1800; // Revalidar cada 30 minutos

export async function GET() {
  try {
    // 1. Consultar API pública de tipo de cambio en tiempo real
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error('Error al consultar proveedor de tipo de cambio');
    }

    const data = await response.json();
    const midRate = data?.rates?.PEN || 3.35;

    // Modelar spread peruano típico (compra y venta oficial / mercado)
    const sunatBuy = parseFloat((midRate - 0.005).toFixed(3));
    const sunatSell = parseFloat((midRate + 0.005).toFixed(3));

    const parallelBuy = parseFloat((midRate - 0.01).toFixed(3));
    const parallelSell = parseFloat((midRate + 0.01).toFixed(3));

    const bankBuy = parseFloat((midRate - 0.05).toFixed(3));
    const bankSell = parseFloat((midRate + 0.06).toFixed(3));

    return NextResponse.json({
      success: true,
      lastUpdated: data.time_last_update_utc || new Date().toISOString(),
      midRate: parseFloat(midRate.toFixed(3)),
      rates: {
        sunat: { buyRate: sunatBuy, sellRate: sunatSell },
        parallel_ocona: { buyRate: parallelBuy, sellRate: parallelSell },
        sbs_banks: { buyRate: bankBuy, sellRate: bankSell },
      },
    });
  } catch (error) {
    // Fallback seguro en caso de fallo de red
    return NextResponse.json({
      success: false,
      lastUpdated: new Date().toISOString(),
      midRate: 3.35,
      rates: {
        sunat: { buyRate: 3.345, sellRate: 3.355 },
        parallel_ocona: { buyRate: 3.340, sellRate: 3.360 },
        sbs_banks: { buyRate: 3.300, sellRate: 3.410 },
      },
    });
  }
}
