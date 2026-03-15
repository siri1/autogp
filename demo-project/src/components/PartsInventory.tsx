"use client";

import { useState } from 'react';
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
} from 'lucide-react';
import { quickExcelExport } from '@/lib/advanced-excel-export';

interface Part {
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

const SAMPLE_PARTS: Part[] = [
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

export default function PartsInventory() {
  const [parts, setParts] = useState<Part[]>(SAMPLE_PARTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(SAMPLE_SUPPLIERS);
  const [movements, setMovements] = useState<StockMovement[]>(SAMPLE_MOVEMENTS);
  const [showNewPartDialog, setShowNewPartDialog] = useState(false);
  const [showNewSupplierDialog, setShowNewSupplierDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-indigo-600" />
            Parts & Inventory Management
          </h2>
          <p className="text-slate-600 mt-2">Track parts, stock levels, and suppliers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportParts} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowNewPartDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-indigo-600" />
              Total Parts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-900">{stats.totalParts}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">In Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{stats.inStock}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Low Stock
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
              Out of Stock
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
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-900">{formatCurrency(stats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="parts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="parts">Parts Catalog</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        {/* Parts Catalog Tab */}
        <TabsContent value="parts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Parts Catalog</CardTitle>
                  <CardDescription>Manage your parts inventory</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search parts..."
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
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Part Number</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Manufacturer</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Cost</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Sell</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
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
                    Stock Movements
                  </CardTitle>
                  <CardDescription>Track all inventory transactions</CardDescription>
                </div>
                <Button onClick={exportStockMovements} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Part</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Reference</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Notes</th>
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
                    Suppliers
                  </CardTitle>
                  <CardDescription>Manage supplier relationships</CardDescription>
                </div>
                <Button onClick={() => setShowNewSupplierDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
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
            <DialogTitle>Add New Part</DialogTitle>
            <DialogDescription>Add a new part to your inventory</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Part Number *</label>
                  <input
                    type="text"
                    value={newPart.partNumber || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, partNumber: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    placeholder="EP-001-OIL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Supplier *</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cost Price (Kz) *</label>
                  <input
                    type="number"
                    value={newPart.costPrice || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, costPrice: parseFloat(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sell Price (Kz) *</label>
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
                Cancel
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
                Add Part
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Supplier Dialog */}
      <Dialog open={showNewSupplierDialog} onOpenChange={setShowNewSupplierDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>Add a new supplier to your database</DialogDescription>
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
