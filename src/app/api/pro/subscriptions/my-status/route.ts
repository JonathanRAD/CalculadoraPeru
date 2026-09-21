import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { subscriptionRequestRepository } from '@/server/repositories/subscription_request.repository';

export async function GET(req: NextRequest) {
  try {
    const user = await authService.authenticateRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Debes iniciar sesión para consultar tus solicitudes.' },
        { status: 401 }
      );
    }

    const all = await subscriptionRequestRepository.findAll();
    const userRequests = all.filter(
      r =>
        (r.userId && r.userId === user.id) ||
        r.customerEmail.toLowerCase() === user.email.toLowerCase()
    );

    return NextResponse.json({
      success: true,
      subscriptions: userRequests,
    });
  } catch (err) {
    console.error('Error fetching my-status subscriptions:', err);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar solicitudes.' },
      { status: 500 }
    );
  }
}
