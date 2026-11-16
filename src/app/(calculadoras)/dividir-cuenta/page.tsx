'use client';

import React, { useState } from 'react';
import { CalculatorShell } from '@/features/calculators/components/CalculatorShell';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';
import { calculateSplitBill } from '@/core/calculators/splitBill';
import { formatCurrency } from '@/core/math/formatters';
import { InputNumber } from '@/shared/components/ui/InputNumber';
import { PayslipResult } from '@/shared/components/ui/PayslipResult';
import { ShareButtons } from '@/shared/components/ui/ShareButtons';
import { Utensils } from 'lucide-react';

export default function DividirCuentaPage() {
  const meta = CALCULATORS_REGISTRY.find((c) => c.id === 'dividir-cuenta')!;

  const [totalBill, setTotalBill] = useState<number>(180);
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(4);

  const result = calculateSplitBill({
    totalBill,
    tipPercentage,
    numberOfPeople,
  });

  const shareSummary = `Dividir Cuenta Restaurante:
• Total con Propina (${tipPercentage}%): ${formatCurrency(result.totalWithTip)}
• Número de Personas: ${numberOfPeople} amigos
• Cuota Individual (Yape/Plin): ${formatCurrency(result.amountPerPerson)} cada uno
• Monto de Propina Total: ${formatCurrency(result.tipAmount)}`;

  const faqs = [
    {
      question: '¿Es obligatoria la propina en los restaurantes de Perú?',
      answer: 'No. En el Perú la propina es enteramente voluntaria según las disposiciones de INDECOPI. El cliente decide de manera libre si desea dejar un incentivo al mozo o personal de atención por un servicio satisfactorio, siendo el 10% el porcentaje habitual y sugerido.',
    },
    {
      question: '¿Qué es el "Recargo al Consumo" del 13% que aparece en algunas boletas?',
      answer: 'El Decreto Ley N° 25988 permite a los establecimientos de hospedaje y restaurantes aplicar un "Recargo al Consumo" de hasta un 13% sobre el valor de venta, destinado íntegramente a los trabajadores del local. Este cargo no es un tributo del Estado, pero si el local decide cobrarlo, debe advertirlo obligatoriamente en su carta de precios física y digital.',
    },
    {
      question: '¿La propina se calcula sobre el monto con IGV o sin IGV?',
      answer: 'Social y prácticamente, al revisar la pre-cuenta o ticket final en la mesa, los clientes calculan la propina sobre el total final impreso (que ya incluye el 18% de IGV). No obstante, en establecimientos de alta cocina se estila aplicar el porcentaje sobre el subtotal neto de alimentos y bebidas.',
    },
    {
      question: '¿Cómo enviar el cobro de la cuenta dividida a los amigos por Yape o Plin?',
      answer: 'Una vez calculada la cuota exacta por persona con esta herramienta, puedes pulsar el botón "Copiar resumen" o compartirlo por WhatsApp para que cada comensal transfiera su parte exacta vía Yape o Plin al titular que canceló la boleta general.',
    },
    {
      question: '¿Qué hacer si un comensal consumió significativamente más que los demás?',
      answer: 'Esta calculadora realiza una división equitativa ("a partes iguales"), ideal para consumos compartidos (pizzas, piqueos, pollerías o botellas). Si hubo consumos individuales muy dispares, se aconseja separar platos personales y dividir equitativamente solo las entradas, bebidas y la propina común.',
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
              ¿Cómo dividir la cuenta de restaurante y calcular la propina en Perú?
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Dividir la cuenta (split the bill) en reuniones de amigos, almuerzos de trabajo o celebraciones familiares en pollerías, cevicherías y restaurantes del Perú ahorra tiempo y malentendidos. Permite añadir una propina voluntaria justa para el personal de servicio y calcular la cuota exacta que cada asistente debe transferir por <strong>Yape</strong> o <strong>Plin</strong>.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-[#18202A] p-5 border border-slate-200 dark:border-[#2C3744] space-y-3 text-[13px] leading-relaxed">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              1. Fórmulas de Reparto Equitativo y Propinas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 p-3.5 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Total con Propina Voluntaria:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Monto de la pre-cuenta más el porcentaje de reconocimiento al mozo.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Total Final = Monto Consumo × (1 + Propina%)
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-[#0E141B] rounded border border-slate-200 dark:border-[#2C3744]">
                <span className="font-bold text-brand-800 dark:text-brand-400 block">• Cuota Individual por Persona:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  División exacta entre el número de comensales en la mesa.
                </p>
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 pt-1">
                  Cuota = Total Final ÷ Número de Personas
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white">
              2. Caso práctico: Almuerzo compartido entre 4 comensales
            </h3>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Un grupo de 4 compañeros de trabajo almuerza en un restaurante y el consumo total en la pre-cuenta asciende a S/ 180.00. Deciden dejar el 10% de propina por un servicio óptimo:
            </p>

            <div className="overflow-x-auto rounded border border-slate-200 dark:border-[#2C3744]">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5">Concepto del Pago</th>
                    <th className="p-2.5">Operación</th>
                    <th className="p-2.5">Monto en Soles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">Consumo Total Facturado</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">Monto según ticket</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">S/ 180.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Propina Sugerida (10%)</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">S/ 180.00 × 0.10</td>
                    <td className="p-2.5 font-mono text-brand-700 dark:text-brand-400">+S/ 18.00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Total Liquidado en Mesa</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">S/ 180.00 + S/ 18.00</td>
                    <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">S/ 198.00</td>
                  </tr>
                  <tr className="bg-brand-50/60 dark:bg-brand-950/30">
                    <td className="p-2.5 font-bold text-brand-950 dark:text-brand-300">Aporte Individual (Yape / Plin)</td>
                    <td className="p-2.5 font-mono font-bold text-brand-800 dark:text-brand-400">S/ 198.00 ÷ 4 personas</td>
                    <td className="p-2.5 font-mono font-bold text-brand-800 dark:text-brand-400">S/ 49.50 cada uno</td>
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
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos de la Cuenta</h2>
          </div>

          <InputNumber
            id="totalBill"
            label="Monto total del consumo (Boleta o Pre-cuenta)"
            prefix="S/"
            value={totalBill}
            onChange={(totalBill) => setTotalBill(totalBill)}
            placeholder="180.00"
            required
          />

          {/* Quick Tip Selection */}
          <div>
            <label className="mb-1.5 block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              Propina sugerida
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTipPercentage(pct)}
                  className={`rounded py-2.5 text-[13px] font-bold transition-all cursor-pointer border ${
                    tipPercentage === pct
                      ? 'border-brand-700 bg-brand-50 dark:bg-brand-950/80 text-brand-900 dark:text-brand-300 ring-1 ring-brand-700'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0E141B] text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {pct === 0 ? 'Sin propina' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          <InputNumber
            id="people"
            label="Número de personas para dividir"
            value={numberOfPeople}
            onChange={(numberOfPeople) => setNumberOfPeople(numberOfPeople)}
            min={1}
            max={50}
            helpText="Cantidad de amigos o comensales"
            placeholder="4"
            required
          />
        </div>
        {/* Resultado con forma de boleta */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <PayslipResult
            title={"Cada uno debe transferir"}
            period={"Yape / Plin"}
            amountHeader="Valor"
            lines={[
              { label: "Cuenta Total", amount: formatCurrency(result.totalWithTip), note: `Incluye ${tipPercentage}% propina` },
              { label: "Propina Total", amount: formatCurrency(result.tipAmount), note: `${formatCurrency(result.tipAmount / (numberOfPeople || 1))} por persona` },
              { label: "Consumo según ticket boleta", amount: formatCurrency(totalBill) },
              { label: `Propina agregada (${tipPercentage}%)`, amount: `+${formatCurrency(result.tipAmount)}` },
              { label: "Total general a pagar en caja", amount: formatCurrency(result.totalWithTip) },
            ]}
            totalLabel={"Monto por Persona"}
            totalAmount={formatCurrency(result.amountPerPerson)}
            footnote={`Dividido en partes iguales entre ${numberOfPeople} personas`}
          >
            

            <ShareButtons title="Dividir Cuenta Restaurante" shareText={shareSummary} />
          </PayslipResult>
        </div>

      </div>
    </CalculatorShell>
  );
}
