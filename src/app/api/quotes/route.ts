import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { quoteRepository } from '@/server/repositories/quote.repository';
import { calculateQuote, QuoteStatus } from '@/core/calculators/quote';
import { validateQuoteInput } from '@/server/validators/quote.validator';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';

export async function GET(req: NextRequest) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Inicia sesión para ver tus cotizaciones.' }, { status: 401 });
  }
  const isProActive = Boolean(user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date()));
  const hasHadPro = Boolean(user.isPro || user.proExpiresAt);

  if (!hasHadPro) {
    return NextResponse.json({ success: false, message: 'El historial en la nube es exclusivo de CalculaPerú PRO.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || undefined;
  const statusParam = searchParams.get('status') as QuoteStatus | 'all' | null;
  const status = statusParam || 'all';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const offset = (page - 1) * limit;
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;

  try {
    const { quotes, total } = await quoteRepository.findByUserId(user.id, {
      query: search,
      status,
      limit,
      offset,
      dateFrom,
      dateTo,
    });

    return NextResponse.json({
      success: true,
      isReadOnly: !isProActive,
      quotes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('Error listando cotizaciones:', err);
    return NextResponse.json({ success: false, message: 'Error interno al consultar cotizaciones.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Inicia sesión para guardar cotizaciones en tu cuenta.' },
      { status: 401 }
    );
  }
  const isProActive = Boolean(user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date()));
  if (!isProActive) {
    return NextResponse.json(
      {
        success: false,
        code: 'PRO_EXPIRED',
        message: user.proExpiresAt
          ? 'Tu suscripción PRO ha expirado. Tu cuenta se encuentra en modo de solo lectura; puedes consultar y exportar tus cotizaciones existentes, pero para emitir nuevas debes reactivar tu plan.'
          : 'Guardar y gestionar cotizaciones es un beneficio exclusivo de CalculaPerú PRO.',
      },
      { status: 403 }
    );
  }

  try {
    const raw = await readJsonBody(req, 131072);
    const val = validateQuoteInput(raw);
    if (!val.isValid || !val.data) {
      return NextResponse.json(
        { success: false, message: val.error || 'Datos de la cotización inválidos.' },
        { status: 400 }
      );
    }

    const payload = val.data;

    // Recalcular de forma autoritativa en el servidor
    const calc = calculateQuote({
      items: payload.items,
      includeIgv: payload.includeIgv,
      igvRate: payload.igvRate,
      globalDiscountType: payload.globalDiscountType,
      globalDiscountValue: payload.globalDiscountValue,
    });

    if (!calc.isValid) {
      return NextResponse.json(
        { success: false, message: calc.errors.join(' ') },
        { status: 400 }
      );
    }

    const saved = await quoteRepository.create(
      {
        userId: user.id,
        prefix: payload.prefix,
        clientId: payload.clientId,
        clientName: payload.clientName,
        clientDocType: payload.clientDocType,
        clientDocNumber: payload.clientDocNumber,
        clientPhone: payload.clientPhone,
        clientEmail: payload.clientEmail,
        clientAddress: payload.clientAddress,
        issueDate: payload.issueDate,
        validUntil: payload.validUntil,
        currency: 'PEN',
        subtotalGross: calc.totals.subtotalGross,
        itemsDiscountTotal: calc.totals.itemsDiscountTotal,
        globalDiscountType: payload.globalDiscountType,
        globalDiscountValue: payload.globalDiscountValue,
        globalDiscountAmount: calc.totals.globalDiscountAmount,
        discountTotal: calc.totals.discountTotal,
        subtotalNet: calc.totals.subtotalNet,
        taxableBase: calc.totals.taxableBase,
        exemptBase: calc.totals.exemptBase,
        igvRate: calc.totals.igvRate,
        igvAmount: calc.totals.igvAmount,
        totalAmount: calc.totals.totalAmount,
        paymentTerms: payload.paymentTerms,
        deliveryTime: payload.deliveryTime,
        publicNotes: payload.publicNotes,
        internalNotes: payload.internalNotes,
        status: payload.status,
      },
      calc.items.map(it => ({
        catalogItemId: it.catalogItemId || undefined,
        sortOrder: it.sortOrder,
        description: it.description,
        type: it.type,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountType: it.discountType,
        discountValue: it.discountValue,
        discountAmount: it.discountAmount,
        isIgvAffected: it.isIgvAffected,
        grossAmount: it.grossAmount,
        netAmount: it.netAmount,
      }))
    );

    return NextResponse.json({
      success: true,
      quote: saved.quote,
      items: saved.items,
      message: `Cotización ${saved.quote.quoteNumber} guardada exitosamente.`,
    });
  } catch (err) {
    console.error('Error guardando cotización:', err);
    return NextResponse.json(
      { success: false, message: err instanceof RequestBodyError ? err.message : 'Error al guardar cotización.' },
      { status: err instanceof RequestBodyError ? err.status : 500 }
    );
  }
}
