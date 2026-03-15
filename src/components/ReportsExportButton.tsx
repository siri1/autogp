"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  BarChart3,
  Table2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { generateExcelReport, quickExcelExport, type ReportSheet } from '@/lib/advanced-excel-export';
import { exportToPDF, exportToJSON, exportToCSV } from '@/lib/export-utils';

interface ReportsExportButtonProps {
  reportData: {
    title: string;
    summary?: {
      totalRecords: number;
      dateRange?: string;
      [key: string]: any;
    };
    sheets: ReportSheet[];
    companyName?: string;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export default function ReportsExportButton({
  reportData,
  variant = 'default',
  size = 'default',
}: ReportsExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<string>('');

  const handleExport = async (type: string, includeAllSheets = true) => {
    setExporting(true);
    setExportType(type);

    try {
      switch (type) {
        case 'excel-full':
          // Full Excel report with all sheets and summary
          generateExcelReport({
            reportTitle: reportData.title,
            sheets: reportData.sheets,
            filename: `${reportData.title.toLowerCase().replace(/\s+/g, '-')}-report.xlsx`,
            companyName: reportData.companyName || 'Your Company',
            includeMetadata: true,
            includeSummary: true,
          });
          break;

        case 'excel-simple':
          // Simple Excel export (first sheet only)
          if (reportData.sheets.length > 0) {
            const firstSheet = reportData.sheets[0];
            quickExcelExport(
              reportData.title,
              firstSheet.headers,
              firstSheet.rows,
              `${reportData.title.toLowerCase().replace(/\s+/g, '-')}-simple.xlsx`
            );
          }
          break;

        case 'excel-summary':
          // Excel with summary only
          generateExcelReport({
            reportTitle: reportData.title,
            sheets: reportData.sheets,
            filename: `${reportData.title.toLowerCase().replace(/\s+/g, '-')}-summary.xlsx`,
            companyName: reportData.companyName,
            includeMetadata: true,
            includeSummary: true,
          });
          break;

        case 'csv':
          // Export first sheet as CSV
          if (reportData.sheets.length > 0) {
            const firstSheet = reportData.sheets[0];
            exportToCSV({
              headers: firstSheet.headers,
              rows: firstSheet.rows,
              filename: `${reportData.title.toLowerCase().replace(/\s+/g, '-')}.csv`,
              title: reportData.title,
            });
          }
          break;

        case 'pdf':
          // Export first sheet as PDF
          if (reportData.sheets.length > 0) {
            const firstSheet = reportData.sheets[0];
            exportToPDF({
              headers: firstSheet.headers,
              rows: firstSheet.rows,
              filename: `${reportData.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
              title: reportData.title,
            });
          }
          break;

        case 'json':
          // Export all sheets as JSON
          const jsonData = reportData.sheets.map(sheet => ({
            name: sheet.name,
            headers: sheet.headers,
            data: sheet.rows.map(row => {
              const obj: Record<string, any> = {};
              sheet.headers.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            }),
          }));

          exportToJSON({
            headers: ['Sheet Data'],
            rows: [[JSON.stringify(jsonData, null, 2)]],
            filename: `${reportData.title.toLowerCase().replace(/\s+/g, '-')}.json`,
            title: reportData.title,
          });
          break;
      }

      // Show success feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
      setExportType('');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={exporting}>
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Export Report</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Excel Export Options */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
            Excel Reports
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleExport('excel-full')}>
              <Table2 className="h-4 w-4 mr-2" />
              Full Report (All Sheets)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel-summary')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              With Summary Sheet
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel-simple')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Simple Export
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Other Format Options */}
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="h-4 w-4 mr-2 text-blue-600" />
          CSV (Comma Separated)
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2 text-red-600" />
          PDF Report
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="h-4 w-4 mr-2 text-purple-600" />
          JSON Data
        </DropdownMenuItem>

        {/* Report Info */}
        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <div className="text-xs text-slate-500">
            <div className="flex items-center justify-between mb-1">
              <span>Total Sheets:</span>
              <span className="font-semibold">{reportData.sheets.length}</span>
            </div>
            {reportData.summary && (
              <div className="flex items-center justify-between">
                <span>Total Records:</span>
                <span className="font-semibold">{reportData.summary.totalRecords}</span>
              </div>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
