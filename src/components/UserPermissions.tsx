'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  type AppUser,
  type Role,
  type ModuleId,
  ROLE_LABELS,
  ROLE_COLORS,
  ROLE_MODULES,
  getAllModules,
  canAccess,
  SAMPLE_USERS,
} from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  Key,
  Lock,
} from 'lucide-react';

const ALL_ROLES: Role[] = ['admin', 'service_advisor', 'mechanic', 'parts_staff', 'accountant', 'manager'];

const MODULE_LABELS: Record<ModuleId, string> = {
  dashboard:    'Dashboard',
  workflow:     'Workflow',
  appointments: 'Appointments',
  inspection:   'Walk-Around Inspection',
  clocking:     'Clocking System',
  customers:    'Customers (CRM)',
  vehicles:     'Vehicle Database',
  'in-service': 'Vehicles In Service',
  quotations:   'Quotations & Jobs',
  parts:        'Parts Inventory',
  maintenance:  'Maintenance Packs',
  kpis:         'Workshop KPIs',
  reporting:    'Reports & Analytics',
  accounting:   'Accounting',
  settings:     'Settings',
  users:        'User & Permissions',
  branches:     'Branches & Garages',
  tenants:      'Platform Instances',
};

const MODULE_GROUPS: { label: string; modules: ModuleId[] }[] = [
  { label: 'Core',       modules: ['dashboard', 'workflow'] },
  { label: 'Workshop',   modules: ['appointments', 'inspection', 'clocking', 'in-service'] },
  { label: 'Customer',   modules: ['customers', 'vehicles', 'quotations'] },
  { label: 'Inventory',  modules: ['parts', 'maintenance'] },
  { label: 'Finance',    modules: ['accounting', 'reporting', 'kpis'] },
  { label: 'System',     modules: ['settings', 'users'] },
];

const blank: Omit<AppUser, 'id'> = { name: '', email: '', role: 'mechanic', password: '' };

export default function UserPermissions() {
  const { allUsers, setAllUsers, user: currentUser } = useAuth();
  const [tab, setTab]           = useState('users');
  const [search, setSearch]     = useState('');
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [form, setForm]         = useState<Omit<AppUser, 'id'>>(blank);
  const [isNew, setIsNew]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AppUser | null>(null);

  const filtered = allUsers.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      ROLE_LABELS[u.role].toLowerCase().includes(search.toLowerCase()),
  );

  const openNew = () => {
    setForm(blank);
    setIsNew(true);
    setEditUser({ id: '', ...blank });
  };

  const openEdit = (u: AppUser) => {
    setForm({ name: u.name, email: u.email, role: u.role, password: u.password });
    setIsNew(false);
    setEditUser(u);
  };

  const saveUser = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;
    if (isNew) {
      const newUser: AppUser = { id: `u${Date.now()}`, ...form };
      setAllUsers(prev => [...prev, newUser]);
    } else if (editUser) {
      setAllUsers(prev =>
        prev.map(u => (u.id === editUser.id ? { ...u, ...form } : u)),
      );
    }
    setEditUser(null);
  };

  const deleteUser = (u: AppUser) => {
    setAllUsers(prev => prev.filter(x => x.id !== u.id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Users &amp; Permissions
          </h1>
          <p className="text-slate-500 mt-1">Manage system users and their role-based access</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {ALL_ROLES.map(role => {
          const count = allUsers.filter(u => u.role === role).length;
          return (
            <Card key={role} className="text-center p-4">
              <div className="text-2xl font-bold text-slate-900">{count}</div>
              <Badge className={`mt-1 text-xs border ${ROLE_COLORS[role]}`}>{ROLE_LABELS[role]}</Badge>
            </Card>
          );
        })}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-1.5" /> Users
          </TabsTrigger>
          <TabsTrigger value="matrix">
            <Lock className="h-4 w-4 mr-1.5" /> Permission Matrix
          </TabsTrigger>
        </TabsList>

        {/* ── USERS TAB ── */}
        <TabsContent value="users" className="mt-4">
          <div className="flex items-center justify-between mb-4 gap-3">
            <Input
              placeholder="Search users…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-1.5" /> Add User
            </Button>
          </div>

          <div className="grid gap-3">
            {filtered.map(u => (
              <Card key={u.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          {u.name}
                          {u.id === currentUser?.id && (
                            <Badge className="text-[10px] bg-blue-100 text-blue-700 border border-blue-200">You</Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-500">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`border ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(u)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDelete(u)}
                          disabled={u.id === currentUser?.id}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Access summary */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {u.role === 'admin'
                      ? <Badge className="text-[10px] bg-red-50 text-red-700 border border-red-200">Full access — all modules</Badge>
                      : (ROLE_MODULES[u.role] as ModuleId[]).map(m => (
                          <Badge key={m} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                            {MODULE_LABELS[m]}
                          </Badge>
                        ))
                    }
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── PERMISSION MATRIX TAB ── */}
        <TabsContent value="matrix" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                Role Permission Matrix
              </CardTitle>
              <CardDescription>Which modules each role can access. Admin has full access to everything.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 font-semibold text-slate-700 min-w-[160px]">Module</th>
                    {ALL_ROLES.map(role => (
                      <th key={role} className="text-center py-2 px-3 font-semibold min-w-[110px]">
                        <Badge className={`border ${ROLE_COLORS[role]} text-xs`}>{ROLE_LABELS[role]}</Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULE_GROUPS.map(group => (
                    <>
                      <tr key={group.label}>
                        <td
                          colSpan={ALL_ROLES.length + 1}
                          className="pt-4 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider"
                        >
                          {group.label}
                        </td>
                      </tr>
                      {group.modules.map(moduleId => {
                        const dummyUser = (role: Role): AppUser => ({
                          id: '', name: '', email: '', role, password: '',
                        });
                        return (
                          <tr key={moduleId} className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="py-2 pr-4 text-slate-700">{MODULE_LABELS[moduleId]}</td>
                            {ALL_ROLES.map(role => {
                              const allowed = canAccess(dummyUser(role), moduleId);
                              return (
                                <td key={role} className="text-center py-2 px-3">
                                  {allowed
                                    ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                                    : <XCircle    className="h-4 w-4 text-slate-200 mx-auto" />
                                  }
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Edit / Create Dialog ── */}
      <Dialog open={!!editUser} onOpenChange={open => { if (!open) setEditUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Add New User' : 'Edit User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="João Silva"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="joao@autogp.ao"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ALL_ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <Input
                type="text"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Set password"
              />
              <p className="text-xs text-slate-400 mt-1">Demo system — passwords are stored in plaintext.</p>
            </div>

            {/* Role access preview */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">Module access for this role:</p>
              {form.role === 'admin'
                ? <p className="text-xs text-red-700 font-medium">Full access — all modules</p>
                : <div className="flex flex-wrap gap-1">
                    {(ROLE_MODULES[form.role] as ModuleId[]).map(m => (
                      <Badge key={m} className="text-[10px] bg-white border border-slate-200 text-slate-600">
                        {MODULE_LABELS[m]}
                      </Badge>
                    ))}
                  </div>
              }
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button
              onClick={saveUser}
              disabled={!form.name.trim() || !form.email.trim() || !form.password.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isNew ? 'Create User' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!confirmDelete} onOpenChange={open => { if (!open) setConfirmDelete(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 py-2">
            Are you sure you want to delete <strong>{confirmDelete?.name}</strong>? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => confirmDelete && deleteUser(confirmDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
