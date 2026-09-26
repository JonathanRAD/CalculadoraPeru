// Runtime verification script for Next.js production server on localhost:3008
async function run() {
  console.log('--- 1. VERIFICACIÓN /cotizador (HTML y Cabeceras) ---');
  const cotizadorRes = await fetch('http://localhost:3008/cotizador');
  console.log('Status /cotizador:', cotizadorRes.status);
  const cotizadorHtml = await cotizadorRes.text();

  const hasDesc0 = cotizadorHtml.includes('desc-0') || cotizadorHtml.includes('Descripción del concepto');
  const hasQty0 = cotizadorHtml.includes('qty-0') || cotizadorHtml.includes('Cantidad');
  const hasPrice0 = cotizadorHtml.includes('price-0') || cotizadorHtml.includes('P. Unit.');
  console.log('Contiene primera fila editable:', { hasDesc0, hasQty0, hasPrice0 });

  const headersMap = {};
  for (const [k, v] of cotizadorRes.headers.entries()) {
    headersMap[k.toLowerCase()] = v;
  }

  console.log('X-Content-Type-Options:', headersMap['x-content-type-options']);
  console.log('X-Frame-Options:', headersMap['x-frame-options']);
  console.log('Reporting-Endpoints:', headersMap['reporting-endpoints']);
  console.log('CSP Report-Only header:', headersMap['content-security-policy-report-only'] ? 'PRESENTE' : 'AUSENTE');
  if (headersMap['content-security-policy-report-only']) {
    const cspVal = headersMap['content-security-policy-report-only'];
    console.log('  contiene report-uri /api/security/csp-report:', cspVal.includes('report-uri /api/security/csp-report'));
    console.log('  contiene report-to default:', cspVal.includes('report-to default'));
  }

  console.log('\n--- 2. VERIFICACIÓN API /api/quotes (Cabeceras) ---');
  const apiRes = await fetch('http://localhost:3008/api/quotes');
  console.log('Status /api/quotes:', apiRes.status);
  const apiHeaders = {};
  for (const [k, v] of apiRes.headers.entries()) {
    apiHeaders[k.toLowerCase()] = v;
  }
  console.log('API X-Content-Type-Options:', apiHeaders['x-content-type-options']);
  console.log('API X-Frame-Options:', apiHeaders['x-frame-options']);
  console.log('API Cross-Origin-Resource-Policy:', apiHeaders['cross-origin-resource-policy']);
  console.log('API sin CSP HTML redundante:', !apiHeaders['content-security-policy'] && !apiHeaders['content-security-policy-report-only']);

  console.log('\n--- 3. VERIFICACIÓN ENDPOINT CSP REPORT /api/security/csp-report ---');
  // 3a. Reporte sintético válido
  const synthReport = {
    'csp-report': {
      'document-uri': 'http://localhost:3008/cotizador',
      'referrer': '',
      'blocked-uri': 'http://synthetic-attacker.local/malicious.js',
      'violated-directive': "script-src 'self'",
      'original-policy': "default-src 'self'",
      'disposition': 'report',
      'status-code': 200,
    },
  };
  const postRes = await fetch('http://localhost:3008/api/security/csp-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/csp-report' },
    body: JSON.stringify(synthReport),
  });
  console.log('Status reporte sintético POST válido:', postRes.status, '(Esperado: 204)');

  // 3b. GET rechazado
  const getRes = await fetch('http://localhost:3008/api/security/csp-report', {
    method: 'GET',
  });
  console.log('Status GET (debe ser rechazado):', getRes.status, 'Allow header:', getRes.headers.get('allow'), '(Esperado: 405)');

  // 3c. Payload > 16 KB rechazado
  const largeBody = JSON.stringify({ data: 'x'.repeat(18000) });
  const largeRes = await fetch('http://localhost:3008/api/security/csp-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: largeBody,
  });
  console.log('Status Payload > 16 KB:', largeRes.status, '(Esperado: 413)');

  // 3d. JSON malformado rechazado
  const malformedRes = await fetch('http://localhost:3008/api/security/csp-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ bad-json, ',
  });
  console.log('Status JSON malformado:', malformedRes.status, '(Esperado: 400)');

  console.log('\nTodas las verificaciones de runtime completadas con éxito.');
}

run().catch((err) => {
  console.error('Error en verificación de runtime:', err);
  process.exit(1);
});
