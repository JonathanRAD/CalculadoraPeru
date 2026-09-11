'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import {
  calculateTaxRegimes,
  ClientType,
  ActivityType,
  TaxpayerType,
} from '@/core/calculators/taxRegimes';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { ResultMetricCard } from '@/shared/components/ui/ResultMetricCard';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { ExportPdfButton } from '@/shared/components/ui/ExportPdfButton';
import { Building, Sparkles, Check, X } from 'lucide-react';

export default function RegimenesTributariosPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'regimenes-tributarios-sunat') || {
    id: 'regimenes-tributarios-sunat',
    slug: '/regimenes-tributarios-sunat',
    title: 'Simulador de Regímenes Tributarios SUNAT (RUS, RER, MYPE y General)',
    shortTitle: 'Regímenes Tributarios SUNAT',
    description: 'Descubre en qué régimen tributario de la SUNAT te conviene inscribir tu negocio (RUS, RER, RMT o General) y cuánto pagarás de impuestos.',
    cardSummary: 'Simula qué régimen SUNAT te conviene (RUS, RER, MYPE)',
    category: 'tributario' as const,
    tag: 'SUNAT',
    icon: 'Building',
    badge: 'MYPE',
    keywords: ['regimenes tributarios sunat', 'nuevo rus rer rmt general', 'que regimen me conviene', 'impuestos sunat mype', 'cuanto pago en el rus'],
  };

  const [estimatedMonthlyRevenue, setEstimatedMonthlyRevenue] = useState<number>(4500);
  const [estimatedMonthlyPurchases, setEstimatedMonthlyPurchases] = useState<number>(1500);
  const [clientType, setClientType] = useState<ClientType>('final_consumer');
  const [activityType, setActivityType] = useState<ActivityType>('commerce_trade');
  const [taxpayerType, setTaxpayerType] = useState<TaxpayerType>('natural_person');

  const result = calculateTaxRegimes({
    estimatedMonthlyRevenue,
    estimatedMonthlyPurchases,
    clientType,
    activityType,
    taxpayerType,
  });

  const shareSummary = `Diagnóstico Tributario SUNAT:
Régimen Recomendado: ${result.recommendedRegimeName}
Impuesto Mensual Estimado: ${formatCurrency(result.monthlyEstimatedTax)}
Motivo: ${result.recommendedReason}`;

  const faqs = [
    {
      question: '¿Cuáles son los 4 regímenes tributarios para empresas y negocios en SUNAT?',
      answer: 'En el Perú existen cuatro regímenes tributarios vigentes para rentas de tercera categoría: 1) Nuevo Régimen Único Simplificado (NRUS), 2) Régimen Especial de Renta (RER), 3) Régimen MYPE Tributario (RMT), y 4) Régimen General (RG). Cada uno tiene requisitos de ingresos, topes de activos, tipos de comprobantes permitidos y obligaciones de libros contables diferenciadas.',
    },
    {
      question: '¿Por qué en el Nuevo RUS no se pueden emitir facturas?',
      answer: 'Por disposición expresa de la Ley del Nuevo RUS, este régimen está diseñado exclusivamente para pequeños comerciantes o prestadores de oficios dirigidos al consumidor final (personas sin RUC). Al estar exonerados de declarar el IGV mensualmente, no pueden trasladar crédito fiscal a terceros, por lo que solo pueden emitir Boletas de Venta y Tickets de máquina registradora.',
    },
    {
      question: '¿Qué actividades económicas NO pueden acogerse al Régimen Especial (RER)?',
      answer: 'El RER prohíbe actividades de asesoría profesional, consultoría jurídica o contable, servicios de ingeniería, agencias de viaje, transporte de carga con vehículos mayores a 2 toneladas métricas y contratos de construcción. Estos negocios deben acogerse obligatoriamente al Régimen MYPE Tributario (RMT) o Régimen General.',
    },
    {
      question: '¿Cuál es la escala del Impuesto a la Renta en el Régimen MYPE Tributario (RMT)?',
      answer: 'El RMT aplica una tasa progresiva muy ventajosa sobre la utilidad neta anual: 10% por las primeras 15 UIT de renta neta y 29.5% por el exceso de 15 UIT. Además, los pagos a cuenta mensuales son de solo 1% de los ingresos netos mientras las ventas anuales no superen las 300 UIT.',
    },
    {
      question: '¿Cómo y cuándo puedo cambiarme de régimen tributario en SUNAT?',
      answer: 'Puedes subir a un régimen de mayor exigencia (ej. de NRUS a RER o RMT) en cualquier mes del año fiscal con la presentación oportuna de tu declaración jurada mensual. Sin embargo, para descender a un régimen inferior (ej. de RMT a RER o NRUS), la ley tributaria exige realizar el cambio únicamente con la declaración mensual correspondiente al periodo enero.',
    },
  ];

  return (
    <CalculatorShell
      meta={meta}
      faqs={faqs}
      educationalContent={
        <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            Elegir el régimen tributario adecuado ante la <strong>Superintendencia Nacional de Aduanas y de Administración Tributaria (SUNAT)</strong> es una de las decisiones estratégicas más importantes para cualquier emprendedor o empresa en el Perú. Un régimen mal elegido puede ocasionar pagos en exceso de impuestos o contingencias por infracciones formales.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            Matriz Comparativa de Regímenes Tributarios SUNAT
          </h3>

          <div className="my-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                <tr>
                  <th className="p-3">Régimen</th>
                  <th className="p-3">Límite de Ingresos Anuales</th>
                  <th className="p-3">Comprobantes Permitidos</th>
                  <th className="p-3">Tasa Impuesto a la Renta</th>
                  <th className="p-3">Libros Contables</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold">Nuevo RUS (NRUS)</td>
                  <td className="p-3">Hasta S/ 96,000 / año (S/ 8,000 / mes)</td>
                  <td className="p-3">Solo Boletas de Venta y Guías</td>
                  <td className="p-3 font-mono">Cuota fija S/ 20 o S/ 50</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">Sin libros</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Régimen Especial (RER)</td>
                  <td className="p-3">Hasta S/ 525,000 / año</td>
                  <td className="p-3">Facturas, Boletas y todos</td>
                  <td className="p-3 font-mono">1.5% mensual (definitivo)</td>
                  <td className="p-3">Registro de Compras y Ventas</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">MYPE Tributario (RMT)</td>
                  <td className="p-3">Hasta 1,700 UIT anuales</td>
                  <td className="p-3">Facturas, Boletas y todos</td>
                  <td className="p-3 font-mono">1% a cuenta / 10% anual (≤15 UIT)</td>
                  <td className="p-3">Compras, Ventas y Diario Simplif.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Régimen General (RG)</td>
                  <td className="p-3">Sin límite de ingresos</td>
                  <td className="p-3">Facturas, Boletas y todos</td>
                  <td className="p-3 font-mono">1.5% o coeficiente / 29.5% anual</td>
                  <td className="p-3">Contabilidad completa según UIT</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            Recomendación Estratégica para tu Negocio
          </h3>
          <p>
            Si tus clientes son personas naturales (comercio minorista local), el <strong>Nuevo RUS</strong> te brinda la mayor simplicidad y mínimo costo tributario. Si necesitas vender a empresas con Factura Electrónica para que deduzcan costo y crédito fiscal, el <strong>Régimen MYPE Tributario</strong> suele ser la opción fiscalmente más eficiente en sus primeros años de operación.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Building className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Perfil de tu Emprendimiento</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputNumber
              id="monthlyRevenue"
              label="Ventas netas mensuales (sin IGV)"
              prefix="S/"
              value={estimatedMonthlyRevenue}
              onChange={(val) => setEstimatedMonthlyRevenue(val)}
              placeholder="4500.00"
              required
            />

            <InputNumber
              id="monthlyPurchases"
              label="Compras netas mensuales (sin IGV)"
              prefix="S/"
              value={estimatedMonthlyPurchases}
              onChange={(val) => setEstimatedMonthlyPurchases(val)}
              helpText="Para crédito fiscal de IGV"
              placeholder="1500.00"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
                Tipo de contribuyente
              </label>
              <select
                value={taxpayerType}
                onChange={(e) => setTaxpayerType(e.target.value as TaxpayerType)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-amber-600"
              >
                <option value="natural_person">Persona natural con negocio</option>
                <option value="legal_entity">Persona jurídica / Empresa</option>
              </select>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
                ¿A quiénes le venderás principalmente?
              </label>
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value as ClientType)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-amber-600"
              >
                <option value="final_consumer">Consumidor final / Personas (Boleta)</option>
                <option value="businesses_factura">Empresas y Negocios (Factura obligatoria)</option>
                <option value="both">Ambos (Boletas y Facturas)</option>
              </select>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 block mb-2">
                Giro / Actividad
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-amber-600"
              >
                <option value="commerce_trade">Comercio (Venta de productos/bodega)</option>
                <option value="services">Servicios profesionales o técnicos</option>
                <option value="manufacturing">Manufactura / Confecciones / Fábrica</option>
              </select>
            </div>
          </div>

          {/* Comparativa Detallada 4 Regímenes */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Evaluación de los 4 Regímenes SUNAT:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.regimes.map((regime) => {
                const isRecommended = result.recommendedRegimeId === regime.regimeId;
                return (
                  <div
                    key={regime.regimeId}
                    className={`rounded-2xl border p-3.5 transition-all ${
                      isRecommended
                        ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 ring-2 ring-emerald-600/20'
                        : regime.isEligible
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {regime.name.split('(')[0]}
                      </span>
                      {isRecommended && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-700 text-white px-2 py-0.2 text-[10px] font-bold shrink-0">
                          <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                          Recomendado
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      {regime.isEligible ? formatCurrency(regime.totalMonthlyTax) : 'No apto'}
                      <span className="text-[10px] font-normal text-slate-500 not-mono ml-1">/ mes</span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                      <div className="flex items-center gap-1">
                        {regime.canIssueFactura ? (
                          <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 text-rose-500 shrink-0" />
                        )}
                        <span>{regime.canIssueFactura ? 'Emite Factura y Boleta' : 'Solo Boleta (No Factura)'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        📚 {regime.accountingBooksRequired}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-amber-900/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Diagnóstico SUNAT
              </span>
              <span className="rounded-full bg-amber-700 dark:bg-amber-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                SUNAT 2026
              </span>
            </div>

            {/* Big Main Result Box */}
            <div className="rounded-2xl bg-white dark:bg-slate-950 border-2 border-amber-200 dark:border-amber-800/60 p-6 shadow-sm text-center mb-5 overflow-hidden">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Régimen Ideal Recomendado
              </span>
              <div
                title={result.recommendedRegimeName}
                className="text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-400 mt-1 tracking-tight break-words px-2"
              >
                {result.recommendedRegimeName}
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-amber-100/70 dark:bg-slate-900 p-3 rounded-xl">
                💡 {result.recommendedReason}
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <ResultMetricCard
                label="Impuesto Mensual Estimado"
                value={formatCurrency(result.monthlyEstimatedTax)}
                type="success"
                subValue="Renta + IGV"
              />
              <ResultMetricCard
                label="Ventas Anuales Proyectadas"
                value={formatCurrency(estimatedMonthlyRevenue * 12)}
                type="neutral"
                subValue="Base 12 meses"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <ExportPdfButton
                className="flex-1"
                getReportOptions={() => ({
                  title: 'Diagnóstico de Régimen Tributario SUNAT',
                  subtitle: `Evaluación de negocio para selección de RUC y régimen fiscal`,
                  items: [
                    { label: 'Ventas Mensuales Estimadas', value: formatCurrency(estimatedMonthlyRevenue) },
                    { label: 'Compras Mensuales con Factura', value: formatCurrency(estimatedMonthlyPurchases) },
                    { label: 'Perfil de Clientes', value: clientType === 'final_consumer' ? 'Consumidor Final' : clientType === 'businesses_factura' ? 'Empresas (Factura)' : 'Mixto' },
                    { label: 'Tipo de contribuyente', value: taxpayerType === 'natural_person' ? 'Persona natural' : 'Persona jurídica' },
                    { label: 'Régimen Recomendado', value: result.recommendedRegimeName, isHighlight: true },
                    { label: 'Impuesto Mensual Proyectado', value: formatCurrency(result.monthlyEstimatedTax), isHighlight: true },
                  ],
                  totalLabel: 'Régimen Sugerido',
                  totalValue: result.recommendedRegimeName,
                  notes: [
                    'Diagnóstico referencial según las normas tributarias de SUNAT para el ejercicio fiscal.',
                    'Consulte con su contador colegiado para la inscripción formal y acogimiento en la ficha RUC.',
                  ],
                })}
              />
            </div>

            <div className="mt-3">
              <ShareButtons title="Simulador Regímenes Tributarios SUNAT" shareText={shareSummary} />
            </div>
          </div>
        </div>

      </div>
    </CalculatorShell>
  );
}
