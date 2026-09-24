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

Las calculadoras públicas funcionan sin cuenta ni variables obligatorias. Para habilitar cuentas, guardado, PRO, métricas y limitación de intentos en producción se requiere una base de datos Supabase persistente:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
AUTH_SECRET=
ADMIN_SECRET_KEY=
RESEND_API_KEY=
PRO_PROMO_CODES=
```

`SUPABASE_SERVICE_ROLE_KEY` puede utilizarse en lugar de `SUPABASE_SECRET_KEY`. Mantén estas claves solo en variables del servidor, nunca con prefijo `NEXT_PUBLIC_`. `AUTH_SECRET` debe ser aleatorio y estable entre despliegues; cambiarlo invalida todas las sesiones. `PRO_PROMO_CODES` es opcional: lista de códigos gratuitos separados por comas. Sin esa variable no se aceptan cupones. La solicitud de pago siempre calcula el importe en el servidor.

Antes de desplegar esta actualización sobre una base existente, ejecuta [migrate_session_security.sql](src/server/db/migrate_session_security.sql) en el SQL Editor de Supabase. Añade `session_version`, el limitador de intentos y el canje atómico de licencias. Después prueba inicio/cierre de sesión, canje PRO, formulario de contacto y búsqueda del inicio. Si la migración falta, esas operaciones fallan de forma explícita en vez de aparentar que se guardaron localmente. El modo local de desarrollo sigue disponible cuando Supabase no está configurado; no es persistencia válida para producción.

Para crear o rotar la cuenta administradora, `scripts/setup_admin.mjs` exige `SETUP_ADMIN_EMAIL` y `SETUP_ADMIN_PASSWORD` (mínimo 16 caracteres). Las credenciales antiguas que pudieran haberse usado antes de este cambio deben rotarse; quitar una clave del código no revoca contraseñas ya desplegadas.

## Alcance

Los resultados son referenciales y no sustituyen asesoría contable, tributaria, laboral, legal o financiera profesional. Las reglas pueden depender del régimen, contrato, fecha y situación particular del usuario.
