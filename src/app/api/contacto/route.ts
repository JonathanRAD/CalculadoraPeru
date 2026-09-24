import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';
import { checkAuthRateLimit } from '@/server/services/auth-rate-limit';
import { isValidEmail, normalizePhone, isValidUuid } from '@/server/validators/quote.validator';
import { notificationEmailService } from '@/server/services/notification-email.service';
import { contactSubmissionRepository } from '@/server/repositories/contact_submission.repository';
import { getAuthEnv } from '@/server/config/server-env';

const ALLOWED_CATEGORIES = [
  'consulta_general',
  'calculadora',
  'cotizador',
  'cotizador_feedback',
  'cuenta_pro',
  'error_report',
  'mejora',
  'privacidad',
  'alianza',
  'otro',
];

function hashIp(rawIp: string): string {
  const authEnv = getAuthEnv();
  return crypto.createHmac('sha256', authEnv.authTokenSecret).update(rawIp).digest('hex').slice(0, 32);
}

export async function POST(req: Request) {
  try {
    const body = (await readJsonBody(req, 8192)) as Record<string, unknown>;
    const { name, email, phone, category, message, sourcePath, consent, honeypot, idempotencyKey } = body;

    // 1. Honeypot check: Si un bot rellena este campo invisible, responder éxito simulado sin procesar
    if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
      return NextResponse.json({
        success: true,
        requestId: 'CP-00000000',
        emailStatus: 'sent',
        message: 'Recibimos tu consulta correctamente.',
      });
    }

    // 2. Validación de campos obligatorios
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio y debe tener entre 2 y 100 caracteres.' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Ingresa un correo electrónico de contacto válido (máximo 254 caracteres).' },
        { status: 400 }
      );
    }

    let cleanPhone: string | undefined = undefined;
    if (phone !== undefined && phone !== null && String(phone).trim() !== '') {
      if (typeof phone !== 'string') {
        return NextResponse.json({ error: 'El teléfono debe ser un valor de texto.' }, { status: 400 });
      }
      cleanPhone = normalizePhone(phone);
      if (!cleanPhone) {
        return NextResponse.json(
          { error: 'El teléfono o WhatsApp debe contener entre 7 y 15 dígitos numéricos.' },
          { status: 400 }
        );
      }
    }

    if (typeof category !== 'string' || !ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Selecciona una categoría válida para tu consulta.' },
        { status: 400 }
      );
    }

    if (typeof message !== 'string' || message.trim().length < 20 || message.trim().length > 2000) {
      return NextResponse.json(
        { error: 'El detalle de tu consulta debe tener entre 20 y 2,000 caracteres.' },
        { status: 400 }
      );
    }

    if (consent !== true) {
      return NextResponse.json(
        { error: 'Debes aceptar la Política de Privacidad para que podamos responder a tu consulta.' },
        { status: 400 }
      );
    }

    // Validación segura de ruta de origen
    let safeSourcePath = '/contacto';
    if (typeof sourcePath === 'string' && sourcePath.startsWith('/') && !sourcePath.includes('://')) {
      safeSourcePath = sourcePath.slice(0, 200);
    }

    // 3. Validación de clave de idempotencia (Fase 4: formato UUID estricto)
    const headerIdempotency = req.headers.get('idempotency-key')?.trim();
    let cleanIdempotencyKey: string | undefined = undefined;
    const rawKey = typeof idempotencyKey === 'string' && idempotencyKey.trim().length > 0
      ? idempotencyKey.trim()
      : (headerIdempotency || undefined);

    if (rawKey) {
      if (!isValidUuid(rawKey)) {
        return NextResponse.json(
          { error: 'La clave de idempotencia debe tener un formato UUID válido.', message: 'La clave de idempotencia debe tener un formato UUID válido.' },
          { status: 400 }
        );
      }
      cleanIdempotencyKey = rawKey.toLowerCase();

      // Consultar si ya existe una solicitud con esa clave ANTES de aplicar rate limiting
      try {
        const existing = await contactSubmissionRepository.findByIdempotencyKey(cleanIdempotencyKey);
        if (existing) {
          // Si el payload es sustancialmente distinto (ej. correo diferente), rechazar con 409
          if (existing.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
            return NextResponse.json(
              {
                error: 'Conflicto de idempotencia: la clave ya fue utilizada con una solicitud distinta.',
                message: 'Conflicto de idempotencia: la clave ya fue utilizada con una solicitud distinta.',
              },
              { status: 409 }
            );
          }
          return NextResponse.json({
            success: true,
            requestId: existing.publicRequestId,
            emailStatus: existing.emailStatus,
            message: 'Recibimos tu consulta previamente con código ' + existing.publicRequestId + '.',
          });
        }
      } catch (lookupErr) {
        console.warn('[API Contact] Error al verificar clave de idempotencia previa:', lookupErr);
      }
    }

    // 4. Rate limiting durable por email y hash de IP (bucket separado: contact_general)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const ipHash = hashIp(clientIp);

    const isAllowed = await checkAuthRateLimit(req, 'contact_general', email.trim().toLowerCase());
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de envíos. Por favor espera 15 minutos antes de enviar otra consulta.', message: 'Has alcanzado el límite de envíos. Por favor espera 15 minutos antes de enviar otra consulta.' },
        { status: 429 }
      );
    }

    // 5. Generar Identificador Público Seguro (CP-XXXXXXXX)
    const requestId = notificationEmailService.generateRequestId();

    // 6. Inserción atómica duradera en repositorio (Fases 5, 6 y 7)
    let createResult;
    try {
      createResult = await contactSubmissionRepository.create({
        publicRequestId: requestId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        category,
        message: message.trim(),
        sourcePath: safeSourcePath,
        consent: true,
        consentVersion: '2026-v2',
        idempotencyKey: cleanIdempotencyKey,
        ipHash,
      });
    } catch (persistErr) {
      // Caso C: no se puede persistir -> HTTP 503, no confirmar recepción ni enviar correo
      console.error('[API Contact] Fallo de persistencia durable:', persistErr instanceof Error ? persistErr.message : persistErr);
      return NextResponse.json(
        {
          error: 'No fue posible registrar tu consulta de manera duradera. Por favor, inténtalo nuevamente.',
          message: 'No fue posible registrar tu consulta de manera duradera. Por favor, inténtalo nuevamente.',
        },
        { status: 503 }
      );
    }

    // Si es repetición por idempotencia (Fase 7), no volver a disparar correo
    if (createResult.isDuplicate) {
      if (createResult.submission.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
        return NextResponse.json(
          {
            error: 'Conflicto de idempotencia: la clave ya fue utilizada con una solicitud distinta.',
            message: 'Conflicto de idempotencia: la clave ya fue utilizada con una solicitud distinta.',
          },
          { status: 409 }
        );
      }
      return NextResponse.json({
        success: true,
        requestId: createResult.publicRequestId,
        emailStatus: createResult.submission.emailStatus,
        message: 'Recibimos tu consulta previamente con código ' + createResult.publicRequestId + '.',
      });
    }

    // 7. Notificación administrativa mediante Resend
    const sendResult = await notificationEmailService.sendAdminNotification({
      category,
      sourcePath: safeSourcePath,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      message: message.trim(),
      consent: true,
      requestId: createResult.publicRequestId,
    });

    const emailStatus = sendResult.success ? 'sent' : 'failed';

    // 8. Actualizar traza del correo en base de datos de forma resiliente
    let statusUpdateFailed = false;
    try {
      await contactSubmissionRepository.updateEmailStatus(
        createResult.id,
        emailStatus,
        sendResult.messageId,
        sendResult.errorCode
      );
    } catch (statusErr) {
      statusUpdateFailed = true;
      console.error(
        '[API Contact] Error al actualizar estado de notificación interna tras envío exitoso:',
        statusErr instanceof Error ? statusErr.message : 'Error desconocido'
      );
    }

    // 9. Respuestas honestas y transparentes (Fase 5 y Fase 8)
    if (statusUpdateFailed) {
      return NextResponse.json({
        success: true,
        requestId: createResult.publicRequestId,
        emailStatus: 'pending',
        warning: 'Tu solicitud fue recibida y registrada, pero la confirmación interna está pendiente de actualización.',
        message: `Tu solicitud fue registrada con código ${createResult.publicRequestId}. La confirmación interna está pendiente de actualización.`,
      });
    }

    if (sendResult.success) {
      // Caso A: Base de datos y Resend funcionan
      return NextResponse.json({
        success: true,
        requestId: createResult.publicRequestId,
        emailStatus: 'sent',
        message: 'Recibimos tu consulta correctamente.',
      });
    } else {
      // Caso B: Base de datos funciona y Resend falla
      return NextResponse.json({
        success: true,
        requestId: createResult.publicRequestId,
        emailStatus: 'failed',
        warning: 'Tu solicitud quedó registrada, pero la notificación interna está pendiente de reenvío.',
        message: `Tu solicitud quedó registrada con código ${createResult.publicRequestId}, pero la notificación interna está pendiente de reenvío.`,
      });
    }
  } catch (err) {
    console.error('[API Contact] Excepción no controlada en endpoint:', err instanceof Error ? err.message : 'Error desconocido');
    return NextResponse.json(
      { error: err instanceof RequestBodyError ? err.message : 'Error interno del servidor al procesar la solicitud.' },
      { status: err instanceof RequestBodyError ? err.status : 500 }
    );
  }
}
