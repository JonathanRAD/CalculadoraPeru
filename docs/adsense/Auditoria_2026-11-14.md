# Auditoría de CalculaPerú — 14 de noviembre de 2026

Motivo del rechazo de AdSense (captura del panel): **«Contenido de poco valor»**, dentro de «Hemos detectado algunas infracciones de las políticas». La verificación de propiedad del sitio figura como correcta.

Este informe separa lo que se comprobó con evidencia de lo que sigue pendiente. No garantiza la aprobación; la decisión es de Google.

## 1. Acceso y rastreo (producción, www.calculaperu.com.pe)

| Comprobación | Resultado |
|---|---|
| `calculaperu.com.pe` → `www` | Redirección de un solo salto, 200 final |
| `robots.txt`, `ads.txt`, `sitemap.xml` | 200; `Mediapartners-Google` permitido; ID de `ads.txt` coincide con el del script |
| Ruta inexistente | 404 real |
| Contenido en HTML inicial | Las guías de las calculadoras llegan en el HTML del servidor |
| `/api/tipo-de-cambio` | 200 con datos de SBS (fecha 11-nov-2026) |

## 2. Datos normativos verificados y corregidos

- **RMV S/ 1,230 y asignación familiar S/ 123** desde el 1-oct-2026 (D.S. 015-2026-TR). El sitio tenía S/ 1,130 y S/ 113: corregido en constantes, calculadoras, ejemplos, guías, README y pruebas.
- **Quinta categoría:** la bonificación extraordinaria (Ley 30334, 9 %) está afecta a este impuesto; la calculadora de sueldo neto no la incluía. Corregido y con prueba.
- **REMYPE:** CTS reducida y exclusiones aplican a trabajadores contratados *después* de la inscripción. Corregido en guías y en la FAQ de CTS.
- Confirmados contra fuentes: cuotas RUS (S/ 20 y S/ 50, límite S/ 96,000), RER (1,5 %, S/ 525,000), RMT (1 % hasta 300 UIT, 10 % y 29,5 % anual, 1,700 UIT), sobretasas de horas extras (25 % y 35 %), pago por feriado trabajado, 8 % de cuarta categoría sobre S/ 1,500.

## 3. Calidad de las calculadoras

- 342 pruebas de casos límite (cero, negativo, `NaN`, 1e12) sobre 24 funciones de cálculo: ninguna devuelve `NaN` o `Infinity` (`src/core/calculators/__tests__/edge-cases.test.ts`).
- Hallazgos corregidos: seguro de desgravamen en 0 % se reemplazaba por 0,075 %; plazo del préstamo sin tope (bucle casi infinito con valores enormes); el comparador de regímenes podía dejar la recomendación sin explicación o recomendar RMT sin cumplir el límite.
- Enlaces para compartir por WhatsApp apuntaban a `calculaperu.pe` en CTS y liquidación; ahora `calculaperu.com.pe`.

## 4. Contenido y transparencia

- 10 guías originales con ejemplos reproducibles y fuentes; página de actualizaciones; fecha de última actualización en cada calculadora; aviso de datos de referencia (combustible, comisiones, tarifa eléctrica) con fuente y fecha; sección de método en «Sobre nosotros».
- Política de privacidad: se añadieron las estadísticas propias (ruta, referrer, términos del buscador interno, tipo de dispositivo, identificador diario con hash; sin IP almacenada) y Vercel Analytics.
- Metadatos: `/pro` y `/pro/beneficios` tenían título y descripción duplicados con la portada; `/cotizador` no tenía `h1`; títulos de guías acortados. Sin enlaces internos rotos en las 49 páginas generadas.
- Redirección 301 de `calculadora-peru.vercel.app` al dominio oficial para evitar contenido duplicado.

## 5. Segunda ronda (datos aportados por el titular y verificados)

Se contrastaron con sus fuentes los datos de una investigación externa antes de aplicarlos. Resultado:

| Dato | Verificación | Acción |
|---|---|---|
| Combustible en Lima, 14-nov-2026 (Facilito vía Infobae): regular S/ 18.56–23.99, premium S/ 20.39–27.99, diésel B5 S/ 23.09–30.36 | Confirmado | Precios iniciales y ejemplo de la calculadora actualizados a puntos medios redondeados |
| Culqi 3.44 % + US$ 0.20 (sin IGV), Mercado Pago 3.49 % + S/ 1.00, Izipay 3.44 % + S/ 0.69 + IGV; Niubiz sin tasa pública (comparativo CONIT, oct-2026) | Confirmado en la fuente; el cálculo reproduce S/ 8.93 (Izipay) y S/ 7.98 (Mercado Pago) sobre S/ 200 | Calculadora con cargo fijo e IGV por operador; tabla y FAQ reescritas |
| Tarifa por kWh S/ 0.7550 (Lima Norte, sept-2026) | **No confirmado**: fuentes secundarias dan S/ 0.7217 (Pluz) y S/ 0.7051 (Luz del Sur) con IGV a julio de 2026 | Se mantiene S/ 0.72 como valor editable; la página lo señala como referencia |
| Pequeña empresa REMYPE: gratificación de media remuneración; microempresa sin gratificación | Confirmado (Buk) | Guías y calculadoras alineadas |
| Régimen MYPE no retroactivo; CTS de 15 días por año (tope 90) para MYPE | Confirmado en SUNAT (la página mezcla micro y pequeña; el detalle por régimen sigue la Ley MYPE) | Selector de contratación anterior a la inscripción en CTS, gratificación y liquidación |
| Regularización anual: RMT 10 % hasta 15 UIT y 29.5 % el exceso; General 29.5 % | Confirmado | Comparador con utilidad opcional e impuesto anual por régimen |
| Consentimiento: CMP certificada con TCF para anuncios personalizados en EEE/RU/Suiza; Consent Mode v2 | Consistente con la política de Google citada; no se probó con una CMP real | Consent Mode v2 (señales denegadas por defecto), botones Aceptar y Rechazar, enlace «Preferencias de cookies» |

## 6. Pendiente o no verificado

1. **Tasa de Niubiz:** no publica una tasa online; se muestra 3.45 % como referencia editable.
2. **Costo del cargo fijo de Culqi:** se expresa como equivalente aproximado en soles (S/ 0.68) de US$ 0.20; el mínimo de S/ 3.50 en ventas pequeñas no está modelado.
3. **Tarifa eléctrica:** verificada para Pluz Energía (Lima Norte) en su pliego vigente desde el 4-nov-2026 (energía activa BT5B residencial: 63.18 y 64.57 ctm S/kWh sin IGV, unos S/ 0.75 con IGV). El pliego de Luz del Sur (PDF) no se pudo leer; el valor es una referencia editable y no incluye cargos fijos ni alumbrado público.
4. **GLP y GNV:** los precios iniciales no se pudieron verificar con una fuente de noviembre de 2026; son referencias editables y la calculadora lo indica.
5. ~~Vacaciones y REMYPE~~: resuelto el 16-nov-2026; la calculadora distingue a los contratados antes de la inscripción.
6. **Consentimiento para el EEE:** el aviso propio no sustituye a una CMP certificada por Google. Para servir anuncios personalizados a usuarios del EEE, Reino Unido o Suiza, activa el mensaje de consentimiento europeo de Google en AdSense (Privacidad y mensajes) o integra una CMP certificada. Decisión del titular.
7. **Search Console y Bing Webmaster:** sin acceso en esta revisión.
8. **Tráfico:** unas 56 visitas diarias (Vercel Analytics, 7 días hasta el 14-nov), rebote 82 %, 1,27 páginas por visita; el 57 % llega desde Google.

## 7. Cómo repetir las comprobaciones

```bash
npm test          # incluye las pruebas de casos límite y la redirección de dominio
npm run lint
npm run build     # genera las 49 páginas auditadas
```
