"use client";

import { useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  ClipboardCheck, Plus, Eye, Car, Fuel, Gauge, User,
  AlertTriangle, CheckCircle, Clock, FileText, Trash2, Calendar,
  PenLine, RotateCcw, Briefcase,
} from 'lucide-react';
import {
  type VehicleInspection, type DamageMarker, type DamageType, type DamageSeverity,
  DAMAGE_TYPES, DAMAGE_SEVERITIES, FUEL_LEVELS, ZONE_LABELS,
  severityFill, severityStroke, generateInspectionNumber, SAMPLE_INSPECTIONS,
} from '@/lib/vehicle-inspection';
import type { CRMCustomer } from '@/lib/crm-data';
import { fullName } from '@/lib/crm-data';
import type { Vehicle } from '@/components/VehicleDatabase';
import type { Appointment } from '@/components/AppointmentBooking';

// ── Car zone polygon definitions (SVG viewBox="-18 0 256 475") ───────────────
const TYRE_ZONES: { id: string; cx: number; cy: number; rx: number; ry: number; labelX: number; labelY: number }[] = [
  { id: 'tyre-fl', cx: -7,  cy: 82,  rx: 10, ry: 27, labelX: -7,  labelY: 82  },
  { id: 'tyre-fr', cx: 227, cy: 82,  rx: 10, ry: 27, labelX: 227, labelY: 82  },
  { id: 'tyre-rl', cx: -7,  cy: 375, rx: 10, ry: 27, labelX: -7,  labelY: 375 },
  { id: 'tyre-rr', cx: 227, cy: 375, rx: 10, ry: 27, labelX: 227, labelY: 375 },
];

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

// ── Signature Pad ─────────────────────────────────────────────────────────────
function SignaturePad({
  label,
  onCapture,
}: {
  label: string;
  onCapture: (data: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const [hasSig, setHasSig] = useState(false);

  const pos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - r.left) * scaleX, y: (e.touches[0].clientY - r.top) * scaleY };
    }
    return { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    const p      = pos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    drawing.current = true;
    setHasSig(true);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    const p      = pos(e, canvas);
    ctx.lineWidth   = 2;
    ctx.strokeStyle = '#1e293b';
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const stop = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = false;
    onCapture(hasSig ? canvasRef.current!.toDataURL() : null);
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
    onCapture(null);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <PenLine className="h-3.5 w-3.5 text-teal-600" /> {label}
        </label>
        <button type="button" onClick={clear} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
          <RotateCcw className="h-3 w-3" /> Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={120}
        className={`w-full border-2 rounded-xl bg-white cursor-crosshair transition-colors ${
          hasSig ? 'border-teal-400' : 'border-dashed border-slate-300'
        }`}
        style={{ touchAction: 'none' }}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={stop}
      />
      {!hasSig && (
        <p className="text-xs text-slate-400 text-center italic">Sign above</p>
      )}
    </div>
  );
}

interface WalkAroundProps {
  inspections: VehicleInspection[];
  onInspectionsChange: (v: VehicleInspection[]) => void;
  customers?: CRMCustomer[];
  vehicles?: Vehicle[];
  appointments?: Appointment[];
  onAppointmentsChange?: (a: Appointment[]) => void;
}

// ── Fuel Gauge SVG ───────────────────────────────────────────────────────────
function FuelGauge({
  level,
  onChange,
  readOnly = false,
}: {
  level: string;
  onChange?: (l: string) => void;
  readOnly?: boolean;
}) {
  const idx = FUEL_LEVELS.indexOf(level as typeof FUEL_LEVELS[number]);
  const safeIdx = idx < 0 ? 0 : idx;

  // Arc geometry — dashboard semi-circle, centre (60,60), r=46
  const cx = 60, cy = 60, r = 46;

  // Angle: 180° (E, left) → 0° (F, right)
  const angleDeg = 180 - (safeIdx / 4) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const nx = cx + r * Math.cos(angleRad);
  const ny = cy - r * Math.sin(angleRad);

  // Tick lines: short radial marks inside the arc
  const tickOuter = r + 1;
  const tickInner = r - 9;

  const dec = () => onChange && onChange(FUEL_LEVELS[Math.max(0, safeIdx - 1)]);
  const inc = () => onChange && onChange(FUEL_LEVELS[Math.min(4, safeIdx + 1)]);

  return (
    <div className="flex items-center gap-2">
      {/* Left arrow button */}
      {!readOnly && (
        <button
          type="button"
          onClick={dec}
          disabled={safeIdx === 0}
          className="h-8 w-8 rounded-full bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center font-bold text-lg leading-none select-none flex-shrink-0"
        >
          ‹
        </button>
      )}

      {/* Gauge */}
      <div className="flex-1 min-w-0">
        <svg viewBox="0 0 120 72" className="w-full drop-shadow-md">
          {/* Instrument housing */}
          <rect x="1" y="1" width="118" height="70" rx="10" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

          {/* Outer bezel ring hint */}
          <rect x="3" y="3" width="114" height="66" rx="9" fill="none" stroke="#334155" strokeWidth="0.5" />

          {/* Warning zone arc (E → 1/4): red glow */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${(cx + r * Math.cos((135 * Math.PI) / 180)).toFixed(1)} ${(cy - r * Math.sin((135 * Math.PI) / 180)).toFixed(1)}`}
            fill="none" stroke="#7f1d1d" strokeWidth="5" strokeLinecap="round" opacity="0.8"
          />

          {/* Track arc — full semi-circle */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`}
            fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round"
          />

          {/* Tick marks at each of the 5 levels */}
          {[0, 1, 2, 3, 4].map(i => {
            const a = (180 - (i / 4) * 180) * Math.PI / 180;
            const x1 = (cx + tickInner * Math.cos(a)).toFixed(1);
            const y1 = (cy - tickInner * Math.sin(a)).toFixed(1);
            const x2 = (cx + tickOuter * Math.cos(a)).toFixed(1);
            const y2 = (cy - tickOuter * Math.sin(a)).toFixed(1);
            // small sub-ticks between main ticks (midpoints)
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={i === 0 ? '#ef4444' : '#94a3b8'}
                strokeWidth={i === 0 || i === 4 ? '2' : '1.5'}
                strokeLinecap="round"
              />
            );
          })}

          {/* Sub-ticks between main ticks */}
          {[1, 2, 3].map(i => {
            // midpoint between main ticks i-1 and i
            const a = (180 - ((i - 0.5) / 4) * 180) * Math.PI / 180;
            const subInner = r - 5;
            const x1 = (cx + subInner * Math.cos(a)).toFixed(1);
            const y1 = (cy - subInner * Math.sin(a)).toFixed(1);
            const x2 = (cx + tickOuter * Math.cos(a)).toFixed(1);
            const y2 = (cy - tickOuter * Math.sin(a)).toFixed(1);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="1" strokeLinecap="round" />;
          })}

          {/* Needle shadow */}
          <line x1={cx} y1={cy} x2={(nx + 0.8).toFixed(1)} y2={(ny + 0.8).toFixed(1)}
            stroke="#000000" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />

          {/* Needle */}
          <line x1={cx} y1={cy} x2={nx.toFixed(1)} y2={ny.toFixed(1)}
            stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />

          {/* Needle tip highlight */}
          <circle cx={nx.toFixed(1)} cy={ny.toFixed(1)} r="2" fill="#f8fafc" />

          {/* Centre pivot — chrome look */}
          <circle cx={cx} cy={cy} r="5" fill="#334155" />
          <circle cx={cx} cy={cy} r="3.5" fill="#64748b" />
          <circle cx={cx} cy={cy} r="1.5" fill="#94a3b8" />

          {/* E label — red */}
          <text x="8" y={cy + 11} fontSize="11" fontWeight="800" fill="#ef4444" fontFamily="monospace">E</text>

          {/* F label — white */}
          <text x="106" y={cy + 11} fontSize="11" fontWeight="800" fill="#f8fafc" fontFamily="monospace" textAnchor="end">F</text>

          {/* Current level readout */}
          <text x={cx} y={cy + 13} textAnchor="middle" fontSize="7.5" fill="#64748b" fontFamily="monospace" letterSpacing="0.5">
            {level}
          </text>
        </svg>
      </div>

      {/* Right arrow button */}
      {!readOnly && (
        <button
          type="button"
          onClick={inc}
          disabled={safeIdx === 4}
          className="h-8 w-8 rounded-full bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center font-bold text-lg leading-none select-none flex-shrink-0"
        >
          ›
        </button>
      )}
    </div>
  );
}

// ── Car Diagram SVG ──────────────────────────────────────────────────────────
function CarDiagram({
  markers,
  selectedZone,
  onZoneClick,
  readonly = false,
  frontLabel = 'FRONT',
  rearLabel = 'REAR',
}: {
  markers: DamageMarker[];
  selectedZone: string | null;
  onZoneClick: (zoneId: string) => void;
  readonly?: boolean;
  frontLabel?: string;
  rearLabel?: string;
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
      viewBox="-18 0 256 475"
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
            {count > 0 ? (
              <text x={zone.labelX} y={zone.labelY} textAnchor="middle"
                fontSize={isNarrow ? 9 : 10} fontWeight="700"
                fill={severityStroke(worstSeverity(zone.id)!)}
                style={{ pointerEvents: 'none' }}
                transform={isNarrow ? `rotate(-90,${zone.labelX},${zone.labelY})` : undefined}
              >{count}</text>
            ) : !isNarrow ? (
              <text x={zone.labelX} y={zone.labelY + 4} textAnchor="middle"
                fontSize={8} fill="#64748b" style={{ pointerEvents: 'none' }}>
                {ZONE_LABELS[zone.id]}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* Tyre ellipses */}
      {TYRE_ZONES.map(t => {
        const count = zoneMarkers(t.id).length;
        const ws    = worstSeverity(t.id);
        const fill  = selectedZone === t.id ? '#bfdbfe' : ws ? severityFill(ws) : hovered === t.id && !readonly ? '#e2e8f0' : '#1e293b';
        const stroke = selectedZone === t.id ? '#3b82f6' : ws ? severityStroke(ws) : '#0f172a';
        return (
          <g key={t.id}>
            {/* Tyre sidewall */}
            <ellipse cx={t.cx} cy={t.cy} rx={t.rx} ry={t.ry}
              fill={fill} stroke={stroke} strokeWidth={selectedZone === t.id ? 2 : 1.5}
              style={{ cursor: readonly ? 'default' : 'pointer', transition: 'fill 0.15s' }}
              onClick={() => !readonly && onZoneClick(t.id)}
              onMouseEnter={() => !readonly && setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
            />
            {/* Tyre inner rim */}
            <ellipse cx={t.cx} cy={t.cy} rx={t.rx * 0.5} ry={t.ry * 0.5}
              fill="none" stroke={ws ? severityStroke(ws) : '#334155'} strokeWidth="0.8"
              style={{ pointerEvents: 'none' }}
            />
            {/* Count or label */}
            {count > 0 ? (
              <text x={t.labelX} y={t.labelY + 4} textAnchor="middle"
                fontSize={8} fontWeight="700" fill={ws ? severityStroke(ws) : '#fff'}
                style={{ pointerEvents: 'none' }}>{count}</text>
            ) : (
              <text x={t.labelX} y={t.labelY + 3} textAnchor="middle"
                fontSize={6} fill="#94a3b8" style={{ pointerEvents: 'none' }}>
                {t.id.replace('tyre-', '').toUpperCase()}
              </text>
            )}
          </g>
        );
      })}

      {/* Windscreen lines */}
      <line x1="80" y1="155" x2="75" y2="188" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="140" y1="155" x2="145" y2="188" stroke="#cbd5e1" strokeWidth="1" />
      {/* Rear window lines */}
      <line x1="80" y1="312" x2="75" y2="350" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="140" y1="312" x2="145" y2="350" stroke="#cbd5e1" strokeWidth="1" />

      <text x="110" y="472" textAnchor="middle" fontSize="9" fill="#94a3b8">▼ {rearLabel}</text>
      <text x="110" y="0" textAnchor="middle" fontSize="9" fill="#94a3b8" dy="9">▲ {frontLabel}</text>
    </svg>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function WalkAroundInspection({
  inspections,
  onInspectionsChange,
  customers = [],
  vehicles = [],
  appointments,
  onAppointmentsChange,
}: WalkAroundProps) {
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewInspection, setViewInspection] = useState<VehicleInspection | null>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [advisorSig, setAdvisorSig] = useState<string | null>(null);
  const [customerSig, setCustomerSig] = useState<string | null>(null);

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
    serviceAdvisorName: '',
    customerName: '',
    vehiclePlate: '',
    vehicleMake: '',
    vehicleModel: '',
    status: 'draft',
  });

  const [form, setForm] = useState<Partial<VehicleInspection>>(emptyInspection());

  // Appointment picker
  const [pickedAppointment, setPickedAppointment] = useState<Appointment | null>(null);
  const todayAppointments = (appointments ?? []).filter(apt =>
    apt.date === today &&
    (apt.status === 'scheduled' || apt.status === 'confirmed') &&
    !apt.walkAroundInspectionId
  );

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

  const saveInspection = (
    status: 'draft' | 'completed',
    sigs?: { advisor: string | null; customer: string | null },
  ) => {
    const number = generateInspectionNumber(inspections.length);
    const inspection: VehicleInspection = {
      id: Date.now(),
      inspectionNumber: number,
      date: form.date!,
      time: form.time!,
      appointmentId: pickedAppointment?.id,
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
      serviceAdvisorName: form.serviceAdvisorName,
      serviceAdvisorSignature: sigs?.advisor ?? undefined,
      customerSignature: sigs?.customer ?? undefined,
      status,
      createdDate: today,
    };
    onInspectionsChange([inspection, ...inspections]);
    if (status === 'completed' && pickedAppointment && onAppointmentsChange && appointments) {
      onAppointmentsChange(appointments.map(a =>
        a.id === pickedAppointment.id
          ? { ...a, walkAroundInspectionId: inspection.id, status: a.status === 'scheduled' ? 'confirmed' : a.status }
          : a
      ));
    }
    resetForm();
  };

  const resetForm = () => {
    setForm(emptyInspection());
    setPickedCust(null);
    setPickedVehicle(null);
    setPickedAppointment(null);
    setCustSearch('');
    setSelectedZone(null);
    setShowDamageForm(false);
    setShowForm(false);
    setShowSignatureDialog(false);
    setAdvisorSig(null);
    setCustomerSig(null);
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
            {t.walTitle}
          </h2>
          <p className="text-slate-600 mt-2">{t.walSubtitle}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          {t.walNewInspection}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t.walTotalInspections, value: inspections.length, color: 'blue' },
          { label: t.statusCompleted, value: inspections.filter(i => i.status !== 'draft').length, color: 'green' },
          { label: t.walDamageItems, value: totalDamage, color: 'orange' },
          { label: t.walToday, value: inspections.filter(i => i.date === today).length, color: 'teal' },
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
              <p className="font-medium">{t.walNoInspections}</p>
              <p className="text-sm mt-1">{t.walNoInspectionsDesc}</p>
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
                          {insp.damageMarkers.length} {t.walDamageItems}
                        </Badge>
                      )}
                      {insp.damageMarkers.length === 0 && (
                        <Badge className="text-xs bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />{t.walNoDamage}
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
                    <Eye className="h-4 w-4 mr-1" />{t.view}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Pending Job Cards ─────────────────────────────────────────── */}
      {(() => {
        const pendingJobCards = inspections.filter(i => i.status === 'completed');
        if (pendingJobCards.length === 0) return null;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-slate-800">Pending Job Cards</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{pendingJobCards.length} awaiting</span>
            </div>
            <p className="text-sm text-slate-500">Inspections completed — no open job card yet. Go to Quotations &amp; Jobs to create one.</p>
            <div className="space-y-2">
              {pendingJobCards.map(insp => (
                <Card key={insp.id} className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-sm font-bold text-amber-700">{insp.inspectionNumber}</span>
                          <Badge className="text-xs bg-amber-100 text-amber-700 border border-amber-300">Awaiting Job Card</Badge>
                          {insp.serviceAdvisorSignature && insp.customerSignature && (
                            <Badge className="text-xs bg-green-100 text-green-700">
                              <PenLine className="h-3 w-3 mr-1" /> Signed
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-0.5 text-sm text-slate-600">
                          <div className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{insp.customerName}</div>
                          <div className="flex items-center gap-1"><Car className="h-3.5 w-3.5" />{insp.vehicleMake} {insp.vehicleModel} <span className="font-mono text-xs text-slate-400 ml-1">{insp.vehiclePlate}</span></div>
                          <div className="flex items-center gap-1 text-slate-500"><Clock className="h-3.5 w-3.5" />{insp.date}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setViewInspection(insp); setShowView(true); }}
                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        <Eye className="h-4 w-4 mr-1" />{t.view}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── New Inspection Dialog ─────────────────────────────────────── */}
      <Dialog open={showForm} onOpenChange={open => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-teal-600" />
              {t.walNewInspectionTitle}
            </DialogTitle>
            <DialogDescription>{t.walNewInspectionDesc}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* LEFT: Form fields */}
            <div className="space-y-5">

              {/* Today's Appointments picker */}
              {appointments && appointments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Today's Bookings
                    {todayAppointments.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{todayAppointments.length} pending</span>
                    )}
                  </h4>
                  {pickedAppointment ? (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono text-teal-600">{pickedAppointment.appointmentNumber}</p>
                        <p className="font-semibold text-sm">{pickedAppointment.customerName}</p>
                        <p className="text-xs text-slate-500">{pickedAppointment.vehicleMake} {pickedAppointment.vehicleModel} · <span className="font-mono">{pickedAppointment.vehiclePlate}</span> · {pickedAppointment.serviceType}</p>
                      </div>
                      <button
                        onClick={() => {
                          setPickedAppointment(null);
                          setPickedCust(null);
                          setPickedVehicle(null);
                          setForm(emptyInspection());
                        }}
                        className="text-xs text-slate-400 hover:text-red-500 ml-3"
                      >
                        Change
                      </button>
                    </div>
                  ) : todayAppointments.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      {todayAppointments.map(apt => (
                        <button
                          key={apt.id}
                          onClick={() => {
                            setPickedAppointment(apt);
                            setForm(p => ({
                              ...p,
                              customerId: apt.customerId,
                              customerName: apt.customerName,
                              customerPhone: apt.customerPhone,
                              vehiclePlate: apt.vehiclePlate,
                              vehicleMake: apt.vehicleMake,
                              vehicleModel: apt.vehicleModel,
                            }));
                            const cust = customers.find(c => c.id === apt.customerId);
                            if (cust) { setPickedCust(cust); setCustSearch(''); }
                            const veh = vehicles.find(v => v.plate === apt.vehiclePlate);
                            if (veh) setPickedVehicle(veh);
                          }}
                          className="w-full text-left px-3 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 text-sm"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{apt.customerName}</p>
                              <p className="text-xs text-slate-500">{apt.vehicleMake} {apt.vehicleModel} · <span className="font-mono">{apt.vehiclePlate}</span></p>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className="text-xs font-semibold text-blue-700">{apt.time}</p>
                              <p className="text-xs text-slate-400">{apt.serviceType}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No pending appointments for today</p>
                  )}
                </div>
              )}

              {/* Customer */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2"><User className="h-4 w-4" />{t.customer}</h4>
                {pickedCust ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">{fullName(pickedCust)}</p>
                      <p className="text-xs text-slate-500">{pickedCust.phone}</p>
                    </div>
                    <button onClick={() => { setPickedCust(null); setPickedVehicle(null); setForm(p => ({ ...p, customerId: undefined, customerName: '' })); }} className="text-xs text-slate-400 hover:text-red-500">{t.walChange}</button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder={t.walSearchCustomer}
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
                        )) : <p className="text-sm text-slate-400 p-3">{t.walNoCustomersFound}</p>}
                      </div>
                    )}
                    {!pickedCust && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <input placeholder={`${t.walCustomerName} *`} value={form.customerName ?? ''} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} className="col-span-2 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                        <input placeholder={t.phone} value={form.customerPhone ?? ''} onChange={e => setForm(p => ({ ...p, customerPhone: e.target.value }))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Vehicle */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2"><Car className="h-4 w-4" />{t.vehicle}</h4>
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
                    <button onClick={() => { setPickedVehicle(null); }} className="text-xs text-slate-400 hover:text-red-500">{t.walChange}</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder={`${t.walPlate} *`} value={form.vehiclePlate ?? ''} onChange={e => setForm(p => ({ ...p, vehiclePlate: e.target.value.toUpperCase() }))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono" />
                    <input placeholder={`${t.vehMake} *`} value={form.vehicleMake ?? ''} onChange={e => setForm(p => ({ ...p, vehicleMake: e.target.value }))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                    <input placeholder={t.vehModel} value={form.vehicleModel ?? ''} onChange={e => setForm(p => ({ ...p, vehicleModel: e.target.value }))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                    <input type="number" placeholder={t.vehYear} value={form.vehicleYear ?? ''} onChange={e => setForm(p => ({ ...p, vehicleYear: parseInt(e.target.value) }))} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                )}
              </div>

              {/* Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{t.walMileage}</label>
                  <input type="number" value={form.mileage ?? 0} onChange={e => setForm(p => ({ ...p, mileage: parseInt(e.target.value) || 0 }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{t.walFuelLevel}</label>
                  <FuelGauge
                    level={form.fuelLevel ?? '1/2'}
                    onChange={lv => setForm(p => ({ ...p, fuelLevel: lv as typeof FUEL_LEVELS[number] }))}
                  />
                </div>
              </div>

              {/* Damage form panel (shown when zone clicked) */}
              {showDamageForm && selectedZone && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
                  <p className="font-semibold text-orange-800 text-sm">
                    {t.walAddingDamageTo}: <span className="text-orange-700">{ZONE_LABELS[selectedZone]}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">{t.walDamageType}</label>
                      <select
                        value={damageForm.type}
                        onChange={e => setDamageForm(p => ({ ...p, type: e.target.value as DamageType }))}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                      >
                        {DAMAGE_TYPES.map(d => <option key={d.value} value={d.value}>{d.icon} {d.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">{t.walSeverity}</label>
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
                    placeholder={`${t.notes} (${t.optional})`}
                    value={damageForm.notes}
                    onChange={e => setDamageForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => { setShowDamageForm(false); setSelectedZone(null); }}>{t.cancel}</Button>
                    <Button size="sm" onClick={addDamage} className="bg-orange-600 hover:bg-orange-700 text-white">{t.walAddDamage}</Button>
                  </div>
                </div>
              )}

              {/* Damage list */}
              {(form.damageMarkers ?? []).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800 text-sm">{t.walDamageRecords} ({form.damageMarkers!.length})</h4>
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

              {/* Technician + Service Advisor */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">{t.walReceivingTechnician} *</label>
                  <input
                    type="text"
                    value={form.technicianName ?? ''}
                    onChange={e => setForm(p => ({ ...p, technicianName: e.target.value }))}
                    placeholder={t.technician}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Service Advisor</label>
                  <input
                    type="text"
                    value={form.serviceAdvisorName ?? ''}
                    onChange={e => setForm(p => ({ ...p, serviceAdvisorName: e.target.value }))}
                    placeholder="Advisor name"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{t.walGeneralNotes}</label>
                <textarea
                  value={form.generalNotes ?? ''}
                  onChange={e => setForm(p => ({ ...p, generalNotes: e.target.value }))}
                  rows={2}
                  placeholder={t.walGeneralNotesPlaceholder}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" onClick={resetForm} className="flex-1">{t.cancel}</Button>
                <Button variant="outline" onClick={() => saveInspection('draft')} disabled={!canSave} className="flex-1">{t.walSaveDraft}</Button>
                <Button
                  onClick={() => { setAdvisorSig(null); setCustomerSig(null); setShowSignatureDialog(true); }}
                  disabled={!canSave}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <PenLine className="h-4 w-4 mr-1" />{t.walComplete}
                </Button>
              </div>
            </div>

            {/* RIGHT: Car diagram */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800 text-center">
                {t.walClickZone}
              </h4>
              <p className="text-xs text-slate-500 text-center">
                🟡 {DAMAGE_SEVERITIES[0].label} &nbsp; 🟠 {DAMAGE_SEVERITIES[1].label} &nbsp; 🔴 {DAMAGE_SEVERITIES[2].label}
              </p>
              <CarDiagram
                markers={form.damageMarkers ?? []}
                selectedZone={selectedZone}
                onZoneClick={handleZoneClick}
                frontLabel={t.walFront}
                rearLabel={t.walRear}
              />
              <div className="grid grid-cols-3 gap-1 text-xs text-slate-500">
                {Object.entries(ZONE_LABELS).map(([k, v]) => {
                  const isTyre = k.startsWith('tyre-');
                  return (
                    <button
                      key={k}
                      onClick={() => handleZoneClick(k)}
                      className={`px-2 py-1 rounded border transition-all text-left truncate ${
                        (form.damageMarkers ?? []).some(m => m.zone === k)
                          ? 'bg-orange-50 border-orange-300 text-orange-700 font-medium'
                          : isTyre
                            ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Signature Dialog ─────────────────────────────────────── */}
      <Dialog open={showSignatureDialog} onOpenChange={open => { if (!open) setShowSignatureDialog(false); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-teal-600" /> Sign to Complete Inspection
            </DialogTitle>
            <DialogDescription>Both parties must sign before the inspection is marked as completed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <SignaturePad label="Service Advisor" onCapture={setAdvisorSig} />
            <SignaturePad label="Customer" onCapture={setCustomerSig} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignatureDialog(false)}>{t.cancel}</Button>
            <Button
              onClick={() => { saveInspection('completed', { advisor: advisorSig, customer: customerSig }); setShowSignatureDialog(false); }}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Confirm &amp; Complete
            </Button>
          </DialogFooter>
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
                  <div><span className="text-slate-500">{t.date}:</span> <span className="font-medium ml-1">{viewInspection.date} {viewInspection.time}</span></div>
                  <div><span className="text-slate-500">{t.technician}:</span> <span className="font-medium ml-1">{viewInspection.technicianName}</span></div>
                  <div><span className="text-slate-500">{t.vehMileage}:</span> <span className="font-medium ml-1">{viewInspection.mileage.toLocaleString()} km</span></div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-xs">{t.walFuel}</span>
                    <FuelGauge level={viewInspection.fuelLevel} readOnly />
                  </div>
                  <div><span className="text-slate-500">{t.status}:</span> <Badge className={`ml-1 text-xs ${STATUS_COLORS[viewInspection.status]}`}>{viewInspection.status}</Badge></div>
                </div>

                {viewInspection.damageMarkers.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-800">{t.walDamageRecords} ({viewInspection.damageMarkers.length})</h4>
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
                    <span className="font-medium">{t.walNoDamageRecorded}</span>
                  </div>
                )}

                {viewInspection.generalNotes && (
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-800 text-sm">{t.notes}</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{viewInspection.generalNotes}</p>
                  </div>
                )}

                {/* Signatures */}
                {(viewInspection.serviceAdvisorSignature || viewInspection.customerSignature) && (
                  <div className="space-y-3 pt-2 border-t">
                    <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                      <PenLine className="h-4 w-4 text-teal-600" /> Signatures
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {viewInspection.serviceAdvisorSignature && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Service Advisor{viewInspection.serviceAdvisorName ? ` — ${viewInspection.serviceAdvisorName}` : ''}</p>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={viewInspection.serviceAdvisorSignature} alt="Advisor signature" className="w-full border rounded-lg bg-white" />
                        </div>
                      )}
                      {viewInspection.customerSignature && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Customer{viewInspection.customerName ? ` — ${viewInspection.customerName}` : ''}</p>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={viewInspection.customerSignature} alt="Customer signature" className="w-full border rounded-lg bg-white" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3 text-center">{t.walConditionMap}</h4>
                <CarDiagram
                  markers={viewInspection.damageMarkers}
                  selectedZone={null}
                  onZoneClick={() => {}}
                  readonly
                  frontLabel={t.walFront}
                  rearLabel={t.walRear}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
