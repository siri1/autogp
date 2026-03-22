'use client';

import { useState } from 'react';
import { SAMPLE_GARAGES, type Garage, type GarageStatus } from '@/lib/garages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Users,
  Wrench,
  Star,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const STATUS_CONFIG: Record<GarageStatus, { label: string; color: string; icon: React.ElementType }> = {
  active:   { label: 'Active',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  inactive: { label: 'Inactive', color: 'bg-slate-100 text-slate-500 border-slate-200',       icon: XCircle     },
};

const blank: Omit<Garage, 'id' | 'isMain' | 'createdAt'> = {
  name: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  managerName: '',
  status: 'active',
  bayCount: 1,
  technicianCount: 1,
  notes: '',
};

export default function GarageManagement() {
  const [garages, setGarages] = useState<Garage[]>(SAMPLE_GARAGES);
  const [search, setSearch] = useState('');
  const [editGarage, setEditGarage] = useState<Garage | null>(null);
  const [form, setForm] = useState<Omit<Garage, 'id' | 'isMain' | 'createdAt'>>(blank);
  const [isNew, setIsNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Garage | null>(null);

  const filtered = garages.filter(
    g =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.city.toLowerCase().includes(search.toLowerCase()) ||
      g.managerName.toLowerCase().includes(search.toLowerCase()),
  );

  const openNew = () => {
    setForm({ ...blank });
    setIsNew(true);
    setEditGarage({ id: '', isMain: false, createdAt: '', ...blank });
  };

  const openEdit = (g: Garage) => {
    setForm({ name: g.name, address: g.address, city: g.city, phone: g.phone, email: g.email, managerName: g.managerName, status: g.status, bayCount: g.bayCount, technicianCount: g.technicianCount, notes: g.notes ?? '' });
    setIsNew(false);
    setEditGarage(g);
  };

  const save = () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) return;
    if (isNew) {
      const newGarage: Garage = {
        id: `g${Date.now()}`,
        isMain: false,
        createdAt: new Date().toISOString().slice(0, 10),
        ...form,
      };
      setGarages(prev => [...prev, newGarage]);
    } else if (editGarage) {
      setGarages(prev => prev.map(g => g.id === editGarage.id ? { ...g, ...form } : g));
    }
    setEditGarage(null);
  };

  const deleteGarage = (g: Garage) => {
    setGarages(prev => prev.filter(x => x.id !== g.id));
    setConfirmDelete(null);
  };

  const toggleStatus = (id: string) => {
    setGarages(prev =>
      prev.map(g => g.id === id ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' } : g),
    );
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const totalBays       = garages.filter(g => g.status === 'active').reduce((s, g) => s + g.bayCount, 0);
  const totalTechnicians = garages.filter(g => g.status === 'active').reduce((s, g) => s + g.technicianCount, 0);
  const activeCount     = garages.filter(g => g.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            Branches &amp; Garages
          </h1>
          <p className="text-slate-500 mt-1">Manage your workshop locations and branches</p>
        </div>
        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-1.5" /> Add Branch
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Branches', value: garages.length, color: 'text-blue-600' },
          { label: 'Active',         value: activeCount,    color: 'text-emerald-600' },
          { label: 'Total Bays',     value: totalBays,      color: 'text-violet-600' },
          { label: 'Technicians',    value: totalTechnicians, color: 'text-amber-600' },
        ].map(kpi => (
          <Card key={kpi.label} className="text-center p-4">
            <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by name, city or manager…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Garage cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(g => {
          const st = STATUS_CONFIG[g.status];
          const StatusIcon = st.icon;
          return (
            <Card key={g.id} className={`relative hover:shadow-md transition-shadow ${g.status === 'inactive' ? 'opacity-70' : ''}`}>
              {g.isMain && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] flex items-center gap-1">
                    <Star className="h-2.5 w-2.5" /> Main
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <CardTitle className="text-base font-semibold text-slate-900 leading-tight">{g.name}</CardTitle>
                    <Badge className={`mt-1 text-[10px] border ${st.color} flex items-center gap-1 w-fit`}>
                      <StatusIcon className="h-2.5 w-2.5" />
                      {st.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-2">
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                  <span>{g.address}, {g.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                  <span>{g.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                  <span className="truncate">{g.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                  <span>Manager: {g.managerName}</span>
                </div>

                <div className="flex gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                    <Wrench className="h-3 w-3 text-slate-400" />
                    {g.bayCount} bays
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                    <Users className="h-3 w-3 text-slate-400" />
                    {g.technicianCount} technicians
                  </div>
                </div>

                {g.notes && (
                  <p className="text-xs text-slate-400 italic pt-1">{g.notes}</p>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(g)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={g.status === 'active' ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}
                    onClick={() => toggleStatus(g.id)}
                  >
                    {g.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  {!g.isMain && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                      onClick={() => setConfirmDelete(g)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No branches found</p>
          <p className="text-sm">Try a different search or add a new branch.</p>
        </div>
      )}

      {/* Add / Edit dialog */}
      {editGarage !== null && (
        <Dialog open onOpenChange={() => setEditGarage(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {isNew ? 'Add New Branch' : 'Edit Branch'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Branch Name *</label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. AutoGP Viana" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">City *</label>
                  <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Address *</label>
                  <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street and number" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Phone</label>
                  <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+244 9xx xxx xxx" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                  <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="branch@autogp.ao" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Manager Name</label>
                <Input value={form.managerName} onChange={e => set('managerName', e.target.value)} placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Service Bays</label>
                  <Input type="number" min={1} value={form.bayCount} onChange={e => set('bayCount', Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Technicians</label>
                  <Input type="number" min={1} value={form.technicianCount} onChange={e => set('technicianCount', Number(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                <div className="flex gap-2">
                  {(['active', 'inactive'] as GarageStatus[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('status', s)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                        form.status === s
                          ? s === 'active'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-slate-100 border-slate-400 text-slate-700'
                          : 'border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Notes</label>
                <Input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes" />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditGarage(null)}>Cancel</Button>
              <Button
                onClick={save}
                disabled={!form.name.trim() || !form.address.trim() || !form.city.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isNew ? 'Add Branch' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <Dialog open onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-700">
                <Trash2 className="h-5 w-5" /> Delete Branch
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteGarage(confirmDelete)}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
