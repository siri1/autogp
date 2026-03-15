import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

export interface ExportData {
  headers: string[];
  rows: any[][];
  filename?: string;
  title?: string;
}

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: ExportData) => {
  const { headers, rows, filename = 'export.csv' } = data;

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape cells containing commas or quotes
      const cellStr = String(cell ?? '');
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
};

/**
 * Export data to Excel format
 */
export const exportToExcel = (data: ExportData) => {
  const { headers, rows, filename = 'export.xlsx', title = 'Export' } = data;

  // Create worksheet data
  const wsData = [headers, ...rows];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = headers.map((_, i) => ({
    wch: Math.max(
      headers[i].length,
      ...rows.map(row => String(row[i] ?? '').length)
    ) + 2
  }));
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, title);

  // Generate Excel file and download
  XLSX.writeFile(wb, filename);
};

/**
 * Export data to PDF format
 */
export const exportToPDF = (data: ExportData) => {
  const { headers, rows, filename = 'export.pdf', title = 'Export Report' } = data;

  // Create PDF document
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // Save PDF
  doc.save(filename);
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (data: ExportData) => {
  const { headers, rows, filename = 'export.json' } = data;

  // Convert to array of objects
  const jsonData = rows.map(row => {
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  // Create JSON string
  const jsonString = JSON.stringify(jsonData, null, 2);

  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, filename);
};

/**
 * Copy data to clipboard
 */
export const copyToClipboard = async (data: ExportData) => {
  const { headers, rows } = data;

  // Create tab-separated content (compatible with Excel paste)
  const content = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n');

  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Print data
 */
export const printData = (data: ExportData) => {
  const { headers, rows, title = 'Print Report' } = data;

  // Create HTML table
  const tableHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; margin-bottom: 10px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
          th { background-color: #3b82f6; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f5f7fa; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="date">Generated: ${new Date().toLocaleDateString()}</div>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
  }
};
