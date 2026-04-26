"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
  Wrench,
  FileText,
  Trash2,
  Receipt,
  ClipboardList,
  LayoutList,
  Table2,
  X,
  Package,
} from 'lucide-react';
import { quickExcelExport } from '@/lib/advanced-excel-export';
import { type CRMCustomer, fullName } from '@/lib/crm-data';
import { type MaintenancePack } from '@/lib/maintenance-packs';
import { type VehicleInspection } from '@/lib/vehicle-inspection';
import type { VehicleInService } from '@/components/VehiclesInService';
import { type Vehicle } from '@/components/VehicleDatabase';
import WalkAroundInspection from '@/components/WalkAroundInspection';
import { type Part } from '@/components/PartsInventory';
import LabourPickerDialog from '@/components/LabourPickerDialog';
import PartsPickerDialog from '@/components/PartsPickerDialog';
import {
  type QuotationItem,
  type Job,
  type Quotation,
  generateJobNumber,
  generateInvoiceNumber,
  generateQuotationNumber,
  calculateQuotationTotals,
  convertJobToInvoice,
  exportInvoiceToPDF,
  exportQuotationToPDF,
} from '@/lib/quotation-invoice';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Appointment {
  id: number;
  appointmentNumber: string;
  date: string;
  time: string;
  duration: number;
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
  serviceAdvisorId?: number;
  serviceAdvisorName?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'no-show' | 'cancelled';
  bayNumber?: number;
  estimatedCost?: number;
  notes?: string;
  createdDate: string;
  confirmedDate?: string;
  jobCardId?: number;
  quotationId?: number;
  walkAroundInspectionId?: number;
}

// ── Sample data ────────────────────────────────────────────────────────────

export const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    appointmentNumber: 'APT-2024-001',
    date: '2026-03-22',
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
    assignedTechnicianName: 'Mike Rodriguez',
    status: 'scheduled',
    bayNumber: 2,
    estimatedCost: 35000,
    createdDate: '2026-03-18',
    confirmedDate: '2026-03-19',
  },
  {
    id: 2,
    appointmentNumber: 'APT-2024-002',
    date: '2026-03-22',
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
    assignedTechnicianName: 'Sarah Chen',
    status: 'scheduled',
    bayNumber: 1,
    estimatedCost: 85000,
    createdDate: '2026-03-20',
  },
  {
    id: 3,
    appointmentNumber: 'APT-2024-003',
    date: '2026-03-22',
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
    status: 'scheduled',
    bayNumber: 3,
    estimatedCost: 25000,
    createdDate: '2026-03-20',
    confirmedDate: '2026-03-20',
  },
];

const SERVICE_ADVISORS = [
  { id: 1, name: 'Carlos Rodrigues' },
  { id: 2, name: 'Maria Fernandes' },
  { id: 3, name: 'João Baptista' },
  { id: 4, name: 'Ana Lopes' },
];

// Fallback used only when no maintenance packs are configured
const FALLBACK_SERVICE_TYPES = [
  'Oil Change', 'Brake Service', 'Tire Service', 'Engine Diagnostic',
  'Transmission Service', 'Air Conditioning', 'Electrical System',
  'Suspension', 'General Inspection', 'Other',
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) => `${n.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`;
const today = () => new Date().toISOString().split('T')[0];
const newItem = (id: number, isLabor: boolean): QuotationItem => ({
  id, description: '', quantity: 1, unitPrice: 0, total: 0, isLabor,
  ...(isLabor ? { estimatedHours: 1 } : { partNumber: '' }),
});

// ── Props ──────────────────────────────────────────────────────────────────

interface AppointmentBookingProps {
  customers?: CRMCustomer[];
  vehicles?: Vehicle[];
  onCustomersChange?: (customers: CRMCustomer[]) => void;
  onVehiclesChange?: (vehicles: Vehicle[]) => void;
  appointments?: Appointment[];
  onAppointmentsChange?: (appointments: Appointment[]) => void;
  onVehicleInService?: (vehicle: VehicleInService) => void;
  maintenancePacks?: MaintenancePack[];
  parts?: Part[];
  onInspectionRequested?: (appointment: Appointment) => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AppointmentBooking({
  customers = [],
  vehicles = [],
  onCustomersChange,
  onVehiclesChange,
  appointments: externalAppointments,
  onAppointmentsChange,
  onVehicleInService,
  maintenancePacks = [],
  parts = [],
  onInspectionRequested,
}: AppointmentBookingProps) {
  const { t, language } = useLanguage();
  const [internalAppointments, setInternalAppointments] = useState<Appointment[]>(SAMPLE_APPOINTMENTS);
  const appointments = externalAppointments ?? internalAppointments;
  const setAppointments = (updater: (prev: Appointment[]) => Appointment[]) => {
    const next = updater(appointments);
    if (!externalAppointments) setInternalAppointments(next);
    onAppointmentsChange?.(next);
  };
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // History view enhancements
  type HistorySortKey = 'date-desc' | 'date-asc' | 'customer-az' | 'status' | 'cost-high' | 'cost-low';
  const [historyViewMode, setHistoryViewMode] = useState<'cards' | 'table'>('table');
  const [expandedCustomerId, setExpandedCustomerId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [historySort, setHistorySort] = useState<HistorySortKey>('date-desc');
  const [filterServiceType, setFilterServiceType] = useState('all');

  // Job card state
  const [jobCards, setJobCards] = useState<Record<number, Job>>({});
  const [showJobCardDialog, setShowJobCardDialog] = useState(false);
  const [activeJobApt, setActiveJobApt] = useState<Appointment | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Quotation state
  const [quotations, setQuotations] = useState<Record<number, Quotation>>({});
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);
  const [activeQuotationApt, setActiveQuotationApt] = useState<Appointment | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [showQuotationPartsPicker, setShowQuotationPartsPicker] = useState(false);
  const [showQuotationLabourPicker, setShowQuotationLabourPicker] = useState(false);

  // Rebook state
  const [showRebookDialog, setShowRebookDialog] = useState(false);
  const [rebookApt, setRebookApt] = useState<Appointment | null>(null);
  const [rebookDate, setRebookDate] = useState('');
  const [rebookTime, setRebookTime] = useState('09:00');

  // Inspection modal state
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionApt, setInspectionApt] = useState<Appointment | null>(null);

  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    date: today(), time: '09:00', duration: 2, status: 'scheduled',
  });

  // Customer / vehicle picker state
  const [customerSearch, setCustomerSearch] = useState('');
  const [pickedCustomer, setPickedCustomer] = useState<CRMCustomer | null>(null);
  const [pickedVehicle, setPickedVehicle] = useState<Vehicle | null>(null);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [newVehicleForm, setNewVehicleForm] = useState({ make: '', model: '', plate: '', year: new Date().getFullYear() });

  // ── Customer / vehicle picker helpers ────────────────────────────────────

  const resetPicker = () => {
    setCustomerSearch('');
    setPickedCustomer(null);
    setPickedVehicle(null);
    setShowCreateCustomer(false);
    setShowCreateVehicle(false);
    setNewCustomerForm({ firstName: '', lastName: '', phone: '', email: '' });
    setNewVehicleForm({ make: '', model: '', plate: '', year: new Date().getFullYear() });
  };

  const pickCustomer = (c: CRMCustomer) => {
    setPickedCustomer(c);
    setPickedVehicle(null);
    setShowCreateCustomer(false);
    setNewAppointment(prev => ({
      ...prev,
      customerId: c.id,
      customerName: fullName(c),
      customerPhone: c.phone,
      customerEmail: c.email,
      vehicleMake: undefined, vehicleModel: undefined, vehiclePlate: undefined,
    }));
  };

  const pickVehicle = (v: Vehicle) => {
    setPickedVehicle(v);
    setShowCreateVehicle(false);
    setNewAppointment(prev => ({
      ...prev,
      vehicleMake: v.make,
      vehicleModel: v.model,
      vehiclePlate: v.plate,
    }));
  };

  const createCustomer = () => {
    const c: CRMCustomer = {
      id: Math.max(0, ...customers.map(x => x.id)) + 1,
      firstName: newCustomerForm.firstName,
      lastName: newCustomerForm.lastName,
      phone: newCustomerForm.phone,
      email: newCustomerForm.email,
      status: 'active',
      customerSince: today(),
      preferredContact: 'phone',
      tags: [],
      notes: [],
    };
    if (onCustomersChange) onCustomersChange([...customers, c]);
    pickCustomer(c);
    setShowCreateCustomer(false);
  };

  const createVehicle = () => {
    if (!pickedCustomer) return;
    const v: Vehicle = {
      id: Date.now(),
      plate: newVehicleForm.plate.toUpperCase(),
      vin: '',
      make: newVehicleForm.make,
      model: newVehicleForm.model,
      year: newVehicleForm.year,
      color: '',
      engineType: '',
      transmission: '',
      currentMileage: 0,
      ownerId: pickedCustomer.id,
      ownerName: fullName(pickedCustomer),
      ownerPhone: pickedCustomer.phone,
      ownerEmail: pickedCustomer.email,
      firstRegistered: today(),
    };
    if (onVehiclesChange) onVehiclesChange([...vehicles, v]);
    pickVehicle(v);
    setShowCreateVehicle(false);
  };

  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.toLowerCase();
    return fullName(c).toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || (c.company ?? '').toLowerCase().includes(q);
  });

  const customerVehicles = pickedCustomer ? vehicles.filter(v => v.ownerId === pickedCustomer.id) : [];

  // ── Status badge ──────────────────────────────────────────────────────────

  const getStatusBadge = (status: Appointment['status']) => {
    const configs: Record<string, { bg: string; text: string; Icon: any }> = {
      scheduled:  { bg: 'bg-blue-100',    text: 'text-blue-800',    Icon: Clock },
      'in-progress': { bg: 'bg-orange-100',  text: 'text-orange-800',  Icon: AlertCircle },
      completed:  { bg: 'bg-emerald-100', text: 'text-emerald-800', Icon: CheckCircle },
      'no-show':  { bg: 'bg-gray-100',    text: 'text-gray-800',    Icon: XCircle },
      cancelled:  { bg: 'bg-red-100',     text: 'text-red-800',     Icon: XCircle },
    };
    const cfg = configs[status];
    const Icon = cfg.Icon;
    return (
      <Badge className={`${cfg.bg} ${cfg.text}`}>
        <Icon className="h-3 w-3 mr-1" />{status}
      </Badge>
    );
  };

  // ── Appointment CRUD ──────────────────────────────────────────────────────

  const generateAppointmentNumber = () => {
    const year = new Date().getFullYear();
    return `APT-${year}-${String(appointments.length + 1).padStart(3, '0')}`;
  };

  const saveAppointment = () => {
    const apt: Appointment = {
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
      bayNumber: newAppointment.bayNumber,
      notes: newAppointment.notes,
      serviceAdvisorId: newAppointment.serviceAdvisorId,
      serviceAdvisorName: newAppointment.serviceAdvisorName,
      createdDate: today(),
    };
    setAppointments(prev => [apt, ...prev]);
    setShowNewAppointmentDialog(false);
    setNewAppointment({ date: today(), time: '09:00', duration: 2, status: 'scheduled' });
    resetPicker();
  };

  const updateAppointmentStatus = (id: number, status: Appointment['status']) => {
    setAppointments(prev => prev.map(apt =>
      apt.id === id ? { ...apt, status } : apt
    ));
  };

  const handleRebook = (apt: Appointment) => {
    setRebookApt(apt);
    setRebookDate(apt.date);
    setRebookTime(apt.time);
    setShowRebookDialog(true);
  };

  const confirmRebook = () => {
    if (!rebookApt || !rebookDate) return;
    const newApt: Appointment = {
      ...rebookApt,
      id: Date.now(),
      appointmentNumber: `APT-${Date.now().toString().slice(-6)}`,
      date: rebookDate,
      time: rebookTime,
      createdDate: today(),
    };
    setAppointments(prev => [...prev, newApt]);
    // Mark original as cancelled
    updateAppointmentStatus(rebookApt.id, 'cancelled');
    setShowRebookDialog(false);
  };

  const handleNoShow = (id: number) => {
    updateAppointmentStatus(id, 'no-show');
  };

  const startInspection = (apt: Appointment) => {
    setInspectionApt(apt);
    setShowInspectionModal(true);
  };

  const handleInspectionComplete = (inspectionId: number) => {
    if (!inspectionApt) return;
    // Mark appointment as in-progress with walkAroundInspectionId
    setAppointments(prev => prev.map(apt =>
      apt.id === inspectionApt.id
        ? {
            ...apt,
            status: 'in-progress',
            walkAroundInspectionId: inspectionId,
          }
        : apt
    ));
    setShowInspectionModal(false);
    // Open job card for this appointment
    openJobCard(inspectionApt);
  };

  // ── Today / History views ─────────────────────────────────────────────────

  const todayStr = today();

  const todayApts = appointments
    .filter(apt => apt.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const historyApts = appointments
    .filter(apt => {
      if (apt.date >= todayStr) return false;
      if (dateFrom && apt.date < dateFrom) return false;
      if (dateTo && apt.date > dateTo) return false;
      const q = searchTerm.toLowerCase();
      if (q && !apt.customerName.toLowerCase().includes(q) && !apt.vehiclePlate.toLowerCase().includes(q) && !apt.appointmentNumber.toLowerCase().includes(q)) return false;
      if (filterStatus !== 'all' && apt.status !== filterStatus) return false;
      if (filterServiceType !== 'all' && apt.serviceType !== filterServiceType) return false;
      return true;
    })
    .sort((a, b) => {
      switch (historySort) {
        case 'date-asc':    return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
        case 'customer-az': return a.customerName.localeCompare(b.customerName);
        case 'status':      return a.status.localeCompare(b.status);
        case 'cost-high':   return (b.estimatedCost ?? 0) - (a.estimatedCost ?? 0);
        case 'cost-low':    return (a.estimatedCost ?? 0) - (b.estimatedCost ?? 0);
        default:            return b.date.localeCompare(a.date) || a.time.localeCompare(b.time);
      }
    });

  const uniqueServiceTypes = Array.from(
    new Set(appointments.filter(apt => apt.date < todayStr).map(apt => apt.serviceType))
  ).sort();

  const exportHistory = () => {
    quickExcelExport(
      'Appointment History',
      ['Appointment #', 'Date', 'Time', 'Customer', 'Phone', 'Vehicle', 'Service Type', 'Technician', 'Bay', 'Status', 'Est. Cost (Kz)'],
      historyApts.map(apt => [
        apt.appointmentNumber,
        new Date(apt.date + 'T12:00:00').toLocaleDateString('pt-AO'),
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
      'appointment-history.xlsx'
    );
  };

  // ── Job Card ──────────────────────────────────────────────────────────────

  const openJobCard = (apt: Appointment) => {
    setActiveJobApt(apt);
    const existing = jobCards[apt.id];
    if (existing) {
      setEditingJob({ ...existing });
    } else {
      const jobNum = generateJobNumber(Object.keys(jobCards).length);
      setEditingJob({
        id: Date.now(),
        jobNumber: jobNum,
        customerId: apt.customerId,
        customerName: apt.customerName,
        vehicleMake: apt.vehicleMake,
        vehicleModel: apt.vehicleModel,
        vehiclePlate: apt.vehiclePlate,
        startDate: today(),
        estimatedCompletionDate: today(),
        status: 'in-progress',
        assignedTechnicianName: apt.assignedTechnicianName,
        items: [],
        subtotal: 0,
        vatAmount: 0,
        total: 0,
        notes: apt.description,
      });
    }
    setShowJobCardDialog(true);
  };

  const addJobItem = (isLabor: boolean) => {
    if (!editingJob) return;
    const id = Date.now();
    setEditingJob(prev => prev ? { ...prev, items: [...prev.items, newItem(id, isLabor)] } : prev);
  };

  const updateJobItem = (idx: number, field: keyof QuotationItem, value: any) => {
    if (!editingJob) return;
    const items = editingJob.items.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      updated.total = updated.quantity * updated.unitPrice;
      return updated;
    });
    const { subtotal, vatAmount, total } = calculateQuotationTotals(items);
    setEditingJob(prev => prev ? { ...prev, items, subtotal, vatAmount, total } : prev);
  };

  const removeJobItem = (idx: number) => {
    if (!editingJob) return;
    const items = editingJob.items.filter((_, i) => i !== idx);
    const { subtotal, vatAmount, total } = calculateQuotationTotals(items);
    setEditingJob(prev => prev ? { ...prev, items, subtotal, vatAmount, total } : prev);
  };

  const saveJobCard = () => {
    if (!editingJob || !activeJobApt) return;
    const isNew = !jobCards[activeJobApt.id];
    setJobCards(prev => ({ ...prev, [activeJobApt.id]: editingJob }));
    setAppointments(prev => prev.map(apt =>
      apt.id === activeJobApt.id ? { ...apt, jobCardId: editingJob.id, status: 'in-progress' } : apt
    ));
    if (isNew && onVehicleInService) {
      const vehicle = vehicles.find(v => v.plate === activeJobApt.vehiclePlate);
      onVehicleInService({
        id: Date.now(),
        jobNumber: editingJob.jobNumber,
        plate: activeJobApt.vehiclePlate,
        make: activeJobApt.vehicleMake,
        model: activeJobApt.vehicleModel,
        year: vehicle?.year ?? new Date().getFullYear(),
        ownerName: activeJobApt.customerName,
        ownerPhone: activeJobApt.customerPhone,
        technicianName: activeJobApt.assignedTechnicianName ?? '',
        bayNumber: activeJobApt.bayNumber,
        serviceType: activeJobApt.serviceType,
        stage: 'on-bay',
        entryDate: today(),
        entryTime: new Date().toTimeString().slice(0, 5),
        estimatedCompletion: editingJob.estimatedCompletionDate,
        notes: editingJob.notes,
      });
    }
    setShowJobCardDialog(false);
  };

  const generateInvoice = () => {
    if (!editingJob || !activeJobApt) return;
    const saved = { ...editingJob, status: 'completed' as const };
    setJobCards(prev => ({ ...prev, [activeJobApt.id]: saved }));
    setAppointments(prev => prev.map(apt =>
      apt.id === activeJobApt.id ? { ...apt, jobCardId: saved.id, status: 'completed' } : apt
    ));
    const invoiceNum = generateInvoiceNumber(Object.keys(jobCards).length);
    const invoice = convertJobToInvoice(saved, invoiceNum);
    exportInvoiceToPDF(invoice, undefined, language);
    setShowJobCardDialog(false);
  };

  // ── Quotation ─────────────────────────────────────────────────────────────

  const openQuotation = (apt: Appointment) => {
    setActiveQuotationApt(apt);
    const existing = quotations[apt.id];
    if (existing) {
      setEditingQuotation({ ...existing });
    } else {
      const qtNum = generateQuotationNumber(Object.keys(quotations).length);
      const validUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setEditingQuotation({
        id: Date.now(),
        quotationNumber: qtNum,
        date: today(),
        validUntil,
        customerId: apt.customerId,
        customerName: apt.customerName,
        customerPhone: apt.customerPhone,
        customerEmail: apt.customerEmail,
        vehicleMake: apt.vehicleMake,
        vehicleModel: apt.vehicleModel,
        vehiclePlate: apt.vehiclePlate,
        items: [],
        subtotal: 0,
        vatRate: 0.14,
        vatAmount: 0,
        total: 0,
        status: 'draft',
        createdBy: 'Workshop',
        notes: apt.description,
      });
    }
    setShowQuotationDialog(true);
  };

  const addQuotationItemsFromPicker = (pickedItems: QuotationItem[]) => {
    if (!editingQuotation) return;
    const items = [...editingQuotation.items, ...pickedItems];
    const { subtotal, vatAmount, total } = calculateQuotationTotals(items, editingQuotation.vatRate);
    setEditingQuotation(prev => prev ? { ...prev, items, subtotal, vatAmount, total } : prev);
  };

  const removeQuotationItem = (idx: number) => {
    if (!editingQuotation) return;
    const items = editingQuotation.items.filter((_, i) => i !== idx);
    const { subtotal, vatAmount, total } = calculateQuotationTotals(items, editingQuotation.vatRate);
    setEditingQuotation(prev => prev ? { ...prev, items, subtotal, vatAmount, total } : prev);
  };

  const saveQuotation = (status?: Quotation['status']) => {
    if (!editingQuotation || !activeQuotationApt) return;
    const qt = status ? { ...editingQuotation, status } : editingQuotation;
    setQuotations(prev => ({ ...prev, [activeQuotationApt.id]: qt }));
    setAppointments(prev => prev.map(apt =>
      apt.id === activeQuotationApt.id ? { ...apt, quotationId: qt.id } : apt
    ));
    if (status === 'sent') exportQuotationToPDF(qt, language);
    setShowQuotationDialog(false);
  };

  // ── Items table (shared by job card and quotation) ────────────────────────

  const ItemsTable = ({
    items, onAdd, onUpdate, onRemove, isLabor,
  }: {
    items: QuotationItem[];
    onAdd: (isLabor: boolean) => void;
    onUpdate: (idx: number, field: keyof QuotationItem, value: any) => void;
    onRemove: (idx: number) => void;
    isLabor: boolean;
  }) => {
    const filtered = items.filter(i => i.isLabor === isLabor);
    const allIdxs = items.reduce<number[]>((acc, item, idx) => {
      if (item.isLabor === isLabor) acc.push(idx);
      return acc;
    }, []);

    return (
      <div className="space-y-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                {isLabor ? (
                  <>
                    <th className="text-left px-3 py-2">Description</th>
                    <th className="text-right px-3 py-2 w-20">Hours</th>
                    <th className="text-right px-3 py-2 w-28">Rate (Kz)</th>
                    <th className="text-right px-3 py-2 w-28">Total (Kz)</th>
                    <th className="w-8" />
                  </>
                ) : (
                  <>
                    <th className="text-left px-3 py-2 w-28">Part #</th>
                    <th className="text-left px-3 py-2">Description</th>
                    <th className="text-right px-3 py-2 w-16">Qty</th>
                    <th className="text-right px-3 py-2 w-28">Unit Price</th>
                    <th className="text-right px-3 py-2 w-28">Total (Kz)</th>
                    <th className="w-8" />
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allIdxs.length === 0 && (
                <tr><td colSpan={isLabor ? 5 : 6} className="text-center text-slate-400 py-4 text-xs">No items yet</td></tr>
              )}
              {allIdxs.map((globalIdx, rowIdx) => {
                const item = items[globalIdx];
                return (
                  <tr key={item.id}>
                    {!isLabor && (
                      <td className="px-2 py-1">
                        <input
                          className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                          value={item.partNumber || ''}
                          onChange={e => onUpdate(globalIdx, 'partNumber', e.target.value)}
                          placeholder="Part #"
                        />
                      </td>
                    )}
                    <td className="px-2 py-1">
                      <input
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                        value={item.description}
                        onChange={e => onUpdate(globalIdx, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number" min="0" step={isLabor ? '0.5' : '1'}
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs text-right"
                        value={isLabor ? (item.estimatedHours ?? item.quantity) : item.quantity}
                        onChange={e => {
                          const v = parseFloat(e.target.value) || 0;
                          onUpdate(globalIdx, isLabor ? 'estimatedHours' : 'quantity', v);
                          onUpdate(globalIdx, 'quantity', v);
                        }}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number" min="0"
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs text-right"
                        value={item.unitPrice}
                        onChange={e => onUpdate(globalIdx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-2 py-1 text-right text-xs font-medium text-slate-700">
                      {item.total.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-1">
                      <button onClick={() => onRemove(globalIdx)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Button size="sm" variant="outline" onClick={() => onAdd(isLabor)} className="text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" /> Add {isLabor ? 'Labour' : 'Part'}
        </Button>
      </div>
    );
  };

  // ── Totals block ──────────────────────────────────────────────────────────

  const TotalsBlock = ({ subtotal, vatAmount, total }: { subtotal: number; vatAmount: number; total: number }) => (
    <div className="border-t pt-3 space-y-1 text-sm text-right">
      <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
      <div className="flex justify-between text-slate-600"><span>VAT (14%)</span><span>{fmt(vatAmount)}</span></div>
      <div className="flex justify-between font-bold text-slate-900 text-base border-t pt-2 mt-1"><span>Total</span><span>{fmt(total)}</span></div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            {t.aptTitle}
          </h2>
          <p className="text-slate-600 mt-2">{t.aptSubtitle}</p>
        </div>
        <Button onClick={() => { resetPicker(); setShowNewAppointmentDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />{t.aptNew}
          </Button>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Today — {new Date(todayStr + 'T12:00:00').toLocaleDateString('pt-AO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </CardTitle>
              <CardDescription>
                {todayApts.length} appointment{todayApts.length !== 1 ? 's' : ''} scheduled
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayApts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            todayApts.map(apt => {
              const jobCard = jobCards[apt.id];
              const quotation = quotations[apt.id];
              return (
                <Card key={apt.id} className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className="font-mono font-semibold text-blue-600">{apt.appointmentNumber}</span>
                          {getStatusBadge(apt.status)}
                          {jobCard && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 font-medium">
                              <Wrench className="h-3 w-3" />{jobCard.jobNumber}
                            </span>
                          )}
                          {apt.walkAroundInspectionId && !jobCard && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700 font-medium">
                              <ClipboardList className="h-3 w-3" />Walk Around Done
                            </span>
                          )}
                          {quotation && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              quotation.status === 'approved' ? 'bg-green-100 text-green-700' :
                              quotation.status === 'sent'     ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              <FileText className="h-3 w-3" />{quotation.quotationNumber} · {quotation.status}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-semibold">{apt.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="h-4 w-4" />
                              <span>{t.aptDuration}: {apt.duration}h</span>
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
                              <span className="font-semibold">{apt.vehicleMake} {apt.vehicleModel}</span>
                            </div>
                            <div className="text-xs text-slate-600 mb-1">Plate: {apt.vehiclePlate}</div>
                            <div className="text-xs text-slate-600">Service: {apt.serviceType}</div>
                          </div>
                        </div>
                        {apt.description && (
                          <div className="mt-3 p-2 bg-slate-50 rounded text-sm text-slate-700">{apt.description}</div>
                        )}
                        <div className="mt-3 flex items-center gap-4 text-sm flex-wrap">
                          {apt.assignedTechnicianName && (
                            <span className="text-slate-600">{t.technician}: <strong>{apt.assignedTechnicianName}</strong></span>
                          )}
                          {apt.bayNumber && (
                            <span className="text-slate-600">{t.aptBay}: <strong>{apt.bayNumber}</strong></span>
                          )}
                          {apt.estimatedCost && (
                            <span className="text-green-600">{t.amount}: <strong>{fmt(apt.estimatedCost)}</strong></span>
                          )}
                          {jobCard && (
                            <span className="text-orange-600">{t.total}: <strong>{fmt(jobCard.total)}</strong></span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {apt.status === 'scheduled' && (
                          <>
                            <Button onClick={() => startInspection(apt)} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                              <ClipboardList className="h-4 w-4 mr-1" />Start Inspection
                            </Button>
                            <Button onClick={() => handleRebook(apt)} size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                              <Calendar className="h-4 w-4 mr-1" />Rebook
                            </Button>
                            <Button onClick={() => handleNoShow(apt.id)} size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                              <XCircle className="h-4 w-4 mr-1" />No Show
                            </Button>
                          </>
                        )}
                        {apt.walkAroundInspectionId && !jobCards[apt.id] && (
                          <Button onClick={() => openQuotation(apt)} size="sm" variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                            <FileText className="h-4 w-4 mr-1" />{t.aptQuotation}
                          </Button>
                        )}
                        {jobCards[apt.id] && (
                          <Button onClick={() => openJobCard(apt)} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                            <Wrench className="h-4 w-4 mr-1" />
                            {t.aptJobCard}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Appointment History */}
      <Card>
        <CardHeader>
          {/* Row 1: Title + View Mode Toggle + Export */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>Appointment History</CardTitle>
              <CardDescription>{historyApts.length} appointment{historyApts.length !== 1 ? 's' : ''}</CardDescription>
            </div>
            <Button onClick={exportHistory} variant="outline">
              <Download className="h-4 w-4 mr-2" />{t.exportExcel}
            </Button>
          </div>

          {/* Row 2: Filters */}
          <div className="flex gap-2 flex-wrap items-center pt-4 border-t border-slate-100">
            {/* Date From */}
            <input
              type="date"
              value={dateFrom}
              max={dateTo || todayStr}
              onChange={e => setDateFrom(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              title="From date"
            />
            <span className="text-slate-400 text-sm">–</span>
            {/* Date To */}
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              max={todayStr}
              onChange={e => setDateTo(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              title="To date"
            />
            {/* Text Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">{t.all}</option>
              <option value="scheduled">{t.statusPending}</option>
              <option value="confirmed">{t.aptConfirmed}</option>
              <option value="in-progress">{t.statusInProgress}</option>
              <option value="completed">{t.statusCompleted}</option>
              <option value="cancelled">{t.statusCancelled}</option>
            </select>
            {/* Service Type Filter */}
            <select
              value={filterServiceType}
              onChange={e => setFilterServiceType(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Services</option>
              {uniqueServiceTypes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {/* Sort */}
            <select
              value={historySort}
              onChange={e => setHistorySort(e.target.value as HistorySortKey)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="date-desc">Date: Newest first</option>
              <option value="date-asc">Date: Oldest first</option>
              <option value="customer-az">Customer: A–Z</option>
              <option value="status">Status</option>
              <option value="cost-high">Cost: High to Low</option>
              <option value="cost-low">Cost: Low to High</option>
            </select>
            {/* Clear All Filters Button */}
            {(dateFrom || dateTo || searchTerm || filterStatus !== 'all' || filterServiceType !== 'all' || historySort !== 'date-desc') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterServiceType('all');
                  setHistorySort('date-desc');
                  setExpandedCustomerId(null);
                }}
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5 mr-1" />Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {historyApts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              {dateFrom || dateTo
                ? `No appointments found${dateFrom ? ` from ${new Date(dateFrom + 'T12:00:00').toLocaleDateString('pt-AO')}` : ''}${dateTo ? ` to ${new Date(dateTo + 'T12:00:00').toLocaleDateString('pt-AO')}` : ''}`
                : 'No previous appointments found'}
            </div>
          ) : historyViewMode === 'cards' ? (
            historyApts.map(apt => {
              const jobCard = jobCards[apt.id];
              const quotation = quotations[apt.id];
              return (
                <Card key={apt.id} className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className="font-mono font-semibold text-blue-600">{apt.appointmentNumber}</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(apt.date + 'T12:00:00').toLocaleDateString('pt-AO', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {getStatusBadge(apt.status)}
                          {jobCard && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 font-medium">
                              <Wrench className="h-3 w-3" />{jobCard.jobNumber}
                            </span>
                          )}
                          {quotation && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              quotation.status === 'approved' ? 'bg-green-100 text-green-700' :
                              quotation.status === 'sent'     ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              <FileText className="h-3 w-3" />{quotation.quotationNumber} · {quotation.status}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-semibold">{new Date(apt.date + 'T12:00:00').toLocaleDateString('pt-AO')} at {apt.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="h-4 w-4" />
                              <span>{t.aptDuration}: {apt.duration}h</span>
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
                              <span className="font-semibold">{apt.vehicleMake} {apt.vehicleModel}</span>
                            </div>
                            <div className="text-xs text-slate-600 mb-1">Plate: {apt.vehiclePlate}</div>
                            <div className="text-xs text-slate-600">Service: {apt.serviceType}</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm flex-wrap">
                          {apt.assignedTechnicianName && (
                            <span className="text-slate-600">{t.technician}: <strong>{apt.assignedTechnicianName}</strong></span>
                          )}
                          {apt.estimatedCost && (
                            <span className="text-green-600">{t.amount}: <strong>{fmt(apt.estimatedCost)}</strong></span>
                          )}
                          {jobCard && (
                            <span className="text-orange-600">{t.total}: <strong>{fmt(jobCard.total)}</strong></span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {apt.status === 'completed' && jobCards[apt.id] && (
                          <Button onClick={() => openJobCard(apt)} size="sm" variant="outline" className="text-slate-600">
                            <Receipt className="h-4 w-4 mr-1" />{t.aptJobCard}
                          </Button>
                        )}
                        {apt.status !== 'cancelled' && (
                          <Button onClick={() => openQuotation(apt)} size="sm" variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                            <FileText className="h-4 w-4 mr-1" />{t.aptQuotation}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                    <th className="text-left px-3 py-2 w-8">#</th>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Time</th>
                    <th className="text-left px-3 py-2">Customer</th>
                    <th className="text-left px-3 py-2">Vehicle / Plate</th>
                    <th className="text-left px-3 py-2">Service</th>
                    <th className="text-left px-3 py-2">Technician</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-right px-3 py-2">Cost</th>
                    <th className="px-3 py-2 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyApts.map((apt, idx) => {
                    const jobCard = jobCards[apt.id];
                    const quotation = quotations[apt.id];
                    return (
                      <React.Fragment key={apt.id}>
                        <tr
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setExpandedCustomerId(
                            expandedCustomerId === apt.customerId ? null : apt.customerId
                          )}
                        >
                          <td className="px-3 py-2 text-slate-400 text-xs">{idx + 1}</td>
                          <td className="px-3 py-2 font-mono text-xs text-slate-600">
                            {new Date(apt.date + 'T12:00:00').toLocaleDateString('pt-AO', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </td>
                          <td className="px-3 py-2 text-slate-600">{apt.time}</td>
                          <td className="px-3 py-2 font-medium">{apt.customerName}</td>
                          <td className="px-3 py-2 text-xs">
                            <span className="text-slate-700">{apt.vehicleMake} {apt.vehicleModel}</span>
                            <br />
                            <span className="font-mono text-slate-500">{apt.vehiclePlate}</span>
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600 max-w-[140px] truncate">
                            {apt.serviceType}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {apt.assignedTechnicianName ?? '—'}
                          </td>
                          <td className="px-3 py-2">{getStatusBadge(apt.status)}</td>
                          <td className="px-3 py-2 text-right text-xs text-green-700 font-medium">
                            {apt.estimatedCost ? fmt(apt.estimatedCost) : '—'}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                              {apt.status === 'completed' && jobCard && (
                                <button
                                  onClick={() => openJobCard(apt)}
                                  title="View Job Card"
                                  className="p-1 rounded hover:bg-orange-100 text-orange-600"
                                >
                                  <Receipt className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {apt.status !== 'cancelled' && (
                                <button
                                  onClick={() => openQuotation(apt)}
                                  title="View Quotation"
                                  className="p-1 rounded hover:bg-purple-100 text-purple-600"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {/* Per-Customer History Panel in Table View */}
                        {expandedCustomerId === apt.customerId && (() => {
                          const customerHistory = appointments
                            .filter(a => a.customerId === apt.customerId && a.date < todayStr && a.id !== apt.id)
                            .sort((a, b) => b.date.localeCompare(a.date));
                          return (
                            <tr key={`${apt.id}-customer-history`} className="bg-blue-50">
                              <td colSpan={10} className="px-4 py-3">
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center justify-between">
                                    <span><User className="h-3 w-3 inline mr-1" />All history for {apt.customerName}</span>
                                    <button onClick={() => setExpandedCustomerId(null)}>
                                      <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                                    </button>
                                  </p>
                                  {customerHistory.map(ha => (
                                    <div key={ha.id} className="flex items-center gap-4 text-xs">
                                      <span className="font-mono text-blue-500 w-28">{ha.appointmentNumber}</span>
                                      <span className="text-slate-500 w-24">
                                        {new Date(ha.date + 'T12:00:00').toLocaleDateString('pt-AO', {
                                          day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                                      </span>
                                      <span className="flex-1 text-slate-600">{ha.serviceType}</span>
                                      {getStatusBadge(ha.status)}
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })()}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Job Card Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={showJobCardDialog} onOpenChange={setShowJobCardDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-600" />
              Job Card — {editingJob?.jobNumber}
            </DialogTitle>
          </DialogHeader>

          {editingJob && activeJobApt && (
            <div className="space-y-5">
              {/* Vehicle / Customer info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">{t.customer}</p>
                  <p className="font-semibold">{activeJobApt.customerName}</p>
                  <p className="text-slate-600">{activeJobApt.customerPhone}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">{t.vehicle}</p>
                  <p className="font-semibold">{activeJobApt.vehicleMake} {activeJobApt.vehicleModel}</p>
                  <p className="font-mono text-slate-600">{activeJobApt.vehiclePlate}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">{t.technician}</p>
                  <p className="font-semibold">{activeJobApt.assignedTechnicianName || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">{t.date}</p>
                  <p className="font-semibold">{editingJob.startDate}</p>
                </div>
              </div>

              {/* Labour */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-orange-500" />{t.aptLabour}
                </h3>
                <ItemsTable
                  items={editingJob.items}
                  onAdd={addJobItem}
                  onUpdate={updateJobItem}
                  onRemove={removeJobItem}
                  isLabor={true}
                />
              </div>

              {/* Parts */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Car className="h-4 w-4 text-blue-500" />{t.aptParts}
                </h3>
                <ItemsTable
                  items={editingJob.items}
                  onAdd={addJobItem}
                  onUpdate={updateJobItem}
                  onRemove={removeJobItem}
                  isLabor={false}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Notes</label>
                <textarea
                  value={editingJob.notes || ''}
                  onChange={e => setEditingJob(prev => prev ? { ...prev, notes: e.target.value } : prev)}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Totals */}
              <TotalsBlock subtotal={editingJob.subtotal} vatAmount={editingJob.vatAmount} total={editingJob.total} />

              {/* Actions */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setShowJobCardDialog(false)}>{t.cancel}</Button>
                <Button variant="outline" onClick={saveJobCard}>
                  {t.aptJobCard}
                </Button>
                <Button
                  onClick={generateInvoice}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={editingJob.items.length === 0}
                >
                  <Receipt className="h-4 w-4 mr-2" />{t.aptCloseJob}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Quotation Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showQuotationDialog} onOpenChange={setShowQuotationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Quotation — {editingQuotation?.quotationNumber}
              {editingQuotation && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-normal ${
                  editingQuotation.status === 'approved' ? 'bg-green-100 text-green-700' :
                  editingQuotation.status === 'sent'     ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{editingQuotation.status}</span>
              )}
            </DialogTitle>
          </DialogHeader>

          {editingQuotation && activeQuotationApt && (
            <div className="space-y-5">
              {/* Vehicle / Customer */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">{t.customer}</p>
                  <p className="font-semibold">{activeQuotationApt.customerName}</p>
                  <p className="text-slate-600">{activeQuotationApt.customerPhone}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">{t.vehicle}</p>
                  <p className="font-semibold">{activeQuotationApt.vehicleMake} {activeQuotationApt.vehicleModel}</p>
                  <p className="font-mono text-slate-600">{activeQuotationApt.vehiclePlate}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">{t.quoValidUntil}</p>
                  <input
                    type="date"
                    value={editingQuotation.validUntil}
                    onChange={e => setEditingQuotation(prev => prev ? { ...prev, validUntil: e.target.value } : prev)}
                    className="border border-slate-200 rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">{t.date}</p>
                  <p className="font-semibold">{editingQuotation.date}</p>
                </div>
              </div>

              {/* Parts & Labour Items */}
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="font-semibold text-slate-900">Parts &amp; Labour</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => setShowQuotationPartsPicker(true)}
                      disabled={parts.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Parts
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      onClick={() => setShowQuotationLabourPicker(true)}
                      disabled={maintenancePacks.filter(p => p.isActive).length === 0}
                    >
                      <Wrench className="h-4 w-4 mr-1" />
                      Add Labour
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-center w-20">Type</th>
                        <th className="px-3 py-2 text-right w-20">Qty / Hrs</th>
                        <th className="px-3 py-2 text-right w-32">Unit Price</th>
                        <th className="px-3 py-2 text-right w-32">Total</th>
                        <th className="px-3 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingQuotation.items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                            No items yet — add parts or labour above
                          </td>
                        </tr>
                      ) : (
                        editingQuotation.items.map((item, idx) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-3 py-2">{item.description}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isLabor ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {item.isLabor ? 'Labour' : 'Part'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">{item.quantity}</td>
                            <td className="px-3 py-2 text-right">{fmt(item.unitPrice)}</td>
                            <td className="px-3 py-2 text-right font-medium">{fmt(item.total)}</td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => removeQuotationItem(idx)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Notes</label>
                <textarea
                  value={editingQuotation.notes || ''}
                  onChange={e => setEditingQuotation(prev => prev ? { ...prev, notes: e.target.value } : prev)}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Totals */}
              <TotalsBlock subtotal={editingQuotation.subtotal} vatAmount={editingQuotation.vatAmount} total={editingQuotation.total} />

              {/* Actions */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setShowQuotationDialog(false)}>{t.cancel}</Button>
                <Button variant="outline" onClick={() => saveQuotation('draft')}>{t.quoSaveDraft}</Button>
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => saveQuotation('sent')}
                  disabled={editingQuotation.items.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />{t.aptSendQuotation}
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => saveQuotation('approved')}
                  disabled={editingQuotation.items.length === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />{t.approve}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quotation Parts & Labour Pickers */}
      <LabourPickerDialog
        open={showQuotationLabourPicker}
        onClose={() => setShowQuotationLabourPicker(false)}
        packs={maintenancePacks.filter(p => p.isActive)}
        onAdd={items => addQuotationItemsFromPicker(items)}
      />
      <PartsPickerDialog
        open={showQuotationPartsPicker}
        onClose={() => setShowQuotationPartsPicker(false)}
        parts={parts}
        onAdd={items => addQuotationItemsFromPicker(items)}
      />

      {/* ── New Appointment Dialog ──────────────────────────────────────────── */}
      <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.aptNew}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
                <input type="date" value={newAppointment.date}
                  min={today()}
                  onChange={e => setNewAppointment(p => ({ ...p, date: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time *</label>
                <select value={newAppointment.time}
                  onChange={e => setNewAppointment(p => ({ ...p, time: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm">
                  {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Duration (hours) *</label>
                <input type="number" step="0.5" value={newAppointment.duration}
                  onChange={e => setNewAppointment(p => ({ ...p, duration: parseFloat(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
              </div>
            </div>

            {/* Customer picker */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />Customer
              </h3>

              {pickedCustomer ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{fullName(pickedCustomer)}</p>
                    <p className="text-sm text-slate-600">{pickedCustomer.phone} · {pickedCustomer.email}</p>
                    {pickedCustomer.company && <p className="text-xs text-slate-500">{pickedCustomer.company}</p>}
                  </div>
                  <button onClick={() => { setPickedCustomer(null); setPickedVehicle(null); setCustomerSearch(''); }} className="text-xs text-slate-400 hover:text-red-500 ml-4">Change</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search customer by name, phone or company..."
                      value={customerSearch}
                      onChange={e => { setCustomerSearch(e.target.value); setShowCreateCustomer(false); }}
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
                      autoComplete="off"
                    />
                  </div>
                  {customerSearch.length > 0 && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(c => (
                          <button key={c.id} onClick={() => pickCustomer(c)}
                            className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors border-b border-slate-100 last:border-0">
                            <p className="font-medium text-slate-900 text-sm">{fullName(c)}</p>
                            <p className="text-xs text-slate-500">{c.phone}{c.company ? ` · ${c.company}` : ''}</p>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500">No customers found.</div>
                      )}
                      <button
                        onClick={() => setShowCreateCustomer(true)}
                        className="w-full text-left px-4 py-2.5 text-orange-600 hover:bg-orange-50 border-t border-slate-200 text-sm font-medium flex items-center gap-2">
                        <Plus className="h-4 w-4" />Create new customer
                      </button>
                    </div>
                  )}
                  {customerSearch.length === 0 && (
                    <button onClick={() => setShowCreateCustomer(true)}
                      className="text-sm text-orange-600 hover:underline flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" />Create new customer
                    </button>
                  )}
                  {showCreateCustomer && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                      <p className="text-sm font-semibold text-slate-700">New Customer</p>
                      <div className="grid grid-cols-2 gap-3">
                        <input placeholder="First name *" value={newCustomerForm.firstName}
                          onChange={e => setNewCustomerForm(p => ({ ...p, firstName: e.target.value }))}
                          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        <input placeholder="Last name *" value={newCustomerForm.lastName}
                          onChange={e => setNewCustomerForm(p => ({ ...p, lastName: e.target.value }))}
                          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        <input placeholder="Phone *" value={newCustomerForm.phone}
                          onChange={e => setNewCustomerForm(p => ({ ...p, phone: e.target.value }))}
                          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        <input placeholder="Email" value={newCustomerForm.email}
                          onChange={e => setNewCustomerForm(p => ({ ...p, email: e.target.value }))}
                          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => setShowCreateCustomer(false)}>Cancel</Button>
                        <Button size="sm" onClick={createCustomer}
                          disabled={!newCustomerForm.firstName || !newCustomerForm.lastName || !newCustomerForm.phone}>
                          Save & Select
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Vehicle picker — only shown after customer is selected */}
            {pickedCustomer && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Car className="h-4 w-4 text-slate-500" />Vehicle
                </h3>

                {pickedVehicle ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">{pickedVehicle.make} {pickedVehicle.model} ({pickedVehicle.year})</p>
                      <p className="font-mono text-sm text-slate-600">{pickedVehicle.plate}</p>
                    </div>
                    <button onClick={() => setPickedVehicle(null)} className="text-xs text-slate-400 hover:text-red-500 ml-4">Change</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerVehicles.length > 0 ? (
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        {customerVehicles.map(v => (
                          <button key={v.id} onClick={() => pickVehicle(v)}
                            className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors border-b border-slate-100 last:border-0 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm text-slate-900">{v.make} {v.model} ({v.year})</p>
                              <p className="font-mono text-xs text-slate-500">{v.plate}</p>
                            </div>
                            <span className="text-xs text-orange-600">Select</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No vehicles on record for this customer.</p>
                    )}
                    <button onClick={() => setShowCreateVehicle(v => !v)}
                      className="text-sm text-orange-600 hover:underline flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" />Add new vehicle
                    </button>
                    {showCreateVehicle && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                        <p className="text-sm font-semibold text-slate-700">New Vehicle</p>
                        <div className="grid grid-cols-2 gap-3">
                          <input placeholder="Make *" value={newVehicleForm.make}
                            onChange={e => setNewVehicleForm(p => ({ ...p, make: e.target.value }))}
                            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                          <input placeholder="Model *" value={newVehicleForm.model}
                            onChange={e => setNewVehicleForm(p => ({ ...p, model: e.target.value }))}
                            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                          <input placeholder="Plate *" value={newVehicleForm.plate}
                            onChange={e => setNewVehicleForm(p => ({ ...p, plate: e.target.value.toUpperCase() }))}
                            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-mono" />
                          <input type="number" placeholder="Year" value={newVehicleForm.year}
                            onChange={e => setNewVehicleForm(p => ({ ...p, year: parseInt(e.target.value) }))}
                            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setShowCreateVehicle(false)}>Cancel</Button>
                          <Button size="sm" onClick={createVehicle}
                            disabled={!newVehicleForm.make || !newVehicleForm.model || !newVehicleForm.plate}>
                            Save & Select
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Service */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Service Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Service Type *</label>
                  {(() => {
                    const vehicleMake = pickedVehicle?.make ?? '';
                    const activePacks = maintenancePacks.filter(p => {
                      if (!p.isActive) return false;
                      const makes = Array.isArray(p.applicableMakes) ? p.applicableMakes : (typeof p.applicableMakes === 'string' ? JSON.parse(p.applicableMakes) : []);
                      if (!vehicleMake || !makes?.length) return true;
                      return makes.some((m: any) => m.toLowerCase() === vehicleMake.toLowerCase());
                    });
                    const categories = Array.from(new Set(activePacks.map(p => p.category)));
                    return (
                      <>
                        {vehicleMake && activePacks.length < maintenancePacks.filter(p => p.isActive).length && (
                          <p className="text-xs text-blue-600 mb-1 flex items-center gap-1">
                            <Car className="h-3 w-3" />
                            Showing packs for <strong className="ml-0.5">{vehicleMake}</strong>
                          </p>
                        )}
                        <select value={newAppointment.serviceType || ''}
                          onChange={e => {
                            const selectedType = e.target.value;
                            const pack = maintenancePacks.find(p => p.name === selectedType);
                            setNewAppointment(prev => ({
                              ...prev,
                              serviceType: selectedType,
                              estimatedCost: pack ? pack.totalAmount : prev.estimatedCost,
                            }));
                          }}
                          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm">
                          <option value="">Select service type...</option>
                          {activePacks.length > 0 ? (
                            categories.map(cat => (
                              <optgroup key={cat} label={cat}>
                                {activePacks.filter(p => p.category === cat).map(p => (
                                  <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                              </optgroup>
                            ))
                          ) : (
                            FALLBACK_SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)
                          )}
                        </select>
                      </>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                  <textarea value={newAppointment.description || ''}
                    onChange={e => setNewAppointment(p => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" rows={3}
                    placeholder="Describe the service required..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Estimated Cost (Kz)
                      {maintenancePacks.some(p => p.name === newAppointment.serviceType) && (
                        <span className="ml-2 text-xs text-teal-600 font-normal">from pack</span>
                      )}
                    </label>
                    <input type="number" value={newAppointment.estimatedCost || ''}
                      onChange={e => setNewAppointment(p => ({ ...p, estimatedCost: parseFloat(e.target.value) }))}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" placeholder="35000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bay Number</label>
                    <input type="number" value={newAppointment.bayNumber || ''}
                      onChange={e => setNewAppointment(p => ({ ...p, bayNumber: parseInt(e.target.value) }))}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" placeholder="1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Service Advisor</label>
                  <select
                    value={newAppointment.serviceAdvisorName || ''}
                    onChange={e => {
                      const adv = SERVICE_ADVISORS.find(a => a.name === e.target.value);
                      setNewAppointment(p => ({ ...p, serviceAdvisorName: e.target.value, serviceAdvisorId: adv?.id }));
                    }}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  >
                    <option value="">Select service advisor…</option>
                    {SERVICE_ADVISORS.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                  <textarea value={newAppointment.notes || ''}
                    onChange={e => setNewAppointment(p => ({ ...p, notes: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" rows={2}
                    placeholder="Additional notes..." />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>Cancel</Button>
              <Button
                onClick={saveAppointment}
                disabled={!pickedCustomer || !pickedVehicle || !newAppointment.serviceType || !newAppointment.description}
              >
                <CheckCircle className="h-4 w-4 mr-2" />Create Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rebook Dialog */}
      <Dialog open={showRebookDialog} onOpenChange={setShowRebookDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          {rebookApt && (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">{rebookApt.appointmentNumber}</p>
                <p className="font-medium">{rebookApt.customerName}</p>
                <p className="text-sm text-slate-600">{rebookApt.vehicleMake} {rebookApt.vehicleModel}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Date</label>
                <input
                  type="date"
                  value={rebookDate}
                  onChange={e => setRebookDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Time</label>
                <select
                  value={rebookTime}
                  onChange={e => setRebookTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                >
                  {TIME_SLOTS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowRebookDialog(false)} className="flex-1">Cancel</Button>
                <Button onClick={confirmRebook} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Reschedule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Inspection Modal - Using WalkAroundInspection Component */}
      <Dialog open={showInspectionModal} onOpenChange={setShowInspectionModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {inspectionApt && (
            <div className="space-y-4">
              {/* Appointment & Vehicle Details Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Details */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Customer Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-600">Name:</span>
                        <div className="font-medium text-slate-900">{inspectionApt.customerName}</div>
                      </div>
                      <div>
                        <span className="text-slate-600">Phone:</span>
                        <div className="font-medium text-slate-900">{inspectionApt.customerPhone}</div>
                      </div>
                      {inspectionApt.customerEmail && (
                        <div>
                          <span className="text-slate-600">Email:</span>
                          <div className="font-medium text-slate-900 break-all">{inspectionApt.customerEmail}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Car className="h-5 w-5 text-blue-600" />
                      Vehicle Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-600">Make & Model:</span>
                        <div className="font-medium text-slate-900">{inspectionApt.vehicleMake} {inspectionApt.vehicleModel}</div>
                      </div>
                      <div>
                        <span className="text-slate-600">License Plate:</span>
                        <div className="font-mono font-bold text-slate-900 text-lg">{inspectionApt.vehiclePlate}</div>
                      </div>
                      <div>
                        <span className="text-slate-600">Service Type:</span>
                        <div className="font-medium text-slate-900">{inspectionApt.serviceType}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Appointment #</span>
                    <div className="font-mono font-semibold text-blue-600">{inspectionApt.appointmentNumber}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Date & Time</span>
                    <div className="font-medium text-slate-900">{new Date(inspectionApt.date).toLocaleDateString('pt-AO')} at {inspectionApt.time}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Duration</span>
                    <div className="font-medium text-slate-900">{inspectionApt.duration} hours</div>
                  </div>
                </div>

                {inspectionApt.description && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <span className="text-slate-600 text-sm">Notes:</span>
                    <div className="text-sm text-slate-700 mt-1 bg-white rounded px-3 py-2">{inspectionApt.description}</div>
                  </div>
                )}
              </div>

              {/* Walk Around Inspection Form */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-teal-600" />
                  Walk-Around Inspection
                </h3>
              </div>

              <WalkAroundInspection
                inspections={[]}
                onInspectionsChange={(inspections) => {
                  if (inspections.length > 0) {
                    handleInspectionComplete(inspections[0].id);
                  }
                }}
                customers={[{
                  id: inspectionApt.customerId,
                  firstName: inspectionApt.customerName.split(' ')[0] || '',
                  lastName: inspectionApt.customerName.split(' ').slice(1).join(' ') || '',
                  phone: inspectionApt.customerPhone,
                  email: inspectionApt.customerEmail || '',
                  status: 'active',
                  customerSince: '',
                  preferredContact: 'phone',
                  tags: [],
                  notes: [],
                }]}
                vehicles={[{
                  id: Date.now(),
                  plate: inspectionApt.vehiclePlate,
                  vin: '',
                  make: inspectionApt.vehicleMake,
                  model: inspectionApt.vehicleModel,
                  year: new Date().getFullYear(),
                  color: '',
                  engineType: '',
                  transmission: '',
                  currentMileage: 0,
                  ownerId: inspectionApt.customerId,
                  ownerName: inspectionApt.customerName,
                  ownerPhone: inspectionApt.customerPhone || '',
                  ownerEmail: inspectionApt.customerEmail || '',
                  firstRegistered: '',
                }]}
                appointments={[inspectionApt]}
                onAppointmentsChange={(apts) => setAppointments(() => apts)}
                maintenancePacks={[]}
                parts={[]}
                onVehicleInService={() => {}}
                vehiclesInService={[]}
                onVehiclesInServiceChange={() => {}}
                initialAppointment={inspectionApt}
                autoOpenForm={true}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
