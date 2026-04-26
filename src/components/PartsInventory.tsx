"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Package,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Box,
  Truck,
  BarChart3,
  FileText,
  Trash2,
  ShoppingCart,
  X,
} from 'lucide-react';
import { quickExcelExport } from '@/lib/advanced-excel-export';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Part {
  id: number;
  partNumber: string;
  name: string;
  description: string;
  category: string;
  manufacturer: string;
  supplierId: number;
  supplierName: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  unit: string;
  costPrice: number;
  sellPrice: number;
  location: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  lastRestocked: string;
  lastSold: string;
}

interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  totalPurchases: number;
}

interface StockMovement {
  id: number;
  partId: number;
  partNumber: string;
  partName: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'return';
  quantity: number;
  date: string;
  reference: string;
  notes?: string;
}

interface PartsQuoteItem {
  partId: number;
  partNumber: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PartsQuote {
  id: number;
  quoteNumber: string;
  date: string;
  validUntil: string;
  customerName: string;
  customerPhone?: string;
  items: PartsQuoteItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: 'draft' | 'open' | 'invoiced' | 'cancelled';
  notes?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
}

const CATEGORIES = [
  'Engine Parts',
  'Brake System',
  'Suspension',
  'Electrical',
  'Transmission',
  'Cooling System',
  'Exhaust',
  'Filters',
  'Oils & Fluids',
  'Body Parts',
  'Interior',
  'Tires & Wheels',
];

export const SAMPLE_PARTS: Part[] = [
  {
    id: 1,
    partNumber: 'EP-001-OIL',
    name: 'Engine Oil 5W-30',
    description: 'Synthetic engine oil 5W-30, 5L',
    category: 'Oils & Fluids',
    manufacturer: 'Castrol',
    supplierId: 1,
    supplierName: 'Auto Parts Supplier Ltd',
    currentStock: 45,
    minimumStock: 20,
    maximumStock: 100,
    reorderPoint: 30,
    unit: 'liters',
    costPrice: 4500,
    sellPrice: 6500,
    location: 'A-12',
    status: 'in-stock',
    lastRestocked: '2024-11-15',
    lastSold: '2024-11-26',
  },
  {
    id: 2,
    partNumber: 'BR-002-PAD',
    name: 'Brake Pads Front',
    description: 'Ceramic brake pads for front axle',
    category: 'Brake System',
    manufacturer: 'Brembo',
    supplierId: 1,
    supplierName: 'Auto Parts Supplier Ltd',
    currentStock: 8,
    minimumStock: 10,
    maximumStock: 50,
    reorderPoint: 15,
    unit: 'sets',
    costPrice: 12000,
    sellPrice: 18000,
    location: 'B-05',
    status: 'low-stock',
    lastRestocked: '2024-11-10',
    lastSold: '2024-11-25',
  },
  {
    id: 3,
    partNumber: 'FI-003-AIR',
    name: 'Air Filter',
    description: 'High-flow air filter',
    category: 'Filters',
    manufacturer: 'K&N',
    supplierId: 2,
    supplierName: 'Parts Distributor Angola',
    currentStock: 0,
    minimumStock: 5,
    maximumStock: 30,
    reorderPoint: 10,
    unit: 'pieces',
    costPrice: 3500,
    sellPrice: 5500,
    location: 'C-08',
    status: 'out-of-stock',
    lastRestocked: '2024-10-20',
    lastSold: '2024-11-24',
  },
  {
    id: 4,
    partNumber: 'SP-004-SHK',
    name: 'Front Shock Absorber',
    description: 'Gas-pressurized shock absorber',
    category: 'Suspension',
    manufacturer: 'Monroe',
    supplierId: 1,
    supplierName: 'Auto Parts Supplier Ltd',
    currentStock: 24,
    minimumStock: 8,
    maximumStock: 40,
    reorderPoint: 12,
    unit: 'pieces',
    costPrice: 15000,
    sellPrice: 22000,
    location: 'D-03',
    status: 'in-stock',
    lastRestocked: '2024-11-18',
    lastSold: '2024-11-20',
  },
];

const SAMPLE_SUPPLIERS: Supplier[] = [
  {
    id: 1,
    name: 'Auto Parts Supplier Ltd',
    contactPerson: 'Carlos Mendes',
    phone: '+244 923 111 222',
    email: 'carlos@autoparts.ao',
    address: 'Rua da Indústria, Luanda',
    rating: 4.5,
    totalPurchases: 2500000,
  },
  {
    id: 2,
    name: 'Parts Distributor Angola',
    contactPerson: 'Ana Silva',
    phone: '+244 923 333 444',
    email: 'ana@partsdist.ao',
    address: 'Avenida 4 de Fevereiro, Luanda',
    rating: 4.2,
    totalPurchases: 1800000,
  },
];

const SAMPLE_MOVEMENTS: StockMovement[] = [
  {
    id: 1,
    partId: 1,
    partNumber: 'EP-001-OIL',
    partName: 'Engine Oil 5W-30',
    type: 'sale',
    quantity: -5,
    date: '2024-11-26',
    reference: 'JOB-202411-0001',
  },
  {
    id: 2,
    partId: 2,
    partNumber: 'BR-002-PAD',
    partName: 'Brake Pads Front',
    type: 'sale',
    quantity: -2,
    date: '2024-11-25',
    reference: 'JOB-202411-0002',
  },
  {
    id: 3,
    partId: 1,
    partNumber: 'EP-001-OIL',
    partName: 'Engine Oil 5W-30',
    type: 'purchase',
    quantity: 50,
    date: '2024-11-15',
    reference: 'PO-2024-045',
  },
];

interface PartsInventoryProps {
  parts?: Part[];
  onPartsChange?: (parts: Part[]) => void;
}

export default function PartsInventory({ parts: propParts, onPartsChange }: PartsInventoryProps = {}) {
  const { t } = useLanguage();
  const [localParts, setLocalParts] = useState<Part[]>(SAMPLE_PARTS);
  const parts = propParts ?? localParts;
  const setParts = (updater: Part[] | ((prev: Part[]) => Part[])) => {
    const next = typeof updater === 'function' ? updater(parts) : updater;
    if (onPartsChange) onPartsChange(next);
    else setLocalParts(next);
  };
  const [suppliers, setSuppliers] = useState<Supplier[]>(SAMPLE_SUPPLIERS);
  const [movements, setMovements] = useState<StockMovement[]>(SAMPLE_MOVEMENTS);
  const [showNewPartDialog, setShowNewPartDialog] = useState(false);
  const [showNewSupplierDialog, setShowNewSupplierDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Parts Shop state
  const [quotes, setQuotes] = useState<PartsQuote[]>([]);
  const [cart, setCart] = useState<PartsQuoteItem[]>([]);
  const [counterCustomer, setCounterCustomer] = useState({ name: '', phone: '' });
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [activeQuote, setActiveQuote] = useState<PartsQuote | null>(null);
  const [shopSearchTerm, setShopSearchTerm] = useState('');
  const [quoteNotesInput, setQuoteNotesInput] = useState('');
  const [editingQuantities, setEditingQuantities] = useState<Record<number, number>>({});

  const [newPart, setNewPart] = useState<Partial<Part>>({
    unit: 'pieces',
    status: 'in-stock',
  });

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    rating: 5,
  });

  const getStatusBadge = (status: Part['status']) => {
    const configs = {
      'in-stock': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'low-stock': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
      'out-of-stock': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
      'discontinued': { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertTriangle },
    };
    const config = configs[status];
    const Icon = config.icon;
    return (
      <Badge className={`${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`;
  };

  const getPartStatus = (part: Part): Part['status'] => {
    if (part.currentStock === 0) return 'out-of-stock';
    if (part.currentStock <= part.minimumStock) return 'low-stock';
    return 'in-stock';
  };

  const savePart = () => {
    const part: Part = {
      id: Date.now(),
      partNumber: newPart.partNumber!,
      name: newPart.name!,
      description: newPart.description!,
      category: newPart.category!,
      manufacturer: newPart.manufacturer!,
      supplierId: newPart.supplierId!,
      supplierName: suppliers.find(s => s.id === newPart.supplierId)?.name || '',
      currentStock: newPart.currentStock!,
      minimumStock: newPart.minimumStock!,
      maximumStock: newPart.maximumStock!,
      reorderPoint: newPart.reorderPoint!,
      unit: newPart.unit!,
      costPrice: newPart.costPrice!,
      sellPrice: newPart.sellPrice!,
      location: newPart.location!,
      status: getPartStatus(newPart as Part),
      lastRestocked: new Date().toISOString().split('T')[0],
      lastSold: new Date().toISOString().split('T')[0],
    };

    setParts(prev => [part, ...prev]);
    setShowNewPartDialog(false);
    setNewPart({ unit: 'pieces', status: 'in-stock' });
  };

  const saveSupplier = () => {
    const supplier: Supplier = {
      id: Date.now(),
      name: newSupplier.name!,
      contactPerson: newSupplier.contactPerson!,
      phone: newSupplier.phone!,
      email: newSupplier.email!,
      address: newSupplier.address!,
      rating: newSupplier.rating!,
      totalPurchases: 0,
    };

    setSuppliers(prev => [supplier, ...prev]);
    setShowNewSupplierDialog(false);
    setNewSupplier({ rating: 5 });
  };

  const exportParts = () => {
    const data = {
      headers: [
        'Part Number',
        'Name',
        'Category',
        'Manufacturer',
        'Supplier',
        'Stock',
        'Min Stock',
        'Max Stock',
        'Unit',
        'Cost Price',
        'Sell Price',
        'Location',
        'Status',
      ],
      rows: parts.map(part => [
        part.partNumber,
        part.name,
        part.category,
        part.manufacturer,
        part.supplierName,
        part.currentStock,
        part.minimumStock,
        part.maximumStock,
        part.unit,
        part.costPrice.toFixed(2),
        part.sellPrice.toFixed(2),
        part.location,
        part.status,
      ]),
    };

    quickExcelExport('Parts Inventory', data.headers, data.rows, 'parts-inventory.xlsx');
  };

  const exportStockMovements = () => {
    const data = {
      headers: ['Date', 'Part Number', 'Part Name', 'Type', 'Quantity', 'Reference', 'Notes'],
      rows: movements.map(mov => [
        new Date(mov.date).toLocaleDateString('pt-AO'),
        mov.partNumber,
        mov.partName,
        mov.type,
        mov.quantity,
        mov.reference,
        mov.notes || '',
      ]),
    };

    quickExcelExport('Stock Movements', data.headers, data.rows, 'stock-movements.xlsx');
  };

  const getFilteredParts = () => {
    return parts.filter(part => {
      const matchesSearch =
        searchTerm === '' ||
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === 'all' || part.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || part.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const stats = {
    totalParts: parts.length,
    inStock: parts.filter(p => p.status === 'in-stock').length,
    lowStock: parts.filter(p => p.status === 'low-stock').length,
    outOfStock: parts.filter(p => p.status === 'out-of-stock').length,
    totalValue: parts.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0),
  };

  // ── Parts Shop Functions ──────────────────────────────────────────────────

  const generatePartsQuoteNumber = (count: number): string => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    return `PQ-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  };

  const today = () => new Date().toISOString().split('T')[0];
  const addDays = (date: string, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const calcTotals = (items: PartsQuoteItem[], vatRate: number = 0.14) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const addToCart = (part: Part, quantity: number = 1) => {
    const existingItem = cart.find(item => item.partId === part.id);
    const unitPrice = part.sellPrice;

    if (existingItem) {
      setCart(cart.map(item =>
        item.partId === part.id
          ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * unitPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        partId: part.id,
        partNumber: part.partNumber,
        name: part.name,
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      }]);
    }
  };

  const removeFromCart = (partId: number) => {
    setCart(cart.filter(item => item.partId !== partId));
  };

  const updateCartQuantity = (partId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(partId);
    } else {
      setCart(cart.map(item =>
        item.partId === partId
          ? { ...item, quantity, total: quantity * item.unitPrice }
          : item
      ));
    }
  };

  const saveQuote = () => {
    if (!counterCustomer.name.trim() || cart.length === 0) return;

    const { subtotal, vatAmount, total } = calcTotals(cart);
    const quote: PartsQuote = {
      id: Date.now(),
      quoteNumber: generatePartsQuoteNumber(quotes.length),
      date: today(),
      validUntil: addDays(today(), 30),
      customerName: counterCustomer.name,
      customerPhone: counterCustomer.phone,
      items: cart,
      subtotal,
      vatRate: 0.14,
      vatAmount,
      total,
      status: 'open',
      notes: quoteNotesInput,
    };

    setQuotes([quote, ...quotes]);
    setCart([]);
    setCounterCustomer({ name: '', phone: '' });
    setQuoteNotesInput('');
    setEditingQuantities({});
  };

  const openQuote = (quote: PartsQuote) => {
    setActiveQuote(quote);
    setCart(quote.items);
    setCounterCustomer({ name: quote.customerName, phone: quote.customerPhone || '' });
    setQuoteNotesInput(quote.notes || '');
    setEditingQuantities({});
  };

  const convertToInvoice = (quote: PartsQuote) => {
    if (quote.status === 'invoiced') return;

    // Generate invoice number and decrement stock
    const invoiceNumber = `INV-${today().replace(/-/g, '')}-${String(quotes.length + 1).padStart(4, '0')}`;
    const invoiceDate = today();

    // Decrement stock
    const updatedParts = parts.map(part => {
      const item = quote.items.find(i => i.partId === part.id);
      if (!item) return part;
      const newStock = Math.max(0, part.currentStock - item.quantity);
      return { ...part, currentStock: newStock, status: getPartStatus({ ...part, currentStock: newStock }) };
    });

    // Add stock movement entries
    const newMovements = quote.items.map(item => ({
      id: Date.now() + Math.random(),
      partId: item.partId,
      partNumber: item.partNumber,
      partName: item.name,
      type: 'sale' as const,
      quantity: -item.quantity,
      date: invoiceDate,
      reference: invoiceNumber,
    }));

    setParts(updatedParts);
    setMovements([...newMovements, ...movements]);

    // Update quote status
    setQuotes(quotes.map(q =>
      q.id === quote.id
        ? { ...q, status: 'invoiced', invoiceNumber, invoiceDate }
        : q
    ));

    // Trigger PDF download
    exportPartsInvoicePDF({ ...quote, invoiceNumber, invoiceDate, status: 'invoiced' });
  };

  const exportPartsQuotePDF = (quote: PartsQuote) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFontSize(16);
    doc.text('PARTS QUOTATION', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Quote #: ${quote.quoteNumber}`, 20, 35);
    doc.text(`Date: ${new Date(quote.date).toLocaleDateString('pt-AO')}`, 20, 42);
    doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString('pt-AO')}`, 20, 49);

    // Customer info
    doc.setFontSize(10);
    doc.text('Customer:', 20, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(quote.customerName, 20, 67);
    if (quote.customerPhone) doc.text(`Phone: ${quote.customerPhone}`, 20, 74);

    // Items table
    const tableData = quote.items.map(item => [
      item.partNumber,
      item.name,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.total),
    ]);

    autoTable(doc, {
      head: [['Part #', 'Description', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      startY: 90,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: ${formatCurrency(quote.subtotal)}`, pageWidth - 60, finalY);
    doc.text(`VAT (14%): ${formatCurrency(quote.vatAmount)}`, pageWidth - 60, finalY + 7);
    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(quote.total)}`, pageWidth - 60, finalY + 16);

    if (quote.notes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Notes: ${quote.notes}`, 20, finalY + 25);
    }

    doc.save(`quotation-${quote.quoteNumber}.pdf`);
  };

  const exportPartsInvoicePDF = (quote: PartsQuote & { invoiceNumber?: string; invoiceDate?: string }) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.text('PARTS INVOICE', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Invoice #: ${quote.invoiceNumber || quote.quoteNumber}`, 20, 35);
    doc.text(`Date: ${new Date(quote.invoiceDate || quote.date).toLocaleDateString('pt-AO')}`, 20, 42);
    doc.text(`Due Date: ${new Date(addDays(quote.invoiceDate || quote.date, 30)).toLocaleDateString('pt-AO')}`, 20, 49);

    // Customer info
    doc.setFontSize(10);
    doc.text('Customer:', 20, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(quote.customerName, 20, 67);
    if (quote.customerPhone) doc.text(`Phone: ${quote.customerPhone}`, 20, 74);

    // Items table
    const tableData = quote.items.map(item => [
      item.partNumber,
      item.name,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.total),
    ]);

    autoTable(doc, {
      head: [['Part #', 'Description', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      startY: 90,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: ${formatCurrency(quote.subtotal)}`, pageWidth - 60, finalY);
    doc.text(`VAT (14%): ${formatCurrency(quote.vatAmount)}`, pageWidth - 60, finalY + 7);
    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(quote.total)}`, pageWidth - 60, finalY + 16);

    // Payment info
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const paymentY = finalY + 30;
    doc.text('Payment Details:', 20, paymentY);
    doc.text('Bank: Banco de Investimento Angolano (BAI)', 20, paymentY + 5);
    doc.text('Account: (Please contact for bank details)', 20, paymentY + 10);

    doc.save(`invoice-${quote.invoiceNumber || quote.quoteNumber}.pdf`);
  };

  const getAvailableParts = () => {
    return parts.filter(part => {
      const matchesSearch = shopSearchTerm === '' ||
        part.name.toLowerCase().includes(shopSearchTerm.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(shopSearchTerm.toLowerCase());
      return matchesSearch && part.status !== 'discontinued';
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-indigo-600" />
            {t.parTitle}
          </h2>
          <p className="text-slate-600 mt-2">{t.parSubtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportParts} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t.exportExcel}
          </Button>
          <Button onClick={() => setShowNewPartDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t.parAddPart}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-indigo-600" />
              {t.parTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-900">{stats.totalParts}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{t.parInStock}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{stats.inStock}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              {t.parLowStock}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{stats.lowStock}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              {t.parOutOfStock}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{stats.outOfStock}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              {t.total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-900">{formatCurrency(stats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="parts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="parts">{t.parTitle}</TabsTrigger>
          <TabsTrigger value="movements">{t.parStockLevel}</TabsTrigger>
          <TabsTrigger value="suppliers">{t.supplier}</TabsTrigger>
          <TabsTrigger value="shop">Counter Sales</TabsTrigger>
        </TabsList>

        {/* Parts Catalog Tab */}
        <TabsContent value="parts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t.parTitle}</CardTitle>
                  <CardDescription>{t.parSubtitle}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t.parSearchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">{t.all}</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">{t.all}</option>
                    <option value="in-stock">{t.parInStock}</option>
                    <option value="low-stock">{t.parLowStock}</option>
                    <option value="out-of-stock">{t.parOutOfStock}</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">{t.parPartNumber}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">{t.name}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">{t.category}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">{t.supplier}</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">{t.parStockLevel}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">{t.parCostPrice}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">{t.parSellingPrice}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">{t.parLocation}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredParts().map(part => (
                      <tr key={part.id} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-sm font-semibold">{part.partNumber}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{part.name}</div>
                          <div className="text-xs text-slate-500">{part.description}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline">{part.category}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{part.manufacturer}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-sm font-bold">
                            {part.currentStock} {part.unit}
                          </div>
                          <div className="text-xs text-slate-500">
                            Min: {part.minimumStock}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm">{formatCurrency(part.costPrice)}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                          {formatCurrency(part.sellPrice)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline">{part.location}</Badge>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(part.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Movements Tab */}
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    {t.parStockLevel}
                  </CardTitle>
                  <CardDescription>{t.parSubtitle}</CardDescription>
                </div>
                <Button onClick={exportStockMovements} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t.exportExcel}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">{t.date}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">{t.parPartNumber}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">{t.type}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">{t.quantity}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">{t.reference}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">{t.notes}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(mov => (
                        <tr key={mov.id} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm">
                            {new Date(mov.date).toLocaleDateString('pt-AO')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-mono text-sm font-semibold">{mov.partNumber}</div>
                            <div className="text-xs text-slate-500">{mov.partName}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                mov.type === 'purchase'
                                  ? 'bg-green-100 text-green-800'
                                  : mov.type === 'sale'
                                  ? 'bg-blue-100 text-blue-800'
                                  : mov.type === 'return'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {mov.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`font-bold ${
                                mov.quantity > 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {mov.quantity > 0 ? '+' : ''}
                              {mov.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">{mov.reference}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{mov.notes}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-green-600" />
                    {t.supplier}
                  </CardTitle>
                  <CardDescription>{t.parSubtitle}</CardDescription>
                </div>
                <Button onClick={() => setShowNewSupplierDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t.add} {t.supplier}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {suppliers.map(supplier => (
                <Card key={supplier.id} className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-lg text-slate-900">{supplier.name}</h3>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < supplier.rating ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-slate-600 mb-1">
                              <strong>Contact:</strong> {supplier.contactPerson}
                            </div>
                            <div className="text-slate-600 mb-1">
                              <strong>Phone:</strong> {supplier.phone}
                            </div>
                            <div className="text-slate-600">
                              <strong>Email:</strong> {supplier.email}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-600 mb-1">
                              <strong>Address:</strong> {supplier.address}
                            </div>
                            <div className="text-green-600 font-bold">
                              <strong>Total Purchases:</strong> {formatCurrency(supplier.totalPurchases)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Counter Sales Tab */}
        <TabsContent value="shop">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel: New Sale */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  New Sale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={counterCustomer.name}
                    onChange={e => setCounterCustomer({ ...counterCustomer, name: e.target.value })}
                    placeholder="Customer name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={counterCustomer.phone}
                    onChange={e => setCounterCustomer({ ...counterCustomer, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                {/* Parts Search */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Search Parts</label>
                  <input
                    type="text"
                    value={shopSearchTerm}
                    onChange={e => setShopSearchTerm(e.target.value)}
                    placeholder="Part name or number..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-2"
                  />
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {getAvailableParts().map(part => (
                      <button
                        key={part.id}
                        onClick={() => {
                          addToCart(part, 1);
                          setShopSearchTerm('');
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-blue-50 border border-slate-200 text-xs transition-colors"
                      >
                        <div className="font-medium">{part.name}</div>
                        <div className="text-slate-600">{part.partNumber} · Stock: {part.currentStock} · {formatCurrency(part.sellPrice)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cart Summary */}
                <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
                  <div className="font-semibold">Cart</div>
                  {cart.length === 0 ? (
                    <div className="text-slate-500 text-xs">No items in cart</div>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {cart.map(item => (
                          <div key={item.partId} className="flex items-center justify-between text-xs bg-white p-1.5 rounded">
                            <div className="flex-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-slate-600">{formatCurrency(item.unitPrice)} × {item.quantity}</div>
                            </div>
                            <button onClick={() => removeFromCart(item.partId)} className="text-red-600 hover:text-red-800">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2 space-y-1">
                        <div className="flex justify-between font-medium">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(calcTotals(cart).subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>VAT 14%:</span>
                          <span>{formatCurrency(calcTotals(cart).vatAmount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t pt-1">
                          <span>Total:</span>
                          <span>{formatCurrency(calcTotals(cart).total)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea
                    value={quoteNotesInput}
                    onChange={e => setQuoteNotesInput(e.target.value)}
                    placeholder="Add notes for this quote..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    rows={2}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={saveQuote}
                    disabled={!counterCustomer.name.trim() || cart.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Save Quote
                  </Button>
                  <Button
                    onClick={() => {
                      if (!counterCustomer.name.trim() || cart.length === 0) return;
                      const { subtotal, vatAmount, total } = calcTotals(cart);
                      const quote: PartsQuote = {
                        id: Date.now(),
                        quoteNumber: generatePartsQuoteNumber(quotes.length),
                        date: today(),
                        validUntil: addDays(today(), 30),
                        customerName: counterCustomer.name,
                        customerPhone: counterCustomer.phone,
                        items: cart,
                        subtotal,
                        vatRate: 0.14,
                        vatAmount,
                        total,
                        status: 'invoiced',
                        notes: quoteNotesInput,
                        invoiceNumber: `INV-${today().replace(/-/g, '')}-${String(quotes.length + 1).padStart(4, '0')}`,
                        invoiceDate: today(),
                      };
                      convertToInvoice(quote);
                      setCart([]);
                      setCounterCustomer({ name: '', phone: '' });
                      setQuoteNotesInput('');
                    }}
                    disabled={!counterCustomer.name.trim() || cart.length === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    Invoice Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right Panel: Quotes & Invoices List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quotes & Invoices</CardTitle>
                    <CardDescription>{quotes.length} total</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {quotes.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No quotes yet. Create one to get started!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-3 py-2 font-medium">Quote #</th>
                          <th className="text-left px-3 py-2 font-medium">Date</th>
                          <th className="text-left px-3 py-2 font-medium">Customer</th>
                          <th className="text-right px-3 py-2 font-medium">Total</th>
                          <th className="text-left px-3 py-2 font-medium">Status</th>
                          <th className="text-center px-3 py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotes.map(quote => (
                          <React.Fragment key={quote.id}>
                            <tr className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-3 py-2 font-mono text-blue-600">{quote.quoteNumber}</td>
                              <td className="px-3 py-2 text-xs text-slate-600">{new Date(quote.date).toLocaleDateString('pt-AO')}</td>
                              <td className="px-3 py-2">{quote.customerName}</td>
                              <td className="px-3 py-2 text-right font-semibold">{formatCurrency(quote.total)}</td>
                              <td className="px-3 py-2">
                                <Badge className={quote.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                                  {quote.status}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex gap-1 justify-center">
                                  {quote.status === 'open' && (
                                    <>
                                      <button
                                        onClick={() => openQuote(quote)}
                                        className="px-2 py-1 text-xs rounded hover:bg-blue-100 text-blue-600 transition-colors"
                                        title="Edit quote"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => convertToInvoice(quote)}
                                        className="px-2 py-1 text-xs rounded hover:bg-green-100 text-green-600 transition-colors"
                                        title="Convert to invoice"
                                      >
                                        Invoice
                                      </button>
                                    </>
                                  )}
                                  {quote.status === 'invoiced' && (
                                    <button
                                      onClick={() => exportPartsInvoicePDF(quote)}
                                      className="px-2 py-1 text-xs rounded hover:bg-purple-100 text-purple-600 transition-colors flex items-center gap-1"
                                    >
                                      <FileText className="h-3 w-3" />
                                      PDF
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reorder Alerts */}
      {parts.filter(p => p.currentStock <= p.reorderPoint).length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertTriangle className="h-5 w-5" />
              Reorder Alerts
            </CardTitle>
            <CardDescription>Parts that need to be reordered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parts
                .filter(p => p.currentStock <= p.reorderPoint)
                .map(part => (
                  <div key={part.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <div className="font-semibold">{part.name}</div>
                      <div className="text-sm text-slate-600">
                        {part.partNumber} - Current: {part.currentStock} {part.unit}, Reorder at: {part.reorderPoint}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">Suggested order</div>
                      <div className="font-bold text-lg">
                        {part.maximumStock - part.currentStock} {part.unit}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Part Dialog */}
      <Dialog open={showNewPartDialog} onOpenChange={setShowNewPartDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.parAddPart}</DialogTitle>
            <DialogDescription>{t.parSubtitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.parPartNumber} *</label>
                  <input
                    type="text"
                    value={newPart.partNumber || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, partNumber: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    placeholder="EP-001-OIL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.name} *</label>
                  <input
                    type="text"
                    value={newPart.name || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    placeholder="Engine Oil 5W-30"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                  <textarea
                    value={newPart.description || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    rows={2}
                    placeholder="Detailed description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.category} *</label>
                  <select
                    value={newPart.category || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Manufacturer *</label>
                  <input
                    type="text"
                    value={newPart.manufacturer || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    placeholder="Castrol"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.supplier} *</label>
                  <select
                    value={newPart.supplierId || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, supplierId: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  >
                    <option value="">Select supplier...</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stock Info */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Stock Information</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Stock *</label>
                  <input
                    type="number"
                    value={newPart.currentStock || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, currentStock: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Min Stock *</label>
                  <input
                    type="number"
                    value={newPart.minimumStock || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, minimumStock: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Stock *</label>
                  <input
                    type="number"
                    value={newPart.maximumStock || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, maximumStock: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reorder Point *</label>
                  <input
                    type="number"
                    value={newPart.reorderPoint || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, reorderPoint: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Location */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Pricing & Location</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unit *</label>
                  <select
                    value={newPart.unit || 'pieces'}
                    onChange={(e) => setNewPart(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  >
                    <option value="pieces">Pieces</option>
                    <option value="liters">Liters</option>
                    <option value="sets">Sets</option>
                    <option value="boxes">Boxes</option>
                    <option value="pairs">Pairs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.parCostPrice} *</label>
                  <input
                    type="number"
                    value={newPart.costPrice || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, costPrice: parseFloat(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.parSellingPrice} *</label>
                  <input
                    type="number"
                    value={newPart.sellPrice || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, sellPrice: parseFloat(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Storage Location *</label>
                  <input
                    type="text"
                    value={newPart.location || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    placeholder="A-12"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewPartDialog(false)}>
                {t.cancel}
              </Button>
              <Button
                onClick={savePart}
                disabled={
                  !newPart.partNumber ||
                  !newPart.name ||
                  !newPart.description ||
                  !newPart.category ||
                  !newPart.manufacturer ||
                  !newPart.supplierId ||
                  newPart.currentStock === undefined ||
                  newPart.minimumStock === undefined ||
                  newPart.maximumStock === undefined ||
                  newPart.reorderPoint === undefined ||
                  !newPart.costPrice ||
                  !newPart.sellPrice ||
                  !newPart.location
                }
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t.parAddPart}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Supplier Dialog */}
      <Dialog open={showNewSupplierDialog} onOpenChange={setShowNewSupplierDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.add} {t.supplier}</DialogTitle>
            <DialogDescription>{t.parSubtitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Supplier Name *</label>
              <input
                type="text"
                value={newSupplier.name || ''}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                placeholder="Auto Parts Supplier Ltd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contact Person *</label>
              <input
                type="text"
                value={newSupplier.contactPerson || ''}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, contactPerson: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                placeholder="Carlos Mendes"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={newSupplier.phone || ''}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  placeholder="+244 923 111 222"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={newSupplier.email || ''}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  placeholder="carlos@autoparts.ao"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Address *</label>
              <textarea
                value={newSupplier.address || ''}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                rows={2}
                placeholder="Rua da Indústria, Luanda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={newSupplier.rating || 5}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewSupplierDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={saveSupplier}
                disabled={
                  !newSupplier.name ||
                  !newSupplier.contactPerson ||
                  !newSupplier.phone ||
                  !newSupplier.email ||
                  !newSupplier.address
                }
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
