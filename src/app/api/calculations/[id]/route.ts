import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { savedCalculationRepository } from '@/server/repositories/saved_calculation.repository';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Sesión no iniciada.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await savedCalculationRepository.deleteById(id, user.id);
    return NextResponse.json({
      success: deleted,
      message: 'Cálculo eliminado correctamente de tu cuenta.',
    });
  } catch (error) {
    console.error('Error al eliminar cálculo:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno al eliminar cálculo.' },
      { status: 500 }
    );
  }
}
