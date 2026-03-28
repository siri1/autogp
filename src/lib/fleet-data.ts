// ─── Fleet Management — Types & Sample Data ───────────────────────────────────

export type FleetVehicleStatus = 'ok' | 'due_soon' | 'overdue' | 'in_service' | 'retired';
export type MaintenanceStatus  = 'ok' | 'due_soon' | 'overdue';
export type CostCategory       = 'Labour' | 'Parts' | 'Tyres' | 'Oil & Fluids' | 'Inspection' | 'Bodywork' | 'Other';
export type FuelType           = 'Diesel' | 'Petrol' | 'Hybrid' | 'Electric';

// ── Fleet client (a garage customer who owns multiple vehicles) ──────────────

export interface FleetClient {
  id: string;
  name: string;                // company name
  contactName: string;
  phone: string;
  email: string;
  vatNumber: string;
  vehicleCount: number;        // derived but cached for display
  contractStart: string;       // ISO date
  notes?: string;
}

// ── A vehicle that belongs to a fleet ────────────────────────────────────────

export interface FleetVehicle {
  id: string;
  fleetClientId: string;
  registration: string;        // plate
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  currentMileage: number;      // km
  assignedDriver?: string;
  status: FleetVehicleStatus;

  // Service tracking
  lastServiceDate: string;     // ISO date
  lastServiceMileage: number;
  nextServiceDate: string;     // ISO date
  nextServiceMileage: number;

  // Contract
  vin?: string;
  colour?: string;
  notes?: string;
}

// ── A recurring maintenance task for a specific vehicle ───────────────────────

export interface MaintenanceInterval {
  id: string;
  vehicleId: string;
  task: string;                // e.g. "Oil & Filter Change"
  intervalKm?: number;         // every N km
  intervalMonths?: number;     // every N months
  lastDoneDate: string;
  lastDoneKm: number;
  nextDueDate: string;
  nextDueKm: number;
  status: MaintenanceStatus;
  estimatedCostAoa: number;
}

// ── A logged maintenance cost entry ──────────────────────────────────────────

export interface FleetCostEntry {
  id: string;
  vehicleId: string;
  date: string;                // ISO date
  category: CostCategory;
  description: string;
  labourCost: number;
  partsCost: number;
  totalCost: number;
  odometer: number;
  invoiceRef?: string;
  technicianName?: string;
}

// ─── Sample Fleet Clients ────────────────────────────────────────────────────

export const SAMPLE_FLEET_CLIENTS: FleetClient[] = [
  {
    id: 'fc1',
    name: 'Sonagest Logística, Lda.',
    contactName: 'Domingos Fernandes',
    phone: '+244 924 100 200',
    email: 'frotas@sonagest.ao',
    vatNumber: '5417001234',
    vehicleCount: 5,
    contractStart: '2023-01-10',
  },
  {
    id: 'fc2',
    name: 'Odebrecht Angola — Transportes',
    contactName: 'Marcos Pinto',
    phone: '+244 924 300 400',
    email: 'manutencao@odebrecht.ao',
    vatNumber: '5417005678',
    vehicleCount: 3,
    contractStart: '2024-03-01',
    notes: 'Priority SLA — 24 h turnaround.',
  },
];

// ─── Sample Fleet Vehicles ────────────────────────────────────────────────────

export const SAMPLE_FLEET_VEHICLES: FleetVehicle[] = [
  // Sonagest fleet ─────────────────────────────────────────────────────────────
  {
    id: 'fv1', fleetClientId: 'fc1',
    registration: 'LD-12-34-AA', make: 'Toyota', model: 'Hilux', year: 2021,
    fuelType: 'Diesel', currentMileage: 87_400, assignedDriver: 'Armando Lopes',
    status: 'overdue',
    lastServiceDate: '2025-08-15', lastServiceMileage: 77_000,
    nextServiceDate: '2026-02-15', nextServiceMileage: 87_000,
    vin: 'MR0EX3CD10Y123456', colour: 'White',
  },
  {
    id: 'fv2', fleetClientId: 'fc1',
    registration: 'LD-56-78-BB', make: 'Ford', model: 'Ranger', year: 2022,
    fuelType: 'Diesel', currentMileage: 54_200, assignedDriver: 'Conceição Silva',
    status: 'due_soon',
    lastServiceDate: '2025-11-01', lastServiceMileage: 44_500,
    nextServiceDate: '2026-05-01', nextServiceMileage: 54_500,
    colour: 'Silver',
  },
  {
    id: 'fv3', fleetClientId: 'fc1',
    registration: 'LD-99-01-CC', make: 'Mitsubishi', model: 'L200', year: 2020,
    fuelType: 'Diesel', currentMileage: 112_000, assignedDriver: 'Bernardo Santos',
    status: 'ok',
    lastServiceDate: '2026-01-20', lastServiceMileage: 107_000,
    nextServiceDate: '2026-07-20', nextServiceMileage: 117_000,
    colour: 'Black',
  },
  {
    id: 'fv4', fleetClientId: 'fc1',
    registration: 'LD-22-44-DD', make: 'Toyota', model: 'Land Cruiser', year: 2023,
    fuelType: 'Diesel', currentMileage: 31_500,
    status: 'ok',
    lastServiceDate: '2026-02-10', lastServiceMileage: 25_000,
    nextServiceDate: '2026-08-10', nextServiceMileage: 35_000,
    colour: 'White',
  },
  {
    id: 'fv5', fleetClientId: 'fc1',
    registration: 'LD-77-88-EE', make: 'Isuzu', model: 'D-Max', year: 2019,
    fuelType: 'Diesel', currentMileage: 143_000, assignedDriver: 'Filomena Costa',
    status: 'in_service',
    lastServiceDate: '2025-10-05', lastServiceMileage: 132_000,
    nextServiceDate: '2026-04-05', nextServiceMileage: 142_000,
    colour: 'Grey', notes: 'Currently in bay 3 — clutch replacement.',
  },
  // Odebrecht fleet ────────────────────────────────────────────────────────────
  {
    id: 'fv6', fleetClientId: 'fc2',
    registration: 'LN-10-20-FF', make: 'Mercedes-Benz', model: 'Sprinter 316', year: 2022,
    fuelType: 'Diesel', currentMileage: 68_000, assignedDriver: 'Jair Rodrigues',
    status: 'due_soon',
    lastServiceDate: '2025-09-15', lastServiceMileage: 58_000,
    nextServiceDate: '2026-03-15', nextServiceMileage: 68_000,
    vin: 'WDB9066571P123789', colour: 'White',
  },
  {
    id: 'fv7', fleetClientId: 'fc2',
    registration: 'LN-30-40-GG', make: 'Toyota', model: 'Prado', year: 2021,
    fuelType: 'Diesel', currentMileage: 42_300,
    status: 'ok',
    lastServiceDate: '2026-01-05', lastServiceMileage: 37_000,
    nextServiceDate: '2026-07-05', nextServiceMileage: 47_000,
    colour: 'Sand',
  },
  {
    id: 'fv8', fleetClientId: 'fc2',
    registration: 'LN-50-60-HH', make: 'Ford', model: 'Transit', year: 2020,
    fuelType: 'Diesel', currentMileage: 95_600, assignedDriver: 'Celeste Neto',
    status: 'overdue',
    lastServiceDate: '2025-07-20', lastServiceMileage: 85_000,
    nextServiceDate: '2025-12-20', nextServiceMileage: 95_000,
    colour: 'White',
  },
];

// ─── Sample Maintenance Intervals ────────────────────────────────────────────

export const SAMPLE_MAINTENANCE_INTERVALS: MaintenanceInterval[] = [
  // fv1 — Toyota Hilux (overdue)
  { id: 'mi1',  vehicleId: 'fv1', task: 'Oil & Filter Change',       intervalKm: 10_000, intervalMonths: 6,  lastDoneDate: '2025-08-15', lastDoneKm: 77_000, nextDueDate: '2026-02-15', nextDueKm: 87_000,  status: 'overdue',  estimatedCostAoa: 45_000 },
  { id: 'mi2',  vehicleId: 'fv1', task: 'Tyre Rotation',              intervalKm: 15_000, intervalMonths: 6,  lastDoneDate: '2025-08-15', lastDoneKm: 77_000, nextDueDate: '2026-02-15', nextDueKm: 92_000,  status: 'overdue',  estimatedCostAoa: 18_000 },
  { id: 'mi3',  vehicleId: 'fv1', task: 'Air Filter',                 intervalKm: 20_000, intervalMonths: 12, lastDoneDate: '2025-02-10', lastDoneKm: 67_000, nextDueDate: '2026-02-10', nextDueKm: 87_000,  status: 'overdue',  estimatedCostAoa: 12_000 },
  // fv2 — Ford Ranger (due soon)
  { id: 'mi4',  vehicleId: 'fv2', task: 'Oil & Filter Change',       intervalKm: 10_000, intervalMonths: 6,  lastDoneDate: '2025-11-01', lastDoneKm: 44_500, nextDueDate: '2026-05-01', nextDueKm: 54_500,  status: 'due_soon', estimatedCostAoa: 42_000 },
  { id: 'mi5',  vehicleId: 'fv2', task: 'Brake Inspection',          intervalKm: 20_000, intervalMonths: 12, lastDoneDate: '2025-05-01', lastDoneKm: 34_000, nextDueDate: '2026-05-01', nextDueKm: 54_000,  status: 'due_soon', estimatedCostAoa: 30_000 },
  // fv3 — Mitsubishi L200 (ok)
  { id: 'mi6',  vehicleId: 'fv3', task: 'Oil & Filter Change',       intervalKm: 10_000, intervalMonths: 6,  lastDoneDate: '2026-01-20', lastDoneKm: 107_000, nextDueDate: '2026-07-20', nextDueKm: 117_000, status: 'ok',       estimatedCostAoa: 42_000 },
  { id: 'mi7',  vehicleId: 'fv3', task: 'Timing Belt Replacement',   intervalKm: 100_000,                    lastDoneDate: '2024-06-10', lastDoneKm: 80_000,  nextDueDate: '2026-12-10', nextDueKm: 180_000, status: 'ok',       estimatedCostAoa: 180_000 },
  // fv4 — Land Cruiser (ok)
  { id: 'mi8',  vehicleId: 'fv4', task: 'Oil & Filter Change',       intervalKm: 10_000, intervalMonths: 6,  lastDoneDate: '2026-02-10', lastDoneKm: 25_000,  nextDueDate: '2026-08-10', nextDueKm: 35_000,  status: 'ok',       estimatedCostAoa: 52_000 },
  { id: 'mi9',  vehicleId: 'fv4', task: 'Pollen Filter',             intervalKm: 15_000, intervalMonths: 12, lastDoneDate: '2026-02-10', lastDoneKm: 25_000,  nextDueDate: '2027-02-10', nextDueKm: 40_000,  status: 'ok',       estimatedCostAoa: 14_000 },
  // fv5 — Isuzu D-Max (in service)
  { id: 'mi10', vehicleId: 'fv5', task: 'Clutch Replacement',                            intervalMonths: 48, lastDoneDate: '2022-03-01', lastDoneKm: 60_000,  nextDueDate: '2026-03-01', nextDueKm: 140_000, status: 'overdue',  estimatedCostAoa: 320_000 },
  { id: 'mi11', vehicleId: 'fv5', task: 'Oil & Filter Change',       intervalKm: 10_000, intervalMonths: 6,  lastDoneDate: '2025-10-05', lastDoneKm: 132_000, nextDueDate: '2026-04-05', nextDueKm: 142_000, status: 'due_soon', estimatedCostAoa: 42_000 },
  // fv6 — MB Sprinter (due soon)
  { id: 'mi12', vehicleId: 'fv6', task: 'Oil & Filter Change',       intervalKm: 10_000, intervalMonths: 6,  lastDoneDate: '2025-09-15', lastDoneKm: 58_000,  nextDueDate: '2026-03-15', nextDueKm: 68_000,  status: 'due_soon', estimatedCostAoa: 55_000 },
  { id: 'mi13', vehicleId: 'fv6', task: 'AdBlue Top-up',                                 intervalMonths: 3,  lastDoneDate: '2025-12-15', lastDoneKm: 62_000,  nextDueDate: '2026-03-15', nextDueKm: 68_000,  status: 'due_soon', estimatedCostAoa: 8_000  },
  // fv8 — Ford Transit (overdue)
  { id: 'mi14', vehicleId: 'fv8', task: 'Oil & Filter Change',       intervalKm: 10_000, intervalMonths: 6,  lastDoneDate: '2025-07-20', lastDoneKm: 85_000,  nextDueDate: '2025-12-20', nextDueKm: 95_000,  status: 'overdue',  estimatedCostAoa: 42_000 },
  { id: 'mi15', vehicleId: 'fv8', task: 'Annual Road-Worthiness',                        intervalMonths: 12, lastDoneDate: '2025-01-20', lastDoneKm: 75_000,  nextDueDate: '2026-01-20', nextDueKm: 95_000,  status: 'overdue',  estimatedCostAoa: 25_000 },
];

// ─── Sample Cost Entries ──────────────────────────────────────────────────────

export const SAMPLE_FLEET_COSTS: FleetCostEntry[] = [
  { id: 'ce1',  vehicleId: 'fv1', date: '2025-08-15', category: 'Oil & Fluids', description: 'Oil & filter service',           labourCost: 15_000, partsCost: 30_000,  totalCost: 45_000,  odometer: 77_000, invoiceRef: 'FT0901', technicianName: 'Paulo M.' },
  { id: 'ce2',  vehicleId: 'fv1', date: '2025-08-15', category: 'Tyres',        description: 'Front tyre pair replacement',    labourCost: 12_000, partsCost: 96_000,  totalCost: 108_000, odometer: 77_000, invoiceRef: 'FT0902', technicianName: 'Paulo M.' },
  { id: 'ce3',  vehicleId: 'fv2', date: '2025-11-01', category: 'Oil & Fluids', description: 'Oil service + air filter',       labourCost: 15_000, partsCost: 27_000,  totalCost: 42_000,  odometer: 44_500, invoiceRef: 'FT1101', technicianName: 'Carlos T.' },
  { id: 'ce4',  vehicleId: 'fv3', date: '2026-01-20', category: 'Oil & Fluids', description: 'Full service',                   labourCost: 18_000, partsCost: 24_000,  totalCost: 42_000,  odometer: 107_000, invoiceRef: 'FT0126', technicianName: 'Paulo M.' },
  { id: 'ce5',  vehicleId: 'fv3', date: '2025-06-10', category: 'Parts',        description: 'Front brake pads & discs',       labourCost: 25_000, partsCost: 75_000,  totalCost: 100_000, odometer: 98_000, invoiceRef: 'FT0613' },
  { id: 'ce6',  vehicleId: 'fv4', date: '2026-02-10', category: 'Oil & Fluids', description: 'Oil service + pollen filter',    labourCost: 20_000, partsCost: 32_000,  totalCost: 52_000,  odometer: 25_000, invoiceRef: 'FT0215', technicianName: 'Rui A.' },
  { id: 'ce7',  vehicleId: 'fv5', date: '2025-10-05', category: 'Oil & Fluids', description: 'Oil service',                   labourCost: 15_000, partsCost: 27_000,  totalCost: 42_000,  odometer: 132_000, invoiceRef: 'FT1005' },
  { id: 'ce8',  vehicleId: 'fv5', date: '2026-03-10', category: 'Labour',       description: 'Clutch kit replacement',         labourCost: 180_000, partsCost: 140_000, totalCost: 320_000, odometer: 143_000, invoiceRef: 'FT0310', technicianName: 'Carlos T.' },
  { id: 'ce9',  vehicleId: 'fv6', date: '2025-09-15', category: 'Oil & Fluids', description: 'Service A + AdBlue',            labourCost: 20_000, partsCost: 35_000,  totalCost: 55_000,  odometer: 58_000, invoiceRef: 'FT0916' },
  { id: 'ce10', vehicleId: 'fv7', date: '2026-01-05', category: 'Oil & Fluids', description: 'Oil service',                   labourCost: 18_000, partsCost: 26_000,  totalCost: 44_000,  odometer: 37_000, invoiceRef: 'FT0107' },
  { id: 'ce11', vehicleId: 'fv8', date: '2025-07-20', category: 'Oil & Fluids', description: 'Oil service',                   labourCost: 15_000, partsCost: 27_000,  totalCost: 42_000,  odometer: 85_000, invoiceRef: 'FT0720' },
  { id: 'ce12', vehicleId: 'fv8', date: '2025-03-10', category: 'Bodywork',     description: 'Rear panel dent repair + paint', labourCost: 60_000, partsCost: 40_000,  totalCost: 100_000, odometer: 79_000, invoiceRef: 'FT0311' },
  { id: 'ce13', vehicleId: 'fv1', date: '2025-03-05', category: 'Inspection',   description: 'Annual road-worthiness check',   labourCost: 10_000, partsCost: 15_000,  totalCost: 25_000,  odometer: 66_000, invoiceRef: 'FT0306' },
  { id: 'ce14', vehicleId: 'fv2', date: '2025-06-20', category: 'Tyres',        description: '4× all-terrain tyres',           labourCost: 20_000, partsCost: 180_000, totalCost: 200_000, odometer: 39_000, invoiceRef: 'FT0621' },
  { id: 'ce15', vehicleId: 'fv3', date: '2025-09-01', category: 'Parts',        description: 'Shock absorber set (front)',      labourCost: 30_000, partsCost: 85_000,  totalCost: 115_000, odometer: 102_000, invoiceRef: 'FT0901' },
];
