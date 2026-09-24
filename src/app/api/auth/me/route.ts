import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { userRepository } from '@/server/repositories/user.repository';
import { validateCompanyProfileInput } from '@/server/validators/auth.validator';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
  Pragma: 'no-cache',
};

export async function GET(req: NextRequest) {
  try {
    const user = await authService.authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { headers: NO_CACHE_HEADERS });
    }

    // Auto-check expiration
    if (user.isPro && user.proExpiresAt) {
      if (new Date(user.proExpiresAt) < new Date()) {
        const expiredUser = await userRepository.update(user.id, { isPro: false, plan: null });
        return NextResponse.json({ authenticated: true, user: expiredUser }, { headers: NO_CACHE_HEADERS });
      }
    }

    return NextResponse.json({ authenticated: true, user }, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error('Error en auth me:', err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await authService.authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'No autenticado o sesión expirada.' }, { status: 401 });
    }

    const rawBody = await readJsonBody(req, 500000) as Record<string, unknown>;
    const validation = validateCompanyProfileInput(rawBody);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json({ success: false, message: validation.error || 'Datos inválidos.' }, { status: 400 });
    }

    if (typeof rawBody.name === 'string' && rawBody.name.trim().length > 120) {
      return NextResponse.json({ success: false, message: 'El nombre es demasiado largo.' }, { status: 400 });
    }
    const updated = await userRepository.update(user.id, {
      name: typeof rawBody.name === 'string' && rawBody.name.trim() ? rawBody.name.trim() : user.name,
      companyName: validation.data.companyName,
      companyRuc: validation.data.companyRuc,
      companyAddress: validation.data.companyAddress,
      companyLogoBase64: validation.data.companyLogoBase64,
    });

    return NextResponse.json({
      success: true,
      message: 'Perfil de empresa actualizado con éxito.',
      user: updated,
    });
  } catch (err) {
    console.error('Error actualizando perfil:', err);
    return NextResponse.json(
      { success: false, message: err instanceof RequestBodyError ? err.message : 'Error al actualizar el perfil.' },
      { status: err instanceof RequestBodyError ? err.status : 500 }
    );
  }
}
