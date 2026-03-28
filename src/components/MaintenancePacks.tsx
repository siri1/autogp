"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Wrench,
  Plus,
  Clock,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Package,
  Car,
  X,
} from 'lucide-react';
import {
  type MaintenancePack,
  type LabourTask,
  PACK_CATEGORIES,
  generatePackNumber,
  calcPackTotals,
} from '@/lib/maintenance-packs';

interface MaintenancePacksProps {
  packs: MaintenancePack[];
  onPacksChange: (packs: MaintenancePack[]) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Engine:              'bg-orange-100 text-orange-700 border-orange-200',
  Brakes:              'bg-red-100 text-red-700 border-red-200',
  Electrical:          'bg-yellow-100 text-yellow-700 border-yellow-200',
  Suspension:          'bg-blue-100 text-blue-700 border-blue-200',
  'Air Conditioning':  'bg-cyan-100 text-cyan-700 border-cyan-200',
  Transmission:        'bg-purple-100 text-purple-700 border-purple-200',
  Tyres:               'bg-green-100 text-green-700 border-green-200',
  General:             'bg-slate-100 text-slate-700 border-slate-200',
};

const fmt = (n: number) =>
  n.toLocaleString('pt-AO', { minimumFractionDigits: 0 }) + ' AOA';

const emptyTask = (): LabourTask => ({
  id: Date.now() + Math.random(),
  description: '',
  estimatedHours: 0.5,
  rate: 5000,
  total: 2500,
});

const emptyPack = (): Partial<MaintenancePack> => ({
  name: '',
  description: '',
  category: 'General',
  labourTasks: [emptyTask()],
  isActive: true,
  applicableMakes: [],
});

export default function MaintenancePacks({ packs, onPacksChange }: MaintenancePacksProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showDialog, setShowDialog] = useState(false);
  const [editingPack, setEditingPack] = useState<Partial<MaintenancePack>>(emptyPack());
  const [isEditing, setIsEditing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [makeInput, setMakeInput] = useState('');

  const categories = ['all', ...PACK_CATEGORIES];

  const filteredPacks = packs.filter(p =>
    categoryFilter === 'all' || p.category === categoryFilter
  );

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openNew = () => {
    setEditingPack(emptyPack());
    setMakeInput('');
    setIsEditing(false);
    setShowDialog(true);
  };

  const openEdit = (pack: MaintenancePack) => {
    setEditingPack({ ...pack, labourTasks: pack.labourTasks.map(t => ({ ...t })) });
    setMakeInput('');
    setIsEditing(true);
    setShowDialog(true);
  };

  const addMake = (raw: string) => {
    const make = raw.trim();
    if (!make) return;
    setEditingPack(p => ({
      ...p,
      applicableMakes: Array.from(new Set([...(p.applicableMakes ?? []), make])),
    }));
    setMakeInput('');
  };

  const removeMake = (make: string) => {
    setEditingPack(p => ({
      ...p,
      applicableMakes: (p.applicableMakes ?? []).filter(m => m !== make),
    }));
  };

  const toggleActive = (packId: number) => {
    onPacksChange(packs.map(p =>
      p.id === packId ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const deletePack = (packId: number) => {
    if (!confirm(t.mntDeleteConfirm)) return;
    onPacksChange(packs.filter(p => p.id !== packId));
  };

  // Task editing helpers
  const updateTask = (idx: number, field: keyof LabourTask, value: string | number) => {
    setEditingPack(prev => {
      const tasks = [...(prev.labourTasks ?? [])];
      const task = { ...tasks[idx], [field]: value };
      if (field === 'estimatedHours' || field === 'rate') {
        task.total = Number(task.estimatedHours) * Number(task.rate);
      }
      tasks[idx] = task;
      return { ...prev, labourTasks: tasks };
    });
  };

  const addTask = () => {
    setEditingPack(prev => ({
      ...prev,
      labourTasks: [...(prev.labourTasks ?? []), emptyTask()],
    }));
  };

  const removeTask = (idx: number) => {
    setEditingPack(prev => ({
      ...prev,
      labourTasks: (prev.labourTasks ?? []).filter((_, i) => i !== idx),
    }));
  };

  const savePack = () => {
    const tasks = editingPack.labourTasks ?? [];
    const { totalHours, totalAmount } = calcPackTotals(tasks);

    if (isEditing && editingPack.id) {
      onPacksChange(packs.map(p =>
        p.id === editingPack.id
          ? { ...p, ...editingPack, labourTasks: tasks, totalHours, totalAmount } as MaintenancePack
          : p
      ));
    } else {
      const newPack: MaintenancePack = {
        id: Date.now(),
        packNumber: generatePackNumber(packs.length),
        name: editingPack.name!,
        description: editingPack.description ?? '',
        category: editingPack.category!,
        labourTasks: tasks,
        totalHours,
        totalAmount,
        isActive: editingPack.isActive ?? true,
        createdDate: new Date().toISOString().split('T')[0],
      };
      onPacksChange([newPack, ...packs]);
    }
    setShowDialog(false);
  };

  const canSave =
    (editingPack.name?.trim().length ?? 0) > 0 &&
    (editingPack.labourTasks?.length ?? 0) > 0 &&
    editingPack.labourTasks!.every(t => t.description.trim().length > 0);

  // Stats
  const activePacks = packs.filter(p => p.isActive);
  const totalHoursAll = activePacks.reduce((s, p) => s + p.totalHours, 0);
  const totalValueAll = activePacks.reduce((s, p) => s + p.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Wrench className="h-8 w-8 text-orange-600" />
            {t.mntTitle}
          </h2>
          <p className="text-slate-600 mt-2">{t.mntSubtitle}</p>
        </div>
        <Button onClick={openNew} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          {t.mntNewPack}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
              <Package className="h-4 w-4" />
              {t.mntActivePacks}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{activePacks.length}</div>
            <div className="text-xs text-orange-700 mt-1">{packs.length - activePacks.length} {t.mntInactive}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
              <Clock className="h-4 w-4" />
              {t.mntTotalLabourHours}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{totalHoursAll.toFixed(1)}h</div>
            <div className="text-xs text-blue-700 mt-1">{t.mntAcrossAllPacks}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-green-700">
              <DollarSign className="h-4 w-4" />
              {t.mntTotalLabourValue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{fmt(totalValueAll)}</div>
            <div className="text-xs text-green-700 mt-1">{t.mntAllActivePacks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
              categoryFilter === cat
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'all' ? t.mntAllCategories : cat}
          </button>
        ))}
      </div>

      {/* Pack list */}
      <div className="space-y-3">
        {filteredPacks.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-slate-400">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">{t.mntNoPacksList}</p>
              <p className="text-sm mt-1">{t.mntCreateFirst}</p>
            </CardContent>
          </Card>
        ) : (
          filteredPacks.map(pack => {
            const isOpen = expanded.has(pack.id);
            const catColor = CATEGORY_COLORS[pack.category] ?? 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <Card key={pack.id} className={`border ${!pack.isActive ? 'opacity-60' : ''}`}>
                {/* Pack header */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => toggleExpand(pack.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-500">{pack.packNumber}</span>
                      <span className="font-semibold text-slate-800">{pack.name}</span>
                      <Badge className={`text-xs border ${catColor}`}>{pack.category}</Badge>
                      {!pack.isActive && (
                        <Badge className="text-xs bg-slate-100 text-slate-500 border-slate-200">{t.statusInactive}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{pack.description}</p>
                    {(pack.applicableMakes ?? []).length > 0 && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <Car className="h-3 w-3 text-blue-400 flex-shrink-0" />
                        {pack.applicableMakes!.map(m => (
                          <span key={m} className="text-xs px-1.5 py-0 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">{m}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-right text-sm text-slate-600 mr-2 hidden sm:block">
                    <div className="flex items-center gap-1 justify-end text-xs">
                      <Clock className="h-3 w-3" />{pack.totalHours}h
                    </div>
                    <div className="font-semibold text-slate-800">{fmt(pack.totalAmount)}</div>
                    <div className="text-xs text-slate-400">{pack.labourTasks.length} tasks</div>
                  </div>

                  <div className="flex-shrink-0 flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(pack.id)}
                      title={pack.isActive ? t.statusInactive : t.statusActive}
                      className="h-8 w-8 p-0"
                    >
                      {pack.isActive
                        ? <ToggleRight className="h-4 w-4 text-green-600" />
                        : <ToggleLeft className="h-4 w-4 text-slate-400" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(pack)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deletePack(pack.id)}
                      className="h-8 w-8 p-0 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Tasks (expanded) */}
                {isOpen && (
                  <div className="border-t border-slate-100">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-xs text-slate-500 uppercase">
                          <th className="py-2 px-4 text-left">{t.mntTaskDescription}</th>
                          <th className="py-2 px-4 text-right w-20">{t.mntHours}</th>
                          <th className="py-2 px-4 text-right w-36">{t.mntRatePerHour}</th>
                          <th className="py-2 px-4 text-right w-32">{t.total}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pack.labourTasks.map(task => (
                          <tr key={task.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 text-slate-700">{task.description}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{task.estimatedHours}h</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{fmt(task.rate)}</td>
                            <td className="px-4 py-2.5 text-right font-medium text-slate-800">{fmt(task.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                          <td className="px-4 py-2.5 font-semibold text-slate-700">{t.total}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{pack.totalHours}h</td>
                          <td></td>
                          <td className="px-4 py-2.5 text-right font-semibold text-orange-700">{fmt(pack.totalAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-500" />
              {isEditing ? t.mntEditPack : t.mntNewPack}
            </DialogTitle>
            <DialogDescription>{t.mntSubtitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-sm font-medium text-slate-700">{t.mntPackName} *</label>
                <input
                  type="text"
                  value={editingPack.name ?? ''}
                  onChange={e => setEditingPack(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Full Service A"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-sm font-medium text-slate-700">{t.category} *</label>
                <select
                  value={editingPack.category ?? 'General'}
                  onChange={e => setEditingPack(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                >
                  {PACK_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-700">{t.description}</label>
                <input
                  type="text"
                  value={editingPack.description ?? ''}
                  onChange={e => setEditingPack(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the service pack"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5 text-slate-500" />
                  Applicable Vehicle Makes
                  <span className="text-xs text-slate-400 font-normal">(leave empty = all vehicles)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={makeInput}
                    onChange={e => setMakeInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addMake(makeInput); } }}
                    placeholder="e.g. Toyota, BMW, Ford…"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => addMake(makeInput)}>Add</Button>
                </div>
                {(editingPack.applicableMakes ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(editingPack.applicableMakes ?? []).map(make => (
                      <span key={make} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-full">
                        {make}
                        <button type="button" onClick={() => removeMake(make)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Labour tasks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">{t.mntLabourTasks} *</h3>
                <Button size="sm" variant="outline" onClick={addTask}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t.mntAddTask}
                </Button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-xs text-slate-500">
                      <th className="px-3 py-2 text-left">{t.description} *</th>
                      <th className="px-3 py-2 text-right w-20">{t.mntHours}</th>
                      <th className="px-3 py-2 text-right w-36">{t.mntRatePerHour}</th>
                      <th className="px-3 py-2 text-right w-28">{t.total}</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(editingPack.labourTasks ?? []).map((task, idx) => (
                      <tr key={task.id}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={task.description}
                            onChange={e => updateTask(idx, 'description', e.target.value)}
                            placeholder="Task description"
                            className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0.25"
                            step="0.25"
                            value={task.estimatedHours}
                            onChange={e => updateTask(idx, 'estimatedHours', parseFloat(e.target.value) || 0)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-sm text-right"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={task.rate}
                            onChange={e => updateTask(idx, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-sm text-right"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-slate-700">
                          {fmt(task.total)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => removeTask(idx)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            disabled={(editingPack.labourTasks?.length ?? 0) <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td className="px-3 py-2 font-semibold text-slate-700" colSpan={1}>{t.mntTotals}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-700">
                        {calcPackTotals(editingPack.labourTasks ?? []).totalHours.toFixed(2)}h
                      </td>
                      <td></td>
                      <td className="px-3 py-2 text-right font-semibold text-orange-700">
                        {fmt(calcPackTotals(editingPack.labourTasks ?? []).totalAmount)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="packActive"
                checked={editingPack.isActive ?? true}
                onChange={e => setEditingPack(p => ({ ...p, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="packActive" className="text-sm text-slate-700">
                {t.mntPackActiveDesc}
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                {t.cancel}
              </Button>
              <Button
                onClick={savePack}
                disabled={!canSave}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isEditing ? t.mntSaveChanges : t.mntNewPack}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
