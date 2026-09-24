import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { catalogRepository } from '@/server/repositories/catalog.repository';
import { validateCatalogItemInput } from '@/server/validators/quote.validator';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';

export async function PUT(
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
    const raw = await readJsonBody(req, 16384);
    const val = validateCatalogItemInput(raw);
    if (!val.isValid || !val.data) {
      return NextResponse.json({ success: false, message: val.error || 'Datos de ítem inválidos.' }, { status: 400 });
    }

    const updated = await catalogRepository.update(id, user.id, {
      type: val.data.type,
      name: val.data.name,
      description: val.data.description,
      sku: val.data.sku,
      unit: val.data.unit,
      price: val.data.price,
      isIgvAffected: val.data.isIgvAffected,
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Ítem no encontrado o no autorizado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated, message: 'Ítem actualizado exitosamente.' });
  } catch (err) {
    console.error('Error actualizando ítem:', err);
    return NextResponse.json(
      { success: false, message: err instanceof RequestBodyError ? err.message : 'Error al actualizar ítem.' },
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
    const archived = await catalogRepository.archive(id, user.id);
    if (!archived) {
      return NextResponse.json({ success: false, message: 'Ítem no encontrado o no autorizado.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Ítem archivado del catálogo.' });
  } catch (err) {
    console.error('Error archivando ítem:', err);
    return NextResponse.json({ success: false, message: 'Error interno al archivar ítem.' }, { status: 500 });
  }
}
