'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import {
  calculateExchangeRate,
  ExchangeConversionMode,
  ExchangeSource,
} from '@/core/calculators/exchangeRate';
import { formatCurrency, formatNumber } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { ExportPdfButton } from '@/shared/components/ui/ExportPdfButton';
import { ArrowLeftRight, DollarSign, Settings2, RefreshCw } from 'lucide-react';

interface PublishedExchangeRate {
  buyRate: number;
  sellRate: number;
  effectiveDate: string;
  sourceName: string;
}

type PublishedSource = Exclude<ExchangeSource, 'custom'>;

interface PublishedExchangeResponse {
  defaultSource: PublishedSource;
  rates: Partial<Record<PublishedSource, PublishedExchangeRate>>;
  cachedAt?: number;
}

const EXCHANGE_RATE_CACHE_KEY = 'calculaperu:exchange-rates:v2';

function hasValidQuote(quote: PublishedExchangeRate | undefined): quote is PublishedExchangeRate {
  return Boolean(quote && quote.buyRate > 0 && quote.sellRate > 0);
}

function readCachedRates(): PublishedExchangeResponse | null {
  try {
    const cached = JSON.parse(localStorage.getItem(EXCHANGE_RATE_CACHE_KEY) ?? 'null') as PublishedExchangeResponse | null;
    const isFresh = typeof cached?.cachedAt === 'number' && Date.now() - cached.cachedAt < 86_400_000;
    if (!cached || !isFresh || (!hasValidQuote(cached.rates.market) && !hasValidQuote(cached.rates.sbs))) return null;
    return cached;
  } catch {
    return null;
  }
}

function keepAvailableSource(current: ExchangeSource, data: PublishedExchangeResponse): ExchangeSource {
  if (current === 'custom') return current;
  return hasValidQuote(data.rates[current]) ? current : data.defaultSource;
}

async function requestPublishedRate(): Promise<PublishedExchangeResponse> {
  const response = await fetch(`/api/tipo-de-cambio?refresh=${Date.now()}`, { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok || !data.success || !data.rates) {
    throw new Error(data.message ?? 'Respuesta inválida');
  }
  const rates = data.rates as Partial<Record<PublishedSource, PublishedExchangeRate>>;
  if (!hasValidQuote(rates.market) && !hasValidQuote(rates.sbs)) {
    throw new Error('La API no devolvió una cotización completa');
  }
  return { defaultSource: data.defaultSource, rates };
}

export default function TipoDeCambioPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'tipo-de-cambio-dolar-sunat') || {
    id: 'tipo-de-cambio-dolar-sunat',
    slug: '/tipo-de-cambio-dolar-sunat',
    title: 'Calculadora de Tipo de Cambio Dólar / Soles Hoy',
    shortTitle: 'Tipo de Cambio Dólar / Soles',
    description: 'Convierte dólares a soles automáticamente con la tasa USD/PEN actualizada y la última cotización SBS disponible.',
    cardSummary: 'Calcula conversiones con una tasa USD/PEN actualizada',
    category: 'tributario' as const,
    tag: 'DÓLAR',
    icon: 'DollarSign',
    badge: 'Actualizado',
    keywords: ['tipo de cambio sunat', 'dolar a soles hoy', 'tipo de cambio sbs hoy'],
  };

  const [amount, setAmount] = useState<number>(100);
  const [conversionMode, setConversionMode] = useState<ExchangeConversionMode>('usd_to_pen');
  const [source, setSource] = useState<ExchangeSource>('market');
  const [publishedRates, setPublishedRates] = useState<PublishedExchangeResponse['rates']>({});
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('Consultando el precio del dólar...');
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);

  const [customBuyRate, setCustomBuyRate] = useState<number>(0);
  const [customSellRate, setCustomSellRate] = useState<number>(0);
  const [showCustomRates, setShowCustomRates] = useState<boolean>(false);

  const fetchLiveRates = useCallback(async () => {
    try {
      setIsLoadingLive(true);
      const data = await requestPublishedRate();
      setPublishedRates(data.rates);
      localStorage.setItem(EXCHANGE_RATE_CACHE_KEY, JSON.stringify({ ...data, cachedAt: Date.now() }));
      setSource((current) => keepAvailableSource(current, data));
      const preferred = data.rates[data.defaultSource];
      setLastUpdatedText(`Actualizado automáticamente · ${preferred?.effectiveDate ?? 'hoy'}`);
    } catch {
      const cached = readCachedRates();
      if (cached) {
        setPublishedRates(cached.rates);
        setSource((current) => keepAvailableSource(current, cached));
        setLastUpdatedText('Sin conexión · usando la última cotización guardada');
      } else {
        setSource('custom');
        setShowCustomRates(true);
        setLastUpdatedText('No se pudo actualizar; ingresa ambas tasas manualmente');
      }
    } finally {
      setIsLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchLiveRates(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchLiveRates]);

  const selectedPublishedRate = source === 'custom' ? undefined : publishedRates[source];
  const currentBuy = source === 'custom' ? customBuyRate : selectedPublishedRate?.buyRate ?? 0;
  const currentSell = source === 'custom' ? customSellRate : selectedPublishedRate?.sellRate ?? 0;
  const hasCompleteRate = currentBuy > 0 && currentSell > 0;
  const availablePublishedSource: PublishedSource | null = hasValidQuote(publishedRates.market)
    ? 'market'
    : hasValidQuote(publishedRates.sbs)
      ? 'sbs'
      : null;

  const result = calculateExchangeRate({
    amount,
    conversionMode,
    source,
    customBuyRate: currentBuy,
    customSellRate: currentSell,
  });

  const isUsdToPen = conversionMode === 'usd_to_pen';

  const shareSummary = `Tipo de Cambio Perú (${result.sourceName}):
${result.equivalentText}
Compra: S/ ${result.buyRate.toFixed(3)} | Venta: S/ ${result.sellRate.toFixed(3)}`;

  const faqs = [
    {
      question: '¿Con qué frecuencia se actualiza el tipo de cambio?',
      answer: 'La tasa media USD/PEN se actualiza automáticamente cada 30 minutos. También mostramos la última compra y venta del sistema bancario publicada por la SBS mediante BCRPData. Ninguna de estas tasas reemplaza la cotización final de tu banco o casa de cambio.',
    },
    {
      question: '¿Qué tipo de cambio se utiliza para declarar en SUNAT y emitir facturas?',
      answer: 'Para emitir comprobantes de pago y declarar impuestos en moneda extranjera, la SUNAT establece que para compras se usa el tipo de cambio venta, y para ventas se usa el tipo de cambio compra publicado por la SBS al cierre del día anterior.',
    },
    {
      question: '¿Puedo ingresar la tasa exacta que me da mi banco o cambista?',
      answer: 'Sí. Puedes activar la opción de "Ajustar Tasa Personalizada" para ingresar la cotización exacta en céntimos que te ofrece tu aplicativo bancario o casa de cambio.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Calcula equivalencias entre dólares y soles con una tasa USD/PEN actualizada automáticamente o con la última compra y venta SBS disponible. Verifica la cotización final de tu banco o cambista antes de realizar una operación.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          
          {/* Header with Live Pulse indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Conversión referencial</h2>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{lastUpdatedText}</span>
                </div>
              </div>
            </div>

            {/* Mode Switch Button */}
            <button
              type="button"
              onClick={() => setConversionMode(isUsdToPen ? 'pen_to_usd' : 'usd_to_pen')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer transition-all shadow-2xs self-start sm:self-auto"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>Invertir ({isUsdToPen ? 'USD a PEN' : 'PEN a USD'})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="exchangeAmount"
              label={isUsdToPen ? 'Monto en Dólares (USD)' : 'Monto en Soles (PEN)'}
              prefix={isUsdToPen ? '$' : 'S/'}
              value={amount}
              onChange={(val) => setAmount(val)}
              placeholder="100.00"
              required
            />

            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
                Fuente de Tipo de Cambio
              </label>
              <select
                value={source}
                onChange={(e) => {
                  const nextSource = e.target.value as ExchangeSource;
                  setSource(nextSource);
                  setShowCustomRates(nextSource === 'custom');
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-600"
              >
                <option value="market" disabled={!hasValidQuote(publishedRates.market)}>
                  Mercado USD/PEN actualizado
                </option>
                <option value="sbs" disabled={!hasValidQuote(publishedRates.sbs)}>
                  Compra y venta SBS vía BCRPData
                </option>
                <option value="custom">Ingresar Tasa Personalizada</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-xs text-slate-600 dark:text-slate-300">
            <strong>Fuente:</strong>{' '}
            {source === 'market'
              ? 'tasa media USD/PEN del mercado, actualizada automáticamente. Compra y venta son iguales porque el proveedor no publica spread.'
              : source === 'sbs'
                ? 'BCRPData, series SBS PD04639PD y PD04640PD; corresponde al último día publicado.'
                : 'tasas ingresadas manualmente por ti.'}
          </div>

          {/* Toggle Custom Rates Box */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (showCustomRates || source === 'custom') {
                  setShowCustomRates(false);
                  if (availablePublishedSource) setSource(availablePublishedSource);
                } else {
                  setShowCustomRates(true);
                  setSource('custom');
                }
              }}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>{showCustomRates ? 'Ocultar ajuste manual' : '⚙️ Editar o ingresar tasa manual'}</span>
            </button>

            <button
              type="button"
              onClick={() => void fetchLiveRates()}
              disabled={isLoadingLive}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              title="Actualizar tipo de cambio"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingLive ? 'animate-spin' : ''}`} />
              <span>Refrescar</span>
            </button>
          </div>

          {showCustomRates && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 grid grid-cols-2 gap-4 animate-in fade-in">
              <InputNumber
                id="customBuy"
                label="Tasa de Compra (S/)"
                value={customBuyRate}
                onChange={(val) => setCustomBuyRate(val)}
                step={0.001}
                placeholder="3.345"
              />
              <InputNumber
                id="customSell"
                label="Tasa de Venta (S/)"
                value={customSellRate}
                onChange={(val) => setCustomSellRate(val)}
                step={0.001}
                placeholder="3.355"
              />
            </div>
          )}

        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Resultado de Conversión
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                {result.sourceName}
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {isUsdToPen ? 'Monto Recibido en Soles' : 'Monto Recibido en Dólares'}
              </span>
              <div
                title={hasCompleteRate ? (isUsdToPen ? formatCurrency(result.convertedAmount) : `$ ${formatNumber(result.convertedAmount)} USD`) : 'Esperando una cotización completa'}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-mono tracking-tight break-words px-2"
              >
                {hasCompleteRate
                  ? isUsdToPen
                    ? formatCurrency(result.convertedAmount)
                    : `$ ${formatNumber(result.convertedAmount)} USD`
                  : '—'}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                {hasCompleteRate
                  ? `Tasa aplicada: S/ ${isUsdToPen ? result.buyRate.toFixed(3) : result.sellRate.toFixed(3)}`
                  : 'Esperando una cotización completa'}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Tipo de Cambio Compra"
                value={hasCompleteRate ? `S/ ${result.buyRate.toFixed(3)}` : '—'}
                type="success"
                subValue="Si vendes dólares"
              />
              <ResultMetricCard
                label="Tipo de Cambio Venta"
                value={hasCompleteRate ? `S/ ${result.sellRate.toFixed(3)}` : '—'}
                type="neutral"
                subValue="Si compras dólares"
              />
            </div>

            {hasCompleteRate && <div className="flex flex-col sm:flex-row gap-2.5">
              <ExportPdfButton
                className="flex-1"
                getReportOptions={() => ({
                  title: 'Liquidación de Cambio de Moneda',
                  subtitle: `Conversión referencial realizada vía CalculaPerú (${result.sourceName})`,
                  items: [
                    { label: 'Monto ingresado', value: isUsdToPen ? `$ ${formatNumber(amount)} USD` : formatCurrency(amount) },
                    { label: 'Operación realizada', value: isUsdToPen ? 'Venta de Dólares (USD a PEN)' : 'Compra de Dólares (PEN a USD)' },
                    { label: 'Tasa de Compra', value: `S/ ${result.buyRate.toFixed(3)}` },
                    { label: 'Tasa de Venta', value: `S/ ${result.sellRate.toFixed(3)}` },
                    { label: 'Diferencial Cambiario (Spread)', value: `S/ ${result.spreadDifference.toFixed(3)}` },
                    { label: 'Total Convertido', value: isUsdToPen ? formatCurrency(result.convertedAmount) : `$ ${formatNumber(result.convertedAmount)} USD`, isHighlight: true },
                  ],
                  totalLabel: 'Importe Resultante',
                  totalValue: isUsdToPen ? formatCurrency(result.convertedAmount) : `$ ${formatNumber(result.convertedAmount)} USD`,
                  notes: [
                    source === 'market'
                      ? 'Tasa media USD/PEN actualizada automáticamente; no representa el spread de una entidad financiera.'
                      : source === 'sbs'
                        ? 'Tipo de cambio basado en la última publicación disponible de las series SBS en BCRPData.'
                        : 'Conversión realizada con las tasas ingresadas manualmente por el usuario.',
                    'Para transacciones bancarias o en ventanilla, consulte la cotización en tiempo real de su entidad financiera.',
                  ],
                })}
              />
            </div>}

            {hasCompleteRate && <div className="mt-3">
              <ShareButtons title="Tipo de Cambio Dólar Soles Perú" shareText={shareSummary} />
            </div>}
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
