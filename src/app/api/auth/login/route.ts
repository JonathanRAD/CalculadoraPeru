import { NextResponse } from 'next/server';
import { authService, getAuthCookieOptions } from '@/server/services/auth.service';
import { validateLoginInput } from '@/server/validators/auth.validator';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const validation = validateLoginInput(rawBody);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Por favor ingresa tus credenciales.' },
        { status: 400 }
      );
    }

    const result = await authService.login(validation.data);

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: `¡Bienvenido de nuevo, ${result.user.name}!`,
      user: result.user,
    });

    response.cookies.set('calculaperu_auth_token', result.token, getAuthCookieOptions(req));

    return response;
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error al iniciar sesión.' },
      { status: 500 }
    );
  }
}
