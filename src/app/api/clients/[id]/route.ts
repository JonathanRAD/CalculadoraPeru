import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { clientRepository } from '@/server/repositories/client.repository';
import { validateClientInput } from '@/server/validators/quote.validator';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Inicia sesión para editar clientes.' }, { status: 401 });
  }
  if (!user.isPro) {
    return NextResponse.json({ success: false, message: 'Función exclusiva de CalculaPerú PRO.' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const raw = await readJsonBody(req, 16384);
    const val = validateClientInput(raw);
    if (!val.isValid || !val.data) {
      return NextResponse.json({ success: false, message: val.error || 'Datos de cliente inválidos.' }, { status: 400 });
    }

    const updated = await clientRepository.update(id, user.id, {
      name: val.data.name,
      docType: val.data.docType,
      docNumber: val.data.docNumber,
      phone: val.data.phone,
      email: val.data.email,
      address: val.data.address,
      notes: val.data.notes,
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Cliente no encontrado o no autorizado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, client: updated, message: 'Cliente actualizado.' });
  } catch (err) {
    console.error('Error actualizando cliente:', err);
    return NextResponse.json(
      { success: false, message: err instanceof RequestBodyError ? err.message : 'Error al actualizar cliente.' },
      { status: err instanceof RequestBodyError ? err.status : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Inicia sesión.' }, { status: 401 });
  }
  if (!user.isPro) {
    return NextResponse.json({ success: false, message: 'Función exclusiva de CalculaPerú PRO.' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const deleted = await clientRepository.delete(id, user.id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Cliente no encontrado o no autorizado.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Cliente archivado exitosamente.' });
  } catch (err) {
    console.error('Error eliminando cliente:', err);
    return NextResponse.json({ success: false, message: 'Error interno al eliminar cliente.' }, { status: 500 });
  }
}
