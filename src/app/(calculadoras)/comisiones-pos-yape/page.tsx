'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculatePosCommission, PosGateway, GATEWAY_RATES } from '@/core/calculators/posCommissions';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { CreditCard } from 'lucide-react';

export default function ComisionesPosYapePage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'comisiones-pos-yape')!;

  const [amount, setAmount] = useState<number>(100);
  const [gateway, setGateway] = useState<PosGateway>('yape');
  const [mode, setMode] = useState<'deduct_from_sale' | 'add_to_charge'>('deduct_from_sale');

  const result = calculatePosCommission({
    amount,
    gateway,
    mode,
  });

  const shareSummary = `Pasarela: ${result.gatewayName}
Monto Cobrado al Cliente: ${formatCurrency(result.chargeAmount)}
Comisión Total (con IGV): ${formatCurrency(result.totalCommissionFee)} (${formatPercent(result.commissionRate * 1.18)})
Monto Líquido en Cuenta: ${formatCurrency(result.netReceived)}`;

  const faqs = [
    {
      question: '¿Por qué la comisión de las pasarelas en Perú incluye IGV?',
      answer: 'La comisión cobrada por Niubiz, Izipay, Culqi o Mercado Pago es un servicio financiero gravado con el 18% de IGV. La pasarela emite una factura electrónica por dicha comisión, la cual puedes utilizar como crédito fiscal en tu contabilidad.',
    },
    {
      question: '¿Yape cobra comisión?',
      answer: 'Yape para personas naturales es gratuito. Para negocios registrados en "Yape Empresa", se cobra una comisión fija del 2.95% + IGV sobre las ventas cobradas a partir del plan comercial.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Te permite conocer la comisión exacta con IGV que te retendrán al cobrar por POS físico o pasarelas digitales, o calcular el precio que debes cobrar para recibir el monto íntegro.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configuración del Cobro</h2>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 dark:bg-slate-950 p-1.5 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMode('deduct_from_sale')}
              className={`rounded-xl py-3 text-xs font-bold transition-all cursor-pointer ${
                mode === 'deduct_from_sale'
                  ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📉 Cobro S/ X (¿Cuánto me queda?)
            </button>
            <button
              type="button"
              onClick={() => setMode('add_to_charge')}
              className={`rounded-xl py-3 text-xs font-bold transition-all cursor-pointer ${
                mode === 'add_to_charge'
                  ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🎯 Quiero recibir S/ X (¿Cuánto cobrar?)
            </button>
          </div>

          <InputNumber
            id="amount"
            label={mode === 'deduct_from_sale' ? 'Monto total a cobrar al cliente' : 'Monto neto que deseas recibir en tu cuenta'}
            prefix="S/"
            value={amount}
            onChange={(amount) => setAmount(amount)}
            placeholder="100.00"
            required
          />

          {/* Gateway Buttons */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
              Pasarela o POS
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(GATEWAY_RATES) as PosGateway[]).map((key) => {
                const info = GATEWAY_RATES[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setGateway(key)}
                    className={`rounded-xl p-2.5 text-xs font-bold text-left border transition-all cursor-pointer ${
                      gateway === key
                        ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-700'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div>{info.name}</div>
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                      Tasa: {info.rate}% + IGV
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                {mode === 'deduct_from_sale' ? 'Monto Líquido en Cuenta' : 'Monto Total a Cobrar'}
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                🇵🇪 En Soles
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {mode === 'deduct_from_sale' ? 'Recibirás en tu Banco' : 'Cobrar al Cliente'}
              </span>
              <div className="text-3xl sm:text-5xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-mono tracking-tight">
                {formatCurrency(mode === 'deduct_from_sale' ? result.netReceived : result.chargeAmount)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Comisión total descontada: {formatCurrency(result.totalCommissionFee)}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Comisión Neta"
                value={formatCurrency(result.commissionFeeBeforeTax)}
                type="warning"
                subValue={`Tasa: ${formatPercent(result.commissionRate)}`}
              />
              <ResultMetricCard
                label="IGV Comisión (18%)"
                value={formatCurrency(result.igvOnCommission)}
                type="neutral"
                subValue="Crédito fiscal facturado"
              />
            </div>

            <ShareButtons title="Comisiones POS y Yape" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
