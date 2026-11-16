'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { ReferenceDataNote } from '@/shared/components/ui/ReferenceDataNote';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateFuelCost } from '@/core/calculators/fuel';
import { formatCurrency, formatNumber } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { SwitchToggle } from '@/shared/components/ui/SwitchToggle';
import { PayslipResult } from '@/shared/components/ui/PayslipResult';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Fuel } from 'lucide-react';

const COMMON_FUELS = [
  { id: 'regular', name: 'Gasohol Regular (90)', price: 21.00 },
  { id: 'premium', name: 'Gasohol Premium (95/97)', price: 24.00 },
  { id: 'diesel', name: 'Diésel B5 S-50', price: 26.50 },
  { id: 'glp', name: 'GLP (por galón, referencia)', price: 7.50 },
  { id: 'gnv', name: 'GNV (por m³, referencia)', price: 1.65 },
];

export default function GastoCombustiblePage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'gasto-combustible')!;

  const [distanceKm, setDistanceKm] = useState<number>(300);
  const [efficiencyKmPerGallon, setEfficiencyKmPerGallon] = useState<number>(40);
  const [fuelPricePerUnit, setFuelPricePerUnit] = useState<number>(21.00);
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
      dataNote={
        <ReferenceDataNote
          reviewed="2026-11-14"
          sources={[
            { label: 'Facilito (Osinergmin): precios por grifo', url: 'https://www.facilito.gob.pe/' },
            { label: 'gob.pe: cómo consultar los precios de combustibles', url: 'https://www.gob.pe/553-consultar-los-precios-de-combustibles' },
          ]}
        >
          El precio del combustible cambia casi a diario y varía según el grifo y el distrito. El valor que aparece en la calculadora es solo una referencia editable: En Lima, el 14 de noviembre de 2026, Facilito mostraba rangos aproximados de S/ 18.56 a 23.99 por galón de gasohol regular, S/ 20.39 a 27.99 de premium y S/ 23.09 a 30.36 de diésel; los valores iniciales son puntos medios redondeados. Los valores de GLP y GNV son referencias que no pudimos contrastar con una fuente de noviembre de 2026: consúltalos en Facilito. Ingresa el precio que ves en tu grifo y el rendimiento real de tu vehículo para obtener un resultado fiable.
        </ReferenceDataNote>
      }
      faqs={faqs}
      educationalContent={
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              ¿Cómo calcular el Consumo y Gasto de Combustible para viajes en Perú?
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Planificar con precisión el presupuesto de combustible para viajes de turismo, visitas familiares o traslados de logística y reparto en las carreteras del Perú permite optimizar el consumo del vehículo y dividir los costos de manera transparente y equitativa entre todos los pasajeros.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-[#18202A] p-5 border border-slate-200 dark:border-[#2C3744] space-y-3 text-[13px] leading-relaxed">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              1. Fórmulas de Rendimiento y Consumo Vehicular
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3.5 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Galones Requeridos en Ruta:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Distancia total recorrida dividida entre el rendimiento promedio del motor.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Galones = Distancia Total (km) ÷ Rendimiento (km/galón)
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Costo por Pasajero:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Gasto total en soles dividido entre los ocupantes del automóvil.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Cuota = (Galones × Precio/Galón) ÷ Número de Pasajeros
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              2. Caso práctico de viaje: Ruta Lima - Ica (Ida y Vuelta)
            </h3>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Un viaje familiar de fin de semana comprende 300 km de ida y 300 km de vuelta (600 km en total por la Panamericana Sur). El automóvil rinde 40 km/galón usando Gasohol Regular a S/ 21.00 por galón (valor de ejemplo) con 4 ocupantes:
            </p>

            <div className="overflow-x-auto rounded border border-slate-200 dark:border-[#2C3744]">
              <table className="w-full text-left text-[13px]">
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
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">15.0 galones × S/ 21.00</td>
                    <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">S/ 315.00</td>
                  </tr>
                  <tr className="bg-brand-50/60 dark:bg-brand-950/30">
                    <td className="p-2.5 font-bold text-brand-950 dark:text-brand-300">Aporte Individual por Pasajero</td>
                    <td className="p-2.5 font-mono font-bold text-brand-800 dark:text-brand-400">S/ 315.00 ÷ 4 personas</td>
                    <td className="p-2.5 font-mono font-bold text-brand-800 dark:text-brand-400">S/ 78.75 c/u</td>
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
        <div className="lg:col-span-7 rounded-lg border border-slate-200 dark:border-[#2C3744] bg-white dark:bg-[#18202A] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#2C3744] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
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
            <label className="mb-1.5 block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              Tipo de Combustible y Precio de Referencia
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_FUELS.map((fuel) => (
                <button
                  key={fuel.id}
                  type="button"
                  onClick={() => setFuelPricePerUnit(fuel.price)}
                  className={`min-h-12 rounded p-3 text-[15px] font-semibold text-left border transition-colors cursor-pointer ${
                    fuelPricePerUnit === fuel.price
                      ? 'border-brand-700 bg-brand-50 dark:bg-brand-950/80 text-brand-900 dark:text-brand-300 ring-1 ring-brand-700'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0E141B] text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="break-words leading-snug">{fuel.name}</div>
                  <span className="text-[13px] font-normal text-slate-500 dark:text-slate-400">
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
              placeholder="21.00"
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

        {/* Resultado con forma de boleta */}
        <div className="lg:col-span-5">
          <PayslipResult
            title="PRESUPUESTO DEL VIAJE"
            period={isRoundTrip ? 'Ida y vuelta' : 'Solo ida'}
            amountHeader="Valor"
            lines={[
              { label: 'Distancia total', note: isRoundTrip ? 'Ruta de ida y retorno' : 'Trayecto simple', amount: `${formatNumber(result.totalDistanceKm)} km` },
              { label: 'Rendimiento del vehículo', amount: `${efficiencyKmPerGallon} km/gal` },
              { label: 'Combustible requerido', amount: `${result.unitsNeeded} gal / m³` },
              { label: 'Precio por galón / m³', amount: formatCurrency(fuelPricePerUnit) },
              { label: 'Costo por kilómetro', amount: formatCurrency(result.totalDistanceKm > 0 ? result.totalFuelCost / result.totalDistanceKm : 0) },
            ]}
            totalLabel="Gasto total en combustible"
            totalAmount={formatCurrency(result.totalFuelCost)}
            footnote={<>Costo por pasajero: <strong>{formatCurrency(result.costPerPassenger)}</strong> entre {numberOfPassengers} personas.</>}
          >
            <ShareButtons title="Gasto de Combustible y Viaje" shareText={shareSummary} />
          </PayslipResult>
        </div>

      </div>
    </CalculatorShell>
  );
}
