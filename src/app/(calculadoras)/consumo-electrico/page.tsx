'use client';

import React, { useRef, useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { formatCurrency, formatNumber } from '@/core/math/formatters';
import { ELECTRIC_APPLIANCES } from '@/core/constants/peru';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Zap, Plus, Trash2 } from 'lucide-react';

interface ApplianceRow {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
  daysPerMonth: number;
}

export default function ConsumoElectricoPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'consumo-electrico')!;

  const [tariffPerKwh, setTariffPerKwh] = useState<number>(0.72);
  const nextApplianceId = useRef(4);
  const [appliances, setAppliances] = useState<ApplianceRow[]>([
    { id: '1', name: 'Refrigeradora (No Frost)', watts: 250, hoursPerDay: 12, daysPerMonth: 30 },
    { id: '2', name: 'Aire Acondicionado (12000 BTU)', watts: 1200, hoursPerDay: 5, daysPerMonth: 30 },
    { id: '3', name: 'Computadora / Laptop', watts: 150, hoursPerDay: 8, daysPerMonth: 26 },
  ]);

  const totalMonthlyKwh = appliances.reduce((acc, app) => {
    return acc + (app.watts * app.hoursPerDay * app.daysPerMonth) / 1000;
  }, 0);

  const totalMonthlyCost = totalMonthlyKwh * tariffPerKwh;

  const addAppliance = (presetName: string, presetWatts: number) => {
    const id = `appliance-${nextApplianceId.current}`;
    nextApplianceId.current += 1;
    setAppliances([
      ...appliances,
      {
        id,
        name: presetName,
        watts: presetWatts,
        hoursPerDay: 4,
        daysPerMonth: 30,
      },
    ]);
  };

  const removeAppliance = (id: string) => {
    setAppliances(appliances.filter((a) => a.id !== id));
  };

  const updateAppliance = (id: string, field: keyof ApplianceRow, val: string | number) => {
    setAppliances(
      appliances.map((a) => (a.id === id ? { ...a, [field]: val } : a))
    );
  };

  const shareSummary = `Consumo Eléctrico Estimado: ${formatNumber(totalMonthlyKwh)} kWh/mes
Gasto Total: ${formatCurrency(totalMonthlyCost)} al mes (Tarifa S/ ${tariffPerKwh}/kWh)`;

  const faqs = [
    {
      question: '¿Cuál es la tarifa promedio por kWh en Perú?',
      answer: 'En Lima y las principales ciudades del Perú, la tarifa residencial y comercial BT5B de Luz del Sur y Enel (Plena) ronda entre S/ 0.70 y S/ 0.85 por kilovatio-hora (kWh), incluyendo cargos por distribución y alumbrado público.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El consumo de energía se calcula multiplicando la potencia en Watts del artefacto por las horas de uso diario y los días del mes, dividido entre 1,000 para obtener los <strong>kWh</strong>.
          </p>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 text-xs">
            <strong>Fórmula:</strong> kWh Mensual = (Watts × Horas/día × Días/mes) / 1000 | Costo = kWh × Tarifa por kWh
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Artefactos y Equipos</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Tarifa S/:</span>
              <input
                type="number"
                step="0.01"
                value={tariffPerKwh}
                onChange={(e) => setTariffPerKwh(parseFloat(e.target.value) || 0)}
                className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              + Agregar artefactos comunes:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ELECTRIC_APPLIANCES.slice(0, 6).map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => addAppliance(preset.name, preset.watts)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-800 dark:hover:text-teal-300 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>{preset.name} ({preset.watts}W)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Appliances List */}
          <div className="space-y-3">
            {appliances.map((app) => {
              const kwh = (app.watts * app.hoursPerDay * app.daysPerMonth) / 1000;
              const cost = kwh * tariffPerKwh;
              return (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={app.name}
                      onChange={(e) => updateAppliance(app.id, 'name', e.target.value)}
                      className="font-bold text-sm text-slate-900 dark:text-white bg-transparent outline-none border-b border-transparent focus:border-slate-300"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-400 font-mono">
                        {formatCurrency(cost)} / mes
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAppliance(app.id)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        aria-label="Eliminar artefacto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Potencia (Watts)</label>
                      <input
                        type="number"
                        value={app.watts}
                        onChange={(e) => updateAppliance(app.id, 'watts', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Horas / día</label>
                      <input
                        type="number"
                        max="24"
                        value={app.hoursPerDay}
                        onChange={(e) => updateAppliance(app.id, 'hoursPerDay', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Días / mes</label>
                      <input
                        type="number"
                        max="31"
                        value={app.daysPerMonth}
                        onChange={(e) => updateAppliance(app.id, 'daysPerMonth', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-teal-200/80 dark:border-slate-800 bg-gradient-to-b from-teal-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                Gasto de Energía Mensual
              </span>
              <span className="rounded-full bg-teal-700 dark:bg-teal-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Osinergmin
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border border-teal-200/60 dark:border-slate-800 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Gasto Estimado al Mes
              </span>
              <div className="text-3xl sm:text-4xl font-black text-teal-700 dark:text-teal-400 mt-1">
                {formatCurrency(totalMonthlyCost)}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {formatNumber(totalMonthlyKwh)} kWh totales al mes
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Gasto Diario Promedio"
                value={formatCurrency(totalMonthlyCost / 30)}
                type="success"
                subValue="Por cada día de uso"
              />
              <ResultMetricCard
                label="Equipos en lista"
                value={`${appliances.length} artefactos`}
                type="neutral"
                subValue={`Tarifa: S/ ${tariffPerKwh}/kWh`}
              />
            </div>

            <ShareButtons title="Consumo Eléctrico" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
