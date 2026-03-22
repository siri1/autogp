'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ShoppingCart, AlertCircle, CheckCircle, Plus, CreditCard, Download } from 'lucide-react';
import {
  type VendorBill,
  type BillPayment,
  type PaymentMethod,
  type BillCategory,
  BILL_CATEGORY_LABELS,
  BILL_CATEGORY_ACCOUNT_MAP,
  applyPaymentToBill,
  generateBillNumber,
  SAMPLE_VENDOR_BILLS,
} from '@/lib/chart-of-accounts';

const fmt = (n: number) => `AOA ${n.toLocaleString('pt-AO')}`;

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  partially_paid: 'bg-yellow-100 text-yellow-700',
};

const EMPTY_BILL: Omit<VendorBill, 'id' | 'billNumber' | 'amountPaid' | 'balance' | 'status' | 'payments'> = {
  vendorName: '', date: '', dueDate: '', category: 'parts_purchase',
  expenseAccountCode: BILL_CATEGORY_ACCOUNT_MAP.parts_purchase, description: '',
  subtotal: 0, vatAmount: 0, total: 0,
};

export default function BillsRegister() {
  const { t } = useLanguage();
  const [bills, setBills] = useState<VendorBill[]>(SAMPLE_VENDOR_BILLS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBill, setSelectedBill] = useState<VendorBill | null>(null);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newBill, setNewBill] = useState({ ...EMPTY_BILL });
  const [payForm, setPayForm] = useState({ amount: '', method: 'bank_transfer' as PaymentMethod, date: new Date().toISOString().split('T')[0], reference: '' });

  const filtered = filterStatus === 'all' ? bills : bills.filter(b => b.status === filterStatus);
  const totalPayable = bills.reduce((s, b) => s + b.balance, 0);
  const totalOverdue = bills.filter(b => b.status === 'overdue').reduce((s, b) => s + b.balance, 0);
  const totalPaid = bills.reduce((s, b) => s + b.amountPaid, 0);

  const computeSubtotal = (val: string) => {
    const sub = parseFloat(val) || 0;
    const vat = Math.round(sub * 0.14);
    setNewBill(p => ({ ...p, subtotal: sub, vatAmount: vat, total: sub + vat }));
  };

  const saveBill = () => {
    const id = Date.now();
    const bill: VendorBill = {
      ...newBill,
      id,
      billNumber: generateBillNumber(bills.length),
      expenseAccountCode: BILL_CATEGORY_ACCOUNT_MAP[newBill.category],
      amountPaid: 0,
      balance: newBill.total,
      status: 'pending',
      payments: [],
    };
    setBills(prev => [bill, ...prev]);
    setShowNewDialog(false);
    setNewBill({ ...EMPTY_BILL });
  };

  const openPayDialog = (bill: VendorBill) => {
    setSelectedBill(bill);
    setPayForm({ amount: String(bill.balance), method: 'bank_transfer', date: new Date().toISOString().split('T')[0], reference: '' });
    setShowPayDialog(true);
  };

  const recordPayment = () => {
    if (!selectedBill) return;
    const amt = parseFloat(payForm.amount);
    if (!amt || amt <= 0) return;
    const payment: Omit<BillPayment, 'id' | 'billId'> = {
      date: payForm.date,
      amount: Math.min(amt, selectedBill.balance),
      method: payForm.method,
      reference: payForm.reference || undefined,
    };
    const { updatedBill } = applyPaymentToBill(selectedBill, payment);
    setBills(prev => prev.map(b => b.id === updatedBill.id ? updatedBill : b));
    setShowPayDialog(false);
  };

  const exportCSV = () => {
    const headers = ['Bill #', 'Vendor', 'Date', 'Due Date', 'Category', 'Total', 'Paid', 'Balance', 'Status'];
    const rows = filtered.map(b => [b.billNumber, b.vendorName, b.date, b.dueDate, BILL_CATEGORY_LABELS[b.category], b.total, b.amountPaid, b.balance, b.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bills-register.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const canSave = newBill.vendorName && newBill.date && newBill.dueDate && newBill.subtotal > 0 && newBill.description;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-700 mb-1"><ShoppingCart className="h-4 w-4" /><span className="text-xs font-medium">{t.accTotalPayable}</span></div>
            <div className="text-2xl font-bold text-orange-900">{fmt(totalPayable)}</div>
            <div className="text-xs text-orange-600">{bills.filter(b => b.status !== 'paid').length} {t.accOpenBills}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700 mb-1"><AlertCircle className="h-4 w-4" /><span className="text-xs font-medium">{t.accOverdue}</span></div>
            <div className="text-2xl font-bold text-red-900">{fmt(totalOverdue)}</div>
            <div className="text-xs text-red-600">{bills.filter(b => b.status === 'overdue').length} {t.accOverdue.toLowerCase()}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-700 mb-1"><CheckCircle className="h-4 w-4" /><span className="text-xs font-medium">{t.accCollected}</span></div>
            <div className="text-2xl font-bold text-green-900">{fmt(totalPaid)}</div>
            <div className="text-xs text-green-600">{bills.filter(b => b.status === 'paid').length} {t.accPaidBills}</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'overdue', 'partially_paid', 'paid'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s === 'all' ? 'All' : s === 'partially_paid' ? 'Partial' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />{t.exportCSV}</Button>
          <Button size="sm" onClick={() => setShowNewDialog(true)}><Plus className="h-4 w-4 mr-2" />{t.accNewBill}</Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">{t.accBillNumber}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.accVendor}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.category}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.dueDate}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.total}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.accAmountPaid}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.balance}</th>
              <th className="px-4 py-3 text-center font-semibold">{t.status}</th>
              <th className="px-4 py-3 text-center font-semibold">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(bill => (
              <tr key={bill.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-orange-700">{bill.billNumber}</td>
                <td className="px-4 py-3 font-medium">{bill.vendorName}</td>
                <td className="px-4 py-3 text-slate-600">{BILL_CATEGORY_LABELS[bill.category]}</td>
                <td className="px-4 py-3 text-slate-600">{bill.dueDate}</td>
                <td className="px-4 py-3 text-right font-mono">{fmt(bill.total)}</td>
                <td className="px-4 py-3 text-right font-mono text-green-700">{fmt(bill.amountPaid)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{fmt(bill.balance)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[bill.status] ?? ''}`}>
                    {bill.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {bill.balance > 0 && (
                    <Button size="sm" variant="outline" onClick={() => openPayDialog(bill)}>
                      <CreditCard className="h-3 w-3 mr-1" />Pay
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No bills found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Bill Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t.accNewBill}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t.accVendor}</label>
              <input value={newBill.vendorName} onChange={e => setNewBill(p => ({ ...p, vendorName: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Vendor / Supplier name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Bill Date</label>
                <input type="date" value={newBill.date} onChange={e => setNewBill(p => ({ ...p, date: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input type="date" value={newBill.dueDate} onChange={e => setNewBill(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={newBill.category} onChange={e => setNewBill(p => ({ ...p, category: e.target.value as BillCategory, expenseAccountCode: BILL_CATEGORY_ACCOUNT_MAP[e.target.value as BillCategory] }))}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                {(Object.keys(BILL_CATEGORY_LABELS) as BillCategory[]).map(c => (
                  <option key={c} value={c}>{BILL_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input value={newBill.description} onChange={e => setNewBill(p => ({ ...p, description: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Bill description" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtotal (AOA)</label>
              <input type="number" value={newBill.subtotal || ''} onChange={e => computeSubtotal(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0" />
            </div>
            {newBill.subtotal > 0 && (
              <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>{fmt(newBill.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">VAT 14%</span><span>{fmt(newBill.vatAmount)}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>{fmt(newBill.total)}</span></div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>{t.cancel}</Button>
            <Button onClick={saveBill} disabled={!canSave}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.accRecordPayment} — {selectedBill?.billNumber}</DialogTitle></DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-slate-600">Vendor</span><span className="font-medium">{selectedBill.vendorName}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Bill Total</span><span>{fmt(selectedBill.total)}</span></div>
                <div className="flex justify-between font-bold text-red-700"><span>Balance Due</span><span>{fmt(selectedBill.balance)}</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Method</label>
                <select value={payForm.method} onChange={e => setPayForm(p => ({ ...p, method: e.target.value as PaymentMethod }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" value={payForm.date} onChange={e => setPayForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reference</label>
                <input value={payForm.reference} onChange={e => setPayForm(p => ({ ...p, reference: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Optional" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayDialog(false)}>{t.cancel}</Button>
            <Button onClick={recordPayment} disabled={!payForm.amount || parseFloat(payForm.amount) <= 0}>{t.accRecordPayment}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
