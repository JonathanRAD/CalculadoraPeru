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

export interface OfficialSettlementPdfOptions {
  workerName?: string;
  workerDni?: string;
  workerPosition?: string;
  companyName?: string;
  companyRuc?: string;
  baseSalary: number;
  familyAllowance: number;
  laborRegime: string;
  separationReason: string;
  employmentStartDate?: string;
  terminationDate?: string;
  ctsTrunca: number;
  ctsMonths: number;
  gratiTrunca: number;
  gratiMonths: number;
  bonoEsSalud: number;
  isEps: boolean;
  vacacionesTruncas: number;
  vacacionesMonths: number;
  despidoIndemnizacion?: number;
  totalSettlement: number;
}

export function generateOfficialSettlementPdf(options: OfficialSettlementPdfOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const formatSoles = (val: number) => `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Header Bar
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 7, 'F');
  doc.setFillColor(0, 135, 90); // Emerald
  doc.rect(0, 7, pageWidth, 2.5, 'F');

  let currentY = 18;

  // Header Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(options.companyName || 'CALCULAPERÚ • SERVICIOS LABORALES', 20, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const dateStr = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Fecha de Liquidación: ${dateStr}`, pageWidth - 20, currentY - 2, { align: 'right' });
  doc.text(`Liquidación Folio Nº LP-${Math.floor(100000 + Math.random() * 900000)}`, pageWidth - 20, currentY + 3, { align: 'right' });

  if (options.companyRuc) {
    currentY += 5;
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`RUC Empleador: ${options.companyRuc}`, 20, currentY);
  }

  currentY += 8;

  // Title Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(20, currentY, pageWidth - 40, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('LIQUIDACIÓN DE BENEFICIOS SOCIALES Y CESE LABORAL', pageWidth / 2, currentY + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Conforme al D.L. 728, D.S. 001-97-TR (CTS), Ley 27735 (Gratificaciones) y D.L. 713 (Vacaciones)', pageWidth / 2, currentY + 11, { align: 'center' });

  currentY += 19;

  // Box 1: Datos del Trabajador y Empleador
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 135, 90);
  doc.text('I. DATOS DEL TRABAJADOR Y DE LA RELACIÓN LABORAL', 20, currentY);
  currentY += 3;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, currentY, pageWidth - 40, 26, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  
  // Left column
  doc.text(`Trabajador:`, 24, currentY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.workerName || 'TRABAJADOR NO ESPECIFICADO', 55, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Documento (DNI):`, 24, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.workerDni || 'No registrado', 55, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Cargo / Puesto:`, 24, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.workerPosition || 'Empleado / Obrero', 55, currentY + 18);

  // Right column
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Régimen Laboral:`, 115, currentY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.laborRegime, 150, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Motivo de Cese:`, 115, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.separationReason, 150, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Periodo Laborado:`, 115, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const periodStr = options.employmentStartDate && options.terminationDate
    ? `${options.employmentStartDate} al ${options.terminationDate}`
    : 'Según cómputo de liquidación';
  doc.text(periodStr, 150, currentY + 18);

  currentY += 32;

  // Box 2: Remuneración Computable
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 135, 90);
  doc.text('II. BASE COMPUTABLE PARA EL CÁLCULO', 20, currentY);
  currentY += 3;

  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, currentY, pageWidth - 40, 12, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Sueldo Básico: ${formatSoles(options.baseSalary)}`, 24, currentY + 7);
  doc.text(`Asignación Familiar: ${formatSoles(options.familyAllowance)}`, 85, currentY + 7);
  const remunTotal = options.baseSalary + options.familyAllowance;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Remuneración Total: ${formatSoles(remunTotal)}`, 145, currentY + 7);

  currentY += 18;

  // Box 3: Conceptos a Liquidar (Table)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 135, 90);
  doc.text('III. DESGLOSE DETALLADO DE CONCEPTOS LIQUIDADOS', 20, currentY);
  currentY += 4;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(20, currentY, pageWidth - 40, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('CONCEPTO LABORAL', 24, currentY + 4);
  doc.text('BASE LEGAL', 80, currentY + 4);
  doc.text('PERIODO', 130, currentY + 4);
  doc.text('MONTO (PEN)', pageWidth - 24, currentY + 4, { align: 'right' });

  currentY += 7;

  const items = [
    {
      concept: 'Compensación por Tiempo de Servicios (CTS) Trunca',
      law: 'D.S. 001-97-TR Art. 19',
      period: `${options.ctsMonths} meses`,
      amount: options.ctsTrunca,
    },
    {
      concept: 'Gratificación Trunca',
      law: 'Ley 27735 Art. 2',
      period: `${options.gratiMonths} meses`,
      amount: options.gratiTrunca,
    },
    {
      concept: `Bonificación Extraordinaria (${options.isEps ? '6.75% EPS' : '9% EsSalud'})`,
      law: 'Ley 30334 (Inafecto)',
      period: 'Semestre en curso',
      amount: options.bonoEsSalud,
    },
    {
      concept: 'Vacaciones Truncas y No Gozadas',
      law: 'D.L. 713 Art. 22',
      period: `${options.vacacionesMonths} meses`,
      amount: options.vacacionesTruncas,
    },
  ];

  if (options.despidoIndemnizacion && options.despidoIndemnizacion > 0) {
    items.push({
      concept: 'Indemnización por Despido Arbitrario',
      law: 'D.L. 728 Art. 38',
      period: '1.5 sueldos / año',
      amount: options.despidoIndemnizacion,
    });
  }

  items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, currentY - 1.5, pageWidth - 40, 6.5, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(item.concept, 24, currentY + 3);
    doc.setTextColor(100, 116, 139);
    doc.text(item.law, 80, currentY + 3);
    doc.text(item.period, 130, currentY + 3);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatSoles(item.amount), pageWidth - 24, currentY + 3, { align: 'right' });
    currentY += 6.5;
  });

  currentY += 4;

  // Big Total Box
  doc.setFillColor(0, 135, 90);
  doc.roundedRect(20, currentY, pageWidth - 40, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL NETO A LIQUIDAR Y PERCIBIR:', 25, currentY + 7.5);
  doc.setFontSize(13);
  doc.text(formatSoles(options.totalSettlement), pageWidth - 25, currentY + 8.5, { align: 'right' });

  currentY += 18;

  // Box 4: Base Legal y Plazo de 48h
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CONSTANCIA DE CUMPLIMIENTO LEGAL (PLAZO PERENTORIO DE 48 HORAS):', 20, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const disclaimer = 'Conforme al Art. 56 del D.S. N° 001-96-TR (Reglamento de la Ley de Fomento del Empleo), el empleador está obligado a cancelar el importe total de la presente liquidación dentro de las 48 horas siguientes al término de la relación laboral, haciendo entrega simultánea de la constancia de cese para la liberación de los fondos de CTS depositados en la entidad financiera correspondiente. El incumplimiento faculta al trabajador al cobro de intereses legales laborales computados por la SBS y a la interposición de denuncia inspectiva ante SUNAFIL.';
  const splitDisc = doc.splitTextToSize(disclaimer, pageWidth - 40);
  doc.text(splitDisc, 20, currentY);

  // Signatures Area
  const signY = 265;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);

  // Employer signature
  doc.line(25, signY, 85, signY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('EMPLEADOR / REPRESENTANTE LEGAL', 55, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(options.companyName ? `${options.companyName}` : 'Sello y Firma de la Empresa', 55, signY + 8, { align: 'center' });

  // Employee signature
  doc.line(pageWidth - 85, signY, pageWidth - 25, signY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TRABAJADOR / CESE CONFORME', pageWidth - 55, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(options.workerName ? `${options.workerName} - DNI: ${options.workerDni || '________'}` : 'Firma y Huella Digital', pageWidth - 55, signY + 8, { align: 'center' });

  // Download
  const filename = `Liquidacion_Oficial_${(options.workerName || 'CalculaPeru').toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}

