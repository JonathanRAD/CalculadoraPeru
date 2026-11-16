import { describe, expect, it } from 'vitest';
import { GUIDES } from '../data';
import { GUIDE_VISUALS } from '../visuals';
import { GUIDE_WIDGETS, type WidgetValues } from '../widgets';

describe('gráficos de las guías', () => {
  it('cada gráfico se asocia a una sección que existe en su guía', () => {
    for (const [slug, placements] of Object.entries(GUIDE_VISUALS)) {
      const guide = GUIDES.find((item) => item.slug === slug);
      expect(guide, `la guía ${slug} no existe`).toBeDefined();
      for (const placement of placements) {
        const matches = guide?.sections.filter((section) => section.heading.startsWith(placement.sectionStartsWith)) ?? [];
        expect(matches.length, `${slug}: ninguna sección empieza con «${placement.sectionStartsWith}»`).toBe(1);
      }
    }
  });

  it('todas las cifras son finitas y no negativas', () => {
    for (const [slug, placements] of Object.entries(GUIDE_VISUALS)) {
      for (const { visual } of placements) {
        if (visual.type === 'timeline') {
          expect(visual.steps.length, slug).toBeGreaterThan(1);
          continue;
        }
        expect(visual.items.length, `${slug}: ${visual.title}`).toBeGreaterThan(1);
        for (const item of visual.items) {
          expect(Number.isFinite(item.value), `${slug}: ${item.label}`).toBe(true);
          expect(item.value, `${slug}: ${item.label}`).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('los gráficos coinciden con los ejemplos numéricos de las tablas', () => {
    const find = (slug: string, start: string) =>
      GUIDE_VISUALS[slug]?.find((placement) => placement.sectionStartsWith === start)?.visual;

    const salary = find('cuanto-me-descuentan-de-mi-sueldo', '4. Ejemplo');
    expect(salary?.type === 'stack' && salary.items.map((item) => item.value)).toEqual([2583.07, 390, 26.93]);

    const igv = find('igv-18-como-calcularlo-y-desglosarlo', '1. Sumar');
    expect(igv?.type === 'stack' && igv.items.map((item) => item.value)).toEqual([100, 18]);

    const margin = find('margen-vs-recargo-como-fijar-precio-de-venta', '1. Dos formas');
    expect(margin?.type === 'bars' && margin.items.map((item) => item.value)).toEqual([20, 25]);

    const fuel = find('cuanto-gasta-tu-auto-en-combustible-por-km', '3. Cuánto cambia');
    expect(fuel?.type === 'bars' && fuel.items.map((item) => item.value)).toEqual([360, 270, 216]);

    const grati = find('gratificacion-julio-diciembre-como-se-calcula', '5. Ejemplo B');
    expect(grati?.type === 'bars' && grati.items[1].value).toBe(1833.38);

    const pos = find('comisiones-yape-pos-como-calcular-lo-que-recibes', '2. Cuánto recibes');
    expect(pos?.type === 'bars' && pos.items.find((item) => item.label === 'Yape Empresa')?.value).toBe(96.52);
  });
});

describe('mini calculadoras de las guías', () => {
  it('cada guía con mini calculadora existe y devuelve resultados finitos con sus valores iniciales', () => {
    for (const [slug, config] of Object.entries(GUIDE_WIDGETS)) {
      expect(GUIDES.some((guide) => guide.slug === slug), `la guía ${slug} no existe`).toBe(true);
      const values: WidgetValues = Object.fromEntries(config.fields.map((field) => [field.key, field.defaultValue]));
      const rows = config.compute(values);
      expect(rows.length, slug).toBeGreaterThan(1);
      expect(rows.some((row) => row.strong), slug).toBe(true);
      for (const row of rows) {
        expect(row.value, `${slug}: ${row.label}`).not.toMatch(/NaN|Infinity/);
      }
    }
  });

  it('resisten entradas vacías, negativas o enormes sin mostrar NaN', () => {
    for (const [slug, config] of Object.entries(GUIDE_WIDGETS)) {
      for (const edge of [0, -5, Number.NaN, 1e12]) {
        const values: WidgetValues = Object.fromEntries(
          config.fields.map((field) => [field.key, field.type === 'number' ? edge : field.defaultValue]),
        );
        const rows = config.compute(values);
        for (const row of rows) {
          expect(row.value, `${slug} con ${edge}: ${row.label}`).not.toMatch(/NaN|Infinity/);
        }
      }
    }
  });

  it('el resultado inicial de sueldo neto coincide con la tabla de la guía', () => {
    const config = GUIDE_WIDGETS['cuanto-me-descuentan-de-mi-sueldo'];
    const values: WidgetValues = Object.fromEntries(config.fields.map((field) => [field.key, field.defaultValue]));
    const net = config.compute(values).find((row) => row.strong);
    expect(net?.value).toContain('2,583.07');
  });
});
