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
  const date = new Date().toISOString().split('T')[0];
  const due = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  return {
    id: Date.now(),
    invoiceNumber,
    date,
    dueDate: due,
    customerId: job.customerId,
    customerName: job.customerName,
    subtotal: job.subtotal,
    vatAmount: job.vatAmount,
    total: job.total,
    amountPaid: 0,
    balance: job.total,
    status: 'sent',
    payments: [],
    jobNumber: job.jobNumber,
    notes: job.notes,
    items: job.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      isLabor: item.isLabor,
    })),
  };
};

// ── PDF i18n ─────────────────────────────────────────────────────────────────

type PdfLang = 'en' | 'pt' | 'es' | 'zh' | 'fr';

interface PdfLabels {
  quotation: string; invoice: string; statement: string;
  customer: string; vehicle: string; billTo: string;
  date: string; validUntil: string; jobNum: string;
  descCol: string; qty: string; unitPrice: string; total: string;
  subtotal: string; vatLabel: string; totalDue: string;
  notes: string; termsLine1: string; termsLine2: string; thanks: string;
  year: string; plate: string; phone: string; email: string;
  status: string; paymentInfo: string; statementDate: string;
}

const PDF_LABELS: Record<PdfLang, PdfLabels> = {
  en: {
    quotation: 'QUOTATION', invoice: 'INVOICE', statement: 'CUSTOMER STATEMENT',
    customer: 'CUSTOMER', vehicle: 'VEHICLE', billTo: 'BILL TO',
    date: 'Date', validUntil: 'Valid Until', jobNum: 'Job #',
    descCol: 'Description', qty: 'Qty', unitPrice: 'Unit Price', total: 'Total',
    subtotal: 'Subtotal', vatLabel: 'VAT', totalDue: 'TOTAL DUE',
    notes: 'Notes', thanks: 'Thank you for your business!',
    termsLine1: 'This quotation is valid for 30 days. Prices in Angolan Kwanza (AOA).',
    termsLine2: 'Payment required before work commences. All work guaranteed for 90 days.',
    year: 'Year', plate: 'Plate', phone: 'Phone', email: 'Email',
    status: 'Status', paymentInfo: 'PAYMENT INFORMATION', statementDate: 'Statement Date',
  },
  pt: {
    quotation: 'ORÇAMENTO', invoice: 'FATURA', statement: 'EXTRATO DE CONTA',
    customer: 'CLIENTE', vehicle: 'VEÍCULO', billTo: 'CLIENTE',
    date: 'Data', validUntil: 'Válido Até', jobNum: 'Ordem Nº',
    descCol: 'Descrição', qty: 'Qtd', unitPrice: 'Preço Unit.', total: 'Total',
    subtotal: 'Subtotal', vatLabel: 'IVA', totalDue: 'TOTAL A PAGAR',
    notes: 'Notas', thanks: 'Obrigado pelo seu negócio!',
    termsLine1: 'Este orçamento é válido por 30 dias. Preços em Kwanza Angolano (AOA).',
    termsLine2: 'Pagamento exigido antes do início dos trabalhos. Garantia de 90 dias.',
    year: 'Ano', plate: 'Matrícula', phone: 'Telefone', email: 'Email',
    status: 'Estado', paymentInfo: 'INFORMAÇÃO DE PAGAMENTO', statementDate: 'Data do Extrato',
  },
  es: {
    quotation: 'PRESUPUESTO', invoice: 'FACTURA', statement: 'ESTADO DE CUENTA',
    customer: 'CLIENTE', vehicle: 'VEHÍCULO', billTo: 'FACTURAR A',
    date: 'Fecha', validUntil: 'Válido Hasta', jobNum: 'Orden Nº',
    descCol: 'Descripción', qty: 'Cant.', unitPrice: 'Precio Unit.', total: 'Total',
    subtotal: 'Subtotal', vatLabel: 'IVA', totalDue: 'TOTAL A PAGAR',
    notes: 'Notas', thanks: '¡Gracias por su negocio!',
    termsLine1: 'Presupuesto válido 30 días. Precios en Kwanza Angolano (AOA).',
    termsLine2: 'Pago requerido antes del inicio. Garantía de 90 días.',
    year: 'Año', plate: 'Matrícula', phone: 'Teléfono', email: 'Email',
    status: 'Estado', paymentInfo: 'INFORMACIÓN DE PAGO', statementDate: 'Fecha del Estado',
  },
  zh: {
    quotation: '报价单', invoice: '发票', statement: '客户对账单',
    customer: '客户', vehicle: '车辆', billTo: '账单抬头',
    date: '日期', validUntil: '有效期至', jobNum: '工单号',
    descCol: '描述', qty: '数量', unitPrice: '单价', total: '总计',
    subtotal: '小计', vatLabel: '增值税', totalDue: '应付总额',
    notes: '备注', thanks: '感谢您的惠顾！',
    termsLine1: '报价单有效期30天。价格以安哥拉宽扎（AOA）计。',
    termsLine2: '开工前须付款。所有工程保修90天。',
    year: '年份', plate: '车牌', phone: '电话', email: '邮箱',
    status: '状态', paymentInfo: '付款信息', statementDate: '对账日期',
  },
  fr: {
    quotation: 'DEVIS', invoice: 'FACTURE', statement: 'RELEVÉ CLIENT',
    customer: 'CLIENT', vehicle: 'VÉHICULE', billTo: 'FACTURER À',
    date: 'Date', validUntil: "Valide Jusqu'au", jobNum: 'Bon Nº',
    descCol: 'Description', qty: 'Qté', unitPrice: 'Prix Unit.', total: 'Total',
    subtotal: 'Sous-total', vatLabel: 'TVA', totalDue: 'TOTAL À PAYER',
    notes: 'Notes', thanks: 'Merci pour votre confiance!',
    termsLine1: 'Ce devis est valable 30 jours. Prix en Kwanza Angolais (AOA).',
    termsLine2: 'Paiement requis avant le début des travaux. Garantie 90 jours.',
    year: 'Année', plate: 'Immatriculation', phone: 'Téléphone', email: 'Email',
    status: 'Statut', paymentInfo: 'INFORMATIONS DE PAIEMENT', statementDate: 'Date du Relevé',
  },
};

const DATE_LOCALE: Record<PdfLang, string> = {
  en: 'en-GB', pt: 'pt-AO', es: 'es-ES', zh: 'zh-CN', fr: 'fr-FR',
};

const getPdfLabels = (lang?: string): PdfLabels =>
  PDF_LABELS[(lang as PdfLang) ?? 'pt'] ?? PDF_LABELS.pt;

/**
 * Export quotation to PDF
 */
export const exportQuotationToPDF = (quotation: Quotation, language?: string) => {
  const L = getPdfLabels(language);
  const locale = DATE_LOCALE[(language as PdfLang) ?? 'pt'] ?? 'pt-AO';
  const doc = new jsPDF();
  const fmtN = (n: number) => `${n.toLocaleString(locale, { minimumFractionDigits: 2 })} Kz`;

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
  doc.text(L.quotation, 105, 45, { align: 'center' });

  // Quotation info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${L.quotation} #:`, 20, 60);
  doc.setFont('helvetica', 'bold');
  doc.text(quotation.quotationNumber, 55, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`${L.date}:`, 20, 67);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date(quotation.date).toLocaleDateString(locale), 55, 67);
  doc.setFont('helvetica', 'normal');
  doc.text(`${L.validUntil}:`, 20, 74);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date(quotation.validUntil).toLocaleDateString(locale), 55, 74);

  // Customer info
  doc.setFont('helvetica', 'bold');
  doc.text(`${L.customer}:`, 20, 88);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.customerName, 20, 95);
  if (quotation.customerPhone) doc.text(`${L.phone}: ${quotation.customerPhone}`, 20, 102);
  if (quotation.customerEmail) doc.text(`${L.email}: ${quotation.customerEmail}`, 20, 109);

  // Vehicle info
  doc.setFont('helvetica', 'bold');
  doc.text(`${L.vehicle}:`, 120, 88);
  doc.setFont('helvetica', 'normal');
  doc.text(`${quotation.vehicleMake} ${quotation.vehicleModel}`, 120, 95);
  if (quotation.vehicleYear) doc.text(`${L.year}: ${quotation.vehicleYear}`, 120, 102);
  doc.text(`${L.plate}: ${quotation.vehiclePlate}`, 120, 109);

  // Items table
  const tableData = quotation.items.map(item => [
    item.description,
    item.quantity.toString(),
    fmtN(item.unitPrice),
    fmtN(item.total),
  ]);

  autoTable(doc, {
    startY: 120,
    head: [[L.descCol, L.qty, L.unitPrice, L.total]],
    body: tableData,
    foot: [
      ['', '', `${L.subtotal}:`, fmtN(quotation.subtotal)],
      ['', '', `${L.vatLabel} (${(quotation.vatRate * 100).toFixed(0)}%):`, fmtN(quotation.vatAmount)],
      ['', '', `${L.total}:`, fmtN(quotation.total)],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  if (quotation.notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${L.notes}:`, 20, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(quotation.notes, 170), 20, finalY + 7);
  }

  const termsY = quotation.notes ? finalY + 25 : finalY;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`${L.termsLine1}`, 20, termsY);
  doc.text(L.termsLine2, 20, termsY + 5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(L.thanks, 105, 280, { align: 'center' });

  doc.save(`quotation-${quotation.quotationNumber}.pdf`);
};

/**
 * Export invoice to PDF
 */
export const exportInvoiceToPDF = (invoice: Invoice, job?: Job, language?: string) => {
  const L = getPdfLabels(language);
  const locale = DATE_LOCALE[(language as PdfLang) ?? 'pt'] ?? 'pt-AO';
  const doc = new jsPDF();
  const fmtN = (n: number) => `${n.toLocaleString(locale, { minimumFractionDigits: 2 })} Kz`;

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
  doc.text(L.invoice, 105, 45, { align: 'center' });

  // Invoice info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${L.invoice} #:`, 20, 60);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.invoiceNumber, 55, 60);

  doc.setFont('helvetica', 'normal');
  doc.text(`${L.date}:`, 20, 67);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date(invoice.date).toLocaleDateString(locale), 55, 67);

  if (job) {
    doc.setFont('helvetica', 'normal');
    doc.text(`${L.jobNum}:`, 20, 74);
    doc.setFont('helvetica', 'bold');
    doc.text(job.jobNumber, 55, 74);
  }

  doc.setFont('helvetica', 'normal');
  doc.text(`${L.status}:`, 20, 81);
  doc.setFont('helvetica', 'bold');
  const statusColor = invoice.status === 'paid' ? [34, 197, 94] : [234, 179, 8];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(invoice.status.toUpperCase(), 55, 81);
  doc.setTextColor(0, 0, 0);

  // Customer info
  doc.setFont('helvetica', 'bold');
  doc.text(`${L.billTo}:`, 20, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerName, 20, 102);

  // Vehicle info if available
  if (job) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${L.vehicle}:`, 120, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(`${job.vehicleMake} ${job.vehicleModel}`, 120, 102);
    doc.text(`${L.plate}: ${job.vehiclePlate}`, 120, 109);
  }

  // Items table
  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    fmtN(item.unitPrice),
    fmtN(item.total),
  ]);

  autoTable(doc, {
    startY: 120,
    head: [[L.descCol, L.qty, L.unitPrice, L.total]],
    body: tableData,
    foot: [
      ['', '', `${L.subtotal}:`, fmtN(invoice.subtotal)],
      ['', '', `${L.vatLabel} (14%):`, fmtN(invoice.vatAmount)],
      ['', '', `${L.totalDue}:`, fmtN(invoice.total)],
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
  doc.text(`${L.paymentInfo}:`, 20, finalY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Bank: Banco BAI', 20, finalY + 7);
  doc.text('Account: 0001234567890123', 20, finalY + 13);
  doc.text('IBAN: AO06 0001 0001 12345678901 30', 20, finalY + 19);
  doc.text('Reference: ' + invoice.invoiceNumber, 20, finalY + 25);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(L.termsLine2, 20, finalY + 35);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(L.thanks, 105, 280, { align: 'center' });

  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
};

/**
 * Export customer statement to PDF
 */
export const exportCustomerStatementToPDF = (
  customerName: string,
  customerEmail: string | undefined,
  lines: { invoice: import('./chart-of-accounts').Invoice; daysOutstanding: number }[],
  totals: { totalBilled: number; totalPaid: number; totalOutstanding: number },
  language?: string,
) => {
  const L = getPdfLabels(language);
  const locale = DATE_LOCALE[(language as PdfLang) ?? 'pt'] ?? 'pt-AO';
  const doc = new jsPDF();
  const fmt = (n: number) => `AOA ${n.toLocaleString(locale)}`;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(L.statement, 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Rua Principal, Luanda, Angola', 105, 27, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(customerName, 20, 45);
  if (customerEmail) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(customerEmail, 20, 51); }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${L.statementDate}: ${new Date().toLocaleDateString(locale)}`, 140, 45);

  autoTable(doc, {
    startY: 60,
    head: [['Invoice #', 'Date', 'Due Date', 'Total', 'Paid', 'Balance', 'Status']],
    body: lines.map(l => [
      l.invoice.invoiceNumber,
      l.invoice.date,
      l.invoice.dueDate,
      fmt(l.invoice.total),
      fmt(l.invoice.amountPaid),
      fmt(l.invoice.balance),
      l.invoice.status.replace('_', ' ').toUpperCase(),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 41, 59] },
  });

  const finalY = (doc as any).lastAutoTable?.finalY ?? 120;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Billed: ${fmt(totals.totalBilled)}`, 140, finalY + 10);
  doc.text(`Total Paid: ${fmt(totals.totalPaid)}`, 140, finalY + 17);
  doc.text(`Outstanding: ${fmt(totals.totalOutstanding)}`, 140, finalY + 24);

  doc.save(`statement-${customerName.replace(/\s+/g, '-')}.pdf`);
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
