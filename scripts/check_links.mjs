// Comprueba que las fuentes oficiales citadas en el sitio abren (requiere red).
// Uso: npm run check:links
//
// Lee las URL de src/core/constants/official-sources.ts y de los enlaces externos
// escritos directamente en las páginas, y reporta las que no responden con 2xx/3xx.
// Las marcadas `blocksBots: true` se omiten porque abren en navegador pero rechazan robots.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function listFiles(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      listFiles(full, found);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

const skipHosts = [
  'localhost', 'schema.org', 'w3.org', 'calculaperu.com.pe', 'googletagmanager.com', 'googlesyndication.com',
  'google-analytics.com', 'vercel-insights.com', 'vercel-scripts.com', 'vercel.live', 'vercel.app', 'wa.me',
  'whatsapp.com', 'doubleclick.net', 'gstatic.com', 'googleapis.com', 'supabase', 'resend', 'analytics.google.com',
  'calculaperu.pe', 'malicious', 'attacker', 'evil', 'trusted.com', 'spam-link', 'example.com',
];

const urls = new Map(); // url -> origen
const blocked = new Set();

// 1) Registro central
const registry = fs.readFileSync(path.join(ROOT, 'src/core/constants/official-sources.ts'), 'utf8');
for (const block of registry.matchAll(/url:\s*'(https:\/\/[^']+)'(,\s*blocksBots:\s*true)?/g)) {
  urls.set(block[1], 'official-sources.ts');
  if (block[2]) blocked.add(block[1]);
}

// 2) Enlaces escritos directamente en el código
for (const file of listFiles(path.join(ROOT, 'src'))) {
  if (file.endsWith('official-sources.ts')) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const match of content.matchAll(/https?:\/\/[^\s"'`<>)\\{}$]+/g)) {
    const url = match[0].replace(/[.,;]+$/, '');
    if (skipHosts.some((host) => url.includes(host)) || url.includes('@')) continue;
    if (!urls.has(url)) urls.set(url, path.relative(ROOT, file));
  }
}

// Textos con los que muchos sitios muestran un error aunque respondan 200 ("soft 404").
const SOFT_404 = [
  /p[aá]gina no encontrada/i,
  /no pudimos encontrar la p[aá]gina/i,
  /error\s*404/i,
  /page not found/i,
  /404\s*[-–|:]\s*(not found|no encontrad)/i,
  /el contenido que buscas no (existe|est[aá] disponible)/i,
  /no se (ha )?encontr[oó] (la|el) (p[aá]gina|recurso|contenido)/i,
];

async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      // HEAD no permite revisar el contenido: solo se usa para descartar rápido los errores HTTP.
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': UA, Accept: 'text/html,application/pdf,*/*' },
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok) return { ok: false, status: response.status, finalUrl: response.url };

      const type = response.headers.get('content-type') || '';
      if (/html/i.test(type)) {
        const body = (await response.text()).slice(0, 400000);
        const title = (body.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '';
        const visible = body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
        const soft = SOFT_404.find((pattern) => pattern.test(title) || pattern.test(visible.slice(0, 6000)));
        if (soft) return { ok: false, status: 'soft 404', finalUrl: response.url, title: title.trim() };
        return { ok: true, status: response.status, finalUrl: response.url, title: title.trim() };
      }
      return { ok: true, status: response.status, finalUrl: response.url, title: type };
    } catch (error) {
      if (method === 'GET') return { ok: false, status: String(error.cause?.code || error.message) };
    }
  }
  return { ok: false, status: 'sin respuesta' };
}

let failures = 0;
for (const [url, origin] of urls) {
  if (blocked.has(url)) {
    console.log(`OMITIDO  ${url}  (bloquea robots; verificar en navegador)`);
    continue;
  }
  const result = await check(url);
  if (result.ok) {
    const needsReview = !result.title;
    console.log(`${needsReview ? 'REVISAR' : 'OK'} ${result.status}  ${url}  «${(result.title || '').slice(0, 70)}»${needsReview ? '  (sin título: abrirla en un navegador)' : ''}`);
  } else {
    failures += 1;
    console.log(`FALLA ${result.status}  ${url}  (${origin})${result.title ? `  «${result.title.slice(0, 60)}»` : ''}`);
  }
}

console.log(failures === 0 ? '\nTodas las fuentes responden.' : `\n${failures} fuente(s) con problemas.`);
process.exit(failures === 0 ? 0 : 1);
