import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { subscriptionService } from '@/server/services/subscription.service';
import { subscriptionRequestRepository } from '@/server/repositories/subscription_request.repository';
import { validateCreateSubscriptionInput } from '@/server/validators/subscription.validator';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';

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
    console.error('Error fetching user subscription status:', err);
    return NextResponse.json(
      { success: false, message: 'Error al consultar estado de suscripciones.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authService.authenticateRequest(req);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Debes iniciar sesión en tu cuenta de CalculaPerú antes de solicitar la versión PRO.',
        },
        { status: 401 }
      );
    }

    const rawBody = await readJsonBody(req, 4096);
    const validation = validateCreateSubscriptionInput(rawBody);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Datos de suscripción incompletos.' },
        { status: 400 }
      );
    }

    const subscription = await subscriptionService.createRequest({
      ...validation.data,
      customerEmail: user.email, // Securely bind to authenticated email
      userId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        subscription,
        message: 'Tu solicitud de pago ha sido registrada con éxito en el sistema.',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating subscription request:', err);
    return NextResponse.json(
      { success: false, message: err instanceof RequestBodyError ? err.message : 'Error en el servidor al registrar la suscripción.' },
      { status: err instanceof RequestBodyError ? err.status : 500 }
    );
  }
}
