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
Distancia Total: ${formatNumber(result.totalDistanceKm)} km ${isRoundTrip ? '(Ida y vuelta)' : ''}
Combustible Requerido: ${result.unitsNeeded} galones/m³
Gasto Total en Soles: ${formatCurrency(result.totalFuelCost)}
Costo por Pasajero: ${formatCurrency(result.costPerPassenger)} (${numberOfPassengers} personas)`;

  const faqs = [
    {
      question: '¿Cómo saber cuántos km por galón rinde mi vehículo en Perú?',
      answer: 'Un auto sedán estándar de 1.4 a 1.6 litros rinde en promedio entre 35 y 45 km por galón en carretera, y unos 28 a 35 km por galón en el tráfico de Lima. Las SUV medianas rinden entre 25 y 32 km por galón.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            Calcula el gasto exacto de combustible para tus traslados diarios, delivery o viajes en carretera por el Perú y divide el costo de forma justa entre los pasajeros.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
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
              helpText="Promedio: 35 a 45 km/gal"
              placeholder="40"
              required
            />
          </div>

          {/* Quick Fuel Selection */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
              Tipo de Combustible y Precio Referencial
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_FUELS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFuelPricePerUnit(f.price)}
                  className={`rounded-xl p-2.5 text-xs font-bold text-left border transition-all cursor-pointer ${
                    fuelPricePerUnit === f.price
                      ? 'border-teal-700 bg-teal-50 dark:bg-teal-950/80 text-teal-900 dark:text-teal-300 ring-1 ring-teal-700'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div>{f.name}</div>
                  <span className="text-[11px] font-normal text-slate-500">S/ {f.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="fuelPrice"
              label="Precio por galón o m³ en grifo"
              prefix="S/"
              value={fuelPricePerUnit}
              onChange={(fuelPricePerUnit) => setFuelPricePerUnit(fuelPricePerUnit)}
              placeholder="16.20"
              required
            />

            <InputNumber
              id="passengers"
              label="Número de pasajeros"
              value={numberOfPassengers}
              onChange={(numberOfPassengers) => setNumberOfPassengers(numberOfPassengers)}
              min={1}
              helpText="Para dividir el gasto del viaje"
              placeholder="4"
            />
          </div>

          <SwitchToggle
            id="isRoundTrip"
            label="¿Es viaje de ida y vuelta?"
            description="Multiplica automáticamente la distancia total por 2"
            checked={isRoundTrip}
            onChange={(isRoundTrip) => setIsRoundTrip(isRoundTrip)}
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-teal-300 dark:border-teal-800/80 bg-teal-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-teal-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300">
                Presupuesto de Combustible
              </span>
              <span className="rounded-full bg-teal-700 dark:bg-teal-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                🇵🇪 En Soles
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-teal-200 dark:border-teal-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Gasto Total de Combustible
              </span>
              <div
                title={formatCurrency(result.totalFuelCost)}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-teal-900 dark:text-teal-400 mt-1 font-mono tracking-tight truncate max-w-full px-2"
              >
                {formatCurrency(result.totalFuelCost)}
              </div>
              <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
                Para recorrer {formatNumber(result.totalDistanceKm)} km en total
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Costo por Pasajero"
                value={formatCurrency(result.costPerPassenger)}
                type="success"
                subValue={`${numberOfPassengers} personas`}
              />
              <ResultMetricCard
                label="Galones / m³ Necesarios"
                value={`${result.unitsNeeded} gal`}
                type="neutral"
                subValue={`Costo/km: S/ ${result.costPerKm.toFixed(2)}`}
              />
            </div>

            <ShareButtons title="Gasto de Combustible y Viaje" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
