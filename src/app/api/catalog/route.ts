import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { catalogRepository } from '@/server/repositories/catalog.repository';
import { validateCatalogItemInput } from '@/server/validators/quote.validator';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';

export async function GET(req: NextRequest) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Inicia sesión para acceder a tu catálogo.' }, { status: 401 });
  }
  const isProActive = Boolean(user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date()));
  const hasHadPro = Boolean(user.isPro || user.proExpiresAt);
  if (!hasHadPro) {
    return NextResponse.json({ success: false, message: 'El catálogo guardado es exclusivo de CalculaPerú PRO.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || undefined;
  const statusParam = searchParams.get('status');
  const status = statusParam === 'all' || statusParam === 'archived' ? statusParam : 'active';

  try {
    const items = await catalogRepository.findByUserId(user.id, { status, query: search });
    return NextResponse.json({ success: true, isReadOnly: !isProActive, items });
  } catch (err) {
    console.error('Error listando catálogo:', err);
    return NextResponse.json({ success: false, message: 'Error interno al consultar catálogo.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Inicia sesión para agregar productos o servicios.' }, { status: 401 });
  }
  const isProActive = Boolean(user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date()));
  if (!isProActive) {
    return NextResponse.json(
      {
        success: false,
        code: 'PRO_EXPIRED',
        message: 'Tu suscripción PRO ha expirado. Reactiva tu plan para agregar ítems al catálogo.',
      },
      { status: 403 }
    );
  }

  try {
    const raw = await readJsonBody(req, 16384);
    const val = validateCatalogItemInput(raw);
    if (!val.isValid || !val.data) {
      return NextResponse.json({ success: false, message: val.error || 'Datos de ítem inválidos.' }, { status: 400 });
    }

    const created = await catalogRepository.create({
      userId: user.id,
      type: val.data.type,
      name: val.data.name,
      description: val.data.description,
      sku: val.data.sku,
      unit: val.data.unit,
      price: val.data.price,
      isIgvAffected: val.data.isIgvAffected,
      status: 'active',
    });

    return NextResponse.json({ success: true, item: created, message: 'Ítem agregado al catálogo.' });
  } catch (err) {
    console.error('Error agregando ítem:', err);
    return NextResponse.json(
      { success: false, message: err instanceof RequestBodyError ? err.message : 'Error al guardar ítem.' },
      { status: err instanceof RequestBodyError ? err.status : 500 }
    );
  }
}
