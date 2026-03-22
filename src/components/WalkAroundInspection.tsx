"use client";

import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  ClipboardCheck, Plus, Eye, Car, Fuel, Gauge, User,
  AlertTriangle, CheckCircle, Clock, FileText, Trash2,
} from 'lucide-react';
import {
  type VehicleInspection, type DamageMarker, type DamageType, type DamageSeverity,
  DAMAGE_TYPES, DAMAGE_SEVERITIES, FUEL_LEVELS, ZONE_LABELS,
  severityFill, severityStroke, generateInspectionNumber, SAMPLE_INSPECTIONS,
} from '@/lib/vehicle-inspection';
import type { CRMCustomer } from '@/lib/crm-data';
import { fullName } from '@/lib/crm-data';
import type { Vehicle } from '@/components/VehicleDatabase';

// ── Car zone polygon definitions (SVG viewBox="0 0 220 480") ─────────────────
const CAR_ZONES: { id: string; points: string; labelX: number; labelY: number; rotate?: boolean }[] = [
  { id: 'front-bumper', points: '65,2 155,2 170,22 50,22',          labelX: 110, labelY: 13  },
  { id: 'fl-fender',    points: '10,30 50,22 48,150 10,145',         labelX: 29,  labelY: 86, rotate: true },
  { id: 'hood',         points: '50,22 170,22 170,150 50,150',        labelX: 110, labelY: 86  },
  { id: 'fr-fender',    points: '210,30 170,22 172,150 210,145',      labelX: 191, labelY: 86, rotate: true },
  { id: 'windscreen',   points: '50,150 170,150 165,188 55,188',      labelX: 110, labelY: 170 },
  { id: 'fl-door',      points: '8,150 50,150 50,330 8,325',          labelX: 29,  labelY: 237, rotate: true },
  { id: 'roof',         points: '55,188 165,188 165,312 55,312',      labelX: 110, labelY: 250 },
  { id: 'fr-door',      points: '212,150 170,150 170,330 212,325',    labelX: 191, labelY: 237, rotate: true },
  { id: 'rear-window',  points: '55,312 165,312 170,350 50,350',      labelX: 110, labelY: 331 },
  { id: 'rl-quarter',   points: '8,325 50,330 50,435 8,430',          labelX: 29,  labelY: 380, rotate: true },
  { id: 'trunk',        points: '50,350 170,350 172,435 48,435',      labelX: 110, labelY: 392 },
  { id: 'rr-quarter',   points: '212,325 170,330 170,435 212,430',    labelX: 191, labelY: 380, rotate: true },
  { id: 'rear-bumper',  points: '50,435 170,435 157,455 63,455',      labelX: 110, labelY: 446 },
];

const STATUS_COLORS = {
  draft:     'bg-gray-100 text-gray-700',
  completed: 'bg-blue-100 text-blue-700',
  signed:    'bg-green-100 text-green-700',
};

const SEVERITY_BADGE: Record<DamageSeverity, string> = {
  minor:    'bg-yellow-100 text-yellow-700',
  moderate: 'bg-orange-100 text-orange-700',
  severe:   'bg-red-100 text-red-700',
};

interface WalkAroundProps {
  inspections: VehicleInspection[];
  onInspectionsChange: (v: VehicleInspection[]) => void;
  customers?: CRMCustomer[];
  vehicles?: Vehicle[];
}

// ── Car Diagram SVG ──────────────────────────────────────────────────────────
function CarDiagram({
  markers,
  selectedZone,
  onZoneClick,
  readonly = false,
}: {
  markers: DamageMarker[];
  selectedZone: string | null;
  onZoneClick: (zoneId: string) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const zoneMarkers = useCallback(
    (zoneId: string) => markers.filter(m => m.zone === zoneId),
    [markers]
  );

  const worstSeverity = (zoneId: string): DamageSeverity | null => {
    const zm = zoneMarkers(zoneId);
    if (zm.length === 0) return null;
    if (zm.some(m => m.severity === 'severe'))   return 'severe';
    if (zm.some(m => m.severity === 'moderate')) return 'moderate';
    return 'minor';
  };

  const getFill = (zoneId: string) => {
    if (selectedZone === zoneId) return '#bfdbfe'; // blue-200
    const ws = worstSeverity(zoneId);
    if (ws) return severityFill(ws);
    if (hovered === zoneId && !readonly) return '#e2e8f0';
    return '#f1f5f9';
  };

  const getStroke = (zoneId: string) => {
    if (selectedZone === zoneId) return '#3b82f6';
    const ws = worstSeverity(zoneId);
    if (ws) return severityStroke(ws);
    return '#94a3b8';
  };

  return (
    <svg
      viewBox="0 0 220 475"
      className="w-full max-w-xs mx-auto select-none"
      style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))' }}
    >
      {/* Car body silhouette */}
      <path
        d="M 65,2 L 155,2 L 210,30 L 212,150 L 212,325 L 210,430 L 157,455 L 63,455 L 10,430 L 8,325 L 8,150 L 10,30 Z"
        fill="#e2e8f0"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />

      {/* Zones */}
      {CAR_ZONES.map(zone => {
        const count = zoneMarkers(zone.id).length;
        const isNarrow = zone.rotate;
        return (
          <g key={zone.id}>
            <polygon
              points={zone.points}
              fill={getFill(zone.id)}
              stroke={getStroke(zone.id)}
              strokeWidth={selectedZone === zone.id ? 2 : 1}
              style={{ cursor: readonly ? 'default' : 'pointer', transition: 'fill 0.15s' }}
              onClick={() => !readonly && onZoneClick(zone.id)}
              onMouseEnter={() => !readonly && setHovered(zone.id)}
              onMouseLeave={() => setHovered(null)}
            />
            {/* Label / count */}
            {count > 0 ? (
              <text
                x={zone.labelX}
                y={zone.labelY}
                textAnchor="middle"
                fontSize={isNarrow ? 9 : 10}
                fontWeight="700"
                fill={severityStroke(worstSeverity(zone.id)!)}
                style={{ pointerEvents: 'none' }}
                transform={isNarrow ? `rotate(-90,${zone.labelX},${zone.labelY})` : undefined}
              >
                {count}
              </text>
            ) : !isNarrow ? (
              <text
                x={zone.labelX}
                y={zone.labelY + 4}
                textAnchor="middle"
                fontSize={8}
                fill="#64748b"
                style={{ pointerEvents: 'none' }}
              >
                {ZONE_LABELS[zone.id]}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* Windscreen lines */}
      <line x1="80" y1="155" x2="75" y2="188" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="140" y1="155" x2="145" y2="188" stroke="#cbd5e1" strokeWidth="1" />
      {/* Rear window lines */}
      <line x1="80" y1="312" x2="75" y2="350" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="140" y1="312" x2="145" y2="350" stroke="#cbd5e1" strokeWidth="1" />

      {/* Direction arrows */}
      <text x="110" y="472" textAnchor="middle" fontSize="9" fill="#94a3b8">▼ REAR</text>
      <text x="110" y="0" textAnchor="middle" fontSize="9" fill="#94a3b8" dy="9">▲ FRONT</text>
    </svg>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function WalkAroundInspection({
  inspections,
  onInspectionsChange,
  customers = [],
  vehicles = [],
}: WalkAroundProps) {
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewInspection, setViewInspection] = useState<VehicleInspection | null>(null);

  // Form state
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showDamageForm, setShowDamageForm] = useState(false);
  const [damageForm, setDamageForm] = useState<{ type: DamageType; severity: DamageSeverity; notes: string }>({
    type: 'scratch', severity: 'minor', notes: '',
  });

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const emptyInspection = (): Partial<VehicleInspection> => ({
    date: today,
    time: nowTime,
    mileage: 0,
    fuelLevel: '1/2',
    damageMarkers: [],
    generalNotes: '',
    technicianName: '',
    customerName: '',
    vehiclePlate: '',
    vehicleMake: '',
    vehicleModel: '',
    status: 'draft',
  });

  const [form, setForm] = useState<Partial<VehicleInspection>>(emptyInspection());

  // Customer autocomplete
  const [custSearch, setCustSearch] = useState('');
  const [pickedCust, setPickedCust] = useState<CRMCustomer | null>(null);
  const [pickedVehicle, setPickedVehicle] = useState<Vehicle | null>(null);

  const filteredCusts = customers.filter(c => {
    const q = custSearch.toLowerCase();
    return fullName(c).toLowerCase().includes(q) || c.phone.includes(q);
  });

  const pickCustomer = (c: CRMCustomer) => {
    setPickedCust(c);
    setForm(p => ({ ...p, customerId: c.id, customerName: fullName(c), customerPhone: c.phone }));
    setCustSearch('');
  };

  const pickVehicle = (v: Vehicle) => {
    setPickedVehicle(v);
    setForm(p => ({ ...p, vehiclePlate: v.plate, vehicleMake: v.make, vehicleModel: v.model, vehicleYear: v.year }));
  };

  const custVehicles = pickedCust ? vehicles.filter(v => v.ownerId === pickedCust.id) : [];

  // Zone click
  const handleZoneClick = (zoneId: string) => {
    setSelectedZone(zoneId);
    setDamageForm({ type: 'scratch', severity: 'minor', notes: '' });
    setShowDamageForm(true);
  };

  const addDamage = () => {
    if (!selectedZone) return;
    const marker: DamageMarker = {
      id: Date.now(),
      zone: selectedZone,
      zoneName: ZONE_LABELS[selectedZone] ?? selectedZone,
      type: damageForm.type,
      severity: damageForm.severity,
      notes: damageForm.notes,
    };
    setForm(p => ({ ...p, damageMarkers: [...(p.damageMarkers ?? []), marker] }));
    setShowDamageForm(false);
    setSelectedZone(null);
  };

  const removeMarker = (markerId: number) => {
    setForm(p => ({ ...p, damageMarkers: (p.damageMarkers ?? []).filter(m => m.id !== markerId) }));
  };

  const saveInspection = (status: 'draft' | 'completed') => {
    const number = generateInspectionNumber(inspections.length);
    const inspection: VehicleInspection = {
      id: Date.now(),
      inspectionNumber: number,
      date: form.date!,
      time: form.time!,
      customerId: form.customerId,
      customerName: form.customerName!,
      customerPhone: form.customerPhone,
      vehiclePlate: form.vehiclePlate!,
      vehicleMake: form.vehicleMake!,
      vehicleModel: form.vehicleModel!,
      vehicleYear: form.vehicleYear,
      mileage: form.mileage ?? 0,
      fuelLevel: form.fuelLevel!,
      damageMarkers: form.damageMarkers ?? [],
      generalNotes: form.generalNotes ?? '',
      technicianName: form.technicianName ?? '',
      status,
      createdDate: today,
    };
    onInspectionsChange([inspection, ...inspections]);
    resetForm();
  };

  const resetForm = () => {
    setForm(emptyInspection());
    setPickedCust(null);
    setPickedVehicle(null);
    setCustSearch('');
    setSelectedZone(null);
    setShowDamageForm(false);
    setShowForm(false);
  };

  const canSave = !!(form.customerName && form.vehiclePlate && form.vehicleMake && form.technicianName);

  const totalDamage = inspections.reduce((s, i) => s + i.damageMarkers.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-teal-600" />
            Vehicle Walk-Around Inspection
          </h2>
          <p className="text-slate-600 mt-2">Record pre-existing damage when receiving a vehicle</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Inspection
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Inspections', value: inspections.length, color: 'blue' },
          { label: 'Completed',         value: inspections.filter(i => i.status !== 'draft').length, color: 'green' },
          { label: 'Damage Items',      value: totalDamage,        color: 'orange' },
          { label: 'Today',             value: inspections.filter(i => i.date === today).length, color: 'teal' },
        ].map(s => (
          <Card key={s.label} className={`border-${s.color}-200 bg-${s.color}-50`}>
            <CardContent className="pt-4 pb-3">
              <div className={`text-3xl font-bold text-${s.color}-900`}>{s.value}</div>
              <div className={`text-xs text-${s.color}-700 mt-1`}>{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inspection list */}
      <div className="space-y-3">
        {inspections.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-slate-400">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No inspections yet</p>
              <p className="text-sm mt-1">Create one when receiving a vehicle</p>
            </CardContent>
          </Card>
        ) : (
          inspections.map(insp => (
            <Card key={insp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-mono text-sm font-bold text-teal-700">{insp.inspectionNumber}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[insp.status]}`}>{insp.status}</Badge>
                      {insp.damageMarkers.length > 0 && (
                        <Badge className="text-xs bg-orange-100 text-orange-700">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {insp.damageMarkers.length} damage item{insp.damageMarkers.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {insp.damageMarkers.length === 0 && (
                        <Badge className="text-xs bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />No damage
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <User className="h-3.5 w-3.5" />{insp.customerName}
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Car className="h-3.5 w-3.5" />{insp.vehicleMake} {insp.vehicleModel}
                        <span className="font-mono text-xs text-slate-400 ml-1">{insp.vehiclePlate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Gauge className="h-3.5 w-3.5" />{insp.mileage.toLocaleString()} km
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3.5 w-3.5" />{insp.date} {insp.time}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setViewInspection(insp); setShowView(true); }}
                  >
                    <Eye className="h-4 w-4 mr-1" />View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── New Inspection Dialog ─────────────────────────────────────── */}
      <Dialog open={showForm} onOpenChange={open => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-teal-600" />
              New Vehicle Walk-Around Inspection
            </DialogTitle>
            <DialogDescription>Mark all pre-existing damage before work begins</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* LEFT: Form fields */}
            <div className="space-y-5">
              {/* Customer */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2"><User className="h-4 w-4" />Customer</h4>
                {pickedCust ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">{fullName(pickedCust)}</p>
                      <p className="text-xs text-slate-500">{pickedCust.phone}</p>
                    </div>
                    <button onClick={() => { setPickedCust(null); setPickedVehicle(null); setForm(p => ({ ...p, customerId: undefined, customerName: '' })); }} className="text-xs text-slate-400 hover:text-red-500">Change</button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Search customer..."
                      value={custSearch}
                      onChange={e => setCustSearch(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                    {custSearch.length > 0 && (
                      <div className="border rounded-lg overflow-hidden max-h-36 overflow-y-auto">
                        {filteredCusts.length > 0 ? filteredCusts.map(c => (
                          <button key={c.id} onClick={() => pickCustomer(c)} className="w-full text-left px-3 py-2 hover:bg-teal-50 border-b border-slate-100 last:border-0 text-sm">
                            <p className="font-medium">{fullName(c)}</p>
                            <p className="text-xs text-slate-400">{c.phone}</p>
                          </button>
                        )) : <p className="text-sm text-slate-400 p-3">No customers found</p>}
                      </div>
                    )}
                    {!pickedCust && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <input placeholder="Customer name *" value={form.customerName ?? ''} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} className="col-span-2 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                        <input placeholder="Phone" value={form.customerPhone ?? ''} onChange={e => setForm(p => ({ ...p, customerPhone: e.target.value }))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Vehicle */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2"><Car className="h-4 w-4" />Vehicle</h4>
                {pickedCust && custVehicles.length > 0 && !pickedVehicle && (
                  <div className="border rounded-lg overflow-hidden mb-2">
                    {custVehicles.map(v => (
                      <button key={v.id} onClick={() => pickVehicle(v)} className="w-full text-left px-3 py-2 hover:bg-teal-50 border-b border-slate-100 last:border-0 text-sm flex justify-between">
                        <span>{v.make} {v.model} ({v.year})</span>
                        <span className="font-mono text-xs text-teal-700">{v.plate}</span>
                      </button>
                    ))}
                  </div>
                )}
                {pickedVehicle ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">{pickedVehicle.make} {pickedVehicle.model} ({pickedVehicle.year})</p>
                      <p className="font-mono text-xs text-slate-500">{pickedVehicle.plate}</p>
                    </div>
                    <button onClick={() => { setPickedVehicle(null); }} className="text-xs text-slate-400 hover:text-red-500">Change</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Plate *" value={form.vehiclePlate ?? ''} onChange={e => setForm(p => ({ ...p, vehiclePlate: e.target.value.toUpperCase() }))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono" />
                    <input placeholder="Make *" value={form.vehicleMake ?? ''} onChange={e => setForm(p => ({ ...p, vehicleMake: e.target.value }))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                    <input placeholder="Model" value={form.vehicleModel ?? ''} onChange={e => setForm(p => ({ ...p, vehicleModel: e.target.value }))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                    <input type="number" placeholder="Year" value={form.vehicleYear ?? ''} onChange={e => setForm(p => ({ ...p, vehicleYear: parseInt(e.target.value) }))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                )}
              </div>

              {/* Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />Mileage (km)</label>
                  <input type="number" value={form.mileage ?? 0} onChange={e => setForm(p => ({ ...p, mileage: parseInt(e.target.value) || 0 }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />Fuel Level</label>
                  <div className="flex gap-1">
                    {FUEL_LEVELS.map(lv => (
                      <button
                        key={lv}
                        onClick={() => setForm(p => ({ ...p, fuelLevel: lv }))}
                        className={`flex-1 py-1.5 text-xs rounded font-medium transition-all ${form.fuelLevel === lv ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {lv}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Damage form panel (shown when zone clicked) */}
              {showDamageForm && selectedZone && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
                  <p className="font-semibold text-orange-800 text-sm">
                    Adding damage to: <span className="text-orange-700">{ZONE_LABELS[selectedZone]}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Damage Type</label>
                      <select
                        value={damageForm.type}
                        onChange={e => setDamageForm(p => ({ ...p, type: e.target.value as DamageType }))}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                      >
                        {DAMAGE_TYPES.map(d => <option key={d.value} value={d.value}>{d.icon} {d.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Severity</label>
                      <select
                        value={damageForm.severity}
                        onChange={e => setDamageForm(p => ({ ...p, severity: e.target.value as DamageSeverity }))}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                      >
                        {DAMAGE_SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={damageForm.notes}
                    onChange={e => setDamageForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => { setShowDamageForm(false); setSelectedZone(null); }}>Cancel</Button>
                    <Button size="sm" onClick={addDamage} className="bg-orange-600 hover:bg-orange-700 text-white">Add Damage</Button>
                  </div>
                </div>
              )}

              {/* Damage list */}
              {(form.damageMarkers ?? []).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800 text-sm">Damage Records ({form.damageMarkers!.length})</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {form.damageMarkers!.map(m => (
                      <div key={m.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                        <span className="font-medium text-slate-700 flex-1">{m.zoneName}</span>
                        <Badge className={`text-xs ${SEVERITY_BADGE[m.severity]}`}>{m.type}</Badge>
                        <Badge className={`text-xs ${SEVERITY_BADGE[m.severity]}`}>{m.severity}</Badge>
                        {m.notes && <span className="text-slate-500 truncate max-w-24">{m.notes}</span>}
                        <button onClick={() => removeMarker(m.id)} className="text-slate-300 hover:text-red-500 ml-1"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technician + notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Receiving Technician *</label>
                <input
                  type="text"
                  value={form.technicianName ?? ''}
                  onChange={e => setForm(p => ({ ...p, technicianName: e.target.value }))}
                  placeholder="Technician name"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">General Notes</label>
                <textarea
                  value={form.generalNotes ?? ''}
                  onChange={e => setForm(p => ({ ...p, generalNotes: e.target.value }))}
                  rows={2}
                  placeholder="Customer complaints, special instructions..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" onClick={resetForm} className="flex-1">{t.cancel}</Button>
                <Button variant="outline" onClick={() => saveInspection('draft')} disabled={!canSave} className="flex-1">Save Draft</Button>
                <Button onClick={() => saveInspection('completed')} disabled={!canSave} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">Complete</Button>
              </div>
            </div>

            {/* RIGHT: Car diagram */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800 text-center">
                Click a zone to mark damage
              </h4>
              <p className="text-xs text-slate-500 text-center">
                🟡 Minor &nbsp; 🟠 Moderate &nbsp; 🔴 Severe
              </p>
              <CarDiagram
                markers={form.damageMarkers ?? []}
                selectedZone={selectedZone}
                onZoneClick={handleZoneClick}
              />
              <div className="grid grid-cols-3 gap-1 text-xs text-center text-slate-500">
                {Object.entries(ZONE_LABELS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => handleZoneClick(k)}
                    className={`px-2 py-1 rounded border transition-all text-left truncate ${
                      (form.damageMarkers ?? []).some(m => m.zone === k)
                        ? 'bg-orange-50 border-orange-300 text-orange-700 font-medium'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Inspection Dialog ─────────────────────────────────────── */}
      <Dialog open={showView} onOpenChange={setShowView}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              {viewInspection?.inspectionNumber}
            </DialogTitle>
            <DialogDescription>
              {viewInspection?.customerName} · {viewInspection?.vehicleMake} {viewInspection?.vehicleModel} ({viewInspection?.vehiclePlate})
            </DialogDescription>
          </DialogHeader>

          {viewInspection && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm p-4 bg-slate-50 rounded-xl">
                  <div><span className="text-slate-500">Date:</span> <span className="font-medium ml-1">{viewInspection.date} {viewInspection.time}</span></div>
                  <div><span className="text-slate-500">Technician:</span> <span className="font-medium ml-1">{viewInspection.technicianName}</span></div>
                  <div><span className="text-slate-500">Mileage:</span> <span className="font-medium ml-1">{viewInspection.mileage.toLocaleString()} km</span></div>
                  <div><span className="text-slate-500">Fuel:</span> <span className="font-medium ml-1">{viewInspection.fuelLevel}</span></div>
                  <div><span className="text-slate-500">Status:</span> <Badge className={`ml-1 text-xs ${STATUS_COLORS[viewInspection.status]}`}>{viewInspection.status}</Badge></div>
                </div>

                {viewInspection.damageMarkers.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-800">Damage Records ({viewInspection.damageMarkers.length})</h4>
                    {viewInspection.damageMarkers.map(m => (
                      <div key={m.id} className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-slate-800">{m.zoneName}</span>
                          <Badge className={`text-xs ${SEVERITY_BADGE[m.severity]}`}>{m.type}</Badge>
                          <Badge className={`text-xs ${SEVERITY_BADGE[m.severity]}`}>{m.severity}</Badge>
                        </div>
                        {m.notes && <p className="text-xs text-slate-600 mt-1">{m.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">No pre-existing damage recorded</span>
                  </div>
                )}

                {viewInspection.generalNotes && (
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-800 text-sm">Notes</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{viewInspection.generalNotes}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3 text-center">Vehicle Condition Map</h4>
                <CarDiagram
                  markers={viewInspection.damageMarkers}
                  selectedZone={null}
                  onZoneClick={() => {}}
                  readonly
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
