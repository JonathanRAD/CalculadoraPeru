'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateElectricity, ElectricityInput } from '@/core/calculators/electricity';
import { ELECTRIC_APPLIANCES, PERU_CONSTANTS } from '@/core/constants/peru';
import { formatCurrency, formatNumber } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Zap, Sparkles } from 'lucide-react';

export default function ConsumoElectricoPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'consumo-electrico')!;

  const [form, setForm] = useState<ElectricityInput>({
    powerWatts: 1200,
    hoursPerDay: 5,
    daysPerMonth: 30,
    kwhRate: PERU_CONSTANTS.DEFAULT_KWH_COST,
  });

  const [selectedApplianceId, setSelectedApplianceId] = useState<string>('aire_acondicionado');

  const handleSelectAppliance = (appliance: typeof ELECTRIC_APPLIANCES[number]) => {
    setSelectedApplianceId(appliance.id);
    setForm({
      ...form,
      powerWatts: appliance.watts,
      hoursPerDay: appliance.defaultHours,
    });
  };

  const result = calculateElectricity(form);

  const shareSummary = `Consumo Mensual: ${formatNumber(result.monthlyKwh, 1)} kWh
Gasto Estimado en Recibo: ${formatCurrency(result.estimatedMonthlyCost)}/mes
Gasto Anual: ${formatCurrency(result.estimatedAnnualCost)}/año`;

  const faqs = [
    {
      question: '¿Cuánto cuesta 1 kWh de luz en Perú actualmente?',
      answer: 'En Lima (Luz del Sur y Enel / Pliego tarifario residencial BT5B), el costo promedio del kilovatio-hora oscila entre S/ 0.68 y S/ 0.76 dependiendo del rango de consumo mensual y cargos por reposición y alumbrado público.',
    },
    {
      question: '¿Cuáles son los electrodomésticos que más consumen en Perú?',
      answer: 'Los artefactos de resistencia y climatización encabezan el consumo: Terma eléctrica (1500W a 2000W), Aire acondicionado (1000W a 2200W), Hervidor de agua (1500W) y Plancha (1200W).',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-3">
          <p>
            El consumo de energía de tu recibo de luz se factura en <strong>Kilovatios-hora (kWh)</strong>. 
            1 kWh equivale a 1,000 Watts de potencia utilizados de manera continua durante 1 hora.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Zap className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Selecciona o personaliza tu artefacto</h2>
          </div>

          {/* Quick Predefined Appliances Carousel / Pills */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 block">
              Artefactos populares en Perú:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ELECTRIC_APPLIANCES.slice(0, 6).map((app) => {
                const isSelected = selectedApplianceId === app.id;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleSelectAppliance(app)}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-left border transition-all text-xs font-medium ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-base">{app.icon}</span>
                    <span className="line-clamp-1">{app.name.split('(')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="powerWatts"
              label="Potencia del artefacto"
              suffix="Watts (W)"
              value={form.powerWatts}
              onChange={(powerWatts) => {
                setSelectedApplianceId('');
                setForm({ ...form, powerWatts });
              }}
              helpText="Ver etiqueta posterior del equipo"
              placeholder="1200"
              required
            />

            <InputNumber
              id="hoursPerDay"
              label="Horas de uso al día"
              suffix="horas/día"
              value={form.hoursPerDay}
              onChange={(hoursPerDay) => setForm({ ...form, hoursPerDay })}
              helpText="Promedio de encendido diario"
              placeholder="5"
              max={24}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="daysPerMonth"
              label="Días de uso al mes"
              suffix="días"
              value={form.daysPerMonth}
              onChange={(daysPerMonth) => setForm({ ...form, daysPerMonth })}
              helpText="Por defecto 30 días"
              placeholder="30"
              max={31}
            />

            <InputNumber
              id="kwhRate"
              label="Tarifa por kWh (Luz del Sur / Enel)"
              prefix="S/"
              suffix="/ kWh"
              value={form.kwhRate || PERU_CONSTANTS.DEFAULT_KWH_COST}
              onChange={(kwhRate) => setForm({ ...form, kwhRate })}
              helpText="Promedio Lima S/ 0.72"
              placeholder="0.72"
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-white to-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Gasto Estimado de Luz
              </span>
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white">
                ⚡ Electricidad
              </span>
            </div>

            {/* Big Main Result */}
            <div className="rounded-2xl bg-white border border-emerald-200/60 p-5 shadow-2xs text-center mb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Costo Mensual Estimado
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-600 mt-1">
                {formatCurrency(result.estimatedMonthlyCost)}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Consumo de {formatNumber(result.monthlyKwh, 1)} kWh al mes
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Costo por cada hora"
                value={formatCurrency(result.costPerHour, true, 3)}
                type="neutral"
                subValue="Gasto mientras está encendido"
              />
              <ResultMetricCard
                label="Impacto Anual"
                value={formatCurrency(result.estimatedAnnualCost)}
                type="warning"
                subValue="Proyección en 12 meses"
              />
            </div>

            <ShareButtons title="Consumo Eléctrico y Recibo de Luz" shareText={shareSummary} />
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
