import jsPDF from 'jspdf';

export interface PayrollSlipOptions {
  isPro?: boolean;
  companyLogoBase64?: string;
  companyName?: string;
  companyRuc?: string;
  companyAddress?: string;
  workerName?: string;
  workerDni?: string;
  workerPosition?: string;
  workerStartDate?: string;
  pensionSystemName: string;
  cuspp?: string;
  periodMonthYear: string; // ej. "Septiembre 2026"
  // Campos legales MTPE / SUNAFIL (D.S. N° 001-98-TR y PLAME):
  laborRegime?: string; // ej. "Régimen General (D.L. 728)"
  contractType?: string; // ej. "A plazo indeterminado"
  paymentMethod?: string; // ej. "Depósito en cuenta sueldo"
  workedDays?: number; // default 30
  workedHours?: number; // default 240
  unworkedDays?: number; // default 0
  subsidizedDays?: number; // default 0
  // Ingresos
  baseSalary: number;
  familyAllowance: number;
  variableIncome: number;
  nonRemunerativeIncome: number;
  totalGross: number;
  // Descuentos
  pensionDeduction: number;
  pensionRatePercent: string;
  fifthCategoryTax: number;
  otherDeductions: number;
  totalDeductions: number;
  // Aportes Empleador
  essaludContribution: number;
  // Neto
  netSalary: number;
}

// Convertidor de números a letras en formato oficial bancario / contable peruano
function convertHundreds(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'CIEN';
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const twenties = ['VEINTE', 'VEINTIÚN', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'];

  let str = '';
  const h = Math.floor(n / 100);
  const rem = n % 100;
  if (h > 0) str += hundreds[h] + ' ';

  if (rem >= 10 && rem < 20) {
    str += teens[rem - 10];
  } else if (rem >= 20 && rem < 30) {
    str += twenties[rem - 20];
  } else {
    const t = Math.floor(rem / 10);
    const u = rem % 10;
    if (t > 0) str += tens[t];
    if (t > 0 && u > 0) str += ' Y ';
    if (u > 0) str += units[u];
  }
  return str.trim();
}

export function numberToPeruvianSoles(val: number): string {
  if (isNaN(val) || val <= 0) return 'SON: CERO CON 00/100 SOLES';
  const totalCents = Math.round(val * 100);
  const integerPart = Math.floor(totalCents / 100);
  const cents = totalCents % 100;
  const centsStr = cents.toString().padStart(2, '0') + '/100 SOLES';

  if (integerPart === 0) return `SON: CERO CON ${centsStr}`;

  let words = '';
  const millions = Math.floor(integerPart / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const units = integerPart % 1000;

  if (millions === 1) {
    words += 'UN MILLÓN ';
  } else if (millions > 1) {
    words += convertHundreds(millions) + ' MILLONES ';
  }

  if (thousands === 1) {
    words += 'MIL ';
  } else if (thousands > 1) {
    words += convertHundreds(thousands) + ' MIL ';
  }

  if (units > 0) {
    words += convertHundreds(units);
  }

  return `SON: ${words.trim()} CON ${centsStr}`;
}

export function generateOfficialPayrollSlipPdf(options: PayrollSlipOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const formatS = (val: number) => `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const isPro = !!options.isPro;

  // Outer Margin: 12mm
  const mx = 12;
  const contentW = pageWidth - mx * 2; // 186mm

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(isPro ? 0 : 217, isPro ? 135 : 119, isPro ? 90 : 6); // Emerald if PRO, Amber if Free
  doc.rect(0, 5, pageWidth, 2, 'F');

  // =========================================================================
  // WATERMARK FOR FREE VERSION (DIAGONAL TEXT)
  // =========================================================================
  if (!isPro) {
    doc.saveGraphicsState();
    doc.setTextColor(225, 230, 238);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('COPIA DE PRUEBA - CALCULAPERU.COM.PE', pageWidth / 2, 140, {
      align: 'center',
      angle: 45,
    });
    doc.setFontSize(13);
    doc.setTextColor(235, 190, 190);
    doc.text('NO VÁLIDO PARA PRESENTACIÓN LABORAL ANTE SUNAFIL', pageWidth / 2, 155, {
      align: 'center',
      angle: 45,
    });
    doc.setFontSize(10);
    doc.setTextColor(215, 220, 228);
    doc.text('REQUIERE LICENCIA PRO PARA CERTIFICACIÓN OFICIAL', pageWidth / 2, 167, {
      align: 'center',
      angle: 45,
    });
    doc.restoreGraphicsState();
  }

  // =========================================================================
  // 1. EMPLEADOR Y CABECERA OFICIAL
  // =========================================================================
  let currentY = 12;

  // Logo rendering if PRO and provided
  let headerTextX = mx;
  if (isPro && options.companyLogoBase64) {
    try {
      doc.addImage(options.companyLogoBase64, 'JPEG', mx, currentY, 24, 15);
      headerTextX = mx + 27;
    } catch {
      // Fallback
    }
  }

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  const displayCompanyName = isPro
    ? (options.companyName || 'EMPRESA / EMPLEADOR S.A.C.')
    : 'EMISIÓN DE PRUEBA (MODO GRATUITO)';
  doc.text(displayCompanyName.toUpperCase(), headerTextX, currentY + 4);

  // RUC & Domicilio
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const displayRuc = isPro
    ? (options.companyRuc ? `RUC: ${options.companyRuc}` : 'RUC: NO REGISTRADO')
    : 'RUC: NO REGISTRADO (REQUIERE PRO)';
  const displayDir = isPro && options.companyAddress ? ` • Dir: ${options.companyAddress}` : '';
  doc.text(`${displayRuc}${displayDir}`, headerTextX, currentY + 9);

  // Status & Date on Top Right
  const nowStr = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  if (isPro) {
    doc.setTextColor(0, 135, 90);
    doc.text('CONFORME D.S. N° 001-98-TR / SUNAFIL', pageWidth - mx, currentY + 4, { align: 'right' });
  } else {
    doc.setTextColor(217, 119, 6);
    doc.text('MODO PRUEBA (SIN VALIDEZ LEGAL)', pageWidth - mx, currentY + 4, { align: 'right' });
  }
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha de Emisión: ${nowStr}`, pageWidth - mx, currentY + 9, { align: 'right' });

  currentY = 29;

  // =========================================================================
  // 2. TÍTULO DE LA BOLETA Y PERIODO
  // =========================================================================
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(mx, currentY, contentW, 11, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('BOLETA DE PAGO DE REMUNERACIONES', pageWidth / 2, currentY + 4.8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(isPro ? 0 : 180, isPro ? 135 : 83, isPro ? 90 : 9);
  const contractLabel = options.contractType || 'A plazo indeterminado (D.L. 728)';
  doc.text(
    `PERIODO TRIBUTARIO: ${options.periodMonthYear.toUpperCase()} • T-REGISTRO / PLAME • CONTRATO: ${contractLabel.toUpperCase()}`,
    pageWidth / 2,
    currentY + 9,
    { align: 'center' }
  );

  currentY += 14;

  // =========================================================================
  // 3. DATOS DEL TRABAJADOR Y CONTROL DE ASISTENCIA (SIDE-BY-SIDE)
  // =========================================================================
  const colWorkerW = 114;
  const colAttendW = contentW - colWorkerW - 4; // ~68mm
  const attendX = mx + colWorkerW + 4;
  const cardH = 34;

  // Left Card: Datos del Trabajador
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(mx, currentY, colWorkerW, cardH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 135, 90);
  doc.text('I. DATOS DEL TRABAJADOR', mx + 3, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);

  const row1Y = currentY + 9.5;
  doc.text('Nombres y Apellidos:', mx + 3, row1Y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.workerName ? options.workerName.toUpperCase() : 'TRABAJADOR NO ESPECIFICADO', mx + 35, row1Y);

  const row2Y = currentY + 15;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Doc. Identidad (DNI):', mx + 3, row2Y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.workerDni || 'No registrado', mx + 35, row2Y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha de Ingreso:', mx + 68, row2Y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.workerStartDate || 'Según contrato', mx + 90, row2Y);

  const row3Y = currentY + 20.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Cargo / Ocupación:', mx + 3, row3Y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.workerPosition || 'Empleado', mx + 35, row3Y);

  const row4Y = currentY + 26;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Régimen Pensionario:', mx + 3, row4Y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.pensionSystemName, mx + 35, row4Y);

  const row5Y = currentY + 31;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Código CUSPP:', mx + 3, row5Y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.cuspp || 'No aplica / Sin CUSPP', mx + 35, row5Y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Régimen Laboral:', mx + 68, row5Y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.laborRegime || 'D.L. 728', mx + 90, row5Y);

  // Right Card: Control de Tiempo y Asistencia (Requisito Obligatorio SUNAFIL)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(attendX, currentY, colAttendW, cardH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 135, 90);
  doc.text('TIEMPO LABORADO (SUNAFIL)', attendX + 3, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);

  doc.text('Días Efect. Laborados:', attendX + 3, currentY + 10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${options.workedDays ?? 30} días`, attendX + colAttendW - 3, currentY + 10, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Horas Ordinarias:', attendX + 3, currentY + 15.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${options.workedHours ?? 240} hrs`, attendX + colAttendW - 3, currentY + 15.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Días No Laborados / Faltas:', attendX + 3, currentY + 21);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${options.unworkedDays ?? 0} días`, attendX + colAttendW - 3, currentY + 21, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Días Subsidiados:', attendX + 3, currentY + 26.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${options.subsidizedDays ?? 0} días`, attendX + colAttendW - 3, currentY + 26.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Forma de Pago:', attendX + 3, currentY + 31.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 135, 90);
  doc.text(options.paymentMethod || 'Depósito en Cta.', attendX + colAttendW - 3, currentY + 31.5, { align: 'right' });

  currentY += cardH + 4;

  // =========================================================================
  // 4. DETALLE DE CONCEPTOS (HABERES, DESCUENTOS, APORTES EMPLEADOR) - PLAME
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 135, 90);
  doc.text('II. DETALLE DE REMUNERACIONES Y RETENCIONES (ESTRUCTURA PLAME SUNAT)', mx, currentY);
  currentY += 2.5;

  const tableColW = contentW / 3;
  const col1X = mx;
  const col2X = col1X + tableColW;
  const col3X = col2X + tableColW;

  // Header 3 columns
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(col1X, currentY, tableColW, 6, 'FD');
  doc.rect(col2X, currentY, tableColW, 6, 'FD');
  doc.rect(col3X, currentY, tableColW, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('1. INGRESOS (HABERES)', col1X + 3, currentY + 4.2);
  doc.text('2. DESCUENTOS AL TRABAJADOR', col2X + 3, currentY + 4.2);
  doc.text('3. APORTES EMPLEADOR', col3X + 3, currentY + 4.2);

  currentY += 6;

  // Rows Data with PLAME Codes
  const incomeItems = [
    { code: '0121', label: 'Remuneración Básica', val: options.baseSalary },
    ...(options.familyAllowance > 0 ? [{ code: '0201', label: 'Asignación Familiar (Ley 25129)', val: options.familyAllowance }] : []),
    ...(options.variableIncome > 0 ? [{ code: '0105', label: 'Horas Extras / Comisiones', val: options.variableIncome }] : []),
    ...(options.nonRemunerativeIncome > 0 ? [{ code: '0900', label: 'Conceptos No Remunerativos', val: options.nonRemunerativeIncome }] : []),
  ];

  const deductionItems = [
    { code: '0601', label: `Aporte Pensión (${options.pensionRatePercent})`, val: options.pensionDeduction },
    ...(options.fifthCategoryTax > 0 ? [{ code: '0605', label: 'Renta 5ta Categoría (SUNAT)', val: options.fifthCategoryTax }] : []),
    ...(options.otherDeductions > 0 ? [{ code: '0700', label: 'Otros Descuentos / Préstamos', val: options.otherDeductions }] : []),
  ];

  const employerItems = [
    { code: '0804', label: 'EsSalud (9% Ley 26790)', val: options.essaludContribution },
    { code: '-', label: '(* Aportes a cargo del empleador)', val: 0, isNote: true },
  ];

  const maxRows = Math.max(incomeItems.length, deductionItems.length, employerItems.length, 4);

  for (let i = 0; i < maxRows; i++) {
    const isEven = i % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(mx, currentY, contentW, 5.5, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);

    // Column 1 (Ingresos)
    if (incomeItems[i]) {
      doc.setFont('helvetica', 'bold');
      doc.text(incomeItems[i].code, col1X + 2, currentY + 3.8);
      doc.setFont('helvetica', 'normal');
      doc.text(incomeItems[i].label, col1X + 11, currentY + 3.8);
      doc.text(formatS(incomeItems[i].val), col2X - 2.5, currentY + 3.8, { align: 'right' });
    }

    // Column 2 (Descuentos)
    if (deductionItems[i]) {
      doc.setFont('helvetica', 'bold');
      doc.text(deductionItems[i].code, col2X + 2, currentY + 3.8);
      doc.setFont('helvetica', 'normal');
      doc.text(deductionItems[i].label, col2X + 11, currentY + 3.8);
      doc.text(formatS(deductionItems[i].val), col3X - 2.5, currentY + 3.8, { align: 'right' });
    }

    // Column 3 (Aportes Patronales)
    if (employerItems[i]) {
      if (employerItems[i].isNote) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.text(employerItems[i].label, col3X + 3, currentY + 3.8);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.text(employerItems[i].code, col3X + 2, currentY + 3.8);
        doc.setFont('helvetica', 'normal');
        doc.text(employerItems[i].label, col3X + 11, currentY + 3.8);
        doc.text(formatS(employerItems[i].val), mx + contentW - 2.5, currentY + 3.8, { align: 'right' });
      }
    }

    currentY += 5.5;
  }

  // Subtotals row
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(col1X, currentY, tableColW, 6, 'FD');
  doc.rect(col2X, currentY, tableColW, 6, 'FD');
  doc.rect(col3X, currentY, tableColW, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL INGRESOS:', col1X + 3, currentY + 4.2);
  doc.text(formatS(options.totalGross), col2X - 2.5, currentY + 4.2, { align: 'right' });

  doc.text('TOTAL DESCUENTOS:', col2X + 3, currentY + 4.2);
  doc.text(formatS(options.totalDeductions), col3X - 2.5, currentY + 4.2, { align: 'right' });

  doc.text('TOTAL APORTES:', col3X + 3, currentY + 4.2);
  doc.text(formatS(options.essaludContribution), mx + contentW - 2.5, currentY + 4.2, { align: 'right' });

  currentY += 9;

  // =========================================================================
  // 5. BANNER NETO A PAGAR + MONTO EN LETRAS (OBLIGATORIO CONTABLE)
  // =========================================================================
  doc.setFillColor(0, 135, 90);
  doc.roundedRect(mx, currentY, contentW, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('NETO A PAGAR AL TRABAJADOR:', mx + 4, currentY + 5.5);

  doc.setFontSize(13);
  doc.text(formatS(options.netSalary), mx + contentW - 4, currentY + 6.5, { align: 'right' });

  // Monto en letras (Legal)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(240, 253, 244);
  const amountWords = numberToPeruvianSoles(options.netSalary);
  doc.text(amountWords, mx + 4, currentY + 11);

  currentY += 17;

  // =========================================================================
  // 6. CONSTANCIA DE RECEPCIÓN Y VALIDEZ LEGAL (D.S. 001-98-TR / 009-2011-TR)
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text('CONSTANCIA DE ENTREGA Y VALIDEZ LEGAL (D.S. N° 001-98-TR / D.S. N° 009-2011-TR / R.M. 020-2012-TR):', mx, currentY);
  currentY += 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  const legalNote = 'Se emite la presente Boleta de Pago en cumplimiento estricto del Art. 18 y 19 del D.S. N° 001-98-TR. De conformidad con el D.S. N° 009-2011-TR y la Ley N° 31110, el empleador puede sustituir la firma física mediante entrega electrónica o acreditar el cumplimiento de la obligación de pago con la respectiva constancia de depósito o transferencia en la cuenta sueldo del trabajador.';
  const splitLegal = doc.splitTextToSize(legalNote, contentW);
  doc.text(splitLegal, mx, currentY);

  currentY += 9;

  // =========================================================================
  // 7. CAJAS FORMALES DE DOBLE FIRMA (EMPLEADOR Y TRABAJADOR CON HUELLA)
  // =========================================================================
  const boxW = (contentW - 6) / 2; // ~90mm
  const signBoxH = 35;
  const boxEmpX = mx;
  const boxTrabX = mx + boxW + 6;

  // Box 1: Empleador
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(boxEmpX, currentY, boxW, signBoxH, 1.5, 1.5, 'FD');

  // Box 1 inner signature line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(boxEmpX + 12, currentY + 22, boxEmpX + boxW - 12, currentY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('EMPLEADOR / REPRESENTANTE LEGAL', boxEmpX + boxW / 2, currentY + 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  doc.text(displayCompanyName, boxEmpX + boxW / 2, currentY + 29.5, { align: 'center' });
  doc.text(displayRuc, boxEmpX + boxW / 2, currentY + 33, { align: 'center' });

  // Box 2: Trabajador (Con espacio para firma y recuadro para Huella Dactilar)
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(boxTrabX, currentY, boxW, signBoxH, 1.5, 1.5, 'FD');

  // Recuadro Huella Dactilar
  const huellaW = 16;
  const huellaH = 21;
  const huellaX = boxTrabX + boxW - huellaW - 4;
  const huellaY = currentY + 4;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(huellaX, huellaY, huellaW, huellaH, 1, 1, 'FD');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Huella\nDigital', huellaX + huellaW / 2, huellaY + huellaH / 2 - 1, { align: 'center' });

  // Worker signature line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  const trabLineEndX = huellaX - 5;
  doc.line(boxTrabX + 8, currentY + 22, trabLineEndX, currentY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('RECIBÍ CONFORME (TRABAJADOR)', boxTrabX + (trabLineEndX - boxTrabX) / 2 + 4, currentY + 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  const workerDniStr = options.workerDni ? `DNI: ${options.workerDni}` : 'DNI: ___________';
  doc.text(
    `${options.workerName || 'Firma del Trabajador'} • ${workerDniStr}`,
    boxTrabX + (trabLineEndX - boxTrabX) / 2 + 4,
    currentY + 29.5,
    { align: 'center' }
  );
  doc.text('Fecha Recepción: _____ / _____ / 202___', boxTrabX + (trabLineEndX - boxTrabX) / 2 + 4, currentY + 33, { align: 'center' });

  // =========================================================================
  // 8. PIE DE PÁGINA FINAL
  // =========================================================================
  if (!isPro) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(185, 28, 28);
    doc.text(
      'COPIA DE PRUEBA: Para emitir boletas oficiales con RUC real, Logotipo y sin marcas de agua, active CalculaPerú PRO en calculaperu.com.pe/pro',
      pageWidth / 2,
      288,
      { align: 'center' }
    );
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Documento de Planilla emitido conforme al D.S. N° 001-98-TR y D.S. N° 009-2011-TR · Sistema Certificado CalculaPerú PRO',
      pageWidth / 2,
      288,
      { align: 'center' }
    );
  }

  // Save PDF
  const safeWorkerName = (options.workerName || 'Trabajador').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = isPro
    ? `Boleta_Oficial_${safeWorkerName}.pdf`
    : `Boleta_Prueba_${safeWorkerName}.pdf`;
  doc.save(filename);
}
