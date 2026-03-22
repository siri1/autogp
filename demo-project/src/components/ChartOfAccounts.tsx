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
  BookOpen,
  FileText,
  TrendingUp,
  Building2,
  Wallet,
  Users,
  DollarSign,
  Download,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Calculator,
  BarChart2,
  Lock,
  Repeat,
  FileDown,
} from 'lucide-react';
import {
  CHART_OF_ACCOUNTS,
  SAMPLE_TRANSACTIONS,
  EXCHANGE_RATES,
  getAccountsByType,
  getAccountByCode,
  generateTrialBalance,
  generateGeneralLedger,
  generateClosingEntries,
  generateEntriesFromInvoice,
  convertCurrency,
  validateTransaction,
  type Account,
  type AccountingTransaction,
  type AccountType,
  type JournalEntry,
  type ExchangeRate,
  type Invoice,
  type InvoiceItem,
} from '@/lib/chart-of-accounts';
import { quickExcelExport } from '@/lib/advanced-excel-export';

export default function ChartOfAccounts() {
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | 'all'>('all');
  const [transactions, setTransactions] = useState<AccountingTransaction[]>(SAMPLE_TRANSACTIONS);
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [showClosingDialog, setShowClosingDialog] = useState(false);
  const [showLedgerDialog, setShowLedgerDialog] = useState(false);
  const [selectedAccountForLedger, setSelectedAccountForLedger] = useState<string>('');
  const [newEntryData, setNewEntryData] = useState<{
    date: string;
    reference: string;
    description: string;
    entries: JournalEntry[];
  }>({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    entries: [],
  });

  const toggleAccount = (code: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedAccounts(newExpanded);
  };

  const getAccountTypeColor = (type: AccountType) => {
    switch (type) {
      case 'asset':
        return 'bg-blue-100 text-blue-800';
      case 'liability':
        return 'bg-red-100 text-red-800';
      case 'equity':
        return 'bg-purple-100 text-purple-800';
      case 'revenue':
        return 'bg-green-100 text-green-800';
      case 'expense':
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'asset':
        return <Building2 className="h-4 w-4" />;
      case 'liability':
        return <FileText className="h-4 w-4" />;
      case 'equity':
        return <Users className="h-4 w-4" />;
      case 'revenue':
        return <TrendingUp className="h-4 w-4" />;
      case 'expense':
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'AOA') => {
    if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${amount.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`;
  };

  const getFilteredAccounts = () => {
    if (selectedAccountType === 'all') {
      return CHART_OF_ACCOUNTS;
    }
    return getAccountsByType(selectedAccountType);
  };

  const exportChartOfAccounts = () => {
    const data = {
      headers: ['Code', 'Account Name', 'Portuguese Name', 'Type', 'Category', 'Balance', 'Currency', 'Status'],
      rows: CHART_OF_ACCOUNTS.map(acc => [
        acc.code,
        acc.name,
        acc.namePortuguese || '',
        acc.type,
        acc.category,
        acc.balance,
        acc.currency,
        acc.isActive ? 'Active' : 'Inactive',
      ]),
    };

    quickExcelExport(
      'Chart of Accounts - Angolan GAAP',
      data.headers,
      data.rows,
      'chart-of-accounts.xlsx'
    );
  };

  const exportTransactions = () => {
    const rows: any[][] = [];

    transactions.forEach(trans => {
      rows.push([trans.date, trans.reference, trans.description, '', '', '', trans.status]);
      trans.entries.forEach(entry => {
        rows.push([
          '',
          entry.accountCode,
          entry.accountName,
          entry.description || '',
          entry.debit || '',
          entry.credit || '',
          '',
        ]);
      });
      rows.push(['', '', 'TOTAL', '', trans.totalDebit, trans.totalCredit, '']);
      rows.push(['', '', '', '', '', '', '']);
    });

    quickExcelExport(
      'Journal Entries',
      ['Date', 'Account Code', 'Account Name', 'Description', 'Debit (Kz)', 'Credit (Kz)', 'Status'],
      rows,
      'journal-entries.xlsx'
    );
  };

  const addEntryLine = () => {
    setNewEntryData(prev => ({
      ...prev,
      entries: [
        ...prev.entries,
        { accountCode: '', accountName: '', debit: 0, credit: 0, description: '' },
      ],
    }));
  };

  const updateEntryLine = (index: number, field: keyof JournalEntry, value: string | number) => {
    setNewEntryData(prev => {
      const newEntries = [...prev.entries];
      if (field === 'accountCode') {
        const account = getAccountByCode(value as string);
        newEntries[index] = {
          ...newEntries[index],
          accountCode: value as string,
          accountName: account?.name || '',
        };
      } else {
        newEntries[index] = {
          ...newEntries[index],
          [field]: value,
        };
      }
      return { ...prev, entries: newEntries };
    });
  };

  const removeEntryLine = (index: number) => {
    setNewEntryData(prev => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== index),
    }));
  };

  const saveNewTransaction = () => {
    const validation = validateTransaction(newEntryData.entries);

    if (!validation.isValid) {
      alert(`Transaction is not balanced! Difference: ${validation.difference.toFixed(2)} Kz`);
      return;
    }

    const newTransaction: AccountingTransaction = {
      id: transactions.length + 1,
      date: newEntryData.date,
      reference: newEntryData.reference,
      description: newEntryData.description,
      entries: newEntryData.entries,
      totalDebit: validation.totalDebit,
      totalCredit: validation.totalCredit,
      status: 'posted',
      createdBy: 'User',
    };

    setTransactions(prev => [...prev, newTransaction]);
    setShowNewEntryDialog(false);
    setNewEntryData({
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      entries: [],
    });
  };

  const createInvoiceEntry = () => {
    const sampleInvoice: Invoice = {
      id: 1,
      invoiceNumber: 'INV-' + (transactions.length + 1),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      customerId: 1,
      customerName: 'Sample Customer',
      subtotal: 50000,
      vatAmount: 7000,
      total: 57000,
      amountPaid: 0,
      balance: 57000,
      status: 'sent',
      payments: [],
      items: [
        { description: 'Labor - Engine Service', quantity: 3, unitPrice: 15000, total: 45000, isLabor: true },
        { description: 'Oil Filter', quantity: 1, unitPrice: 5000, total: 5000, isLabor: false },
      ],
    };

    const entries = generateEntriesFromInvoice(sampleInvoice);
    const validation = validateTransaction(entries);

    const newTransaction: AccountingTransaction = {
      id: transactions.length + 1,
      date: sampleInvoice.date,
      reference: sampleInvoice.invoiceNumber,
      description: `Invoice - ${sampleInvoice.customerName}`,
      entries,
      totalDebit: validation.totalDebit,
      totalCredit: validation.totalCredit,
      status: 'posted',
      createdBy: 'System (Auto from Invoice)',
    };

    setTransactions(prev => [...prev, newTransaction]);
  };

  const executeClosing = () => {
    const closingDate = new Date().toISOString().split('T')[0];
    const closingEntries = generateClosingEntries(closingDate, transactions);

    if (closingEntries.length === 0) {
      alert('No entries to close. All revenue and expense accounts have zero balance.');
      return;
    }

    const validation = validateTransaction(closingEntries);

    const closingTransaction: AccountingTransaction = {
      id: transactions.length + 1,
      date: closingDate,
      reference: `CLOSE-${closingDate}`,
      description: 'Period-end closing entries',
      entries: closingEntries,
      totalDebit: validation.totalDebit,
      totalCredit: validation.totalCredit,
      status: 'posted',
      createdBy: 'System (Period Closing)',
    };

    setTransactions(prev => [...prev, closingTransaction]);
    setShowClosingDialog(false);
  };

  const exportTrialBalance = () => {
    const trialBalance = generateTrialBalance(transactions);
    const totalDebit = trialBalance.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = trialBalance.reduce((sum, e) => sum + e.credit, 0);

    const data = {
      headers: ['Account Code', 'Account Name', 'Debit (Kz)', 'Credit (Kz)', 'Balance (Kz)'],
      rows: [
        ...trialBalance.map(e => [
          e.accountCode,
          e.accountName,
          e.debit.toFixed(2),
          e.credit.toFixed(2),
          e.balance.toFixed(2),
        ]),
        ['', 'TOTAL', totalDebit.toFixed(2), totalCredit.toFixed(2), ''],
      ],
    };

    quickExcelExport('Trial Balance', data.headers, data.rows, 'trial-balance.xlsx');
  };

  const exportGeneralLedger = (accountCode: string) => {
    const ledger = generateGeneralLedger(accountCode, transactions);
    const account = getAccountByCode(accountCode);

    const data = {
      headers: ['Date', 'Reference', 'Description', 'Debit (Kz)', 'Credit (Kz)', 'Balance (Kz)'],
      rows: ledger.map(e => [
        e.date,
        e.reference,
        e.description,
        e.debit.toFixed(2),
        e.credit.toFixed(2),
        e.balance.toFixed(2),
      ]),
    };

    quickExcelExport(
      `General Ledger - ${account?.name || accountCode}`,
      data.headers,
      data.rows,
      `ledger-${accountCode}.xlsx`
    );
  };

  // Calculate totals by account type
  const calculateTotals = () => {
    const totals = {
      assets: 0,
      liabilities: 0,
      equity: 0,
      revenue: 0,
      expenses: 0,
    };

    CHART_OF_ACCOUNTS.forEach(acc => {
      switch (acc.type) {
        case 'asset':
          totals.assets += acc.balance;
          break;
        case 'liability':
          totals.liabilities += acc.balance;
          break;
        case 'equity':
          totals.equity += acc.balance;
          break;
        case 'revenue':
          totals.revenue += acc.balance;
          break;
        case 'expense':
          totals.expenses += acc.balance;
          break;
      }
    });

    return totals;
  };

  const totals = calculateTotals();

  const trialBalance = generateTrialBalance(transactions);

  const renderAccount = (account: Account, level: number = 0) => {
    const hasChildren = CHART_OF_ACCOUNTS.some(acc => acc.parentCode === account.code);
    const isExpanded = expandedAccounts.has(account.code);
    const children = CHART_OF_ACCOUNTS.filter(acc => acc.parentCode === account.code);

    return (
      <div key={account.code}>
        <div
          className={`flex items-center justify-between p-3 hover:bg-slate-50 border-b ${
            level > 0 ? 'ml-' + (level * 8) : ''
          }`}
          style={{ paddingLeft: `${level * 2 + 1}rem` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleAccount(account.code)}
                className="p-1 hover:bg-slate-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}

            <div className="flex items-center gap-2">
              {getAccountTypeIcon(account.type)}
              <span className="font-mono font-semibold text-slate-900">{account.code}</span>
            </div>

            <div className="flex-1">
              <div className="font-medium text-slate-900">{account.name}</div>
              {account.namePortuguese && (
                <div className="text-sm text-slate-500 italic">{account.namePortuguese}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge className={getAccountTypeColor(account.type)}>
              {account.type}
            </Badge>
            <div className="text-right min-w-[150px]">
              <div className="font-semibold">{formatCurrency(account.balance, account.currency)}</div>
              <div className="text-xs text-slate-500">{account.currency}</div>
            </div>
          </div>
        </div>

        {isExpanded && children.length > 0 && (
          <div>
            {children.map(child => renderAccount(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Plano de Contas / Chart of Accounts
          </h2>
          <p className="text-slate-600 mt-2">Based on Angolan GAAP - Sistema de Normalização Contabilística</p>
        </div>
        <Button onClick={exportChartOfAccounts} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export COA
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Assets / Activo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(totals.assets)}</div>
            <div className="text-xs text-blue-700 mt-1">
              {getAccountsByType('asset').length} accounts
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-600" />
              Liabilities / Passivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{formatCurrency(totals.liabilities)}</div>
            <div className="text-xs text-red-700 mt-1">
              {getAccountsByType('liability').length} accounts
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Equity / Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(totals.equity)}</div>
            <div className="text-xs text-purple-700 mt-1">
              {getAccountsByType('equity').length} accounts
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Revenue / Rendimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(totals.revenue)}</div>
            <div className="text-xs text-green-700 mt-1">
              {getAccountsByType('revenue').length} accounts
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              Expenses / Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{formatCurrency(totals.expenses)}</div>
            <div className="text-xs text-orange-700 mt-1">
              {getAccountsByType('expense').length} accounts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 max-w-4xl">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="trial">Trial Balance</TabsTrigger>
          <TabsTrigger value="ledger">Gen. Ledger</TabsTrigger>
          <TabsTrigger value="closing">Period Close</TabsTrigger>
          <TabsTrigger value="currency">Exchange Rates</TabsTrigger>
        </TabsList>

        {/* Chart of Accounts Tab */}
        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Account Listing</CardTitle>
                  <CardDescription>Complete chart of accounts with balances</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedAccountType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAccountType('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedAccountType === 'asset' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAccountType('asset')}
                  >
                    Assets
                  </Button>
                  <Button
                    variant={selectedAccountType === 'liability' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAccountType('liability')}
                  >
                    Liabilities
                  </Button>
                  <Button
                    variant={selectedAccountType === 'equity' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAccountType('equity')}
                  >
                    Equity
                  </Button>
                  <Button
                    variant={selectedAccountType === 'revenue' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAccountType('revenue')}
                  >
                    Revenue
                  </Button>
                  <Button
                    variant={selectedAccountType === 'expense' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAccountType('expense')}
                  >
                    Expenses
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border rounded-lg overflow-hidden">
                {getFilteredAccounts()
                  .filter(acc => !acc.parentCode)
                  .map(account => renderAccount(account))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journal Entries Tab */}
        <TabsContent value="journal">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Journal Entries / Lançamentos</CardTitle>
                  <CardDescription>Record and manage accounting transactions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowNewEntryDialog(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Entry
                  </Button>
                  <Button onClick={createInvoiceEntry} variant="outline" size="sm">
                    <FileDown className="h-4 w-4 mr-2" />
                    From Invoice
                  </Button>
                  <Button onClick={exportTransactions} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {transactions.map(trans => (
                <Card key={trans.id} className="border-slate-200">
                  <CardHeader className="pb-3 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold text-blue-600">{trans.reference}</span>
                          <Badge className={
                            trans.status === 'posted'
                              ? 'bg-green-100 text-green-800'
                              : trans.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }>
                            {trans.status === 'posted' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {trans.status === 'draft' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {trans.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{trans.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600">{new Date(trans.date).toLocaleDateString('pt-AO')}</div>
                        <div className="text-xs text-slate-500">by {trans.createdBy}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead className="bg-slate-100 border-y">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Account</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Description</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Debit (Kz)</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Credit (Kz)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trans.entries.map((entry, idx) => (
                          <tr key={idx} className="border-b hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="font-mono text-sm font-semibold">{entry.accountCode}</div>
                              <div className="text-xs text-slate-600">{entry.accountName}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">{entry.description}</td>
                            <td className="px-4 py-3 text-right font-semibold text-sm">
                              {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-sm">
                              {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan={2} className="px-4 py-3 text-right">TOTAL:</td>
                          <td className="px-4 py-3 text-right text-blue-600">{formatCurrency(trans.totalDebit)}</td>
                          <td className="px-4 py-3 text-right text-blue-600">{formatCurrency(trans.totalCredit)}</td>
                        </tr>
                      </tbody>
                    </table>
                    {trans.totalDebit === trans.totalCredit ? (
                      <div className="px-4 py-2 bg-green-50 border-t border-green-200 flex items-center gap-2 text-green-700 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Transaction balanced
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center gap-2 text-red-700 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        Transaction not balanced!
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trial Balance Tab */}
        <TabsContent value="trial">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-purple-600" />
                    Trial Balance / Balancete de Verificação
                  </CardTitle>
                  <CardDescription>Verify the equality of debits and credits</CardDescription>
                </div>
                <Button onClick={exportTrialBalance} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-purple-50 border-b-2">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Code</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Account Name</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-purple-900">Debit (Kz)</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-purple-900">Credit (Kz)</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-purple-900">Balance (Kz)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trialBalance.map((entry, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-sm font-semibold">{entry.accountCode}</td>
                        <td className="px-4 py-3 text-sm">{entry.accountName}</td>
                        <td className="px-4 py-3 text-right font-semibold text-sm">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-sm">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold text-sm ${
                          entry.balance > 0 ? 'text-blue-600' : entry.balance < 0 ? 'text-red-600' : ''
                        }`}>
                          {formatCurrency(entry.balance)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-purple-100 font-bold border-t-2">
                      <td colSpan={2} className="px-4 py-4 text-right">TOTAL:</td>
                      <td className="px-4 py-4 text-right text-purple-900">
                        {formatCurrency(trialBalance.reduce((sum, e) => sum + e.debit, 0))}
                      </td>
                      <td className="px-4 py-4 text-right text-purple-900">
                        {formatCurrency(trialBalance.reduce((sum, e) => sum + e.credit, 0))}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {formatCurrency(trialBalance.reduce((sum, e) => sum + e.balance, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {Math.abs(trialBalance.reduce((sum, e) => sum + e.debit, 0) - trialBalance.reduce((sum, e) => sum + e.credit, 0)) < 0.01 ? (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Trial Balance is in balance</span>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Trial Balance is NOT balanced!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Ledger Tab */}
        <TabsContent value="ledger">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-600" />
                General Ledger / Razão Geral
              </CardTitle>
              <CardDescription>View detailed transaction history for each account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Account to View Ledger
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedAccountForLedger}
                    onChange={(e) => setSelectedAccountForLedger(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  >
                    <option value="">-- Select Account --</option>
                    {CHART_OF_ACCOUNTS.map(acc => (
                      <option key={acc.code} value={acc.code}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() => selectedAccountForLedger && exportGeneralLedger(selectedAccountForLedger)}
                    disabled={!selectedAccountForLedger}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {selectedAccountForLedger && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-blue-900">
                      {getAccountByCode(selectedAccountForLedger)?.name} ({selectedAccountForLedger})
                    </h3>
                  </div>
                  <table className="w-full">
                    <thead className="bg-slate-100 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Reference</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Debit (Kz)</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Credit (Kz)</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Balance (Kz)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateGeneralLedger(selectedAccountForLedger, transactions).map((entry, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm">{new Date(entry.date).toLocaleDateString('pt-AO')}</td>
                          <td className="px-4 py-3 text-sm font-mono">{entry.reference}</td>
                          <td className="px-4 py-3 text-sm">{entry.description}</td>
                          <td className="px-4 py-3 text-right font-semibold text-sm">
                            {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-sm">
                            {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold text-sm ${
                            entry.balance > 0 ? 'text-blue-600' : entry.balance < 0 ? 'text-red-600' : ''
                          }`}>
                            {formatCurrency(entry.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Period Closing Tab */}
        <TabsContent value="closing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-600" />
                Period-End Closing / Fecho do Período
              </CardTitle>
              <CardDescription>Close revenue and expense accounts at period end</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-2">Period Closing Process</h3>
                    <p className="text-sm text-orange-700 mb-3">
                      This will automatically:
                    </p>
                    <ul className="text-sm text-orange-700 space-y-1 ml-4 list-disc">
                      <li>Close all revenue accounts to zero</li>
                      <li>Close all expense accounts to zero</li>
                      <li>Transfer net income to equity account (Class 13)</li>
                      <li>Create a closing journal entry</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">
                      {formatCurrency(
                        trialBalance
                          .filter(e => getAccountByCode(e.accountCode)?.type === 'revenue')
                          .reduce((sum, e) => sum + Math.abs(e.balance), 0)
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-900">
                      {formatCurrency(
                        trialBalance
                          .filter(e => getAccountByCode(e.accountCode)?.type === 'expense')
                          .reduce((sum, e) => sum + Math.abs(e.balance), 0)
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Net Income</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(
                        trialBalance
                          .filter(e => getAccountByCode(e.accountCode)?.type === 'revenue')
                          .reduce((sum, e) => sum + Math.abs(e.balance), 0) -
                        trialBalance
                          .filter(e => getAccountByCode(e.accountCode)?.type === 'expense')
                          .reduce((sum, e) => sum + Math.abs(e.balance), 0)
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button onClick={() => setShowClosingDialog(true)} className="w-full" size="lg">
                <Lock className="h-5 w-5 mr-2" />
                Execute Period Closing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exchange Rates Tab */}
        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Repeat className="h-5 w-5 text-green-600" />
                Exchange Rates / Taxas de Câmbio
              </CardTitle>
              <CardDescription>Multi-currency support and exchange rate management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-green-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-900">From</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-900">To</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-green-900">Rate</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-900">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-900">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXCHANGE_RATES.map((rate, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-sm">{rate.fromCurrency}</td>
                        <td className="px-4 py-3 font-semibold text-sm">{rate.toCurrency}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm">{rate.rate.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                        <td className="px-4 py-3 text-sm">{new Date(rate.date).toLocaleDateString('pt-AO')}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{rate.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Currency Converter */}
              <Card className="mt-6 bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-base">Currency Converter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-600 mb-2">
                    Example: 1,000 AOA = {convertCurrency(1000, 'AOA', 'USD').toFixed(2)} USD
                  </div>
                  <div className="text-sm text-slate-600">
                    Example: 100 USD = {convertCurrency(100, 'USD', 'AOA').toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Balance Sheet */}
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet / Balanço</CardTitle>
                <CardDescription>Statement of financial position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">ASSETS / ACTIVO</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Current Assets</span>
                      <span className="font-semibold">{formatCurrency(totals.assets)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Non-Current Assets</span>
                      <span className="font-semibold">{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Total Assets</span>
                      <span className="text-blue-600">{formatCurrency(totals.assets)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-slate-900 mb-2">LIABILITIES / PASSIVO</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Current Liabilities</span>
                      <span className="font-semibold">{formatCurrency(totals.liabilities)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Non-Current Liabilities</span>
                      <span className="font-semibold">{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Total Liabilities</span>
                      <span className="text-red-600">{formatCurrency(totals.liabilities)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-slate-900 mb-2">EQUITY / CAPITAL PRÓPRIO</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Equity</span>
                      <span className="font-semibold">{formatCurrency(totals.equity)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Total Liabilities + Equity</span>
                      <span className="text-purple-600">{formatCurrency(totals.liabilities + totals.equity)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Income Statement */}
            <Card>
              <CardHeader>
                <CardTitle>Income Statement / Demonstração de Resultados</CardTitle>
                <CardDescription>Profit and loss statement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">REVENUE / RENDIMENTOS</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Operating Revenue</span>
                      <span className="font-semibold">{formatCurrency(totals.revenue)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Total Revenue</span>
                      <span className="text-green-600">{formatCurrency(totals.revenue)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-slate-900 mb-2">EXPENSES / GASTOS</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Operating Expenses</span>
                      <span className="font-semibold">{formatCurrency(totals.expenses)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Total Expenses</span>
                      <span className="text-orange-600">{formatCurrency(totals.expenses)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 bg-slate-50 -mx-6 -mb-6 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">NET INCOME / RESULTADO LÍQUIDO</span>
                    <span className={`font-bold text-2xl ${
                      totals.revenue - totals.expenses >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(totals.revenue - totals.expenses)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accounting Notes */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Angolan GAAP Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Tax Rates:</strong> VAT (IVA) = 14%, Industrial Tax (IRT) = 30% for companies, Social Security = 11% employee + 8% employer
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Currency:</strong> Angolan Kwanza (AOA) is the primary currency. USD accounts maintained separately.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Accounting Periods:</strong> Financial year matches calendar year (Jan 1 - Dec 31)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Compliance:</strong> All transactions follow double-entry bookkeeping (Débito/Crédito) principles
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Journal Entry Dialog */}
      <Dialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Journal Entry / Novo Lançamento</DialogTitle>
            <DialogDescription>Create a new accounting transaction with double-entry bookkeeping</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header Info */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newEntryData.date}
                  onChange={(e) => setNewEntryData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reference</label>
                <input
                  type="text"
                  value={newEntryData.reference}
                  onChange={(e) => setNewEntryData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="e.g., JE-001"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <input
                  type="text"
                  value={newEntryData.description}
                  onChange={(e) => setNewEntryData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Transaction description"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                />
              </div>
            </div>

            {/* Journal Lines */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Journal Lines</label>
                <Button onClick={addEntryLine} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Account</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Description</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Debit (Kz)</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Credit (Kz)</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newEntryData.entries.map((entry, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-3 py-2">
                          <select
                            value={entry.accountCode}
                            onChange={(e) => updateEntryLine(idx, 'accountCode', e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                          >
                            <option value="">Select...</option>
                            {CHART_OF_ACCOUNTS.filter(acc => !acc.parentCode).map(acc => (
                              <option key={acc.code} value={acc.code}>
                                {acc.code} - {acc.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={entry.description || ''}
                            onChange={(e) => updateEntryLine(idx, 'description', e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={entry.debit || ''}
                            onChange={(e) => updateEntryLine(idx, 'debit', parseFloat(e.target.value) || 0)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-right"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={entry.credit || ''}
                            onChange={(e) => updateEntryLine(idx, 'credit', parseFloat(e.target.value) || 0)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-right"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            onClick={() => removeEntryLine(idx)}
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
                  <tfoot className="bg-slate-100 font-bold">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-right text-sm">TOTAL:</td>
                      <td className="px-3 py-2 text-right text-sm">
                        {formatCurrency(newEntryData.entries.reduce((sum, e) => sum + e.debit, 0))}
                      </td>
                      <td className="px-3 py-2 text-right text-sm">
                        {formatCurrency(newEntryData.entries.reduce((sum, e) => sum + e.credit, 0))}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {newEntryData.entries.length > 0 && (
                <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
                  validateTransaction(newEntryData.entries).isValid
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {validateTransaction(newEntryData.entries).isValid ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Transaction is balanced</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-semibold">
                        Not balanced! Difference: {formatCurrency(validateTransaction(newEntryData.entries).difference)}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewEntryDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={saveNewTransaction}
                disabled={!validateTransaction(newEntryData.entries).isValid || newEntryData.entries.length === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Post Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Period Closing Confirmation Dialog */}
      <Dialog open={showClosingDialog} onOpenChange={setShowClosingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-600" />
              Confirm Period Closing
            </DialogTitle>
            <DialogDescription>
              This will create closing entries for all revenue and expense accounts. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                Are you sure you want to close the current accounting period? This will:
              </p>
              <ul className="text-sm text-orange-700 mt-2 space-y-1 ml-4 list-disc">
                <li>Zero out all revenue and expense accounts</li>
                <li>Transfer the net income to equity</li>
                <li>Create a permanent closing journal entry</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowClosingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={executeClosing} className="bg-orange-600 hover:bg-orange-700">
                <Lock className="h-4 w-4 mr-2" />
                Confirm Closing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
