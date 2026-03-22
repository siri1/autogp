"use client";

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Wrench, Search, ChevronDown, ChevronRight, Clock, Plus, CheckSquare, Square,
} from 'lucide-react';
import type { MaintenancePack, LabourTask } from '@/lib/maintenance-packs';
import type { QuotationItem } from '@/lib/quotation-invoice';

interface SelectedTask {
  packId: number;
  task: LabourTask;
}

interface LabourPickerDialogProps {
  open: boolean;
  onClose: () => void;
  packs: MaintenancePack[];
  onAdd: (items: QuotationItem[]) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Engine:              'bg-orange-100 text-orange-700',
  Brakes:              'bg-red-100 text-red-700',
  Electrical:          'bg-yellow-100 text-yellow-700',
  Suspension:          'bg-blue-100 text-blue-700',
  'Air Conditioning':  'bg-cyan-100 text-cyan-700',
  Transmission:        'bg-purple-100 text-purple-700',
  Tyres:               'bg-green-100 text-green-700',
  General:             'bg-slate-100 text-slate-700',
};

const fmt = (n: number) =>
  n.toLocaleString('pt-AO', { minimumFractionDigits: 0 }) + ' AOA';

export default function LabourPickerDialog({
  open, onClose, packs, onAdd,
}: LabourPickerDialogProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<SelectedTask[]>([]);

  const activePacks = packs.filter(p => p.isActive);
  const categories = ['all', ...Array.from(new Set(activePacks.map(p => p.category)))];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return activePacks.filter(p => {
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activePacks, search, categoryFilter]);

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isTaskSelected = (packId: number, taskId: number) =>
    selected.some(s => s.packId === packId && s.task.id === taskId);

  const toggleTask = (packId: number, task: LabourTask) => {
    setSelected(prev =>
      isTaskSelected(packId, task.id)
        ? prev.filter(s => !(s.packId === packId && s.task.id === task.id))
        : [...prev, { packId, task }]
    );
  };

  const addFullPack = (pack: MaintenancePack) => {
    const items = pack.labourTasks.map(task => taskToItem(task));
    onAdd(items);
    handleClose();
  };

  const addSelected = () => {
    if (selected.length === 0) return;
    onAdd(selected.map(s => taskToItem(s.task)));
    handleClose();
  };

  const taskToItem = (task: LabourTask): QuotationItem => ({
    id: Date.now() + task.id + Math.random(),
    description: task.description,
    quantity: task.estimatedHours,
    unitPrice: task.rate,
    isLabor: true,
    estimatedHours: task.estimatedHours,
    total: task.total,
  });

  const handleClose = () => {
    setSearch('');
    setCategoryFilter('all');
    setSelected([]);
    setExpanded(new Set());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-500" />
            {t.mntSelectPack}
          </DialogTitle>
        </DialogHeader>

        {/* Search + category filter */}
        <div className="flex gap-3 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder={t.mntSearchPacks}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? t.mntAllCategories : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Pack list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Wrench className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>{t.mntNoPacksFound}</p>
            </div>
          ) : (
            filtered.map(pack => {
              const isOpen = expanded.has(pack.id);
              const catColor = CATEGORY_COLORS[pack.category] ?? 'bg-slate-100 text-slate-700';
              const packSelected = pack.labourTasks.filter(task => isTaskSelected(pack.id, task.id));

              return (
                <div key={pack.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  {/* Pack header row */}
                  <div className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors">
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
                        <Badge className={`text-xs ${catColor}`}>{pack.category}</Badge>
                        {packSelected.length > 0 && (
                          <Badge className="text-xs bg-blue-100 text-blue-700">
                            {packSelected.length} selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{pack.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-right text-xs text-slate-500 mr-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{pack.totalHours}h
                      </div>
                      <div className="font-semibold text-slate-700 mt-0.5">{fmt(pack.totalAmount)}</div>
                    </div>
                    <Button
                      size="sm"
                      className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs h-8"
                      onClick={() => addFullPack(pack)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />{t.mntAddFullPack}
                    </Button>
                  </div>

                  {/* Task list (expanded) */}
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-slate-500 border-b border-slate-200">
                            <th className="py-2 px-3 w-8"></th>
                            <th className="py-2 px-3 text-left">Description</th>
                            <th className="py-2 px-3 text-right w-16">{t.mntHours}</th>
                            <th className="py-2 px-3 text-right w-28">{t.mntRatePerHour}</th>
                            <th className="py-2 px-3 text-right w-28">{t.total}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pack.labourTasks.map(task => {
                            const sel = isTaskSelected(pack.id, task.id);
                            return (
                              <tr
                                key={task.id}
                                onClick={() => toggleTask(pack.id, task)}
                                className={`cursor-pointer transition-colors ${sel ? 'bg-blue-50' : 'hover:bg-white'}`}
                              >
                                <td className="px-3 py-2 text-center">
                                  {sel
                                    ? <CheckSquare className="h-4 w-4 text-blue-600" />
                                    : <Square className="h-4 w-4 text-slate-300" />
                                  }
                                </td>
                                <td className="px-3 py-2 text-slate-700">{task.description}</td>
                                <td className="px-3 py-2 text-right text-slate-600">{task.estimatedHours}h</td>
                                <td className="px-3 py-2 text-right text-slate-600">{fmt(task.rate)}</td>
                                <td className="px-3 py-2 text-right font-medium text-slate-800">{fmt(task.total)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between pt-3 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            {selected.length > 0 ? `${selected.length} task${selected.length > 1 ? 's' : ''} selected` : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>{t.cancel}</Button>
            <Button
              disabled={selected.length === 0}
              onClick={addSelected}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t.mntAddSelected} {selected.length > 0 && `(${selected.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
