import { describe, it, expect } from 'vitest';
import { validateCreateLicenseInput, validateRedeemLicenseInput } from '../validators/license.validator';
import { validateLoginInput, validateRegisterInput, validateCompanyProfileInput } from '../validators/auth.validator';
import { licenseService } from '../services/license.service';
import { authService } from '../services/auth.service';

describe('Backend Clean Architecture - Validators & Services', () => {
  describe('License Validator', () => {
    it('debe rechazar la creación de licencia sin nombre de cliente', () => {
      const result = validateCreateLicenseInput({ plan: 'yearly', clientName: '' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('obligatorio');
    });

    it('debe aceptar y normalizar datos válidos de creación de licencia', () => {
      const result = validateCreateLicenseInput({
        plan: 'monthly',
        clientName: 'Estudio Contable SAC',
        clientEmail: 'contacto@estudio.pe',
      });
      expect(result.isValid).toBe(true);
      expect(result.data?.plan).toBe('monthly');
      expect(result.data?.clientName).toBe('Estudio Contable SAC');
    });

    it('debe validar códigos de activación en el canje', () => {
      const invalid = validateRedeemLicenseInput({ code: '' });
      expect(invalid.isValid).toBe(false);

      const valid = validateRedeemLicenseInput({ code: 'PRO-TEST-1234' });
      expect(valid.isValid).toBe(true);
      expect(valid.data?.code).toBe('PRO-TEST-1234');
    });
  });

  describe('Auth Validator', () => {
    it('debe validar correos y contraseñas en login', () => {
      expect(validateLoginInput({ email: 'invalido', password: '123' }).isValid).toBe(false);
      expect(validateLoginInput({ email: 'admin@calculaperu.pe', password: 'password123' }).isValid).toBe(true);
    });

    it('debe exigir contraseñas seguras (8+ chars, mayúscula, minúscula, número) en el registro', () => {
      // Too short
      expect(validateRegisterInput({ name: 'Juan', email: 'juan@test.pe', password: 'Ab1' }).isValid).toBe(false);
      // Missing uppercase
      expect(validateRegisterInput({ name: 'Juan', email: 'juan@test.pe', password: 'password123' }).isValid).toBe(false);
      // Missing number
      expect(validateRegisterInput({ name: 'Juan', email: 'juan@test.pe', password: 'PasswordSegura' }).isValid).toBe(false);
      // Valid strong password
      expect(validateRegisterInput({ name: 'Juan', email: 'juan@test.pe', password: 'Password123' }).isValid).toBe(true);
    });

    it('debe validar RUC peruano válido de 11 dígitos iniciando en 10 o 20', () => {
      expect(validateCompanyProfileInput({ companyRuc: '123456' }).isValid).toBe(false);
      expect(validateCompanyProfileInput({ companyRuc: '20601234567' }).isValid).toBe(true);
    });
  });

  describe('Auth Service', () => {
    it('debe autenticar exitosamente la cuenta de administrador', async () => {
      const result = await authService.login({
        email: 'rujeljonathan4@gmail.com',
        password: 'Elmaspro_123',
      });

      expect(result.success).toBe(true);
      expect(result.user?.role).toBe('admin');
      expect(result.user?.isPro).toBe(true);
      expect(result.token).toBeDefined();
    });

    it('debe rechazar contraseña incorrecta', async () => {
      const result = await authService.login({
        email: 'rujeljonathan4@gmail.com',
        password: 'PasswordIncorrecto123',
      });

      expect(result.success).toBe(false);
    });
  });


  describe('License Service', () => {
    it('debe emitir una licencia válida con código único y duración correcta', async () => {
      const licenseYearly = await licenseService.issueLicense({
        plan: 'yearly',
        clientName: 'Empresa Test SAC',
      });

      expect(licenseYearly.code).toMatch(/^PRO-/);
      expect(licenseYearly.durationDays).toBe(365);
      expect(licenseYearly.status).toBe('available');

      const licenseMonthly = await licenseService.issueLicense({
        plan: 'monthly',
        clientName: 'Consultor Individual',
      });
      expect(licenseMonthly.durationDays).toBe(30);
    });

    it('debe canjear una licencia y no permitir volver a canjearla', async () => {
      const license = await licenseService.issueLicense({
        plan: 'monthly',
        clientName: 'Cliente Canje',
      });

      const firstRedeem = await licenseService.redeemLicense(license.code, 'user-test-1', 'test@calculaperu.pe');
      expect(firstRedeem.success).toBe(true);

      const secondRedeem = await licenseService.redeemLicense(license.code, 'user-test-2', 'other@calculaperu.pe');
      expect(secondRedeem.success).toBe(false);
      expect(secondRedeem.message).toContain('ya ha sido utilizado');
    });
  });

  describe('Saved Calculations Deletion (ARCO / Privacidad)', () => {
    it('debe permitir guardar, consultar y eliminar cálculos por id y usuario propietario', async () => {
      const { savedCalculationRepository } = await import('../repositories/saved_calculation.repository');
      const testUserId = 'test-user-arco-1';

      // 1. Guardar cálculo
      const saved = await savedCalculationRepository.save({
        userId: testUserId,
        calculatorType: 'sueldo-neto',
        title: 'Sueldo Febrero 2026',
        totalAmount: 2676.92,
        data: { grossSalary: 3113, netSalary: 2676.92 },
      });

      expect(saved.id).toBeDefined();
      expect(saved.userId).toBe(testUserId);

      // 2. Verificar que existe
      const listBefore = await savedCalculationRepository.findByUserId(testUserId);
      expect(listBefore.some((c) => c.id === saved.id)).toBe(true);

      // 3. Intento de eliminación por otro usuario (no debe borrar el cálculo del dueño)
      await savedCalculationRepository.deleteById(saved.id, 'otro-usuario-intruso');
      const listAfterIntruder = await savedCalculationRepository.findByUserId(testUserId);
      expect(listAfterIntruder.some((c) => c.id === saved.id)).toBe(true);

      // 4. Eliminación legítima por el propio usuario
      const deleted = await savedCalculationRepository.deleteById(saved.id, testUserId);
      expect(deleted).toBe(true);

      // 5. Verificar que el cálculo ya no existe en el repositorio
      const listAfterDelete = await savedCalculationRepository.findByUserId(testUserId);
      expect(listAfterDelete.some((c) => c.id === saved.id)).toBe(false);
    });
  });
});
