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
  Calendar,
  Clock,
  User,
  Car,
  Phone,
  Mail,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Search,
} from 'lucide-react';
import { quickExcelExport } from '@/lib/advanced-excel-export';

interface Appointment {
  id: number;
  appointmentNumber: string;
  date: string;
  time: string;
  duration: number; // in hours
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
  serviceType: string;
  description: string;
  assignedTechnicianId?: number;
  assignedTechnicianName?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  bayNumber?: number;
  estimatedCost?: number;
  notes?: string;
  createdDate: string;
  confirmedDate?: string;
}

const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    appointmentNumber: 'APT-2024-001',
    date: '2024-11-28',
    time: '09:00',
    duration: 2,
    customerId: 1,
    customerName: 'João Silva',
    customerPhone: '+244 923 456 789',
    customerEmail: 'joao.silva@email.ao',
    vehicleMake: 'Toyota',
    vehicleModel: 'Hilux',
    vehiclePlate: 'LD-12-34-AB',
    serviceType: 'Oil Change & Inspection',
    description: 'Regular maintenance - oil change and full vehicle inspection',
    assignedTechnicianId: 1,
    assignedTechnicianName: 'Mike Rodriguez',
    status: 'confirmed',
    bayNumber: 2,
    estimatedCost: 35000,
    notes: 'Customer requested synthetic oil',
    createdDate: '2024-11-20',
    confirmedDate: '2024-11-21',
  },
  {
    id: 2,
    appointmentNumber: 'APT-2024-002',
    date: '2024-11-28',
    time: '10:00',
    duration: 3,
    customerId: 2,
    customerName: 'Maria Costa',
    customerPhone: '+244 923 111 222',
    vehicleMake: 'BMW',
    vehicleModel: '320i',
    vehiclePlate: 'LD-45-67-CD',
    serviceType: 'Brake Service',
    description: 'Brake pads replacement and brake fluid change',
    assignedTechnicianId: 2,
    assignedTechnicianName: 'Sarah Chen',
    status: 'scheduled',
    bayNumber: 1,
    estimatedCost: 85000,
    createdDate: '2024-11-22',
  },
  {
    id: 3,
    appointmentNumber: 'APT-2024-003',
    date: '2024-11-27',
    time: '14:00',
    duration: 1.5,
    customerId: 3,
    customerName: 'Pedro Santos',
    customerPhone: '+244 923 333 444',
    vehicleMake: 'Mercedes',
    vehicleModel: 'C-Class',
    vehiclePlate: 'LD-89-01-EF',
    serviceType: 'Diagnostic',
    description: 'Check engine light diagnostics',
    status: 'in-progress',
    bayNumber: 3,
    estimatedCost: 25000,
    createdDate: '2024-11-26',
    confirmedDate: '2024-11-26',
  },
];

const SERVICE_TYPES = [
  'Oil Change',
  'Brake Service',
  'Tire Service',
  'Engine Diagnostic',
  'Transmission Service',
  'Air Conditioning',
  'Electrical System',
  'Suspension',
  'General Inspection',
  'Other',
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

export default function AppointmentBooking() {
  const [appointments, setAppointments] = useState<Appointment[]>(SAMPLE_APPOINTMENTS);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 2,
    status: 'scheduled',
  });

  const getStatusBadge = (status: Appointment['status']) => {
    const configs = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'in-progress': { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      'no-show': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
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

  const generateAppointmentNumber = () => {
    const year = new Date().getFullYear();
    const count = appointments.length + 1;
    return `APT-${year}-${String(count).padStart(3, '0')}`;
  };

  const saveAppointment = () => {
    const appointment: Appointment = {
      id: Date.now(),
      appointmentNumber: generateAppointmentNumber(),
      date: newAppointment.date!,
      time: newAppointment.time!,
      duration: newAppointment.duration!,
      customerId: Date.now(),
      customerName: newAppointment.customerName!,
      customerPhone: newAppointment.customerPhone!,
      customerEmail: newAppointment.customerEmail,
      vehicleMake: newAppointment.vehicleMake!,
      vehicleModel: newAppointment.vehicleModel!,
      vehiclePlate: newAppointment.vehiclePlate!,
      serviceType: newAppointment.serviceType!,
      description: newAppointment.description!,
      status: 'scheduled',
      estimatedCost: newAppointment.estimatedCost,
      notes: newAppointment.notes,
      createdDate: new Date().toISOString().split('T')[0],
    };

    setAppointments(prev => [appointment, ...prev]);
    setShowNewAppointmentDialog(false);
    setNewAppointment({
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 2,
      status: 'scheduled',
    });
  };

  const updateAppointmentStatus = (id: number, status: Appointment['status']) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === id
          ? {
              ...apt,
              status,
              confirmedDate: status === 'confirmed' ? new Date().toISOString().split('T')[0] : apt.confirmedDate,
            }
          : apt
      )
    );
  };

  const exportAppointments = () => {
    const data = {
      headers: [
        'Appointment #',
        'Date',
        'Time',
        'Customer',
        'Phone',
        'Vehicle',
        'Service Type',
        'Technician',
        'Bay',
        'Status',
        'Est. Cost (Kz)',
      ],
      rows: appointments.map(apt => [
        apt.appointmentNumber,
        new Date(apt.date).toLocaleDateString('pt-AO'),
        apt.time,
        apt.customerName,
        apt.customerPhone,
        `${apt.vehicleMake} ${apt.vehicleModel} (${apt.vehiclePlate})`,
        apt.serviceType,
        apt.assignedTechnicianName || 'Unassigned',
        apt.bayNumber?.toString() || 'N/A',
        apt.status,
        apt.estimatedCost?.toFixed(2) || '',
      ]),
    };

    quickExcelExport('Appointments Schedule', data.headers, data.rows, 'appointments.xlsx');
  };

  const getFilteredAppointments = () => {
    return appointments.filter(apt => {
      const matchesSearch =
        searchTerm === '' ||
        apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointmentNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(apt => apt.date === date);
  };

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    inProgress: appointments.filter(a => a.status === 'in-progress').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Appointment Booking & Scheduling
          </h2>
          <p className="text-slate-600 mt-2">Manage workshop appointments and customer bookings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportAppointments} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowNewAppointmentDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{stats.scheduled}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">Appointment List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Appointments</CardTitle>
                  <CardDescription>View and manage all scheduled appointments</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {getFilteredAppointments().map(apt => (
                <Card key={apt.id} className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-mono font-semibold text-blue-600">
                            {apt.appointmentNumber}
                          </span>
                          {getStatusBadge(apt.status)}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-semibold">
                                {new Date(apt.date).toLocaleDateString('pt-AO')} at {apt.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="h-4 w-4" />
                              <span>Duration: {apt.duration}h</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                              <User className="h-4 w-4" />
                              <span className="font-semibold">{apt.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 mb-1">
                              <Phone className="h-4 w-4" />
                              <span className="text-xs">{apt.customerPhone}</span>
                            </div>
                            {apt.customerEmail && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <Mail className="h-4 w-4" />
                                <span className="text-xs">{apt.customerEmail}</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                              <Car className="h-4 w-4" />
                              <span className="font-semibold">
                                {apt.vehicleMake} {apt.vehicleModel}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mb-1">
                              Plate: {apt.vehiclePlate}
                            </div>
                            <div className="text-xs text-slate-600">
                              Service: {apt.serviceType}
                            </div>
                          </div>
                        </div>

                        {apt.description && (
                          <div className="mt-3 p-2 bg-slate-50 rounded text-sm text-slate-700">
                            {apt.description}
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-4 text-sm">
                          {apt.assignedTechnicianName && (
                            <span className="text-slate-600">
                              Technician: <strong>{apt.assignedTechnicianName}</strong>
                            </span>
                          )}
                          {apt.bayNumber && (
                            <span className="text-slate-600">
                              Bay: <strong>{apt.bayNumber}</strong>
                            </span>
                          )}
                          {apt.estimatedCost && (
                            <span className="text-green-600">
                              Est. Cost: <strong>{formatCurrency(apt.estimatedCost)}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {apt.status === 'scheduled' && (
                          <Button
                            onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm
                          </Button>
                        )}
                        {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                          <Button
                            onClick={() => updateAppointmentStatus(apt.id, 'in-progress')}
                            size="sm"
                            variant="outline"
                          >
                            Start
                          </Button>
                        )}
                        {apt.status === 'in-progress' && (
                          <Button
                            onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            size="sm"
                          >
                            Complete
                          </Button>
                        )}
                        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                          <Button
                            onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>View appointments by date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">
                  Appointments for {new Date(selectedDate).toLocaleDateString('pt-AO')}
                  ({getAppointmentsByDate(selectedDate).length})
                </h3>

                {getAppointmentsByDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No appointments scheduled for this date
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getAppointmentsByDate(selectedDate)
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map(apt => (
                        <Card key={apt.id} className="border-slate-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="font-bold text-lg">{apt.time}</div>
                                  <div className="text-xs text-slate-500">{apt.duration}h</div>
                                </div>
                                <div className="border-l pl-4">
                                  <div className="font-semibold">{apt.customerName}</div>
                                  <div className="text-sm text-slate-600">
                                    {apt.vehicleMake} {apt.vehicleModel} - {apt.serviceType}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {apt.assignedTechnicianName && (
                                  <Badge variant="outline">{apt.assignedTechnicianName}</Badge>
                                )}
                                {getStatusBadge(apt.status)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Appointment Dialog */}
      <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>Schedule a new customer appointment</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Date & Time */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time *</label>
                <select
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                >
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Duration (hours) *</label>
                <input
                  type="number"
                  step="0.5"
                  value={newAppointment.duration}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                />
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={newAppointment.customerName || ''}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    placeholder="João Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={newAppointment.customerPhone || ''}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    placeholder="+244 923 456 789"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newAppointment.customerEmail || ''}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    placeholder="joao@email.ao"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Vehicle Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Make *</label>
                  <input
                    type="text"
                    value={newAppointment.vehicleMake || ''}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, vehicleMake: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Model *</label>
                  <input
                    type="text"
                    value={newAppointment.vehicleModel || ''}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, vehicleModel: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    placeholder="Hilux"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Plate *</label>
                  <input
                    type="text"
                    value={newAppointment.vehiclePlate || ''}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, vehiclePlate: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    placeholder="LD-12-34-AB"
                  />
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Service Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Service Type *</label>
                  <select
                    value={newAppointment.serviceType || ''}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, serviceType: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  >
                    <option value="">Select service type...</option>
                    {SERVICE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                  <textarea
                    value={newAppointment.description || ''}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    rows={3}
                    placeholder="Describe the service required..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Cost (Kz)</label>
                    <input
                      type="number"
                      value={newAppointment.estimatedCost || ''}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) }))}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                      placeholder="35000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bay Number</label>
                    <input
                      type="number"
                      value={newAppointment.bayNumber || ''}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, bayNumber: parseInt(e.target.value) }))}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                      placeholder="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={newAppointment.notes || ''}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    rows={2}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={saveAppointment}
                disabled={
                  !newAppointment.customerName ||
                  !newAppointment.customerPhone ||
                  !newAppointment.vehicleMake ||
                  !newAppointment.vehicleModel ||
                  !newAppointment.vehiclePlate ||
                  !newAppointment.serviceType ||
                  !newAppointment.description
                }
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
