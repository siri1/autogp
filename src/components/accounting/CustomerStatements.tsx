'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, FileText, Download } from 'lucide-react';
import { SAMPLE_INVOICES, generateCustomerStatement, type CustomerStatement } from '@/lib/chart-of-accounts';
import { exportCustomerStatementToPDF } from '@/lib/quotation-invoice';

const fmt = (n: number) => `AOA ${n.toLocaleString('pt-AO')}`;

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  partially_paid: 'bg-yellow-100 text-yellow-700',
};

export default function CustomerStatements() {
  const { t, language } = useLanguage();
  const invoices = SAMPLE_INVOICES;

  // Build unique customer list from invoices
  const customers = Array.from(
    invoices.reduce((map, inv) => {
      if (!map.has(inv.customerId)) map.set(inv.customerId, { id: inv.customerId, name: inv.customerName, email: inv.customerEmail });
      return map;
    }, new Map<number, { id: number; name: string; email?: string }>())
  ).map(([, v]) => v);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(customers[0]?.id ?? null);

  const statement: CustomerStatement | null = selectedCustomerId !== null
    ? generateCustomerStatement(selectedCustomerId, invoices)
    : null;

  const exportPDF = () => {
    if (!statement) return;
    exportCustomerStatementToPDF(
      statement.customerName,
      statement.customerEmail,
      statement.lines,
      { totalBilled: statement.totalBilled, totalPaid: statement.totalPaid, totalOutstanding: statement.totalOutstanding },
      language,
    );
  };

  return (
    <div className="space-y-6">
      {/* Customer selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-600" />
          <label className="text-sm font-medium">{t.accSelectCustomer}</label>
        </div>
        <select
          value={selectedCustomerId ?? ''}
          onChange={e => setSelectedCustomerId(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm min-w-[200px]"
        >
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {statement && (
          <Button size="sm" onClick={exportPDF}>
            <Download className="h-4 w-4 mr-2" />{t.accExportStatement}
          </Button>
        )}
      </div>

      {statement && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="text-xs text-blue-700 font-medium mb-1">{t.accTotalBilled}</div>
                <div className="text-2xl font-bold text-blue-900">{fmt(statement.totalBilled)}</div>
                <div className="text-xs text-blue-600">{statement.lines.length} invoice(s)</div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="text-xs text-green-700 font-medium mb-1">{t.accTotalPaid}</div>
                <div className="text-2xl font-bold text-green-900">{fmt(statement.totalPaid)}</div>
              </CardContent>
            </Card>
            <Card className={`border-2 ${statement.totalOutstanding > 0 ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
              <CardContent className="pt-4">
                <div className={`text-xs font-medium mb-1 ${statement.totalOutstanding > 0 ? 'text-red-700' : 'text-green-700'}`}>Outstanding</div>
                <div className={`text-2xl font-bold ${statement.totalOutstanding > 0 ? 'text-red-900' : 'text-green-900'}`}>{fmt(statement.totalOutstanding)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                {statement.customerName}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-1">
              {statement.customerEmail && <div>Email: {statement.customerEmail}</div>}
              <div>Statement Date: {statement.generatedDate}</div>
            </CardContent>
          </Card>

          {/* Invoice Lines */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">{t.accInvoiceNumber}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t.date}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t.dueDate}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t.quoJobNumber}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t.total}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t.accAmountPaid}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t.balance}</th>
                  <th className="px-4 py-3 text-center font-semibold">{t.accDaysOutstanding}</th>
                  <th className="px-4 py-3 text-center font-semibold">{t.status}</th>
                </tr>
              </thead>
              <tbody>
                {statement.lines.map(({ invoice: inv, daysOutstanding }, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{inv.date}</td>
                    <td className="px-4 py-3 text-slate-600">{inv.dueDate}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{inv.jobNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-mono">{fmt(inv.total)}</td>
                    <td className="px-4 py-3 text-right font-mono text-green-700">{fmt(inv.amountPaid)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">{fmt(inv.balance)}</td>
                    <td className="px-4 py-3 text-center">{daysOutstanding}d</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[inv.status] ?? ''}`}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {statement.lines.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No invoices for this customer</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
