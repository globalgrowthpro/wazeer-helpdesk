/**
 * Shared Excel export utility – uses the "xlsx" (SheetJS) library.
 * All sheets are written right-to-left to match the Arabic UI.
 */
import * as XLSX from "xlsx";

export type ExportRow = Record<string, string | number | boolean | null | undefined>;

interface ExportOptions {
  /** Data rows to export */
  rows: ExportRow[];
  /** Human-readable sheet name (Arabic supported) */
  sheetName?: string;
  /** Output file name without extension */
  fileName: string;
  /** Optional custom column header mapping: key → Arabic label */
  headers?: Record<string, string>;
}

/**
 * Converts camelCase / snake_case keys to a readable label when no
 * custom header mapping is provided.
 */
function keyToLabel(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
}

/**
 * Exports an array of objects to an .xlsx file and triggers a browser download.
 */
export function exportToExcel({ rows, sheetName = "Sheet1", fileName, headers }: ExportOptions): void {
  if (!rows.length) return;

  // Build header row from first data object keys
  const keys = Object.keys(rows[0]!);
  const headerRow = keys.map((k) => (headers?.[k] ?? keyToLabel(k)));

  // Build data rows
  const dataRows = rows.map((row) => keys.map((k) => row[k] ?? ""));

  // Compose the worksheet data (header + data)
  const wsData = [headerRow, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // RTL direction on the sheet view
  if (!ws["!sheetViews"]) ws["!sheetViews"] = [];
  ws["!sheetViews"].push({ rightToLeft: true });

  // Auto column widths (max char count per column)
  const colWidths = keys.map((k, colIdx) => {
    const label = headerRow[colIdx] ?? "";
    const maxData = Math.max(...dataRows.map((r) => String(r[colIdx] ?? "").length));
    return { wch: Math.max(label.length + 2, maxData + 2, 8) };
  });
  ws["!cols"] = colWidths;

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // sheet name max 31 chars

  // Write and download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
