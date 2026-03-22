/**
 * Chart of Accounts for Automotive Workshop
 * Based on Angolan GAAP (Sistema de Normalização Contabilística)
 * Following Portuguese accounting standards adapted for Angola
 */

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type AccountCategory = 'current' | 'non-current' | 'operating' | 'financial';

export interface Account {
  code: string;
  name: string;
  namePortuguese?: string;
  type: AccountType;
  category: AccountCategory;
  parentCode?: string;
  isActive: boolean;
  balance: number;
  currency: string;
  description?: string;
}

export interface AccountingTransaction {
  id: number;
  date: string;
  reference: string;
  description: string;
  entries: JournalEntry[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'void';
  createdBy: string;
}

export interface JournalEntry {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface ExchangeRate {
  id: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string;
  source: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'overdue' | 'paid' | 'partially_paid';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'mobile_money' | 'cheque';

export interface InvoicePayment {
  id: number;
  invoiceId: number;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerId: number;
  customerName: string;
  customerEmail?: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  jobNumber?: string;
  notes?: string;
}

export type BillCategory =
  | 'parts_purchase' | 'lubricants' | 'consumables' | 'staff_costs'
  | 'electricity_water' | 'rent' | 'insurance' | 'communication'
  | 'bank_charges' | 'other';

export const BILL_CATEGORY_ACCOUNT_MAP: Record<BillCategory, string> = {
  parts_purchase:   '301',
  lubricants:       '302',
  consumables:      '303',
  staff_costs:      '611',
  electricity_water:'621',
  rent:             '622',
  insurance:        '623',
  communication:    '624',
  bank_charges:     '651',
  other:            '640',
};

export const BILL_CATEGORY_LABELS: Record<BillCategory, string> = {
  parts_purchase:   'Parts Purchase',
  lubricants:       'Oils & Lubricants',
  consumables:      'Consumables',
  staff_costs:      'Staff Costs',
  electricity_water:'Electricity & Water',
  rent:             'Rent',
  insurance:        'Insurance',
  communication:    'Communication',
  bank_charges:     'Bank Charges',
  other:            'Other',
};

export interface BillPayment {
  id: number;
  billId: number;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
}

export interface VendorBill {
  id: number;
  billNumber: string;
  vendorName: string;
  date: string;
  dueDate: string;
  category: BillCategory;
  expenseAccountCode: string;
  description: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'partially_paid';
  payments: BillPayment[];
  journalEntryId?: number;
}

export interface ARAgingBucket {
  customerId: number;
  customerName: string;
  current: number;
  days30: number;
  days60: number;
  days90Plus: number;
  total: number;
}

export interface ProfitLossLine { accountCode: string; accountName: string; amount: number }
export interface ProfitLossReport {
  period: { from: string; to: string };
  revenue: ProfitLossLine[];
  totalRevenue: number;
  costOfSales: ProfitLossLine[];
  totalCostOfSales: number;
  grossProfit: number;
  operatingExpenses: ProfitLossLine[];
  totalOperatingExpenses: number;
  operatingProfit: number;
  financialItems: ProfitLossLine[];
  netIncome: number;
}

export interface BalanceSheetLine { accountCode: string; accountName: string; balance: number }
export interface BalanceSheetReport {
  asOf: string;
  assets: { current: BalanceSheetLine[]; nonCurrent: BalanceSheetLine[]; totalAssets: number };
  liabilities: { current: BalanceSheetLine[]; nonCurrent: BalanceSheetLine[]; totalLiabilities: number };
  equity: BalanceSheetLine[];
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

export interface CustomerStatement {
  customerId: number;
  customerName: string;
  customerEmail?: string;
  generatedDate: string;
  lines: { invoice: Invoice; daysOutstanding: number }[];
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  isLabor: boolean;
}

export interface TrialBalanceEntry {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface GeneralLedgerEntry {
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

/**
 * Angolan Chart of Accounts
 * Classes: 1-Capital, 2-Fixed Assets, 3-Inventory, 4-Third Parties,
 *          5-Financial, 6-Costs, 7-Income, 8-Results
 */
export const CHART_OF_ACCOUNTS: Account[] = [
  // CLASS 1 - CAPITAL / EQUITY (Meios Financeiros Líquidos)
  {
    code: '10',
    name: 'Capital',
    namePortuguese: 'Capital',
    type: 'equity',
    category: 'non-current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
    description: 'Share capital and reserves',
  },
  {
    code: '101',
    name: 'Share Capital',
    namePortuguese: 'Capital Social',
    type: 'equity',
    category: 'non-current',
    parentCode: '10',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '11',
    name: 'Reserves',
    namePortuguese: 'Reservas',
    type: 'equity',
    category: 'non-current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '111',
    name: 'Legal Reserves',
    namePortuguese: 'Reservas Legais',
    type: 'equity',
    category: 'non-current',
    parentCode: '11',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '12',
    name: 'Retained Earnings',
    namePortuguese: 'Resultados Transitados',
    type: 'equity',
    category: 'non-current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '13',
    name: 'Net Income (Current Year)',
    namePortuguese: 'Resultado Líquido do Exercício',
    type: 'equity',
    category: 'current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },

  // CLASS 2 - FIXED ASSETS (Imobilizado)
  {
    code: '20',
    name: 'Fixed Assets',
    namePortuguese: 'Imobilizações Corpóreas',
    type: 'asset',
    category: 'non-current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '201',
    name: 'Land and Buildings',
    namePortuguese: 'Terrenos e Edifícios',
    type: 'asset',
    category: 'non-current',
    parentCode: '20',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '202',
    name: 'Workshop Equipment',
    namePortuguese: 'Equipamento Oficina',
    type: 'asset',
    category: 'non-current',
    parentCode: '20',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '2021',
    name: 'Lifts and Hoists',
    namePortuguese: 'Elevadores e Macacos',
    type: 'asset',
    category: 'non-current',
    parentCode: '202',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '2022',
    name: 'Diagnostic Equipment',
    namePortuguese: 'Equipamento de Diagnóstico',
    type: 'asset',
    category: 'non-current',
    parentCode: '202',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '203',
    name: 'Computer Equipment',
    namePortuguese: 'Equipamento Informático',
    type: 'asset',
    category: 'non-current',
    parentCode: '20',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '204',
    name: 'Vehicles',
    namePortuguese: 'Veículos',
    type: 'asset',
    category: 'non-current',
    parentCode: '20',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '21',
    name: 'Accumulated Depreciation',
    namePortuguese: 'Depreciações Acumuladas',
    type: 'asset',
    category: 'non-current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },

  // CLASS 3 - INVENTORY (Existências)
  {
    code: '30',
    name: 'Inventory',
    namePortuguese: 'Inventários',
    type: 'asset',
    category: 'current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '301',
    name: 'Spare Parts',
    namePortuguese: 'Peças de Reposição',
    type: 'asset',
    category: 'current',
    parentCode: '30',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '302',
    name: 'Oils and Lubricants',
    namePortuguese: 'Óleos e Lubrificantes',
    type: 'asset',
    category: 'current',
    parentCode: '30',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '303',
    name: 'Consumables',
    namePortuguese: 'Materiais Consumíveis',
    type: 'asset',
    category: 'current',
    parentCode: '30',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },

  // CLASS 4 - THIRD PARTIES (Terceiros)
  {
    code: '40',
    name: 'Accounts Receivable',
    namePortuguese: 'Clientes',
    type: 'asset',
    category: 'current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '401',
    name: 'Trade Debtors',
    namePortuguese: 'Clientes c/c',
    type: 'asset',
    category: 'current',
    parentCode: '40',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '41',
    name: 'Accounts Payable',
    namePortuguese: 'Fornecedores',
    type: 'liability',
    category: 'current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '411',
    name: 'Trade Creditors',
    namePortuguese: 'Fornecedores c/c',
    type: 'liability',
    category: 'current',
    parentCode: '41',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '42',
    name: 'State and Government',
    namePortuguese: 'Estado e Outros Entes Públicos',
    type: 'liability',
    category: 'current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '421',
    name: 'VAT Payable',
    namePortuguese: 'IVA a Pagar',
    type: 'liability',
    category: 'current',
    parentCode: '42',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '422',
    name: 'VAT Recoverable',
    namePortuguese: 'IVA Dedutível',
    type: 'asset',
    category: 'current',
    parentCode: '42',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '423',
    name: 'Industrial Tax (IRT)',
    namePortuguese: 'Imposto Industrial',
    type: 'liability',
    category: 'current',
    parentCode: '42',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '424',
    name: 'Social Security',
    namePortuguese: 'Segurança Social',
    type: 'liability',
    category: 'current',
    parentCode: '42',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '43',
    name: 'Staff',
    namePortuguese: 'Pessoal',
    type: 'liability',
    category: 'current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '431',
    name: 'Salaries Payable',
    namePortuguese: 'Remunerações a Pagar',
    type: 'liability',
    category: 'current',
    parentCode: '43',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },

  // CLASS 5 - FINANCIAL ACCOUNTS (Meios Financeiros Líquidos)
  {
    code: '50',
    name: 'Cash and Bank',
    namePortuguese: 'Depósitos Bancários e Caixa',
    type: 'asset',
    category: 'current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '501',
    name: 'Cash',
    namePortuguese: 'Caixa',
    type: 'asset',
    category: 'current',
    parentCode: '50',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '502',
    name: 'Bank - Current Account',
    namePortuguese: 'Depósitos à Ordem',
    type: 'asset',
    category: 'current',
    parentCode: '50',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '503',
    name: 'Bank - USD Account',
    namePortuguese: 'Depósitos em Moeda Estrangeira',
    type: 'asset',
    category: 'current',
    parentCode: '50',
    isActive: true,
    balance: 0,
    currency: 'USD',
  },
  {
    code: '51',
    name: 'Loans',
    namePortuguese: 'Empréstimos Obtidos',
    type: 'liability',
    category: 'non-current',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },

  // CLASS 6 - COSTS AND EXPENSES (Gastos)
  {
    code: '60',
    name: 'Cost of Sales',
    namePortuguese: 'Custo das Mercadorias Vendidas e Matérias Consumidas',
    type: 'expense',
    category: 'operating',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '601',
    name: 'Cost of Parts Sold',
    namePortuguese: 'Custo de Peças Vendidas',
    type: 'expense',
    category: 'operating',
    parentCode: '60',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '602',
    name: 'Cost of Materials Used',
    namePortuguese: 'Custo de Materiais Consumidos',
    type: 'expense',
    category: 'operating',
    parentCode: '60',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '61',
    name: 'Staff Costs',
    namePortuguese: 'Gastos com Pessoal',
    type: 'expense',
    category: 'operating',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '611',
    name: 'Salaries and Wages',
    namePortuguese: 'Remunerações dos Órgãos Sociais',
    type: 'expense',
    category: 'operating',
    parentCode: '61',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '612',
    name: 'Social Security Charges',
    namePortuguese: 'Encargos sobre Remunerações',
    type: 'expense',
    category: 'operating',
    parentCode: '61',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '62',
    name: 'External Services',
    namePortuguese: 'Fornecimentos e Serviços Externos',
    type: 'expense',
    category: 'operating',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '621',
    name: 'Electricity and Water',
    namePortuguese: 'Eletricidade e Água',
    type: 'expense',
    category: 'operating',
    parentCode: '62',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '622',
    name: 'Rent',
    namePortuguese: 'Rendas e Alugueres',
    type: 'expense',
    category: 'operating',
    parentCode: '62',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '623',
    name: 'Insurance',
    namePortuguese: 'Seguros',
    type: 'expense',
    category: 'operating',
    parentCode: '62',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '624',
    name: 'Communication',
    namePortuguese: 'Comunicação',
    type: 'expense',
    category: 'operating',
    parentCode: '62',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '63',
    name: 'Depreciation',
    namePortuguese: 'Gastos de Depreciação e Amortização',
    type: 'expense',
    category: 'operating',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '631',
    name: 'Depreciation - Equipment',
    namePortuguese: 'Depreciações - Equipamento',
    type: 'expense',
    category: 'operating',
    parentCode: '63',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '64',
    name: 'Other Operating Expenses',
    namePortuguese: 'Outros Gastos',
    type: 'expense',
    category: 'operating',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '65',
    name: 'Financial Expenses',
    namePortuguese: 'Gastos Financeiros',
    type: 'expense',
    category: 'financial',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '651',
    name: 'Bank Charges',
    namePortuguese: 'Juros e Custos Bancários',
    type: 'expense',
    category: 'financial',
    parentCode: '65',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '652',
    name: 'Exchange Rate Losses',
    namePortuguese: 'Diferenças de Câmbio Desfavoráveis',
    type: 'expense',
    category: 'financial',
    parentCode: '65',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },

  // CLASS 7 - INCOME (Rendimentos)
  {
    code: '70',
    name: 'Sales Revenue',
    namePortuguese: 'Vendas',
    type: 'revenue',
    category: 'operating',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '701',
    name: 'Parts Sales',
    namePortuguese: 'Vendas de Peças',
    type: 'revenue',
    category: 'operating',
    parentCode: '70',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '71',
    name: 'Service Revenue',
    namePortuguese: 'Prestação de Serviços',
    type: 'revenue',
    category: 'operating',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '711',
    name: 'Labor Revenue',
    namePortuguese: 'Serviços de Reparação',
    type: 'revenue',
    category: 'operating',
    parentCode: '71',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '712',
    name: 'Diagnostic Services',
    namePortuguese: 'Serviços de Diagnóstico',
    type: 'revenue',
    category: 'operating',
    parentCode: '71',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '75',
    name: 'Financial Income',
    namePortuguese: 'Rendimentos Financeiros',
    type: 'revenue',
    category: 'financial',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '751',
    name: 'Interest Income',
    namePortuguese: 'Juros Obtidos',
    type: 'revenue',
    category: 'financial',
    parentCode: '75',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
  {
    code: '752',
    name: 'Exchange Rate Gains',
    namePortuguese: 'Diferenças de Câmbio Favoráveis',
    type: 'revenue',
    category: 'financial',
    parentCode: '75',
    isActive: true,
    balance: 0,
    currency: 'AOA',
  },
];

/**
 * Exchange Rates
 */
export const EXCHANGE_RATES: ExchangeRate[] = [
  {
    id: 1,
    fromCurrency: 'USD',
    toCurrency: 'AOA',
    rate: 825.50,
    date: '2024-11-26',
    source: 'Banco Nacional de Angola',
  },
  {
    id: 2,
    fromCurrency: 'EUR',
    toCurrency: 'AOA',
    rate: 895.75,
    date: '2024-11-26',
    source: 'Banco Nacional de Angola',
  },
  {
    id: 3,
    fromCurrency: 'AOA',
    toCurrency: 'USD',
    rate: 0.00121,
    date: '2024-11-26',
    source: 'Banco Nacional de Angola',
  },
];

/**
 * Helper functions for Chart of Accounts
 */
export const getAccountByCode = (code: string): Account | undefined => {
  return CHART_OF_ACCOUNTS.find(acc => acc.code === code);
};

export const getAccountsByType = (type: AccountType): Account[] => {
  return CHART_OF_ACCOUNTS.filter(acc => acc.type === type);
};

export const getChildAccounts = (parentCode: string): Account[] => {
  return CHART_OF_ACCOUNTS.filter(acc => acc.parentCode === parentCode);
};

export const getAccountHierarchy = (): Record<string, Account[]> => {
  const hierarchy: Record<string, Account[]> = {};

  CHART_OF_ACCOUNTS.forEach(account => {
    if (!account.parentCode) {
      hierarchy[account.code] = getChildAccounts(account.code);
    }
  });

  return hierarchy;
};

/**
 * Convert amount from one currency to another
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  date?: string
): number => {
  if (fromCurrency === toCurrency) return amount;

  const rate = EXCHANGE_RATES.find(
    r => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
  );

  if (!rate) {
    console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    return amount;
  }

  return amount * rate.rate;
};

/**
 * Generate accounting entries from invoice
 */
export const generateEntriesFromInvoice = (invoice: Invoice): JournalEntry[] => {
  const entries: JournalEntry[] = [];

  // Debit: Accounts Receivable
  entries.push({
    accountCode: '401',
    accountName: 'Trade Debtors',
    debit: invoice.total,
    credit: 0,
    description: `Invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
  });

  // Credit: Service Revenue (Labor)
  const laborTotal = invoice.items
    .filter(item => item.isLabor)
    .reduce((sum, item) => sum + item.total, 0);

  if (laborTotal > 0) {
    entries.push({
      accountCode: '711',
      accountName: 'Labor Revenue',
      debit: 0,
      credit: laborTotal,
      description: 'Labor charges',
    });
  }

  // Credit: Parts Sales
  const partsTotal = invoice.items
    .filter(item => !item.isLabor)
    .reduce((sum, item) => sum + item.total, 0);

  if (partsTotal > 0) {
    entries.push({
      accountCode: '701',
      accountName: 'Parts Sales',
      debit: 0,
      credit: partsTotal,
      description: 'Parts sold',
    });
  }

  // Credit: VAT Payable
  if (invoice.vatAmount > 0) {
    entries.push({
      accountCode: '421',
      accountName: 'VAT Payable',
      debit: 0,
      credit: invoice.vatAmount,
      description: 'VAT 14%',
    });
  }

  return entries;
};

/**
 * Generate trial balance from transactions
 */
export const generateTrialBalance = (
  transactions: AccountingTransaction[]
): TrialBalanceEntry[] => {
  const accountBalances = new Map<string, { debit: number; credit: number; name: string }>();

  // Process all transactions
  transactions.forEach(trans => {
    if (trans.status !== 'posted') return;

    trans.entries.forEach(entry => {
      const existing = accountBalances.get(entry.accountCode) || {
        debit: 0,
        credit: 0,
        name: entry.accountName,
      };

      accountBalances.set(entry.accountCode, {
        debit: existing.debit + entry.debit,
        credit: existing.credit + entry.credit,
        name: entry.accountName,
      });
    });
  });

  // Convert to trial balance entries
  const trialBalance: TrialBalanceEntry[] = [];

  accountBalances.forEach((value, code) => {
    const balance = value.debit - value.credit;
    trialBalance.push({
      accountCode: code,
      accountName: value.name,
      debit: value.debit,
      credit: value.credit,
      balance: balance,
    });
  });

  // Sort by account code
  return trialBalance.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
};

/**
 * Generate general ledger for an account
 */
export const generateGeneralLedger = (
  accountCode: string,
  transactions: AccountingTransaction[]
): GeneralLedgerEntry[] => {
  const entries: GeneralLedgerEntry[] = [];
  let runningBalance = 0;

  // Filter and sort transactions
  const relevantTransactions = transactions
    .filter(trans =>
      trans.status === 'posted' &&
      trans.entries.some(e => e.accountCode === accountCode)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  relevantTransactions.forEach(trans => {
    trans.entries.forEach(entry => {
      if (entry.accountCode === accountCode) {
        runningBalance += entry.debit - entry.credit;

        entries.push({
          date: trans.date,
          reference: trans.reference,
          description: entry.description || trans.description,
          debit: entry.debit,
          credit: entry.credit,
          balance: runningBalance,
        });
      }
    });
  });

  return entries;
};

/**
 * Generate period-end closing entries
 */
export const generateClosingEntries = (
  periodEndDate: string,
  transactions: AccountingTransaction[]
): JournalEntry[] => {
  const trialBalance = generateTrialBalance(transactions);
  const entries: JournalEntry[] = [];

  // Calculate total revenue
  const totalRevenue = trialBalance
    .filter(entry => {
      const account = getAccountByCode(entry.accountCode);
      return account?.type === 'revenue';
    })
    .reduce((sum, entry) => sum + Math.abs(entry.balance), 0);

  // Calculate total expenses
  const totalExpenses = trialBalance
    .filter(entry => {
      const account = getAccountByCode(entry.accountCode);
      return account?.type === 'expense';
    })
    .reduce((sum, entry) => sum + Math.abs(entry.balance), 0);

  // Close revenue accounts
  trialBalance
    .filter(entry => {
      const account = getAccountByCode(entry.accountCode);
      return account?.type === 'revenue' && entry.balance !== 0;
    })
    .forEach(entry => {
      entries.push({
        accountCode: entry.accountCode,
        accountName: entry.accountName,
        debit: Math.abs(entry.balance),
        credit: 0,
        description: 'Period-end closing',
      });
    });

  // Close expense accounts
  trialBalance
    .filter(entry => {
      const account = getAccountByCode(entry.accountCode);
      return account?.type === 'expense' && entry.balance !== 0;
    })
    .forEach(entry => {
      entries.push({
        accountCode: entry.accountCode,
        accountName: entry.accountName,
        debit: 0,
        credit: Math.abs(entry.balance),
        description: 'Period-end closing',
      });
    });

  // Transfer to net income account
  const netIncome = totalRevenue - totalExpenses;

  if (netIncome !== 0) {
    entries.push({
      accountCode: '13',
      accountName: 'Net Income (Current Year)',
      debit: netIncome > 0 ? 0 : Math.abs(netIncome),
      credit: netIncome > 0 ? netIncome : 0,
      description: 'Net income for the period',
    });
  }

  return entries;
};

/**
 * Validate transaction balance
 */
export const validateTransaction = (entries: JournalEntry[]): {
  isValid: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
} => {
  const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
  const difference = Math.abs(totalDebit - totalCredit);

  return {
    isValid: difference < 0.01, // Allow for rounding errors
    totalDebit,
    totalCredit,
    difference,
  };
};

// ── QuickBooks-style helpers ──────────────────────────────────────────────

export const calculateDaysOutstanding = (invoice: Invoice): number =>
  Math.floor((Date.now() - new Date(invoice.date).getTime()) / 86400000);

export const calculateInvoiceStatus = (invoice: Invoice): InvoiceStatus => {
  if (invoice.balance <= 0) return 'paid';
  if (invoice.amountPaid > 0) return 'partially_paid';
  if (new Date(invoice.dueDate) < new Date()) return 'overdue';
  return invoice.status === 'draft' ? 'draft' : 'sent';
};

export const applyPaymentToInvoice = (
  invoice: Invoice,
  payment: Omit<InvoicePayment, 'id' | 'invoiceId'>
): { updatedInvoice: Invoice; journalEntries: JournalEntry[] } => {
  const p: InvoicePayment = { ...payment, id: Date.now(), invoiceId: invoice.id };
  const amountPaid = invoice.amountPaid + payment.amount;
  const balance = Math.max(0, invoice.total - amountPaid);
  const updatedInvoice: Invoice = {
    ...invoice, amountPaid, balance,
    payments: [...invoice.payments, p],
    status: calculateInvoiceStatus({ ...invoice, amountPaid, balance }),
  };
  const cashAccount = payment.method === 'cash' ? '501' : '502';
  const journalEntries: JournalEntry[] = [
    { accountCode: cashAccount, accountName: payment.method === 'cash' ? 'Cash' : 'Bank - Current Account', debit: payment.amount, credit: 0, description: `Payment for ${invoice.invoiceNumber}` },
    { accountCode: '401', accountName: 'Trade Debtors', debit: 0, credit: payment.amount, description: `Payment for ${invoice.invoiceNumber}` },
  ];
  return { updatedInvoice, journalEntries };
};

export const generateBillNumber = (lastNumber: number): string => {
  const y = new Date().getFullYear();
  const m = String(new Date().getMonth() + 1).padStart(2, '0');
  return `BILL-${y}${m}-${String(lastNumber + 1).padStart(4, '0')}`;
};

export const generateEntriesFromBill = (bill: VendorBill): JournalEntry[] => [
  { accountCode: bill.expenseAccountCode, accountName: BILL_CATEGORY_LABELS[bill.category], debit: bill.subtotal, credit: 0, description: bill.description },
  { accountCode: '422', accountName: 'VAT Recoverable', debit: bill.vatAmount, credit: 0, description: 'VAT 14% recoverable' },
  { accountCode: '411', accountName: 'Trade Creditors', debit: 0, credit: bill.total, description: `Payable to ${bill.vendorName}` },
];

export const applyPaymentToBill = (
  bill: VendorBill,
  payment: Omit<BillPayment, 'id' | 'billId'>
): { updatedBill: VendorBill; journalEntries: JournalEntry[] } => {
  const p: BillPayment = { ...payment, id: Date.now(), billId: bill.id };
  const amountPaid = bill.amountPaid + payment.amount;
  const balance = Math.max(0, bill.total - amountPaid);
  const status = balance <= 0 ? 'paid' : amountPaid > 0 ? 'partially_paid' : bill.status;
  const updatedBill: VendorBill = { ...bill, amountPaid, balance, status, payments: [...bill.payments, p] };
  const cashAccount = payment.method === 'cash' ? '501' : '502';
  const journalEntries: JournalEntry[] = [
    { accountCode: '411', accountName: 'Trade Creditors', debit: payment.amount, credit: 0, description: `Payment to ${bill.vendorName}` },
    { accountCode: cashAccount, accountName: payment.method === 'cash' ? 'Cash' : 'Bank - Current Account', debit: 0, credit: payment.amount, description: `Payment to ${bill.vendorName}` },
  ];
  return { updatedBill, journalEntries };
};

export const computeARAging = (invoices: Invoice[]): ARAgingBucket[] => {
  const unpaid = invoices.filter(i => i.status !== 'paid' && i.status !== 'draft');
  const map: Record<number, ARAgingBucket> = {};
  for (const inv of unpaid) {
    const days = calculateDaysOutstanding(inv);
    const bal = inv.balance;
    if (!map[inv.customerId]) map[inv.customerId] = { customerId: inv.customerId, customerName: inv.customerName, current: 0, days30: 0, days60: 0, days90Plus: 0, total: 0 };
    const b = map[inv.customerId];
    if (days <= 30) b.current += bal;
    else if (days <= 60) b.days30 += bal;
    else if (days <= 90) b.days60 += bal;
    else b.days90Plus += bal;
    b.total += bal;
  }
  return Object.values(map).sort((a, b) => b.total - a.total);
};

export const generateProfitLossReport = (
  transactions: AccountingTransaction[],
  from: string,
  to: string
): ProfitLossReport => {
  const filtered = transactions.filter(t => t.status === 'posted' && t.date >= from && t.date <= to);
  const tb = generateTrialBalance(filtered);
  const getAmount = (prefixes: string[]) =>
    tb.filter(e => prefixes.some(p => e.accountCode.startsWith(p)))
      .map(e => ({ accountCode: e.accountCode, accountName: e.accountName, amount: Math.abs(e.credit - e.debit) }));
  const revenue = getAmount(['70', '71', '75']);
  const costOfSales = getAmount(['60']);
  const operatingExpenses = getAmount(['61', '62', '63', '64']);
  const financialItems = getAmount(['65', '76', '77']);
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
  const totalCostOfSales = costOfSales.reduce((s, r) => s + r.amount, 0);
  const grossProfit = totalRevenue - totalCostOfSales;
  const totalOperatingExpenses = operatingExpenses.reduce((s, r) => s + r.amount, 0);
  const operatingProfit = grossProfit - totalOperatingExpenses;
  const netIncome = operatingProfit + financialItems.reduce((s, r) => s + r.amount, 0);
  return { period: { from, to }, revenue, totalRevenue, costOfSales, totalCostOfSales, grossProfit, operatingExpenses, totalOperatingExpenses, operatingProfit, financialItems, netIncome };
};

export const generateBalanceSheetReport = (
  transactions: AccountingTransaction[],
  asOf: string
): BalanceSheetReport => {
  const filtered = transactions.filter(t => t.status === 'posted' && t.date <= asOf);
  const tb = generateTrialBalance(filtered);
  const toLine = (e: TrialBalanceEntry): BalanceSheetLine => ({ accountCode: e.accountCode, accountName: e.accountName, balance: e.debit - e.credit });
  const assets = tb.filter(e => { const a = getAccountByCode(e.accountCode); return a?.type === 'asset'; });
  const liabilities = tb.filter(e => { const a = getAccountByCode(e.accountCode); return a?.type === 'liability'; });
  const equity = tb.filter(e => { const a = getAccountByCode(e.accountCode); return a?.type === 'equity'; });
  const currentAssets = assets.filter(e => getAccountByCode(e.accountCode)?.category === 'current').map(toLine);
  const nonCurrentAssets = assets.filter(e => getAccountByCode(e.accountCode)?.category !== 'current').map(toLine);
  const currentLiabilities = liabilities.filter(e => getAccountByCode(e.accountCode)?.category === 'current').map(toLine);
  const nonCurrentLiabilities = liabilities.filter(e => getAccountByCode(e.accountCode)?.category !== 'current').map(toLine);
  const totalAssets = [...currentAssets, ...nonCurrentAssets].reduce((s, l) => s + l.balance, 0);
  const totalLiabilities = [...currentLiabilities, ...nonCurrentLiabilities].reduce((s, l) => s + Math.abs(l.balance), 0);
  const totalEquity = equity.reduce((s, e) => s + Math.abs(e.credit - e.debit), 0);
  return {
    asOf,
    assets: { current: currentAssets, nonCurrent: nonCurrentAssets, totalAssets },
    liabilities: { current: currentLiabilities.map(l => ({ ...l, balance: Math.abs(l.balance) })), nonCurrent: nonCurrentLiabilities.map(l => ({ ...l, balance: Math.abs(l.balance) })), totalLiabilities },
    equity: equity.map(e => ({ accountCode: e.accountCode, accountName: e.accountName, balance: Math.abs(e.credit - e.debit) })),
    totalEquity,
    totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
  };
};

export const generateCustomerStatement = (customerId: number, invoices: Invoice[]): CustomerStatement => {
  const lines = invoices
    .filter(i => i.customerId === customerId)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(invoice => ({ invoice, daysOutstanding: calculateDaysOutstanding(invoice) }));
  const first = lines[0]?.invoice;
  return {
    customerId,
    customerName: first?.customerName ?? '',
    customerEmail: first?.customerEmail,
    generatedDate: new Date().toISOString().split('T')[0],
    lines,
    totalBilled: lines.reduce((s, l) => s + l.invoice.total, 0),
    totalPaid: lines.reduce((s, l) => s + l.invoice.amountPaid, 0),
    totalOutstanding: lines.reduce((s, l) => s + l.invoice.balance, 0),
  };
};

/**
 * Sample invoices for demonstration
 */
export const SAMPLE_INVOICES: Invoice[] = [
  {
    id: 1, invoiceNumber: 'INV-202601-0001', date: '2026-01-10', dueDate: '2026-02-09',
    customerId: 1, customerName: 'João Silva', customerEmail: 'joao.silva@email.com',
    subtotal: 120000, vatAmount: 16800, total: 136800, amountPaid: 136800, balance: 0,
    status: 'paid', jobNumber: 'JOB-202601-0001', notes: 'BMW 530i full service',
    items: [
      { description: 'Engine Oil Change + Filter', quantity: 1, unitPrice: 45000, total: 45000, isLabor: false },
      { description: 'Labour - Full Service', quantity: 3, unitPrice: 25000, total: 75000, isLabor: true },
    ],
    payments: [{ id: 1, invoiceId: 1, date: '2026-01-12', amount: 136800, method: 'bank_transfer', reference: 'TRF-20260112' }],
  },
  {
    id: 2, invoiceNumber: 'INV-202601-0002', date: '2026-01-18', dueDate: '2026-02-17',
    customerId: 2, customerName: 'Maria Santos', customerEmail: 'maria.santos@email.com',
    subtotal: 85000, vatAmount: 11900, total: 96900, amountPaid: 50000, balance: 46900,
    status: 'partially_paid', jobNumber: 'JOB-202601-0002', notes: 'Toyota Hilux brake pads + discs',
    items: [
      { description: 'Front Brake Pads', quantity: 1, unitPrice: 35000, total: 35000, isLabor: false },
      { description: 'Front Brake Discs', quantity: 2, unitPrice: 15000, total: 30000, isLabor: false },
      { description: 'Labour - Brake Replacement', quantity: 2, unitPrice: 10000, total: 20000, isLabor: true },
    ],
    payments: [{ id: 2, invoiceId: 2, date: '2026-01-20', amount: 50000, method: 'cash', reference: undefined }],
  },
  {
    id: 3, invoiceNumber: 'INV-202602-0001', date: '2026-02-05', dueDate: '2026-03-07',
    customerId: 3, customerName: 'Carlos Ferreira', customerEmail: 'carlos.ferreira@email.com',
    subtotal: 200000, vatAmount: 28000, total: 228000, amountPaid: 0, balance: 228000,
    status: 'overdue', jobNumber: 'JOB-202602-0001', notes: 'Mercedes C220 gearbox repair',
    items: [
      { description: 'Gearbox Overhaul', quantity: 1, unitPrice: 120000, total: 120000, isLabor: true },
      { description: 'Gearbox Seals Kit', quantity: 1, unitPrice: 45000, total: 45000, isLabor: false },
      { description: 'Transmission Fluid', quantity: 2, unitPrice: 17500, total: 35000, isLabor: false },
    ],
    payments: [],
  },
  {
    id: 4, invoiceNumber: 'INV-202602-0002', date: '2026-02-20', dueDate: '2026-03-22',
    customerId: 4, customerName: 'Ana Rodrigues', customerEmail: 'ana.rodrigues@email.com',
    subtotal: 55000, vatAmount: 7700, total: 62700, amountPaid: 0, balance: 62700,
    status: 'sent', jobNumber: 'JOB-202602-0002', notes: 'VW Polo tyres & wheel alignment',
    items: [
      { description: 'Tyres 195/65 R15 (x4)', quantity: 4, unitPrice: 12000, total: 48000, isLabor: false },
      { description: 'Labour - Fit & Balance', quantity: 1, unitPrice: 7000, total: 7000, isLabor: true },
    ],
    payments: [],
  },
  {
    id: 5, invoiceNumber: 'INV-202603-0001', date: '2026-03-05', dueDate: '2026-04-04',
    customerId: 5, customerName: 'Pedro Neto', customerEmail: 'pedro.neto@email.com',
    subtotal: 310000, vatAmount: 43400, total: 353400, amountPaid: 353400, balance: 0,
    status: 'paid', jobNumber: 'JOB-202603-0001', notes: 'Land Rover Discovery engine rebuild',
    items: [
      { description: 'Engine Rebuild - Labour', quantity: 1, unitPrice: 180000, total: 180000, isLabor: true },
      { description: 'Piston Rings Set', quantity: 1, unitPrice: 65000, total: 65000, isLabor: false },
      { description: 'Head Gasket Set', quantity: 1, unitPrice: 45000, total: 45000, isLabor: false },
      { description: 'Engine Oil 10W40 (5L)', quantity: 4, unitPrice: 5000, total: 20000, isLabor: false },
    ],
    payments: [{ id: 5, invoiceId: 5, date: '2026-03-07', amount: 353400, method: 'bank_transfer', reference: 'TRF-20260307' }],
  },
];

/**
 * Sample vendor bills for demonstration
 */
export const SAMPLE_VENDOR_BILLS: VendorBill[] = [
  {
    id: 1, billNumber: 'BILL-202601-0001', vendorName: 'AutoParts Angola Lda',
    date: '2026-01-08', dueDate: '2026-02-07', category: 'parts_purchase',
    expenseAccountCode: '301', description: 'January parts stock replenishment',
    subtotal: 450000, vatAmount: 63000, total: 513000, amountPaid: 513000, balance: 0,
    status: 'paid', payments: [{ id: 1, billId: 1, date: '2026-01-15', amount: 513000, method: 'bank_transfer', reference: 'TRF-20260115' }],
  },
  {
    id: 2, billNumber: 'BILL-202601-0002', vendorName: 'Lubrificantes Angolanos SA',
    date: '2026-01-15', dueDate: '2026-02-14', category: 'lubricants',
    expenseAccountCode: '302', description: 'Engine oils and transmission fluids',
    subtotal: 95000, vatAmount: 13300, total: 108300, amountPaid: 60000, balance: 48300,
    status: 'partially_paid', payments: [{ id: 2, billId: 2, date: '2026-01-20', amount: 60000, method: 'cash', reference: undefined }],
  },
  {
    id: 3, billNumber: 'BILL-202602-0001', vendorName: 'Imobiliária Luanda Centro',
    date: '2026-02-01', dueDate: '2026-02-28', category: 'rent',
    expenseAccountCode: '622', description: 'Workshop rent - February 2026',
    subtotal: 350000, vatAmount: 49000, total: 399000, amountPaid: 399000, balance: 0,
    status: 'paid', payments: [{ id: 3, billId: 3, date: '2026-02-03', amount: 399000, method: 'bank_transfer', reference: 'TRF-20260203' }],
  },
  {
    id: 4, billNumber: 'BILL-202602-0002', vendorName: 'ENDE - Energia Angola',
    date: '2026-02-10', dueDate: '2026-03-12', category: 'electricity_water',
    expenseAccountCode: '621', description: 'Electricity bill - February 2026',
    subtotal: 85000, vatAmount: 11900, total: 96900, amountPaid: 0, balance: 96900,
    status: 'overdue', payments: [],
  },
  {
    id: 5, billNumber: 'BILL-202603-0001', vendorName: 'AutoParts Angola Lda',
    date: '2026-03-01', dueDate: '2026-03-31', category: 'parts_purchase',
    expenseAccountCode: '301', description: 'March parts stock replenishment',
    subtotal: 520000, vatAmount: 72800, total: 592800, amountPaid: 0, balance: 592800,
    status: 'pending', payments: [],
  },
  {
    id: 6, billNumber: 'BILL-202603-0002', vendorName: 'Unitel - Comunicações',
    date: '2026-03-05', dueDate: '2026-04-04', category: 'communication',
    expenseAccountCode: '624', description: 'Internet & phone - March 2026',
    subtotal: 42000, vatAmount: 5880, total: 47880, amountPaid: 47880, balance: 0,
    status: 'paid', payments: [{ id: 6, billId: 6, date: '2026-03-06', amount: 47880, method: 'bank_transfer', reference: 'TRF-20260306' }],
  },
];

/**
 * Sample transactions for demonstration
 */
export const SAMPLE_TRANSACTIONS: AccountingTransaction[] = [
  {
    id: 1,
    date: '2024-11-25',
    reference: 'INV-001',
    description: 'Service invoice - BMW 330i brake service',
    entries: [
      { accountCode: '401', accountName: 'Trade Debtors', debit: 57750, credit: 0, description: 'Invoice amount including VAT' },
      { accountCode: '711', accountName: 'Labor Revenue', debit: 0, credit: 40000, description: 'Labor charge' },
      { accountCode: '701', accountName: 'Parts Sales', debit: 0, credit: 10000, description: 'Parts sold' },
      { accountCode: '421', accountName: 'VAT Payable', debit: 0, credit: 7750, description: 'VAT 14% on services' },
    ],
    totalDebit: 57750,
    totalCredit: 57750,
    status: 'posted',
    createdBy: 'System',
  },
  {
    id: 2,
    date: '2024-11-25',
    reference: 'PAY-001',
    description: 'Payment received from customer',
    entries: [
      { accountCode: '502', accountName: 'Bank - Current Account', debit: 57750, credit: 0, description: 'Bank transfer received' },
      { accountCode: '401', accountName: 'Trade Debtors', debit: 0, credit: 57750, description: 'Payment for INV-001' },
    ],
    totalDebit: 57750,
    totalCredit: 57750,
    status: 'posted',
    createdBy: 'System',
  },
  {
    id: 3,
    date: '2024-11-24',
    reference: 'PUR-001',
    description: 'Purchase of spare parts from supplier',
    entries: [
      { accountCode: '301', accountName: 'Spare Parts', debit: 50000, credit: 0, description: 'Inventory purchase' },
      { accountCode: '422', accountName: 'VAT Recoverable', debit: 7000, credit: 0, description: 'VAT 14% recoverable' },
      { accountCode: '411', accountName: 'Trade Creditors', debit: 0, credit: 57000, description: 'Amount payable to supplier' },
    ],
    totalDebit: 57000,
    totalCredit: 57000,
    status: 'posted',
    createdBy: 'System',
  },
  {
    id: 4,
    date: '2024-11-23',
    reference: 'SAL-001',
    description: 'Staff salaries for November',
    entries: [
      { accountCode: '611', accountName: 'Salaries and Wages', debit: 500000, credit: 0, description: 'Gross salaries' },
      { accountCode: '612', accountName: 'Social Security Charges', debit: 40000, credit: 0, description: 'Employer contributions' },
      { accountCode: '424', accountName: 'Social Security', debit: 0, credit: 60000, description: 'Employee + Employer SS' },
      { accountCode: '431', accountName: 'Salaries Payable', debit: 0, credit: 480000, description: 'Net salaries payable' },
    ],
    totalDebit: 540000,
    totalCredit: 540000,
    status: 'posted',
    createdBy: 'System',
  },
];
