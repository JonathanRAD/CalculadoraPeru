import { NextRequest, NextResponse } from 'next/server';
import { licenseService } from '@/server/services/license.service';
import { authService } from '@/server/services/auth.service';
import { validateRedeemLicenseInput } from '@/server/validators/license.validator';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await readJsonBody(req, 2048);
    const validation = validateRedeemLicenseInput(rawBody);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Por favor ingresa un código válido.' },
        { status: 400 }
      );
    }

    const { code } = validation.data;
    const currentUser = await authService.authenticateRequest(req);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Inicia sesión o crea una cuenta para vincular tu código PRO.' },
        { status: 401 }
      );
    }

    const result = await licenseService.redeemLicense(code, currentUser.id, currentUser.email);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      message: result.message,
      user: await authService.authenticateRequest(req),
    });
  } catch (error) {
    console.error('Error al validar código PRO:', error);
    return NextResponse.json(
      { success: false, message: error instanceof RequestBodyError ? error.message : 'Ocurrió un error al procesar el código de activación.' },
      { status: error instanceof RequestBodyError ? error.status : 500 }
    );
  }
}
