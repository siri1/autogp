"use client";

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Search, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import type { Part } from '@/components/PartsInventory';
import type { QuotationItem } from '@/lib/quotation-invoice';

type StockFilter = 'all' | 'in-stock' | 'low-stock';

interface PartSelection {
  part: Part;
  quantity: number;
}

interface PartsPickerDialogProps {
  open: boolean;
  onClose: () => void;
  parts: Part[];
  onAdd: (items: QuotationItem[]) => void;
}

const fmt = (n: number) =>
  n.toLocaleString('pt-AO', { minimumFractionDigits: 0 }) + ' AOA';

const STOCK_BADGE: Record<Part['status'], string> = {
  'in-stock':     'bg-emerald-100 text-emerald-700',
  'low-stock':    'bg-amber-100 text-amber-700',
  'out-of-stock': 'bg-red-100 text-red-600',
  'discontinued': 'bg-slate-100 text-slate-500',
};

export default function PartsPickerDialog({
  open, onClose, parts, onAdd,
}: PartsPickerDialogProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('in-stock');
  const [selections, setSelections] = useState<Map<number, PartSelection>>(new Map());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return parts.filter(p => {
      const matchStock =
        stockFilter === 'all' ||
        (stockFilter === 'in-stock' && (p.status === 'in-stock' || p.status === 'low-stock')) ||
        (stockFilter === 'low-stock' && p.status === 'low-stock');
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchStock && matchSearch;
    });
  }, [parts, search, stockFilter]);

  const isSelected = (id: number) => selections.has(id);

  const togglePart = (part: Part) => {
    setSelections(prev => {
      const next = new Map(prev);
      if (next.has(part.id)) {
        next.delete(part.id);
      } else {
        next.set(part.id, { part, quantity: 1 });
      }
      return next;
    });
  };

  const setQty = (partId: number, qty: number) => {
    setSelections(prev => {
      const next = new Map(prev);
      const entry = next.get(partId);
      if (entry) next.set(partId, { ...entry, quantity: Math.max(1, qty) });
      return next;
    });
  };

  const addSelected = () => {
    if (selections.size === 0) return;
    const items: QuotationItem[] = Array.from(selections.values()).map(({ part, quantity }) => ({
      id: Date.now() + part.id + Math.random(),
      description: part.name,
      partNumber: part.partNumber,
      quantity,
      unitPrice: part.sellPrice,
      isLabor: false,
      total: quantity * part.sellPrice,
    }));
    onAdd(items);
    handleClose();
  };

  const handleClose = () => {
    setSearch('');
    setStockFilter('in-stock');
    setSelections(new Map());
    onClose();
  };

  const selectedCount = selections.size;

  const FILTER_LABELS: Record<StockFilter, string> = {
    all:        t.all,
    'in-stock': t.parInStock,
    'low-stock': t.parLowStock,
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            {t.mntSelectParts}
          </DialogTitle>
        </DialogHeader>

        {/* Search + stock filter */}
        <div className="flex gap-3 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder={t.mntSearchParts}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'in-stock', 'low-stock'] as StockFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setStockFilter(f)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                  stockFilter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Parts table */}
        <div className="flex-1 overflow-y-auto border rounded-lg">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>{t.mntNoPartsFound}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-xs text-slate-500 uppercase">
                  <th className="py-2.5 px-3 w-10"></th>
                  <th className="py-2.5 px-3 text-left">{t.parPartNumber}</th>
                  <th className="py-2.5 px-3 text-left">{t.name}</th>
                  <th className="py-2.5 px-3 text-left">{t.category}</th>
                  <th className="py-2.5 px-3 text-center">{t.mntAvailableStock}</th>
                  <th className="py-2.5 px-3 text-right">{t.unitPrice}</th>
                  <th className="py-2.5 px-3 text-right w-24">{t.quantity}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(part => {
                  const unavailable = part.status === 'out-of-stock' || part.status === 'discontinued';
                  const sel = isSelected(part.id);
                  const qty = selections.get(part.id)?.quantity ?? 1;

                  return (
                    <tr
                      key={part.id}
                      onClick={() => !unavailable && togglePart(part)}
                      className={`transition-colors ${
                        unavailable
                          ? 'opacity-40 cursor-not-allowed'
                          : sel
                            ? 'bg-blue-50 cursor-pointer'
                            : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        {unavailable ? (
                          <AlertTriangle className="h-4 w-4 text-slate-300 mx-auto" />
                        ) : sel ? (
                          <CheckSquare className="h-4 w-4 text-blue-600 mx-auto" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{part.partNumber}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-800">{part.name}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-xs">{part.category}</td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge className={`text-xs ${STOCK_BADGE[part.status]}`}>
                          {part.currentStock} {part.unit}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-700">{fmt(part.sellPrice)}</td>
                      <td className="px-3 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                        {sel ? (
                          <input
                            type="number"
                            min={1}
                            max={part.currentStock}
                            value={qty}
                            onChange={e => setQty(part.id, parseInt(e.target.value) || 1)}
                            className="w-16 border border-slate-300 rounded px-2 py-1 text-xs text-right"
                          />
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between pt-3 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            {selectedCount > 0
              ? `${selectedCount} part${selectedCount > 1 ? 's' : ''} selected — ${fmt(
                  Array.from(selections.values()).reduce(
                    (s, { part, quantity }) => s + part.sellPrice * quantity, 0
                  )
                )}`
              : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>{t.cancel}</Button>
            <Button
              disabled={selectedCount === 0}
              onClick={addSelected}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t.mntAddSelected} {selectedCount > 0 && `(${selectedCount})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
