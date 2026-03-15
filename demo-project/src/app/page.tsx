"use client";

import { useState } from 'react';
import ExportButton from '@/components/ExportButton';
import ReportsExportButton from '@/components/ReportsExportButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Download,
  FileSpreadsheet,
  Table2,
  BookOpen,
  FileText,
  ClipboardList,
  BarChart3,
  Home as HomeIcon,
  Wrench,
  Menu,
  X,
  Calendar,
  Clock,
  Package,
  UserCog,
  Settings,
  FileBarChart,
  Car
} from 'lucide-react';
import WorkshopKPIs from '@/components/WorkshopKPIs';
import ChartOfAccounts from '@/components/ChartOfAccounts';
import QuotationsJobs from '@/components/QuotationsJobs';
import AppointmentBooking from '@/components/AppointmentBooking';
import PartsInventory from '@/components/PartsInventory';
import { exportSystemDocumentation } from '@/lib/documentation-export';

// Sample data for demonstration
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', revenue: '$2,450', orders: 12 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', revenue: '$3,890', orders: 18 },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Pending', revenue: '$1,230', orders: 5 },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'Active', revenue: '$5,670', orders: 24 },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'Inactive', revenue: '$890', orders: 3 },
  { id: 6, name: 'Diana Martinez', email: 'diana@example.com', status: 'Active', revenue: '$4,120', orders: 15 },
  { id: 7, name: 'Ethan Davis', email: 'ethan@example.com', status: 'Active', revenue: '$3,450', orders: 14 },
  { id: 8, name: 'Fiona Garcia', email: 'fiona@example.com', status: 'Pending', revenue: '$2,100', orders: 8 },
];

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  description: string;
  badge?: string;
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, description: 'Overview & statistics' },
  { id: 'appointments', label: 'Appointments', icon: Calendar, description: 'Booking & scheduling' },
  { id: 'clocking', label: 'Time Clocking', icon: Clock, description: 'Technician hours' },
  { id: 'customers', label: 'Customers', icon: Users, description: 'Customer management' },
  { id: 'vehicles', label: 'Vehicles', icon: Car, description: 'Vehicle database' },
  { id: 'quotations', label: 'Quotations & Jobs', icon: ClipboardList, description: 'Quotes & jobs' },
  { id: 'parts', label: 'Parts & Inventory', icon: Package, description: 'Stock management' },
  { id: 'kpis', label: 'Workshop KPIs', icon: BarChart3, description: 'Performance metrics' },
  { id: 'reporting', label: 'Reports', icon: FileBarChart, description: 'Analytics & reports' },
  { id: 'accounting', label: 'Accounting', icon: BookOpen, description: 'Financial system' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'System configuration' },
];

export default function Home() {
  const [data, setData] = useState(sampleData);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Prepare export data
  const exportData = {
    headers: ['ID', 'Name', 'Email', 'Status', 'Revenue', 'Orders'],
    rows: data.map(item => [
      item.id,
      item.name,
      item.email,
      item.status,
      item.revenue,
      item.orders,
    ]),
    filename: 'customer-data',
    title: 'Customer Data Report',
  };

  // Calculate statistics
  const stats = {
    totalCustomers: data.length,
    activeCustomers: data.filter(d => d.status === 'Active').length,
    totalRevenue: data.reduce((sum, d) => sum + parseFloat(d.revenue.replace('$', '').replace(',', '')), 0),
    totalOrders: data.reduce((sum, d) => sum + d.orders, 0),
  };

  const refreshData = () => {
    // Simulate data refresh
    setData([...data].sort(() => Math.random() - 0.5));
  };

  // Advanced Reports Data with Multiple Sheets
  const comprehensiveReport = {
    title: 'Customer Analytics Report',
    companyName: 'Demo Company Inc.',
    summary: {
      totalRecords: data.length,
      dateRange: new Date().toLocaleDateString(),
      generatedBy: 'System',
    },
    sheets: [
      {
        name: 'Customer Overview',
        headers: ['ID', 'Name', 'Email', 'Status', 'Revenue', 'Orders'],
        rows: data.map(item => [
          item.id,
          item.name,
          item.email,
          item.status,
          item.revenue,
          item.orders,
        ]),
        totals: ['TOTAL', '', '', '', `$${stats.totalRevenue.toLocaleString()}`, stats.totalOrders],
        formatting: {
          alternateRows: true,
          headerColor: '4472C4',
          columnWidths: [8, 20, 30, 12, 15, 10],
        },
      },
      {
        name: 'Active Customers',
        headers: ['ID', 'Name', 'Email', 'Revenue', 'Orders'],
        rows: data
          .filter(item => item.status === 'Active')
          .map(item => [item.id, item.name, item.email, item.revenue, item.orders]),
        formatting: {
          alternateRows: true,
          headerColor: '70AD47',
        },
      },
      {
        name: 'Pending Customers',
        headers: ['ID', 'Name', 'Email', 'Revenue', 'Orders'],
        rows: data
          .filter(item => item.status === 'Pending')
          .map(item => [item.id, item.name, item.email, item.revenue, item.orders]),
        formatting: {
          alternateRows: true,
          headerColor: 'FFC000',
        },
      },
      {
        name: 'Revenue Analysis',
        headers: ['Status', 'Customer Count', 'Total Revenue', 'Avg Revenue'],
        rows: [
          [
            'Active',
            data.filter(d => d.status === 'Active').length,
            `$${data
              .filter(d => d.status === 'Active')
              .reduce((sum, d) => sum + parseFloat(d.revenue.replace('$', '').replace(',', '')), 0)
              .toLocaleString()}`,
            `$${(
              data
                .filter(d => d.status === 'Active')
                .reduce((sum, d) => sum + parseFloat(d.revenue.replace('$', '').replace(',', '')), 0) /
              data.filter(d => d.status === 'Active').length
            ).toFixed(0)}`,
          ],
          [
            'Pending',
            data.filter(d => d.status === 'Pending').length,
            `$${data
              .filter(d => d.status === 'Pending')
              .reduce((sum, d) => sum + parseFloat(d.revenue.replace('$', '').replace(',', '')), 0)
              .toLocaleString()}`,
            `$${(
              data
                .filter(d => d.status === 'Pending')
                .reduce((sum, d) => sum + parseFloat(d.revenue.replace('$', '').replace(',', '')), 0) /
              data.filter(d => d.status === 'Pending').length
            ).toFixed(0)}`,
          ],
          [
            'Inactive',
            data.filter(d => d.status === 'Inactive').length,
            `$${data
              .filter(d => d.status === 'Inactive')
              .reduce((sum, d) => sum + parseFloat(d.revenue.replace('$', '').replace(',', '')), 0)
              .toLocaleString()}`,
            `$${(
              data
                .filter(d => d.status === 'Inactive')
                .reduce((sum, d) => sum + parseFloat(d.revenue.replace('$', '').replace(',', '')), 0) /
              (data.filter(d => d.status === 'Inactive').length || 1)
            ).toFixed(0)}`,
          ],
        ],
        formatting: {
          alternateRows: true,
          headerColor: 'C55A11',
        },
      },
    ],
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-600 mt-2">Welcome to the Automotive Workshop Management System</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={exportSystemDocumentation}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export Docs
                </Button>
                <Button variant="outline" onClick={refreshData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                  <p className="text-xs text-slate-500 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Active Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeCustomers}</div>
                  <p className="text-xs text-slate-500 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-slate-500 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                    +23% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Orders
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-slate-500 flex items-center mt-1">
                    <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                    -3% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Cards - Grid Layout */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-blue-400" onClick={() => setActiveView('appointments')}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Appointments</CardTitle>
                        <CardDescription className="text-xs">Book & schedule</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-orange-400" onClick={() => setActiveView('clocking')}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Time Clocking</CardTitle>
                        <CardDescription className="text-xs">Track work hours</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-purple-400" onClick={() => setActiveView('customers')}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Customers</CardTitle>
                        <CardDescription className="text-xs">Manage clients</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-green-400" onClick={() => setActiveView('quotations')}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Quotations & Jobs</CardTitle>
                        <CardDescription className="text-xs">Quotes to invoices</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-indigo-400" onClick={() => setActiveView('parts')}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <Package className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Parts & Inventory</CardTitle>
                        <CardDescription className="text-xs">Stock control</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-emerald-400" onClick={() => setActiveView('accounting')}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Accounting</CardTitle>
                        <CardDescription className="text-xs">Financial system</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'appointments':
        return <AppointmentBooking />;

      case 'clocking':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Time Clocking System</h1>
              <p className="text-slate-600 mt-2">Track technician work hours and attendance</p>
            </div>
            <Card className="p-8">
              <div className="text-center space-y-4">
                <Clock className="h-16 w-16 text-orange-600 mx-auto" />
                <h3 className="text-2xl font-semibold">Time Tracking Module</h3>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Clock in/out system for technicians, track billable vs non-billable hours,
                  overtime calculation, and integration with payroll. Export timesheets for accounting.
                </p>
                <Badge className="text-sm">Coming Soon - Under Development</Badge>
              </div>
            </Card>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Customer Management</h1>
                <p className="text-slate-600 mt-2">Manage your customer database</p>
              </div>
              <ExportButton data={exportData} />
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalCustomers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Active Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.activeCustomers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">${stats.totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Database</CardTitle>
                <CardDescription>All registered customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {data.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm">#{item.id}</td>
                          <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{item.email}</td>
                          <td className="px-6 py-4">
                            <Badge className={
                              item.status === 'Active' ? 'bg-green-100 text-green-800' :
                              item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-slate-100 text-slate-800'
                            }>
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">{item.revenue}</td>
                          <td className="px-6 py-4 text-sm">{item.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'vehicles':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Vehicle Database</h1>
              <p className="text-slate-600 mt-2">Manage customer vehicles and service history</p>
            </div>
            <Card className="p-8">
              <div className="text-center space-y-4">
                <Car className="h-16 w-16 text-slate-600 mx-auto" />
                <h3 className="text-2xl font-semibold">Vehicle Management Module</h3>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Complete vehicle database with VIN, make, model, year, mileage tracking.
                  Service history, maintenance schedules, and vehicle-specific notes.
                </p>
                <Badge className="text-sm">Coming Soon - Under Development</Badge>
              </div>
            </Card>
          </div>
        );

      case 'parts':
        return <PartsInventory />;

      case 'kpis':
        return <WorkshopKPIs />;

      case 'quotations':
        return <QuotationsJobs />;

      case 'reporting':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Reports & Analytics</h1>
                <p className="text-slate-600 mt-2">Comprehensive reporting module</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Advanced Excel Reports</CardTitle>
                  <CardDescription>Multi-sheet Excel exports</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportsExportButton reportData={comprehensiveReport} />
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Power BI Reports</CardTitle>
                  <CardDescription>Interactive dashboards</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Integration with Microsoft Power BI for advanced analytics</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>Trial balance, P&L, Balance sheet</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setActiveView('accounting')}>
                    View Accounting Reports
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Workshop Performance</CardTitle>
                  <CardDescription>KPI dashboards</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setActiveView('kpis')}>
                    View KPIs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'accounting':
        return <ChartOfAccounts />;

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">System Settings</h1>
              <p className="text-slate-600 mt-2">Configure your workshop management system</p>
            </div>
            <Card className="p-8">
              <div className="text-center space-y-4">
                <Settings className="h-16 w-16 text-slate-600 mx-auto" />
                <h3 className="text-2xl font-semibold">Settings & Configuration</h3>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  System settings including user management, workshop details, tax rates,
                  email templates, backup & restore, and integration settings.
                </p>
                <Badge className="text-sm">Coming Soon - Under Development</Badge>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo/Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-lg">Workshop System</h2>
                <p className="text-xs text-slate-400">Management Platform</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-slate-800"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-700">
            <div className="text-xs text-slate-400">
              <p>© 2024 Workshop System</p>
              <p className="mt-1">Angolan GAAP Compliant</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
