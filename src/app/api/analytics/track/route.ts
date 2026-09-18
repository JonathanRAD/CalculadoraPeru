import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { analyticsRepository } from '@/server/repositories/analytics.repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPath = typeof body.path === 'string' ? body.path.trim() : '/';
    const eventType = body.eventType === 'search' ? 'search' : 'page_view';
    const query = typeof body.query === 'string' ? body.query.trim().slice(0, 100) : undefined;
    const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 300) : undefined;

    // Filter out internal admin routes
    if (rawPath.startsWith('/admin') || rawPath.startsWith('/api')) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|opera mini|iemobile/i.test(userAgent);
    const device = isMobile ? 'mobile' : 'desktop';

    // Privacy-preserving daily anonymized session ID (salted hash, IP is never stored)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anon';
    const today = new Date().toISOString().slice(0, 10);
    const sessionId = crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}-${today}-calculaperu-privacy`)
      .digest('hex')
      .slice(0, 16);

    await analyticsRepository.recordEvent({
      eventType,
      path: rawPath,
      query,
      referrer,
      device,
      sessionId,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Error tracking analytics event:', err);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
