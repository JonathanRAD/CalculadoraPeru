import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as contactPost } from '@/app/api/contacto/route';
import { POST as betaRequestPost } from '@/app/api/cotizador/beta-request/route';
import { contactSubmissionRepository, ContactSubmissionRecord } from '@/server/repositories/contact_submission.repository';
import * as authRateLimit from '@/server/services/auth-rate-limit';
import { notificationEmailService } from '@/server/services/notification-email.service';
import { NextRequest } from 'next/server';

describe('Pruebas HTTP Reales de Endpoints e Idempotencia (/api/contacto y /api/cotizador/beta-request)', () => {
  const sampleUuid = 'c8b211f4-5f40-4229-873b-e06e788bc559';
  const sampleSubmission: ContactSubmissionRecord = {
    id: '11111111-1111-1111-1111-111111111111',
    publicRequestId: 'CP-12345678',
    name: 'Juan Perez',
    email: 'juan@calculaperu.pe',
    phone: '987654321',
    category: 'consulta_general',
    message: 'Mensaje de prueba con más de veinte caracteres necesarios.',
    sourcePath: '/contacto',
    consent: true,
    consentAt: new Date().toISOString(),
    consentVersion: '2026-v2',
    reviewStatus: 'pending',
    emailStatus: 'sent',
    idempotencyKey: sampleUuid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // SUITE 1: /api/contacto
  // ============================================================================
  describe('POST /api/contacto', () => {
    const validContactPayload = {
      name: 'Juan Perez',
      email: 'juan@calculaperu.pe',
      phone: '987654321',
      category: 'consulta_general',
      message: 'Mensaje de prueba con más de veinte caracteres necesarios.',
      consent: true,
      idempotencyKey: sampleUuid,
    };

    it('Caso 1: Primera solicitud válida aplica rate limit, persiste, intenta notificación y devuelve requestId', async () => {
      const rateLimitSpy = vi.spyOn(authRateLimit, 'checkAuthRateLimit').mockResolvedValue(true);
      const findIdemSpy = vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(null);
      const createSpy = vi.spyOn(contactSubmissionRepository, 'create').mockResolvedValue({
        success: true,
        id: sampleSubmission.id,
        publicRequestId: 'CP-NEWREQ01',
        isDuplicate: false,
        submission: sampleSubmission,
      });
      const sendEmailSpy = vi.spyOn(notificationEmailService, 'sendAdminNotification').mockResolvedValue({
        success: true,
        messageId: 'resend-msg-123',
      });
      const updateEmailSpy = vi.spyOn(contactSubmissionRepository, 'updateEmailStatus').mockResolvedValue({} as ContactSubmissionRecord);

      const req = new Request('http://localhost:3000/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactPayload),
      });

      const res = await contactPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.requestId).toBe('CP-NEWREQ01');
      expect(json.emailStatus).toBe('sent');

      expect(findIdemSpy).toHaveBeenCalledWith(sampleUuid);
      expect(rateLimitSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      expect(updateEmailSpy).toHaveBeenCalledWith(sampleSubmission.id, 'sent', 'resend-msg-123', undefined);
    });

    it('Caso 2: Reintento con el mismo UUID recupera registro, no re-evalúa rate limit, no crea otro registro ni reenvía correo', async () => {
      const rateLimitSpy = vi.spyOn(authRateLimit, 'checkAuthRateLimit');
      const createSpy = vi.spyOn(contactSubmissionRepository, 'create');
      const sendEmailSpy = vi.spyOn(notificationEmailService, 'sendAdminNotification');
      const findIdemSpy = vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(sampleSubmission);

      const req = new Request('http://localhost:3000/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactPayload),
      });

      const res = await contactPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.requestId).toBe('CP-12345678');
      expect(findIdemSpy).toHaveBeenCalledWith(sampleUuid);
      expect(rateLimitSpy).not.toHaveBeenCalled();
      expect(createSpy).not.toHaveBeenCalled();
      expect(sendEmailSpy).not.toHaveBeenCalled();
    });

    it('Caso 3: Condición de carrera (búsqueda previa no encuentra, inserción retorna 23505/isDuplicate), recupera registro y no envía segundo correo', async () => {
      vi.spyOn(authRateLimit, 'checkAuthRateLimit').mockResolvedValue(true);
      vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(null);
      const createSpy = vi.spyOn(contactSubmissionRepository, 'create').mockResolvedValue({
        success: true,
        id: sampleSubmission.id,
        publicRequestId: 'CP-12345678',
        isDuplicate: true,
        submission: sampleSubmission,
      });
      const sendEmailSpy = vi.spyOn(notificationEmailService, 'sendAdminNotification');

      const req = new Request('http://localhost:3000/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactPayload),
      });

      const res = await contactPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.requestId).toBe('CP-12345678');
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(sendEmailSpy).not.toHaveBeenCalled();
    });

    it('Caso 4: Rate limit agotado para solicitud nueva responde 429, no persiste y no envía correo', async () => {
      vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(null);
      const rateLimitSpy = vi.spyOn(authRateLimit, 'checkAuthRateLimit').mockResolvedValue(false);
      const createSpy = vi.spyOn(contactSubmissionRepository, 'create');
      const sendEmailSpy = vi.spyOn(notificationEmailService, 'sendAdminNotification');

      const req = new Request('http://localhost:3000/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactPayload),
      });

      const res = await contactPost(req);
      const json = await res.json();

      expect(res.status).toBe(429);
      expect(json.error).toMatch(/límite de envíos/);
      expect(rateLimitSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).not.toHaveBeenCalled();
      expect(sendEmailSpy).not.toHaveBeenCalled();
    });

    it('Caso 5: Reintento idempotente después de alcanzar límite devuelve registro anterior sin responder 429', async () => {
      vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(sampleSubmission);
      const rateLimitSpy = vi.spyOn(authRateLimit, 'checkAuthRateLimit');

      const req = new Request('http://localhost:3000/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactPayload),
      });

      const res = await contactPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.requestId).toBe('CP-12345678');
      expect(rateLimitSpy).not.toHaveBeenCalled();
    });

    it('Caso 6: UUID inválido responde 400', async () => {
      const req = new Request('http://localhost:3000/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validContactPayload,
          idempotencyKey: 'not-a-valid-uuid-format',
        }),
      });

      const res = await contactPost(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/formato UUID válido/);
    });

    it('Caso 7: Fallo de persistencia responde 503, no afirma recepción y no intenta Resend', async () => {
      vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(null);
      vi.spyOn(authRateLimit, 'checkAuthRateLimit').mockResolvedValue(true);
      vi.spyOn(contactSubmissionRepository, 'create').mockRejectedValue(new Error('DB Connection Timeout'));
      const sendEmailSpy = vi.spyOn(notificationEmailService, 'sendAdminNotification');

      const req = new Request('http://localhost:3000/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactPayload),
      });

      const res = await contactPost(req);
      const json = await res.json();

      expect(res.status).toBe(503);
      expect(json.error).toMatch(/No fue posible registrar tu consulta/);
      expect(sendEmailSpy).not.toHaveBeenCalled();
    });

    it('Caso 8: Persistencia exitosa y fallo de Resend conserva la solicitud, actualiza email_status a failed y devuelve éxito con advertencia honesta', async () => {
      vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(null);
      vi.spyOn(authRateLimit, 'checkAuthRateLimit').mockResolvedValue(true);
      vi.spyOn(contactSubmissionRepository, 'create').mockResolvedValue({
        success: true,
        id: sampleSubmission.id,
        publicRequestId: 'CP-SAFE8888',
        isDuplicate: false,
        submission: sampleSubmission,
      });
      vi.spyOn(notificationEmailService, 'sendAdminNotification').mockResolvedValue({
        success: false,
        errorCode: 'RESEND_API_ERROR',
      });
      const updateEmailSpy = vi.spyOn(contactSubmissionRepository, 'updateEmailStatus').mockResolvedValue({} as ContactSubmissionRecord);

      const req = new Request('http://localhost:3000/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactPayload),
      });

      const res = await contactPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.requestId).toBe('CP-SAFE8888');
      expect(json.emailStatus).toBe('failed');
      expect(json.warning).toMatch(/notificación interna está pendiente/);
      expect(updateEmailSpy).toHaveBeenCalledWith(sampleSubmission.id, 'failed', undefined, 'RESEND_API_ERROR');
    });

    it('Caso 9: Fallo al actualizar email_status no pierde la solicitud ni devuelve un 500 confuso', async () => {
      vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(null);
      vi.spyOn(authRateLimit, 'checkAuthRateLimit').mockResolvedValue(true);
      vi.spyOn(contactSubmissionRepository, 'create').mockResolvedValue({
        success: true,
        id: sampleSubmission.id,
        publicRequestId: 'CP-RESILIENT',
        isDuplicate: false,
        submission: sampleSubmission,
      });
      vi.spyOn(notificationEmailService, 'sendAdminNotification').mockResolvedValue({
        success: true,
        messageId: 'msg-ok',
      });
      vi.spyOn(contactSubmissionRepository, 'updateEmailStatus').mockRejectedValue(new Error('Update failed'));

      const req = new Request('http://localhost:3000/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactPayload),
      });

      const res = await contactPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.requestId).toBe('CP-RESILIENT');
      expect(json.warning).toMatch(/pendiente de actualización/);
    });

    it('Caso 10: Reutilización de clave de idempotencia con correo sustancialmente distinto responde 409 Conflict', async () => {
      vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(sampleSubmission);

      const req = new Request('http://localhost:3000/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validContactPayload,
          email: 'otro-usuario-distinto@calculaperu.pe',
        }),
      });

      const res = await contactPost(req);
      const json = await res.json();

      expect(res.status).toBe(409);
      expect(json.error).toMatch(/Conflicto de idempotencia/);
    });
  });

  // ============================================================================
  // SUITE 2: /api/cotizador/beta-request
  // ============================================================================
  describe('POST /api/cotizador/beta-request', () => {
    const validBetaPayload = {
      email: 'beta@calculaperu.pe',
      phone: '999888777',
      businessType: 'servicios',
      featureNeeded: 'Exportación a PDF con logo personalizado.',
      consent: true,
      consentTextVersion: '2026-v2',
      idempotencyKey: sampleUuid,
    };

    const betaSubmission: ContactSubmissionRecord = {
      ...sampleSubmission,
      id: '22222222-2222-2222-2222-222222222222',
      publicRequestId: 'CP-BETA0001',
      email: 'beta@calculaperu.pe',
      category: 'cotizador_feedback',
    };

    it('Caso 1: Primera solicitud beta válida persiste, notifica y devuelve requestId', async () => {
      vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(null);
      vi.spyOn(authRateLimit, 'checkAuthRateLimit').mockResolvedValue(true);
      vi.spyOn(contactSubmissionRepository, 'create').mockResolvedValue({
        success: true,
        id: betaSubmission.id,
        publicRequestId: 'CP-BETA0001',
        isDuplicate: false,
        submission: betaSubmission,
      });
      vi.spyOn(notificationEmailService, 'sendAdminNotification').mockResolvedValue({
        success: true,
        messageId: 'beta-resend-id',
      });
      vi.spyOn(contactSubmissionRepository, 'updateEmailStatus').mockResolvedValue({} as ContactSubmissionRecord);

      const req = new NextRequest('http://localhost:3000/api/cotizador/beta-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBetaPayload),
      });

      const res = await betaRequestPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.requestId).toBe('CP-BETA0001');
    });

    it('Caso 2: Reintento con el mismo UUID en beta-request devuelve registro previo sin reenviar', async () => {
      vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(betaSubmission);
      const sendEmailSpy = vi.spyOn(notificationEmailService, 'sendAdminNotification');

      const req = new NextRequest('http://localhost:3000/api/cotizador/beta-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBetaPayload),
      });

      const res = await betaRequestPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.isDuplicate).toBe(true);
      expect(json.requestId).toBe('CP-BETA0001');
      expect(sendEmailSpy).not.toHaveBeenCalled();
    });

    it('Caso 3: Rate limit agotado en beta-request responde 429', async () => {
      vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(null);
      vi.spyOn(authRateLimit, 'checkAuthRateLimit').mockResolvedValue(false);

      const req = new NextRequest('http://localhost:3000/api/cotizador/beta-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBetaPayload),
      });

      const res = await betaRequestPost(req);
      const json = await res.json();

      expect(res.status).toBe(429);
      expect(json.message).toMatch(/Demasiadas solicitudes/);
    });

    it('Caso 4: UUID inválido en beta-request responde 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/cotizador/beta-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validBetaPayload,
          idempotencyKey: 'invalid-uuid-syntax',
        }),
      });

      const res = await betaRequestPost(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.message).toMatch(/formato UUID válido/);
    });

    it('Caso 5: Reutilización de idempotencyKey con correo distinto en beta-request responde 409', async () => {
      vi.spyOn(contactSubmissionRepository, 'findByIdempotencyKey').mockResolvedValue(betaSubmission);

      const req = new NextRequest('http://localhost:3000/api/cotizador/beta-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validBetaPayload,
          email: 'otro-email-en-beta@calculaperu.pe',
        }),
      });

      const res = await betaRequestPost(req);
      const json = await res.json();

      expect(res.status).toBe(409);
      expect(json.error).toMatch(/Conflicto de idempotencia/);
    });
  });
});
