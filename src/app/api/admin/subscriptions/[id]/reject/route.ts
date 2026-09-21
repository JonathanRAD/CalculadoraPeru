import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { subscriptionService } from '@/server/services/subscription.service';

export async function POST(
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

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID de solicitud requerido.' }, { status: 400 });
    }

    let notes: string | undefined;
    try {
      const body = await req.json();
      notes = body.notes;
    } catch {}

    const result = await subscriptionService.rejectRequest(id, 'Admin Panel', notes);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err) {
    console.error('Error rejecting subscription:', err);
    return NextResponse.json(
      { success: false, message: 'Error al rechazar la solicitud de suscripción.' },
      { status: 500 }
    );
  }
}
