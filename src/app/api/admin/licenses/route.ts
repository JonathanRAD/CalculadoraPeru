import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { licenseService } from '@/server/services/license.service';
import { validateCreateLicenseInput } from '@/server/validators/license.validator';

export async function GET(req: NextRequest) {
  const isAuthorized = await authService.isAuthorizedAdmin(req);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, message: 'Acceso no autorizado al panel administrativo.' }, { status: 401 });
  }

  const licenses = await licenseService.getAllLicenses();
  return NextResponse.json({ success: true, licenses });
}

export async function POST(req: NextRequest) {
  const isAuthorized = await authService.isAuthorizedAdmin(req);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, message: 'Acceso no autorizado al panel administrativo.' }, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const validation = validateCreateLicenseInput(rawBody);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json({ success: false, message: validation.error || 'Datos inválidos.' }, { status: 400 });
    }

    const newLic = await licenseService.issueLicense(validation.data);

    return NextResponse.json({
      success: true,
      license: newLic,
      message: `Licencia ${newLic.code} generada exitosamente.`,
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Error al procesar la emisión de licencia.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuthorized = await authService.isAuthorizedAdmin(req);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, message: 'Acceso no autorizado al panel administrativo.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ success: false, message: 'Código de licencia requerido.' }, { status: 400 });
    }

    const result = await licenseService.revokeLicense(code, 'Admin Panel');
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return NextResponse.json({ success: false, message: 'Error al revocar la licencia.' }, { status: 500 });
  }
}
