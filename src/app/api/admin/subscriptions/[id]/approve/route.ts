import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { subscriptionService } from '@/server/services/subscription.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthorized = await authService.isAuthorizedAdminMutable(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, message: 'Acceso no autorizado al panel administrativo o validación CSRF fallida.' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID de solicitud requerido.' }, { status: 400 });
    }

    const result = await subscriptionService.approveRequest(id, 'Admin Panel');
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    console.error('Error approving subscription:', err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Error al aprobar la solicitud de suscripción.' },
      { status: 500 }
    );
  }
}
