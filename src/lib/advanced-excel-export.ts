import * as XLSX from 'xlsx';

export interface ReportSheet {
  name: string;
  headers: string[];
  rows: any[][];
  totals?: any[];
  formatting?: {
    headerColor?: string;
    alternateRows?: boolean;
    columnWidths?: number[];
  };
}

export interface ExcelReportConfig {
  reportTitle: string;
  reportDate?: Date;
  sheets: ReportSheet[];
  filename?: string;
  companyName?: string;
  includeMetadata?: boolean;
  includeSummary?: boolean;
}

/**
 * Generate a comprehensive Excel report with multiple sheets
 */
export const generateExcelReport = (config: ExcelReportConfig) => {
  const {
    reportTitle,
    reportDate = new Date(),
    sheets,
    filename = 'report.xlsx',
    companyName = 'Your Company',
    includeMetadata = true,
    includeSummary = true,
  } = config;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Add metadata properties
  wb.Props = {
    Title: reportTitle,
    Subject: 'Generated Report',
    Author: companyName,
    CreatedDate: reportDate,
  };

  // Add Summary Sheet if requested
  if (includeSummary) {
    const summaryData = createSummarySheet(config);
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);

    // Set column widths for summary
    summaryWs['!cols'] = [
      { wch: 30 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  }

  // Add each data sheet
  sheets.forEach((sheet) => {
    const ws = createFormattedSheet(sheet);
    XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sheet.name));
  });

  // Generate and download file
  XLSX.writeFile(wb, filename);
};

/**
 * Create a formatted Excel sheet with styling
 */
const createFormattedSheet = (sheet: ReportSheet): XLSX.WorkSheet => {
  const { headers, rows, totals, formatting } = sheet;

  // Build sheet data
  const sheetData: any[][] = [headers];

  // Add data rows
  sheetData.push(...rows);

  // Add totals row if provided
  if (totals && totals.length > 0) {
    sheetData.push([]); // Empty row before totals
    sheetData.push(totals);
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  if (formatting?.columnWidths) {
    ws['!cols'] = formatting.columnWidths.map(w => ({ wch: w }));
  } else {
    // Auto-calculate column widths
    ws['!cols'] = headers.map((_, i) => ({
      wch: Math.max(
        headers[i].length,
        ...rows.map(row => String(row[i] ?? '').length)
      ) + 2
    }));
  }

  // Apply cell formatting
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

  // Format header row
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!ws[address]) continue;

    ws[address].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: formatting?.headerColor || '4472C4' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // Format alternating rows if requested
  if (formatting?.alternateRows) {
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      if (R % 2 === 0) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_col(C) + (R + 1);
          if (!ws[address]) continue;

          ws[address].s = {
            ...ws[address].s,
            fill: { fgColor: { rgb: 'F2F2F2' } },
          };
        }
      }
    }
  }

  // Format totals row if exists
  if (totals && totals.length > 0) {
    const totalsRow = range.e.r + 1;
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + totalsRow;
      if (!ws[address]) continue;

      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E7E6E6' } },
        border: {
          top: { style: 'medium', color: { rgb: '000000' } },
        },
      };
    }
  }

  return ws;
};

/**
 * Create summary sheet with report metadata
 */
const createSummarySheet = (config: ExcelReportConfig): any[][] => {
  const { reportTitle, reportDate, sheets, companyName } = config;

  const summaryData: any[][] = [
    [reportTitle],
    [],
    ['Report Information'],
    ['Company:', companyName],
    ['Generated:', reportDate?.toLocaleString() || new Date().toLocaleString()],
    ['Total Sheets:', sheets.length.toString()],
    [],
    ['Sheet Details'],
    ['Sheet Name', 'Rows'],
  ];

  // Add sheet statistics
  sheets.forEach(sheet => {
    summaryData.push([sheet.name, sheet.rows.length.toString()]);
  });

  // Add total row count
  const totalRows = sheets.reduce((sum, sheet) => sum + sheet.rows.length, 0);
  summaryData.push([], ['Total Records:', totalRows.toString()]);

  return summaryData;
};

/**
 * Sanitize sheet name for Excel compatibility
 */
const sanitizeSheetName = (name: string): string => {
  // Excel sheet names cannot contain: \ / ? * [ ]
  // and must be <= 31 characters
  return name
    .replace(/[\\\/\?\*\[\]]/g, '')
    .substring(0, 31);
};

/**
 * Export data with charts (basic implementation)
 */
export const exportToExcelWithCharts = (config: ExcelReportConfig) => {
  // Note: Full chart support requires additional libraries
  // This is a placeholder for advanced chart functionality
  console.warn('Chart export requires additional configuration');
  generateExcelReport(config);
};

/**
 * Create a pivot table style summary
 */
export const createPivotSummary = (
  data: any[][],
  rowField: number,
  valueField: number,
  aggregation: 'sum' | 'count' | 'average' = 'sum'
): any[][] => {
  const pivot: Record<string, number[]> = {};

  // Group data by row field
  data.forEach(row => {
    const key = String(row[rowField] ?? '');
    const value = Number(row[valueField]) || 0;

    if (!pivot[key]) {
      pivot[key] = [];
    }
    pivot[key].push(value);
  });

  // Calculate aggregation
  const result: any[][] = [['Category', 'Value']];

  Object.entries(pivot).forEach(([key, values]) => {
    let aggregatedValue: number;

    switch (aggregation) {
      case 'sum':
        aggregatedValue = values.reduce((a, b) => a + b, 0);
        break;
      case 'count':
        aggregatedValue = values.length;
        break;
      case 'average':
        aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      default:
        aggregatedValue = 0;
    }

    result.push([key, aggregatedValue]);
  });

  return result;
};

/**
 * Format currency values in Excel
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

/**
 * Quick export function for simple reports
 */
export const quickExcelExport = (
  title: string,
  headers: string[],
  rows: any[][],
  filename?: string
) => {
  generateExcelReport({
    reportTitle: title,
    sheets: [
      {
        name: title,
        headers,
        rows,
        formatting: {
          alternateRows: true,
          headerColor: '4472C4',
        },
      },
    ],
    filename: filename || `${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`,
    includeSummary: false,
  });
};
