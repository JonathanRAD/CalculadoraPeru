import { Resend } from 'resend';

export interface EmailNotificationPayload {
  category: string;
  sourcePath?: string;
  name: string;
  email: string;
  phone?: string;
  businessType?: string;
  message: string;
  consent: boolean;
  requestId?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char] || char);
}

/**
 * Retorna fecha y hora formateada en la zona horaria oficial de Perú (America/Lima).
 */
export function getPeruTimestamp(): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

/**
 * Mapeo controlado de categorías para evitar subjects arbitrarios inyectados por el usuario.
 */
const CATEGORY_SUBJECT_MAP: Record<string, string> = {
  consulta_general: 'Consulta General',
  calculadora: 'Ayuda con Calculadora',
  cotizador: 'Solicitud Cotizador PRO',
  cuenta_pro: 'Cuenta o Acceso PRO',
  error_report: 'Reporte de Error',
  mejora: 'Sugerencia de Mejora',
  privacidad: 'Privacidad o Datos',
  alianza: 'Alianza o Colaboración',
  otro: 'Consulta de Usuario',
};

import crypto from 'crypto';
import { getServerEnv } from '../config/server-env';

export class NotificationEmailService {
  private resendClient: Resend | null = null;

  private getClient(): Resend | null {
    if (this.resendClient) return this.resendClient;
    const env = getServerEnv();
    if (!env.resendApiKey) return null;
    this.resendClient = new Resend(env.resendApiKey);
    return this.resendClient;
  }

  /**
   * Genera un ID de seguimiento criptográficamente seguro tipo CP-XXXXXXXX
   */
  generateRequestId(): string {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `CP-${code}`;
  }

  /**
   * Envía la notificación administrativa por Resend registrando estado auditable.
   */
  async sendAdminNotification(payload: EmailNotificationPayload): Promise<EmailSendResult> {
    const env = getServerEnv();
    const client = this.getClient();
    const requestId = payload.requestId || this.generateRequestId();
    const categoryName = CATEGORY_SUBJECT_MAP[payload.category] || 'Consulta General';
    const peruTime = getPeruTimestamp();

    if (!client || !env.resendFromEmail || !env.contactRecipientEmail) {
      return {
        success: false,
        errorCode: 'CONFIG_MISSING',
        errorMessage: 'El servicio de correo no está completamente configurado en el servidor.',
      };
    }

    const safeName = escapeHtml(payload.name.trim());
    const safeEmail = escapeHtml(payload.email.trim());
    const safePhone = payload.phone ? escapeHtml(payload.phone.trim()) : 'No proporcionado';
    const safeBusiness = payload.businessType ? escapeHtml(payload.businessType.trim()) : null;
    const safeMessage = escapeHtml(payload.message.trim());
    const safeSource = payload.sourcePath ? escapeHtml(payload.sourcePath.trim()) : '/contacto';

    // Asunto estrictamente controlado en servidor
    const subject = `[CalculaPerú] ${categoryName} – ${requestId}`;

    const textContent = `
[CalculaPerú - Notificación de Contacto]
ID de Solicitud: ${requestId}
Fecha/Hora (Perú): ${peruTime}
Origen: ${safeSource}
Categoría: ${categoryName}

Remitente: ${safeName}
Correo: ${safeEmail}
Teléfono / WhatsApp: ${safePhone}
${safeBusiness ? `Tipo de Negocio: ${safeBusiness}\n` : ''}
Consentimiento de Privacidad: Aceptado (${peruTime})

Detalle del Mensaje:
--------------------------------------------------
${payload.message.trim()}
--------------------------------------------------
CalculaPerú - Plataforma Digital
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #00875A; padding: 20px 24px; color: #ffffff; }
    .header h2 { margin: 0; font-size: 18px; font-weight: 700; }
    .header p { margin: 4px 0 0; font-size: 12px; opacity: 0.9; }
    .body { padding: 24px; font-size: 13px; color: #1e293b; line-height: 1.6; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .meta-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    .meta-label { font-weight: 600; color: #64748b; width: 140px; }
    .meta-value { font-weight: 500; color: #0f172a; }
    .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #00875A; border-radius: 6px; padding: 16px; margin: 16px 0; white-space: pre-wrap; font-size: 13px; color: #0f172a; }
    .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>Nueva Notificación Administrativa</h2>
      <p>ID: ${requestId} • ${peruTime} (Hora de Lima)</p>
    </div>
    <div class="body">
      <table class="meta-table">
        <tr><td class="meta-label">Categoría:</td><td class="meta-value">${categoryName}</td></tr>
        <tr><td class="meta-label">Remitente:</td><td class="meta-value">${safeName}</td></tr>
        <tr><td class="meta-label">Correo:</td><td class="meta-value"><a href="mailto:${safeEmail}" style="color: #00875A; text-decoration: none;">${safeEmail}</a></td></tr>
        <tr><td class="meta-label">Teléfono:</td><td class="meta-value">${safePhone}</td></tr>
        ${safeBusiness ? `<tr><td class="meta-label">Tipo de negocio:</td><td class="meta-value">${safeBusiness}</td></tr>` : ''}
        <tr><td class="meta-label">Ruta de origen:</td><td class="meta-value">${safeSource}</td></tr>
        <tr><td class="meta-label">Consentimiento:</td><td class="meta-value">Aceptado conforme a la Política de Privacidad</td></tr>
      </table>

      <h4 style="margin: 16px 0 8px; color: #334155; font-size: 12px; text-transform: uppercase;">Consulta / Mensaje:</h4>
      <div class="message-box">${safeMessage}</div>
    </div>
    <div class="footer">
      <p style="margin: 0;">Puedes pulsar "Responder" en tu cliente de correo para escribirle directamente al remitente (${safeEmail}).</p>
      <p style="margin: 4px 0 0;">CalculaPerú © ${new Date().getFullYear()} • calculaperu.com.pe</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    try {
      const { data, error } = await client.emails.send({
        from: env.resendFromEmail,
        to: [env.contactRecipientEmail],
        replyTo: payload.email.trim(),
        subject,
        text: textContent,
        html: htmlContent,
      });

      if (error) {
        console.error('[NotificationEmailService] Error de entrega Resend:', error.name);
        return {
          success: false,
          errorCode: error.name || 'RESEND_ERROR',
          errorMessage: 'No se pudo completar el envío del correo.',
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (err: unknown) {
      console.error('[NotificationEmailService] Excepción al invocar Resend:', (err as Error)?.message || 'Error');
      return {
        success: false,
        errorCode: 'UNEXPECTED_ERROR',
        errorMessage: 'Error inesperado al conectar con el proveedor de correo.',
      };
    }
  }

  /**
   * Helper conveniente para reenvíos o notificaciones de contacto.
   */
  async sendContactNotificationEmail(payload: {
    requestId?: string;
    name: string;
    email: string;
    phone?: string;
    category: string;
    message: string;
    submittedAt?: string;
  }): Promise<{ sent: boolean; resendMessageId?: string; errorCode?: string }> {
    const result = await this.sendAdminNotification({
      requestId: payload.requestId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      category: payload.category,
      message: payload.message,
      consent: true,
      sourcePath: '/contacto',
    });
    return {
      sent: result.success,
      resendMessageId: result.messageId,
      errorCode: result.errorCode,
    };
  }
}

export const notificationEmailService = new NotificationEmailService();
