import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as logout } from '@/app/api/auth/logout/route';
import { authService } from '../services/auth.service';
import { readJsonBody, RequestBodyError } from '../validators/request-body';
import { userRepository } from '../repositories/user.repository';

describe('Protección de sesión y solicitudes', () => {
  it('firma la versión de sesión y rechaza firmas alteradas', () => {
    const token = authService.signToken({ userId: 'test-user', email: 'test@example.com', role: 'user', sessionVersion: 3 });
    expect(authService.verifyToken(token)?.sessionVersion).toBe(3);
    expect(authService.verifyToken(`${token.slice(0, -1)}x`)).toBeNull();
  });

  it('expira cookies actuales y antiguas al cerrar sesión', async () => {
    const request = new NextRequest('https://www.calculaperu.com.pe/api/auth/logout', { method: 'POST' });
    const response = await logout(request);
    expect(response.status).toBe(200);
    const cookies = response.headers.get('set-cookie') || '';
    expect(cookies).toContain('calculaperu_auth_token=;');
    expect(cookies).toContain('calculaperu_pro_active=;');
    expect(cookies).toContain('Domain=.calculaperu.com.pe');
  });

  it('invalida en servidor el token anterior al cerrar sesión', async () => {
    const account = {
      id: 'logout-test', email: 'logout@example.com', name: 'Prueba', passwordHash: '', salt: '',
      role: 'user' as const, isPro: false, createdAt: new Date().toISOString(), sessionVersion: 0,
    };
    const token = authService.signToken({ userId: account.id, email: account.email, role: 'user', sessionVersion: 0 });
    const findSpy = vi.spyOn(userRepository, 'findById').mockImplementation(async () => account);
    const updateSpy = vi.spyOn(userRepository, 'update').mockImplementation(async (_id, updates) => {
      account.sessionVersion = updates.sessionVersion ?? account.sessionVersion;
      return authService.toSafeUser(account);
    });
    try {
      const request = new NextRequest('https://www.calculaperu.com.pe/api/auth/logout', {
        method: 'POST', headers: { cookie: `calculaperu_auth_token=${token}` },
      });
      expect((await logout(request)).status).toBe(200);
      expect(account.sessionVersion).toBe(1);
      expect(await authService.authenticateRequest(request)).toBeNull();
    } finally {
      findSpy.mockRestore();
      updateSpy.mockRestore();
    }
  });

  it('limita el tamaño de JSON incluso sin Content-Length', async () => {
    const request = new Request('https://example.com/api', {
      method: 'POST', body: JSON.stringify({ payload: 'x'.repeat(200) }),
    });
    await expect(readJsonBody(request, 50)).rejects.toMatchObject({ status: 413 } satisfies Partial<RequestBodyError>);
  });
});
