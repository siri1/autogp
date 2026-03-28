'use client';

import { useState, useMemo } from 'react';
import {
  SAMPLE_FLEET_CLIENTS,
  SAMPLE_FLEET_VEHICLES,
  SAMPLE_MAINTENANCE_INTERVALS,
  SAMPLE_FLEET_COSTS,
  type FleetClient,
  type FleetVehicle,
  type MaintenanceInterval,
  type FleetCostEntry,
  type FleetVehicleStatus,
  type CostCategory,
  type FuelType,
} from '@/lib/fleet-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Truck,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  DollarSign,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Pencil,
  X,
  Car,
  Users,
  CalendarClock,
  Gauge,
  TrendingUp,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('pt-AO');
const fmtAoa = (n: number) => `${n.toLocaleString('pt-AO')} AOA`;

const STATUS_CFG: Record<FleetVehicleStatus, { label: string; color: string; dot: string; icon: React.ElementType }> = {
  ok:         { label: 'OK',         color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  due_soon:   { label: 'Due Soon',   color: 'bg-amber-100 text-amber-700 border-amber-200',       dot: 'bg-amber-500',   icon: Clock },
  overdue:    { label: 'Overdue',    color: 'bg-red-100 text-red-700 border-red-200',             dot: 'bg-red-500',     icon: AlertTriangle },
  in_service: { label: 'In Service', color: 'bg-blue-100 text-blue-700 border-blue-200',          dot: 'bg-blue-500',    icon: Wrench },
  retired:    { label: 'Retired',    color: 'bg-slate-100 text-slate-500 border-slate-200',       dot: 'bg-slate-400',   icon: X },
};

const MAINT_CFG: Record<string, { color: string; icon: React.ElementType }> = {
  ok:       { color: 'text-emerald-600', icon: CheckCircle2 },
  due_soon: { color: 'text-amber-600',   icon: Clock },
  overdue:  { color: 'text-red-600',     icon: AlertTriangle },
};

const COST_COLOURS: Record<CostCategory, string> = {
  'Labour':       'bg-blue-100 text-blue-700',
  'Parts':        'bg-violet-100 text-violet-700',
  'Tyres':        'bg-orange-100 text-orange-700',
  'Oil & Fluids': 'bg-amber-100 text-amber-700',
  'Inspection':   'bg-cyan-100 text-cyan-700',
  'Bodywork':     'bg-pink-100 text-pink-700',
  'Other':        'bg-slate-100 text-slate-600',
};

function vehicleLabel(v: FleetVehicle) {
  return `${v.make} ${v.model} (${v.registration})`;
}

// ─── Log Cost Dialog ──────────────────────────────────────────────────────────

const BLANK_COST: Omit<FleetCostEntry, 'id'> = {
  vehicleId: '', date: new Date().toISOString().slice(0, 10),
  category: 'Oil & Fluids', description: '',
  labourCost: 0, partsCost: 0, totalCost: 0,
  odometer: 0, invoiceRef: '', technicianName: '',
};

function LogCostDialog({
  vehicles,
  prefillVehicleId,
  onSave,
  onClose,
}: {
  vehicles: FleetVehicle[];
  prefillVehicleId?: string;
  onSave: (entry: FleetCostEntry) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<FleetCostEntry, 'id'>>({
    ...BLANK_COST,
    vehicleId: prefillVehicleId ?? '',
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => {
      const next = { ...f, [k]: v };
      next.totalCost = next.labourCost + next.partsCost;
      return next;
    });

  const valid = form.vehicleId && form.description.trim() && form.totalCost > 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" /> Log Maintenance Cost
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Vehicle *</label>
            <select
              value={form.vehicleId}
              onChange={e => set('vehicleId', e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select vehicle…</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{vehicleLabel(v)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Date *</label>
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Category</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value as CostCategory)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(['Labour','Parts','Tyres','Oil & Fluids','Inspection','Bodywork','Other'] as CostCategory[]).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Description *</label>
            <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Oil & filter service" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Labour (AOA)</label>
              <Input type="number" min={0} value={form.labourCost} onChange={e => set('labourCost', Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Parts (AOA)</label>
              <Input type="number" min={0} value={form.partsCost} onChange={e => set('partsCost', Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Total (AOA)</label>
              <Input readOnly value={form.totalCost} className="bg-slate-50 font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Odometer (km)</label>
              <Input type="number" min={0} value={form.odometer} onChange={e => set('odometer', Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Invoice Ref</label>
              <Input value={form.invoiceRef} onChange={e => set('invoiceRef', e.target.value)} placeholder="FT0001" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Technician</label>
            <Input value={form.technicianName} onChange={e => set('technicianName', e.target.value)} placeholder="Name" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!valid}
            onClick={() => { onSave({ id: `ce${Date.now()}`, ...form }); onClose(); }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Vehicle Row (expandable) ─────────────────────────────────────────────────

function VehicleRow({
  vehicle,
  intervals,
  onLogCost,
}: {
  vehicle: FleetVehicle;
  intervals: MaintenanceInterval[];
  onLogCost: (vehicleId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_CFG[vehicle.status];
  const StatusIcon = st.icon;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Main row */}
      <button
        className="w-full flex items-center gap-4 px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${st.dot}`} />
        <div className="flex-1 grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 min-w-0">
          {/* Identity */}
          <div>
            <div className="font-semibold text-sm text-slate-900 leading-tight">
              {vehicle.make} {vehicle.model} <span className="text-slate-400 font-normal text-xs">{vehicle.year}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">{vehicle.registration}</div>
          </div>
          {/* Mileage */}
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Mileage</div>
            <div className="text-sm font-medium text-slate-700">{fmt(vehicle.currentMileage)} km</div>
          </div>
          {/* Next service */}
          <div className="text-right hidden md:block">
            <div className="text-xs text-slate-400">Next service</div>
            <div className="text-sm font-medium text-slate-700">{vehicle.nextServiceDate}</div>
          </div>
          {/* Driver */}
          <div className="text-right hidden lg:block">
            <div className="text-xs text-slate-400">Driver</div>
            <div className="text-sm text-slate-700">{vehicle.assignedDriver ?? '—'}</div>
          </div>
          {/* Status */}
          <Badge className={`border text-[10px] flex items-center gap-1 ${st.color}`}>
            <StatusIcon className="h-2.5 w-2.5" /> {st.label}
          </Badge>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-3">
          {vehicle.notes && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {vehicle.notes}
            </p>
          )}

          {/* Maintenance tasks */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Maintenance Intervals</p>
            <div className="space-y-1.5">
              {intervals.length === 0 && (
                <p className="text-xs text-slate-400 italic">No intervals configured for this vehicle.</p>
              )}
              {intervals.map(mi => {
                const mc = MAINT_CFG[mi.status];
                const MIcon = mc.icon;
                return (
                  <div key={mi.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
                    <MIcon className={`h-3.5 w-3.5 flex-shrink-0 ${mc.color}`} />
                    <span className="flex-1 font-medium text-slate-700">{mi.task}</span>
                    {mi.intervalKm && <span className="text-slate-400">every {fmt(mi.intervalKm)} km</span>}
                    {mi.intervalMonths && <span className="text-slate-400">{mi.intervalMonths} mo</span>}
                    <span className="text-slate-500">Due: {mi.nextDueDate} / {fmt(mi.nextDueKm)} km</span>
                    <span className="font-semibold text-slate-700">{fmtAoa(mi.estimatedCostAoa)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={() => onLogCost(vehicle.id)}>
              <DollarSign className="h-3.5 w-3.5 mr-1" /> Log Cost
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Fleet Vehicles Tab ───────────────────────────────────────────────────────

function VehiclesTab({
  vehicles,
  intervals,
  clients,
  onLogCost,
}: {
  vehicles: FleetVehicle[];
  intervals: MaintenanceInterval[];
  clients: FleetClient[];
  onLogCost: (vehicleId: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<FleetVehicleStatus | 'all'>('all');

  const filtered = useMemo(() => vehicles.filter(v => {
    if (clientFilter !== 'all' && v.fleetClientId !== clientFilter) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    const q = search.toLowerCase();
    return (
      v.registration.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      (v.assignedDriver ?? '').toLowerCase().includes(q)
    );
  }), [vehicles, search, clientFilter, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Plate, make, model, driver…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={clientFilter}
          onChange={e => setClientFilter(e.target.value)}
          className="border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-1">
          {(['all', 'overdue', 'due_soon', 'ok', 'in_service'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                statusFilter === s
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_CFG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle rows grouped by client */}
      {clients.map(client => {
        const clientVehicles = filtered.filter(v => v.fleetClientId === client.id);
        if (clientFilter !== 'all' && clientFilter !== client.id) return null;
        if (clientVehicles.length === 0) return null;
        return (
          <div key={client.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-slate-700 text-sm">{client.name}</span>
              <span className="text-xs text-slate-400">— {clientVehicles.length} vehicle{clientVehicles.length !== 1 ? 's' : ''}</span>
            </div>
            {clientVehicles.map(v => (
              <VehicleRow
                key={v.id}
                vehicle={v}
                intervals={intervals.filter(mi => mi.vehicleId === v.id)}
                onLogCost={onLogCost}
              />
            ))}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No vehicles found</p>
        </div>
      )}
    </div>
  );
}

// ─── Maintenance Tab ──────────────────────────────────────────────────────────

function MaintenanceTab({
  intervals,
  vehicles,
  onLogCost,
}: {
  intervals: MaintenanceInterval[];
  vehicles: FleetVehicle[];
  onLogCost: (vehicleId: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'due_soon' | 'ok'>('all');

  const sorted = useMemo(() => {
    const priority = { overdue: 0, due_soon: 1, ok: 2 };
    return [...intervals]
      .filter(mi => statusFilter === 'all' || mi.status === statusFilter)
      .sort((a, b) => priority[a.status] - priority[b.status]);
  }, [intervals, statusFilter]);

  const overdue  = intervals.filter(mi => mi.status === 'overdue').length;
  const dueSoon  = intervals.filter(mi => mi.status === 'due_soon').length;

  return (
    <div className="space-y-4">
      {/* Alert banner */}
      {(overdue > 0 || dueSoon > 0) && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
          overdue > 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {overdue > 0 && <span>{overdue} overdue task{overdue !== 1 ? 's' : ''}</span>}
          {overdue > 0 && dueSoon > 0 && <span>·</span>}
          {dueSoon > 0 && <span>{dueSoon} due soon</span>}
          <span className="font-normal opacity-75">— action required</span>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1">
        {(['all', 'overdue', 'due_soon', 'ok'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              statusFilter === s
                ? 'bg-slate-800 text-white border-slate-800'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
            }`}
          >
            {s === 'all' ? 'All Tasks' : s === 'ok' ? 'OK' : s === 'due_soon' ? 'Due Soon' : 'Overdue'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehicle</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Task</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Interval</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Done</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Next Due</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Est. Cost</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map(mi => {
              const mc = MAINT_CFG[mi.status];
              const MIcon = mc.icon;
              const v = vehicles.find(x => x.id === mi.vehicleId);
              return (
                <tr key={mi.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <MIcon className={`h-4 w-4 ${mc.color}`} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{v ? `${v.make} ${v.model}` : '—'}</div>
                    <div className="text-xs text-slate-400 font-mono">{v?.registration}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{mi.task}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {mi.intervalKm ? `${fmt(mi.intervalKm)} km` : ''}
                    {mi.intervalKm && mi.intervalMonths ? ' / ' : ''}
                    {mi.intervalMonths ? `${mi.intervalMonths} mo` : ''}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    <div>{mi.lastDoneDate}</div>
                    <div className="text-slate-400">{fmt(mi.lastDoneKm)} km</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className={`font-semibold ${mc.color}`}>{mi.nextDueDate}</div>
                    <div className="text-slate-400">{fmt(mi.nextDueKm)} km</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-700">{fmtAoa(mi.estimatedCostAoa)}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => v && onLogCost(v.id)}>
                      Log
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <PackageCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No tasks in this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cost Reports Tab ─────────────────────────────────────────────────────────

function CostReportsTab({
  costs,
  vehicles,
  clients,
  onAdd,
}: {
  costs: FleetCostEntry[];
  vehicles: FleetVehicle[];
  clients: FleetClient[];
  onAdd: () => void;
}) {
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [clientFilter, setClientFilter]   = useState('all');

  // Filter costs
  const clientVehicleIds = useMemo(() => {
    if (clientFilter === 'all') return null;
    return vehicles.filter(v => v.fleetClientId === clientFilter).map(v => v.id);
  }, [clientFilter, vehicles]);

  const filtered = useMemo(() => costs.filter(c => {
    if (vehicleFilter !== 'all' && c.vehicleId !== vehicleFilter) return false;
    if (clientVehicleIds && !clientVehicleIds.includes(c.vehicleId)) return false;
    return true;
  }), [costs, vehicleFilter, clientVehicleIds]);

  // Per-vehicle totals
  const vehicleTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(c => { map[c.vehicleId] = (map[c.vehicleId] ?? 0) + c.totalCost; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([vid, total]) => ({ vehicle: vehicles.find(v => v.id === vid)!, total }))
      .filter(x => x.vehicle);
  }, [filtered, vehicles]);

  // Category totals
  const categoryTotals = useMemo(() => {
    const map: Partial<Record<CostCategory, number>> = {};
    filtered.forEach(c => { map[c.category] = (map[c.category] ?? 0) + c.totalCost; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]) as [CostCategory, number][];
  }, [filtered]);

  const grandTotal   = filtered.reduce((s, c) => s + c.totalCost, 0);
  const labourTotal  = filtered.reduce((s, c) => s + c.labourCost, 0);
  const partsTotal   = filtered.reduce((s, c) => s + c.partsCost, 0);
  const maxVehTotal  = vehicleTotals[0]?.total ?? 1;

  return (
    <div className="space-y-5">
      {/* Filters & add */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <select
            value={clientFilter}
            onChange={e => { setClientFilter(e.target.value); setVehicleFilter('all'); }}
            className="border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={vehicleFilter}
            onChange={e => setVehicleFilter(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Vehicles</option>
            {vehicles
              .filter(v => clientFilter === 'all' || v.fleetClientId === clientFilter)
              .map(v => <option key={v.id} value={v.id}>{vehicleLabel(v)}</option>)
            }
          </select>
        </div>
        <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-1.5" /> Log Cost
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spend',   value: fmtAoa(grandTotal),  icon: TrendingUp,   color: 'text-blue-600' },
          { label: 'Labour',        value: fmtAoa(labourTotal), icon: Wrench,        color: 'text-violet-600' },
          { label: 'Parts & Tyres', value: fmtAoa(partsTotal),  icon: Car,           color: 'text-amber-600' },
          { label: 'Entries',       value: String(filtered.length), icon: BarChart3, color: 'text-emerald-600' },
        ].map(k => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">{k.label}</span>
              <k.icon className={`h-4 w-4 ${k.color}`} />
            </div>
            <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Cost per vehicle bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cost by Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {vehicleTotals.length === 0 && <p className="text-xs text-slate-400 italic">No data</p>}
            {vehicleTotals.map(({ vehicle: v, total }) => (
              <div key={v.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">{v.make} {v.model} <span className="text-slate-400 font-mono">{v.registration}</span></span>
                  <span className="text-slate-600 font-semibold">{fmtAoa(total)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(total / maxVehTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cost by category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cost by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categoryTotals.length === 0 && <p className="text-xs text-slate-400 italic">No data</p>}
            {categoryTotals.map(([cat, total]) => (
              <div key={cat} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${COST_COLOURS[cat]}`}>{cat}</span>
                </div>
                <span className="text-sm font-semibold text-slate-700">{fmtAoa(total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Cost log table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cost Log</CardTitle>
          <CardDescription className="text-xs">{filtered.length} entries · sorted newest first</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['Date','Vehicle','Description','Category','Labour','Parts','Total','Inv. Ref'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...filtered].sort((a, b) => b.date.localeCompare(a.date)).map(c => {
                  const v = vehicles.find(x => x.id === c.vehicleId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap text-xs">{c.date}</td>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-slate-800 text-xs">{v ? `${v.make} ${v.model}` : '—'}</div>
                        <div className="text-slate-400 font-mono text-[10px]">{v?.registration}</div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 text-xs max-w-[180px] truncate">{c.description}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${COST_COLOURS[c.category]}`}>{c.category}</span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 text-xs whitespace-nowrap">{fmtAoa(c.labourCost)}</td>
                      <td className="px-4 py-2.5 text-slate-600 text-xs whitespace-nowrap">{fmtAoa(c.partsCost)}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800 text-xs whitespace-nowrap">{fmtAoa(c.totalCost)}</td>
                      <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{c.invoiceRef ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">No cost entries match this filter.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FleetManagement() {
  const [clients]   = useState<FleetClient[]>(SAMPLE_FLEET_CLIENTS);
  const [vehicles]  = useState<FleetVehicle[]>(SAMPLE_FLEET_VEHICLES);
  const [intervals] = useState<MaintenanceInterval[]>(SAMPLE_MAINTENANCE_INTERVALS);
  const [costs, setCosts] = useState<FleetCostEntry[]>(SAMPLE_FLEET_COSTS);

  const [logCostFor,  setLogCostFor]  = useState<string | undefined>(undefined);
  const [logCostOpen, setLogCostOpen] = useState(false);

  const openLogCost = (vehicleId?: string) => {
    setLogCostFor(vehicleId);
    setLogCostOpen(true);
  };

  // Summary KPIs
  const totalVehicles  = vehicles.length;
  const overdueCount   = vehicles.filter(v => v.status === 'overdue').length;
  const dueSoonCount   = vehicles.filter(v => v.status === 'due_soon').length;
  const inServiceCount = vehicles.filter(v => v.status === 'in_service').length;
  const totalSpend     = costs.reduce((s, c) => s + c.totalCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Truck className="h-8 w-8 text-blue-600" />
            Fleet Management
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            Add-on module — maintenance intervals &amp; cost reporting per fleet vehicle
            <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px]">Add-on</Badge>
          </p>
        </div>
        <Button onClick={() => openLogCost()} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-1.5" /> Log Cost
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Vehicles',  value: totalVehicles,  icon: Truck,        color: 'text-blue-600'    },
          { label: 'Overdue',         value: overdueCount,   icon: AlertTriangle, color: 'text-red-600'     },
          { label: 'Due Soon',        value: dueSoonCount,   icon: Clock,        color: 'text-amber-600'   },
          { label: 'In Service',      value: inServiceCount, icon: Wrench,       color: 'text-blue-500'    },
          { label: 'Total Spend (AOA)', value: fmt(totalSpend), icon: DollarSign, color: 'text-emerald-600' },
        ].map(k => (
          <Card key={k.label} className="p-4 text-center">
            <k.icon className={`h-5 w-5 mx-auto mb-1 ${k.color}`} />
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="vehicles">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="vehicles"     className="flex items-center gap-1.5 text-xs"><Car className="h-3.5 w-3.5" /> Vehicles</TabsTrigger>
          <TabsTrigger value="maintenance"  className="flex items-center gap-1.5 text-xs"><CalendarClock className="h-3.5 w-3.5" /> Maintenance</TabsTrigger>
          <TabsTrigger value="costs"        className="flex items-center gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Cost Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="mt-4">
          <VehiclesTab
            vehicles={vehicles}
            intervals={intervals}
            clients={clients}
            onLogCost={openLogCost}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <MaintenanceTab
            intervals={intervals}
            vehicles={vehicles}
            onLogCost={openLogCost}
          />
        </TabsContent>

        <TabsContent value="costs" className="mt-4">
          <CostReportsTab
            costs={costs}
            vehicles={vehicles}
            clients={clients}
            onAdd={() => openLogCost()}
          />
        </TabsContent>
      </Tabs>

      {/* Log Cost dialog */}
      {logCostOpen && (
        <LogCostDialog
          vehicles={vehicles}
          prefillVehicleId={logCostFor}
          onSave={entry => setCosts(prev => [entry, ...prev])}
          onClose={() => setLogCostOpen(false)}
        />
      )}
    </div>
  );
}
