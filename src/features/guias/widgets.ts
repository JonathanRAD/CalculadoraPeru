/**
 * Mini calculadoras que se muestran dentro de las guías.
 * Cada una usa las mismas funciones del núcleo que la calculadora completa, así que el
 * resultado coincide con el de la calculadora enlazada.
 */

import { calculateNetSalary, type PensionSystem } from '@/core/calculators/payroll';
import { calculateGratification } from '@/core/calculators/gratification';
import { calculateCts } from '@/core/calculators/cts';
import { calculateOvertime } from '@/core/calculators/overtime';
import { calculateIgv } from '@/core/calculators/tax';
import { calculateSalePrice } from '@/core/calculators/pricing';
import { calculateFuelCost } from '@/core/calculators/fuel';
import { calculatePosCommission, GATEWAY_RATES, type PosGateway } from '@/core/calculators/posCommissions';
import { calculateElectricity } from '@/core/calculators/electricity';
import { calculateTaxRegimes } from '@/core/calculators/taxRegimes';
import { formatCurrency } from '@/core/math/formatters';

export type WidgetValues = Record<string, number | string>;

export type WidgetField =
  | { key: string; type: 'number'; label: string; defaultValue: number; prefix?: string; suffix?: string; max?: number }
  | { key: string; type: 'select'; label: string; defaultValue: string; options: { value: string; label: string }[] };

export interface WidgetRow {
  label: string;
  value: string;
  strong?: boolean;
}

export interface WidgetConfig {
  title: string;
  description: string;
  fields: WidgetField[];
  compute: (values: WidgetValues) => WidgetRow[];
}

const num = (values: WidgetValues, key: string) => {
  const value = Number(values[key]);
  return Number.isFinite(value) ? value : 0;
};
const str = (values: WidgetValues, key: string) => String(values[key] ?? '');

const YES_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
];

export const GUIDE_WIDGETS: Record<string, WidgetConfig> = {
  'cuanto-me-descuentan-de-mi-sueldo': {
    title: 'Calcula tu sueldo neto',
    description: 'Ingresa tu sueldo bruto y tu sistema de pensiones. Es la misma fórmula de la calculadora de sueldo neto.',
    fields: [
      { key: 'salary', type: 'number', label: 'Sueldo bruto mensual', defaultValue: 3000, prefix: 'S/' },
      {
        key: 'system',
        type: 'select',
        label: 'Sistema de pensiones',
        defaultValue: 'onp',
        options: [
          { value: 'onp', label: 'ONP' },
          { value: 'afp_habitat', label: 'AFP Habitat' },
          { value: 'afp_integra', label: 'AFP Integra' },
          { value: 'afp_prima', label: 'AFP Prima' },
          { value: 'afp_profuturo', label: 'AFP Profuturo' },
        ],
      },
      { key: 'dependents', type: 'select', label: '¿Percibes asignación familiar?', defaultValue: 'no', options: YES_NO },
    ],
    compute: (v) => {
      const r = calculateNetSalary({
        grossSalary: num(v, 'salary'),
        pensionSystem: str(v, 'system') as PensionSystem,
        hasDependents: str(v, 'dependents') === 'si',
      });
      return [
        { label: 'Ingreso afecto', value: formatCurrency(r.pensionableIncome) },
        { label: `Pensión (${r.pensionRate.toFixed(2)} %)`, value: `− ${formatCurrency(r.pensionDeduction)}` },
        { label: 'Retención de quinta categoría', value: `− ${formatCurrency(r.fifthCategoryTaxMonthly)}` },
        { label: 'Sueldo neto estimado', value: formatCurrency(r.netSalary), strong: true },
      ];
    },
  },

  'gratificacion-julio-diciembre-como-se-calcula': {
    title: 'Calcula tu gratificación',
    description: 'Con los meses completos que trabajaste en el semestre.',
    fields: [
      { key: 'salary', type: 'number', label: 'Sueldo mensual', defaultValue: 2400, prefix: 'S/' },
      { key: 'months', type: 'number', label: 'Meses completos en el semestre (1 a 6)', defaultValue: 6, max: 6 },
      { key: 'family', type: 'select', label: '¿Percibes asignación familiar?', defaultValue: 'si', options: YES_NO },
    ],
    compute: (v) => {
      const r = calculateGratification({
        baseSalary: num(v, 'salary'),
        hasFamilyAllowance: str(v, 'family') === 'si',
        monthsWorkedInSemester: num(v, 'months') || 1,
        companyRegime: 'general',
        healthInsurance: 'essalud',
      });
      return [
        { label: 'Remuneración computable', value: formatCurrency(r.baseComputableSalary) },
        { label: 'Gratificación', value: formatCurrency(r.rawGratification) },
        { label: 'Bonificación extraordinaria (9 %)', value: formatCurrency(r.extraordinaryBonus) },
        { label: 'Total a recibir', value: formatCurrency(r.totalToReceive), strong: true },
      ];
    },
  },

  'cts-como-se-calcula-y-cuando-se-deposita': {
    title: 'Calcula tu depósito de CTS',
    description: 'Régimen general, con la última gratificación completa.',
    fields: [
      { key: 'salary', type: 'number', label: 'Sueldo mensual', defaultValue: 2400, prefix: 'S/' },
      { key: 'months', type: 'number', label: 'Meses completos en el semestre (1 a 6)', defaultValue: 6, max: 6 },
      { key: 'family', type: 'select', label: '¿Percibes asignación familiar?', defaultValue: 'si', options: YES_NO },
    ],
    compute: (v) => {
      const r = calculateCts({
        baseSalary: num(v, 'salary'),
        hasFamilyAllowance: str(v, 'family') === 'si',
        monthsWorkedInSemester: num(v, 'months') || 1,
        companyRegime: 'general',
      });
      return [
        { label: 'Sueldo y asignación familiar', value: formatCurrency(r.computableSalary) },
        { label: 'Sexto de gratificación', value: formatCurrency(r.oneSixthGratification) },
        { label: 'Remuneración computable', value: formatCurrency(r.totalComputableBasis) },
        { label: 'CTS a depositar', value: formatCurrency(r.ctsAmountToDeposit), strong: true },
      ];
    },
  },

  'horas-extras-como-se-pagan': {
    title: 'Calcula tus horas extras',
    description: 'Con jornada de 8 horas diarias y sueldo mensual.',
    fields: [
      { key: 'salary', type: 'number', label: 'Sueldo mensual', defaultValue: 2400, prefix: 'S/' },
      { key: 'h25', type: 'number', label: 'Horas extras al 25 % (primeras 2 del día)', defaultValue: 4 },
      { key: 'h35', type: 'number', label: 'Horas extras al 35 % (desde la 3.ª)', defaultValue: 2 },
      { key: 'holiday', type: 'number', label: 'Horas en feriado sin descanso sustitutorio', defaultValue: 0 },
    ],
    compute: (v) => {
      const r = calculateOvertime({
        baseMonthlySalary: num(v, 'salary'),
        hoursFirstTwo: num(v, 'h25'),
        hoursAfterTwo: num(v, 'h35'),
        holidayHours: num(v, 'holiday'),
      });
      return [
        { label: 'Valor de la hora ordinaria', value: formatCurrency(r.hourlyRate) },
        { label: 'Horas al 25 %', value: formatCurrency(r.pay25Percent) },
        { label: 'Horas al 35 %', value: formatCurrency(r.pay35Percent) },
        { label: 'Feriado (sobretasa 100 %)', value: formatCurrency(r.payHoliday) },
        { label: 'Total de sobretiempo', value: formatCurrency(r.totalOvertimePay), strong: true },
      ];
    },
  },

  'igv-18-como-calcularlo-y-desglosarlo': {
    title: 'Suma o separa el IGV',
    description: 'Elige si tu monto ya incluye IGV o no.',
    fields: [
      { key: 'amount', type: 'number', label: 'Monto', defaultValue: 118, prefix: 'S/' },
      {
        key: 'mode',
        type: 'select',
        label: 'Mi monto…',
        defaultValue: 'extract_igv',
        options: [
          { value: 'extract_igv', label: 'ya incluye IGV (quiero separarlo)' },
          { value: 'add_igv', label: 'no incluye IGV (quiero sumarlo)' },
        ],
      },
    ],
    compute: (v) => {
      const r = calculateIgv({ amount: num(v, 'amount'), mode: str(v, 'mode') === 'add_igv' ? 'add_igv' : 'extract_igv' });
      return [
        { label: 'Base imponible', value: formatCurrency(r.baseAmount) },
        { label: 'IGV 18 %', value: formatCurrency(r.igvAmount) },
        { label: 'Total con IGV', value: formatCurrency(r.totalAmount), strong: true },
      ];
    },
  },

  'margen-vs-recargo-como-fijar-precio-de-venta': {
    title: 'Calcula tu precio de venta',
    description: 'A partir de tu costo y del margen que quieres sobre la venta.',
    fields: [
      { key: 'cost', type: 'number', label: 'Costo del producto', defaultValue: 60, prefix: 'S/' },
      { key: 'margin', type: 'number', label: 'Margen deseado sobre la venta', defaultValue: 30, suffix: '%', max: 90 },
      { key: 'commission', type: 'number', label: 'Comisión de cobro (opcional)', defaultValue: 0, suffix: '%', max: 50 },
    ],
    compute: (v) => {
      const r = calculateSalePrice({
        cost: num(v, 'cost'),
        marginPercentage: num(v, 'margin'),
        includeIgv: true,
        salesCommissionPercentage: num(v, 'commission'),
      });
      return [
        { label: 'Precio sin IGV', value: formatCurrency(r.basePriceWithoutIgv) },
        { label: 'Utilidad por unidad', value: formatCurrency(r.profitPerUnit) },
        { label: 'Margen real obtenido', value: `${r.realMarginPercentage.toFixed(2)} %` },
        { label: 'Precio de lista con IGV', value: formatCurrency(r.recommendedSalePrice), strong: true },
      ];
    },
  },

  'que-regimen-tributario-elegir-rus-rer-rmt': {
    title: 'Compara regímenes con tus números',
    description: 'Ventas y utilidad mensuales estimadas, sin IGV.',
    fields: [
      { key: 'revenue', type: 'number', label: 'Ventas mensuales', defaultValue: 20000, prefix: 'S/' },
      { key: 'purchases', type: 'number', label: 'Compras mensuales con factura', defaultValue: 8000, prefix: 'S/' },
      { key: 'profit', type: 'number', label: 'Utilidad neta mensual', defaultValue: 3000, prefix: 'S/' },
    ],
    compute: (v) => {
      const r = calculateTaxRegimes({
        estimatedMonthlyRevenue: num(v, 'revenue'),
        estimatedMonthlyPurchases: num(v, 'purchases'),
        estimatedMonthlyProfit: num(v, 'profit') > 0 ? num(v, 'profit') : undefined,
        clientType: 'both',
        activityType: 'commerce_trade',
        workerCount: 2,
      });
      const rows: WidgetRow[] = r.regimes.map((item) => ({
        label: item.name.split(' (')[0],
        value: !item.isEligible
          ? 'No apto'
          : item.annualIncomeTax !== undefined
            ? `${formatCurrency(item.totalMonthlyTax)} al mes · renta anual ${formatCurrency(item.annualIncomeTax)}`
            : `${formatCurrency(item.totalMonthlyTax)} al mes`,
      }));
      rows.push({ label: 'Más conveniente según estos datos', value: r.recommendedRegimeName, strong: true });
      return rows;
    },
  },

  'cuanto-gasta-tu-auto-en-combustible-por-km': {
    title: 'Calcula el costo de tu viaje',
    description: 'Con el precio de tu grifo (consúltalo en Facilito) y el rendimiento real de tu vehículo.',
    fields: [
      { key: 'km', type: 'number', label: 'Distancia de ida', defaultValue: 300, suffix: 'km' },
      { key: 'eff', type: 'number', label: 'Rendimiento', defaultValue: 40, suffix: 'km/gal' },
      { key: 'price', type: 'number', label: 'Precio por galón', defaultValue: 21, prefix: 'S/' },
      { key: 'people', type: 'number', label: 'Personas que reparten el gasto', defaultValue: 4 },
      { key: 'round', type: 'select', label: '¿Ida y vuelta?', defaultValue: 'si', options: YES_NO },
    ],
    compute: (v) => {
      const r = calculateFuelCost({
        distanceKm: num(v, 'km'),
        efficiencyKmPerGallon: num(v, 'eff'),
        fuelPricePerUnit: num(v, 'price'),
        numberOfPassengers: num(v, 'people') || 1,
        isRoundTrip: str(v, 'round') === 'si',
      });
      return [
        { label: 'Distancia total', value: `${r.totalDistanceKm} km` },
        { label: 'Galones necesarios', value: r.unitsNeeded.toFixed(2) },
        { label: 'Costo por kilómetro', value: formatCurrency(r.costPerKm) },
        { label: 'Costo total de combustible', value: formatCurrency(r.totalFuelCost) },
        { label: 'Por persona', value: formatCurrency(r.costPerPassenger), strong: true },
      ];
    },
  },

  'comisiones-yape-pos-como-calcular-lo-que-recibes': {
    title: 'Calcula lo que recibes por cobro',
    description: 'Con las tarifas publicadas. Si tu contrato es distinto, usa la calculadora con comisión personalizada.',
    fields: [
      { key: 'amount', type: 'number', label: 'Monto', defaultValue: 100, prefix: 'S/' },
      {
        key: 'gateway',
        type: 'select',
        label: 'Operador',
        defaultValue: 'yape',
        options: (['yape', 'culqi', 'mercadopago', 'izipay', 'niubiz'] as PosGateway[]).map((key) => ({
          value: key,
          label: GATEWAY_RATES[key].name,
        })),
      },
      {
        key: 'mode',
        type: 'select',
        label: 'Quiero…',
        defaultValue: 'deduct_from_sale',
        options: [
          { value: 'deduct_from_sale', label: 'saber cuánto me llega de un cobro' },
          { value: 'add_to_charge', label: 'saber cuánto cobrar para recibir un monto exacto' },
        ],
      },
    ],
    compute: (v) => {
      const r = calculatePosCommission({
        amount: num(v, 'amount'),
        gateway: str(v, 'gateway') as PosGateway,
        mode: str(v, 'mode') === 'add_to_charge' ? 'add_to_charge' : 'deduct_from_sale',
      });
      return [
        { label: 'Tasa efectiva', value: `${r.effectiveRatePercentage.toFixed(3)} %${r.fixedFee > 0 ? ` + ${formatCurrency(r.fixedFee)} fijo` : ''}` },
        { label: 'Comisión total', value: formatCurrency(r.totalCommissionFee) },
        { label: 'Monto que paga el cliente', value: formatCurrency(r.chargeAmount) },
        { label: 'Monto que te llega', value: formatCurrency(r.netReceived), strong: true },
      ];
    },
  },

  'consumo-electrico-electrodomesticos-cuanto-cuesta': {
    title: 'Calcula el costo de un aparato',
    description: 'La potencia está en la etiqueta del aparato; el precio por kWh, en tu recibo.',
    fields: [
      { key: 'watts', type: 'number', label: 'Potencia', defaultValue: 1200, suffix: 'W' },
      { key: 'hours', type: 'number', label: 'Horas de uso al día', defaultValue: 5, max: 24 },
      { key: 'rate', type: 'number', label: 'Precio por kWh', defaultValue: 0.75, prefix: 'S/' },
    ],
    compute: (v) => {
      const r = calculateElectricity({
        powerWatts: num(v, 'watts'),
        hoursPerDay: num(v, 'hours'),
        daysPerMonth: 30,
        kwhRate: num(v, 'rate'),
      });
      return [
        { label: 'Consumo diario', value: `${r.dailyKwh} kWh` },
        { label: 'Consumo mensual', value: `${r.monthlyKwh} kWh` },
        { label: 'Costo por hora de uso', value: formatCurrency(r.costPerHour) },
        { label: 'Costo mensual', value: formatCurrency(r.estimatedMonthlyCost), strong: true },
        { label: 'Costo anual', value: formatCurrency(r.estimatedAnnualCost) },
      ];
    },
  },
};
