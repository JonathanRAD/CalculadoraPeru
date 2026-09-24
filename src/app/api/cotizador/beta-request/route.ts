import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { validateBetaRequestInput, isValidUuid } from '@/server/validators/quote.validator';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';
import { checkAuthRateLimit } from '@/server/services/auth-rate-limit';
import { notificationEmailService } from '@/server/services/notification-email.service';
import { contactSubmissionRepository } from '@/server/repositories/contact_submission.repository';
import { getAuthEnv } from '@/server/config/server-env';

function hashIp(rawIp: string): string {
  const authEnv = getAuthEnv();
  return crypto.createHmac('sha256', authEnv.authTokenSecret).update(rawIp).digest('hex').slice(0, 32);
}

export async function POST(req: NextRequest) {
  try {
    const raw = (await readJsonBody(req, 8192)) as Record<string, unknown>;

    // Honeypot anti-bot
    if (typeof raw.honeypot === 'string' && raw.honeypot.trim().length > 0) {
      return NextResponse.json({
        success: true,
        requestId: 'CP-00000000',
        emailStatus: 'sent',
        message: 'Recibimos tu consulta correctamente.',
      });
    }

    const val = validateBetaRequestInput(raw);
    if (!val.isValid || !val.data) {
      return NextResponse.json(
        { success: false, message: val.error || 'Datos de registro inválidos.' },
        { status: 400 }
      );
    }

    // Validación de clave de idempotencia (Fase 4: formato UUID estricto)
    const headerIdempotency = req.headers.get('idempotency-key')?.trim();
    let cleanIdempotencyKey: string | undefined = undefined;
    const rawKey = typeof raw.idempotencyKey === 'string' && raw.idempotencyKey.trim().length > 0
      ? raw.idempotencyKey.trim()
      : (headerIdempotency || undefined);

    if (rawKey) {
      if (!isValidUuid(rawKey)) {
        return NextResponse.json(
          { success: false, message: 'La clave de idempotencia debe tener un formato UUID válido.', error: 'La clave de idempotencia debe tener un formato UUID válido.' },
          { status: 400 }
        );
      }
      cleanIdempotencyKey = rawKey.toLowerCase();

      // Consultar si ya existe una solicitud con esa clave ANTES de aplicar rate limiting
      try {
        const existing = await contactSubmissionRepository.findByIdempotencyKey(cleanIdempotencyKey);
        if (existing) {
          if (existing.email.trim().toLowerCase() !== val.data.email.trim().toLowerCase()) {
            return NextResponse.json(
              {
                success: false,
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
            isDuplicate: true,
            message: 'Recibimos tu sugerencia previamente con código ' + existing.publicRequestId + '.',
          });
        }
      } catch (lookupErr) {
        console.warn('[API BetaRequest] Error al verificar clave de idempotencia previa:', lookupErr);
      }
    }

    // Rate limiting durable por correo en bucket separado: cotizador_feedback (aplicado únicamente a solicitudes nuevas)
    const isAllowed = await checkAuthRateLimit(req, 'cotizador_feedback', val.data.email);
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, message: 'Demasiadas solicitudes de sugerencias. Por favor espera unos minutos antes de volver a intentarlo.' },
        { status: 429 }
      );
    }

    const publicRequestId = notificationEmailService.generateRequestId();
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const ipHash = hashIp(clientIp);

    const feedbackMessage = val.data.featureNeeded?.trim()
      ? val.data.featureNeeded.trim()
      : 'Registro en la lista de novedades y mejoras del cotizador comercial.';

    // 1. Guardar en contact_submissions con categoría 'cotizador_feedback' como fuente única (Fases 4 y 7)
    let submissionResult;
    try {
      submissionResult = await contactSubmissionRepository.create({
        publicRequestId,
        name: 'Usuario Cotizador',
        email: val.data.email,
        phone: val.data.phone,
        category: 'cotizador_feedback',
        businessType: val.data.businessType,
        message: feedbackMessage,
        sourcePath: '/cotizador',
        consent: true,
        consentVersion: val.data.consentTextVersion || '2026-v2',
        idempotencyKey: cleanIdempotencyKey,
        ipHash,
      });
    } catch (persistErr) {
      // Caso C: no se puede persistir -> HTTP 503, no confirmar recepción ni enviar correo
      console.error('[API BetaRequest] Fallo de persistencia durable:', persistErr instanceof Error ? persistErr.message : persistErr);
      return NextResponse.json(
        {
          success: false,
          error: 'No fue posible registrar tu sugerencia de manera duradera. Por favor, inténtalo nuevamente.',
          message: 'No fue posible registrar tu sugerencia de manera duradera. Por favor, inténtalo nuevamente.',
        },
        { status: 503 }
      );
    }

    // Si es repetición por idempotencia, devolver respuesta previa sin reenviar correo
    if (submissionResult.isDuplicate) {
      if (submissionResult.submission.email.trim().toLowerCase() !== val.data.email.trim().toLowerCase()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflicto de idempotencia: la clave ya fue utilizada con una solicitud distinta.',
            message: 'Conflicto de idempotencia: la clave ya fue utilizada con una solicitud distinta.',
          },
          { status: 409 }
        );
      }
      return NextResponse.json({
        success: true,
        requestId: submissionResult.publicRequestId,
        emailStatus: submissionResult.submission.emailStatus,
        isDuplicate: true,
        message: 'Recibimos tu sugerencia previamente con código ' + submissionResult.publicRequestId + '.',
      });
    }

    // 2. Notificación administrativa centralizada mediante Resend
    const emailResult = await notificationEmailService.sendAdminNotification({
      category: 'cotizador',
      sourcePath: '/cotizador',
      name: 'Usuario Cotizador',
      email: val.data.email,
      phone: val.data.phone,
      businessType: val.data.businessType,
      message: `Sugerencia de cotizador comercial:\n${feedbackMessage}`,
      consent: true,
      requestId: submissionResult.publicRequestId,
    });

    const emailStatus = emailResult.success ? 'sent' : 'failed';

    // 3. Actualizar estado del correo en contact_submissions de forma resiliente
    let statusUpdateFailed = false;
    try {
      await contactSubmissionRepository.updateEmailStatus(
        submissionResult.id,
        emailStatus,
        emailResult.messageId,
        emailResult.errorCode
      );
    } catch (statusErr) {
      statusUpdateFailed = true;
      console.error(
        '[API BetaRequest] Error al actualizar estado de notificación interna tras envío exitoso:',
        statusErr instanceof Error ? statusErr.message : 'Error desconocido'
      );
    }

    // 4. Respuestas honestas y transparentes (Fase 5 y Fase 8)
    if (statusUpdateFailed) {
      return NextResponse.json({
        success: true,
        requestId: submissionResult.publicRequestId,
        emailStatus: 'pending',
        warning: 'Tu sugerencia fue registrada, pero la confirmación interna está pendiente de actualización.',
        message: `Tu sugerencia fue registrada con código ${submissionResult.publicRequestId}. La confirmación interna está pendiente de actualización.`,
      });
    }

    // 4. Respuestas honestas y transparentes (Fase 5)
    if (emailResult.success) {
      // Caso A: DB y Resend funcionan
      return NextResponse.json({
        success: true,
        requestId: submissionResult.publicRequestId,
        emailStatus: 'sent',
        message: 'Recibimos tu consulta correctamente.',
      });
    } else {
      // Caso B: DB funciona y Resend falla
      return NextResponse.json({
        success: true,
        requestId: submissionResult.publicRequestId,
        emailStatus: 'failed',
        warning: 'Tu solicitud quedó registrada, pero la notificación interna está pendiente de reenvío.',
        message: `Tu solicitud quedó registrada con código ${submissionResult.publicRequestId}, pero la notificación interna está pendiente de reenvío.`,
      });
    }
  } catch (err: unknown) {
    console.error('[API BetaRequest] Excepción no controlada:', err instanceof Error ? err.message : 'Error desconocido');
    return NextResponse.json(
      { success: false, message: err instanceof RequestBodyError ? err.message : 'Error interno al procesar el registro.' },
      { status: err instanceof RequestBodyError ? err.status : 500 }
    );
  }
}
