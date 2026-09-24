import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { clientRepository } from '@/server/repositories/client.repository';
import { validateClientInput } from '@/server/validators/quote.validator';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';

export async function GET(req: NextRequest) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Inicia sesión para acceder a tus clientes.' }, { status: 401 });
  }
  const isProActive = Boolean(user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date()));
  const hasHadPro = Boolean(user.isPro || user.proExpiresAt);
  if (!hasHadPro) {
    return NextResponse.json({ success: false, message: 'La libreta de clientes es exclusiva de CalculaPerú PRO.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || undefined;

  try {
    const clients = await clientRepository.findByUserId(user.id, search);
    return NextResponse.json({ success: true, isReadOnly: !isProActive, clients });
  } catch (err) {
    console.error('Error listando clientes:', err);
    return NextResponse.json({ success: false, message: 'Error interno al consultar clientes.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Inicia sesión para guardar clientes.' }, { status: 401 });
  }
  const isProActive = Boolean(user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date()));
  if (!isProActive) {
    return NextResponse.json(
      {
        success: false,
        code: 'PRO_EXPIRED',
        message: 'Tu suscripción PRO ha expirado. Reactiva tu plan para registrar nuevos clientes.',
      },
      { status: 403 }
    );
  }

  try {
    const raw = await readJsonBody(req, 16384);
    const val = validateClientInput(raw);
    if (!val.isValid || !val.data) {
      return NextResponse.json({ success: false, message: val.error || 'Datos de cliente inválidos.' }, { status: 400 });
    }

    const created = await clientRepository.create({
      userId: user.id,
      name: val.data.name,
      docType: val.data.docType,
      docNumber: val.data.docNumber,
      phone: val.data.phone,
      email: val.data.email,
      address: val.data.address,
      notes: val.data.notes,
      status: 'active',
    });

    return NextResponse.json({ success: true, client: created, message: 'Cliente registrado correctamente.' });
  } catch (err) {
    console.error('Error registrando cliente:', err);
    return NextResponse.json(
      { success: false, message: err instanceof RequestBodyError ? err.message : 'Error al registrar cliente.' },
      { status: err instanceof RequestBodyError ? err.status : 500 }
    );
  }
}
