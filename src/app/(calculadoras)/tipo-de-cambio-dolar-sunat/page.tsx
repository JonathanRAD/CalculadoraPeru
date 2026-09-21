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
const FALLBACK_CACHE_MAX_AGE_MS = 7 * 86_400_000;

function hasValidQuote(quote: PublishedExchangeRate | undefined): quote is PublishedExchangeRate {
  return Boolean(quote && quote.buyRate > 0 && quote.sellRate > 0);
}

function readCachedRates(): PublishedExchangeResponse | null {
  try {
    const cached = JSON.parse(localStorage.getItem(EXCHANGE_RATE_CACHE_KEY) ?? 'null') as PublishedExchangeResponse | null;
    const isFresh = typeof cached?.cachedAt === 'number' && Date.now() - cached.cachedAt < FALLBACK_CACHE_MAX_AGE_MS;
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
  const response = await fetch('/api/tipo-de-cambio', { cache: 'no-store' });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data.success || !data.rates) {
    throw new Error(data?.message ?? 'Respuesta inválida');
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
      question: '¿Por qué existen diferencias entre el dólar interbancario, el dólar de la calle y el dólar SUNAT?',
      answer: 'El dólar interbancario es la tasa mayorista a la que transan los bancos entre sí. Las casas de cambio y cambistas de calle aplican un margen comercial minorista (spread). Por su parte, la SUNAT utiliza por mandato legal la cotización de cierre del día hábil anterior publicada por la SBS en el diario oficial El Peruano, sirviendo únicamente para fines tributarios y contables.',
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
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Guía Cambiaria: ¿Cómo opera el Tipo de Cambio en el Perú (SUNAT vs. SBS)?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              En el Perú rige un sistema de <strong>flotación cambiaria administrada</strong> donde el precio del dólar estadounidense (USD) frente al sol peruano (PEN) fluctúa libremente por oferta y demanda, con intervenciones de compra o venta del <strong>Banco Central de Reserva del Perú (BCRP)</strong> para atenuar la volatilidad excesiva.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Regla oficial de SUNAT para Facturación y Declaraciones Tributarias
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              De acuerdo con el artículo 50 del Reglamento del TUO de la Ley del IGV y el artículo 61 de la Ley del Impuesto a la Renta:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-[#08734F] dark:text-emerald-400 block">• Para Comprobantes de Venta:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Se debe utilizar el tipo de cambio promedio ponderado <strong>COMPRA</strong> cotizado por la SBS al cierre del día anterior.
                </p>
              </div>

              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-amber-800 dark:text-amber-400 block">• Para Registro de Compras (Gastos):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Se debe utilizar el tipo de cambio promedio ponderado <strong>VENTA</strong> cotizado por la SBS al cierre del día anterior.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Comparativo de Cotizaciones en el Mercado Peruano
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Mercado / Ámbito</th>
                    <th className="p-2.5">¿Dónde se aplica?</th>
                    <th className="p-2.5">Características del Spread</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-semibold">Mercado Bancario Comercial</td>
                    <td className="p-2.5 text-slate-500">Ventanillas y banca móvil de bancos</td>
                    <td className="p-2.5">Spread más amplio (entre 3 a 7 céntimos)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Casas de Cambio Digitales / Paralelo</td>
                    <td className="p-2.5 text-slate-500">Plataformas fintech y cambistas autorizados</td>
                    <td className="p-2.5">Spread más ajustado y competitivo (1 a 2 céntimos)</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950 font-bold">
                    <td className="p-2.5 text-slate-900 dark:text-white">Tipo de Cambio SBS / SUNAT</td>
                    <td className="p-2.5 text-slate-500 font-normal">Contabilidad y liquidación de impuestos</td>
                    <td className="p-2.5 text-[#08734F] dark:text-emerald-300">Oficial para libros contables y PDT</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Normativa de referencia:</span>
            <p>
              • <strong>Decreto Supremo N° 055-99-EF:</strong> Texto Único Ordenado de la Ley del IGV (Art. 50 sobre conversión de moneda extranjera).<br />
              • <strong>Decreto Supremo N° 179-2004-EF:</strong> TUO de la Ley del Impuesto a la Renta (Art. 61 sobre diferencias de cambio).<br />
              • <strong>Resolución SBS N° 11356-2008:</strong> Metodología de cálculo y publicación de tipos de cambio oficiales.
            </p>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Header with Live Pulse indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[#08734F] dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Conversión referencial</h2>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#08734F] dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{lastUpdatedText}</span>
                </div>
              </div>
            </div>

            {/* Mode Switch Button */}
            <button
              type="button"
              onClick={() => setConversionMode(isUsdToPen ? 'pen_to_usd' : 'usd_to_pen')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-[#08734F] dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer transition-all shadow-2xs self-start sm:self-auto"
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
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#08734F]"
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
              className="text-xs font-bold text-[#08734F] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
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
              {!availablePublishedSource && (
                <p className="col-span-2 text-xs font-semibold leading-5 text-amber-800 dark:text-amber-300">
                  La actualización automática no respondió. Los campos están vacíos: escribe ambas tasas para calcular o pulsa Refrescar.
                </p>
              )}
              <InputNumber
                id="customBuy"
                label="Tasa de Compra (S/)"
                value={customBuyRate}
                onChange={(val) => setCustomBuyRate(val)}
                step={0.001}
                placeholder="Escribe la tasa"
                helpText="Obligatoria"
              />
              <InputNumber
                id="customSell"
                label="Tasa de Venta (S/)"
                value={customSellRate}
                onChange={(val) => setCustomSellRate(val)}
                step={0.001}
                placeholder="Escribe la tasa"
                helpText="Obligatoria"
              />
            </div>
          )}

        </div>

        {/* Results Column — Proposal A */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-200/90 dark:border-emerald-800/80 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-300">
                Resultado de Conversión
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold text-[#08734F] dark:text-emerald-300">
                {result.sourceName}
              </span>
            </div>

            {/* Big Main Result Box (Non-truncated tabular numerals) */}
            <div className="rounded-2xl bg-emerald-50/50 dark:bg-slate-950 border border-emerald-100 dark:border-emerald-900/60 p-5 sm:p-6 text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isUsdToPen ? 'Monto Recibido en Soles' : 'Monto Recibido en Dólares'}
              </span>
              <div
                title={hasCompleteRate ? (isUsdToPen ? formatCurrency(result.convertedAmount) : `$ ${formatNumber(result.convertedAmount)} USD`) : 'Esperando una cotización completa'}
                className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-[#08734F] dark:text-emerald-400 mt-1.5 font-mono tracking-tight tabular-nums break-words leading-tight"
              >
                {hasCompleteRate
                  ? isUsdToPen
                    ? formatCurrency(result.convertedAmount)
                    : `$ ${formatNumber(result.convertedAmount)} USD`
                  : '—'}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
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
