"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Clock, LogIn, LogOut, User, Wrench, BarChart3,
  Calendar, CheckCircle, AlertCircle, Coffee, Download,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface ClockEntry {
  id: number;
  technicianId: number;
  technicianName: string;
  date: string;
  clockIn: string;     // HH:MM
  clockOut?: string;   // HH:MM
  jobNumber?: string;
  type: 'job' | 'general' | 'training' | 'break';
  notes?: string;
  durationMinutes?: number;
}

interface Technician {
  id: number;
  name: string;
  role: string;
}

// ── Static data ──────────────────────────────────────────────────────────────
const TECHNICIANS: Technician[] = [
  { id: 1, name: 'Mike Rodriguez',  role: 'Senior Technician' },
  { id: 2, name: 'Sarah Chen',      role: 'Senior Technician' },
  { id: 3, name: 'David Thompson',  role: 'Technician' },
  { id: 4, name: 'James Wilson',    role: 'Technician' },
  { id: 5, name: 'Emily Martinez',  role: 'Senior Technician' },
  { id: 6, name: 'Robert Lee',      role: 'Apprentice' },
  { id: 7, name: 'Jessica Brown',   role: 'Technician' },
  { id: 8, name: 'Chris Anderson',  role: 'Apprentice' },
];

const ENTRY_TYPES: { value: ClockEntry['type']; label: string; color: string }[] = [
  { value: 'job',      label: 'Job Work',    color: 'bg-blue-100 text-blue-700' },
  { value: 'general',  label: 'General',     color: 'bg-slate-100 text-slate-700' },
  { value: 'training', label: 'Training',    color: 'bg-purple-100 text-purple-700' },
  { value: 'break',    label: 'Break',       color: 'bg-amber-100 text-amber-700' },
];

const today = new Date().toISOString().split('T')[0];
const nowHHMM = () => new Date().toTimeString().slice(0, 5);

// Generate sample data — some techs already clocked in today
const buildSampleEntries = (): ClockEntry[] => {
  const entries: ClockEntry[] = [];
  // Yesterday's full entries
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  [
    { id: 1, name: 'Mike Rodriguez',  ci: '07:55', co: '16:45', job: 'JOB-202603-0012', type: 'job' as const },
    { id: 2, name: 'Sarah Chen',      ci: '08:00', co: '16:55', job: 'JOB-202603-0013', type: 'job' as const },
    { id: 3, name: 'David Thompson',  ci: '08:05', co: '17:00', job: undefined,          type: 'general' as const },
    { id: 5, name: 'Emily Martinez',  ci: '07:50', co: '16:40', job: 'JOB-202603-0014', type: 'job' as const },
  ].forEach((e, i) => entries.push({
    id: 100 + i,
    technicianId: e.id,
    technicianName: e.name,
    date: yesterday,
    clockIn: e.ci,
    clockOut: e.co,
    jobNumber: e.job,
    type: e.type,
    durationMinutes: timeToMins(e.co) - timeToMins(e.ci),
  }));
  // Today — some clocked in, some not
  [
    { id: 1, name: 'Mike Rodriguez',  ci: '07:58', job: 'JOB-202603-0015', type: 'job' as const },
    { id: 2, name: 'Sarah Chen',      ci: '08:02', job: undefined,          type: 'general' as const },
    { id: 5, name: 'Emily Martinez',  ci: '07:52', job: 'JOB-202603-0016', type: 'job' as const },
  ].forEach((e, i) => entries.push({
    id: 200 + i,
    technicianId: e.id,
    technicianName: e.name,
    date: today,
    clockIn: e.ci,
    jobNumber: e.job,
    type: e.type,
  }));
  return entries;
};

function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minsToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function elapsedMins(clockIn: string): number {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return Math.max(0, nowMins - timeToMins(clockIn));
}

function formatElapsed(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ClockingSystem() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<ClockEntry[]>(buildSampleEntries);
  const [tick, setTick] = useState(0); // for live timer
  const [selectedDate, setSelectedDate] = useState(today);

  // Clock in/out dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [dialogTech, setDialogTech] = useState<Technician | null>(null);
  const [clockForm, setClockForm] = useState({ jobNumber: '', type: 'job' as ClockEntry['type'], notes: '' });

  // Live timer
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const activeEntry = (techId: number): ClockEntry | undefined =>
    entries.find(e => e.technicianId === techId && e.date === today && !e.clockOut);

  const techDayTotal = (techId: number, date: string): number => {
    return entries
      .filter(e => e.technicianId === techId && e.date === date)
      .reduce((sum, e) => {
        if (e.durationMinutes !== undefined) return sum + e.durationMinutes;
        if (!e.clockOut) return sum + elapsedMins(e.clockIn);
        return sum + timeToMins(e.clockOut) - timeToMins(e.clockIn);
      }, 0);
  };

  const openClockDialog = (tech: Technician) => {
    setDialogTech(tech);
    setClockForm({ jobNumber: '', type: 'job', notes: '' });
    setShowDialog(true);
  };

  const clockIn = () => {
    if (!dialogTech) return;
    const entry: ClockEntry = {
      id: Date.now(),
      technicianId: dialogTech.id,
      technicianName: dialogTech.name,
      date: today,
      clockIn: nowHHMM(),
      jobNumber: clockForm.jobNumber || undefined,
      type: clockForm.type,
      notes: clockForm.notes || undefined,
    };
    setEntries(prev => [...prev, entry]);
    setShowDialog(false);
  };

  const clockOut = (techId: number) => {
    const outTime = nowHHMM();
    setEntries(prev => prev.map(e => {
      if (e.technicianId === techId && e.date === today && !e.clockOut) {
        return {
          ...e,
          clockOut: outTime,
          durationMinutes: timeToMins(outTime) - timeToMins(e.clockIn),
        };
      }
      return e;
    }));
  };

  // ── Computed stats for selected date ──────────────────────────────────────
  const dayEntries = entries.filter(e => e.date === selectedDate);
  const totalBillableMins = dayEntries
    .filter(e => e.type === 'job')
    .reduce((s, e) => {
      if (e.durationMinutes !== undefined) return s + e.durationMinutes;
      if (!e.clockOut) return s + elapsedMins(e.clockIn);
      return s + timeToMins(e.clockOut) - timeToMins(e.clockIn);
    }, 0);
  const totalClockMins = dayEntries.reduce((s, e) => {
    if (e.durationMinutes !== undefined) return s + e.durationMinutes;
    if (!e.clockOut) return s + elapsedMins(e.clockIn);
    return s + timeToMins(e.clockOut) - timeToMins(e.clockIn);
  }, 0);
  const clockedInToday = TECHNICIANS.filter(t => !!activeEntry(t.id)).length;

  // ── Weekly summary (last 7 days) ──────────────────────────────────────────
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return d.toISOString().split('T')[0];
  });

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['Date', 'Technician', 'Clock In', 'Clock Out', 'Job', 'Type', 'Duration (min)', 'Notes'],
      ...entries
        .filter(e => e.date === selectedDate)
        .map(e => [
          e.date, e.technicianName, e.clockIn, e.clockOut ?? 'In Progress',
          e.jobNumber ?? '', e.type,
          e.durationMinutes?.toString() ?? '',
          e.notes ?? '',
        ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `timesheet-${selectedDate}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const typeColor = (type: ClockEntry['type']) =>
    ENTRY_TYPES.find(t => t.value === type)?.color ?? 'bg-slate-100 text-slate-700';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-600" />
            Technician Clocking
          </h2>
          <p className="text-slate-600 mt-1">Track billable and non-billable hours per technician</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
        </div>
      </div>

      {/* Day Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 pb-3">
            <div className="text-3xl font-bold text-blue-900">{clockedInToday}</div>
            <div className="text-xs text-blue-700 mt-1">Currently Clocked In</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4 pb-3">
            <div className="text-3xl font-bold text-green-900">{formatElapsed(totalClockMins)}</div>
            <div className="text-xs text-green-700 mt-1">Total Hours ({selectedDate === today ? 'today' : selectedDate})</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4 pb-3">
            <div className="text-3xl font-bold text-orange-900">{formatElapsed(totalBillableMins)}</div>
            <div className="text-xs text-orange-700 mt-1">Billable Hours</div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-4 pb-3">
            <div className="text-3xl font-bold text-purple-900">
              {totalClockMins > 0 ? Math.round((totalBillableMins / totalClockMins) * 100) : 0}%
            </div>
            <div className="text-xs text-purple-700 mt-1">Billable Efficiency</div>
          </CardContent>
        </Card>
      </div>

      {/* Technician Status Grid */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <User className="h-4 w-4" />Technician Status — Today
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TECHNICIANS.map(tech => {
            const active = activeEntry(tech.id);
            const elapsed = active ? elapsedMins(active.clockIn) : 0;
            const dayTotal = techDayTotal(tech.id, today);

            return (
              <Card
                key={tech.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  active ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'
                }`}
                onClick={() => openClockDialog(tech)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`h-2.5 w-2.5 rounded-full mt-1 ${active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                    <Badge className={`text-xs ${active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {active ? 'IN' : 'OUT'}
                    </Badge>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm leading-tight">{tech.name}</p>
                  <p className="text-xs text-slate-500 mb-2">{tech.role}</p>

                  {active ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-xs text-green-700">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono font-semibold">{formatElapsed(elapsed)}</span>
                      </div>
                      {active.jobNumber && (
                        <div className="text-xs text-slate-500 font-mono truncate">{active.jobNumber}</div>
                      )}
                      <div className="text-xs text-slate-400">Since {active.clockIn}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">
                      {dayTotal > 0 ? `Today: ${formatElapsed(dayTotal)}` : 'Not clocked in'}
                    </div>
                  )}

                  <Button
                    size="sm"
                    className={`w-full mt-3 h-7 text-xs ${
                      active
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    onClick={e => {
                      e.stopPropagation();
                      if (active) clockOut(tech.id);
                      else openClockDialog(tech);
                    }}
                  >
                    {active ? <><LogOut className="h-3 w-3 mr-1" />Clock Out</> : <><LogIn className="h-3 w-3 mr-1" />Clock In</>}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Timesheet for selected date */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Timesheet — {selectedDate}
        </h3>
        <Card>
          <CardContent className="p-0">
            {dayEntries.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No entries for {selectedDate}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-xs text-slate-500 uppercase">
                      <th className="px-4 py-3 text-left">Technician</th>
                      <th className="px-4 py-3 text-left">Clock In</th>
                      <th className="px-4 py-3 text-left">Clock Out</th>
                      <th className="px-4 py-3 text-left">Job</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-right">Duration</th>
                      <th className="px-4 py-3 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dayEntries
                      .sort((a, b) => a.clockIn.localeCompare(b.clockIn))
                      .map(e => {
                        const mins = e.durationMinutes !== undefined
                          ? e.durationMinutes
                          : e.clockOut
                            ? timeToMins(e.clockOut) - timeToMins(e.clockIn)
                            : elapsedMins(e.clockIn);
                        return (
                          <tr key={e.id} className={`${!e.clockOut ? 'bg-green-50' : ''}`}>
                            <td className="px-4 py-3 font-medium text-slate-800">{e.technicianName}</td>
                            <td className="px-4 py-3 font-mono text-slate-700">{e.clockIn}</td>
                            <td className="px-4 py-3">
                              {e.clockOut
                                ? <span className="font-mono text-slate-700">{e.clockOut}</span>
                                : <span className="text-green-600 font-medium text-xs flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse inline-block" />In Progress</span>}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{e.jobNumber ?? '—'}</td>
                            <td className="px-4 py-3">
                              <Badge className={`text-xs ${typeColor(e.type)}`}>{e.type}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatElapsed(mins)}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{e.notes ?? '—'}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={5} className="px-4 py-2 font-semibold text-slate-700 text-right text-sm">Total:</td>
                      <td className="px-4 py-2 text-right font-bold text-slate-900">{formatElapsed(totalClockMins)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />Weekly Summary (last 7 days)
        </h3>
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-xs text-slate-500">
                  <th className="px-4 py-3 text-left">Technician</th>
                  {weekDays.map(d => (
                    <th key={d} className={`px-3 py-3 text-center ${d === today ? 'bg-blue-50 text-blue-700 font-bold' : ''}`}>
                      {new Date(d + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' })}
                      <div className="text-xs font-normal opacity-70">{d.slice(5)}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TECHNICIANS.map(tech => {
                  const dayTotals = weekDays.map(d => techDayTotal(tech.id, d));
                  const weekTotal = dayTotals.reduce((s, v) => s + v, 0);
                  return (
                    <tr key={tech.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800 text-sm">{tech.name}</td>
                      {dayTotals.map((mins, i) => (
                        <td
                          key={i}
                          className={`px-3 py-2.5 text-center text-xs font-mono ${
                            weekDays[i] === today ? 'bg-blue-50' : ''
                          } ${mins > 0 ? 'text-slate-800 font-semibold' : 'text-slate-300'}`}
                        >
                          {mins > 0 ? minsToHHMM(mins) : '—'}
                        </td>
                      ))}
                      <td className={`px-4 py-2.5 text-right font-bold text-sm ${weekTotal > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                        {weekTotal > 0 ? formatElapsed(weekTotal) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Clock-In Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeEntry(dialogTech?.id ?? -1)
                ? <><LogOut className="h-5 w-5 text-red-500" />Clock Out</>
                : <><LogIn className="h-5 w-5 text-blue-500" />Clock In</>}
            </DialogTitle>
            <DialogDescription>
              {dialogTech?.name} · {dialogTech?.role}
            </DialogDescription>
          </DialogHeader>

          {dialogTech && (() => {
            const active = activeEntry(dialogTech.id);
            if (active) {
              const mins = elapsedMins(active.clockIn);
              return (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Clocked in at</span><span className="font-mono font-bold">{active.clockIn}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Elapsed</span><span className="font-bold text-green-700">{formatElapsed(mins)}</span></div>
                    {active.jobNumber && <div className="flex justify-between"><span className="text-slate-500">Job</span><span className="font-mono text-blue-700">{active.jobNumber}</span></div>}
                    <div className="flex justify-between"><span className="text-slate-500">Type</span><Badge className={`text-xs ${typeColor(active.type)}`}>{active.type}</Badge></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">{t.cancel}</Button>
                    <Button onClick={() => { clockOut(dialogTech.id); setShowDialog(false); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                      <LogOut className="h-4 w-4 mr-2" />Clock Out at {nowHHMM()}
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Work Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ENTRY_TYPES.map(et => (
                      <button
                        key={et.value}
                        onClick={() => setClockForm(p => ({ ...p, type: et.value }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          clockForm.type === et.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {et.label}
                      </button>
                    ))}
                  </div>
                </div>
                {clockForm.type === 'job' && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Job Number</label>
                    <input
                      type="text"
                      placeholder="e.g. JOB-202603-0015"
                      value={clockForm.jobNumber}
                      onChange={e => setClockForm(p => ({ ...p, jobNumber: e.target.value.toUpperCase() }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
                  <input
                    type="text"
                    placeholder="Task description..."
                    value={clockForm.notes}
                    onChange={e => setClockForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">{t.cancel}</Button>
                  <Button onClick={clockIn} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    <LogIn className="h-4 w-4 mr-2" />Clock In at {nowHHMM()}
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
