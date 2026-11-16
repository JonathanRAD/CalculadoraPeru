'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateBreakEven, BreakEvenInput } from '@/core/calculators/breakeven';
import { formatCurrency, formatNumber, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { PayslipResult } from '@/shared/components/ui/PayslipResult';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Scale, AlertCircle } from 'lucide-react';

export default function PuntoDeEquilibrioPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'punto-de-equilibrio')!;

  const [form, setForm] = useState<BreakEvenInput>({
    fixedCosts: 3000,
    salePricePerUnit: 50,
    variableCostPerUnit: 30,
  });

  const result = calculateBreakEven(form);

  const shareSummary = `Punto de Equilibrio MYPE:
• Unidades Requeridas: ${formatNumber(result.unitsNeeded)} unidades/mes
• Ventas Mínimas Netas: ${formatCurrency(result.minimumSalesAmount)} (sin IGV)
• Ventas con IGV (18%): ${formatCurrency(result.minimumSalesWithIgv)}
• Margen de Contribución: ${formatCurrency(result.contributionMarginUnit)} por unidad (${formatPercent(result.contributionMarginRatio)})`;

  const faqs = [
    {
      question: '¿Qué son los Costos Fijos mensuales en una MYPE peruana?',
      answer: 'Son todos los egresos operativos que tu negocio debe pagar obligatoriamente cada mes, independientemente de si vendes mucho, poco o nada. Incluye: alquiler de local comercial o taller, sueldos del personal en planilla fija (o tu propia asignación mensual de subsistencia), servicio de internet y telefonía, cuota contable mensual, software y licencias municipales.',
    },
    {
      question: '¿Qué son los Costos Variables por unidad producida o vendida?',
      answer: 'Son los costos directos que únicamente se originan cuando se produce o despacha una unidad de producto o servicio. Comprende la materia prima, insumos, envases y empaques de despacho (cajas, bolsas kraft), comisiones bancarias o de pasarelas de pago (POS, Yape Empresas) y mano de obra a destajo.',
    },
    {
      question: '¿Qué significa el Margen de Contribución Unitario?',
      answer: 'Es la diferencia entre el precio de venta unitario neto y el costo variable unitario (Precio - Costo Variable). Representa la cantidad exacta de dinero que cada producto vendido aporta para pagar los costos fijos de la empresa. Una vez cubiertos todos los costos fijos, el margen de contribución de cada venta adicional se convierte íntegramente en utilidad neta.',
    },
    {
      question: '¿Por qué los cálculos deben realizarse sin incluir el IGV (18%)?',
      answer: 'El IGV (18%) no es un ingreso del negocio ni forma parte de su estructura de rentabilidad; es un impuesto fiscal recaudado para la SUNAT. Por tanto, para obtener un punto de equilibrio financiero exacto, tanto los ingresos como los costos deben evaluarse sobre bases netas (sin IGV). El valor con IGV que muestra esta herramienta es el monto facturado referencial al público.',
    },
    {
      question: '¿Qué ocurre si el precio de venta es menor o igual al costo variable?',
      answer: 'Tu negocio se encuentra en una situación de inviabilidad técnica o margen de contribución negativo. Significa que por cada unidad vendida incurres en una pérdida directa adicional, haciendo imposible cubrir los costos fijos sin importar el volumen que vendas. Se requiere urgentemente renegociar con proveedores o ajustar el precio al público.',
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
              ¿Cómo calcular el Punto de Equilibrio de tu Negocio en el Perú?
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              El <strong>Punto de Equilibrio</strong> (Break-Even Point) es el umbral financiero crítico en el cual los ingresos totales por ventas igualan con exactitud a la suma de los costos fijos y costos variables. En este punto la empresa no registra pérdidas ni utilidades (Utilidad Operativa = S/ 0.00). Conocer este número permite a emprendedores y gerentes de MYPES establecer cuotas de ventas diarias realistas y tomar decisiones informadas sobre precios y contrataciones.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-[#18202A] p-5 border border-slate-200 dark:border-[#2C3744] space-y-3 text-[13px] leading-relaxed">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              1. Fórmulas Financieras del Punto de Equilibrio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3.5 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Punto de Equilibrio en Unidades (Q):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Cantidad mínima de productos o servicios que debes vender al mes para no perder dinero.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Q = Costos Fijos Totales ÷ (Precio Unitario - Costo Variable Unitario)
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Punto de Equilibrio en Soles (Ventas Netas):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Facturación mensual neta mínima necesaria para financiar toda la operación.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Ventas S/ = Costos Fijos Totales ÷ Ratio de Margen de Contribución
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              2. Caso práctico ilustrativo (Taller de Confecciones en Gamarra, Lima)
            </h3>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Un taller textil produce polos de algodón con una estructura de costos fijos mensuales de S/ 3,000.00 (alquiler de taller, servicios y mantenimiento). El costo variable de tela, confección y empaque es de S/ 30.00 por polo y se comercializa a un precio neto de S/ 50.00 (sin IGV):
            </p>

            <div className="overflow-x-auto rounded border border-slate-200 dark:border-[#2C3744]">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Concepto Financiero</th>
                    <th className="p-2.5">Valor Unitario</th>
                    <th className="p-2.5">Total Mensual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">Costos Fijos Operativos</td>
                    <td className="p-2.5 text-slate-500">-</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">S/ 3,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Precio de Venta Neto</td>
                    <td className="p-2.5 font-mono font-semibold">S/ 50.00</td>
                    <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">S/ 7,500.00 (150 u.)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Costo Variable por Polo</td>
                    <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">S/ 30.00</td>
                    <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">S/ 4,500.00 (150 u.)</td>
                  </tr>
                  <tr className="bg-brand-50/60 dark:bg-brand-950/30">
                    <td className="p-2.5 font-bold text-brand-950 dark:text-brand-300">Punto de Equilibrio Calculado</td>
                    <td className="p-2.5 font-mono font-bold text-brand-800 dark:text-brand-400">Margen: S/ 20.00</td>
                    <td className="p-2.5 font-mono font-bold text-brand-800 dark:text-brand-400">150 Polos / S/ 7,500.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 italic">
              * Nota: A partir del polo número 151, cada unidad vendida genera una ganancia líquida de S/ 20.00 antes del impuesto a la renta.
            </p>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-lg border-2 border-slate-200/90 dark:border-[#2C3744] bg-white dark:bg-[#18202A] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#2C3744] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
              <Scale className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ingresa los costos de tu negocio</h2>
          </div>

          <InputNumber
            id="fixedCosts"
            label="Costos fijos mensuales totales"
            prefix="S/"
            value={form.fixedCosts}
            onChange={(fixedCosts) => setForm({ ...form, fixedCosts })}
            helpText="Alquiler, sueldos fijos, servicios, contador"
            placeholder="3000.00"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="price"
              label="Precio de venta unitario (sin IGV)"
              prefix="S/"
              value={form.salePricePerUnit}
              onChange={(salePricePerUnit) => setForm({ ...form, salePricePerUnit })}
              helpText="Precio cobrado neto"
              placeholder="50.00"
              required
            />

            <InputNumber
              id="variableCost"
              label="Costo variable por unidad"
              prefix="S/"
              value={form.variableCostPerUnit}
              onChange={(variableCostPerUnit) => setForm({ ...form, variableCostPerUnit })}
              helpText="Insumo + empaque + comisión"
              placeholder="30.00"
              required
            />
          </div>

          {!result.isFeasible && (
            <div className="flex items-center gap-3 rounded bg-rose-50 dark:bg-rose-950/50 p-4 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-[13px]">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>
                <strong>Atención:</strong> El precio de venta debe ser mayor al costo variable por unidad para que el negocio sea financieramente viable.
              </span>
            </div>
          )}
        </div>
        {/* Resultado con forma de boleta */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <PayslipResult
            title={"Meta mínima de ventas"}
            period={"MYPE Perú"}
            amountHeader="Valor"
            lines={[
              { label: "Ventas mínimas (sin IGV)", amount: formatCurrency(result.minimumSalesAmount), note: "Para cubrir todos tus costos" },
              { label: "Margen Contribución", amount: formatCurrency(result.contributionMarginUnit), note: `Ratio: ${formatPercent(result.contributionMarginRatio)}` },
              { label: "Ventas mínimas con IGV (18%)", amount: formatCurrency(result.minimumSalesWithIgv) },
              { label: "Costos fijos mensuales a cubrir", amount: formatCurrency(form.fixedCosts) },
              { label: "Margen sobre venta unitaria", amount: formatPercent(result.contributionMarginRatio) },
            ]}
            totalLabel={"Punto de Equilibrio Requerido"}
            totalAmount={`${formatNumber(result.unitsNeeded)} unidades`}
            footnote={`Vender mínimo ${Math.ceil(result.unitsNeeded / 26)} unidades por día (mes de 26 días útiles)`}
          >
            

            <ShareButtons title="Punto de Equilibrio MYPE Perú" shareText={shareSummary} />
          </PayslipResult>
        </div>

      </div>
    </CalculatorShell>
  );
}
