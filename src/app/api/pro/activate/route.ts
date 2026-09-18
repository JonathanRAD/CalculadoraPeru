import { NextRequest, NextResponse } from 'next/server';
import { licenseService } from '@/server/services/license.service';
import { authService } from '@/server/services/auth.service';
import { validateRedeemLicenseInput } from '@/server/validators/license.validator';
import { licenseRepository } from '@/server/repositories/license.repository';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const validation = validateRedeemLicenseInput(rawBody);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Por favor ingresa un código válido.' },
        { status: 400 }
      );
    }

    const { code } = validation.data;
    const currentUser = await authService.authenticateRequest(req);

    // CASE 1: USER IS LOGGED IN -> Bind and redeem license to their account
    if (currentUser) {
      const result = await licenseService.redeemLicense(code, currentUser.id, currentUser.email);
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 400 });
      }

      const response = NextResponse.json({
        success: true,
        message: result.message,
        user: currentUser,
        session: {
          isPro: true,
          plan: result.license?.plan,
          subscriberName: currentUser.name,
          code,
          expiresAt: result.license ? new Date(Date.now() + result.license.durationDays * 86400000).toISOString() : null,
        },
      });

      response.cookies.set('calculaperu_pro_active', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });

      return response;
    }

    // CASE 2: ANONYMOUS BROWSER SESSION
    const license = await licenseRepository.findByCode(code);

    if (!license) {
      return NextResponse.json(
        { success: false, message: 'Código de activación no válido o no encontrado en el sistema.' },
        { status: 404 }
      );
    }

    if (license.status === 'redeemed') {
      return NextResponse.json(
        {
          success: false,
          message: 'Este código ya fue canjeado previamente. Si eres el dueño de esta cuenta, inicia sesión para acceder desde cualquier dispositivo.',
        },
        { status: 409 }
      );
    }

    if (license.status === 'revoked') {
      return NextResponse.json(
        { success: false, message: 'Este código de licencia ha sido revocado por administración.' },
        { status: 403 }
      );
    }

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
      message: `¡Código validado! Tu plan ${license.plan === 'yearly' ? 'Anual' : 'Mensual'} está activo en este navegador. Te recomendamos registrarte o iniciar sesión para sincronizarlo en otros dispositivos.`,
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
