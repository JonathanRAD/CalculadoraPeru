import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { adminService } from '@/server/services/admin.service';

export async function GET(req: NextRequest) {
  const isAuthorized = await authService.isAuthorizedAdmin(req);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, message: 'Acceso no autorizado al panel administrativo.' }, { status: 401 });
  }

  const users = await adminService.getAllUsers();
  return NextResponse.json({ success: true, users });
}

export async function POST(req: NextRequest) {
  const isAuthorized = await authService.isAuthorizedAdminMutable(req);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, message: 'Acceso no autorizado al panel administrativo o validación CSRF fallida.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = body.userId;
    const plan = body.plan === 'monthly' ? 'monthly' : 'yearly';
    const isPro = body.isPro !== false;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'El ID de usuario es requerido.' }, { status: 400 });
    }

    const result = await adminService.toggleUserPro(userId, isPro, 'Admin Panel', plan);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return NextResponse.json({ success: false, message: 'Error al actualizar el estado del usuario.' }, { status: 500 });
  }
}
