'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area,
} from 'recharts';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  TrendingUp, TrendingDown, FileSpreadsheet, Download,
  BarChart3, Calendar, Users, AlertTriangle, CheckCircle,
  DollarSign, Wrench, ArrowUpRight, ArrowDownRight, Clock,
  ChevronLeft, UserCheck,
} from 'lucide-react';
import {
  DAILY_RECORDS, MONTHLY_RECORDS, DEBTOR_RECORDS, TECH_HOUR_RECORDS, TECHNICIANS,
  type DebtorRecord, type TechMonthRecord,
} from '@/lib/reporting-data';

// ── helpers ────────────────────────────────────────────────────────────────
const fmtAOA = (n: number) =>
  new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(n);

const fmtK = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

const AGING_COLORS: Record<DebtorRecord['aging'], string> = {
  current: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '1-30':  'bg-yellow-100 text-yellow-700 border-yellow-200',
  '31-60': 'bg-orange-100 text-orange-700 border-orange-200',
  '61-90': 'bg-red-100 text-red-700 border-red-200',
  '90+':   'bg-red-200 text-red-900 border-red-300',
};

// ── Excel exports ──────────────────────────────────────────────────────────
function exportDebtorsExcel() {
  const wb = XLSX.utils.book_new();

  // Sheet 1 — Detailed debtors
  const headers = [
    'Customer', 'Phone', 'Email', 'Invoice No.', 'Invoice Date',
    'Due Date', 'Invoice Total (AOA)', 'Amount Paid (AOA)',
    'Balance (AOA)', 'Days Overdue', 'Aging Bucket',
  ];
  const rows = DEBTOR_RECORDS.map(d => [
    d.customerName, d.phone, d.email, d.invoiceNumber,
    d.invoiceDate, d.dueDate,
    d.invoiceTotal, d.amountPaid, d.balance,
    d.daysOverdue, d.aging,
  ]);

  const totalRow = [
    'TOTAL', '', '', '', '', '',
    DEBTOR_RECORDS.reduce((s, d) => s + d.invoiceTotal, 0),
    DEBTOR_RECORDS.reduce((s, d) => s + d.amountPaid, 0),
    DEBTOR_RECORDS.reduce((s, d) => s + d.balance, 0),
    '', '',
  ];

  const ws1 = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRow]);
  ws1['!cols'] = [22,16,28,16,14,14,20,20,16,14,14].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws1, 'Debtors Detail');

  // Sheet 2 — Aging summary
  const buckets: DebtorRecord['aging'][] = ['current', '1-30', '31-60', '61-90', '90+'];
  const bucketLabels: Record<DebtorRecord['aging'], string> = {
    current: 'Current (not due)',
    '1-30':  '1-30 Days Overdue',
    '31-60': '31-60 Days Overdue',
    '61-90': '61-90 Days Overdue',
    '90+':   '90+ Days Overdue',
  };
  const agingRows = buckets.map(b => {
    const recs = DEBTOR_RECORDS.filter(d => d.aging === b);
    return [
      bucketLabels[b],
      recs.length,
      recs.reduce((s, d) => s + d.balance, 0),
    ];
  });
  const ws2 = XLSX.utils.aoa_to_sheet([
    ['Aging Bucket', 'Count', 'Total Balance (AOA)'],
    ...agingRows,
    ['TOTAL', DEBTOR_RECORDS.length, DEBTOR_RECORDS.reduce((s, d) => s + d.balance, 0)],
  ]);
  ws2['!cols'] = [{ wch: 24 }, { wch: 10 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Aging Summary');

  XLSX.writeFile(wb, `Debtors_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}

function exportDailyExcel() {
  const wb = XLSX.utils.book_new();

  // Daily throughput sheet
  const headers = [
    'Date', 'Jobs Completed', 'Labour (AOA)', 'Parts (AOA)',
    'Invoiced (AOA)', 'Collected (AOA)', 'Collection Rate %',
  ];
  const rows = DAILY_RECORDS.map(r => [
    r.date, r.jobs, r.labour, r.parts, r.invoiced, r.collected,
    r.invoiced > 0 ? ((r.collected / r.invoiced) * 100).toFixed(1) + '%' : '0%',
  ]);
  const totalRow = [
    'TOTAL',
    DAILY_RECORDS.reduce((s, r) => s + r.jobs, 0),
    DAILY_RECORDS.reduce((s, r) => s + r.labour, 0),
    DAILY_RECORDS.reduce((s, r) => s + r.parts, 0),
    DAILY_RECORDS.reduce((s, r) => s + r.invoiced, 0),
    DAILY_RECORDS.reduce((s, r) => s + r.collected, 0),
    '',
  ];
  const ws1 = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRow]);
  ws1['!cols'] = [14, 16, 18, 18, 18, 18, 18].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws1, 'Daily Throughput');

  // Monthly summary sheet
  const mHeaders = [
    'Month', 'Jobs', 'Quotations', 'Invoiced (AOA)', 'Collected (AOA)',
    'Outstanding (AOA)', 'Parts (AOA)', 'Labour (AOA)', 'New Customers',
  ];
  const mRows = MONTHLY_RECORDS.map(m => [
    m.label, m.jobs, m.quotations, m.invoiced, m.collected,
    m.outstanding, m.parts, m.labour, m.newCustomers,
  ]);
  const ws2 = XLSX.utils.aoa_to_sheet([mHeaders, ...mRows]);
  ws2['!cols'] = [12, 8, 12, 20, 20, 20, 18, 18, 14].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws2, 'Monthly Summary');

  XLSX.writeFile(wb, `Daily_Throughput_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ── Sub-components ─────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, trend, icon: Icon, color,
}: {
  label: string; value: string; sub?: string;
  trend?: { pct: number; up: boolean };
  icon: any; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend.pct)}%
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-sm font-medium text-slate-600 mt-0.5">{label}</div>
          {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl border border-slate-700">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-medium">{typeof p.value === 'number' && p.value > 999 ? fmtK(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
// ── Colour palette for up to 8 technicians ────────────────────────────────
const TECH_COLOURS = [
  '#3b82f6','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#06b6d4','#f97316','#ec4899',
];

// ── Labour hours Excel export ──────────────────────────────────────────────
function exportLabourExcel(records: TechMonthRecord[], filterMonth: string, filterTech: number | null) {
  const wb = XLSX.utils.book_new();

  // Monthly summary sheet (all techs × months)
  const months = [...new Set(TECH_HOUR_RECORDS.map(r => r.month))].sort();
  const ws1Headers = ['Technician', 'Role', ...months.map(m => {
    const r = TECH_HOUR_RECORDS.find(x => x.month === m);
    return r ? r.monthLabel : m;
  }), 'Total'];
  const ws1Rows = TECHNICIANS.map(tech => {
    const monthTotals = months.map(m => {
      const rec = TECH_HOUR_RECORDS.find(r => r.technicianId === tech.id && r.month === m);
      return rec ? rec.totalHours : 0;
    });
    return [tech.name, tech.role, ...monthTotals, monthTotals.reduce((s,v)=>s+v,0)];
  });
  const ws1 = XLSX.utils.aoa_to_sheet([ws1Headers, ...ws1Rows]);
  ws1['!cols'] = [22, 18, ...months.map(()=>10), 10].map(w=>({wch:w}));
  XLSX.utils.book_append_sheet(wb, ws1, 'Hours by Month');

  // Detail sheet (all records, filtered)
  const filtered = records;
  const ws2 = XLSX.utils.aoa_to_sheet([
    ['Month', 'Technician', 'Role', 'Job Hrs', 'General Hrs', 'Training Hrs', 'Break Hrs', 'Total Hrs', 'Billable Hrs', 'Efficiency %'],
    ...filtered.map(r=>[r.monthLabel, r.technicianName, r.role, r.jobHours, r.generalHours, r.trainingHours, r.breakHours, r.totalHours, r.billableHours, r.efficiency]),
  ]);
  ws2['!cols'] = [12,22,18,10,12,13,10,10,12,13].map(w=>({wch:w}));
  XLSX.utils.book_append_sheet(wb, ws2, 'Detail');

  XLSX.writeFile(wb, `LabourHours_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ReportingModule({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const [tab, setTab] = useState('daily');

  // Labour hours filter state
  const [labourFilterMonth, setLabourFilterMonth] = useState<string>('');
  const [labourFilterTech,  setLabourFilterTech]  = useState<number | null>(null);
  const [drillMonth, setDrillMonth] = useState<string | null>(null);

  // KPI summary from last 30 days
  const totalJobs      = DAILY_RECORDS.reduce((s, r) => s + r.jobs, 0);
  const totalInvoiced  = DAILY_RECORDS.reduce((s, r) => s + r.invoiced, 0);
  const totalCollected = DAILY_RECORDS.reduce((s, r) => s + r.collected, 0);
  const avgJobsDay     = (totalJobs / DAILY_RECORDS.length).toFixed(1);
  const collRate       = ((totalCollected / totalInvoiced) * 100).toFixed(0);

  const totalDebtors   = DEBTOR_RECORDS.reduce((s, d) => s + d.balance, 0);
  const overdueDebtors = DEBTOR_RECORDS.filter(d => d.daysOverdue > 0).reduce((s, d) => s + d.balance, 0);

  // Month-on-month: last 2 full months
  const curMonth  = MONTHLY_RECORDS[MONTHLY_RECORDS.length - 1];
  const prevMonth = MONTHLY_RECORDS[MONTHLY_RECORDS.length - 2];
  const momRevPct = prevMonth.invoiced
    ? (((curMonth.invoiced - prevMonth.invoiced) / prevMonth.invoiced) * 100).toFixed(1)
    : '0';
  const momJobsPct = prevMonth.jobs
    ? (((curMonth.jobs - prevMonth.jobs) / prevMonth.jobs) * 100).toFixed(1)
    : '0';

  // Daily chart data — short date labels
  const dailyChartData = DAILY_RECORDS.map(r => ({
    ...r,
    dateLabel: r.date.slice(5), // MM-DD
  }));

  // Monthly chart data (last 12)
  const monthlyChartData = MONTHLY_RECORDS.slice(-12);

  // Month-on-month comparison data
  const momData = [
    { metric: 'Jobs',         prev: prevMonth.jobs,        curr: curMonth.jobs },
    { metric: 'Quotations',   prev: prevMonth.quotations,  curr: curMonth.quotations },
    { metric: 'New Customers',prev: prevMonth.newCustomers,curr: curMonth.newCustomers },
  ];

  const momRevenueData = [
    { metric: 'Invoiced',    prev: prevMonth.invoiced,    curr: curMonth.invoiced },
    { metric: 'Collected',   prev: prevMonth.collected,   curr: curMonth.collected },
    { metric: 'Outstanding', prev: prevMonth.outstanding, curr: curMonth.outstanding },
    { metric: 'Parts',       prev: prevMonth.parts,       curr: curMonth.parts },
    { metric: 'Labour',      prev: prevMonth.labour,      curr: curMonth.labour },
  ];

  // ── Labour hours derived data ──────────────────────────────────────────
  const allMonths = [...new Set(TECH_HOUR_RECORDS.map(r => r.month))].sort();
  const activeMonth = drillMonth ?? labourFilterMonth;

  // Records after filter
  const labourFiltered = useMemo(() => {
    return TECH_HOUR_RECORDS.filter(r => {
      if (activeMonth   && r.month           !== activeMonth)       return false;
      if (labourFilterTech && r.technicianId !== labourFilterTech)  return false;
      return true;
    });
  }, [activeMonth, labourFilterTech]);

  // Monthly overview chart: one row per month, one key per technician (total hours)
  const labourMonthlyChart = useMemo(() => {
    const months = labourFilterTech
      ? allMonths  // show all months for a specific tech
      : allMonths.slice(-12);
    return months.map(m => {
      const row: Record<string, any> = { month: m, label: TECH_HOUR_RECORDS.find(r=>r.month===m)?.monthLabel ?? m };
      TECHNICIANS.forEach(t => {
        const rec = TECH_HOUR_RECORDS.find(r => r.month === m && r.technicianId === t.id);
        row[t.name] = rec?.totalHours ?? 0;
      });
      row.total = TECHNICIANS.reduce((s, t) => s + (row[t.name] as number), 0);
      return row;
    });
  }, [labourFilterTech, allMonths]);

  // Drill-down: per-technician breakdown for a chosen month
  const labourDrillData = useMemo(() => {
    const m = drillMonth ?? activeMonth;
    if (!m) return [];
    return TECHNICIANS.map(t => {
      const rec = TECH_HOUR_RECORDS.find(r => r.month === m && r.technicianId === t.id);
      return {
        name: t.name.split(' ')[0], // first name for x-axis
        fullName: t.name,
        role: t.role,
        jobHours:      rec?.jobHours      ?? 0,
        generalHours:  rec?.generalHours  ?? 0,
        trainingHours: rec?.trainingHours ?? 0,
        breakHours:    rec?.breakHours    ?? 0,
        totalHours:    rec?.totalHours    ?? 0,
        efficiency:    rec?.efficiency    ?? 0,
      };
    });
  }, [drillMonth, activeMonth]);

  // Single-tech trend: all months for selected technician
  const labourTechTrendData = useMemo(() => {
    if (!labourFilterTech) return [];
    return allMonths.slice(-12).map(m => {
      const rec = TECH_HOUR_RECORDS.find(r => r.month === m && r.technicianId === labourFilterTech);
      return {
        label:    rec?.monthLabel ?? m,
        total:    rec?.totalHours    ?? 0,
        billable: rec?.billableHours ?? 0,
        training: rec?.trainingHours ?? 0,
        efficiency: rec?.efficiency  ?? 0,
      };
    });
  }, [labourFilterTech, allMonths]);

  const labourKpis = useMemo(() => {
    const base = labourFiltered.length > 0 ? labourFiltered
      : TECH_HOUR_RECORDS.filter(r => r.month === allMonths[allMonths.length - 1]);
    const total    = base.reduce((s,r)=>s+r.totalHours,0);
    const billable = base.reduce((s,r)=>s+r.billableHours,0);
    const avgEff   = base.length > 0 ? Math.round(base.reduce((s,r)=>s+r.efficiency,0)/base.length) : 0;
    return { total, billable, avgEff };
  }, [labourFiltered, allMonths]);

  // Debtors aging buckets for bar chart
  const buckets: DebtorRecord['aging'][] = ['current', '1-30', '31-60', '61-90', '90+'];
  const agingChartData = buckets.map(b => ({
    bucket: b === 'current' ? 'Current' : `${b} days`,
    balance: DEBTOR_RECORDS.filter(d => d.aging === b).reduce((s, d) => s + d.balance, 0),
    count: DEBTOR_RECORDS.filter(d => d.aging === b).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Reports &amp; Analytics
          </h1>
          <p className="text-slate-500 mt-1">Last 30 days · as of 22 Mar 2026</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportDailyExcel} className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Daily &amp; Monthly Excel
          </Button>
          <Button variant="outline" onClick={exportDebtorsExcel} className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-orange-600" />
            Debtors Excel
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Jobs (30 days)"
          value={String(totalJobs)}
          sub={`${avgJobsDay} avg/day`}
          trend={{ pct: Number(momJobsPct), up: Number(momJobsPct) >= 0 }}
          icon={Wrench}
          color="bg-blue-100 text-blue-600"
        />
        <KpiCard
          label="Invoiced (30 days)"
          value={fmtK(totalInvoiced)}
          sub="AOA"
          trend={{ pct: Number(momRevPct), up: Number(momRevPct) >= 0 }}
          icon={DollarSign}
          color="bg-emerald-100 text-emerald-600"
        />
        <KpiCard
          label="Collection Rate"
          value={`${collRate}%`}
          sub={`${fmtK(totalCollected)} collected`}
          icon={CheckCircle}
          color="bg-indigo-100 text-indigo-600"
        />
        <KpiCard
          label="Total Debtors"
          value={fmtK(totalDebtors)}
          sub={`${fmtK(overdueDebtors)} overdue`}
          icon={AlertTriangle}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="daily">Daily Throughput</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Revenue</TabsTrigger>
          <TabsTrigger value="mom">Month-on-Month</TabsTrigger>
          <TabsTrigger value="debtors">Debtors</TabsTrigger>
          <TabsTrigger value="labour">Labour Hours</TabsTrigger>
        </TabsList>

        {/* ── DAILY THROUGHPUT ── */}
        <TabsContent value="daily" className="mt-4 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Daily Jobs &amp; Invoicing — Last 30 Days</CardTitle>
              <CardDescription>Jobs completed and revenue invoiced per working day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={dailyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} interval={2} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => String(v)} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={fmtK} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="jobs" name="Jobs" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="invoiced" name="Invoiced (AOA)" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="collected" name="Collected (AOA)" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Labour vs Parts Split</CardTitle>
              <CardDescription>Revenue composition per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dailyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} interval={2} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={fmtK} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="labour" name="Labour" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="parts"  name="Parts"  stackId="a" fill="#a78bfa" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily table — last 7 days */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Detail — Last 7 Working Days</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Date','Jobs','Labour','Parts','Invoiced','Collected','Rate'].map(h => (
                      <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAILY_RECORDS.slice(-7).reverse().map(r => (
                    <tr key={r.date} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 pr-4 font-medium">{r.date}</td>
                      <td className="py-2 pr-4">{r.jobs}</td>
                      <td className="py-2 pr-4">{fmtK(r.labour)}</td>
                      <td className="py-2 pr-4">{fmtK(r.parts)}</td>
                      <td className="py-2 pr-4 font-semibold">{fmtK(r.invoiced)}</td>
                      <td className="py-2 pr-4 text-emerald-700">{fmtK(r.collected)}</td>
                      <td className="py-2">
                        <Badge className={`text-xs border ${
                          r.invoiced > 0 && r.collected / r.invoiced >= 0.85
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {r.invoiced > 0 ? Math.round(r.collected / r.invoiced * 100) : 0}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MONTHLY REVENUE ── */}
        <TabsContent value="monthly" className="mt-4 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue — 12 Months</CardTitle>
              <CardDescription>Total invoiced and collected per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={monthlyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="invoiced"    name="Invoiced"    fill="#3b82f6" radius={[3,3,0,0]} opacity={0.9} />
                  <Bar dataKey="collected"   name="Collected"   fill="#10b981" radius={[3,3,0,0]} opacity={0.9} />
                  <Bar dataKey="outstanding" name="Outstanding" fill="#f59e0b" radius={[3,3,0,0]} opacity={0.8} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Jobs &amp; Quotations</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="jobs"       name="Jobs"       fill="#6366f1" radius={[3,3,0,0]} />
                    <Bar dataKey="quotations" name="Quotations" fill="#a78bfa" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Labour vs Parts Mix</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="labour" name="Labour" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="parts"  name="Parts"  stackId="a" fill="#93c5fd" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly trend line */}
          <Card>
            <CardHeader>
              <CardTitle>New Customers Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="newCustomers" name="New Customers" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MONTH-ON-MONTH ── */}
        <TabsContent value="mom" className="mt-4 space-y-5">
          {/* Summary banner */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Current Month</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{curMonth.label}</div>
                <div className="text-lg font-semibold text-blue-600">{fmtAOA(curMonth.invoiced)}</div>
                <div className="text-sm text-slate-500">{curMonth.jobs} jobs · {curMonth.quotations} quotes</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-slate-300">
              <CardContent className="p-4">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Previous Month</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{prevMonth.label}</div>
                <div className="text-lg font-semibold text-slate-600">{fmtAOA(prevMonth.invoiced)}</div>
                <div className="text-sm text-slate-500">{prevMonth.jobs} jobs · {prevMonth.quotations} quotes</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Comparison — {prevMonth.label} vs {curMonth.label}</CardTitle>
              <CardDescription>
                Revenue {Number(momRevPct) >= 0 ? '▲' : '▼'} {Math.abs(Number(momRevPct))}% · Jobs {Number(momJobsPct) >= 0 ? '▲' : '▼'} {Math.abs(Number(momJobsPct))}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={momRevenueData} layout="vertical" margin={{ top: 5, right: 40, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="metric" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="prev" name={prevMonth.label} fill="#94a3b8" radius={[0,3,3,0]} />
                  <Bar dataKey="curr" name={curMonth.label}  fill="#3b82f6" radius={[0,3,3,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operational Volume Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={momData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="prev" name={prevMonth.label} fill="#94a3b8" radius={[3,3,0,0]} />
                  <Bar dataKey="curr" name={curMonth.label}  fill="#3b82f6" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 12-month trend for context */}
          <Card>
            <CardHeader>
              <CardTitle>12-Month Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="invoiced"  name="Invoiced"  stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} />
                  <Line type="monotone" dataKey="collected" name="Collected" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── DEBTORS ── */}
        <TabsContent value="debtors" className="mt-4 space-y-5">
          {/* Aging chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Debtors Aging Analysis</CardTitle>
                <CardDescription>Outstanding balance by aging bucket</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={agingChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="balance" name="Balance (AOA)" radius={[4,4,0,0]}>
                      {agingChartData.map((entry, i) => (
                        <rect key={i} fill={['#10b981','#f59e0b','#f97316','#ef4444','#991b1b'][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Aging summary cards */}
            <div className="space-y-2">
              {agingChartData.map((b, i) => (
                <div key={b.bucket} className="flex items-center justify-between p-3 rounded-lg border bg-white hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#10b981','#f59e0b','#f97316','#ef4444','#991b1b'][i] }} />
                    <span className="text-sm font-medium text-slate-700">{b.bucket}</span>
                    <Badge className={`text-xs border ${AGING_COLORS[(['current','1-30','31-60','61-90','90+'] as DebtorRecord['aging'][])[i]]}`}>
                      {b.count} invoice{b.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <span className="font-bold text-slate-900">{fmtAOA(b.balance)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 text-white">
                <span className="font-semibold">Total Outstanding</span>
                <span className="font-bold text-lg">{fmtAOA(totalDebtors)}</span>
              </div>
            </div>
          </div>

          {/* Debtors table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Debtors Detail</CardTitle>
                <CardDescription>{DEBTOR_RECORDS.length} open invoices</CardDescription>
              </div>
              <Button variant="outline" onClick={exportDebtorsExcel} className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Export Excel
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Customer','Invoice','Date','Due Date','Total','Paid','Balance','Overdue','Aging'].map(h => (
                      <th key={h} className="text-left py-2 pr-3 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEBTOR_RECORDS.sort((a, b) => b.balance - a.balance).map(d => (
                    <tr key={d.invoiceNumber} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 pr-3 font-medium whitespace-nowrap">{d.customerName}</td>
                      <td className="py-2 pr-3 text-slate-500 text-xs">{d.invoiceNumber}</td>
                      <td className="py-2 pr-3 text-xs">{d.invoiceDate}</td>
                      <td className="py-2 pr-3 text-xs">{d.dueDate}</td>
                      <td className="py-2 pr-3 font-medium">{fmtK(d.invoiceTotal)}</td>
                      <td className="py-2 pr-3 text-emerald-700">{fmtK(d.amountPaid)}</td>
                      <td className="py-2 pr-3 font-bold text-red-700">{fmtK(d.balance)}</td>
                      <td className="py-2 pr-3 text-xs">
                        {d.daysOverdue > 0
                          ? <span className="text-red-600 font-medium">{d.daysOverdue}d</span>
                          : <span className="text-emerald-600">—</span>
                        }
                      </td>
                      <td className="py-2">
                        <Badge className={`text-xs border ${AGING_COLORS[d.aging]}`}>{d.aging}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white">
                    <td colSpan={4} className="py-2 px-3 font-semibold">TOTAL</td>
                    <td className="py-2 pr-3 font-bold">{fmtK(DEBTOR_RECORDS.reduce((s,d)=>s+d.invoiceTotal,0))}</td>
                    <td className="py-2 pr-3">{fmtK(DEBTOR_RECORDS.reduce((s,d)=>s+d.amountPaid,0))}</td>
                    <td className="py-2 pr-3 font-bold">{fmtK(DEBTOR_RECORDS.reduce((s,d)=>s+d.balance,0))}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LABOUR HOURS ── */}
        <TabsContent value="labour" className="mt-4 space-y-5">

          {/* ── Filters ── */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Month</label>
                  <select
                    value={labourFilterMonth}
                    onChange={e => { setLabourFilterMonth(e.target.value); setDrillMonth(null); }}
                    className="h-9 rounded-md border border-slate-200 px-3 text-sm bg-white min-w-[140px]"
                  >
                    <option value="">All months</option>
                    {allMonths.map(m => {
                      const lbl = TECH_HOUR_RECORDS.find(r => r.month === m)?.monthLabel ?? m;
                      return <option key={m} value={m}>{lbl}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Technician</label>
                  <select
                    value={labourFilterTech ?? ''}
                    onChange={e => { setLabourFilterTech(e.target.value ? Number(e.target.value) : null); setDrillMonth(null); }}
                    className="h-9 rounded-md border border-slate-200 px-3 text-sm bg-white min-w-[180px]"
                  >
                    <option value="">All technicians</option>
                    {TECHNICIANS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                {(labourFilterMonth || labourFilterTech || drillMonth) && (
                  <Button size="sm" variant="outline" onClick={() => { setLabourFilterMonth(''); setLabourFilterTech(null); setDrillMonth(null); }}>
                    Clear filters
                  </Button>
                )}
                <div className="ml-auto">
                  <Button variant="outline" size="sm" onClick={() => exportLabourExcel(labourFiltered, labourFilterMonth, labourFilterTech)}>
                    <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-600" />Export Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── KPI strip ── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Hours',    val: labourKpis.total.toFixed(0),    icon: Clock,      color: 'bg-blue-100 text-blue-600'    },
              { label: 'Billable Hours', val: labourKpis.billable.toFixed(0), icon: UserCheck,  color: 'bg-emerald-100 text-emerald-600'},
              { label: 'Avg Efficiency', val: `${labourKpis.avgEff}%`,        icon: BarChart3,  color: 'bg-indigo-100 text-indigo-600' },
            ].map(k => (
              <Card key={k.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${k.color}`}><k.icon className="h-5 w-5" /></div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{k.val}</div>
                    <div className="text-sm text-slate-500">{k.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Drill-down state: month selected (or clicked) ── */}
          {(drillMonth || labourFilterMonth) && !labourFilterTech ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Technician Breakdown — {TECH_HOUR_RECORDS.find(r => r.month === (drillMonth ?? labourFilterMonth))?.monthLabel}
                    </CardTitle>
                    <CardDescription>Hours by type per technician for the selected month</CardDescription>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => { setDrillMonth(null); setLabourFilterMonth(''); }}>
                    <ChevronLeft className="h-4 w-4 mr-1" />All months
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={labourDrillData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="h" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="jobHours"      name="Job (Billable)"  stackId="a" fill="#3b82f6" />
                    <Bar dataKey="generalHours"  name="General"         stackId="a" fill="#94a3b8" />
                    <Bar dataKey="trainingHours" name="Training"        stackId="a" fill="#8b5cf6" />
                    <Bar dataKey="breakHours"    name="Break"           stackId="a" fill="#f59e0b" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Drill table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-900 text-white text-xs">
                        {['Technician','Role','Job Hrs','General','Training','Break','Total','Efficiency'].map(h=>(
                          <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {labourDrillData.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium">{r.fullName}</td>
                          <td className="px-3 py-2">
                            <Badge className={`text-xs border ${r.role==='Senior Technician'?'bg-blue-100 text-blue-700 border-blue-200':r.role==='Apprentice'?'bg-purple-100 text-purple-700 border-purple-200':'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {r.role}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-blue-700 font-semibold">{r.jobHours}h</td>
                          <td className="px-3 py-2 text-slate-600">{r.generalHours}h</td>
                          <td className="px-3 py-2 text-purple-600">{r.trainingHours}h</td>
                          <td className="px-3 py-2 text-amber-600">{r.breakHours}h</td>
                          <td className="px-3 py-2 font-bold">{r.totalHours}h</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${r.efficiency>=80?'bg-emerald-500':r.efficiency>=60?'bg-amber-400':'bg-red-400'}`}
                                  style={{width:`${r.efficiency}%`}} />
                              </div>
                              <span className={`text-xs font-medium ${r.efficiency>=80?'text-emerald-600':r.efficiency>=60?'text-amber-600':'text-red-600'}`}>
                                {r.efficiency}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-900 text-white font-semibold">
                        <td colSpan={2} className="px-3 py-2">TOTAL</td>
                        <td className="px-3 py-2">{labourDrillData.reduce((s,r)=>s+r.jobHours,0)}h</td>
                        <td className="px-3 py-2">{labourDrillData.reduce((s,r)=>s+r.generalHours,0)}h</td>
                        <td className="px-3 py-2">{labourDrillData.reduce((s,r)=>s+r.trainingHours,0)}h</td>
                        <td className="px-3 py-2">{labourDrillData.reduce((s,r)=>s+r.breakHours,0)}h</td>
                        <td className="px-3 py-2">{labourDrillData.reduce((s,r)=>s+r.totalHours,0)}h</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

          /* ── Single technician trend ── */
          ) : labourFilterTech ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  {TECHNICIANS.find(t=>t.id===labourFilterTech)?.name} — 12-Month Hours Trend
                </CardTitle>
                <CardDescription>Billable vs total hours per month with efficiency trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={labourTechTrendData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} unit="h" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" domain={[0,100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar  yAxisId="left"  dataKey="total"      name="Total Hours"    fill="#94a3b8" radius={[3,3,0,0]} />
                    <Bar  yAxisId="left"  dataKey="billable"   name="Billable Hrs"   fill="#3b82f6" radius={[3,3,0,0]} />
                    <Line yAxisId="right" dataKey="efficiency" name="Efficiency %"   stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>

                {/* Monthly detail table for this tech */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-900 text-white text-xs">
                        {['Month','Job Hrs','General','Training','Break','Total','Efficiency'].map(h=>(
                          <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {labourTechTrendData.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium">{r.label}</td>
                          <td className="px-3 py-2 text-blue-700 font-semibold">{r.billable}h</td>
                          <td className="px-3 py-2 text-slate-600">{r.total - r.billable - r.training}h</td>
                          <td className="px-3 py-2 text-purple-600">{r.training}h</td>
                          <td className="px-3 py-2 text-amber-600">—</td>
                          <td className="px-3 py-2 font-bold">{r.total}h</td>
                          <td className="px-3 py-2">
                            <span className={`font-medium ${r.efficiency>=80?'text-emerald-600':r.efficiency>=60?'text-amber-600':'text-red-600'}`}>
                              {r.efficiency}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          /* ── Default: monthly overview (all techs, click to drill) ── */
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Total Hours by Month — All Technicians</CardTitle>
                  <CardDescription>Click any bar to drill down into that month's technician breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={labourMonthlyChart}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      onClick={(data) => {
                        const m = String(data?.activeLabel ?? '');
                        if (m) {
                          const rec = TECH_HOUR_RECORDS.find(r => r.monthLabel === m || r.month === m);
                          if (rec) setDrillMonth(rec.month);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} unit="h" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {TECHNICIANS.map((t, i) => (
                        <Bar key={t.id} dataKey={t.name} stackId="a"
                          fill={TECH_COLOURS[i % TECH_COLOURS.length]}
                          radius={i === TECHNICIANS.length - 1 ? [3,3,0,0] : [0,0,0,0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-400 text-center mt-2">↑ Click a bar to see the technician breakdown for that month</p>
                </CardContent>
              </Card>

              {/* Efficiency heatmap table */}
              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Matrix — Last 6 Months</CardTitle>
                  <CardDescription>Billable efficiency % per technician per month</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-2 pr-4 font-semibold text-slate-700 min-w-[160px]">Technician</th>
                        {allMonths.slice(-6).map(m => {
                          const lbl = TECH_HOUR_RECORDS.find(r=>r.month===m)?.monthLabel ?? m;
                          return (
                            <th key={m} className="text-center py-2 px-2 font-semibold text-slate-600 min-w-[70px]">
                              <button className="hover:underline text-blue-600" onClick={()=>setDrillMonth(m)}>{lbl}</button>
                            </th>
                          );
                        })}
                        <th className="text-center py-2 px-2 font-semibold text-slate-700">Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TECHNICIANS.map(tech => {
                        const months6 = allMonths.slice(-6);
                        const efficiencies = months6.map(m => {
                          const rec = TECH_HOUR_RECORDS.find(r=>r.month===m&&r.technicianId===tech.id);
                          return rec?.efficiency ?? 0;
                        });
                        const avg = Math.round(efficiencies.reduce((s,v)=>s+v,0)/efficiencies.length);
                        return (
                          <tr key={tech.id} className="border-t border-slate-100">
                            <td className="py-2 pr-4">
                              <div className="font-medium text-slate-900">{tech.name}</div>
                              <div className="text-xs text-slate-400">{tech.role}</div>
                            </td>
                            {efficiencies.map((eff, i) => (
                              <td key={i} className="text-center py-2 px-2">
                                <span className={`inline-block w-12 text-center py-0.5 rounded text-xs font-bold ${
                                  eff >= 80 ? 'bg-emerald-100 text-emerald-700'
                                : eff >= 65 ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                                }`}>{eff}%</span>
                              </td>
                            ))}
                            <td className="text-center py-2 px-2">
                              <span className={`inline-block w-12 text-center py-0.5 rounded text-xs font-bold border ${
                                avg >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : avg >= 65 ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-red-50 text-red-700 border-red-300'
                              }`}>{avg}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
