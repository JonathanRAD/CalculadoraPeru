import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { userRepository } from '@/server/repositories/user.repository';
import { validateCompanyProfileInput } from '@/server/validators/auth.validator';

export async function GET(req: NextRequest) {
  try {
    const user = await authService.authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Auto-check expiration
    if (user.isPro && user.proExpiresAt) {
      if (new Date(user.proExpiresAt) < new Date()) {
        const expiredUser = await userRepository.update(user.id, { isPro: false, plan: null });
        return NextResponse.json({ authenticated: true, user: expiredUser });
      }
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (err) {
    console.error('Error en auth me:', err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await authService.authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'No autenticado o sesión expirada.' }, { status: 401 });
    }

    const rawBody = await req.json();
    const validation = validateCompanyProfileInput(rawBody);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json({ success: false, message: validation.error || 'Datos inválidos.' }, { status: 400 });
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
  } catch (err: any) {
    console.error('Error actualizando perfil:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Error al actualizar el perfil.' },
      { status: 500 }
    );
  }
}
