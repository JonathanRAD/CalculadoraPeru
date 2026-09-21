import { SubscriptionRequest } from '@/features/auth/types';
import { subscriptionRequestRepository } from '../repositories/subscription_request.repository';
import { licenseService } from './license.service';
import { userRepository } from '../repositories/user.repository';
import { auditRepository } from '../repositories/audit.repository';
import { CreateSubscriptionRequestInput } from '../validators/subscription.validator';

export class SubscriptionService {
  async createRequest(input: CreateSubscriptionRequestInput): Promise<SubscriptionRequest> {
    const request = await subscriptionRequestRepository.create(input);

    await auditRepository.logAction(
      'SUBSCRIPTION_REQUEST_CREATED',
      input.customerEmail,
      request.id,
      {
        customerName: input.customerName,
        operationCode: input.operationCode,
        plan: input.plan,
        amount: input.amount,
      }
    );

    return request;
  }

  async getAllRequests(): Promise<SubscriptionRequest[]> {
    return subscriptionRequestRepository.findAll();
  }

  async approveRequest(id: string, reviewedBy = 'Admin'): Promise<{
    success: boolean;
    subscription?: SubscriptionRequest;
    licenseCode?: string;
    whatsappUrl?: string;
    message: string;
  }> {
    const request = await subscriptionRequestRepository.findById(id);
    if (!request) {
      return { success: false, message: 'Solicitud no encontrada.' };
    }

    if (request.status === 'approved') {
      return { 
        success: true, 
        subscription: request, 
        licenseCode: request.generatedLicenseCode,
        message: 'Esta solicitud ya había sido aprobada.' 
      };
    }

    // 1. Generate an official license code
    const durationDays = request.plan === 'yearly' ? 365 : 30;
    const license = await licenseService.issueLicense({
      plan: request.plan,
      clientName: request.customerName,
      clientEmail: request.customerEmail,
      durationDays,
      createdBy: `Admin (${reviewedBy})`,
    });

    // 2. Mark subscription request as approved
    const updated = await subscriptionRequestRepository.approve(id, license.code, reviewedBy);

    // 3. If user already exists in profiles/storage, automatically activate their PRO status!
    try {
      const allUsers = await userRepository.findAll();
      const matchedUser = allUsers.find(
        u => u.email.toLowerCase() === request.customerEmail.toLowerCase() ||
             (request.userId && u.id === request.userId)
      );

      if (matchedUser) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        await userRepository.update(matchedUser.id, {
          isPro: true,
          plan: request.plan,
          proExpiresAt: expiresAt.toISOString(),
          activatedCode: license.code,
        });

        // Also mark license redeemed by this user
        await licenseService.redeemLicense(license.code, matchedUser.id, matchedUser.email);
      }
    } catch (err) {
      console.warn('Could not auto-link user account to approved subscription:', err);
    }

    // 4. Audit Log
    await auditRepository.logAction(
      'SUBSCRIPTION_APPROVED',
      reviewedBy,
      request.id,
      {
        licenseCode: license.code,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        plan: request.plan,
        operationCode: request.operationCode,
      }
    );

    // 5. Create direct WhatsApp link
    const cleanPhone = request.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    const planName = request.plan === 'yearly' ? 'CalculaPerú PRO Anual' : 'CalculaPerú PRO Mensual';
    
    const waText = encodeURIComponent(
      `¡Hola ${request.customerName}! 🎉\n\n` +
      `Tu pago para ${planName} ha sido verificado con éxito (Op: ${request.operationCode}).\n\n` +
      `Tu código de activación oficial es:\n` +
      `🔑 *${license.code}*\n\n` +
      `Puedes activarlo directamente en tu cuenta desde https://calculaperu.com.pe/pro o iniciando sesión.\n\n` +
      `¡Bienvenido a la suite profesional de CalculaPerú!`
    );

    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${waText}`;

    return {
      success: true,
      subscription: updated || undefined,
      licenseCode: license.code,
      whatsappUrl,
      message: `Solicitud aprobada y Licencia ${license.code} generada exitosamente.`,
    };
  }

  async rejectRequest(id: string, reviewedBy = 'Admin', notes?: string): Promise<{
    success: boolean;
    subscription?: SubscriptionRequest;
    message: string;
  }> {
    const request = await subscriptionRequestRepository.findById(id);
    if (!request) {
      return { success: false, message: 'Solicitud no encontrada.' };
    }

    const updated = await subscriptionRequestRepository.reject(id, reviewedBy, notes);

    await auditRepository.logAction(
      'SUBSCRIPTION_REJECTED',
      reviewedBy,
      request.id,
      {
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        operationCode: request.operationCode,
        notes,
      }
    );

    return {
      success: true,
      subscription: updated || undefined,
      message: 'Solicitud rechazada correctamente.',
    };
  }
}

export const subscriptionService = new SubscriptionService();
