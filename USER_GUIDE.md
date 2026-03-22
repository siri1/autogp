# AutoGP Workshop Management System — User Guide

**Version:** 1.0 · **Currency:** Angolan Kwanza (Kz) · **VAT Rate:** 14% · **Standard:** Angolan GAAP (SNC)

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard](#2-dashboard)
3. [Appointments & Scheduling](#3-appointments--scheduling)
4. [Quotations & Jobs](#4-quotations--jobs)
5. [Customer Relationship Management (CRM)](#5-customer-relationship-management-crm)
6. [Vehicle Database](#6-vehicle-database)
7. [Vehicles in Service](#7-vehicles-in-service)
8. [Parts & Inventory](#8-parts--inventory)
9. [Workshop KPIs](#9-workshop-kpis)
10. [Accounting](#10-accounting)
    - 10.1 [Chart of Accounts](#101-chart-of-accounts)
    - 10.2 [Journal Entries](#102-journal-entries)
    - 10.3 [Trial Balance & General Ledger](#103-trial-balance--general-ledger)
    - 10.4 [Invoice Register (AR)](#104-invoice-register-ar)
    - 10.5 [Bills Register (AP)](#105-bills-register-ap)
    - 10.6 [Financial Reports](#106-financial-reports)
    - 10.7 [Customer Statements](#107-customer-statements)
    - 10.8 [Exchange Rates](#108-exchange-rates)
    - 10.9 [Period Close](#109-period-close)
11. [Language Switcher](#11-language-switcher)
12. [Key Workflows End-to-End](#12-key-workflows-end-to-end)
13. [Document & Data Exports](#13-document--data-exports)
14. [Reference: Number Formats & Status Values](#14-reference-number-formats--status-values)

---

## 1. Getting Started

### Accessing the System

Open the application in a browser. The sidebar on the left contains all navigation. Click any menu item to switch modules. The sidebar can be collapsed on smaller screens using the hamburger (☰) button at the top.

### Sidebar Layout

```
┌──────────────────────┐
│  AutoGP Workshop     │  ← App title
│  Workshop Mgmt Sys.  │  ← Subtitle
├──────────────────────┤
│  ☰  Collapse         │
├──────────────────────┤
│  Dashboard           │
│  Appointments        │
│  Time Clocking  *    │  * = Coming Soon
│  Customers           │
│  Vehicles            │
│  In Service          │
│  Quotations & Jobs   │
│  Parts & Inventory   │
│  Workshop KPIs       │
│  Reports             │
│  Accounting          │
│  Settings       *    │
├──────────────────────┤
│  🌐 Language         │  ← Language switcher
│  © AutoGP 2026       │
└──────────────────────┘
```

### Language Selection

The language switcher is located at the bottom of the sidebar. Click it to open the language menu and choose from:

| Flag | Language   | Code |
|------|-----------|------|
| 🇬🇧  | English   | en   |
| 🇦🇴  | Português | pt   |
| 🇪🇸  | Español   | es   |
| 🇨🇳  | 中文      | zh   |
| 🇫🇷  | Français  | fr   |

Your language preference is saved in the browser and persists across sessions.

---

## 2. Dashboard

The dashboard is the home screen, giving a snapshot of the workshop's current state.

### Statistics Cards

| Card | What It Shows |
|------|--------------|
| Total Customers | Total number of customers in the CRM |
| Active Customers | Customers with status "active" or "vip" |
| Total Revenue | Sum of all completed job totals (Kz) |
| Total Orders | Total number of jobs across all statuses |

Each card shows a percentage change vs last month.

### Quick Access Cards

Six cards provide one-click navigation to the most-used modules:

- Appointment Booking
- Quotations & Jobs
- Customer Management
- Parts & Inventory
- Workshop KPIs
- Accounting

### Header Actions

| Button | Action |
|--------|--------|
| Refresh | Reloads customer data from the database |
| Export Docs | Generates and downloads a full system documentation PDF |

---

## 3. Appointments & Scheduling

### Overview

The Appointments module manages all customer bookings. It integrates directly with Job Cards and Quotations, making it the typical entry point for a new service workflow.

### Appointment Statuses

| Status | Colour | Meaning |
|--------|--------|---------|
| Scheduled | Blue | Booking received, not yet confirmed |
| Confirmed | Green | Customer and workshop have confirmed |
| In Progress | Orange | Work has started |
| Completed | Emerald | Work finished |
| Cancelled | Red | Appointment cancelled |
| No-Show | Grey | Customer did not arrive |

### Creating a New Appointment

Click **New Appointment**. The dialog opens in three sections:

**Step 1 — Date & Time**
- **Date** — Select the appointment date
- **Time** — Choose from hourly slots (08:00 – 17:00)
- **Duration** — Enter estimated job duration in hours (0.5 increments)

**Step 2 — Customer & Vehicle**

Search for an existing customer by typing their name, phone number, or company name in the search box. Results appear instantly.

- Click a customer in the results to select them.
- If the customer does not exist, click **Create new customer** and fill in: First Name, Last Name, Phone, Email.

Once a customer is selected, their linked vehicles appear. Select the vehicle or create a new one (Make, Model, Plate, Year).

**Step 3 — Service Details**
- **Service Type** — Select from: Oil Change, Brake Service, Tire Service, Engine Diagnostic, Transmission Service, Air Conditioning, Electrical System, Suspension, General Inspection, Other
- **Description** — Free-text description of the requested work
- **Bay Number** — Workshop bay to assign (optional)
- **Estimated Cost** — Approximate cost in Kz (optional)
- **Notes** — Any internal notes (optional)

Click **Save** to create the appointment.

### Appointment List View

The list shows all appointments. Use the toolbar to:
- **Search** — Filter by customer name, plate, or appointment number
- **Status filter** — Show only appointments of a chosen status

Each appointment card shows:
- Appointment number (e.g. `APT-2026-001`)
- Status badge
- Date, time, and duration
- Customer name, phone, and email
- Vehicle make, model, and plate
- Service type and description
- Assigned technician and bay (if set)
- Estimated or actual job cost
- Links to associated Job Card and Quotation numbers

### Appointment Actions (buttons on each card)

| Button | Appears When | Action |
|--------|-------------|--------|
| Confirm | Status = Scheduled | Moves status to Confirmed |
| Start | Status = Scheduled or Confirmed | Moves status to In Progress |
| Complete | Status = In Progress | Moves status to Completed |
| Quotation | Status ≠ Cancelled | Opens the Quotation dialog for this appointment |
| Open Job Card | Status = Confirmed or In Progress | Opens the Job Card dialog |
| View Job Card | Status = Completed (job exists) | Opens the saved Job Card |
| Cancel | Status not Completed or Cancelled | Cancels the appointment |

### Job Card Dialog

A Job Card is the internal work order. It tracks what work was done and calculates the billable amount.

**Header information (auto-filled from appointment):**
- Customer name and phone
- Vehicle make, model, plate
- Assigned technician
- Start date

**Labour table columns:** Description · Hours · Rate (Kz) · Total
- Click **Add Labour** to add a labour line.

**Parts table columns:** Part # · Description · Qty · Unit Price · Total
- Click **Add Part** to add a parts line.

**Totals section:**
- Subtotal (sum of all lines)
- VAT 14% (automatically calculated)
- **Total** (Subtotal + VAT)

**Actions:**
| Button | Action |
|--------|--------|
| Cancel | Close dialog without saving |
| Save Job Card | Save current state without closing the job |
| Close Job & Generate Invoice | Mark job as completed, generate PDF invoice, close dialog |

> **Note:** Generating the invoice exports a PDF and posts the corresponding accounting entry automatically.

### Quotation Dialog

A Quotation is a formal cost estimate sent to the customer before work begins.

**Header information (auto-filled):**
- Customer name and phone
- Vehicle make, model, plate
- Date created
- **Valid Until** date (editable, default 14 days)

**Labour and Parts tables** — same structure as Job Card.

**Actions:**
| Button | Action |
|--------|--------|
| Cancel | Discard changes |
| Save Draft | Save quotation in draft status |
| Send & Export PDF | Export quotation as PDF, set status to "Sent" |
| Approve | Mark quotation as approved |

### Calendar View

Switch to the **Calendar** tab to see appointments grouped by date. Select a date using the date picker to see all appointments scheduled for that day, sorted by time. Each entry shows time, duration, customer, vehicle, service type, technician, and status.

### Exporting Appointments

Click **Export Excel** to download an Excel file containing all appointments with: Appointment #, Date, Time, Customer, Phone, Vehicle, Service Type, Technician, Bay, Status, Estimated Cost, Job Card reference, Quotation reference.

---

## 4. Quotations & Jobs

### Overview

The Quotations & Jobs module provides a dedicated workspace for managing the full sales workflow: Quote → Job → Invoice. This module works alongside the Appointments module but can also operate independently.

### Statistics Cards

| Card | Shows |
|------|-------|
| Quotations | Total quotations; number approved |
| In Progress | Active and pending jobs |
| Completed | Jobs ready to invoice |
| Total Value | Sum of all job totals (Kz) |

### Quotation Statuses

| Status | Meaning |
|--------|---------|
| Draft | Created, not sent to customer |
| Sent | Customer has received the quotation |
| Approved | Customer has accepted the price |
| Rejected | Customer declined |
| Expired | Validity date passed without response |

### Creating a New Quotation

Click **New Quotation**. The dialog has the same customer/vehicle picker as Appointments (search existing or create inline).

**Quotation fields:**
- Customer and vehicle (required)
- Date (today by default)
- Valid Until (30 days by default — adjustable)
- Notes / terms

**Line items** — each item requires:
- Description
- Type: Labour or Part
- Quantity (or hours for labour)
- Unit Price (Kz)
- Total (auto-calculated)

The **Subtotal**, **VAT (14%)**, and **Total** are shown at the bottom and update in real time as you add lines.

**Saving options:**
- **Create Quotation** — saves as draft
- After saving, use the action buttons to Send, Approve, or Convert to Job

### Job Statuses

| Status | Meaning |
|--------|---------|
| Pending | Created, work not yet started |
| In Progress | Actively being worked on |
| Completed | Work finished, invoice not yet issued |
| Invoiced | Invoice has been generated |

### Converting a Quotation to a Job

Once a quotation is approved, click **Convert to Job** on the quotation row. The system automatically:
- Creates a new Job with a unique number (e.g. `JOB-2026-003`)
- Copies all line items from the quotation
- Sets job status to **Pending**

### Job Detail Dialog

Click a job row to open the detail view:
- Customer, vehicle, technician, status
- Full line items table (Description · Qty · Unit Price · Total)
- Totals: Subtotal, VAT (14%), Total

### Generating an Invoice from a Job

When a job is completed, click **Generate Invoice**. The system:
1. Creates an invoice (e.g. `INV-2026-005`)
2. Sets job status to **Invoiced**
3. Posts the double-entry accounting record automatically
4. Exports the invoice as a PDF

---

## 5. Customer Relationship Management (CRM)

### Overview

The CRM stores all customer information and provides a full history of their interactions, vehicles, and service records.

### Customer Statuses

| Status | Badge Colour | Meaning |
|--------|-------------|---------|
| Active | Green | Regular customer |
| VIP | Purple | Premium / high-value customer |
| Prospect | Blue | Potential new customer |
| Inactive | Grey | Not recently active |
| Blacklisted | Red | Problem customer — handle with caution |

### Customer List View

The list shows all customers with columns: Name · Status · Email · Phone · Company · City · Customer Since · Last Contact.

**Searching and filtering:**
- Type in the search box to filter by name, email, phone number, company, or ID number.
- Use the **Status** dropdown to filter by customer type.
- Use the **Sort** controls to order by Name, Status, Customer Since, Last Contact, or City (ascending or descending).
- The list is paginated (25 customers per page). Use the page controls at the bottom.

### Adding a New Customer

Click **Add Customer**. Fill in:

| Field | Required | Notes |
|-------|----------|-------|
| First Name | ✓ | |
| Last Name | ✓ | |
| Phone | ✓ | Primary contact number |
| WhatsApp | — | May differ from phone |
| Email | — | |
| Company | — | For corporate customers |
| VAT Number | — | For invoicing |
| ID Number | — | National ID |
| Address | — | Street address |
| City | — | |
| Status | ✓ | Default: Prospect |
| Preferred Contact | ✓ | Phone / WhatsApp / Email |

Click **Save** to create the customer.

### Customer Detail View

Click any customer in the list to open their detail page. The top strip shows four KPI cards:

- **Vehicles** — Number of registered vehicles
- **Total Services** — All completed service records
- **Active Jobs** — Jobs currently in progress
- **Total Spent** — Lifetime spend in Kz

The detail view has four tabs:

#### Profile Tab

Displays and edits all customer fields. Click **Edit** to enable editing. Make changes, then click **Save** or **Cancel**.

#### Vehicles Tab

Lists all vehicles linked to this customer. Each row shows the plate, make/model, year, colour, engine, mileage, number of services, and total spent.

- **Associate Vehicle** — Link an existing vehicle from the Vehicle Database to this customer.
- **Remove** — Unlink a vehicle from this customer (the vehicle remains in the database).

#### Service History Tab

Shows all service records across all of the customer's vehicles:
- Job Number · Date · Service Type · Technician · Status · Labour Cost · Parts Cost · Total

#### Activity Tab

A chronological log of all interactions with this customer.

**Interaction types:** Call · Email · Visit · WhatsApp · Note

To add a new interaction:
1. Type the note in the text area.
2. Select the interaction type from the dropdown.
3. Click **Add**.

Each entry shows the interaction icon, content, date, and author.

### Exporting CRM Data

Click **Export** (Excel icon) to download all customer records including name, contact details, status, customer-since date, and total spent.

---

## 6. Vehicle Database

### Overview

The Vehicle Database maintains a registry of all customer vehicles and a complete service history for each.

### Vehicle List View

**Columns:** Plate · Make/Model · Year · Owner · Mileage · Engine · Transmission · Actions

**Search:** Filter by plate number, make, model, owner name, or VIN.

**Sort:** Plate, Make, Year, Mileage, Owner, or Registration Date.

### Adding a New Vehicle

Click **Add Vehicle**. Complete the form:

| Field | Required | Notes |
|-------|----------|-------|
| License Plate | ✓ | Automatically uppercased |
| VIN | — | Vehicle Identification Number |
| Make | ✓ | e.g. Toyota |
| Model | ✓ | e.g. Hilux |
| Year | ✓ | |
| Colour | — | |
| Engine Type | — | e.g. 2.8L Diesel |
| Transmission | — | Manual / Automatic |
| Current Mileage | — | km |
| First Registered | — | Date |
| Owner Name | — | Can be assigned later in CRM |
| Owner Phone | — | |
| Owner Email | — | |
| Notes | — | Any relevant notes |

### Vehicle Detail View

Click a vehicle in the list to open its detail page.

**Overview section:**
- Photo placeholder with vehicle make/model/year
- Full specification list: Plate, VIN, Engine, Transmission, Mileage, Colour, First Registered
- Owner information: Name, Phone, Email

**Service History tab:**

A table of every job completed on this vehicle:

| Column | Description |
|--------|-------------|
| Job Number | Linked job reference |
| Date | Service date |
| Service Type | What was done |
| Technician | Who did the work |
| Mileage at Service | Odometer reading |
| Labour Cost | Labour charge |
| Parts Cost | Parts charge |
| Total | Grand total |
| Status | completed / invoiced / in-progress |

### Dissociating a Vehicle from an Owner

To change or remove a vehicle's owner:
1. Open the vehicle detail.
2. Click **Change Owner** (or the owner section).
3. Search for the new customer in the search box.
4. Click to select the new owner. The previous owner association is removed.

---

## 7. Vehicles in Service

### Overview

The Vehicles in Service board shows every vehicle currently inside the workshop, its stage in the service workflow, and the assigned technician and bay. This screen is designed for workshop floor visibility.

### Service Stages

Vehicles move through five stages as work progresses:

| Stage | Icon | Colour | Meaning |
|-------|------|--------|---------|
| On Bay | Wrench | Blue | Actively being worked on at a bay |
| Diagnosis | Search | Amber | Vehicle being diagnosed |
| Quality Control | Shield | Purple | Work checked by QC technician |
| Washing | Droplets | Cyan | Final clean before handover |
| Waiting Collection | Package | Green | Ready — awaiting customer pickup |

The summary cards at the top show how many vehicles are at each stage.

### Board Columns

| Column | Description |
|--------|-------------|
| Plate | Vehicle registration plate |
| Vehicle | Make, model, year |
| Owner | Customer name and phone number |
| Technician | Assigned technician name |
| Bay | Bay number if assigned |
| Service Type | Type of work being performed |
| Stage | Current stage (dropdown — change directly here) |
| Entry Date | When the vehicle arrived |
| Est. Completion | Target completion date; shown in red if overdue |
| Notes | Any notes visible to the team |

### Changing a Vehicle's Stage

Click the stage dropdown in the **Stage** column for any vehicle and select the new stage. The change is instant.

Vehicles overdue (estimated completion date in the past) are highlighted in red.

### Searching and Filtering

Use the search bar to filter by plate number, owner name, technician name, or job number. The result count updates live. Click **Clear filter** to reset.

### Exporting

Click **Export Excel** to download the current board view including all columns.

---

## 8. Parts & Inventory

### Overview

The Parts & Inventory module manages the full catalogue of spare parts, tracks stock levels, alerts on low stock, and maintains supplier records.

### Parts Catalog Tab

#### Summary Cards

| Card | Shows |
|------|-------|
| Total Parts | Total distinct part SKUs |
| In Stock | Parts with adequate stock |
| Low Stock | Parts below minimum level |
| Out of Stock | Parts at zero quantity |
| Total Value | Total cost value of current inventory (Kz) |

#### Parts Table

**Columns:** Part # · Name · Category · Manufacturer · Stock Level · Min Stock · Cost Price · Sell Price · Location · Status

**Filtering:**
- Search by part number, name, or description
- Filter by Category (12 categories available)
- Filter by Status (In Stock / Low Stock / Out of Stock)

#### Part Status

| Status | Colour | Meaning |
|--------|--------|---------|
| In Stock | Green | Current stock ≥ minimum stock |
| Low Stock | Yellow | Current stock < minimum stock |
| Out of Stock | Red | Current stock = 0 |

#### Adding a New Part

Click **Add Part**. The form is divided into three sections:

**Basic Information:**

| Field | Required |
|-------|----------|
| Part Number | ✓ |
| Name | ✓ |
| Description | ✓ |
| Category | ✓ |
| Manufacturer | ✓ |
| Supplier | ✓ (select from list) |

**Stock Information:**

| Field | Required | Notes |
|-------|----------|-------|
| Current Stock | ✓ | Opening balance |
| Minimum Stock | ✓ | Triggers "Low Stock" alert |
| Maximum Stock | ✓ | Upper storage capacity |
| Reorder Point | ✓ | Suggested order trigger level |

**Pricing & Location:**

| Field | Required | Notes |
|-------|----------|-------|
| Unit | ✓ | Pieces / Litres / Sets / Boxes / Pairs |
| Cost Price | ✓ | Purchase price (Kz) |
| Sell Price | ✓ | Price charged to customer (Kz) |
| Storage Location | ✓ | e.g. "A-12" (shelf/bay reference) |

Click **Add Part** to save.

### Stock Movements Tab

All inventory transactions are recorded here. This provides a full audit trail for stock changes.

**Movement types:**

| Type | Colour | Meaning |
|------|--------|---------|
| Purchase | Green | Stock received from supplier |
| Sale | Blue | Part used on a job |
| Return | Orange | Part returned to supplier or by customer |
| Adjustment | Grey | Manual stock correction |

**Table columns:** Date · Part # · Name · Type · Quantity (+/-) · Reference (Job/PO number) · Notes

> Stock is shown as positive (+) for incoming movements and negative (−) for outgoing.

### Suppliers Tab

Manage supplier information and track purchase history.

**Supplier information shown:** Name · Contact Person · Phone · Email · Rating (1–5 stars) · Total Purchases (Kz)

**Adding a New Supplier:**

Click **Add Supplier** and fill in:
- Supplier Name (required)
- Contact Person (required)
- Phone (required)
- Email (required)
- Address (required)
- Rating (1–5)

### Reorder Alerts

If any parts fall below their reorder point, an orange alert panel appears at the bottom of the screen listing all parts that need to be restocked with their current stock, minimum stock, and reorder point.

### Exporting

- **Parts Catalog** — Click **Export Excel** to download the full parts list
- **Stock Movements** — Click **Export** on the Stock Movements tab to download the movement history

---

## 9. Workshop KPIs

### Overview

The KPIs module tracks and visualises key performance indicators for the workshop and individual technicians. It is designed for management review and daily operational monitoring.

### KPI Cards

Six KPI cards are displayed on the main screen:

| KPI | Target | What It Measures |
|-----|--------|-----------------|
| Appointment Fill Rate | 90% | Booked slots ÷ Available slots |
| Revenue Per Technician/Day | 1,500 Kz | Average daily revenue generated per active technician |
| Gross Profit % | 45% | (Revenue − Cost of Sales) ÷ Revenue |
| Technician Efficiency | 95% | Billable hours ÷ Total clocked hours |
| Technician Productivity | 90% | Efficiency × Effectiveness (composite metric) |
| Bay / Lift Utilisation | 85% | Occupied bay-hours ÷ Available bay-hours |

Each card shows:
- Current value and trend vs previous period (↑ green / ↓ red)
- Status badge: **Good** (green) / **Warning** (yellow) / **Critical** (red)
- A progress bar relative to the target
- Clickable for drill-down on Revenue, Efficiency, and Productivity cards

### KPI Drill-Down

Click the **Revenue**, **Efficiency**, or **Productivity** KPI cards to open the drill-down dialog showing individual technician breakdowns.

### Efficiency & Productivity Breakdown Panel

The left breakdown panel on the main screen shows:

- **Efficiency Rate** — Billable hours ÷ Total hours (%)
- **Effectiveness Rate** — Actual performance vs standard hours (%)
- **Overall Productivity** — Efficiency × Effectiveness (composite %)
- Formula reference for the productivity calculation

### Bay Utilisation Panel

The right panel shows:
- Total bays and current utilisation %
- Occupied hours vs available hours with a progress bar
- Whether the workshop is on track vs target

### Technician Drill-Down Dialog

When you open a drill-down view, all technicians are shown. Click any technician to open their individual detail view.

**Individual technician view shows:**

| Section | Details |
|---------|---------|
| Efficiency card | Efficiency %, billable hours / total hours |
| Revenue card | Revenue per day (Kz) |
| Jobs Completed card | Count for the period |
| Certifications | List of qualifications |
| Job History table | Recent jobs with: Date, Vehicle, Job Type, Quoted Hours, Actual Hours, Revenue, Customer Rating |

### Comparison Mode

Click **Compare Technicians** in the drill-down dialog to enter comparison mode.

1. Select 2 or 3 technicians by clicking their cards (checkboxes appear).
2. Click **View Comparison** to see a side-by-side comparison of efficiency, productivity, effectiveness, revenue, jobs completed, and avg job time.

---

## 10. Accounting

The Accounting module is a full double-entry bookkeeping system compliant with Angolan GAAP (Sistema de Normalização Contabilística). It is organised across ten tabs.

---

### 10.1 Chart of Accounts

The Chart of Accounts lists every account used in the system, organised by type.

**Account Types:**

| Type | Colour | Examples |
|------|--------|---------|
| Asset | Blue | Cash, Bank, Accounts Receivable, Inventory |
| Liability | Red | Accounts Payable, VAT Payable, Loans |
| Equity | Purple | Share Capital, Retained Earnings |
| Revenue | Green | Service Revenue, Parts Revenue |
| Expense | Orange | Cost of Parts, Labour, Rent, Utilities |

Each account shows: Account Code · Name (English & Portuguese) · Category · Current Balance · Currency (AOA / USD).

**Filtering:** Use the type buttons (All / Assets / Liabilities / Equity / Revenue / Expenses) to show only accounts of a chosen type.

**Export:** Click **Export Excel** to download the full chart of accounts.

---

### 10.2 Journal Entries

All financial transactions are recorded here as double-entry journal entries.

**Entry format:**
- Date, Reference Number, Description
- One or more debit lines (account + amount)
- One or more credit lines (account + amount)
- The entry is only valid when **Total Debits = Total Credits**

**To create a new entry:**
1. Click **New Journal Entry**.
2. Enter the date, reference, and description.
3. Add debit lines: select account, enter amount.
4. Add credit lines: select account, enter amount.
5. Verify the running balance (must be zero).
6. Click **Post Entry**.

**Entry statuses:** Draft · Posted

The journal table shows: Entry # · Date · Reference · Description · Total Debit · Total Credit · Status.

---

### 10.3 Trial Balance & General Ledger

**Trial Balance**
Shows every account with its debit or credit closing balance for a chosen period. Confirms that Total Debits = Total Credits across all accounts.

**General Ledger**
Shows every posted transaction for a selected account, with running balance. Use the account selector dropdown to choose which account to inspect.

---

### 10.4 Invoice Register (AR)

The Invoice Register manages all customer invoices — Accounts Receivable.

#### KPI Cards

| Card | Shows |
|------|-------|
| Outstanding | Total balance owed by all customers |
| Overdue | Balance on invoices past their due date |
| Collected | Total payments received |

#### Invoice List

Filter invoices using the status pills: **All · Sent · Overdue · Partially Paid · Paid · Draft**

**Table columns:** Invoice # · Customer · Date · Due Date · Total · Amount Paid · Balance · Status · Actions

#### Invoice Statuses

| Status | Colour | Meaning |
|--------|--------|---------|
| Draft | Slate | Created, not yet sent |
| Sent | Blue | Sent to customer, awaiting payment |
| Overdue | Red | Due date passed, unpaid |
| Partially Paid | Yellow | Some payment received |
| Paid | Green | Fully settled |

#### Recording a Payment

Click **Record Payment** on an invoice row. Fill in:

| Field | Required |
|-------|----------|
| Amount | ✓ (must not exceed balance) |
| Payment Method | ✓ |
| Payment Date | ✓ |
| Reference | — (cheque number, bank ref, etc.) |

**Payment methods:** Bank Transfer · Cash · Card · Mobile Money · Cheque

Click **Apply Payment**. The invoice balance updates and the status changes automatically (Partially Paid → Paid once balance reaches zero).

#### Exporting

Click **Export CSV** to download the AR register.

---

### 10.5 Bills Register (AP)

The Bills Register manages all vendor invoices — Accounts Payable.

#### KPI Cards

| Card | Shows |
|------|-------|
| Total Payable | Outstanding balance owed to suppliers |
| Overdue | Overdue payables |
| Paid | Total bills settled |

#### Bill List

Filter using the status pills: **All · Pending · Overdue · Partially Paid · Paid**

**Table columns:** Bill # · Vendor · Date · Due Date · Category · Total · Paid · Balance · Status · Actions

#### Bill Categories and Expense Accounts

| Category | Expense Account |
|----------|----------------|
| Parts Purchase | 5010 — Cost of Sales (Parts) |
| Labour / Subcontract | 5020 — Cost of Sales (Labour) |
| Maintenance & Repair | 6020 — Maintenance Expense |
| Fuel | 6030 — Fuel Expense |
| Utilities | 6040 — Utilities Expense |
| Insurance | 6050 — Insurance Expense |
| Professional Fees | 6100 — Professional Services |
| Other | 6999 — Sundry Expenses |

#### Creating a New Bill

Click **New Bill**. Fill in:

| Field | Required | Notes |
|-------|----------|-------|
| Vendor Name | ✓ | |
| Date | ✓ | Invoice date |
| Due Date | ✓ | |
| Category | ✓ | Maps to expense account |
| Description | ✓ | |
| Subtotal | ✓ | VAT (14%) auto-calculated |

Total = Subtotal + VAT. Click **Save**.

#### Recording a Payment on a Bill

Same process as the Invoice Register — click **Pay Bill**, enter amount, method, date, and reference.

---

### 10.6 Financial Reports

Three standard financial statements are available.

#### Profit & Loss Statement

Shows revenue, cost of sales, and expenses over a chosen date range.

**Structure:**
```
Revenue
  Service Revenue              xxx,xxx Kz
  Parts Revenue                xxx,xxx Kz
  ─────────────────────────────────────────
  Total Revenue                xxx,xxx Kz

Cost of Sales
  Cost of Parts Sold           (xx,xxx Kz)
  Labour — Direct Costs        (xx,xxx Kz)
  ─────────────────────────────────────────
  Gross Profit                 xxx,xxx Kz

Operating Expenses
  Rent                         (xx,xxx Kz)
  Salaries & Wages             (xx,xxx Kz)
  Utilities                    (xx,xxx Kz)
  ... (all expense accounts)
  ─────────────────────────────────────────
  Operating Profit             xxx,xxx Kz

  Net Income                   xxx,xxx Kz
```

Use the **From** and **To** date pickers to set the reporting period. Click **Export CSV** to download.

#### Balance Sheet

Shows the financial position at a point in time.

**Structure:**
```
Assets
  Current Assets
    Cash & Bank                xxx,xxx Kz
    Accounts Receivable        xxx,xxx Kz
    Inventory                  xxx,xxx Kz
  Non-Current Assets
    Property & Equipment       xxx,xxx Kz
  ─────────────────────────────────────────
  Total Assets                 xxx,xxx Kz

Liabilities
  Current Liabilities
    Accounts Payable           (xx,xxx Kz)
    VAT Payable                (xx,xxx Kz)
  ─────────────────────────────────────────
  Total Liabilities            (xx,xxx Kz)

Equity
  Share Capital                xxx,xxx Kz
  Retained Earnings            xxx,xxx Kz
  ─────────────────────────────────────────
  Total Equity                 xxx,xxx Kz

Total Liabilities + Equity     xxx,xxx Kz  ← Must equal Total Assets
```

#### AR Ageing Report

Shows outstanding customer balances grouped by how overdue they are — used to prioritise collection efforts.

**Columns:** Customer · Current (0–30 days) · 31–60 days · 61–90 days · 90+ days · Total

The last row shows totals for each ageing bucket. Click **Export CSV** to download.

---

### 10.7 Customer Statements

Generate a formal account statement for any customer showing all their invoices and payment history.

**Steps:**
1. Select a customer from the dropdown (shows only customers who have invoices).
2. The screen shows three summary cards: Total Billed · Total Paid · Outstanding balance.
3. The invoice table lists all invoices with: Invoice # · Date · Due Date · Job # · Total · Paid · Balance · Days Outstanding · Status.
4. Click **Export Statement PDF** to generate a formatted PDF for the customer.

**Days Outstanding** is calculated as today's date minus the invoice due date (shown in red for overdue invoices).

---

### 10.8 Exchange Rates

Shows current exchange rates between Angolan Kwanza (AOA) and other currencies (USD, EUR, etc.). Exchange rates are used when posting multi-currency transactions in the Journal.

---

### 10.9 Period Close

The Period Close tab provides tools to close accounting periods (month-end / year-end):
- Review all unposted journal entries before closing
- Post closing entries (income summary to retained earnings)
- Lock the period to prevent further entries

---

## 11. Language Switcher

The language switcher is at the bottom of the left sidebar.

**To change language:**
1. Click the language button (shows the current flag and language name).
2. A dropdown opens upward showing all five languages.
3. Click the desired language. All text in the application updates immediately.
4. Your selection is saved in the browser and will be remembered when you return.

The language affects all UI labels, button text, table headers, dialog titles, and status values throughout the application. Data (customer names, vehicle plates, part numbers, etc.) is not translated — only the interface labels.

---

## 12. Key Workflows End-to-End

### Workflow A: New Customer Booking → Completed Invoice

```
1. CUSTOMER CALLS / WALKS IN
   └─► Go to: Appointments → New Appointment
       ├─ Search for existing customer (or create new)
       ├─ Select / create vehicle
       ├─ Choose date, time, service type
       └─ Click Save  →  Status: Scheduled

2. CONFIRM APPOINTMENT
   └─► On appointment card → click Confirm  →  Status: Confirmed

3. VEHICLE ARRIVES
   └─► Click Start  →  Status: In Progress
   └─► (Optional) Go to Vehicles in Service
       └─ Change stage to "On Bay"

4. OPEN JOB CARD
   └─► On appointment card → click Open Job Card
       ├─ Add labour lines (description, hours, rate)
       ├─ Add parts lines (part#, qty, price)
       └─ Click Save Job Card

5. UPDATE WORKSHOP STAGE
   └─► Vehicles in Service → change stage:
       On Bay → Diagnosis → Quality Control → Washing → Waiting Collection

6. CLOSE JOB & GENERATE INVOICE
   └─► Appointment → Open Job Card → Close Job & Generate Invoice
       ├─ PDF invoice auto-exported
       ├─ Status: Completed
       └─ Accounting entry posted automatically

7. RECORD PAYMENT
   └─► Accounting → Invoice Register (AR)
       └─ Find invoice → Record Payment
           ├─ Enter amount and payment method
           └─ Status updates: Sent → Paid
```

### Workflow B: Quotation Request → Approved Job

```
1. CUSTOMER REQUESTS QUOTE
   └─► Go to: Quotations & Jobs → New Quotation
       ├─ Select customer and vehicle
       ├─ Add labour and parts items
       └─ Save as Draft

2. SEND QUOTE TO CUSTOMER
   └─► On quotation → Send & Export PDF
       └─ Status: Sent  (PDF downloaded for email/print)

3. CUSTOMER APPROVES
   └─► On quotation → Approve
       └─ Status: Approved

4. CONVERT TO JOB
   └─► On quotation → Convert to Job
       └─ Job created with same items  →  Status: Pending

5. WORK BEGINS
   └─► Job status → In Progress
   └─► (Optional) Create appointment linked to this job

6. COMPLETE JOB → INVOICE
   └─► Job → Generate Invoice
       └─ Invoice created; PDF exported; accounting posted

7. COLLECT PAYMENT
   └─► Accounting → Invoice Register → Record Payment
```

### Workflow C: Parts Procurement

```
1. REORDER ALERT APPEARS
   └─► Parts & Inventory → red alert panel (below main content)
       └─ Lists all parts below reorder point

2. CHECK SUPPLIER DETAILS
   └─► Parts & Inventory → Suppliers tab
       └─ Find supplier for required parts
           └─ Note contact details for order

3. PLACE ORDER (EXTERNAL)
   └─► Contact supplier directly (outside system)

4. RECEIVE PARTS
   └─► Parts & Inventory → Stock Movements tab
   └─► (Or) Accounting → Bills Register → New Bill
       ├─ Enter supplier invoice details
       ├─ Category: Parts Purchase
       └─ Save bill → AP balance updated

5. PAY SUPPLIER INVOICE
   └─► Accounting → Bills Register → Pay Bill
       └─ Enter payment details → status: Paid
```

### Workflow D: Month-End Accounting

```
1. REVIEW OUTSTANDING AR
   └─► Accounting → Invoice Register
       └─ Filter: Overdue — contact customers with overdue balances
   └─► Accounting → Financial Reports → AR Ageing
       └─ Export CSV for collections follow-up

2. REVIEW OUTSTANDING AP
   └─► Accounting → Bills Register
       └─ Filter: Overdue — schedule payments to suppliers

3. GENERATE FINANCIAL STATEMENTS
   └─► Accounting → Financial Reports
       ├─ Profit & Loss: set From/To date range → Export
       └─ Balance Sheet → Export

4. SEND CUSTOMER STATEMENTS
   └─► Accounting → Customer Statements
       ├─ Select each customer with outstanding balance
       └─ Export Statement PDF → send to customer

5. CLOSE THE PERIOD
   └─► Accounting → Period Close
       ├─ Review unposted entries
       ├─ Post closing entries
       └─ Lock period
```

---

## 13. Document & Data Exports

The system provides multiple export options depending on the module:

| Module | Export Type | Format | Content |
|--------|-------------|--------|---------|
| Dashboard | System Documentation | PDF | Full system overview |
| Appointments | Appointments Schedule | Excel | All appointments with details |
| Quotations | Quotation | PDF | Formal customer quote |
| Jobs | Invoice | PDF | Tax invoice for customer |
| CRM | Customer Data | Excel | All customer records |
| Vehicle Database | (via CRM) | — | — |
| Vehicles in Service | Board Snapshot | Excel | Current workshop status |
| Parts — Catalog | Parts List | Excel | Full parts catalogue |
| Parts — Movements | Stock History | Excel | Movement log |
| KPIs | Technician Report | Excel | Individual technician detail |
| Accounting — AR | Invoice Register | CSV | All AR invoices |
| Accounting — AP | Bills Register | CSV | All vendor bills |
| Accounting — P&L | Profit & Loss | CSV | Income statement |
| Accounting — BS | Balance Sheet | CSV | Balance sheet |
| Accounting — Aging | AR Ageing | CSV | Collection report |
| Accounting — Statements | Customer Statement | PDF | Individual customer statement |
| Accounting — COA | Chart of Accounts | Excel | All accounts |

---

## 14. Reference: Number Formats & Status Values

### Document Number Formats

| Document Type | Format | Example |
|---------------|--------|---------|
| Appointment | `APT-YYYY-NNN` | APT-2026-007 |
| Quotation | `QUO-YYYY-NNN` | QUO-2026-003 |
| Job Card | `JOB-YYYY-NNN` | JOB-2026-012 |
| Invoice | `INV-YYYY-NNN` | INV-2026-015 |
| Vendor Bill | `BILL-YYYY-NNN` | BILL-2026-004 |

### Currency & VAT

- **Currency:** Angolan Kwanza (Kz / AOA)
- **Number format:** `1,234,567.89 Kz` (locale: pt-AO)
- **Standard VAT rate:** 14% (applied to all sales and purchases)
- **VAT calculation:** Total = Subtotal × 1.14

### All Status Values

**Appointments**

| Value | Label |
|-------|-------|
| `scheduled` | Scheduled |
| `confirmed` | Confirmed |
| `in-progress` | In Progress |
| `completed` | Completed |
| `cancelled` | Cancelled |
| `no-show` | No Show |

**Quotations**

| Value | Label |
|-------|-------|
| `draft` | Draft |
| `sent` | Sent |
| `approved` | Approved |
| `rejected` | Rejected |
| `expired` | Expired |

**Jobs**

| Value | Label |
|-------|-------|
| `pending` | Pending |
| `in-progress` | In Progress |
| `completed` | Completed |
| `invoiced` | Invoiced |

**Invoices (AR)**

| Value | Label |
|-------|-------|
| `draft` | Draft |
| `sent` | Sent |
| `overdue` | Overdue |
| `partially_paid` | Partially Paid |
| `paid` | Paid |

**Vendor Bills (AP)**

| Value | Label |
|-------|-------|
| `draft` | Draft |
| `pending` | Pending |
| `overdue` | Overdue |
| `partially_paid` | Partially Paid |
| `paid` | Paid |

**Vehicles in Service Stages**

| Value | Label |
|-------|-------|
| `on-bay` | On Bay |
| `diagnosis` | Diagnosis |
| `quality-control` | Quality Control |
| `washing` | Washing |
| `waiting-for-collection` | Waiting Collection |

**Parts**

| Value | Label |
|-------|-------|
| `in-stock` | In Stock |
| `low-stock` | Low Stock |
| `out-of-stock` | Out of Stock |
| `discontinued` | Discontinued |

**Customers**

| Value | Label |
|-------|-------|
| `active` | Active |
| `vip` | VIP |
| `prospect` | Prospect |
| `inactive` | Inactive |
| `blacklisted` | Blacklisted |

---

*AutoGP Workshop Management System · Angolan GAAP Compliant · © 2026*
