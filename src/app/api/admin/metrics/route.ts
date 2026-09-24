import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { adminService } from '@/server/services/admin.service';
import { analyticsRepository } from '@/server/repositories/analytics.repository';
import { isSupabaseConfigured } from '@/server/config/supabase';

export async function GET(req: NextRequest) {
  const isAuthorized = await authService.isAuthorizedAdmin(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, message: 'Acceso no autorizado al panel administrativo.' },
      { status: 401 }
    );
  }

  try {
    const startedAt = performance.now();
    const [metrics, logs, analytics] = await Promise.all([
      adminService.getDashboardMetrics(),
      adminService.getRecentAuditLogs(30),
      analyticsRepository.getAnalyticsSummary(14),
    ]);

    // Strictly 100% real analytics data from telemetry events
    const trafficHistory = analytics.trafficHistory;
    const topCalculators = analytics.topPages.map(p => ({
      name: p.name,
      slug: p.path,
      visits: p.visits,
      share: p.share,
    }));
    const totalPeriodVisits = analytics.totalPeriodVisits;

    const systemHealth = {
      supabase: isSupabaseConfigured ? 'connected' : 'local_fallback',
      dbLatencyMs: Math.round(performance.now() - startedAt),
      authStatus: process.env.AUTH_SECRET ? 'configured' : 'development',
      resendEmail: Boolean(process.env.RESEND_API_KEY) ? 'configured' : 'not_configured',
      nodeEnv: process.env.NODE_ENV || 'development',
      serverTime: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      metrics: {
        ...metrics,
        totalPeriodVisits,
      },
      liveActiveVisitors: analytics.liveActiveVisitors,
      trafficHistory,
      topCalculators,
      topSearches: analytics.topSearches,
      deviceShare: analytics.deviceShare,
      systemHealth,
      recentLogs: logs,
    });
  } catch (error) {
    console.error('Error obteniendo métricas admin:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno obteniendo métricas.' },
      { status: 500 }
    );
  }
}
