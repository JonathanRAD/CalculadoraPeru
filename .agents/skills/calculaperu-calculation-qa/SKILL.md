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
