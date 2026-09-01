import jsPDF from 'jspdf';

export interface PdfReportItem {
  label: string;
  value: string;
  isHighlight?: boolean;
}

export interface PdfReportOptions {
  title: string;
  subtitle?: string;
  calculatedFor?: string;
  items: PdfReportItem[];
  notes?: string[];
  businessName?: string;
  businessRuc?: string;
  businessPhone?: string;
  totalLabel?: string;
  totalValue?: string;
}

/**
 * Genera y descarga un reporte oficial en PDF con diseño limpio y membrete institucional.
 */
export function generateOfficialPdf(options: PdfReportOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 20;

  // Header Banner
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Header Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(options.businessName || 'CALCULAPERÚ', 20, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  const dateStr = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Fecha de emisión: ${dateStr}`, pageWidth - 20, currentY - 2, { align: 'right' });
  doc.text(`Herramientas de cálculo para Perú • calculaperu.com.pe`, pageWidth - 20, currentY + 3, { align: 'right' });

  if (options.businessRuc || options.businessPhone) {
    currentY += 6;
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const subHeader = [
      options.businessRuc ? `RUC: ${options.businessRuc}` : '',
      options.businessPhone ? `WhatsApp: ${options.businessPhone}` : '',
    ].filter(Boolean).join('  |  ');
    doc.text(subHeader, 20, currentY);
  }

  currentY += 12;

  // Divider line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(20, currentY, pageWidth - 20, currentY);

  currentY += 10;

  // Document Title Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(20, currentY, pageWidth - 40, 20, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(options.title, 25, currentY + 9);

  if (options.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(options.subtitle, 25, currentY + 15);
  }

  currentY += 28;

  // Items Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('CONCEPTO / DETALLE', 25, currentY);
  doc.text('IMPORTE (PEN)', pageWidth - 25, currentY, { align: 'right' });

  currentY += 3;
  doc.setDrawColor(203, 213, 225);
  doc.line(20, currentY, pageWidth - 20, currentY);
  currentY += 6;

  options.items.forEach((item, index) => {
    // Alternating rows
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, currentY - 4, pageWidth - 40, 7.5, 'F');
    }

    if (item.isHighlight) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105); // Emerald 600
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85); // Slate 700
    }

    doc.setFontSize(9.5);
    doc.text(item.label, 25, currentY);
    doc.text(item.value, pageWidth - 25, currentY, { align: 'right' });

    currentY += 8;
  });

  // Total Summary Box
  if (options.totalLabel && options.totalValue) {
    currentY += 4;
    doc.setFillColor(16, 185, 129); // Emerald 500
    doc.roundedRect(pageWidth - 95, currentY, 75, 14, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(options.totalLabel.toUpperCase(), pageWidth - 90, currentY + 6);

    doc.setFontSize(12);
    doc.text(options.totalValue, pageWidth - 25, currentY + 10, { align: 'right' });
    currentY += 22;
  } else {
    currentY += 10;
  }

  // Legal / Explanatory Notes
  if (options.notes && options.notes.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('NOTAS Y BASE LEGAL:', 20, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    options.notes.forEach((note) => {
      const splitNote = doc.splitTextToSize(`• ${note}`, pageWidth - 40);
      doc.text(splitNote, 20, currentY);
      currentY += splitNote.length * 4;
    });
  }

  // Signatures Line
  const footerY = 270;
  doc.setDrawColor(203, 213, 225);
  doc.line(30, footerY - 5, 85, footerY - 5);
  doc.line(pageWidth - 85, footerY - 5, pageWidth - 30, footerY - 5);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Firma / Conformidad Trabajador o Cliente', 57.5, footerY, { align: 'center' });
  doc.text('Firma y Sello Empleador / Emisor', pageWidth - 57.5, footerY, { align: 'center' });

  // Download Action
  const filename = `${options.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_calculaperu.pdf`;
  doc.save(filename);
}
