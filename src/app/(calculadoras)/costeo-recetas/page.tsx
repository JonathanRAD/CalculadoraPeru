'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateRecipeCost } from '@/core/calculators/recipeCost';
import { formatCurrency, formatPercent } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { PayslipResult } from '@/shared/components/ui/PayslipResult';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Utensils } from 'lucide-react';

export default function CosteoRecetasPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'costeo-recetas')!;

  const [ingredientsTotalCost, setIngredientsTotalCost] = useState<number>(35);
  const [portionsYield, setPortionsYield] = useState<number>(4);
  const [wastePercentage, setWastePercentage] = useState<number>(5);
  const [laborAndPackagingPerPortion, setLaborAndPackagingPerPortion] = useState<number>(1.5);
  const [desiredMarginPercentage, setDesiredMarginPercentage] = useState<number>(50);

  const result = calculateRecipeCost({
    ingredientsTotalCost,
    portionsYield,
    wastePercentage,
    laborAndPackagingPerPortion,
    desiredMarginPercentage,
  });

  const shareSummary = `Costeo Gastronómico y Precio en Carta:
• Costo Total por Plato: ${formatCurrency(result.costPerPortion)}
• Precio Carta Neto (sin IGV): ${formatCurrency(result.suggestedSalePricePerPortion)}
• Precio en Carta con IGV (18%): ${formatCurrency(result.suggestedSalePriceWithIgv)}
• Ganancia Líquida por Plato: ${formatCurrency(result.profitPerPortion)} (${formatPercent(result.realMarginPercentage)})`;

  const faqs = [
    {
      question: '¿Qué es el Food Cost (Costo de Alimentos) y cuál es el estándar en Perú?',
      answer: 'El Food Cost representa el porcentaje del precio de venta que corresponde exclusivamente al costo de los insumos e ingredientes del plato. En restaurantes, cevicherías y cafeterías peruanas, el Food Cost ideal se sitúa entre el 28% y el 35%. Un porcentaje mayor al 40% suele indicar que el plato está subvaluado en carta o que existe descontrol de mermas.',
    },
    {
      question: '¿Cómo debe calcularse la merma en insumos gastronómicos?',
      answer: 'La merma es la pérdida natural de peso o volumen que sufren los alimentos al ser limpiados, desgrasados, pelados o cocidos (por ejemplo: espinas y piel de pescado, cáscara de verduras, grasa de carnes o evaporación). No costear la merma (que oscila entre el 5% y 25% según el insumo) es la principal causa de pérdidas en cocina.',
    },
    {
      question: '¿Por qué deben sumarse empaques y envases de delivery por separado?',
      answer: 'Con el auge de las aplicaciones de delivery y el servicio para llevar, los envases biodegradables, bolsas kraft, cubiertos, salseras y sellos de seguridad representan entre S/ 1.50 y S/ 3.50 adicionales por porción, los cuales deben imputarse directamente al costo variable del plato.',
    },
    {
      question: '¿Cómo se debe exhibir el precio en la carta según la ley peruana?',
      answer: 'El Código de Protección y Defensa del Consumidor de INDECOPI exige que todos los precios impresos en cartas físicas o menús digitales incluyan obligatoriamente el 18% de IGV. Si el restaurante aplica un recargo al consumo (hasta el 13%), este debe ser advertido de forma expresa y visible al comensal.',
    },
    {
      question: '¿Cuál es la diferencia entre costear una porción individual y una receta por lote?',
      answer: 'En cocina profesional se costea el lote completo de preparación (ej: una olla de salsa madre, un fondo de ave o una masa de pastelería) y luego se divide el costo total entre el rendimiento exacto de porciones estándar que rinde la preparación. Esto garantiza uniformidad en costos y porciones servidas.',
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
              ¿Cómo costear una receta y fijar precios en carta para restaurantes en Perú?
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              El <strong>Costeo Estándar de Recetas</strong> es la piedra angular de la rentabilidad gastronómica. Permite a cocineros, pasteleros y dueños de locales de comida calcular con rigurosidad el costo unitario de cada plato, absorbiendo desperdicios (mermas), empaques de despacho y garantizando el margen de ganancia proyectado antes de imprimir la carta de precios.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-[#18202A] p-5 border border-slate-200 dark:border-[#2C3744] space-y-3 text-[13px] leading-relaxed">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              1. Fórmulas de Ingeniería de Menú
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3.5 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Costo Unitario con Merma y Empaque:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Suma del costo de insumos ajustado por merma, dividido entre porciones, más empaque unitario.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Costo/Plato = ((Costo Insumos × (1 + Merma%)) ÷ Porciones) + Empaque
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Precio en Carta con IGV (18% INDECOPI):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Precio final con impuestos para exhibición directa al consumidor.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Precio Carta = (Costo/Plato ÷ (1 - Margen Deseado%)) × 1.18
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              2. Caso práctico: Fuente de Ceviche Clásico (Rinde 4 platos)
            </h3>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Un restaurante gasta S/ 35.00 en insumos (pescado del día, limón de Piura, cebolla, ají limo, choclo y camote). Se estima una merma del 5%, un gasto de S/ 1.50 en descartables por porción y se busca un margen bruto del 50%:
            </p>

            <div className="overflow-x-auto rounded border border-slate-200 dark:border-[#2C3744]">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Rubro de la Receta</th>
                    <th className="p-2.5">Cálculo Matemático</th>
                    <th className="p-2.5">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">Insumos brutos (4 platos)</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">S/ 35.00 base</td>
                    <td className="p-2.5 font-mono">S/ 35.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Factor de merma (+5%)</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">S/ 35.00 × 1.05</td>
                    <td className="p-2.5 font-mono text-amber-700 dark:text-amber-400">S/ 36.75</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Insumo por porción individual</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">S/ 36.75 ÷ 4 porciones</td>
                    <td className="p-2.5 font-mono">S/ 9.19</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Empaque y descartables</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">Envase delivery + bolsa</td>
                    <td className="p-2.5 font-mono">S/ 1.50</td>
                  </tr>
                  <tr className="bg-brand-50/60 dark:bg-brand-950/30">
                    <td className="p-2.5 font-bold text-brand-950 dark:text-brand-300">Costo total por plato servido</td>
                    <td className="p-2.5 font-mono font-bold text-brand-800 dark:text-brand-400">S/ 9.19 + S/ 1.50</td>
                    <td className="p-2.5 font-mono font-bold text-brand-800 dark:text-brand-400">S/ 10.69</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Precio Carta sugerido (con IGV 18%)</td>
                    <td className="p-2.5 font-mono font-semibold text-slate-800 dark:text-slate-200">(S/ 10.69 ÷ 0.50) × 1.18</td>
                    <td className="p-2.5 font-mono font-bold text-brand-700 dark:text-brand-400">S/ 25.22 en carta</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-lg border-2 border-slate-200/90 dark:border-[#2C3744] bg-white dark:bg-[#18202A] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#2C3744] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
              <Utensils className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos de la Receta o Preparación</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="ingredients"
              label="Costo total de insumos e ingredientes"
              prefix="S/"
              value={ingredientsTotalCost}
              onChange={(ingredientsTotalCost) => setIngredientsTotalCost(ingredientsTotalCost)}
              helpText="Suma de carne, pescado, verduras, condimentos"
              placeholder="35.00"
              required
            />

            <InputNumber
              id="portions"
              label="Cantidad de porciones que rinde"
              value={portionsYield}
              onChange={(portionsYield) => setPortionsYield(portionsYield)}
              min={1}
              helpText="Número de platos o raciones de la receta"
              placeholder="4"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <InputNumber
              id="waste"
              label="Merma / Desperdicio"
              suffix="%"
              value={wastePercentage}
              onChange={(wastePercentage) => setWastePercentage(wastePercentage)}
              helpText="Piel, huesos, evaporación (5-15%)"
              placeholder="5"
              max={50}
            />

            <InputNumber
              id="packaging"
              label="Empaque / Descartable"
              prefix="S/"
              value={laborAndPackagingPerPortion}
              onChange={(laborAndPackagingPerPortion) => setLaborAndPackagingPerPortion(laborAndPackagingPerPortion)}
              helpText="Envase por plato"
              placeholder="1.50"
            />

            <InputNumber
              id="margin"
              label="Margen deseado"
              suffix="%"
              value={desiredMarginPercentage}
              onChange={(desiredMarginPercentage) => setDesiredMarginPercentage(desiredMarginPercentage)}
              helpText="Meta: 40% a 65%"
              placeholder="50"
              max={99}
              required
            />
          </div>
        </div>
        {/* Resultado con forma de boleta */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <PayslipResult
            title={"Precio Sugerido en Carta"}
            period={"Porción"}
            amountHeader="Valor"
            lines={[
              { label: "Costo por plato", amount: formatCurrency(result.costPerPortion), note: `Food Cost: ${formatPercent(result.foodCostPercentage)}` },
              { label: "Ganancia por plato", amount: formatCurrency(result.profitPerPortion), note: `Margen: ${formatPercent(result.realMarginPercentage)}` },
              { label: `Costo de insumos con merma (${wastePercentage}%)`, amount: formatCurrency(result.totalIngredientsWithWaste) },
              { label: "Costo insumo por porción", amount: formatCurrency(result.ingredientCostPerPortion) },
              { label: "Empaque / descartable por porción", amount: formatCurrency(laborAndPackagingPerPortion) },
            ]}
            totalLabel={"Precio al Público con IGV (18%)"}
            totalAmount={formatCurrency(result.suggestedSalePriceWithIgv)}
            footnote={`Precio neto sin IGV: ${formatCurrency(result.suggestedSalePricePerPortion)}`}
          >
            

            <ShareButtons title="Costeo Gastronómico de Receta" shareText={shareSummary} />
          </PayslipResult>
        </div>

      </div>
    </CalculatorShell>
  );
}
