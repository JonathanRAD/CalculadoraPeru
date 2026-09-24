import { QuoteCalculatedItem, QuoteTotals } from '@/core/calculators/quote';
import { CompanyProfile } from '@/features/auth/types';

export interface QuoteCsvOptions {
  quoteNumber: string;
  issueDate: string;
  validUntil?: string;
  company: CompanyProfile & { name?: string; phone?: string; email?: string };
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

/**
 * Escapa el valor de la celda neutralizando cualquier vector de CSV Injection en Excel.
 * Si la celda comienza con '=', '+', '-', '@', '\t', o '\r', se antepone un apóstrofe (').
 * Nunca se incluyen notas internas en la exportación.
 */
export function escapeCsvCell(cell: unknown): string {
  if (cell === null || cell === undefined) return '""';
  let str = String(cell).trim();

  // Neutralización de fórmulas peligrosas (CSV / Formula Injection)
  const DANGEROUS_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];
  if (str.length > 0 && DANGEROUS_TRIGGERS.includes(str[0])) {
    str = `'${str}`;
  }

  return `"${str.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
}

export function generateQuoteCsvString(options: QuoteCsvOptions): string {
  const lines: string[] = [];

  // Metadata de la cabecera
  lines.push(`${escapeCsvCell('COTIZACIÓN COMERCIAL')},${escapeCsvCell(options.quoteNumber || 'BORRADOR SIN NÚMERO')}`);
  lines.push(`${escapeCsvCell('Fecha de emisión')},${escapeCsvCell(options.issueDate)}`);
  if (options.validUntil) {
    lines.push(`${escapeCsvCell('Válido hasta')},${escapeCsvCell(options.validUntil)}`);
  }
  lines.push(`${escapeCsvCell('Moneda')},${escapeCsvCell('Soles Peruanos (PEN)')}`);
  lines.push('');

  // Emisor
  const companyName = options.company.companyName || options.company.name || 'Emisor Comercial';
  lines.push(`${escapeCsvCell('DATOS DEL EMISOR')}`);
  lines.push(`${escapeCsvCell('Razón Social / Nombre')},${escapeCsvCell(companyName)}`);
  if (options.company.companyRuc) {
    lines.push(`${escapeCsvCell('RUC')},${escapeCsvCell(options.company.companyRuc)}`);
  }
  if (options.company.phone) {
    lines.push(`${escapeCsvCell('Teléfono')},${escapeCsvCell(options.company.phone)}`);
  }
  if (options.company.companyAddress) {
    lines.push(`${escapeCsvCell('Dirección')},${escapeCsvCell(options.company.companyAddress)}`);
  }
  lines.push('');

  // Cliente
  lines.push(`${escapeCsvCell('DATOS DEL CLIENTE')}`);
  lines.push(`${escapeCsvCell('Cliente')},${escapeCsvCell(options.client.name || 'Cliente')}`);
  if (options.client.docNumber) {
    lines.push(
      `${escapeCsvCell(options.client.docType ? options.client.docType.toUpperCase() : 'Documento')},${escapeCsvCell(options.client.docNumber)}`
    );
  }
  if (options.client.phone) {
    lines.push(`${escapeCsvCell('Teléfono')},${escapeCsvCell(options.client.phone)}`);
  }
  if (options.client.address) {
    lines.push(`${escapeCsvCell('Dirección')},${escapeCsvCell(options.client.address)}`);
  }
  lines.push('');

  // Tabla de conceptos
  const headers = [
    '#',
    'Descripción',
    'Tipo',
    'Unidad',
    'Cantidad',
    'Precio Unitario (PEN)',
    'Descuento Línea (PEN)',
    'Importe Neto (PEN)',
    'Afecto a IGV',
  ];
  lines.push(headers.map(escapeCsvCell).join(','));

  options.items.forEach((item, idx) => {
    const row = [
      idx + 1,
      item.description,
      item.type === 'service' ? 'Servicio' : 'Producto',
      item.unit.toUpperCase(),
      item.quantity,
      item.unitPrice.toFixed(2),
      item.discountAmount.toFixed(2),
      item.netAmount.toFixed(2),
      item.isIgvAffected ? 'SÍ' : 'NO',
    ];
    lines.push(row.map(escapeCsvCell).join(','));
  });

  lines.push('');

  // Resumen de importes
  lines.push(`${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('SUBTOTAL BRUTO')},${escapeCsvCell(options.totals.subtotalGross.toFixed(2))}`);
  if (options.totals.discountTotal > 0) {
    lines.push(`${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('DESCUENTO TOTAL')},${escapeCsvCell(options.totals.discountTotal.toFixed(2))}`);
  }
  lines.push(`${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('SUBTOTAL NETO')},${escapeCsvCell(options.totals.subtotalNet.toFixed(2))}`);

  if (options.totals.igvAmount > 0) {
    lines.push(`${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('BASE IMPONIBLE')},${escapeCsvCell(options.totals.taxableBase.toFixed(2))}`);
    lines.push(`${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell(`IGV (${(options.totals.igvRate * 100).toFixed(0)}%)`)},${escapeCsvCell(options.totals.igvAmount.toFixed(2))}`);
  }

  lines.push(`${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('')},${escapeCsvCell('TOTAL A PAGAR')},${escapeCsvCell(options.totals.totalAmount.toFixed(2))}`);

  // Condiciones comerciales públicas
  if (options.paymentTerms || options.deliveryTime || options.publicNotes) {
    lines.push('');
    lines.push(`${escapeCsvCell('CONDICIONES COMERCIALES')}`);
    if (options.paymentTerms) lines.push(`${escapeCsvCell('Forma de pago')},${escapeCsvCell(options.paymentTerms)}`);
    if (options.deliveryTime) lines.push(`${escapeCsvCell('Tiempo de entrega')},${escapeCsvCell(options.deliveryTime)}`);
    if (options.publicNotes) lines.push(`${escapeCsvCell('Observaciones')},${escapeCsvCell(options.publicNotes)}`);
  }

  lines.push('');
  lines.push(`${escapeCsvCell('AVISO: Este documento es una cotización comercial o proforma y no constituye un comprobante de pago.')}`);

  // Retornar con BOM UTF-8 (\uFEFF) para compatibilidad nativa en Microsoft Excel
  return '\uFEFF' + lines.join('\r\n');
}

export function downloadQuoteCsv(options: QuoteCsvOptions) {
  const csvContent = generateQuoteCsvString(options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeNumber = (options.quoteNumber || 'borrador').replace(/[^a-zA-Z0-9_-]/g, '');
  link.setAttribute('download', `Cotizacion_${safeNumber}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
