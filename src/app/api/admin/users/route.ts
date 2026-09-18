import { NextRequest, NextResponse } from 'next/server';
import {
  getAllUsers,
  activateUserProDirectly,
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
    return NextResponse.json({ success: false, message: 'Acceso no autorizado.' }, { status: 401 });
  }

  const users = getAllUsers();
  return NextResponse.json({ success: true, users });
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Acceso no autorizado.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = body.userId;
    const plan = body.plan === 'monthly' ? 'monthly' : 'yearly';
    const durationDays = body.durationDays ? parseInt(body.durationDays, 10) : undefined;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'El ID de usuario es requerido.' }, { status: 400 });
    }

    const updatedUser = activateUserProDirectly(userId, plan, durationDays);

    return NextResponse.json({
      success: true,
      message: `Plan ${plan === 'yearly' ? 'Anual' : 'Mensual'} activado directamente para ${updatedUser.name} (${updatedUser.email}).`,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error('Error activando PRO a usuario:', err);
    return NextResponse.json({ success: false, message: err.message || 'Error al activar PRO.' }, { status: 500 });
  }
}
