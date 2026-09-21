import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { subscriptionService } from '@/server/services/subscription.service';

export async function GET(req: NextRequest) {
  const isAuthorized = await authService.isAuthorizedAdmin(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, message: 'Acceso no autorizado al panel administrativo.' },
      { status: 401 }
    );
  }

  try {
    const subscriptions = await subscriptionService.getAllRequests();
    return NextResponse.json({ success: true, subscriptions });
  } catch (err) {
    console.error('Error fetching admin subscriptions:', err);
    return NextResponse.json(
      { success: false, message: 'Error al obtener las solicitudes de suscripción.' },
      { status: 500 }
    );
  }
}
