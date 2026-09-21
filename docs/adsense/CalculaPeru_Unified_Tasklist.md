# CalculaPerú — Plan Unificado de Tareas (AdSense, Rediseño y SEO)

Fecha: 21 de septiembre de 2026  
Sitio: https://www.calculaperu.com.pe/  
Estado de AdSense: Rechazado por "Contenido de poco valor" (Propiedad ya verificada en Search Console).  
Enfoque: Calidad real, utilidad demostrable, exactitud de cálculos, transparencia editorial y experiencia de usuario.

---

## 1. Problemas Comprobados (Bugs e Inconsistencias Resueltas / En Ejecución)

| ID | Área | Descripción y Evidencia | Acción Aplicada / Solución | Estado |
|---|---|---|---|---|
| **BUG-01** | Cálculos / AdSense | En `/sueldo-neto`, el formulario utilizaba S/ 113 de Asignación Familiar mientras el ejemplo práctico de la guía citaba S/ 102.50 y tasas desactualizadas. | Actualizado el caso práctico con RMV 2026 (S/ 1,130), Asignación Familiar de S/ 113.00, aporte previsional AFP Integra (12.92% flujo = -S/ 402.20 / 11.37% mixta = -S/ 353.95), 5ta categoría (8% = -S/ 33.88) y neto exacto (S/ 2,676.92). Coherencia 100% con el motor de cálculo. | **Corregido y Verificado** |
| **BUG-02** | Confianza / Legal | En `/sobre-nosotros`, se prometía "cálculos 100% exactos con validez matemática absoluta", lo cual entraba en contradicción con el descargo de responsabilidad referencial del pie de página. | Rediseñada la narrativa: fundamentada en normativa oficial (SUNAT, SBS, MTPE, Osinergmin), señalando su naturaleza de simulación referencial transparente e identificando formalmente a Jonathan Rujel como desarrollador y responsable del mantenimiento técnico. | **Corregido y Verificado** |
| **BUG-03** | Privacidad / AdSense | En `/politica-de-privacidad`, solo se describía una lista de espera antigua de Formspree y no reflejaba el formulario real de `/contacto` ni el manejo de cuentas o cookies de AdSense. | Actualizada la sección 4 de privacidad detallando los 3 canales de interacción reales: (1) Formulario de contacto vía Resend, (2) suscripción voluntaria de novedades del cotizador, (3) cuentas y credenciales encriptadas de usuarios PRO. Se ratifica que las operaciones de cálculo se procesan localmente sin persistir datos financieros. | **Corregido y Verificado** |
| **BUG-04** | Transparencia / AdSense | En `/cotizador`, la página carecía de metadatos propios en `layout.tsx` (heredando título genérico), y el ticket de muestra utilizaba un RUC real y título ambiguo. | Creado `src/app/cotizador/layout.tsx` con título y metadatos descriptivos (`Cotizador Comercial para MYPES (Demo Interactiva)`). Actualizada la cabecera del ticket para rotularlo inequívocamente como `SIMULACIÓN ILUSTRATIVA N° 00142` con RUC ficticio de demostración. | **Corregido y Verificado** |
| **BUG-05** | Técnico / Rastreadores | En `robots.ts`, no había reglas específicas para el rastreador publicitario de AdSense (`Mediapartners-Google`) ni exclusión de rutas administrativas privadas (`/admin`, `/api`). | Actualizado `src/app/robots.ts` permitiendo explícitamente el acceso de Googlebot y `Mediapartners-Google` a todo el contenido público, a la vez que se bloquean `/admin/*` y `/api/*` para preservar el crawl budget y la seguridad. | **Corregido y Verificado** |
| **BUG-06** | UI / Truncamiento | En resoluciones intermedias o montos elevados, el resultado monetario principal en algunas calculadoras podía contraerse con puntos suspensivos ("S/ 2,177..."). | Eliminada la clase `truncate` de cifras monetarias principales en todas las calculadoras prioritarias (`/sueldo-neto`, `/calculadora-cts`, `/gratificacion`, `/liquidacion-laboral`, `/horas-extras`, `/calculadora-vacaciones`, `/calculadora-igv`). Aplicado `tabular-nums font-mono break-words leading-tight` con escalado dinámico fluido. | **Corregido y Verificado** |
| **BUG-07** | UI / Sobrecarga Visual | La portada anterior incluía una fotografía de Machu Picchu de baja legibilidad y tarjetas con fotos de stock que alargaban el scroll. | Implementada la Propuesta A aprobada: Hero limpio centrado en búsqueda (`HomeSearch` protagónico con atajo de teclado), 6 filtros de navegación rápida, 6 calculadoras destacadas en tarjetas compactas y directorio estructurado de 4 categorías temáticas. | **Corregido y Verificado** |
| **BUG-08** | Normativa 2026 / Coherencia | En `/gratificacion`, `/calculadora-cts` y `/calculadora-vacaciones`, los ejemplos numéricos y FAQs contenían referencias a la asignación familiar antigua de S/ 102.50. | Actualizados todos los ejemplos prácticos paso a paso a la RMV 2026 (S/ 1,130) con Asignación Familiar de S/ 113.00, recalculando matemáticamente las bases computables, sextos de gratificación, bonos extraordinarios y depósitos de CTS con exactitud al céntimo. | **Corregido y Verificado** |

---

## 2. Recomendaciones Técnicas y Editoriales (En Progreso)

1. **Arquitectura y Conservación de URLs (SEO)**:
   - Se mantienen intactas las 25 URLs de calculadoras existentes en `CALCULATORS_REGISTRY`.
   - Se generó el inventario completo en `docs/seo/inventario.csv` (33 rutas totales indexables).
   - Se completó la matriz de mapeo de intención de búsqueda en `docs/seo/mapa-consultas.csv`.
2. **Presentación Publicitaria Segura (AdSense)**:
   - Mantener al menos 80px de separación entre cualquier anuncio y los botones de acción principal (`Calcular`, `Exportar PDF`, `Copiar`).
   - Exclusión de anuncios en páginas no aptas: pantallas de confirmación, errores 404, modales de inicio de sesión y dashboard administrativo.
3. **Calidad de Fuentes y Desglose**:
   - Cada calculadora prioritaria (Sueldo Neto, CTS, Gratificación, Liquidación, Horas Extras, IGV, Tipo de Cambio) dispone de base legal explícita (Decretos Supremos, Leyes publicadas en El Peruano) con enlaces institucionales.

---

## 3. Aspectos Pendientes de Verificar / Información Faltante

1. **Acceso a Google Search Console**:
   - Si el titular dispone de exportación de Search Console (últimos 3 meses, clics/impresiones en Perú), se cruzará con `docs/seo/mapa-consultas.csv` para priorizar palabras clave con impresiones reales.
2. **Historial del Panel de AdSense**:
   - Se requiere confirmar la fecha del último rechazo y si el panel muestra algún detalle adicional además de "Contenido de poco valor".
   - Recordatorio: **No solicitar nueva revisión en AdSense hasta que el rediseño esté aprobado, implementado y probado localmente**.
3. **Mediapartners-Google en Producción**:
   - Tras el despliegue autorizado, se verificará en los logs del servidor la llegada y respuesta 200 de las solicitudes del bot de AdSense.
