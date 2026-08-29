'use client';

import React, { useState, useEffect } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import {
  calculateExchangeRate,
  ExchangeConversionMode,
  ExchangeSource,
  PERU_EXCHANGE_RATES,
} from '@/core/calculators/exchangeRate';
import { formatCurrency, formatNumber } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { ExportPdfButton } from '@/shared/components/ui/ExportPdfButton';
import { ArrowLeftRight, Landmark, DollarSign, Settings2, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function TipoDeCambioPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'tipo-de-cambio-dolar-sunat') || {
    id: 'tipo-de-cambio-dolar-sunat',
    slug: '/tipo-de-cambio-dolar-sunat',
    title: 'Calculadora de Tipo de Cambio Dólar / Soles (SUNAT, SBS y Ocoña)',
    shortTitle: 'Tipo de Cambio Dólar / Soles',
    description: 'Convierte dólares a soles peruanos y compara el tipo de cambio oficial de SUNAT, SBS y casas de cambio del mercado paralelo en tiempo real.',
    cardSummary: 'Calcula conversión Dólar/Soles con tasas en vivo',
    category: 'tributario' as const,
    tag: 'DÓLAR',
    icon: 'DollarSign',
    badge: 'En Vivo',
    keywords: ['tipo de cambio sunat en vivo', 'dolar a soles hoy', 'precio del dolar en tiempo real peru', 'tipo de cambio sbs hoy'],
  };

  const [amount, setAmount] = useState<number>(100);
  const [conversionMode, setConversionMode] = useState<ExchangeConversionMode>('usd_to_pen');
  const [source, setSource] = useState<ExchangeSource>('sunat');
  
  // Dynamic live rates state
  const [liveRates, setLiveRates] = useState(PERU_EXCHANGE_RATES);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('Cargando cotización en vivo...');
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);

  const [customBuyRate, setCustomBuyRate] = useState<number>(3.345);
  const [customSellRate, setCustomSellRate] = useState<number>(3.355);
  const [showCustomRates, setShowCustomRates] = useState<boolean>(false);

  // Fetch live exchange rates from our internal API on mount
  const fetchLiveRates = async () => {
    try {
      setIsLoadingLive(true);
      const res = await fetch('/api/tipo-de-cambio');
      if (res.ok) {
        const data = await res.json();
        if (data.rates) {
          setLiveRates({
            sunat: {
              ...liveRates.sunat,
              buyRate: data.rates.sunat.buyRate,
              sellRate: data.rates.sunat.sellRate,
            },
            parallel_ocona: {
              ...liveRates.parallel_ocona,
              buyRate: data.rates.parallel_ocona.buyRate,
              sellRate: data.rates.parallel_ocona.sellRate,
            },
            sbs_banks: {
              ...liveRates.sbs_banks,
              buyRate: data.rates.sbs_banks.buyRate,
              sellRate: data.rates.sbs_banks.sellRate,
            },
          });
          setCustomBuyRate(data.rates.sunat.buyRate);
          setCustomSellRate(data.rates.sunat.sellRate);
          setLastUpdatedText(`Actualizado hoy automáticamente (${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })})`);
        }
      }
    } catch (e) {
      setLastUpdatedText('Cotización referencial del día');
    } finally {
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    fetchLiveRates();
  }, []);

  const activeSourceConfig = source !== 'custom' ? liveRates[source] : null;
  const currentBuy = showCustomRates ? customBuyRate : (activeSourceConfig?.buyRate || 3.345);
  const currentSell = showCustomRates ? customSellRate : (activeSourceConfig?.sellRate || 3.355);

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
      answer: 'Nuestra plataforma sincroniza automáticamente las cotizaciones de mercado y SUNAT a lo largo del día para ofrecerte la tasa exacta al segundo.',
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
            Calcula la equivalencia exacta entre Dólares Estadounidenses (USD) y Soles Peruanos (PEN) con cotizaciones sincronizadas en tiempo real de la SUNAT, el promedio bancario y el mercado paralelo de Ocoña.
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Conversión en Vivo</h2>
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
                  const s = e.target.value as ExchangeSource;
                  setSource(s);
                  if (s !== 'custom') {
                    setCustomBuyRate(liveRates[s].buyRate);
                    setCustomSellRate(liveRates[s].sellRate);
                  }
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-600"
              >
                <option value="sunat">SUNAT Oficial (Facturación e Impuestos)</option>
                <option value="parallel_ocona">Paralelo / Ocoña y Casas Digitales</option>
                <option value="sbs_banks">Bancos Tradicionales / SBS</option>
                <option value="custom">Ingresar Tasa Personalizada</option>
              </select>
            </div>
          </div>

          {/* Rates Cards Grid with Live Data */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {(Object.keys(liveRates) as Array<Exclude<ExchangeSource, 'custom'>>).map((srcKey) => {
              const r = liveRates[srcKey];
              const isSelected = source === srcKey && !showCustomRates;
              return (
                <button
                  key={srcKey}
                  type="button"
                  onClick={() => {
                    setSource(srcKey);
                    setShowCustomRates(false);
                    setCustomBuyRate(r.buyRate);
                    setCustomSellRate(r.sellRate);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/90 dark:bg-emerald-950/70 ring-1 ring-emerald-600 dark:ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase block truncate">
                    {r.badge}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white block mt-0.5 truncate">
                    {r.name.split(' ')[0]}
                  </span>
                  <div className="mt-2 text-[11px] font-mono text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div>C: <strong className="text-emerald-700 dark:text-emerald-400">S/ {r.buyRate.toFixed(3)}</strong></div>
                    <div>V: <strong className="text-slate-800 dark:text-slate-200">S/ {r.sellRate.toFixed(3)}</strong></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Toggle Custom Rates Box */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCustomRates(!showCustomRates)}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>{showCustomRates ? 'Ocultar ajuste manual' : '⚙️ Editar o ingresar tasa manual'}</span>
            </button>

            <button
              type="button"
              onClick={fetchLiveRates}
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
                title={isUsdToPen ? formatCurrency(result.convertedAmount) : `$ ${formatNumber(result.convertedAmount)} USD`}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-mono tracking-tight break-words px-2"
              >
                {isUsdToPen ? formatCurrency(result.convertedAmount) : `$ ${formatNumber(result.convertedAmount)} USD`}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                Tasa aplicada: S/ {isUsdToPen ? result.buyRate.toFixed(3) : result.sellRate.toFixed(3)}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Tipo de Cambio Compra"
                value={`S/ ${result.buyRate.toFixed(3)}`}
                type="success"
                subValue="Si vendes dólares"
              />
              <ResultMetricCard
                label="Tipo de Cambio Venta"
                value={`S/ ${result.sellRate.toFixed(3)}`}
                type="neutral"
                subValue="Si compras dólares"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <ExportPdfButton
                className="flex-1"
                getReportOptions={() => ({
                  title: 'Liquidación de Cambio de Moneda',
                  subtitle: `Conversión en tiempo real realizada vía CalculaPerú (${result.sourceName})`,
                  items: [
                    { label: 'Monto ingresado', value: isUsdToPen ? `$ ${formatNumber(amount)} USD` : formatCurrency(amount) },
                    { label: 'Operación realizada', value: isUsdToPen ? 'Venta de Dólares (USD a PEN)' : 'Compra de Dólares (PEN a USD)' },
                    { label: 'Tasa de Compra (En vivo)', value: `S/ ${result.buyRate.toFixed(3)}` },
                    { label: 'Tasa de Venta (En vivo)', value: `S/ ${result.sellRate.toFixed(3)}` },
                    { label: 'Diferencial Cambiario (Spread)', value: `S/ ${result.spreadDifference.toFixed(3)}` },
                    { label: 'Total Convertido', value: isUsdToPen ? formatCurrency(result.convertedAmount) : `$ ${formatNumber(result.convertedAmount)} USD`, isHighlight: true },
                  ],
                  totalLabel: 'Importe Resultante',
                  totalValue: isUsdToPen ? formatCurrency(result.convertedAmount) : `$ ${formatNumber(result.convertedAmount)} USD`,
                  notes: [
                    'Tipo de cambio sincronizado en tiempo real para el mercado peruano.',
                    'Para transacciones bancarias o en ventanilla, consulte la cotización en tiempo real de su entidad financiera.',
                  ],
                })}
              />
            </div>

            <div className="mt-3">
              <ShareButtons title="Tipo de Cambio Dólar Soles Perú en Vivo" shareText={shareSummary} />
            </div>
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
