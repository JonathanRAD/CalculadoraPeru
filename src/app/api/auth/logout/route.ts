import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { userRepository } from '@/server/repositories/user.repository';

function expireCookie(response: NextResponse, name: string, domain?: string) {
  response.headers.append(
    'Set-Cookie',
    `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${domain ? `; Domain=${domain}` : ''}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  );
}

export async function POST(req: NextRequest) {
  try {
    const user = await authService.authenticateRequest(req);
    if (user) {
      const updated = await userRepository.update(user.id, { sessionVersion: (user.sessionVersion ?? 0) + 1 });
      if (!updated) throw new Error('No se pudo invalidar la sesión.');
    }

    const response = NextResponse.json(
      { success: true, message: 'Sesión cerrada exitosamente.' },
      { headers: { 'Cache-Control': 'no-store' } }
    );

    for (const name of ['calculaperu_auth_token', 'calculaperu_pro_active']) {
      expireCookie(response, name);
      // Clear cookies created by older deployments on the shared domain too.
      if (/^(?:[a-z0-9-]+\.)*calculaperu\.com\.pe(?::\d+)?$/i.test(req.headers.get('host') || req.nextUrl.host)) {
        expireCookie(response, name, '.calculaperu.com.pe');
      }
    }

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'No se pudo cerrar la sesión. Intenta de nuevo.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
