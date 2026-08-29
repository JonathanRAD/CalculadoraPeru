import { roundTo } from '../math/formatters';

export type ExchangeConversionMode = 'usd_to_pen' | 'pen_to_usd';
export type ExchangeSource = 'sunat' | 'sbs_banks' | 'parallel_ocona' | 'custom';

export interface ExchangeRateInput {
  amount: number;
  conversionMode: ExchangeConversionMode;
  source: ExchangeSource;
  customBuyRate?: number;
  customSellRate?: number;
}

export interface ExchangeRateSourceValues {
  name: string;
  description: string;
  buyRate: number; // Compra (Soles que te dan por 1 Dólar)
  sellRate: number; // Venta (Soles que pagas por 1 Dólar)
  badge: string;
}

// Tasas referenciales del mercado peruano actualizadas al día
export const PERU_EXCHANGE_RATES: Record<Exclude<ExchangeSource, 'custom'>, ExchangeRateSourceValues> = {
  sunat: {
    name: 'SUNAT Oficial',
    description: 'Tipo de cambio oficial para facturación, IGV e impuestos',
    buyRate: 3.345,
    sellRate: 3.355,
    badge: 'Tributario',
  },
  parallel_ocona: {
    name: 'Paralelo / Ocoña y Casas Digitales',
    description: 'Rextie, Kambista, Jr. Ocoña y cambistas de calle',
    buyRate: 3.340,
    sellRate: 3.360,
    badge: 'Mercado Libre',
  },
  sbs_banks: {
    name: 'Bancos / SBS (BCP, BBVA, Interbank)',
    description: 'Tarifas promedio de agencias bancarias y tarjetas',
    buyRate: 3.300,
    sellRate: 3.410,
    badge: 'Entidades Financieras',
  },
};

export interface ExchangeRateResult {
  sourceName: string;
  buyRate: number;
  sellRate: number;
  spreadDifference: number; // Diferencial cambiario en Soles
  convertedAmount: number; // Monto convertido resultante
  equivalentText: string;
  allSourcesComparison: Array<{
    source: string;
    name: string;
    buyRate: number;
    sellRate: number;
    resultIfBuy: number; // Si vendes dólares (te pagan la compra)
    resultIfSell: number; // Si compras dólares (pagas la venta)
  }>;
}

/**
 * Calcula la conversión exacta entre Soles (PEN) y Dólares (USD) según el mercado peruano.
 */
export function calculateExchangeRate(input: ExchangeRateInput): ExchangeRateResult {
  const amount = Math.max(0, input.amount || 0);
  const sourceConfig = input.source !== 'custom' ? PERU_EXCHANGE_RATES[input.source] : null;

  const defaultBuy = sourceConfig ? sourceConfig.buyRate : 3.345;
  const defaultSell = sourceConfig ? sourceConfig.sellRate : 3.355;

  const buyRate = input.customBuyRate && input.customBuyRate > 0 ? input.customBuyRate : defaultBuy;
  const sellRate = input.customSellRate && input.customSellRate > 0 ? input.customSellRate : defaultSell;

  let convertedAmount = 0;
  let equivalentText = '';

  if (input.conversionMode === 'usd_to_pen') {
    // Si tengo USD y quiero PEN, la entidad me COMPRA mis dólares (usa buyRate)
    convertedAmount = amount * buyRate;
    equivalentText = `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD = S/ ${convertedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })} PEN`;
  } else {
    // Si tengo PEN y quiero USD, la entidad me VENDE dólares (usa sellRate)
    convertedAmount = sellRate > 0 ? amount / sellRate : 0;
    equivalentText = `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })} PEN = $ ${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
  }

  const spread = Math.abs(sellRate - buyRate);

  // Comparativa contra todas las fuentes
  const allSourcesComparison = (Object.keys(PERU_EXCHANGE_RATES) as Array<Exclude<ExchangeSource, 'custom'>>).map((srcKey) => {
    const s = PERU_EXCHANGE_RATES[srcKey];
    const resIfBuy = amount * s.buyRate; // Si cambio dólares a soles
    const resIfSell = s.sellRate > 0 ? amount / s.sellRate : 0; // Si cambio soles a dólares

    return {
      source: srcKey,
      name: s.name,
      buyRate: s.buyRate,
      sellRate: s.sellRate,
      resultIfBuy: roundTo(resIfBuy, 2),
      resultIfSell: roundTo(resIfSell, 2),
    };
  });

  return {
    sourceName: sourceConfig ? sourceConfig.name : 'Tasa Personalizada',
    buyRate: roundTo(buyRate, 3),
    sellRate: roundTo(sellRate, 3),
    spreadDifference: roundTo(spread, 3),
    convertedAmount: roundTo(convertedAmount, 2),
    equivalentText,
    allSourcesComparison,
  };
}
