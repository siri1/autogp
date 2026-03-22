export type Role =
  | 'admin'
  | 'service_advisor'
  | 'mechanic'
  | 'parts_staff'
  | 'accountant'
  | 'manager';

export type ModuleId =
  | 'dashboard'
  | 'workflow'
  | 'appointments'
  | 'inspection'
  | 'clocking'
  | 'customers'
  | 'vehicles'
  | 'in-service'
  | 'quotations'
  | 'parts'
  | 'maintenance'
  | 'kpis'
  | 'reporting'
  | 'accounting'
  | 'settings'
  | 'users';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  password: string; // plain text for demo only
}

// Which modules each role can access
export const ROLE_MODULES: Record<Role, ModuleId[] | 'all'> = {
  admin: 'all',
  service_advisor: [
    'dashboard',
    'appointments',
    'inspection',
    'customers',
    'vehicles',
    'in-service',
    'quotations',
    'maintenance',
  ],
  mechanic: ['clocking'],
  parts_staff: ['parts', 'maintenance'],
  accountant: ['dashboard', 'accounting', 'quotations', 'reporting'],
  manager: ['dashboard', 'workflow', 'kpis', 'reporting', 'customers', 'vehicles', 'in-service'],
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  service_advisor: 'Service Advisor',
  mechanic: 'Mechanic',
  parts_staff: 'Parts Staff',
  accountant: 'Accountant',
  manager: 'Manager',
};

export const ROLE_COLORS: Record<Role, string> = {
  admin:           'bg-red-100 text-red-700 border-red-200',
  service_advisor: 'bg-blue-100 text-blue-700 border-blue-200',
  mechanic:        'bg-amber-100 text-amber-700 border-amber-200',
  parts_staff:     'bg-purple-100 text-purple-700 border-purple-200',
  accountant:      'bg-emerald-100 text-emerald-700 border-emerald-200',
  manager:         'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export const SAMPLE_USERS: AppUser[] = [
  { id: 'u1', name: 'Admin User',       email: 'admin@autogp.ao',    role: 'admin',           password: 'admin123' },
  { id: 'u2', name: 'Carlos Mendes',    email: 'carlos@autogp.ao',   role: 'service_advisor', password: 'advisor123' },
  { id: 'u3', name: 'João Ferreira',    email: 'joao@autogp.ao',     role: 'mechanic',        password: 'mech123' },
  { id: 'u4', name: 'Ana Pereira',      email: 'ana@autogp.ao',      role: 'parts_staff',     password: 'parts123' },
  { id: 'u5', name: 'Maria Santos',     email: 'maria@autogp.ao',    role: 'accountant',      password: 'acct123' },
  { id: 'u6', name: 'Paulo Rodrigues',  email: 'paulo@autogp.ao',    role: 'manager',         password: 'mgr123' },
];

export function canAccess(user: AppUser, module: ModuleId): boolean {
  const allowed = ROLE_MODULES[user.role];
  if (allowed === 'all') return true;
  return allowed.includes(module);
}

export function getAllModules(): ModuleId[] {
  return [
    'dashboard', 'workflow', 'appointments', 'inspection', 'clocking',
    'customers', 'vehicles', 'in-service', 'quotations', 'parts',
    'maintenance', 'kpis', 'reporting', 'accounting', 'settings', 'users',
  ];
}
