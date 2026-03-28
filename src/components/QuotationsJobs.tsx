"use client";

import { useState } from 'react';
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
  FileText,
  Plus,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Wrench,
  DollarSign,
  User,
  Car,
  Calendar,
  Star,
  Search,
} from 'lucide-react';
import { type CRMCustomer, fullName } from '@/lib/crm-data';
import { type Vehicle } from '@/components/VehicleDatabase';
import {
  type Quotation,
  type QuotationItem,
  type Job,
  SAMPLE_QUOTATIONS,
  SAMPLE_JOBS,
  generateQuotationNumber,
  generateJobNumber,
  generateInvoiceNumber,
  calculateQuotationTotals,
  convertQuotationToJob,
  convertJobToInvoice,
  exportQuotationToPDF,
  exportInvoiceToPDF,
} from '@/lib/quotation-invoice';
import { generateEntriesFromInvoice, type AccountingTransaction } from '@/lib/chart-of-accounts';
import { validateTransaction } from '@/lib/chart-of-accounts';
import type { Part } from '@/components/PartsInventory';
import type { MaintenancePack } from '@/lib/maintenance-packs';
import PartsPickerDialog from '@/components/PartsPickerDialog';
import LabourPickerDialog from '@/components/LabourPickerDialog';

interface QuotationsJobsProps {
  onInvoiceCreated?: (transaction: AccountingTransaction) => void;
  customers?: CRMCustomer[];
  vehicles?: Vehicle[];
  onCustomersChange?: (c: CRMCustomer[]) => void;
  onVehiclesChange?: (v: Vehicle[]) => void;
  parts?: Part[];
  maintenancePacks?: MaintenancePack[];
  jobs?: Job[];
  onJobsChange?: (jobs: Job[]) => void;
}

export default function QuotationsJobs({
  onInvoiceCreated,
  customers = [],
  vehicles = [],
  onCustomersChange,
  onVehiclesChange,
  parts = [],
  maintenancePacks = [],
  jobs: externalJobs,
  onJobsChange,
}: QuotationsJobsProps) {
  const { t, language } = useLanguage();
  const [quotations, setQuotations] = useState<Quotation[]>(SAMPLE_QUOTATIONS);
  const [internalJobs, setInternalJobs] = useState<Job[]>(SAMPLE_JOBS);
  const jobs = externalJobs ?? internalJobs;
  const setJobs = (updater: Job[] | ((prev: Job[]) => Job[])) => {
    const next = typeof updater === 'function' ? updater(jobs) : updater;
    if (onJobsChange) onJobsChange(next);
    else setInternalJobs(next);
  };
  const [showNewQuotationDialog, setShowNewQuotationDialog] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showPartsPicker, setShowPartsPicker] = useState(false);
  const [showLabourPicker, setShowLabourPicker] = useState(false);

  // Job card editing
  const [jobItems, setJobItems] = useState<QuotationItem[]>([]);
  const [showJobPartsPicker, setShowJobPartsPicker] = useState(false);
  const [showJobLabourPicker, setShowJobLabourPicker] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [newQuotation, setNewQuotation] = useState<Partial<Quotation>>({
    date: today,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    vatRate: 0.14,
    status: 'draft',
  });

  // Customer / vehicle picker
  const [customerSearch, setCustomerSearch] = useState('');
  const [pickedCustomer, setPickedCustomer] = useState<CRMCustomer | null>(null);
  const [pickedVehicle, setPickedVehicle] = useState<Vehicle | null>(null);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [newVehicleForm, setNewVehicleForm] = useState({ make: '', model: '', plate: '', year: new Date().getFullYear() });

  const resetPicker = () => {
    setCustomerSearch(''); setPickedCustomer(null); setPickedVehicle(null);
    setShowCreateCustomer(false); setShowCreateVehicle(false);
    setNewCustomerForm({ firstName: '', lastName: '', phone: '', email: '' });
    setNewVehicleForm({ make: '', model: '', plate: '', year: new Date().getFullYear() });
  };

  const pickCustomer = (c: CRMCustomer) => {
    setPickedCustomer(c); setPickedVehicle(null); setShowCreateCustomer(false);
    setNewQuotation(prev => ({ ...prev, customerId: c.id, customerName: fullName(c), customerPhone: c.phone, customerEmail: c.email, vehicleMake: undefined, vehicleModel: undefined, vehiclePlate: undefined, vehicleYear: undefined }));
  };

  const pickVehicle = (v: Vehicle) => {
    setPickedVehicle(v); setShowCreateVehicle(false);
    setNewQuotation(prev => ({ ...prev, vehicleMake: v.make, vehicleModel: v.model, vehiclePlate: v.plate, vehicleYear: v.year }));
  };

  const createCustomer = () => {
    const c: CRMCustomer = {
      id: Date.now(), firstName: newCustomerForm.firstName, lastName: newCustomerForm.lastName,
      phone: newCustomerForm.phone, email: newCustomerForm.email,
      status: 'active', customerSince: today, preferredContact: 'phone', tags: [], notes: [],
    };
    if (onCustomersChange) onCustomersChange([...customers, c]);
    pickCustomer(c); setShowCreateCustomer(false);
  };

  const createVehicle = () => {
    if (!pickedCustomer) return;
    const v: Vehicle = {
      id: Date.now(), plate: newVehicleForm.plate.toUpperCase(), vin: '',
      make: newVehicleForm.make, model: newVehicleForm.model, year: newVehicleForm.year,
      color: '', engineType: '', transmission: '', currentMileage: 0,
      ownerId: pickedCustomer.id, ownerName: fullName(pickedCustomer),
      ownerPhone: pickedCustomer.phone, ownerEmail: pickedCustomer.email,
      firstRegistered: today,
    };
    if (onVehiclesChange) onVehiclesChange([...vehicles, v]);
    pickVehicle(v); setShowCreateVehicle(false);
  };

  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.toLowerCase();
    return fullName(c).toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || (c.company ?? '').toLowerCase().includes(q);
  });

  const customerVehicles = pickedCustomer ? vehicles.filter(v => v.ownerId === pickedCustomer.id) : [];

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      invoiced: 'bg-purple-100 text-purple-800',
      paid: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      draft: Clock,
      sent: FileText,
      approved: CheckCircle,
      rejected: XCircle,
      pending: Clock,
      'in-progress': Wrench,
      completed: CheckCircle,
      invoiced: DollarSign,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`;
  };

  const addQuotationItem = () => {
    setNewQuotation(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        { id: Date.now(), description: '', quantity: 1, unitPrice: 0, isLabor: false, total: 0 },
      ],
    }));
  };

  const addPickedItems = (newItems: QuotationItem[]) => {
    setNewQuotation(prev => {
      const items = [...(prev.items || []), ...newItems];
      const totals = calculateQuotationTotals(items, prev.vatRate || 0.14);
      return { ...prev, items, ...totals };
    });
  };

  const openJobDialog = (job: Job) => {
    setSelectedJob(job);
    setJobItems(job.items.map(i => ({ ...i })));
    setShowJobDialog(true);
  };

  const addJobPickedItems = (newItems: QuotationItem[]) => {
    setJobItems(prev => [...prev, ...newItems]);
  };

  const removeJobItem = (index: number) => {
    setJobItems(prev => prev.filter((_, i) => i !== index));
  };

  const saveJobItems = () => {
    if (!selectedJob) return;
    const { subtotal, vatAmount, total } = calculateQuotationTotals(jobItems, 0.14);
    setJobs(prev => prev.map(j =>
      j.id === selectedJob.id
        ? { ...j, items: jobItems, subtotal, vatAmount, total }
        : j
    ));
    setShowJobDialog(false);
  };

  const updateQuotationItem = (index: number, field: keyof QuotationItem, value: any) => {
    setNewQuotation(prev => {
      const items = [...(prev.items || [])];
      items[index] = { ...items[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        items[index].total = items[index].quantity * items[index].unitPrice;
      }

      const totals = calculateQuotationTotals(items, prev.vatRate || 0.14);

      return { ...prev, items, ...totals };
    });
  };

  const removeQuotationItem = (index: number) => {
    setNewQuotation(prev => {
      const items = (prev.items || []).filter((_, i) => i !== index);
      const totals = calculateQuotationTotals(items, prev.vatRate || 0.14);
      return { ...prev, items, ...totals };
    });
  };

  const saveQuotation = () => {
    const quotationNumber = generateQuotationNumber(quotations.length);

    const completeQuotation: Quotation = {
      id: Date.now(),
      quotationNumber,
      date: newQuotation.date!,
      validUntil: newQuotation.validUntil!,
      customerId: pickedCustomer?.id ?? Date.now(),
      customerName: newQuotation.customerName!,
      customerEmail: newQuotation.customerEmail,
      customerPhone: newQuotation.customerPhone,
      vehicleMake: newQuotation.vehicleMake!,
      vehicleModel: newQuotation.vehicleModel!,
      vehicleYear: newQuotation.vehicleYear,
      vehiclePlate: newQuotation.vehiclePlate!,
      items: newQuotation.items!,
      subtotal: newQuotation.subtotal!,
      vatRate: newQuotation.vatRate!,
      vatAmount: newQuotation.vatAmount!,
      total: newQuotation.total!,
      notes: newQuotation.notes,
      status: 'draft',
      createdBy: 'User',
    };

    setQuotations(prev => [completeQuotation, ...prev]);
    setShowNewQuotationDialog(false);
    resetPicker();
    setNewQuotation({
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      vatRate: 0.14,
      status: 'draft',
    });
  };

  const approveQuotation = (quotationId: number) => {
    setQuotations(prev =>
      prev.map(q =>
        q.id === quotationId
          ? { ...q, status: 'approved' as const, approvedDate: new Date().toISOString().split('T')[0] }
          : q
      )
    );
  };

  const convertToJob = (quotation: Quotation) => {
    const jobNumber = generateJobNumber(jobs.length);
    const job = convertQuotationToJob(quotation, jobNumber, 1, 'Mike Rodriguez');

    setJobs(prev => [job, ...prev]);
    setQuotations(prev =>
      prev.map(q =>
        q.id === quotation.id
          ? { ...q, status: 'approved' as const }
          : q
      )
    );
  };

  const updateJobStatus = (jobId: number, status: Job['status']) => {
    setJobs(prev =>
      prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              status,
              actualCompletionDate: status === 'completed' ? new Date().toISOString().split('T')[0] : j.actualCompletionDate,
            }
          : j
      )
    );
  };

  const createInvoiceFromJob = (job: Job) => {
    const invoiceNumber = generateInvoiceNumber(quotations.length + jobs.length);
    const invoice = convertJobToInvoice(job, invoiceNumber);

    // Generate accounting entries
    const entries = generateEntriesFromInvoice(invoice);
    const validation = validateTransaction(entries);

    const transaction: AccountingTransaction = {
      id: Date.now(),
      date: invoice.date,
      reference: invoice.invoiceNumber,
      description: `Invoice - ${invoice.customerName} - ${job.vehicleMake} ${job.vehicleModel}`,
      entries,
      totalDebit: validation.totalDebit,
      totalCredit: validation.totalCredit,
      status: 'posted',
      createdBy: 'System (Auto from Invoice)',
    };

    // Update job status
    setJobs(prev =>
      prev.map(j =>
        j.id === job.id
          ? { ...j, status: 'invoiced' as const }
          : j
      )
    );

    // Notify parent component about new invoice
    if (onInvoiceCreated) {
      onInvoiceCreated(transaction);
    }

    // Export invoice PDF
    exportInvoiceToPDF(invoice, job, language);

    alert(`Invoice ${invoiceNumber} created successfully! Accounting entry posted automatically.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            {t.quoTitle}
          </h2>
          <p className="text-slate-600 mt-2">{t.quoSubtitle}</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              {t.quoTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{quotations.length}</div>
            <div className="text-xs text-blue-700 mt-1">
              {quotations.filter(q => q.status === 'approved').length} approved
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="h-4 w-4 text-orange-600" />
              {t.statusInProgress}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {jobs.filter(j => j.status === 'in-progress' || j.status === 'pending').length}
            </div>
            <div className="text-xs text-orange-700 mt-1">
              {jobs.filter(j => j.status === 'in-progress').length} in progress
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {t.statusCompleted}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {jobs.filter(j => j.status === 'completed').length}
            </div>
            <div className="text-xs text-green-700 mt-1">
              Ready to invoice
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              {t.total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(jobs.reduce((sum, j) => sum + j.total, 0))}
            </div>
            <div className="text-xs text-purple-700 mt-1">
              All jobs
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="quotations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="quotations">{t.quotation}</TabsTrigger>
          <TabsTrigger value="jobs">{t.job}</TabsTrigger>
        </TabsList>

        {/* Quotations Tab */}
        <TabsContent value="quotations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t.quotation}</CardTitle>
                  <CardDescription>{t.quoSubtitle}</CardDescription>
                </div>
                <Button onClick={() => { resetPicker(); setShowNewQuotationDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.quoNew}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {quotations.map(quotation => (
                <Card key={quotation.id} className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-semibold text-blue-600">
                            {quotation.quotationNumber}
                          </span>
                          <Badge className={getStatusBadge(quotation.status)}>
                            {getStatusIcon(quotation.status)}
                            <span className="ml-1">{quotation.status}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <User className="h-4 w-4" />
                              <span className="font-semibold">{quotation.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 mt-1">
                              <Car className="h-4 w-4" />
                              <span>{quotation.vehicleMake} {quotation.vehicleModel} ({quotation.vehiclePlate})</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="h-4 w-4" />
                              <span>Created: {new Date(quotation.date).toLocaleDateString('pt-AO')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 mt-1">
                              <Clock className="h-4 w-4" />
                              <span>Valid until: {new Date(quotation.validUntil).toLocaleDateString('pt-AO')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">{quotation.items.length} items</span>
                            <div className="text-right">
                              <div className="text-xs text-slate-500">Total Amount</div>
                              <div className="text-xl font-bold text-green-600">{formatCurrency(quotation.total)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => exportQuotationToPDF(quotation, language)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>

                        {quotation.status === 'draft' && (
                          <Button
                            onClick={() => {
                              setQuotations(prev =>
                                prev.map(q =>
                                  q.id === quotation.id ? { ...q, status: 'sent' as const } : q
                                )
                              );
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Send
                          </Button>
                        )}

                        {quotation.status === 'sent' && (
                          <Button
                            onClick={() => approveQuotation(quotation.id)}
                            variant="outline"
                            size="sm"
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        )}

                        {quotation.status === 'approved' && (
                          <Button
                            onClick={() => convertToJob(quotation)}
                            size="sm"
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Create Job
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

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>{t.job}</CardTitle>
              <CardDescription>{t.quoSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobs.map(job => (
                <Card key={job.id} className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-semibold text-orange-600">
                            {job.jobNumber}
                          </span>
                          <Badge className={getStatusBadge(job.status)}>
                            {getStatusIcon(job.status)}
                            <span className="ml-1">{job.status}</span>
                          </Badge>
                          {job.quotationNumber && (
                            <span className="text-xs text-slate-500">
                              From {job.quotationNumber}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <User className="h-4 w-4" />
                              <span className="font-semibold">{job.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 mt-1">
                              <Car className="h-4 w-4" />
                              <span>{job.vehicleMake} {job.vehicleModel}</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Wrench className="h-4 w-4" />
                              <span>{job.assignedTechnicianName || 'Unassigned'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 mt-1">
                              <Calendar className="h-4 w-4" />
                              <span>Started: {new Date(job.startDate).toLocaleDateString('pt-AO')}</span>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-slate-500">Est. Completion</div>
                            <div className="text-sm font-semibold">
                              {new Date(job.estimatedCompletionDate).toLocaleDateString('pt-AO')}
                            </div>
                            {job.actualCompletionDate && (
                              <>
                                <div className="text-xs text-slate-500 mt-1">Completed</div>
                                <div className="text-sm font-semibold">
                                  {new Date(job.actualCompletionDate).toLocaleDateString('pt-AO')}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {job.customerRating && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                              <span className="text-sm font-semibold">{job.customerRating}/5</span>
                              {job.customerFeedback && (
                                <span className="text-xs text-slate-600">- {job.customerFeedback}</span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">{job.items.length} items</span>
                            <div className="text-right">
                              <div className="text-xs text-slate-500">Total Amount</div>
                              <div className="text-xl font-bold text-green-600">{formatCurrency(job.total)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => openJobDialog(job)}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>

                        {job.status === 'pending' && (
                          <Button
                            onClick={() => updateJobStatus(job.id, 'in-progress')}
                            variant="outline"
                            size="sm"
                          >
                            <Wrench className="h-4 w-4 mr-2" />
                            Start Job
                          </Button>
                        )}

                        {job.status === 'in-progress' && (
                          <Button
                            onClick={() => updateJobStatus(job.id, 'completed')}
                            variant="outline"
                            size="sm"
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                        )}

                        {job.status === 'completed' && (
                          <Button
                            onClick={() => createInvoiceFromJob(job)}
                            size="sm"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Create Invoice
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
      </Tabs>

      {/* New Quotation Dialog */}
      <Dialog open={showNewQuotationDialog} onOpenChange={setShowNewQuotationDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.quoNew}</DialogTitle>
            <DialogDescription>{t.quoSubtitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer picker */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2"><User className="h-4 w-4 text-slate-500" />Customer</h3>
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
                    <input type="text" placeholder="Search customer by name, phone or company..."
                      value={customerSearch} onChange={e => { setCustomerSearch(e.target.value); setShowCreateCustomer(false); }}
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" autoComplete="off" />
                  </div>
                  {customerSearch.length > 0 && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                      {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                        <button key={c.id} onClick={() => pickCustomer(c)}
                          className="w-full text-left px-4 py-2.5 hover:bg-orange-50 border-b border-slate-100 last:border-0">
                          <p className="font-medium text-sm text-slate-900">{fullName(c)}</p>
                          <p className="text-xs text-slate-500">{c.phone}{c.company ? ` · ${c.company}` : ''}</p>
                        </button>
                      )) : <div className="px-4 py-3 text-sm text-slate-500">No customers found.</div>}
                      <button onClick={() => setShowCreateCustomer(true)}
                        className="w-full text-left px-4 py-2.5 text-orange-600 hover:bg-orange-50 border-t border-slate-200 text-sm font-medium flex items-center gap-2">
                        <Plus className="h-4 w-4" />Create new customer
                      </button>
                    </div>
                  )}
                  {customerSearch.length === 0 && (
                    <button onClick={() => setShowCreateCustomer(true)} className="text-sm text-orange-600 hover:underline flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" />Create new customer
                    </button>
                  )}
                  {showCreateCustomer && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                      <p className="text-sm font-semibold text-slate-700">New Customer</p>
                      <div className="grid grid-cols-2 gap-3">
                        <input placeholder="First name *" value={newCustomerForm.firstName} onChange={e => setNewCustomerForm(p => ({ ...p, firstName: e.target.value }))} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        <input placeholder="Last name *" value={newCustomerForm.lastName} onChange={e => setNewCustomerForm(p => ({ ...p, lastName: e.target.value }))} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        <input placeholder="Phone *" value={newCustomerForm.phone} onChange={e => setNewCustomerForm(p => ({ ...p, phone: e.target.value }))} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        <input placeholder="Email" value={newCustomerForm.email} onChange={e => setNewCustomerForm(p => ({ ...p, email: e.target.value }))} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => setShowCreateCustomer(false)}>Cancel</Button>
                        <Button size="sm" onClick={createCustomer} disabled={!newCustomerForm.firstName || !newCustomerForm.lastName || !newCustomerForm.phone}>Save & Select</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Vehicle picker */}
            {pickedCustomer && (
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Car className="h-4 w-4 text-slate-500" />Vehicle</h3>
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
                            className="w-full text-left px-4 py-2.5 hover:bg-orange-50 border-b border-slate-100 last:border-0 flex items-center justify-between">
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
                    <button onClick={() => setShowCreateVehicle(v => !v)} className="text-sm text-orange-600 hover:underline flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" />Add new vehicle
                    </button>
                    {showCreateVehicle && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                        <p className="text-sm font-semibold text-slate-700">New Vehicle</p>
                        <div className="grid grid-cols-2 gap-3">
                          <input placeholder="Make *" value={newVehicleForm.make} onChange={e => setNewVehicleForm(p => ({ ...p, make: e.target.value }))} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                          <input placeholder="Model *" value={newVehicleForm.model} onChange={e => setNewVehicleForm(p => ({ ...p, model: e.target.value }))} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                          <input placeholder="Plate *" value={newVehicleForm.plate} onChange={e => setNewVehicleForm(p => ({ ...p, plate: e.target.value.toUpperCase() }))} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-mono" />
                          <input type="number" placeholder="Year" value={newVehicleForm.year} onChange={e => setNewVehicleForm(p => ({ ...p, year: parseInt(e.target.value) }))} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setShowCreateVehicle(false)}>Cancel</Button>
                          <Button size="sm" onClick={createVehicle} disabled={!newVehicleForm.make || !newVehicleForm.model || !newVehicleForm.plate}>Save & Select</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-semibold text-slate-900">Items / Itens</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setShowPartsPicker(true)}
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    disabled={parts.length === 0}
                    title={parts.length === 0 ? 'No parts in warehouse' : ''}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t.mntSelectParts}
                  </Button>
                  <Button
                    onClick={() => setShowLabourPicker(true)}
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    disabled={maintenancePacks.filter(p => p.isActive).length === 0}
                    title={maintenancePacks.filter(p => p.isActive).length === 0 ? 'No active maintenance packs' : ''}
                  >
                    <Wrench className="h-4 w-4 mr-1" />
                    {t.mntSelectPack}
                  </Button>
                  <Button onClick={addQuotationItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Manual
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Description</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Type</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Unit Price (Kz)</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Total (Kz)</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(newQuotation.items || []).map((item, idx) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateQuotationItem(idx, 'description', e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                            placeholder="Service or part name"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.isLabor ? 'labor' : 'part'}
                            onChange={(e) => updateQuotationItem(idx, 'isLabor', e.target.value === 'labor')}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                          >
                            <option value="labor">Labor</option>
                            <option value="part">Part</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuotationItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-right"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateQuotationItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-right"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-sm">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            onClick={() => removeQuotationItem(idx)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            ×
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-semibold">
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-right text-sm">Subtotal:</td>
                      <td className="px-3 py-2 text-right text-sm">{formatCurrency(newQuotation.subtotal || 0)}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-right text-sm">VAT (14%):</td>
                      <td className="px-3 py-2 text-right text-sm">{formatCurrency(newQuotation.vatAmount || 0)}</td>
                      <td></td>
                    </tr>
                    <tr className="text-lg">
                      <td colSpan={4} className="px-3 py-3 text-right">TOTAL:</td>
                      <td className="px-3 py-3 text-right text-green-600">{formatCurrency(newQuotation.total || 0)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                value={newQuotation.notes || ''}
                onChange={(e) => setNewQuotation(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                rows={3}
                placeholder="Additional notes or terms..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewQuotationDialog(false)}>
                {t.cancel}
              </Button>
              <Button
                onClick={saveQuotation}
                disabled={!pickedCustomer || !pickedVehicle || (newQuotation.items || []).length === 0}
              >
                {t.quoNew}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Card Dialog — editable */}
      <Dialog open={showJobDialog} onOpenChange={open => { if (!open) setShowJobDialog(false); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-600" />
              {t.job} — {selectedJob?.jobNumber}
            </DialogTitle>
            <DialogDescription>
              {selectedJob?.customerName} · {selectedJob?.vehicleMake} {selectedJob?.vehicleModel} ({selectedJob?.vehiclePlate})
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-5">
              {/* Job info row */}
              <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 rounded-lg p-4">
                <div><span className="text-slate-500">{t.technician}:</span> <span className="font-semibold ml-1">{selectedJob.assignedTechnicianName}</span></div>
                <div>
                  <span className="text-slate-500">{t.status}:</span>
                  <Badge className={`ml-2 ${getStatusBadge(selectedJob.status)}`}>{selectedJob.status}</Badge>
                </div>
                <div><span className="text-slate-500">Start:</span> <span className="font-semibold ml-1">{selectedJob.startDate}</span></div>
                <div><span className="text-slate-500">Est. Completion:</span> <span className="font-semibold ml-1">{selectedJob.estimatedCompletionDate}</span></div>
              </div>

              {/* Items — editable */}
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="font-semibold text-slate-900">Parts &amp; Labour</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => setShowJobPartsPicker(true)}
                      disabled={parts.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t.mntSelectParts}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      onClick={() => setShowJobLabourPicker(true)}
                      disabled={maintenancePacks.filter(p => p.isActive).length === 0}
                    >
                      <Wrench className="h-4 w-4 mr-1" />
                      {t.mntSelectPack}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left">{t.description}</th>
                        <th className="px-3 py-2 text-center w-20">Type</th>
                        <th className="px-3 py-2 text-right w-20">{t.quantity}</th>
                        <th className="px-3 py-2 text-right w-32">{t.unitPrice}</th>
                        <th className="px-3 py-2 text-right w-32">{t.total}</th>
                        <th className="px-3 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                            No items yet — add parts from warehouse or labour from maintenance packs
                          </td>
                        </tr>
                      ) : (
                        jobItems.map((item, idx) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-3 py-2 font-medium text-slate-800">
                              {item.description}
                              {item.partNumber && (
                                <span className="ml-2 text-xs font-mono text-slate-400">{item.partNumber}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <Badge className={item.isLabor ? 'bg-orange-100 text-orange-700 text-xs' : 'bg-blue-100 text-blue-700 text-xs'}>
                                {item.isLabor ? 'Labour' : 'Part'}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600">{item.quantity}{item.isLabor ? 'h' : ''}</td>
                            <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatCurrency(item.total)}</td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => removeJobItem(idx)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {jobItems.length > 0 && (() => {
                      const { subtotal, vatAmount, total } = calculateQuotationTotals(jobItems, 0.14);
                      return (
                        <tfoot className="bg-slate-50 font-semibold border-t">
                          <tr>
                            <td colSpan={4} className="px-3 py-2 text-right text-sm">Subtotal:</td>
                            <td className="px-3 py-2 text-right text-sm">{formatCurrency(subtotal)}</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="px-3 py-2 text-right text-sm">VAT (14%):</td>
                            <td className="px-3 py-2 text-right text-sm">{formatCurrency(vatAmount)}</td>
                            <td></td>
                          </tr>
                          <tr className="text-base">
                            <td colSpan={4} className="px-3 py-3 text-right">TOTAL:</td>
                            <td className="px-3 py-3 text-right text-green-700 font-bold">{formatCurrency(total)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      );
                    })()}
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setShowJobDialog(false)}>{t.cancel}</Button>
                <Button onClick={saveJobItems} className="bg-orange-600 hover:bg-orange-700 text-white">
                  Save Job Card
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quotation — Parts Picker */}
      <PartsPickerDialog
        open={showPartsPicker}
        onClose={() => setShowPartsPicker(false)}
        parts={parts}
        onAdd={addPickedItems}
      />

      {/* Quotation — Labour Picker */}
      <LabourPickerDialog
        open={showLabourPicker}
        onClose={() => setShowLabourPicker(false)}
        packs={maintenancePacks}
        onAdd={addPickedItems}
      />

      {/* Job Card — Parts Picker */}
      <PartsPickerDialog
        open={showJobPartsPicker}
        onClose={() => setShowJobPartsPicker(false)}
        parts={parts}
        onAdd={addJobPickedItems}
      />

      {/* Job Card — Labour Picker */}
      <LabourPickerDialog
        open={showJobLabourPicker}
        onClose={() => setShowJobLabourPicker(false)}
        packs={maintenancePacks}
        onAdd={addJobPickedItems}
      />
    </div>
  );
}
