import { roundTo } from '../math/formatters';

export type ExchangeConversionMode = 'usd_to_pen' | 'pen_to_usd';
export type ExchangeSource = 'market' | 'sbs' | 'custom';

export interface ExchangeRateInput {
  amount: number;
  conversionMode: ExchangeConversionMode;
  source: ExchangeSource;
  customBuyRate: number;
  customSellRate: number;
}

export interface ExchangeRateResult {
  sourceName: string;
  buyRate: number;
  sellRate: number;
  spreadDifference: number;
  convertedAmount: number;
  equivalentText: string;
}

/** Convierte USD/PEN con la tasa SBS recuperada o una tasa ingresada por el usuario. */
export function calculateExchangeRate(input: ExchangeRateInput): ExchangeRateResult {
  const amount = Math.max(0, input.amount || 0);
  const buyRate = input.customBuyRate > 0 ? input.customBuyRate : 0;
  const sellRate = input.customSellRate > 0 ? input.customSellRate : 0;
  const convertedAmount = input.conversionMode === 'usd_to_pen'
    ? amount * buyRate
    : sellRate > 0 ? amount / sellRate : 0;

  const equivalentText = input.conversionMode === 'usd_to_pen'
    ? `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD = S/ ${convertedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })} PEN`
    : `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })} PEN = $ ${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;

  return {
    sourceName: input.source === 'market'
      ? 'Mercado USD/PEN'
      : input.source === 'sbs'
        ? 'SBS vía BCRPData'
        : 'Tasa personalizada',
    buyRate: roundTo(buyRate, 3),
    sellRate: roundTo(sellRate, 3),
    spreadDifference: roundTo(Math.abs(sellRate - buyRate), 3),
    convertedAmount: roundTo(convertedAmount, 2),
    equivalentText,
  };
}
