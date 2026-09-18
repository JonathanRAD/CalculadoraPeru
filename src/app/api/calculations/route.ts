import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { savedCalculationRepository } from '@/server/repositories/saved_calculation.repository';

export async function GET(req: NextRequest) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Sesión no iniciada.' }, { status: 401 });
  }

  try {
    const calculations = await savedCalculationRepository.findByUserId(user.id);
    return NextResponse.json({ success: true, calculations });
  } catch (error) {
    console.error('Error al listar cálculos:', error);
    return NextResponse.json({ success: false, message: 'Error interno al consultar cálculos.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Inicia sesión para guardar cálculos en tu cuenta.' },
      { status: 401 }
    );
  }

  if (!user.isPro) {
    return NextResponse.json(
      { success: false, message: 'El guardado en la nube es un beneficio exclusivo de CalculaPerú PRO.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { calculatorType, title, summaryText, totalAmount, data } = body;

    if (!calculatorType || !title) {
      return NextResponse.json(
        { success: false, message: 'Tipo de calculadora y título son obligatorios.' },
        { status: 400 }
      );
    }

    const saved = await savedCalculationRepository.save({
      userId: user.id,
      calculatorType,
      title,
      summaryText,
      totalAmount: typeof totalAmount === 'number' ? totalAmount : undefined,
      data: data || {},
    });

    return NextResponse.json({
      success: true,
      calculation: saved,
      message: 'Cálculo guardado exitosamente en tu cuenta.',
    });
  } catch (error) {
    console.error('Error al guardar cálculo:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al guardar cálculo.' },
      { status: 500 }
    );
  }
}
