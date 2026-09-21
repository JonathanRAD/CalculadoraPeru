# CalculaPerú: estrategia SEO y ejecución para Antigravity

Preparado el 21 de septiembre de 2026 para https://www.calculaperu.com.pe/.

## 1. Propósito y alcance

Conseguir que las personas que buscan cálculos laborales, tributarios, comerciales y financieros para Perú encuentren una herramienta útil, fiable y fácil de usar. Coordinar investigación de búsquedas, contenido, arquitectura, SEO técnico, rendimiento, autoridad y medición.

Este es un plan integral de trabajo, no una auditoría técnica ya ejecutada ni una garantía de posicionamiento. No se dispone de acceso al repositorio, Search Console, analítica o herramientas de volúmenes. Las prioridades y consultas propuestas son hipótesis de trabajo; hay que contrastarlas con datos. No inventar tráfico, dificultad, posiciones ni resultados de pruebas.

Leer junto con:

- `CalculaPeru_AdSense_Antigravity.md`: calidad y recuperación de AdSense.
- `CalculaPeru_Rediseno_Antigravity.md`: dirección de diseño y experiencia.

Actualización respecto al primer manual: el titular aportó una captura con propiedad verificada y rechazo por «Contenido de poco valor». Esta categoría no identifica por sí sola páginas responsables. Aprobación de AdSense, indexación y posicionamiento son resultados diferentes.

Ante conflictos, conservar exactitud, accesibilidad y utilidad. El rediseño no debe borrar explicaciones valiosas y el SEO no debe llenar la interfaz de palabras repetidas.

## 2. Orden de trabajo

1. Guardar una línea base del sitio y de sus datos disponibles.
2. Identificar problemas de acceso, indexación y exactitud.
3. Investigar intención de búsqueda y asignar consultas a páginas.
4. Mejorar herramientas y contenido prioritario.
5. Implementar el rediseño conservando URLs y señales relevantes.
6. Comprobar la versión publicada cuando se autorice desplegar.
7. Medir por periodos comparables y ajustar con evidencia.

No cambiar de framework, dominio, URLs y estrategia editorial simultáneamente sin una justificación y un plan de reversión.

## 3. Línea base y datos necesarios

Solicitar, si están disponibles, exportaciones de Search Console de los últimos tres meses y un periodo comparable anterior, filtrables por país Perú y dispositivo. Revisar hasta 16 meses de historial cuando la cuenta los tenga para detectar estacionalidad. Si el sitio es nuevo, usar todo el historial disponible sin tratar pocos días como tendencia consolidada.

Registrar consultas, páginas, clics, impresiones, CTR y posición media; separar búsquedas de marca y no marca. Revisar también indexación, sitemaps, acciones manuales, seguridad y experiencia de página. La verificación de AdSense no prueba que estos informes hayan sido revisados.

Si no hay acceso, continuar con auditoría pública y del código y marcar las métricas como pendientes. No pedir contraseñas ni afirmar que se analizó Search Console sin evidencia.

Crear estos entregables dentro del proyecto:

| Archivo propuesto | Contenido |
|---|---|
| `docs/seo/inventario.csv` | URL, tipo, estado HTTP, canonical, robots, title, H1, indexabilidad prevista, enlaces entrantes internos y hallazgos |
| `docs/seo/mapa-consultas.csv` | Consulta/grupo, intención, país, fuente, fecha, métricas disponibles, URL objetivo y necesidad pendiente |
| `docs/seo/backlog.md` | Problema, evidencia, prioridad, cambio, prueba de cierre y responsable |
| `docs/seo/redirecciones.csv` | URL anterior, destino, motivo, código y comprobación; solo si hay cambios de URL |
| `docs/seo/medicion.md` | Línea base, eventos, periodos y limitaciones |
| `docs/seo/registro-cambios.md` | Fecha, páginas modificadas, publicación y evolución observada |

Estos nombres son propuestas de organización, no archivos ya creados por este documento.

## 4. Investigación de consultas e intención

### Método

Partir de las consultas reales de Search Console. Ampliar con variantes utilizadas en Perú y dudas de usuarios. Si hay acceso a Keyword Planner u otra herramienta, registrar país, fecha, rangos y procedencia; sus estimaciones no son tráfico garantizado. Google Trends puede ayudar a comparar interés relativo, no a obtener volúmenes absolutos.

Para cada grupo prioritario, examinar resultados actuales de búsqueda y anotar si predominan calculadoras, guías, organismos oficiales o contenido comercial. Evaluar qué resuelven y qué falta: supuestos, desglose, ejemplos, tasas fechadas, manejo de excepciones. No copiar sus textos ni afirmar que se puede superarlos sin analizar esa consulta.

No pedir una página por cada variación gramatical. «Calcular sueldo neto» y «calculadora de sueldo neto Perú» pueden compartir intención. Distinguir competencia entre páginas propias de una cobertura complementaria legítima usando consultas, contenido y rendimiento.

### Mapa inicial de oportunidades

Las rutas indicadas se observaron en la investigación de esta conversación. Confirmar su estado actual. La prioridad es editorial y de producto, no una estimación de volumen.

| Grupo candidato | Intención | Destino inicial | Diferenciación a trabajar |
|---|---|---|---|
| calculadora sueldo neto Perú; sueldo bruto a neto | Obtener estimación | `/sueldo-neto` | Desglose, régimen, comisión y supuestos coherentes |
| calcular CTS Perú; CTS semestre incompleto | Calcular y entender | `/cts` pendiente de confirmar ruta en inventario | Periodos parciales y conceptos computables documentados |
| calculadora gratificación Perú | Obtener estimación | `/gratificacion` | Supuestos, periodo y componentes identificados |
| calcular horas extras Perú | Obtener estimación | `/horas-extras` | Diferenciar casos y explicar entradas |
| vacaciones truncas Perú calculadora | Calcular beneficio | `/calculadora-vacaciones` | Alcance y periodos explicitados |
| liquidación laboral Perú calculadora | Estimar varios conceptos | Resolver URL desde el inventario | Desglose sin duplicar las guías de cada beneficio |
| calcular IGV; sacar IGV de un total | Operación directa | Resolver URL de IGV existente | Añadir frente a desglosar, con ejemplo verificable |
| margen de ganancia versus recargo | Entender y calcular | Resolver herramienta y valorar guía distinta | Mostrar la diferencia con el mismo caso |
| precio de venta; punto de equilibrio | Decisión comercial | Resolver las dos URLs existentes | Costos, unidades, supuestos y límites |
| recibo por honorarios calculadora | Estimar importe/retención | Resolver URL existente | Fecha, condiciones y referencia oficial |
| dólar a soles; tipo de cambio | Conversión | `/tipo-de-cambio-dolar-sunat` | Aclarar proveedor, fecha y tipo de tasa; revisar coherencia de la URL sin renombrarla automáticamente |

No publicar una ruta propuesta hasta comprobar que no existe otra que cumple esa función. No afirmar «tasa oficial SUNAT» si el dato mostrado proviene de otro proveedor o representa otra cotización.

## 5. Arquitectura y enlaces internos

Organizar portada, categorías útiles, calculadoras y guías. Las categorías deben facilitar elegir una herramienta, no ser páginas vacías con un párrafo repetido. Mantener el acceso a las herramientas cotidianas aunque se simplifiquen las categorías del rediseño.

Conservar slugs existentes cuando sean funcionales. No añadir carpetas solo para que la URL parezca más SEO. Mantener URLs estables sin año por defecto; actualizar fecha y parámetros en la página. Crear archivos históricos únicamente cuando sean útiles, estén diferenciados y expliquen su vigencia.

Vincular cada calculadora desde su categoría y desde guías que realmente la complementen. Enlazar herramientas relacionadas por la tarea: sueldo con horas extras, gratificación con liquidación. Usar textos descriptivos y enlaces HTML navegables; no depender solo del buscador interno o de eventos JavaScript.

Una guía sobre cómo interpretar una boleta puede enlazar a sueldo neto sin repetir toda su explicación. Si dos páginas resuelven exactamente lo mismo, decidir si diferenciarlas o consolidarlas tras revisar tráfico y enlaces. No borrarlas por una supuesta «canibalización» detectada únicamente por coincidencia de palabras.

Evitar rutas masivas por distrito cuando la fórmula no cambia. No crear versiones idénticas para Lima, Arequipa y Cusco solo cambiando el nombre del lugar.

## 6. Optimización de cada página

Cada herramienta debe presentar la tarea, entradas, resultado, método, ejemplo comprobado, fuentes y límites. Adaptar la profundidad al problema; no imponer una cantidad de palabras o densidad de palabras clave.

| Elemento | Criterio |
|---|---|
| Title | Único, descriptivo y compatible con la herramienta real; evitar promesas absolutas |
| Metadescripción | Resumen específico de qué permite hacer; no repetir una descripción global |
| H1 | Nombre claro de la tarea; adoptar un encabezado principal por coherencia editorial, no como supuesto factor mágico |
| Subtítulos | Organizar método, ejemplo y excepciones según el contenido |
| Texto inicial | Explicar alcance sin retrasar innecesariamente el acceso al cálculo |
| Fuentes | Enlaces a documentos concretos, fecha y reglas que sustentan |
| Fecha de revisión | Cambiarla solo cuando hubo una revisión sustantiva real |
| Imágenes | Usar imágenes que expliquen; alternativas textuales según función, sin insertar palabras clave artificiales |
| Compartir | Open Graph y presentación social coherentes, sin atribuirles un aumento directo de ranking |

Ejemplo editorial para revisar antes de publicar:

- Title: `Calculadora de sueldo neto en Perú | CalculaPerú`.
- H1: `Calculadora de sueldo neto en Perú`.
- Descripción: `Estima tu sueldo neto con los ingresos y descuentos de tu planilla. Consulta el desglose, los supuestos y las fuentes del cálculo.`

No son metadatos ya implementados. Google puede generar un título o fragmento distinto. No tratar un límite orientativo de caracteres como una regla obligatoria ni garantía de visualización. Fuentes: [títulos](https://developers.google.com/search/docs/appearance/title-link?hl=es) y [fragmentos](https://developers.google.com/search/docs/appearance/snippet?hl=es).

## 7. Contenido original y confianza

Corregir primero incoherencias entre calculadora, ejemplo y PDF. El hallazgo anterior de asignación familiar y tasas debe reproducirse y resolverse con fuentes actuales, no reemplazando una cifra aislada. No presentar datos sintéticos como casos reales.

Asignar un responsable editorial real. Si hay revisión profesional, describir quién revisó qué; no inventar contadores, certificaciones, testimonios o avales. E-E-A-T sirve como marco de evaluación de confianza, no como puntuación oficial que un plugin pueda certificar.

Crear guías solo cuando resuelvan necesidades que no quedan bien atendidas en la herramienta. Propuesta inicial, pendiente de investigación de demanda:

| Prioridad propuesta | Pieza | Valor propio y enlace |
|---|---|---|
| Alta | Cómo leer ingresos y descuentos de una boleta | Caso ficticio identificado y desglose; enlazar a sueldo |
| Alta | Añadir IGV y desglosarlo: diferencias | Dos operaciones sobre el mismo caso; enlazar a IGV |
| Alta | Margen y recargo no son el mismo porcentaje | Ejemplo aritmético comparado; enlazar a herramienta de margen |
| Media | Qué datos preparar para estimar una liquidación | Checklist con alcance normativo verificado; enlazar a liquidación |
| Media | Por qué una calculadora puede diferir de tu boleta | Supuestos concretos y conceptos no cubiertos |
| Media | Cómo cambia el equilibrio de un negocio al variar costos | Escenarios sintéticos y sensibilidad; enlazar a punto de equilibrio |

Antes de crear una guía, comprobar si conviene ampliar una página existente. La frecuencia depende de la capacidad de verificar y mantener, no de una cuota de publicaciones. La IA puede ayudar a preparar borradores, pero cada fórmula, norma y ejemplo debe revisarse. Referencia: [contenido útil y fiable](https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=es).

## 8. SEO técnico

### HTTP y dominio

Probar HTTP/HTTPS, raíz/www, rutas profundas y recargas. Registrar redirecciones y destino final. Mantener una variante principal coherente; no inferir configuración actual a partir del historial. Revisar errores 5xx, bucles y páginas inexistentes servidas como válidas. No devolver la portada con estado 200 para cualquier URL desconocida.

### Rastreo e indexación

Inspeccionar robots.txt, meta robots y X-Robots-Tag por separado. No utilizar robots.txt como garantía de desindexación. Permitir el rastreo necesario para que se procese noindex donde corresponda. No confundir un estado excluido esperado con un error que haya que corregir.

Revisar con Inspección de URLs muestras de cada plantilla, la canonical declarada y la elegida por Google. Buscar fallos concretos detrás de estados como descubierta o rastreada sin indexar; no reenviar solicitudes masivamente como solución.

### Canonical y parámetros

Definir canonical coherente por página indexable y hacia equivalentes reales cuando haya duplicados. No canonicalizar todas las calculadoras a la portada ni usar canonical como redirección. Evitar contradicciones entre sitemap, enlaces y canonical. Fuente: [canonicalización](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls?hl=es).

Inventariar búsquedas internas, filtros y URLs con valores de cálculo. No crear páginas indexables para cada importe. Decidir por tipo si corresponde canonical, noindex o no generar una URL pública. No bloquear indiscriminadamente todos los parámetros. Evitar que salarios u otros valores privados aparezcan en URLs, registros o analítica: canonical no es protección de privacidad.

### Sitemap

Incluir URLs canónicas, indexables y útiles; excluir redirecciones, errores y resultados personales. Usar lastmod solo con fechas reales de cambios significativos. Enviar y revisar su procesamiento; un sitemap facilita descubrimiento pero no garantiza indexación. Fuente: [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=es).

### JavaScript

Comparar respuesta HTML y DOM renderizado por ruta. Comprobar títulos, texto explicativo, enlaces, canonical y recursos accesibles. No depender de que el usuario introduzca datos para que exista contenido comprensible. Priorizar prerenderizado o renderizado en servidor cuando resuelva un problema real; Google puede procesar JavaScript y no exige migrar de framework. Fuente: [SEO JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=es).

### Idioma y geografía

Utilizar español claro y contexto peruano. Configurar el idioma del documento acorde al contenido, por ejemplo es-PE. No crear hreflang si no hay versiones regionales o lingüísticas alternativas reales. No inventar una sede física o ficha de negocio local para una herramienta exclusivamente digital.

## 9. Datos estructurados

Validar el marcado existente antes de añadir más. Distinguir que un tipo exista en Schema.org de que Google admita un resultado enriquecido para él.

- Evaluar WebSite y una identidad real de Organization o Person según el responsable efectivo.
- Usar BreadcrumbList si refleja rutas de navegación reales.
- Usar Article en guías editoriales genuinas, con autores y fechas verídicos.
- Considerar SoftwareApplication/WebApplication solo tras comprobar adecuación y requisitos actuales; no inventar ratings, reviews u ofertas para completar campos.
- No recomendar FAQPage, HowTo o estrellas como receta de visibilidad. Comprobar soporte vigente en la galería antes de dedicar esfuerzo. Las preguntas útiles pueden existir sin marcado especial.

Durante esta investigación, la antigua URL de documentación FAQ redirigió a la página de novedades. Por ello no se asume elegibilidad ni soporte actual a partir de guías antiguas.

Comprobar coherencia con el contenido visible, sintaxis y, cuando aplique, Prueba de resultados enriquecidos. Aprobar una prueba no garantiza que Google muestre el resultado. Fuente: [galería de Google](https://developers.google.com/search/docs/appearance/structured-data/search-gallery?hl=es).

## 10. Rendimiento y experiencia

Medir portada, una calculadora sencilla, sueldo y una página dependiente de API. Comparar móvil y escritorio, caché fría/caliente cuando sea relevante y la misma configuración antes/después.

Objetivos de buena experiencia: LCP alrededor de 2,5 s o menos, INP 200 ms o menos y CLS 0,1 o menos. Evaluar datos de campo al percentil 75 cuando existan. Si no hay suficiente muestra, declararlo y utilizar laboratorio como diagnóstico, no como prueba de que todos los usuarios pasan las métricas. No confundir TBT de Lighthouse con INP de campo.

Priorizar carga de fuentes, imágenes innecesarias, JavaScript, respuesta de APIs y espacio reservado para anuncios. No optimizar una puntuación a costa de claridad o funcionamiento. Fuente: [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals?hl=es).

## 11. Protección durante el rediseño

Antes: guardar inventario de URLs, páginas con clics/enlaces, títulos, canonical, contenido y configuración. Identificar una versión recuperable del proyecto.

Durante: conservar URLs siempre que sea posible y preparar el mapa de las que realmente cambien. Aplicar redirecciones permanentes a equivalentes relevantes; nunca enviar todas las retiradas a la portada. Mantener el contenido que responde a la intención, además del formulario. Proteger los entornos de prueba; no confiar en robots.txt para ocultar información privada.

Después de publicación autorizada: comprobar estados, redirecciones, indexabilidad, sitemap, enlaces y pruebas funcionales en producción. Vigilar que no se herede un noindex de staging. Si hay cambio de URL, mantener las redirecciones a largo plazo y al menos el periodo recomendado por Google; la guía consultada indica generalmente un año como mínimo. No utilizar Cambio de dirección por un simple cambio visual dentro del mismo dominio.

Registrar fecha y alcance, observar errores e indexación y comparar con la línea base. Puede haber fluctuaciones; no atribuir inmediatamente cualquier subida o caída al diseño. Fuente: [migraciones](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes?hl=es).

## 12. Autoridad y difusión

Preparar materiales que merezcan ser citados: explicación verificable de fórmulas, ejemplos originales y recursos útiles para docentes, trabajadores y pequeños negocios. Identificar comunidades y entidades pertinentes para difusión posterior, sin enviar mensajes sin autorización.

No comprar paquetes de enlaces, fabricar reseñas o publicar contenido masivo por ciudades. No garantizar enlaces desde entidades oficiales por citarlas. Documentar procedencia de enlaces y diferenciar menciones editoriales de publicidad; aplicar atributos pertinentes a vínculos pagados o de usuarios según las guías vigentes.

Una métrica de autoridad de una herramienta comercial no es una puntuación oficial de Google. Fuente: [políticas de spam](https://developers.google.com/search/docs/essentials/spam-policies?hl=es).

## 13. Medición y decisiones

| Métrica | Pregunta que responde | Precaución |
|---|---|---|
| Clics orgánicos no marca por grupo | ¿Llegan personas que buscan resolver esa tarea? | Comparar periodo y estacionalidad |
| Impresiones por consulta/página | ¿Aumenta la visibilidad pertinente? | Más impresiones no implica mejor conversión |
| CTR | ¿El resultado consigue clics dentro de su contexto? | Cambia con posición, consulta y aspecto de la búsqueda |
| Posición media | ¿Cómo evoluciona la presencia por consulta? | No tratar el promedio global como ranking único |
| Indexación de páginas objetivo | ¿Las rutas útiles pueden aparecer? | No todas las URLs del sitio deben indexarse |
| Uso de calculadoras | ¿Se completa la tarea tras llegar? | Definir evento real; no contar cada pulsación como éxito |
| Errores y rendimiento | ¿Existen fricciones medibles? | Separar datos de campo y laboratorio |

Si se implementa analítica, proponer eventos como apertura de herramienta, cálculo válido tras interacción y descarga elegida por el usuario. Registrar solo identificador de herramienta y estado técnico necesario; no ingresos, montos, correos, texto libre ni enlaces con valores personales. Evitar contabilizar como interacción del visitante el ejemplo precargado. Ajustar consentimiento y política a la implementación efectiva.

Revisar semanalmente errores y mensualmente tendencias, como cadencia propuesta. Comparar ventanas de 28 días y, cuando exista historial, periodos estacionales equivalentes. Registrar cambios para no confundir una mejora editorial con demanda de gratificaciones o CTS. No fijar objetivos porcentuales hasta conocer la línea base.

Fuente de interpretación: [Rendimiento de Search Console](https://support.google.com/webmasters/answer/7576553?hl=es). Las consultas visibles pueden estar limitadas por privacidad y los datos recientes pueden ser incompletos; no exigir que todas las sumas coincidan con una exportación parcial.

## 14. Hoja de ruta propuesta

| Etapa | Trabajo | Evidencia de cierre |
|---|---|---|
| Semana 1 orientativa | Inventario, línea base, fallos críticos y mapa inicial | Informe con comprobado/pendiente y datos sin inventar |
| Semanas 2–3 | Corregir herramientas prioritarias, metadatos y enlaces | Casos de prueba, fuentes y páginas revisadas |
| Semanas 3–4 | Integrar rediseño y controles de publicación | Capturas, URLs conservadas y verificación técnica |
| Segundo mes | Publicar guías justificadas y corregir oportunidades medidas | Brief por pieza y comparaciones de rendimiento |
| Tercer mes y siguientes | Ampliar lo que funciona y mantener tasas/contenido | Registro de decisiones y evolución por grupo |

Es una secuencia de organización, no una promesa de plazos de ranking. Ajustar a capacidad editorial y riesgos. La implementación técnica puede completarse antes de que Google refleje resultados.

## 15. Herramientas y enlaces directos

No hace falta instalar un paquete SEO desconocido. Primero usar datos y documentación oficiales:

- Search Console: https://search.google.com/search-console/
- PageSpeed Insights: https://pagespeed.web.dev/
- Prueba de resultados enriquecidos: https://search.google.com/test/rich-results
- Guía SEO: https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=es
- Funciones de IA en Search: https://developers.google.com/search/docs/appearance/ai-features?hl=es
- Vercel Agent Skills, para revisión complementaria de interfaz: https://github.com/vercel-labs/agent-skills
- Guías públicas de interfaz: https://vercel.com/design/guidelines

La documentación de funciones de IA no exige un schema especial o un archivo especial para aparecer en ellas. No vender llms.txt ni una supuesta puntuación GEO como requisito de Google. Priorizar contenido accesible y útil y medir lo que realmente permitan las herramientas.

Si una fuente falla, intentar la navegación de su sitio oficial y registrar el límite. No inventar requisitos basados en memoria ni bloquear todo el trabajo por un enlace inaccesible. Las recomendaciones del plan son propias salvo donde se identifica expresamente una política o guía.

## 16. Prompt de ejecución para Antigravity

> Lee los tres documentos de CalculaPerú: AdSense, rediseño y SEO. Mi captura confirma rechazo por contenido de poco valor y propiedad verificada. Este documento SEO es una estrategia por ejecutar, no prueba de que el sitio ya cumple.
>
> Inspecciona el proyecto y registra URLs, tecnología, metadatos, renderizado e indexabilidad. Pide exportaciones de Search Console si hacen falta, pero continúa con tareas independientes. No inventes volúmenes, rankings ni métricas. Valida el mapa de consultas y asigna cada intención a una página existente antes de crear rutas nuevas.
>
> Implementa correcciones comprobables en cambios revisables, empezando por acceso y exactitud y siguiendo con contenido, metadatos y enlaces. Coordina el rediseño conservando URLs y explicaciones útiles. Revisa schema conforme al soporte actual y mide rendimiento sin confundir laboratorio con campo. Prepara los entregables de docs/seo, evidencias antes/después y pendientes reales. No te limites a una checklist genérica.
>
> No publiques cambios, envíes mensajes de difusión ni solicites revisión AdSense solo por este encargo. Deja preparada una propuesta revisable y las comprobaciones posteriores al despliegue. No prometas primera posición, plazos de tráfico ni aprobación. Define un plan medible de seguimiento que el titular pueda continuar.

## 17. Criterios de entrega

- Cada cambio responde a un hallazgo o necesidad concreta.
- Consultas y prioridades indican si proceden de datos o hipótesis.
- No se pierden rutas ni contenido valioso durante el rediseño.
- Metadatos, canonical, sitemap y enlaces son coherentes en las páginas verificadas.
- Las calculadoras y ejemplos mantienen exactitud y fuentes.
- El marcado refleja contenido real y las funciones publicadas existen.
- El informe distingue hecho comprobado, limitación y tarea pendiente.
- Existe una línea base o una explicación explícita de los datos que faltan.
- Se puede continuar con medición y mantenimiento sin depender de promesas del agente.

No declarar «SEO completo y terminado»: entregar una implementación verificada y una estrategia de mantenimiento. Google no garantiza indexación ni primer lugar por seguir una checklist. Referencia general: [guía oficial SEO](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=es).
