'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateFuelCost } from '@/core/calculators/fuel';
import { formatCurrency, formatNumber } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Fuel } from 'lucide-react';

const COMMON_FUELS = [
  { id: 'regular', name: 'Gasolina Regular (90)', price: 16.20 },
  { id: 'premium', name: 'Gasolina Premium (95/97)', price: 18.90 },
  { id: 'diesel', name: 'Diésel DB5', price: 16.80 },
  { id: 'glp', name: 'GLP (por galón)', price: 7.50 },
  { id: 'gnv', name: 'GNV (por m³)', price: 1.65 },
];

export default function GastoCombustiblePage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'gasto-combustible')!;

  const [distanceKm, setDistanceKm] = useState<number>(300);
  const [efficiencyKmPerGallon, setEfficiencyKmPerGallon] = useState<number>(40);
  const [fuelPricePerUnit, setFuelPricePerUnit] = useState<number>(16.20);
  const [numberOfPassengers, setNumberOfPassengers] = useState<number>(4);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(true);

  const result = calculateFuelCost({
    distanceKm,
    efficiencyKmPerGallon,
    fuelPricePerUnit,
    numberOfPassengers,
    isRoundTrip,
  });

  const shareSummary = `Gasto de Combustible y Viaje:
• Distancia Total: ${formatNumber(result.totalDistanceKm)} km ${isRoundTrip ? '(Ida y vuelta)' : '(Solo ida)'}
• Combustible Requerido: ${result.unitsNeeded} galones / m³
• Gasto Total: ${formatCurrency(result.totalFuelCost)}
• Costo por Pasajero: ${formatCurrency(result.costPerPassenger)} (${numberOfPassengers} personas)`;

  const faqs = [
    {
      question: '¿Cómo saber cuántos kilómetros por galón rinde mi vehículo en Perú?',
      answer: 'Un sedán o hatchback estándar (motor 1.2L a 1.6L) rinde entre 35 y 45 km por galón en carretera abierta y entre 28 y 34 km por galón en el tráfico urbano de Lima. Las camionetas SUV medianas promedian entre 26 y 32 km/galón, mientras que vehículos a GNV rinden aproximadamente entre 10 y 14 km por metro cúbico.',
    },
    {
      question: '¿Cuál es la diferencia entre Gasolina Regular y Premium en el Perú?',
      answer: 'Desde la entrada en vigencia del D.S. 014-2021-EM del Ministerio de Energía y Minas (MINEM), el mercado peruano simplificó sus combustibles en dos tipos: Gasolina Regular (aglomera las anteriores de 84 y 90 octanos) y Gasolina Premium (aglomera las anteriores de 95, 97 y 98 octanos, recomendada para motores con alta compresión o turbo).',
    },
    {
      question: '¿Dónde consultar el precio oficial del combustible actualizado en grifos?',
      answer: 'El organismo regulador Osinergmin administra la plataforma pública "Facilito" (app móvil y web), donde todos los grifos y estaciones de servicio del Perú están obligados por ley a reportar diariamente sus precios vigentes al público.',
    },
    {
      question: '¿Conviene más convertir un vehículo a GLP o a GNV en Perú?',
      answer: 'El GNV (Gas Natural Vehicular) es significativamente más económico por kilómetro recorrido (aproximadamente S/ 1.60 a S/ 1.80 por m³), con subsidios estatales a través del FISE para la conversión. El GLP tiene mayor cobertura de estaciones de servicio en carreteras de provincias donde la red de gas natural aún no ha llegado.',
    },
    {
      question: '¿Qué otros gastos deben considerarse en un presupuesto de viaje en carretera?',
      answer: 'Además de la gasolina o gas, un presupuesto completo de viaje por la Panamericana o Carretera Central debe contemplar peajes (concesionarias viales cobran entre S/ 6.50 y S/ 17.00 por garita), hidratación, refrigerio de ruta y mantenimiento preventivo de neumáticos y frenos.',
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
              ¿Cómo calcular el Consumo y Gasto de Combustible para viajes en Perú?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Planificar con precisión el presupuesto de combustible para viajes de turismo, visitas familiares o traslados de logística y reparto en las carreteras del Perú permite optimizar el consumo del vehículo y dividir los costos de manera transparente y equitativa entre todos los pasajeros.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Fórmulas de Rendimiento y Consumo Vehicular
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Galones Requeridos en Ruta:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Distancia total recorrida dividida entre el rendimiento promedio del motor.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Galones = Distancia Total (km) ÷ Rendimiento (km/galón)
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-800 dark:text-sky-400 block">• Costo por Pasajero:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Gasto total en soles dividido entre los ocupantes del automóvil.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Cuota = (Galones × Precio/Galón) ÷ Número de Pasajeros
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Caso práctico de viaje: Ruta Lima - Ica (Ida y Vuelta)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Un viaje familiar de fin de semana comprende 300 km de ida y 300 km de vuelta (600 km en total por la Panamericana Sur). El automóvil rinde 40 km/galón usando Gasolina Regular a S/ 16.20 por galón con 4 ocupantes:
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Variable del Trayecto</th>
                    <th className="p-2.5">Cálculo Realizado</th>
                    <th className="p-2.5">Total Presupuestado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">Distancia Total (Ida y Vuelta)</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">300 km × 2 trayectos</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">600 km</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Combustible Demandado</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">600 km ÷ 40 km/galón</td>
                    <td className="p-2.5 font-mono">15.0 galones</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Gasto Total en Combustible</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">15.0 galones × S/ 16.20</td>
                    <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">S/ 243.00</td>
                  </tr>
                  <tr className="bg-emerald-50/60 dark:bg-emerald-950/30">
                    <td className="p-2.5 font-bold text-emerald-950 dark:text-emerald-300">Aporte Individual por Pasajero</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">S/ 243.00 ÷ 4 personas</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">S/ 60.75 c/u</td>
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
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Fuel className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos del Viaje o Recorrido</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="distance"
              label="Distancia del trayecto"
              suffix="km"
              value={distanceKm}
              onChange={(distanceKm) => setDistanceKm(distanceKm)}
              helpText="Ej: Lima a Ica (300 km)"
              placeholder="300"
              required
            />

            <InputNumber
              id="efficiency"
              label="Rendimiento del vehículo"
              suffix="km/gal"
              value={efficiencyKmPerGallon}
              onChange={(efficiencyKmPerGallon) => setEfficiencyKmPerGallon(efficiencyKmPerGallon)}
              helpText="Promedio sedán: 35 a 45 km/gal"
              placeholder="40"
              required
            />
          </div>

          {/* Quick Fuel Selection */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
              Tipo de Combustible y Precio de Referencia
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_FUELS.map((fuel) => (
                <button
                  key={fuel.id}
                  type="button"
                  onClick={() => setFuelPricePerUnit(fuel.price)}
                  className={`rounded-xl p-2.5 text-xs font-bold text-left border transition-all cursor-pointer ${
                    fuelPricePerUnit === fuel.price
                      ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-700'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate">{fuel.name}</div>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                    S/ {fuel.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="fuelPrice"
              label="Precio por galón o m³ en el grifo"
              prefix="S/"
              value={fuelPricePerUnit}
              onChange={(fuelPricePerUnit) => setFuelPricePerUnit(fuelPricePerUnit)}
              placeholder="16.20"
              required
            />

            <InputNumber
              id="passengers"
              label="Número de pasajeros para dividir"
              value={numberOfPassengers}
              onChange={(numberOfPassengers) => setNumberOfPassengers(numberOfPassengers)}
              min={1}
              max={20}
              placeholder="4"
              required
            />
          </div>

          <SwitchToggle
            id="roundTrip"
            label="¿El viaje incluye ida y vuelta?"
            description="Duplica automáticamente la distancia para el cálculo del combustible"
            checked={isRoundTrip}
            onChange={(isRoundTrip) => setIsRoundTrip(isRoundTrip)}
            badge="Ruta"
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Presupuesto del Viaje
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                {isRoundTrip ? 'Ida y Vuelta' : 'Solo Ida'}
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Gasto Total en Combustible
              </span>
              <div className="text-3xl sm:text-5xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-mono tabular-nums break-words leading-tight">
                {formatCurrency(result.totalFuelCost)}
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Requiere {result.unitsNeeded} galones / m³ en total
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Costo por Pasajero"
                value={formatCurrency(result.costPerPassenger)}
                type="success"
                subValue={`Dividido entre ${numberOfPassengers} personas`}
              />
              <ResultMetricCard
                label="Distancia Total"
                value={`${formatNumber(result.totalDistanceKm)} km`}
                type="neutral"
                subValue={isRoundTrip ? 'Ruta de ida y retorno' : 'Trayecto simple'}
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-2xl bg-white/90 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5 border border-emerald-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex justify-between font-medium">
                <span>Rendimiento del vehículo:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">{efficiencyKmPerGallon} km/gal</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Precio por galón / m³:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">{formatCurrency(fuelPricePerUnit)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Costo por kilómetro recorrido:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                  {formatCurrency(result.totalDistanceKm > 0 ? result.totalFuelCost / result.totalDistanceKm : 0)} / km
                </span>
              </div>
            </div>

            <ShareButtons title="Gasto de Combustible y Viaje" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
