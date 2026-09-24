/**
 * Utilidad ligera y optimizada para exportar datos estructurados a Microsoft Excel (.CSV)
 * Incluye Byte Order Mark (BOM) UTF-8 para garantizar compatibilidad con tildes, ñ y moneda peruana.
 */

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export function exportToCsv(
  filename: string,
  columns: ExcelColumn[],
  rows: Record<string, unknown>[]
) {
  // BOM para que Excel en Windows/Mac reconozca UTF-8 automáticamente
  const BOM = '\uFEFF';

  // Headers
  const headerRow = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(';');

  // Data rows
  const dataRows = rows.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(';')
  );

  const csvContent = BOM + [headerRow, ...dataRows].join('\r\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/[^a-z0-9_-]/gi, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
