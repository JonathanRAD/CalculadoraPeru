export interface CalculatorMeta {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  category: 'comercio' | 'finanzas' | 'tributaria' | 'hogar';
  icon: string; // Lucide icon name or emoji
  tag: string;
  badge?: string;
  keywords: string[];
  formulaSummary: string;
}

export const CATEGORIES = [
  { id: 'todas', label: 'Todas las calculadoras', icon: 'LayoutGrid' },
  { id: 'comercio', label: 'Comercio & Ventas', icon: 'Store' },
  { id: 'finanzas', label: 'Finanzas & Inversión', icon: 'TrendingUp' },
  { id: 'tributaria', label: 'Impuestos & SUNAT', icon: 'Receipt' },
  { id: 'hogar', label: 'Hogar & Consumo', icon: 'Zap' },
] as const;

export const CALCULATORS_REGISTRY: CalculatorMeta[] = [
  {
    id: 'precio-de-venta',
    slug: '/precio-de-venta',
    title: 'Calculadora de Precio de Venta',
    shortTitle: 'Precio de Venta',
    description: 'Calcula el precio de venta ideal para tus productos o servicios considerando tu margen deseado, comisiones de pasarela e IGV.',
    category: 'comercio',
    icon: 'ShoppingCart',
    tag: 'Comercial',
    badge: 'Popular',
    keywords: ['precio de venta', 'fijar precio', 'margen comercial', 'calcular precio con igv', 'costo unitario'],
    formulaSummary: 'Precio Base = Costo Total / (1 - Margen% - Comisión%)',
  },
  {
    id: 'margen-de-ganancia',
    slug: '/margen-de-ganancia',
    title: 'Calculadora de Margen de Ganancia',
    shortTitle: 'Margen de Ganancia',
    description: 'Conoce tu margen de utilidad real, utilidad neta por producto y la diferencia exacta frente al mark-up sobre el costo.',
    category: 'comercio',
    icon: 'LineChart',
    tag: 'Rentabilidad',
    badge: 'Esencial',
    keywords: ['margen de ganancia', 'margen bruto', 'margen neto', 'markup', 'utilidad peru'],
    formulaSummary: 'Margen (%) = ((Precio Neto - Costo) / Precio Neto) * 100',
  },
  {
    id: 'punto-de-equilibrio',
    slug: '/punto-de-equilibrio',
    title: 'Calculadora de Punto de Equilibrio',
    shortTitle: 'Punto de Equilibrio',
    description: 'Descubre cuántas unidades y cuántos Soles debes vender cada mes para cubrir tus costos fijos y no perder dinero.',
    category: 'finanzas',
    icon: 'Scale',
    tag: 'Negocios',
    badge: 'MYPE',
    keywords: ['punto de equilibrio', 'costos fijos', 'costos variables', 'break even peru', 'unidades minimas'],
    formulaSummary: 'Unidades = Costos Fijos / (Precio - Costo Variable)',
  },
  {
    id: 'recuperacion-de-inversion',
    slug: '/recuperacion-de-inversion',
    title: 'Calculadora de Recuperación de Inversión (ROI)',
    shortTitle: 'Recuperación ROI',
    description: 'Estima en cuántos meses recuperarás tu capital invertido y cuál es la tasa de rentabilidad neta de tu proyecto.',
    category: 'finanzas',
    icon: 'PiggyBank',
    tag: 'Inversión',
    keywords: ['roi peru', 'retorno de inversion', 'payback', 'recuperar capital', 'rentabilidad negocio'],
    formulaSummary: 'Meses Payback = Inversión Inicial / Ganancia Neta Mensual',
  },
  {
    id: 'consumo-electrico',
    slug: '/consumo-electrico',
    title: 'Calculadora de Consumo Eléctrico',
    shortTitle: 'Consumo Eléctrico',
    description: 'Calcula el consumo en kWh y el gasto en soles en tu recibo de luz (Luz del Sur / Enel / ElectroDunas) por electrodoméstico.',
    category: 'hogar',
    icon: 'Zap',
    tag: 'Servicios',
    badge: 'Ahorro',
    keywords: ['recibo de luz', 'consumo electrico peru', 'kwh luz del sur', 'gasto enel', 'cuanto consume electrodomestico'],
    formulaSummary: 'Costo = (Watts * Horas * Días / 1000) * Tarifa kWh (S/ 0.72)',
  },
  {
    id: 'calculadora-igv',
    slug: '/calculadora-igv',
    title: 'Calculadora de IGV (18%) SUNAT',
    shortTitle: 'Calculadora de IGV',
    description: 'Calcula el IGV (18%) de una base imponible o extrae el subtotal y el IGV de un monto facturado total en Perú.',
    category: 'tributaria',
    icon: 'Receipt',
    tag: 'Tributario',
    badge: 'SUNAT',
    keywords: ['calcular igv', 'extraer igv 18', 'subtotal igv peru', 'facturacion sunat', 'igv 18 porciento'],
    formulaSummary: 'IGV = Base * 18%  |  Base = Total / 1.18',
  },
  {
    id: 'descuentos-y-ofertas',
    slug: '/descuentos-y-ofertas',
    title: 'Calculadora de Descuentos y Ofertas',
    shortTitle: 'Descuentos y Ofertas',
    description: 'Calcula el precio final con descuentos simples o descuentos sucesivos acumulados (ej: 20% + 10% adicional).',
    category: 'comercio',
    icon: 'Tag',
    tag: 'Promociones',
    keywords: ['descuentos', 'descuento sucesivo', 'calcular rebaja', 'porcentaje de descuento', 'ofertas cyber'],
    formulaSummary: 'Precio Final = Precio Original * (1 - d1%) * (1 - d2%)',
  },
  {
    id: 'ganancia-por-producto',
    slug: '/ganancia-por-producto',
    title: 'Calculadora de Ganancia por Producto',
    shortTitle: 'Ganancia por Producto',
    description: 'Calcula la utilidad unitaria neta considerando costos de producto y publicidad, con proyección de ganancias mensuales.',
    category: 'comercio',
    icon: 'PackageCheck',
    tag: 'E-commerce',
    keywords: ['ganancia por producto', 'utilidad unitaria', 'costo por adquisicion', 'proyeccion ventas'],
    formulaSummary: 'Ganancia Unitaria = Precio Venta - (Costo + Publicidad)',
  },
  {
    id: 'ventas-necesarias',
    slug: '/ventas-necesarias',
    title: 'Calculadora de Ventas Necesarias para Ganar S/ X',
    shortTitle: 'Meta de Ventas S/',
    description: 'Determina cuántos productos y cuántos Soles debes facturar al mes para alcanzar tu meta de sueldo o ganancia neta.',
    category: 'finanzas',
    icon: 'Target',
    tag: 'Metas',
    keywords: ['ventas necesarias', 'cuanto vender para ganar', 'meta de facturacion', 'objetivo financiero'],
    formulaSummary: 'Unidades = (Costos Fijos + Meta de Ganancia) / Margen Unitario',
  },
  {
    id: 'porcentajes',
    slug: '/porcentajes',
    title: 'Calculadora de Porcentajes Básicos',
    shortTitle: 'Porcentajes Básicos',
    description: 'Calcula fácilmente el X% de un número, qué porcentaje representa una cantidad sobre otra y variaciones porcentuales.',
    category: 'finanzas',
    icon: 'Percent',
    tag: 'Matemática',
    keywords: ['calcular porcentaje', 'porcentaje facil', 'variacion porcentual', 'regla de tres porcentaje'],
    formulaSummary: 'Resultado = (Porcentaje / 100) * Cantidad Total',
  },
];
