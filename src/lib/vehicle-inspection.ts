// ── Vehicle Walk-Around Inspection ─────────────────────────────────────────

export type DamageType = 'scratch' | 'dent' | 'crack' | 'chip' | 'missing' | 'other';
export type DamageSeverity = 'minor' | 'moderate' | 'severe';
export type FuelLevel = 'empty' | '1/4' | '1/2' | '3/4' | 'full';

export interface DamageMarker {
  id: number;
  zone: string;
  zoneName: string;
  type: DamageType;
  severity: DamageSeverity;
  notes: string;
}

export interface VehicleInspection {
  id: number;
  inspectionNumber: string;
  date: string;
  time: string;
  appointmentId?: number;
  customerId?: number;
  customerName: string;
  customerPhone?: string;
  vehiclePlate: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: number;
  mileage: number;
  fuelLevel: FuelLevel;
  damageMarkers: DamageMarker[];
  generalNotes: string;
  technicianName: string;
  status: 'draft' | 'completed' | 'signed';
  createdDate: string;
}

export const DAMAGE_TYPES: { value: DamageType; label: string; icon: string }[] = [
  { value: 'scratch', label: 'Scratch',      icon: '~' },
  { value: 'dent',    label: 'Dent',         icon: '○' },
  { value: 'crack',   label: 'Crack',        icon: '/' },
  { value: 'chip',    label: 'Paint Chip',   icon: '◆' },
  { value: 'missing', label: 'Missing Part', icon: '✕' },
  { value: 'other',   label: 'Other',        icon: '?' },
];

export const DAMAGE_SEVERITIES: { value: DamageSeverity; label: string }[] = [
  { value: 'minor',    label: 'Minor'    },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe',   label: 'Severe'   },
];

export const FUEL_LEVELS: FuelLevel[] = ['empty', '1/4', '1/2', '3/4', 'full'];

export const ZONE_LABELS: Record<string, string> = {
  'front-bumper': 'Front Bumper',
  'fl-fender':    'Front Left Fender',
  'hood':         'Hood / Bonnet',
  'fr-fender':    'Front Right Fender',
  'windscreen':   'Windscreen',
  'fl-door':      'Left Doors',
  'roof':         'Roof',
  'fr-door':      'Right Doors',
  'rear-window':  'Rear Window',
  'rl-quarter':   'Rear Left Panel',
  'trunk':        'Trunk / Boot',
  'rr-quarter':   'Rear Right Panel',
  'rear-bumper':  'Rear Bumper',
};

export const generateInspectionNumber = (count: number): string => {
  const d = new Date();
  return `INS-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;
};

// ── Severity colour helpers ─────────────────────────────────────────────────
export const severityFill = (severity: DamageSeverity): string => ({
  minor:    '#fef08a',   // yellow-200
  moderate: '#fdba74',   // orange-300
  severe:   '#fca5a5',   // red-300
}[severity]);

export const severityStroke = (severity: DamageSeverity): string => ({
  minor:    '#ca8a04',   // yellow-600
  moderate: '#ea580c',   // orange-600
  severe:   '#dc2626',   // red-600
}[severity]);

// ── Sample data ─────────────────────────────────────────────────────────────
export const SAMPLE_INSPECTIONS: VehicleInspection[] = [
  {
    id: 1,
    inspectionNumber: 'INS-202603-0001',
    date: '2026-03-20',
    time: '09:15',
    customerId: 1,
    customerName: 'João Silva',
    customerPhone: '+244 923 456 789',
    vehiclePlate: 'LD-12-34-AB',
    vehicleMake: 'Toyota',
    vehicleModel: 'Hilux',
    vehicleYear: 2020,
    mileage: 45230,
    fuelLevel: '3/4',
    damageMarkers: [
      { id: 1, zone: 'fl-fender', zoneName: 'Front Left Fender', type: 'dent',    severity: 'minor',    notes: 'Small dent near wheel arch' },
      { id: 2, zone: 'rear-bumper', zoneName: 'Rear Bumper',     type: 'scratch', severity: 'moderate', notes: 'Horizontal scratch along lower edge' },
    ],
    generalNotes: 'Customer reported AC not working. Pre-existing bumper scratch noted and acknowledged.',
    technicianName: 'Mike Rodriguez',
    status: 'completed',
    createdDate: '2026-03-20',
  },
  {
    id: 2,
    inspectionNumber: 'INS-202603-0002',
    date: '2026-03-21',
    time: '14:30',
    customerName: 'Ana Ferreira',
    customerPhone: '+244 923 777 888',
    vehiclePlate: 'LD-56-78-CD',
    vehicleMake: 'Mitsubishi',
    vehicleModel: 'Pajero',
    vehicleYear: 2019,
    mileage: 78500,
    fuelLevel: '1/2',
    damageMarkers: [],
    generalNotes: 'Vehicle in good condition. Routine service scheduled.',
    technicianName: 'Sarah Chen',
    status: 'signed',
    createdDate: '2026-03-21',
  },
];
