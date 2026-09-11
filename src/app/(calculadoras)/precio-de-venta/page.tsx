'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateSalePrice, SalePriceInput } from '@/core/calculators/pricing';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { ShoppingBag } from 'lucide-react';

export default function PrecioDeVentaPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'precio-de-venta')!;

  const [form, setForm] = useState<SalePriceInput>({
    cost: 10,
    marginPercentage: 30,
    includeIgv: true,
    salesCommissionPercentage: 3.5,
    otherCosts: 0.5,
  });

  const result = calculateSalePrice(form);

  const shareSummary = `Precio Venta Sugerido: ${formatCurrency(result.recommendedSalePrice)}
Ganancia Neta: ${formatCurrency(result.profitPerUnit)} (${formatPercent(result.realMarginPercentage)})
IGV (18%): ${formatCurrency(result.igvAmount)}`;

  const faqs = [
    {
      question: '¿Por qué multiplicar el costo por 1.30 NO te da un 30% de ganancia real?',
      answer: 'Es el error financiero más común en emprendimientos y MYPES peruanas. Si un producto te cuesta S/ 70.00 y lo multiplicas por 1.30 para venderlo a S/ 91.00, tu ganancia es de S/ 21.00. Sin embargo, al calcular S/ 21.00 sobre el precio cobrado de S/ 91.00, tu margen real sobre la venta es solo del 23.08%, no del 30%. Si luego ofreces un descuento promocional del 25%, estarás perdiendo dinero sin saberlo. La fórmula comercial profesional divide el costo entre (1 - Margen Deseado), asegurando que tu utilidad sobre el precio final sea matemáticamente exacta.',
    },
    {
      question: '¿Cuál es la diferencia exacta entre Mark-up y Margen de Utilidad (Profit Margin)?',
      answer: 'El Mark-up es el sobreprecio porcentual que aplicas directamente por encima del costo de compra (Fórmula: Utilidad ÷ Costo). El Margen de Utilidad, en cambio, mide qué porcentaje del dinero ingresado en caja queda como ganancia neta para tu bolsillo (Fórmula: Utilidad ÷ Precio de Venta). Los reportes de contabilidad, estados de resultados y análisis de rentabilidad empresarial siempre se calculan en base al Margen de Utilidad.',
    },
    {
      question: '¿Cómo debe incluirse el IGV (18%) en el precio al consumidor final en el Perú?',
      answer: 'Por mandato del Código de Protección y Defensa del Consumidor (Ley 29571) y la SUNAT, todo precio exhibido en tiendas físicas, catálogos digitales o redes sociales dirigido al consumidor final debe incluir el 18% de IGV. El IGV nunca debe considerarse ingreso de la empresa ni margen de ganancia; es un impuesto retenido que se entrega mensualmente al fisco.',
    },
    {
      question: '¿Cómo cubrir las comisiones de POS (Niubiz, Izipay, Yape Empresas o Mercado Pago)?',
      answer: 'Las pasarelas de pago y terminales POS en el Perú cobran una comisión transaccional promedio que oscila entre el 3.25% y el 4.10% + IGV por cada cobro con tarjeta de débito o crédito. Para no sacrificar tu margen de utilidad, debes incorporar esta tasa como un costo financiero variable dentro del divisor de tu precio de venta.',
    },
    {
      question: '¿Qué costos ocultos deben sumarse al costo directo antes de fijar el precio?',
      answer: 'Muchos emprendedores solo consideran el costo de compra al proveedor y olvidan los costos operativos directos por unidad: empaque (cajas, bolsas de despacho, etiquetas adhesivas, papel seda), flete o costo de transporte por unidad, mermas o roturas estimadas (~2%), y costos de almacenamiento temporal.',
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
              Estrategia Comercial: ¿Cómo calcular el Precio de Venta y Margen de Ganancia para MYPES?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Fijar un precio de venta de manera empírica o mediante sobreprecios directos es la causa número uno de falta de liquidez y quiebra en micro y pequeñas empresas peruanas. Para construir un negocio sostenible es imperativo dominar la <strong>fórmula de margen sobre ventas</strong> y considerar todos los costos directos, tributarios y financieros de cada unidad.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Fórmulas comerciales profesionales de fijación de precios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Precio de Venta Neto (Sin IGV):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Garantiza que tras pagar el costo unitario, el porcentaje de utilidad neta en caja sea exactamente el que planificaste.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Precio Neto = Costo Unitario ÷ (1 - Margen Deseado%)
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-800 dark:text-sky-400 block">• Precio al Público (Con IGV 18%):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Precio obligatorio para exhibir en boleta o tienda física en el Perú, sumando el 18% del tributo fiscal.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Precio Final = Precio Neto × 1.18
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico real (Emprendimiento retail / ecommerce en Lima)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Un negocio de calzado adquiere un par de zapatillas a su proveedor en Trujillo por <strong>S/ 80.00</strong>, invierte <strong>S/ 5.00</strong> en caja y bolsa de despacho, asume <strong>S/ 5.00</strong> de flete prorrateado (Costo Total: S/ 90.00) y desea ganar un <strong>35% de margen neto</strong>:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Etapa del Cálculo</th>
                    <th className="p-2.5">Fórmula Aplicada</th>
                    <th className="p-2.5">Monto Unitario (PEN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-semibold">Costo Total Integral Unitario</td>
                    <td className="p-2.5 text-slate-500">Producto (80) + Empaque (5) + Flete (5)</td>
                    <td className="p-2.5 font-mono">S/ 90.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Precio de Venta Sugerido (Sin IGV)</td>
                    <td className="p-2.5 text-slate-500">S/ 90.00 ÷ (1 - 0.35) = S/ 90 ÷ 0.65</td>
                    <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">S/ 138.46</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Ganancia Neta en Soles por Par Vendido</td>
                    <td className="p-2.5 text-slate-500">Precio Neto (138.46) - Costo (90.00)</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400 font-bold">+ S/ 48.46 (35%)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Impuesto General a las Ventas (18%)</td>
                    <td className="p-2.5 text-slate-500">18% de S/ 138.46 (SUNAT)</td>
                    <td className="p-2.5 font-mono text-slate-500">+ S/ 24.92</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950 font-bold text-slate-900 dark:text-white">
                    <td className="p-2.5 text-emerald-800 dark:text-emerald-300">Precio de Venta al Público (PVP en Boleta)</td>
                    <td className="p-2.5 text-slate-500 font-normal">S/ 138.46 × 1.18</td>
                    <td className="p-2.5 font-mono text-emerald-800 dark:text-emerald-300 text-sm">S/ 163.38</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Normas peruanas de protección al consumidor y tributarias:</span>
            <p>
              • <strong>Ley N° 29571:</strong> Código de Protección y Defensa del Consumidor (Publicidad de precios con tributos incluidos).<br />
              • <strong>Decreto Legislativo N° 716:</strong> Normas sobre protección al consumidor y transparencia en precios.<br />
              • <strong>Decreto Supremo N° 055-99-EF:</strong> Aplicación del IGV en operaciones comerciales.
            </p>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ingresa los datos de tu producto</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="cost"
              label="Costo del producto (sin IGV)"
              prefix="S/"
              value={form.cost}
              onChange={(cost) => setForm({ ...form, cost })}
              helpText="Costo de compra o insumos"
              placeholder="10.00"
              required
            />

            <InputNumber
              id="margin"
              label="Margen de ganancia deseado"
              suffix="%"
              value={form.marginPercentage}
              onChange={(marginPercentage) => setForm({ ...form, marginPercentage })}
              helpText="Ej: 30% a 50%"
              placeholder="30"
              max={99}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="otherCosts"
              label="Costos adicionales (opcional)"
              prefix="S/"
              value={form.otherCosts || 0}
              onChange={(otherCosts) => setForm({ ...form, otherCosts })}
              helpText="Empaque, caja, delivery"
              placeholder="0.50"
            />

            <InputNumber
              id="commission"
              label="Comisión de venta (opcional)"
              suffix="%"
              value={form.salesCommissionPercentage || 0}
              onChange={(salesCommissionPercentage) => setForm({ ...form, salesCommissionPercentage })}
              helpText="Yape, Niubiz, POS (3.5%)"
              placeholder="3.5"
            />
          </div>

          <SwitchToggle
            id="includeIgv"
            label="¿El precio al público debe incluir IGV (18%)?"
            description="Actívalo si emites boleta de venta con IGV incluido"
            checked={form.includeIgv}
            onChange={(includeIgv) => setForm({ ...form, includeIgv })}
            badge="SUNAT"
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Resultado sugerido
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                🇵🇪 En Soles
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Precio de Venta Recomendado
              </span>
              <div
                title={formatCurrency(result.recommendedSalePrice)}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-mono tracking-tight truncate max-w-full px-2"
              >
                {formatCurrency(result.recommendedSalePrice)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                {form.includeIgv ? '(Incluye IGV 18% para Boleta)' : '(Precio Neto sin IGV)'}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Ganancia por unidad"
                value={formatCurrency(result.profitPerUnit)}
                type="success"
                subValue={`Margen real: ${formatPercent(result.realMarginPercentage)}`}
              />
              <ResultMetricCard
                label="IGV a pagar (18%)"
                value={formatCurrency(result.igvAmount)}
                type="neutral"
                subValue={result.igvAmount > 0 ? 'Para declarar a SUNAT' : 'No incluido'}
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-2xl bg-white/90 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5 border border-emerald-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex justify-between font-medium">
                <span>Costo Total Unitario:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(result.totalCostPerUnit)}</span>
              </div>
              {result.commissionAmount > 0 && (
                <div className="flex justify-between font-medium">
                  <span>Comisión Pasarela ({form.salesCommissionPercentage}%):</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(result.commissionAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Precio Base (sin IGV):</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(result.basePriceWithoutIgv)}</span>
              </div>
            </div>

            {/* Share and Copy Actions */}
            <ShareButtons title="Cálculo de Precio de Venta" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
