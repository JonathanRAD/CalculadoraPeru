/**
 * Gráficos de las guías.
 *
 * Cada cifra se calcula con las mismas funciones que usan las calculadoras, de modo que un
 * gráfico nunca puede contradecir a la calculadora ni a las tablas de la guía.
 * Se asocian a una sección por el inicio de su encabezado.
 */

import { AFP_FLOW_RATES_2026, ELECTRIC_APPLIANCES, PERU_CONSTANTS } from '@/core/constants/peru';
import { calculateNetSalary } from '@/core/calculators/payroll';
import { calculateGratification } from '@/core/calculators/gratification';
import { calculateCts } from '@/core/calculators/cts';
import { calculateOvertime } from '@/core/calculators/overtime';
import { calculateIgv } from '@/core/calculators/tax';
import { calculateProfitMargin } from '@/core/calculators/margin';
import { calculateFuelCost } from '@/core/calculators/fuel';
import { calculatePosCommission, GATEWAY_RATES, type PosGateway } from '@/core/calculators/posCommissions';
import { calculateElectricity } from '@/core/calculators/electricity';
import { calculateTaxRegimes } from '@/core/calculators/taxRegimes';

export type VisualFormat = 'currency' | 'percent' | 'number';

export type GuideVisual =
  | {
      type: 'bars';
      title: string;
      caption: string;
      format: VisualFormat;
      items: { label: string; value: number; note?: string }[];
      /** Índice de la barra a destacar. */
      highlight?: number;
    }
  | {
      type: 'stack';
      title: string;
      caption: string;
      format: VisualFormat;
      items: { label: string; value: number }[];
    }
  | {
      type: 'timeline';
      title: string;
      caption: string;
      steps: { when: string; title: string; detail: string }[];
    };

export interface VisualPlacement {
  /** Texto con el que empieza el encabezado de la sección donde se muestra el gráfico. */
  sectionStartsWith: string;
  visual: GuideVisual;
}

const salary = calculateNetSalary({ grossSalary: 3000, pensionSystem: 'onp' });

const gratiFull = calculateGratification({ baseSalary: 2400, hasFamilyAllowance: true, monthsWorkedInSemester: 6, companyRegime: 'general', healthInsurance: 'essalud' });
const gratiFour = calculateGratification({ baseSalary: 2400, hasFamilyAllowance: true, monthsWorkedInSemester: 4, companyRegime: 'general', healthInsurance: 'essalud' });
const gratiTwo = calculateGratification({ baseSalary: 2400, hasFamilyAllowance: true, monthsWorkedInSemester: 2, companyRegime: 'general', healthInsurance: 'essalud' });

const cts = calculateCts({ baseSalary: 2400, hasFamilyAllowance: true, monthsWorkedInSemester: 6, companyRegime: 'general' });

const overtime = calculateOvertime({ baseMonthlySalary: 2400, hoursFirstTwo: 1, hoursAfterTwo: 1, holidayHours: 1 });

const igv = calculateIgv({ amount: 100, mode: 'add_igv' });

const margin = calculateProfitMargin({ salePrice: 100, cost: 80, priceIncludesIgv: false });

const fuelCost = (efficiency: number) =>
  calculateFuelCost({ distanceKm: 300, efficiencyKmPerGallon: efficiency, fuelPricePerUnit: 18, numberOfPassengers: 1, isRoundTrip: true }).totalFuelCost;

const posGateways: Array<{ key: PosGateway; label: string }> = [
  { key: 'yape', label: 'Yape Empresa' },
  { key: 'culqi', label: 'Culqi' },
  { key: 'mercadopago', label: 'Mercado Pago' },
  { key: 'izipay', label: 'Izipay' },
];

const taxComparison = calculateTaxRegimes({
  estimatedMonthlyRevenue: 20000,
  estimatedMonthlyPurchases: 8000,
  clientType: 'both',
  activityType: 'commerce_trade',
  workerCount: 3,
  estimatedMonthlyProfit: 5000,
});
const annualTax = (id: 'rer' | 'rmt' | 'general') => taxComparison.regimes.find((item) => item.regimeId === id)?.annualIncomeTax ?? 0;

const applianceIds = ['aire_acondicionado', 'terma', 'refrigeradora', 'lavadora', 'laptop', 'microondas', 'foco_led'];
const applianceRows = applianceIds
  .map((id) => ELECTRIC_APPLIANCES.find((item) => item.id === id))
  .filter((item): item is (typeof ELECTRIC_APPLIANCES)[number] => Boolean(item))
  .map((item) => ({
    label: item.name.replace(/\s*\(.*\)$/, ''),
    value: calculateElectricity({ powerWatts: item.watts, hoursPerDay: item.defaultHours, daysPerMonth: 30, kwhRate: PERU_CONSTANTS.DEFAULT_KWH_COST }).estimatedMonthlyCost,
    note: `${item.watts} W × ${item.defaultHours} h al día`,
  }))
  .sort((a, b) => b.value - a.value);

export const GUIDE_VISUALS: Record<string, VisualPlacement[]> = {
  'cuanto-me-descuentan-de-mi-sueldo': [
    {
      sectionStartsWith: '1. El aporte',
      visual: {
        type: 'bars',
        title: 'Descuento previsional sobre tu remuneración',
        caption: 'Tasa total que se descuenta cada mes según tu sistema de pensiones (comisión sobre flujo, julio de 2026).',
        format: 'percent',
        items: [
          { label: 'ONP', value: PERU_CONSTANTS.ONP_RATE * 100 },
          { label: 'AFP Habitat', value: AFP_FLOW_RATES_2026.afp_habitat.rate * 100 },
          { label: 'AFP Integra', value: AFP_FLOW_RATES_2026.afp_integra.rate * 100 },
          { label: 'AFP Prima', value: AFP_FLOW_RATES_2026.afp_prima.rate * 100 },
          { label: 'AFP Profuturo', value: AFP_FLOW_RATES_2026.afp_profuturo.rate * 100 },
        ],
      },
    },
    {
      sectionStartsWith: '4. Ejemplo',
      visual: {
        type: 'stack',
        title: 'A dónde va un sueldo bruto de S/ 3,000 en la ONP',
        caption: 'Reparto mensual: lo que llega a tu cuenta, el aporte a la ONP y la retención de quinta categoría.',
        format: 'currency',
        items: [
          { label: 'Sueldo neto', value: salary.netSalary },
          { label: 'ONP (13 %)', value: salary.pensionDeduction },
          { label: 'Quinta categoría', value: salary.fifthCategoryTaxMonthly },
        ],
      },
    },
  ],
  'gratificacion-julio-diciembre-como-se-calcula': [
    {
      sectionStartsWith: '5. Ejemplo B',
      visual: {
        type: 'bars',
        title: 'Cuánto recibes según los meses trabajados en el semestre',
        caption: 'Gratificación más bonificación extraordinaria de 9 %, con una remuneración de S/ 2,523 (sueldo S/ 2,400 y asignación familiar S/ 123).',
        format: 'currency',
        items: [
          { label: '6 meses', value: gratiFull.totalToReceive },
          { label: '4 meses', value: gratiFour.totalToReceive },
          { label: '2 meses', value: gratiTwo.totalToReceive },
        ],
      },
    },
  ],
  'cts-como-se-calcula-y-cuando-se-deposita': [
    {
      sectionStartsWith: '1. Cuándo',
      visual: {
        type: 'timeline',
        title: 'Calendario de la CTS',
        caption: 'Cada semestre se deposita en la entidad financiera que tú eliges; si el 15 es día no hábil, el plazo pasa al siguiente día hábil.',
        steps: [
          { when: '1 de noviembre al 30 de abril', title: 'Primer semestre', detail: 'Se calcula con la remuneración vigente al 30 de abril y el sexto de la gratificación de diciembre.' },
          { when: 'Hasta el 15 de mayo', title: 'Primer depósito', detail: 'Plazo máximo para depositar la CTS del semestre de noviembre a abril.' },
          { when: '1 de mayo al 31 de octubre', title: 'Segundo semestre', detail: 'Se calcula con la remuneración vigente al 31 de octubre y el sexto de la gratificación de julio.' },
          { when: 'Hasta el 15 de noviembre', title: 'Segundo depósito', detail: 'Plazo máximo para depositar la CTS del semestre de mayo a octubre.' },
        ],
      },
    },
    {
      sectionStartsWith: '4. Ejemplo',
      visual: {
        type: 'stack',
        title: 'Qué compone la remuneración computable',
        caption: 'Sueldo y asignación familiar, más un sexto de la gratificación: la base que se divide entre 12.',
        format: 'currency',
        items: [
          { label: 'Sueldo y asignación familiar', value: cts.computableSalary },
          { label: 'Sexto de gratificación', value: cts.oneSixthGratification },
        ],
      },
    },
  ],
  'horas-extras-como-se-pagan': [
    {
      sectionStartsWith: '4. Ejemplo',
      visual: {
        type: 'bars',
        title: 'Cuánto vale una hora según el tramo',
        caption: 'Sueldo de S/ 2,400 y jornada de 8 horas: valor de una hora ordinaria y de una hora extra o en feriado sin descanso sustitutorio.',
        format: 'currency',
        items: [
          { label: 'Hora ordinaria', value: overtime.hourlyRate },
          { label: 'Extra, primeras 2 horas (+25 %)', value: overtime.pay25Percent },
          { label: 'Extra, desde la 3.ª hora (+35 %)', value: overtime.pay35Percent },
          { label: 'Feriado sin descanso (+100 %)', value: overtime.payHoliday },
        ],
        highlight: 3,
      },
    },
  ],
  'igv-18-como-calcularlo-y-desglosarlo': [
    {
      sectionStartsWith: '1. Sumar',
      visual: {
        type: 'stack',
        title: 'Un producto de S/ 100 más IGV',
        caption: 'El total que paga el cliente se divide en la base de tu venta y el impuesto que declaras.',
        format: 'currency',
        items: [
          { label: 'Base imponible', value: igv.baseAmount },
          { label: 'IGV 18 %', value: igv.igvAmount },
        ],
      },
    },
  ],
  'margen-vs-recargo-como-fijar-precio-de-venta': [
    {
      sectionStartsWith: '1. Dos formas',
      visual: {
        type: 'bars',
        title: 'La misma utilidad, dos porcentajes distintos',
        caption: 'Con costo S/ 80 y precio S/ 100, la utilidad de S/ 20 es 20 % del precio (margen) y 25 % del costo (recargo).',
        format: 'percent',
        items: [
          { label: 'Margen sobre la venta', value: margin.profitMarginPercentage },
          { label: 'Recargo sobre el costo', value: margin.markupPercentage },
        ],
        highlight: 0,
      },
    },
  ],
  'que-regimen-tributario-elegir-rus-rer-rmt': [
    {
      sectionStartsWith: '3. Ejemplo',
      visual: {
        type: 'bars',
        title: 'Impuesto a la renta anual con S/ 60,000 de utilidad',
        caption: 'Ventas de S/ 240,000 al año y utilidad de S/ 5,000 al mes. En el RER el pago mensual es definitivo; en el RMT y el General se regulariza al cierre del año.',
        format: 'currency',
        items: [
          { label: 'RER (1,5 % de las ventas)', value: annualTax('rer') },
          { label: 'RMT (10 % hasta 15 UIT)', value: annualTax('rmt') },
          { label: 'Régimen General (29,5 %)', value: annualTax('general') },
        ],
      },
    },
  ],
  'cuanto-gasta-tu-auto-en-combustible-por-km': [
    {
      sectionStartsWith: '3. Cuánto cambia',
      visual: {
        type: 'bars',
        title: 'Costo de un viaje de 600 km según el rendimiento',
        caption: 'Con gasolina a S/ 18.00 por galón (valor de ejemplo): cuanto más rinde tu vehículo, menos pagas por el mismo recorrido.',
        format: 'currency',
        items: [
          { label: '30 km por galón', value: fuelCost(30) },
          { label: '40 km por galón', value: fuelCost(40) },
          { label: '50 km por galón', value: fuelCost(50) },
        ],
      },
    },
  ],
  'comisiones-yape-pos-como-calcular-lo-que-recibes': [
    {
      sectionStartsWith: '2. Cuánto recibes',
      visual: {
        type: 'bars',
        title: 'De una venta de S/ 100, esto te llega',
        caption: `Monto neto con las tarifas publicadas (${GATEWAY_RATES.yape.name}: ${GATEWAY_RATES.yape.rate} % + IGV; los demás según el comparativo de octubre de 2026). En ventas pequeñas el cargo fijo pesa más.`,
        format: 'currency',
        items: posGateways
          .map(({ key, label }) => ({
            label,
            value: calculatePosCommission({ amount: 100, gateway: key, mode: 'deduct_from_sale' }).netReceived,
          }))
          .sort((a, b) => b.value - a.value),
      },
    },
  ],
  'consumo-electrico-electrodomesticos-cuanto-cuesta': [
    {
      sectionStartsWith: '2. Ejemplo',
      visual: {
        type: 'bars',
        title: 'Costo mensual estimado por aparato',
        caption: 'Con S/ 0.75 por kWh y las horas de uso típicas durante 30 días: los equipos de calor y climatización concentran el gasto.',
        format: 'currency',
        items: applianceRows,
        highlight: 0,
      },
    },
  ],
};

export function visualsForSection(slug: string, heading: string): GuideVisual[] {
  return (GUIDE_VISUALS[slug] ?? [])
    .filter((placement) => heading.startsWith(placement.sectionStartsWith))
    .map((placement) => placement.visual);
}
