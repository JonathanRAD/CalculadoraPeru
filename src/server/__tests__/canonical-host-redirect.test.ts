import { describe, expect, it } from 'vitest';
import nextConfig from '../../../next.config';

describe('redirección al dominio canónico', () => {
  it('redirige permanentemente el alias de vercel.app al dominio oficial', async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toBeDefined();
    const rule = redirects?.find((item) => item.has?.some((condition) => condition.type === 'host'));

    expect(rule).toBeDefined();
    expect(rule?.permanent).toBe(true);
    expect(rule?.destination).toBe('https://www.calculaperu.com.pe/:path*');
    expect(rule?.has).toEqual([{ type: 'host', value: 'calculadora-peru.vercel.app' }]);
  });

  it('no redirige el dominio oficial hacia sí mismo', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    const matchesOfficial = redirects.some((item) =>
      item.has?.some((condition) => condition.type === 'host' && condition.value === 'www.calculaperu.com.pe'),
    );
    expect(matchesOfficial).toBe(false);
  });
});
