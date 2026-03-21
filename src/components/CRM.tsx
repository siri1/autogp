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
  Users, Search, Plus, Download, ArrowLeft, Phone, Mail, MessageCircle,
  MapPin, Building2, Star, Calendar, Edit2, Save, X, ChevronUp, ChevronDown,
  ChevronsUpDown, Car, Wrench, DollarSign, Clock, StickyNote, AlertCircle,
  PhoneCall, AtSign, User,
} from 'lucide-react';
import type { CRMCustomer, InteractionNote } from '@/lib/crm-data';
import { fullName } from '@/lib/crm-data';
import type { Vehicle, ServiceRecord } from '@/components/VehicleDatabase';
import { quickExcelExport } from '@/lib/advanced-excel-export';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<CRMCustomer['status'], string> = {
  active:      'bg-green-100 text-green-800',
  vip:         'bg-purple-100 text-purple-800',
  prospect:    'bg-blue-100 text-blue-800',
  inactive:    'bg-slate-100 text-slate-600',
  blacklisted: 'bg-red-100 text-red-800',
};

const NOTE_ICONS: Record<InteractionNote['type'], typeof PhoneCall> = {
  call:     PhoneCall,
  email:    AtSign,
  visit:    User,
  whatsapp: MessageCircle,
  note:     StickyNote,
};

const NOTE_COLORS: Record<InteractionNote['type'], string> = {
  call:     'bg-blue-100 text-blue-700',
  email:    'bg-slate-100 text-slate-700',
  visit:    'bg-green-100 text-green-700',
  whatsapp: 'bg-emerald-100 text-emerald-700',
  note:     'bg-yellow-100 text-yellow-700',
};

const fmt = (n: number) => n.toLocaleString('pt-AO', { minimumFractionDigits: 0 }) + ' Kz';

type SortKey = 'name' | 'status' | 'customerSince' | 'lastContact' | 'city';
type SortDir = 'asc' | 'desc';
const PAGE_SIZE = 25;

// ── Props ─────────────────────────────────────────────────────────────────────

interface CRMProps {
  customers: CRMCustomer[];
  onCustomersChange: (customers: CRMCustomer[]) => void;
  vehicles: Vehicle[];
  onVehiclesChange: (vehicles: Vehicle[]) => void;
  serviceRecords: ServiceRecord[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CRM({ customers, onCustomersChange, vehicles, onVehiclesChange, serviceRecords }: CRMProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CRMCustomer['status'] | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CRMCustomer | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<Partial<CRMCustomer>>({});
  const [newNote, setNewNote] = useState('');
  const [newNoteType, setNewNoteType] = useState<InteractionNote['type']>('note');
  const [newCustomer, setNewCustomer] = useState<Partial<CRMCustomer>>({ status: 'prospect', preferredContact: 'phone', tags: [] });
  const [showAssociateDialog, setShowAssociateDialog] = useState(false);
  const [associateSearch, setAssociateSearch] = useState('');

  // ── Derived data ────────────────────────────────────────────────────────────

  const customerVehicles = (customerId: number) =>
    vehicles.filter(v => v.ownerId === customerId);

  const customerServiceRecords = (customerId: number) => {
    const vIds = customerVehicles(customerId).map(v => v.id);
    return serviceRecords
      .filter(r => vIds.includes(r.vehicleId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const customerTotalSpent = (customerId: number) =>
    customerServiceRecords(customerId)
      .filter(r => r.status === 'invoiced' || r.status === 'completed')
      .reduce((s, r) => s + r.total, 0);

  // ── List filtering / sorting ────────────────────────────────────────────────

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      fullName(c).toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.company ?? '').toLowerCase().includes(q) ||
      (c.idNumber ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av = '', bv = '';
    switch (sortKey) {
      case 'name':          av = fullName(a);           bv = fullName(b);           break;
      case 'status':        av = a.status;              bv = b.status;              break;
      case 'customerSince': av = a.customerSince;       bv = b.customerSince;       break;
      case 'lastContact':   av = a.lastContact ?? '';   bv = b.lastContact ?? '';   break;
      case 'city':          av = a.city ?? '';          bv = b.city ?? '';          break;
    }
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  // ── Mutations ───────────────────────────────────────────────────────────────

  const handleAddCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone) return;
    const c: CRMCustomer = {
      id: Date.now(),
      firstName: newCustomer.firstName!,
      lastName: newCustomer.lastName!,
      email: newCustomer.email ?? '',
      phone: newCustomer.phone!,
      whatsapp: newCustomer.whatsapp,
      address: newCustomer.address,
      city: newCustomer.city,
      idNumber: newCustomer.idNumber,
      company: newCustomer.company,
      vatNumber: newCustomer.vatNumber,
      status: newCustomer.status ?? 'prospect',
      customerSince: new Date().toISOString().split('T')[0],
      preferredContact: newCustomer.preferredContact ?? 'phone',
      tags: [],
      notes: [],
    };
    onCustomersChange([c, ...customers]);
    setNewCustomer({ status: 'prospect', preferredContact: 'phone', tags: [] });
    setShowAddDialog(false);
  };

  const handleSaveEdit = () => {
    if (!selected) return;
    const updated = { ...selected, ...editDraft };
    onCustomersChange(customers.map(c => c.id === selected.id ? updated : c));
    setSelected(updated);
    setEditMode(false);
    setEditDraft({});
  };

  const handleAddNote = () => {
    if (!selected || !newNote.trim()) return;
    const note: InteractionNote = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: newNoteType,
      content: newNote.trim(),
      author: 'Admin',
    };
    const today = new Date().toISOString().split('T')[0];
    const updated: CRMCustomer = {
      ...selected,
      notes: [note, ...selected.notes],
      lastContact: today,
    };
    onCustomersChange(customers.map(c => c.id === selected.id ? updated : c));
    setSelected(updated);
    setNewNote('');
  };

  const handleAssociateVehicle = (vehicle: Vehicle) => {
    if (!selected) return;
    const updated = {
      ...vehicle,
      ownerId: selected.id,
      ownerName: fullName(selected),
      ownerPhone: selected.phone,
      ownerEmail: selected.email,
    };
    onVehiclesChange(vehicles.map(v => v.id === vehicle.id ? updated : v));
    setShowAssociateDialog(false);
    setAssociateSearch('');
  };

  const handleRemoveVehicle = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    const updated = { ...vehicle, ownerId: 0, ownerName: '', ownerPhone: '', ownerEmail: '' };
    onVehiclesChange(vehicles.map(v => v.id === vehicleId ? updated : v));
  };

  const handleExport = () => {
    quickExcelExport(
      filtered.map(c => ({
        'First Name': c.firstName, 'Last Name': c.lastName,
        Email: c.email, Phone: c.phone, WhatsApp: c.whatsapp ?? '',
        Company: c.company ?? '', Status: c.status,
        City: c.city ?? '', Address: c.address ?? '',
        'ID Number': c.idNumber ?? '', 'VAT Number': c.vatNumber ?? '',
        'Customer Since': c.customerSince, 'Last Contact': c.lastContact ?? '',
        'Vehicles': customerVehicles(c.id).length,
        'Total Spent (Kz)': customerTotalSpent(c.id),
        Tags: c.tags.join(', '),
      })),
      'crm-customers'
    );
  };

  // ── Sort icon helper ─────────────────────────────────────────────────────────

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

  // ── Detail View ──────────────────────────────────────────────────────────────

  if (selected) {
    const cVehicles = customerVehicles(selected.id);
    const cRecords = customerServiceRecords(selected.id);
    const totalSpent = customerTotalSpent(selected.id);
    const activeJobs = cRecords.filter(r => r.status === 'in-progress' || r.status === 'pending');

    const field = (label: string, key: keyof CRMCustomer, type = 'text') => {
      const value = editMode ? (editDraft[key] ?? selected[key]) : selected[key];
      if (!editMode) return (
        <div key={label} className="flex justify-between border-b border-slate-100 pb-2 last:border-0">
          <span className="text-slate-500 text-sm">{label}</span>
          <span className="font-medium text-sm text-right max-w-[60%] break-words">{String(value ?? '—')}</span>
        </div>
      );
      return (
        <div key={label}>
          <label className="text-xs text-slate-500">{label}</label>
          <input
            type={type}
            value={String(editDraft[key] ?? selected[key] ?? '')}
            onChange={e => setEditDraft(d => ({ ...d, [key]: e.target.value }))}
            className="mt-0.5 w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>
      );
    };

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { setSelected(null); setEditMode(false); setEditDraft({}); }}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900">{fullName(selected)}</h1>
                <Badge className={`${STATUS_STYLES[selected.status]} capitalize`}>{selected.status}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                {selected.company && <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{selected.company}</span>}
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Customer since {new Date(selected.customerSince).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button variant="outline" size="sm" onClick={() => { setEditMode(false); setEditDraft({}); }}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleSaveEdit}><Save className="h-4 w-4 mr-1" /> Save</Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)}><Edit2 className="h-4 w-4 mr-1" /> Edit</Button>
            )}
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Vehicles', value: cVehicles.length, icon: Car, color: 'text-slate-700' },
            { label: 'Total Services', value: cRecords.length, icon: Wrench, color: 'text-blue-600' },
            { label: 'Active Jobs', value: activeJobs.length, icon: Clock, color: 'text-yellow-600' },
            { label: 'Total Spent', value: fmt(totalSpent), icon: DollarSign, color: 'text-green-700' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-3 pb-3 flex items-center gap-3">
                <Icon className={`h-7 w-7 ${color}`} />
                <div><p className="text-xs text-slate-500">{label}</p><p className={`text-lg font-bold ${color}`}>{value}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles ({cVehicles.length})</TabsTrigger>
            <TabsTrigger value="history">Service History ({cRecords.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity ({selected.notes.length})</TabsTrigger>
          </TabsList>

          {/* ── Profile Tab ─────────────────────────────────────────────── */}
          <TabsContent value="profile" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Phone className="h-4 w-4" />Contact Details</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {field('First Name', 'firstName')}
                  {field('Last Name', 'lastName')}
                  {field('Phone', 'phone', 'tel')}
                  {field('WhatsApp', 'whatsapp', 'tel')}
                  {field('Email', 'email', 'email')}
                  {!editMode ? (
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 text-sm">Preferred Contact</span>
                      <span className="font-medium text-sm capitalize">{selected.preferredContact}</span>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs text-slate-500">Preferred Contact</label>
                      <select
                        value={String(editDraft['preferredContact'] ?? selected.preferredContact)}
                        onChange={e => setEditDraft(d => ({ ...d, preferredContact: e.target.value as any }))}
                        className="mt-0.5 w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                      >
                        <option value="phone">Phone</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" />Identity & Address</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {field('ID Number', 'idNumber')}
                  {field('Company', 'company')}
                  {field('VAT Number', 'vatNumber')}
                  {field('Address', 'address')}
                  {field('City', 'city')}
                  {!editMode && (
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 text-sm">Status</span>
                      <Badge className={`${STATUS_STYLES[selected.status]} text-xs capitalize`}>{selected.status}</Badge>
                    </div>
                  )}
                  {editMode && (
                    <div>
                      <label className="text-xs text-slate-500">Status</label>
                      <select
                        value={String(editDraft['status'] ?? selected.status)}
                        onChange={e => setEditDraft(d => ({ ...d, status: e.target.value as any }))}
                        className="mt-0.5 w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                      >
                        <option value="active">Active</option>
                        <option value="vip">VIP</option>
                        <option value="prospect">Prospect</option>
                        <option value="inactive">Inactive</option>
                        <option value="blacklisted">Blacklisted</option>
                      </select>
                    </div>
                  )}
                  {field('Next Follow-up', 'nextFollowUp', 'date')}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Vehicles Tab ────────────────────────────────────────────── */}
          <TabsContent value="vehicles" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <Button onClick={() => setShowAssociateDialog(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> Associate Vehicle
              </Button>
            </div>
            {cVehicles.length === 0 ? (
              <Card className="p-8 text-center text-slate-400">No vehicles associated with this customer yet.</Card>
            ) : (
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {['Plate', 'Vehicle', 'Year', 'Colour', 'Engine', 'Mileage', 'Services', 'Total Spent', ''].map(h => (
                        <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cVehicles.map(v => {
                      const vRecords = serviceRecords.filter(r => r.vehicleId === v.id);
                      const vSpent = vRecords.filter(r => r.status === 'invoiced' || r.status === 'completed').reduce((s, r) => s + r.total, 0);
                      return (
                        <tr key={v.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-mono font-semibold">{v.plate}</td>
                          <td className="px-3 py-2.5 font-medium">{v.make} {v.model}</td>
                          <td className="px-3 py-2.5 text-slate-600">{v.year}</td>
                          <td className="px-3 py-2.5 text-slate-600">{v.color}</td>
                          <td className="px-3 py-2.5 text-slate-600">{v.engineType}</td>
                          <td className="px-3 py-2.5 text-slate-600">{v.currentMileage.toLocaleString()} km</td>
                          <td className="px-3 py-2.5 text-center">{vRecords.length}</td>
                          <td className="px-3 py-2.5 font-medium text-slate-700">{fmt(vSpent)}</td>
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => handleRemoveVehicle(v.id)}
                              className="text-xs text-slate-400 hover:text-red-600 transition-colors"
                              title="Remove association"
                            ><X className="h-4 w-4" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}

            {/* Associate Vehicle Dialog */}
            <Dialog open={showAssociateDialog} onOpenChange={setShowAssociateDialog}>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Associate a Vehicle</DialogTitle></DialogHeader>
                <p className="text-sm text-slate-500 -mt-2">Select a vehicle to associate with <span className="font-semibold text-slate-700">{fullName(selected)}</span>. This will reassign the vehicle's owner.</p>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by plate, make or model..."
                    value={associateSearch}
                    onChange={e => setAssociateSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    autoFocus
                  />
                </div>
                <div className="mt-1 max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {vehicles
                    .filter(v => {
                      const q = associateSearch.toLowerCase();
                      return v.plate.toLowerCase().includes(q) || v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q);
                    })
                    .map(v => {
                      const isOwned = v.ownerId === selected.id;
                      const currentOwner = v.ownerId && !isOwned ? customers.find(c => c.id === v.ownerId) : null;
                      return (
                        <button
                          key={v.id}
                          onClick={() => !isOwned && handleAssociateVehicle(v)}
                          disabled={isOwned}
                          className={`w-full text-left px-4 py-3 transition-colors ${isOwned ? 'bg-orange-50 cursor-default' : 'hover:bg-slate-50'}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-medium text-slate-900 font-mono">{v.plate} <span className="font-sans font-normal text-slate-600">— {v.year} {v.make} {v.model}</span></p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {isOwned
                                  ? 'Already associated with this customer'
                                  : currentOwner
                                    ? `Currently: ${fullName(currentOwner)}`
                                    : v.ownerName || 'No current owner'}
                              </p>
                            </div>
                            {isOwned && <Badge className="text-xs bg-orange-100 text-orange-700 shrink-0">Current</Badge>}
                          </div>
                        </button>
                      );
                    })}
                  {vehicles.filter(v => {
                    const q = associateSearch.toLowerCase();
                    return v.plate.toLowerCase().includes(q) || v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q);
                  }).length === 0 && (
                    <p className="text-center text-slate-400 py-6 text-sm">No vehicles found.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ── Service History Tab ─────────────────────────────────────── */}
          <TabsContent value="history" className="mt-4 space-y-3">
            {cRecords.length === 0 ? (
              <Card className="p-8 text-center text-slate-400">No service records found.</Card>
            ) : cRecords.map(record => {
              const vehicle = vehicles.find(v => v.id === record.vehicleId);
              return (
                <Card key={record.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900">{record.description}</span>
                          <Badge className={`text-xs ${record.status === 'invoiced' ? 'bg-blue-100 text-blue-800' : record.status === 'completed' ? 'bg-green-100 text-green-800' : record.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'}`}>{record.status}</Badge>
                          {vehicle && <Badge variant="outline" className="text-xs font-mono">{vehicle.plate}</Badge>}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(record.date).toLocaleDateString('en-GB')}</span>
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{record.technicianName}</span>
                          {vehicle && <span className="flex items-center gap-1"><Car className="h-3 w-3" />{vehicle.make} {vehicle.model}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{fmt(record.total)}</p>
                        <p className="text-xs text-slate-500">Labour: {fmt(record.laborCost)} · Parts: {fmt(record.partsCost)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ── Activity Tab ────────────────────────────────────────────── */}
          <TabsContent value="activity" className="mt-4 space-y-4">
            {/* Add note */}
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="flex gap-2">
                  {(['note', 'call', 'email', 'visit', 'whatsapp'] as InteractionNote['type'][]).map(t => (
                    <button
                      key={t}
                      onClick={() => setNewNoteType(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition-colors ${newNoteType === t ? NOTE_COLORS[t] + ' border-transparent' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >{t}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <textarea
                    placeholder="Log a call, note, or interaction..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    rows={2}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="bg-orange-600 hover:bg-orange-700 text-white self-end"
                  >Add</Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes timeline */}
            {selected.notes.length === 0 ? (
              <p className="text-center text-slate-400 py-6">No activity logged yet.</p>
            ) : selected.notes.map(note => {
              const Icon = NOTE_ICONS[note.type];
              return (
                <div key={note.id} className="flex gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${NOTE_COLORS[note.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-medium capitalize text-slate-700">{note.type}</span>
                      <span>·</span>
                      <span>{new Date(note.date).toLocaleDateString('en-GB')}</span>
                      <span>·</span>
                      <span>{note.author}</span>
                    </div>
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">{note.content}</p>
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // ── List View ────────────────────────────────────────────────────────────────

  const statusCounts = {
    all: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    vip: customers.filter(c => c.status === 'vip').length,
    prospect: customers.filter(c => c.status === 'prospect').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
    blacklisted: customers.filter(c => c.status === 'blacklisted').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">CRM</h1>
          <p className="text-slate-600 mt-1">Customer relationship management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button onClick={() => setShowAddDialog(true)} className="bg-orange-600 hover:bg-orange-700 text-white"><Plus className="h-4 w-4 mr-2" />Add Customer</Button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Customers', value: customers.length, icon: Users, color: 'text-slate-700' },
          { label: 'Active / VIP', value: statusCounts.active + statusCounts.vip, icon: Star, color: 'text-purple-600' },
          { label: 'Prospects', value: statusCounts.prospect, icon: Clock, color: 'text-blue-600' },
          { label: 'Revenue', value: fmt(customers.reduce((s, c) => s + customerTotalSpent(c.id), 0)), icon: DollarSign, color: 'text-green-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-3 pb-3 flex items-center gap-3">
              <Icon className={`h-7 w-7 ${color}`} />
              <div><p className="text-xs text-slate-500">{label}</p><p className={`text-xl font-bold ${color}`}>{value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'active', 'vip', 'prospect', 'inactive', 'blacklisted'] as const).map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition-colors ${statusFilter === s ? 'bg-orange-600 text-white border-orange-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {s} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {/* Search + count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, company or ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <span className="text-sm text-slate-500 whitespace-nowrap">{filtered.length} of {customers.length}</span>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <Th col="name">Name</Th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Contact</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Company</th>
                <Th col="city">City</Th>
                <Th col="status">Status</Th>
                <Th col="customerSince">Customer Since</Th>
                <Th col="lastContact">Last Contact</Th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide">Vehicles</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center text-slate-400">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-40" />No customers found.
                  </td>
                </tr>
              )}
              {pageRows.map(c => {
                const vCount = customerVehicles(c.id).length;
                const spent = customerTotalSpent(c.id);
                return (
                  <tr key={c.id} className="hover:bg-orange-50 cursor-pointer transition-colors" onClick={() => setSelected(c)}>
                    <td className="px-3 py-3">
                      <span className="font-semibold text-slate-900">{fullName(c)}</span>
                      {c.tags.includes('vip') && <Star className="h-3.5 w-3.5 text-purple-500 fill-purple-500 inline ml-1" />}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      <div className="flex items-center gap-1">{c.preferredContact === 'phone' ? <Phone className="h-3 w-3" /> : c.preferredContact === 'whatsapp' ? <MessageCircle className="h-3 w-3" /> : <Mail className="h-3 w-3" />}{c.phone}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{c.company ?? <span className="text-slate-300">—</span>}</td>
                    <td className="px-3 py-3 text-slate-600">{c.city ?? '—'}</td>
                    <td className="px-3 py-3"><Badge className={`text-xs capitalize ${STATUS_STYLES[c.status]}`}>{c.status}</Badge></td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{new Date(c.customerSince).toLocaleDateString('en-GB')}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{c.lastContact ? new Date(c.lastContact).toLocaleDateString('en-GB') : <span className="text-slate-300">—</span>}</td>
                    <td className="px-3 py-3 text-center text-slate-700">{vCount}</td>
                    <td className="px-3 py-3 text-right font-medium text-slate-700 whitespace-nowrap">{fmt(spent)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
            <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(1)}>«</Button>
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className={p === page ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}>{p}</Button>;
              })}
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {([
              ['First Name *', 'firstName', 'text'],
              ['Last Name *', 'lastName', 'text'],
              ['Phone *', 'phone', 'tel'],
              ['WhatsApp', 'whatsapp', 'tel'],
              ['Email', 'email', 'email'],
              ['Company', 'company', 'text'],
              ['VAT Number', 'vatNumber', 'text'],
              ['ID Number', 'idNumber', 'text'],
              ['Address', 'address', 'text'],
              ['City', 'city', 'text'],
            ] as [string, keyof CRMCustomer, string][]).map(([label, key, type]) => (
              <div key={key as string}>
                <label className="text-sm font-medium text-slate-700">{label}</label>
                <input
                  type={type}
                  value={String((newCustomer as any)[key] ?? '')}
                  onChange={e => setNewCustomer(prev => ({ ...prev, [key]: e.target.value }))}
                  className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                value={newCustomer.status ?? 'prospect'}
                onChange={e => setNewCustomer(prev => ({ ...prev, status: e.target.value as any }))}
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="vip">VIP</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Preferred Contact</label>
              <select
                value={newCustomer.preferredContact ?? 'phone'}
                onChange={e => setNewCustomer(prev => ({ ...prev, preferredContact: e.target.value as any }))}
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddCustomer}
              disabled={!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >Add Customer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
