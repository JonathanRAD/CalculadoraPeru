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
