import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { RETIRED_URLS, SOURCES } from '../official-sources';

const SRC_ROOT = path.resolve(__dirname, '../../..');

function listFiles(dir: string, found: string[] = []): string[] {
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

describe('fuentes oficiales', () => {
  const entries = Object.entries(SOURCES);

  it('todas usan https, tienen etiqueta y no son la portada de una entidad', () => {
    for (const [key, source] of entries) {
      const url = new URL(source.url);
      expect(url.protocol, key).toBe('https:');
      expect(source.label.length, key).toBeGreaterThan(10);
      // Una fuente debe apuntar a una página concreta, no a la raíz del sitio.
      if (!('rootIsTool' in source && source.rootIsTool)) {
        expect(url.pathname.length, `${key} apunta a una portada`).toBeGreaterThan(1);
      }
    }
  });

  it('no repiten URL', () => {
    const urls = entries.map(([, source]) => source.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('ningún archivo del sitio usa un enlace retirado (404 o portada genérica)', () => {
    const offenders: string[] = [];
    for (const file of listFiles(SRC_ROOT)) {
      if (file.endsWith('official-sources.ts')) continue;
      const content = fs.readFileSync(file, 'utf8');
      for (const retired of RETIRED_URLS) {
        // Coincide con la URL completa (con o sin barra final), no con prefijos de otras páginas
        const pattern = new RegExp(`${retired.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?(?=['"\`\\s)<])`);
        if (pattern.test(content)) offenders.push(`${path.relative(SRC_ROOT, file)} → ${retired}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
