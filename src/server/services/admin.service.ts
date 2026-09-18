import { userRepository } from '../repositories/user.repository';
import { licenseRepository } from '../repositories/license.repository';
import { auditRepository } from '../repositories/audit.repository';
import { SafeUser } from '@/features/auth/types';

export interface DashboardMetrics {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalLicenses: number;
  availableLicenses: number;
  redeemedLicenses: number;
  revokedLicenses: number;
}

export class AdminService {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [users, licenses] = await Promise.all([
      userRepository.findAll(),
      licenseRepository.findAll(),
    ]);

    const proUsers = users.filter(u => u.isPro).length;
    const freeUsers = users.length - proUsers;

    const availableLicenses = licenses.filter(l => l.status === 'available').length;
    const redeemedLicenses = licenses.filter(l => l.status === 'redeemed').length;
    const revokedLicenses = licenses.filter(l => l.status === 'revoked').length;

    return {
      totalUsers: users.length,
      proUsers,
      freeUsers,
      totalLicenses: licenses.length,
      availableLicenses,
      redeemedLicenses,
      revokedLicenses,
    };
  }

  async getAllUsers(): Promise<SafeUser[]> {
    return userRepository.findAll();
  }

  async updateUserRole(targetUserId: string, role: 'user' | 'admin', performedBy: string): Promise<{ success: boolean; message: string }> {
    const user = await userRepository.findById(targetUserId);
    if (!user) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    await userRepository.update(targetUserId, { role });
    await auditRepository.logAction('USER_ROLE_CHANGED', performedBy, targetUserId, { previousRole: user.role, newRole: role });

    return { success: true, message: `Rol de ${user.email} actualizado a ${role}.` };
  }

  async toggleUserPro(targetUserId: string, isPro: boolean, performedBy: string, plan: 'monthly' | 'yearly' = 'yearly'): Promise<{ success: boolean; message: string }> {
    const user = await userRepository.findById(targetUserId);
    if (!user) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    const durationDays = plan === 'yearly' ? 365 : 30;
    const expiresAt = isPro ? new Date(Date.now() + durationDays * 86400000).toISOString() : null;

    await userRepository.update(targetUserId, {
      isPro,
      plan: isPro ? plan : null,
      proExpiresAt: expiresAt,
    });

    await auditRepository.logAction('USER_PRO_STATUS_TOGGLED', performedBy, targetUserId, { isPro, plan });

    return {
      success: true,
      message: `Estado PRO de ${user.email} ${isPro ? 'activado' : 'desactivado'} correctamente.`,
    };
  }

  async getRecentAuditLogs(limit = 50) {
    return auditRepository.getRecentLogs(limit);
  }
}

export const adminService = new AdminService();
