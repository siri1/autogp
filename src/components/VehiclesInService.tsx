"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Clock,
  Car,
  User,
  CheckCircle2,
  Droplets,
  ShieldCheck,
  PackageCheck,
  ClipboardCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import { quickExcelExport } from '@/lib/advanced-excel-export';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import type { MaintenancePack } from '@/lib/maintenance-packs';
import type { Part } from '@/components/PartsInventory';
import {
  type Job, type QuotationItem,
  generateJobNumber, calculateQuotationTotals,
} from '@/lib/quotation-invoice';
import LabourPickerDialog from '@/components/LabourPickerDialog';
import PartsPickerDialog from '@/components/PartsPickerDialog';

// ── Types ──────────────────────────────────────────────────────────────────

export type ServiceStage =
  | 'waiting-for-walkaround'
  | 'waiting-for-approval'
  | 'on-bay'
  | 'diagnosis'
  | 'quality-control'
  | 'washing'
  | 'waiting-for-collection';

export interface VehicleInService {
  id: number;
  jobNumber: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  ownerName: string;
  ownerPhone: string;
  technicianName: string;
  bayNumber?: number;
  serviceType: string;
  stage: ServiceStage;
  entryDate: string;   // ISO date
  entryTime: string;   // HH:MM
  estimatedCompletion: string; // ISO date
  notes?: string;
  pendingJobItems?: QuotationItem[];
  bookedDate?: string;
  appointmentId?: number;
  inspectionId?: number;
}

// ── Stage config ───────────────────────────────────────────────────────────

const STAGE_DEFS: { value: ServiceStage; color: string; bg: string; Icon: any }[] = [
  { value: 'waiting-for-walkaround',color: 'text-slate-700',  bg: 'bg-slate-100',  Icon: ClipboardCheck },
  { value: 'waiting-for-approval',  color: 'text-yellow-700', bg: 'bg-yellow-100', Icon: ClipboardCheck },
  { value: 'on-bay',                color: 'text-blue-700',   bg: 'bg-blue-100',   Icon: Wrench },
  { value: 'diagnosis',             color: 'text-amber-700',  bg: 'bg-amber-100',  Icon: Search },
  { value: 'quality-control',       color: 'text-purple-700', bg: 'bg-purple-100', Icon: ShieldCheck },
  { value: 'washing',               color: 'text-cyan-700',   bg: 'bg-cyan-100',   Icon: Droplets },
  { value: 'waiting-for-collection',color: 'text-green-700',  bg: 'bg-green-100',  Icon: PackageCheck },
];

const stageDefMap = Object.fromEntries(STAGE_DEFS.map(s => [s.value, s])) as Record<ServiceStage, typeof STAGE_DEFS[0]>;

// ── Sample data ────────────────────────────────────────────────────────────

export const SAMPLE_IN_SERVICE: VehicleInService[] = [
  {
    id: 1, jobNumber: 'JOB-202603-0001',
    plate: 'LD-12-34-AB', make: 'Toyota', model: 'Hilux', year: 2020,
    ownerName: 'João Silva', ownerPhone: '+244 923 456 789',
    technicianName: 'Mike Rodriguez', bayNumber: 1,
    serviceType: 'Full Service', stage: 'on-bay',
    entryDate: '2026-03-21', entryTime: '08:00', estimatedCompletion: '2026-03-21',
  },
  {
    id: 2, jobNumber: 'JOB-202603-0002',
    plate: 'LD-56-78-CD', make: 'Mercedes-Benz', model: 'E220d', year: 2022,
    ownerName: 'Maria Santos', ownerPhone: '+244 912 345 678',
    technicianName: 'Carlos Neto', bayNumber: 2,
    serviceType: 'Electrical Fault', stage: 'diagnosis',
    entryDate: '2026-03-21', entryTime: '09:30', estimatedCompletion: '2026-03-22',
    notes: 'Intermittent starting issue',
  },
  {
    id: 3, jobNumber: 'JOB-202603-0003',
    plate: 'BG-22-11-XZ', make: 'Toyota', model: 'Land Cruiser', year: 2019,
    ownerName: 'Carlos Mendes', ownerPhone: '+244 934 567 890',
    technicianName: 'Ana Ferreira', bayNumber: 3,
    serviceType: 'Brake Overhaul', stage: 'quality-control',
    entryDate: '2026-03-20', entryTime: '14:00', estimatedCompletion: '2026-03-21',
  },
  {
    id: 4, jobNumber: 'JOB-202603-0004',
    plate: 'LN-99-44-PQ', make: 'Ford', model: 'Ranger', year: 2021,
    ownerName: 'Ana Rodrigues', ownerPhone: '+244 945 678 901',
    technicianName: 'Pedro Lima', bayNumber: undefined,
    serviceType: 'Oil & Filter Change', stage: 'washing',
    entryDate: '2026-03-21', entryTime: '07:30', estimatedCompletion: '2026-03-21',
  },
  {
    id: 5, jobNumber: 'JOB-202603-0005',
    plate: 'LD-77-33-MN', make: 'Mitsubishi', model: 'Pajero', year: 2018,
    ownerName: 'Pedro Ferreira', ownerPhone: '+244 956 789 012',
    technicianName: 'Mike Rodriguez', bayNumber: undefined,
    serviceType: 'Suspension Repair', stage: 'waiting-for-collection',
    entryDate: '2026-03-20', entryTime: '10:00', estimatedCompletion: '2026-03-21',
    notes: 'Customer notified via SMS',
  },
  {
    id: 6, jobNumber: 'JOB-202603-0006',
    plate: 'LN-44-88-RS', make: 'BMW', model: 'X5', year: 2023,
    ownerName: 'Beatriz Costa', ownerPhone: '+244 967 890 123',
    technicianName: 'Carlos Neto', bayNumber: 4,
    serviceType: 'Engine Diagnostics', stage: 'diagnosis',
    entryDate: '2026-03-21', entryTime: '11:00', estimatedCompletion: '2026-03-22',
    notes: 'Check engine light — awaiting diagnostic report',
  },
  {
    id: 7, jobNumber: 'JOB-202603-0007',
    plate: 'LD-05-91-TU', make: 'Nissan', model: 'Patrol', year: 2020,
    ownerName: 'António Lopes', ownerPhone: '+244 923 111 222',
    technicianName: 'Ana Ferreira', bayNumber: 5,
    serviceType: 'Gearbox Service', stage: 'on-bay',
    entryDate: '2026-03-21', entryTime: '08:45', estimatedCompletion: '2026-03-23',
  },
  {
    id: 8, jobNumber: 'JOB-202603-0008',
    plate: 'HU-33-22-VW', make: 'Hyundai', model: 'Santa Fe', year: 2021,
    ownerName: 'Sofia Gonçalves', ownerPhone: '+244 934 222 333',
    technicianName: 'Pedro Lima', bayNumber: undefined,
    serviceType: 'Air Conditioning', stage: 'waiting-for-collection',
    entryDate: '2026-03-20', entryTime: '16:00', estimatedCompletion: '2026-03-21',
  },
];

// ── Sort helpers ───────────────────────────────────────────────────────────

type SortKey = 'plate' | 'make' | 'ownerName' | 'technicianName' | 'stage' | 'entryDate' | 'estimatedCompletion';
type SortDir = 'asc' | 'desc';

// ── Stage label helper (must be called inside component) ───────────────────

function useStageLabel(stage: ServiceStage) {
  const { t } = useLanguage();
  const labels: Record<ServiceStage, string> = {
    'waiting-for-walkaround': t.visWaitingWalkaround,
    'waiting-for-approval': t.visWaitingApproval,
    'on-bay': t.visOnBay,
    'diagnosis': t.visDiagnosis,
    'quality-control': t.visQualityControl,
    'washing': t.visWashing,
    'waiting-for-collection': t.visWaitingCollection,
  };
  return labels[stage];
}

// ── Stage badge ────────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: ServiceStage | string | undefined | null }) {
  const cfg = stage ? stageDefMap[stage as ServiceStage] : null;
  const label = stage ? useStageLabel(stage as ServiceStage) : 'Unknown';
  if (!cfg) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        {label || 'Unknown Stage'}
      </span>
    );
  }
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ── Stage selector dropdown ────────────────────────────────────────────────

function StageSelect({ value, onChange }: { value: ServiceStage; onChange: (s: ServiceStage) => void }) {
  const { t } = useLanguage();
  const stageOptions: { value: ServiceStage; label: string }[] = [
    { value: 'waiting-for-walkaround', label: t.visWaitingWalkaround },
    { value: 'waiting-for-approval', label: t.visWaitingApproval },
    { value: 'on-bay', label: t.visOnBay },
    { value: 'diagnosis', label: t.visDiagnosis },
    { value: 'quality-control', label: t.visQualityControl },
    { value: 'washing', label: t.visWashing },
    { value: 'waiting-for-collection', label: t.visWaitingCollection },
  ];
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as ServiceStage)}
      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
    >
      {stageOptions.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}

// ── Overdue indicator ──────────────────────────────────────────────────────

function isOverdue(estimated: string) {
  return new Date(estimated) < new Date(new Date().toDateString());
}

// ── Component ──────────────────────────────────────────────────────────────

interface VehiclesInServiceProps {
  vehicles?: VehicleInService[];
  onVehiclesChange?: (v: VehicleInService[]) => void;
  maintenancePacks?: MaintenancePack[];
  parts?: Part[];
  onJobCreated?: (job: Job) => void;
  existingJobsCount?: number;
}

export default function VehiclesInService({
  vehicles: externalVehicles,
  onVehiclesChange,
  maintenancePacks = [],
  parts = [],
  onJobCreated,
  existingJobsCount = 0,
}: VehiclesInServiceProps = {}) {
  const { t } = useLanguage();
  const [internalRecords, setInternalRecords] = useState<VehicleInService[]>(SAMPLE_IN_SERVICE);
  const records = externalVehicles ?? internalRecords;
  const setRecords = (updater: (prev: VehicleInService[]) => VehicleInService[]) => {
    const next = updater(records);
    if (!externalVehicles) setInternalRecords(next);
    onVehiclesChange?.(next);
  };
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<ServiceStage | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('entryDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Job card dialog for waiting-for-approval vehicles
  const [showApprovalJobDialog, setShowApprovalJobDialog] = useState(false);
  const [approvalVehicle, setApprovalVehicle] = useState<VehicleInService | null>(null);
  const [approvalJobItems, setApprovalJobItems] = useState<QuotationItem[]>([]);
  const [showApprovalPartsPicker, setShowApprovalPartsPicker] = useState(false);
  const [showApprovalLabourPicker, setShowApprovalLabourPicker] = useState(false);

  const handleStageChange = (id: number, stage: ServiceStage) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, stage } : r));
  };

  const fmtAOA = (n: number) =>
    n.toLocaleString('pt-AO', { minimumFractionDigits: 0 }) + ' AOA';

  const openApprovalJobCard = (vehicle: VehicleInService) => {
    setApprovalVehicle(vehicle);
    setApprovalJobItems(vehicle.pendingJobItems ? [...vehicle.pendingJobItems] : []);
    setShowApprovalJobDialog(true);
  };

  const saveApprovalJobCard = () => {
    if (!approvalVehicle || !onJobCreated) return;
    const { subtotal, vatAmount, total } = calculateQuotationTotals(approvalJobItems, 0.14);
    const today = new Date().toISOString().split('T')[0];
    const job: Job = {
      id: Date.now(),
      jobNumber: generateJobNumber(existingJobsCount),
      customerId: approvalVehicle.appointmentId ?? Date.now(),
      customerName: approvalVehicle.ownerName,
      vehicleMake: approvalVehicle.make,
      vehicleModel: approvalVehicle.model,
      vehicleYear: approvalVehicle.year,
      vehiclePlate: approvalVehicle.plate,
      startDate: today,
      estimatedCompletionDate: approvalVehicle.estimatedCompletion,
      status: 'in-progress',
      assignedTechnicianName: approvalVehicle.technicianName,
      items: approvalJobItems,
      subtotal,
      vatAmount,
      total,
      notes: approvalVehicle.notes,
    };
    onJobCreated(job);
    // Move vehicle to on-bay
    setRecords(prev => prev.map(r =>
      r.id === approvalVehicle.id
        ? { ...r, stage: 'on-bay', pendingJobItems: undefined }
        : r
    ));
    setShowApprovalJobDialog(false);
    setApprovalVehicle(null);
    setApprovalJobItems([]);
  };

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.plate.toLowerCase().includes(q) ||
      r.make.toLowerCase().includes(q) ||
      r.model.toLowerCase().includes(q) ||
      r.ownerName.toLowerCase().includes(q) ||
      r.technicianName.toLowerCase().includes(q) ||
      r.jobNumber.toLowerCase().includes(q);
    const matchesStage = stageFilter === 'all' || r.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] as string;
    const bv = b[sortKey] as string;
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 inline ml-1" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3.5 w-3.5 text-orange-500 inline ml-1" />
      : <ChevronDown className="h-3.5 w-3.5 text-orange-500 inline ml-1" />;
  };

  const Th = ({ col, children }: { col: SortKey; children: React.ReactNode }) => (
    <th
      className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-slate-800"
      onClick={() => handleSort(col)}
    >
      {children}<SortIcon col={col} />
    </th>
  );

  const handleExport = () => {
    const headers = ['Job #', 'Plate', 'Make', 'Model', 'Year', 'Owner', 'Phone', 'Technician', 'Bay', 'Service Type', 'Stage', 'Entry Date', 'Entry Time', 'Est. Completion', 'Notes'];
    const rows = sorted.map(r => [
      r.jobNumber, r.plate, r.make, r.model, r.year,
      r.ownerName, r.ownerPhone, r.technicianName,
      r.bayNumber ?? '—', r.serviceType, r.stage,
      r.entryDate, r.entryTime, r.estimatedCompletion, r.notes ?? '',
    ]);
    quickExcelExport(
      'Vehicles In Service',
      headers,
      rows,
      `vehicles-in-service-${new Date().toISOString().slice(0, 10)}`
    );
  };

  // Stage labels (translated)
  const stageLabels: Record<ServiceStage, string> = {
    'waiting-for-walkaround': t.visWaitingWalkaround,
    'waiting-for-approval': t.visWaitingApproval,
    'on-bay': t.visOnBay,
    'diagnosis': t.visDiagnosis,
    'quality-control': t.visQualityControl,
    'washing': t.visWashing,
    'waiting-for-collection': t.visWaitingCollection,
  };

  // Stage summary counts
  const stageCounts = STAGE_DEFS.map(s => ({
    ...s,
    label: stageLabels[s.value],
    count: records.filter(r => r.stage === s.value).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">{t.visTitle}</h1>
          <p className="text-slate-600 mt-1">{records.length} vehicle{records.length !== 1 ? 's' : ''} currently in workshop</p>
        </div>
        <Button onClick={handleExport} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          {t.exportExcel}
        </Button>
      </div>

      {/* Stage summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stageCounts.map(s => {
          const Icon = s.Icon;
          return (
            <button
              key={s.value}
              onClick={() => setStageFilter(stageFilter === s.value ? 'all' : s.value)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                stageFilter === s.value
                  ? `${s.bg} border-current ${s.color}`
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`flex items-center gap-2 mb-1 ${stageFilter === s.value ? s.color : 'text-slate-500'}`}>
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stageFilter === s.value ? s.color : 'text-slate-900'}`}>
                {s.count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search plate, owner, technician, job..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            {stageFilter !== 'all' && (
              <button
                onClick={() => setStageFilter('all')}
                className="text-xs text-orange-600 hover:underline"
              >
                Clear filter
              </button>
            )}
            <span className="text-sm text-slate-500 ml-auto">
              {sorted.length} result{sorted.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <Th col="plate">{t.vehPlate}</Th>
                  <Th col="make">{t.vehicle}</Th>
                  <Th col="ownerName">{t.vehOwner}</Th>
                  <Th col="technicianName">{t.technician}</Th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t.aptBay}</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t.aptServiceType}</th>
                  <Th col="stage">{t.visStage}</Th>
                  <Th col="entryDate">{t.date}</Th>
                  <Th col="estimatedCompletion">{t.visEstimatedCompletion}</Th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.notes}</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-slate-400">
                      No vehicles match the current filters.
                    </td>
                  </tr>
                )}
                {sorted.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">{r.plate}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900">{r.make} {r.model}</p>
                          <p className="text-xs text-slate-500">{r.year} · {r.jobNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900">{r.ownerName}</p>
                          <p className="text-xs text-slate-500">{r.ownerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <p className="text-slate-700">{r.technicianName}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {r.bayNumber
                        ? <span className="inline-block bg-slate-100 text-slate-700 font-semibold rounded px-2 py-0.5 text-xs">Bay {r.bayNumber}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{r.serviceType}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <StageBadge stage={r.stage} />
                        <StageSelect value={r.stage} onChange={s => handleStageChange(r.id, s)} />
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{r.entryDate}</span>
                        <span className="text-slate-400">{r.entryTime}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className={`flex items-center gap-1.5 ${isOverdue(r.estimatedCompletion) && r.stage !== 'waiting-for-collection' && r.stage !== 'waiting-for-approval' ? 'text-red-600' : 'text-slate-600'}`}>
                        {isOverdue(r.estimatedCompletion) && r.stage !== 'waiting-for-collection' && r.stage !== 'waiting-for-approval'
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-red-400" />
                          : <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
                        <span>{r.estimatedCompletion}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 max-w-xs">
                      <span className="text-xs text-slate-500 italic">{r.notes ?? '—'}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {r.stage === 'waiting-for-approval' && onJobCreated && (
                        <Button
                          size="sm"
                          onClick={() => openApprovalJobCard(r)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Open Job Card
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Approval Job Card Dialog ───────────────────────────────── */}
      {approvalVehicle && (
        <>
          <Dialog open={showApprovalJobDialog} onOpenChange={open => { if (!open) { setShowApprovalJobDialog(false); setApprovalVehicle(null); setApprovalJobItems([]); } }}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  Open Job Card — {generateJobNumber(existingJobsCount)}
                </DialogTitle>
                <DialogDescription>
                  {approvalVehicle.ownerName} · {approvalVehicle.make} {approvalVehicle.model} ({approvalVehicle.plate})
                  {approvalVehicle.bookedDate && <span className="ml-2 text-xs text-slate-400">Booked: {approvalVehicle.bookedDate}</span>}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* Vehicle info */}
                <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 rounded-lg p-4">
                  <div><span className="text-slate-500">Owner:</span> <span className="font-semibold ml-1">{approvalVehicle.ownerName}</span></div>
                  <div><span className="text-slate-500">Vehicle:</span> <span className="font-semibold ml-1">{approvalVehicle.make} {approvalVehicle.model} {approvalVehicle.year}</span></div>
                  <div><span className="text-slate-500">Plate:</span> <span className="font-mono font-semibold ml-1">{approvalVehicle.plate}</span></div>
                  <div><span className="text-slate-500">Technician:</span> <span className="font-semibold ml-1">{approvalVehicle.technicianName || '—'}</span></div>
                  <div><span className="text-slate-500">Service:</span> <span className="font-semibold ml-1">{approvalVehicle.serviceType}</span></div>
                  {approvalVehicle.bookedDate && <div><span className="text-slate-500">Booked Date:</span> <span className="font-semibold ml-1">{approvalVehicle.bookedDate}</span></div>}
                </div>

                {/* Parts & Labour */}
                <div>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="font-semibold text-slate-900">Parts &amp; Labour</h3>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => setShowApprovalPartsPicker(true)} disabled={parts.length === 0}>
                        <Plus className="h-4 w-4 mr-1" /> Add Parts
                      </Button>
                      <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        onClick={() => setShowApprovalLabourPicker(true)} disabled={maintenancePacks.filter(p => p.isActive).length === 0}>
                        <Wrench className="h-4 w-4 mr-1" /> Add Labour
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left">Description</th>
                          <th className="px-3 py-2 text-center w-20">Type</th>
                          <th className="px-3 py-2 text-right w-20">Qty / Hrs</th>
                          <th className="px-3 py-2 text-right w-32">Unit Price</th>
                          <th className="px-3 py-2 text-right w-32">Total</th>
                          <th className="px-3 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvalJobItems.length === 0 ? (
                          <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">No items — add parts or labour above</td></tr>
                        ) : (
                          approvalJobItems.map((item, idx) => (
                            <tr key={item.id} className="border-b">
                              <td className="px-3 py-2">{item.description}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isLabor ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {item.isLabor ? 'Labour' : 'Part'}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">{item.quantity}</td>
                              <td className="px-3 py-2 text-right">{fmtAOA(item.unitPrice)}</td>
                              <td className="px-3 py-2 text-right font-medium">{fmtAOA(item.total)}</td>
                              <td className="px-3 py-2 text-center">
                                <button onClick={() => setApprovalJobItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {approvalJobItems.length > 0 && (() => {
                    const { subtotal, vatAmount, total } = calculateQuotationTotals(approvalJobItems, 0.14);
                    return (
                      <div className="flex justify-end mt-3">
                        <div className="text-sm space-y-1 min-w-48">
                          <div className="flex justify-between gap-8"><span className="text-slate-500">Subtotal</span><span>{fmtAOA(subtotal)}</span></div>
                          <div className="flex justify-between gap-8"><span className="text-slate-500">VAT (14%)</span><span>{fmtAOA(vatAmount)}</span></div>
                          <div className="flex justify-between gap-8 font-bold border-t pt-1"><span>Total</span><span>{fmtAOA(total)}</span></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowApprovalJobDialog(false); setApprovalVehicle(null); setApprovalJobItems([]); }}>
                  Cancel
                </Button>
                <Button onClick={saveApprovalJobCard} disabled={!onJobCreated} className="bg-orange-600 hover:bg-orange-700 text-white">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Open Job Card
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <LabourPickerDialog open={showApprovalLabourPicker} onClose={() => setShowApprovalLabourPicker(false)}
            packs={maintenancePacks.filter(p => p.isActive)}
            onAdd={items => setApprovalJobItems(prev => [...prev, ...items])} />
          <PartsPickerDialog open={showApprovalPartsPicker} onClose={() => setShowApprovalPartsPicker(false)}
            parts={parts}
            onAdd={items => setApprovalJobItems(prev => [...prev, ...items])} />
        </>
      )}
    </div>
  );
}
