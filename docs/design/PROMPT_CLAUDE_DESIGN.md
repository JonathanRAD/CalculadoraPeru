# Prompt para Claude Design — rediseño profesional de CalculaPerú

Cómo usarlo:

1. Abre Claude Design y crea un proyecto nuevo.
2. Adjunta las 6 capturas de `docs/design/capturas-actuales/` (están numeradas).
3. Pega todo el bloque de abajo, desde «Contexto» hasta «Formato de entrega».
4. Pide primero la **Fase A** (sistema de diseño y 3 pantallas piloto). Cuando te convenza, pide las demás.

---

## Prompt (copiar desde aquí)

### Contexto

Rediseña CalculaPerú (https://www.calculaperu.com.pe), un portal peruano de 25 calculadoras gratuitas de planilla, impuestos, negocios y finanzas (sueldo neto, CTS, gratificación, IGV, precio de venta, tipo de cambio, etc.), con guías explicativas y un plan de pago llamado PRO (S/ 16 al mes) que incluye un cotizador comercial.

Público: trabajadores en planilla, dueños de bodegas y pequeñas empresas, contadores independientes y estudiantes en Lima y provincias. Muchos entran desde el **celular** (diseña móvil primero), a veces con conexión irregular. Llegan desde Google con una pregunta concreta («cuánto me descuentan de mi sueldo») y se van cuando tienen el número. Quiero que se queden a leer la explicación y a probar otra calculadora.

El sitio se financiará con el plan PRO, con servicios de desarrollo a medida y, si Google lo aprueba, con anuncios de AdSense. Por eso el diseño debe verse **serio, confiable y editorial**, como una fuente de información, no como una startup.

### Qué quiero lograr

Un aspecto **profesional, sobrio y propio**, que transmita precisión y confianza. Hoy se percibe como una plantilla generada por IA. No quiero un cambio brusco de identidad: conservar el verde de marca, la tipografía IBM Plex Sans y la estructura «datos a la izquierda, resultado a la derecha», pero con un acabado mucho más cuidado y distintivo.

### Dirección: «documento oficial y de precisión»

Una calculadora de planilla o impuestos en Perú se parece a una **boleta de pago** o a un formulario de SUNAT. Usa esa referencia:

- Superficies planas con filetes finos de 1 px; sombra solo en menús y diálogos.
- Tablas con aspecto de libro contable: líneas horizontales, cifras alineadas a la derecha con números tabulares, totales con una línea más gruesa.
- Fondo tipo papel: gris cálido muy claro en modo claro; azul grafito (no negro puro) en modo oscuro.
- Jerarquía por tamaño y peso de la tipografía, no por mayúsculas ni insignias.
- Un resultado principal grande y claro, como la «línea de total» de una boleta.

### Reglas obligatorias (evitar el aspecto de IA genérica)

**Prohibido:**
- Insignias en pastilla sobre los titulares («NUEVO», «Más buscado», «Parámetros Perú 2026»).
- Texto con degradado, brillos, efecto vidrio, halos de color y fondos con manchas difuminadas.
- Icono de destellos (✨) o de «magia». Emojis como iconos.
- Cuadrículas de tarjetas idénticas (etiqueta + título + texto + «Ver más →»). Usa listas o tablas donde el contenido lo permita y varía el ritmo visual.
- Tarjetas dentro de tarjetas dentro de tarjetas. Máximo un nivel de contenedor.
- Esquinas muy redondeadas en todo. Usa 4 px en campos y botones, 8 px en paneles y circular solo en avatares.
- Mayúsculas pequeñas con espaciado como decoración (permitido solo en el rótulo de una tabla).
- Más de un color de acento. Los colores de estado (error, aviso, éxito) solo para estados.
- Textos de marketing superlativos («la suite definitiva», «potencia tu negocio»).
- Foto de stock (por ejemplo Machu Picchu). Si usas imagen, que muestre el producto: una boleta calculada real o una tabla con datos.
- Textos de interfaz en inglés.

**Obligatorio:**
- Texto de cuerpo de 16 px (mínimo 15) y nada de texto funcional por debajo de 13 px.
- Contraste mínimo 4.5:1 en texto normal, en claro y oscuro. Objetivos táctiles de 44 px o más.
- Un solo verde de marca (partir de `#00875A`) con una escala de 5 tonos, más neutros. Todo el color sale de variables.
- Cifras monoespaciadas o tabulares en resultados y tablas.
- Una sola familia de iconos lineales, coherente en grosor.
- Diseño móvil primero (360 px), con versiones a 768 px y 1280 px.

### Restricciones técnicas

El resultado debe poder implementarse en el sitio actual: Next.js 16 (App Router), React 19, TypeScript y Tailwind CSS 4, con modo claro y oscuro mediante clase `dark`. Fuentes: IBM Plex Sans (texto) y una monoespaciada para cifras. No dependas de librerías de animación. El sitio debe cargar rápido en celulares modestos: sin imágenes pesadas ni efectos costosos.

Reglas de anuncios (AdSense): reservar espacios de tamaño fijo para anuncios sin empujar el contenido al cargar, no mezclar anuncios con botones de acción y nunca tapar contenido.

### Contenido real a usar (no inventes cifras)

- Marca: CalculaPerú. Eslogan interno: «Calcula mejor, decide mejor».
- Titular del inicio: «¿Qué necesitas calcular?». Apoyo: «Herramientas laborales, tributarias, comerciales y financieras con parámetros 2026 de SUNAT, MTPE, SBS y BCRP.»
- Calculadoras destacadas: Sueldo neto, IGV 18 %, CTS, Gratificación, Precio de venta, Dólar a soles.
- Ejemplo de resultado (sueldo bruto S/ 3,000 en la ONP): descuento ONP 13 % = S/ 390.00; retención de quinta categoría S/ 26.93; sueldo neto estimado **S/ 2,583.07**.
- Ejemplo IGV: base S/ 100.00, IGV 18 % S/ 18.00, total S/ 118.00.
- Parámetros 2026: UIT S/ 5,500; remuneración mínima S/ 1,230; asignación familiar S/ 123.
- Elementos de confianza que deben tener lugar propio: fecha de última actualización, «Base legal» con enlace a la fuente oficial, «Resultado referencial, no sustituye asesoría».
- Menú: Negocios y comercio · Laboral y planilla · Finanzas y metas · Tributario y diario · Guías · Beneficios PRO · Entrar.
- Plan PRO: S/ 16 al mes o S/ 149 al año (equivale a S/ 12.42 al mes). Incluye guardar cálculos, exportar a Excel y PDF, documentos laborales referenciales con tu logo y cotizador comercial.
- Servicio adicional: «Sistemas a medida para tu negocio» (cotizadores, paneles de control, inventario, automatización).

### Entregables

**Fase A (primero):**
1. Sistema de diseño: paleta (claro y oscuro), escala tipográfica, espaciado, radios, bordes, sombras y variables, en un cuadro de especificaciones.
2. Componentes base: botón (primario, secundario, texto), campo numérico con prefijo «S/», selector, interruptor, tabla de resultados, «línea de total», nota de base legal, aviso informativo, pestañas y navegación.
3. Tres pantallas piloto, en móvil y escritorio, claro y oscuro: **Inicio**, **Calculadora de sueldo neto** (plantilla para las 25) y **Guía** (artículo con gráfico y mini calculadora).

**Fase B (después):** página PRO, cotizador, formulario de contacto, «Sobre nosotros», aviso de cookies y aviso de sistemas a medida, estados vacíos y de error.

### Formato de entrega

- Pantallas navegables y una hoja de «tokens» con nombres de variables CSS y valores exactos, lista para trasladar a Tailwind 4 (`@theme`).
- Indica, para cada decisión importante, **por qué** evita el aspecto genérico.
- Señala qué cambió respecto a las capturas adjuntas y qué se mantuvo a propósito.
- Si algo del brief entra en conflicto con otra regla, dímelo en lugar de decidir en silencio.

---

## Después de recibir el diseño

1. Compara con `ANALISIS_DISENO_2026-11-16.md` (sección 4, tabla de patrones) y marca qué patrones desaparecieron.
2. Si convence, trabajamos en la rama `design/rediseno-profesional` por fases (0, 1 y 3 en tres calculadoras como piloto).
3. Si no convence, se descarta la rama y el sitio sigue como está, sin riesgo.
