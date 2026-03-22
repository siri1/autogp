'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  SAMPLE_TRANSACTIONS,
  SAMPLE_INVOICES,
  generateProfitLossReport,
  generateBalanceSheetReport,
  computeARAging,
  type ProfitLossReport,
  type BalanceSheetReport,
  type ARAgingBucket,
} from '@/lib/chart-of-accounts';

const fmt = (n: number) => `AOA ${n.toLocaleString('pt-AO')}`;

type ReportTab = 'pl' | 'bs' | 'aging';

export default function FinancialReports() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<ReportTab>('pl');
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-12-31');

  const plReport: ProfitLossReport = generateProfitLossReport(SAMPLE_TRANSACTIONS, fromDate, toDate);
  const bsReport: BalanceSheetReport = generateBalanceSheetReport(SAMPLE_TRANSACTIONS, toDate);
  const aging: ARAgingBucket[] = computeARAging(SAMPLE_INVOICES);

  const exportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPL = () => exportCSV('profit-loss.csv',
    ['Account Code', 'Account Name', 'Amount (AOA)'],
    [
      ...plReport.revenue.map(r => [r.accountCode, r.accountName, r.amount]),
      ['', 'Total Revenue', plReport.totalRevenue],
      ['', '', ''],
      ...plReport.costOfSales.map(r => [r.accountCode, r.accountName, r.amount]),
      ['', 'Gross Profit', plReport.grossProfit],
      ['', '', ''],
      ...plReport.operatingExpenses.map(r => [r.accountCode, r.accountName, r.amount]),
      ['', 'Operating Profit', plReport.operatingProfit],
      ['', 'Net Income', plReport.netIncome],
    ]
  );

  const exportAging = () => exportCSV('ar-aging.csv',
    ['Customer', 'Current (0-30)', '31-60 Days', '61-90 Days', '90+ Days', 'Total'],
    aging.map(b => [b.customerName, b.current, b.days30, b.days60, b.days90Plus, b.total])
  );

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[{ id: 'pl', label: t.accProfitLoss }, { id: 'bs', label: t.accBalanceSheet }, { id: 'aging', label: t.accArAging }].map(tabItem => (
          <button key={tabItem.id} onClick={() => setTab(tabItem.id as ReportTab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === tabItem.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Period selector (P&L and BS) */}
      {tab !== 'aging' && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{t.from}</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{t.to}</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm" />
          </div>
          <Button variant="outline" size="sm" onClick={tab === 'pl' ? exportPL : undefined}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
        </div>
      )}

      {/* P&L */}
      {tab === 'pl' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-green-700">{t.accRevenue}</CardTitle></CardHeader>
              <CardContent>
                {plReport.revenue.length === 0 ? <p className="text-sm text-slate-400">No revenue in period</p> : (
                  <div className="space-y-1">
                    {plReport.revenue.map((r, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-600">{r.accountCode} — {r.accountName}</span>
                        <span>{fmt(r.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold border-t pt-1 text-green-700">
                      <span>Total Revenue</span><span>{fmt(plReport.totalRevenue)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-orange-700">{t.accCostOfSales}</CardTitle></CardHeader>
              <CardContent>
                {plReport.costOfSales.length === 0 ? <p className="text-sm text-slate-400">None</p> : (
                  <div className="space-y-1">
                    {plReport.costOfSales.map((r, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-600">{r.accountCode} — {r.accountName}</span>
                        <span>{fmt(r.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t pt-1 mt-2 text-blue-700">
                  <span>Gross Profit</span><span>{fmt(plReport.grossProfit)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700">{t.accOperatingExpenses}</CardTitle></CardHeader>
              <CardContent>
                {plReport.operatingExpenses.length === 0 ? <p className="text-sm text-slate-400">None</p> : (
                  <div className="space-y-1">
                    {plReport.operatingExpenses.map((r, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-600">{r.accountCode} — {r.accountName}</span>
                        <span>{fmt(r.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold border-t pt-1 text-red-700">
                      <span>Total Op. Expenses</span><span>{fmt(plReport.totalOperatingExpenses)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className={`border-2 ${plReport.netIncome >= 0 ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-600">Operating Profit</div>
                    <div className="font-semibold">{fmt(plReport.operatingProfit)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-600">Net Income</div>
                    <div className={`text-2xl font-bold ${plReport.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {fmt(plReport.netIncome)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Balance Sheet */}
      {tab === 'bs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-700">{t.accAssets}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">{t.accCurrentAssets}</div>
                  {bsReport.assets.current.length === 0 ? <p className="text-xs text-slate-400">None</p> : bsReport.assets.current.map((l, i) => (
                    <div key={i} className="flex justify-between text-sm"><span className="text-slate-600">{l.accountCode} — {l.accountName}</span><span>{fmt(l.balance)}</span></div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">{t.accNonCurrentAssets}</div>
                  {bsReport.assets.nonCurrent.length === 0 ? <p className="text-xs text-slate-400">None</p> : bsReport.assets.nonCurrent.map((l, i) => (
                    <div key={i} className="flex justify-between text-sm"><span className="text-slate-600">{l.accountCode} — {l.accountName}</span><span>{fmt(l.balance)}</span></div>
                  ))}
                </div>
                <div className="flex justify-between font-bold border-t pt-2 text-blue-700">
                  <span>Total Assets</span><span>{fmt(bsReport.assets.totalAssets)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700">{t.accLiabilities}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">Current Liabilities</div>
                  {bsReport.liabilities.current.length === 0 ? <p className="text-xs text-slate-400">None</p> : bsReport.liabilities.current.map((l, i) => (
                    <div key={i} className="flex justify-between text-sm"><span className="text-slate-600">{l.accountCode} — {l.accountName}</span><span>{fmt(l.balance)}</span></div>
                  ))}
                </div>
                <div className="flex justify-between font-bold border-t pt-2 text-red-700">
                  <span>Total Liabilities</span><span>{fmt(bsReport.liabilities.totalLiabilities)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-purple-700">{t.accEquity}</CardTitle></CardHeader>
              <CardContent>
                {bsReport.equity.length === 0 ? <p className="text-sm text-slate-400">None</p> : bsReport.equity.map((l, i) => (
                  <div key={i} className="flex justify-between text-sm"><span className="text-slate-600">{l.accountCode} — {l.accountName}</span><span>{fmt(l.balance)}</span></div>
                ))}
                <div className="flex justify-between font-bold border-t pt-2 mt-2 text-purple-700">
                  <span>Total Equity</span><span>{fmt(bsReport.totalEquity)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>Liabilities + Equity</span><span>{fmt(bsReport.totalLiabilitiesAndEquity)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* AR Aging */}
      {tab === 'aging' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={exportAging}>
              <Download className="h-4 w-4 mr-2" />Export CSV
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">{t.customer}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t.accAgingCurrent}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t.accAging30}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t.accAging60}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t.accAging90}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t.total}</th>
                </tr>
              </thead>
              <tbody>
                {aging.map((b, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{b.customerName}</td>
                    <td className="px-4 py-3 text-right font-mono">{b.current > 0 ? fmt(b.current) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-yellow-700">{b.days30 > 0 ? fmt(b.days30) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-orange-700">{b.days60 > 0 ? fmt(b.days60) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-red-700">{b.days90Plus > 0 ? fmt(b.days90Plus) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">{fmt(b.total)}</td>
                  </tr>
                ))}
                {aging.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No outstanding receivables</td></tr>
                )}
                {aging.length > 0 && (
                  <tr className="bg-slate-50 font-bold border-t-2">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right font-mono">{fmt(aging.reduce((s, b) => s + b.current, 0))}</td>
                    <td className="px-4 py-3 text-right font-mono text-yellow-700">{fmt(aging.reduce((s, b) => s + b.days30, 0))}</td>
                    <td className="px-4 py-3 text-right font-mono text-orange-700">{fmt(aging.reduce((s, b) => s + b.days60, 0))}</td>
                    <td className="px-4 py-3 text-right font-mono text-red-700">{fmt(aging.reduce((s, b) => s + b.days90Plus, 0))}</td>
                    <td className="px-4 py-3 text-right font-mono">{fmt(aging.reduce((s, b) => s + b.total, 0))}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
