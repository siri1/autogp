'use client';

import { useState, useMemo } from 'react';
import {
  SAMPLE_TENANTS,
  PLAN_CONFIG,
  STATUS_CONFIG,
  getPlatformMetrics,
  type Tenant,
  type SubscriptionPlan,
  type TenantStatus,
} from '@/lib/tenants';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Plus,
  Search,
  LogOut,
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  Clock,
  ChevronRight,
  X,
  Edit2,
  Ban,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Package,
  Eye,
  EyeOff,
  Wrench,
  LayoutDashboard,
  Filter,
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function planBadge(plan: SubscriptionPlan) {
  const c = PLAN_CONFIG[plan];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.color} ${c.textColor}`}>
      {c.label}
    </span>
  );
}

function statusBadge(status: TenantStatus) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.color} ${c.textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500' : status === 'trial' ? 'bg-sky-500' : status === 'suspended' ? 'bg-red-500' : 'bg-slate-400'}`} />
      {c.label}
    </span>
  );
}

// ── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  title, value, sub, icon: Icon, color,
}: { title: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Create / Edit tenant dialog ───────────────────────────────────────────────
const BLANK: Omit<Tenant, 'id' | 'userCount' | 'maxUsers' | 'monthlyFee'> = {
  name: '', slug: '', country: 'Angola', city: '', phone: '', email: '',
  adminName: '', plan: 'trial', status: 'trial', createdAt: new Date().toISOString().split('T')[0],
  trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  notes: '',
};

function TenantDialog({
  mode, tenant, onSave, onClose,
}: {
  mode: 'create' | 'edit';
  tenant?: Tenant;
  onSave: (t: Tenant) => void;
  onClose: () => void;
}) {
  const defaultPlan: SubscriptionPlan = mode === 'edit' && tenant ? tenant.plan : 'trial';
  const planCfg = PLAN_CONFIG[defaultPlan];

  const [form, setForm] = useState<Omit<Tenant, 'id' | 'userCount' | 'maxUsers' | 'monthlyFee'>>(
    mode === 'edit' && tenant
      ? { name: tenant.name, slug: tenant.slug, country: tenant.country, city: tenant.city,
          phone: tenant.phone, email: tenant.email, adminName: tenant.adminName,
          plan: tenant.plan, status: tenant.status, createdAt: tenant.createdAt,
          trialEndsAt: tenant.trialEndsAt, notes: tenant.notes }
      : { ...BLANK },
  );
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())      e.name      = 'Business name is required';
    if (!form.slug.trim())      e.slug      = 'Slug is required';
    if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Slug: lowercase letters, numbers, hyphens only';
    if (!form.email.trim())     e.email     = 'Admin email is required';
    if (!form.adminName.trim()) e.adminName = 'Admin name is required';
    if (mode === 'create' && !adminPass) e.adminPass = 'Admin password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const plan = form.plan as SubscriptionPlan;
    const cfg  = PLAN_CONFIG[plan];
    onSave({
      ...form,
      id:          mode === 'edit' && tenant ? tenant.id : `tenant-${Date.now()}`,
      userCount:   mode === 'edit' && tenant ? tenant.userCount : 1,
      maxUsers:    cfg.maxUsers,
      monthlyFee:  cfg.monthlyFee,
    } as Tenant);
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {mode === 'create' ? 'Create New Instance' : 'Edit Instance'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'create' ? 'Provision a new workshop tenant' : 'Update tenant configuration'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Business info */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Business Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Business Name *</label>
                <Input
                  value={form.name}
                  onChange={e => {
                    set('name', e.target.value);
                    if (!form.slug || form.slug === autoSlug(form.name)) set('slug', autoSlug(e.target.value));
                  }}
                  placeholder="e.g. Luanda Auto Center"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Slug / Identifier *</label>
                <Input
                  value={form.slug}
                  onChange={e => set('slug', e.target.value.toLowerCase())}
                  placeholder="luanda-auto"
                />
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                <p className="text-[10px] text-slate-400 mt-0.5">Used as the tenant URL segment</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Country</label>
                <Input value={form.country} onChange={e => set('country', e.target.value)} placeholder="Angola" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Luanda" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+244 923 000 000" />
              </div>
            </div>
          </section>

          {/* Admin account */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Admin Account</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Admin Full Name *</label>
                <Input value={form.adminName} onChange={e => set('adminName', e.target.value)} placeholder="Ricardo Silva" />
                {errors.adminName && <p className="text-red-500 text-xs mt-1">{errors.adminName}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Admin Email *</label>
                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="admin@business.ao" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {mode === 'create' ? 'Initial Password *' : 'Reset Password (leave blank to keep)'}
                </label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    placeholder={mode === 'create' ? 'Set admin password' : 'New password…'}
                    className="pr-9"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.adminPass && <p className="text-red-500 text-xs mt-1">{errors.adminPass}</p>}
              </div>
            </div>
          </section>

          {/* Subscription */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Subscription Plan</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(Object.keys(PLAN_CONFIG) as SubscriptionPlan[]).map(plan => {
                const cfg = PLAN_CONFIG[plan];
                const sel = form.plan === plan;
                return (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => set('plan', plan)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      sel ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-sm text-slate-800 mb-1">{cfg.label}</div>
                    <div className="text-xs text-slate-500 mb-2">
                      {cfg.monthlyFee === 0 ? 'Free' : `$${cfg.monthlyFee}/mo`}
                    </div>
                    <div className="text-[10px] text-slate-400 space-y-0.5">
                      {cfg.features.slice(0, 2).map(f => (
                        <div key={f} className="flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {form.plan === 'trial' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">Trial Ends</label>
                <Input type="date" value={form.trialEndsAt ?? ''} onChange={e => set('trialEndsAt', e.target.value)} className="w-48" />
              </div>
            )}
          </section>

          {/* Status (edit only) */}
          {mode === 'edit' && (
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Status</h3>
              <div className="flex gap-2 flex-wrap">
                {(['active', 'trial', 'suspended', 'expired'] as TenantStatus[]).map(s => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <button key={s} type="button" onClick={() => set('status', s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                        form.status === s ? 'border-blue-500 ' + cfg.color + ' ' + cfg.textColor : 'border-transparent ' + cfg.color + ' ' + cfg.textColor + ' opacity-60'
                      }`}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Notes */}
          <section>
            <label className="block text-xs font-medium text-slate-600 mb-1">Internal Notes</label>
            <textarea
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              placeholder="Optional notes for internal use…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            {mode === 'create' ? 'Create Instance' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Tenant detail side panel ──────────────────────────────────────────────────
function TenantDetail({ tenant, onEdit, onClose, onSuspend, onActivate, onDelete }: {
  tenant: Tenant;
  onEdit: () => void;
  onClose: () => void;
  onSuspend: () => void;
  onActivate: () => void;
  onDelete: () => void;
}) {
  const plan = PLAN_CONFIG[tenant.plan];
  const usedPct = Math.min(100, Math.round((tenant.userCount / tenant.maxUsers) * 100));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
            {initials(tenant.name)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">{tenant.name}</h3>
            <p className="text-xs text-slate-400">{tenant.slug}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusBadge(tenant.status)}
          {planBadge(tenant.plan)}
          {tenant.monthlyFee > 0 && (
            <span className="text-xs text-slate-500 font-medium">${tenant.monthlyFee}/mo</span>
          )}
        </div>

        {/* Info grid */}
        <div className="space-y-2">
          {[
            { icon: MapPin,    label: 'Location',     value: `${tenant.city}, ${tenant.country}` },
            { icon: Mail,      label: 'Email',        value: tenant.email },
            { icon: Phone,     label: 'Phone',        value: tenant.phone },
            { icon: Users,     label: 'Admin',        value: tenant.adminName },
            { icon: Calendar,  label: 'Created',      value: tenant.createdAt },
            ...(tenant.trialEndsAt ? [{ icon: Clock, label: 'Trial ends', value: tenant.trialEndsAt }] : []),
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <Icon className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">{label}</span>
                <span className="text-xs text-slate-700 font-medium break-all">{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* User seats */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-medium">User Seats</span>
            <span className="text-slate-500">
              {tenant.userCount} / {tenant.maxUsers === 999 ? '∞' : tenant.maxUsers}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usedPct >= 90 ? 'bg-red-400' : usedPct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${tenant.maxUsers === 999 ? 10 : usedPct}%` }}
            />
          </div>
        </div>

        {/* Plan features */}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">Plan Features</p>
          <ul className="space-y-1">
            {plan.features.map(f => (
              <li key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Notes */}
        {tenant.notes && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Notes</p>
            <p className="text-xs text-amber-800">{tenant.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-5 border-t border-slate-100 space-y-2">
        <Button onClick={onEdit} variant="outline" className="w-full justify-start gap-2 text-sm h-9">
          <Edit2 className="h-3.5 w-3.5" /> Edit Instance
        </Button>
        {tenant.status === 'active' || tenant.status === 'trial' ? (
          <Button onClick={onSuspend} variant="outline" className="w-full justify-start gap-2 text-sm h-9 text-red-600 border-red-200 hover:bg-red-50">
            <Ban className="h-3.5 w-3.5" /> Suspend
          </Button>
        ) : (
          <Button onClick={onActivate} variant="outline" className="w-full justify-start gap-2 text-sm h-9 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
            <CheckCircle2 className="h-3.5 w-3.5" /> Activate
          </Button>
        )}
        <Button onClick={onDelete} variant="outline" className="w-full justify-start gap-2 text-sm h-9 text-slate-500 hover:text-red-600 hover:border-red-200">
          <Trash2 className="h-3.5 w-3.5" /> Delete Instance
        </Button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TenantManagement() {
  const { user, logout } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>(SAMPLE_TENANTS);
  const [search, setSearch]   = useState('');
  const [filterPlan, setFilterPlan]     = useState<SubscriptionPlan | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TenantStatus | 'all'>('all');
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [dialogMode, setDialogMode]     = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget]     = useState<Tenant | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const metrics = useMemo(() => getPlatformMetrics(tenants), [tenants]);

  const filtered = useMemo(() => {
    return tenants.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        t.name.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.adminName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q);
      const matchPlan   = filterPlan   === 'all' || t.plan   === filterPlan;
      const matchStatus = filterStatus === 'all' || t.status === filterStatus;
      return matchSearch && matchPlan && matchStatus;
    });
  }, [tenants, search, filterPlan, filterStatus]);

  const selected = tenants.find(t => t.id === selectedId) ?? null;

  const saveTenant = (t: Tenant) => {
    setTenants(prev => {
      const idx = prev.findIndex(x => x.id === t.id);
      if (idx === -1) return [...prev, t];
      const next = [...prev];
      next[idx] = t;
      return next;
    });
    setDialogMode(null);
    setEditTarget(null);
    setSelectedId(t.id);
  };

  const setStatus = (id: string, status: TenantStatus) =>
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status } : t));

  const deleteTenant = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Top nav ── */}
      <header className="bg-slate-950 text-white px-6 py-3.5 flex items-center justify-between shadow-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow shadow-blue-500/40">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight">AutoGP</span>
            <span className="ml-2 text-xs text-slate-400 font-medium">Platform Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold">
              {initials(user?.name ?? 'SA')}
            </div>
            <span className="text-slate-200 hidden sm:block">{user?.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium">Super Admin</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-56 bg-white border-r border-slate-100 flex flex-col shadow-sm flex-shrink-0">
          <nav className="p-3 space-y-0.5 flex-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform</div>
            <NavItem icon={LayoutDashboard} label="Overview" active />
            <NavItem icon={Building2} label="Instances" count={metrics.total} active={false} />
          </nav>
          {/* MRR callout */}
          <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-0.5">Monthly Revenue</p>
            <p className="text-xl font-bold">${metrics.mrr.toLocaleString()}</p>
            <p className="text-[10px] opacity-60 mt-0.5">{metrics.active} paying tenants</p>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">

            {/* KPI strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <KpiCard title="Total Instances" value={metrics.total} icon={Building2} color="bg-blue-100 text-blue-600" />
              <KpiCard title="Active" value={metrics.active} icon={Activity} color="bg-emerald-100 text-emerald-600" />
              <KpiCard title="Trial" value={metrics.trial} icon={Clock} color="bg-sky-100 text-sky-600" />
              <KpiCard title="Suspended" value={metrics.suspended} icon={AlertTriangle} color="bg-red-100 text-red-600" />
              <KpiCard title="Total Users" value={metrics.totalUsers} icon={Users} color="bg-violet-100 text-violet-600" />
              <KpiCard title="MRR" value={`$${metrics.mrr}`} sub="USD / month" icon={DollarSign} color="bg-amber-100 text-amber-600" />
            </div>

            {/* Plan breakdown */}
            <div className="grid grid-cols-4 gap-3">
              {(Object.keys(PLAN_CONFIG) as SubscriptionPlan[]).map(plan => {
                const count = tenants.filter(t => t.plan === plan && t.status !== 'suspended').length;
                const cfg   = PLAN_CONFIG[plan];
                return (
                  <button
                    key={plan}
                    onClick={() => setFilterPlan(filterPlan === plan ? 'all' : plan)}
                    className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm ${
                      filterPlan === plan ? 'border-blue-500 shadow-sm' : 'border-transparent bg-white'
                    }`}
                  >
                    <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${cfg.color} ${cfg.textColor}`}>
                      {cfg.label}
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{count}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {cfg.monthlyFee > 0 ? `$${cfg.monthlyFee}/mo each` : 'Free'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search tenants…"
                  className="pl-9 h-9"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as TenantStatus | 'all')}
                className="h-9 rounded-lg border border-slate-200 px-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="expired">Expired</option>
              </select>
              {(search || filterPlan !== 'all' || filterStatus !== 'all') && (
                <Button variant="outline" size="sm" className="h-9 gap-1.5"
                  onClick={() => { setSearch(''); setFilterPlan('all'); setFilterStatus('all'); }}>
                  <X className="h-3.5 w-3.5" /> Clear
                </Button>
              )}
              <Button
                onClick={() => { setDialogMode('create'); setEditTarget(null); }}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white gap-1.5 ml-auto"
              >
                <Plus className="h-4 w-4" /> New Instance
              </Button>
            </div>

            {/* Table + detail panel */}
            <div className="flex gap-4 items-start">
              {/* Table */}
              <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Business</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Location</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Users</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">MRR</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                            No instances match your filters.
                          </td>
                        </tr>
                      )}
                      {filtered.map(t => (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                          className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                            selectedId === t.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                                {initials(t.name)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 text-sm">{t.name}</div>
                                <div className="text-[11px] text-slate-400">{t.adminName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">{planBadge(t.plan)}</td>
                          <td className="px-4 py-3.5">{statusBadge(t.status)}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-500 hidden md:table-cell">
                            {t.city}, {t.country}
                          </td>
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-700">{t.userCount}</span>
                              <div className="flex-1 w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    t.maxUsers === 999 ? 'bg-blue-400 w-1/5' :
                                    (t.userCount / t.maxUsers) >= 0.9 ? 'bg-red-400' :
                                    (t.userCount / t.maxUsers) >= 0.7 ? 'bg-amber-400' : 'bg-emerald-400'
                                  }`}
                                  style={{ width: t.maxUsers === 999 ? '15%' : `${Math.min(100, (t.userCount / t.maxUsers) * 100)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-400">{t.maxUsers === 999 ? '∞' : t.maxUsers}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <span className={`text-xs font-semibold ${t.monthlyFee > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
                              {t.monthlyFee > 0 ? `$${t.monthlyFee}` : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <ChevronRight className={`h-4 w-4 transition-transform ${selectedId === t.id ? 'rotate-90 text-blue-500' : 'text-slate-300'}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-slate-50 bg-slate-50/50 text-xs text-slate-400">
                  Showing {filtered.length} of {tenants.length} instances
                </div>
              </div>

              {/* Detail panel */}
              {selected && (
                <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <TenantDetail
                    tenant={selected}
                    onEdit={() => { setEditTarget(selected); setDialogMode('edit'); }}
                    onClose={() => setSelectedId(null)}
                    onSuspend={() => { setStatus(selected.id, 'suspended'); setSelectedId(null); }}
                    onActivate={() => { setStatus(selected.id, 'active'); }}
                    onDelete={() => setDeleteConfirm(selected.id)}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Create / Edit dialog ── */}
      {dialogMode && (
        <TenantDialog
          mode={dialogMode}
          tenant={editTarget ?? undefined}
          onSave={saveTenant}
          onClose={() => { setDialogMode(null); setEditTarget(null); }}
        />
      )}

      {/* ── Delete confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Delete Instance?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              All data for <strong>{tenants.find(t => t.id === deleteConfirm)?.name}</strong> will be permanently removed.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => deleteTenant(deleteConfirm)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small helper nav item
function NavItem({ icon: Icon, label, active, count }: { icon: React.ElementType; label: string; active: boolean; count?: number }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
      active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
          {count}
        </span>
      )}
    </div>
  );
}
