import { NextResponse } from 'next/server';
import { createUser, signToken } from '@/features/auth/server/storage';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Por favor ingresa tu nombre completo o de empresa.' },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Por favor ingresa un correo electrónico válido.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const newUser = createUser({
      name,
      email,
      password,
      role: 'user',
    });

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Cuenta creada con éxito. ¡Bienvenido a CalculaPerú!',
      user: newUser,
    });

    // 30 days session cookie
    response.cookies.set('calculaperu_auth_token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    console.error('Error en register:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error al registrar la cuenta.' },
      { status: 400 }
    );
  }
}
