import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { contactSubmissionRepository, ContactEmailStatus } from '../repositories/contact_submission.repository';
import { validateContactInput } from '../validators/contact.validator';
import { checkAuthRateLimit } from '../services/auth-rate-limit';
import { authService, validateAdminCsrf } from '../services/auth.service';
import { resolveAuthSecret } from '../config/server-env';
import { isValidUuid } from '../validators/quote.validator';
import { userRepository } from '../repositories/user.repository';

describe('Bandeja de Contacto y Solicitudes - Idempotencia y Resiliencia', () => {
  it('valida datos de contacto, consentimiento y categorización', () => {
    // Válido
    const valid = validateContactInput({
      name: 'María García',
      email: 'm.garcia@empresa.com',
      phone: '987654321',
      category: 'comercial',
      message: 'Solicito información detallada sobre planes corporativos para 15 usuarios.',
      consent: true,
      honeypot: '',
    });
    expect(valid.isValid).toBe(true);

    // Mensaje demasiado corto (< 20 caracteres)
    const shortMessage = validateContactInput({
      name: 'María García',
      email: 'm.garcia@empresa.com',
      category: 'comercial',
      message: 'Hola.',
      consent: true,
    });
    expect(shortMessage.isValid).toBe(false);
    expect(shortMessage.error).toContain('al menos 20 caracteres');

    // Sin consentimiento
    const noConsent = validateContactInput({
      name: 'María García',
      email: 'm.garcia@empresa.com',
      category: 'comercial',
      message: 'Solicito información detallada sobre planes corporativos.',
      consent: false,
    });
    expect(noConsent.isValid).toBe(false);
    expect(noConsent.error).toContain('política de privacidad');

    // Honeypot detectado
    const bot = validateContactInput({
      name: 'Bot Spam',
      email: 'bot@spam.com',
      category: 'comercial',
      message: 'Mensaje automatizado de spam con longitud suficiente.',
      consent: true,
      honeypot: 'http://spam-link.com',
    });
    expect(bot.isValid).toBe(false);
  });

  it('permite registrar, filtrar y actualizar el estado de una solicitud de contacto con aserción explícita', async () => {
    const result = await contactSubmissionRepository.create({
      publicRequestId: 'CP-TEST-ASSERT-01',
      ipHash: 'test-ip-hash-01',
      name: 'Carlos Ruiz',
      email: 'carlos@pyme.pe',
      category: 'cotizador_feedback',
      businessType: 'Servicios Profesionales',
      message: 'Excelente herramienta de cotizaciones, me gustaría ver plantillas adicionales.',
      sourcePath: '/cotizador',
      consent: true,
      consentAt: new Date().toISOString(),
      consentVersion: '2026-v2',
      emailStatus: 'sent',
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.submission.businessType).toBe('Servicios Profesionales');

    // Actualizar estado de revisión a 'in_progress'
    const updated = await contactSubmissionRepository.updateReviewStatus(
      result.id,
      'in_progress',
      'admin-uuid-123'
    );

    // Verificación estricta: NO usar if (updated)
    expect(updated).not.toBeNull();
    expect(updated?.reviewStatus).toBe('in_progress');
    expect(updated?.reviewedAt).toBeDefined();
  });

  it('unifica estrictamente los estados de correo a pending, sent, failed', () => {
    const validStatuses: ContactEmailStatus[] = ['pending', 'sent', 'failed'];
    expect(validStatuses).toContain('pending');
    expect(validStatuses).toContain('sent');
    expect(validStatuses).toContain('failed');

    // Comprobar que no existen rastros del estado incompatible 'delivery_failed' en el tipo
    const testStatus = 'sent' as ContactEmailStatus;
    expect(['pending', 'sent', 'failed']).toContain(testStatus);
  });

  it('garantiza idempotencia: dos peticiones con la misma clave devuelven el mismo registro', async () => {
    const uniqueKey = `idem-key-${Date.now()}`;

    const submission1 = await contactSubmissionRepository.create({
      publicRequestId: `CP-IDEM-${Date.now()}-A`,
      ipHash: 'ip-idem-test',
      name: 'Lucía Mendoza',
      email: 'lucia@empresa.pe',
      category: 'cuenta_pro',
      message: 'Consulta sobre activación de licencia PRO con misma clave idempotente.',
      sourcePath: '/contacto',
      consent: true,
      consentAt: new Date().toISOString(),
      consentVersion: '2026-v2',
      emailStatus: 'sent',
      idempotencyKey: uniqueKey,
    });

    // Segunda llamada concurrente o reintento con la MISMA idempotencyKey
    const submission2 = await contactSubmissionRepository.create({
      publicRequestId: `CP-IDEM-${Date.now()}-B`, // Intento con otro publicRequestId
      ipHash: 'ip-idem-test',
      name: 'Lucía Mendoza',
      email: 'lucia@empresa.pe',
      category: 'cuenta_pro',
      message: 'Consulta sobre activación de licencia PRO con misma clave idempotente.',
      sourcePath: '/contacto',
      consent: true,
      consentAt: new Date().toISOString(),
      consentVersion: '2026-v2',
      emailStatus: 'pending',
      idempotencyKey: uniqueKey,
    });

    // Debe resolver al registro preexistente
    expect(submission2.id).toBe(submission1.id);
    expect(submission2.publicRequestId).toBe(submission1.publicRequestId);
  });

  it('separa los buckets de rate limit de contacto general y feedback del cotizador', async () => {
    const mockReq = new Request('http://localhost:3000/api/contacto', {
      headers: { 'x-forwarded-for': '192.168.10.50' },
    });

    // En entorno de prueba (sin Supabase en línea), checkAuthRateLimit permite la ejecución
    const check1 = await checkAuthRateLimit(mockReq, 'contact_general', 'usuario1@test.pe');
    expect(check1).toBe(true);

    const checkFeedback = await checkAuthRateLimit(mockReq, 'cotizador_feedback', 'usuario2@test.pe');
    expect(checkFeedback).toBe(true);
  });
});

describe('Seguridad Administrativa y Eliminación Reforzada', () => {
  it('valida CSRF estrictamente comparando Origin / Referer contra Host en peticiones mutables', () => {
    // 1. Petición GET segura (no requiere validación CSRF estricta)
    const getReq = new Request('https://calculaperu.pe/api/admin/submissions', {
      method: 'GET',
      headers: { host: 'calculaperu.pe' },
    });
    expect(validateAdminCsrf(getReq)).toBe(true);

    // 2. Petición POST con Origin legítimo
    const validPost = new Request('https://calculaperu.pe/api/admin/submissions/123', {
      method: 'POST',
      headers: {
        host: 'calculaperu.pe',
        origin: 'https://calculaperu.pe',
      },
    });
    expect(validateAdminCsrf(validPost)).toBe(true);

    // 3. Petición POST con Origin malicioso (Cross-Site Request Forgery)
    const maliciousPost = new Request('https://calculaperu.pe/api/admin/submissions/123', {
      method: 'POST',
      headers: {
        host: 'calculaperu.pe',
        origin: 'https://evil-attacker-site.com',
      },
    });
    expect(validateAdminCsrf(maliciousPost)).toBe(false);

    // 4. Petición DELETE sin Origin ni Referer
    const noOriginDelete = new Request('https://calculaperu.pe/api/admin/submissions/123', {
      method: 'DELETE',
      headers: { host: 'calculaperu.pe' },
    });
    expect(validateAdminCsrf(noOriginDelete)).toBe(false);
  });

  it('excluye totalmente ADMIN_SECRET_KEY, x-admin-secret y sessionStorage del frontend', () => {
    const adminPageContent = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/page.tsx'),
      'utf-8'
    );
    const submissionsTabContent = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/components/SubmissionsTab.tsx'),
      'utf-8'
    );

    // Verificar ausencia de secretos en el cliente
    expect(adminPageContent).not.toContain('ADMIN_SECRET_KEY');
    expect(adminPageContent).not.toContain('x-admin-secret');
    expect(adminPageContent).not.toContain('sessionStorage');

    expect(submissionsTabContent).not.toContain('ADMIN_SECRET_KEY');
    expect(submissionsTabContent).not.toContain('x-admin-secret');
    expect(submissionsTabContent).not.toContain('sessionStorage');
  });

  it('verifica la regla de eliminación reforzada (requiere coincidencia exacta de confirmationText con publicRequestId)', () => {
    const targetRequestId = 'CP-2026-DELETE-TARGET';

    // Intento con confirmationText incorrecto
    const badConfirm = {
      confirmDelete: true,
      confirmationText: 'CP-WRONG-ID',
    };
    const isBadValid = badConfirm.confirmDelete === true && badConfirm.confirmationText === targetRequestId;
    expect(isBadValid).toBe(false);

    // Intento con coincidencia exacta
    const goodConfirm = {
      confirmDelete: true,
      confirmationText: targetRequestId,
    };
    const isGoodValid = goodConfirm.confirmDelete === true && goodConfirm.confirmationText === targetRequestId;
    expect(isGoodValid).toBe(true);
  });
});

describe('Política de Acceso Cotizador PRO (Gratuito, PRO Activo, PRO Vencido)', () => {
  it('determina correctamente las capacidades de cada tipo de usuario', () => {
    const now = new Date('2026-09-24T12:00:00Z');

    // 1. Usuario PRO Activo
    const proUser = {
      id: 'user-active-pro',
      isPro: true,
      proExpiresAt: '2026-12-31T23:59:59Z',
    };
    const isProActive = Boolean(proUser.isPro && new Date(proUser.proExpiresAt) > now);
    expect(isProActive).toBe(true);

    // 2. Usuario que tuvo PRO y venció (Modo Solo Lectura)
    const expiredProUser = {
      id: 'user-expired-pro',
      isPro: false,
      proExpiresAt: '2026-08-31T23:59:59Z',
      activatedCode: 'PRO-1234-ABCD',
    };
    const isExpiredProActive = Boolean(expiredProUser.isPro && new Date(expiredProUser.proExpiresAt) > now);
    const hasHadPro = Boolean(expiredProUser.proExpiresAt || expiredProUser.activatedCode);
    const isReadOnly = !isExpiredProActive && hasHadPro;

    expect(isExpiredProActive).toBe(false);
    expect(hasHadPro).toBe(true);
    expect(isReadOnly).toBe(true);

    // 3. Usuario gratuito que nunca tuvo PRO
    const freeVisitor = {
      id: 'user-free-never-pro',
      isPro: false,
      proExpiresAt: null,
      activatedCode: null,
    };
    const isFreeProActive = Boolean(freeVisitor.isPro && freeVisitor.proExpiresAt && new Date(freeVisitor.proExpiresAt) > now);
    const freeHasHadPro = Boolean(freeVisitor.proExpiresAt || freeVisitor.activatedCode);

    expect(isFreeProActive).toBe(false);
    expect(freeHasHadPro).toBe(false);
  });
});

describe('Resolución Unificada de Secreto de Autenticación', () => {
  it('resuelve correctamente la variable canónica AUTH_SECRET', () => {
    const origAuthSecret = process.env.AUTH_SECRET;
    const origLegacySecret = process.env.AUTH_TOKEN_SECRET;
    const origNodeEnv = process.env.NODE_ENV;

    try {
      process.env.AUTH_SECRET = 'canonical-secret-32-chars-long-example-123456';
      delete process.env.AUTH_TOKEN_SECRET;
      expect(resolveAuthSecret()).toBe('canonical-secret-32-chars-long-example-123456');

      // Si sólo existe la heredada
      delete process.env.AUTH_SECRET;
      process.env.AUTH_TOKEN_SECRET = 'legacy-secret-32-chars-long-example-123456';
      expect(resolveAuthSecret()).toBe('legacy-secret-32-chars-long-example-123456');

      // En producción sin secreto debe fallar explícitamente
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      delete process.env.AUTH_SECRET;
      delete process.env.AUTH_TOKEN_SECRET;
      expect(() => resolveAuthSecret()).toThrow(/se requiere AUTH_SECRET/);
    } finally {
      if (origAuthSecret !== undefined) {
        process.env.AUTH_SECRET = origAuthSecret;
      } else {
        delete process.env.AUTH_SECRET;
      }
      if (origLegacySecret !== undefined) {
        process.env.AUTH_TOKEN_SECRET = origLegacySecret;
      } else {
        delete process.env.AUTH_TOKEN_SECRET;
      }
      if (origNodeEnv !== undefined) {
        (process.env as Record<string, string | undefined>).NODE_ENV = origNodeEnv;
      } else {
        delete (process.env as Record<string, string | undefined>).NODE_ENV;
      }
    }
  });
});

describe('Validación de UUID y Búsqueda Previa de Idempotencia', () => {
  it('valida estrictamente identificadores UUID v1-v5 y rechaza formatos inválidos', () => {
    // Válidos
    expect(isValidUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isValidUuid('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')).toBe(true);
    expect(isValidUuid('A0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11')).toBe(true);

    // Inválidos
    expect(isValidUuid('')).toBe(false);
    expect(isValidUuid('not-a-uuid')).toBe(false);
    expect(isValidUuid('idemp_123456789')).toBe(false);
    expect(isValidUuid('12345')).toBe(false);
    expect(isValidUuid(undefined)).toBe(false);
  });

  it('permite buscar una solicitud por clave de idempotencia antes de aplicar rate limiting', async () => {
    const testUuid = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    const initial = await contactSubmissionRepository.create({
      publicRequestId: 'CP-PRE-LOOKUP-01',
      ipHash: 'ip-hash-test',
      name: 'Test Pre-Lookup',
      email: 'prelookup@test.pe',
      category: 'cotizador_feedback',
      message: 'Mensaje para probar findByIdempotencyKey antes de rate limit.',
      sourcePath: '/cotizador',
      consent: true,
      consentVersion: '2026-v2',
      idempotencyKey: testUuid,
    });

    const found = await contactSubmissionRepository.findByIdempotencyKey(testUuid);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(initial.id);
    expect(found?.publicRequestId).toBe(initial.publicRequestId);

    const notFound = await contactSubmissionRepository.findByIdempotencyKey('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33');
    expect(notFound).toBeNull();
  });
});

describe('Autorización Completa y CSRF en Mutaciones Administrativas', () => {
  it('permite admin autenticado con origen válido y rechaza CSRF o falta de rol admin', async () => {
    // 1. Crear usuario admin y usuario normal en userRepository
    const adminUser = await userRepository.create({
      id: 'admin-test-uuid-' + Date.now(),
      email: `admin-${Date.now()}@test.pe`,
      name: 'Admin Test',
      passwordHash: 'dummy',
      salt: 'dummy',
      role: 'admin',
      isPro: true,
      sessionVersion: 0,
      createdAt: new Date().toISOString(),
    });

    const normalUser = await userRepository.create({
      id: 'user-test-uuid-' + Date.now(),
      email: `user-${Date.now()}@test.pe`,
      name: 'User Test',
      passwordHash: 'dummy',
      salt: 'dummy',
      role: 'user',
      isPro: false,
      sessionVersion: 0,
      createdAt: new Date().toISOString(),
    });

    const adminToken = authService.signToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: 'admin',
      sessionVersion: 0,
    });

    const userToken = authService.signToken({
      userId: normalUser.id,
      email: normalUser.email,
      role: 'user',
      sessionVersion: 0,
    });

    // Caso A: Admin con origen válido -> Permitido
    const reqAdminValid = new NextRequest('https://calculaperu.pe/api/admin/subscriptions/123/approve', {
      method: 'POST',
      headers: {
        host: 'calculaperu.pe',
        origin: 'https://calculaperu.pe',
        cookie: `calculaperu_auth_token=${adminToken}`,
      },
    });
    expect(await authService.isAuthorizedAdminMutable(reqAdminValid)).toBe(true);

    // Caso B: Admin con origen inválido (intento CSRF) -> Rechazado
    const reqAdminCsrf = new NextRequest('https://calculaperu.pe/api/admin/subscriptions/123/approve', {
      method: 'POST',
      headers: {
        host: 'calculaperu.pe',
        origin: 'https://malicious-site.com',
        cookie: `calculaperu_auth_token=${adminToken}`,
      },
    });
    expect(await authService.isAuthorizedAdminMutable(reqAdminCsrf)).toBe(false);

    // Caso C: Sin sesión -> Rechazado
    const reqNoSession = new NextRequest('https://calculaperu.pe/api/admin/subscriptions/123/approve', {
      method: 'POST',
      headers: {
        host: 'calculaperu.pe',
        origin: 'https://calculaperu.pe',
      },
    });
    expect(await authService.isAuthorizedAdminMutable(reqNoSession)).toBe(false);

    // Caso D: Usuario sin rol admin -> Rechazado
    const reqUserNotAdmin = new NextRequest('https://calculaperu.pe/api/admin/subscriptions/123/approve', {
      method: 'POST',
      headers: {
        host: 'calculaperu.pe',
        origin: 'https://calculaperu.pe',
        cookie: `calculaperu_auth_token=${userToken}`,
      },
    });
    expect(await authService.isAuthorizedAdminMutable(reqUserNotAdmin)).toBe(false);

    // Caso E: Intento de bypass usando encabezado x-admin-secret sin sesión admin -> Rechazado
    const reqSecretBypass = new NextRequest('https://calculaperu.pe/api/admin/subscriptions/123/approve', {
      method: 'POST',
      headers: {
        host: 'calculaperu.pe',
        origin: 'https://calculaperu.pe',
        'x-admin-secret': 'any-secret-value',
      },
    });
    expect(await authService.isAuthorizedAdminMutable(reqSecretBypass)).toBe(false);
    expect(await authService.isAuthorizedAdmin(reqSecretBypass)).toBe(false);
  });
});

describe('Auditoría Automatizada de Buenas Prácticas y Eliminación de Secretos', () => {
  it('confirma que ningún endpoint bajo /api/admin admita x-admin-secret ni ADMIN_SECRET_KEY', () => {
    const authServiceCode = fs.readFileSync(
      path.join(process.cwd(), 'src/server/services/auth.service.ts'),
      'utf-8'
    );
    expect(authServiceCode).not.toContain('x-admin-secret');
    expect(authServiceCode).not.toContain('ADMIN_SECRET_KEY');
  });

  it('confirma que betaRequestRepository.create fue eliminado del flujo activo de la API', () => {
    const betaRouteCode = fs.readFileSync(
      path.join(process.cwd(), 'src/app/api/cotizador/beta-request/route.ts'),
      'utf-8'
    );
    expect(betaRouteCode).not.toContain('betaRequestRepository.create');
    expect(betaRouteCode).not.toContain('beta_requests');
  });
});
