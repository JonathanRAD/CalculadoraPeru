import { describe, it, expect } from 'vitest';
import { validateCreateSubscriptionInput } from '../validators/subscription.validator';
import { subscriptionService } from '../services/subscription.service';
import { subscriptionRequestRepository } from '../repositories/subscription_request.repository';

describe('Subscription Requests & Payment Flow (Yape / Plin)', () => {
  describe('Subscription Validator', () => {
    it('debe rechazar solicitudes con campos incompletos o inválidos', () => {
      // Missing name
      const res1 = validateCreateSubscriptionInput({
        customerName: '',
        customerEmail: 'test@example.com',
        customerPhone: '987654321',
        operationCode: '123456',
      });
      expect(res1.isValid).toBe(false);
      expect(res1.error).toContain('nombre');

      // Invalid email
      const res2 = validateCreateSubscriptionInput({
        customerName: 'Juan Perez',
        customerEmail: 'invalido',
        customerPhone: '987654321',
        operationCode: '123456',
      });
      expect(res2.isValid).toBe(false);
      expect(res2.error).toContain('correo');

      // Invalid phone
      const res3 = validateCreateSubscriptionInput({
        customerName: 'Juan Perez',
        customerEmail: 'juan@test.pe',
        customerPhone: '123',
        operationCode: '123456',
      });
      expect(res3.isValid).toBe(false);
      expect(res3.error).toContain('celular');

      // Missing operation code
      const res4 = validateCreateSubscriptionInput({
        customerName: 'Juan Perez',
        customerEmail: 'juan@test.pe',
        customerPhone: '987654321',
        operationCode: '',
      });
      expect(res4.isValid).toBe(false);
      expect(res4.error).toContain('operación');
    });

    it('debe aceptar datos válidos y calcular montos correspondientes a S/ 16 y S/ 149', () => {
      const resMonthly = validateCreateSubscriptionInput({
        customerName: 'Juan Carlos',
        customerEmail: 'juan@test.pe',
        customerPhone: '913544715',
        plan: 'monthly',
        operationCode: 'OP-482910',
      });
      expect(resMonthly.isValid).toBe(true);
      expect(resMonthly.data?.plan).toBe('monthly');
      expect(resMonthly.data?.amount).toBe(16);

      const resYearly = validateCreateSubscriptionInput({
        customerName: 'Empresa Test',
        customerEmail: 'admin@empresa.pe',
        customerPhone: '913544715',
        plan: 'yearly',
        operationCode: 'OP-998877',
      });
      expect(resYearly.isValid).toBe(true);
      expect(resYearly.data?.plan).toBe('yearly');
      expect(resYearly.data?.amount).toBe(149);

      const forged = validateCreateSubscriptionInput({
        customerName: 'Empresa Test', customerEmail: 'admin@empresa.pe', customerPhone: '913544715',
        plan: 'yearly', operationCode: 'OP-998877', amount: 0,
      });
      expect(forged.data?.amount).toBe(149);
      expect(validateCreateSubscriptionInput({
        customerName: 'Empresa Test', customerEmail: 'admin@empresa.pe', customerPhone: '913544715',
        plan: 'yearly', operationCode: 'OP-998877', couponCode: 'CODIGO-INVENTADO',
      }).isValid).toBe(false);
    });
  });

  describe('Subscription Service & Flow', () => {
    it('debe crear una solicitud en estado pendiente', async () => {
      const req = await subscriptionService.createRequest({
        customerName: 'Cliente Test Yape',
        customerEmail: 'yape@cliente.pe',
        customerPhone: '999888777',
        plan: 'yearly',
        amount: 149,
        operationCode: `TEST-OP-${Date.now()}`,
      });

      expect(req.id).toBeDefined();
      expect(req.status).toBe('pending');
      expect(req.amount).toBe(149);
      expect(req.customerName).toBe('Cliente Test Yape');

      const found = await subscriptionRequestRepository.findById(req.id);
      expect(found).not.toBeNull();
      expect(found?.operationCode).toBe(req.operationCode);
    });

    it('debe aprobar la solicitud, generar licencia PRO y retornar link de WhatsApp', async () => {
      const req = await subscriptionService.createRequest({
        customerName: 'María García',
        customerEmail: 'maria@garcia.pe',
        customerPhone: '912345678',
        plan: 'monthly',
        amount: 16,
        operationCode: `TEST-OP-${Date.now()}-2`,
      });

      const approval = await subscriptionService.approveRequest(req.id, 'Admin Test');

      expect(approval.success).toBe(true);
      expect(approval.licenseCode).toMatch(/^PRO-/);
      expect(approval.subscription?.status).toBe('approved');
      expect(approval.whatsappUrl).toContain('wa.me/51912345678');
      expect(approval.whatsappUrl).toContain(encodeURIComponent(approval.licenseCode || ''));

      // Verify status persisted
      const persisted = await subscriptionRequestRepository.findById(req.id);
      expect(persisted?.status).toBe('approved');
      expect(persisted?.generatedLicenseCode).toBe(approval.licenseCode);
    });

    it('debe permitir rechazar una solicitud con motivo', async () => {
      const req = await subscriptionService.createRequest({
        customerName: 'Pedro Malo',
        customerEmail: 'pedro@fake.pe',
        customerPhone: '955443322',
        plan: 'monthly',
        amount: 16,
        operationCode: `TEST-FAKE-${Date.now()}`,
      });

      const rejectResult = await subscriptionService.rejectRequest(
        req.id,
        'Admin Test',
        'Operación no figura en el extracto de Yape'
      );

      expect(rejectResult.success).toBe(true);
      expect(rejectResult.subscription?.status).toBe('rejected');
      expect(rejectResult.subscription?.notes).toBe('Operación no figura en el extracto de Yape');
    });
  });
});
