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

  const [tariffPerKwh, setTariffPerKwh] = useState<number>(0.75);
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

  const shareSummary = `Consumo Eléctrico Estimado:
• Gasto Total Mensual: ${formatCurrency(totalMonthlyCost)}
• Energía Consumida: ${formatNumber(totalMonthlyKwh)} kWh/mes
• Tarifa Aplicada: S/ ${tariffPerKwh.toFixed(2)} por kWh (Osinergmin BT5B)
• Gasto Diario Promedio: ${formatCurrency(totalMonthlyCost / 30)}`;

  const faqs = [
    {
      question: '¿Cuál es la tarifa promedio por kWh en Perú según Osinergmin?',
      answer: 'En Lima y las principales regiones del Perú, la tarifa residencial estándar (Opción Tarifaria BT5B) supervisada por el Osinergmin se ubica habitualmente entre S/ 0.72 y S/ 0.85 por kilovatio-hora (kWh) para consumos mayores a 30 o 100 kWh/mes, incluyendo los cargos por reposición, mantenimiento y alumbrado público.',
    },
    {
      question: '¿Cuáles son los electrodomésticos que más energía consumen en un hogar o negocio?',
      answer: 'Los artefactos que generan calor o frío mediante resistencias o compresores continuos son los de mayor consumo: la terma eléctrica (1,500W a 2,000W), el aire acondicionado (1,000W a 2,200W), la cocina eléctrica o freidora de aire (1,400W a 1,800W) y la secadora de ropa (2,000W a 3,000W).',
    },
    {
      question: '¿Cómo se convierte la potencia de Watts a consumo en Kilovatios-hora (kWh)?',
      answer: 'Un kilovatio equivale a 1,000 Watts. Para calcular el consumo mensual, se multiplica la potencia en Watts por las horas de uso diario y por los días del mes, dividiendo el resultado entre 1,000. Por ejemplo: una terma de 1,500W usada 2 horas al día durante 30 días consume: (1,500 × 2 × 30) ÷ 1,000 = 90 kWh al mes.',
    },
    {
      question: '¿Qué es el "consumo fantasma" o modo de espera (standby)?',
      answer: 'Es la energía que consumen televisores, cargadores de celular conectados, microondas con reloj digital o consolas de videojuegos aun cuando están apagados. En una vivienda promedio en el Perú, el consumo fantasma puede representar entre el 5% y el 10% del total de la factura mensual.',
    },
    {
      question: '¿Cómo reducir el gasto de energía en pequeños negocios y talleres?',
      answer: 'Reemplazar luminarias fluorescentes por tecnología LED (ahorro de hasta 80% en iluminación), programar temporizadores en termas o calentadores de agua y verificar que las refrigeradoras o congeladoras cuenten con empaques herméticos sin fugas de frío.',
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
              ¿Cómo calcular el Consumo Eléctrico y el Costo en tu Recibo de Luz en Perú?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Monitorear el consumo de kilovatios-hora (<strong>kWh</strong>) de cada electrodoméstico o maquinaria es indispensable para optimizar las finanzas del hogar y evitar sorpresas en los recibos de las empresas distribuidoras de energía (Luz del Sur, Plena / Enel, Hidrandina, Seal, Electrocentro, entre otras), bajo el marco regulatorio de <strong>OSINERGMIN</strong>.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Fórmulas de Facturación Eléctrica Residencial y Comercial
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">• Consumo en Kilovatios-hora (kWh):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Energía demandada mensualmente por cada equipo según su potencia nominal.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  kWh = (Potencia en Watts × Horas de uso/día × Días/mes) ÷ 1,000
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sky-800 dark:text-sky-400 block">• Costo Estimado en Recibo (Soles):</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Multiplicación directa del total de kWh consumidos por el pliego tarifario local.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 pt-1">
                  Costo Mensual S/ = kWh Consumidos × Tarifa por kWh (S/)
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              2. Tabla de Potencias y Consumos Habituales en Perú
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Referencia técnica de los artefactos más frecuentes en viviendas y microempresas peruanas (calculados con tarifa promedio de S/ 0.75/kWh):
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Artefacto Eléctrico</th>
                    <th className="p-2.5">Potencia Promedio</th>
                    <th className="p-2.5">Uso Habitual</th>
                    <th className="p-2.5">Consumo Mensual</th>
                    <th className="p-2.5">Gasto Estimado (S/)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">Refrigeradora No Frost</td>
                    <td className="p-2.5 font-mono">250 Watts</td>
                    <td className="p-2.5">Compresor ~12 h/día</td>
                    <td className="p-2.5 font-mono">90.0 kWh</td>
                    <td className="p-2.5 font-mono font-semibold">S/ 67.50 / mes</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Terma eléctrica (50L)</td>
                    <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">1,500 Watts</td>
                    <td className="p-2.5">2 horas diarias</td>
                    <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">90.0 kWh</td>
                    <td className="p-2.5 font-mono font-semibold text-rose-600 dark:text-rose-400">S/ 67.50 / mes</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Aire acondicionado (12k BTU)</td>
                    <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">1,200 Watts</td>
                    <td className="p-2.5">5 horas al día</td>
                    <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">180.0 kWh</td>
                    <td className="p-2.5 font-mono font-bold text-rose-600 dark:text-rose-400">S/ 135.00 / mes</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Computadora / Laptop de trabajo</td>
                    <td className="p-2.5 font-mono">150 Watts</td>
                    <td className="p-2.5">8 horas (26 días)</td>
                    <td className="p-2.5 font-mono">31.2 kWh</td>
                    <td className="p-2.5 font-mono font-semibold">S/ 23.40 / mes</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Foco LED estándar</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">9 Watts</td>
                    <td className="p-2.5">6 horas diarias</td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">1.6 kWh</td>
                    <td className="p-2.5 font-mono font-semibold text-emerald-700 dark:text-emerald-400">S/ 1.20 / mes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Fuentes oficiales y alcance del cálculo:</span>
            <ul className="space-y-1 list-disc pl-4">
              <li>
                <strong>Organismo Supervisor de la Inversión en Energía y Minería (Osinergmin):</strong> Supervisa las tarifas del servicio público de electricidad y pliegos tarifarios vigentes en el{' '}
                <a
                  href="https://www.osinergmin.gob.pe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-800"
                >
                  Portal Institucional de Osinergmin
                </a>.
              </li>
              <li>
                <strong>Alcance y limitaciones:</strong> Esta herramienta calcula el <em>consumo activo directo de energía por artefactos</em>. No incluye cargos fijos de distribución, mantenimiento y reposición de conexión, alumbrado público, compensación FOSE ni tributos de facturación que emite tu distribuidora eléctrica (Pluz, Enel, Luz del Sur, Seal, Hidrandina, Electrocentro, etc.).
              </li>
            </ul>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Artefactos y Equipos</h2>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="tariffPerKwh" className="text-xs text-slate-600 dark:text-slate-400 font-medium">Tarifa S/ kWh:</label>
              <input
                id="tariffPerKwh"
                type="number"
                step="0.01"
                value={tariffPerKwh}
                onChange={(e) => setTariffPerKwh(parseFloat(e.target.value) || 0)}
                className="w-20 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              + Agregar artefactos comunes:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ELECTRIC_APPLIANCES.slice(0, 6).map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => addAppliance(preset.name, preset.watts)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer transition-colors"
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
                      id={`app-name-${app.id}`}
                      type="text"
                      aria-label={`Nombre del artefacto ${app.name}`}
                      value={app.name}
                      onChange={(e) => updateAppliance(app.id, 'name', e.target.value)}
                      className="font-bold text-sm text-slate-900 dark:text-white bg-transparent outline-none border-b border-transparent focus:border-slate-300"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 font-mono tabular-nums">
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
                      <label htmlFor={`app-watts-${app.id}`} className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Potencia (Watts)</label>
                      <input
                        id={`app-watts-${app.id}`}
                        type="number"
                        value={app.watts}
                        onChange={(e) => updateAppliance(app.id, 'watts', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor={`app-hours-${app.id}`} className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Horas / día</label>
                      <input
                        id={`app-hours-${app.id}`}
                        type="number"
                        max="24"
                        value={app.hoursPerDay}
                        onChange={(e) => updateAppliance(app.id, 'hoursPerDay', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor={`app-days-${app.id}`} className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Días / mes</label>
                      <input
                        id={`app-days-${app.id}`}
                        type="number"
                        max="31"
                        value={app.daysPerMonth}
                        onChange={(e) => updateAppliance(app.id, 'daysPerMonth', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none font-mono"
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
          <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Gasto de Energía Mensual
              </span>
              <span className="rounded-full bg-emerald-700 dark:bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                Osinergmin
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-800/60 p-6 shadow-sm text-center mb-5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Gasto Estimado al Mes
              </span>
              <div className="text-3xl sm:text-5xl font-black text-emerald-800 dark:text-emerald-400 mt-1 font-mono tabular-nums break-words leading-tight">
                {formatCurrency(totalMonthlyCost)}
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {formatNumber(totalMonthlyKwh)} kWh consumidos en total al mes
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Gasto Diario Promedio"
                value={formatCurrency(totalMonthlyCost / 30)}
                type="success"
                subValue="Costo por día de uso"
              />
              <ResultMetricCard
                label="Artefactos en lista"
                value={`${appliances.length} equipos`}
                type="neutral"
                subValue={`Tarifa: S/ ${tariffPerKwh.toFixed(2)}/kWh`}
              />
            </div>

            {/* Breakdown Detail */}
            <div className="rounded-2xl bg-white/90 dark:bg-slate-950 p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-5 border border-emerald-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex justify-between font-medium">
                <span>Tarifa por kWh aplicada:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">S/ {tariffPerKwh.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Promedio por equipo:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                  {formatCurrency(appliances.length > 0 ? totalMonthlyCost / appliances.length : 0)} / mes
                </span>
              </div>
            </div>

            <ShareButtons title="Consumo Eléctrico Estimado" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
