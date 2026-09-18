import { NextRequest, NextResponse } from 'next/server';
import {
  findLicenseByCode,
  redeemLicense,
  verifyToken,
  findUserById,
  toSafeUser,
} from '@/features/auth/server/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = (body.code || '').trim().toUpperCase();

    if (!rawCode) {
      return NextResponse.json(
        { success: false, message: 'Por favor, ingresa un código de activación.' },
        { status: 400 }
      );
    }

    const token = req.cookies.get('calculaperu_auth_token')?.value;
    const authPayload = token ? verifyToken(token) : null;

    // CASE 1: USER IS LOGGED IN -> Bind and burn the license permanently to their account
    if (authPayload) {
      const user = findUserById(authPayload.userId);
      if (user) {
        const result = redeemLicense(rawCode, user.id);
        if (!result.success) {
          return NextResponse.json(
            { success: false, message: result.message },
            { status: 400 }
          );
        }

        const response = NextResponse.json({
          success: true,
          message: result.message,
          user: result.user,
          session: {
            isPro: true,
            plan: result.user?.plan,
            subscriberName: result.user?.name,
            code: rawCode,
            expiresAt: result.user?.proExpiresAt,
          },
        });

        // Set quick helper cookie
        response.cookies.set('calculaperu_pro_active', 'true', {
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
          sameSite: 'lax',
        });

        return response;
      }
    }

    // CASE 2: USER IS ANONYMOUS (Not logged in)
    const license = findLicenseByCode(rawCode);

    if (!license) {
      return NextResponse.json(
        {
          success: false,
          message: 'Código de activación no válido o no encontrado en el sistema.',
        },
        { status: 404 }
      );
    }

    if (license.status === 'redeemed') {
      return NextResponse.json(
        {
          success: false,
          message: `Este código de licencia ya fue canjeado previamente. Si eres el dueño de esta cuenta, inicia sesión para acceder desde cualquier dispositivo.`,
        },
        { status: 409 }
      );
    }

    if (license.status === 'revoked') {
      return NextResponse.json(
        { success: false, message: 'Este código de licencia ha sido revocado.' },
        { status: 403 }
      );
    }

    // Fallback anonymous session
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + license.durationDays);

    const sessionData = {
      isPro: true,
      plan: license.plan,
      subscriberName: license.assignedClientName,
      code: license.code,
      activatedAt: new Date().toISOString(),
      expiresAt: expirationDate.toISOString(),
      recommendLogin: true,
    };

    const response = NextResponse.json({
      success: true,
      message: `¡Código validado! Tu plan ${license.plan === 'yearly' ? 'Anual' : 'Mensual'} está activo en este navegador. Te recomendamos registrarte o iniciar sesión para no perder tu acceso y usarlo en otros dispositivos.`,
      session: sessionData,
    });

    response.cookies.set('calculaperu_pro_active', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * license.durationDays,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error al validar código PRO:', error);
    return NextResponse.json(
      { success: false, message: 'Ocurrió un error al procesar el código de activación.' },
      { status: 500 }
    );
  }
}
