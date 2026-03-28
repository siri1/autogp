"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import UserPermissions from '@/components/UserPermissions';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
  Car,
  GitBranch,
  Shield,
  LogOut,
  Building2,
  Truck,
} from 'lucide-react';
import WorkshopKPIs from '@/components/WorkshopKPIs';
import ChartOfAccounts from '@/components/ChartOfAccounts';
import QuotationsJobs from '@/components/QuotationsJobs';
import AppointmentBooking, { SAMPLE_APPOINTMENTS, type Appointment } from '@/components/AppointmentBooking';
import PartsInventory, { SAMPLE_PARTS, type Part } from '@/components/PartsInventory';
import VehicleDatabase, { type Vehicle } from '@/components/VehicleDatabase';
import VehiclesInService, { SAMPLE_IN_SERVICE, type VehicleInService } from '@/components/VehiclesInService';
import CRM from '@/components/CRM';
import WorkflowView from '@/components/WorkflowView';
import MaintenancePacks from '@/components/MaintenancePacks';
import WalkAroundInspection from '@/components/WalkAroundInspection';
import ClockingSystem from '@/components/ClockingSystem';
import ReportingModule from '@/components/ReportingModule';
import TenantManagement from '@/components/TenantManagement';
import GarageManagement from '@/components/GarageManagement';
import GarageSettings from '@/components/GarageSettings';
import FleetManagement from '@/components/FleetManagement';
import { isSuperAdmin } from '@/lib/auth';
import { SAMPLE_CRM_CUSTOMERS, type CRMCustomer } from '@/lib/crm-data';
import { SAMPLE_SERVICE_RECORDS } from '@/components/VehicleDatabase';
import { SAMPLE_VEHICLES } from '@/components/VehicleDatabase';
import { SAMPLE_MAINTENANCE_PACKS, type MaintenancePack } from '@/lib/maintenance-packs';
import { SAMPLE_INSPECTIONS, type VehicleInspection } from '@/lib/vehicle-inspection';
import { SAMPLE_JOBS, type Job } from '@/lib/quotation-invoice';
import { exportSystemDocumentation } from '@/lib/documentation-export';
import { exportUserGuidePDF } from '@/lib/user-guide-export';

type Customer = {
  id: number;
  name: string;
  email: string;
  status: string;
  revenue: string;
  orders: number;
};

type MenuItem = {
  id: string;
  labelKey: string;
  descKey: string;
  icon: any;
  badge?: string;
  group?: string;   // shown as a section label above this item
};

const MENU_ITEMS: MenuItem[] = [
  // ── Overview ──────────────────────────────────────────────────────
  { id: 'dashboard',    labelKey: 'navDashboard',    descKey: 'navDashboardDesc',    icon: HomeIcon,      group: 'Overview' },

  // ── Daily Operations (follows the physical workshop flow) ──────────
  { id: 'appointments', labelKey: 'navAppointments', descKey: 'navAppointmentsDesc', icon: Calendar,      group: 'Operations' },
  { id: 'inspection',   labelKey: 'navInspection',   descKey: 'navInspectionDesc',   icon: ClipboardList },
  { id: 'in-service',   labelKey: 'navInService',    descKey: 'navInServiceDesc',    icon: Wrench },
  { id: 'workflow',     labelKey: 'navWorkflow',     descKey: 'navWorkflowDesc',     icon: GitBranch },
  { id: 'quotations',   labelKey: 'navQuotations',   descKey: 'navQuotationsDesc',   icon: ClipboardList },
  { id: 'parts',        labelKey: 'navParts',        descKey: 'navPartsDesc',        icon: Package },
  { id: 'clocking',     labelKey: 'navClocking',     descKey: 'navClockingDesc',     icon: Clock },

  // ── Analytics ──────────────────────────────────────────────────────
  { id: 'kpis',         labelKey: 'navKpis',         descKey: 'navKpisDesc',         icon: BarChart3,     group: 'Analytics' },
  { id: 'reporting',    labelKey: 'navReporting',    descKey: 'navReportingDesc',    icon: FileBarChart },
  { id: 'accounting',   labelKey: 'navAccounting',   descKey: 'navAccountingDesc',   icon: BookOpen },

  // ── CRM ───────────────────────────────────────────────────────────
  { id: 'customers',    labelKey: 'navCustomers',    descKey: 'navCustomersDesc',    icon: Users,         group: 'CRM' },
  { id: 'vehicles',     labelKey: 'navVehicles',     descKey: 'navVehiclesDesc',     icon: Car },
  { id: 'maintenance',  labelKey: 'navMaintenance',  descKey: 'navMaintenanceDesc',  icon: Wrench },
  { id: 'fleet',        labelKey: 'navFleet',        descKey: 'navFleetDesc',        icon: Truck,         badge: 'Add-on' },

  // ── Admin ─────────────────────────────────────────────────────────
  { id: 'settings',     labelKey: 'navSettings',     descKey: 'navSettingsDesc',     icon: Settings,      group: 'Admin' },
  { id: 'users',        labelKey: 'navUsers',        descKey: 'navUsersDesc',        icon: Shield },
  { id: 'branches',     labelKey: 'navBranches',     descKey: 'navBranchesDesc',     icon: Building2 },
];

export default function Home() {
  const { t } = useLanguage();
  const { user, logout, can } = useAuth();
  const [data, setData]          = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [crmCustomers, setCrmCustomers] = useState<CRMCustomer[]>(SAMPLE_CRM_CUSTOMERS);
  const [sharedVehicles, setSharedVehicles] = useState<Vehicle[]>(SAMPLE_VEHICLES);
  const [sharedParts, setSharedParts] = useState<Part[]>(SAMPLE_PARTS);
  const [sharedMaintenancePacks, setSharedMaintenancePacks] = useState<MaintenancePack[]>(SAMPLE_MAINTENANCE_PACKS);
  const [sharedInspections, setSharedInspections] = useState<VehicleInspection[]>(SAMPLE_INSPECTIONS);
  const [sharedJobs, setSharedJobs] = useState<Job[]>(SAMPLE_JOBS);
  const [sharedAppointments, setSharedAppointments] = useState<Appointment[]>(SAMPLE_APPOINTMENTS);
  const [sharedVehiclesInService, setSharedVehiclesInService] = useState<VehicleInService[]>(SAMPLE_IN_SERVICE);

  const fetchCustomers = async () => {
    try {
      const res       = await fetch('/api/customers');
      const customers = await res.json();
      setData(customers);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  // Gate: show login page if not authenticated (after all hooks)
  if (!user) return <LoginPage />;

  // SuperAdmin gets a completely separate platform management UI
  if (isSuperAdmin(user)) return <TenantManagement />;

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
    totalRevenue: data.reduce((sum, d) => sum + parseFloat(String(d.revenue).replace('$', '').replace(',', '')), 0),
    totalOrders: data.reduce((sum, d) => sum + d.orders, 0),
  };

  const refreshData = () => { fetchCustomers(); };

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
              .reduce((sum, d) => sum + parseFloat(String(d.revenue).replace('$', '').replace(',', '')), 0)
              .toLocaleString()}`,
            `$${(
              data
                .filter(d => d.status === 'Active')
                .reduce((sum, d) => sum + parseFloat(String(d.revenue).replace('$', '').replace(',', '')), 0) /
              (data.filter(d => d.status === 'Active').length || 1)
            ).toFixed(0)}`,
          ],
          [
            'Pending',
            data.filter(d => d.status === 'Pending').length,
            `$${data
              .filter(d => d.status === 'Pending')
              .reduce((sum, d) => sum + parseFloat(String(d.revenue).replace('$', '').replace(',', '')), 0)
              .toLocaleString()}`,
            `$${(
              data
                .filter(d => d.status === 'Pending')
                .reduce((sum, d) => sum + parseFloat(String(d.revenue).replace('$', '').replace(',', '')), 0) /
              (data.filter(d => d.status === 'Pending').length || 1)
            ).toFixed(0)}`,
          ],
          [
            'Inactive',
            data.filter(d => d.status === 'Inactive').length,
            `$${data
              .filter(d => d.status === 'Inactive')
              .reduce((sum, d) => sum + parseFloat(String(d.revenue).replace('$', '').replace(',', '')), 0)
              .toLocaleString()}`,
            `$${(
              data
                .filter(d => d.status === 'Inactive')
                .reduce((sum, d) => sum + parseFloat(String(d.revenue).replace('$', '').replace(',', '')), 0) /
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
                <h1 className="text-4xl font-bold text-slate-900">{t.dashTitle}</h1>
                <p className="text-slate-600 mt-2">{t.dashSubtitle}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={exportUserGuidePDF}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t.dashUserGuide}
                </Button>
                <Button variant="outline" onClick={exportSystemDocumentation}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t.dashExportDocs}
                </Button>
                <Button variant="outline" onClick={refreshData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t.dashRefresh}
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {t.dashTotalCustomers}
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
                    {t.dashActiveCustomers}
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
                    {t.dashTotalRevenue}
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
                    {t.dashTotalOrders}
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

            {/* Quick Access Cards */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t.all === 'All' ? 'Quick Access' : t.all === 'Todos' ? 'Acesso Rápido' : t.all === 'Tous' ? 'Accès Rapide' : t.all === '全部' ? '快速访问' : 'Acceso Rápido'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { view: 'appointments', icon: Calendar, color: 'blue',    label: t.navAppointments,   desc: t.navAppointmentsDesc },
                  { view: 'clocking',     icon: Clock,    color: 'orange',  label: t.navClocking,       desc: t.navClockingDesc },
                  { view: 'customers',    icon: Users,    color: 'purple',  label: t.navCustomers,      desc: t.navCustomersDesc },
                  { view: 'quotations',   icon: ClipboardList, color: 'green', label: t.navQuotations,  desc: t.navQuotationsDesc },
                  { view: 'parts',        icon: Package,  color: 'indigo',  label: t.navParts,          desc: t.navPartsDesc },
                  { view: 'accounting',   icon: BookOpen, color: 'emerald', label: t.navAccounting,     desc: t.navAccountingDesc },
                ].map(({ view, icon: Icon, color, label, desc }) => (
                  <Card key={view} className={`cursor-pointer hover:shadow-lg transition-shadow hover:border-${color}-400`} onClick={() => setActiveView(view)}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-3 bg-${color}-100 rounded-lg`}>
                          <Icon className={`h-6 w-6 text-${color}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{label}</CardTitle>
                          <CardDescription className="text-xs">{desc}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'workflow':
        return <WorkflowView onNavigate={setActiveView} />;

      case 'appointments':
        return (
          <AppointmentBooking
            customers={crmCustomers}
            vehicles={sharedVehicles}
            onCustomersChange={setCrmCustomers}
            onVehiclesChange={setSharedVehicles}
            appointments={sharedAppointments}
            onAppointmentsChange={setSharedAppointments}
            onVehicleInService={v => setSharedVehiclesInService(prev => [v, ...prev])}
            maintenancePacks={sharedMaintenancePacks}
          />
        );

      case 'inspection':
        return (
          <WalkAroundInspection
            inspections={sharedInspections}
            onInspectionsChange={setSharedInspections}
            customers={crmCustomers}
            vehicles={sharedVehicles}
            appointments={sharedAppointments}
            onAppointmentsChange={setSharedAppointments}
            maintenancePacks={sharedMaintenancePacks}
            parts={sharedParts}
            onJobCreated={job => setSharedJobs(prev => [job, ...prev])}
            existingJobsCount={sharedJobs.length}
          />
        );

      case 'clocking':
        return <ClockingSystem />;

      case 'customers':
        return (
          <CRM
            customers={crmCustomers}
            onCustomersChange={setCrmCustomers}
            vehicles={sharedVehicles}
            onVehiclesChange={setSharedVehicles}
            serviceRecords={SAMPLE_SERVICE_RECORDS}
          />
        );

      case 'vehicles':
        return (
          <VehicleDatabase
            customers={crmCustomers}
            vehicles={sharedVehicles}
            onVehiclesChange={setSharedVehicles}
          />
        );

      case 'in-service':
        return (
          <VehiclesInService
            vehicles={sharedVehiclesInService}
            onVehiclesChange={setSharedVehiclesInService}
          />
        );

      case 'parts':
        return (
          <PartsInventory
            parts={sharedParts}
            onPartsChange={setSharedParts}
          />
        );

      case 'maintenance':
        return (
          <MaintenancePacks
            packs={sharedMaintenancePacks}
            onPacksChange={setSharedMaintenancePacks}
          />
        );

      case 'kpis':
        return <WorkshopKPIs />;

      case 'quotations':
        return (
          <QuotationsJobs
            customers={crmCustomers}
            vehicles={sharedVehicles}
            onCustomersChange={setCrmCustomers}
            onVehiclesChange={setSharedVehicles}
            parts={sharedParts}
            maintenancePacks={sharedMaintenancePacks}
            jobs={sharedJobs}
            onJobsChange={setSharedJobs}
          />
        );

      case 'reporting':
        return <ReportingModule onNavigate={setActiveView} />;

      case 'accounting':
        return <ChartOfAccounts />;

      case 'fleet':
        return <FleetManagement />;

      case 'settings':
        return <GarageSettings />;

      case 'users':
        return <UserPermissions />;

      case 'branches':
        return <GarageManagement />;

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
                <h2 className="font-bold text-lg">{t.appTitle}</h2>
                <p className="text-xs text-slate-400">{t.appSubtitle}</p>
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
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {MENU_ITEMS.filter(item => can(item.id as any)).map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const label = (t as any)[item.labelKey] as string ?? item.id;
            const desc  = (t as any)[item.descKey]  as string ?? '';

            return (
              <div key={item.id}>
                {item.group && sidebarOpen && (
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-4 pb-1 select-none">
                    {item.group}
                  </p>
                )}
                {item.group && !sidebarOpen && (
                  <div className="border-t border-slate-700 mt-3 mb-1 mx-1" />
                )}
                <button
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
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        {label}
                        {item.badge && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-500 text-white leading-none">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-75">{desc}</div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* User Profile + Logout + Language Switcher */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          {/* User card */}
          {user && (
            <div className={`flex items-center gap-2 ${sidebarOpen ? '' : 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                </div>
              )}
              <button
                onClick={logout}
                title="Sign out"
                className="flex-shrink-0 text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
          <LanguageSwitcher />
          {sidebarOpen && (
            <div className="text-xs text-slate-400">
              <p>© 2026 AutoGP Workshop</p>
              <p className="mt-1">Angolan GAAP Compliant</p>
            </div>
          )}
        </div>
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