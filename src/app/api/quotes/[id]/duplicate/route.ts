import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { quoteRepository } from '@/server/repositories/quote.repository';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Inicia sesión.' }, { status: 401 });
  }
  const isProActive = Boolean(user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date()));
  if (!isProActive) {
    return NextResponse.json(
      {
        success: false,
        code: 'PRO_EXPIRED',
        message: 'Tu suscripción PRO ha expirado. Reactiva tu plan para duplicar cotizaciones.',
      },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const duplicated = await quoteRepository.duplicate(id, user.id);
    if (!duplicated) {
      return NextResponse.json({ success: false, message: 'Cotización no encontrada o no autorizada.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      quote: duplicated.quote,
      items: duplicated.items,
      message: `Cotización duplicada con éxito bajo el correlativo ${duplicated.quote.quoteNumber}.`,
    });
  } catch (err) {
    console.error('Error duplicando cotización:', err);
    return NextResponse.json({ success: false, message: 'Error interno al duplicar cotización.' }, { status: 500 });
  }
}
