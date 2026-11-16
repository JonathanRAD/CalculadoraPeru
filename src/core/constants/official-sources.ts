/**
 * Fuentes oficiales citadas en el sitio.
 *
 * Cada enlace apunta a la página concreta que respalda el dato, no a la portada de la entidad.
 * Última comprobación manual de que abren: 14 de noviembre de 2026.
 *
 * `blocksBots: true` marca páginas que abren en un navegador pero rechazan solicitudes automáticas
 * (el script `npm run check:links` las omite).
 *
 * Al agregar o cambiar una fuente: abrirla en un navegador, confirmar que contiene el dato citado
 * y ejecutar `npm run check:links`.
 */

export interface OfficialSource {
  label: string;
  url: string;
  blocksBots?: boolean;
  /** La raíz del sitio es la propia herramienta de consulta (p. ej. Facilito), no una portada institucional. */
  rootIsTool?: boolean;
}

export const SOURCES = {
  // SUNAT
  igvTasa: {
    label: 'SUNAT: concepto, tasa y operaciones gravadas del IGV',
    url: 'https://orientacion.sunat.gob.pe/3053-concepto-tasa-y-operaciones-gravadas-igv-empresas',
  },
  quintaCalculo: {
    label: 'SUNAT: cálculo del impuesto de quinta categoría',
    url: 'https://orientacion.sunat.gob.pe/node/301',
  },
  cuartaCalculo: {
    label: 'SUNAT: cálculo del pago a cuenta de cuarta categoría',
    url: 'https://orientacion.sunat.gob.pe/3064-02-calculo-del-impuesto-por-rentas-de-cuarta-categoria',
  },
  regimenesTributarios: {
    label: 'SUNAT Emprender: regímenes tributarios (NRUS, RER, RMT y General)',
    url: 'https://emprender.sunat.gob.pe/ruc/regimenes-tributarios-mype/regimenes-tributarios',
    blocksBots: true,
  },
  rerSunat: {
    label: 'SUNAT Emprender: Régimen Especial de Renta (RER)',
    url: 'https://emprender.sunat.gob.pe/ruc/regimenes-tributarios-mype/regimen-especial-renta-rer',
    blocksBots: true,
  },
  nrusSunat: {
    label: 'SUNAT: categorías del Nuevo RUS',
    url: 'https://orientacion.sunat.gob.pe/node/94',
  },
  regimenLaboralMype: {
    label: 'SUNAT: régimen laboral especial de la micro y pequeña empresa',
    url: 'https://www.sunat.gob.pe/orientacion/mypes/regimenLaboral.html',
  },
  uitSunat: {
    label: 'SUNAT: valor de la UIT (2026: S/ 5,500, D.S. 301-2025-EF)',
    url: 'https://www.sunat.gob.pe/indicestasas/uit.html',
  },
  sunatSol: {
    label: 'SUNAT Operaciones en Línea (SOL)',
    url: 'https://www.sunat.gob.pe/sol.html',
  },

  // MTPE y SUNAFIL
  gratificacionesMtpe: {
    label: 'MTPE: guía de gratificaciones (Ley 27735) en el régimen laboral privado',
    url: 'https://cdn.www.gob.pe/uploads/document/file/3321103/guia_gratificaciones.pdf',
  },
  calculadoraMtpe: {
    label: 'MTPE: calculadora oficial de beneficios sociales',
    url: 'https://portal.trabajo.gob.pe/calculadoraMTPE/',
  },
  ctsTuo: {
    label: 'MTPE: TUO de la Ley de CTS (D.S. 001-97-TR), texto oficial',
    url: 'https://www.gob.pe/institucion/mtpe/informes-publicaciones/221736',
  },
  horasExtrasTuo: {
    label: 'D.S. 007-2002-TR: TUO de la Ley de Jornada de Trabajo, Horario y Trabajo en Sobretiempo (texto de la norma)',
    url: 'https://lpderecho.pe/tuo-ley-jornada-trabajo-horario-trabajo-sobretiempo-decreto-supremo-007-2002-tr/',
    blocksBots: true, // No se encontró el texto oficial en gob.pe; este sitio reproduce la norma.
  },
  sunafilDenuncia: {
    label: 'SUNAFIL: denunciar incumplimientos laborales de una empresa privada',
    url: 'https://www.gob.pe/9972-denunciar-incumplimientos-laborales-de-una-empresa-privada',
  },
  sunafilConsultas: {
    label: 'SUNAFIL: realizar consultas laborales',
    url: 'https://www.gob.pe/10017-realizar-consultas-laborales-a-la-sunafil',
  },
  rmvElPeruano: {
    label: 'El Peruano: nueva RMV de S/ 1,230 (D.S. 015-2026-TR)',
    url: 'https://elperuano.pe/noticia/305879-desde-hoy-rige-la-nueva-rmv-sueldo-minimo-sube-a-s-1230-y-cambia-otros-conceptos-laborales',
  },

  // Pensiones
  sbsComisionesAfp: {
    label: 'SBS: comisiones y primas de seguro de las AFP',
    url: 'https://www.sbs.gob.pe/app/spp/empleadores/comisiones_spp/paginas/comision_prima.aspx',
    blocksBots: true, // La SBS protege su sitio con un captcha anti-robots.
  },
  onp: {
    label: 'ONP: Sistema Nacional de Pensiones',
    url: 'https://www.gob.pe/onp',
  },

  // Energía
  facilito: {
    label: 'Facilito (Osinergmin): precios de combustibles por grifo',
    url: 'https://www.facilito.gob.pe/',
    rootIsTool: true,
  },
  preciosCombustiblesGob: {
    label: 'gob.pe: cómo consultar los precios de combustibles',
    url: 'https://www.gob.pe/553-consultar-los-precios-de-combustibles',
  },
  pliegoPluz: {
    label: 'Osinergmin: pliego tarifario de Pluz Energía (ex Enel Distribución)',
    url: 'https://www.osinergmin.gob.pe/Tarifas/Electricidad/PliegoTarifario?Id=150000',
  },
  pliegoLuzDelSur: {
    label: 'Luz del Sur: pliego tarifario vigente (PDF)',
    url: 'https://cdn.luzdelsur.com.pe/weblds/nuestraempresa/lds_tarifas.pdf',
  },
  visorPliegos: {
    label: 'Osinergmin: visor de pliegos tarifarios',
    url: 'https://www.osinergmin.gob.pe/seccion/institucional/Paginas/VisorPliegosTarifarios.aspx?Codigo=PTS',
  },

  // Medios de cobro
  yapeNegocios: {
    label: 'El Peruano: Yape Empresa cobra 2.95 % sobre las ventas del día (aclaración de Yape)',
    url: 'https://elperuano.pe/noticia/240612-yape-aclara-que-aplicacion-seguira-siendo-gratis-para-usuarios',
  },
  conitPasarelas: {
    label: 'CONIT: comparativo de tarifas de Izipay, Culqi, Niubiz y Mercado Pago (octubre de 2026)',
    url: 'https://conit.pe/blog/izipay-vs-culqi-vs-niubiz-vs-mercado-pago',
  },
} as const satisfies Record<string, OfficialSource>;

export type SourceKey = keyof typeof SOURCES;

/** Enlaces que no deben volver a aparecer: dan error 404 o apuntan a portadas genéricas. */
export const RETIRED_URLS: string[] = [
  'https://www.sbs.gob.pe/afiliados/informacion-del-sistema-de-pensiones/comisiones-y-primas-de-seguro', // La SBS responde 200 pero muestra «Página no encontrada».
  'https://www.sbs.gob.pe/app/pp/sistip_portal/paginas/titulo.aspx', // Página vacía.
  'https://www.sunat.gob.pe/orientacion/igv/index.html',
  'https://www.sunat.gob.pe/orientacion/rentasTrabajo/quintaCategoria.html',
  'https://www.sunat.gob.pe/orientacion/regimenes/index.html',
  'https://orientacion.sunat.gob.pe/quinta-categoria',
  'https://orientacion.sunat.gob.pe/impuesto-general-a-las-ventas',
  'https://orientacion.sunat.gob.pe/cuarta-categoria',
  'https://facilito.osinergmin.gob.pe',
  'https://www.gob.pe/mtpe',
  'https://www.gob.pe/sunafil',
  'https://www.gob.pe/osinergmin',
];
