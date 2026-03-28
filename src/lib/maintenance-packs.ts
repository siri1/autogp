// ── Maintenance Pack data model ────────────────────────────────────────────

export interface LabourTask {
  id: number;
  description: string;
  estimatedHours: number;
  rate: number;   // AOA per hour
  total: number;  // estimatedHours × rate
}

export interface MaintenancePack {
  id: number;
  packNumber: string;   // MP-001
  name: string;
  description: string;
  category: string;
  labourTasks: LabourTask[];
  totalHours: number;
  totalAmount: number;
  isActive: boolean;
  createdDate: string;
  /** Vehicle makes this pack applies to. Empty/undefined = all vehicles. */
  applicableMakes?: string[];
}

export const PACK_CATEGORIES = [
  'Engine',
  'Brakes',
  'Electrical',
  'Suspension',
  'Air Conditioning',
  'Transmission',
  'Tyres',
  'General',
] as const;

export const generatePackNumber = (lastId: number): string =>
  `MP-${String(lastId + 1).padStart(3, '0')}`;

export const calcPackTotals = (
  tasks: LabourTask[]
): { totalHours: number; totalAmount: number } => ({
  totalHours: tasks.reduce((s, t) => s + t.estimatedHours, 0),
  totalAmount: tasks.reduce((s, t) => s + t.total, 0),
});

// ── Sample data ────────────────────────────────────────────────────────────

export const SAMPLE_MAINTENANCE_PACKS: MaintenancePack[] = [
  {
    id: 1, packNumber: 'MP-001',
    name: 'Full Service A',
    description: 'Standard full service for petrol vehicles up to 3.0L',
    category: 'Engine',
    labourTasks: [
      { id: 1, description: 'Engine oil drain & refill',     estimatedHours: 0.5,  rate: 5000, total: 2500  },
      { id: 2, description: 'Oil filter replacement',         estimatedHours: 0.25, rate: 5000, total: 1250  },
      { id: 3, description: 'Air filter check & replace',     estimatedHours: 0.25, rate: 5000, total: 1250  },
      { id: 4, description: 'Brake fluid check & top-up',     estimatedHours: 0.25, rate: 5000, total: 1250  },
      { id: 5, description: '30-point safety check',          estimatedHours: 1.0,  rate: 5000, total: 5000  },
    ],
    totalHours: 2.25, totalAmount: 11250, isActive: true, createdDate: '2025-01-10',
  },
  {
    id: 2, packNumber: 'MP-002',
    name: 'Brake Service',
    description: 'Front and rear brake inspection and pad replacement',
    category: 'Brakes',
    labourTasks: [
      { id: 1, description: 'Remove & inspect front brake callipers', estimatedHours: 1.0,  rate: 6000, total: 6000 },
      { id: 2, description: 'Replace front brake pads',               estimatedHours: 0.5,  rate: 6000, total: 3000 },
      { id: 3, description: 'Remove & inspect rear brake callipers',  estimatedHours: 1.0,  rate: 6000, total: 6000 },
      { id: 4, description: 'Replace rear brake pads',                estimatedHours: 0.5,  rate: 6000, total: 3000 },
      { id: 5, description: 'Bleed brake system',                     estimatedHours: 0.5,  rate: 6000, total: 3000 },
    ],
    totalHours: 3.5, totalAmount: 21000, isActive: true, createdDate: '2025-01-10',
  },
  {
    id: 3, packNumber: 'MP-003',
    name: 'AC Service',
    description: 'Air conditioning system check, recharge & filter change',
    category: 'Air Conditioning',
    labourTasks: [
      { id: 1, description: 'AC system pressure test',            estimatedHours: 0.5,  rate: 5500, total: 2750 },
      { id: 2, description: 'Refrigerant recovery & recharge',    estimatedHours: 1.0,  rate: 5500, total: 5500 },
      { id: 3, description: 'Cabin air filter replacement',       estimatedHours: 0.25, rate: 5500, total: 1375 },
      { id: 4, description: 'AC condenser inspection & cleaning', estimatedHours: 0.5,  rate: 5500, total: 2750 },
    ],
    totalHours: 2.25, totalAmount: 12375, isActive: true, createdDate: '2025-01-15',
  },
  {
    id: 4, packNumber: 'MP-004',
    name: 'Suspension Check',
    description: 'Full suspension inspection with wheel alignment report',
    category: 'Suspension',
    labourTasks: [
      { id: 1, description: 'Inspect front shock absorbers',  estimatedHours: 0.5,  rate: 6500, total: 3250 },
      { id: 2, description: 'Inspect rear shock absorbers',   estimatedHours: 0.5,  rate: 6500, total: 3250 },
      { id: 3, description: 'Inspect ball joints & tie rods', estimatedHours: 0.75, rate: 6500, total: 4875 },
      { id: 4, description: 'Wheel alignment check & report', estimatedHours: 0.5,  rate: 6500, total: 3250 },
    ],
    totalHours: 2.25, totalAmount: 14625, isActive: true, createdDate: '2025-02-01',
  },
  {
    id: 5, packNumber: 'MP-005',
    name: 'Electrical Diagnostic',
    description: 'Full vehicle OBD diagnostic scan & battery / alternator test',
    category: 'Electrical',
    labourTasks: [
      { id: 1, description: 'OBD-II diagnostic scan',    estimatedHours: 0.5,  rate: 7000, total: 3500 },
      { id: 2, description: 'Battery load test',         estimatedHours: 0.25, rate: 7000, total: 1750 },
      { id: 3, description: 'Alternator output test',    estimatedHours: 0.25, rate: 7000, total: 1750 },
      { id: 4, description: 'Fault code read & report',  estimatedHours: 0.5,  rate: 7000, total: 3500 },
    ],
    totalHours: 1.5, totalAmount: 10500, isActive: true, createdDate: '2025-02-10',
  },
  {
    id: 6, packNumber: 'MP-006',
    name: 'Timing Belt Change',
    description: 'Timing belt, water pump & tensioner replacement',
    category: 'Engine',
    labourTasks: [
      { id: 1, description: 'Remove engine covers & accessories',           estimatedHours: 1.0, rate: 8000, total: 8000  },
      { id: 2, description: 'Remove & replace timing belt',                 estimatedHours: 2.0, rate: 8000, total: 16000 },
      { id: 3, description: 'Replace water pump',                           estimatedHours: 0.5, rate: 8000, total: 4000  },
      { id: 4, description: 'Replace idler & tensioner pulley',             estimatedHours: 0.5, rate: 8000, total: 4000  },
      { id: 5, description: 'Refit covers, test & reset service indicator', estimatedHours: 1.0, rate: 8000, total: 8000  },
    ],
    totalHours: 5.0, totalAmount: 40000, isActive: true, createdDate: '2025-02-15',
  },
];
