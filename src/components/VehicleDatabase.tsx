"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Car,
  Search,
  Plus,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Wrench,
  Calendar,
  Gauge,
  User,
  Hash,
  Star,
  ArrowLeft,
  DollarSign,
  Clock,
  AlertCircle,
  UserCog,
} from 'lucide-react';
import type { CRMCustomer } from '@/lib/crm-data';
import { fullName } from '@/lib/crm-data';
import { quickExcelExport } from '@/lib/advanced-excel-export';

// ── Types ────────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: number;
  plate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  engineType: string;
  transmission: string;
  currentMileage: number;
  ownerId: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  firstRegistered: string;
  notes?: string;
}

export interface ServiceRecord {
  id: number;
  vehicleId: number;
  jobNumber: string;
  date: string;
  completionDate?: string;
  serviceType: string;
  description: string;
  technicianName: string;
  mileageAtService: number;
  laborCost: number;
  partsCost: number;
  total: number;
  status: 'completed' | 'invoiced' | 'in-progress' | 'pending';
  customerRating?: number;
  customerFeedback?: string;
  items: { description: string; qty: number; unitPrice: number; total: number; isLabor: boolean }[];
}

// ── Sample Data ───────────────────────────────────────────────────────────────

export const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: 1, plate: 'LD-12-34-AB', vin: 'JTEHH3FH604017892',
    make: 'Toyota', model: 'Hilux', year: 2020, color: 'White',
    engineType: '2.4L Diesel', transmission: 'Manual',
    currentMileage: 87500,
    ownerId: 1, ownerName: 'João Silva', ownerPhone: '+244 923 456 789', ownerEmail: 'joao.silva@email.ao',
    firstRegistered: '2020-03-15',
    notes: 'Fleet vehicle. Regular 5,000km oil changes required.',
  },
  {
    id: 2, plate: 'LD-56-78-CD', vin: 'WVWZZZ1KZ8W219361',
    make: 'Volkswagen', model: 'Polo', year: 2018, color: 'Silver',
    engineType: '1.4L Petrol', transmission: 'Automatic',
    currentMileage: 62300,
    ownerId: 2, ownerName: 'Maria Santos', ownerPhone: '+244 912 345 678', ownerEmail: 'maria.santos@email.ao',
    firstRegistered: '2018-07-22',
  },
  {
    id: 3, plate: 'BG-34-90-EF', vin: 'SALVA24429A217356',
    make: 'Land Rover', model: 'Discovery', year: 2019, color: 'Black',
    engineType: '3.0L Diesel', transmission: 'Automatic',
    currentMileage: 115000,
    ownerId: 3, ownerName: 'Carlos Mendes', ownerPhone: '+244 934 567 890', ownerEmail: 'carlos.mendes@email.ao',
    firstRegistered: '2019-01-10',
    notes: 'High mileage vehicle. Suspension components need monitoring.',
  },
  {
    id: 4, plate: 'HU-21-45-GH', vin: 'WBA3A5G52ENP26993',
    make: 'BMW', model: '320i', year: 2021, color: 'Blue',
    engineType: '2.0L Petrol Turbo', transmission: 'Automatic',
    currentMileage: 38900,
    ownerId: 4, ownerName: 'Ana Rodrigues', ownerPhone: '+244 945 678 901', ownerEmail: 'ana.rodrigues@email.ao',
    firstRegistered: '2021-05-03',
  },
  {
    id: 5, plate: 'LD-88-12-IJ', vin: 'JN1TANZ50U0019553',
    make: 'Nissan', model: 'Patrol', year: 2017, color: 'Grey',
    engineType: '4.8L Petrol V8', transmission: 'Automatic',
    currentMileage: 142700,
    ownerId: 5, ownerName: 'Pedro Ferreira', ownerPhone: '+244 956 789 012', ownerEmail: 'pedro.ferreira@email.ao',
    firstRegistered: '2017-09-18',
    notes: 'Off-road use. Check undercarriage at every service.',
  },
  {
    id: 6, plate: 'CAB-03-67-KL', vin: 'LSVNV2183E2105284',
    make: 'Mitsubishi', model: 'L200', year: 2022, color: 'Red',
    engineType: '2.4L Diesel Turbo', transmission: 'Manual',
    currentMileage: 29100,
    ownerId: 6, ownerName: 'Beatriz Costa', ownerPhone: '+244 967 890 123', ownerEmail: 'beatriz.costa@email.ao',
    firstRegistered: '2022-11-30',
  },
];

export const SAMPLE_SERVICE_RECORDS: ServiceRecord[] = [
  // Vehicle 1 – Toyota Hilux
  {
    id: 1, vehicleId: 1, jobNumber: 'JOB-202312-0001',
    date: '2023-12-05', completionDate: '2023-12-05',
    serviceType: 'Scheduled Service', description: '10,000km Service',
    technicianName: 'Mike Rodriguez', mileageAtService: 52000,
    laborCost: 23000, partsCost: 18500, total: 41500,
    status: 'invoiced', customerRating: 5, customerFeedback: 'Quick and professional.',
    items: [
      { description: 'Engine Oil Change', qty: 1, unitPrice: 15000, total: 15000, isLabor: true },
      { description: 'Oil Filter', qty: 1, unitPrice: 5000, total: 5000, isLabor: false },
      { description: 'Air Filter', qty: 1, unitPrice: 4000, total: 4000, isLabor: false },
      { description: 'Fuel Filter', qty: 1, unitPrice: 7500, total: 7500, isLabor: false },
      { description: 'Service Labour', qty: 1, unitPrice: 8000, total: 8000, isLabor: true },
    ],
  },
  {
    id: 2, vehicleId: 1, jobNumber: 'JOB-202403-0003',
    date: '2024-03-12', completionDate: '2024-03-13',
    serviceType: 'Brake Service', description: 'Front brake pad replacement & disc inspection',
    technicianName: 'Mike Rodriguez', mileageAtService: 68000,
    laborCost: 40000, partsCost: 48000, total: 88000,
    status: 'invoiced', customerRating: 4, customerFeedback: 'Good work, took a bit longer than expected.',
    items: [
      { description: 'Brake Pads Replacement (Front)', qty: 1, unitPrice: 25000, total: 25000, isLabor: true },
      { description: 'Brake Disc Inspection', qty: 1, unitPrice: 8000, total: 8000, isLabor: true },
      { description: 'Brake Pads Front Set', qty: 2, unitPrice: 12000, total: 24000, isLabor: false },
      { description: 'Brake Fluid Top-Up', qty: 1, unitPrice: 7000, total: 7000, isLabor: true },
      { description: 'Brake Fluid', qty: 1, unitPrice: 4000, total: 4000, isLabor: false },
      { description: 'Caliper Pins & Grease', qty: 1, unitPrice: 20000, total: 20000, isLabor: false },
    ],
  },
  {
    id: 3, vehicleId: 1, jobNumber: 'JOB-202411-0001',
    date: '2024-11-25', completionDate: '2024-11-26',
    serviceType: 'Scheduled Service', description: 'Oil service + brake follow-up',
    technicianName: 'Mike Rodriguez', mileageAtService: 87500,
    laborCost: 38000, partsCost: 53000, total: 92340,
    status: 'invoiced', customerRating: 5, customerFeedback: 'Excellent service! Very professional.',
    items: [
      { description: 'Engine Oil Change', qty: 1, unitPrice: 15000, total: 15000, isLabor: true },
      { description: 'Oil Filter', qty: 1, unitPrice: 5000, total: 5000, isLabor: false },
      { description: 'Air Filter', qty: 1, unitPrice: 4000, total: 4000, isLabor: false },
      { description: 'Brake Inspection', qty: 1, unitPrice: 8000, total: 8000, isLabor: true },
      { description: 'Brake Pads Replacement', qty: 1, unitPrice: 25000, total: 25000, isLabor: true },
      { description: 'Brake Pads (Front)', qty: 2, unitPrice: 12000, total: 24000, isLabor: false },
    ],
  },
  // Vehicle 2 – VW Polo
  {
    id: 4, vehicleId: 2, jobNumber: 'JOB-202309-0007',
    date: '2023-09-14', completionDate: '2023-09-14',
    serviceType: 'Scheduled Service', description: '60,000km major service',
    technicianName: 'Sarah Johnson', mileageAtService: 60000,
    laborCost: 35000, partsCost: 42000, total: 77000,
    status: 'invoiced', customerRating: 5, customerFeedback: 'Very thorough, happy with everything.',
    items: [
      { description: 'Engine Oil Change', qty: 1, unitPrice: 12000, total: 12000, isLabor: true },
      { description: 'Oil Filter', qty: 1, unitPrice: 4500, total: 4500, isLabor: false },
      { description: 'Spark Plugs Replacement', qty: 4, unitPrice: 6000, total: 24000, isLabor: false },
      { description: 'Timing Belt Inspection', qty: 1, unitPrice: 10000, total: 10000, isLabor: true },
      { description: 'Coolant Flush', qty: 1, unitPrice: 8000, total: 8000, isLabor: true },
      { description: 'Coolant', qty: 2, unitPrice: 9250, total: 18500, isLabor: false },
    ],
  },
  {
    id: 5, vehicleId: 2, jobNumber: 'JOB-202407-0011',
    date: '2024-07-22', completionDate: '2024-07-23',
    serviceType: 'Electrical', description: 'AC system diagnosis and regas',
    technicianName: 'James Okafor', mileageAtService: 62300,
    laborCost: 22000, partsCost: 18000, total: 40000,
    status: 'invoiced', customerRating: 4,
    items: [
      { description: 'AC System Diagnosis', qty: 1, unitPrice: 12000, total: 12000, isLabor: true },
      { description: 'AC Regas (R134a)', qty: 1, unitPrice: 10000, total: 10000, isLabor: true },
      { description: 'Refrigerant R134a', qty: 1, unitPrice: 18000, total: 18000, isLabor: false },
    ],
  },
  // Vehicle 3 – Land Rover Discovery
  {
    id: 6, vehicleId: 3, jobNumber: 'JOB-202308-0002',
    date: '2023-08-07', completionDate: '2023-08-09',
    serviceType: 'Suspension', description: 'Front suspension overhaul',
    technicianName: 'Mike Rodriguez', mileageAtService: 98000,
    laborCost: 95000, partsCost: 165000, total: 260000,
    status: 'invoiced', customerRating: 5, customerFeedback: 'Drives like new. Worth every kwanza.',
    items: [
      { description: 'Front Shock Absorbers Replacement', qty: 2, unitPrice: 30000, total: 60000, isLabor: true },
      { description: 'Front Control Arm Bushes', qty: 4, unitPrice: 8750, total: 35000, isLabor: true },
      { description: 'Shock Absorbers (OEM)', qty: 2, unitPrice: 55000, total: 110000, isLabor: false },
      { description: 'Control Arm Bush Kit', qty: 1, unitPrice: 45000, total: 45000, isLabor: false },
      { description: 'Wheel Alignment', qty: 1, unitPrice: 10000, total: 10000, isLabor: true },
    ],
  },
  {
    id: 7, vehicleId: 3, jobNumber: 'JOB-202402-0005',
    date: '2024-02-19', completionDate: '2024-02-20',
    serviceType: 'Scheduled Service', description: '110,000km service + gearbox oil',
    technicianName: 'Sarah Johnson', mileageAtService: 110000,
    laborCost: 55000, partsCost: 63000, total: 118000,
    status: 'invoiced', customerRating: 4,
    items: [
      { description: 'Engine Oil Change (3.0L Diesel)', qty: 1, unitPrice: 20000, total: 20000, isLabor: true },
      { description: 'Oil Filter', qty: 1, unitPrice: 8000, total: 8000, isLabor: false },
      { description: 'Gearbox Oil Change', qty: 1, unitPrice: 25000, total: 25000, isLabor: true },
      { description: 'Gearbox Oil 75W-90', qty: 3, unitPrice: 12000, total: 36000, isLabor: false },
      { description: 'Diesel Fuel Filter', qty: 1, unitPrice: 10000, total: 10000, isLabor: true },
      { description: 'Fuel Filter', qty: 1, unitPrice: 9000, total: 9000, isLabor: false },
    ],
  },
  {
    id: 8, vehicleId: 3, jobNumber: 'JOB-202410-0008',
    date: '2024-10-03', completionDate: '2024-10-03',
    serviceType: 'Tyres', description: 'Tyre rotation and balance',
    technicianName: 'James Okafor', mileageAtService: 115000,
    laborCost: 16000, partsCost: 0, total: 16000,
    status: 'invoiced',
    items: [
      { description: 'Tyre Rotation (4 wheels)', qty: 1, unitPrice: 8000, total: 8000, isLabor: true },
      { description: 'Wheel Balance', qty: 4, unitPrice: 2000, total: 8000, isLabor: true },
    ],
  },
  // Vehicle 4 – BMW 320i
  {
    id: 9, vehicleId: 4, jobNumber: 'JOB-202305-0010',
    date: '2023-05-15', completionDate: '2023-05-15',
    serviceType: 'Scheduled Service', description: '20,000km service',
    technicianName: 'Sarah Johnson', mileageAtService: 20500,
    laborCost: 28000, partsCost: 35000, total: 63000,
    status: 'invoiced', customerRating: 5, customerFeedback: 'Dealer-quality service at better price.',
    items: [
      { description: 'Engine Oil Change (BMW LL-04)', qty: 1, unitPrice: 18000, total: 18000, isLabor: true },
      { description: 'BMW Approved Oil Filter', qty: 1, unitPrice: 12000, total: 12000, isLabor: false },
      { description: 'Microfilter (Cabin Air)', qty: 1, unitPrice: 8000, total: 8000, isLabor: false },
      { description: 'Brake Fluid Service (2yr)', qty: 1, unitPrice: 10000, total: 10000, isLabor: true },
      { description: 'Brake Fluid DOT4 LV', qty: 1, unitPrice: 15000, total: 15000, isLabor: false },
    ],
  },
  {
    id: 10, vehicleId: 4, jobNumber: 'JOB-202411-0012',
    date: '2024-11-10',
    serviceType: 'Scheduled Service', description: '40,000km service – in progress',
    technicianName: 'Sarah Johnson', mileageAtService: 38900,
    laborCost: 28000, partsCost: 38000, total: 66000,
    status: 'in-progress',
    items: [
      { description: 'Engine Oil Change (BMW LL-04)', qty: 1, unitPrice: 18000, total: 18000, isLabor: true },
      { description: 'Oil & Microfilter Kit', qty: 1, unitPrice: 20000, total: 20000, isLabor: false },
      { description: 'Spark Plugs (x4)', qty: 4, unitPrice: 9000, total: 36000, isLabor: false },
      { description: 'Spark Plug Labour', qty: 1, unitPrice: 10000, total: 10000, isLabor: true },
    ],
  },
  // Vehicle 5 – Nissan Patrol
  {
    id: 11, vehicleId: 5, jobNumber: 'JOB-202207-0001',
    date: '2022-07-05', completionDate: '2022-07-07',
    serviceType: 'Engine', description: 'Engine top-end overhaul – valve seats',
    technicianName: 'Mike Rodriguez', mileageAtService: 115000,
    laborCost: 180000, partsCost: 220000, total: 400000,
    status: 'invoiced', customerRating: 5, customerFeedback: 'Excellent work. Engine runs smoothly again.',
    items: [
      { description: 'Valve Seat Regrind (V8)', qty: 1, unitPrice: 120000, total: 120000, isLabor: true },
      { description: 'Head Gasket Set', qty: 1, unitPrice: 95000, total: 95000, isLabor: false },
      { description: 'Valve Stem Seals', qty: 16, unitPrice: 5000, total: 80000, isLabor: false },
      { description: 'Cylinder Head Bolts', qty: 1, unitPrice: 45000, total: 45000, isLabor: false },
      { description: 'Head Bolt Labour', qty: 1, unitPrice: 60000, total: 60000, isLabor: true },
    ],
  },
  {
    id: 12, vehicleId: 5, jobNumber: 'JOB-202311-0004',
    date: '2023-11-28', completionDate: '2023-11-29',
    serviceType: 'Scheduled Service', description: '130,000km service + undercarriage check',
    technicianName: 'Mike Rodriguez', mileageAtService: 130000,
    laborCost: 65000, partsCost: 72000, total: 137000,
    status: 'invoiced', customerRating: 5,
    items: [
      { description: 'Engine Oil Change (V8)', qty: 1, unitPrice: 25000, total: 25000, isLabor: true },
      { description: 'Oil Filter', qty: 1, unitPrice: 8000, total: 8000, isLabor: false },
      { description: 'Undercarriage Inspection', qty: 1, unitPrice: 15000, total: 15000, isLabor: true },
      { description: 'Prop Shaft Greasing', qty: 1, unitPrice: 12000, total: 12000, isLabor: true },
      { description: 'Diff Oil Change (front+rear)', qty: 1, unitPrice: 18000, total: 18000, isLabor: true },
      { description: 'Diff Oil 85W-140', qty: 4, unitPrice: 9000, total: 36000, isLabor: false },
      { description: 'Grease Fittings Kit', qty: 1, unitPrice: 7500, total: 7500, isLabor: false },
      { description: 'Transmission Filter', qty: 1, unitPrice: 12500, total: 12500, isLabor: false },
      { description: 'ATF Oil (x6L)', qty: 6, unitPrice: 8000, total: 48000, isLabor: false },
    ],
  },
  {
    id: 13, vehicleId: 5, jobNumber: 'JOB-202409-0006',
    date: '2024-09-02', completionDate: '2024-09-02',
    serviceType: 'Tyres', description: 'Tyre replacement – all 4',
    technicianName: 'James Okafor', mileageAtService: 142700,
    laborCost: 20000, partsCost: 176000, total: 196000,
    status: 'invoiced', customerRating: 4,
    items: [
      { description: 'Tyre Removal & Fitting (x4)', qty: 4, unitPrice: 5000, total: 20000, isLabor: true },
      { description: 'Bridgestone Dueler AT 285/65R18', qty: 4, unitPrice: 44000, total: 176000, isLabor: false },
    ],
  },
  // Vehicle 6 – Mitsubishi L200
  {
    id: 14, vehicleId: 6, jobNumber: 'JOB-202406-0009',
    date: '2024-06-17', completionDate: '2024-06-17',
    serviceType: 'Scheduled Service', description: 'First 15,000km service',
    technicianName: 'Sarah Johnson', mileageAtService: 15000,
    laborCost: 18000, partsCost: 22000, total: 40000,
    status: 'invoiced', customerRating: 5, customerFeedback: 'Fast and reliable.',
    items: [
      { description: 'Engine Oil Change (2.4D)', qty: 1, unitPrice: 14000, total: 14000, isLabor: true },
      { description: 'Oil Filter', qty: 1, unitPrice: 6000, total: 6000, isLabor: false },
      { description: 'Multi-point Inspection', qty: 1, unitPrice: 4000, total: 4000, isLabor: true },
      { description: 'Air Filter', qty: 1, unitPrice: 6500, total: 6500, isLabor: false },
      { description: 'Pollen Filter', qty: 1, unitPrice: 5000, total: 5000, isLabor: false },
      { description: 'Tyre Rotation', qty: 1, unitPrice: 4500, total: 4500, isLabor: true },
    ],
  },
  {
    id: 15, vehicleId: 6, jobNumber: 'JOB-202412-0015',
    date: '2024-12-01',
    serviceType: 'Scheduled Service', description: '30,000km service – pending',
    technicianName: 'Mike Rodriguez', mileageAtService: 29100,
    laborCost: 20000, partsCost: 28000, total: 48000,
    status: 'pending',
    items: [
      { description: 'Engine Oil Change', qty: 1, unitPrice: 14000, total: 14000, isLabor: true },
      { description: 'Oil & Air Filter Kit', qty: 1, unitPrice: 12000, total: 12000, isLabor: false },
      { description: 'Diesel Fuel Filter', qty: 1, unitPrice: 6000, total: 6000, isLabor: true },
      { description: 'Fuel Filter', qty: 1, unitPrice: 10000, total: 10000, isLabor: false },
      { description: 'Brake Fluid Check', qty: 1, unitPrice: 6000, total: 6000, isLabor: true },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusColor: Record<ServiceRecord['status'], string> = {
  completed:   'bg-green-100 text-green-800',
  invoiced:    'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  pending:     'bg-slate-100 text-slate-700',
};

const fmt = (n: number) =>
  n.toLocaleString('pt-AO', { minimumFractionDigits: 0 }) + ' Kz';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
      ))}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type SortKey = 'plate' | 'make' | 'year' | 'ownerName' | 'currentMileage' | 'lastService' | 'serviceCount' | 'totalSpent';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 25;

interface VehicleDatabaseProps {
  customers?: CRMCustomer[];
  vehicles?: Vehicle[];
  onVehiclesChange?: (vehicles: Vehicle[]) => void;
}

export default function VehicleDatabase({ customers = [], vehicles: vehiclesProp, onVehiclesChange }: VehicleDatabaseProps) {
  const [internalVehicles, setInternalVehicles] = useState<Vehicle[]>(SAMPLE_VEHICLES);
  const vehicles = vehiclesProp ?? internalVehicles;
  const setVehicles = (updater: Vehicle[] | ((prev: Vehicle[]) => Vehicle[])) => {
    const next = typeof updater === 'function' ? updater(vehicles) : updater;
    if (onVehiclesChange) onVehiclesChange(next);
    else setInternalVehicles(next);
  };
  const [serviceRecords] = useState<ServiceRecord[]>(SAMPLE_SERVICE_RECORDS);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('plate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showChangeOwnerDialog, setShowChangeOwnerDialog] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({});

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    return (
      v.plate.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.ownerName.toLowerCase().includes(q) ||
      v.vin.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let av: string | number;
    let bv: string | number;
    switch (sortKey) {
      case 'lastService':
        av = lastService(a.id); bv = lastService(b.id); break;
      case 'serviceCount':
        av = vehicleHistory(a.id).length; bv = vehicleHistory(b.id).length; break;
      case 'totalSpent':
        av = totalSpent(a.id); bv = totalSpent(b.id); break;
      default:
        av = (a as any)[sortKey]; bv = (b as any)[sortKey];
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const handleSearch = (q: string) => { setSearch(q); setPage(1); };

  const vehicleHistory = (vehicleId: number) =>
    serviceRecords
      .filter(r => r.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpent = (vehicleId: number) =>
    serviceRecords.filter(r => r.vehicleId === vehicleId && (r.status === 'completed' || r.status === 'invoiced')).reduce((s, r) => s + r.total, 0);

  const lastService = (vehicleId: number) => {
    const records = serviceRecords.filter(r => r.vehicleId === vehicleId && r.completionDate).sort((a, b) => new Date(b.completionDate!).getTime() - new Date(a.completionDate!).getTime());
    return records[0]?.completionDate ?? '—';
  };

  const handleExport = () => {
    quickExcelExport(
      filtered.map(v => ({
        Plate: v.plate, VIN: v.vin, Make: v.make, Model: v.model, Year: v.year,
        Color: v.color, Engine: v.engineType, Transmission: v.transmission,
        'Current Mileage': v.currentMileage, Owner: v.ownerName,
        Phone: v.ownerPhone, Email: v.ownerEmail,
        'Registered': v.firstRegistered,
        'Last Service': lastService(v.id),
        'Total Spent (Kz)': totalSpent(v.id),
        'Service Count': vehicleHistory(v.id).length,
      })),
      'vehicle-database'
    );
  };

  const handleChangeOwner = (customer: CRMCustomer) => {
    if (!selectedVehicle) return;
    const updated: Vehicle = {
      ...selectedVehicle,
      ownerId: customer.id,
      ownerName: fullName(customer),
      ownerPhone: customer.phone,
      ownerEmail: customer.email,
    };
    setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? updated : v));
    setSelectedVehicle(updated);
    setShowChangeOwnerDialog(false);
    setOwnerSearch('');
  };

  const handleAddVehicle = () => {
    if (!newVehicle.plate || !newVehicle.make || !newVehicle.model) return;
    const v: Vehicle = {
      id: Date.now(),
      plate: newVehicle.plate!,
      vin: newVehicle.vin || '',
      make: newVehicle.make!,
      model: newVehicle.model!,
      year: newVehicle.year || new Date().getFullYear(),
      color: newVehicle.color || '',
      engineType: newVehicle.engineType || '',
      transmission: newVehicle.transmission || '',
      currentMileage: newVehicle.currentMileage || 0,
      ownerId: Date.now(),
      ownerName: newVehicle.ownerName || '',
      ownerPhone: newVehicle.ownerPhone || '',
      ownerEmail: newVehicle.ownerEmail || '',
      firstRegistered: newVehicle.firstRegistered || new Date().toISOString().split('T')[0],
      notes: newVehicle.notes,
    };
    setVehicles(prev => [v, ...prev]);
    setNewVehicle({});
    setShowAddDialog(false);
  };

  // ── Vehicle Detail View ───────────────────────────────────────────────────

  if (selectedVehicle) {
    const history = vehicleHistory(selectedVehicle.id);
    const spent = totalSpent(selectedVehicle.id);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setSelectedVehicle(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
            </h1>
            <p className="text-slate-500 text-sm">{selectedVehicle.plate} · {selectedVehicle.vin}</p>
          </div>
        </div>

        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history">Service History ({history.length})</TabsTrigger>
            <TabsTrigger value="info">Vehicle Info</TabsTrigger>
          </TabsList>

          {/* ── Service History Tab ─────────────────────────────────────── */}
          <TabsContent value="history" className="space-y-4 mt-4">

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-slate-500">Total Services</p>
                  <p className="text-2xl font-bold text-slate-900">{history.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-slate-500">Total Spent</p>
                  <p className="text-2xl font-bold text-orange-600">{fmt(spent)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-slate-500">Current Mileage</p>
                  <p className="text-2xl font-bold text-slate-900">{selectedVehicle.currentMileage.toLocaleString()} km</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-slate-500">Last Service</p>
                  <p className="text-lg font-bold text-slate-900">{lastService(selectedVehicle.id) !== '—' ? new Date(lastService(selectedVehicle.id)).toLocaleDateString('en-GB') : '—'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            {history.length === 0 ? (
              <Card className="p-8 text-center text-slate-500">No service records yet.</Card>
            ) : (
              <div className="space-y-4">
                {history.map(record => (
                  <Card key={record.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900">{record.description}</span>
                            <Badge className={`text-xs ${statusColor[record.status]}`}>{record.status}</Badge>
                            <Badge variant="outline" className="text-xs">{record.serviceType}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(record.date).toLocaleDateString('en-GB')}{record.completionDate && record.completionDate !== record.date ? ` → ${new Date(record.completionDate).toLocaleDateString('en-GB')}` : ''}</span>
                            <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{record.mileageAtService.toLocaleString()} km</span>
                            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{record.technicianName}</span>
                            <span className="flex items-center gap-1"><Hash className="h-3.5 w-3.5" />{record.jobNumber}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{fmt(record.total)}</p>
                          <p className="text-xs text-slate-500">Labour: {fmt(record.laborCost)} · Parts: {fmt(record.partsCost)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Line items */}
                      <div className="border rounded-lg overflow-hidden text-sm">
                        <table className="w-full">
                          <thead className="bg-slate-50 text-slate-600">
                            <tr>
                              <th className="text-left px-3 py-2 font-medium">Description</th>
                              <th className="text-center px-3 py-2 font-medium w-12">Qty</th>
                              <th className="text-right px-3 py-2 font-medium">Unit Price</th>
                              <th className="text-right px-3 py-2 font-medium">Total</th>
                              <th className="text-center px-3 py-2 font-medium w-16">Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.items.map((item, i) => (
                              <tr key={i} className="border-t">
                                <td className="px-3 py-1.5">{item.description}</td>
                                <td className="px-3 py-1.5 text-center">{item.qty}</td>
                                <td className="px-3 py-1.5 text-right">{fmt(item.unitPrice)}</td>
                                <td className="px-3 py-1.5 text-right font-medium">{fmt(item.total)}</td>
                                <td className="px-3 py-1.5 text-center">
                                  <Badge variant="outline" className={`text-xs ${item.isLabor ? 'text-blue-700 border-blue-200' : 'text-green-700 border-green-200'}`}>
                                    {item.isLabor ? 'Labour' : 'Part'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* Rating & feedback */}
                      {record.customerRating && (
                        <div className="mt-3 flex items-center gap-3">
                          <StarRating rating={record.customerRating} />
                          {record.customerFeedback && (
                            <span className="text-sm text-slate-500 italic">"{record.customerFeedback}"</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Vehicle Info Tab ────────────────────────────────────────── */}
          <TabsContent value="info" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Car className="h-4 w-4" />Vehicle Details</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {[
                    ['Make', selectedVehicle.make],
                    ['Model', selectedVehicle.model],
                    ['Year', selectedVehicle.year],
                    ['Colour', selectedVehicle.color],
                    ['Engine', selectedVehicle.engineType],
                    ['Transmission', selectedVehicle.transmission],
                    ['Plate', selectedVehicle.plate],
                    ['VIN', selectedVehicle.vin],
                    ['First Registered', selectedVehicle.firstRegistered],
                    ['Current Mileage', `${selectedVehicle.currentMileage.toLocaleString()} km`],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex justify-between border-b border-slate-100 pb-2 last:border-0">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" />Owner</CardTitle>
                    {customers.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => setShowChangeOwnerDialog(true)}>
                        <UserCog className="h-4 w-4 mr-1" /> Change Owner
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {[
                    ['Name', selectedVehicle.ownerName],
                    ['Phone', selectedVehicle.ownerPhone],
                    ['Email', selectedVehicle.ownerEmail],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex justify-between border-b border-slate-100 pb-2 last:border-0">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-medium">{value || '—'}</span>
                    </div>
                  ))}
                  {selectedVehicle.notes && (
                    <div className="pt-2">
                      <p className="text-slate-500 mb-1">Notes</p>
                      <p className="text-slate-700 bg-amber-50 border border-amber-200 rounded p-2">{selectedVehicle.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Change Owner Dialog */}
        <Dialog open={showChangeOwnerDialog} onOpenChange={setShowChangeOwnerDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Change Vehicle Owner</DialogTitle></DialogHeader>
            <p className="text-sm text-slate-500 -mt-2">Select a customer from the CRM to assign as the new owner of <span className="font-semibold text-slate-700">{selectedVehicle.plate}</span>.</p>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone or company..."
                value={ownerSearch}
                onChange={e => setOwnerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                autoFocus
              />
            </div>
            <div className="mt-1 max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {customers
                .filter(c => {
                  const q = ownerSearch.toLowerCase();
                  return fullName(c).toLowerCase().includes(q) || c.phone.includes(q) || (c.company ?? '').toLowerCase().includes(q);
                })
                .map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleChangeOwner(c)}
                    className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors ${c.id === selectedVehicle.ownerId ? 'bg-orange-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{fullName(c)}</p>
                        <p className="text-xs text-slate-500">{c.phone}{c.company ? ` · ${c.company}` : ''}</p>
                      </div>
                      {c.id === selectedVehicle.ownerId && <Badge className="text-xs bg-orange-100 text-orange-700">Current</Badge>}
                    </div>
                  </button>
                ))}
              {customers.filter(c => {
                const q = ownerSearch.toLowerCase();
                return fullName(c).toLowerCase().includes(q) || c.phone.includes(q) || (c.company ?? '').toLowerCase().includes(q);
              }).length === 0 && (
                <p className="text-center text-slate-400 py-6 text-sm">No customers found.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Vehicle List View ─────────────────────────────────────────────────────

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 inline ml-1" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3.5 w-3.5 text-orange-500 inline ml-1" />
      : <ChevronDown className="h-3.5 w-3.5 text-orange-500 inline ml-1" />;
  };

  const Th = ({ col, children }: { col: SortKey; children: React.ReactNode }) => (
    <th
      className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide cursor-pointer select-none hover:text-slate-900 whitespace-nowrap"
      onClick={() => handleSort(col)}
    >
      {children}<SortIcon col={col} />
    </th>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Vehicle Database</h1>
          <p className="text-slate-600 mt-1">Customer vehicles and full service history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Vehicle
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Vehicles', value: vehicles.length, icon: Car, color: 'text-slate-700' },
          { label: 'Service Records', value: serviceRecords.length, icon: Wrench, color: 'text-blue-600' },
          { label: 'Active Jobs', value: serviceRecords.filter(r => r.status === 'in-progress' || r.status === 'pending').length, icon: Clock, color: 'text-yellow-600' },
          { label: 'Revenue (Invoiced)', value: fmt(serviceRecords.filter(r => r.status === 'invoiced').reduce((s, r) => s + r.total, 0)), icon: DollarSign, color: 'text-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <Icon className={`h-7 w-7 ${color}`} />
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by plate, make, model, owner or VIN..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <span className="text-sm text-slate-500 whitespace-nowrap">
          {filtered.length} of {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <Th col="plate">Plate</Th>
                <Th col="make">Make / Model</Th>
                <Th col="year">Year</Th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap">Engine</th>
                <Th col="ownerName">Owner</Th>
                <Th col="currentMileage">Mileage</Th>
                <Th col="lastService">Last Service</Th>
                <Th col="serviceCount">Services</Th>
                <Th col="totalSpent">Total Spent</Th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-12 text-center text-slate-400">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-40" />
                    No vehicles found.
                  </td>
                </tr>
              )}
              {pageRows.map(vehicle => {
                const history = vehicleHistory(vehicle.id);
                const spent = totalSpent(vehicle.id);
                const ls = lastService(vehicle.id);
                const activeJob = history.find(r => r.status === 'in-progress' || r.status === 'pending');

                return (
                  <tr
                    key={vehicle.id}
                    className="hover:bg-orange-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <td className="px-3 py-3 font-mono font-semibold text-slate-900">{vehicle.plate}</td>
                    <td className="px-3 py-3">
                      <span className="font-medium text-slate-900">{vehicle.make} {vehicle.model}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{vehicle.year}</td>
                    <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{vehicle.engineType}</td>
                    <td className="px-3 py-3 text-slate-700">{vehicle.ownerName}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{vehicle.currentMileage.toLocaleString()} km</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {ls !== '—' ? new Date(ls).toLocaleDateString('en-GB') : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-3 py-3 text-center text-slate-700">{history.length}</td>
                    <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{fmt(spent)}</td>
                    <td className="px-3 py-3">
                      {activeJob ? (
                        <Badge className={`text-xs ${statusColor[activeJob.status]}`}>
                          {activeJob.status === 'in-progress' ? 'In Workshop' : 'Booked In'}
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-slate-100 text-slate-500">Idle</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(1)}>«</Button>
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                    className={p === page ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}
                  >{p}</Button>
                );
              })}
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {([
              ['Plate *', 'plate', 'text', 'LD-00-00-AA'],
              ['VIN', 'vin', 'text', 'JTEHH3FH...'],
              ['Make *', 'make', 'text', 'Toyota'],
              ['Model *', 'model', 'text', 'Hilux'],
              ['Year', 'year', 'number', '2023'],
              ['Colour', 'color', 'text', 'White'],
              ['Engine', 'engineType', 'text', '2.4L Diesel'],
              ['Transmission', 'transmission', 'text', 'Manual'],
              ['Current Mileage (km)', 'currentMileage', 'number', '0'],
              ['First Registered', 'firstRegistered', 'date', ''],
              ['Owner Name', 'ownerName', 'text', 'Full name'],
              ['Owner Phone', 'ownerPhone', 'text', '+244 9xx xxx xxx'],
              ['Owner Email', 'ownerEmail', 'email', 'owner@email.com'],
            ] as [string, keyof Vehicle, string, string][]).map(([label, field, type, ph]) => (
              <div key={field}>
                <label className="text-sm font-medium text-slate-700">{label}</label>
                <input
                  type={type}
                  placeholder={ph}
                  value={(newVehicle as any)[field] ?? ''}
                  onChange={e => setNewVehicle(prev => ({ ...prev, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                  className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <textarea
                placeholder="Any special notes about this vehicle..."
                value={newVehicle.notes ?? ''}
                onChange={e => setNewVehicle(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddVehicle}
              disabled={!newVehicle.plate || !newVehicle.make || !newVehicle.model}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Add Vehicle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
