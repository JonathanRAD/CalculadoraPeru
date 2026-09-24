import { NextResponse } from 'next/server';
import { isValidPromoCode } from '@/server/validators/subscription.validator';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';
import { checkAuthRateLimit } from '@/server/services/auth-rate-limit';

export async function POST(req: Request) {
  try {
    const body = await readJsonBody(req, 256) as Record<string, unknown>;
    if (typeof body.code !== 'string' || body.code.length > 40) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }
    if (!(await checkAuthRateLimit(req, 'coupon', body.code.trim().toUpperCase()))) {
      return NextResponse.json({ valid: false, message: 'Demasiados intentos. Intenta más tarde.' }, { status: 429 });
    }
    return NextResponse.json({ valid: isValidPromoCode(body.code) });
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: error instanceof RequestBodyError ? error.status : 503 });
  }
}
