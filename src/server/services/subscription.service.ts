import { SubscriptionRequest } from '@/features/auth/types';
import { Resend } from 'resend';
import { subscriptionRequestRepository } from '../repositories/subscription_request.repository';
import { licenseService } from './license.service';
import { userRepository } from '../repositories/user.repository';
import { auditRepository } from '../repositories/audit.repository';
import { CreateSubscriptionRequestInput } from '../validators/subscription.validator';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

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
        const redemption = await licenseService.redeemLicense(license.code, matchedUser.id, matchedUser.email);
        if (!redemption.success) console.warn('No se pudo asociar la licencia al usuario:', redemption.message);
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

    // 5. Send approval email via Resend if configured
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey && request.customerEmail) {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: 'CalculaPerú <contacto@calculaperu.com.pe>',
          to: [request.customerEmail],
          subject: `[CalculaPerú] ¡Tu suscripción PRO ha sido activada! 🎉 (Código: ${license.code})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #bbf7d0; border-radius: 16px; background-color: #ffffff;">
              <div style="border-bottom: 2px solid #00875a; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="color: #00875a; margin: 0; font-size: 20px;">¡Bienvenido a CalculaPerú PRO! 🎉</h2>
                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Tu pago ha sido validado exitosamente</p>
              </div>
              <p style="font-size: 14px; color: #1e293b; line-height: 1.6;">
                Hola <strong>${escapeHtml(request.customerName)}</strong>,<br/><br/>
                Tu operación <strong>${escapeHtml(request.operationCode)}</strong> para el <strong>${request.plan === 'yearly' ? 'Plan Anual' : 'Plan Mensual'}</strong> ha sido aprobada.
              </p>
              <div style="background-color: #f0fdf4; border: 2px dashed #00875a; padding: 16px; margin: 20px 0; border-radius: 12px; text-align: center;">
                <span style="font-size: 11px; color: #00875a; font-weight: bold; text-transform: uppercase;">Tu Código de Activación Oficial:</span><br/>
                <span style="font-size: 22px; font-family: monospace; font-weight: bold; color: #0f172a; letter-spacing: 2px;">${license.code}</span>
              </div>
              <p style="font-size: 13px; color: #475569; line-height: 1.5;">
                Si ya tienes tu cuenta iniciada en CalculaPerú con este correo, tu acceso PRO ya se encuentra habilitado automáticamente sin marcas de agua y con guardado en nube.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="https://calculaperu.com.pe/pro" style="display: inline-block; background-color: #00875a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 14px;">
                  Ingresar a CalculaPerú
                </a>
              </div>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.warn('Could not send approval email notification:', emailErr);
    }

    // 6. Create direct WhatsApp link
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
    whatsappUrl?: string;
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

    // Send email notification to customer if Resend is configured
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey && request.customerEmail) {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: 'CalculaPerú Soporte <contacto@calculaperu.com.pe>',
          to: [request.customerEmail],
          subject: `[CalculaPerú] Observación sobre tu solicitud de suscripción PRO (Op: ${request.operationCode})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fed7aa; border-radius: 16px; background-color: #ffffff;">
              <div style="border-bottom: 2px solid #ea580c; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="color: #ea580c; margin: 0; font-size: 20px;">Observación en tu Solicitud de Suscripción PRO</h2>
                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Equipo de Soporte de CalculaPerú</p>
              </div>
              <p style="font-size: 14px; color: #1e293b; line-height: 1.6;">
                Hola <strong>${escapeHtml(request.customerName)}</strong>,<br/><br/>
                Hemos revisado la transferencia correspondiente a tu solicitud para el <strong>${request.plan === 'yearly' ? 'Plan Anual (S/ 149.00)' : 'Plan Mensual (S/ 16.00)'}</strong> con código de operación <strong>${escapeHtml(request.operationCode)}</strong>, pero nuestro equipo encontró la siguiente observación:
              </p>
              <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 14px 18px; margin: 18px 0; border-radius: 4px; font-size: 14px; color: #9a3412;">
                <strong>Motivo:</strong> ${escapeHtml(notes || 'No se pudo verificar la transferencia en el extracto bancario.')}
              </div>
              <p style="font-size: 13px; color: #475569; line-height: 1.5;">
                ¿Qué puedes hacer?<br/>
                Por favor responde a este correo o escríbenos directamente a nuestro WhatsApp oficial con la captura de tu comprobante de Yape o Plin para ayudarte a validar y activar tu cuenta al instante:
              </p>
              <div style="margin: 20px 0; text-align: center;">
                <a href="https://wa.me/51913544715?text=${encodeURIComponent(`Hola, tengo una consulta sobre mi solicitud de suscripción PRO observada (Op: ${request.operationCode}). Adjunto mi comprobante.`)}" 
                   style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 14px;">
                  Chatear por WhatsApp (913 544 715)
                </a>
              </div>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.warn('Could not send rejection email notification:', emailErr);
    }

    // Direct WhatsApp message link for admin to notify customer in 1 click
    const cleanPhone = request.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    const waText = encodeURIComponent(
      `Hola ${request.customerName}, te saluda el equipo de CalculaPerú.\n\n` +
      `Tuvimos una observación al validar tu pago Yape/Plin (Op: ${request.operationCode}) para el Plan PRO:\n` +
      `"${notes || 'Operación no encontrada en el extracto bancario'}"\n\n` +
      `¿Podrías enviarnos la captura de tu comprobante por este medio para ayudarte a regularizarlo? ¡Muchas gracias!`
    );
    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${waText}`;

    return {
      success: true,
      subscription: updated || undefined,
      whatsappUrl,
      message: 'Solicitud rechazada y notificada correctamente.',
    };
  }
}

export const subscriptionService = new SubscriptionService();
