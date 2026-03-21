# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on 0.0.0.0:3000 (Turbopack)
npm run build     # Production build
npm start         # Start production server
npm run lint      # TypeScript type check + ESLint
npm run format    # Format code with Biome
```

Database seeding: `GET /api/seed` endpoint (seeds sample customer data via Prisma).

## Architecture

**AutoGP** is a Next.js 16 App Router application for automotive workshop management. It uses TypeScript, Tailwind CSS, shadcn/ui (Radix UI), and Prisma ORM with PostgreSQL.

Path alias: `@/*` → `src/*`

### Key architectural note: in-memory vs. persisted data

The database schema (`prisma/schema.prisma`) only has a `Customer` model. All other modules — Appointments, Quotations/Jobs, Parts Inventory, Workshop KPIs, Accounting — use in-memory sample data defined in `src/lib/`. This is intentional prototype/demo state.

### Module structure

All UI logic lives in `src/components/`:
- `page.tsx` — Root dashboard with sidebar navigation; manages customer data via `/api/customers` and wires together all modules
- `WorkshopKPIs.tsx` — Technician efficiency/productivity/effectiveness tracking
- `ChartOfAccounts.tsx` — Full double-entry bookkeeping (Angolan GAAP, Portuguese accounting standards); converts invoices to journal entries
- `QuotationsJobs.tsx` — Quote → Job → Invoice workflow with status tracking
- `AppointmentBooking.tsx` — Appointment scheduling with technician and bay assignment
- `PartsInventory.tsx` — Stock levels, reorder tracking, supplier management

### Data/export layer (`src/lib/`)

- `chart-of-accounts.ts` — Account definitions and sample transactions for the accounting module
- `quotation-invoice.ts` — Quote/Job/Invoice data structures + jsPDF-based PDF export
- `advanced-excel-export.ts` — Multi-sheet Excel workbook generation (headers, totals, metadata)
- `export-utils.ts` — CSV, JSON, clipboard, and browser print export helpers
- `documentation-export.ts` — Generates system documentation as a PDF

### Styling

Custom Tailwind theme in `tailwind.config.ts`. shadcn/ui is configured via `components.json` (style: "default", icon lib: lucide). Several ESLint a11y rules are disabled in `eslint.config.mjs`.

### Deployment

Configured for Netlify (`netlify.toml`). External image domains whitelisted in `next.config.js`: Unsplash and `same-assets.com`.
