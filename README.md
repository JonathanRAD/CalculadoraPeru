# CalculaPerú

Portal web de calculadoras financieras, comerciales, laborales y tributarias adaptadas al contexto peruano. Incluye 25 herramientas, cotizador en fase beta, exportación a PDF, tema oscuro y soporte PWA.

## Requisitos

- Node.js 20 o posterior
- npm 10 o posterior

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Verificación

```bash
npm test        # pruebas unitarias de fórmulas
npm run lint    # ESLint y reglas de React
npm run build   # compilación de producción y TypeScript
```

Antes de publicar, los tres comandos deben terminar sin errores.

## Arquitectura

- `src/app`: rutas App Router, metadata, API y páginas.
- `src/core/calculators`: funciones puras de cálculo, sin dependencias de React.
- `src/core/constants/peru.ts`: fuente única de parámetros regulatorios vigentes.
- `src/features/calculators/registry.ts`: catálogo, textos SEO, categorías y rutas.
- `src/shared`: componentes, contexto, utilidades y generación de PDF.
- `src/core/calculators/__tests__`: casos de regresión regulatorios.

Las páginas de calculadoras son interactivas en el cliente. Cada ruta tiene un layout de servidor que genera título, descripción, Open Graph y canonical individual mediante `buildCalculatorMetadata`.

## Datos regulatorios 2026

Los parámetros centralizados incluyen:

- UIT 2026: S/ 5,500.
- RMV: S/ 1,130.
- Asignación familiar: S/ 113.
- ONP: 13%.
- AFP sobre flujo: aporte, seguro y comisión publicados por la SBS para julio de 2026.
- Límites RMT calculados en UIT, no como montos fijos.

Fuentes principales:

- SUNAT: UIT, IGV, cuarta y quinta categoría y regímenes tributarios.
- MTPE/SUNAFIL: RMV y beneficios laborales.
- SBS: aportes y comisiones AFP.
- BCRPData: series SBS PD04639PD y PD04640PD para tipo de cambio bancario.

La ruta `/api/tipo-de-cambio` consulta la última publicación disponible de BCRPData. Si la fuente falla, responde con estado 503 y la interfaz solicita una tasa manual; nunca fabrica spreads ni cotizaciones.

## Actualización anual

1. Verificar UIT, RMV, asignación familiar, AFP y topes tributarios en fuentes oficiales.
2. Actualizar `src/core/constants/peru.ts`.
3. Actualizar textos visibles que incluyan el año de vigencia.
4. Añadir o ajustar casos en `regulatory-2026.test.ts`.
5. Ejecutar pruebas, lint y build.

## Variables de entorno

La calculadora pública funciona sin variables obligatorias. La integración preparada para Supabase reconoce:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Si Supabase no se utiliza, conviene retirar su cliente y dependencias antes de producción.

## Alcance

Los resultados son referenciales y no sustituyen asesoría contable, tributaria, laboral, legal o financiera profesional. Las reglas pueden depender del régimen, contrato, fecha y situación particular del usuario.
