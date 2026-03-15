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
} from 'lucide-react';
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

interface QuotationsJobsProps {
  onInvoiceCreated?: (transaction: AccountingTransaction) => void;
}

export default function QuotationsJobs({ onInvoiceCreated }: QuotationsJobsProps) {
  const [quotations, setQuotations] = useState<Quotation[]>(SAMPLE_QUOTATIONS);
  const [jobs, setJobs] = useState<Job[]>(SAMPLE_JOBS);
  const [showNewQuotationDialog, setShowNewQuotationDialog] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [newQuotation, setNewQuotation] = useState<Partial<Quotation>>({
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    vatRate: 0.14,
    status: 'draft',
  });

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
      customerId: Date.now(),
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
    exportInvoiceToPDF(invoice, job);

    alert(`Invoice ${invoiceNumber} created successfully! Accounting entry posted automatically.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            Quotations & Jobs Management
          </h2>
          <p className="text-slate-600 mt-2">Create quotations, manage jobs, and generate invoices</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Total Quotations
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
              Active Jobs
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
              Completed Jobs
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
              Total Value
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
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>

        {/* Quotations Tab */}
        <TabsContent value="quotations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quotations / Orçamentos</CardTitle>
                  <CardDescription>Create and manage customer quotations</CardDescription>
                </div>
                <Button onClick={() => setShowNewQuotationDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Quotation
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
                          onClick={() => exportQuotationToPDF(quotation)}
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
              <CardTitle>Jobs / Trabalhos</CardTitle>
              <CardDescription>Track and manage workshop jobs</CardDescription>
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
                          onClick={() => {
                            setSelectedJob(job);
                            setShowJobDialog(true);
                          }}
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
            <DialogTitle>New Quotation / Novo Orçamento</DialogTitle>
            <DialogDescription>Create a new quotation for a customer</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer & Vehicle Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={newQuotation.customerName || ''}
                      onChange={(e) => setNewQuotation(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                      placeholder="João Silva"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newQuotation.customerPhone || ''}
                      onChange={(e) => setNewQuotation(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                      placeholder="+244 923 456 789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newQuotation.customerEmail || ''}
                      onChange={(e) => setNewQuotation(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                      placeholder="joao@email.ao"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Vehicle Information</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Make *</label>
                      <input
                        type="text"
                        value={newQuotation.vehicleMake || ''}
                        onChange={(e) => setNewQuotation(prev => ({ ...prev, vehicleMake: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                        placeholder="Toyota"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Model *</label>
                      <input
                        type="text"
                        value={newQuotation.vehicleModel || ''}
                        onChange={(e) => setNewQuotation(prev => ({ ...prev, vehicleModel: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                        placeholder="Hilux"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                      <input
                        type="number"
                        value={newQuotation.vehicleYear || ''}
                        onChange={(e) => setNewQuotation(prev => ({ ...prev, vehicleYear: parseInt(e.target.value) || undefined }))}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Plate *</label>
                      <input
                        type="text"
                        value={newQuotation.vehiclePlate || ''}
                        onChange={(e) => setNewQuotation(prev => ({ ...prev, vehiclePlate: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                        placeholder="LD-12-34-AB"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">Items / Itens</h3>
                <Button onClick={addQuotationItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
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
                Cancel
              </Button>
              <Button
                onClick={saveQuotation}
                disabled={
                  !newQuotation.customerName ||
                  !newQuotation.vehicleMake ||
                  !newQuotation.vehicleModel ||
                  !newQuotation.vehiclePlate ||
                  (newQuotation.items || []).length === 0
                }
              >
                Create Quotation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Details Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Job Details / Detalhes do Trabalho</DialogTitle>
            <DialogDescription>{selectedJob?.jobNumber}</DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Customer:</span>
                  <span className="ml-2 font-semibold">{selectedJob.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-600">Vehicle:</span>
                  <span className="ml-2 font-semibold">
                    {selectedJob.vehicleMake} {selectedJob.vehicleModel} ({selectedJob.vehiclePlate})
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Technician:</span>
                  <span className="ml-2 font-semibold">{selectedJob.assignedTechnicianName}</span>
                </div>
                <div>
                  <span className="text-slate-600">Status:</span>
                  <Badge className={`ml-2 ${getStatusBadge(selectedJob.status)}`}>
                    {selectedJob.status}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedJob.items.map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-2">
                          {item.description}
                          {item.isLabor && <Badge className="ml-2 text-xs">Labor</Badge>}
                        </td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2 text-right font-semibold">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-semibold">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right">Subtotal:</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(selectedJob.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right">VAT (14%):</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(selectedJob.vatAmount)}</td>
                    </tr>
                    <tr className="text-base">
                      <td colSpan={3} className="px-4 py-3 text-right">TOTAL:</td>
                      <td className="px-4 py-3 text-right text-green-600">{formatCurrency(selectedJob.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
