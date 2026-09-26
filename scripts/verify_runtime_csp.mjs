import http from 'node:http';

const PORT = 3012;

function doRequest({ method = 'POST', path, headers = {}, chunkedChunks = null, body = null }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: { ...headers },
    };

    if (chunkedChunks) {
      // Forzar chunked transfer encoding sin Content-Length
      delete options.headers['content-length'];
      delete options.headers['Content-Length'];
      options.headers['Transfer-Encoding'] = 'chunked';
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);

    if (chunkedChunks) {
      for (const chunk of chunkedChunks) {
        req.write(chunk);
      }
      req.end();
    } else if (body) {
      req.write(body);
      req.end();
    } else {
      req.end();
    }
  });
}

async function run() {
  console.log('>>> INICIANDO PRUEBAS DE RUNTIME REALES EN PUERTO ' + PORT + ' <<<\n');

  // 1. Cuerpo excesivo chunked SIN Content-Length
  console.log('1. Verificando cuerpo excesivo chunked sin Content-Length (>16 KB)...');
  const chunk1 = Buffer.alloc(8000, 'a');
  const chunk2 = Buffer.alloc(9000, 'b'); // Total 17,000 bytes > 16,384 bytes
  const resChunked = await doRequest({
    path: '/api/security/csp-report',
    headers: { 'Content-Type': 'application/json' },
    chunkedChunks: [chunk1, chunk2],
  });
  console.log('   Status:', resChunked.statusCode, '(Esperado: 413)');
  console.log('   Cache-Control:', resChunked.headers['cache-control'], '(Esperado: no-store)');
  if (resChunked.statusCode !== 413) throw new Error('Falló verificación 413 chunked');

  // 2. JSON malformado
  console.log('\n2. Verificando JSON sintácticamente malformado...');
  const resBadJson = await doRequest({
    path: '/api/security/csp-report',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': '25',
    },
    body: '{"csp-report": { broken, ',
  });
  console.log('   Status:', resBadJson.statusCode, '(Esperado: 400)');
  console.log('   Cache-Control:', resBadJson.headers['cache-control'], '(Esperado: no-store)');
  if (resBadJson.statusCode !== 400) throw new Error('Falló verificación 400 bad JSON');

  // 3. Content-Type no admitido
  console.log('\n3. Verificando Content-Type no admitido (text/plain)...');
  const resBadCt = await doRequest({
    path: '/api/security/csp-report',
    headers: { 'Content-Type': 'text/plain' },
    body: 'plain text content',
  });
  console.log('   Status:', resBadCt.statusCode, '(Esperado: 415)');
  console.log('   Cache-Control:', resBadCt.headers['cache-control'], '(Esperado: no-store)');
  if (resBadCt.statusCode !== 415) throw new Error('Falló verificación 415 Content-Type');

  // 4. Reporte válido sintético
  console.log('\n4. Verificando reporte CSP sintético válido...');
  const validPayload = JSON.stringify({
    'csp-report': {
      'document-uri': 'https://calculaperu.pe/cotizador?token=secret123',
      'blocked-uri': 'https://evil.com/inject.js',
      'violated-directive': 'script-src',
    },
  });
  const resValid = await doRequest({
    path: '/api/security/csp-report',
    headers: {
      'Content-Type': 'application/csp-report',
      'Content-Length': String(Buffer.byteLength(validPayload)),
    },
    body: validPayload,
  });
  console.log('   Status:', resValid.statusCode, '(Esperado: 204)');
  console.log('   Cache-Control:', resValid.headers['cache-control'], '(Esperado: no-store)');
  console.log('   Body length:', resValid.body.length, '(Esperado: 0)');
  if (resValid.statusCode !== 204) throw new Error('Falló verificación 204 reporte válido');

  // 5. Exceder rate limit en runtime
  console.log('\n5. Verificando agotamiento del Rate Limit local (60 req/min)...');
  let got429 = false;
  let retryAfterHeader = null;
  for (let i = 0; i < 65; i++) {
    const res = await doRequest({
      path: '/api/security/csp-report',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '198.51.100.77', // IP única de prueba
      },
      body: JSON.stringify({ 'blocked-uri': 'eval' }),
    });

    if (res.statusCode === 429) {
      got429 = true;
      retryAfterHeader = res.headers['retry-after'];
      console.log(`   Petición #${i + 1} bloqueada con 429. Retry-After: ${retryAfterHeader}, Cache-Control: ${res.headers['cache-control']}`);
      break;
    }
  }
  if (!got429) throw new Error('Falló verificación 429 rate limit');

  // 6. Cabeceras CSP en páginas principales
  console.log('\n6. Verificando cabeceras CSP en páginas principales (/cotizador, /)...');
  const resHtml = await doRequest({
    method: 'GET',
    path: '/cotizador',
  });
  console.log('   Status /cotizador:', resHtml.statusCode);
  console.log('   X-Content-Type-Options:', resHtml.headers['x-content-type-options']);
  console.log('   X-Frame-Options:', resHtml.headers['x-frame-options']);
  console.log('   Reporting-Endpoints:', resHtml.headers['reporting-endpoints']);
  const cspHeader = resHtml.headers['content-security-policy-report-only'] || resHtml.headers['content-security-policy'];
  console.log('   CSP Header Name:', resHtml.headers['content-security-policy-report-only'] ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy');
  console.log('   Contiene report-uri /api/security/csp-report:', cspHeader?.includes('report-uri /api/security/csp-report'));
  console.log('   Contiene report-to default:', cspHeader?.includes('report-to default'));

  // 7. Cabeceras API en /api/quotes
  console.log('\n7. Verificando cabeceras de endurecimiento en API (/api/quotes)...');
  const resApi = await doRequest({
    method: 'GET',
    path: '/api/quotes',
  });
  console.log('   Status /api/quotes:', resApi.statusCode);
  console.log('   API X-Content-Type-Options:', resApi.headers['x-content-type-options']);
  console.log('   API Cross-Origin-Resource-Policy:', resApi.headers['cross-origin-resource-policy']);
  console.log('   API sin CSP HTML redundante:', !resApi.headers['content-security-policy'] && !resApi.headers['content-security-policy-report-only']);

  console.log('\n>>> TODAS LAS PRUEBAS RUNTIME COMPLETADAS EXITOSAMENTE <<<');
}

run().catch((err) => {
  console.error('Error durante la prueba runtime:', err);
  process.exit(1);
});
