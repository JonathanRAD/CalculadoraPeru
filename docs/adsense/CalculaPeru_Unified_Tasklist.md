# CalculaPerú — Plan Unificado de Tareas (AdSense, Rediseño y SEO)

Fecha: 21 de septiembre de 2026  
Sitio: https://www.calculaperu.com.pe/  
Estado de AdSense: Rechazado por "Contenido de poco valor" (Propiedad ya verificada en Search Console).  
Enfoque: Calidad real, utilidad demostrable, exactitud de cálculos, transparencia editorial y experiencia de usuario.

---

## 1. Problemas Identificados y Estado de Ejecución

| ID | Área | Descripción y Evidencia | Acción Aplicada / Solución | Estado |
|---|---|---|---|---|
| **BUG-01** | Cálculos / AdSense | En `/sueldo-neto`, el formulario utilizaba S/ 113 de Asignación Familiar mientras el ejemplo práctico de la guía citaba S/ 102.50 y tasas desactualizadas. | Actualizado el ejemplo ilustrativo con parámetros 2026 (RMV S/ 1,130, Asignación Familiar de S/ 113.00), aporte previsional AFP Integra (12.92% flujo = -S/ 402.20 / 11.37% mixta = -S/ 353.95), 5ta categoría referencial (8% = -S/ 33.88) y neto estimado de S/ 2,676.92. Coherencia matemática con el motor de cálculo. | **Corregido y Verificado con Tests** |
| **BUG-02** | Confianza / Legal | En `/sobre-nosotros`, se prometía "cálculos 100% exactos con validez matemática absoluta", lo cual entraba en contradicción con el descargo de responsabilidad referencial del pie de página. | Rediseñada la narrativa: fundamentada en normativa oficial (SUNAT, SBS, MTPE, Osinergmin), señalando su naturaleza de simulación referencial transparente e identificando formalmente a Jonathan Rujel como desarrollador y responsable del mantenimiento técnico. | **Corregido y Verificado** |
| **BUG-03** | Privacidad / AdSense | En `/politica-de-privacidad`, solo se describía una lista de espera antigua de Formspree y no reflejaba el formulario real de `/contacto` ni el manejo de cuentas o cookies de AdSense. | Actualizada la sección 4 de privacidad detallando los 3 canales de interacción reales: (1) Formulario de contacto vía Resend, (2) suscripción voluntaria de novedades del cotizador, (3) cuentas y credenciales encriptadas de usuarios PRO. Se ratifica que las operaciones de cálculo se procesan localmente sin persistir datos financieros en servidores. | **Corregido y Verificado** |
| **BUG-04** | Transparencia / AdSense | En `/cotizador`, la página carecía de metadatos propios en `layout.tsx` (heredando título genérico), y el ticket de muestra utilizaba un RUC real y título ambiguo. | Creado `src/app/cotizador/layout.tsx` con título y metadatos descriptivos (`Cotizador Comercial para MYPES (Demo Interactiva)`). Actualizada la cabecera del ticket para rotularlo inequívocamente como `SIMULACIÓN ILUSTRATIVA N° 00142` con RUC ficticio de demostración. | **Corregido y Verificado** |
| **BUG-05** | Técnico / Rastreadores | En `robots.ts`, no había reglas específicas para el rastreador publicitario de AdSense (`Mediapartners-Google`) ni exclusión de rutas administrativas privadas (`/admin`, `/api`). | Actualizado `src/app/robots.ts` permitiendo explícitamente el acceso de Googlebot y `Mediapartners-Google` a todo el contenido público, a la vez que se bloquean `/admin/*` y `/api/*` para preservar el crawl budget y la seguridad. | **Corregido y Verificado** |
| **BUG-06** | UI / Truncamiento | En resoluciones intermedias o montos elevados, el resultado monetario principal en algunas calculadoras podía contraerse con puntos suspensivos ("S/ 2,177..."). | Eliminada la clase `truncate` de cifras monetarias principales en la totalidad de las 25+ calculadoras del registro. Aplicado `tabular-nums font-mono break-words leading-tight` con escalado dinámico fluido sin cortes en ningún viewport. | **Corregido y Verificado en Código** |
| **BUG-07** | UI / Dirección Visual del Hero | El hero centrado anterior consumía excesivo espacio vertical y carecía de anclaje de identidad local. | Reorganizada la composición: alineación a la izquierda (título, descripción, `HomeSearch` con atajo `⌘K` y accesos directos), integración a la derecha de fotografía peruana (`/machu_pichu.jpg`) con degradados suaves hacia el fondo, reducción vertical de aproximadamente 28% y ocultamiento selectivo en móvil (`hidden lg:block`) para proteger LCP y visibilidad inmediata de herramientas. | **Implementado (Pendiente Revisión Visual)** |
| **BUG-08** | Normativa 2026 / Coherencia | En `/gratificacion`, `/calculadora-cts` y `/calculadora-vacaciones`, los ejemplos ilustrativos y FAQs contenían referencias a la asignación familiar antigua de S/ 102.50. | Actualizados todos los ejemplos didácticos a la RMV 2026 (S/ 1,130) con Asignación Familiar de S/ 113.00, recalculando bases computables, sextos de gratificación, bonos extraordinarios y depósitos de CTS con exactitud al céntimo. | **Corregido y Verificado con Tests** |
| **BUG-09** | Contenido Delgado / AdSense | Varias calculadoras comerciales y utilitarias (`punto-de-equilibrio`, `margen-de-ganancia`, `ventas-necesarias`, `recuperacion-de-inversion`, `costeo-recetas`, `descuentos-y-ofertas`, `ganancia-por-producto`, `consumo-electrico`, `gasto-combustible`, `dividir-cuenta`, `porcentajes`) tenían menos de 2 párrafos y carecían de tablas o fórmulas. | Enriquecidas todas con guías didácticas completas: marcos normativos peruanos (SUNAT, SBS, INDECOPI, Osinergmin), fórmulas matemáticas detalladas, ejemplos numéricos ilustrativos con tablas HTML estructuradas y entre 4 y 5 preguntas frecuentes exhaustivas. | **Corregido y Verificado en Código** |
| **BUG-10** | SEO / Schema JSON-LD | Las páginas de calculadora no emitían Schema estructurado para motores de búsqueda. | Enriquecido `CalculatorShell` para inyectar schemas estructurados JSON-LD `WebApplication` y `FAQPage` en cada calculadora, calificando al sitio para la eventual elegibilidad de resultados enriquecidos (rich snippets), cuya visualización final queda sujeta a la discreción algorítmica de Google. | **Corregido y Verificado en Código** |

---

## 2. Recomendaciones Técnicas y Editoriales (Ejecutadas)

1. **Arquitectura y Conservación de URLs (SEO)**:
   - Se mantienen intactas las 25 URLs de calculadoras existentes en `CALCULATORS_REGISTRY`.
   - Se generó el inventario completo en `docs/seo/inventario.csv` (33 rutas totales indexables verificadas con HTTP 200).
   - Se completó la matriz de mapeo de intención de búsqueda en `docs/seo/mapa-consultas.csv`.
2. **Presentación Publicitaria Segura (AdSense)**:
   - Mantener al menos 80px de separación entre cualquier anuncio y los botones de acción principal (`Calcular`, `Exportar PDF`, `Copiar`).
   - Exclusión de anuncios en páginas no aptas: pantallas de confirmación, errores 404, modales de inicio de sesión y dashboard administrativo.
3. **Calidad de Fuentes y Desglose**:
   - Cada calculadora dispone de base normativa y legal explícita (Decretos Supremos, Resoluciones de Superintendencia, Leyes de El Peruano) con enlaces institucionales.

---

## 3. Estado de Comprobaciones: Realizadas vs. Pendientes

### Comprobaciones Realizadas
* **Pruebas Automatizadas Unitarias**: 33 de 33 tests aprobados (`regulatory-2026`, `subscription`, `backend-architecture`).
* **Compilación de Producción**: 58 rutas estáticas y dinámicas compiladas exitosamente con `npm run build` sin errores tipográficos ni advertencias.
* **Verificación de Red Local**: Rutas públicas y de desarrollo (`/`, `/?hero=no-image`, `/dev/hero-preview`) responden con código de estado HTTP 200.
* **Validación Normativa**: Tasas tributarias (IGV 18%, UIT 2026 S/ 5,500) y laborales (RMV S/ 1,130, Asignación Familiar S/ 113.00) contrastadas contra fuentes oficiales.

### Comprobaciones Pendientes (Requieren Revisión Manual del Usuario en Navegador)
* **Inspección Visual del Hero**: Debido a restricciones del entorno headless en Windows (los ejecutables del navegador no generan capturas de pantalla automáticas en procesos aislados), la verificación visual estética debe ser realizada por el usuario.
* **Pasos para la revisión visual**:
  1. Abrir en el navegador local: `http://localhost:3000` (Hero con foto peruana).
  2. Abrir en el navegador local: `http://localhost:3000/dev/hero-preview` (Comparativa lado a lado y conmutador de variantes).
  3. Abrir en el navegador local: `http://localhost:3000/?hero=no-image` (Variante minimalista sin imagen).
  4. Probar en tamaño escritorio (≥ 1024px) y móvil (< 768px), alternando entre modo claro y modo oscuro para verificar legibilidad y ausencia de superposiciones.
* **Seguimiento Post-Despliegue**:
  - Cruce de datos reales de Google Search Console una vez publicado.
  - Verificación de registros de acceso del bot `Mediapartners-Google`.
  - **No solicitar revisión en AdSense hasta concluir la revisión visual manual y la aprobación definitiva.**
