import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/server/services/subscription.service';
import { validateCreateSubscriptionInput } from '@/server/validators/subscription.validator';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const validation = validateCreateSubscriptionInput(rawBody);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Datos de suscripción incompletos.' },
        { status: 400 }
      );
    }

    const subscription = await subscriptionService.createRequest(validation.data);

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
      { success: false, message: 'Error en el servidor al registrar la suscripción.' },
      { status: 500 }
    );
  }
}
