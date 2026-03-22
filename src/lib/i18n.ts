/**
 * Multilingual support for AutoGP Workshop Management System
 * Languages: English (en), Portuguese (pt), Spanish (es), Mandarin (zh), French (fr)
 */

export type Language = 'en' | 'pt' | 'es' | 'zh' | 'fr';

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  zh: '中文',
  fr: 'Français',
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: '🇬🇧',
  pt: '🇦🇴',
  es: '🇪🇸',
  zh: '🇨🇳',
  fr: '🇫🇷',
};

export interface T {
  // ── App Shell ──────────────────────────────────────────────────────────────
  appTitle: string;
  appSubtitle: string;

  // ── Login / Landing Page ───────────────────────────────────────────────────
  loginTagline: string;
  loginTaglineDesc: string;
  loginWelcome: string;
  loginSubtitle: string;
  loginEmail: string;
  loginPassword: string;
  loginSignIn: string;
  loginSigningIn: string;
  loginError: string;
  loginDemoAccounts: string;
  loginDemoHint: string;
  loginFeature1: string;
  loginFeature2: string;
  loginFeature3: string;
  loginFeature4: string;
  loginBadge: string;

  // ── Navigation ─────────────────────────────────────────────────────────────
  navDashboard: string;        navDashboardDesc: string;
  navWorkflow: string;         navWorkflowDesc: string;
  navAppointments: string;     navAppointmentsDesc: string;
  navClocking: string;         navClockingDesc: string;
  navInspection: string;       navInspectionDesc: string;
  navCustomers: string;        navCustomersDesc: string;
  navVehicles: string;         navVehiclesDesc: string;
  navInService: string;        navInServiceDesc: string;
  navQuotations: string;       navQuotationsDesc: string;
  navParts: string;            navPartsDesc: string;
  navKpis: string;             navKpisDesc: string;
  navReporting: string;        navReportingDesc: string;
  navAccounting: string;       navAccountingDesc: string;
  navSettings: string;         navSettingsDesc: string;
  navUsers: string;            navUsersDesc: string;
  navBranches: string;         navBranchesDesc: string;
  navMaintenance: string;      navMaintenanceDesc: string;

  // ── Maintenance Packs ───────────────────────────────────────────────────────
  mntTitle: string;            mntSubtitle: string;
  mntNewPack: string;          mntEditPack: string;
  mntPackNumber: string;       mntLabourTasks: string;
  mntAddTask: string;          mntHours: string;
  mntRatePerHour: string;      mntTotalHours: string;
  mntTotalAmount: string;      mntActivePacks: string;
  mntAllCategories: string;
  mntFromPack: string;         mntFromWarehouse: string;
  mntAddFullPack: string;      mntAddSelected: string;
  mntSelectPack: string;       mntSelectParts: string;
  mntAvailableStock: string;
  mntNoPacksFound: string;     mntNoPartsFound: string;
  mntSearchPacks: string;      mntSearchParts: string;
  mntInactive: string;         mntTotalLabourHours: string;
  mntAcrossAllPacks: string;   mntTotalLabourValue: string;
  mntAllActivePacks: string;   mntNoPacksList: string;
  mntCreateFirst: string;      mntTaskDescription: string;
  mntDeleteConfirm: string;    mntPackName: string;
  mntTotals: string;           mntPackActiveDesc: string;
  mntSaveChanges: string;

  // ── Walk-Around Inspection ─────────────────────────────────────────────────
  walTitle: string;            walSubtitle: string;
  walNewInspection: string;    walTotalInspections: string;
  walDamageItems: string;      walToday: string;
  walNoInspections: string;    walNoInspectionsDesc: string;
  walNoDamage: string;         walNewInspectionTitle: string;
  walNewInspectionDesc: string; walChange: string;
  walSearchCustomer: string;   walNoCustomersFound: string;
  walCustomerName: string;     walPlate: string;
  walMileage: string;          walFuelLevel: string;
  walAddingDamageTo: string;   walDamageType: string;
  walSeverity: string;         walAddDamage: string;
  walDamageRecords: string;    walReceivingTechnician: string;
  walGeneralNotes: string;     walGeneralNotesPlaceholder: string;
  walSaveDraft: string;        walComplete: string;
  walClickZone: string;        walFront: string;
  walRear: string;             walFuel: string;
  walNoDamageRecorded: string; walConditionMap: string;

  // ── Clocking System ────────────────────────────────────────────────────────
  clkTitle: string;            clkSubtitle: string;
  clkCurrentlyClockedIn: string; clkTotalHours: string;
  clkBillableHours: string;    clkBillableEfficiency: string;
  clkStatusToday: string;      clkIn: string;
  clkOut: string;              clkSince: string;
  clkNotClockedIn: string;     clkTodayTotal: string;
  clkClockIn: string;          clkClockOut: string;
  clkTimesheet: string;        clkNoEntries: string;
  clkDuration: string;         clkInProgress: string;
  clkWeeklySummary: string;    clkClockedInAt: string;
  clkElapsed: string;          clkClockOutAt: string;
  clkWorkType: string;         clkTaskDesc: string;
  clkClockInAt: string;        clkJobWork: string;
  clkGeneral: string;          clkTraining: string;
  clkBreak: string;

  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashTitle: string;
  dashSubtitle: string;
  dashTotalCustomers: string;
  dashActiveCustomers: string;
  dashTotalRevenue: string;
  dashTotalOrders: string;
  dashRefresh: string;
  dashExportDocs: string;
  dashUserGuide: string;
  dashFromLastMonth: string;

  // ── Workflow ────────────────────────────────────────────────────────────────
  wfTitle: string;
  wfSubtitle: string;
  wfVehiclesActiveToday: string;
  wfInputs: string;
  wfOutputs: string;
  wfStepByStep: string;
  wfDocument: string;
  wfAlsoTouches: string;
  wfVehiclesAtStage: string;
  wfNoVehicles: string;
  wfLivePipeline: string;
  wfSystemModules: string;
  wfReferenceTitle: string;
  wfColStep: string;
  wfColStage: string;
  wfColModule: string;
  wfColStatus: string;
  wfPrevious: string;
  wfNext: string;
  wfOf: string;
  wfOpen: string;

  // ── Common actions ─────────────────────────────────────────────────────────
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  create: string;
  update: string;
  close: string;
  open: string;
  view: string;
  confirm: string;
  search: string;
  filter: string;
  export: string;
  exportCSV: string;
  exportExcel: string;
  exportPDF: string;
  print: string;
  refresh: string;
  back: string;
  next: string;
  previous: string;
  submit: string;
  generate: string;
  send: string;
  approve: string;
  reject: string;
  record: string;
  selectAll: string;
  clearAll: string;
  noData: string;
  loading: string;
  optional: string;
  required: string;
  all: string;
  yes: string;
  no: string;
  warning: string;

  // ── Common labels ──────────────────────────────────────────────────────────
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  company: string;
  notes: string;
  description: string;
  reference: string;
  date: string;
  dueDate: string;
  status: string;
  actions: string;
  total: string;
  subtotal: string;
  vat: string;
  balance: string;
  amount: string;
  quantity: string;
  unitPrice: string;
  customer: string;
  vehicle: string;
  technician: string;
  invoice: string;
  quotation: string;
  job: string;
  bill: string;
  payment: string;
  category: string;
  supplier: string;
  from: string;
  to: string;
  type: string;
  period: string;
  tags: string;
  vatNumber: string;
  idNumber: string;

  // ── Status values ──────────────────────────────────────────────────────────
  statusDraft: string;
  statusActive: string;
  statusInactive: string;
  statusPending: string;
  statusPaid: string;
  statusOverdue: string;
  statusPartial: string;
  statusSent: string;
  statusApproved: string;
  statusRejected: string;
  statusCompleted: string;
  statusCancelled: string;
  statusInProgress: string;
  statusExpired: string;
  statusInvoiced: string;
  statusLowStock: string;
  statusOutOfStock: string;
  statusInStock: string;

  // ── CRM ────────────────────────────────────────────────────────────────────
  crmTitle: string;
  crmSubtitle: string;
  crmAddCustomer: string;
  crmEditCustomer: string;
  crmCustomerDetails: string;
  crmCustomerSince: string;
  crmLastContact: string;
  crmTotalSpent: string;
  crmVehicles: string;
  crmInteractions: string;
  crmAddInteraction: string;
  crmSearchPlaceholder: string;
  crmNoCustomers: string;
  crmDeleteConfirm: string;

  // ── Vehicles ───────────────────────────────────────────────────────────────
  vehTitle: string;
  vehSubtitle: string;
  vehAddVehicle: string;
  vehEditVehicle: string;
  vehPlate: string;
  vehVin: string;
  vehMake: string;
  vehModel: string;
  vehYear: string;
  vehColor: string;
  vehEngine: string;
  vehTransmission: string;
  vehMileage: string;
  vehOwner: string;
  vehServiceHistory: string;
  vehDissociate: string;
  vehDissociateTitle: string;
  vehDissociateDesc: string;
  vehDissociatePlaceholder: string;
  vehFirstRegistered: string;
  vehNoVehicles: string;

  // ── Vehicles in Service ────────────────────────────────────────────────────
  visTitle: string;
  visSubtitle: string;
  visAllVehicles: string;
  visOnBay: string;
  visDiagnosis: string;
  visQualityControl: string;
  visWashing: string;
  visWaitingCollection: string;
  visAssignedTech: string;
  visEstimatedCompletion: string;
  visPriority: string;
  visPriorityNormal: string;
  visPriorityUrgent: string;
  visPriorityVip: string;
  visStage: string;
  visNoVehicles: string;

  // ── Appointments ───────────────────────────────────────────────────────────
  aptTitle: string;
  aptSubtitle: string;
  aptNew: string;
  aptDate: string;
  aptTime: string;
  aptBay: string;
  aptServiceType: string;
  aptDuration: string;
  aptJobCard: string;
  aptOpenJobCard: string;
  aptCloseJob: string;
  aptGenerateInvoice: string;
  aptLabour: string;
  aptParts: string;
  aptAddLabour: string;
  aptAddPart: string;
  aptQuotation: string;
  aptSendQuotation: string;
  aptConfirmed: string;
  aptPending: string;
  aptInProgress: string;
  aptCompleted: string;
  aptCancelled: string;
  aptNoAppointments: string;
  aptSelectCustomer: string;
  aptSelectVehicle: string;
  aptCreateCustomer: string;
  aptCreateVehicle: string;

  // ── Quotations / Jobs ──────────────────────────────────────────────────────
  quoTitle: string;
  quoSubtitle: string;
  quoNew: string;
  quoValidUntil: string;
  quoJobNumber: string;
  quoAddItem: string;
  quoLabour: string;
  quoParts: string;
  quoSend: string;
  quoApprove: string;
  quoConvertToJob: string;
  quoConvertToInvoice: string;
  quoSaveDraft: string;
  quoNoItems: string;
  quoNoQuotations: string;
  quoVehicleDetails: string;

  // ── Parts Inventory ────────────────────────────────────────────────────────
  parTitle: string;
  parSubtitle: string;
  parAddPart: string;
  parEditPart: string;
  parPartNumber: string;
  parStockLevel: string;
  parReorderPoint: string;
  parLocation: string;
  parCostPrice: string;
  parSellingPrice: string;
  parLowStock: string;
  parOutOfStock: string;
  parInStock: string;
  parNoParts: string;
  parSearchPlaceholder: string;

  // ── Workshop KPIs ──────────────────────────────────────────────────────────
  kpiTitle: string;
  kpiSubtitle: string;
  kpiEfficiency: string;
  kpiProductivity: string;
  kpiEffectiveness: string;
  kpiRevenue: string;
  kpiJobsCompleted: string;
  kpiAvgJobValue: string;
  kpiUtilization: string;
  kpiTarget: string;
  kpiActual: string;
  kpiVariance: string;
  kpiTechnician: string;
  kpiHoursWorked: string;
  kpiBillableHours: string;
  kpiThisMonth: string;
  kpiLastMonth: string;
  kpiThisYear: string;

  // ── Accounting (tabs) ──────────────────────────────────────────────────────
  accTitle: string;
  accSubtitle: string;
  accAccounts: string;
  accJournal: string;
  accTrialBalance: string;
  accGeneralLedger: string;
  accPeriodClose: string;
  accExchangeRates: string;
  accInvoices: string;
  accBills: string;
  accReports: string;
  accStatements: string;

  // ── Accounting — Invoice Register ──────────────────────────────────────────
  accInvoiceTitle: string;
  accInvoiceSubtitle: string;
  accOutstanding: string;
  accOverdue: string;
  accCollected: string;
  accRecordPayment: string;
  accPaymentMethod: string;
  accBankTransfer: string;
  accCash: string;
  accCard: string;
  accMobileMoney: string;
  accCheque: string;
  accInvoiceNumber: string;
  accAmountPaid: string;
  accOpenInvoices: string;
  accPaidInvoices: string;

  // ── Accounting — Bills ────────────────────────────────────────────────────
  accBillsTitle: string;
  accBillsSubtitle: string;
  accNewBill: string;
  accVendor: string;
  accBillNumber: string;
  accTotalPayable: string;
  accOpenBills: string;
  accPaidBills: string;

  // ── Accounting — Financial Reports ────────────────────────────────────────
  accProfitLoss: string;
  accBalanceSheet: string;
  accArAging: string;
  accRevenue: string;
  accCostOfSales: string;
  accGrossProfit: string;
  accOperatingExpenses: string;
  accOperatingProfit: string;
  accNetIncome: string;
  accAssets: string;
  accCurrentAssets: string;
  accNonCurrentAssets: string;
  accLiabilities: string;
  accCurrentLiabilities: string;
  accEquity: string;
  accTotalAssets: string;
  accTotalLiabilities: string;
  accTotalEquity: string;
  accAgingCurrent: string;
  accAging30: string;
  accAging60: string;
  accAging90: string;
  accDaysOutstanding: string;

  // ── Accounting — Customer Statements ─────────────────────────────────────
  accStatementTitle: string;
  accSelectCustomer: string;
  accTotalBilled: string;
  accTotalPaid: string;
  accExportStatement: string;
  accStatementDate: string;
}

// ── English ────────────────────────────────────────────────────────────────
const en: T = {
  appTitle: 'AutoGP Workshop',
  appSubtitle: 'Workshop Management System',
  loginTagline: 'Drive your workshop forward',
  loginTaglineDesc: 'The complete management platform for modern automotive workshops — from first inspection to final invoice.',
  loginWelcome: 'Welcome back',
  loginSubtitle: 'Sign in to access your workshop dashboard',
  loginEmail: 'Email address',
  loginPassword: 'Password',
  loginSignIn: 'Sign in',
  loginSigningIn: 'Signing in…',
  loginError: 'Invalid email or password. Try a demo account below.',
  loginDemoAccounts: 'Demo accounts',
  loginDemoHint: 'Click a card to prefill credentials, then sign in',
  loginFeature1: 'Full workshop job management',
  loginFeature2: 'Real-time KPIs & analytics',
  loginFeature3: 'Role-based access control',
  loginFeature4: 'Fast, multilingual interface',
  loginBadge: 'Angolan GAAP compliant · ISO 9001 ready · RGPD data privacy',
  navDashboard: 'Dashboard',               navDashboardDesc: 'Overview & statistics',
  navWorkflow: 'Workflow',                 navWorkflowDesc: 'Reception to invoicing pipeline',
  navAppointments: 'Appointments',         navAppointmentsDesc: 'Booking & scheduling',
  navClocking: 'Time Clocking',            navClockingDesc: 'Technician hours',
  navInspection: 'Walk-Around Inspection', navInspectionDesc: 'Vehicle check-in & damage recording',
  navCustomers: 'Customers',               navCustomersDesc: 'Customer management',
  navVehicles: 'Vehicles',                 navVehiclesDesc: 'Vehicle database',
  navInService: 'In Service',              navInServiceDesc: 'Vehicles in workshop',
  navQuotations: 'Quotations & Jobs',      navQuotationsDesc: 'Quotes & jobs',
  navParts: 'Parts & Inventory',           navPartsDesc: 'Stock management',
  navKpis: 'Workshop KPIs',               navKpisDesc: 'Performance metrics',
  navReporting: 'Reports',                 navReportingDesc: 'Analytics & reports',
  navAccounting: 'Accounting',             navAccountingDesc: 'Financial system',
  navSettings: 'Settings',                 navSettingsDesc: 'System configuration',
  navUsers: 'Users & Permissions',         navUsersDesc: 'Manage users and roles',
  navBranches: 'Branches & Garages',       navBranchesDesc: 'Manage workshop locations',
  navMaintenance: 'Maintenance Packs',     navMaintenanceDesc: 'Labour task packages & rates',
  mntTitle: 'Maintenance Packs',           mntSubtitle: 'Define standard service labour tasks and hourly rates',
  mntNewPack: 'New Pack',                  mntEditPack: 'Edit Pack',
  mntPackNumber: 'Pack Number',            mntLabourTasks: 'Labour Tasks',
  mntAddTask: 'Add Task',                  mntHours: 'Hours',
  mntRatePerHour: 'Rate / hr (AOA)',       mntTotalHours: 'Total Hours',
  mntTotalAmount: 'Total Amount',          mntActivePacks: 'Active Packs',
  mntAllCategories: 'All Categories',
  mntFromPack: 'From Pack',                mntFromWarehouse: 'From Warehouse',
  mntAddFullPack: 'Add Full Pack',         mntAddSelected: 'Add Selected',
  mntSelectPack: 'Select Labour from Maintenance Packs',
  mntSelectParts: 'Select Parts from Warehouse',
  mntAvailableStock: 'Available Stock',
  mntNoPacksFound: 'No maintenance packs available',
  mntNoPartsFound: 'No parts available in warehouse',
  mntSearchPacks: 'Search packs...',       mntSearchParts: 'Search parts...',
  mntInactive: 'inactive',                 mntTotalLabourHours: 'Total Labour Hours',
  mntAcrossAllPacks: 'across all active packs', mntTotalLabourValue: 'Total Labour Value',
  mntAllActivePacks: 'all active packs',   mntNoPacksList: 'No maintenance packs found',
  mntCreateFirst: 'Create your first pack to get started',
  mntTaskDescription: 'Task Description',  mntDeleteConfirm: 'Delete this maintenance pack?',
  mntPackName: 'Pack Name',               mntTotals: 'Totals',
  mntPackActiveDesc: 'Pack is active (available when creating quotations/jobs)',
  mntSaveChanges: 'Save Changes',
  walTitle: 'Vehicle Walk-Around Inspection',
  walSubtitle: 'Record pre-existing damage when receiving a vehicle',
  walNewInspection: 'New Inspection',      walTotalInspections: 'Total Inspections',
  walDamageItems: 'Damage Items',          walToday: 'Today',
  walNoInspections: 'No inspections yet',  walNoInspectionsDesc: 'Create one when receiving a vehicle',
  walNoDamage: 'No damage',               walNewInspectionTitle: 'New Vehicle Walk-Around Inspection',
  walNewInspectionDesc: 'Mark all pre-existing damage before work begins',
  walChange: 'Change',                     walSearchCustomer: 'Search customer...',
  walNoCustomersFound: 'No customers found', walCustomerName: 'Customer name',
  walPlate: 'Plate',                       walMileage: 'Mileage (km)',
  walFuelLevel: 'Fuel Level',             walAddingDamageTo: 'Adding damage to',
  walDamageType: 'Damage Type',           walSeverity: 'Severity',
  walAddDamage: 'Add Damage',             walDamageRecords: 'Damage Records',
  walReceivingTechnician: 'Receiving Technician',
  walGeneralNotes: 'General Notes',
  walGeneralNotesPlaceholder: 'Customer complaints, special instructions...',
  walSaveDraft: 'Save Draft',             walComplete: 'Complete',
  walClickZone: 'Click a zone to mark damage',
  walFront: 'FRONT',                      walRear: 'REAR',
  walFuel: 'Fuel',                        walNoDamageRecorded: 'No pre-existing damage recorded',
  walConditionMap: 'Vehicle Condition Map',
  clkTitle: 'Technician Clocking',
  clkSubtitle: 'Track billable and non-billable hours per technician',
  clkCurrentlyClockedIn: 'Currently Clocked In', clkTotalHours: 'Total Hours',
  clkBillableHours: 'Billable Hours',     clkBillableEfficiency: 'Billable Efficiency',
  clkStatusToday: 'Technician Status — Today',
  clkIn: 'IN',                            clkOut: 'OUT',
  clkSince: 'Since',                      clkNotClockedIn: 'Not clocked in',
  clkTodayTotal: 'Today',                 clkClockIn: 'Clock In',
  clkClockOut: 'Clock Out',              clkTimesheet: 'Timesheet',
  clkNoEntries: 'No entries for',         clkDuration: 'Duration',
  clkInProgress: 'In Progress',           clkWeeklySummary: 'Weekly Summary (last 7 days)',
  clkClockedInAt: 'Clocked in at',       clkElapsed: 'Elapsed',
  clkClockOutAt: 'Clock Out at',         clkWorkType: 'Work Type',
  clkTaskDesc: 'Task description...',     clkClockInAt: 'Clock In at',
  clkJobWork: 'Job Work',               clkGeneral: 'General',
  clkTraining: 'Training',               clkBreak: 'Break',
  dashTitle: 'Dashboard Overview',
  dashSubtitle: 'Welcome to the Automotive Workshop Management System',
  dashTotalCustomers: 'Total Customers',
  dashActiveCustomers: 'Active Customers',
  dashTotalRevenue: 'Total Revenue',
  dashTotalOrders: 'Total Orders',
  dashRefresh: 'Refresh',
  dashExportDocs: 'Export Docs',
  dashUserGuide: 'User Guide PDF',
  dashFromLastMonth: 'from last month',
  wfTitle: 'Service Workflow',
  wfSubtitle: 'End-to-end process from vehicle reception through to payment',
  wfVehiclesActiveToday: 'vehicles active today',
  wfInputs: 'Inputs',
  wfOutputs: 'Outputs',
  wfStepByStep: 'Step-by-step actions',
  wfDocument: 'Document',
  wfAlsoTouches: 'Also touches',
  wfVehiclesAtStage: 'Vehicles at this stage',
  wfNoVehicles: 'No vehicles at this stage right now',
  wfLivePipeline: 'Live pipeline',
  wfSystemModules: 'System modules',
  wfReferenceTitle: 'Complete workflow reference',
  wfColStep: 'Step',
  wfColStage: 'Stage',
  wfColModule: 'System Module',
  wfColStatus: 'Status / Stage',
  wfPrevious: 'Previous',
  wfNext: 'Next',
  wfOf: 'of',
  wfOpen: 'Open',
  save: 'Save',                cancel: 'Cancel',           delete: 'Delete',
  edit: 'Edit',                add: 'Add',                 create: 'Create',
  update: 'Update',            close: 'Close',             open: 'Open',
  view: 'View',                confirm: 'Confirm',         search: 'Search',
  filter: 'Filter',            export: 'Export',           exportCSV: 'Export CSV',
  exportExcel: 'Export Excel', exportPDF: 'Export PDF',    print: 'Print',
  refresh: 'Refresh',          back: 'Back',               next: 'Next',
  previous: 'Previous',        submit: 'Submit',           generate: 'Generate',
  send: 'Send',                approve: 'Approve',         reject: 'Reject',
  record: 'Record',            selectAll: 'Select All',    clearAll: 'Clear All',
  noData: 'No data found',     loading: 'Loading...',      optional: 'optional',
  required: 'required',        all: 'All',                 yes: 'Yes',
  no: 'No',                    warning: 'Warning',
  name: 'Name',                firstName: 'First Name',    lastName: 'Last Name',
  email: 'Email',              phone: 'Phone',             whatsapp: 'WhatsApp',
  address: 'Address',          city: 'City',               company: 'Company',
  notes: 'Notes',              description: 'Description', reference: 'Reference',
  date: 'Date',                dueDate: 'Due Date',        status: 'Status',
  actions: 'Actions',          total: 'Total',             subtotal: 'Subtotal',
  vat: 'VAT (14%)',            balance: 'Balance',         amount: 'Amount',
  quantity: 'Qty',             unitPrice: 'Unit Price',    customer: 'Customer',
  vehicle: 'Vehicle',          technician: 'Technician',   invoice: 'Invoice',
  quotation: 'Quotation',      job: 'Job',                 bill: 'Bill',
  payment: 'Payment',          category: 'Category',       supplier: 'Supplier',
  from: 'From',                to: 'To',                   type: 'Type',
  period: 'Period',            tags: 'Tags',               vatNumber: 'VAT Number',
  idNumber: 'ID Number',
  statusDraft: 'Draft',        statusActive: 'Active',     statusInactive: 'Inactive',
  statusPending: 'Pending',    statusPaid: 'Paid',         statusOverdue: 'Overdue',
  statusPartial: 'Partial',    statusSent: 'Sent',         statusApproved: 'Approved',
  statusRejected: 'Rejected',  statusCompleted: 'Completed', statusCancelled: 'Cancelled',
  statusInProgress: 'In Progress', statusExpired: 'Expired', statusInvoiced: 'Invoiced',
  statusLowStock: 'Low Stock', statusOutOfStock: 'Out of Stock', statusInStock: 'In Stock',
  crmTitle: 'Customer Relationship Management',
  crmSubtitle: 'Manage your customer base and interactions',
  crmAddCustomer: 'Add Customer',          crmEditCustomer: 'Edit Customer',
  crmCustomerDetails: 'Customer Details',  crmCustomerSince: 'Customer Since',
  crmLastContact: 'Last Contact',          crmTotalSpent: 'Total Spent',
  crmVehicles: 'Vehicles',                 crmInteractions: 'Interactions',
  crmAddInteraction: 'Add Interaction',    crmSearchPlaceholder: 'Search customers...',
  crmNoCustomers: 'No customers found',    crmDeleteConfirm: 'Are you sure you want to delete this customer?',
  vehTitle: 'Vehicle Database',
  vehSubtitle: 'Track and manage all registered vehicles',
  vehAddVehicle: 'Add Vehicle',            vehEditVehicle: 'Edit Vehicle',
  vehPlate: 'License Plate',               vehVin: 'VIN',
  vehMake: 'Make',                         vehModel: 'Model',
  vehYear: 'Year',                         vehColor: 'Color',
  vehEngine: 'Engine Type',                vehTransmission: 'Transmission',
  vehMileage: 'Mileage',                   vehOwner: 'Owner',
  vehServiceHistory: 'Service History',    vehDissociate: 'Dissociate Owner',
  vehDissociateTitle: 'Confirm Vehicle Dissociation',
  vehDissociateDesc: 'To prevent mistakes, type the license plate to confirm:',
  vehDissociatePlaceholder: 'Type license plate to confirm',
  vehFirstRegistered: 'First Registered',  vehNoVehicles: 'No vehicles found',
  visTitle: 'Vehicles in Service',
  visSubtitle: 'Track vehicles currently in the workshop',
  visAllVehicles: 'All Vehicles',          visOnBay: 'On Bay',
  visDiagnosis: 'Diagnosis',               visQualityControl: 'Quality Control',
  visWashing: 'Washing',                   visWaitingCollection: 'Waiting for Collection',
  visAssignedTech: 'Assigned Technician',  visEstimatedCompletion: 'Est. Completion',
  visPriority: 'Priority',                 visPriorityNormal: 'Normal',
  visPriorityUrgent: 'Urgent',             visPriorityVip: 'VIP',
  visStage: 'Stage',                       visNoVehicles: 'No vehicles in service',
  aptTitle: 'Appointment Booking',
  aptSubtitle: 'Schedule and manage workshop appointments',
  aptNew: 'New Appointment',               aptDate: 'Date',
  aptTime: 'Time',                         aptBay: 'Bay',
  aptServiceType: 'Service Type',          aptDuration: 'Duration',
  aptJobCard: 'Job Card',                  aptOpenJobCard: 'Open Job Card',
  aptCloseJob: 'Close Job & Generate Invoice', aptGenerateInvoice: 'Generate Invoice',
  aptLabour: 'Labour',                     aptParts: 'Parts',
  aptAddLabour: 'Add Labour',              aptAddPart: 'Add Part',
  aptQuotation: 'Quotation',               aptSendQuotation: 'Send Quotation',
  aptConfirmed: 'Confirmed',               aptPending: 'Pending',
  aptInProgress: 'In Progress',            aptCompleted: 'Completed',
  aptCancelled: 'Cancelled',               aptNoAppointments: 'No appointments found',
  aptSelectCustomer: 'Select or search customer',
  aptSelectVehicle: 'Select vehicle',
  aptCreateCustomer: '+ Create new customer',
  aptCreateVehicle: '+ Add new vehicle',
  quoTitle: 'Quotations & Jobs',
  quoSubtitle: 'Manage quotations, jobs and invoices',
  quoNew: 'New Quotation',                 quoValidUntil: 'Valid Until',
  quoJobNumber: 'Job Number',              quoAddItem: 'Add Item',
  quoLabour: 'Labour',                     quoParts: 'Parts',
  quoSend: 'Send & Export PDF',            quoApprove: 'Approve',
  quoConvertToJob: 'Convert to Job',       quoConvertToInvoice: 'Convert to Invoice',
  quoSaveDraft: 'Save Draft',              quoNoItems: 'No items added yet',
  quoNoQuotations: 'No quotations found',  quoVehicleDetails: 'Vehicle Details',
  parTitle: 'Parts & Inventory',
  parSubtitle: 'Manage stock, reorder levels and suppliers',
  parAddPart: 'Add Part',                  parEditPart: 'Edit Part',
  parPartNumber: 'Part Number',            parStockLevel: 'Stock Level',
  parReorderPoint: 'Reorder Point',        parLocation: 'Location',
  parCostPrice: 'Cost Price',              parSellingPrice: 'Selling Price',
  parLowStock: 'Low Stock',                parOutOfStock: 'Out of Stock',
  parInStock: 'In Stock',                  parNoParts: 'No parts found',
  parSearchPlaceholder: 'Search parts...',
  kpiTitle: 'Workshop KPIs',
  kpiSubtitle: 'Key performance indicators for the workshop',
  kpiEfficiency: 'Efficiency',             kpiProductivity: 'Productivity',
  kpiEffectiveness: 'Effectiveness',       kpiRevenue: 'Revenue',
  kpiJobsCompleted: 'Jobs Completed',      kpiAvgJobValue: 'Avg Job Value',
  kpiUtilization: 'Bay Utilization',       kpiTarget: 'Target',
  kpiActual: 'Actual',                     kpiVariance: 'Variance',
  kpiTechnician: 'Technician',             kpiHoursWorked: 'Hours Worked',
  kpiBillableHours: 'Billable Hours',      kpiThisMonth: 'This Month',
  kpiLastMonth: 'Last Month',              kpiThisYear: 'This Year',
  accTitle: 'Accounting',
  accSubtitle: 'Financial management — Angolan GAAP (SNC)',
  accAccounts: 'Accounts',                 accJournal: 'Journal',
  accTrialBalance: 'Trial Balance',        accGeneralLedger: 'Gen. Ledger',
  accPeriodClose: 'Period Close',          accExchangeRates: 'Exchange Rates',
  accInvoices: 'Invoices (AR)',            accBills: 'Bills (AP)',
  accReports: 'Reports',                   accStatements: 'Statements',
  accInvoiceTitle: 'Invoice Register — Accounts Receivable',
  accInvoiceSubtitle: 'Track customer invoices, payments, and outstanding balances',
  accOutstanding: 'Total Outstanding',     accOverdue: 'Overdue',
  accCollected: 'Collected',               accRecordPayment: 'Record Payment',
  accPaymentMethod: 'Payment Method',      accBankTransfer: 'Bank Transfer',
  accCash: 'Cash',                         accCard: 'Card',
  accMobileMoney: 'Mobile Money',          accCheque: 'Cheque',
  accInvoiceNumber: 'Invoice #',           accAmountPaid: 'Paid',
  accOpenInvoices: 'open invoices',        accPaidInvoices: 'paid invoices',
  accBillsTitle: 'Bills Register — Accounts Payable',
  accBillsSubtitle: 'Manage vendor bills and supplier payments',
  accNewBill: 'New Bill',                  accVendor: 'Vendor',
  accBillNumber: 'Bill #',                 accTotalPayable: 'Total Payable',
  accOpenBills: 'open bills',              accPaidBills: 'paid bills',
  accProfitLoss: 'Profit & Loss',          accBalanceSheet: 'Balance Sheet',
  accArAging: 'AR Aging',                  accRevenue: 'Revenue',
  accCostOfSales: 'Cost of Sales',         accGrossProfit: 'Gross Profit',
  accOperatingExpenses: 'Operating Expenses', accOperatingProfit: 'Operating Profit',
  accNetIncome: 'Net Income',              accAssets: 'Assets',
  accCurrentAssets: 'Current Assets',      accNonCurrentAssets: 'Non-Current Assets',
  accLiabilities: 'Liabilities',           accCurrentLiabilities: 'Current Liabilities',
  accEquity: 'Equity',                     accTotalAssets: 'Total Assets',
  accTotalLiabilities: 'Total Liabilities', accTotalEquity: 'Total Equity',
  accAgingCurrent: 'Current (0-30d)',       accAging30: '31-60 Days',
  accAging60: '61-90 Days',                accAging90: '90+ Days',
  accDaysOutstanding: 'Days Out',
  accStatementTitle: 'Customer Statements',
  accSelectCustomer: 'Select Customer',    accTotalBilled: 'Total Billed',
  accTotalPaid: 'Total Paid',              accExportStatement: 'Export PDF Statement',
  accStatementDate: 'Statement Date',
};

// ── Portuguese ─────────────────────────────────────────────────────────────
const pt: T = {
  appTitle: 'AutoGP Oficina',
  appSubtitle: 'Sistema de Gestão de Oficina',
  loginTagline: 'Leve a sua oficina mais longe',
  loginTaglineDesc: 'A plataforma completa de gestão para oficinas automóveis modernas — da primeira inspeção à fatura final.',
  loginWelcome: 'Bem-vindo de volta',
  loginSubtitle: 'Aceda ao painel da sua oficina',
  loginEmail: 'Endereço de e-mail',
  loginPassword: 'Palavra-passe',
  loginSignIn: 'Entrar',
  loginSigningIn: 'A entrar…',
  loginError: 'E-mail ou palavra-passe inválidos. Experimente uma conta de demonstração abaixo.',
  loginDemoAccounts: 'Contas de demonstração',
  loginDemoHint: 'Clique num cartão para preencher as credenciais e depois entre',
  loginFeature1: 'Gestão completa de trabalhos de oficina',
  loginFeature2: 'KPIs e análises em tempo real',
  loginFeature3: 'Controlo de acesso baseado em funções',
  loginFeature4: 'Interface rápida e multilingue',
  loginBadge: 'Conforme GAAP Angolano · Pronto para ISO 9001 · Privacidade RGPD',
  navDashboard: 'Painel',                  navDashboardDesc: 'Visão geral e estatísticas',
  navWorkflow: 'Fluxo de Trabalho',        navWorkflowDesc: 'Pipeline de recepção a facturação',
  navAppointments: 'Marcações',            navAppointmentsDesc: 'Agendamento e marcações',
  navClocking: 'Registo de Horas',         navClockingDesc: 'Horas dos técnicos',
  navInspection: 'Inspecção Walk-Around',  navInspectionDesc: 'Check-in do veículo e registo de danos',
  navCustomers: 'Clientes',                navCustomersDesc: 'Gestão de clientes',
  navVehicles: 'Viaturas',                 navVehiclesDesc: 'Base de dados de viaturas',
  navInService: 'Em Serviço',              navInServiceDesc: 'Viaturas na oficina',
  navQuotations: 'Orçamentos e Ordens',    navQuotationsDesc: 'Orçamentos e ordens de trabalho',
  navParts: 'Peças e Inventário',          navPartsDesc: 'Gestão de stock',
  navKpis: 'KPIs da Oficina',             navKpisDesc: 'Indicadores de desempenho',
  navReporting: 'Relatórios',              navReportingDesc: 'Análises e relatórios',
  navAccounting: 'Contabilidade',          navAccountingDesc: 'Sistema financeiro',
  navSettings: 'Configurações',            navSettingsDesc: 'Configuração do sistema',
  navUsers: 'Utilizadores e Permissões',   navUsersDesc: 'Gerir utilizadores e funções',
  navBranches: 'Filiais e Oficinas',       navBranchesDesc: 'Gerir localizações da oficina',
  navMaintenance: 'Pacotes de Manutenção', navMaintenanceDesc: 'Pacotes de tarefas e tarifas de mão-de-obra',
  mntTitle: 'Pacotes de Manutenção',       mntSubtitle: 'Definir tarefas de mão-de-obra padrão e tarifas horárias',
  mntNewPack: 'Novo Pacote',               mntEditPack: 'Editar Pacote',
  mntPackNumber: 'Número do Pacote',       mntLabourTasks: 'Tarefas de Mão-de-Obra',
  mntAddTask: 'Adicionar Tarefa',          mntHours: 'Horas',
  mntRatePerHour: 'Tarifa / hr (AOA)',     mntTotalHours: 'Total de Horas',
  mntTotalAmount: 'Montante Total',        mntActivePacks: 'Pacotes Activos',
  mntAllCategories: 'Todas as Categorias',
  mntFromPack: 'Do Pacote',               mntFromWarehouse: 'Do Armazém',
  mntAddFullPack: 'Adicionar Pacote Completo', mntAddSelected: 'Adicionar Seleccionados',
  mntSelectPack: 'Selecionar Mão-de-Obra dos Pacotes de Manutenção',
  mntSelectParts: 'Selecionar Peças do Armazém',
  mntAvailableStock: 'Stock Disponível',
  mntNoPacksFound: 'Nenhum pacote de manutenção disponível',
  mntNoPartsFound: 'Nenhuma peça disponível no armazém',
  mntSearchPacks: 'Pesquisar pacotes...',  mntSearchParts: 'Pesquisar peças...',
  mntInactive: 'inactivo',                mntTotalLabourHours: 'Total de Horas de Mão-de-Obra',
  mntAcrossAllPacks: 'em todos os pacotes activos', mntTotalLabourValue: 'Valor Total de Mão-de-Obra',
  mntAllActivePacks: 'todos os pacotes activos', mntNoPacksList: 'Nenhum pacote de manutenção encontrado',
  mntCreateFirst: 'Crie o seu primeiro pacote para começar',
  mntTaskDescription: 'Descrição da Tarefa', mntDeleteConfirm: 'Eliminar este pacote de manutenção?',
  mntPackName: 'Nome do Pacote',           mntTotals: 'Totais',
  mntPackActiveDesc: 'Pacote activo (disponível ao criar orçamentos/ordens)',
  mntSaveChanges: 'Guardar Alterações',
  walTitle: 'Inspecção Walk-Around do Veículo',
  walSubtitle: 'Registar danos pré-existentes ao receber um veículo',
  walNewInspection: 'Nova Inspecção',      walTotalInspections: 'Total de Inspecções',
  walDamageItems: 'Itens de Dano',         walToday: 'Hoje',
  walNoInspections: 'Nenhuma inspecção ainda', walNoInspectionsDesc: 'Crie uma ao receber um veículo',
  walNoDamage: 'Sem danos',               walNewInspectionTitle: 'Nova Inspecção Walk-Around do Veículo',
  walNewInspectionDesc: 'Marcar todos os danos pré-existentes antes do início do trabalho',
  walChange: 'Alterar',                    walSearchCustomer: 'Pesquisar cliente...',
  walNoCustomersFound: 'Nenhum cliente encontrado', walCustomerName: 'Nome do cliente',
  walPlate: 'Matrícula',                   walMileage: 'Quilometragem (km)',
  walFuelLevel: 'Nível de Combustível',   walAddingDamageTo: 'A adicionar dano em',
  walDamageType: 'Tipo de Dano',          walSeverity: 'Gravidade',
  walAddDamage: 'Adicionar Dano',         walDamageRecords: 'Registos de Dano',
  walReceivingTechnician: 'Técnico Receptor',
  walGeneralNotes: 'Notas Gerais',
  walGeneralNotesPlaceholder: 'Reclamações do cliente, instruções especiais...',
  walSaveDraft: 'Guardar Rascunho',       walComplete: 'Concluir',
  walClickZone: 'Clique numa zona para marcar dano',
  walFront: 'FRENTE',                     walRear: 'TRASEIRA',
  walFuel: 'Combustível',                 walNoDamageRecorded: 'Nenhum dano pré-existente registado',
  walConditionMap: 'Mapa de Condição do Veículo',
  clkTitle: 'Registo de Ponto dos Técnicos',
  clkSubtitle: 'Acompanhar horas facturáveis e não facturáveis por técnico',
  clkCurrentlyClockedIn: 'Actualmente com Ponto Marcado', clkTotalHours: 'Total de Horas',
  clkBillableHours: 'Horas Facturáveis',  clkBillableEfficiency: 'Eficiência de Facturação',
  clkStatusToday: 'Estado dos Técnicos — Hoje',
  clkIn: 'ENT',                           clkOut: 'SAÍ',
  clkSince: 'Desde',                      clkNotClockedIn: 'Sem ponto marcado',
  clkTodayTotal: 'Hoje',                  clkClockIn: 'Marcar Entrada',
  clkClockOut: 'Marcar Saída',           clkTimesheet: 'Folha de Ponto',
  clkNoEntries: 'Sem registos para',      clkDuration: 'Duração',
  clkInProgress: 'Em Curso',             clkWeeklySummary: 'Resumo Semanal (últimos 7 dias)',
  clkClockedInAt: 'Entrada marcada às',  clkElapsed: 'Decorrido',
  clkClockOutAt: 'Marcar Saída às',      clkWorkType: 'Tipo de Trabalho',
  clkTaskDesc: 'Descrição da tarefa...',  clkClockInAt: 'Marcar Entrada às',
  clkJobWork: 'Trabalho em Ordem',       clkGeneral: 'Geral',
  clkTraining: 'Formação',               clkBreak: 'Pausa',
  dashTitle: 'Visão Geral do Painel',
  dashSubtitle: 'Bem-vindo ao Sistema de Gestão de Oficina Automóvel',
  dashTotalCustomers: 'Total de Clientes',
  dashActiveCustomers: 'Clientes Activos',
  dashTotalRevenue: 'Receita Total',
  dashTotalOrders: 'Total de Ordens',
  dashRefresh: 'Actualizar',
  dashExportDocs: 'Exportar Docs',
  dashUserGuide: 'Guia do Utilizador PDF',
  dashFromLastMonth: 'em relação ao mês passado',
  wfTitle: 'Fluxo de Serviço',
  wfSubtitle: 'Processo completo desde a recepção do veículo até ao pagamento',
  wfVehiclesActiveToday: 'veículos activos hoje',
  wfInputs: 'Entradas',
  wfOutputs: 'Saídas',
  wfStepByStep: 'Acções passo a passo',
  wfDocument: 'Documento',
  wfAlsoTouches: 'Também envolve',
  wfVehiclesAtStage: 'Veículos nesta fase',
  wfNoVehicles: 'Nenhum veículo nesta fase de momento',
  wfLivePipeline: 'Pipeline em tempo real',
  wfSystemModules: 'Módulos do sistema',
  wfReferenceTitle: 'Referência completa do fluxo de trabalho',
  wfColStep: 'Passo',
  wfColStage: 'Fase',
  wfColModule: 'Módulo do Sistema',
  wfColStatus: 'Estado / Fase',
  wfPrevious: 'Anterior',
  wfNext: 'Seguinte',
  wfOf: 'de',
  wfOpen: 'Abrir',
  save: 'Guardar',             cancel: 'Cancelar',          delete: 'Eliminar',
  edit: 'Editar',              add: 'Adicionar',            create: 'Criar',
  update: 'Actualizar',        close: 'Fechar',             open: 'Abrir',
  view: 'Ver',                 confirm: 'Confirmar',        search: 'Pesquisar',
  filter: 'Filtrar',           export: 'Exportar',          exportCSV: 'Exportar CSV',
  exportExcel: 'Exportar Excel', exportPDF: 'Exportar PDF', print: 'Imprimir',
  refresh: 'Actualizar',       back: 'Voltar',              next: 'Seguinte',
  previous: 'Anterior',        submit: 'Submeter',          generate: 'Gerar',
  send: 'Enviar',              approve: 'Aprovar',          reject: 'Rejeitar',
  record: 'Registar',          selectAll: 'Seleccionar Todos', clearAll: 'Limpar Tudo',
  noData: 'Nenhum dado encontrado', loading: 'A carregar...', optional: 'opcional',
  required: 'obrigatório',     all: 'Todos',                yes: 'Sim',
  no: 'Não',                   warning: 'Aviso',
  name: 'Nome',                firstName: 'Nome Próprio',   lastName: 'Apelido',
  email: 'E-mail',             phone: 'Telefone',           whatsapp: 'WhatsApp',
  address: 'Morada',           city: 'Cidade',              company: 'Empresa',
  notes: 'Notas',              description: 'Descrição',    reference: 'Referência',
  date: 'Data',                dueDate: 'Data de Vencimento', status: 'Estado',
  actions: 'Acções',           total: 'Total',              subtotal: 'Subtotal',
  vat: 'IVA (14%)',            balance: 'Saldo',            amount: 'Valor',
  quantity: 'Qtd',             unitPrice: 'Preço Unitário', customer: 'Cliente',
  vehicle: 'Viatura',          technician: 'Técnico',       invoice: 'Factura',
  quotation: 'Orçamento',      job: 'Ordem de Trabalho',    bill: 'Factura de Fornecedor',
  payment: 'Pagamento',        category: 'Categoria',       supplier: 'Fornecedor',
  from: 'De',                  to: 'Para',                  type: 'Tipo',
  period: 'Período',           tags: 'Etiquetas',           vatNumber: 'Nº de Contribuinte',
  idNumber: 'Nº de Identificação',
  statusDraft: 'Rascunho',     statusActive: 'Activo',      statusInactive: 'Inactivo',
  statusPending: 'Pendente',   statusPaid: 'Pago',          statusOverdue: 'Em Atraso',
  statusPartial: 'Parcial',    statusSent: 'Enviado',       statusApproved: 'Aprovado',
  statusRejected: 'Rejeitado', statusCompleted: 'Concluído', statusCancelled: 'Cancelado',
  statusInProgress: 'Em Curso', statusExpired: 'Expirado',  statusInvoiced: 'Facturado',
  statusLowStock: 'Stock Baixo', statusOutOfStock: 'Sem Stock', statusInStock: 'Em Stock',
  crmTitle: 'Gestão de Relacionamento com Clientes',
  crmSubtitle: 'Gerir a sua base de clientes e interacções',
  crmAddCustomer: 'Adicionar Cliente',     crmEditCustomer: 'Editar Cliente',
  crmCustomerDetails: 'Detalhes do Cliente', crmCustomerSince: 'Cliente Desde',
  crmLastContact: 'Último Contacto',       crmTotalSpent: 'Total Gasto',
  crmVehicles: 'Viaturas',                 crmInteractions: 'Interacções',
  crmAddInteraction: 'Adicionar Interacção', crmSearchPlaceholder: 'Pesquisar clientes...',
  crmNoCustomers: 'Nenhum cliente encontrado', crmDeleteConfirm: 'Tem a certeza que quer eliminar este cliente?',
  vehTitle: 'Base de Dados de Viaturas',
  vehSubtitle: 'Rastrear e gerir todas as viaturas registadas',
  vehAddVehicle: 'Adicionar Viatura',      vehEditVehicle: 'Editar Viatura',
  vehPlate: 'Matrícula',                   vehVin: 'Chassis (VIN)',
  vehMake: 'Marca',                        vehModel: 'Modelo',
  vehYear: 'Ano',                          vehColor: 'Cor',
  vehEngine: 'Tipo de Motor',              vehTransmission: 'Transmissão',
  vehMileage: 'Quilometragem',             vehOwner: 'Proprietário',
  vehServiceHistory: 'Histórico de Serviço', vehDissociate: 'Dissociar Proprietário',
  vehDissociateTitle: 'Confirmar Dissociação da Viatura',
  vehDissociateDesc: 'Para evitar erros, escreva a matrícula para confirmar:',
  vehDissociatePlaceholder: 'Escreva a matrícula para confirmar',
  vehFirstRegistered: 'Primeiro Registo',  vehNoVehicles: 'Nenhuma viatura encontrada',
  visTitle: 'Viaturas em Serviço',
  visSubtitle: 'Acompanhar viaturas actualmente na oficina',
  visAllVehicles: 'Todas as Viaturas',     visOnBay: 'Na Baia',
  visDiagnosis: 'Diagnóstico',             visQualityControl: 'Controlo de Qualidade',
  visWashing: 'Lavagem',                   visWaitingCollection: 'Aguarda Levantamento',
  visAssignedTech: 'Técnico Atribuído',    visEstimatedCompletion: 'Conclusão Prevista',
  visPriority: 'Prioridade',               visPriorityNormal: 'Normal',
  visPriorityUrgent: 'Urgente',            visPriorityVip: 'VIP',
  visStage: 'Fase',                        visNoVehicles: 'Nenhuma viatura em serviço',
  aptTitle: 'Marcações',
  aptSubtitle: 'Agendar e gerir marcações da oficina',
  aptNew: 'Nova Marcação',                 aptDate: 'Data',
  aptTime: 'Hora',                         aptBay: 'Baia',
  aptServiceType: 'Tipo de Serviço',       aptDuration: 'Duração',
  aptJobCard: 'Ordem de Trabalho',         aptOpenJobCard: 'Abrir Ordem de Trabalho',
  aptCloseJob: 'Fechar e Gerar Factura',   aptGenerateInvoice: 'Gerar Factura',
  aptLabour: 'Mão de Obra',               aptParts: 'Peças',
  aptAddLabour: 'Adicionar Mão de Obra',  aptAddPart: 'Adicionar Peça',
  aptQuotation: 'Orçamento',               aptSendQuotation: 'Enviar Orçamento',
  aptConfirmed: 'Confirmado',              aptPending: 'Pendente',
  aptInProgress: 'Em Curso',               aptCompleted: 'Concluído',
  aptCancelled: 'Cancelado',               aptNoAppointments: 'Nenhuma marcação encontrada',
  aptSelectCustomer: 'Seleccionar ou pesquisar cliente',
  aptSelectVehicle: 'Seleccionar viatura',
  aptCreateCustomer: '+ Criar novo cliente',
  aptCreateVehicle: '+ Adicionar nova viatura',
  quoTitle: 'Orçamentos e Ordens',
  quoSubtitle: 'Gerir orçamentos, ordens de trabalho e facturas',
  quoNew: 'Novo Orçamento',                quoValidUntil: 'Válido Até',
  quoJobNumber: 'Nº de Ordem',             quoAddItem: 'Adicionar Item',
  quoLabour: 'Mão de Obra',               quoParts: 'Peças',
  quoSend: 'Enviar e Exportar PDF',        quoApprove: 'Aprovar',
  quoConvertToJob: 'Converter em Ordem',   quoConvertToInvoice: 'Converter em Factura',
  quoSaveDraft: 'Guardar Rascunho',        quoNoItems: 'Nenhum item adicionado',
  quoNoQuotations: 'Nenhum orçamento encontrado', quoVehicleDetails: 'Detalhes da Viatura',
  parTitle: 'Peças e Inventário',
  parSubtitle: 'Gerir stock, níveis de reposição e fornecedores',
  parAddPart: 'Adicionar Peça',            parEditPart: 'Editar Peça',
  parPartNumber: 'Referência da Peça',     parStockLevel: 'Nível de Stock',
  parReorderPoint: 'Ponto de Reposição',   parLocation: 'Localização',
  parCostPrice: 'Preço de Custo',          parSellingPrice: 'Preço de Venda',
  parLowStock: 'Stock Baixo',              parOutOfStock: 'Sem Stock',
  parInStock: 'Em Stock',                  parNoParts: 'Nenhuma peça encontrada',
  parSearchPlaceholder: 'Pesquisar peças...',
  kpiTitle: 'KPIs da Oficina',
  kpiSubtitle: 'Indicadores-chave de desempenho da oficina',
  kpiEfficiency: 'Eficiência',             kpiProductivity: 'Produtividade',
  kpiEffectiveness: 'Eficácia',            kpiRevenue: 'Receita',
  kpiJobsCompleted: 'Ordens Concluídas',   kpiAvgJobValue: 'Valor Médio por Ordem',
  kpiUtilization: 'Utilização das Baias',  kpiTarget: 'Objectivo',
  kpiActual: 'Real',                       kpiVariance: 'Variância',
  kpiTechnician: 'Técnico',                kpiHoursWorked: 'Horas Trabalhadas',
  kpiBillableHours: 'Horas Facturáveis',   kpiThisMonth: 'Este Mês',
  kpiLastMonth: 'Mês Passado',             kpiThisYear: 'Este Ano',
  accTitle: 'Contabilidade',
  accSubtitle: 'Gestão financeira — GAAP Angolano (SNC)',
  accAccounts: 'Contas',                   accJournal: 'Diário',
  accTrialBalance: 'Balancete',            accGeneralLedger: 'Razão Geral',
  accPeriodClose: 'Fecho do Período',      accExchangeRates: 'Taxas de Câmbio',
  accInvoices: 'Facturas (CR)',            accBills: 'Facturas (CP)',
  accReports: 'Relatórios',                accStatements: 'Extractos',
  accInvoiceTitle: 'Registo de Facturas — Contas a Receber',
  accInvoiceSubtitle: 'Acompanhar facturas de clientes, pagamentos e saldos',
  accOutstanding: 'Total em Aberto',       accOverdue: 'Em Atraso',
  accCollected: 'Cobrado',                 accRecordPayment: 'Registar Pagamento',
  accPaymentMethod: 'Método de Pagamento', accBankTransfer: 'Transferência Bancária',
  accCash: 'Numerário',                    accCard: 'Cartão',
  accMobileMoney: 'Dinheiro Móvel',        accCheque: 'Cheque',
  accInvoiceNumber: 'Nº Factura',          accAmountPaid: 'Pago',
  accOpenInvoices: 'facturas em aberto',   accPaidInvoices: 'facturas pagas',
  accBillsTitle: 'Registo de Facturas — Contas a Pagar',
  accBillsSubtitle: 'Gerir facturas de fornecedores e pagamentos',
  accNewBill: 'Nova Factura',              accVendor: 'Fornecedor',
  accBillNumber: 'Nº Factura',             accTotalPayable: 'Total a Pagar',
  accOpenBills: 'facturas em aberto',      accPaidBills: 'facturas pagas',
  accProfitLoss: 'Demonstração de Resultados', accBalanceSheet: 'Balanço',
  accArAging: 'Antiguidade de Saldos',     accRevenue: 'Rendimentos',
  accCostOfSales: 'Custo das Vendas',      accGrossProfit: 'Resultado Bruto',
  accOperatingExpenses: 'Gastos Operacionais', accOperatingProfit: 'Resultado Operacional',
  accNetIncome: 'Resultado Líquido',       accAssets: 'Activo',
  accCurrentAssets: 'Activo Corrente',     accNonCurrentAssets: 'Activo Não Corrente',
  accLiabilities: 'Passivo',              accCurrentLiabilities: 'Passivo Corrente',
  accEquity: 'Capital Próprio',            accTotalAssets: 'Total do Activo',
  accTotalLiabilities: 'Total do Passivo', accTotalEquity: 'Total Capital Próprio',
  accAgingCurrent: 'Corrente (0-30d)',      accAging30: '31-60 Dias',
  accAging60: '61-90 Dias',                accAging90: '90+ Dias',
  accDaysOutstanding: 'Dias em Aberto',
  accStatementTitle: 'Extractos de Cliente',
  accSelectCustomer: 'Seleccionar Cliente', accTotalBilled: 'Total Facturado',
  accTotalPaid: 'Total Pago',              accExportStatement: 'Exportar Extracto PDF',
  accStatementDate: 'Data do Extracto',
};

// ── Spanish ────────────────────────────────────────────────────────────────
const es: T = {
  appTitle: 'AutoGP Taller',
  appSubtitle: 'Sistema de Gestión de Taller',
  loginTagline: 'Impulsa tu taller hacia adelante',
  loginTaglineDesc: 'La plataforma de gestión completa para talleres automotrices modernos — desde la primera inspección hasta la factura final.',
  loginWelcome: 'Bienvenido de vuelta',
  loginSubtitle: 'Inicia sesión para acceder a tu panel de taller',
  loginEmail: 'Correo electrónico',
  loginPassword: 'Contraseña',
  loginSignIn: 'Iniciar sesión',
  loginSigningIn: 'Iniciando sesión…',
  loginError: 'Correo o contraseña incorrectos. Prueba una cuenta de demostración.',
  loginDemoAccounts: 'Cuentas de demostración',
  loginDemoHint: 'Haz clic en una tarjeta para rellenar las credenciales y luego inicia sesión',
  loginFeature1: 'Gestión completa de trabajos de taller',
  loginFeature2: 'KPIs y análisis en tiempo real',
  loginFeature3: 'Control de acceso basado en roles',
  loginFeature4: 'Interfaz rápida y multilingüe',
  loginBadge: 'Conforme GAAP angoleño · Listo para ISO 9001 · Privacidad RGPD',
  navDashboard: 'Panel',                   navDashboardDesc: 'Resumen y estadísticas',
  navWorkflow: 'Flujo de Trabajo',         navWorkflowDesc: 'Pipeline de recepción a facturación',
  navAppointments: 'Citas',                navAppointmentsDesc: 'Reservas y programación',
  navClocking: 'Control Horario',          navClockingDesc: 'Horas de técnicos',
  navInspection: 'Inspección Walk-Around', navInspectionDesc: 'Recepción del vehículo y registro de daños',
  navCustomers: 'Clientes',                navCustomersDesc: 'Gestión de clientes',
  navVehicles: 'Vehículos',                navVehiclesDesc: 'Base de datos de vehículos',
  navInService: 'En Servicio',             navInServiceDesc: 'Vehículos en el taller',
  navQuotations: 'Presupuestos y Órdenes', navQuotationsDesc: 'Presupuestos y órdenes',
  navParts: 'Piezas e Inventario',         navPartsDesc: 'Gestión de stock',
  navMaintenance: 'Paquetes de Mantenimiento', navMaintenanceDesc: 'Paquetes de tareas y tarifas de mano de obra',
  mntTitle: 'Paquetes de Mantenimiento',   mntSubtitle: 'Definir tareas de mano de obra estándar y tarifas horarias',
  mntNewPack: 'Nuevo Paquete',             mntEditPack: 'Editar Paquete',
  mntPackNumber: 'Número de Paquete',      mntLabourTasks: 'Tareas de Mano de Obra',
  mntAddTask: 'Agregar Tarea',             mntHours: 'Horas',
  mntRatePerHour: 'Tarifa / hr (AOA)',     mntTotalHours: 'Total de Horas',
  mntTotalAmount: 'Monto Total',           mntActivePacks: 'Paquetes Activos',
  mntAllCategories: 'Todas las Categorías',
  mntFromPack: 'Del Paquete',              mntFromWarehouse: 'Del Almacén',
  mntAddFullPack: 'Agregar Paquete Completo', mntAddSelected: 'Agregar Seleccionados',
  mntSelectPack: 'Seleccionar Mano de Obra de Paquetes de Mantenimiento',
  mntSelectParts: 'Seleccionar Piezas del Almacén',
  mntAvailableStock: 'Stock Disponible',
  mntNoPacksFound: 'No hay paquetes de mantenimiento disponibles',
  mntNoPartsFound: 'No hay piezas disponibles en el almacén',
  mntSearchPacks: 'Buscar paquetes...',    mntSearchParts: 'Buscar piezas...',
  mntInactive: 'inactivo',                mntTotalLabourHours: 'Total Horas de Mano de Obra',
  mntAcrossAllPacks: 'en todos los paquetes activos', mntTotalLabourValue: 'Valor Total de Mano de Obra',
  mntAllActivePacks: 'todos los paquetes activos', mntNoPacksList: 'No se encontraron paquetes de mantenimiento',
  mntCreateFirst: 'Cree su primer paquete para comenzar',
  mntTaskDescription: 'Descripción de Tarea', mntDeleteConfirm: '¿Eliminar este paquete de mantenimiento?',
  mntPackName: 'Nombre del Paquete',       mntTotals: 'Totales',
  mntPackActiveDesc: 'Paquete activo (disponible al crear presupuestos/órdenes)',
  mntSaveChanges: 'Guardar Cambios',
  walTitle: 'Inspección Walk-Around del Vehículo',
  walSubtitle: 'Registrar daños preexistentes al recibir un vehículo',
  walNewInspection: 'Nueva Inspección',    walTotalInspections: 'Total Inspecciones',
  walDamageItems: 'Elementos de Daño',     walToday: 'Hoy',
  walNoInspections: 'Sin inspecciones aún', walNoInspectionsDesc: 'Cree una al recibir un vehículo',
  walNoDamage: 'Sin daños',               walNewInspectionTitle: 'Nueva Inspección Walk-Around del Vehículo',
  walNewInspectionDesc: 'Marcar todos los daños preexistentes antes de comenzar el trabajo',
  walChange: 'Cambiar',                    walSearchCustomer: 'Buscar cliente...',
  walNoCustomersFound: 'No se encontraron clientes', walCustomerName: 'Nombre del cliente',
  walPlate: 'Matrícula',                   walMileage: 'Kilometraje (km)',
  walFuelLevel: 'Nivel de Combustible',   walAddingDamageTo: 'Añadiendo daño en',
  walDamageType: 'Tipo de Daño',          walSeverity: 'Gravedad',
  walAddDamage: 'Añadir Daño',            walDamageRecords: 'Registros de Daño',
  walReceivingTechnician: 'Técnico Receptor',
  walGeneralNotes: 'Notas Generales',
  walGeneralNotesPlaceholder: 'Reclamaciones del cliente, instrucciones especiales...',
  walSaveDraft: 'Guardar Borrador',       walComplete: 'Completar',
  walClickZone: 'Haga clic en una zona para marcar daño',
  walFront: 'FRONTAL',                    walRear: 'TRASERA',
  walFuel: 'Combustible',                 walNoDamageRecorded: 'No se registraron daños preexistentes',
  walConditionMap: 'Mapa de Condición del Vehículo',
  clkTitle: 'Control Horario de Técnicos',
  clkSubtitle: 'Seguimiento de horas facturables y no facturables por técnico',
  clkCurrentlyClockedIn: 'Actualmente Fichados', clkTotalHours: 'Total de Horas',
  clkBillableHours: 'Horas Facturables',   clkBillableEfficiency: 'Eficiencia de Facturación',
  clkStatusToday: 'Estado de Técnicos — Hoy',
  clkIn: 'ENT',                           clkOut: 'SAL',
  clkSince: 'Desde',                      clkNotClockedIn: 'Sin fichar',
  clkTodayTotal: 'Hoy',                   clkClockIn: 'Fichar Entrada',
  clkClockOut: 'Fichar Salida',          clkTimesheet: 'Parte de Horas',
  clkNoEntries: 'Sin entradas para',      clkDuration: 'Duración',
  clkInProgress: 'En Curso',             clkWeeklySummary: 'Resumen Semanal (últimos 7 días)',
  clkClockedInAt: 'Fichado a las',       clkElapsed: 'Transcurrido',
  clkClockOutAt: 'Fichar Salida a las',  clkWorkType: 'Tipo de Trabajo',
  clkTaskDesc: 'Descripción de la tarea...', clkClockInAt: 'Fichar Entrada a las',
  clkJobWork: 'Trabajo en Orden',        clkGeneral: 'General',
  clkTraining: 'Formación',              clkBreak: 'Descanso',
  navKpis: 'KPIs del Taller',             navKpisDesc: 'Indicadores de rendimiento',
  navReporting: 'Informes',                navReportingDesc: 'Análisis e informes',
  navAccounting: 'Contabilidad',           navAccountingDesc: 'Sistema financiero',
  navSettings: 'Configuración',            navSettingsDesc: 'Configuración del sistema',
  navUsers: 'Usuarios y Permisos',         navUsersDesc: 'Gestionar usuarios y roles',
  navBranches: 'Sucursales y Talleres',    navBranchesDesc: 'Gestionar ubicaciones del taller',
  dashTitle: 'Resumen del Panel',
  dashSubtitle: 'Bienvenido al Sistema de Gestión de Taller Automotriz',
  dashTotalCustomers: 'Total Clientes',
  dashActiveCustomers: 'Clientes Activos',
  dashTotalRevenue: 'Ingresos Totales',
  dashTotalOrders: 'Total Órdenes',
  dashRefresh: 'Actualizar',
  dashExportDocs: 'Exportar Docs',
  dashUserGuide: 'Guía de Usuario PDF',
  dashFromLastMonth: 'respecto al mes pasado',
  wfTitle: 'Flujo de Servicio',
  wfSubtitle: 'Proceso completo desde la recepción del vehículo hasta el pago',
  wfVehiclesActiveToday: 'vehículos activos hoy',
  wfInputs: 'Entradas',
  wfOutputs: 'Salidas',
  wfStepByStep: 'Acciones paso a paso',
  wfDocument: 'Documento',
  wfAlsoTouches: 'También involucra',
  wfVehiclesAtStage: 'Vehículos en esta etapa',
  wfNoVehicles: 'No hay vehículos en esta etapa ahora mismo',
  wfLivePipeline: 'Pipeline en tiempo real',
  wfSystemModules: 'Módulos del sistema',
  wfReferenceTitle: 'Referencia completa del flujo de trabajo',
  wfColStep: 'Paso',
  wfColStage: 'Etapa',
  wfColModule: 'Módulo del Sistema',
  wfColStatus: 'Estado / Etapa',
  wfPrevious: 'Anterior',
  wfNext: 'Siguiente',
  wfOf: 'de',
  wfOpen: 'Abrir',
  save: 'Guardar',             cancel: 'Cancelar',          delete: 'Eliminar',
  edit: 'Editar',              add: 'Añadir',               create: 'Crear',
  update: 'Actualizar',        close: 'Cerrar',             open: 'Abrir',
  view: 'Ver',                 confirm: 'Confirmar',        search: 'Buscar',
  filter: 'Filtrar',           export: 'Exportar',          exportCSV: 'Exportar CSV',
  exportExcel: 'Exportar Excel', exportPDF: 'Exportar PDF', print: 'Imprimir',
  refresh: 'Actualizar',       back: 'Volver',              next: 'Siguiente',
  previous: 'Anterior',        submit: 'Enviar',            generate: 'Generar',
  send: 'Enviar',              approve: 'Aprobar',          reject: 'Rechazar',
  record: 'Registrar',         selectAll: 'Seleccionar Todo', clearAll: 'Limpiar Todo',
  noData: 'No se encontraron datos', loading: 'Cargando...', optional: 'opcional',
  required: 'requerido',       all: 'Todos',                yes: 'Sí',
  no: 'No',                    warning: 'Advertencia',
  name: 'Nombre',              firstName: 'Nombre',         lastName: 'Apellido',
  email: 'Correo electrónico', phone: 'Teléfono',           whatsapp: 'WhatsApp',
  address: 'Dirección',        city: 'Ciudad',              company: 'Empresa',
  notes: 'Notas',              description: 'Descripción',  reference: 'Referencia',
  date: 'Fecha',               dueDate: 'Fecha de Vencimiento', status: 'Estado',
  actions: 'Acciones',         total: 'Total',              subtotal: 'Subtotal',
  vat: 'IVA (14%)',            balance: 'Saldo',            amount: 'Importe',
  quantity: 'Cant.',           unitPrice: 'Precio Unitario', customer: 'Cliente',
  vehicle: 'Vehículo',         technician: 'Técnico',       invoice: 'Factura',
  quotation: 'Presupuesto',    job: 'Orden de Trabajo',     bill: 'Factura Proveedor',
  payment: 'Pago',             category: 'Categoría',       supplier: 'Proveedor',
  from: 'Desde',               to: 'Hasta',                 type: 'Tipo',
  period: 'Período',           tags: 'Etiquetas',           vatNumber: 'NIF / CIF',
  idNumber: 'Nº Identificación',
  statusDraft: 'Borrador',     statusActive: 'Activo',      statusInactive: 'Inactivo',
  statusPending: 'Pendiente',  statusPaid: 'Pagado',        statusOverdue: 'Vencido',
  statusPartial: 'Parcial',    statusSent: 'Enviado',       statusApproved: 'Aprobado',
  statusRejected: 'Rechazado', statusCompleted: 'Completado', statusCancelled: 'Cancelado',
  statusInProgress: 'En Curso', statusExpired: 'Expirado',  statusInvoiced: 'Facturado',
  statusLowStock: 'Stock Bajo', statusOutOfStock: 'Sin Stock', statusInStock: 'En Stock',
  crmTitle: 'Gestión de Relaciones con Clientes',
  crmSubtitle: 'Gestione su base de clientes e interacciones',
  crmAddCustomer: 'Añadir Cliente',        crmEditCustomer: 'Editar Cliente',
  crmCustomerDetails: 'Detalles del Cliente', crmCustomerSince: 'Cliente Desde',
  crmLastContact: 'Último Contacto',       crmTotalSpent: 'Total Gastado',
  crmVehicles: 'Vehículos',                crmInteractions: 'Interacciones',
  crmAddInteraction: 'Añadir Interacción', crmSearchPlaceholder: 'Buscar clientes...',
  crmNoCustomers: 'No se encontraron clientes', crmDeleteConfirm: '¿Está seguro de que desea eliminar este cliente?',
  vehTitle: 'Base de Datos de Vehículos',
  vehSubtitle: 'Registrar y gestionar todos los vehículos',
  vehAddVehicle: 'Añadir Vehículo',        vehEditVehicle: 'Editar Vehículo',
  vehPlate: 'Matrícula',                   vehVin: 'Bastidor (VIN)',
  vehMake: 'Marca',                        vehModel: 'Modelo',
  vehYear: 'Año',                          vehColor: 'Color',
  vehEngine: 'Tipo de Motor',              vehTransmission: 'Transmisión',
  vehMileage: 'Kilometraje',               vehOwner: 'Propietario',
  vehServiceHistory: 'Historial de Servicio', vehDissociate: 'Desasociar Propietario',
  vehDissociateTitle: 'Confirmar Desasociación del Vehículo',
  vehDissociateDesc: 'Para evitar errores, escriba la matrícula para confirmar:',
  vehDissociatePlaceholder: 'Escriba la matrícula para confirmar',
  vehFirstRegistered: 'Primera Matriculación', vehNoVehicles: 'No se encontraron vehículos',
  visTitle: 'Vehículos en Servicio',
  visSubtitle: 'Seguimiento de vehículos actualmente en el taller',
  visAllVehicles: 'Todos los Vehículos',   visOnBay: 'En Foso',
  visDiagnosis: 'Diagnóstico',             visQualityControl: 'Control de Calidad',
  visWashing: 'Lavado',                    visWaitingCollection: 'Esperando Recogida',
  visAssignedTech: 'Técnico Asignado',     visEstimatedCompletion: 'Finalización Est.',
  visPriority: 'Prioridad',                visPriorityNormal: 'Normal',
  visPriorityUrgent: 'Urgente',            visPriorityVip: 'VIP',
  visStage: 'Etapa',                       visNoVehicles: 'No hay vehículos en servicio',
  aptTitle: 'Citas',
  aptSubtitle: 'Programar y gestionar citas del taller',
  aptNew: 'Nueva Cita',                    aptDate: 'Fecha',
  aptTime: 'Hora',                         aptBay: 'Foso',
  aptServiceType: 'Tipo de Servicio',      aptDuration: 'Duración',
  aptJobCard: 'Orden de Trabajo',          aptOpenJobCard: 'Abrir Orden de Trabajo',
  aptCloseJob: 'Cerrar y Generar Factura', aptGenerateInvoice: 'Generar Factura',
  aptLabour: 'Mano de Obra',              aptParts: 'Piezas',
  aptAddLabour: 'Añadir Mano de Obra',    aptAddPart: 'Añadir Pieza',
  aptQuotation: 'Presupuesto',             aptSendQuotation: 'Enviar Presupuesto',
  aptConfirmed: 'Confirmada',              aptPending: 'Pendiente',
  aptInProgress: 'En Curso',               aptCompleted: 'Completada',
  aptCancelled: 'Cancelada',               aptNoAppointments: 'No se encontraron citas',
  aptSelectCustomer: 'Seleccionar o buscar cliente',
  aptSelectVehicle: 'Seleccionar vehículo',
  aptCreateCustomer: '+ Crear nuevo cliente',
  aptCreateVehicle: '+ Añadir nuevo vehículo',
  quoTitle: 'Presupuestos y Órdenes',
  quoSubtitle: 'Gestionar presupuestos, órdenes de trabajo y facturas',
  quoNew: 'Nuevo Presupuesto',             quoValidUntil: 'Válido Hasta',
  quoJobNumber: 'Nº de Orden',             quoAddItem: 'Añadir Artículo',
  quoLabour: 'Mano de Obra',              quoParts: 'Piezas',
  quoSend: 'Enviar y Exportar PDF',        quoApprove: 'Aprobar',
  quoConvertToJob: 'Convertir en Orden',   quoConvertToInvoice: 'Convertir en Factura',
  quoSaveDraft: 'Guardar Borrador',        quoNoItems: 'No se han añadido artículos',
  quoNoQuotations: 'No se encontraron presupuestos', quoVehicleDetails: 'Detalles del Vehículo',
  parTitle: 'Piezas e Inventario',
  parSubtitle: 'Gestionar stock, niveles de reorden y proveedores',
  parAddPart: 'Añadir Pieza',              parEditPart: 'Editar Pieza',
  parPartNumber: 'Referencia de Pieza',    parStockLevel: 'Nivel de Stock',
  parReorderPoint: 'Punto de Reorden',     parLocation: 'Ubicación',
  parCostPrice: 'Precio de Coste',         parSellingPrice: 'Precio de Venta',
  parLowStock: 'Stock Bajo',               parOutOfStock: 'Sin Stock',
  parInStock: 'En Stock',                  parNoParts: 'No se encontraron piezas',
  parSearchPlaceholder: 'Buscar piezas...',
  kpiTitle: 'KPIs del Taller',
  kpiSubtitle: 'Indicadores clave de rendimiento del taller',
  kpiEfficiency: 'Eficiencia',             kpiProductivity: 'Productividad',
  kpiEffectiveness: 'Efectividad',         kpiRevenue: 'Ingresos',
  kpiJobsCompleted: 'Órdenes Completadas', kpiAvgJobValue: 'Valor Medio por Orden',
  kpiUtilization: 'Utilización de Fosos',  kpiTarget: 'Objetivo',
  kpiActual: 'Real',                       kpiVariance: 'Varianza',
  kpiTechnician: 'Técnico',                kpiHoursWorked: 'Horas Trabajadas',
  kpiBillableHours: 'Horas Facturables',   kpiThisMonth: 'Este Mes',
  kpiLastMonth: 'Mes Pasado',              kpiThisYear: 'Este Año',
  accTitle: 'Contabilidad',
  accSubtitle: 'Gestión financiera — GAAP Angolano (SNC)',
  accAccounts: 'Cuentas',                  accJournal: 'Diario',
  accTrialBalance: 'Balance de Comprobación', accGeneralLedger: 'Libro Mayor',
  accPeriodClose: 'Cierre de Período',     accExchangeRates: 'Tipos de Cambio',
  accInvoices: 'Facturas (CR)',            accBills: 'Facturas (CP)',
  accReports: 'Informes',                  accStatements: 'Extractos',
  accInvoiceTitle: 'Registro de Facturas — Cuentas por Cobrar',
  accInvoiceSubtitle: 'Seguimiento de facturas, pagos y saldos de clientes',
  accOutstanding: 'Total Pendiente',       accOverdue: 'Vencido',
  accCollected: 'Cobrado',                 accRecordPayment: 'Registrar Pago',
  accPaymentMethod: 'Método de Pago',      accBankTransfer: 'Transferencia Bancaria',
  accCash: 'Efectivo',                     accCard: 'Tarjeta',
  accMobileMoney: 'Dinero Móvil',          accCheque: 'Cheque',
  accInvoiceNumber: 'Nº Factura',          accAmountPaid: 'Pagado',
  accOpenInvoices: 'facturas pendientes',  accPaidInvoices: 'facturas pagadas',
  accBillsTitle: 'Registro de Facturas — Cuentas por Pagar',
  accBillsSubtitle: 'Gestionar facturas de proveedores y pagos',
  accNewBill: 'Nueva Factura',             accVendor: 'Proveedor',
  accBillNumber: 'Nº Factura',             accTotalPayable: 'Total a Pagar',
  accOpenBills: 'facturas pendientes',     accPaidBills: 'facturas pagadas',
  accProfitLoss: 'Cuenta de Resultados',   accBalanceSheet: 'Balance',
  accArAging: 'Antigüedad de Saldos',      accRevenue: 'Ingresos',
  accCostOfSales: 'Coste de Ventas',       accGrossProfit: 'Beneficio Bruto',
  accOperatingExpenses: 'Gastos Operativos', accOperatingProfit: 'Resultado Operativo',
  accNetIncome: 'Resultado Neto',          accAssets: 'Activo',
  accCurrentAssets: 'Activo Corriente',    accNonCurrentAssets: 'Activo No Corriente',
  accLiabilities: 'Pasivo',               accCurrentLiabilities: 'Pasivo Corriente',
  accEquity: 'Patrimonio Neto',            accTotalAssets: 'Total Activo',
  accTotalLiabilities: 'Total Pasivo',     accTotalEquity: 'Total Patrimonio',
  accAgingCurrent: 'Corriente (0-30d)',     accAging30: '31-60 Días',
  accAging60: '61-90 Días',                accAging90: '90+ Días',
  accDaysOutstanding: 'Días Pendiente',
  accStatementTitle: 'Extractos de Cliente',
  accSelectCustomer: 'Seleccionar Cliente', accTotalBilled: 'Total Facturado',
  accTotalPaid: 'Total Pagado',            accExportStatement: 'Exportar Extracto PDF',
  accStatementDate: 'Fecha del Extracto',
};

// ── Mandarin (Simplified Chinese) ──────────────────────────────────────────
const zh: T = {
  appTitle: 'AutoGP 汽车修理厂',
  appSubtitle: '汽车修理厂管理系统',
  loginTagline: '推动您的车间向前发展',
  loginTaglineDesc: '面向现代汽车修理厂的完整管理平台——从首次检查到最终发票。',
  loginWelcome: '欢迎回来',
  loginSubtitle: '登录以访问您的车间管理面板',
  loginEmail: '电子邮件地址',
  loginPassword: '密码',
  loginSignIn: '登录',
  loginSigningIn: '登录中…',
  loginError: '电子邮件或密码无效。请尝试下方的演示账户。',
  loginDemoAccounts: '演示账户',
  loginDemoHint: '点击卡片填写凭据，然后登录',
  loginFeature1: '完整的车间作业管理',
  loginFeature2: '实时KPI与分析',
  loginFeature3: '基于角色的访问控制',
  loginFeature4: '快速多语言界面',
  loginBadge: '符合安哥拉GAAP · ISO 9001就绪 · RGPD数据隐私',
  navDashboard: '仪表板',                  navDashboardDesc: '概览与统计',
  navWorkflow: '服务流程',                 navWorkflowDesc: '从接待到开票的流程',
  navAppointments: '预约',                 navAppointmentsDesc: '预约与排班',
  navClocking: '打卡记录',                 navClockingDesc: '技师工时',
  navInspection: '环车检查',               navInspectionDesc: '车辆接收与损伤记录',
  navCustomers: '客户',                    navCustomersDesc: '客户管理',
  navVehicles: '车辆',                     navVehiclesDesc: '车辆数据库',
  navInService: '在修车辆',               navInServiceDesc: '在厂车辆',
  navQuotations: '报价与工单',             navQuotationsDesc: '报价与工单管理',
  navParts: '配件与库存',                  navPartsDesc: '库存管理',
  navMaintenance: '维护套餐',              navMaintenanceDesc: '劳动任务包和费率',
  mntTitle: '维护套餐',                    mntSubtitle: '定义标准服务劳动任务和小时费率',
  mntNewPack: '新套餐',                   mntEditPack: '编辑套餐',
  mntPackNumber: '套餐编号',              mntLabourTasks: '劳动任务',
  mntAddTask: '添加任务',                 mntHours: '小时',
  mntRatePerHour: '费率 / 小时 (AOA)',    mntTotalHours: '总小时数',
  mntTotalAmount: '总金额',               mntActivePacks: '活跃套餐',
  mntAllCategories: '所有类别',
  mntFromPack: '从套餐',                  mntFromWarehouse: '从仓库',
  mntAddFullPack: '添加完整套餐',          mntAddSelected: '添加所选',
  mntSelectPack: '从维护套餐选择劳动',
  mntSelectParts: '从仓库选择配件',
  mntAvailableStock: '可用库存',
  mntNoPacksFound: '没有可用的维护套餐',
  mntNoPartsFound: '仓库中没有可用配件',
  mntSearchPacks: '搜索套餐...',           mntSearchParts: '搜索配件...',
  mntInactive: '未激活',                  mntTotalLabourHours: '劳动总工时',
  mntAcrossAllPacks: '所有活跃套餐合计',  mntTotalLabourValue: '劳动总价值',
  mntAllActivePacks: '所有活跃套餐',      mntNoPacksList: '未找到维护套餐',
  mntCreateFirst: '创建您的第一个套餐以开始使用',
  mntTaskDescription: '任务描述',         mntDeleteConfirm: '删除此维护套餐？',
  mntPackName: '套餐名称',               mntTotals: '合计',
  mntPackActiveDesc: '套餐激活（创建报价/工单时可用）',
  mntSaveChanges: '保存更改',
  walTitle: '车辆环车检查',
  walSubtitle: '接收车辆时记录预先存在的损伤',
  walNewInspection: '新建检查',           walTotalInspections: '检查总数',
  walDamageItems: '损伤项目',             walToday: '今天',
  walNoInspections: '暂无检查记录',       walNoInspectionsDesc: '接收车辆时创建一个',
  walNoDamage: '无损伤',                  walNewInspectionTitle: '新建车辆环车检查',
  walNewInspectionDesc: '在开始工作前标记所有预先存在的损伤',
  walChange: '更改',                      walSearchCustomer: '搜索客户...',
  walNoCustomersFound: '未找到客户',      walCustomerName: '客户姓名',
  walPlate: '车牌',                       walMileage: '里程 (km)',
  walFuelLevel: '油量',                   walAddingDamageTo: '正在添加损伤至',
  walDamageType: '损伤类型',             walSeverity: '严重程度',
  walAddDamage: '添加损伤',              walDamageRecords: '损伤记录',
  walReceivingTechnician: '接车技师',
  walGeneralNotes: '备注',
  walGeneralNotesPlaceholder: '客户投诉、特别说明...',
  walSaveDraft: '保存草稿',              walComplete: '完成',
  walClickZone: '点击区域标记损伤',
  walFront: '车头',                       walRear: '车尾',
  walFuel: '油量',                        walNoDamageRecorded: '未记录预先存在的损伤',
  walConditionMap: '车辆状况图',
  clkTitle: '技师打卡',
  clkSubtitle: '按技师跟踪计费和非计费工时',
  clkCurrentlyClockedIn: '当前已打卡',    clkTotalHours: '总工时',
  clkBillableHours: '计费工时',          clkBillableEfficiency: '计费效率',
  clkStatusToday: '今日技师状态',
  clkIn: '在岗',                          clkOut: '离岗',
  clkSince: '自',                         clkNotClockedIn: '未打卡',
  clkTodayTotal: '今日',                  clkClockIn: '签到',
  clkClockOut: '签退',                   clkTimesheet: '工时表',
  clkNoEntries: '无记录',                clkDuration: '时长',
  clkInProgress: '进行中',              clkWeeklySummary: '周汇总（最近7天）',
  clkClockedInAt: '签到时间',            clkElapsed: '已用时',
  clkClockOutAt: '签退',                 clkWorkType: '工作类型',
  clkTaskDesc: '任务描述...',            clkClockInAt: '签到',
  clkJobWork: '工单工作',               clkGeneral: '一般',
  clkTraining: '培训',                   clkBreak: '休息',
  navKpis: '绩效指标',                    navKpisDesc: '关键绩效指标',
  navReporting: '报表',                    navReportingDesc: '分析与报表',
  navAccounting: '财务会计',               navAccountingDesc: '财务系统',
  navSettings: '设置',                     navSettingsDesc: '系统配置',
  navUsers: '用户与权限',                  navUsersDesc: '管理用户和角色',
  navBranches: '分支与车间',               navBranchesDesc: '管理车间位置',
  dashTitle: '仪表板概览',
  dashSubtitle: '欢迎使用汽车修理厂管理系统',
  dashTotalCustomers: '客户总数',
  dashActiveCustomers: '活跃客户',
  dashTotalRevenue: '总收入',
  dashTotalOrders: '总工单数',
  dashRefresh: '刷新',
  dashExportDocs: '导出文档',
  dashUserGuide: '用户指南 PDF',
  dashFromLastMonth: '较上月',
  wfTitle: '服务流程',
  wfSubtitle: '从车辆接待到付款的端到端完整流程',
  wfVehiclesActiveToday: '辆车今日在修',
  wfInputs: '输入',
  wfOutputs: '输出',
  wfStepByStep: '步骤操作',
  wfDocument: '文件',
  wfAlsoTouches: '也涉及',
  wfVehiclesAtStage: '此阶段车辆',
  wfNoVehicles: '此阶段暂无车辆',
  wfLivePipeline: '实时流程',
  wfSystemModules: '系统模块',
  wfReferenceTitle: '完整工作流参考',
  wfColStep: '步骤',
  wfColStage: '阶段',
  wfColModule: '系统模块',
  wfColStatus: '状态 / 阶段',
  wfPrevious: '上一步',
  wfNext: '下一步',
  wfOf: '共',
  wfOpen: '打开',
  save: '保存',                cancel: '取消',              delete: '删除',
  edit: '编辑',                add: '添加',                 create: '创建',
  update: '更新',              close: '关闭',               open: '打开',
  view: '查看',                confirm: '确认',             search: '搜索',
  filter: '筛选',              export: '导出',              exportCSV: '导出 CSV',
  exportExcel: '导出 Excel',   exportPDF: '导出 PDF',       print: '打印',
  refresh: '刷新',             back: '返回',                next: '下一步',
  previous: '上一步',          submit: '提交',              generate: '生成',
  send: '发送',                approve: '批准',             reject: '拒绝',
  record: '记录',              selectAll: '全选',           clearAll: '清除全部',
  noData: '未找到数据',         loading: '加载中...',         optional: '可选',
  required: '必填',            all: '全部',                 yes: '是',
  no: '否',                    warning: '警告',
  name: '姓名',                firstName: '名',             lastName: '姓',
  email: '电子邮件',            phone: '电话',               whatsapp: 'WhatsApp',
  address: '地址',             city: '城市',                company: '公司',
  notes: '备注',               description: '描述',         reference: '参考编号',
  date: '日期',                dueDate: '到期日',            status: '状态',
  actions: '操作',             total: '合计',               subtotal: '小计',
  vat: '增值税 (14%)',          balance: '余额',             amount: '金额',
  quantity: '数量',            unitPrice: '单价',            customer: '客户',
  vehicle: '车辆',             technician: '技师',           invoice: '发票',
  quotation: '报价单',          job: '工单',                 bill: '供应商账单',
  payment: '付款',             category: '类别',             supplier: '供应商',
  from: '从',                  to: '至',                    type: '类型',
  period: '期间',              tags: '标签',                vatNumber: '税号',
  idNumber: '身份证号',
  statusDraft: '草稿',         statusActive: '活跃',         statusInactive: '非活跃',
  statusPending: '待处理',      statusPaid: '已付款',         statusOverdue: '逾期',
  statusPartial: '部分付款',    statusSent: '已发送',         statusApproved: '已批准',
  statusRejected: '已拒绝',     statusCompleted: '已完成',    statusCancelled: '已取消',
  statusInProgress: '进行中',   statusExpired: '已过期',      statusInvoiced: '已开票',
  statusLowStock: '库存不足',   statusOutOfStock: '缺货',     statusInStock: '有库存',
  crmTitle: '客户关系管理',
  crmSubtitle: '管理您的客户群和互动记录',
  crmAddCustomer: '添加客户',             crmEditCustomer: '编辑客户',
  crmCustomerDetails: '客户详情',          crmCustomerSince: '客户自',
  crmLastContact: '最近联系',             crmTotalSpent: '消费总额',
  crmVehicles: '车辆',                    crmInteractions: '互动记录',
  crmAddInteraction: '添加互动',           crmSearchPlaceholder: '搜索客户...',
  crmNoCustomers: '未找到客户',            crmDeleteConfirm: '确定要删除此客户吗？',
  vehTitle: '车辆数据库',
  vehSubtitle: '跟踪和管理所有注册车辆',
  vehAddVehicle: '添加车辆',              vehEditVehicle: '编辑车辆',
  vehPlate: '车牌号',                     vehVin: '车架号 (VIN)',
  vehMake: '品牌',                        vehModel: '型号',
  vehYear: '年份',                        vehColor: '颜色',
  vehEngine: '发动机类型',                 vehTransmission: '变速器',
  vehMileage: '里程',                     vehOwner: '车主',
  vehServiceHistory: '维修记录',           vehDissociate: '解除关联车主',
  vehDissociateTitle: '确认解除车辆关联',
  vehDissociateDesc: '为防止误操作，请输入车牌号确认：',
  vehDissociatePlaceholder: '请输入车牌号确认',
  vehFirstRegistered: '首次注册',          vehNoVehicles: '未找到车辆',
  visTitle: '在修车辆',
  visSubtitle: '跟踪当前在修理厂的车辆',
  visAllVehicles: '全部车辆',              visOnBay: '维修中',
  visDiagnosis: '诊断中',                 visQualityControl: '质量检查',
  visWashing: '洗车',                     visWaitingCollection: '等待取车',
  visAssignedTech: '负责技师',             visEstimatedCompletion: '预计完工',
  visPriority: '优先级',                  visPriorityNormal: '普通',
  visPriorityUrgent: '紧急',              visPriorityVip: 'VIP',
  visStage: '阶段',                       visNoVehicles: '暂无在修车辆',
  aptTitle: '预约管理',
  aptSubtitle: '安排和管理修理厂预约',
  aptNew: '新建预约',                      aptDate: '日期',
  aptTime: '时间',                         aptBay: '维修位',
  aptServiceType: '服务类型',              aptDuration: '时长',
  aptJobCard: '工单',                      aptOpenJobCard: '打开工单',
  aptCloseJob: '关闭工单并生成发票',        aptGenerateInvoice: '生成发票',
  aptLabour: '工时',                       aptParts: '配件',
  aptAddLabour: '添加工时',                aptAddPart: '添加配件',
  aptQuotation: '报价单',                  aptSendQuotation: '发送报价单',
  aptConfirmed: '已确认',                  aptPending: '待确认',
  aptInProgress: '进行中',                 aptCompleted: '已完成',
  aptCancelled: '已取消',                  aptNoAppointments: '未找到预约',
  aptSelectCustomer: '选择或搜索客户',
  aptSelectVehicle: '选择车辆',
  aptCreateCustomer: '+ 创建新客户',
  aptCreateVehicle: '+ 添加新车辆',
  quoTitle: '报价与工单',
  quoSubtitle: '管理报价单、工单和发票',
  quoNew: '新建报价',                      quoValidUntil: '有效期至',
  quoJobNumber: '工单号',                  quoAddItem: '添加项目',
  quoLabour: '工时',                       quoParts: '配件',
  quoSend: '发送并导出 PDF',               quoApprove: '批准',
  quoConvertToJob: '转为工单',             quoConvertToInvoice: '转为发票',
  quoSaveDraft: '保存草稿',                quoNoItems: '尚未添加项目',
  quoNoQuotations: '未找到报价单',          quoVehicleDetails: '车辆详情',
  parTitle: '配件与库存',
  parSubtitle: '管理库存、再订货点和供应商',
  parAddPart: '添加配件',                  parEditPart: '编辑配件',
  parPartNumber: '配件编号',               parStockLevel: '库存数量',
  parReorderPoint: '再订货点',             parLocation: '存放位置',
  parCostPrice: '成本价',                  parSellingPrice: '销售价',
  parLowStock: '库存不足',                 parOutOfStock: '缺货',
  parInStock: '有库存',                    parNoParts: '未找到配件',
  parSearchPlaceholder: '搜索配件...',
  kpiTitle: '修理厂绩效指标',
  kpiSubtitle: '修理厂关键绩效指标',
  kpiEfficiency: '效率',                   kpiProductivity: '生产力',
  kpiEffectiveness: '效果',                kpiRevenue: '收入',
  kpiJobsCompleted: '完成工单数',           kpiAvgJobValue: '平均工单金额',
  kpiUtilization: '维修位利用率',           kpiTarget: '目标',
  kpiActual: '实际',                       kpiVariance: '差异',
  kpiTechnician: '技师',                   kpiHoursWorked: '工作时长',
  kpiBillableHours: '计费时长',            kpiThisMonth: '本月',
  kpiLastMonth: '上月',                    kpiThisYear: '本年',
  accTitle: '财务会计',
  accSubtitle: '财务管理 — 安哥拉会计准则 (SNC)',
  accAccounts: '科目表',                   accJournal: '日记账',
  accTrialBalance: '试算表',               accGeneralLedger: '总分类账',
  accPeriodClose: '期末结账',              accExchangeRates: '汇率',
  accInvoices: '应收账款',                 accBills: '应付账款',
  accReports: '财务报表',                  accStatements: '客户对账单',
  accInvoiceTitle: '发票登记 — 应收账款',
  accInvoiceSubtitle: '跟踪客户发票、付款和未结余额',
  accOutstanding: '未结总额',              accOverdue: '逾期',
  accCollected: '已收款',                  accRecordPayment: '记录付款',
  accPaymentMethod: '付款方式',            accBankTransfer: '银行转账',
  accCash: '现金',                         accCard: '刷卡',
  accMobileMoney: '移动支付',              accCheque: '支票',
  accInvoiceNumber: '发票号',              accAmountPaid: '已付',
  accOpenInvoices: '未结发票',             accPaidInvoices: '已付发票',
  accBillsTitle: '账单登记 — 应付账款',
  accBillsSubtitle: '管理供应商账单和付款',
  accNewBill: '新建账单',                  accVendor: '供应商',
  accBillNumber: '账单号',                 accTotalPayable: '应付总额',
  accOpenBills: '未结账单',                accPaidBills: '已付账单',
  accProfitLoss: '损益表',                 accBalanceSheet: '资产负债表',
  accArAging: '应收账款账龄',              accRevenue: '收入',
  accCostOfSales: '销售成本',              accGrossProfit: '毛利润',
  accOperatingExpenses: '营业费用',         accOperatingProfit: '营业利润',
  accNetIncome: '净利润',                  accAssets: '资产',
  accCurrentAssets: '流动资产',            accNonCurrentAssets: '非流动资产',
  accLiabilities: '负债',                 accCurrentLiabilities: '流动负债',
  accEquity: '所有者权益',                 accTotalAssets: '资产总计',
  accTotalLiabilities: '负债总计',          accTotalEquity: '权益总计',
  accAgingCurrent: '当期 (0-30天)',          accAging30: '31-60 天',
  accAging60: '61-90 天',                  accAging90: '90天以上',
  accDaysOutstanding: '逾期天数',
  accStatementTitle: '客户对账单',
  accSelectCustomer: '选择客户',           accTotalBilled: '总开票金额',
  accTotalPaid: '总付款金额',              accExportStatement: '导出 PDF 对账单',
  accStatementDate: '对账单日期',
};

// ── French ─────────────────────────────────────────────────────────────────
const fr: T = {
  appTitle: 'AutoGP Atelier',
  appSubtitle: "Système de Gestion d'Atelier",
  loginTagline: 'Faites avancer votre atelier',
  loginTaglineDesc: "La plateforme de gestion complète pour les ateliers automobiles modernes — de la première inspection à la dernière facture.",
  loginWelcome: 'Bon retour',
  loginSubtitle: 'Connectez-vous pour accéder à votre tableau de bord',
  loginEmail: 'Adresse e-mail',
  loginPassword: 'Mot de passe',
  loginSignIn: 'Se connecter',
  loginSigningIn: 'Connexion…',
  loginError: 'E-mail ou mot de passe invalide. Essayez un compte de démonstration ci-dessous.',
  loginDemoAccounts: 'Comptes de démonstration',
  loginDemoHint: 'Cliquez sur une carte pour remplir les identifiants, puis connectez-vous',
  loginFeature1: "Gestion complète des travaux d'atelier",
  loginFeature2: 'KPIs et analyses en temps réel',
  loginFeature3: "Contrôle d'accès basé sur les rôles",
  loginFeature4: 'Interface rapide et multilingue',
  loginBadge: 'Conforme GAAP angolais · Prêt pour ISO 9001 · Confidentialité RGPD',
  navDashboard: 'Tableau de bord',         navDashboardDesc: 'Vue d\'ensemble et statistiques',
  navWorkflow: 'Flux de Travail',          navWorkflowDesc: 'Pipeline de la réception à la facturation',
  navAppointments: 'Rendez-vous',          navAppointmentsDesc: 'Réservations et planification',
  navClocking: 'Pointage',                 navClockingDesc: 'Heures des techniciens',
  navInspection: 'Inspection Tour du Véhicule', navInspectionDesc: 'Réception du véhicule et enregistrement des dommages',
  navCustomers: 'Clients',                 navCustomersDesc: 'Gestion des clients',
  navVehicles: 'Véhicules',                navVehiclesDesc: 'Base de données des véhicules',
  navInService: 'En Service',              navInServiceDesc: 'Véhicules à l\'atelier',
  navQuotations: 'Devis et Ordres',        navQuotationsDesc: 'Devis et ordres de travail',
  navParts: 'Pièces et Inventaire',        navPartsDesc: 'Gestion des stocks',
  navMaintenance: 'Packs de Maintenance',  navMaintenanceDesc: 'Packages de tâches et tarifs main-d\'œuvre',
  mntTitle: 'Packs de Maintenance',        mntSubtitle: 'Définir les tâches de main-d\'œuvre standard et les tarifs horaires',
  mntNewPack: 'Nouveau Pack',              mntEditPack: 'Modifier Pack',
  mntPackNumber: 'Numéro de Pack',         mntLabourTasks: 'Tâches de Main-d\'œuvre',
  mntAddTask: 'Ajouter Tâche',             mntHours: 'Heures',
  mntRatePerHour: 'Tarif / hr (AOA)',      mntTotalHours: 'Total Heures',
  mntTotalAmount: 'Montant Total',         mntActivePacks: 'Packs Actifs',
  mntAllCategories: 'Toutes les Catégories',
  mntFromPack: 'Du Pack',                  mntFromWarehouse: 'De l\'Entrepôt',
  mntAddFullPack: 'Ajouter Pack Complet',  mntAddSelected: 'Ajouter Sélectionnés',
  mntSelectPack: 'Sélectionner Main-d\'œuvre des Packs de Maintenance',
  mntSelectParts: 'Sélectionner Pièces de l\'Entrepôt',
  mntAvailableStock: 'Stock Disponible',
  mntNoPacksFound: 'Aucun pack de maintenance disponible',
  mntNoPartsFound: 'Aucune pièce disponible dans l\'entrepôt',
  mntSearchPacks: 'Rechercher packs...',   mntSearchParts: 'Rechercher pièces...',
  mntInactive: 'inactif',                 mntTotalLabourHours: 'Total Heures Main-d\'œuvre',
  mntAcrossAllPacks: 'tous packs actifs confondus', mntTotalLabourValue: 'Valeur Totale Main-d\'œuvre',
  mntAllActivePacks: 'tous les packs actifs', mntNoPacksList: 'Aucun pack de maintenance trouvé',
  mntCreateFirst: 'Créez votre premier pack pour commencer',
  mntTaskDescription: 'Description de la Tâche', mntDeleteConfirm: 'Supprimer ce pack de maintenance ?',
  mntPackName: 'Nom du Pack',             mntTotals: 'Totaux',
  mntPackActiveDesc: 'Pack actif (disponible lors de la création de devis/ordres)',
  mntSaveChanges: 'Enregistrer les Modifications',
  walTitle: 'Inspection Tour du Véhicule',
  walSubtitle: 'Enregistrer les dommages préexistants lors de la réception d\'un véhicule',
  walNewInspection: 'Nouvelle Inspection', walTotalInspections: 'Total Inspections',
  walDamageItems: 'Éléments de Dommage',  walToday: 'Aujourd\'hui',
  walNoInspections: 'Aucune inspection',  walNoInspectionsDesc: 'Créez-en une lors de la réception d\'un véhicule',
  walNoDamage: 'Aucun dommage',           walNewInspectionTitle: 'Nouvelle Inspection Tour du Véhicule',
  walNewInspectionDesc: 'Marquer tous les dommages préexistants avant le début du travail',
  walChange: 'Modifier',                  walSearchCustomer: 'Rechercher client...',
  walNoCustomersFound: 'Aucun client trouvé', walCustomerName: 'Nom du client',
  walPlate: 'Immatriculation',            walMileage: 'Kilométrage (km)',
  walFuelLevel: 'Niveau de Carburant',   walAddingDamageTo: 'Ajout de dommage sur',
  walDamageType: 'Type de Dommage',      walSeverity: 'Gravité',
  walAddDamage: 'Ajouter Dommage',       walDamageRecords: 'Enregistrements de Dommages',
  walReceivingTechnician: 'Technicien Réceptionnaire',
  walGeneralNotes: 'Notes Générales',
  walGeneralNotesPlaceholder: 'Réclamations client, instructions spéciales...',
  walSaveDraft: 'Enregistrer Brouillon', walComplete: 'Terminer',
  walClickZone: 'Cliquez sur une zone pour marquer un dommage',
  walFront: 'AVANT',                      walRear: 'ARRIÈRE',
  walFuel: 'Carburant',                  walNoDamageRecorded: 'Aucun dommage préexistant enregistré',
  walConditionMap: 'Carte d\'État du Véhicule',
  clkTitle: 'Pointage des Techniciens',
  clkSubtitle: 'Suivi des heures facturables et non facturables par technicien',
  clkCurrentlyClockedIn: 'Actuellement Pointés', clkTotalHours: 'Total Heures',
  clkBillableHours: 'Heures Facturables', clkBillableEfficiency: 'Efficacité de Facturation',
  clkStatusToday: 'Statut Techniciens — Aujourd\'hui',
  clkIn: 'ENT',                           clkOut: 'SOR',
  clkSince: 'Depuis',                     clkNotClockedIn: 'Non pointé',
  clkTodayTotal: 'Aujourd\'hui',          clkClockIn: 'Pointer Entrée',
  clkClockOut: 'Pointer Sortie',         clkTimesheet: 'Feuille de Temps',
  clkNoEntries: 'Aucune entrée pour',     clkDuration: 'Durée',
  clkInProgress: 'En cours',             clkWeeklySummary: 'Résumé Hebdomadaire (7 derniers jours)',
  clkClockedInAt: 'Pointé à',            clkElapsed: 'Écoulé',
  clkClockOutAt: 'Pointer Sortie à',     clkWorkType: 'Type de Travail',
  clkTaskDesc: 'Description de la tâche...', clkClockInAt: 'Pointer Entrée à',
  clkJobWork: 'Travail sur Ordre',       clkGeneral: 'Général',
  clkTraining: 'Formation',              clkBreak: 'Pause',
  navKpis: "KPI de l'Atelier",             navKpisDesc: 'Indicateurs de performance',
  navReporting: 'Rapports',                navReportingDesc: 'Analyses et rapports',
  navAccounting: 'Comptabilité',           navAccountingDesc: 'Système financier',
  navSettings: 'Paramètres',               navSettingsDesc: 'Configuration du système',
  navUsers: 'Utilisateurs et Permissions', navUsersDesc: 'Gérer utilisateurs et rôles',
  navBranches: 'Filiales et Garages',      navBranchesDesc: 'Gérer les emplacements des ateliers',
  dashTitle: 'Tableau de Bord',
  dashSubtitle: "Bienvenue dans le Système de Gestion d'Atelier Automobile",
  dashTotalCustomers: 'Total Clients',
  dashActiveCustomers: 'Clients Actifs',
  dashTotalRevenue: 'Revenus Totaux',
  dashTotalOrders: 'Total Ordres',
  dashRefresh: 'Actualiser',
  dashExportDocs: 'Exporter Docs',
  dashUserGuide: 'Guide Utilisateur PDF',
  dashFromLastMonth: 'par rapport au mois dernier',
  wfTitle: 'Flux de Service',
  wfSubtitle: "Processus complet de la réception du véhicule jusqu'au paiement",
  wfVehiclesActiveToday: 'véhicules actifs aujourd\'hui',
  wfInputs: 'Entrées',
  wfOutputs: 'Sorties',
  wfStepByStep: 'Actions étape par étape',
  wfDocument: 'Document',
  wfAlsoTouches: 'Implique aussi',
  wfVehiclesAtStage: 'Véhicules à cette étape',
  wfNoVehicles: 'Aucun véhicule à cette étape pour le moment',
  wfLivePipeline: 'Pipeline en direct',
  wfSystemModules: 'Modules système',
  wfReferenceTitle: 'Référence complète du flux de travail',
  wfColStep: 'Étape',
  wfColStage: 'Phase',
  wfColModule: 'Module Système',
  wfColStatus: 'Statut / Phase',
  wfPrevious: 'Précédent',
  wfNext: 'Suivant',
  wfOf: 'sur',
  wfOpen: 'Ouvrir',
  save: 'Enregistrer',         cancel: 'Annuler',           delete: 'Supprimer',
  edit: 'Modifier',            add: 'Ajouter',              create: 'Créer',
  update: 'Mettre à jour',     close: 'Fermer',             open: 'Ouvrir',
  view: 'Voir',                confirm: 'Confirmer',        search: 'Rechercher',
  filter: 'Filtrer',           export: 'Exporter',          exportCSV: 'Exporter CSV',
  exportExcel: 'Exporter Excel', exportPDF: 'Exporter PDF', print: 'Imprimer',
  refresh: 'Actualiser',       back: 'Retour',              next: 'Suivant',
  previous: 'Précédent',       submit: 'Soumettre',         generate: 'Générer',
  send: 'Envoyer',             approve: 'Approuver',        reject: 'Rejeter',
  record: 'Enregistrer',       selectAll: 'Tout sélectionner', clearAll: 'Tout effacer',
  noData: 'Aucune donnée trouvée', loading: 'Chargement...', optional: 'facultatif',
  required: 'obligatoire',     all: 'Tous',                 yes: 'Oui',
  no: 'Non',                   warning: 'Avertissement',
  name: 'Nom',                 firstName: 'Prénom',         lastName: 'Nom de famille',
  email: 'E-mail',             phone: 'Téléphone',          whatsapp: 'WhatsApp',
  address: 'Adresse',          city: 'Ville',               company: 'Entreprise',
  notes: 'Notes',              description: 'Description',  reference: 'Référence',
  date: 'Date',                dueDate: "Date d'échéance",  status: 'Statut',
  actions: 'Actions',          total: 'Total',              subtotal: 'Sous-total',
  vat: 'TVA (14%)',            balance: 'Solde',            amount: 'Montant',
  quantity: 'Qté',             unitPrice: 'Prix Unitaire',  customer: 'Client',
  vehicle: 'Véhicule',         technician: 'Technicien',    invoice: 'Facture',
  quotation: 'Devis',          job: 'Ordre de Travail',     bill: 'Facture Fournisseur',
  payment: 'Paiement',         category: 'Catégorie',       supplier: 'Fournisseur',
  from: 'De',                  to: 'À',                     type: 'Type',
  period: 'Période',           tags: 'Étiquettes',          vatNumber: 'N° TVA',
  idNumber: "N° d'identification",
  statusDraft: 'Brouillon',    statusActive: 'Actif',       statusInactive: 'Inactif',
  statusPending: 'En attente', statusPaid: 'Payé',          statusOverdue: 'En retard',
  statusPartial: 'Partiel',    statusSent: 'Envoyé',        statusApproved: 'Approuvé',
  statusRejected: 'Rejeté',    statusCompleted: 'Terminé',  statusCancelled: 'Annulé',
  statusInProgress: 'En cours', statusExpired: 'Expiré',    statusInvoiced: 'Facturé',
  statusLowStock: 'Stock bas',  statusOutOfStock: 'Rupture de stock', statusInStock: 'En stock',
  crmTitle: 'Gestion de la Relation Client',
  crmSubtitle: 'Gérez votre base clients et vos interactions',
  crmAddCustomer: 'Ajouter un Client',     crmEditCustomer: 'Modifier le Client',
  crmCustomerDetails: 'Détails du Client', crmCustomerSince: 'Client depuis',
  crmLastContact: 'Dernier Contact',       crmTotalSpent: 'Total Dépensé',
  crmVehicles: 'Véhicules',                crmInteractions: 'Interactions',
  crmAddInteraction: 'Ajouter Interaction', crmSearchPlaceholder: 'Rechercher des clients...',
  crmNoCustomers: 'Aucun client trouvé',   crmDeleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce client ?',
  vehTitle: 'Base de Données des Véhicules',
  vehSubtitle: 'Suivre et gérer tous les véhicules enregistrés',
  vehAddVehicle: 'Ajouter un Véhicule',    vehEditVehicle: 'Modifier le Véhicule',
  vehPlate: "Plaque d'immatriculation",    vehVin: 'VIN',
  vehMake: 'Marque',                       vehModel: 'Modèle',
  vehYear: 'Année',                        vehColor: 'Couleur',
  vehEngine: 'Type de Moteur',             vehTransmission: 'Transmission',
  vehMileage: 'Kilométrage',               vehOwner: 'Propriétaire',
  vehServiceHistory: "Historique d'Entretien", vehDissociate: 'Dissocier le Propriétaire',
  vehDissociateTitle: 'Confirmer la Dissociation du Véhicule',
  vehDissociateDesc: "Pour éviter les erreurs, saisissez la plaque d'immatriculation pour confirmer :",
  vehDissociatePlaceholder: "Saisissez la plaque d'immatriculation pour confirmer",
  vehFirstRegistered: 'Première Immatriculation', vehNoVehicles: 'Aucun véhicule trouvé',
  visTitle: 'Véhicules en Service',
  visSubtitle: "Suivi des véhicules actuellement à l'atelier",
  visAllVehicles: 'Tous les Véhicules',    visOnBay: 'Sur Pont',
  visDiagnosis: 'Diagnostic',              visQualityControl: 'Contrôle Qualité',
  visWashing: 'Lavage',                    visWaitingCollection: 'En attente de collecte',
  visAssignedTech: 'Technicien Assigné',   visEstimatedCompletion: 'Fin Estimée',
  visPriority: 'Priorité',                 visPriorityNormal: 'Normal',
  visPriorityUrgent: 'Urgent',             visPriorityVip: 'VIP',
  visStage: 'Étape',                       visNoVehicles: 'Aucun véhicule en service',
  aptTitle: 'Rendez-vous',
  aptSubtitle: "Planifier et gérer les rendez-vous de l'atelier",
  aptNew: 'Nouveau Rendez-vous',           aptDate: 'Date',
  aptTime: 'Heure',                        aptBay: 'Pont',
  aptServiceType: 'Type de Service',       aptDuration: 'Durée',
  aptJobCard: 'Ordre de Travail',          aptOpenJobCard: "Ouvrir l'Ordre de Travail",
  aptCloseJob: 'Clôturer et Générer Facture', aptGenerateInvoice: 'Générer Facture',
  aptLabour: 'Main-d\'œuvre',              aptParts: 'Pièces',
  aptAddLabour: "Ajouter Main-d'œuvre",    aptAddPart: 'Ajouter Pièce',
  aptQuotation: 'Devis',                   aptSendQuotation: 'Envoyer Devis',
  aptConfirmed: 'Confirmé',                aptPending: 'En attente',
  aptInProgress: 'En cours',               aptCompleted: 'Terminé',
  aptCancelled: 'Annulé',                  aptNoAppointments: 'Aucun rendez-vous trouvé',
  aptSelectCustomer: 'Sélectionner ou rechercher un client',
  aptSelectVehicle: 'Sélectionner un véhicule',
  aptCreateCustomer: '+ Créer un nouveau client',
  aptCreateVehicle: '+ Ajouter un nouveau véhicule',
  quoTitle: 'Devis et Ordres',
  quoSubtitle: "Gérer les devis, ordres de travail et factures",
  quoNew: 'Nouveau Devis',                 quoValidUntil: "Valable jusqu'au",
  quoJobNumber: "N° d'Ordre",              quoAddItem: 'Ajouter un Article',
  quoLabour: "Main-d'œuvre",              quoParts: 'Pièces',
  quoSend: 'Envoyer et Exporter PDF',      quoApprove: 'Approuver',
  quoConvertToJob: "Convertir en Ordre",   quoConvertToInvoice: 'Convertir en Facture',
  quoSaveDraft: 'Enregistrer Brouillon',   quoNoItems: "Aucun article ajouté",
  quoNoQuotations: 'Aucun devis trouvé',   quoVehicleDetails: 'Détails du Véhicule',
  parTitle: 'Pièces et Inventaire',
  parSubtitle: 'Gérer les stocks, seuils de réappro et fournisseurs',
  parAddPart: 'Ajouter une Pièce',         parEditPart: 'Modifier la Pièce',
  parPartNumber: 'Référence de Pièce',     parStockLevel: 'Niveau de Stock',
  parReorderPoint: 'Seuil de Réappro',     parLocation: 'Emplacement',
  parCostPrice: 'Prix de Revient',         parSellingPrice: 'Prix de Vente',
  parLowStock: 'Stock Bas',                parOutOfStock: 'Rupture de Stock',
  parInStock: 'En Stock',                  parNoParts: 'Aucune pièce trouvée',
  parSearchPlaceholder: 'Rechercher des pièces...',
  kpiTitle: "KPI de l'Atelier",
  kpiSubtitle: "Indicateurs clés de performance de l'atelier",
  kpiEfficiency: 'Efficience',             kpiProductivity: 'Productivité',
  kpiEffectiveness: 'Efficacité',          kpiRevenue: 'Revenus',
  kpiJobsCompleted: 'Ordres Terminés',     kpiAvgJobValue: 'Valeur Moy. par Ordre',
  kpiUtilization: 'Taux Utilisation Ponts', kpiTarget: 'Objectif',
  kpiActual: 'Réel',                       kpiVariance: 'Écart',
  kpiTechnician: 'Technicien',             kpiHoursWorked: 'Heures Travaillées',
  kpiBillableHours: 'Heures Facturables',  kpiThisMonth: 'Ce Mois',
  kpiLastMonth: 'Mois Dernier',            kpiThisYear: 'Cette Année',
  accTitle: 'Comptabilité',
  accSubtitle: 'Gestion financière — PCGA Angolais (SNC)',
  accAccounts: 'Comptes',                  accJournal: 'Journal',
  accTrialBalance: 'Balance',              accGeneralLedger: 'Grand Livre',
  accPeriodClose: 'Clôture de Période',    accExchangeRates: 'Taux de Change',
  accInvoices: 'Factures (CR)',            accBills: 'Factures (CF)',
  accReports: 'Rapports',                  accStatements: 'Relevés',
  accInvoiceTitle: 'Registre Factures — Comptes Clients',
  accInvoiceSubtitle: 'Suivi des factures clients, paiements et soldes',
  accOutstanding: 'Total Impayé',          accOverdue: 'En Retard',
  accCollected: 'Encaissé',                accRecordPayment: 'Enregistrer Paiement',
  accPaymentMethod: 'Mode de Paiement',    accBankTransfer: 'Virement Bancaire',
  accCash: 'Espèces',                      accCard: 'Carte',
  accMobileMoney: 'Mobile Money',          accCheque: 'Chèque',
  accInvoiceNumber: 'N° Facture',          accAmountPaid: 'Payé',
  accOpenInvoices: 'factures impayées',    accPaidInvoices: 'factures payées',
  accBillsTitle: 'Registre Factures — Comptes Fournisseurs',
  accBillsSubtitle: 'Gérer les factures fournisseurs et paiements',
  accNewBill: 'Nouvelle Facture',          accVendor: 'Fournisseur',
  accBillNumber: 'N° Facture',             accTotalPayable: 'Total à Payer',
  accOpenBills: 'factures impayées',       accPaidBills: 'factures payées',
  accProfitLoss: 'Compte de Résultat',     accBalanceSheet: 'Bilan',
  accArAging: 'Balance Âgée Clients',      accRevenue: 'Produits',
  accCostOfSales: 'Coût des Ventes',       accGrossProfit: 'Résultat Brut',
  accOperatingExpenses: "Charges d'Exploitation", accOperatingProfit: "Résultat d'Exploitation",
  accNetIncome: 'Résultat Net',            accAssets: 'Actif',
  accCurrentAssets: 'Actif Circulant',     accNonCurrentAssets: 'Actif Immobilisé',
  accLiabilities: 'Passif',               accCurrentLiabilities: 'Passif Circulant',
  accEquity: 'Capitaux Propres',           accTotalAssets: 'Total Actif',
  accTotalLiabilities: 'Total Passif',     accTotalEquity: 'Total Capitaux Propres',
  accAgingCurrent: 'Courant (0-30j)',       accAging30: '31-60 Jours',
  accAging60: '61-90 Jours',               accAging90: '90+ Jours',
  accDaysOutstanding: 'Jours Impayés',
  accStatementTitle: 'Relevés de Compte Client',
  accSelectCustomer: 'Sélectionner un Client', accTotalBilled: 'Total Facturé',
  accTotalPaid: 'Total Payé',              accExportStatement: 'Exporter Relevé PDF',
  accStatementDate: 'Date du Relevé',
};

export const translations: Record<Language, T> = { en, pt, es, zh, fr };
