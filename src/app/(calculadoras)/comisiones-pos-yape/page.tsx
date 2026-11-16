'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { ReferenceDataNote } from '@/shared/components/ui/ReferenceDataNote';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculatePosCommission, PosGateway, GATEWAY_RATES } from '@/core/calculators/posCommissions';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { PayslipResult } from '@/shared/components/ui/PayslipResult';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { CreditCard } from 'lucide-react';

export default function ComisionesPosYapePage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'comisiones-pos-yape')!;

  const [amount, setAmount] = useState<number>(100);
  const [gateway, setGateway] = useState<PosGateway>('yape');
  const [mode, setMode] = useState<'deduct_from_sale' | 'add_to_charge'>('deduct_from_sale');
  const [customRate, setCustomRate] = useState<number>(3.5);
  const [customFixedFee, setCustomFixedFee] = useState<number>(0);

  const result = calculatePosCommission({
    amount,
    gateway,
    mode,
    customRatePercentage: customRate,
    customFixedFee,
  });

  const shareSummary = `Pasarela: ${result.gatewayName}
Monto Cobrado al Cliente: ${formatCurrency(result.chargeAmount)}
Comisión Total (con IGV): ${formatCurrency(result.totalCommissionFee)} (${formatPercent(result.effectiveRatePercentage)}${result.fixedFee > 0 ? ` + ${formatCurrency(result.fixedFee)} por venta` : ''})
Monto Líquido en Cuenta: ${formatCurrency(result.netReceived)}`;

  const faqs = [
    {
      question: '¿Por qué las comisiones de POS y pasarelas en Perú cobran IGV (18%) adicional?',
      answer: 'En la mayoría de operadores la comisión se publica sin IGV y se suma el 18 % al cobrarla (por ejemplo, Yape e Izipay). Algunos comparativos señalan que ciertas pasarelas, como Culqi o Mercado Pago, publican su tarifa sin sumar IGV. Revisa tu contrato y la factura mensual de tu operador para saber qué parte es IGV; cuando lo es, puede ser crédito fiscal si tu régimen declara IGV.',
    },
    {
      question: '¿Cuánto cobra Yape Empresa en comisiones a los negocios?',
      answer: 'Yape cobra una comisión del 2.95% + IGV sobre las ventas cobradas a los negocios inscritos en "Yape Empresa". Al sumar el 18% del IGV a la tasa base, el descuento total efectivo directo en tu cuenta bancaria es de aproximadamente 3.481% del monto total de cada transacción.',
    },
    {
      question: '¿Cuál es la diferencia entre cobrar tarjeta de débito y de crédito en Perú?',
      answer: 'Las tarifas cambian según el tipo de tarjeta (débito o crédito, nacional o extranjera), el rubro del comercio y lo que negocies con el operador. Por eso conviene pedir el tarifario por escrito y usar la opción de comisión personalizada con la tasa y el cargo fijo de tu contrato.',
    },
    {
      question: '¿Cómo calcular el precio que debo cobrar para que la comisión no reduzca mi ganancia?',
      answer: 'Si deseas recibir un monto neto exacto (por ejemplo S/ 100) y la tasa total con IGV es del 4%, no debes sumar simplemente el 4% al precio (S/ 104 cobraría el 4% sobre 104 = 4.16, recibiendo S/ 99.84). La fórmula matemática correcta es: Monto Neto / (1 - Tasa Efectiva). Para S/ 100: 100 / (1 - 0.04) = S/ 104.17.',
    },
    {
      question: '¿En cuánto tiempo se deposita el dinero de las ventas con POS?',
      answer: 'La mayoría de operadores en Perú (Niubiz, Izipay, VendeMás) abonan el dinero al siguiente día útil hábil (24 a 48 horas) si la cuenta de destino es del mismo banco recaudador. Si es transferencia interbancaria hacia otra entidad, puede tardar hasta 48 o 72 horas hábiles según el cronograma de transferencias de la CCE.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      dataNote={
        <ReferenceDataNote
          reviewed="2026-11-14"
          sources={[
            { label: 'El Peruano: Yape Empresa, 2.95 % sobre las ventas del día', url: 'https://elperuano.pe/noticia/240612-yape-aclara-que-aplicacion-seguira-siendo-gratis-para-usuarios' },
            { label: 'CONIT: comparativo de tarifas (octubre de 2026)', url: 'https://conit.pe/blog/izipay-vs-culqi-vs-niubiz-vs-mercado-pago' },
          ]}
        >
          Las comisiones dependen de tu contrato, tu rubro y el tipo de tarjeta (débito o crédito). La tasa de Yape para negocios (2.95 % + IGV) es la publicada por la empresa; las de Culqi, Mercado Pago e Izipay vienen de un comparativo de tarifas publicadas en octubre de 2026 y Niubiz no publica una tasa online fija. Usa la opción de comisión personalizada con la tasa y el cargo fijo de tu contrato.
        </ReferenceDataNote>
      }
      faqs={faqs}
      educationalContent={
        <div className="space-y-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            Cobrar mediante tarjetas de crédito, débito o billeteras móviles es indispensable para cualquier comercio formal o emprendedor en el Perú. Sin embargo, no calcular adecuadamente la tasa de comisión y su respectivo <strong>IGV (18%)</strong> puede consumir una parte significativa del margen de utilidad de tus productos.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            Comparativa de Comisiones de Pasarelas en Perú
          </h3>
          <p>
            A continuación se resumen las tarifas publicadas por los principales operadores. Las de Culqi, Mercado Pago e Izipay provienen de un comparativo de tarifas publicadas en octubre de 2026 (CONIT); la de Yape es la publicada por la empresa. Tu tasa real depende de tu contrato, tu rubro y el tipo de tarjeta.
          </p>

          <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-[#2C3744]">
            <table className="w-full text-left text-[13px] sm:text-[15px]">
              <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                <tr>
                  <th className="p-3">Operador / Medio</th>
                  <th className="p-3">Comisión Base</th>
                  <th className="p-3">Tasa Final con IGV (18%)</th>
                  <th className="p-3">Abono en Cuenta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold">Yape para Empresas</td>
                  <td className="p-3">2.95%</td>
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">~3.48% (con IGV)</td>
                  <td className="p-3">Según condiciones de Yape</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Culqi</td>
                  <td className="p-3">3.44% + US$ 0.20 por venta</td>
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">Sin IGV, según el comparativo</td>
                  <td className="p-3">El mismo día</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Mercado Pago</td>
                  <td className="p-3">3.49% + S/ 1.00 (al instante) o 3.29% + S/ 1.00 (a 14 días)</td>
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">Sin IGV, según el comparativo</td>
                  <td className="p-3">Al instante o a 14 días</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Izipay</td>
                  <td className="p-3">3.44% + S/ 0.69 por venta</td>
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">~4.06% + S/ 0.81 (con IGV)</td>
                  <td className="p-3">Día siguiente</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Niubiz</td>
                  <td className="p-3">No publica tasa online fija; se negocia</td>
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">Según contrato</td>
                  <td className="p-3">Día siguiente</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            El Crédito Fiscal de tus Comisiones
          </h3>
          <p>
            Recuerda solicitar mensualmente tu reporte o factura electrónica a tu operador. Cuando la comisión incluye IGV, ese IGV constituye <strong>Crédito Fiscal</strong> que tu contador debe declarar en el formulario mensual de SUNAT para descontar el IGV que le debes al fisco por tus ventas.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-lg border-2 border-slate-200/90 dark:border-[#2C3744] bg-white dark:bg-[#18202A] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#2C3744] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configuración del Cobro</h2>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 dark:bg-[#0E141B] p-1.5 border border-slate-200 dark:border-[#2C3744]">
            <button
              type="button"
              onClick={() => setMode('deduct_from_sale')}
              className={`rounded py-3 text-[13px] font-bold transition-all cursor-pointer ${
                mode === 'deduct_from_sale'
                  ? 'bg-white dark:bg-slate-800 text-brand-800 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cobro S/ X (¿Cuánto me queda?)
            </button>
            <button
              type="button"
              onClick={() => setMode('add_to_charge')}
              className={`rounded py-3 text-[13px] font-bold transition-all cursor-pointer ${
                mode === 'add_to_charge'
                  ? 'bg-white dark:bg-slate-800 text-brand-800 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Quiero recibir S/ X (¿Cuánto cobrar?)
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
            <label className="mb-1.5 block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
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
                    className={`min-h-12 rounded p-3 text-[15px] font-semibold text-left border transition-colors cursor-pointer ${
                      gateway === key
                        ? 'border-brand-700 bg-brand-50 dark:bg-brand-950/80 text-brand-900 dark:text-brand-300 ring-1 ring-brand-700'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0E141B] text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div>{info.name}</div>
                    <span className="text-[13px] font-normal text-slate-500 dark:text-slate-400">
                      Tasa: {key === 'personalizado' ? 'la de tu contrato' : `${info.rate}%${info.fixedFee > 0 ? ` + S/ ${info.fixedFee.toFixed(2)}` : ''}${info.igvApplies ? ' + IGV' : ''}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {gateway === 'personalizado' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputNumber
                id="customRate"
                label="Tasa de tu contrato (sin IGV)"
                suffix="%"
                value={customRate}
                onChange={(value) => setCustomRate(value)}
                max={100}
                placeholder="3.50"
              />
              <InputNumber
                id="customFixedFee"
                label="Cargo fijo por venta (opcional)"
                prefix="S/"
                value={customFixedFee}
                onChange={(value) => setCustomFixedFee(value)}
                placeholder="0.00"
              />
            </div>
          )}
        </div>
        {/* Resultado con forma de boleta */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <PayslipResult
            title={mode === 'deduct_from_sale' ? 'Monto Líquido en Cuenta' : 'Monto Total a Cobrar'}
            period={"En Soles"}
            amountHeader="Valor"
            lines={[
              { label: "Comisión Neta", amount: formatCurrency(result.commissionFeeBeforeTax), note: `Tasa: ${formatPercent(result.commissionRate)}${result.fixedFee > 0 ? ` + ${formatCurrency(result.fixedFee)} fijo` : ''}` },
              { label: "IGV Comisión (18%)", amount: formatCurrency(result.igvOnCommission), note: "Crédito fiscal facturado" },
            ]}
            totalLabel={mode === 'deduct_from_sale' ? 'Recibirás en tu Banco' : 'Cobrar al Cliente'}
            totalAmount={formatCurrency(mode === 'deduct_from_sale' ? result.netReceived : result.chargeAmount)}
            footnote={`Comisión total descontada: ${formatCurrency(result.totalCommissionFee)}`}
          >
            <ShareButtons title="Comisiones POS y Yape" shareText={shareSummary} />
          </PayslipResult>
        </div>

      </div>
    </CalculatorShell>
  );
}
