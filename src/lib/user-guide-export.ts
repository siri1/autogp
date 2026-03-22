import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportUserGuidePDF = () => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = doc.internal.pageSize.width;   // 210
  const PH = doc.internal.pageSize.height;  // 297
  const ML = 18; // margin left
  const MR = 18; // margin right
  const TW = PW - ML - MR; // text width
  let y = 20;

  // ── Colours ────────────────────────────────────────────────────────────────
  const C_BRAND   = [30, 64, 175]   as [number,number,number]; // blue-800
  const C_HEAD2   = [55, 65, 81]    as [number,number,number]; // gray-700
  const C_RULE    = [209, 213, 219] as [number,number,number]; // gray-300
  const C_STRIPE  = [248, 250, 252] as [number,number,number]; // slate-50
  const C_THEAD   = [30, 64, 175]   as [number,number,number]; // blue-800
  const C_BLACK   = [15, 23, 42]    as [number,number,number]; // slate-900

  // ── Helpers ────────────────────────────────────────────────────────────────

  const newPage = () => { doc.addPage(); y = 22; };

  const checkY = (needed = 12) => { if (y + needed > PH - 18) newPage(); };

  const rule = (colour = C_RULE) => {
    doc.setDrawColor(...colour);
    doc.setLineWidth(0.3);
    doc.line(ML, y, ML + TW, y);
    y += 4;
  };

  const h1 = (text: string) => {
    checkY(18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...C_BRAND);
    doc.text(text, ML, y);
    y += 2;
    doc.setDrawColor(...C_BRAND);
    doc.setLineWidth(0.6);
    doc.line(ML, y, ML + TW, y);
    y += 7;
    doc.setTextColor(...C_BLACK);
  };

  const h2 = (text: string) => {
    checkY(12);
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C_HEAD2);
    doc.text(text, ML, y);
    y += 6;
    doc.setTextColor(...C_BLACK);
  };

  const h3 = (text: string) => {
    checkY(9);
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(10);
    doc.setTextColor(...C_HEAD2);
    doc.text(text, ML + 3, y);
    y += 5;
    doc.setTextColor(...C_BLACK);
  };

  const body = (text: string, indent = 0) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...C_BLACK);
    const lines = doc.splitTextToSize(text, TW - indent);
    lines.forEach((line: string) => {
      checkY(6);
      doc.text(line, ML + indent, y);
      y += 5;
    });
  };

  const bullet = (text: string, indent = 4) => {
    checkY(6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...C_BLACK);
    doc.text('•', ML + indent, y);
    const lines = doc.splitTextToSize(text, TW - indent - 6);
    lines.forEach((line: string, i: number) => {
      checkY(6);
      doc.text(line, ML + indent + 5, y);
      if (i < lines.length - 1) y += 5;
    });
    y += 5.5;
  };

  const step = (n: number, text: string) => {
    checkY(6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...C_BRAND);
    doc.text(`${n}.`, ML + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C_BLACK);
    const lines = doc.splitTextToSize(text, TW - 14);
    lines.forEach((line: string, i: number) => {
      checkY(6);
      doc.text(line, ML + 11, y);
      if (i < lines.length - 1) y += 5;
    });
    y += 5.5;
  };

  const gap = (n = 3) => { y += n; };

  const table = (head: string[], rows: string[][], opts?: Record<string, unknown>) => {
    checkY(20);
    autoTable(doc, {
      startY: y,
      head: [head],
      body: rows,
      margin: { left: ML, right: MR },
      tableWidth: TW,
      headStyles: {
        fillColor: C_THEAD,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        cellPadding: 2,
        textColor: C_BLACK,
      },
      alternateRowStyles: { fillColor: C_STRIPE },
      styles: { overflow: 'linebreak' },
      ...opts,
    });
    y = (doc as any).lastAutoTable.finalY + 5;
  };

  const pageFooter = () => {
    const total = (doc as any).getNumberOfPages?.() ?? doc.internal.pages.length - 1;
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      doc.text('AutoGP Workshop Management System — User Guide', ML, PH - 8);
      doc.text(`Page ${i} of ${total}`, PW - MR, PH - 8, { align: 'right' });
      doc.setTextColor(...C_BLACK);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  doc.setFillColor(...C_BRAND);
  doc.rect(0, 0, PW, 70, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('AutoGP', PW / 2, 30, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Workshop Management System', PW / 2, 42, { align: 'center' });

  doc.setFontSize(13);
  doc.text('User Guide', PW / 2, 54, { align: 'center' });

  doc.setTextColor(...C_BLACK);
  y = 90;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('This guide covers every module and workflow in the AutoGP system,', PW / 2, y, { align: 'center' });
  y += 7;
  doc.text('from booking the first appointment to closing the monthly accounts.', PW / 2, y, { align: 'center' });

  y = 130;
  table(
    ['Property', 'Value'],
    [
      ['Currency', 'Angolan Kwanza (Kz / AOA)'],
      ['VAT Rate', '14% (standard)'],
      ['Accounting Standard', 'Angolan GAAP — SNC'],
      ['Supported Languages', 'English · Português · Español · 中文 · Français'],
      ['Date Generated', new Date().toLocaleDateString('pt-AO')],
    ],
    { tableWidth: 130, margin: { left: (PW - 130) / 2, right: (PW - 130) / 2 } }
  );

  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text('© 2026 AutoGP — Angolan GAAP Compliant', PW / 2, PH - 12, { align: 'center' });
  doc.setTextColor(...C_BLACK);

  // ═══════════════════════════════════════════════════════════════════════════
  // TABLE OF CONTENTS
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('Table of Contents');
  const toc = [
    ['1', 'Getting Started', 'Language switcher, navigation overview'],
    ['2', 'Dashboard', 'Stats cards, quick access, exports'],
    ['3', 'Appointments & Scheduling', 'Booking, job cards, quotations, calendar view'],
    ['4', 'Quotations & Jobs', 'Quote → Job → Invoice lifecycle'],
    ['5', 'Customer CRM', 'Customer profiles, vehicles, service history, activity log'],
    ['6', 'Vehicle Database', 'Vehicle registry, service history, owner management'],
    ['7', 'Vehicles in Service', 'Workshop floor board, stages, overdue alerts'],
    ['8', 'Parts & Inventory', 'Catalog, stock movements, suppliers, reorder alerts'],
    ['9', 'Workshop KPIs', 'Performance metrics, technician drill-down, comparison'],
    ['10', 'Accounting', 'All 10 accounting tabs — AR, AP, reports, statements'],
    ['11', 'Key Workflows', 'Four end-to-end workflows with step-by-step instructions'],
    ['12', 'Exports Reference', 'Every export type, format, and content summary'],
    ['13', 'Status & Format Reference', 'All status values, number formats, currency rules'],
  ];
  table(['§', 'Module', 'Topics Covered'], toc);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. GETTING STARTED
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('1. Getting Started');

  h2('Sidebar Navigation');
  body('The sidebar on the left contains all navigation. Click any menu item to switch modules. The sidebar can be collapsed on smaller screens using the ☰ button at the top.');
  gap();
  table(
    ['Menu Item', 'Description'],
    [
      ['Dashboard', 'Overview statistics and quick access'],
      ['Appointments', 'Booking, scheduling, job cards and quotations'],
      ['Time Clocking', 'Technician hours — coming soon'],
      ['Customers', 'Full CRM — customer profiles and history'],
      ['Vehicles', 'Vehicle registry and service history'],
      ['In Service', 'Workshop floor board — live vehicle tracking'],
      ['Quotations & Jobs', 'Quote-to-invoice workflow'],
      ['Parts & Inventory', 'Stock management and suppliers'],
      ['Workshop KPIs', 'Performance metrics and technician analytics'],
      ['Reports', 'Analytics and reporting'],
      ['Accounting', '10-tab financial management system'],
      ['Settings', 'System configuration — coming soon'],
    ]
  );

  h2('Language Selection');
  body('The language switcher is at the bottom of the sidebar. Click the globe button to open the menu and choose your language. Your preference is saved in the browser.');
  gap();
  table(
    ['Flag', 'Language', 'Code'],
    [
      ['🇬🇧', 'English', 'en'],
      ['🇦🇴', 'Português', 'pt'],
      ['🇪🇸', 'Español', 'es'],
      ['🇨🇳', '中文 (Mandarin)', 'zh'],
      ['🇫🇷', 'Français', 'fr'],
    ]
  );
  body('Note: Only the interface labels change language. Data (names, plates, part numbers) is not translated.');

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('2. Dashboard');

  h2('Statistics Cards');
  table(
    ['Card', 'What It Shows'],
    [
      ['Total Customers', 'Total number of customers in the CRM'],
      ['Active Customers', 'Customers with status "active" or "vip"'],
      ['Total Revenue', 'Sum of all completed job totals (Kz)'],
      ['Total Orders', 'Total number of jobs across all statuses'],
    ]
  );
  body('Each card displays a percentage change compared to last month.');

  h2('Quick Access Cards');
  body('Six cards provide one-click navigation to the most-used modules: Appointment Booking, Quotations & Jobs, Customer Management, Parts & Inventory, Workshop KPIs, and Accounting.');

  h2('Header Actions');
  table(
    ['Button', 'Action'],
    [
      ['Refresh', 'Reloads customer data from the database'],
      ['Export Docs', 'Generates and downloads the system technical documentation PDF'],
      ['User Guide PDF', 'Downloads this user guide as a PDF'],
    ]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. APPOINTMENTS
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('3. Appointments & Scheduling');

  h2('Appointment Statuses');
  table(
    ['Status', 'Colour', 'Meaning'],
    [
      ['Scheduled', 'Blue', 'Booking received, not yet confirmed'],
      ['Confirmed', 'Green', 'Customer and workshop confirmed'],
      ['In Progress', 'Orange', 'Work has started'],
      ['Completed', 'Emerald', 'Work finished'],
      ['Cancelled', 'Red', 'Appointment cancelled'],
      ['No-Show', 'Grey', 'Customer did not arrive'],
    ]
  );

  h2('Creating a New Appointment');
  body('Click New Appointment. The dialog opens in three steps:');
  gap(2);
  h3('Step 1 — Date & Time');
  bullet('Date — select the appointment date');
  bullet('Time — choose from hourly slots (08:00–17:00)');
  bullet('Duration — estimated job duration in hours (0.5 increments)');
  gap();
  h3('Step 2 — Customer & Vehicle');
  bullet('Search by name, phone, or company name; click to select');
  bullet('If the customer does not exist, click Create new customer (First Name, Last Name, Phone, Email)');
  bullet('Once a customer is selected their linked vehicles appear; select or create a new one (Make, Model, Plate, Year)');
  gap();
  h3('Step 3 — Service Details');
  table(
    ['Field', 'Required', 'Notes'],
    [
      ['Service Type', '✓', 'Oil Change, Brake Service, Tire Service, Engine Diagnostic, Transmission, Air Conditioning, Electrical, Suspension, General Inspection, Other'],
      ['Description', '✓', 'Free-text description of requested work'],
      ['Bay Number', '—', 'Workshop bay to assign'],
      ['Estimated Cost', '—', 'Approximate cost in Kz'],
      ['Notes', '—', 'Internal notes'],
    ]
  );

  h2('Appointment Actions');
  table(
    ['Button', 'Appears When', 'Action'],
    [
      ['Confirm', 'Status = Scheduled', 'Moves to Confirmed'],
      ['Start', 'Scheduled or Confirmed', 'Moves to In Progress'],
      ['Complete', 'In Progress', 'Moves to Completed'],
      ['Quotation', 'Status ≠ Cancelled', 'Opens Quotation dialog'],
      ['Open Job Card', 'Confirmed or In Progress', 'Opens Job Card dialog'],
      ['View Job Card', 'Completed (job exists)', 'Opens saved Job Card'],
      ['Cancel', 'Not Completed or Cancelled', 'Cancels appointment'],
    ]
  );

  newPage();
  h2('Job Card Dialog');
  body('A Job Card is the internal work order — it tracks what was done and calculates the billable amount.');
  gap(2);
  h3('Labour Table — columns: Description · Hours · Rate (Kz) · Total');
  bullet('Click Add Labour to add a labour line');
  h3('Parts Table — columns: Part # · Description · Qty · Unit Price · Total');
  bullet('Click Add Part to add a parts line');
  body('Subtotal, VAT 14%, and Total are auto-calculated and updated in real time.');
  gap();
  table(
    ['Button', 'Action'],
    [
      ['Cancel', 'Close without saving'],
      ['Save Job Card', 'Save current state, keep dialog open'],
      ['Close Job & Generate Invoice', 'Mark job completed, export PDF invoice, post accounting entry'],
    ]
  );

  h2('Quotation Dialog');
  table(
    ['Button', 'Action'],
    [
      ['Cancel', 'Discard changes'],
      ['Save Draft', 'Save in draft status'],
      ['Send & Export PDF', 'Export PDF, set status to Sent'],
      ['Approve', 'Mark quotation as approved'],
    ]
  );

  h2('Calendar View');
  body('Switch to the Calendar tab and select a date to see all appointments for that day sorted by time. Each entry shows time, duration, customer, vehicle, service type, technician, and status badge.');

  h2('Exporting');
  body('Click Export Excel to download all appointments: Appointment #, Date, Time, Customer, Phone, Vehicle, Service Type, Technician, Bay, Status, Estimated Cost, Job Card ref, Quotation ref.');

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. QUOTATIONS & JOBS
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('4. Quotations & Jobs');

  h2('Statistics Cards');
  table(
    ['Card', 'Shows'],
    [
      ['Quotations', 'Total quotations; number approved'],
      ['In Progress', 'Active and pending jobs'],
      ['Completed', 'Jobs ready to invoice'],
      ['Total Value', 'Sum of all job totals (Kz)'],
    ]
  );

  h2('Quotation Statuses');
  table(
    ['Status', 'Meaning'],
    [
      ['Draft', 'Created, not sent to customer'],
      ['Sent', 'Customer has received the quotation'],
      ['Approved', 'Customer has accepted the price'],
      ['Rejected', 'Customer declined'],
      ['Expired', 'Validity date passed without response'],
    ]
  );

  h2('Creating a New Quotation');
  body('Click New Quotation. Use the same customer/vehicle picker as Appointments (search existing or create inline). Each line item requires: Description, Type (Labour or Part), Quantity (or hours), Unit Price (Kz). Subtotal, VAT 14%, and Total update in real time.');
  gap();
  table(
    ['Button', 'Action'],
    [
      ['Create Quotation', 'Save as draft'],
      ['Send & Export PDF', 'Export PDF, mark as Sent'],
      ['Approve', 'Mark as Approved'],
      ['Convert to Job', 'Create a job from this quotation'],
    ]
  );

  h2('Job Statuses');
  table(
    ['Status', 'Meaning'],
    [
      ['Pending', 'Created, work not yet started'],
      ['In Progress', 'Actively being worked on'],
      ['Completed', 'Work finished, invoice not yet issued'],
      ['Invoiced', 'Invoice has been generated'],
    ]
  );

  h2('Converting Quotation → Job → Invoice');
  step(1, 'Once a quotation is approved, click Convert to Job on the quotation row. The system creates a new Job (JOB-2026-XXX) copying all line items, status set to Pending.');
  step(2, 'Progress the job to Completed as work is done.');
  step(3, 'Click Generate Invoice. The system creates an invoice (INV-2026-XXX), sets the job to Invoiced, posts the accounting entry, and exports the PDF.');

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. CRM
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('5. Customer Relationship Management (CRM)');

  h2('Customer Statuses');
  table(
    ['Status', 'Colour', 'Meaning'],
    [
      ['Active', 'Green', 'Regular customer'],
      ['VIP', 'Purple', 'Premium / high-value customer'],
      ['Prospect', 'Blue', 'Potential new customer'],
      ['Inactive', 'Grey', 'Not recently active'],
      ['Blacklisted', 'Red', 'Problem customer — handle with caution'],
    ]
  );

  h2('Customer List View');
  body('Columns: Name · Status · Email · Phone · Company · City · Customer Since · Last Contact.');
  bullet('Search: filter by name, email, phone, company, or ID number');
  bullet('Status filter dropdown');
  bullet('Sort by: Name, Status, Customer Since, Last Contact, or City (asc/desc)');
  bullet('Pagination: 25 customers per page');

  h2('Adding a New Customer');
  table(
    ['Field', 'Required'],
    [
      ['First Name', '✓'],
      ['Last Name', '✓'],
      ['Phone', '✓'],
      ['WhatsApp', '—'],
      ['Email', '—'],
      ['Company', '—'],
      ['VAT Number', '—'],
      ['ID Number', '—'],
      ['Address', '—'],
      ['City', '—'],
      ['Status', '✓ (default: Prospect)'],
      ['Preferred Contact', '✓ (Phone / WhatsApp / Email)'],
    ]
  );

  h2('Customer Detail Tabs');
  table(
    ['Tab', 'Content'],
    [
      ['Profile', 'All customer fields — click Edit to modify; Save or Cancel'],
      ['Vehicles', 'Linked vehicles; Associate Vehicle; Remove association'],
      ['Service History', 'All service records across all vehicles (Job#, Date, Service, Technician, Status, Costs, Total)'],
      ['Activity', 'Chronological interaction log — Add note with type (Call, Email, Visit, WhatsApp, Note)'],
    ]
  );

  h2('Customer Summary Strip (top of detail view)');
  table(
    ['Card', 'Shows'],
    [
      ['Vehicles', 'Count of registered vehicles'],
      ['Total Services', 'All completed service records'],
      ['Active Jobs', 'Jobs currently in progress'],
      ['Total Spent', 'Lifetime spend in Kz'],
    ]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. VEHICLE DATABASE
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('6. Vehicle Database');

  h2('Vehicle List View');
  body('Columns: Plate · Make/Model · Year · Owner · Mileage · Engine · Transmission · Actions. Search by plate, make, model, owner name, or VIN.');

  h2('Adding a New Vehicle');
  table(
    ['Field', 'Required', 'Notes'],
    [
      ['License Plate', '✓', 'Auto-uppercased'],
      ['VIN', '—', 'Vehicle Identification Number'],
      ['Make', '✓', 'e.g. Toyota'],
      ['Model', '✓', 'e.g. Hilux'],
      ['Year', '✓', ''],
      ['Colour', '—', ''],
      ['Engine Type', '—', 'e.g. 2.8L Diesel'],
      ['Transmission', '—', 'Manual / Automatic'],
      ['Current Mileage', '—', 'km'],
      ['First Registered', '—', 'Date'],
      ['Owner Name/Phone/Email', '—', 'Can be linked via CRM'],
      ['Notes', '—', ''],
    ]
  );

  h2('Vehicle Detail View');
  body('Overview: Full spec list (Plate, VIN, Engine, Transmission, Mileage, Colour, First Registered) and owner info.');
  gap();
  h3('Service History Tab — columns:');
  table(
    ['Column', 'Description'],
    [
      ['Job Number', 'Linked job reference'],
      ['Date', 'Service date'],
      ['Service Type', 'What was done'],
      ['Technician', 'Who performed the work'],
      ['Mileage at Service', 'Odometer reading'],
      ['Labour Cost', 'Labour charge (Kz)'],
      ['Parts Cost', 'Parts charge (Kz)'],
      ['Total', 'Grand total (Kz)'],
      ['Status', 'completed / invoiced / in-progress'],
    ]
  );

  h2('Changing a Vehicle Owner');
  step(1, 'Open the vehicle detail view.');
  step(2, 'Click Change Owner in the owner section.');
  step(3, 'Search for the new customer and click to select. The previous owner association is removed.');

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. VEHICLES IN SERVICE
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('7. Vehicles in Service');

  h2('Service Stages');
  table(
    ['Stage', 'Icon', 'Colour', 'Meaning'],
    [
      ['On Bay', 'Wrench', 'Blue', 'Actively being worked on'],
      ['Diagnosis', 'Search', 'Amber', 'Vehicle being diagnosed'],
      ['Quality Control', 'Shield', 'Purple', 'Work checked by QC technician'],
      ['Washing', 'Droplets', 'Cyan', 'Final clean before handover'],
      ['Waiting Collection', 'Package', 'Green', 'Ready — awaiting customer pickup'],
    ]
  );
  body('The summary cards at the top show how many vehicles are at each stage.');

  h2('Board Columns');
  table(
    ['Column', 'Description'],
    [
      ['Plate', 'Vehicle registration plate'],
      ['Vehicle', 'Make, model, year'],
      ['Owner', 'Customer name and phone'],
      ['Technician', 'Assigned technician'],
      ['Bay', 'Workshop bay number'],
      ['Service Type', 'Type of work being performed'],
      ['Stage', 'Current stage (dropdown — change directly in the table)'],
      ['Entry Date', 'When the vehicle arrived'],
      ['Est. Completion', 'Target date; shown in red if overdue'],
      ['Notes', 'Notes visible to the team'],
    ]
  );

  h2('Changing a Vehicle\'s Stage');
  body('Click the stage dropdown in the Stage column for any vehicle and select the new stage. The change is instant. Vehicles past their estimated completion date are highlighted red.');

  h2('Filtering & Export');
  bullet('Search bar: filter by plate, owner, technician, or job number');
  bullet('Click Clear filter to reset');
  bullet('Export Excel: downloads the current board view');

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. PARTS & INVENTORY
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('8. Parts & Inventory');

  h2('Summary Cards');
  table(
    ['Card', 'Shows'],
    [
      ['Total Parts', 'Total distinct part SKUs'],
      ['In Stock', 'Parts with adequate stock (≥ minimum)'],
      ['Low Stock', 'Parts below minimum level'],
      ['Out of Stock', 'Parts at zero quantity'],
      ['Total Value', 'Total cost value of inventory (Kz)'],
    ]
  );

  h2('Part Status');
  table(
    ['Status', 'Colour', 'Condition'],
    [
      ['In Stock', 'Green', 'Current stock ≥ minimum stock'],
      ['Low Stock', 'Yellow', 'Current stock < minimum stock'],
      ['Out of Stock', 'Red', 'Current stock = 0'],
    ]
  );

  h2('Part Categories (12 types)');
  body('Engine Parts · Brake System · Suspension · Electrical · Transmission · Cooling System · Exhaust · Filters · Oils & Fluids · Body Parts · Interior · Tires & Wheels');

  h2('Adding a New Part');
  h3('Basic Information');
  table(
    ['Field', 'Required'],
    [
      ['Part Number', '✓'],
      ['Name', '✓'],
      ['Description', '✓'],
      ['Category', '✓'],
      ['Manufacturer', '✓'],
      ['Supplier', '✓'],
    ]
  );
  h3('Stock Information');
  table(
    ['Field', 'Required', 'Notes'],
    [
      ['Current Stock', '✓', 'Opening balance'],
      ['Minimum Stock', '✓', 'Triggers Low Stock alert'],
      ['Maximum Stock', '✓', 'Upper storage capacity'],
      ['Reorder Point', '✓', 'Suggested reorder trigger level'],
    ]
  );
  h3('Pricing & Location');
  table(
    ['Field', 'Required', 'Notes'],
    [
      ['Unit', '✓', 'Pieces / Litres / Sets / Boxes / Pairs'],
      ['Cost Price (Kz)', '✓', 'Purchase price'],
      ['Sell Price (Kz)', '✓', 'Price charged to customer'],
      ['Storage Location', '✓', 'e.g. A-12 (shelf/bay reference)'],
    ]
  );

  newPage();
  h2('Stock Movements Tab');
  table(
    ['Type', 'Colour', 'Meaning'],
    [
      ['Purchase', 'Green', 'Stock received from supplier (+)'],
      ['Sale', 'Blue', 'Part used on a job (−)'],
      ['Return', 'Orange', 'Part returned to supplier or by customer'],
      ['Adjustment', 'Grey', 'Manual stock correction'],
    ]
  );
  body('Columns: Date · Part # · Name · Type · Quantity (+/−) · Reference (Job/PO#) · Notes');

  h2('Suppliers Tab');
  body('Shows: Supplier Name · Contact Person · Phone · Email · Rating (1–5 stars) · Total Purchases (Kz)');
  body('Click Add Supplier to add a new supplier (Name, Contact, Phone, Email, Address, Rating).');

  h2('Reorder Alerts');
  body('When any part falls below its reorder point, an orange alert panel appears at the bottom of the page listing all parts needing restock with current stock, minimum, and reorder point values.');

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. WORKSHOP KPIs
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('9. Workshop KPIs');

  h2('Tracked KPIs');
  table(
    ['KPI', 'Target', 'Formula'],
    [
      ['Appointment Fill Rate', '90%', 'Booked slots ÷ Available slots × 100'],
      ['Revenue Per Technician/Day', '1,500 Kz', 'Total Revenue ÷ Active Technicians ÷ Working Days'],
      ['Gross Profit %', '45%', '(Revenue − Cost of Sales) ÷ Revenue × 100'],
      ['Technician Efficiency', '95%', 'Billable Hours ÷ Total Clocked Hours × 100'],
      ['Technician Productivity', '90%', 'Efficiency × Effectiveness (composite)'],
      ['Bay / Lift Utilisation', '85%', 'Occupied Bay-Hours ÷ Available Bay-Hours × 100'],
    ]
  );

  h2('KPI Card Elements');
  bullet('Current value and trend vs previous period (↑ green / ↓ red)');
  bullet('Status badge: Good (green) / Warning (yellow) / Critical (red)');
  bullet('Progress bar relative to target');
  bullet('Clickable for drill-down on Revenue, Efficiency, and Productivity cards');

  h2('Technician Drill-Down');
  body('Click the Revenue, Efficiency, or Productivity KPI cards to open the drill-down dialog. All technicians are ranked by the selected metric. Click any technician to see their individual view:');
  gap(2);
  table(
    ['Section', 'Details'],
    [
      ['Efficiency card', 'Efficiency %, billable hours / total hours'],
      ['Revenue card', 'Revenue per day (Kz)'],
      ['Jobs Completed card', 'Count for the period'],
      ['Certifications', 'List of qualifications held'],
      ['Job History table', 'Recent jobs: Date, Vehicle, Job Type, Quoted Hours, Actual Hours, Revenue, Customer Rating'],
    ]
  );

  h2('Comparison Mode');
  step(1, 'Click Compare Technicians in the drill-down dialog.');
  step(2, 'Select 2 or 3 technicians by clicking their cards (checkboxes appear).');
  step(3, 'Click View Comparison to see a side-by-side table of all key metrics.');

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. ACCOUNTING
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('10. Accounting');
  body('The Accounting module is a complete double-entry bookkeeping system compliant with Angolan GAAP (Sistema de Normalização Contabilística). It is organised across ten tabs.');

  h2('Tab Overview');
  table(
    ['Tab', 'Purpose'],
    [
      ['Chart of Accounts', 'Account registry — codes, names, balances'],
      ['Journal Entries', 'Manual double-entry transactions'],
      ['Trial Balance', 'Verify debits = credits across all accounts'],
      ['General Ledger', 'Transaction history for a single account'],
      ['Period Close', 'Month/year-end closing procedures'],
      ['Exchange Rates', 'AOA / USD / EUR rates and converter'],
      ['Invoice Register (AR)', 'Customer invoices and payment collection'],
      ['Bills Register (AP)', 'Vendor bills and payment obligations'],
      ['Financial Reports', 'P&L, Balance Sheet, AR Ageing'],
      ['Customer Statements', 'Individual customer account statements (PDF)'],
    ]
  );

  h2('Chart of Accounts — Account Types');
  table(
    ['Type', 'Colour', 'Examples'],
    [
      ['Asset', 'Blue', 'Cash, Bank, Accounts Receivable, Inventory'],
      ['Liability', 'Red', 'Accounts Payable, VAT Payable, Loans'],
      ['Equity', 'Purple', 'Share Capital, Retained Earnings'],
      ['Revenue', 'Green', 'Service Revenue, Parts Revenue'],
      ['Expense', 'Orange', 'Cost of Parts, Labour, Rent, Utilities'],
    ]
  );

  h2('Journal Entry Rules');
  bullet('Every entry must have at least one debit line and one credit line');
  bullet('Total Debits must exactly equal Total Credits — the system validates this');
  bullet('Entries have status Draft or Posted');
  bullet('Invoices from the Appointments/Quotations modules auto-post journal entries');

  newPage();
  h2('Invoice Register (AR)');
  h3('Invoice Statuses');
  table(
    ['Status', 'Colour', 'Meaning'],
    [
      ['Draft', 'Slate', 'Created, not sent'],
      ['Sent', 'Blue', 'Sent to customer, awaiting payment'],
      ['Overdue', 'Red', 'Past due date, unpaid'],
      ['Partially Paid', 'Yellow', 'Some payment received'],
      ['Paid', 'Green', 'Fully settled'],
    ]
  );
  h3('Recording a Payment');
  table(
    ['Field', 'Required', 'Notes'],
    [
      ['Amount', '✓', 'Must not exceed outstanding balance'],
      ['Payment Method', '✓', 'Bank Transfer · Cash · Card · Mobile Money · Cheque'],
      ['Payment Date', '✓', ''],
      ['Reference', '—', 'Cheque number, bank reference, etc.'],
    ]
  );
  body('After clicking Apply Payment the invoice balance updates and the status changes automatically (Sent → Partially Paid → Paid).');

  h2('Bills Register (AP)');
  h3('Bill Categories → Expense Accounts');
  table(
    ['Category', 'Account Code'],
    [
      ['Parts Purchase', '5010 — Cost of Sales (Parts)'],
      ['Labour / Subcontract', '5020 — Cost of Sales (Labour)'],
      ['Maintenance & Repair', '6020 — Maintenance Expense'],
      ['Fuel', '6030 — Fuel Expense'],
      ['Utilities', '6040 — Utilities Expense'],
      ['Insurance', '6050 — Insurance Expense'],
      ['Professional Fees', '6100 — Professional Services'],
      ['Other', '6999 — Sundry Expenses'],
    ]
  );
  body('New Bill form: Vendor Name, Date, Due Date, Category, Description, Subtotal (VAT 14% auto-calculated). Total = Subtotal × 1.14.');

  newPage();
  h2('Financial Reports');

  h3('Profit & Loss Statement');
  body('Set a date range (From / To) and the report calculates:');
  bullet('Revenue — by account, Total Revenue');
  bullet('Cost of Sales — Gross Profit calculation');
  bullet('Operating Expenses — all expense accounts');
  bullet('Net Income (bottom line)');
  body('Click Export CSV to download.');

  h3('Balance Sheet');
  body('Shows financial position at a point in time:');
  bullet('Current Assets + Non-Current Assets = Total Assets');
  bullet('Current Liabilities + Non-Current Liabilities = Total Liabilities');
  bullet('Equity (Share Capital + Retained Earnings)');
  bullet('Balance check: Total Assets = Total Liabilities + Total Equity');

  h3('AR Ageing Report');
  table(
    ['Column', 'Description'],
    [
      ['Customer', 'Customer name'],
      ['Current (0–30 days)', 'Not yet overdue'],
      ['31–60 days', 'Mildly overdue'],
      ['61–90 days', 'Significantly overdue'],
      ['90+ days', 'Seriously overdue — priority collection'],
      ['Total', 'All outstanding for this customer'],
    ]
  );

  h2('Customer Statements');
  step(1, 'Select a customer from the dropdown (only customers with invoices appear).');
  step(2, 'Review the summary cards: Total Billed, Total Paid, Outstanding.');
  step(3, 'The invoice table shows all invoices with Days Outstanding calculated.');
  step(4, 'Click Export Statement PDF to generate a formatted PDF for the customer.');

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. KEY WORKFLOWS
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('11. Key Workflows End-to-End');

  h2('Workflow A: New Booking → Completed Invoice');
  table(
    ['Step', 'Where', 'Action'],
    [
      ['1', 'Appointments', 'Click New Appointment — select/create customer and vehicle, set date/time/service type'],
      ['2', 'Appointments', 'Click Confirm on the card → status: Confirmed'],
      ['3', 'Appointments', 'Click Start when vehicle arrives → status: In Progress'],
      ['4', 'Vehicles in Service', 'Change stage to On Bay, then Diagnosis, Quality Control, Washing, Waiting Collection as work progresses'],
      ['5', 'Appointments', 'Click Open Job Card — add labour and parts lines'],
      ['6', 'Job Card Dialog', 'Click Close Job & Generate Invoice — PDF exported; accounting entry posted'],
      ['7', 'Accounting → AR', 'Find the invoice → Record Payment — enter amount and method → status: Paid'],
    ]
  );

  gap();
  h2('Workflow B: Quotation Request → Approved Job');
  table(
    ['Step', 'Where', 'Action'],
    [
      ['1', 'Quotations & Jobs', 'Click New Quotation — select customer/vehicle, add line items'],
      ['2', 'Quotations & Jobs', 'Click Send & Export PDF — PDF sent to customer; status: Sent'],
      ['3', 'Quotations & Jobs', 'Click Approve when customer accepts — status: Approved'],
      ['4', 'Quotations & Jobs', 'Click Convert to Job — job created with all items; status: Pending'],
      ['5', 'Quotations & Jobs', 'Update job to In Progress as work begins'],
      ['6', 'Quotations & Jobs', 'Click Generate Invoice when done — PDF exported; accounting posted'],
      ['7', 'Accounting → AR', 'Record payment on the invoice'],
    ]
  );

  newPage();
  h2('Workflow C: Parts Procurement');
  table(
    ['Step', 'Where', 'Action'],
    [
      ['1', 'Parts & Inventory', 'Check reorder alert panel (orange) at bottom of screen — lists parts below reorder point'],
      ['2', 'Parts & Inventory → Suppliers', 'Find the supplier for the required parts; note contact details'],
      ['3', 'External', 'Contact supplier and place order'],
      ['4', 'Accounting → Bills', 'Click New Bill — enter supplier invoice (Category: Parts Purchase); VAT auto-calculates'],
      ['5', 'Parts & Inventory → Movements', 'Record a Purchase movement to update stock levels'],
      ['6', 'Accounting → Bills', 'When payment is made, click Pay Bill and enter payment details'],
    ]
  );

  gap();
  h2('Workflow D: Month-End Accounting Close');
  table(
    ['Step', 'Where', 'Action'],
    [
      ['1', 'Accounting → AR', 'Filter Overdue — contact customers with outstanding balances'],
      ['2', 'Accounting → Reports → Ageing', 'Export AR Ageing CSV for collections follow-up'],
      ['3', 'Accounting → AP', 'Filter Overdue — schedule payments to suppliers'],
      ['4', 'Accounting → Reports → P&L', 'Set From/To date range for the month; Export CSV'],
      ['5', 'Accounting → Reports → Balance Sheet', 'Review balance sheet; Export CSV'],
      ['6', 'Accounting → Statements', 'For each customer with an outstanding balance: export Statement PDF and send'],
      ['7', 'Accounting → Period Close', 'Review unposted entries, post closing entries, lock the period'],
    ]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. EXPORTS REFERENCE
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('12. Exports Reference');

  table(
    ['Module', 'Button / Action', 'Format', 'Content'],
    [
      ['Dashboard', 'Export Docs', 'PDF', 'System technical documentation'],
      ['Dashboard', 'User Guide PDF', 'PDF', 'This user guide'],
      ['Appointments', 'Export Excel', 'Excel (.xlsx)', 'All appointments with full details'],
      ['Quotations', 'Send & Export PDF', 'PDF', 'Formal customer quotation'],
      ['Jobs / Invoices', 'Generate Invoice', 'PDF', 'Tax invoice for customer'],
      ['CRM', 'Export', 'Excel (.xlsx)', 'All customer records'],
      ['Vehicles in Service', 'Export Excel', 'Excel (.xlsx)', 'Current workshop board snapshot'],
      ['Parts — Catalog', 'Export Excel', 'Excel (.xlsx)', 'Full parts catalogue'],
      ['Parts — Movements', 'Export', 'Excel (.xlsx)', 'Complete stock movement log'],
      ['KPIs — Technician', 'Export Report', 'Excel (.xlsx)', 'Individual technician performance detail'],
      ['Accounting — AR', 'Export CSV', 'CSV', 'All AR invoices'],
      ['Accounting — AP', 'Export CSV', 'CSV', 'All vendor bills'],
      ['Accounting — P&L', 'Export CSV', 'CSV', 'Profit & Loss statement'],
      ['Accounting — Balance Sheet', 'Export CSV', 'CSV', 'Balance sheet'],
      ['Accounting — AR Ageing', 'Export CSV', 'CSV', 'Ageing report for collections'],
      ['Accounting — Statements', 'Export Statement PDF', 'PDF', 'Individual customer account statement'],
      ['Accounting — COA', 'Export Excel', 'Excel (.xlsx)', 'Full chart of accounts'],
    ]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. REFERENCE TABLES
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  h1('13. Status & Format Reference');

  h2('Document Number Formats');
  table(
    ['Document', 'Format', 'Example'],
    [
      ['Appointment', 'APT-YYYY-NNN', 'APT-2026-007'],
      ['Quotation', 'QUO-YYYY-NNN', 'QUO-2026-003'],
      ['Job Card', 'JOB-YYYY-NNN', 'JOB-2026-012'],
      ['Invoice', 'INV-YYYY-NNN', 'INV-2026-015'],
      ['Vendor Bill', 'BILL-YYYY-NNN', 'BILL-2026-004'],
    ]
  );

  h2('Currency & VAT Rules');
  table(
    ['Item', 'Value'],
    [
      ['Currency', 'Angolan Kwanza (Kz / AOA)'],
      ['Number Format', '1,234,567.89 Kz (locale: pt-AO)'],
      ['Standard VAT Rate', '14%'],
      ['VAT Calculation', 'Total = Subtotal × 1.14'],
    ]
  );

  h2('All Status Values by Module');
  h3('Appointments');
  table(['Value', 'Label'], [
    ['scheduled', 'Scheduled'], ['confirmed', 'Confirmed'], ['in-progress', 'In Progress'],
    ['completed', 'Completed'], ['cancelled', 'Cancelled'], ['no-show', 'No Show'],
  ]);
  h3('Quotations');
  table(['Value', 'Label'], [
    ['draft', 'Draft'], ['sent', 'Sent'], ['approved', 'Approved'],
    ['rejected', 'Rejected'], ['expired', 'Expired'],
  ]);
  h3('Jobs');
  table(['Value', 'Label'], [
    ['pending', 'Pending'], ['in-progress', 'In Progress'],
    ['completed', 'Completed'], ['invoiced', 'Invoiced'],
  ]);
  h3('Invoices (AR)');
  table(['Value', 'Label'], [
    ['draft', 'Draft'], ['sent', 'Sent'], ['overdue', 'Overdue'],
    ['partially_paid', 'Partially Paid'], ['paid', 'Paid'],
  ]);
  h3('Vendor Bills (AP)');
  table(['Value', 'Label'], [
    ['draft', 'Draft'], ['pending', 'Pending'], ['overdue', 'Overdue'],
    ['partially_paid', 'Partially Paid'], ['paid', 'Paid'],
  ]);
  h3('Vehicles in Service');
  table(['Value', 'Label'], [
    ['on-bay', 'On Bay'], ['diagnosis', 'Diagnosis'], ['quality-control', 'Quality Control'],
    ['washing', 'Washing'], ['waiting-for-collection', 'Waiting Collection'],
  ]);
  h3('Parts');
  table(['Value', 'Label'], [
    ['in-stock', 'In Stock'], ['low-stock', 'Low Stock'],
    ['out-of-stock', 'Out of Stock'], ['discontinued', 'Discontinued'],
  ]);
  h3('Customers');
  table(['Value', 'Label'], [
    ['active', 'Active'], ['vip', 'VIP'], ['prospect', 'Prospect'],
    ['inactive', 'Inactive'], ['blacklisted', 'Blacklisted'],
  ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // BACK COVER
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  y = PH / 2 - 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C_BRAND);
  doc.text('AutoGP Workshop Management System', PW / 2, y, { align: 'center' });
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C_HEAD2);
  doc.text('Angolan GAAP Compliant · Multi-Language · Full Double-Entry Accounting', PW / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(8.5);
  doc.text(`Document generated: ${new Date().toLocaleString('pt-AO')}`, PW / 2, y, { align: 'center' });
  doc.setTextColor(...C_BLACK);

  // ── Page footers ──────────────────────────────────────────────────────────
  pageFooter();

  doc.save('autogp-user-guide.pdf');
};
