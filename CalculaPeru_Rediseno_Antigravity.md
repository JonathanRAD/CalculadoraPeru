# CalculaPerú: dirección de rediseño para Antigravity

Fecha: 21 de septiembre de 2026. Proyecto: https://www.calculaperu.com.pe/.

## 1. Encargo

Rediseñar CalculaPerú para que resulte minimalista, atractivo, reconocible y fácil de utilizar. Priorizar encontrar una herramienta, introducir datos y entender el resultado. Mantener la identidad verde y el contexto peruano mediante contenido específico, ejemplos y moneda.

Este documento es una propuesta de diseño y un encargo para trabajar en el proyecto real. No constituye una implementación, una instalación de skills ni una auditoría completa de accesibilidad. Complementa el manual CalculaPeru_AdSense_Antigravity.md.

La captura de AdSense aportada por el titular confirma «Contenido de poco valor» y propiedad verificada. Un rediseño visual no resuelve por sí solo el rechazo: conservar y mejorar contenido original, exactitud, fuentes y utilidad. No prometer aprobación.

## 2. Observaciones de la revisión visual

Se inspeccionaron la portada, parte del catálogo y la calculadora de sueldo en navegador de escritorio. No se completó una auditoría móvil. Reproducir las observaciones antes de actuar, porque el sitio puede cambiar.

| Observación | Cambio propuesto | Beneficio |
|---|---|---|
| Fotografía de Machu Picchu detrás de la cabecera principal | Sustituirla por una superficie limpia | Dar protagonismo a la tarea de calcular |
| Título grande, buscador y formulario de sueldo compiten en la portada | Priorizar buscador y selección de herramienta | Evitar elegir por el usuario que quiere calcular su sueldo |
| Fotos de escritorios, monedas y calculadoras en tarjetas altas | Crear accesos compactos con título y descripción concreta | Mostrar más opciones útiles con menos desplazamiento |
| Etiquetas en mayúsculas y numeración decorativa | Mantener categorías y estados solo cuando aporten información | Reducir ruido y falsas jerarquías |
| Varias tarjetas anidadas en sueldo neto | Un formulario y un panel de resultado con filas de desglose | Facilitar lectura y comparación |
| Importe principal truncado como «S/ 2,177…» en la vista examinada | Eliminar el truncamiento de cantidades y adaptar anchura/tamaño | Mostrar siempre el resultado completo |
| Aviso de cookies superpuesto a parte de los resultados | Componer un aviso compacto y comprobar superposición | Permitir el uso de la herramienta sin perder controles necesarios |

No atribuir a IA la autoría de fotografías o componentes sin evidencia. El problema observado es la repetición de recursos decorativos poco específicos para la tarea.

## 3. Dirección visual propuesta

### Principios

1. La acción principal se reconoce al primer vistazo.
2. El resultado monetario se lee completo y se entiende mediante un desglose.
3. Los elementos se agrupan por significado, no poniendo cada fragmento en otra tarjeta.
4. La personalidad procede de la composición, la claridad del lenguaje y los detalles del producto.
5. Simplificar la presentación sin eliminar información útil ni controles de accesibilidad.

### Paleta inicial de trabajo

Son valores propuestos para prototipar, no colores extraídos de la marca ni una paleta cuyo contraste ya esté validado.

| Token | Valor inicial | Uso |
|---|---|---|
| Fondo | #FFFFFF | Superficie principal |
| Superficie secundaria | #F5F7F6 | Agrupación discreta |
| Texto principal | #17221C | Títulos, etiquetas y cifras |
| Texto secundario | #536158 | Ayudas y descripciones |
| Marca / acción | #08734F | Acción primaria y selección |
| Borde | #DCE4DF | Separación de controles y bloques |

Definir colores semánticos separados para error, aviso y éxito; no depender exclusivamente del color. Comprobar contraste de cada combinación y estado antes de implementarla. Usar verde con moderación para que conserve su función de énfasis.

### Tipografía y espacio

- Evaluar primero la fuente existente. Conservarla si tiene buena legibilidad y puede adquirir carácter mediante una escala coherente. No cargar otra fuente solo para aparentar originalidad.
- Preferir una familia con caracteres españoles y cifras tabulares. Usar números tabulares en importes y tablas.
- Punto de partida: cuerpo de 16–18 px, ayudas de 14 px, título de calculadora de 28–36 px y resultado de 32–48 px, ajustado según ancho y longitud.
- No truncar dinero con puntos suspensivos. Reducir tamaño de forma controlada o permitir distribución adecuada de moneda y cantidad.
- Ancho de contenido de aproximadamente 1.120–1.200 px en escritorio; texto explicativo con una longitud de línea cómoda y más estrecha.
- Espaciado consistente en pasos de 4/8 px; radios moderados de 8–12 px como punto de partida.
- Sombras reservadas para superposiciones o elementos que necesiten indicar elevación.

Estas medidas son decisiones del proyecto, no requisitos oficiales de Google.

## 4. Nueva portada

### Cabecera

Logo legible, acceso a Calculadoras, Guías y Acerca de. Guías debe llevar a contenido real: no añadir enlaces vacíos. Mantener acceso secundario a Contacto. Reducir el protagonismo del cotizador mientras sea una demo o producto futuro y describirlo con precisión.

Conservar selector de tema solo si está bien implementado; simplificar su presentación. Mantener el menú móvil operable por teclado y toque.

### Primer bloque

Título propuesto: **¿Qué necesitas calcular?**

Descripción funcional breve: calculadoras de trabajo, impuestos, negocios y finanzas para Perú.

Buscador visible con ejemplos de búsqueda útiles. Añadir accesos a sueldo, IGV, CTS y precio de venta, sin afirmar que son «los más usados» si no hay datos que lo respalden.

No colocar un formulario completo de sueldo a su lado por defecto. Puede recuperarse más adelante si evidencia de uso justifica ese acceso prioritario.

### Directorio

Cuatro grupos comprensibles: Trabajo, Negocios, Impuestos y Finanzas. Conservar cobertura de herramientas cotidianas mediante una ubicación explícita, sin forzarlas en una categoría incorrecta. El inventario real determinará si conviene mantener una quinta categoría.

Cada acceso debe explicar qué resuelve con nombre y una frase, por ejemplo «Sueldo neto — estima cuánto recibirás después de los descuentos». No inventar nuevas funciones para completar la maqueta.

En escritorio pueden convivir columnas; en móvil usar una lista legible. Seleccionar categorías debe mostrar un estado claro y una forma sencilla de volver a todas. Evitar carruseles para el catálogo principal.

La búsqueda debe reconocer términos frecuentes y mostrar un estado sin resultados con alternativas. La navegación y los enlaces a calculadoras deben seguir existiendo aunque nadie use el buscador.

### Contenido complementario

Mostrar guías específicas existentes o realmente redactadas y revisadas. Incluir enlaces a metodología, fuentes y responsable. Mantener privacidad, términos y contacto accesibles.

No sustituir las explicaciones por frases promocionales. No eliminar contenido útil para conseguir una portada visualmente vacía.

## 5. Página de calculadora

### Escritorio

Encabezado breve con título, alcance y fecha real de revisión cuando exista. Debajo, formulario a la izquierda y resultado a la derecha. Ajustar proporciones según campos y tamaño de cifras, en lugar de imponer dos columnas iguales.

Formulario agrupado en datos básicos y opciones adicionales. Explicar las entradas junto a su control. Mantener etiquetas visibles, unidades y ejemplos de formato. No ocultar una opción necesaria para obtener el resultado correcto.

Resultado en un único panel: cifra completa, alcance de la estimación y desglose ordenado por filas. En sueldo, utilizar una presentación inspirada en una boleta simplificada, sin presentarla como documento oficial.

PDF, copiar y compartir son acciones secundarias. Conservarlas solo si funcionan y no exponen datos inesperadamente. La ubicación de anuncios no debe confundirse con estos controles.

### Móvil

Una columna con orden lógico: entradas, resultado y explicación. Ofrecer un acceso al resultado si el formulario es largo. No añadir barras flotantes que tapen campos, teclado o consentimiento.

Probar importes largos, etiquetas multilínea y zoom. El resultado no puede perder decimales ni quedar escondido por la maquetación.

### Explicación

Mantener debajo del cálculo: método, supuestos, ejemplo coherente, fuentes y límites. Acordeones para detalles secundarios; no esconder toda la sustancia explicativa para aparentar minimalismo.

Comparar dos escenarios puede aportar valor, pero debe tratarse como una mejora posterior, con alcance y validación propios. No es requisito para completar el rediseño inicial.

## 6. Movimiento, accesibilidad y rendimiento

- Animar cambios que respondan a una acción: apertura de opciones, estados de botones y confirmaciones.
- Usar transiciones breves, aproximadamente 120–200 ms, ajustadas al comportamiento real.
- Respetar prefers-reduced-motion. Evitar conteos animados de dinero, rebotes y entradas de todas las secciones al desplazarse.
- Proporcionar foco visible, etiquetas, errores asociados a campos y navegación por teclado.
- No anunciar resultados a lectores de pantalla de manera excesiva en cada pulsación. Diseñar las actualizaciones para que sean comprensibles.
- Evitar bibliotecas de animación, iconos o componentes cuando no aporten valor suficiente. Conservar el framework actual salvo necesidad demostrada.
- Reservar dimensiones de contenido dinámico y anuncios para reducir saltos. No colocar publicidad sobre el formulario o el resultado.

Como referencia técnica complementaria, utilizar [Web Interface Guidelines de Vercel](https://vercel.com/design/guidelines), que cubre formularios, interacción, tipografía y accesibilidad. No equivale a una certificación de accesibilidad.

## 7. Repositorios elegidos y enlaces alternativos

Las URLs se escriben completas para que Antigravity pueda copiarlas incluso si el lector de Markdown no sigue enlaces. Las referencias son externas y pueden cambiar; registrar la versión o commit usado. No se han instalado estos recursos en el equipo del usuario.

### A. Impeccable: herramienta principal de revisión visual

Repositorio: https://github.com/pbakaus/impeccable

README en texto directo: https://raw.githubusercontent.com/pbakaus/impeccable/main/README.md

Documentación: https://impeccable.style/

Caso visual: https://impeccable.style/cases/neo-mirai/

El README consultado documenta soporte para Antigravity y operaciones de crítica, simplificación y pulido. Revisar primero las instrucciones de instalación correspondientes a la versión actual. No copiar carpetas o activar integraciones de otros agentes por analogía. Usar revisión, simplificación y acabado en pasos separados.

### B. Vercel Agent Skills: verificación de la interfaz

Repositorio: https://github.com/vercel-labs/agent-skills

Guía pública de interfaz: https://vercel.com/design/guidelines

Localizar la skill `web-design-guidelines` en el árbol actual del repositorio. El intento de leer una ruta raw concreta de su SKILL.md falló durante esta preparación; no se garantiza esa ruta ni se interpreta el fallo como ausencia del archivo. El repositorio y la guía pública sí se leyeron en la investigación anterior.

Utilizar esta guía para revisar formularios, accesibilidad y estados. No añadir skills específicas de React/Next.js si el proyecto no usa esas tecnologías.

### C. Anthropic Frontend Design: referencia de dirección artística

Repositorio: https://github.com/anthropics/skills

Archivo: https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md

Texto directo: https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md

Consultar sus principios para elegir composición y personalidad según el producto. No convertir preferencias sobre fuentes, colores o tarjetas en prohibiciones universales. Utilizarla como referencia; no hace falta que tres skills dirijan simultáneamente la misma decisión visual.

### Si un enlace falla

1. Probar el enlace raw cuando esté incluido.
2. Si raw falla, abrir el repositorio y localizar el archivo en su árbol actual.
3. Si no hay acceso de red, continuar con las especificaciones autocontenidas de este documento e indicar qué recurso no se pudo consultar.
4. No afirmar que una skill se instaló o ejecutó sin haberlo comprobado. No ejecutar instaladores de mirrors desconocidos como sustitución.

Revisar licencia antes de copiar código o redistribuir archivos. Los repositorios sirven como herramientas y referencias; este encargo no pide clonar visualmente otra marca.

## 8. Referencias de producto

| Referencia | URL | Aprendizaje que interesa |
|---|---|---|
| Wise, conversor | https://wise.com/gb/currency-converter/ | Dar protagonismo a la operación y presentar claramente unidades y resultados; no copiar cabecera o marca |
| GOV.UK, vacaciones | https://www.gov.uk/calculate-your-holiday-entitlement | Explicar alcance y condiciones de un cálculo antes de empezar |
| Impeccable, Neo Mirai | https://impeccable.style/cases/neo-mirai/ | Comparar propuesta y resultado en navegador; tomar el proceso, no la estética de conferencia |

La referencia de Wise se revisó visualmente en navegador; GOV.UK se consultó como contenido público. No se realizó una evaluación exhaustiva de estos productos. Este documento no depende de un vídeo ni supone haber visto uno completo.

## 9. Flujo de trabajo para Antigravity

### Etapa 1: comprender y registrar

Leer instrucciones locales, detectar tecnología e inventariar componentes, rutas y funcionalidades. Revisar el manual AdSense si está disponible. Capturar el diseño actual en escritorio y móvil con sus problemas reproducibles. No convertir observaciones antiguas en fallos actuales sin verificar.

### Etapa 2: comparar dos propuestas

Preparar dos variantes visuales usando exactamente el mismo contenido y casos:

- **A, recomendada:** portada centrada en búsqueda y directorio compacto; calculadora con formulario abierto y resultado tipo resumen de boleta.
- **B:** portada de selección por categorías, con accesos más amplios pero sin fotografías decorativas; misma claridad en cálculos y resultados.

Cada variante debe mostrar portada y sueldo neto, tanto en escritorio como en móvil. La diferencia debe ser estructural, no solo cambiar colores. Usar datos ficticios identificados y resultados coherentes; no generar cantidades arbitrarias para rellenar capturas.

Presentar ambas para elección antes de extender el rediseño a todas las rutas. Si el usuario delega la elección, elegir A y explicar brevemente el motivo.

### Etapa 3: implementar y verificar

Trabajar sobre componentes reutilizables y tokens. Mantener las rutas existentes y la lógica comprobada. Separar correcciones matemáticas identificadas de cambios de presentación para poder verificarlas. No alterar canonicals, indexabilidad o datos estructurados sin necesidad.

Construir primero portada y sueldo neto. Comprobarlas visualmente y con casos funcionales antes de extender patrones. Cuando estén aprobadas, aplicar el sistema al resto de herramientas respetando necesidades particulares.

### Etapa 4: entregar

Entregar vistas antes/después, archivos cambiados, comprobaciones reales y pendientes. Si hay una vista previa accesible, incluir su enlace. No publicar ni solicitar revisión de AdSense con este documento como única autorización.

## 10. Criterios de aceptación

- La portada permite encontrar y abrir cada herramienta existente.
- No quedan enlaces a secciones todavía inexistentes.
- Las cantidades principales se muestran completas, incluidos importes largos y decimales.
- No hay desbordamiento horizontal a 360, 390, 768 y 1.440 px como muestras de prueba.
- Con zoom al 200%, los controles y textos continúan siendo utilizables.
- Formularios y menús tienen foco visible y funcionan con teclado.
- Se distinguen estados vacíos, datos inválidos, carga y error de servicios externos.
- El aviso de cookies y otros elementos fijos no impiden utilizar campos o resultados; mantener las funciones de consentimiento aplicables.
- PDF y enlaces compartidos conservan el mismo resultado y alcance que la interfaz.
- El contenido explicativo, las fuentes y los límites siguen accesibles.
- No se añaden promesas, estadísticas de uso, testimonios ni credenciales sin evidencia.
- Las pruebas no generan clics en anuncios reales ni envían mensajes de contacto a terceros.
- No hay regresiones conocidas en fórmulas, rutas o acceso móvil.

Los anchos y medidas son objetivos internos para verificar el producto, no condiciones oficiales de AdSense.

## 11. Prompt listo para pegar junto a este archivo

> Lee CalculaPeru_Rediseno_Antigravity.md y revisa el proyecto actual. Quiero una web minimalista, útil y con identidad propia según la dirección descrita. Reproduce los problemas visuales señalados y conserva el contenido útil y las calculadoras. Mi rechazo AdSense es por contenido de poco valor, con propiedad verificada; no confundas un cambio estético con resolver la revisión.
>
> Consulta Impeccable, las pautas de interfaces de Vercel y la referencia Frontend Design de Anthropic usando los enlaces del documento. Si alguno falla, utiliza el enlace raw disponible; si no puedes acceder, continúa con este brief e informa del límite sin inventar una instalación. No necesitas activar los tres recursos simultáneamente.
>
> Primero presenta dos propuestas de portada y sueldo neto en escritorio y móvil, con contenido real del proyecto y resultados de ejemplo coherentes. Recomienda una con razones concretas. Después de elegir la dirección, implementa y comprueba los componentes antes de extenderlos al resto del sitio. No cambies de framework sin una necesidad demostrada. No elimines explicaciones para aparentar minimalismo y no trunques importes. Entrega evidencia visual, pruebas y pendientes. No publiques en producción ni solicites otra revisión de AdSense todavía.
