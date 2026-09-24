import { NextResponse } from 'next/server';
import { authService, getAuthCookieOptions } from '@/server/services/auth.service';
import { validateRegisterInput } from '@/server/validators/auth.validator';
import { checkAuthRateLimit } from '@/server/services/auth-rate-limit';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';

export async function POST(req: Request) {
  try {
    const rawBody = await readJsonBody(req, 4096);
    const validation = validateRegisterInput(rawBody);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Datos de registro inválidos.' },
        { status: 400 }
      );
    }

    if (!(await checkAuthRateLimit(req, 'register', validation.data.email))) {
      return NextResponse.json({ success: false, message: 'Demasiados registros. Vuelve a intentarlo en 15 minutos.' }, { status: 429 });
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

    response.cookies.set('calculaperu_auth_token', result.token, getAuthCookieOptions(req));

    return response;
  } catch (error) {
    console.error('Error en register:', error);
    return NextResponse.json(
      { success: false, message: error instanceof RequestBodyError ? error.message : 'No se pudo registrar la cuenta en este momento.' },
      { status: error instanceof RequestBodyError ? error.status : 503 }
    );
  }
}
