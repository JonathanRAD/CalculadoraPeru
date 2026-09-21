import { describe, it, expect } from 'vitest';
import { validateCreateLicenseInput, validateRedeemLicenseInput } from '../validators/license.validator';
import { validateLoginInput, validateRegisterInput, validateCompanyProfileInput } from '../validators/auth.validator';
import { licenseService } from '../services/license.service';

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
});
