'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateIgv, IgvCalculationMode } from '@/core/calculators/tax';
import { formatCurrency } from '@/core/math/formatters';
import { getIgvIpmSplit } from '@/core/constants/peru';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { PayslipResult } from '@/shared/components/ui/PayslipResult';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Receipt, CheckCircle2 } from 'lucide-react';

export default function CalculadoraIgvPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'calculadora-igv')!;

  const [amount, setAmount] = useState<number>(100);
  const [mode, setMode] = useState<IgvCalculationMode>('add_igv');

  const split = getIgvIpmSplit();
  const result = calculateIgv({ amount, mode });
  const igvPortion = Math.round(result.baseAmount * split.igv * 100) / 100;
  const ipmPortion = Math.round((result.igvAmount - igvPortion) * 100) / 100;

  const shareSummary = `Base Imponible: ${formatCurrency(result.baseAmount)}
IGV (18% SUNAT): ${formatCurrency(result.igvAmount)}
Total Facturado: ${formatCurrency(result.totalAmount)}`;

  const faqs = [
    {
      question: '¿Cómo está descompuesta la tasa del 18% de IGV en el Perú?',
      answer: 'La tasa oficial del 18% aplicada en todas las operaciones comerciales gravadas se compone legalmente de dos tributos: el Impuesto General a las Ventas (IGV) y el Impuesto de Promoción Municipal (IPM). Por la Ley N° 32387, el IPM sube de forma gradual (2.5% en 2026, 3% en 2027 y 3.5% en 2028) y el IGV baja en la misma medida (15.5%, 15% y 14.5%), por lo que el total aplicable sigue siendo 18%. Ambos son administrados y recaudados conjuntamente por la SUNAT en un solo pago mensual a través del Formulario Virtual Declara Fácil 621.',
    },
    {
      question: '¿Cuál es la fórmula matemática para desglosar el IGV de una factura o boleta?',
      answer: 'Para calcular la Base Imponible a partir del precio total con IGV incluido, se divide el monto total entre 1.18. Por ejemplo, si una factura tiene un total de S/ 1,180.00: Base Imponible = S/ 1,180 / 1.18 = S/ 1,000.00. El monto de IGV exacto se obtiene restando el total menos la base (S/ 1,180 - S/ 1,000 = S/ 180.00).',
    },
    {
      question: '¿Qué es el Crédito Fiscal y cómo ayuda a las MYPES a pagar menos impuestos?',
      answer: 'El Crédito Fiscal es el IGV que una empresa paga al realizar compras de bienes o servicios estrictamente vinculados con su actividad económica (adquisición de mercadería, suministros, servicios de internet, alquiler de local comercial, etc.). Al momento de declarar el mes ante SUNAT, el IGV de las ventas (Débito Fiscal) se compensa directamente contra el IGV de las compras (Crédito Fiscal), pagando únicamente la diferencia a favor del fisco.',
    },
    {
      question: '¿Quiénes están exonerados o inafectos del pago del IGV en el territorio peruano?',
      answer: 'Conforme a los Apéndices I y II del TUO de la Ley del IGV, están exonerados ciertos productos de primera necesidad (hortalizas, legumbres, frutas frescas no procesadas), el servicio de transporte público urbano de pasajeros, la venta de libros impresos (Ley del Libro) y las operaciones comerciales realizadas por empresas domiciliadas en la Región Selva bajo la Ley de Promoción de la Inversión en la Amazonía (Ley 27037).',
    },
    {
      question: '¿Qué sucede si emito una boleta a consumidor final sin desglosar el IGV?',
      answer: 'En el Perú, las boletas de venta emitidas a consumidores finales deben consignar por mandato legal el importe total sin discriminar el IGV de forma separada en el cuerpo del comprobante, aunque el impuesto ya se encuentra incorporado internamente en el precio final pagado.',
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
              Manual Tributario: Cálculo oficial del IGV (18%) conforme a la SUNAT
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              El <strong>Impuesto General a las Ventas (IGV)</strong> es el tributo al valor agregado de naturaleza indirecta más importante del sistema tributario peruano. Grava todas las fases del ciclo de producción y comercialización de bienes muebles, contratos de construcción, la primera venta de inmuebles y la prestación o utilización de servicios en el país (Decreto Supremo N° 055-99-EF).
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-[#18202A] p-5 border border-slate-200 dark:border-[#2C3744] space-y-3 text-[13px] leading-relaxed">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              1. Fórmulas oficiales para la emisión y revisión de comprobantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Operación 1: Agregar IGV (+18%)</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Se usa cuando tienes el valor de venta sin impuesto (Base Imponible) y necesitas cotizar el precio final al cliente.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Total = Base Imponible × 1.18<br />
                  IGV = Base Imponible × 0.18
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Operación 2: Desglosar Factura (-18%)</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Se usa cuando recibes un cobro total o comprobante y necesitas saber cuánto dinero corresponde a costo real y cuánto a crédito fiscal.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Base Imponible = Total Facturado ÷ 1.18<br />
                  IGV = Total Facturado - Base Imponible
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              2. Caso práctico numérico con desglose comercial
            </h3>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Supongamos una microempresa en Lima que adquiere equipos de cómputo por un valor neto de <strong>S/ 2,500.00</strong> (Base Imponible) y luego vende servicios por un precio final cobrado de <strong>S/ 4,720.00</strong> (Total con IGV):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border border-slate-200 dark:border-[#2C3744] rounded overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Operación</th>
                    <th className="p-2.5">Base Imponible (S/)</th>
                    <th className="p-2.5">IGV 18% (S/)</th>
                    <th className="p-2.5">Total Comprobante (S/)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-semibold">Compra con Factura (Crédito Fiscal)</td>
                    <td className="p-2.5 font-mono">S/ 2,500.00</td>
                    <td className="p-2.5 font-mono text-brand-700 dark:text-brand-400">+ S/ 450.00</td>
                    <td className="p-2.5 font-mono">S/ 2,950.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Venta con Factura (Débito Fiscal)</td>
                    <td className="p-2.5 font-mono">S/ 4,000.00</td>
                    <td className="p-2.5 font-mono text-red-600 dark:text-red-400">+ S/ 720.00</td>
                    <td className="p-2.5 font-mono">S/ 4,720.00</td>
                  </tr>
                  <tr className="bg-brand-50 dark:bg-brand-950 font-bold">
                    <td className="p-2.5 text-slate-900 dark:text-white">Saldo Neto a Pagar a SUNAT en el Mes</td>
                    <td className="p-2.5 text-slate-500 font-normal">Diferencia neta</td>
                    <td className="p-2.5 font-mono text-brand-800 dark:text-brand-300 text-[15px]">S/ 270.00</td>
                    <td className="p-2.5 text-slate-500 font-normal">(720 - 450)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-[#2C3744] p-4 space-y-2 text-[13px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Base legal y fuentes oficiales de consulta:</span>
            <ul className="space-y-1 list-disc pl-4">
              <li>
                <strong>Tasa del IGV (18% en total; en 2026, 15.5% IGV + 2.5% IPM):</strong> Regulada en el TUO de la Ley del IGV (D.S. N° 055-99-EF). Consulta la normativa en el{' '}
                <a
                  href="https://orientacion.sunat.gob.pe/3053-concepto-tasa-y-operaciones-gravadas-igv-empresas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 dark:text-brand-400 underline hover:text-brand-800"
                >
                  SUNAT Orientación: concepto, tasa y operaciones gravadas del IGV
                </a>.
              </li>
              <li>
                <strong>Reglamento de Comprobantes de Pago:</strong> Resolución de Superintendencia N° 007-99/SUNAT sobre emisión de boletas y facturas electrónicas en{' '}
                SUNAT.
              </li>
            </ul>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-lg border border-slate-200 dark:border-[#2C3744] bg-white dark:bg-[#18202A] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#2C3744] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
              <Receipt className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Selecciona la operación de IGV</h2>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 dark:bg-[#0E141B] p-1.5 border border-slate-200 dark:border-[#2C3744]">
            <button
              type="button"
              onClick={() => setMode('add_igv')}
              className={`rounded py-3 text-[13px] sm:text-[15px] font-bold transition-all cursor-pointer ${
                mode === 'add_igv'
                  ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Agregar IGV (a subtotal)
            </button>
            <button
              type="button"
              onClick={() => setMode('extract_igv')}
              className={`rounded py-3 text-[13px] sm:text-[15px] font-bold transition-all cursor-pointer ${
                mode === 'extract_igv'
                  ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Extraer IGV (de total)
            </button>
          </div>

          <InputNumber
            id="amount"
            label={mode === 'add_igv' ? 'Monto Subtotal (Base Imponible sin IGV)' : 'Monto Total Facturado (con IGV incluido)'}
            prefix="S/"
            value={amount}
            onChange={(amount) => setAmount(amount)}
            helpText={mode === 'add_igv' ? 'Monto neto a facturar' : 'Precio final de la boleta/factura'}
            placeholder="100.00"
            required
          />

          <div className="rounded-lg bg-brand-50/60 dark:bg-brand-950/40 p-4 border border-brand-200/80 dark:border-brand-800 text-[13px] text-brand-950 dark:text-brand-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-700 dark:text-brand-400" />
              <span>Desglose Legal Tributario Perú:</span>
            </div>
            <p className="text-[13px] text-brand-800 dark:text-brand-300">
              • IGV ({(split.igv * 100).toFixed(1)}%): {formatCurrency(result.baseAmount * split.igv)} | • IPM ({(split.ipm * 100).toFixed(1)}%): {formatCurrency(result.baseAmount * split.ipm)}
            </p>
          </div>
        </div>

        {/* Resultado con forma de boleta */}
        <div className="lg:col-span-5">
          <PayslipResult
            title="LIQUIDACIÓN DE IGV"
            period="Tasa total 18 %"
            lines={
              mode === 'add_igv'
                ? [
                    { label: 'Base imponible', note: 'Valor de venta sin impuesto', amount: formatCurrency(result.baseAmount) },
                    { label: `IGV (${(split.igv * 100).toFixed(1)} %)`, amount: formatCurrency(igvPortion), kind: 'income' },
                    { label: `IPM (${(split.ipm * 100).toFixed(1)} %)`, note: 'Impuesto de Promoción Municipal', amount: formatCurrency(ipmPortion), kind: 'income' },
                  ]
                : [
                    { label: 'Total facturado', note: 'Precio con impuesto incluido', amount: formatCurrency(result.totalAmount) },
                    { label: `IGV (${(split.igv * 100).toFixed(1)} %)`, amount: formatCurrency(igvPortion), kind: 'deduction' },
                    { label: `IPM (${(split.ipm * 100).toFixed(1)} %)`, note: 'Impuesto de Promoción Municipal', amount: formatCurrency(ipmPortion), kind: 'deduction' },
                  ]
            }
            totalLabel={mode === 'add_igv' ? 'Total a facturar' : 'Base imponible'}
            totalAmount={formatCurrency(mode === 'add_igv' ? result.totalAmount : result.baseAmount)}
            footnote={<>IGV más IPM: {formatCurrency(result.igvAmount)} para declarar a SUNAT.</>}
          >
            <ShareButtons title="Cálculo de IGV (18%)" shareText={shareSummary} />
          </PayslipResult>
        </div>

      </div>
    </CalculatorShell>
  );
}
