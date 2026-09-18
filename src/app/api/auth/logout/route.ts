import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Sesión cerrada exitosamente.',
  });

  response.cookies.delete('calculaperu_auth_token');
  response.cookies.delete('calculaperu_pro_active');

  return response;
}
