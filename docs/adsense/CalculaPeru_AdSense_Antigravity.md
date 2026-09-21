# CalculaPerú: manual de recuperación AdSense para Antigravity

Investigación pública: 21 de septiembre de 2026. Sitio: https://www.calculaperu.com.pe/.

## 1. Objetivo y límites

Corregir problemas verificables de calidad, funcionamiento, transparencia y acceso antes de solicitar otra revisión. Este manual incluye cuatro especificaciones completas de skills para crear en el proyecto de Antigravity. No se han instalado en tu equipo ni se ha modificado tu web.

La aprobación depende de Google. Ningún prompt, plugin, puntuación SEO o número de artículos garantiza obtenerla. El usuario informa de dos rechazos, pero todavía no se dispone del texto de ninguno. No diagnosticar automáticamente «contenido de poco valor».

Esta revisión examinó contenido público extraído de varias páginas; no ejecutó los formularios, no auditó el repositorio, no accedió a AdSense ni Search Console y no comprobó todas las calculadoras. El contenido observado puede cambiar. Los errores de lectura del investigador no demuestran errores del servidor.

## 2. Cómo usar este documento

Abrir el proyecto real de CalculaPerú en Antigravity, adjuntar este documento y pegar el encargo de la sección 3. Adjuntar también las capturas completas de los rechazos, ocultando identificadores privados si se desea.

Antigravity debe crear cada skill usando exactamente el bloque de contenido correspondiente de la sección 8, sin las vallas exteriores de Markdown. Copiar este manual a `docs/adsense/CalculaPeru_AdSense_Antigravity.md` para que las skills puedan consultarlo.

La documentación consultada admite skills del proyecto en `.agents/skills/<nombre>/SKILL.md` y mantiene compatibilidad con `.agent/skills`. Confirmar la versión instalada antes de elegir la ubicación y no duplicar las skills en ambas. La documentación describe su inspección en Customizations del panel del agente. [Documentación oficial de Antigravity](https://antigravity.google/docs/skills).

No es necesario comprar un paquete de skills. El agente necesita acceso al código, navegación o HTTP para verificar fuentes, ejecución de pruebas y evidencia del panel de AdSense. Una skill organiza ese trabajo; no concede acceso a cuentas ni sustituye las herramientas que falten.

## 3. Encargo inicial para Antigravity

> Lee íntegramente CalculaPeru_AdSense_Antigravity.md. Crea en este proyecto las cuatro skills de su sección 8 y conserva el manual en docs/adsense/. Inspecciona primero las instrucciones existentes y no sobrescribas trabajo ajeno. Utiliza adsense-recovery-audit para coordinar las demás. Mi sitio calculaperu.com.pe ha sido rechazado dos veces. Investiga el mensaje exacto si está adjunto; si falta, pídemelo una sola vez y continúa con la auditoría pública y del repositorio. No asumas el motivo.
>
> Reproduce los hallazgos de este manual y descubre los restantes por URL. Separa hechos, hipótesis y comprobaciones pendientes. Corrige los problemas reproducidos en una rama de trabajo, conserva el diseño cuando funcione y comprueba cálculos, contenido, rastreo y privacidad. No te limites a proponer recomendaciones ni a generar artículos. Presenta evidencias antes/después, pruebas ejecutadas y pendientes reales. No publiques cambios ni solicites otra revisión de AdSense con este encargo: primero entrega el resultado comprobable. No declares que Google nos aprobará.

## 4. Hallazgos específicos que deben reproducirse

Las prioridades siguientes son criterios de trabajo propios, no categorías oficiales de Google ni causas confirmadas del rechazo.

| Prioridad | Evidencia pública observada | Acción y criterio de cierre |
|---|---|---|
| Alta | En [sueldo neto](https://www.calculaperu.com.pe/sueldo-neto), el formulario ofrece S/113 de asignación familiar y el ejemplo usa S/102,50. La tasa previsional mostrada es 12,92%, mientras que la guía menciona un intervalo que termina en 12,80%. | Verificar fecha, régimen y fuentes oficiales; unificar los supuestos de interfaz, artículo, ejemplo y PDF. Si hay ejemplos históricos, identificarlos como tales. No sustituir cifras de forma global sin revisar dependencias. |
| Alta | [Sobre nosotros](https://www.calculaperu.com.pe/sobre-nosotros) promete exactitud absoluta; el pie presenta los resultados como referenciales. | Delimitar precisión, supuestos y excepciones. Identificar al responsable real y su método de mantenimiento, sin atribuirle credenciales no demostradas. |
| Alta | La [política de privacidad](https://www.calculaperu.com.pe/politica-de-privacidad) describe la recogida de correo para una lista de espera. [Contacto](https://www.calculaperu.com.pe/contacto) solicita además nombre, motivo y mensaje, y afirma usar servidores propios. | Inspeccionar destinos reales de formularios, analítica y almacenamiento. Actualizar aviso conforme a la implementación efectiva, incluyendo finalidades y proveedores. No inferir que el formulario funciona solo por existir. |
| Media-alta | [Cotizador](https://www.calculaperu.com.pe/cotizador) es una promoción de acceso previo con demo; solicita correo o WhatsApp, promete una mejora comercial cuantificada sin fuente visible y presenta un título de navegador genérico de calculadoras. | Verificar funciones y promesas. Distinguir demo y producto disponible, explicar el registro, justificar o retirar la cifra comercial y corregir el título. Verificar permisos o carácter ficticio de datos de muestra. Evaluar anuncios según el contenido real de la página. |
| Pendiente | En [tipo de cambio](https://www.calculaperu.com.pe/tipo-de-cambio-dolar-sunat), la extracción muestra estado de carga y valores sin completar. | Reproducir en navegador con JavaScript, registrar respuesta de API y tiempo. Puede ser un estado inicial normal, no un fallo. Añadir manejo de errores y fecha de cotización cuando falten. |
| Pendiente | La lectura del dominio sin www y de robots.txt, ads.txt y sitemap.xml produjo errores de la herramienta de investigación. | Comprobar mediante HTTP real redirecciones, estado, cabeceras y cuerpo. No afirmar que estos archivos faltan o que el dominio está caído. |

La portada sí ofrece un directorio de 25 herramientas y enlaces informativos. La página de horas extras ya incorpora fórmula y ejemplo. Evitar repetir recomendaciones genéricas como «crea una página de privacidad» sin leer la existente. Esta muestra no acredita la calidad de todas las páginas. [Portada](https://www.calculaperu.com.pe/) · [Horas extras](https://www.calculaperu.com.pe/horas-extras).

## 5. Qué dicen las fuentes y qué es recomendación propia

| Tema | Criterio documentado | Consecuencia práctica |
|---|---|---|
| Contenido y navegación | Google pide valor original y una experiencia utilizable. [Preparación del sitio](https://support.google.com/adsense/answer/7299563?hl=es). | Priorizar utilidad comprobable de cada calculadora y explicaciones específicas. Añadir palabras por volumen no demuestra valor. |
| Pantallas monetizables | Se restringen anuncios en pantallas vacías, de poco valor, en construcción o usadas solo para ciertas interacciones. [Valor del inventario](https://support.google.com/publisherpolicies/answer/11112688?hl=es). | Revisar errores, agradecimientos y rutas incompletas; una calculadora no se descarta automáticamente por ser herramienta. |
| Rechazos | Los problemas pueden involucrar conexión/verificación, acceso, contenido/experiencia o políticas. [Sitio no preparado](https://support.google.com/adsense/answer/12176698?hl=es). | La explicación del panel determina qué rama investigar primero. |
| Publicidad y tráfico | Están prohibidos clics propios o artificiales y presentaciones engañosas de anuncios. [Políticas del programa](https://support.google.com/adsense/answer/48182?hl=es). | No comprar tráfico automatizado ni pedir clics. Separar anuncios de calcular, copiar y descargar. |
| Privacidad | Deben explicarse cookies y terceros publicitarios y las opciones de personalización aplicables. [Contenido requerido](https://support.google.com/adsense/answer/1348695?hl=es). | La política debe corresponder a lo implementado y contemplar los formularios existentes. |
| Consentimiento | Google exige CMP certificada integrada con TCF para anuncios personalizados a usuarios del EEE, Reino Unido y Suiza según la guía consultada. [CMP](https://support.google.com/adsense/answer/13554116?hl=es). | Revisar el origen del tráfico y la modalidad publicitaria; estar en Perú no describe a todos los visitantes. No confundir un banner casero con una CMP certificada. |
| ads.txt | Google lo recomienda, pero su guía no lo establece como obligatorio en general. [ads.txt](https://support.google.com/adsense/answer/12171612?hl=es). | Comprobar el ID real y el estado del panel; no venderlo como solución a contenido insuficiente. |
| Buscadores e IA | La guía de Search prioriza contenido útil; generar muchas páginas sin valor puede infringir sus políticas. [IA y Search](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content?hl=es). | La revisión humana y el valor importan. No presentar una guía SEO como garantía o requisito independiente de aprobación AdSense. |

No se encontró en las páginas de requisitos consultadas un mínimo universal de 30 artículos, 1.000 palabras por página o 1.000 visitas diarias. No inventar esos umbrales. Tampoco asumir un periodo obligatorio universal después de dos rechazos: respetar el estado y las fechas que muestre la cuenta. Más páginas indexadas, una puntuación Lighthouse alta o marcado FAQ no equivalen a aprobación.

## 6. Plan de ejecución y evidencia

### Fase A: diagnóstico y alcance

Recoger el texto exacto y fechas de los dos rechazos, dominio presentado y cambios entre solicitudes. Diferenciar rechazo del sitio, problema de cuenta y limitación de anuncios. Consultar solo los paneles autorizados; si no hay acceso, trabajar con capturas. No solicitar contraseñas por chat.

Inspeccionar framework, rutas, generación de HTML, despliegue, scripts publicitarios y proveedores de formularios. No asumir que se usa Angular, React o Vercel por conversaciones antiguas. Inventariar todas las rutas desde el código y contrastarlas con enlaces y sitemap. Incluir calculadoras, categorías, cotizador, información y páginas de error.

Crear un registro con: URL, propósito, respuesta HTTP, título, canonical, indexabilidad, contenido inicial/renderizado, utilidad, fuente, anuncios, defecto, evidencia y decisión. Los estados son comprobado, fallido, pendiente o no aplicable; «no pude comprobarlo» no es «aprobado».

### Fase B: acceso y renderizado

Probar HTTP/HTTPS y variantes con/sin www, rutas profundas y recargas. Verificar un destino canónico coherente y evitar bucles. Comprobar que las rutas inexistentes no se presentan como páginas válidas por un fallback indiscriminado.

Examinar robots.txt, meta robots y X-Robots-Tag por separado. No bloquear recursos necesarios. Contrastar HTML recibido y DOM renderizado: título, explicación, enlaces y contenido no deberían desaparecer en la versión desplegada. Si hace falta, proponer prerenderizado o SSR con un caso reproducible y la solución menos invasiva. JavaScript no implica rechazo automático. [SEO JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=es).

Revisar acceso de Mediapartners-Google y las comprobaciones de verificación pertinentes, además de Googlebot. Que Search indexe una página no demuestra acceso del rastreador publicitario; son procesos diferentes. Una petición con user-agent simulado tampoco demuestra una visita real de Google. Buscar evidencia en panel o registros cuando exista. [Rastreador AdSense](https://support.google.com/adsense/answer/99376?hl=es) · [Acceso mediante robots.txt](https://support.google.com/adsense/answer/10532?hl=es).

### Fase C: calidad del producto y contenido

Para cada herramienta, hacer comprensible qué resuelve, a quién aplica, entradas, fórmula, fuente, vigencia, ejemplo reproducible, interpretación y límites. No imponer una extensión de artículo ni repetir una plantilla textual idéntica para cubrir todas las páginas. Estas son recomendaciones de diseño editorial propias.

Priorizar sueldo, CTS, gratificación, liquidación y tributos por su impacto en decisiones del usuario. Mantener parámetros fechados y un responsable de actualización. Verificar tasas y normas al implementar en SUNAT, SBS, MTPE, BCRP, El Peruano u Osinergmin según corresponda; enlazar el documento concreto, no solo la portada institucional. No atribuir aquí vigencia legal a las cifras observadas.

Revisar dispositivos móviles, teclado, etiquetas, errores de entrada, resultados, PDFs y enlaces para compartir. Probar tasas nulas, red lenta, indisponibilidad de proveedor y fecha de datos. Impedir resultados Infinity/NaN presentados como dinero.

### Fase D: privacidad y anuncios

Examinar solicitudes de red, cookies, localStorage, sessionStorage y parámetros de enlaces compartidos. Comprobar especialmente que los valores financieros no lleguen involuntariamente a analítica, registros de URL o proveedores. No prometer que nada se transmite si la implementación no lo garantiza.

Confirmar que correo y formularios sean operativos mediante pruebas locales o simuladas; no enviar mensajes reales sin autorización. Ajustar el aviso a campos, destinos, conservación y canales reales. No fabricar una oficina, equipo editorial, contador revisor o certificación.

Mantener verificación y unidades publicitarias como conceptos separados. Aplicar exclusiones de anuncios a pantallas no aptas, sin ocultar al revisor páginas problemáticas que siguen existiendo para usuarios. No usar robots.txt o noindex como sustitutos de corregir una infracción; noindex no impide servir anuncios.

### Fase E: entrega y nueva solicitud

Preparar cambios revisables y pruebas. Después de publicar con autorización, repetir los controles esenciales sobre producción; no trasladar automáticamente un resultado local al dominio público. Corroborar en AdSense la conexión del sitio y resolver las advertencias concretas.

Solicitar revisión cuando las correcciones estén desplegadas y verificadas y el panel lo permita. No fijar una espera inventada ni reenviar por rutina. La decisión final siempre queda en Google.

## 7. Pruebas y plantilla de resultados

Los siguientes son casos matemáticos sintéticos para comprobar implementación, no validación de obligaciones tributarias o laborales específicas.

| Caso | Entrada | Resultado esperado |
|---|---|---|
| Adición de tasa | Base 100, tasa de prueba 18% | Impuesto 18; total 118 |
| Desglose de tasa | Total 118, tasa de prueba 18% | Base 100; impuesto 18 |
| Margen frente a recargo | Costo 80, venta 100 | Utilidad 20; margen 20%; recargo 25% |
| Equilibrio | Fijos 1.000, venta unitaria 50, costo variable 30 | 50 unidades |
| Equilibrio imposible | Venta unitaria igual o menor al variable | Aviso explicativo; no un número de unidades engañoso |
| Préstamo sin interés | Capital 1.200, 12 cuotas, sin cargos | Cuota 100 |
| Conversión manual | 100 USD, tasa sintética 3,50 PEN/USD | 350 PEN; inversa consistente |
| Entradas inválidas | Vacío, letras, negativo donde no aplica | Validación clara; ningún NaN/Infinity |

Para cálculos laborales, construir fixtures con supuestos y normativa documentados: fecha, régimen, base computable, AFP/ONP y comisión, conceptos variables, periodo completo/incompleto y reglas de redondeo. Un fixture no puede obtener su valor esperado llamando a la misma función que se prueba.

Comprobar que ejemplos, interfaz y PDF coinciden con el mismo fixture. Mostrar la fecha de las tasas de API y distinguir un valor manual de uno obtenido del proveedor. Los ejemplos hipotéticos deben identificarse como ejemplos, no como boletas reales.

Guardar por hallazgo:

```text
ID / prioridad:
URL y archivo afectado:
Tipo: hecho observado | hipótesis | pendiente
Fecha y entorno:
Pasos para reproducir:
Evidencia anterior:
Política oficial o recomendación propia:
Cambio aplicado:
Prueba y resultado real:
Evidencia posterior:
Pendientes / responsable:
```

El informe final debe usar «correcciones verificadas; listo para solicitar revisión» o «faltan comprobaciones/correcciones», nunca «aprobación asegurada» ni un porcentaje inventado de probabilidad.

## 8. Contenido de las cuatro skills para crear en Antigravity

Son instrucciones específicas para este proyecto, no skills oficiales de Google. Los bloques son parte de este manual de traspaso; Antigravity debe guardarlos como archivos de skill en el proyecto del usuario. Todos consultan el manual local para fuentes y evidencias iniciales.

### Skill 1: adsense-recovery-audit

Guardar en `.agents/skills/adsense-recovery-audit/SKILL.md`.

```markdown
---
name: adsense-recovery-audit
description: Audita rechazos de Google AdSense en CalculaPerú, clasifica evidencias y coordina correcciones de contenido, cálculos y acceso antes de una nueva revisión.
---

# Recuperación AdSense de CalculaPerú

Leer docs/adsense/CalculaPeru_AdSense_Antigravity.md y las instrucciones vigentes del proyecto. Tratar hallazgos antiguos como casos que deben reproducirse.

Solicitar el mensaje exacto de rechazo si falta; continuar con tareas independientes. Distinguir rechazo de sitio, cuenta, verificación y limitación publicitaria. No inferir motivos privados a partir de síntomas públicos.

Inventariar todas las rutas. Registrar por hallazgo URL, fecha, entorno, evidencia, impacto, prioridad, fuente y prueba de cierre. Separar política oficial de recomendación propia.

Aplicar adsense-technical-access para conexión y rastreo; calculaperu-calculation-qa para resultados; adsense-content-trust para contenido y privacidad. No invocar subagentes salvo autorización del usuario o instrucciones aplicables.

Si el motivo es acceso, comenzar por dominio y rastreador. Si es contenido de poco valor, revisar utilidad de las rutas y coherencia editorial. Si es una infracción concreta, leer su política exacta. Si es cuenta, identificar el trámite del titular y no inventar arreglos de código.

Implementar correcciones reproducibles en cambios revisables cuando el encargo lo autorice. No reescribir el diseño ni generar artículos masivamente como reacción automática. No instalar paquetes de terceros innecesarios.

Entregar inventario, hallazgos antes/después, archivos cambiados, pruebas realmente ejecutadas y pendientes. Si no hay acceso al código o a un panel, describir el límite sin inventar resultados. No desplegar ni reenviar solicitudes por el solo hecho de activar esta skill.

Prohibir garantías de aprobación, cifras mágicas de artículos/visitas, tráfico artificial, ocultación al revisor y credenciales editoriales ficticias. Actualizar la documentación oficial antes de una nueva solicitud.
```

### Skill 2: adsense-technical-access

Guardar en `.agents/skills/adsense-technical-access/SKILL.md`.

```markdown
---
name: adsense-technical-access
description: Verifica acceso HTTP, renderizado, rutas, rastreadores y conexión AdSense en CalculaPerú cuando hay rechazo, fallos de verificación o dudas sobre la versión publicada.
---

# Acceso técnico y conexión

Consultar el manual docs/adsense/CalculaPeru_AdSense_Antigravity.md y abrir las fuentes oficiales vinculadas a acceso, JavaScript, robots y ads.txt.

Detectar framework y hosting reales. Inspeccionar rutas, cabeceras y configuración antes de modificar. Comparar local y producción por separado.

Probar dominio raíz y www por HTTP/HTTPS. Registrar cadena de redirecciones, estado final, certificado y contenido. Visitar rutas profundas y una inexistente. Comprobar errores de assets, APIs, CSP e hidratación.

Inspeccionar robots.txt, meta robots, X-Robots-Tag, canonical y sitemap. Separar indexación de Search y acceso de AdSense. No asumir que cambiar user-agent reproduce exactamente Google. No retirar autenticación de áreas privadas para facilitar una revisión pública.

Comparar HTML inicial con DOM renderizado y probar enlaces reales. Si hay contenido inaccesible por renderizado, reparar el caso concreto; no migrar todo el stack sin necesidad demostrada.

Verificar en la cuenta el método de conexión elegido, dominio e ID del titular. No inventar publisher IDs ni colocar valores de ejemplo en producción. Si existe ads.txt, comprobar texto y formato; su presencia no acredita calidad de contenido.

Verificar unidades publicitarias y exclusiones de pantallas vacías, errores y estados no aptos. No confundir excluir anuncios con noindex. Preservar mecanismos de consentimiento que correspondan.

Entregar tabla URL/control/evidencia/resultado y cambios mínimos. Marcar verificaciones sin acceso como pendientes. No convertir un error de herramientas externas en diagnóstico del servidor. No ejecutar clics en anuncios reales.
```

### Skill 3: calculaperu-calculation-qa

Guardar en `.agents/skills/calculaperu-calculation-qa/SKILL.md`.

```markdown
---
name: calculaperu-calculation-qa
description: Verifica fórmulas, parámetros peruanos, ejemplos, resultados y PDFs de CalculaPerú cuando se revisan tasas, calculadoras financieras o coherencia antes de monetizar.
---

# Verificación de cálculos

Leer el manual docs/adsense/CalculaPeru_AdSense_Antigravity.md. Revisar primero la inconsistencia registrada de asignación familiar y tasas AFP, sin asumir que sigue presente.

Separar fórmulas matemáticas, reglas legales y parámetros variables. Para cada regla peruana consultar la fuente oficial competente y documentar fecha, régimen, alcance, vigencia y enlace específico. No certificar exactitud legal sin verificación.

Crear un registro mantenible de parámetros con valor, unidad, periodo y fuente; no compartir parámetros entre regímenes incompatibles. Evitar fechas de actualización ficticias.

Construir casos esperados de manera independiente del código probado. Usar los casos sintéticos del manual para aritmética y fixtures normativos documentados para laboral y tributario. Revisar separadores decimales, porcentajes, unidades y redondeo.

Probar cero, vacío, valores inválidos, fechas límite y denominadores cero según cada herramienta. Revisar tasa efectiva frente a nominal y costes excluidos cuando corresponda. Explicar los casos no cubiertos.

Confrontar resultado, explicación, ejemplo, PDF y enlace compartido bajo idénticos supuestos. No etiquetar un ejemplo inventado como boleta real. No sustituir cifras aisladas sin recalcular resultados dependientes.

En APIs de tasas, comprobar fuente, fecha, error, demora y fallback. Identificar claramente cotización manual y dato vencido; no mostrar una tasa de reserva como actual ni un promedio de mercado como tasa oficial de otro organismo.

Entregar matriz herramienta/caso/supuestos/esperado/obtenido/resultado/fuente. Corregir y ejecutar las pruebas relevantes. Declarar las reglas pendientes de validación en vez de completar con memoria.
```

### Skill 4: adsense-content-trust

Guardar en `.agents/skills/adsense-content-trust/SKILL.md`.

```markdown
---
name: adsense-content-trust
description: Revisa utilidad original, coherencia editorial, privacidad y presentación publicitaria de CalculaPerú ante rechazos AdSense o revisiones de calidad del sitio.
---

# Contenido útil y confianza

Leer docs/adsense/CalculaPeru_AdSense_Antigravity.md. Verificar las páginas reales antes de recomendar crear otras que ya existen.

Evaluar cada ruta por su propósito y utilidad, no por longitud. Identificar textos intercambiables, promesas no demostradas, fuentes vagas, ejemplos que contradicen la herramienta y páginas incompletas.

Mejorar entradas, interpretación del resultado, ejemplo reproducible, alcance y fuentes cuando aporten valor. Evitar repetir un bloque genérico en todas las calculadoras o publicar artículos masivos para alcanzar una cuota.

Verificar responsables y revisores reales. No atribuir credenciales, testimonios, alianzas oficiales ni experiencia inventada. Retirar o sustentar porcentajes de mejora comercial y promesas absolutas. Mostrar fechas de revisión solo cuando hubo revisión efectiva.

Inspeccionar formularios, destinos de red y almacenamiento. Ajustar privacidad a campos, finalidades, proveedores y funcionamiento real. Revisar cookies publicitarias y opciones de personalización según Google, y CMP según tráfico y modalidad. No presentar esta comprobación como certificación jurídica integral.

Probar contacto sin mandar comunicaciones reales salvo autorización. Etiquetar demos, datos ficticios y funciones futuras; no anunciar descargas o prestaciones inexistentes como disponibles.

Separar anuncios de controles de cálculo y descarga. Revisar pantallas monetizadas conforme a las políticas de inventario. No ocultar temporalmente defectos para engañar a revisores.

Entregar por URL el defecto, evidencia, propuesta o cambio y criterio de cierre. Distinguir expresamente políticas AdSense de recomendaciones SEO. No prometer aprobación por autoría, schema, contenido largo o puntuaciones técnicas.
```

## 9. Criterios de cierre antes de volver a solicitar revisión

- El motivo del rechazo está documentado, o su ausencia está claramente señalada.
- Los hallazgos prioritarios reproducidos se corrigieron con evidencia; no quedan fallos conocidos relevantes ocultos bajo una puntuación global.
- Las rutas públicas principales y las herramientas anunciadas funcionan en producción.
- Ejemplos, parámetros y resultados coinciden; fuentes y supuestos se pueden comprobar.
- Los avisos de privacidad describen los formularios y servicios reales.
- La conexión con AdSense y el acceso se verificaron con el método aplicable.
- Los anuncios no se sirven en pantallas no aptas y no inducen clics accidentales.
- El responsable revisó el contenido generado y dispone del informe de cambios.
- Se revisó el estado actual del panel antes de iniciar la nueva solicitud.

Estos son criterios internos de preparación, no un certificado de aceptación de Google.

## 10. Referencias complementarias

- [Requisitos para participar en AdSense](https://support.google.com/adsense/answer/9724?hl=es): elegibilidad del titular y del contenido.
- [Contenido útil y fiable en Google Search](https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=es): guía editorial complementaria, no equivalencia con aprobación AdSense.
- [Documentación de skills de Antigravity](https://antigravity.google/docs/skills): formato y ubicación; confirmar compatibilidad con la instalación local.

Revalidar fuentes y páginas al ejecutar. Este documento es una base de trabajo fechada y no reemplaza las políticas que Google publique después.
