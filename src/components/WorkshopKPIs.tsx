"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Wrench,
  Target,
  Activity,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  User,
  Clock,
  Briefcase,
  Download,
  GitCompare,
  X,
  CheckSquare,
  Square,
  FileText,
} from 'lucide-react';
import { quickExcelExport } from '@/lib/advanced-excel-export';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  target?: string | number;
  icon: any;
  color: string;
  progress?: number;
  status?: 'good' | 'warning' | 'critical';
  onClick?: () => void;
}

interface JobHistoryItem {
  id: number;
  date: string;
  vehicleMake: string;
  vehicleModel: string;
  jobType: string;
  status: 'completed' | 'in-progress' | 'pending';
  hoursQuoted: number;
  hoursActual: number;
  revenue: number;
  customerRating?: number;
}

interface TechnicianData {
  id: number;
  name: string;
  efficiency: number;
  productivity: number;
  effectiveness: number;
  billableHours: number;
  totalHours: number;
  revenuePerDay: number;
  jobsCompleted: number;
  avgJobTime: number;
  certifications: string[];
  status: 'good' | 'warning' | 'critical';
  jobHistory: JobHistoryItem[];
}

const KPICard = ({ title, value, subtitle, trend, target, icon: Icon, color, progress, status, onClick }: KPICardProps) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return <ArrowUp className="h-3 w-3" />;
    if (trend < 0) return <ArrowDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-slate-500';
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-slate-500';
  };

  const getStatusBadge = () => {
    if (!status) return null;
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">On Target</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Needs Attention</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Below Target</Badge>;
    }
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer hover:border-blue-400' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
          </div>
          {getStatusBadge()}
        </div>
        <CardTitle className="text-sm font-medium text-slate-600 mt-3">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-3xl font-bold text-slate-900">{value}</div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(trend)}% vs last period</span>
          </div>
        )}

        {progress !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Progress to Target</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {target !== undefined && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Target:</span>
              <span className="font-semibold text-slate-700">{target}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function WorkshopKPIs() {
  const { t } = useLanguage();
  const [selectedView, setSelectedView] = useState<'revenue' | 'efficiency' | 'productivity' | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianData | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);

  // Sample technician data with job history
  const technicians: TechnicianData[] = [
    {
      id: 1,
      name: 'Mike Rodriguez',
      efficiency: 95.2,
      productivity: 91.5,
      effectiveness: 96.1,
      billableHours: 94,
      totalHours: 98.8,
      revenuePerDay: 1450,
      jobsCompleted: 28,
      avgJobTime: 3.2,
      certifications: ['ASE Master', 'Hybrid Specialist', 'BMW Certified'],
      status: 'good',
      jobHistory: [
        { id: 1, date: '2024-11-25', vehicleMake: 'BMW', vehicleModel: '330i', jobType: 'Brake Service', status: 'completed', hoursQuoted: 2.5, hoursActual: 2.3, revenue: 485, customerRating: 5 },
        { id: 2, date: '2024-11-24', vehicleMake: 'Tesla', vehicleModel: 'Model 3', jobType: 'Battery Diagnostics', status: 'completed', hoursQuoted: 3.0, hoursActual: 2.8, revenue: 650, customerRating: 5 },
        { id: 3, date: '2024-11-23', vehicleMake: 'BMW', vehicleModel: 'X5', jobType: 'Oil Change & Inspection', status: 'completed', hoursQuoted: 1.5, hoursActual: 1.4, revenue: 285, customerRating: 4 },
        { id: 4, date: '2024-11-22', vehicleMake: 'Audi', vehicleModel: 'A4', jobType: 'Engine Tune-up', status: 'completed', hoursQuoted: 4.0, hoursActual: 3.8, revenue: 820, customerRating: 5 },
        { id: 5, date: '2024-11-21', vehicleMake: 'BMW', vehicleModel: 'M3', jobType: 'Transmission Service', status: 'completed', hoursQuoted: 5.0, hoursActual: 4.6, revenue: 1050, customerRating: 5 },
      ],
    },
    {
      id: 2,
      name: 'Sarah Chen',
      efficiency: 93.8,
      productivity: 90.2,
      effectiveness: 96.2,
      billableHours: 92,
      totalHours: 98.1,
      revenuePerDay: 1380,
      jobsCompleted: 26,
      avgJobTime: 3.5,
      certifications: ['ASE Master', 'Mercedes Certified', 'Electrical Systems'],
      status: 'good',
      jobHistory: [
        { id: 1, date: '2024-11-25', vehicleMake: 'Mercedes', vehicleModel: 'C-Class', jobType: 'Electrical Diagnostics', status: 'completed', hoursQuoted: 3.5, hoursActual: 3.2, revenue: 695, customerRating: 5 },
        { id: 2, date: '2024-11-24', vehicleMake: 'Mercedes', vehicleModel: 'E-Class', jobType: 'AC Repair', status: 'completed', hoursQuoted: 4.0, hoursActual: 3.9, revenue: 850, customerRating: 4 },
        { id: 3, date: '2024-11-23', vehicleMake: 'Audi', vehicleModel: 'Q5', jobType: 'Suspension Repair', status: 'completed', hoursQuoted: 3.0, hoursActual: 2.8, revenue: 620, customerRating: 5 },
        { id: 4, date: '2024-11-22', vehicleMake: 'Mercedes', vehicleModel: 'GLC', jobType: 'Brake Replacement', status: 'completed', hoursQuoted: 2.5, hoursActual: 2.4, revenue: 525, customerRating: 5 },
        { id: 5, date: '2024-11-21', vehicleMake: 'BMW', vehicleModel: '540i', jobType: 'Oil Change', status: 'completed', hoursQuoted: 1.0, hoursActual: 0.9, revenue: 195, customerRating: 4 },
      ],
    },
    {
      id: 3,
      name: 'David Thompson',
      efficiency: 91.5,
      productivity: 88.0,
      effectiveness: 96.2,
      billableHours: 89,
      totalHours: 97.3,
      revenuePerDay: 1320,
      jobsCompleted: 24,
      avgJobTime: 3.8,
      certifications: ['ASE Certified', 'Toyota Specialist'],
      status: 'good',
      jobHistory: [
        { id: 1, date: '2024-11-25', vehicleMake: 'Toyota', vehicleModel: 'Camry', jobType: 'Timing Belt', status: 'completed', hoursQuoted: 4.5, hoursActual: 4.2, revenue: 920, customerRating: 5 },
        { id: 2, date: '2024-11-24', vehicleMake: 'Toyota', vehicleModel: 'RAV4', jobType: 'Brake Service', status: 'completed', hoursQuoted: 2.0, hoursActual: 1.9, revenue: 425, customerRating: 4 },
        { id: 3, date: '2024-11-23', vehicleMake: 'Lexus', vehicleModel: 'ES350', jobType: 'Full Service', status: 'completed', hoursQuoted: 3.0, hoursActual: 2.8, revenue: 615, customerRating: 5 },
      ],
    },
    {
      id: 4,
      name: 'James Wilson',
      efficiency: 90.2,
      productivity: 86.7,
      effectiveness: 96.1,
      billableHours: 88,
      totalHours: 97.6,
      revenuePerDay: 1280,
      jobsCompleted: 23,
      avgJobTime: 4.0,
      certifications: ['ASE Certified', 'Transmission Specialist'],
      status: 'warning',
      jobHistory: [
        { id: 1, date: '2024-11-25', vehicleMake: 'Ford', vehicleModel: 'F-150', jobType: 'Transmission Rebuild', status: 'in-progress', hoursQuoted: 8.0, hoursActual: 6.5, revenue: 1650 },
        { id: 2, date: '2024-11-23', vehicleMake: 'Chevrolet', vehicleModel: 'Silverado', jobType: 'Transmission Service', status: 'completed', hoursQuoted: 3.5, hoursActual: 3.8, revenue: 720, customerRating: 3 },
      ],
    },
    {
      id: 5,
      name: 'Emily Martinez',
      efficiency: 94.1,
      productivity: 90.5,
      effectiveness: 96.2,
      billableHours: 93,
      totalHours: 98.8,
      revenuePerDay: 1410,
      jobsCompleted: 27,
      avgJobTime: 3.4,
      certifications: ['ASE Master', 'Audi Specialist', 'Diagnostics Expert'],
      status: 'good',
      jobHistory: [
        { id: 1, date: '2024-11-25', vehicleMake: 'Audi', vehicleModel: 'A6', jobType: 'Engine Diagnostics', status: 'completed', hoursQuoted: 2.5, hoursActual: 2.3, revenue: 515, customerRating: 5 },
        { id: 2, date: '2024-11-24', vehicleMake: 'Audi', vehicleModel: 'Q7', jobType: 'Suspension Work', status: 'completed', hoursQuoted: 4.0, hoursActual: 3.7, revenue: 825, customerRating: 5 },
      ],
    },
    {
      id: 6,
      name: 'Robert Lee',
      efficiency: 89.8,
      productivity: 86.3,
      effectiveness: 96.1,
      billableHours: 87,
      totalHours: 96.9,
      revenuePerDay: 1250,
      jobsCompleted: 22,
      avgJobTime: 4.1,
      certifications: ['ASE Certified', 'Honda Specialist'],
      status: 'warning',
      jobHistory: [
        { id: 1, date: '2024-11-25', vehicleMake: 'Honda', vehicleModel: 'Civic', jobType: 'General Service', status: 'completed', hoursQuoted: 2.0, hoursActual: 2.2, revenue: 410, customerRating: 4 },
      ],
    },
    {
      id: 7,
      name: 'Jessica Brown',
      efficiency: 92.7,
      productivity: 89.1,
      effectiveness: 96.1,
      billableHours: 91,
      totalHours: 98.2,
      revenuePerDay: 1360,
      jobsCompleted: 25,
      avgJobTime: 3.7,
      certifications: ['ASE Certified', 'Ford Specialist', 'Air Conditioning'],
      status: 'good',
      jobHistory: [
        { id: 1, date: '2024-11-25', vehicleMake: 'Ford', vehicleModel: 'Mustang', jobType: 'AC Repair', status: 'completed', hoursQuoted: 3.0, hoursActual: 2.8, revenue: 625, customerRating: 5 },
      ],
    },
    {
      id: 8,
      name: 'Chris Anderson',
      efficiency: 88.4,
      productivity: 85.0,
      effectiveness: 96.2,
      billableHours: 85,
      totalHours: 96.2,
      revenuePerDay: 1180,
      jobsCompleted: 21,
      avgJobTime: 4.3,
      certifications: ['ASE Certified', 'General Maintenance'],
      status: 'warning',
      jobHistory: [
        { id: 1, date: '2024-11-25', vehicleMake: 'Nissan', vehicleModel: 'Altima', jobType: 'Oil Change', status: 'completed', hoursQuoted: 1.0, hoursActual: 1.1, revenue: 195, customerRating: 4 },
      ],
    },
  ];

  // Sample KPI data - in production, this would come from your API
  const kpiData = {
    appointmentFillRate: {
      value: 87.5,
      trend: 5.2,
      target: 90,
      current: 70,
      available: 80,
      status: 'warning' as const,
    },
    revenuePerTechnician: {
      value: 1250,
      trend: 8.3,
      target: 1500,
      avgPerDay: 1250,
      totalTechs: 8,
      status: 'warning' as const,
    },
    grossProfit: {
      value: 42.5,
      trend: -2.1,
      target: 45,
      revenue: 125000,
      cost: 71875,
      status: 'warning' as const,
    },
    technicianEfficiency: {
      value: 92.3,
      trend: 3.5,
      target: 95,
      billableHours: 740,
      totalHours: 802,
      status: 'good' as const,
    },
    technicianProductivity: {
      value: 88.7,
      trend: 4.2,
      target: 90,
      efficiency: 92.3,
      effectiveness: 96.1,
      status: 'warning' as const,
    },
    bayUtilization: {
      value: 78.4,
      trend: -1.5,
      target: 85,
      occupiedHours: 188,
      availableHours: 240,
      totalBays: 6,
      status: 'warning' as const,
    },
  };

  const handleKPIClick = (view: 'revenue' | 'efficiency' | 'productivity') => {
    setSelectedView(view);
    setComparisonMode(false);
    setSelectedForComparison([]);
  };

  const handleTechnicianClick = (tech: TechnicianData) => {
    if (comparisonMode) {
      toggleComparisonSelection(tech.id);
    } else {
      setSelectedTechnician(tech);
    }
  };

  const toggleComparisonSelection = (techId: number) => {
    setSelectedForComparison(prev => {
      if (prev.includes(techId)) {
        return prev.filter(id => id !== techId);
      } else if (prev.length < 3) {
        return [...prev, techId];
      }
      return prev;
    });
  };

  const startComparison = () => {
    setComparisonMode(true);
    setSelectedForComparison([]);
  };

  const viewComparison = () => {
    setSelectedView('revenue');
  };

  const exportTechnicianReport = (tech: TechnicianData) => {
    const reportData = {
      headers: ['Metric', 'Value'],
      rows: [
        ['Technician Name', tech.name],
        ['Efficiency', `${tech.efficiency}%`],
        ['Productivity', `${tech.productivity}%`],
        ['Effectiveness', `${tech.effectiveness}%`],
        ['Billable Hours', `${tech.billableHours}h`],
        ['Total Hours', `${tech.totalHours}h`],
        ['Revenue Per Day', `$${tech.revenuePerDay}`],
        ['Jobs Completed', tech.jobsCompleted],
        ['Avg Job Time', `${tech.avgJobTime}h`],
        ['Status', tech.status === 'good' ? 'On Track' : 'Needs Attention'],
        ['Certifications', tech.certifications.join(', ')],
        ['', ''],
        ['RECENT JOB HISTORY', ''],
        ['Date', 'Vehicle', 'Job Type', 'Hours (Quoted/Actual)', 'Revenue', 'Rating'],
        ...tech.jobHistory.map(job => [
          job.date,
          `${job.vehicleMake} ${job.vehicleModel}`,
          job.jobType,
          `${job.hoursQuoted}h / ${job.hoursActual}h`,
          `$${job.revenue}`,
          job.customerRating ? `${job.customerRating}/5` : 'N/A',
        ]),
      ],
    };

    quickExcelExport(
      `${tech.name} - Performance Report`,
      reportData.headers,
      reportData.rows,
      `${tech.name.toLowerCase().replace(/\s+/g, '-')}-report.xlsx`
    );
  };

  const closeDialog = () => {
    setSelectedView(null);
    setSelectedTechnician(null);
    setComparisonMode(false);
    setSelectedForComparison([]);
  };

  const getDialogTitle = () => {
    if (selectedTechnician) return 'Technician Performance Details';
    switch (selectedView) {
      case 'revenue':
        return 'Revenue Per Technician Breakdown';
      case 'efficiency':
        return 'Technician Efficiency Breakdown';
      case 'productivity':
        return 'Technician Productivity Breakdown';
      default:
        return '';
    }
  };

  const getSortedTechnicians = () => {
    switch (selectedView) {
      case 'revenue':
        return [...technicians].sort((a, b) => b.revenuePerDay - a.revenuePerDay);
      case 'efficiency':
        return [...technicians].sort((a, b) => b.efficiency - a.efficiency);
      case 'productivity':
        return [...technicians].sort((a, b) => b.productivity - a.productivity);
      default:
        return technicians;
    }
  };

  const getComparedTechnicians = () => {
    return technicians.filter(t => selectedForComparison.includes(t.id));
  };

  const renderJobTimeline = (jobs: JobHistoryItem[]) => {
    return (
      <div className="space-y-3">
        {jobs.map((job, idx) => (
          <div key={job.id} className="relative pl-8 pb-4 border-l-2 border-blue-200 last:border-l-0">
            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
            <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-slate-900">
                    {job.vehicleMake} {job.vehicleModel}
                  </div>
                  <div className="text-sm text-slate-600">{job.jobType}</div>
                </div>
                <Badge className={
                  job.status === 'completed' ? 'bg-green-100 text-green-800' :
                  job.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {job.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{new Date(job.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">${job.revenue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">
                    {job.hoursQuoted}h quoted / {job.hoursActual}h actual
                  </span>
                </div>
                {job.customerRating && (
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">{'★'.repeat(job.customerRating)}</span>
                    <span className="text-slate-600 text-xs">({job.customerRating}/5)</span>
                  </div>
                )}
              </div>

              {job.hoursActual < job.hoursQuoted && (
                <div className="mt-2 pt-2 border-t">
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed {((job.hoursQuoted - job.hoursActual) / job.hoursQuoted * 100).toFixed(0)}% faster than quoted
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          {t.kpiTitle}
        </h2>
        <p className="text-slate-600 mt-1">{t.kpiSubtitle}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Appointment Fill Rate */}
        <KPICard
          title={t.aptTitle}
          value={`${kpiData.appointmentFillRate.value}%`}
          subtitle={`${kpiData.appointmentFillRate.current} of ${kpiData.appointmentFillRate.available} slots filled`}
          trend={kpiData.appointmentFillRate.trend}
          target={`${kpiData.appointmentFillRate.target}%`}
          icon={Calendar}
          color="bg-blue-500"
          progress={kpiData.appointmentFillRate.value}
          status={kpiData.appointmentFillRate.status}
        />

        {/* Revenue Per Technician Per Day */}
        <KPICard
          title={`${t.kpiRevenue} / ${t.kpiTechnician}`}
          value={`$${kpiData.revenuePerTechnician.avgPerDay.toLocaleString()}`}
          subtitle={`${kpiData.revenuePerTechnician.totalTechs} technicians active - Click to view details`}
          trend={kpiData.revenuePerTechnician.trend}
          target={`$${kpiData.revenuePerTechnician.target.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-500"
          progress={(kpiData.revenuePerTechnician.avgPerDay / kpiData.revenuePerTechnician.target) * 100}
          status={kpiData.revenuePerTechnician.status}
          onClick={() => handleKPIClick('revenue')}
        />

        {/* Overall Workshop Gross Profit % */}
        <KPICard
          title={t.accGrossProfit}
          value={`${kpiData.grossProfit.value}%`}
          subtitle={`$${(kpiData.grossProfit.revenue - kpiData.grossProfit.cost).toLocaleString()} gross profit`}
          trend={kpiData.grossProfit.trend}
          target={`${kpiData.grossProfit.target}%`}
          icon={TrendingUp}
          color="bg-emerald-500"
          progress={kpiData.grossProfit.value}
          status={kpiData.grossProfit.status}
        />

        {/* Technician Efficiency */}
        <KPICard
          title={`${t.kpiTechnician} ${t.kpiEfficiency}`}
          value={`${kpiData.technicianEfficiency.value}%`}
          subtitle={`${kpiData.technicianEfficiency.billableHours}h billable - Click to view by technician`}
          trend={kpiData.technicianEfficiency.trend}
          target={`${kpiData.technicianEfficiency.target}%`}
          icon={Users}
          color="bg-purple-500"
          progress={kpiData.technicianEfficiency.value}
          status={kpiData.technicianEfficiency.status}
          onClick={() => handleKPIClick('efficiency')}
        />

        {/* Overall Technician Productivity */}
        <KPICard
          title={`${t.kpiTechnician} ${t.kpiProductivity}`}
          value={`${kpiData.technicianProductivity.value}%`}
          subtitle={`Efficiency × Effectiveness - Click for individual breakdown`}
          trend={kpiData.technicianProductivity.trend}
          target={`${kpiData.technicianProductivity.target}%`}
          icon={Target}
          color="bg-orange-500"
          progress={kpiData.technicianProductivity.value}
          status={kpiData.technicianProductivity.status}
          onClick={() => handleKPIClick('productivity')}
        />

        {/* Bay / Hoist / Lift Utilization */}
        <KPICard
          title={`${t.aptBay} ${t.kpiUtilization}`}
          value={`${kpiData.bayUtilization.value}%`}
          subtitle={`${kpiData.bayUtilization.occupiedHours}h occupied / ${kpiData.bayUtilization.availableHours}h available`}
          trend={kpiData.bayUtilization.trend}
          target={`${kpiData.bayUtilization.target}%`}
          icon={Wrench}
          color="bg-indigo-500"
          progress={kpiData.bayUtilization.value}
          status={kpiData.bayUtilization.status}
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              {t.kpiEfficiency} & {t.kpiProductivity}
            </CardTitle>
            <CardDescription>{t.kpiSubtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-purple-900">{t.kpiEfficiency}</p>
                  <p className="text-xs text-purple-700">Billable hours / Total hours</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-900">{kpiData.technicianEfficiency.value}%</p>
                  <p className="text-xs text-purple-700">
                    {kpiData.technicianEfficiency.billableHours} / {kpiData.technicianEfficiency.totalHours}h
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">{t.kpiEffectiveness}</p>
                  <p className="text-xs text-blue-700">Actual vs standard hours</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">{kpiData.technicianProductivity.effectiveness}%</p>
                  <p className="text-xs text-blue-700">Above industry standard</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                <div>
                  <p className="text-sm font-medium text-orange-900">{t.kpiProductivity}</p>
                  <p className="text-xs text-orange-700">Efficiency × Effectiveness</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-900">{kpiData.technicianProductivity.value}%</p>
                  <p className="text-xs text-orange-700">
                    {kpiData.technicianProductivity.efficiency}% × {kpiData.technicianProductivity.effectiveness}%
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-600">
                  <strong>Formula:</strong> Productivity = (Billable Hours / Total Hours) × (Actual Performance / Standard Performance)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bay Utilization Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-indigo-600" />
              {t.aptBay} {t.kpiUtilization}
            </CardTitle>
            <CardDescription>{t.kpiSubtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Total Bays</p>
                <p className="text-2xl font-bold text-slate-900">{kpiData.bayUtilization.totalBays}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Utilization</p>
                <p className="text-2xl font-bold text-indigo-900">{kpiData.bayUtilization.value}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Occupied Hours</span>
                <span className="font-semibold">{kpiData.bayUtilization.occupiedHours}h</span>
              </div>
              <Progress value={(kpiData.bayUtilization.occupiedHours / kpiData.bayUtilization.availableHours) * 100} className="h-2" />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Available Hours</span>
                <span>{kpiData.bayUtilization.availableHours}h</span>
              </div>
            </div>

            <div className="pt-3 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Current vs Target</span>
                <span className={`font-semibold ${kpiData.bayUtilization.value >= kpiData.bayUtilization.target ? 'text-green-600' : 'text-orange-600'}`}>
                  {kpiData.bayUtilization.value >= kpiData.bayUtilization.target ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      On Track
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {(kpiData.bayUtilization.target - kpiData.bayUtilization.value).toFixed(1)}% below target
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-600">
                  <strong>Target:</strong> Aim for 85%+ utilization for optimal workshop capacity
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Summary */}
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {t.kpiTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-3xl font-bold text-green-600">3</div>
              <p className="text-sm text-slate-600 mt-1">On Target KPIs</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">3</div>
              <p className="text-sm text-slate-600 mt-1">Needs Attention</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-3xl font-bold text-slate-900">85.4%</div>
              <p className="text-sm text-slate-600 mt-1">Overall Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technician Drill-Down Dialog */}
      <Dialog open={selectedView !== null || selectedTechnician !== null} onOpenChange={closeDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {selectedTechnician ? (
                <>
                  <User className="h-6 w-6 text-blue-600" />
                  {selectedTechnician.name}
                </>
              ) : comparisonMode && selectedForComparison.length > 0 ? (
                <>
                  <GitCompare className="h-6 w-6 text-purple-600" />
                  Comparing {selectedForComparison.length} Technician{selectedForComparison.length > 1 ? 's' : ''}
                </>
              ) : (
                <>
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  {getDialogTitle()}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTechnician
                ? 'Detailed performance metrics and job history'
                : comparisonMode
                ? `Select ${selectedForComparison.length < 3 ? `${3 - selectedForComparison.length} more` : 'up to 3'} technicians to compare (${selectedForComparison.length}/3 selected)`
                : 'Click on any technician to view details, or use Compare mode'}
            </DialogDescription>
          </DialogHeader>

          {/* Action Buttons */}
          {!selectedTechnician && (
            <div className="flex items-center gap-2 pb-4 border-b">
              {!comparisonMode ? (
                <Button onClick={startComparison} variant="outline" size="sm">
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare Technicians
                </Button>
              ) : (
                <>
                  <Button
                    onClick={viewComparison}
                    disabled={selectedForComparison.length < 2}
                    size="sm"
                  >
                    <GitCompare className="h-4 w-4 mr-2" />
                    View Comparison ({selectedForComparison.length})
                  </Button>
                  <Button
                    onClick={() => {
                      setComparisonMode(false);
                      setSelectedForComparison([]);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}

          {selectedTechnician ? (
            /* Individual Technician Details */
            <div className="space-y-6">
              {/* Export Button */}
              <div className="flex justify-end">
                <Button onClick={() => exportTechnicianReport(selectedTechnician)} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t.exportExcel}
                </Button>
              </div>

              {/* Technician Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      {t.kpiEfficiency}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-900">{selectedTechnician.efficiency}%</div>
                    <p className="text-xs text-blue-700 mt-1">
                      {selectedTechnician.billableHours}h / {selectedTechnician.totalHours}h
                    </p>
                    <Progress value={selectedTechnician.efficiency} className="mt-2 h-2" />
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      {t.kpiRevenue}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-900">
                      ${selectedTechnician.revenuePerDay.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-700 mt-1">Above workshop average</p>
                    <Progress
                      value={(selectedTechnician.revenuePerDay / 1500) * 100}
                      className="mt-2 h-2"
                    />
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      Productivity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-900">{selectedTechnician.productivity}%</div>
                    <p className="text-xs text-orange-700 mt-1">
                      {selectedTechnician.efficiency}% × {selectedTechnician.effectiveness}%
                    </p>
                    <Progress value={selectedTechnician.productivity} className="mt-2 h-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-slate-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-700">Jobs Completed</span>
                      </div>
                      <span className="text-lg font-bold">{selectedTechnician.jobsCompleted}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-700">Avg Job Time</span>
                      </div>
                      <span className="text-lg font-bold">{selectedTechnician.avgJobTime}h</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-700">Effectiveness</span>
                      </div>
                      <span className="text-lg font-bold">{selectedTechnician.effectiveness}%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-slate-700">Status</span>
                      </div>
                      <Badge className={
                        selectedTechnician.status === 'good'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {selectedTechnician.status === 'good' ? 'On Track' : 'Needs Attention'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job History Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Recent Job History
                  </CardTitle>
                  <CardDescription>
                    Last {selectedTechnician.jobHistory.length} completed jobs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderJobTimeline(selectedTechnician.jobHistory)}
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Certifications & Specializations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedTechnician.certifications.map((cert, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-800">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={() => setSelectedTechnician(null)} className="w-full">
                Back to List
              </Button>
            </div>
          ) : comparisonMode && selectedForComparison.length >= 2 ? (
            /* Comparison View */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getComparedTechnicians().map((tech) => (
                  <Card key={tech.id} className="relative border-2 border-purple-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => toggleComparisonSelection(tech.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{tech.name}</CardTitle>
                      <Badge className={
                        tech.status === 'good'
                          ? 'bg-green-100 text-green-800 w-fit'
                          : 'bg-yellow-100 text-yellow-800 w-fit'
                      }>
                        {tech.status === 'good' ? 'On Track' : 'Needs Attention'}
                      </Badge>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Key Metrics */}
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-slate-600 mb-1">Efficiency</div>
                          <div className="text-2xl font-bold text-purple-900">{tech.efficiency}%</div>
                          <Progress value={tech.efficiency} className="h-2 mt-1" />
                        </div>

                        <div>
                          <div className="text-xs text-slate-600 mb-1">Revenue/Day</div>
                          <div className="text-2xl font-bold text-green-900">${tech.revenuePerDay}</div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-600 mb-1">Productivity</div>
                          <div className="text-2xl font-bold text-orange-900">{tech.productivity}%</div>
                          <Progress value={tech.productivity} className="h-2 mt-1" />
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="pt-3 border-t space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Jobs Completed:</span>
                          <span className="font-semibold">{tech.jobsCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Avg Job Time:</span>
                          <span className="font-semibold">{tech.avgJobTime}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Billable Hours:</span>
                          <span className="font-semibold">{tech.billableHours}h</span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setComparisonMode(false);
                          setSelectedTechnician(tech);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Full Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Comparison Summary */}
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Comparison Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-2">Highest Efficiency</div>
                      <div className="font-bold text-lg">
                        {getComparedTechnicians().reduce((max, t) => t.efficiency > max.efficiency ? t : max).name}
                      </div>
                      <div className="text-purple-600 font-semibold">
                        {getComparedTechnicians().reduce((max, t) => t.efficiency > max.efficiency ? t : max).efficiency}%
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-2">Highest Revenue/Day</div>
                      <div className="font-bold text-lg">
                        {getComparedTechnicians().reduce((max, t) => t.revenuePerDay > max.revenuePerDay ? t : max).name}
                      </div>
                      <div className="text-green-600 font-semibold">
                        ${getComparedTechnicians().reduce((max, t) => t.revenuePerDay > max.revenuePerDay ? t : max).revenuePerDay}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-2">Most Jobs Completed</div>
                      <div className="font-bold text-lg">
                        {getComparedTechnicians().reduce((max, t) => t.jobsCompleted > max.jobsCompleted ? t : max).name}
                      </div>
                      <div className="text-blue-600 font-semibold">
                        {getComparedTechnicians().reduce((max, t) => t.jobsCompleted > max.jobsCompleted ? t : max).jobsCompleted} jobs
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Technician List */
            <div className="space-y-3">
              {getSortedTechnicians().map((tech, idx) => (
                <Card
                  key={tech.id}
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    comparisonMode && selectedForComparison.includes(tech.id)
                      ? 'border-2 border-purple-400 bg-purple-50'
                      : 'hover:border-blue-400'
                  }`}
                  onClick={() => handleTechnicianClick(tech)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {comparisonMode && (
                          <div onClick={(e) => e.stopPropagation()}>
                            {selectedForComparison.includes(tech.id) ? (
                              <CheckSquare className="h-5 w-5 text-purple-600" />
                            ) : (
                              <Square className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                          #{idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{tech.name}</h3>
                            <Badge className={
                              tech.status === 'good'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {tech.status === 'good' ? 'On Track' : 'Needs Attention'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                            <span>{tech.jobsCompleted} jobs</span>
                            <span>•</span>
                            <span>{tech.billableHours}h billable</span>
                            <span>•</span>
                            <span>{tech.certifications.length} certifications</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {selectedView === 'revenue' && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              ${tech.revenuePerDay.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-500">per day</div>
                          </div>
                        )}
                        {selectedView === 'efficiency' && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              {tech.efficiency}%
                            </div>
                            <div className="text-xs text-slate-500">efficiency</div>
                          </div>
                        )}
                        {selectedView === 'productivity' && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">
                              {tech.productivity}%
                            </div>
                            <div className="text-xs text-slate-500">productivity</div>
                          </div>
                        )}
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
