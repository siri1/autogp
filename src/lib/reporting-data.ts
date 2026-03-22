/**
 * Reporting sample data — realistic 12-month workshop history
 */

export interface DailyRecord {
  date: string;       // YYYY-MM-DD
  jobs: number;
  invoiced: number;   // AOA
  parts: number;      // AOA
  labour: number;     // AOA
  collected: number;  // cash/card collected that day
}

export interface MonthlyRecord {
  month: string;      // YYYY-MM
  label: string;      // 'Jan 25'
  jobs: number;
  quotations: number;
  invoiced: number;
  collected: number;
  outstanding: number;
  parts: number;
  labour: number;
  newCustomers: number;
}

export interface DebtorRecord {
  customerId: number;
  customerName: string;
  phone: string;
  email: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  invoiceTotal: number;
  amountPaid: number;
  balance: number;
  daysOverdue: number;
  aging: 'current' | '1-30' | '31-60' | '61-90' | '90+';
}

// ── helpers ────────────────────────────────────────────────────────────────
function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function fmt(d: Date) {
  return d.toISOString().split('T')[0];
}

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Seed-stable random using a simple LCG so values don't shift on every render
let seed = 42;
function srnd(min: number, max: number) {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  const t = (seed >>> 0) / 0xffffffff;
  return Math.floor(t * (max - min + 1)) + min;
}

// ── Generate 12 months of daily records ───────────────────────────────────
const TODAY = new Date('2026-03-22');

export function generateDailyRecords(days = 30): DailyRecord[] {
  seed = 42;
  const records: DailyRecord[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(TODAY, -i);
    const dow = d.getDay(); // 0=Sun
    if (dow === 0) continue; // workshop closed Sunday
    const isSat = dow === 6;
    const jobs = isSat ? srnd(1, 4) : srnd(3, 10);
    const labour = jobs * srnd(12000, 35000);
    const parts  = jobs * srnd(8000, 25000);
    const invoiced = Math.round((labour + parts) * 1.14);
    const collected = Math.round(invoiced * srnd(70, 95) / 100);
    records.push({
      date: fmt(d),
      jobs,
      invoiced,
      parts,
      labour,
      collected,
    });
  }
  return records;
}

// ── Generate 12 monthly summary records ───────────────────────────────────
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function generateMonthlyRecords(months = 13): MonthlyRecord[] {
  seed = 99;
  const records: MonthlyRecord[] = [];
  const base = new Date(TODAY);
  base.setDate(1);

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${MONTH_LABELS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    const jobs = srnd(55, 130);
    const quotations = Math.round(jobs * srnd(130, 180) / 100);
    const labour = jobs * srnd(15000, 28000);
    const parts  = jobs * srnd(10000, 20000);
    const invoiced = Math.round((labour + parts) * 1.14);
    const collected = Math.round(invoiced * srnd(72, 93) / 100);
    const outstanding = invoiced - collected;
    records.push({
      month: ym,
      label,
      jobs,
      quotations,
      invoiced,
      collected,
      outstanding,
      parts,
      labour,
      newCustomers: srnd(3, 15),
    });
  }
  return records;
}

// ── Debtors ────────────────────────────────────────────────────────────────
const DEBTOR_NAMES = [
  ['Carlos Mendes',   '+244 923 111 222', 'carlos.mendes@email.ao'],
  ['Ana Paula Santos','+244 912 333 444', 'ana.santos@corp.ao'],
  ['Empresa XYZ Lda', '+244 931 555 666', 'finance@xyz.ao'],
  ['Ricardo Ferreira','+244 922 777 888', 'rferreira@gmail.com'],
  ['Maria José Costa', '+244 944 999 000', 'mjcosta@email.ao'],
  ['AutoFleet Angola', '+244 933 121 314', 'fleet@autofleet.ao'],
  ['Pedro Rodrigues',  '+244 921 151 617', 'pedro.r@work.ao'],
  ['Construções Sul',  '+244 932 181 920', 'admin@constsul.ao'],
  ['Luísa Teixeira',   '+244 916 212 223', 'luisa.t@email.ao'],
  ['Global Logistics', '+244 941 242 526', 'ap@globallog.ao'],
  ['Mário da Costa',   '+244 923 272 829', 'mario.costa@email.ao'],
  ['TechDrive Lda',    '+244 912 303 132', 'accounts@techdrive.ao'],
];

export function generateDebtorRecords(): DebtorRecord[] {
  seed = 77;
  return DEBTOR_NAMES.map(([name, phone, email], i) => {
    const daysAgo = srnd(2, 120);
    const invoiceDate = fmt(addDays(TODAY, -daysAgo));
    const terms = 30;
    const dueDate = fmt(addDays(new Date(invoiceDate), terms));
    const daysOverdue = Math.max(0, daysAgo - terms);
    const total = srnd(40000, 450000);
    const paid  = srnd(0, 1) === 1 ? Math.round(total * srnd(20, 80) / 100) : 0;
    const balance = total - paid;
    let aging: DebtorRecord['aging'] = 'current';
    if (daysOverdue > 90)     aging = '90+';
    else if (daysOverdue > 60) aging = '61-90';
    else if (daysOverdue > 30) aging = '31-60';
    else if (daysOverdue > 0)  aging = '1-30';

    return {
      customerId: i + 1,
      customerName: name,
      phone,
      email,
      invoiceNumber: `INV-202${5 + (i % 2)}-${String(i + 1).padStart(4, '0')}`,
      invoiceDate,
      dueDate,
      invoiceTotal: total,
      amountPaid: paid,
      balance,
      daysOverdue,
      aging,
    };
  });
}

export const DAILY_RECORDS   = generateDailyRecords(30);
export const MONTHLY_RECORDS = generateMonthlyRecords(13);
export const DEBTOR_RECORDS  = generateDebtorRecords();
