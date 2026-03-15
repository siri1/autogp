import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, InvoiceItem } from './chart-of-accounts';

export interface QuotationItem {
  id: number;
  description: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
  isLabor: boolean;
  estimatedHours?: number;
  total: number;
}

export interface Quotation {
  id: number;
  quotationNumber: string;
  date: string;
  validUntil: string;
  customerId: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: number;
  vehiclePlate: string;
  items: QuotationItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  createdBy: string;
  approvedDate?: string;
}

export interface Job {
  id: number;
  jobNumber: string;
  quotationId?: number;
  quotationNumber?: string;
  customerId: number;
  customerName: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: number;
  vehiclePlate: string;
  startDate: string;
  estimatedCompletionDate: string;
  actualCompletionDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'invoiced';
  assignedTechnicianId?: number;
  assignedTechnicianName?: string;
  items: QuotationItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  customerRating?: number;
  customerFeedback?: string;
}

/**
 * Generate quotation number
 */
export const generateQuotationNumber = (lastNumber: number): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  return `QT-${year}${month}-${String(lastNumber + 1).padStart(4, '0')}`;
};

/**
 * Generate job number
 */
export const generateJobNumber = (lastNumber: number): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  return `JOB-${year}${month}-${String(lastNumber + 1).padStart(4, '0')}`;
};

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = (lastNumber: number): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  return `INV-${year}${month}-${String(lastNumber + 1).padStart(4, '0')}`;
};

/**
 * Calculate quotation totals
 */
export const calculateQuotationTotals = (
  items: QuotationItem[],
  vatRate: number = 0.14
): { subtotal: number; vatAmount: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  return { subtotal, vatAmount, total };
};

/**
 * Convert quotation to job
 */
export const convertQuotationToJob = (
  quotation: Quotation,
  jobNumber: string,
  technicianId?: number,
  technicianName?: string
): Job => {
  return {
    id: Date.now(),
    jobNumber,
    quotationId: quotation.id,
    quotationNumber: quotation.quotationNumber,
    customerId: quotation.customerId,
    customerName: quotation.customerName,
    vehicleMake: quotation.vehicleMake,
    vehicleModel: quotation.vehicleModel,
    vehicleYear: quotation.vehicleYear,
    vehiclePlate: quotation.vehiclePlate,
    startDate: new Date().toISOString().split('T')[0],
    estimatedCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    assignedTechnicianId: technicianId,
    assignedTechnicianName: technicianName,
    items: quotation.items,
    subtotal: quotation.subtotal,
    vatAmount: quotation.vatAmount,
    total: quotation.total,
    notes: quotation.notes,
  };
};

/**
 * Convert job to invoice
 */
export const convertJobToInvoice = (
  job: Job,
  invoiceNumber: string
): Invoice => {
  return {
    id: Date.now(),
    invoiceNumber,
    date: new Date().toISOString().split('T')[0],
    customerId: job.customerId,
    customerName: job.customerName,
    subtotal: job.subtotal,
    vatAmount: job.vatAmount,
    total: job.total,
    status: 'sent',
    items: job.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      isLabor: item.isLabor,
    })),
  };
};

/**
 * Export quotation to PDF
 */
export const exportQuotationToPDF = (quotation: Quotation) => {
  const doc = new jsPDF();

  // Company header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTOMOTIVE WORKSHOP', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Rua Principal, Luanda, Angola', 105, 27, { align: 'center' });
  doc.text('Tel: +244 923 456 789 | Email: info@workshop.ao', 105, 32, { align: 'center' });

  // Quotation title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION / ORÇAMENTO', 105, 45, { align: 'center' });

  // Quotation info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text('Quotation #:', 20, 60);
  doc.setFont('helvetica', 'bold');
  doc.text(quotation.quotationNumber, 50, 60);

  doc.setFont('helvetica', 'normal');
  doc.text('Date:', 20, 67);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date(quotation.date).toLocaleDateString('pt-AO'), 50, 67);

  doc.setFont('helvetica', 'normal');
  doc.text('Valid Until:', 20, 74);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date(quotation.validUntil).toLocaleDateString('pt-AO'), 50, 74);

  // Customer info
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER / CLIENTE:', 20, 88);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.customerName, 20, 95);
  if (quotation.customerPhone) {
    doc.text(`Phone: ${quotation.customerPhone}`, 20, 102);
  }
  if (quotation.customerEmail) {
    doc.text(`Email: ${quotation.customerEmail}`, 20, 109);
  }

  // Vehicle info
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE / VEÍCULO:', 120, 88);
  doc.setFont('helvetica', 'normal');
  doc.text(`${quotation.vehicleMake} ${quotation.vehicleModel}`, 120, 95);
  if (quotation.vehicleYear) {
    doc.text(`Year: ${quotation.vehicleYear}`, 120, 102);
  }
  doc.text(`Plate: ${quotation.vehiclePlate}`, 120, 109);

  // Items table
  const tableData = quotation.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unitPrice.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`,
    `${item.total.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`,
  ]);

  autoTable(doc, {
    startY: 120,
    head: [['Description / Descrição', 'Qty', 'Unit Price / Preço Unit.', 'Total']],
    body: tableData,
    foot: [
      ['', '', 'Subtotal:', `${quotation.subtotal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`],
      ['', '', `VAT (${(quotation.vatRate * 100).toFixed(0)}%):`, `${quotation.vatAmount.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`],
      ['', '', 'TOTAL:', `${quotation.total.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // Notes
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  if (quotation.notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes / Notas:', 20, finalY);
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(quotation.notes, 170);
    doc.text(notesLines, 20, finalY + 7);
  }

  // Terms
  const termsY = quotation.notes ? finalY + 25 : finalY;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Terms & Conditions: This quotation is valid for 30 days. Prices are in Angolan Kwanza (AOA).', 20, termsY);
  doc.text('Payment required before work commences. All work guaranteed for 90 days.', 20, termsY + 5);

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business! / Obrigado pelo seu negócio!', 105, 280, { align: 'center' });

  doc.save(`quotation-${quotation.quotationNumber}.pdf`);
};

/**
 * Export invoice to PDF
 */
export const exportInvoiceToPDF = (invoice: Invoice, job?: Job) => {
  const doc = new jsPDF();

  // Company header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTOMOTIVE WORKSHOP', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Rua Principal, Luanda, Angola', 105, 27, { align: 'center' });
  doc.text('NIF: 5000123456 | Tel: +244 923 456 789', 105, 32, { align: 'center' });

  // Invoice title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE / FATURA', 105, 45, { align: 'center' });

  // Invoice info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text('Invoice #:', 20, 60);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.invoiceNumber, 50, 60);

  doc.setFont('helvetica', 'normal');
  doc.text('Date:', 20, 67);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date(invoice.date).toLocaleDateString('pt-AO'), 50, 67);

  if (job) {
    doc.setFont('helvetica', 'normal');
    doc.text('Job #:', 20, 74);
    doc.setFont('helvetica', 'bold');
    doc.text(job.jobNumber, 50, 74);
  }

  doc.setFont('helvetica', 'normal');
  doc.text('Status:', 20, 81);
  doc.setFont('helvetica', 'bold');
  const statusColor = invoice.status === 'paid' ? [34, 197, 94] : [234, 179, 8];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(invoice.status.toUpperCase(), 50, 81);
  doc.setTextColor(0, 0, 0);

  // Customer info
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO / CLIENTE:', 20, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerName, 20, 102);

  // Vehicle info if available
  if (job) {
    doc.setFont('helvetica', 'bold');
    doc.text('VEHICLE / VEÍCULO:', 120, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(`${job.vehicleMake} ${job.vehicleModel}`, 120, 102);
    doc.text(`Plate: ${job.vehiclePlate}`, 120, 109);
  }

  // Items table
  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unitPrice.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`,
    `${item.total.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`,
  ]);

  autoTable(doc, {
    startY: 120,
    head: [['Description / Descrição', 'Qty', 'Unit Price / Preço Unit.', 'Total']],
    body: tableData,
    foot: [
      ['', '', 'Subtotal:', `${invoice.subtotal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`],
      ['', '', 'VAT (14%):', `${invoice.vatAmount.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`],
      ['', '', 'TOTAL DUE:', `${invoice.total.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // Payment info
  const finalY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INFORMATION / INFORMAÇÃO DE PAGAMENTO:', 20, finalY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Bank: Banco BAI', 20, finalY + 7);
  doc.text('Account: 0001234567890123', 20, finalY + 13);
  doc.text('IBAN: AO06 0001 0001 12345678901 30', 20, finalY + 19);
  doc.text('Reference: ' + invoice.invoiceNumber, 20, finalY + 25);

  // Terms
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Payment due within 30 days. Late payments subject to 2% monthly interest.', 20, finalY + 35);
  doc.text('All work guaranteed for 90 days from invoice date.', 20, finalY + 40);

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business! / Obrigado pelo seu negócio!', 105, 280, { align: 'center' });

  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
};

/**
 * Sample data
 */
export const SAMPLE_QUOTATIONS: Quotation[] = [
  {
    id: 1,
    quotationNumber: 'QT-202411-0001',
    date: '2024-11-20',
    validUntil: '2024-12-20',
    customerId: 1,
    customerName: 'João Silva',
    customerEmail: 'joao.silva@email.ao',
    customerPhone: '+244 923 456 789',
    vehicleMake: 'Toyota',
    vehicleModel: 'Hilux',
    vehicleYear: 2020,
    vehiclePlate: 'LD-12-34-AB',
    items: [
      { id: 1, description: 'Engine Oil Change', quantity: 1, unitPrice: 15000, isLabor: true, estimatedHours: 1, total: 15000 },
      { id: 2, description: 'Oil Filter', partNumber: 'OF-123', quantity: 1, unitPrice: 5000, isLabor: false, total: 5000 },
      { id: 3, description: 'Air Filter', partNumber: 'AF-456', quantity: 1, unitPrice: 4000, isLabor: false, total: 4000 },
      { id: 4, description: 'Brake Inspection', quantity: 1, unitPrice: 8000, isLabor: true, estimatedHours: 0.5, total: 8000 },
    ],
    subtotal: 32000,
    vatRate: 0.14,
    vatAmount: 4480,
    total: 36480,
    notes: 'Includes full inspection of brake system. Additional work may be required based on findings.',
    status: 'sent',
    createdBy: 'Admin',
  },
];

export const SAMPLE_JOBS: Job[] = [
  {
    id: 1,
    jobNumber: 'JOB-202411-0001',
    quotationId: 1,
    quotationNumber: 'QT-202411-0001',
    customerId: 1,
    customerName: 'João Silva',
    vehicleMake: 'Toyota',
    vehicleModel: 'Hilux',
    vehicleYear: 2020,
    vehiclePlate: 'LD-12-34-AB',
    startDate: '2024-11-25',
    estimatedCompletionDate: '2024-11-26',
    actualCompletionDate: '2024-11-26',
    status: 'completed',
    assignedTechnicianId: 1,
    assignedTechnicianName: 'Mike Rodriguez',
    items: [
      { id: 1, description: 'Engine Oil Change', quantity: 1, unitPrice: 15000, isLabor: true, estimatedHours: 1, total: 15000 },
      { id: 2, description: 'Oil Filter', partNumber: 'OF-123', quantity: 1, unitPrice: 5000, isLabor: false, total: 5000 },
      { id: 3, description: 'Air Filter', partNumber: 'AF-456', quantity: 1, unitPrice: 4000, isLabor: false, total: 4000 },
      { id: 4, description: 'Brake Inspection', quantity: 1, unitPrice: 8000, isLabor: true, estimatedHours: 0.5, total: 8000 },
      { id: 5, description: 'Brake Pads Replacement', quantity: 1, unitPrice: 25000, isLabor: true, estimatedHours: 2, total: 25000 },
      { id: 6, description: 'Brake Pads (Front)', partNumber: 'BP-789', quantity: 2, unitPrice: 12000, isLabor: false, total: 24000 },
    ],
    subtotal: 81000,
    vatAmount: 11340,
    total: 92340,
    notes: 'Additional brake pad replacement required due to wear. Customer approved additional work.',
    customerRating: 5,
    customerFeedback: 'Excellent service! Very professional.',
  },
];
