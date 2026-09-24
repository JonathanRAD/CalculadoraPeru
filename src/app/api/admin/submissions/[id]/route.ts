import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { contactSubmissionRepository } from '@/server/repositories/contact_submission.repository';
import { notificationEmailService } from '@/server/services/notification-email.service';
import { auditRepository } from '@/server/repositories/audit.repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthorized = await authService.isAuthorizedAdmin(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, message: 'Acceso no autorizado al panel administrativo.' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const submission = await contactSubmissionRepository.findById(id);

  if (!submission) {
    return NextResponse.json(
      { success: false, message: 'Solicitud no encontrada.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, submission });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthorized = await authService.isAuthorizedAdminMutable(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, message: 'Acceso no autorizado o validación CSRF fallida.' },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { reviewStatus } = body;

    const validStatuses = ['pending', 'in_progress', 'resolved', 'discarded'];
    if (!reviewStatus || !validStatuses.includes(reviewStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `Estado de revisión no válido. Debe ser uno de: ${validStatuses.join(', ')}.`,
        },
        { status: 400 }
      );
    }

    // Identificar al admin que realiza el cambio
    const adminUser = await authService.authenticateRequest(req);
    const updated = await contactSubmissionRepository.updateReviewStatus(
      id,
      reviewStatus,
      adminUser?.id
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'No se pudo actualizar la solicitud o no existe.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: updated,
      message: `Estado actualizado a "${reviewStatus}".`,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno al actualizar la solicitud.' },
      { status: 500 }
    );
  }
}

// POST para reintentar envío de notificación por correo
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthorized = await authService.isAuthorizedAdminMutable(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, message: 'Acceso no autorizado o validación CSRF fallida.' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const submission = await contactSubmissionRepository.findById(id);

  if (!submission) {
    return NextResponse.json(
      { success: false, message: 'Solicitud no encontrada.' },
      { status: 404 }
    );
  }

  try {
    const emailResult = await notificationEmailService.sendAdminNotification({
      category: submission.category,
      sourcePath: submission.sourcePath || '/contacto',
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      businessType: submission.businessType,
      message: submission.message,
      consent: true,
      requestId: submission.publicRequestId,
    });

    const emailStatus = emailResult.success ? 'sent' : 'failed';
    const updated = await contactSubmissionRepository.updateEmailStatus(
      id,
      emailStatus,
      emailResult.messageId,
      emailResult.errorCode
    );

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        submission: updated,
        message: 'Notificación por correo enviada exitosamente.',
      });
    } else {
      return NextResponse.json({
        success: false,
        submission: updated,
        message: `Fallo al reintentar envío: ${emailResult.errorCode || 'desconocido'}.`,
      });
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno al procesar reintento de correo.' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminación administrativa reforzada (Fase 11)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthorized = await authService.isAuthorizedAdminMutable(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, message: 'Acceso no autorizado o validación CSRF fallida.' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const submission = await contactSubmissionRepository.findById(id);

  if (!submission) {
    return NextResponse.json(
      { success: false, message: 'Solicitud no encontrada para eliminar.' },
      { status: 404 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    if (body.confirmDelete !== true || body.confirmationText !== submission.publicRequestId) {
      return NextResponse.json(
        {
          success: false,
          message: `Se requiere confirmación reforzada. Debes enviar confirmDelete: true y confirmationText exactamente igual a "${submission.publicRequestId}".`,
        },
        { status: 400 }
      );
    }

    // Registrar evento de auditoría previo a la eliminación SIN guardar mensaje ni datos personales sensibles
    const adminUser = await authService.authenticateRequest(req);
    await auditRepository.logAction(
      'SUBMISSION_PERMANENTLY_DELETED',
      adminUser?.email || 'admin',
      submission.id,
      {
        publicRequestId: submission.publicRequestId,
        category: submission.category,
        createdAt: submission.createdAt,
      }
    );

    const deleted = await contactSubmissionRepository.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Fallo al eliminar la solicitud.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Solicitud ${submission.publicRequestId} eliminada definitivamente.`,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno al eliminar la solicitud.' },
      { status: 500 }
    );
  }
}
