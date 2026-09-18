import { NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword, signToken, updateUser, toSafeUser } from '@/features/auth/server/storage';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Por favor, ingresa tu correo y contraseña.' },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No existe ninguna cuenta registrada con este correo.' },
        { status: 404 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Contraseña incorrecta. Verifica tus datos.' },
        { status: 401 }
      );
    }

    // Update last login
    updateUser(user.id, { lastLoginAt: new Date().toISOString() });

    const safeUser = toSafeUser(user);
    const token = signToken({
      userId: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: `¡Bienvenido de nuevo, ${safeUser.name}!`,
      user: safeUser,
    });

    response.cookies.set('calculaperu_auth_token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error al iniciar sesión.' },
      { status: 500 }
    );
  }
}
