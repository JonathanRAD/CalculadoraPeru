import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, findUserById, updateUser, toSafeUser } from '@/features/auth/server/storage';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('calculaperu_auth_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = findUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Auto-check expiration
    if (user.isPro && user.proExpiresAt) {
      if (new Date(user.proExpiresAt) < new Date()) {
        const expiredUser = updateUser(user.id, { isPro: false });
        return NextResponse.json({ authenticated: true, user: expiredUser });
      }
    }

    return NextResponse.json({ authenticated: true, user: toSafeUser(user) });
  } catch (err) {
    console.error('Error en auth me:', err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('calculaperu_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'No autenticado.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Sesión inválida o expirada.' }, { status: 401 });
    }

    const body = await req.json();
    const allowedUpdates: Record<string, any> = {};

    if (typeof body.name === 'string' && body.name.trim()) {
      allowedUpdates.name = body.name.trim();
    }
    if (typeof body.companyName === 'string') {
      allowedUpdates.companyName = body.companyName.trim();
    }
    if (typeof body.companyRuc === 'string') {
      allowedUpdates.companyRuc = body.companyRuc.trim();
    }
    if (typeof body.companyAddress === 'string') {
      allowedUpdates.companyAddress = body.companyAddress.trim();
    }
    if (body.companyLogoBase64 !== undefined) {
      allowedUpdates.companyLogoBase64 = body.companyLogoBase64;
    }

    const updated = updateUser(payload.userId, allowedUpdates);

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
