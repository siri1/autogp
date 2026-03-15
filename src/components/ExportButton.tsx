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
} from '@/components/ui/dropdown-menu';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Copy,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportToJSON,
  copyToClipboard,
  printData,
  type ExportData,
} from '@/lib/export-utils';

interface ExportButtonProps {
  data: ExportData;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  label?: string;
}

export default function ExportButton({
  data,
  variant = 'default',
  size = 'default',
  label = 'Export',
}: ExportButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(data);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Download className="h-4 w-4 mr-2" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => exportToExcel(data)}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          Export to Excel
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => exportToCSV(data)}>
          <FileText className="h-4 w-4 mr-2 text-blue-600" />
          Export to CSV
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => exportToPDF(data)}>
          <FileText className="h-4 w-4 mr-2 text-red-600" />
          Export to PDF
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => exportToJSON(data)}>
          <FileJson className="h-4 w-4 mr-2 text-purple-600" />
          Export to JSON
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleCopy}>
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2 text-slate-600" />
              Copy to Clipboard
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => printData(data)}>
          <Printer className="h-4 w-4 mr-2 text-slate-600" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
