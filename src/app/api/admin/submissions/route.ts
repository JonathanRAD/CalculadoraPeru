import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { contactSubmissionRepository } from '@/server/repositories/contact_submission.repository';

export async function GET(req: NextRequest) {
  const isAuthorized = await authService.isAuthorizedAdmin(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, message: 'Acceso no autorizado al panel administrativo.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const reviewStatus = searchParams.get('reviewStatus') || undefined;
    const emailStatus = searchParams.get('emailStatus') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    const result = await contactSubmissionRepository.findAll({
      page,
      limit,
      search,
      category,
      reviewStatus,
      emailStatus,
      dateFrom,
      dateTo,
    });

    return NextResponse.json({
      success: true,
      submissions: result.submissions,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar solicitudes.' },
      { status: 500 }
    );
  }
}
