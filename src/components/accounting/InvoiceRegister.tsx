'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileText, DollarSign, AlertCircle, Download, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  type Invoice,
  type InvoicePayment,
  type PaymentMethod,
  applyPaymentToInvoice,
  SAMPLE_INVOICES,
} from '@/lib/chart-of-accounts';

const fmt = (n: number) => `AOA ${n.toLocaleString('pt-AO')}`;

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  partially_paid: 'bg-yellow-100 text-yellow-700',
};

export default function InvoiceRegister() {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [payForm, setPayForm] = useState<{
    amount: string;
    method: PaymentMethod;
    date: string;
    reference: string;
  }>({ amount: '', method: 'bank_transfer', date: new Date().toISOString().split('T')[0], reference: '' });

  const filtered = filterStatus === 'all' ? invoices : invoices.filter(i => i.status === filterStatus);

  const totalOutstanding = invoices.reduce((s, i) => s + i.balance, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.balance, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.amountPaid, 0);

  const openPayDialog = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayForm({ amount: String(inv.balance), method: 'bank_transfer', date: new Date().toISOString().split('T')[0], reference: '' });
    setShowPayDialog(true);
  };

  const recordPayment = () => {
    if (!selectedInvoice) return;
    const amt = parseFloat(payForm.amount);
    if (!amt || amt <= 0) return;
    const payment: Omit<InvoicePayment, 'id' | 'invoiceId'> = {
      date: payForm.date,
      amount: Math.min(amt, selectedInvoice.balance),
      method: payForm.method,
      reference: payForm.reference || undefined,
    };
    const { updatedInvoice } = applyPaymentToInvoice(selectedInvoice, payment);
    setInvoices(prev => prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
    setShowPayDialog(false);
    setSelectedInvoice(null);
  };

  const exportCSV = () => {
    const headers = ['Invoice #', 'Date', 'Due Date', 'Customer', 'Total', 'Paid', 'Balance', 'Status'];
    const rows = filtered.map(i => [
      i.invoiceNumber, i.date, i.dueDate, i.customerName,
      i.total, i.amountPaid, i.balance, i.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'invoice-register.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-700 mb-1"><FileText className="h-4 w-4" /><span className="text-xs font-medium">{t.accOutstanding}</span></div>
            <div className="text-2xl font-bold text-blue-900">{fmt(totalOutstanding)}</div>
            <div className="text-xs text-blue-600">{invoices.filter(i => i.status !== 'paid').length} {t.accOpenInvoices}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700 mb-1"><AlertCircle className="h-4 w-4" /><span className="text-xs font-medium">{t.accOverdue}</span></div>
            <div className="text-2xl font-bold text-red-900">{fmt(totalOverdue)}</div>
            <div className="text-xs text-red-600">{invoices.filter(i => i.status === 'overdue').length} {t.accOverdue.toLowerCase()}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-700 mb-1"><DollarSign className="h-4 w-4" /><span className="text-xs font-medium">{t.accCollected}</span></div>
            <div className="text-2xl font-bold text-green-900">{fmt(totalPaid)}</div>
            <div className="text-xs text-green-600">{invoices.filter(i => i.status === 'paid').length} {t.accPaidInvoices}</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {['all', 'sent', 'overdue', 'partially_paid', 'paid', 'draft'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {s === 'all' ? 'All' : s === 'partially_paid' ? 'Partial' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />{t.exportCSV}
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">{t.accInvoiceNumber}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.customer}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.date}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.dueDate}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.total}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.accAmountPaid}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.balance}</th>
              <th className="px-4 py-3 text-center font-semibold">{t.status}</th>
              <th className="px-4 py-3 text-center font-semibold">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-blue-700">{inv.invoiceNumber}</td>
                <td className="px-4 py-3 font-medium">{inv.customerName}</td>
                <td className="px-4 py-3 text-slate-600">{inv.date}</td>
                <td className="px-4 py-3 text-slate-600">{inv.dueDate}</td>
                <td className="px-4 py-3 text-right font-mono">{fmt(inv.total)}</td>
                <td className="px-4 py-3 text-right font-mono text-green-700">{fmt(inv.amountPaid)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">{fmt(inv.balance)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[inv.status] ?? ''}`}>
                    {inv.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {inv.balance > 0 && (
                    <Button size="sm" variant="outline" onClick={() => openPayDialog(inv)}>
                      <CreditCard className="h-3 w-3 mr-1" />{t.payment}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No invoices found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.accRecordPayment} — {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-slate-600">{t.customer}</span><span className="font-medium">{selectedInvoice.customerName}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">{t.invoice}</span><span className="font-medium">{fmt(selectedInvoice.total)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">{t.balance}</span><span className="font-bold text-red-700">{fmt(selectedInvoice.balance)}</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.amount}</label>
                <input type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.accPaymentMethod}</label>
                <select value={payForm.method} onChange={e => setPayForm(p => ({ ...p, method: e.target.value as PaymentMethod }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="bank_transfer">{t.accBankTransfer}</option>
                  <option value="cash">{t.accCash}</option>
                  <option value="card">{t.accCard}</option>
                  <option value="mobile_money">{t.accMobileMoney}</option>
                  <option value="cheque">{t.accCheque}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.date}</label>
                <input type="date" value={payForm.date} onChange={e => setPayForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.reference} ({t.optional})</label>
                <input type="text" value={payForm.reference} onChange={e => setPayForm(p => ({ ...p, reference: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. TRF-001" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayDialog(false)}>{t.cancel}</Button>
            <Button onClick={recordPayment} disabled={!payForm.amount || parseFloat(payForm.amount) <= 0}>
              {t.accRecordPayment}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
