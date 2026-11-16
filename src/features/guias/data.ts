/**
 * Guías editoriales de CalculaPerú.
 * Cada guía explica una decisión real del usuario, con ejemplo numérico reproducible,
 * fuentes oficiales y enlace a la calculadora correspondiente.
 * Antes de publicar cambios, verificar cifras contra la fuente oficial citada y
 * actualizar `updated` y SITE_UPDATES (src/core/constants/site-updates.ts).
 */

import { SOURCES } from '@/core/constants/official-sources';

export interface GuideTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: GuideTable;
}

export interface GuideSource {
  label: string;
  url: string;
}

export interface Guide {
  slug: string;
  title: string;
  /** Título corto para la etiqueta <title> y los resultados de búsqueda (≤ 55 caracteres). */
  metaTitle?: string;
  description: string;
  category: 'Laboral' | 'Tributario' | 'Negocios' | 'Cotidiano';
  published: string; // ISO
  updated: string; // ISO
  readingMinutes: number;
  calculator: { href: string; label: string };
  intro: string;
  sections: GuideSection[];
  faqs: { question: string; answer: string }[];
  sources: GuideSource[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'cuanto-me-descuentan-de-mi-sueldo',
    metaTitle: 'Cuánto te descuentan del sueldo en Perú',
    title: '¿Cuánto me descuentan de mi sueldo en Perú? ONP, AFP y renta de quinta categoría',
    description:
      'Entiende qué descuentos aparecen en tu boleta de pago: ONP 13 %, AFP según administradora y retención de quinta categoría, con un ejemplo numérico paso a paso.',
    category: 'Laboral',
    published: '2026-11-14',
    updated: '2026-11-14',
    readingMinutes: 6,
    calculator: { href: '/sueldo-neto', label: 'Calculadora de sueldo neto' },
    intro:
      'La diferencia entre el sueldo que firmas y el dinero que llega a tu cuenta sale de dos tipos de descuentos: el aporte a tu sistema de pensiones y, si ganas lo suficiente, la retención del impuesto a la renta de quinta categoría. Esta guía explica cada uno y muestra cómo se calcula con un caso concreto.',
    sections: [
      {
        heading: '1. El aporte a pensiones: ONP o AFP',
        paragraphs: [
          'Todo trabajador en planilla aporta a un sistema de pensiones. Puedes estar en el Sistema Nacional de Pensiones (ONP) o en una AFP; no se pagan ambos a la vez.',
          'En la ONP el descuento es del 13 % de tu remuneración. En una AFP el descuento se compone del aporte obligatorio al fondo (10 %), la prima de seguro de invalidez y sobrevivencia (1,37 %) y la comisión de la administradora. Cuando la comisión se cobra sobre el flujo (sobre tu remuneración), el descuento total que usa CalculaPerú, según la tabla de la SBS con mes de devengue julio de 2026, es:',
        ],
        table: {
          caption: 'Descuento mensual AFP con comisión sobre flujo (julio de 2026)',
          headers: ['Sistema', 'Descuento total sobre tu remuneración'],
          rows: [
            ['ONP', '13,00 %'],
            ['AFP Habitat', '12,84 %'],
            ['AFP Integra', '12,92 %'],
            ['AFP Prima', '12,97 %'],
            ['AFP Profuturo', '13,06 %'],
          ],
        },
      },
      {
        heading: '2. EsSalud no se descuenta de tu sueldo',
        paragraphs: [
          'El 9 % de EsSalud lo paga tu empleador por encima de tu remuneración. Si ves un descuento por ese concepto en tu boleta como trabajador dependiente, conviene preguntar a planilla por qué aparece.',
        ],
      },
      {
        heading: '3. Retención de quinta categoría',
        paragraphs: [
          'La quinta categoría es el impuesto a la renta del trabajo en planilla. Tu empleador proyecta tus ingresos del año, resta 7 UIT (con la UIT 2026 de S/ 5,500, son S/ 38,500) y aplica una escala progresiva sobre el resto. Si tu ingreso anual proyectado no supera esas 7 UIT, no te retienen nada.',
          'La escala acumulativa vigente es: 8 % hasta 5 UIT, 14 % de 5 a 20 UIT, 17 % de 20 a 35 UIT, 20 % de 35 a 45 UIT y 30 % sobre 45 UIT. Además, puedes deducir hasta 3 UIT adicionales por gastos con comprobante en rubros permitidos (restaurantes, alquiler, profesionales, entre otros).',
          'En la proyección anual cuentan 12 sueldos, las dos gratificaciones y la bonificación extraordinaria de ley. Por eso muchas personas que ganan menos de S/ 3,200 al mes sí terminan con una retención pequeña.',
        ],
      },
      {
        heading: '4. Ejemplo paso a paso: sueldo de S/ 3,000 en la ONP',
        paragraphs: [
          'Supuestos: trabajador del régimen general, sin asignación familiar, afiliado a la ONP, sin gastos deducibles adicionales, con sueldo fijo durante todo el año.',
          'La proyección del ejemplo considera 12 sueldos, 2 gratificaciones y la bonificación extraordinaria de la Ley 30334 (9 % de las gratificaciones), que no se descuenta por ONP o AFP pero sí está afecta a quinta categoría. En una planilla real pueden sumarse otros conceptos, como comisiones o bonos. Es el mismo criterio que usa la calculadora de sueldo neto de CalculaPerú, así que puedes reproducir el resultado.',
        ],
        table: {
          caption: 'Cálculo mensual aproximado',
          headers: ['Paso', 'Cálculo', 'Resultado'],
          rows: [
            ['Descuento ONP', '3,000 × 13 %', 'S/ 390.00'],
            ['Ingreso anual proyectado', '3,000 × 12 + 3,000 × 2 (gratificaciones) + 540 (bonificación extraordinaria 9 %)', 'S/ 42,540.00'],
            ['Renta neta anual', '42,540 − 38,500 (7 UIT)', 'S/ 4,040.00'],
            ['Impuesto anual', '4,040 × 8 %', 'S/ 323.20'],
            ['Retención mensual', '323.20 ÷ 12', 'S/ 26.93'],
            ['Sueldo neto aproximado', '3,000 − 390 − 26.93', 'S/ 2,583.07'],
          ],
        },
      },
      {
        heading: '5. Qué puede cambiar tu resultado',
        bullets: [
          'Tener asignación familiar (S/ 123 desde octubre de 2026) aumenta tu remuneración y, con ella, el aporte previsional y la proyección anual.',
          'Recibir horas extras, comisiones o bonos variables cambia la proyección mes a mes; la retención se recalcula.',
          'Cambiar de empleador a mitad de año exige informar los ingresos y retenciones anteriores para que no se retenga de menos.',
          'Los gastos deducibles con comprobante electrónico pueden reducir la base del impuesto hasta 3 UIT.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Puedo elegir entre ONP y AFP?',
        answer:
          'Sí, al ingresar a planilla puedes elegir tu sistema. Cambiar después tiene reglas y plazos propios; consulta a tu AFP o a la ONP antes de decidir.',
      },
      {
        question: '¿Por qué mi boleta no coincide exactamente con la calculadora?',
        answer:
          'Las calculadoras usan parámetros generales. Tu boleta puede incluir conceptos propios de tu contrato (bonos, descuentos judiciales, adelantos) o una comisión AFP distinta si estás en comisión mixta.',
      },
    ],
    sources: [SOURCES.quintaCalculo, SOURCES.sbsComisionesAfp, SOURCES.onp],
  },
  {
    slug: 'gratificacion-julio-diciembre-como-se-calcula',
    metaTitle: 'Gratificación de julio y diciembre: cómo se calcula',
    title: 'Gratificación de julio y diciembre: cómo se calcula y cuánto te corresponde',
    description:
      'Aprende a calcular tu gratificación legal, la bonificación extraordinaria del 9 % y qué pasa si no trabajaste el semestre completo, con ejemplos en soles.',
    category: 'Laboral',
    published: '2026-11-14',
    updated: '2026-11-14',
    readingMinutes: 5,
    calculator: { href: '/gratificacion', label: 'Calculadora de gratificación' },
    intro:
      'Los trabajadores del régimen laboral general reciben dos gratificaciones al año, en julio y diciembre. Cuánto te toca depende de tu remuneración y de cuántos meses completos trabajaste en el semestre. Aquí está la regla y dos ejemplos.',
    sections: [
      {
        heading: '1. La regla general',
        paragraphs: [
          'La Ley 27735 establece una gratificación equivalente a una remuneración mensual en julio (por Fiestas Patrias) y otra en diciembre (por Navidad). Se pagan hasta el 15 de julio y hasta el 15 de diciembre.',
          'Para recibirlas completas debes haber trabajado el semestre entero: de enero a junio para la de julio y de julio a diciembre para la de diciembre. Si trabajaste menos meses, se paga en proporción: un sexto por cada mes calendario completo.',
        ],
      },
      {
        heading: '2. Qué entra en la remuneración computable',
        bullets: [
          'Tu sueldo básico.',
          'La asignación familiar (S/ 123 desde octubre de 2026), si la percibes.',
          'El promedio de comisiones, horas extras u otros pagos variables, si los recibiste al menos tres meses del semestre.',
        ],
      },
      {
        heading: '3. La bonificación extraordinaria',
        paragraphs: [
          'Además de la gratificación, el empleador paga una bonificación extraordinaria del 9 % de la gratificación, que equivale al aporte de EsSalud que habría correspondido. Si estás afiliado a una EPS, el porcentaje es 6,75 %.',
          'Ni la gratificación ni la bonificación extraordinaria se descuentan por ONP o AFP, pero sí cuentan para la proyección de la retención de quinta categoría.',
        ],
      },
      {
        heading: '4. Ejemplo A: semestre completo',
        paragraphs: ['Sueldo S/ 2,400 más asignación familiar S/ 123 = remuneración computable de S/ 2,523. Trabajaste los seis meses.'],
        table: {
          caption: 'Gratificación de diciembre, semestre completo',
          headers: ['Concepto', 'Cálculo', 'Importe'],
          rows: [
            ['Gratificación', '2,523 × 6/6', 'S/ 2,523.00'],
            ['Bonificación extraordinaria', '2,523 × 9 %', 'S/ 227.07'],
            ['Total a recibir', '', 'S/ 2,750.07'],
          ],
        },
      },
      {
        heading: '5. Ejemplo B: ingresaste en septiembre',
        paragraphs: ['Misma remuneración, pero empezaste el 1 de septiembre: tienes 4 meses completos en el semestre (septiembre a diciembre).'],
        table: {
          caption: 'Gratificación de diciembre, 4 meses completos',
          headers: ['Concepto', 'Cálculo', 'Importe'],
          rows: [
            ['Gratificación proporcional', '2,523 ÷ 6 × 4', 'S/ 1,682.00'],
            ['Bonificación extraordinaria', '1,682 × 9 %', 'S/ 151.38'],
            ['Total a recibir', '', 'S/ 1,833.38'],
          ],
        },
      },
      {
        heading: '6. Casos especiales',
        bullets: [
          'En la pequeña empresa inscrita en el REMYPE, los trabajadores contratados después de la inscripción reciben media remuneración como gratificación.',
          'En la microempresa inscrita en el REMYPE, los trabajadores contratados después de la inscripción no tienen derecho a gratificaciones. Si la empresa no está inscrita, corresponde el régimen general.',
          'Los meses con licencia sin goce de haber o faltas injustificadas no se computan como meses completos.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Qué pasa si mi empleador no paga a tiempo?',
        answer:
          'Debe pagar la gratificación con los intereses legales correspondientes. Puedes presentar una denuncia ante SUNAFIL si no se regulariza.',
      },
      {
        question: '¿La gratificación paga impuesto a la renta?',
        answer:
          'Forma parte de tu renta de quinta categoría, por lo que se considera en la proyección anual de tu retención, aunque no tiene descuento por ONP o AFP.',
      },
    ],
    sources: [SOURCES.gratificacionesMtpe, SOURCES.calculadoraMtpe],
  },
  {
    slug: 'que-regimen-tributario-elegir-rus-rer-rmt',
    metaTitle: 'Régimen tributario: RUS, RER, RMT o General',
    title: '¿Qué régimen tributario elegir para tu negocio? RUS, RER, RMT o Régimen General',
    description:
      'Compara los cuatro regímenes de SUNAT para emprendedores y MYPES: límites de ingresos, pagos mensuales y comprobantes que puedes emitir, con un ejemplo en soles.',
    category: 'Tributario',
    published: '2026-11-14',
    updated: '2026-11-14',
    readingMinutes: 6,
    calculator: { href: '/regimenes-tributarios-sunat', label: 'Comparador de regímenes tributarios' },
    intro:
      'Al sacar tu RUC debes escoger un régimen. Esa elección determina cuánto pagas cada mes, qué comprobantes emites y hasta cuánto puedes vender. Esta guía resume las diferencias para que llegues a la decisión con criterio.',
    sections: [
      {
        heading: '1. Los cuatro regímenes de un vistazo',
        table: {
          caption: 'Comparación resumida de regímenes (verifica los límites vigentes en SUNAT)',
          headers: ['Régimen', 'Pago mensual', 'Límite de ingresos anuales', 'Comprobantes'],
          rows: [
            ['RUS', 'Cuota fija de S/ 20 o S/ 50 según categoría', 'Hasta S/ 96,000', 'Solo boletas y tickets'],
            ['RER', '1,5 % de los ingresos netos del mes', 'Hasta S/ 525,000', 'Facturas y boletas'],
            ['RMT', '1 % de ingresos hasta 300 UIT anuales; luego, 1,5 % o coeficiente', 'Hasta 1,700 UIT (S/ 9,350,000 con UIT 2026)', 'Facturas y boletas'],
            ['Régimen General', 'Coeficiente o 1,5 % de ingresos', 'Sin límite', 'Facturas y boletas'],
          ],
        },
      },
      {
        heading: '2. Cuándo conviene cada uno',
        bullets: [
          'RUS: venta directa al público de poco monto, como una bodega pequeña o un puesto, sin necesidad de dar factura. Es el más simple, pero no permite vender a empresas que exijan factura.',
          'RER: si necesitas emitir facturas pero tu negocio es chico y de compras y ventas sencillas. El pago es un porcentaje fijo de lo que vendes.',
          'RMT: es el punto medio para la mayoría de MYPES en crecimiento. Paga menos que el General en renta anual (10 % sobre las primeras 15 UIT de utilidad) y permite llevar registros simplificados.',
          'Régimen General: para negocios grandes o con operaciones complejas, o cuando ya superaste los límites de los otros regímenes.',
        ],
      },
      {
        heading: '3. Ejemplo: tienda con ventas de S/ 20,000 al mes',
        paragraphs: [
          'Ventas netas mensuales de S/ 20,000 (S/ 240,000 al año). Con ese volumen el RUS queda fuera, porque supera el límite anual. Comparamos el pago mensual de renta (sin IGV):',
        ],
        table: {
          caption: 'Pago mensual de renta con ventas de S/ 20,000',
          headers: ['Régimen', 'Cálculo', 'Pago mensual'],
          rows: [
            ['RUS', 'No aplica (supera S/ 96,000 al año)', 'No disponible'],
            ['RER', '20,000 × 1,5 %', 'S/ 300.00'],
            ['RMT', '20,000 × 1 % (hasta 300 UIT anuales)', 'S/ 200.00'],
            ['General', '20,000 × 1,5 % (si no tiene coeficiente propio)', 'S/ 300.00'],
          ],
        },
      },
      {
        heading: '4. No olvides la renta anual y el IGV',
        paragraphs: [
          'El pago mensual de RER y RMT son pagos a cuenta. En el RMT y el General se hace además una regularización anual sobre la utilidad real. El IGV (18 % en total; en 2026, 15,5 % de IGV y 2,5 % de IPM) se declara aparte salvo en el RUS, donde está incluido en la cuota.',
          'Cambiar de régimen tiene fechas permitidas, por lo general al inicio de actividades o en enero. Revisa el cronograma vigente en SUNAT antes de decidir.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Puedo estar en el RUS y vender a empresas?',
        answer:
          'Solo puedes emitir boletas y tickets, de modo que las empresas no podrán usar tus ventas como crédito fiscal. Si tus clientes piden factura, necesitas otro régimen.',
      },
      {
        question: '¿Qué pasa si supero el límite de mi régimen?',
        answer:
          'SUNAT te reubica de oficio a un régimen superior. Conviene monitorear tus ingresos acumulados durante el año.',
      },
    ],
    sources: [SOURCES.regimenesTributarios, SOURCES.nrusSunat, SOURCES.rerSunat, SOURCES.uitSunat],
  },
  {
    slug: 'cts-como-se-calcula-y-cuando-se-deposita',
    metaTitle: 'CTS en Perú: cómo se calcula y cuándo se deposita',
    title: 'CTS en Perú: cómo se calcula, cuándo se deposita y un ejemplo completo',
    description:
      'Entiende la base de cálculo de la CTS, el sexto de gratificación, los plazos de mayo y noviembre y qué hacer si tu empleador no deposita, con un ejemplo en soles.',
    category: 'Laboral',
    published: '2026-11-14',
    updated: '2026-11-14',
    readingMinutes: 5,
    calculator: { href: '/calculadora-cts', label: 'Calculadora de CTS' },
    intro:
      'La Compensación por Tiempo de Servicios (CTS) funciona como un seguro de desempleo: tu empleador la deposita en un banco o caja a tu nombre dos veces al año. Aquí verás qué sueldo se toma como base, cómo se prorratea por meses y qué plazos debe cumplir la empresa.',
    sections: [
      {
        heading: '1. Cuándo se deposita',
        paragraphs: [
          'El empleador debe depositar la CTS en dos fechas límite: hasta el 15 de mayo (por el semestre de noviembre a abril) y hasta el 15 de noviembre (por el semestre de mayo a octubre). El depósito se hace en la entidad financiera que tú elijas. Si el 15 cae en un día no hábil (por ejemplo, un domingo), el depósito puede hacerse el siguiente día hábil.',
        ],
      },
      {
        heading: '2. La remuneración computable',
        bullets: [
          'Tu remuneración básica vigente al 30 de abril o al 31 de octubre.',
          'La asignación familiar, si la percibes.',
          'Un sexto (1/6) de la última gratificación recibida (julio para el depósito de noviembre, diciembre para el de mayo).',
          'El promedio de pagos variables regulares (comisiones, horas extras) cuando corresponda.',
        ],
      },
      {
        heading: '3. La fórmula',
        paragraphs: [
          'La CTS semestral completa equivale a la mitad de la remuneración computable. Por cada mes completo del semestre se calcula un doceavo; si el semestre tiene días sueltos, se pagan a razón de un treintavo de ese doceavo por día.',
          'CTS = (remuneración computable ÷ 12) × meses completos + (remuneración computable ÷ 12 ÷ 30) × días sueltos.',
        ],
      },
      {
        heading: '4. Ejemplo: depósito de noviembre',
        paragraphs: ['Sueldo de S/ 2,400, asignación familiar de S/ 123, semestre completo y gratificación de julio de S/ 2,523.'],
        table: {
          caption: 'CTS de mayo a octubre, 6 meses completos',
          headers: ['Concepto', 'Cálculo', 'Importe'],
          rows: [
            ['Sueldo + asignación familiar', '2,400 + 123', 'S/ 2,523.00'],
            ['Sexto de gratificación', '2,523 ÷ 6', 'S/ 420.50'],
            ['Remuneración computable', '2,523 + 420.50', 'S/ 2,943.50'],
            ['CTS del semestre', '2,943.50 ÷ 12 × 6', 'S/ 1,471.75'],
          ],
        },
      },
      {
        heading: '5. Quién recibe menos CTS o no la recibe',
        bullets: [
          'En la microempresa (ingresos anuales menores a 150 UIT) inscrita en el REMYPE, los trabajadores contratados después de la inscripción no tienen derecho a CTS; quienes ya trabajaban antes conservan el régimen general.',
          'En la pequeña empresa (ingresos anuales de hasta 1,700 UIT) inscrita en el REMYPE, los trabajadores contratados después de la inscripción reciben el 50 % de la CTS del régimen general; los anteriores conservan la CTS completa. Si la empresa no está inscrita en el REMYPE, corresponde la CTS completa.',
          'Quienes trabajan menos de 4 horas diarias en promedio no la perciben.',
          'Los trabajadores independientes con recibo por honorarios no son trabajadores en planilla y no tienen CTS.',
        ],
      },
      {
        heading: '6. Si no te depositan a tiempo',
        paragraphs: [
          'El empleador debe depositar con intereses y puede ser sancionado por SUNAFIL. Guarda tu boleta y el estado de cuenta de tu CTS y presenta una consulta o denuncia ante SUNAFIL si el depósito no aparece.',
          'Los fondos están pensados para el desempleo y, por regla general, se retiran al cese. Existen retiros parciales y temporales que cambian por norma; consulta la regla vigente en tu entidad financiera.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Se descuenta algo a la CTS?',
        answer:
          'No se aplican descuentos de ONP o AFP al depósito. Los intereses y reglas de disponibilidad dependen de la entidad financiera elegida.',
      },
      {
        question: '¿Puedo cambiar el banco donde me depositan?',
        answer:
          'Sí, puedes comunicar a tu empleador la entidad elegida con la debida anticipación; el depósito siempre es a tu nombre.',
      },
    ],
    sources: [SOURCES.ctsTuo, SOURCES.calculadoraMtpe, SOURCES.regimenLaboralMype],
  },
  {
    slug: 'horas-extras-como-se-pagan',
    metaTitle: 'Horas extras en Perú: pago, 25 % y 35 %',
    title: 'Horas extras en Perú: cómo se pagan, sobretasas del 25 % y 35 % y ejemplo',
    description:
      'Calcula el valor de tus horas extras con las sobretasas de 25 % y 35 %, y aprende qué pasa con domingos y feriados trabajados, con un ejemplo en soles.',
    category: 'Laboral',
    published: '2026-11-14',
    updated: '2026-11-14',
    readingMinutes: 4,
    calculator: { href: '/horas-extras', label: 'Calculadora de horas extras' },
    intro:
      'Trabajar más allá de tu jornada debe pagarse con una sobretasa. Esta guía explica cómo se obtiene el valor de la hora, cuánto se suma por cada tramo y qué casos tienen reglas distintas.',
    sections: [
      {
        heading: '1. Cuándo hay horas extras',
        paragraphs: [
          'La jornada máxima legal es de 8 horas diarias o 48 semanales. El tiempo trabajado por encima de la jornada pactada es sobretiempo. El trabajo en sobretiempo es voluntario: nadie puede obligarte a hacerlo, salvo situaciones de fuerza mayor.',
        ],
      },
      {
        heading: '2. Las sobretasas',
        table: {
          caption: 'Sobretasa por tramo de sobretiempo',
          headers: ['Tramo', 'Sobretasa sobre el valor de la hora'],
          rows: [
            ['Primeras 2 horas extra del día', '25 %'],
            ['Desde la tercera hora', '35 %'],
          ],
        },
      },
      {
        heading: '3. Cómo se calcula',
        paragraphs: [
          'Valor de la hora ordinaria = remuneración mensual ÷ 30 ÷ horas de jornada diaria. Luego se aplica la sobretasa según el tramo.',
        ],
      },
      {
        heading: '4. Ejemplo: sueldo de S/ 2,400, jornada de 8 horas',
        paragraphs: ['Un trabajador hizo 3 horas extras en un mismo día.'],
        table: {
          caption: 'Pago de 3 horas extras en un día',
          headers: ['Concepto', 'Cálculo', 'Importe'],
          rows: [
            ['Valor de la hora ordinaria', '2,400 ÷ 30 ÷ 8', 'S/ 10.00'],
            ['Primeras 2 horas', '10.00 × 1.25 × 2', 'S/ 25.00'],
            ['Tercera hora', '10.00 × 1.35 × 1', 'S/ 13.50'],
            ['Total del día', '', 'S/ 38.50'],
          ],
        },
      },
      {
        heading: '5. Domingos y feriados',
        bullets: [
          'Si trabajas tu día de descanso semanal o un feriado sin que te den un descanso sustitutorio, corresponde pagar una sobretasa del 100 % sobre la remuneración de ese día, además de la remuneración ordinaria. En la práctica es el llamado pago triple: el pago del feriado, el pago por el día trabajado y la sobretasa.',
          'Si te dan un día sustituto de descanso, no hay sobretasa: el día se compensa descansando.',
        ],
      },
      {
        heading: '6. Aspectos a revisar en tu boleta',
        bullets: [
          'Que las horas extras figuren como concepto separado.',
          'Que se paguen con la sobretasa que corresponde al tramo.',
          'Que cuenten en la base de gratificaciones y CTS cuando sean regulares.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Puedo cambiar horas extras por tiempo libre?',
        answer:
          'Sí, si lo acuerdas con tu empleador. Las horas compensadas con descanso no se pagan en dinero.',
      },
      {
        question: '¿Los trabajadores de dirección tienen horas extras?',
        answer:
          'Los trabajadores de dirección y los no sujetos a fiscalización inmediata no están sujetos a jornada máxima ni a pago de sobretiempo.',
      },
    ],
    sources: [SOURCES.horasExtrasTuo, SOURCES.sunafilConsultas],
  },
  {
    slug: 'igv-18-como-calcularlo-y-desglosarlo',
    metaTitle: 'IGV 18 %: cómo calcularlo y desglosarlo',
    title: 'IGV 18 % en Perú: cómo calcularlo, desglosarlo y entender el crédito fiscal',
    description:
      'Aprende a sumar el IGV a un precio, a separarlo de un total con IGV incluido y a calcular el IGV por pagar con crédito fiscal, con ejemplos.',
    category: 'Tributario',
    published: '2026-11-14',
    updated: '2026-11-14',
    readingMinutes: 4,
    calculator: { href: '/calculadora-igv', label: 'Calculadora de IGV' },
    intro:
      'El IGV es el impuesto que se suma a la mayoría de ventas de bienes y servicios. La tasa total es 18 %: en 2026 se compone de 15,5 % de IGV y 2,5 % del Impuesto de Promoción Municipal (IPM). Por la Ley 32387 el IPM sube de forma gradual (3 % en 2027 y 3,5 % en 2028) y el IGV baja en la misma medida, de modo que el total sigue siendo 18 %. Aquí está cómo trabajarlo en las tres situaciones más comunes.',
    sections: [
      {
        heading: '1. Sumar el IGV a un precio sin impuesto',
        paragraphs: ['Precio con IGV = base × 1,18. El IGV es base × 0,18.'],
        table: {
          caption: 'Ejemplo: producto de S/ 100 más IGV',
          headers: ['Concepto', 'Cálculo', 'Importe'],
          rows: [
            ['Base imponible', '', 'S/ 100.00'],
            ['IGV 18 %', '100 × 0.18', 'S/ 18.00'],
            ['Total con IGV', '100 + 18', 'S/ 118.00'],
          ],
        },
      },
      {
        heading: '2. Separar el IGV de un total que ya lo incluye',
        paragraphs: [
          'Base = total ÷ 1,18. IGV = total − base. Es un error común restar el 18 % del total: eso da un resultado menor al correcto.',
        ],
        table: {
          caption: 'Ejemplo: total de S/ 118 con IGV incluido',
          headers: ['Concepto', 'Cálculo', 'Importe'],
          rows: [
            ['Base imponible', '118 ÷ 1.18', 'S/ 100.00'],
            ['IGV incluido', '118 − 100', 'S/ 18.00'],
          ],
        },
      },
      {
        heading: '3. El IGV por pagar: crédito fiscal',
        paragraphs: [
          'Cada mes pagas a SUNAT la diferencia entre el IGV de tus ventas (débito fiscal) y el IGV de tus compras con factura (crédito fiscal), siempre que cumplan los requisitos formales.',
        ],
        table: {
          caption: 'Ejemplo mensual',
          headers: ['Concepto', 'Base', 'IGV'],
          rows: [
            ['Ventas del mes', 'S/ 10,000', 'S/ 1,800'],
            ['Compras con factura', 'S/ 5,000', 'S/ 900'],
            ['IGV por pagar', '', 'S/ 900'],
          ],
        },
      },
      {
        heading: '4. Errores frecuentes',
        bullets: [
          'Calcular el IGV con un descuento aplicado después de impuestos.',
          'Pedir crédito fiscal con comprobantes que no están a nombre de tu RUC o no cumplen requisitos.',
          'Olvidar que en el Nuevo RUS el impuesto está incluido en la cuota mensual y no se declara aparte.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Todas las ventas pagan IGV?',
        answer:
          'No. Hay operaciones exoneradas e inafectas por ley. Revisa la norma o consulta a un contador si tu actividad podría estar en ese caso.',
      },
      {
        question: '¿Por qué antes se hablaba de 16 % de IGV y ahora de 15,5 %?',
        answer:
          'Antes el 18 % se repartía en 16 % de IGV y 2 % de IPM. Con la Ley 32387, SUNAT indica que en 2026 el reparto es 15,5 % de IGV y 2,5 % de IPM (IPM de 3 % e IGV de 15 % en 2027; IPM de 3,5 % e IGV de 14,5 % en 2028, según su tabla). Lo que pagas en el comprobante sigue siendo 18 %.',
      },
    ],
    sources: [SOURCES.igvTasa],
  },
  {
    slug: 'margen-vs-recargo-como-fijar-precio-de-venta',
    metaTitle: 'Margen vs. recargo: cómo fijar tu precio de venta',
    title: 'Margen vs. recargo (mark-up): cómo fijar el precio de venta de tu producto',
    description:
      'Diferencia margen y recargo, calcula el precio de venta a partir de tu costo y aprende a incluir IGV y comisiones de cobro, con ejemplos en soles.',
    category: 'Negocios',
    published: '2026-11-14',
    updated: '2026-11-14',
    readingMinutes: 5,
    calculator: { href: '/precio-de-venta', label: 'Calculadora de precio de venta' },
    intro:
      'Muchos negocios fijan precios sumando un porcentaje al costo y luego descubren que ganan menos de lo esperado. La razón suele ser confundir margen con recargo. Esta guía muestra la diferencia y cómo calcular el precio correcto.',
    sections: [
      {
        heading: '1. Dos formas de medir lo mismo',
        bullets: [
          'Recargo (mark-up) = utilidad ÷ costo.',
          'Margen = utilidad ÷ precio de venta.',
        ],
        table: {
          caption: 'Ejemplo: costo S/ 80, precio S/ 100',
          headers: ['Medida', 'Cálculo', 'Resultado'],
          rows: [
            ['Utilidad', '100 − 80', 'S/ 20.00'],
            ['Recargo sobre el costo', '20 ÷ 80', '25 %'],
            ['Margen sobre la venta', '20 ÷ 100', '20 %'],
          ],
        },
      },
      {
        heading: '2. Precio a partir de un margen deseado',
        paragraphs: [
          'Precio = costo ÷ (1 − margen). Si quieres ganar 30 % del precio y tu costo es S/ 60, el precio es 60 ÷ 0,70 = S/ 85,71. Sumar 30 % al costo (S/ 78) te daría un margen real de solo 23 %.',
        ],
      },
      {
        heading: '3. Agregar IGV y comisión de cobro',
        paragraphs: [
          'Si tu precio de lista debe incluir IGV, multiplica el precio sin impuesto por 1,18. Si cobras con POS o billetera digital, la comisión se descuenta de lo que recibes, así que conviene incluirla en el cálculo.',
        ],
        table: {
          caption: 'Ejemplo: costo S/ 60, margen 30 %',
          headers: ['Concepto', 'Cálculo', 'Importe'],
          rows: [
            ['Precio sin IGV', '60 ÷ (1 − 0.30)', 'S/ 85.71'],
            ['Precio con IGV', '85.71 × 1.18', 'S/ 101.14'],
          ],
        },
      },
      {
        heading: '4. Checklist antes de fijar un precio',
        bullets: [
          'Incluye en el costo todos los gastos directos del producto: compra, transporte, empaque.',
          'Reparte tus costos fijos (alquiler, servicios) entre las unidades que realmente vendes.',
          'Revisa el punto de equilibrio: cuántas unidades necesitas vender para no perder.',
          'Compara con tu competencia, pero no bajes el precio sin comprobar que sigues ganando.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Qué margen es "bueno"?',
        answer:
          'Depende del rubro, el volumen y tus costos fijos. Lo importante es que cubra costos, impuestos y te deje utilidad real después de comisiones.',
      },
      {
        question: '¿El margen puede superar 100 %?',
        answer:
          'No. El margen sobre la venta nunca supera 100 %, pero el recargo sobre el costo sí puede hacerlo.',
      },
    ],
    sources: [SOURCES.igvTasa],
  },
  {
    slug: 'cuanto-gasta-tu-auto-en-combustible-por-km',
    metaTitle: 'Cuánto gasta tu auto en combustible por km',
    title: 'Cuánto gasta tu auto en combustible por kilómetro y cómo repartir el gasto de un viaje',
    description:
      'Calcula el costo por kilómetro de tu vehículo, estima el gasto de un viaje de ida y vuelta y reparte el combustible entre pasajeros, con ejemplos en soles.',
    category: 'Cotidiano',
    published: '2026-11-14',
    updated: '2026-11-14',
    readingMinutes: 5,
    calculator: { href: '/gasto-combustible', label: 'Calculadora de gasto de combustible' },
    intro:
      'Saber cuánto cuesta cada kilómetro te sirve para decidir si conviene un viaje, cobrar un flete o dividir gastos con amigos. Solo necesitas tres datos: el rendimiento de tu vehículo, el precio del combustible y la distancia.',
    sections: [
      {
        heading: '1. La fórmula básica',
        paragraphs: [
          'Galones necesarios = distancia ÷ rendimiento (km por galón). Costo del viaje = galones × precio por galón. Costo por kilómetro = precio por galón ÷ rendimiento.',
          'En vehículos a GNV el combustible se mide en metros cúbicos (m³), y en GLP se mide en galones. La fórmula es la misma: solo cambia la unidad del precio y del rendimiento.',
        ],
      },
      {
        heading: '2. Ejemplo: viaje de 300 km de ida y vuelta',
        paragraphs: [
          'Los precios cambian casi a diario y varían por grifo; usamos S/ 18.00 por galón solo como valor de ejemplo. Para tu cálculo real consulta el precio de tu grifo en Facilito, la plataforma de Osinergmin.',
        ],
        table: {
          caption: 'Viaje de 300 km de ida (600 km en total) con rendimiento de 40 km por galón',
          headers: ['Concepto', 'Cálculo', 'Resultado'],
          rows: [
            ['Distancia total', '300 × 2', '600 km'],
            ['Galones necesarios', '600 ÷ 40', '15 galones'],
            ['Costo total de combustible', '15 × 18.00', 'S/ 270.00'],
            ['Costo por kilómetro', '18.00 ÷ 40', 'S/ 0.45'],
            ['Entre 4 personas', '270 ÷ 4', 'S/ 67.50 por persona'],
          ],
        },
      },
      {
        heading: '3. Cuánto cambia el costo según el rendimiento',
        paragraphs: ['Con el mismo viaje de 600 km y el mismo precio de ejemplo, el rendimiento real de tu vehículo pesa mucho en el resultado.'],
        table: {
          caption: 'Costo de 600 km a S/ 18.00 por galón',
          headers: ['Rendimiento', 'Galones', 'Costo total'],
          rows: [
            ['30 km/gal', '20', 'S/ 360.00'],
            ['40 km/gal', '15', 'S/ 270.00'],
            ['50 km/gal', '12', 'S/ 216.00'],
          ],
        },
      },
      {
        heading: '4. Cómo conocer tu rendimiento real',
        bullets: [
          'Llena el tanque, pon el cuentakilómetros parcial en cero y maneja con normalidad.',
          'En el siguiente llenado anota los galones que entran y los kilómetros recorridos.',
          'Divide kilómetros entre galones. Repite un par de veces y promedia: la ciudad, la carretera y el tráfico dan valores distintos.',
        ],
      },
      {
        heading: '5. Lo que el combustible no incluye',
        bullets: [
          'Peajes y estacionamiento.',
          'Mantenimiento, llantas, aceite y seguro.',
          'La depreciación del vehículo.',
        ],
        paragraphs: [
          'Si usas tu auto para trabajar o cobrar fletes, suma estos costos al combustible para fijar una tarifa que realmente te deje ganancia.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Dónde veo el precio actual del combustible?',
        answer:
          'En Facilito, la plataforma de Osinergmin, donde los grifos reportan sus precios. Úsalo para ingresar el valor real en la calculadora.',
      },
      {
        question: '¿Por qué mi consumo real es mayor al que indica el fabricante?',
        answer:
          'Las cifras de fábrica se miden en condiciones ideales. El tráfico, el aire acondicionado, la carga y el estilo de manejo aumentan el consumo.',
      },
    ],
    sources: [SOURCES.facilito, SOURCES.preciosCombustiblesGob],
  },
  {
    slug: 'comisiones-yape-pos-como-calcular-lo-que-recibes',
    metaTitle: 'Comisiones de Yape y POS: cuánto te descuentan',
    title: 'Comisiones de Yape y POS: cuánto te descuentan y cómo fijar tu precio',
    description:
      'Entiende cómo se calcula la comisión más IGV de Yape, Niubiz, Izipay y otros medios de cobro, cuánto recibes de cada venta y cuánto cobrar para recibir un monto exacto.',
    category: 'Negocios',
    published: '2026-11-14',
    updated: '2026-11-14',
    readingMinutes: 5,
    calculator: { href: '/comisiones-pos-yape', label: 'Calculadora de comisiones POS y Yape' },
    intro:
      'Cuando cobras con tarjeta o con Yape para negocios, no recibes el monto completo: el operador descuenta una comisión y, sobre esa comisión, el IGV. Esta guía explica cómo calcularlo y cómo ajustar tus precios para no perder margen.',
    sections: [
      {
        heading: '1. La comisión se cobra con IGV',
        paragraphs: [
          'Las tasas que publican los operadores suelen expresarse sin IGV. Sobre la comisión se suma el 18 % de IGV, de modo que la tasa efectiva es la tasa publicada × 1,18.',
          'Yape para negocios publica una comisión de 2,95 % + IGV por las ventas cobradas. Un comparativo de tarifas publicadas en octubre de 2026 (CONIT) muestra además que algunos operadores suman un cargo fijo por venta: por ejemplo, 3,44 % + S/ 0,69 más IGV en Izipay, 3,44 % + US$ 0,20 en Culqi o 3,49 % + S/ 1,00 en Mercado Pago, mientras que Niubiz no publica una tasa fija online. En ventas pequeñas el cargo fijo pesa más que el porcentaje. En todos los casos, toma la tasa y el cargo de tu contrato o tarifario.',
        ],
        table: {
          caption: 'Tasa efectiva con IGV (ejemplos)',
          headers: ['Tasa publicada', 'Cálculo', 'Tasa efectiva'],
          rows: [
            ['2,95 %', '2,95 × 1,18', '3,48 %'],
            ['3,45 %', '3,45 × 1,18', '4,07 %'],
            ['3,99 %', '3,99 × 1,18', '4,71 %'],
          ],
        },
      },
      {
        heading: '2. Cuánto recibes de una venta de S/ 100',
        table: {
          caption: 'Venta de S/ 100 con Yape para negocios (2,95 % + IGV)',
          headers: ['Concepto', 'Cálculo', 'Importe'],
          rows: [
            ['Comisión sin IGV', '100 × 2,95 %', 'S/ 2.95'],
            ['IGV sobre la comisión', '2.95 × 18 %', 'S/ 0.53'],
            ['Comisión total', '', 'S/ 3.48'],
            ['Monto que recibes', '100 − 3.48', 'S/ 96.52'],
          ],
        },
      },
      {
        heading: '3. Cuánto cobrar para recibir un monto exacto',
        paragraphs: [
          'Si quieres que te lleguen S/ 100 limpios, no basta con sumar la tasa: debes dividir entre (1 − tasa efectiva). Con una tasa publicada de 3,45 % + IGV (4,07 % efectiva):',
        ],
        table: {
          caption: 'Cobrar para recibir S/ 100',
          headers: ['Concepto', 'Cálculo', 'Importe'],
          rows: [
            ['Monto a cobrar al cliente', '100 ÷ (1 − 0.04071)', 'S/ 104.24'],
            ['Comisión total descontada', '104.24 − 100', 'S/ 4.24'],
          ],
        },
      },
      {
        heading: '4. Qué hacer con estos números',
        bullets: [
          'Incluye la comisión en el cálculo de tu precio de venta, igual que cualquier otro costo.',
          'Si ofreces precios iguales con efectivo y tarjeta, tu margen real con tarjeta es menor; evalúa si conviene un precio distinto.',
          'Revisa tu estado de cuenta: confirma que la tasa descontada coincide con la de tu contrato.',
          'Si estás en un régimen que declara IGV (RER, RMT o General) y recibes comprobante por la comisión, el IGV de la comisión puede ser crédito fiscal. En el RUS no aplica. Consulta a tu contador.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Por qué la comisión de mi POS es distinta a la de otro negocio?',
        answer:
          'Las tasas se negocian según el rubro, el volumen de ventas y el tipo de tarjeta. Pide siempre el tarifario escrito.',
      },
      {
        question: '¿Yape cobra comisión a todos los negocios?',
        answer:
          'La comisión aplica a los negocios que usan Yape para empresas bajo las condiciones publicadas por Yape. Revisa los términos vigentes en su sitio.',
      },
    ],
    sources: [SOURCES.yapeNegocios, SOURCES.conitPasarelas, SOURCES.igvTasa],
  },
  {
    slug: 'consumo-electrico-electrodomesticos-cuanto-cuesta',
    metaTitle: 'Consumo eléctrico por electrodoméstico y su costo',
    title: 'Cuánto consume cada electrodoméstico y cómo calcular su costo en tu recibo de luz',
    description:
      'Aprende a calcular los kWh de un electrodoméstico, estimar su costo mensual y entender los cargos de tu recibo de luz, con una tabla de ejemplos.',
    category: 'Cotidiano',
    published: '2026-11-14',
    updated: '2026-11-14',
    readingMinutes: 5,
    calculator: { href: '/consumo-electrico', label: 'Calculadora de consumo eléctrico' },
    intro:
      'Tu recibo de luz crece según los kilovatios-hora (kWh) que consumes. Con la potencia de cada aparato y las horas de uso puedes estimar cuáles pesan más y cuánto ahorrarías usándolos con criterio.',
    sections: [
      {
        heading: '1. La fórmula',
        paragraphs: [
          'kWh por día = potencia en watts × horas de uso ÷ 1,000. kWh al mes = kWh por día × días de uso. Costo mensual = kWh al mes × precio por kWh.',
          'La potencia aparece en la etiqueta del aparato. El precio por kWh lo encuentras en tu recibo y depende de tu distribuidora y tu opción tarifaria.',
        ],
      },
      {
        heading: '2. Ejemplo con precio referencial de S/ 0.75 por kWh',
        paragraphs: [
          'Usamos S/ 0.75 por kWh, que es aproximadamente el cargo de energía activa residencial con IGV del pliego de Pluz Energía vigente desde el 4 de noviembre de 2026 (63.18 a 64.57 ctm S/kWh sin IGV). No incluye cargos fijos ni alumbrado público, y cada distribuidora tiene su propio pliego: reemplázalo por el precio de tu recibo. Los consumos son estimaciones con horas de uso típicas durante 30 días.',
          'Los aparatos con resistencia, como termas, planchas y hervidores, y los de climatización concentran la mayor parte del gasto. La refrigeradora no trabaja a su potencia máxima todo el tiempo, así que su consumo real depende de su eficiencia y de cuántas veces abres la puerta.',
        ],
        table: {
          caption: 'Consumo y costo mensual estimado (30 días)',
          headers: ['Aparato', 'Potencia', 'Uso diario', 'kWh al mes', 'Costo con S/ 0.75'],
          rows: [
            ['Refrigeradora', '250 W', '8 h', '60', 'S/ 45.00'],
            ['Aire acondicionado', '1,200 W', '6 h', '216', 'S/ 162.00'],
            ['Terma eléctrica', '1,500 W', '2 h', '90', 'S/ 67.50'],
            ['Lavadora', '500 W', '1,5 h', '22.5', 'S/ 16.88'],
            ['Microondas', '1,000 W', '0,5 h', '15', 'S/ 11.25'],
            ['Laptop', '65 W', '8 h', '15.6', 'S/ 11.70'],
            ['Foco LED', '10 W', '6 h', '1.8', 'S/ 1.35'],
          ],
        },
      },
      {
        heading: '3. Qué más trae tu recibo',
        bullets: [
          'El consumo de energía en kWh multiplicado por el precio de la tarifa.',
          'Cargos fijos mensuales, como mantenimiento y reposición de la conexión.',
          'Alumbrado público.',
          'IGV sobre el total.',
        ],
        paragraphs: [
          'Por eso la suma de tus aparatos suele quedar por debajo del total del recibo. Compara tu estimación con el consumo en kWh que aparece en la factura.',
        ],
      },
      {
        heading: '4. Cómo reducir el consumo',
        bullets: [
          'Reduce las horas de uso de los aparatos de mayor potencia, como el aire acondicionado y la terma.',
          'Cambia focos antiguos por LED.',
          'Desconecta cargadores y equipos en espera que no uses.',
          'Mantén limpio y sin escarcha el congelador de la refrigeradora.',
        ],
      },
    ],
    faqs: [
      {
        question: '¿Cuánto cuesta el kWh en mi distrito?',
        answer:
          'Depende de tu distribuidora y tu opción tarifaria. El valor exacto figura en tu recibo; Osinergmin publica los pliegos tarifarios.',
      },
      {
        question: '¿Por qué mi estimación no coincide con mi recibo?',
        answer:
          'Porque el recibo incluye cargos fijos, alumbrado público e IGV, y porque las horas de uso reales suelen diferir de las estimadas.',
      },
    ],
    sources: [SOURCES.pliegoPluz, SOURCES.pliegoLuzDelSur, SOURCES.visorPliegos],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
