import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { savedCalculationRepository } from '@/server/repositories/saved_calculation.repository';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';

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
    const body = await readJsonBody(req, 65536) as Record<string, unknown>;
    const { calculatorType, title, summaryText, totalAmount, data } = body;

    if (typeof calculatorType !== 'string' || !/^[a-z0-9_-]{1,80}$/.test(calculatorType) ||
      typeof title !== 'string' || !title.trim() || title.length > 120 ||
      (summaryText !== undefined && (typeof summaryText !== 'string' || summaryText.length > 1000)) ||
      (totalAmount !== undefined && (typeof totalAmount !== 'number' || !Number.isFinite(totalAmount))) ||
      (data !== undefined && (typeof data !== 'object' || data === null || Array.isArray(data)))
    ) {
      return NextResponse.json(
        { success: false, message: 'Datos del cálculo inválidos o demasiado largos.' },
        { status: 400 }
      );
    }

    const saved = await savedCalculationRepository.save({
      userId: user.id,
      calculatorType,
      title: title.trim(),
      summaryText: summaryText as string | undefined,
      totalAmount: typeof totalAmount === 'number' ? totalAmount : undefined,
      data: (data || {}) as Record<string, unknown>,
    });

    return NextResponse.json({
      success: true,
      calculation: saved,
      message: 'Cálculo guardado exitosamente en tu cuenta.',
    });
  } catch (error) {
    console.error('Error al guardar cálculo:', error);
    return NextResponse.json(
      { success: false, message: error instanceof RequestBodyError ? error.message : 'Error interno al guardar cálculo.' },
      { status: error instanceof RequestBodyError ? error.status : 500 }
    );
  }
}
