import fs from 'fs';
import path from 'path';
import { CALCULATORS_REGISTRY } from '../src/features/calculators/registry';

const staticPages = [
  { slug: '/', title: 'Calculadoras Perú 2026: sueldo, IGV, negocios y finanzas', type: 'Portada', category: 'General' },
  { slug: '/cotizador', title: 'Cotizador Comercial para MYPES (Demo Interactiva)', type: 'Herramienta Demo', category: 'Negocios' },
  { slug: '/pro', title: 'CalculaPerú PRO: suite para negocios y profesionales', type: 'Suscripción PRO', category: 'General' },
  { slug: '/pro/beneficios', title: 'Beneficios y Guía de Calculadoras PRO', type: 'Guía PRO', category: 'General' },
  { slug: '/sobre-nosotros', title: 'Sobre Nosotros y Contacto', type: 'Institucional', category: 'General' },
  { slug: '/contacto', title: 'Contacto y Soporte', type: 'Soporte', category: 'General' },
  { slug: '/politica-de-privacidad', title: 'Política de Privacidad', type: 'Legal', category: 'General' },
  { slug: '/terminos-y-condiciones', title: 'Términos y Condiciones', type: 'Legal', category: 'General' },
];

const rows = [
  'URL,Tipo,Categoria,Title,Estado_HTTP,Canonical,Robots,Indexable',
  ...staticPages.map(
    (p) =>
      `https://www.calculaperu.com.pe${p.slug},${p.type},${p.category},"${p.title} | CalculaPerú",200 OK,https://www.calculaperu.com.pe${p.slug},index follow,Si`
  ),
  ...CALCULATORS_REGISTRY.map(
    (c) =>
      `https://www.calculaperu.com.pe${c.slug},Calculadora,${c.category},"${c.title} | CalculaPerú",200 OK,https://www.calculaperu.com.pe${c.slug},index follow,Si`
  ),
];

const targetPath = path.resolve(process.cwd(), 'docs/seo/inventario.csv');
fs.writeFileSync(targetPath, rows.join('\n'), 'utf-8');
console.log('Generated inventario.csv successfully with', rows.length - 1, 'routes');
