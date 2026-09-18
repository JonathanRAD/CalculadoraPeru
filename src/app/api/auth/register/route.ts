import { NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { validateRegisterInput } from '@/server/validators/auth.validator';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const validation = validateRegisterInput(rawBody);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Datos de registro inválidos.' },
        { status: 400 }
      );
    }

    const result = await authService.register(validation.data);

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Cuenta creada con éxito. ¡Bienvenido a CalculaPerú!',
      user: result.user,
    });

    response.cookies.set('calculaperu_auth_token', result.token, {
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
