'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Building2,
  Receipt,
  Zap,
  ArrowRight,
  FileSpreadsheet,
  Bookmark,
  Search,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Store,
  MessageCircle,
} from 'lucide-react';
import { usePro } from '@/features/premium/context/ProContext';

interface CalculatorGuideItem {
  id: string;
  slug: string;
  name: string;
  category: 'laboral' | 'tributario' | 'negocios' | 'finanzas';
  categoryLabel: string;
  iconName: string;
  freeTier: string;
  proBenefits: string[];
  howToUse: string[];
  badgeBenefit: string;
}

const CALCULATORS_GUIDE: CalculatorGuideItem[] = [
  {
    id: 'calculadora-cts',
    slug: '/calculadora-cts',
    name: 'Calculadora de CTS (Mayo y Noviembre)',
    category: 'laboral',
    categoryLabel: 'Laboral & Planilla',
    iconName: 'PiggyBank',
    freeTier: 'Cálculo del monto de depósito semestral y cómputo de 1/6 de gratificación según sueldo.',
    proBenefits: [
      'Semáforo de Multas SUNAFIL 2026: Simula la escala de sanción económica referencial (hasta 26.12 UIT = S/ 143,660 según UIT 2026 de S/ 5,500) si tu empresa no deposita a tiempo.',
      'Exportación a Excel (.CSV editable): Descarga la liquidación de depósito con base computable detallada.',
      'Guardado en la Nube: Almacena el cálculo de tus colaboradores en tu cuenta para consultar en mayo y noviembre.',
      'Envío a WhatsApp: Comparte el resumen de depósito al trabajador en formato profesional con un solo clic.',
    ],
    howToUse: [
      'Ingresa el sueldo básico, si percibe asignación familiar y los meses laborados (1 a 6).',
      'Revisa el resultado y desplázate al Semáforo SUNAFIL para conocer el riesgo de contingencia.',
      'Haz clic en "Guardar en Mis Cálculos" o "Exportar a Excel" para respaldar la información.',
    ],
    badgeBenefit: 'Semáforo SUNAFIL + Excel',
  },
  {
    id: 'liquidacion-laboral',
    slug: '/liquidacion-laboral',
    name: 'Liquidación de Beneficios Sociales (Todo en 1)',
    category: 'laboral',
    categoryLabel: 'Laboral & Planilla',
    iconName: 'FileText',
    freeTier: 'Cálculo simultáneo referencial de CTS trunca, gratificación trunca y vacaciones truncas.',
    proBenefits: [
      'Liquidación Formal en PDF: Documento estructurado con base legal expresa (D.L. 728, D.S. 001-97-TR), recuadros de firma y huella digital.',
      'Cálculo de Indemnización por Despido Arbitrario: Cálculo de 1.5 sueldos por año (máximo 12 sueldos).',
      'Membrete Corporativo Guardado: Tu Razón Social, RUC y Logotipo se cargan automáticamente.',
      'Exportación a Excel de Conceptos: Tabla organizada de conceptos lista para adjuntar a la carpeta de cese.',
      'Alerta legal de 48 horas bajo apercibimiento de la ley laboral peruana.',
    ],
    howToUse: [
      'Selecciona el régimen laboral (General, Pequeña Empresa o Microempresa) y motivo de cese.',
      'Ingresa sueldo, fechas de ingreso y cese.',
      'Descarga la Liquidación Formal en PDF o expórtala a Excel para firmar con el trabajador.',
    ],
    badgeBenefit: 'PDF Formal + Despido Arbitrario',
  },
  {
    id: 'sueldo-neto',
    slug: '/sueldo-neto',
    name: 'Calculadora de Sueldo Neto (Boleta de Pago)',
    category: 'laboral',
    categoryLabel: 'Laboral & Planilla',
    iconName: 'DollarSign',
    freeTier: 'Descuentos de ley (AFP Integra, Prima, Profuturo, Habitat u ONP 13%) y Renta de 5ta básica.',
    proBenefits: [
      'Generador de Boleta de Pago Formal (PDF): Conforme a la estructura del D.S. 001-98-TR y D.S. 009-2011-TR.',
      'Logotipo y RUC de la Empresa en Membrete: Sin necesidad de volver a subirlos cada mes.',
      'Estructura de conceptos PLAME: Rubros normativos de ingresos y descuentos para planillas.',
      'Exportación a Excel de la boleta mensual para control interno de RRHH.',
    ],
    howToUse: [
      'Digita el sueldo bruto y selecciona el sistema previsional (ONP o la AFP correspondiente).',
      'Haz clic en "Generar Boleta de Pago Formal (PDF)".',
      'Imprime o envía el PDF con membrete corporativo a tu colaborador.',
    ],
    badgeBenefit: 'Boleta de Pago Formal PDF (D.S. 001-98-TR)',
  },
  {
    id: 'cotizador',
    slug: '/cotizador',
    name: 'Cotizador Comercial PRO',
    category: 'negocios',
    categoryLabel: 'Negocios & Comercio',
    iconName: 'Store',
    freeTier: 'Creación de cotización temporal, cálculo en vivo de subtotal, descuentos por ítem e IGV, y copia de resumen.',
    proBenefits: [
      'Catálogo propio y Directorio de clientes: Guarda productos, servicios y clientes para reutilizarlos en segundos.',
      'Cotización Formal en PDF Personalizada: Documento formal con el membrete, RUC y logo de tu negocio sin marcas de agua.',
      'Guardado, Edición y Duplicado en la Nube: Historial ordenado con correlativos automáticos por empresa.',
      'Exportación CSV compatible con Excel y mensaje preparado para abrir en WhatsApp.',
    ],
    howToUse: [
      'Selecciona un cliente de tu directorio o ingresa los datos directamente.',
      'Añade ítems desde tu catálogo o escribe conceptos manuales con precios y descuentos.',
      'Descarga tu proforma en PDF comercial, expórtala a CSV o abre WhatsApp con el resumen listo.',
    ],
    badgeBenefit: 'Catálogo + Clientes + PDF y Excel',
  },
  {
    id: 'gratificacion',
    slug: '/gratificacion',
    name: 'Calculadora de Gratificación (Julio y Diciembre)',
    category: 'laboral',
    categoryLabel: 'Laboral & Planilla',
    iconName: 'Gift',
    freeTier: 'Cálculo de 1 sueldo completo o medio sueldo más bonificación extraordinaria (9% EsSalud o 6.75% EPS).',
    proBenefits: [
      'Exportación de planilla de gratificaciones a Excel editable.',
      'Semáforo de infracciones laborales SUNAFIL por pago fuera del plazo legal (15 de julio / 15 de diciembre).',
      'Guardado en historial para comparar costos de planilla entre semestres.',
    ],
    howToUse: [
      'Ingresa remuneración mensual y régimen de salud del colaborador.',
      'Verifica el bono extraordinario bajo la Ley 30334.',
      'Guarda el cálculo en tu nube para la previsión de flujo de caja.',
    ],
    badgeBenefit: 'Bono EsSalud/EPS + Excel',
  },
  {
    id: 'calculadora-vacaciones',
    slug: '/calculadora-vacaciones',
    name: 'Calculadora de Vacaciones y Triple Vacacional',
    category: 'laboral',
    categoryLabel: 'Laboral & Planilla',
    iconName: 'Palmtree',
    freeTier: 'Cálculo de descanso físico de 30 días o 15 días (MYPE).',
    proBenefits: [
      'Cálculo de la Indemnización por Vacaciones No Gozadas ("Triple Vacacional" según D.L. 713 Art. 24).',
      'Hoja de cómputo vacacional lista para adjuntar al legajo del personal.',
      'Exportación a Excel (CSV) y respaldo en nube para control interno de tu negocio.',
    ],
    howToUse: [
      'Indica si las vacaciones fueron gozadas oportunamente o si se incurrió en falta de descanso.',
      'Comprueba el cómputo de la remuneración por el descanso adquirido más la indemnización.',
      'Exporta la hoja de liquidación vacacional a Excel.',
    ],
    badgeBenefit: 'Triple Vacacional (D.L. 713)',
  },
  {
    id: 'horas-extras',
    slug: '/horas-extras',
    name: 'Calculadora de Horas Extras (25% y 35%)',
    category: 'laboral',
    categoryLabel: 'Laboral & Planilla',
    iconName: 'Clock',
    freeTier: 'Valor hora ordinaria y recargos del 25% para las dos primeras horas y 35% para las restantes.',
    proBenefits: [
      'Cálculo de Horas Extras Nocturnas (recargo adicional 35% sobre RMV).',
      'Exportación detallada para cuadre de asistencia y nómina mensual.',
      'Guardado de reportes de sobretiempo para sustento tributario de deducibilidad de gastos.',
    ],
    howToUse: [
      'Coloca el sueldo base y la cantidad de horas extras diurnas o nocturnas.',
      'Revisa la descomposición de los recargos legales.',
      'Guarda en tu historial o expórtalo a Excel.',
    ],
    badgeBenefit: 'Horas Nocturnas + Excel',
  },
  {
    id: 'recibo-por-honorarios',
    slug: '/recibo-por-honorarios',
    name: 'Calculadora de 4ta Categoría (Recibos por Honorarios)',
    category: 'tributario',
    categoryLabel: 'Tributario & SUNAT',
    iconName: 'Receipt',
    freeTier: 'Retención del 8% de SUNAT para importes mayores a S/ 1,500.',
    proBenefits: [
      'Calculadora inversa: Determina el monto bruto que debes cobrar para recibir un monto neto exacto en tu cuenta bancaria.',
      'Verificador de Suspensión de Retenciones de 4ta Categoría (límite anual SUNAT).',
      'Exportación de recibos emitidos a Excel (CSV) para control contable en hojas de cálculo.',
    ],
    howToUse: [
      'Selecciona si deseas calcular desde el importe pactado o desde el dinero líquido en mano.',
      'Comprueba si corresponde retención del 8%.',
      'Guarda el recibo en tu nube para el control de tus ingresos como independiente.',
    ],
    badgeBenefit: 'Cálculo Inverso Bruto/Neto',
  },
  {
    id: 'calculadora-igv',
    slug: '/calculadora-igv',
    name: 'Calculadora de IGV (18% SUNAT)',
    category: 'tributario',
    categoryLabel: 'Tributario & SUNAT',
    iconName: 'Receipt',
    freeTier: 'Desglose de Base Imponible, IGV (16% + 2% IPM) y Total.',
    proBenefits: [
      'Separación de Crédito Fiscal vs Débito Fiscal para liquidación mensual en Declara Fácil 621.',
      'Exportación de lotes de facturas a Excel con fórmulas automáticas.',
      'Respaldo de operaciones comerciales con un solo clic.',
    ],
    howToUse: [
      'Ingresa el monto con o sin IGV.',
      'Observa el valor venta, IGV e importe total.',
      'Exporta la factura a Excel para entregarla a tu contador.',
    ],
    badgeBenefit: 'Crédito Fiscal + Excel',
  },
  {
    id: 'costeo-recetas',
    slug: '/costeo-recetas',
    name: 'Calculadora de Costeo de Recetas y Platos',
    category: 'negocios',
    categoryLabel: 'Negocios & Comercio',
    iconName: 'Utensils',
    freeTier: 'Cálculo de costo de ingredientes y merma referencial para restaurantes y pastelerías.',
    proBenefits: [
      'Ficha Técnica de Producción descargable en Excel con fórmulas vivas.',
      'Cálculo de Margen de Contribución y Factor de Ganancia sugerido.',
      'Guardado en la nube de tu menú o catálogo de productos para no perder tus fórmulas.',
    ],
    howToUse: [
      'Añade cada ingrediente, costo de compra y porcentaje de merma.',
      'Define tu margen objetivo de ganancia.',
      'Exporta la ficha técnica en Excel para tu cocina o taller.',
    ],
    badgeBenefit: 'Ficha Técnica en Excel',
  },
  {
    id: 'punto-de-equilibrio',
    slug: '/punto-de-equilibrio',
    name: 'Calculadora de Punto de Equilibrio y Metas',
    category: 'finanzas',
    categoryLabel: 'Finanzas & Metas',
    iconName: 'TrendingUp',
    freeTier: 'Unidades mínimas a vender para no ganar ni perder dinero en el mes.',
    proBenefits: [
      'Simulador de Utilidad Objetivo: Calcula cuántas ventas necesitas para alcanzar una meta de ganancias específica (ej. S/ 5,000 libres al mes).',
      'Exportación de informe financiero en Excel para socios o bancos.',
      'Guardado del punto de equilibrio mensual para evaluar estacionalidad del negocio.',
    ],
    howToUse: [
      'Ingresa costos fijos mensuales, precio unitario y costo variable por unidad.',
      'Añade tu ganancia deseada en el simulador de meta.',
      'Guarda tu proyección en la nube.',
    ],
    badgeBenefit: 'Simulador de Utilidad Objetivo',
  },
];

export default function BeneficiosProPage() {
  const { isPro, openActivationModal } = usePro();
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredGuides = CALCULATORS_GUIDE.filter((item) => {
    const matchesCategory = selectedCategory === 'todas' || item.category === selectedCategory;
    const q = searchFilter.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      item.name.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      item.proBenefits.some((b) => b.toLowerCase().includes(q)) ||
      item.badgeBenefit.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080E21] text-slate-900 dark:text-slate-100 transition-colors pb-24">
      
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-b from-[#0A1128] via-[#0E1B40] to-[#0A1128] text-white border-b border-slate-800 pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Glow background circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-5xl text-center relative z-10 space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>Catálogo y Guía Maestra de Beneficios PRO</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
            Descubre el Poder de cada Calculadora con <span className="bg-gradient-to-r from-[#00C853] to-teal-400 bg-clip-text text-transparent">CalculaPerú PRO</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Una guía completa para que <strong>nunca te pierdas</strong>: conoce qué funciones exclusivas desbloquea tu suscripción en cada herramienta laboral, tributaria y comercial, con enlaces directos para usarlas hoy mismo.
          </p>

          {/* Pricing & CTA pill */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200">
              Suscripción Unificada: <span className="text-emerald-400 font-bold">S/ 16.00 / mes</span> o <span className="text-amber-300 font-bold">S/ 149.00 / año</span>
            </div>

            {isPro ? (
              <div className="px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tienes membresía PRO activa. ¡Todos los beneficios están desbloqueados!</span>
              </div>
            ) : (
              <Link
                href="/pro"
                className="px-5 py-2.5 rounded-2xl bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40 hover:scale-[1.02] cursor-pointer"
              >
                <span>Obtener Acceso PRO Ilimitado</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <button
              type="button"
              onClick={openActivationModal}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer border border-slate-700"
            >
              ¿Ya compraste? Canjear Código
            </button>
          </div>

        </div>
      </div>

      {/* The 5 Pillars of Value Grid */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-600">
              <Bookmark className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-xs text-slate-900 dark:text-white">
              1. Cálculos en la Nube
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Guarda tus escenarios y consúltalos desde tu laptop o celular sin perder datos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-xs text-slate-900 dark:text-white">
              2. Excel Editable (.CSV)
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Descargas con UTF-8 BOM que abren perfecto en Excel sin romper tildes ni &quot;S/&quot;.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-xs text-slate-900 dark:text-white">
              3. Semáforo SUNAFIL 2026
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Matriz de multas y contingencias laborales basada en la UIT 2026 (S/ 5,350).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-950/80 flex items-center justify-center text-green-600">
              <MessageCircle className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-xs text-slate-900 dark:text-white">
              4. Envíos a WhatsApp
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Envía cotizaciones y resúmenes estructurados a tus clientes en 1 solo clic.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-purple-600">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-xs text-slate-900 dark:text-white">
              5. Membrete Corporativo
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Guarda el logo, RUC y Razón Social de tu empresa para tus boletas de pago referenciales.
            </p>
          </div>

        </div>
      </div>

      {/* Main Interactive Guide Container */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-12 space-y-8">
        
        {/* Filter bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          
          {/* Categories Tab Selector */}
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('todas')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedCategory === 'todas'
                  ? 'bg-[#00875A] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Todas ({CALCULATORS_GUIDE.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('laboral')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === 'laboral'
                  ? 'bg-[#00875A] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Laboral & Planillas</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('tributario')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === 'tributario'
                  ? 'bg-[#00875A] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Tributario & SUNAT</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('negocios')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === 'negocios'
                  ? 'bg-[#00875A] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Negocios</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar beneficio (ej. Excel, CTS)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

        </div>

        {/* List of Calculator Guide Cards */}
        <div className="space-y-6">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow space-y-5"
            >
              
              {/* Header: Title, Category Badge, Star Benefit */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold text-[10px] uppercase">
                      {guide.categoryLabel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-extrabold text-[10px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {guide.badgeBenefit}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {guide.name}
                  </h3>
                </div>

                <Link
                  href={guide.slug}
                  className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors shadow-xs"
                >
                  <span>Ir a la Calculadora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Grid: Free vs PRO Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Free tier card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Versión Gratuita (Pública)
                    </span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-semibold">
                      Básico
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {guide.freeTier}
                  </p>
                </div>

                {/* PRO Superpowers card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-300 dark:border-emerald-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Lo que desbloqueas con PRO (S/ 16 / mes)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-extrabold">
                      ACCESO TOTAL
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200">
                    {guide.proBenefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* How to use step-by-step */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-950/40 border border-blue-100 dark:border-blue-900/40 space-y-2">
                <span className="font-bold text-xs text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  <span>¿Cómo aprovechar este beneficio en esta herramienta?</span>
                </span>
                <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-700 dark:text-slate-300 pt-1">
                  {guide.howToUse.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {sIdx + 1}
                      </span>
                      <span className="text-[11px] leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

            </div>
          ))}
        </div>

        {/* Side by Side Comparative Table */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
              TABLA COMPARATIVA DIRECTA
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              ¿Por qué vale la pena pagar S/ 16.00 al mes?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compara de un vistazo lo que ofrece la versión pública gratuita vs. la membresía profesional:
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                <tr>
                  <th className="p-3.5 font-bold">Característica / Beneficio</th>
                  <th className="p-3.5 font-bold text-center w-36">Plan Gratuito</th>
                  <th className="p-3.5 font-bold text-center w-48 bg-emerald-100/70 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-x border-emerald-300 dark:border-emerald-800">
                    CalculaPerú PRO (S/ 16/mes)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3.5 font-medium">Cálculos matemáticos con fórmulas de la normativa vigente 2026</td>
                  <td className="p-3.5 text-center text-slate-600 dark:text-slate-400 font-semibold">Ilimitado</td>
                  <td className="p-3.5 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-x border-emerald-200 dark:border-emerald-900">
                    Ilimitado
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Semáforo y Matriz de Multas SUNAFIL 2026 (UIT S/ 5,350)</td>
                  <td className="p-3.5 text-center text-slate-400">Solo referencial</td>
                  <td className="p-3.5 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-x border-emerald-200 dark:border-emerald-900">
                    ✓ Completo por régimen y trabajadores
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Exportación a Excel / CSV Editable (UTF-8 BOM)</td>
                  <td className="p-3.5 text-center text-slate-400">✗ No disponible</td>
                  <td className="p-3.5 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-x border-emerald-200 dark:border-emerald-900">
                    ✓ Ilimitado en todas las herramientas
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Guardado de cálculos en la nube (Sincronización PC y Móvil)</td>
                  <td className="p-3.5 text-center text-slate-400">✗ Se borra al recargar</td>
                  <td className="p-3.5 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-x border-emerald-200 dark:border-emerald-900">
                    ✓ Historial en tu cuenta siempre disponible
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Boletas de pago formales en PDF (Formato D.S. 001-98-TR)</td>
                  <td className="p-3.5 text-center text-slate-400">✗ No disponible</td>
                  <td className="p-3.5 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-x border-emerald-200 dark:border-emerald-900">
                    ✓ Estructura legal lista para firmar
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Liquidaciones con indemnización por despido arbitrario</td>
                  <td className="p-3.5 text-center text-slate-400">✗ No disponible</td>
                  <td className="p-3.5 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-x border-emerald-200 dark:border-emerald-900">
                    ✓ PDF formal con cláusula de plazo legal
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Logotipo y RUC de la empresa guardados en perfil</td>
                  <td className="p-3.5 text-center text-slate-400">✗ No disponible</td>
                  <td className="p-3.5 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-x border-emerald-200 dark:border-emerald-900">
                    ✓ Carga automática en todos los documentos
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Envío rápido de proformas y resúmenes a WhatsApp</td>
                  <td className="p-3.5 text-center text-slate-400">Texto básico</td>
                  <td className="p-3.5 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-x border-emerald-200 dark:border-emerald-900">
                    ✓ 1 Clic con formato profesional
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Final CTA Card */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#0E1E38] to-[#0A1128] text-white p-8 sm:p-10 text-center space-y-5 border border-slate-800 shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>ACTIVACIÓN INMEDIATA POR YAPE O PLIN</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight max-w-2xl mx-auto">
            Ahorra tiempo contable y mantén en orden los cálculos laborales de tu negocio
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Paga solo <strong>S/ 16.00 al mes</strong> (o aprovecha el descuento anual de <strong>S/ 149.00</strong>) y accede a todas las funciones premium desde cualquier computadora o celular.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/pro"
              className="px-6 py-3 rounded-2xl bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 hover:scale-[1.02] cursor-pointer"
            >
              <span>Suscribirme a PRO Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={openActivationModal}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors cursor-pointer border border-white/20"
            >
              Canjear Código de Suscripción
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
