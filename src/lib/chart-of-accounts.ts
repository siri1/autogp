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

export interface Invoice {
  id: number;
  invoiceNumber: string;
  date: string;
  customerId: number;
  customerName: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid';
  items: InvoiceItem[];
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
