import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/server/services/auth.service';
import { quoteRepository } from '@/server/repositories/quote.repository';
import { calculateQuote } from '@/core/calculators/quote';
import { validateQuoteInput } from '@/server/validators/quote.validator';
import { readJsonBody, RequestBodyError } from '@/server/validators/request-body';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Inicia sesión.' }, { status: 401 });
  }

  const isProActive = Boolean(user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date()));
  const hasHadPro = Boolean(user.isPro || user.proExpiresAt);
  if (!hasHadPro) {
    return NextResponse.json({ success: false, message: 'Función exclusiva de CalculaPerú PRO.' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const data = await quoteRepository.findById(id, user.id);
    if (!data) {
      return NextResponse.json({ success: false, message: 'Cotización no encontrada o no autorizada.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, isReadOnly: !isProActive, quote: data.quote, items: data.items });
  } catch (err) {
    console.error('Error obteniendo cotización:', err);
    return NextResponse.json({ success: false, message: 'Error interno al consultar cotización.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Inicia sesión.' }, { status: 401 });
  }
  const isProActive = Boolean(user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date()));
  if (!isProActive) {
    return NextResponse.json(
      {
        success: false,
        code: 'PRO_EXPIRED',
        message: 'Tu suscripción PRO ha expirado. Tu cuenta se encuentra en modo de solo lectura y no permite editar cotizaciones.',
      },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const raw = await readJsonBody(req, 131072);
    const val = validateQuoteInput(raw);
    if (!val.isValid || !val.data) {
      return NextResponse.json({ success: false, message: val.error || 'Datos inválidos.' }, { status: 400 });
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
      return NextResponse.json({ success: false, message: calc.errors.join(' ') }, { status: 400 });
    }

    const updated = await quoteRepository.update(
      id,
      user.id,
      {
        clientId: payload.clientId,
        clientName: payload.clientName,
        clientDocType: payload.clientDocType,
        clientDocNumber: payload.clientDocNumber,
        clientPhone: payload.clientPhone,
        clientEmail: payload.clientEmail,
        clientAddress: payload.clientAddress,
        issueDate: payload.issueDate,
        validUntil: payload.validUntil,
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

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Cotización no encontrada o no autorizada.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      quote: updated.quote,
      items: updated.items,
      message: 'Cotización actualizada correctamente.',
    });
  } catch (err) {
    console.error('Error actualizando cotización:', err);
    return NextResponse.json(
      { success: false, message: err instanceof RequestBodyError ? err.message : 'Error al actualizar cotización.' },
      { status: err instanceof RequestBodyError ? err.status : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Inicia sesión.' }, { status: 401 });
  }
  const isProActive = Boolean(user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date()));
  if (!isProActive) {
    return NextResponse.json(
      {
        success: false,
        code: 'PRO_EXPIRED',
        message: 'Tu suscripción PRO ha expirado. Tu cuenta se encuentra en modo de solo lectura y no permite eliminar ni anular cotizaciones.',
      },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const deleted = await quoteRepository.delete(id, user.id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Cotización no encontrada o no autorizada.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Cotización eliminada de forma segura.' });
  } catch (err) {
    console.error('Error eliminando cotización:', err);
    return NextResponse.json({ success: false, message: 'Error interno al eliminar cotización.' }, { status: 500 });
  }
}
