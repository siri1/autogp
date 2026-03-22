/**
 * Multi-tenant data model for the AutoGP platform.
 * SuperAdmin manages these instances; each tenant is an independent workshop business.
 */

export type SubscriptionPlan = 'trial' | 'basic' | 'professional' | 'enterprise';
export type TenantStatus = 'active' | 'trial' | 'suspended' | 'expired';

export interface Tenant {
  id: string;
  name: string;             // Business display name
  slug: string;             // URL-safe identifier
  country: string;
  city: string;
  phone: string;
  email: string;            // Primary contact / admin email
  adminName: string;        // Name of the tenant admin user
  plan: SubscriptionPlan;
  status: TenantStatus;
  createdAt: string;        // ISO date
  trialEndsAt?: string;     // ISO date (trial tenants)
  userCount: number;        // Seats currently in use
  maxUsers: number;         // Seat limit for plan
  monthlyFee: number;       // USD
  notes?: string;
  logo?: string;            // URL or initials fallback
}

export interface PlanConfig {
  label: string;
  monthlyFee: number;       // USD
  maxUsers: number;
  features: string[];
  color: string;            // Tailwind bg class for badge
  textColor: string;
}

export const PLAN_CONFIG: Record<SubscriptionPlan, PlanConfig> = {
  trial: {
    label: 'Trial',
    monthlyFee: 0,
    maxUsers: 3,
    features: ['Core workshop modules', 'Up to 3 users', '14-day trial'],
    color: 'bg-slate-100',
    textColor: 'text-slate-600',
  },
  basic: {
    label: 'Basic',
    monthlyFee: 49,
    maxUsers: 5,
    features: ['Core workshop modules', 'Appointments & jobs', 'Up to 5 users', 'Email support'],
    color: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  professional: {
    label: 'Professional',
    monthlyFee: 149,
    maxUsers: 15,
    features: ['All modules', 'Advanced reporting', 'Accounting & KPIs', 'Up to 15 users', 'Priority support'],
    color: 'bg-violet-100',
    textColor: 'text-violet-700',
  },
  enterprise: {
    label: 'Enterprise',
    monthlyFee: 399,
    maxUsers: 999,
    features: ['All modules', 'Unlimited users', 'Custom integrations', 'Dedicated SLA', 'Onboarding & training'],
    color: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
};

export const STATUS_CONFIG: Record<TenantStatus, { label: string; color: string; textColor: string }> = {
  active:    { label: 'Active',     color: 'bg-emerald-100', textColor: 'text-emerald-700' },
  trial:     { label: 'Trial',      color: 'bg-sky-100',     textColor: 'text-sky-700' },
  suspended: { label: 'Suspended',  color: 'bg-red-100',     textColor: 'text-red-700' },
  expired:   { label: 'Expired',    color: 'bg-slate-100',   textColor: 'text-slate-500' },
};

// ── Sample tenant instances ──────────────────────────────────────────────────
export const SAMPLE_TENANTS: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'AutoGP Demo Workshop',
    slug: 'autogp-demo',
    country: 'Angola',
    city: 'Luanda',
    phone: '+244 923 100 001',
    email: 'admin@autogp.ao',
    adminName: 'Admin User',
    plan: 'professional',
    status: 'active',
    createdAt: '2025-01-15',
    userCount: 6,
    maxUsers: 15,
    monthlyFee: 149,
    notes: 'Primary demo tenant',
  },
  {
    id: 'tenant-2',
    name: 'Luanda Auto Center',
    slug: 'luanda-auto',
    country: 'Angola',
    city: 'Luanda',
    phone: '+244 923 200 002',
    email: 'manager@luandaauto.ao',
    adminName: 'Ricardo Silva',
    plan: 'enterprise',
    status: 'active',
    createdAt: '2024-11-03',
    userCount: 22,
    maxUsers: 999,
    monthlyFee: 399,
  },
  {
    id: 'tenant-3',
    name: 'Benguela Motors',
    slug: 'benguela-motors',
    country: 'Angola',
    city: 'Benguela',
    phone: '+244 912 300 003',
    email: 'admin@benguelamotors.ao',
    adminName: 'Fernanda Costa',
    plan: 'basic',
    status: 'active',
    createdAt: '2025-02-20',
    userCount: 4,
    maxUsers: 5,
    monthlyFee: 49,
  },
  {
    id: 'tenant-4',
    name: 'Lobito Service Hub',
    slug: 'lobito-service',
    country: 'Angola',
    city: 'Lobito',
    phone: '+244 931 400 004',
    email: 'info@lobitoservice.ao',
    adminName: 'José Almeida',
    plan: 'trial',
    status: 'trial',
    createdAt: '2026-03-10',
    trialEndsAt: '2026-03-24',
    userCount: 2,
    maxUsers: 3,
    monthlyFee: 0,
  },
  {
    id: 'tenant-5',
    name: 'FleetCare Angola',
    slug: 'fleetcare-ao',
    country: 'Angola',
    city: 'Luanda',
    phone: '+244 944 500 005',
    email: 'fleet@fleetcare.ao',
    adminName: 'Ana Martins',
    plan: 'enterprise',
    status: 'active',
    createdAt: '2024-08-11',
    userCount: 41,
    maxUsers: 999,
    monthlyFee: 399,
  },
  {
    id: 'tenant-6',
    name: 'Huambo Auto Tech',
    slug: 'huambo-auto',
    country: 'Angola',
    city: 'Huambo',
    phone: '+244 922 600 006',
    email: 'admin@huamboauto.ao',
    adminName: 'Pedro Neto',
    plan: 'professional',
    status: 'suspended',
    createdAt: '2025-05-07',
    userCount: 8,
    maxUsers: 15,
    monthlyFee: 149,
    notes: 'Suspended — overdue payment since Feb 2026',
  },
  {
    id: 'tenant-7',
    name: 'Cabinda Workshop',
    slug: 'cabinda-workshop',
    country: 'Angola',
    city: 'Cabinda',
    phone: '+244 916 700 007',
    email: 'ops@cabindaworkshop.ao',
    adminName: 'Mário Cunha',
    plan: 'basic',
    status: 'active',
    createdAt: '2025-09-14',
    userCount: 3,
    maxUsers: 5,
    monthlyFee: 49,
  },
  {
    id: 'tenant-8',
    name: 'Namibe Motors',
    slug: 'namibe-motors',
    country: 'Angola',
    city: 'Namibe',
    phone: '+244 933 800 008',
    email: 'admin@namibemotors.ao',
    adminName: 'Catarina Lopes',
    plan: 'trial',
    status: 'expired',
    createdAt: '2026-02-01',
    trialEndsAt: '2026-02-15',
    userCount: 1,
    maxUsers: 3,
    monthlyFee: 0,
    notes: 'Trial expired — follow up for conversion',
  },
];

// ── Derived metrics for the platform dashboard ───────────────────────────────
export function getPlatformMetrics(tenants: Tenant[]) {
  const active    = tenants.filter(t => t.status === 'active').length;
  const trial     = tenants.filter(t => t.status === 'trial').length;
  const suspended = tenants.filter(t => t.status === 'suspended').length;
  const expired   = tenants.filter(t => t.status === 'expired').length;
  const mrr       = tenants.filter(t => t.status === 'active').reduce((s, t) => s + t.monthlyFee, 0);
  const totalUsers = tenants.reduce((s, t) => s + t.userCount, 0);
  return { total: tenants.length, active, trial, suspended, expired, mrr, totalUsers };
}
