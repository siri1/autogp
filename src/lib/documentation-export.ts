import { jsPDF } from 'jspdf';

export const exportSystemDocumentation = () => {
  const doc = new jsPDF();
  let yPos = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const maxWidth = 170;

  // Helper function to add text with auto-pagination
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    const lines = doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, margin, yPos);
      yPos += fontSize * 0.5;
    });

    yPos += 3;
  };

  const addHeading = (text: string, level: number = 1) => {
    yPos += 5;
    const fontSize = level === 1 ? 18 : level === 2 ? 14 : 12;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');

    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.text(text, margin, yPos);
    yPos += fontSize * 0.8;
  };

  const addBullet = (text: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }

    doc.text('•', margin + 5, yPos);
    const lines = doc.splitTextToSize(text, maxWidth - 10);
    lines.forEach((line: string, index: number) => {
      doc.text(line, margin + 12, yPos);
      if (index < lines.length - 1) {
        yPos += 5;
      }
    });
    yPos += 7;
  };

  const addSection = () => {
    yPos += 3;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, margin + maxWidth, yPos);
    yPos += 8;
  };

  // Title Page
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Automotive Workshop Management System', 105, 50, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Complete System Documentation', 105, 65, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString('pt-AO')}`, 105, 80, { align: 'center' });

  doc.setFontSize(10);
  doc.text('© 2024 Automotive Workshop System', 105, 260, { align: 'center' });
  doc.text('Based on Angolan GAAP Accounting Standards', 105, 270, { align: 'center' });

  // Table of Contents
  doc.addPage();
  yPos = 20;
  addHeading('Table of Contents', 1);
  addText('1.  System Overview', 12, true);
  addText('2.  Workshop KPIs & Performance Management', 12, true);
  addText('3.  Technician Management', 12, true);
  addText('4.  Power BI Integration Guide', 12, true);
  addText('5.  Advanced Excel Reports Guide', 12, true);
  addText('6.  Chart of Accounts (Angolan GAAP)', 12, true);
  addText('7.  Accounting System', 12, true);
  addText('8.  Multi-Currency Management', 12, true);
  addText('9.  Period-End Closing Procedures', 12, true);
  addText('10. System Features Summary', 12, true);
  addText('11. Branches & Garages Module', 12, true);
  addText('12. Role-Based Access Control', 12, true);
  addText('13. Multi-Tenant Platform & SuperAdmin', 12, true);

  // SECTION 1: System Overview
  doc.addPage();
  yPos = 20;
  addHeading('1. SYSTEM OVERVIEW', 1);

  addText('The Automotive Workshop Management System is a comprehensive solution designed for automotive repair shops in Angola, featuring complete business management and accounting capabilities.');

  addSection();
  addHeading('Key Modules', 2);
  addBullet('Workshop Performance KPIs - Real-time metrics and performance tracking');
  addBullet('Technician Management - Individual performance tracking, job history, and comparisons');
  addBullet('Customer Management - Complete customer database with service history');
  addBullet('Accounting System - Full Angolan GAAP compliant accounting');
  addBullet('Reporting & Analytics - Power BI integration and Excel exports');
  addBullet('Multi-Currency - Support for AOA, USD, and EUR');
  addBullet('Branches & Garages - Multi-location branch management per tenant');
  addBullet('Role-Based Access Control - 7 roles with per-module permissions');
  addBullet('Multi-Tenant Platform - SuperAdmin manages all workshop instances');

  addSection();
  addHeading('System Requirements', 2);
  addBullet('Modern web browser (Chrome, Firefox, Safari, Edge)');
  addBullet('Internet connection for cloud features');
  addBullet('Excel for viewing exported reports');
  addBullet('Power BI Desktop/Service for BI reports (optional)');

  // SECTION 2: Workshop KPIs
  doc.addPage();
  yPos = 20;
  addHeading('2. WORKSHOP KPIs & PERFORMANCE MANAGEMENT', 1);

  addText('The system tracks 6 critical KPIs for automotive workshop operations:');

  addSection();
  addHeading('Appointment Fill Rate', 2);
  addText('Measures how efficiently workshop appointments are being filled.');
  addText('Formula: (Appointments Filled / Total Available Slots) × 100');
  addText('Target: 90% or higher');
  addText('Current Performance: 87.5%');

  addSection();
  addHeading('Revenue Per Technician Per Day', 2);
  addText('Tracks daily revenue generated per technician.');
  addText('Formula: Total Revenue / Number of Active Technicians / Working Days');
  addText('Target: $1,500 per day');
  addText('Current Performance: $1,250 per day');

  addSection();
  addHeading('Overall Workshop Gross Profit %', 2);
  addText('Measures profitability of workshop operations.');
  addText('Formula: (Revenue - Cost of Goods Sold) / Revenue × 100');
  addText('Target: 45% or higher');
  addText('Current Performance: 42.5%');

  addSection();
  addHeading('Technician Efficiency', 2);
  addText('Tracks how efficiently technicians use their time.');
  addText('Formula: (Billable Hours / Total Hours) × 100');
  addText('Target: 95%');
  addText('Current Performance: 92.3%');

  addSection();
  addHeading('Technician Productivity', 2);
  addText('Combined metric of efficiency and effectiveness.');
  addText('Formula: Efficiency × Effectiveness');
  addText('Target: 90%');
  addText('Current Performance: 88.7%');

  addSection();
  addHeading('Bay / Lift Utilization', 2);
  addText('Measures workshop capacity utilization.');
  addText('Formula: (Occupied Hours / Available Hours) × 100');
  addText('Target: 85%');
  addText('Current Performance: 78.4%');

  // SECTION 3: Technician Management
  doc.addPage();
  yPos = 20;
  addHeading('3. TECHNICIAN MANAGEMENT', 1);

  addText('Comprehensive system for managing and tracking technician performance.');

  addSection();
  addHeading('Features', 2);
  addBullet('Individual Performance Tracking - Efficiency, productivity, revenue metrics');
  addBullet('Job History Timeline - Complete record of completed jobs with ratings');
  addBullet('Comparison Mode - Compare 2-3 technicians side-by-side');
  addBullet('Certifications Tracking - ASE, manufacturer certifications, specializations');
  addBullet('Export Reports - Download individual performance reports to Excel');

  addSection();
  addHeading('Technician Drill-Down', 2);
  addText('Click on any KPI card (Revenue, Efficiency, or Productivity) to:');
  addBullet('View ranked list of all technicians by selected metric');
  addBullet('Click individual technician for detailed performance view');
  addBullet('See job history with vehicle details, hours, and customer ratings');
  addBullet('Export individual technician reports');

  addSection();
  addHeading('Comparison Feature', 2);
  addText('To compare technicians:');
  addBullet('Click "Compare Technicians" button');
  addBullet('Select 2-3 technicians using checkboxes');
  addBullet('Click "View Comparison" to see side-by-side metrics');
  addBullet('View summary showing top performers in each category');

  // SECTION 4: Power BI Integration
  doc.addPage();
  yPos = 20;
  addHeading('4. POWER BI INTEGRATION GUIDE', 1);

  addText('The system supports Microsoft Power BI for advanced data visualization and reporting.');

  addSection();
  addHeading('Setup Requirements', 2);
  addBullet('Microsoft Power BI Desktop or Power BI Service');
  addBullet('Azure Active Directory account');
  addBullet('Power BI Embedded workspace');
  addBullet('Valid Power BI Pro or Premium license');

  addSection();
  addHeading('Azure AD App Registration', 2);
  addText('1. Navigate to Azure Portal (portal.azure.com)');
  addText('2. Go to Azure Active Directory > App registrations');
  addText('3. Click "New registration"');
  addText('4. Enter application name and redirect URI');
  addText('5. Copy Application (client) ID and Directory (tenant) ID');
  addText('6. Create client secret under Certificates & secrets');

  addSection();
  addHeading('Power BI Configuration', 2);
  addText('Required environment variables:');
  addBullet('POWERBI_CLIENT_ID - Azure AD Application ID');
  addBullet('POWERBI_CLIENT_SECRET - Azure AD Client Secret');
  addBullet('POWERBI_TENANT_ID - Azure AD Tenant ID');
  addBullet('POWERBI_WORKSPACE_ID - Power BI Workspace ID');
  addBullet('POWERBI_REPORT_ID - Power BI Report ID');

  addSection();
  addHeading('Available Report Types', 2);
  addBullet('Executive Dashboard - High-level KPIs and trends');
  addBullet('Technical Performance - Detailed technician analytics');
  addBullet('Financial Analysis - Revenue, costs, and profitability');
  addBullet('Customer Insights - Customer behavior and satisfaction');
  addBullet('Inventory Management - Parts usage and stock levels');

  // SECTION 5: Excel Reports
  doc.addPage();
  yPos = 20;
  addHeading('5. ADVANCED EXCEL REPORTS GUIDE', 1);

  addText('Professional Excel report generation with multiple sheets and formatting.');

  addSection();
  addHeading('Features', 2);
  addBullet('Multi-Sheet Reports - Organized data by category');
  addBullet('Summary Page - Report metadata and statistics');
  addBullet('Formatted Headers - Color-coded and styled');
  addBullet('Totals Rows - Automatic calculations');
  addBullet('Alternating Rows - Easy-to-read formatting');
  addBullet('Auto Width - Optimized column sizing');

  addSection();
  addHeading('Export Options', 2);
  addBullet('Excel (.xlsx) - Full spreadsheet with formatting');
  addBullet('CSV (.csv) - Comma-separated values');
  addBullet('PDF (.pdf) - Formatted PDF report');
  addBullet('JSON (.json) - Structured data');
  addBullet('Copy to Clipboard - Paste into Excel/Google Sheets');
  addBullet('Print - Print-friendly formatted table');

  addSection();
  addHeading('Report Types', 2);
  addBullet('Customer Analytics Report - Multiple sheets with overview, active, pending, revenue analysis');
  addBullet('Technician Performance - Individual and comparison reports');
  addBullet('Financial Reports - Trial balance, general ledger, period reports');

  // SECTION 6: Chart of Accounts
  doc.addPage();
  yPos = 20;
  addHeading('6. CHART OF ACCOUNTS (ANGOLAN GAAP)', 1);

  addText('Complete accounting structure following Angolan Generally Accepted Accounting Principles (GAAP) and Sistema de Normalização Contabilística.');

  addSection();
  addHeading('Account Structure - 8 Classes', 2);

  addText('CLASS 1 - CAPITAL / EQUITY (Meios Financeiros Líquidos)', 11, true);
  addBullet('101 - Share Capital (Capital Social)');
  addBullet('111 - Legal Reserves (Reservas Legais)');
  addBullet('12 - Retained Earnings (Resultados Transitados)');
  addBullet('13 - Net Income - Current Year (Resultado Líquido do Exercício)');

  addText('CLASS 2 - FIXED ASSETS (Imobilizado)', 11, true);
  addBullet('201 - Land and Buildings (Terrenos e Edifícios)');
  addBullet('202 - Workshop Equipment (Equipamento Oficina)');
  addBullet('203 - Computer Equipment (Equipamento Informático)');
  addBullet('204 - Vehicles (Veículos)');
  addBullet('21 - Accumulated Depreciation (Depreciações Acumuladas)');

  addText('CLASS 3 - INVENTORY (Existências)', 11, true);
  addBullet('301 - Spare Parts (Peças de Reposição)');
  addBullet('302 - Oils and Lubricants (Óleos e Lubrificantes)');
  addBullet('303 - Consumables (Materiais Consumíveis)');

  addText('CLASS 4 - THIRD PARTIES (Terceiros)', 11, true);
  addBullet('401 - Trade Debtors (Clientes c/c)');
  addBullet('411 - Trade Creditors (Fornecedores c/c)');
  addBullet('421 - VAT Payable (IVA a Pagar)');
  addBullet('422 - VAT Recoverable (IVA Dedutível)');
  addBullet('423 - Industrial Tax (Imposto Industrial)');
  addBullet('424 - Social Security (Segurança Social)');
  addBullet('431 - Salaries Payable (Remunerações a Pagar)');

  doc.addPage();
  yPos = 20;

  addText('CLASS 5 - FINANCIAL ACCOUNTS (Meios Financeiros Líquidos)', 11, true);
  addBullet('501 - Cash (Caixa)');
  addBullet('502 - Bank - Current Account (Depósitos à Ordem)');
  addBullet('503 - Bank - USD Account (Depósitos em Moeda Estrangeira)');
  addBullet('51 - Loans (Empréstimos Obtidos)');

  addText('CLASS 6 - COSTS AND EXPENSES (Gastos)', 11, true);
  addBullet('601 - Cost of Parts Sold (Custo de Peças Vendidas)');
  addBullet('602 - Cost of Materials Used (Custo de Materiais Consumidos)');
  addBullet('611 - Salaries and Wages (Remunerações)');
  addBullet('612 - Social Security Charges (Encargos sobre Remunerações)');
  addBullet('621 - Electricity and Water (Eletricidade e Água)');
  addBullet('622 - Rent (Rendas e Alugueres)');
  addBullet('631 - Depreciation - Equipment (Depreciações - Equipamento)');
  addBullet('651 - Bank Charges (Juros e Custos Bancários)');

  addText('CLASS 7 - INCOME (Rendimentos)', 11, true);
  addBullet('701 - Parts Sales (Vendas de Peças)');
  addBullet('711 - Labor Revenue (Serviços de Reparação)');
  addBullet('712 - Diagnostic Services (Serviços de Diagnóstico)');
  addBullet('751 - Interest Income (Juros Obtidos)');
  addBullet('752 - Exchange Rate Gains (Diferenças de Câmbio Favoráveis)');

  // SECTION 7: Accounting System
  doc.addPage();
  yPos = 20;
  addHeading('7. ACCOUNTING SYSTEM', 1);

  addText('Complete double-entry bookkeeping system with Angolan tax compliance.');

  addSection();
  addHeading('Journal Entry Recording', 2);
  addText('To create a new journal entry:');
  addBullet('Click "New Entry" button in Journal tab');
  addBullet('Enter date, reference, and description');
  addBullet('Add journal lines with account, debit, and credit amounts');
  addBullet('System validates that debits equal credits');
  addBullet('Click "Post Transaction" to save');

  addSection();
  addHeading('Invoice Integration', 2);
  addText('Automatically generate accounting entries from invoices:');
  addBullet('Click "From Invoice" button');
  addBullet('System creates entries for: Accounts Receivable, Labor Revenue, Parts Sales, VAT Payable');
  addBullet('Entry is automatically balanced and posted');

  addSection();
  addHeading('Trial Balance', 2);
  addText('Verify accounting accuracy:');
  addBullet('View all accounts with total debits and credits');
  addBullet('System checks if trial balance is in balance');
  addBullet('Export to Excel for analysis');
  addBullet('Running balance shown for each account');

  addSection();
  addHeading('General Ledger', 2);
  addText('View complete transaction history for any account:');
  addBullet('Select account from dropdown');
  addBullet('See all transactions affecting that account');
  addBullet('Running balance updated after each transaction');
  addBullet('Export account ledger to Excel');

  // SECTION 8: Multi-Currency
  doc.addPage();
  yPos = 20;
  addHeading('8. MULTI-CURRENCY MANAGEMENT', 1);

  addText('Support for multiple currencies with automatic conversion.');

  addSection();
  addHeading('Supported Currencies', 2);
  addBullet('AOA (Angolan Kwanza) - Primary currency');
  addBullet('USD (United States Dollar)');
  addBullet('EUR (Euro)');

  addSection();
  addHeading('Exchange Rates', 2);
  addText('Current rates from Banco Nacional de Angola:');
  addBullet('USD to AOA: 825.50');
  addBullet('EUR to AOA: 895.75');
  addBullet('AOA to USD: 0.00121');
  addText('Rates updated: 2024-11-26');

  addSection();
  addHeading('Currency Converter', 2);
  addText('Built-in converter tool for quick calculations:');
  addBullet('Enter amount and select from/to currencies');
  addBullet('Instant conversion using current rates');
  addBullet('Useful for invoice preparation and reporting');

  // SECTION 9: Period Closing
  doc.addPage();
  yPos = 20;
  addHeading('9. PERIOD-END CLOSING PROCEDURES', 1);

  addText('Automated year-end closing process following Angolan GAAP standards.');

  addSection();
  addHeading('Closing Process', 2);
  addText('The system automatically:');
  addBullet('Closes all revenue accounts to zero (Class 7)');
  addBullet('Closes all expense accounts to zero (Class 6)');
  addBullet('Calculates net income (Revenue - Expenses)');
  addBullet('Transfers net income to equity account (Class 13)');
  addBullet('Creates permanent closing journal entry');

  addSection();
  addHeading('How to Execute Closing', 2);
  addBullet('Navigate to "Period Close" tab in Accounting section');
  addBullet('Review current revenue, expenses, and net income');
  addBullet('Click "Execute Period Closing" button');
  addBullet('Confirm the closing action');
  addBullet('System creates closing entries automatically');

  addSection();
  addHeading('Important Notes', 2);
  addBullet('Period closing cannot be undone - make backup first');
  addBullet('All revenue and expense accounts will show zero balance after closing');
  addBullet('Net income transfers to "Net Income (Current Year)" account');
  addBullet('Closing entry reference: CLOSE-[DATE]');
  addBullet('Created by: System (Period Closing)');

  // SECTION 11: Branches & Garages
  doc.addPage();
  yPos = 20;
  addHeading('11. BRANCHES & GARAGES MODULE', 1);

  addText('The Branches & Garages module allows an Administrator to manage multiple physical workshop locations (branches) under a single tenant account. It is accessible only to the Admin role via the Branches & Garages menu item in the sidebar.');

  addSection();
  addHeading('Data Model', 2);
  addBullet('id — unique branch identifier');
  addBullet('name — branch display name');
  addBullet('address — street address');
  addBullet('city — city or district');
  addBullet('phone / email — contact details');
  addBullet('managerName — name of the branch manager');
  addBullet('status — active | inactive');
  addBullet('isMain — boolean flag for the primary/head-office branch');
  addBullet('bayCount — number of service bays');
  addBullet('technicianCount — number of assigned technicians');
  addBullet('createdAt — ISO date of branch creation');
  addBullet('notes — optional internal notes');

  addSection();
  addHeading('Features', 2);
  addBullet('Summary KPIs: Total Branches, Active, Total Bays, Total Technicians (active only)');
  addBullet('Card grid view with status badges and ⭐ Main indicator');
  addBullet('Search by name, city, or manager name');
  addBullet('Add new branch via dialog (with all fields)');
  addBullet('Edit any branch via pre-filled dialog');
  addBullet('Activate / Deactivate toggle per branch');
  addBullet('Delete (blocked for the main branch)');
  addBullet('Main branch protected from deletion');

  addSection();
  addHeading('Source Files', 2);
  addBullet('src/lib/garages.ts — Garage interface, GarageStatus type, SAMPLE_GARAGES');
  addBullet('src/components/GarageManagement.tsx — Full CRUD UI component');
  addBullet('src/lib/auth.ts — "branches" ModuleId added; Admin has full access via "all"');
  addBullet('src/lib/i18n.ts — navBranches / navBranchesDesc keys for all 5 languages');
  addBullet('src/app/page.tsx — menu item (Building2 icon), render case, import');

  // SECTION 12: Role-Based Access Control
  doc.addPage();
  yPos = 20;
  addHeading('12. ROLE-BASED ACCESS CONTROL (RBAC)', 1);

  addText('The system implements role-based access control via ROLE_MODULES in src/lib/auth.ts. Each user is assigned one of 7 roles; the sidebar and module content render only the modules permitted for that role.');

  addSection();
  addHeading('Roles', 2);
  addBullet('superadmin — Platform-level only; accesses Tenant Management exclusively');
  addBullet('admin — Full access to all workshop modules (ROLE_MODULES value: "all")');
  addBullet('service_advisor — Appointments, Inspection, Customers, Vehicles, In-Service, Quotations, Maintenance');
  addBullet('mechanic — Clocking module only');
  addBullet('parts_staff — Parts Inventory, Maintenance Packs');
  addBullet('accountant — Dashboard, Accounting, Quotations, Reports');
  addBullet('manager — Dashboard, Workflow, KPIs, Reports, Customers, Vehicles, In-Service');

  addSection();
  addHeading('Module IDs', 2);
  addText('Full list of ModuleId values in auth.ts:');
  addBullet('dashboard · workflow · appointments · inspection · clocking');
  addBullet('customers · vehicles · in-service · quotations · parts');
  addBullet('maintenance · kpis · reporting · accounting · settings');
  addBullet('users · branches · tenants');

  addSection();
  addHeading('Access Enforcement', 2);
  addBullet('AuthContext.can(module) — returns boolean; used by sidebar to filter menu items');
  addBullet('page.tsx — renders LoginPage if !user; renders TenantManagement if isSuperAdmin(user)');
  addBullet('ROLE_MODULES["admin"] === "all" — canAccess() returns true for all modules');
  addBullet('isSuperAdmin(user) — shorthand check for role === "superadmin"');

  addSection();
  addHeading('Extending RBAC', 2);
  addText('To add a new module or change role permissions:');
  addBullet('Add the new module ID to the ModuleId union type in src/lib/auth.ts');
  addBullet('Add it to the ROLE_MODULES record for the roles that should have access');
  addBullet('Add it to getAllModules() array');
  addBullet('Add MODULE_LABELS entry in UserPermissions.tsx');
  addBullet('Add the menu item to MENU_ITEMS in page.tsx');
  addBullet('Add the render case to renderContent() in page.tsx');
  addBullet('Add translation keys to src/lib/i18n.ts for all 5 languages');

  // SECTION 13: Multi-Tenant Platform
  doc.addPage();
  yPos = 20;
  addHeading('13. MULTI-TENANT PLATFORM & SUPERADMIN', 1);

  addText('AutoGP is built as a multi-tenant SaaS platform. Each Tenant represents an independent workshop business. The SuperAdmin manages tenants at the platform level via a dedicated Tenant Management UI, separate from all workshop functionality.');

  addSection();
  addHeading('Tenant Data Model (src/lib/tenants.ts)', 2);
  addBullet('id / name / slug — unique identifiers');
  addBullet('country / city / phone / email — contact info');
  addBullet('adminName — primary admin user name');
  addBullet('plan — trial | basic | professional | enterprise');
  addBullet('status — active | trial | suspended | expired');
  addBullet('createdAt / trialEndsAt — ISO dates');
  addBullet('userCount / maxUsers — seat usage');
  addBullet('monthlyFee — subscription fee in USD');
  addBullet('notes / logo — optional metadata');

  addSection();
  addHeading('Subscription Plans', 2);
  addBullet('Trial — $0/month, max 3 users, 14-day limit');
  addBullet('Basic — $49/month, max 5 users');
  addBullet('Professional — $149/month, max 15 users');
  addBullet('Enterprise — $399/month, max 50 users');

  addSection();
  addHeading('SuperAdmin Access', 2);
  addText('The SuperAdmin sees a completely separate UI (TenantManagement component) and has no access to any workshop module. The separation is enforced in page.tsx:');
  addBullet('if (!user) → LoginPage');
  addBullet('if (isSuperAdmin(user)) → TenantManagement');
  addBullet('Otherwise → full workshop dashboard with role-filtered sidebar');

  addSection();
  addHeading('Tenant Management Features', 2);
  addBullet('Platform KPI cards: total tenants, active, MRR (USD), suspended');
  addBullet('Tenant list with plan/status filters and name search');
  addBullet('Tenant detail panel: full info, usage metrics, quick actions');
  addBullet('Create, Edit, Suspend/Activate, Delete tenants');
  addBullet('Plan badges and status badges with colour coding');

  addSection();
  addHeading('Source Files', 2);
  addBullet('src/lib/tenants.ts — Tenant, PlanConfig, StatusConfig, SAMPLE_TENANTS, getPlatformMetrics');
  addBullet('src/components/TenantManagement.tsx — Full SuperAdmin UI');
  addBullet('src/lib/auth.ts — isSuperAdmin(), ROLE_MODULES.superadmin = ["tenants"]');
  addBullet('src/contexts/AuthContext.tsx — login, can(), hydration from localStorage');

  // SECTION 10: Features Summary
  doc.addPage();
  yPos = 20;
  addHeading('10. SYSTEM FEATURES SUMMARY', 1);

  addSection();
  addHeading('Dashboard & Reporting', 2);
  addBullet('Real-time KPI tracking');
  addBullet('Customer analytics');
  addBullet('Export to Excel, CSV, PDF, JSON');
  addBullet('Power BI integration');
  addBullet('Print-friendly reports');

  addSection();
  addHeading('Technician Management', 2);
  addBullet('Individual performance tracking');
  addBullet('Job history timeline');
  addBullet('Comparison mode (2-3 technicians)');
  addBullet('Certifications tracking');
  addBullet('Performance reports export');

  addSection();
  addHeading('Accounting Features', 2);
  addBullet('Chart of Accounts (70+ accounts)');
  addBullet('Double-entry bookkeeping');
  addBullet('Journal entry recording');
  addBullet('Invoice integration');
  addBullet('Trial balance');
  addBullet('General ledger');
  addBullet('Period-end closing');
  addBullet('Multi-currency support');

  addSection();
  addHeading('Branch Management', 2);
  addBullet('Multiple garage/branch locations per tenant');
  addBullet('Branch KPIs: bays, technicians, active count');
  addBullet('Full CRUD with activation/deactivation');
  addBullet('Main branch protection');
  addBullet('Admin-only access');

  addSection();
  addHeading('Access Control & Platform', 2);
  addBullet('7-role RBAC system (superadmin, admin, service_advisor, mechanic, parts_staff, accountant, manager)');
  addBullet('Multi-tenant SaaS platform (SuperAdmin manages all workshop instances)');
  addBullet('4 subscription plans: Trial, Basic, Professional, Enterprise');
  addBullet('Tenant suspension and lifecycle management');

  addSection();
  addHeading('Compliance', 2);
  addBullet('Angolan GAAP compliant');
  addBullet('VAT (IVA) 14% calculation');
  addBullet('Industrial Tax (IRT) 30%');
  addBullet('Social Security (11% + 8%)');
  addBullet('Proper audit trail');

  addSection();
  addHeading('Data Export Capabilities', 2);
  addBullet('Excel reports with multiple sheets');
  addBullet('CSV for data analysis');
  addBullet('PDF formatted reports');
  addBullet('JSON for API integration');
  addBullet('Clipboard copy for quick paste');

  // Angolan Tax Information
  doc.addPage();
  yPos = 20;
  addHeading('ANGOLAN TAX RATES & COMPLIANCE', 1);

  addSection();
  addHeading('VAT (IVA - Imposto sobre o Valor Acrescentado)', 2);
  addBullet('Standard Rate: 14%');
  addBullet('Applied to: Goods and services');
  addBullet('Account Code: 421 (VAT Payable), 422 (VAT Recoverable)');

  addSection();
  addHeading('Industrial Tax (IRT - Imposto Industrial)', 2);
  addBullet('Corporate Tax Rate: 30%');
  addBullet('Applied to: Company profits');
  addBullet('Account Code: 423');

  addSection();
  addHeading('Social Security (Segurança Social)', 2);
  addBullet('Employee Contribution: 11% of gross salary');
  addBullet('Employer Contribution: 8% of gross salary');
  addBullet('Total: 19%');
  addBullet('Account Code: 424');

  addSection();
  addHeading('Financial Year', 2);
  addBullet('Start Date: January 1');
  addBullet('End Date: December 31');
  addBullet('Same as calendar year');

  // Footer
  doc.addPage();
  yPos = 120;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('End of Documentation', 105, yPos, { align: 'center' });

  yPos += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('For support or questions, please contact:', 105, yPos, { align: 'center' });
  yPos += 7;
  doc.text('System Administrator', 105, yPos, { align: 'center' });
  yPos += 7;
  doc.text('support@workshop-system.ao', 105, yPos, { align: 'center' });

  yPos += 20;
  doc.setFontSize(8);
  doc.text(`Document Generated: ${new Date().toLocaleString('pt-AO')}`, 105, yPos, { align: 'center' });
  yPos += 5;
  doc.text('© 2024 Automotive Workshop Management System - All Rights Reserved', 105, yPos, { align: 'center' });

  // Save the PDF
  doc.save('automotive-workshop-system-documentation.pdf');
};
