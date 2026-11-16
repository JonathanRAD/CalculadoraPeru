/**
 * Registro público de actualizaciones del sitio.
 * Solo se anotan cambios reales; cada entrada debe poder rastrearse en el repositorio
 * o en la fuente oficial citada. Al publicar un cambio relevante, agregar una entrada
 * al inicio y actualizar SITE_LAST_UPDATED.
 */

export interface SiteUpdateEntry {
  date: string; // ISO yyyy-mm-dd
  title: string;
  detail: string;
  source?: { label: string; url: string };
}

export const SITE_LAST_UPDATED = '2026-11-16';

export const SITE_UPDATES: SiteUpdateEntry[] = [
  {
    date: '2026-11-16',
    title: 'Guías con gráficos y mini calculadoras; tarifa eléctrica y vacaciones MYPE',
    detail:
      'Las diez guías incorporan gráficos calculados con las mismas fórmulas de las calculadoras y, en cada una, una mini calculadora para probar tus propios números. Cada guía tiene además su imagen para compartir. La tarifa eléctrica de referencia pasa a S/ 0.75 por kWh con IGV, según el pliego de Pluz Energía vigente desde el 4 de noviembre de 2026 (63.18 y 64.57 ctm S/kWh sin IGV). La calculadora de vacaciones distingue a los trabajadores contratados antes de la inscripción de la empresa en el REMYPE.',
    source: { label: 'Osinergmin: pliego tarifario de Pluz Energía', url: 'https://www.osinergmin.gob.pe/Tarifas/Electricidad/PliegoTarifario?Id=150000' },
  },
  {
    date: '2026-11-14',
    title: 'Fuentes oficiales con enlaces directos y reparto actualizado de IGV e IPM',
    detail:
      'Se revisaron todos los enlaces a fuentes oficiales: se reemplazaron los que daban error o llevaban solo a la portada de la entidad por la página exacta que respalda cada dato (SUNAT, MTPE, SUNAFIL, SBS, Osinergmin y Facilito). Además, SUNAT indica que en 2026 el 18 % del IGV se reparte en 15,5 % de IGV y 2,5 % de IPM (Ley 32387); los textos que decían 16 % y 2 % se corrigieron. El total que se cobra en el comprobante no cambia.',
    source: { label: 'SUNAT: concepto, tasa y operaciones gravadas del IGV', url: 'https://orientacion.sunat.gob.pe/3053-concepto-tasa-y-operaciones-gravadas-igv-empresas' },
  },
  {
    date: '2026-11-14',
    title: 'Comisiones de cobro, combustible, régimen MYPE y consentimiento de cookies',
    detail:
      'Las comisiones de Culqi, Mercado Pago e Izipay se actualizan con tarifas publicadas en octubre de 2026 (tasa, cargo fijo por venta y si suma IGV) y la opción de comisión personalizada ya permite ingresar tu tasa. Los precios iniciales de combustible reflejan los rangos de Facilito del 14 de noviembre. Las calculadoras de CTS, gratificación y liquidación distinguen a los trabajadores contratados antes de la inscripción en el REMYPE, que conservan el régimen general. El comparador de regímenes estima el impuesto a la renta anual si indicas tu utilidad. El aviso de cookies ofrece Aceptar y Rechazar y mantiene denegadas las señales de Google hasta que aceptes.',
    source: { label: 'SUNAT: régimen laboral MYPE', url: 'https://www.sunat.gob.pe/orientacion/mypes/regimenLaboral.html' },
  },
  {
    date: '2026-11-14',
    title: 'Auditoría de calculadoras, metadatos y privacidad',
    detail:
      'Se revisaron 24 funciones de cálculo con pruebas de casos límite (vacío, negativo, valores enormes), se corrigió el seguro de desgravamen en 0 % del préstamo, la recomendación del comparador de regímenes y los enlaces para compartir por WhatsApp. La política de privacidad ahora describe también las estadísticas propias y Vercel Analytics.',
  },
  {
    date: '2026-11-14',
    title: 'Guías de combustible, comisiones de cobro y consumo eléctrico',
    detail:
      'Se publican tres guías para las calculadoras más consultadas: gasto de combustible por kilómetro, comisiones de Yape y POS con IGV, y consumo eléctrico de electrodomésticos. Las calculadoras con datos variables (precio de combustible, comisiones y tarifa por kWh) muestran ahora un aviso de referencia con su fuente oficial y fecha de revisión.',
    source: { label: 'Osinergmin: Facilito', url: 'https://www.facilito.gob.pe/' },
  },
  {
    date: '2026-11-14',
    title: 'Quinta categoría: la bonificación extraordinaria entra en la proyección',
    detail:
      'La calculadora de sueldo neto incorpora en la proyección anual de renta de quinta categoría la bonificación extraordinaria de la Ley 30334 (9 % de las gratificaciones), que no es remunerativa pero sí está afecta a este impuesto. Los ejemplos de las guías se recalcularon con el mismo criterio.',
    source: { label: 'SUNAT: renta de quinta categoría', url: 'https://orientacion.sunat.gob.pe/node/301' },
  },
  {
    date: '2026-11-14',
    title: 'RMV S/ 1,230 y asignación familiar S/ 123',
    detail:
      'Se actualiza la remuneración mínima vital a S/ 1,230 (D.S. N.° 015-2026-TR, vigente desde el 1 de octubre de 2026) y, con ella, la asignación familiar a S/ 123 (10 % de la RMV). Un segundo tramo hasta S/ 1,300 está previsto para el primer semestre de 2027 y requiere un nuevo decreto. Se corrigen las calculadoras, los ejemplos y las pruebas.',
    source: { label: 'El Peruano: nueva RMV 2026', url: 'https://elperuano.pe/noticia/305879-desde-hoy-rige-la-nueva-rmv-sueldo-minimo-sube-a-s-1230-y-cambia-otros-conceptos-laborales' },
  },
  {
    date: '2026-11-14',
    title: 'Sección de guías y registro de actualizaciones',
    detail:
      'Se publica la sección de guías (sueldo, gratificación, CTS, horas extras, IGV, regímenes tributarios, precio de venta, combustible, comisiones de cobro y consumo eléctrico) y esta página de actualizaciones. Cada calculadora muestra la fecha de última actualización del sitio y enlaza su guía relacionada.',
  },
  {
    date: '2026-09-06',
    title: 'Parámetros AFP: comisión sobre flujo, julio de 2026',
    detail:
      'Las tasas de descuento AFP sobre flujo (aporte 10 %, seguro 1,37 % y comisión de cada administradora) se actualizan según la tabla de la SBS con mes de devengue julio de 2026.',
    source: { label: 'SBS: comisiones y primas de seguro de las AFP', url: 'https://www.sbs.gob.pe/app/spp/empleadores/comisiones_spp/paginas/comision_prima.aspx' },
  },
  {
    date: '2026-01-01',
    title: 'UIT 2026: S/ 5,500',
    detail:
      'La UIT vigente para 2026 se fija en S/ 5,500 (D.S. N.° 301-2025-EF). Los límites del Régimen MYPE Tributario y las multas expresadas en UIT se recalculan con este valor.',
    source: { label: 'SUNAT: valor de la UIT', url: 'https://www.sunat.gob.pe/indicestasas/uit.html' },
  },
  {
    date: '2025-01-01',
    title: 'Remuneración mínima vital: S/ 1,130 (hasta septiembre de 2026)',
    detail:
      'La RMV de S/ 1,130 rigió desde el 1 de enero de 2025 hasta el 30 de septiembre de 2026 y sustentó la asignación familiar de S/ 113. Fue reemplazada por la RMV de S/ 1,230.',
    source: { label: 'El Peruano: nueva RMV de S/ 1,230', url: 'https://elperuano.pe/noticia/305879-desde-hoy-rige-la-nueva-rmv-sueldo-minimo-sube-a-s-1230-y-cambia-otros-conceptos-laborales' },
  },
];
