/**
 * Exportador de datos tabulares a formato CSV compatible con Microsoft Excel y Google Sheets.
 * Incluye Byte Order Mark (BOM UTF-8: \uFEFF) para evitar errores de codificación en caracteres
 * en español (tildes, 'ñ', símbolo 'S/').
 */

export interface ExportTableOptions {
  filename: string;
  title?: string;
  metadata?: Record<string, string | number>;
  headers: string[];
  rows: (string | number)[][];
}

export function exportTableToCsv(
  optionsOrFilename: string | ExportTableOptions,
  columns?: ({ key?: string; header: string } | string)[],
  rowsData?: (Record<string, unknown> | (string | number)[])[]
) {
  let filename = 'exportacion.csv';
  let title: string | undefined;
  let metadata: Record<string, string | number> = {};
  let headers: string[] = [];
  let rows: (string | number)[][] = [];

  if (typeof optionsOrFilename === 'object' && 'filename' in optionsOrFilename) {
    filename = optionsOrFilename.filename;
    title = optionsOrFilename.title;
    metadata = optionsOrFilename.metadata || {};
    headers = optionsOrFilename.headers || [];
    rows = optionsOrFilename.rows || [];
  } else {
    filename = optionsOrFilename;
    if (columns) {
      headers = columns.map((c) => (typeof c === 'string' ? c : c.header));
    }
    if (rowsData) {
      rows = rowsData.map((row) => {
        if (Array.isArray(row)) {
          return row.map((val) => (typeof val === 'number' ? val : String(val ?? '')));
        }
        // row is an object, map via column keys
        if (columns) {
          return columns.map((col) => {
            const key = typeof col === 'string' ? col : col.key || col.header;
            const val = row[key];
            return typeof val === 'number' ? val : String(val ?? '');
          });
        }
        return Object.values(row).map((val) => (typeof val === 'number' ? val : String(val ?? '')));
      });
    }
  }

  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  const lines: string[] = [];

  // Title header
  if (title) {
    lines.push(`"${title.replace(/"/g, '""')}"`);
    lines.push('');
  }

  // Metadata block (e.g. Empresa, RUC, Fecha, etc.)
  const metaKeys = Object.keys(metadata);
  if (metaKeys.length > 0) {
    metaKeys.forEach((key) => {
      lines.push(`"${key.replace(/"/g, '""')}","${String(metadata[key]).replace(/"/g, '""')}"`);
    });
    lines.push('');
  }

  // Table columns
  lines.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  // Rows
  rows.forEach((row) => {
    const formattedRow = row.map((cell) => {
      if (typeof cell === 'number') return cell.toString();
      return `"${String(cell ?? '').replace(/"/g, '""')}"`;
    });
    lines.push(formattedRow.join(','));
  });

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
