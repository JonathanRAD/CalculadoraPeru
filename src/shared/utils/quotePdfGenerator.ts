import jsPDF from 'jspdf';
import { QuoteCalculatedItem, QuoteTotals } from '@/core/calculators/quote';
import { CompanyProfile } from '@/features/auth/types';

export interface QuotePdfOptions {
  quoteNumber: string;
  issueDate: string;
  validUntil?: string;
  company: CompanyProfile & {
    name?: string;
    email?: string;
    phone?: string;
  };
  client: {
    name: string;
    docType?: string;
    docNumber?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: QuoteCalculatedItem[];
  totals: QuoteTotals;
  paymentTerms?: string;
  deliveryTime?: string;
  publicNotes?: string;
}

const UNIT_LABELS: Record<string, string> = {
  unit: 'UND',
  service: 'SERV',
  hour: 'HRS',
  day: 'DÍAS',
  kg: 'KG',
  meter: 'MTR',
  pack: 'PAQ',
  other: 'OTRO',
};

function detectImageFormat(dataUri: string): 'PNG' | 'JPEG' | 'WEBP' {
  if (dataUri.startsWith('data:image/jpeg') || dataUri.startsWith('data:image/jpg')) {
    return 'JPEG';
  }
  if (dataUri.startsWith('data:image/webp')) {
    return 'WEBP';
  }
  return 'PNG';
}

export function buildQuotePdfDoc(options: QuotePdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;

  let currentY = 16;

  const formatMoney = (amount: number) =>
    `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const drawTopBar = () => {
    doc.setFillColor(15, 31, 25);
    doc.rect(0, 0, pageWidth, 4, 'F');
  };

  const drawFooter = (currentPage: number, totalPages: number) => {
    const footerY = pageHeight - 14;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 4, pageWidth - marginX, footerY - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Este documento es una cotización comercial (proforma) y no constituye un comprobante de pago.',
      marginX,
      footerY
    );
    doc.text(`Página ${currentPage} de ${totalPages}`, pageWidth - marginX, footerY, { align: 'right' });
  };

  drawTopBar();

  // 1. EMISOR Y LOGO
  const businessName = (options.company.companyName || options.company.name || 'EMISOR COMERCIAL').trim();
  const hasLogo = Boolean(
    options.company.companyLogoBase64 &&
    options.company.companyLogoBase64.startsWith('data:image/')
  );

  let headerLeftX = marginX;
  if (hasLogo && options.company.companyLogoBase64) {
    try {
      const format = detectImageFormat(options.company.companyLogoBase64);
      doc.addImage(options.company.companyLogoBase64, format, marginX, currentY, 26, 20, undefined, 'FAST');
      headerLeftX = marginX + 30;
    } catch {
      headerLeftX = marginX;
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  const splitBusiness = doc.splitTextToSize(businessName.toUpperCase(), pageWidth - headerLeftX - 70);
  doc.text(splitBusiness, headerLeftX, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  let businessInfoY = currentY + 5 + splitBusiness.length * 5;
  const businessDetails: string[] = [];
  if (options.company.companyRuc) businessDetails.push(`RUC: ${options.company.companyRuc}`);
  if (options.company.phone) businessDetails.push(`Tel: ${options.company.phone}`);
  if (options.company.email) businessDetails.push(`Email: ${options.company.email}`);

  if (businessDetails.length > 0) {
    doc.text(businessDetails.join('  •  '), headerLeftX, businessInfoY);
    businessInfoY += 4.5;
  }
  if (options.company.companyAddress) {
    const splitAddr = doc.splitTextToSize(`Dirección: ${options.company.companyAddress}`, pageWidth - headerLeftX - 70);
    doc.text(splitAddr, headerLeftX, businessInfoY);
  }

  // Tarjeta de correlativo
  const boxWidth = 58;
  const boxHeight = 22;
  const boxX = pageWidth - marginX - boxWidth;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(boxX, currentY, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('COTIZACIÓN COMERCIAL', boxX + boxWidth / 2, currentY + 6, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const displayQuoteNumber = options.quoteNumber || 'BORRADOR SIN NÚMERO';
  doc.text(displayQuoteNumber, boxX + boxWidth / 2, currentY + 13, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha: ${options.issueDate}`, boxX + boxWidth / 2, currentY + 18.5, { align: 'center' });

  currentY += Math.max(30, (businessInfoY - currentY) + 10);

  // 2. DATOS DEL CLIENTE Y OFERTA
  const clientBoxHeight = options.client.address ? 26 : 22;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(marginX, currentY, contentWidth, clientBoxHeight, 2, 2, 'F');

  // Columna Izquierda: Cliente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CLIENTE / DESTINATARIO:', marginX + 4, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(options.client.name, marginX + 4, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const clientSub: string[] = [];
  if (options.client.docNumber) {
    const docLabel = options.client.docType ? options.client.docType.toUpperCase() : 'DOC';
    clientSub.push(`${docLabel}: ${options.client.docNumber}`);
  }
  if (options.client.phone) clientSub.push(`Tel: ${options.client.phone}`);
  if (options.client.email) clientSub.push(`Email: ${options.client.email}`);
  if (clientSub.length > 0) {
    doc.text(clientSub.join('  •  '), marginX + 4, currentY + 16);
  }
  if (options.client.address) {
    doc.text(`Dirección: ${options.client.address}`, marginX + 4, currentY + 21);
  }

  // Columna Derecha: Oferta
  const rightColX = pageWidth - marginX - 60;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CONDICIONES DE LA OFERTA:', rightColX, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Moneda: Soles Peruanos (PEN)`, rightColX, currentY + 11);
  if (options.validUntil) {
    doc.text(`Válido hasta: ${options.validUntil}`, rightColX, currentY + 16);
  }

  currentY += clientBoxHeight + 6;

  // 3. TABLA DE CONCEPTOS
  const drawTableHeader = (y: number) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(marginX, y, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    doc.text('#', marginX + 2.5, y + 4.8);
    doc.text('DESCRIPCIÓN', marginX + 12, y + 4.8);
    doc.text('UND', marginX + 96, y + 4.8);
    doc.text('CANT.', marginX + 112, y + 4.8, { align: 'right' });
    doc.text('P. UNIT.', marginX + 138, y + 4.8, { align: 'right' });
    doc.text('DSCTO.', marginX + 158, y + 4.8, { align: 'right' });
    doc.text('TOTAL', pageWidth - marginX - 2.5, y + 4.8, { align: 'right' });
  };

  drawTableHeader(currentY);
  currentY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  for (let i = 0; i < options.items.length; i++) {
    const item = options.items[i];
    const descLines = doc.splitTextToSize(item.description, 80);
    const rowHeight = Math.max(7, descLines.length * 4.2 + 2.5);

    if (currentY + rowHeight > pageHeight - 55) {
      doc.addPage();
      drawTopBar();
      currentY = 16;
      drawTableHeader(currentY);
      currentY += 7;
    }

    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, currentY, contentWidth, rowHeight, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.text(String(i + 1), marginX + 2.5, currentY + 4.8);
    doc.text(descLines, marginX + 12, currentY + 4.8);
    doc.text(UNIT_LABELS[item.unit] || item.unit.toUpperCase(), marginX + 96, currentY + 4.8);
    doc.text(item.quantity.toString(), marginX + 112, currentY + 4.8, { align: 'right' });
    doc.text(formatMoney(item.unitPrice), marginX + 138, currentY + 4.8, { align: 'right' });

    if (item.discountAmount > 0) {
      doc.setTextColor(220, 38, 38);
      doc.text(`-${formatMoney(item.discountAmount)}`, marginX + 158, currentY + 4.8, { align: 'right' });
      doc.setTextColor(15, 23, 42);
    } else {
      doc.setTextColor(148, 163, 184);
      doc.text('-', marginX + 158, currentY + 4.8, { align: 'right' });
      doc.setTextColor(15, 23, 42);
    }

    doc.setFont('helvetica', 'bold');
    doc.text(formatMoney(item.netAmount), pageWidth - marginX - 2.5, currentY + 4.8, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + rowHeight, pageWidth - marginX, currentY + rowHeight);

    currentY += rowHeight;
  }

  // 4. CONDICIONES COMERCIALES Y TOTALES
  if (currentY + 45 > pageHeight - 25) {
    doc.addPage();
    drawTopBar();
    currentY = 20;
  } else {
    currentY += 4;
  }

  const totalsBoxWidth = 80;
  const totalsBoxX = pageWidth - marginX - totalsBoxWidth;
  let totalsY = currentY;

  // Condiciones comerciales a la izquierda
  const notesWidth = contentWidth - totalsBoxWidth - 8;
  let notesY = currentY;
  const notesList: string[] = [];
  if (options.paymentTerms) notesList.push(`Forma de pago: ${options.paymentTerms}`);
  if (options.deliveryTime) notesList.push(`Plazo de entrega: ${options.deliveryTime}`);
  if (options.publicNotes) notesList.push(options.publicNotes);

  if (notesList.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('CONDICIONES COMERCIALES Y OBSERVACIONES:', marginX, notesY + 3);
    notesY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    notesList.forEach((n) => {
      const split = doc.splitTextToSize(`• ${n}`, notesWidth);
      doc.text(split, marginX, notesY);
      notesY += split.length * 3.8;
    });
  }

  // Resumen de totales a la derecha
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsBoxX, totalsY, totalsBoxWidth, 38, 2, 2, 'FD');

  const addTotalRow = (label: string, value: string, isBold = false, isHighlight = false) => {
    totalsY += 6;
    if (isHighlight) {
      doc.setFillColor(15, 31, 25);
      doc.rect(totalsBoxX, totalsY - 4.5, totalsBoxWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
    } else {
      doc.setTextColor(isBold ? 15 : 71, isBold ? 23 : 85, isBold ? 42 : 105);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(8);
    }

    doc.text(label, totalsBoxX + 3, totalsY);
    doc.text(value, pageWidth - marginX - 3, totalsY, { align: 'right' });
  };

  addTotalRow('Subtotal Bruto:', formatMoney(options.totals.subtotalGross));
  if (options.totals.discountTotal > 0) {
    addTotalRow('Descuento Total:', `-${formatMoney(options.totals.discountTotal)}`);
  }
  if (options.totals.igvAmount > 0) {
    addTotalRow('Base Imponible:', formatMoney(options.totals.taxableBase));
    addTotalRow(`IGV (${(options.totals.igvRate * 100).toFixed(0)}%):`, formatMoney(options.totals.igvAmount));
  }
  addTotalRow('TOTAL A PAGAR:', formatMoney(options.totals.totalAmount), true, true);

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(p, totalPages);
  }

  return doc;
}

export function generateQuotePdf(options: QuotePdfOptions) {
  const doc = buildQuotePdfDoc(options);
  const cleanFilename = `Cotizacion_${(options.quoteNumber || 'borrador').replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;
  doc.save(cleanFilename);
}
