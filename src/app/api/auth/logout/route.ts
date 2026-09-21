import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const isCalculaPeru = host.includes('calculaperu.com.pe');

  const response = NextResponse.json({
    success: true,
    message: 'Sesión cerrada exitosamente.',
  });

  // Delete host-only cookie
  response.cookies.delete('calculaperu_auth_token');
  response.cookies.delete('calculaperu_pro_active');

  // Also delete domain-scoped cookie if on calculaperu.com.pe
  if (isCalculaPeru) {
    response.cookies.set('calculaperu_auth_token', '', { path: '/', maxAge: 0, domain: '.calculaperu.com.pe' });
    response.cookies.set('calculaperu_pro_active', '', { path: '/', maxAge: 0, domain: '.calculaperu.com.pe' });
  }

  return response;
}
