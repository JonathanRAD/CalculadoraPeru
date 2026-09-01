'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateRecipeCost } from '@/core/calculators/recipeCost';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
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

  const shareSummary = `Costeo Gastronómico:
Costo por Plato/Porción: ${formatCurrency(result.costPerPortion)}
Precio Sugerido en Carta: ${formatCurrency(result.suggestedSalePricePerPortion)} (sin IGV)
Precio con IGV (18%): ${formatCurrency(result.suggestedSalePriceWithIgv)}
Ganancia por Plato: ${formatCurrency(result.profitPerPortion)}`;

  const faqs = [
    {
      question: '¿Qué es la merma en cocina?',
      answer: 'Es el porcentaje de peso o volumen que se pierde al limpiar, pelar, cortar o cocinar los insumos (ej: cáscaras, huesos, grasa, evaporación). Considerar entre un 5% y 15% de merma evita que el restaurante pierda dinero.',
    },
    {
      question: '¿Cuál es el margen de ganancia recomendado en gastronomía?',
      answer: 'En restaurantes y pastelerías en Perú, el margen de utilidad bruta suele ubicarse entre el 45% y 65% (lo que significa que el costo de los alimentos representa entre el 35% y 55% del precio de carta).',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El <strong>Costeo de Recetas</strong> permite a dueños de restaurantes, pastelerías y cevicherías determinar con exactitud cuánto cuesta producir un plato y fijar precios rentables en carta.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
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
              helpText="Suma de carne, verduras, condimentos"
              placeholder="35.00"
              required
            />

            <InputNumber
              id="portions"
              label="Cantidad de porciones que rinde"
              value={portionsYield}
              onChange={(portionsYield) => setPortionsYield(portionsYield)}
              min={1}
              helpText="Número de platos o raciones"
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
              helpText="Típico: 5% a 10%"
              placeholder="5"
            />

            <InputNumber
              id="extras"
              label="Empaque descartable / gas"
              prefix="S/"
              value={laborAndPackagingPerPortion}
              onChange={(laborAndPackagingPerPortion) => setLaborAndPackagingPerPortion(laborAndPackagingPerPortion)}
              helpText="Costo extra por porción"
              placeholder="1.50"
            />

            <InputNumber
              id="margin"
              label="Margen deseado"
              suffix="%"
              value={desiredMarginPercentage}
              onChange={(desiredMarginPercentage) => setDesiredMarginPercentage(desiredMarginPercentage)}
              helpText="Ej: 50% o 60%"
              placeholder="50"
              max={95}
              required
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Precio Sugerido en Carta
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                Por Plato
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Precio de Venta en Carta
              </span>
              <div
                title={formatCurrency(result.suggestedSalePricePerPortion)}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-mono tracking-tight truncate max-w-full px-2"
              >
                {formatCurrency(result.suggestedSalePricePerPortion)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                Con IGV 18%: {formatCurrency(result.suggestedSalePriceWithIgv)}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Costo por Porción"
                value={formatCurrency(result.costPerPortion)}
                type="neutral"
                subValue="Insumos + empaque"
              />
              <ResultMetricCard
                label="Ganancia por Plato"
                value={formatCurrency(result.profitPerPortion)}
                type="success"
                subValue={`Margen: ${desiredMarginPercentage}%`}
              />
            </div>

            <ShareButtons title="Costeo de Recetas Gastronómicas" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
