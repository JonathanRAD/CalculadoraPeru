'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateIgv, IgvCalculationMode } from '@/core/calculators/tax';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Receipt, CheckCircle2 } from 'lucide-react';

export default function CalculadoraIgvPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'calculadora-igv')!;

  const [amount, setAmount] = useState<number>(100);
  const [mode, setMode] = useState<IgvCalculationMode>('add_igv');

  const result = calculateIgv({ amount, mode });

  const shareSummary = `Base Imponible: ${formatCurrency(result.baseAmount)}
IGV (18% SUNAT): ${formatCurrency(result.igvAmount)}
Total Facturado: ${formatCurrency(result.totalAmount)}`;

  const faqs = [
    {
      question: '¿Cómo está descompuesta la tasa del 18% de IGV en el Perú?',
      answer: 'La tasa oficial del 18% aplicada en todas las operaciones comerciales gravadas se compone legalmente de dos tributos: el 16% correspondiente al Impuesto General a las Ventas (IGV) y el 2% destinado al Impuesto de Promoción Municipal (IPM). Ambos son administrados y recaudados conjuntamente por la SUNAT en un solo pago mensual a través del Formulario Virtual Declara Fácil 621.',
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
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              El <strong>Impuesto General a las Ventas (IGV)</strong> es el tributo al valor agregado de naturaleza indirecta más importante del sistema tributario peruano. Grava todas las fases del ciclo de producción y comercialización de bienes muebles, contratos de construcción, la primera venta de inmuebles y la prestación o utilización de servicios en el país (Decreto Supremo N° 055-99-EF).
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Fórmulas oficiales para la emisión y revisión de comprobantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Operación 1: Agregar IGV (+18%)</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Se usa cuando tienes el valor de venta sin impuesto (Base Imponible) y necesitas cotizar el precio final al cliente.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Total = Base Imponible × 1.18<br />
                  IGV = Base Imponible × 0.18
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-800 dark:text-sky-400 block">• Operación 2: Desglosar Factura (-18%)</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Se usa cuando recibes un cobro total o comprobante y necesitas saber cuánto dinero corresponde a costo real y cuánto a crédito fiscal.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Base Imponible = Total Facturado ÷ 1.18<br />
                  IGV = Total Facturado - Base Imponible
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico numérico con desglose comercial
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Supongamos una microempresa en Lima que adquiere equipos de cómputo por un valor neto de <strong>S/ 2,500.00</strong> (Base Imponible) y luego vende servicios por un precio final cobrado de <strong>S/ 4,720.00</strong> (Total con IGV):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
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
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">+ S/ 450.00</td>
                    <td className="p-2.5 font-mono">S/ 2,950.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Venta con Factura (Débito Fiscal)</td>
                    <td className="p-2.5 font-mono">S/ 4,000.00</td>
                    <td className="p-2.5 font-mono text-red-600 dark:text-red-400">+ S/ 720.00</td>
                    <td className="p-2.5 font-mono">S/ 4,720.00</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950 font-bold">
                    <td className="p-2.5 text-slate-900 dark:text-white">Saldo Neto a Pagar a SUNAT en el Mes</td>
                    <td className="p-2.5 text-slate-500 font-normal">Diferencia neta</td>
                    <td className="p-2.5 font-mono text-emerald-800 dark:text-emerald-300 text-sm">S/ 270.00</td>
                    <td className="p-2.5 text-slate-500 font-normal">(720 - 450)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Base legal y decretos supremos aplicables:</span>
            <p>
              • <strong>Decreto Supremo N° 055-99-EF:</strong> Texto Único Ordenado de la Ley del Impuesto General a las Ventas e Impuesto Selectivo al Consumo.<br />
              • <strong>Decreto Supremo N° 136-96-EF:</strong> Reglamento de la Ley del Impuesto General a las Ventas.<br />
              • <strong>Resolución de Superintendencia N° 007-99/SUNAT:</strong> Reglamento de Comprobantes de Pago físicos y electrónicos.
            </p>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Selecciona la operación de IGV</h2>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 dark:bg-slate-950 p-1.5 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMode('add_igv')}
              className={`rounded-xl py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'add_igv'
                  ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ➕ Agregar IGV (a subtotal)
            </button>
            <button
              type="button"
              onClick={() => setMode('extract_igv')}
              className={`rounded-xl py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'extract_igv'
                  ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ✂️ Extraer IGV (de total)
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

          <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 p-4 border border-emerald-200/80 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Desglose Legal Tributario Perú:</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              • IGV (16%): {formatCurrency(result.baseAmount * 0.16)} | • IPM (2%): {formatCurrency(result.baseAmount * 0.02)}
            </p>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 dark:border-slate-800 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Liquidación Tributaria
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                SUNAT 18%
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-amber-200 dark:border-amber-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {mode === 'add_igv' ? 'Monto Total Facturado (con IGV)' : 'Base Imponible Neta'}
              </span>
              <div
                title={formatCurrency(mode === 'add_igv' ? result.totalAmount : result.baseAmount)}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-900 dark:text-amber-400 mt-1 font-mono tracking-tight truncate max-w-full px-2"
              >
                {formatCurrency(mode === 'add_igv' ? result.totalAmount : result.baseAmount)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                {mode === 'add_igv'
                  ? `Incluye ${formatCurrency(result.igvAmount)} de IGV (18%)`
                  : `IGV extraído: ${formatCurrency(result.igvAmount)}`}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Base Imponible"
                value={formatCurrency(result.baseAmount)}
                type="neutral"
                subValue="Ingreso neto de tu negocio"
              />
              <ResultMetricCard
                label="Monto del IGV (18%)"
                value={formatCurrency(result.igvAmount)}
                type="warning"
                subValue="Para declarar a SUNAT"
              />
            </div>

            <ShareButtons title="Cálculo de IGV (18%)" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
