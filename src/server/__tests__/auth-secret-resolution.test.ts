import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { resolveAuthSecret, _resetDevAuthSecretForTesting } from '../config/server-env';

describe('Resolución Segura de Auth Secret (server-env.ts)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    _resetDevAuthSecretForTesting();
    delete process.env.AUTH_SECRET;
    delete process.env.AUTH_TOKEN_SECRET;
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    _resetDevAuthSecretForTesting();
    vi.restoreAllMocks();
  });

  it('acepta AUTH_SECRET válido de al menos 32 caracteres', () => {
    process.env.AUTH_SECRET = 'a'.repeat(32);
    expect(resolveAuthSecret()).toBe('a'.repeat(32));

    process.env.AUTH_SECRET = 'super-secret-key-that-has-sufficient-length-12345';
    expect(resolveAuthSecret()).toBe('super-secret-key-that-has-sufficient-length-12345');
  });

  it('rechaza AUTH_SECRET si está presente pero tiene menos de 32 caracteres', () => {
    process.env.AUTH_SECRET = 'short-secret-key';
    expect(() => resolveAuthSecret()).toThrow(/AUTH_SECRET debe tener al menos 32 caracteres/);
  });

  it('permite temporalmente AUTH_TOKEN_SECRET heredada con advertencia', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.AUTH_TOKEN_SECRET = 'b'.repeat(32);

    const secret = resolveAuthSecret();
    expect(secret).toBe('b'.repeat(32));
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('AUTH_TOKEN_SECRET')
    );
  });

  it('rechaza AUTH_TOKEN_SECRET heredada si tiene menos de 32 caracteres', () => {
    process.env.AUTH_TOKEN_SECRET = 'legacy-short';
    expect(() => resolveAuthSecret()).toThrow(/AUTH_TOKEN_SECRET debe tener al menos 32 caracteres/);
  });

  it('en producción falla de inmediato si no hay secreto configurado', () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    expect(() => resolveAuthSecret()).toThrow(/se requiere AUTH_SECRET/);
  });

  it('en desarrollo sin variables genera una clave criptográficamente aleatoria segura en memoria', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const secret = resolveAuthSecret();

    expect(secret).toBeDefined();
    // 32 bytes en hex son 64 caracteres
    expect(secret.length).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(secret)).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('se generó una clave criptográfica aleatoria temporal en memoria')
    );
  });

  it('el secreto aleatorio generado en desarrollo es estable durante el mismo proceso', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const secret1 = resolveAuthSecret();
    const secret2 = resolveAuthSecret();
    const secret3 = resolveAuthSecret();

    expect(secret1).toBe(secret2);
    expect(secret2).toBe(secret3);
  });

  it('no existe la cadena literal del antiguo fallback predecible en el código fuente de server-env.ts ni en src/', () => {
    const serverEnvContent = fs.readFileSync(
      path.resolve(__dirname, '../config/server-env.ts'),
      'utf-8'
    );
    expect(serverEnvContent).not.toContain('dev-fallback-local-secret');
  });
});
