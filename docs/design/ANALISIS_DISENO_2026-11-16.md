# Análisis de diseño de CalculaPerú — 16 de noviembre de 2026

Rama de trabajo: `design/rediseno-profesional`. Respaldo de la versión actual: etiqueta `backup-pre-rediseno-2026-11-16` (commit `4fe72a1`).

Este documento es solo diagnóstico y propuesta. No se ha cambiado ningún archivo de la interfaz.

## 1. Resumen

El sitio **funciona y es coherente**: buena jerarquía en las calculadoras, resultado siempre visible, modo oscuro y una tipografía legible (IBM Plex Sans). Lo que lo hace parecer «hecho por una IA» no es un error concreto, sino la **acumulación de recursos genéricos repetidos en todas las pantallas**: el mismo tipo de tarjeta, las mismas etiquetas en mayúsculas, el verde esmeralda usado en todo, los bordes muy redondeados en todas partes y mucho texto diminuto.

La buena noticia: casi todo se corrige **cambiando una capa de estilos (tokens y unos pocos componentes base)**, no reescribiendo pantallas. Por eso proponemos un rediseño por fases y reversible, no un cambio brusco.

## 2. Evidencia medible

Conteo de clases en el código fuente (117 archivos `.tsx`). Son apariciones en el código, no elementos en pantalla.

| Indicador | Valor | Qué sugiere |
|---|---|---|
| Texto de 12 px o menos (`text-xs`, `[11px]`, `[10px]`, `[9px]`) | **1,124** usos frente a 248 en `text-sm` y 54 en `text-base` | La interfaz está dominada por texto pequeño; cuesta leer en celular y se percibe como «panel de control» |
| Esquinas redondeadas (`rounded-xl` 456, `2xl` 210, `3xl` 106) | **772** | Redondeo uniforme en todo: no hay jerarquía entre contenedores, botones y chips |
| Sombras (`shadow-sm` a `2xl`) | **184** | Todo flota; nada se siente «apoyado» |
| Etiquetas en mayúsculas pequeñas (`uppercase` 129, `tracking-wider/widest` 91) | **129** | Recurso de plantilla para dar «tono técnico» |
| Peso extra negro (`font-black`) | **89** | Titulares muy pesados, poco matiz |
| Verde esmeralda (`emerald-*`) | **1,876** | Acento usado como color de todo, incluidos fondos, bordes, texto y estados |
| Otros tonos decorativos (`teal`, `sky`, `indigo`, `violet`, `amber`, `rose`…) | **624** | Paleta dispersa sin sistema |
| Verdes definidos a mano | `#00875a` (216), `#08734f` (118), `#00c853` (76), `#00704a` (32) | **Cuatro verdes de marca distintos** más la escala de Tailwind: no hay un único color de marca |
| Colores hexadecimales distintos en el código | **41**, y solo 3 variables de color en `globals.css` | Los colores no viven en un sistema de diseño |
| Icono de destellos (`Sparkles`) | **51** | El icono «mágico» típico de las interfaces generadas |
| Pastillas (`rounded-full` con relleno) | **125** | Insignias y chips por todas partes |
| Emojis en la interfaz | 26 (por ejemplo 🇵🇪 ⚡ 🔒 en «Sobre nosotros») | Pocos, pero visibles en páginas de confianza |

## 3. Diagnóstico por pantalla

Las capturas están en `docs/design/capturas-actuales/`.

### Inicio (`01`, `02`, `03`, `06`)
- **Foto de Machu Picchu al atardecer** como imagen principal. Es el recurso de stock más repetido de Perú y no tiene relación con calcular. En celular ocupa un cuarto de la pantalla **antes** del titular.
- **La misma etiqueta dos veces**: «25 calculadoras gratuitas · Parámetros Perú 2026» sobre el titular, y «Parámetros Perú 2026» sobre la foto.
- Seis tarjetas idénticas (etiqueta verde, «2026», título, descripción, «Calcular ahora →»). El «2026» en cada tarjeta no informa: es ruido.
- El marcador de posición del buscador se corta en celular («Ej. sueldo, IGV o»).
- El directorio de 25 calculadoras es útil, pero repite el mismo patrón de tarjeta con icono en cuadro verde.

### Calculadora (`04`)
- **Tarjetas dentro de tarjetas dentro de tarjetas**: contenedor blanco, tarjeta del formulario, panel de resultado y, dentro de él, mini tarjetas de colores (amarilla, gris). Es el patrón de «dashboard» genérico.
- Insignias encima del titular (`PLANILLA`, `Más buscado`) y a la derecha («Parámetros referenciales para Perú») que compiten con el titular.
- **Lo que sí funciona**: el resultado grande y claro, el desglose en tabla y la lógica «datos a la izquierda, resultado a la derecha».

### Página PRO (`05`)
- Etiqueta superlativa «LA SUITE DEFINITIVA PARA MYPES Y PROFESIONALES DEL PERÚ», típica de texto generado.
- Maqueta de teléfono con textos **en inglés** («Receipt ready», «Reprint», «Home») dentro de un sitio en español.
- Texto degradado verde en «CalculaPerú PRO» y fila de chips con iconos.
- El precio queda en un selector pequeño y un botón alejado del titular.

### Guías
- Buena base editorial. Mejorable: más aire entre secciones, medida de línea (ancho de lectura) y que los gráficos y la mini calculadora tengan un estilo propio coherente con la identidad.

### Sobre nosotros y avisos
- Tres «pilares» con emojis en cuadros de colores (🇵🇪 ⚡ 🔒): recurso muy reconocible.
- Tres avisos flotantes posibles (cookies, instalar app, sistemas a medida): conviene un sistema único de avisos.

## 4. Patrones «de IA» detectados y qué hacer en su lugar

| Patrón actual | Por qué se nota genérico | Alternativa propuesta |
|---|---|---|
| Insignia en pastilla sobre cada titular | Es el primer recurso de cualquier plantilla de landing | Quitarla en calculadoras; en el inicio, un texto de apoyo normal debajo del titular |
| Mismo bloque de tarjeta (etiqueta + título + texto + flecha) | Parece «galería de funciones» | Lista tipo índice con filas (nombre, qué calcula, dato clave), como un catálogo; las 6 destacadas con resultado de ejemplo real |
| Esquina redondeada grande en todo | Sin jerarquía, estética «burbuja» | Escala corta: 4 px para campos y botones, 8 px para paneles, circular solo para avatares |
| Sombra suave en todo | Aspecto «flotante» | Superficies planas con filete de 1 px; sombra solo en menús y modales |
| Etiquetas en mayúsculas con espaciado | Imita estética técnica sin aportar | Reservar para 2–3 usos (por ejemplo, el rótulo de una tabla) |
| Verde esmeralda en todo | Se pierde su función de acento | Un solo verde de marca, usado solo en acciones principales, enlaces y resultado clave |
| Texto de 10–11 px | Ilegible, parece letra legal | Mínimo 13 px para apoyo y 15–16 px para cuerpo |
| Texto degradado, `Sparkles`, emojis como iconos | Marcas típicas de generación automática | Iconografía lineal consistente (un solo set), sin degradados en texto |
| Foto de stock de Machu Picchu | Cliché y sin relación con el producto | Mostrar el producto: un ejemplo real de boleta calculada o una tabla con datos |
| Maqueta con texto en inglés | Rompe la confianza | Maqueta real con interfaz en español y cifras coherentes con las calculadoras |

## 5. Lo que NO debe cambiar

- **El contenido, las fórmulas y las fuentes.** El rediseño es visual.
- **La estructura que ya funciona**: datos a la izquierda y resultado a la derecha; resultado siempre visible.
- **IBM Plex Sans y la tipografía de cifras** (monoespaciada), que dan seriedad. Se puede afinar, no sustituir.
- **Modo claro y oscuro.**
- **Reglas de AdSense**: no tapar contenido, no mover el diseño al cargar (CLS), reservar los espacios de anuncio y no inducir clics.
- **Accesibilidad actual**: etiquetas, foco visible, `aria-*`.

## 6. Dirección propuesta: «documento oficial y de precisión»

Una calculadora peruana de planilla o impuestos se parece más a una **boleta de pago o a un formulario de SUNAT** que a un panel de startup. La identidad puede salir de ahí:

- **Aspecto de documento**: fondo tipo papel (gris cálido muy claro en modo claro; azul grafito en modo oscuro), filetes finos, tablas con líneas de libro contable, cifras con alineación tabular.
- **Un solo color de marca** (el verde `#00875A` actual, con una escala de 5 tonos derivada) más neutros y colores semánticos solo para estados (error, aviso, éxito).
- **Tipografía**: mantener IBM Plex Sans para texto; reforzar jerarquía con tamaño y peso, no con mayúsculas. Evaluar una tipografía con serifa solo para titulares editoriales de guías (por ejemplo IBM Plex Serif), para dar carácter sin salir de la familia.
- **Componentes sobrios**: botón (3 variantes), campo, tabla de resultados, nota normativa («Base legal»), aviso, pestañas. Pocos y bien definidos.
- **Imagen**: mostrar el producto. Ejemplo: una «boleta calculada» real en el inicio, y los gráficos propios de las guías con estilo de gráfico de informe.

## 7. Hoja de ruta por fases (sin cambios bruscos)

Cada fase se prueba y se puede revertir. Entre fases se mantiene el sitio publicable.

| Fase | Qué se hace | Riesgo | Se considera lista si… |
|---|---|---|---|
| 0. Sistema | Definir tokens (color, tamaño, radios, espaciado, sombras) y reemplazar los 4 verdes por uno | Bajo | Un solo origen de color; capturas antes/después sin diferencias de contenido |
| 1. Estructura común | Barra superior, pie, avisos (cookies, PWA, sistemas a medida) y botones/campos base | Medio | Sin saltos de diseño; Lighthouse sin empeorar |
| 2. Inicio | Nuevo titular y bloque de producto, índice de calculadoras en lista, directorio más compacto | Medio | Rebote igual o menor; navegación a una calculadora en ≤ 2 clics |
| 3. Calculadoras | Plantilla única: menos tarjetas anidadas, resultado como «línea de total», nota de base legal | **Alto** (25 páginas) | Se aplica primero a 3 páginas piloto: sueldo neto, IGV y combustible |
| 4. Guías | Medida de lectura, gráficos y mini calculadora con el nuevo estilo, imagen para compartir | Bajo | Mejora en tiempo de permanencia |
| 5. PRO y cotizador | Página PRO con maqueta real; cotizador con la misma base | Medio | Tasa de solicitud PRO igual o mayor |

Piloto recomendado: hacer solo las **fases 0, 1 y 3 en tres calculadoras** y comparar antes de seguir.

## 8. Cómo medimos si mejora

- **Antes y después** con las mismas 6 capturas.
- **Rendimiento**: Lighthouse móvil y escritorio (hay ejecuciones guardadas en la raíz del repositorio como base).
- **Estabilidad visual**: CLS bajo 0.1, sobre todo donde irán anuncios.
- **Uso real** (Vercel Analytics): páginas por visita (hoy 1,27) y rebote (hoy 82 %), comparando el período siguiente.
- **Accesibilidad**: contraste mínimo 4.5:1, cuerpo de texto ≥ 15 px, objetivos táctiles ≥ 44 px.

## 9. Riesgos y cómo se controlan

- **Regresiones visuales en 25 calculadoras**: se avanza por piloto y se compara con capturas.
- **Tiempo**: sin la fase 3 completa, el sitio ya mejora con las fases 0 y 1.
- **AdSense**: cualquier cambio de maquetación debe mantener los espacios reservados y no ocultar contenido.
- **Reversión**: el respaldo `backup-pre-rediseno-2026-11-16` permite volver al estado actual en cualquier momento.

## 10. Decisiones que necesitamos de ti

1. ¿Te convence la dirección «documento oficial y de precisión»? ¿Prefieres algo más cálido o más moderno?
2. ¿Aceptas retirar la foto de Machu Picchu del inicio y mostrar el producto?
3. ¿Mantenemos el verde `#00875A` como color de marca o quieres explorar otro?
4. ¿Hacemos primero el piloto de 3 calculadoras antes de tocar las 25?
