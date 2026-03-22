'use client';

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Search, Download, FileSpreadsheet,
  PlusCircle, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  CreditCard, Phone, Mail, Calendar, ChevronRight, Link2, Zap,
  Clock, ReceiptText,
} from 'lucide-react';
import {
  SAMPLE_INVOICES,
  type Invoice,
  type PaymentMethod,
} from '@/lib/chart-of-accounts';

// ───────────────────────────────── types ──────────────────────────────────
interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  creditLimit: number;
  accountOpenDate: string;
}

/** A receipt = money received from the customer (not yet matched to an invoice) */
interface Receipt {
  id: string;
  customerId: number;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  notes: string;
  unallocated: number;   // amount still to be matched to invoices
}

/** One receipt → one invoice allocation */
interface Allocation {
  id: string;
  receiptId: string;
  invoiceId: number;
  invoiceNumber: string;
  amount: number;
}

interface LedgerLine {
  date: string;
  ref: string;
  description: string;
  type: 'invoice' | 'receipt' | 'allocation';
  debit: number;
  credit: number;
  balance: number;
  tag?: string;       // badge text
  tagColor?: string;
  receiptId?: string;
  invoiceId?: number;
}

// ──────────────────────────────── constants ────────────────────────────────
const CUSTOMER_PROFILES: CustomerProfile[] = [
  { id: 1, name: 'João Silva',      email: 'joao.silva@email.com',      phone: '+244 923 456 789', address: 'Rua 1 de Agosto 45, Luanda',      taxId: '5417823001', creditLimit: 500000,  accountOpenDate: '2023-03-01' },
  { id: 2, name: 'Maria Santos',    email: 'maria.santos@email.com',    phone: '+244 912 333 444', address: 'Av. 21 de Janeiro 112, Luanda',   taxId: '5421119002', creditLimit: 300000,  accountOpenDate: '2023-06-15' },
  { id: 3, name: 'Carlos Ferreira', email: 'carlos.ferreira@email.com', phone: '+244 931 555 666', address: 'Av. Comandante Gika 78, Luanda',  taxId: '5430022003', creditLimit: 800000,  accountOpenDate: '2022-11-20' },
  { id: 4, name: 'Ana Rodrigues',   email: 'ana.rodrigues@email.com',   phone: '+244 944 777 888', address: 'Rua da Missão 22, Luanda',        taxId: '5411444004', creditLimit: 250000,  accountOpenDate: '2024-01-08' },
  { id: 5, name: 'Pedro Neto',      email: 'pedro.neto@email.com',      phone: '+244 921 999 000', address: 'Bairro Miramar, Vila 15, Luanda', taxId: '5445678005', creditLimit: 1000000, accountOpenDate: '2022-07-12' },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash',          label: 'Cash'          },
  { value: 'bank_transfer', label: 'Bank Transfer'  },
  { value: 'card',          label: 'Card'           },
  { value: 'mobile_money',  label: 'Mobile Money'   },
  { value: 'cheque',        label: 'Cheque'         },
];

/** Seed receipts that already have some allocations applied */
const SEED_RECEIPTS: Receipt[] = [
  {
    id: 'rec-001', customerId: 1, date: '2026-01-12', amount: 136800,
    method: 'bank_transfer', reference: 'TRF-20260112',
    notes: 'Full payment INV-202601-0001', unallocated: 0,
  },
  {
    id: 'rec-002', customerId: 2, date: '2026-01-20', amount: 50000,
    method: 'cash', reference: 'CSH-0001',
    notes: 'Partial payment', unallocated: 0,
  },
  {
    id: 'rec-003', customerId: 5, date: '2026-03-07', amount: 353400,
    method: 'bank_transfer', reference: 'TRF-20260307',
    notes: '', unallocated: 0,
  },
];

const SEED_ALLOCATIONS: Allocation[] = [
  { id: 'alc-001', receiptId: 'rec-001', invoiceId: 1, invoiceNumber: 'INV-202601-0001', amount: 136800 },
  { id: 'alc-002', receiptId: 'rec-002', invoiceId: 2, invoiceNumber: 'INV-202601-0002', amount: 50000  },
  { id: 'alc-003', receiptId: 'rec-003', invoiceId: 5, invoiceNumber: 'INV-202603-0001', amount: 353400 },
];

// ──────────────────────────────── helpers ─────────────────────────────────
const fmtAOA = (n: number) =>
  n.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Kz';

const today = '2026-03-22';

function calcDaysOverdue(dueDate: string) {
  const diff = Math.floor((new Date(today).getTime() - new Date(dueDate).getTime()) / 86400000);
  return Math.max(0, diff);
}

function methodLabel(m: PaymentMethod) {
  return PAYMENT_METHODS.find(x => x.value === m)?.label ?? m;
}

/** Derive invoice balances from base invoices + allocations */
function applyAllocations(baseInvoices: Invoice[], allocations: Allocation[]): Invoice[] {
  return baseInvoices.map(inv => {
    const allocated = allocations
      .filter(a => a.invoiceId === inv.id)
      .reduce((s, a) => s + a.amount, 0);
    const amountPaid = allocated;
    const balance    = Math.max(0, inv.total - amountPaid);
    let status: Invoice['status'] =
      balance <= 0               ? 'paid'
      : amountPaid > 0           ? 'partially_paid'
      : calcDaysOverdue(inv.dueDate) > 0 ? 'overdue'
      : 'sent';
    return { ...inv, amountPaid, balance, status, payments: [] };
  });
}

/** Build the running ledger for one customer */
function buildLedger(
  baseInvoices: Invoice[],
  receipts: Receipt[],
  allocations: Allocation[],
  customerId: number,
): LedgerLine[] {
  const raw: Omit<LedgerLine, 'balance'>[] = [];

  // Invoice debits
  baseInvoices.filter(inv => inv.customerId === customerId).forEach(inv => {
    const ovd = calcDaysOverdue(inv.dueDate);
    const derivedStatus = applyAllocations([inv], allocations)[0].status;
    raw.push({
      date: inv.date,
      ref: inv.invoiceNumber,
      description: `Invoice${inv.jobNumber ? ` · ${inv.jobNumber}` : ''}${inv.notes ? ` — ${inv.notes}` : ''}`,
      type: 'invoice',
      debit: inv.total,
      credit: 0,
      invoiceId: inv.id,
      tag: derivedStatus === 'paid'           ? 'Paid'
         : derivedStatus === 'partially_paid' ? 'Part Paid'
         : derivedStatus === 'overdue'        ? `Overdue ${ovd}d`
         : 'Open',
      tagColor: derivedStatus === 'paid'           ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : derivedStatus === 'partially_paid' ? 'bg-amber-100 text-amber-700 border-amber-200'
              : derivedStatus === 'overdue'        ? 'bg-red-100 text-red-700 border-red-200'
              : 'bg-blue-100 text-blue-700 border-blue-200',
    });
  });

  // Receipt credits
  receipts.filter(r => r.customerId === customerId).forEach(r => {
    const allocsForReceipt = allocations.filter(a => a.receiptId === r.id);
    const totalAllocated   = allocsForReceipt.reduce((s, a) => s + a.amount, 0);
    const unalloc          = r.amount - totalAllocated;
    const isFullyAllocated = unalloc <= 0;
    raw.push({
      date: r.date,
      ref: r.reference || r.id,
      description: `Receipt · ${methodLabel(r.method)}${r.notes ? ` — ${r.notes}` : ''}`,
      type: 'receipt',
      debit: 0,
      credit: r.amount,
      receiptId: r.id,
      tag: isFullyAllocated ? 'Allocated' : unalloc === r.amount ? 'Unallocated' : `Part Alloc`,
      tagColor: isFullyAllocated
        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
        : 'bg-amber-100 text-amber-700 border-amber-200',
    });
  });

  // Sort: chronological, invoices before receipts on same date
  raw.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return a.type === 'invoice' ? -1 : 1;
  });

  let balance = 0;
  return raw.map(r => {
    balance += r.debit - r.credit;
    return { ...r, balance };
  });
}

// ──────────────────────────── Excel / PDF ─────────────────────────────────
function doExportExcel(
  profile: CustomerProfile,
  lines: LedgerLine[],
  invoices: Invoice[],
  receipts: Receipt[],
  allocations: Allocation[],
) {
  const wb = XLSX.utils.book_new();
  const totals = {
    debit:   lines.reduce((s, l) => s + l.debit,  0),
    credit:  lines.reduce((s, l) => s + l.credit, 0),
    balance: lines.length > 0 ? lines[lines.length - 1].balance : 0,
  };

  // Sheet 1 — Ledger
  const ws1 = XLSX.utils.aoa_to_sheet([
    [`Customer Current Account — ${profile.name}`],
    [`NIF: ${profile.taxId}  |  Phone: ${profile.phone}  |  Email: ${profile.email}`],
    [`Credit Limit: ${fmtAOA(profile.creditLimit)}  |  Statement Date: ${today}`],
    [],
    ['Date', 'Reference', 'Description', 'Type', 'Debit (AOA)', 'Credit (AOA)', 'Balance (AOA)', 'Status'],
    ...lines.map(l => [l.date, l.ref, l.description, l.type, l.debit || '', l.credit || '', l.balance, l.tag ?? '']),
    ['TOTALS', '', '', '', totals.debit, totals.credit, totals.balance, ''],
  ]);
  ws1['!cols'] = [12,20,44,10,18,18,22,14].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws1, 'Ledger');

  // Sheet 2 — Open invoices
  const openInvs = invoices.filter(inv => inv.customerId === profile.id && inv.status !== 'paid');
  const ws2 = XLSX.utils.aoa_to_sheet([
    ['Invoice No.', 'Date', 'Due Date', 'Total (AOA)', 'Paid (AOA)', 'Balance (AOA)', 'Days Overdue', 'Status'],
    ...openInvs.map(inv => [
      inv.invoiceNumber, inv.date, inv.dueDate,
      inv.total, inv.amountPaid, inv.balance,
      calcDaysOverdue(inv.dueDate), inv.status,
    ]),
    ['TOTAL', '', '', openInvs.reduce((s,i)=>s+i.total,0), openInvs.reduce((s,i)=>s+i.amountPaid,0), openInvs.reduce((s,i)=>s+i.balance,0), '', ''],
  ]);
  ws2['!cols'] = [18,12,12,18,16,18,14,16].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws2, 'Open Invoices');

  // Sheet 3 — Receipts & Allocations
  const custReceipts = receipts.filter(r => r.customerId === profile.id);
  const ws3 = XLSX.utils.aoa_to_sheet([
    ['Receipt Ref', 'Date', 'Method', 'Amount (AOA)', 'Allocated (AOA)', 'Unallocated (AOA)', 'Allocated To'],
    ...custReceipts.map(r => {
      const allocs = allocations.filter(a => a.receiptId === r.id);
      const allocated = allocs.reduce((s,a)=>s+a.amount,0);
      return [
        r.reference || r.id, r.date, methodLabel(r.method),
        r.amount, allocated, r.amount - allocated,
        allocs.map(a => `${a.invoiceNumber}: ${fmtAOA(a.amount)}`).join('; '),
      ];
    }),
  ]);
  ws3['!cols'] = [18,12,16,18,18,18,40].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws3, 'Receipts & Allocations');

  XLSX.writeFile(wb, `CurrentAccount_${profile.name.replace(/\s+/g,'_')}_${today}.xlsx`);
}

function doExportPDF(
  profile: CustomerProfile,
  lines: LedgerLine[],
  totals: { debit: number; credit: number; balance: number },
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 25, 'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('AutoGP Workshop', 14, 10);
  doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text('Customer Current Account', 14, 17);
  doc.text(`Statement: ${today}`, 240, 10);
  doc.setTextColor(15,23,42);
  doc.setFontSize(12); doc.setFont('helvetica','bold');
  doc.text(profile.name, 14, 34);
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(71,85,105);
  doc.text(`NIF: ${profile.taxId}   Tel: ${profile.phone}   Email: ${profile.email}`, 14, 40);
  doc.text(`${profile.address}   Credit Limit: ${fmtAOA(profile.creditLimit)}`, 14, 45);

  const boxes = [
    { label: 'Total Charged', val: fmtAOA(totals.debit),   x: 14  },
    { label: 'Total Receipts', val: fmtAOA(totals.credit), x: 100 },
    { label: 'Balance Due',   val: fmtAOA(totals.balance), x: 186 },
  ];
  boxes.forEach(b => {
    doc.setFillColor(totals.balance > 0 && b.label === 'Balance Due' ? 254 : 240, totals.balance > 0 && b.label === 'Balance Due' ? 242 : 253, totals.balance > 0 && b.label === 'Balance Due' ? 242 : 244);
    doc.roundedRect(b.x, 50, 82, 16, 2, 2, 'F');
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(71,85,105);
    doc.text(b.label, b.x+4, 56);
    doc.setFontSize(10); doc.setFont('helvetica','bold'); doc.setTextColor(15,23,42);
    doc.text(b.val, b.x+4, 63);
  });

  autoTable(doc, {
    startY: 70,
    head: [['Date','Reference','Description','Type','Debit (AOA)','Credit (AOA)','Balance (AOA)','Status']],
    body: lines.map(l => [
      l.date, l.ref, l.description,
      l.type === 'invoice' ? 'Invoice' : 'Receipt',
      l.debit  ? fmtAOA(l.debit)  : '—',
      l.credit ? fmtAOA(l.credit) : '—',
      fmtAOA(l.balance),
      l.tag ?? '',
    ]),
    foot: [['','','TOTALS','', fmtAOA(totals.debit), fmtAOA(totals.credit), fmtAOA(totals.balance),'']],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30,41,59], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [15,23,42], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248,250,252] },
    columnStyles: {
      4: { halign: 'right', textColor: [239,68,68] },
      5: { halign: 'right', textColor: [16,185,129] },
      6: { halign: 'right', fontStyle: 'bold' },
    },
  });
  doc.save(`CurrentAccount_${profile.name.replace(/\s+/g,'_')}_${today}.pdf`);
}

// ═══════════════════════════════ COMPONENT ════════════════════════════════
export default function CustomerCurrentAccount() {
  const [search, setSearch]       = useState('');
  const [selectedId, setSelectedId] = useState<number>(1);
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo,   setDateTo]     = useState('');

  // Core data
  const [baseInvoices]              = useState<Invoice[]>(SAMPLE_INVOICES);
  const [receipts, setReceipts]     = useState<Receipt[]>(SEED_RECEIPTS);
  const [allocations, setAllocations] = useState<Allocation[]>(SEED_ALLOCATIONS);

  // Dialogs
  const [showReceiptDlg,  setShowReceiptDlg]  = useState(false);
  const [showAllocateDlg, setShowAllocateDlg] = useState(false);
  const [allocatingReceipt, setAllocatingReceipt] = useState<Receipt | null>(null);

  // Receipt form
  const [recAmount, setRecAmount] = useState('');
  const [recMethod, setRecMethod] = useState<PaymentMethod>('bank_transfer');
  const [recRef,    setRecRef]    = useState('');
  const [recDate,   setRecDate]   = useState(today);
  const [recNotes,  setRecNotes]  = useState('');

  // Allocation form: invoiceId → amount string
  const [allocAmounts, setAllocAmounts] = useState<Record<number, string>>({});

  // ── derived state ────────────────────────────────────────────────────────
  const profile = CUSTOMER_PROFILES.find(c => c.id === selectedId)!;

  const invoices = useMemo(
    () => applyAllocations(baseInvoices, allocations),
    [baseInvoices, allocations],
  );

  const allLines = useMemo(
    () => buildLedger(baseInvoices, receipts, allocations, selectedId),
    [baseInvoices, receipts, allocations, selectedId],
  );

  const lines = useMemo(() => allLines.filter(l => {
    if (dateFrom && l.date < dateFrom) return false;
    if (dateTo   && l.date > dateTo)   return false;
    return true;
  }), [allLines, dateFrom, dateTo]);

  const totals = useMemo(() => ({
    debit:   lines.reduce((s, l) => s + l.debit,  0),
    credit:  lines.reduce((s, l) => s + l.credit, 0),
    balance: lines.length > 0 ? lines[lines.length - 1].balance : 0,
  }), [lines]);

  const openInvoices = invoices.filter(
    inv => inv.customerId === selectedId && inv.status !== 'paid',
  );

  const custReceipts = receipts.filter(r => r.customerId === selectedId);

  const totalUnallocated = custReceipts.reduce((s, r) => {
    const alloc = allocations.filter(a => a.receiptId === r.id).reduce((x, a) => x + a.amount, 0);
    return s + (r.amount - alloc);
  }, 0);

  const creditUsedPct = profile.creditLimit > 0
    ? Math.min(100, Math.round((Math.max(0, totals.balance) / profile.creditLimit) * 100))
    : 0;

  const filteredProfiles = CUSTOMER_PROFILES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()),
  );

  // ── record receipt ───────────────────────────────────────────────────────
  const saveReceipt = () => {
    const amount = parseFloat(recAmount);
    if (!amount || amount <= 0) return;
    const newRec: Receipt = {
      id: `rec-${Date.now()}`,
      customerId: selectedId,
      date: recDate,
      amount,
      method: recMethod,
      reference: recRef || `REC-${Date.now().toString().slice(-6)}`,
      notes: recNotes,
      unallocated: amount,
    };
    setReceipts(prev => [...prev, newRec]);
    setRecAmount(''); setRecRef(''); setRecNotes('');
    setShowReceiptDlg(false);
  };

  // ── open allocation dialog ────────────────────────────────────────────────
  const openAllocate = (r: Receipt) => {
    setAllocatingReceipt(r);
    // Pre-fill with existing allocations for this receipt
    const existing: Record<number, string> = {};
    allocations
      .filter(a => a.receiptId === r.id)
      .forEach(a => { existing[a.invoiceId] = String(a.amount); });
    setAllocAmounts(existing);
    setShowAllocateDlg(true);
  };

  const receiptAllocated = (r: Receipt) =>
    allocations.filter(a => a.receiptId === r.id).reduce((s, a) => s + a.amount, 0);

  const receiptUnallocated = (r: Receipt) => r.amount - receiptAllocated(r);

  /** Amount entered in the allocation form so far */
  const formAllocTotal = Object.values(allocAmounts)
    .reduce((s, v) => s + (parseFloat(v) || 0), 0);

  const allocRemaining = allocatingReceipt
    ? allocatingReceipt.amount - formAllocTotal
    : 0;

  /** Auto-allocate oldest first */
  const autoAllocate = () => {
    if (!allocatingReceipt) return;
    const avail = allocatingReceipt.amount;
    let remaining = avail;
    const result: Record<number, string> = {};
    const sorted = [...openInvoices].sort((a, b) => a.date.localeCompare(b.date));
    for (const inv of sorted) {
      if (remaining <= 0) break;
      const apply = Math.min(remaining, inv.balance);
      if (apply > 0) {
        result[inv.id] = apply.toFixed(2);
        remaining -= apply;
      }
    }
    setAllocAmounts(result);
  };

  const saveAllocations = () => {
    if (!allocatingReceipt) return;
    // Remove old allocations for this receipt
    const cleaned = allocations.filter(a => a.receiptId !== allocatingReceipt.id);
    // Add new ones
    const newAllocs: Allocation[] = Object.entries(allocAmounts)
      .filter(([, v]) => parseFloat(v) > 0)
      .map(([invId, v]) => {
        const inv = invoices.find(i => i.id === Number(invId));
        return {
          id: `alc-${Date.now()}-${invId}`,
          receiptId: allocatingReceipt.id,
          invoiceId: Number(invId),
          invoiceNumber: inv?.invoiceNumber ?? '',
          amount: parseFloat(v),
        };
      });
    setAllocations([...cleaned, ...newAllocs]);
    setShowAllocateDlg(false);
    setAllocatingReceipt(null);
    setAllocAmounts({});
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row gap-4">

        {/* ── Customer list sidebar ── */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…" className="pl-9" />
          </div>
          <div className="border rounded-lg divide-y max-h-[420px] overflow-y-auto">
            {filteredProfiles.map(c => {
              const bal = invoices.filter(i => i.customerId === c.id).reduce((s, i) => s + i.balance, 0);
              const hasOverdue = invoices.filter(i => i.customerId === c.id).some(i => i.status === 'overdue');
              const unalloc = receipts.filter(r => r.customerId === c.id).reduce((s, r) => {
                const a = allocations.filter(x => x.receiptId === r.id).reduce((x,y)=>x+y.amount,0);
                return s + (r.amount - a);
              }, 0);
              return (
                <button key={c.id} onClick={() => setSelectedId(c.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
                    selectedId === c.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : 'hover:bg-slate-50'
                  }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {c.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{c.name}</div>
                      <div className="text-xs text-slate-500">
                        {bal > 0 ? <span className="text-red-600">{fmtAOA(bal)} due</span> : 'Settled'}
                        {unalloc > 0 && <span className="ml-1 text-amber-600"> · {fmtAOA(unalloc)} unalloc.</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                    {hasOverdue && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                    {unalloc > 0 && <Clock className="h-3.5 w-3.5 text-amber-500" />}
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* Profile header */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {profile.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5"/>{profile.phone}</span>
                      <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5"/>{profile.email}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/>Since {profile.accountOpenDate}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{profile.address} · NIF: {profile.taxId}</div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => doExportExcel(profile, lines, invoices, receipts, allocations)}>
                    <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-600"/>Excel
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => doExportPDF(profile, lines, totals)}>
                    <Download className="h-4 w-4 mr-1.5 text-blue-600"/>PDF
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setShowReceiptDlg(true)}>
                    <PlusCircle className="h-4 w-4 mr-1.5"/>Record Receipt
                  </Button>
                </div>
              </div>
              {/* Credit bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1"><CreditCard className="h-3 w-3"/>Credit Limit: {fmtAOA(profile.creditLimit)}</span>
                  <span className={creditUsedPct>90?'text-red-600 font-semibold':creditUsedPct>70?'text-amber-600':'text-emerald-600'}>
                    {creditUsedPct}% used
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${creditUsedPct>90?'bg-red-500':creditUsedPct>70?'bg-amber-400':'bg-emerald-500'}`}
                    style={{width:`${creditUsedPct}%`}} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label:'Total Charged', val:fmtAOA(totals.debit),  icon:TrendingUp,    color:'text-red-500',    bg:'bg-white' },
              { label:'Total Receipts',val:fmtAOA(totals.credit), icon:TrendingDown,  color:'text-emerald-500',bg:'bg-white' },
              { label:'Balance Due',   val:fmtAOA(Math.max(0,totals.balance)), icon: totals.balance>0?AlertTriangle:CheckCircle,
                color:totals.balance>0?'text-red-500':'text-emerald-500',
                bg:totals.balance>0?'bg-red-50':'bg-emerald-50' },
              { label:'Unallocated',   val:fmtAOA(totalUnallocated), icon:Clock,
                color:totalUnallocated>0?'text-amber-500':'text-slate-400',
                bg:totalUnallocated>0?'bg-amber-50':'bg-white' },
            ].map(k => (
              <Card key={k.label} className={k.bg}>
                <CardContent className="p-3 flex items-center gap-3">
                  <k.icon className={`h-8 w-8 flex-shrink-0 ${k.color}`} />
                  <div>
                    <div className="text-xs text-slate-500 font-medium">{k.label}</div>
                    <div className="text-base font-bold text-slate-900">{k.val}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="ledger">
            <TabsList>
              <TabsTrigger value="ledger">Account Ledger</TabsTrigger>
              <TabsTrigger value="receipts">
                Receipts &amp; Allocation
                {totalUnallocated > 0 && (
                  <Badge className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 border border-amber-200">
                    {custReceipts.filter(r => r.amount - receiptAllocated(r) > 0).length} pending
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="open">Open Invoices</TabsTrigger>
            </TabsList>

            {/* ── LEDGER ── */}
            <TabsContent value="ledger" className="mt-3 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-slate-500">Period:</span>
                <Input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="w-38 h-8 text-sm"/>
                <span className="text-slate-400">→</span>
                <Input type="date" value={dateTo}   onChange={e=>setDateTo(e.target.value)}   className="w-38 h-8 text-sm"/>
                {(dateFrom||dateTo)&&<Button size="sm" variant="ghost" className="text-xs" onClick={()=>{setDateFrom('');setDateTo('');}}>Clear</Button>}
              </div>
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-900 text-white text-xs">
                        <th className="px-4 py-2.5 text-left">Date</th>
                        <th className="px-4 py-2.5 text-left">Reference</th>
                        <th className="px-4 py-2.5 text-left">Description</th>
                        <th className="px-4 py-2.5 text-right text-red-300">Debit</th>
                        <th className="px-4 py-2.5 text-right text-emerald-300">Credit</th>
                        <th className="px-4 py-2.5 text-right">Balance</th>
                        <th className="px-4 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lines.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No transactions in this period.</td></tr>
                      )}
                      {lines.map((l, i) => (
                        <tr key={i} className={`hover:bg-slate-50 ${l.type==='receipt'?'bg-emerald-50/40':'bg-white'}`}>
                          <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{l.date}</td>
                          <td className="px-4 py-2.5 font-mono text-xs font-medium text-blue-700 whitespace-nowrap">{l.ref}</td>
                          <td className="px-4 py-2.5 text-slate-700 max-w-xs truncate">{l.description}</td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            {l.debit>0?<span className="text-red-600 font-semibold">{fmtAOA(l.debit)}</span>:<span className="text-slate-200">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            {l.credit>0?<span className="text-emerald-600 font-semibold">{fmtAOA(l.credit)}</span>:<span className="text-slate-200">—</span>}
                          </td>
                          <td className={`px-4 py-2.5 text-right font-mono font-bold whitespace-nowrap ${l.balance>0?'text-slate-900':'text-emerald-600'}`}>
                            {fmtAOA(l.balance)}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {l.tag&&<Badge className={`text-xs border ${l.tagColor}`}>{l.tag}</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {lines.length>0&&(
                      <tfoot>
                        <tr className="bg-slate-900 text-white font-semibold">
                          <td colSpan={3} className="px-4 py-3 text-sm">ACCOUNT TOTAL</td>
                          <td className="px-4 py-3 text-right font-mono text-red-300">{fmtAOA(totals.debit)}</td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-300">{fmtAOA(totals.credit)}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-lg">{fmtAOA(totals.balance)}</td>
                          <td/>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── RECEIPTS & ALLOCATION ── */}
            <TabsContent value="receipts" className="mt-3">
              {custReceipts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-slate-400">
                    <ReceiptText className="h-10 w-10 mx-auto mb-3 opacity-30"/>
                    No receipts recorded yet. Click <strong>Record Receipt</strong> when a payment comes in.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {custReceipts.map(r => {
                    const allocated = receiptAllocated(r);
                    const unalloc   = r.amount - allocated;
                    const pct = Math.round((allocated / r.amount) * 100);
                    const allocs = allocations.filter(a => a.receiptId === r.id);
                    return (
                      <Card key={r.id} className={`border-l-4 ${unalloc>0?'border-l-amber-400':'border-l-emerald-500'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between flex-wrap gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-slate-800">{r.reference||r.id}</span>
                                <Badge className={`text-xs border ${unalloc>0?'bg-amber-100 text-amber-700 border-amber-200':'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                                  {unalloc>0?(unalloc===r.amount?'Unallocated':`Part Allocated`):'Fully Allocated'}
                                </Badge>
                              </div>
                              <div className="text-sm text-slate-600 mt-1">
                                {r.date} · {methodLabel(r.method)}
                                {r.notes&&<> · {r.notes}</>}
                              </div>
                              <div className="flex gap-4 mt-2 text-sm">
                                <span><span className="text-slate-500">Amount:</span> <strong>{fmtAOA(r.amount)}</strong></span>
                                <span><span className="text-slate-500">Allocated:</span> <span className="text-emerald-600 font-semibold">{fmtAOA(allocated)}</span></span>
                                {unalloc>0&&<span><span className="text-slate-500">Unallocated:</span> <span className="text-amber-600 font-semibold">{fmtAOA(unalloc)}</span></span>}
                              </div>
                              {/* Allocation progress bar */}
                              <div className="mt-2 w-56">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{width:`${pct}%`}}/>
                                </div>
                              </div>
                              {/* Allocation breakdown */}
                              {allocs.length>0&&(
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {allocs.map(a=>(
                                    <span key={a.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-xs text-slate-600">
                                      <Link2 className="h-3 w-3"/>{a.invoiceNumber}: {fmtAOA(a.amount)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button size="sm" variant="outline"
                              onClick={() => openAllocate(r)}
                              className={unalloc>0?'border-amber-300 text-amber-700 hover:bg-amber-50':'text-slate-500'}>
                              <Link2 className="h-4 w-4 mr-1.5"/>
                              {unalloc>0?'Allocate':'Re-allocate'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── OPEN INVOICES ── */}
            <TabsContent value="open" className="mt-3">
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-xs uppercase">
                        {['Invoice','Date','Due Date','Total','Paid','Balance','Overdue','Status'].map(h=>(
                          <th key={h} className="px-4 py-2.5 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {openInvoices.length===0&&(
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">All invoices settled.</td></tr>
                      )}
                      {openInvoices.map(inv=>{
                        const ovd = calcDaysOverdue(inv.dueDate);
                        return(
                          <tr key={inv.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-mono text-xs text-blue-700 font-semibold">{inv.invoiceNumber}</td>
                            <td className="px-4 py-2.5 text-slate-600">{inv.date}</td>
                            <td className="px-4 py-2.5 text-slate-600">{inv.dueDate}</td>
                            <td className="px-4 py-2.5 font-medium">{fmtAOA(inv.total)}</td>
                            <td className="px-4 py-2.5 text-emerald-600">{fmtAOA(inv.amountPaid)}</td>
                            <td className="px-4 py-2.5 font-bold text-red-700">{fmtAOA(inv.balance)}</td>
                            <td className="px-4 py-2.5">
                              {ovd>0?<span className="text-red-600 font-medium">{ovd}d</span>:<span className="text-emerald-600">—</span>}
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge className={`text-xs border ${
                                inv.status==='overdue'        ?'bg-red-100 text-red-700 border-red-200':
                                inv.status==='partially_paid' ?'bg-amber-100 text-amber-700 border-amber-200':
                                                               'bg-blue-100 text-blue-700 border-blue-200'
                              }`}>{inv.status.replace('_',' ')}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {openInvoices.length>0&&(
                      <tfoot>
                        <tr className="bg-slate-900 text-white font-semibold">
                          <td colSpan={3} className="px-4 py-3 text-sm">TOTAL OUTSTANDING</td>
                          <td className="px-4 py-3">{fmtAOA(openInvoices.reduce((s,i)=>s+i.total,0))}</td>
                          <td className="px-4 py-3 text-emerald-300">{fmtAOA(openInvoices.reduce((s,i)=>s+i.amountPaid,0))}</td>
                          <td className="px-4 py-3 text-red-300 font-bold">{fmtAOA(openInvoices.reduce((s,i)=>s+i.balance,0))}</td>
                          <td colSpan={2}/>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ══════════════ Record Receipt Dialog ══════════════ */}
      <Dialog open={showReceiptDlg} onOpenChange={o=>{if(!o)setShowReceiptDlg(false);}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-blue-600"/>
              Record Receipt — {profile.name}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 -mt-2">
            Record the money received first. You can match it to invoices in the next step.
          </p>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount Received (AOA)</label>
              <Input type="number" value={recAmount} onChange={e=>setRecAmount(e.target.value)}
                placeholder="0.00" min={0} autoFocus/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
              <select value={recMethod} onChange={e=>setRecMethod(e.target.value as PaymentMethod)}
                className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm bg-white">
                {PAYMENT_METHODS.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <Input type="date" value={recDate} onChange={e=>setRecDate(e.target.value)}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reference / Receipt No.</label>
              <Input value={recRef} onChange={e=>setRecRef(e.target.value)} placeholder="e.g. TRF-20260322"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
              <Input value={recNotes} onChange={e=>setRecNotes(e.target.value)} placeholder="Any notes…"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setShowReceiptDlg(false)}>Cancel</Button>
            <Button onClick={saveReceipt} disabled={!recAmount||parseFloat(recAmount)<=0}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════ Allocate Receipt Dialog ══════════════ */}
      <Dialog open={showAllocateDlg} onOpenChange={o=>{if(!o){setShowAllocateDlg(false);setAllocatingReceipt(null);}}}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-blue-600"/>
              Allocate Receipt to Invoices
            </DialogTitle>
          </DialogHeader>

          {allocatingReceipt && (
            <div className="space-y-4">
              {/* Receipt summary */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-blue-900">{allocatingReceipt.reference||allocatingReceipt.id}</span>
                    <span className="text-blue-700 ml-2">{allocatingReceipt.date} · {methodLabel(allocatingReceipt.method)}</span>
                  </div>
                  <span className="font-bold text-blue-900 text-base">{fmtAOA(allocatingReceipt.amount)}</span>
                </div>
              </div>

              {/* Auto-allocate button */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Enter how much to apply to each invoice, or use auto-allocate.</p>
                <Button size="sm" variant="outline" onClick={autoAllocate}
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                  <Zap className="h-3.5 w-3.5 mr-1.5"/>Auto-allocate (oldest first)
                </Button>
              </div>

              {/* Invoice allocation table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs">
                      <th className="px-3 py-2 text-left">Invoice</th>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-right">Balance Due</th>
                      <th className="px-3 py-2 text-right w-44">Amount to Apply</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {openInvoices.length===0&&(
                      <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-400">No open invoices for this customer.</td></tr>
                    )}
                    {openInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono text-xs text-blue-700 font-semibold">{inv.invoiceNumber}</td>
                        <td className="px-3 py-2 text-slate-600">{inv.date}</td>
                        <td className="px-3 py-2 text-right font-semibold text-red-700">{fmtAOA(inv.balance)}</td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            value={allocAmounts[inv.id]??''}
                            onChange={e => setAllocAmounts(prev=>({...prev,[inv.id]:e.target.value}))}
                            placeholder="0.00"
                            className="h-8 text-right text-sm"
                            min={0}
                            max={inv.balance}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="rounded-lg border bg-slate-50 p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Receipt amount</span>
                  <span className="font-semibold">{fmtAOA(allocatingReceipt.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total allocated</span>
                  <span className="font-semibold text-emerald-600">{fmtAOA(formAllocTotal)}</span>
                </div>
                <div className={`flex justify-between border-t pt-1 font-bold ${allocRemaining<0?'text-red-600':allocRemaining>0?'text-amber-600':'text-emerald-600'}`}>
                  <span>{allocRemaining<0?'Over-allocated':allocRemaining>0?'Remaining unallocated':'Fully allocated ✓'}</span>
                  <span>{fmtAOA(Math.abs(allocRemaining))}</span>
                </div>
              </div>

              {allocRemaining < 0 && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  ⚠ Total allocation exceeds receipt amount. Please reduce one or more entries.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={()=>{setShowAllocateDlg(false);setAllocatingReceipt(null);}}>Cancel</Button>
            <Button
              onClick={saveAllocations}
              disabled={formAllocTotal<=0||allocRemaining<0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Allocations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
