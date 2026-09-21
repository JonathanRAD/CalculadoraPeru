import crypto from 'crypto';
import { LicenseCode, ProPlan } from '@/features/auth/types';
import { licenseRepository } from '../repositories/license.repository';
import { userRepository } from '../repositories/user.repository';
import { auditRepository } from '../repositories/audit.repository';
import { CreateLicenseInput } from '../validators/license.validator';

export class LicenseService {
  private generateSecureCode(prefix = 'PRO'): string {
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${prefix}-${part1}-${part2}`;
  }

  async issueLicense(input: CreateLicenseInput): Promise<LicenseCode> {
    const plan: ProPlan = input.plan === 'monthly' ? 'monthly' : 'yearly';
    const durationDays = input.durationDays && input.durationDays > 0 
      ? input.durationDays 
      : (plan === 'yearly' ? 365 : 30);

    const code = this.generateSecureCode();
    const id = crypto.randomUUID();

    const newLicense: LicenseCode = {
      id,
      code,
      plan,
      durationDays,
      assignedClientName: input.clientName,
      assignedClientEmail: input.clientEmail,
      status: 'available',
      createdBy: input.createdBy || 'Admin Panel',
      createdAt: new Date().toISOString(),
    };

    const saved = await licenseRepository.create(newLicense);

    await auditRepository.logAction(
      'LICENSE_ISSUED',
      input.createdBy || 'Admin Panel',
      saved.code,
      { plan, durationDays, clientName: input.clientName }
    );

    return saved;
  }

  async redeemLicense(code: string, userId?: string, userEmail?: string): Promise<{ success: boolean; message: string; license?: LicenseCode }> {
    const cleanCode = code.trim().toUpperCase();
    const license = await licenseRepository.findByCode(cleanCode);

    if (!license) {
      return { success: false, message: 'El código de activación no existe en el sistema.' };
    }

    if (license.status === 'redeemed') {
      return { success: false, message: 'Este código de activación ya ha sido utilizado anteriormente.' };
    }

    if (license.status === 'revoked') {
      return { success: false, message: 'Este código ha sido revocado por administración y no es válido.' };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + license.durationDays * 24 * 60 * 60 * 1000).toISOString();

    // If userId provided, update their user profile if user exists
    if (userId) {
      const user = await userRepository.findById(userId);
      if (user) {
        await userRepository.update(userId, {
          isPro: true,
          plan: license.plan,
          proExpiresAt: expiresAt,
          activatedCode: license.code,
        });
      }
    }

    const updatedLicense = await licenseRepository.update(cleanCode, {
      status: 'redeemed',
      redeemedByUserId: userId,
      redeemedByUserEmail: userEmail || undefined,
      redeemedAt: now.toISOString(),
    });

    await auditRepository.logAction(
      'LICENSE_REDEEMED',
      userEmail || userId || 'Client App',
      cleanCode,
      { durationDays: license.durationDays, plan: license.plan }
    );

    return {
      success: true,
      message: `¡Membresía ${license.plan === 'yearly' ? 'Anual (365 días)' : 'Mensual (30 días)'} activada exitosamente!`,
      license: updatedLicense || license,
    };
  }

  async revokeLicense(code: string, performedBy: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const cleanCode = code.trim().toUpperCase();
    const license = await licenseRepository.findByCode(cleanCode);

    if (!license) {
      return { success: false, message: 'La licencia no existe.' };
    }

    await licenseRepository.update(cleanCode, { status: 'revoked' });

    // If assigned to a user, revoke PRO
    if (license.redeemedByUserId) {
      await userRepository.update(license.redeemedByUserId, {
        isPro: false,
        plan: null,
      });
    }

    await auditRepository.logAction('LICENSE_REVOKED', performedBy, cleanCode, { reason });

    return { success: true, message: `Licencia ${cleanCode} revocada exitosamente.` };
  }

  async getAllLicenses(): Promise<LicenseCode[]> {
    return licenseRepository.findAll();
  }

  async getLicenseStats(): Promise<{ total: number; available: number; redeemed: number; revoked: number }> {
    const licenses = await licenseRepository.findAll();
    return {
      total: licenses.length,
      available: licenses.filter(l => l.status === 'available').length,
      redeemed: licenses.filter(l => l.status === 'redeemed').length,
      revoked: licenses.filter(l => l.status === 'revoked').length,
    };
  }
}

export const licenseService = new LicenseService();
