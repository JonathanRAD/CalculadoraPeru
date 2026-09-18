import { NextRequest, NextResponse } from 'next/server';
import {
  getAllLicenses,
  createLicense,
  verifyToken,
  findUserById,
} from '@/features/auth/server/storage';

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'admin2026';

function isAuthorizedAdmin(req: NextRequest): boolean {
  const headerKey = req.headers.get('x-admin-secret');
  if (headerKey && headerKey === ADMIN_KEY) return true;

  const token = req.cookies.get('calculaperu_auth_token')?.value;
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = findUserById(payload.userId);
      if (user && user.role === 'admin') return true;
    }
  }

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Acceso no autorizado al panel administrativo.' }, { status: 401 });
  }

  const licenses = getAllLicenses();
  return NextResponse.json({ success: true, licenses });
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Acceso no autorizado al panel administrativo.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const plan = body.plan === 'monthly' ? 'monthly' : 'yearly';
    const clientName = (body.clientName || '').trim();
    const clientEmail = (body.clientEmail || '').trim();
    const durationDays = body.durationDays ? parseInt(body.durationDays, 10) : undefined;

    if (!clientName) {
      return NextResponse.json({ success: false, message: 'El nombre o razón social del cliente es obligatorio.' }, { status: 400 });
    }

    const newLic = createLicense({
      plan,
      clientName,
      clientEmail: clientEmail || undefined,
      durationDays,
      createdBy: 'Admin Panel',
    });

    return NextResponse.json({
      success: true,
      message: `Licencia ${newLic.code} generada exitosamente.`,
      license: newLic,
    });
  } catch (err: any) {
    console.error('Error generando licencia:', err);
    return NextResponse.json({ success: false, message: err.message || 'Error al generar licencia.' }, { status: 500 });
  }
}
