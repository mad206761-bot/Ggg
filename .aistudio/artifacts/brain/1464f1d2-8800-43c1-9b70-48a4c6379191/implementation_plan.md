# FuelLedger India - Petrol Pump Daily Account Management App

A production-ready, touch-optimized Progressive Web Application designed for Indian fuel pump dealers, managers, and cashiers to manage daily fuel sales, digital transactions (Paytm, UPI, Card), density testing deductions, physical currency counting, and daily cash reconciliation with zero math errors.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during the clarification interview:
> - **Bilingual Interface**: Full English and Hindi (हिंदी) instant language toggle across the entire application, labels, reports, and currency notes.
> - **Accounting Structure**: Full day single closing record with calendar date picker, automatic persistence, and historical review/editing without mutating past rates or readings.
> - **Branding & Header**: Station name and preset customization (IndianOil, Bharat Petroleum, HP, Nayara, or custom dealer name) appearing on dashboard, daily records, and printable reports.

---

## 1. Overview & Core Concept

- **What It Does**: Automates the daily end-of-day reconciliation for petrol pumps. Tracks opening and closing meter readings for Machine 1 & 2 (Petrol & Diesel), calculates litres sold and total fuel revenue, logs granular digital transactions (Paytm, UPI, Card), deducts daily fuel testing (litres or direct rupee modes), counts Indian physical cash currency notes (₹500, ₹200, ₹100, ₹50, ₹20, ₹10 + coins), and computes expected vs. actual cash with instant short/excess discrepancy alerts.
- **Target Audience**: Petrol pump owners, shift managers, cashiers, and nozzle attendants in India operating on Android smartphones or tablets in outdoor/office pump environments.
- **Key Value**: Replaces error-prone manual register notebooks with foolproof automated math, instant digital payment auditing, complete offline persistence, PDF export/printing, and JSON backup/restore.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Daily Dashboard**: View high-level summary cards (Total Sales, Digital Payments, Testing Deductions, Expected Cash, Actual Cash Counted, and Short/Excess status). Quick-action buttons to jump directly into specific workflows.
2. **Fuel Rates & Machines (Meter Readings)**: Enter petrol and diesel daily prices per litre. For Machine 1 and Machine 2 (each with Petrol and Diesel nozzles), enter opening and closing meter readings. Litres sold and revenue calculate automatically.
3. **Digital Payments Ledger**: Tabbed interface for Paytm, UPI, and Card. Add individual transactions with timestamp and amount. Edit or delete entries with real-time recalculation of category totals.
4. **Testing Deductions**: Separate sections for Petrol and Diesel testing. Select Mode A (enter testing litres, automatically calculated via today's rate) or Mode B (enter direct rupee testing deduction without inventing fake litres).
5. **Denomination Cash Calculator**: Dedicated Indian currency counter with standard notes (₹500, ₹200, ₹100, ₹50, ₹20, ₹10) and an extra coin/adjustments field. Tap +/- buttons or enter quantity directly; each row calculates subtotal and sum updates live.
6. **Cash Difference & Reconciliation**: Explicit formula breakdown displaying:
   $$\text{Expected Cash} = \text{Total Fuel Sales} - (\text{Paytm} + \text{UPI} + \text{Card}) - (\text{Petrol Testing} + \text{Diesel Testing}) \pm \text{Adjustments}$$
   Displays discrepancy tag: **Exact** (Green), **Short** (Red), or **Excess** (Blue).
7. **Daily Records & PDF/Print Report**: Browse records by date, create new daily record with yesterday's closing readings automatically proposed as today's opening readings, generate a clean thermal/A4 printable audit report, and export PDF.
8. **Settings & Backup**: Toggle English / Hindi, edit station details, and export/import full JSON database backup.

### Visual Identity & Theme

- **Palette**: Clean industrial petroleum palette:
  - Neutral canvas: Clean slate background (`bg-slate-50` / `dark:bg-slate-950`)
  - Fuel identity: Emerald green for Petrol (`#059669`), Warm Amber for Diesel (`#d97706`)
  - Accent: Petroleum navy blue (`#0f172a` / `#1e3a8a`) for primary CTA and cash highlights
  - Status cues: Crimson (`#dc2626`) for cash short, Emerald (`#16a34a`) for balanced/exact, Royal Blue (`#2563eb`) for excess
- **Typography & Ergonomics**:
  - Headings: `Plus Jakarta Sans`, clean modern geometric display
  - Numbers: `font-mono tabular-nums` for crisp column alignment of rupee and litre values
  - Touch targets: All buttons and inputs designed for 48px+ touch hitboxes for effortless single-hand thumb tapping on Android phones.
- **Top Bar & Bottom Nav Contract**:
  - Sticky top bar with station name, date pill, and instant language switch (EN / हि).
  - Ergonomic bottom navigation with 5 key tabs: **Dashboard**, **Meters**, **Digital**, **Testing & Cash**, **Reports**.

---

## 3. Key Product Decisions & Trade-Offs

- **Isolated Historical Daily Records**: Each day is stored as an independent record object keyed by ISO date string (`YYYY-MM-DD`). Changing today's fuel rate or nozzle readings strictly updates today's record and never alters historical days.
- **Smart Opening Reading Carryover**: When creating a new day, the system automatically pulls the previous day's closing readings for Machine 1 & 2 as the initial opening readings, saving pump managers from re-entering numbers every morning.
- **Dual-Mode Fuel Testing Math**: Mode A computes `Litres × Rate = Amount`. Mode B directly inputs `Rupees` and keeps `litres: null` to avoid hallucinated fractions of litres.
- **Offline-First Resilience**: All accounts are persisted in `localStorage` with error-guarded serialization. In-app export produces a downloadable `.json` backup file that can be restored on any Android or desktop browser.
- **PWA Ready**: Manifest, mobile meta tags, touch icons, and an in-app "Install App" button configured for native Android home-screen installation.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FuelLedger PWA (React 19 + TypeScript)               │
├────────────────────────────────┬───────────────────────────────────────┤
│ Top App Bar (Station + Lang)   │ PWA Install Button & Network Status   │
├────────────────────────────────┴───────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────────────┐  │
│  │   Active Date   │  │   Daily Fuel    │  │  Bilingual Language    │  │
│  │   Controller    │  │  Rates Storage  │  │   Context (EN / HI)    │  │
│  └────────┬────────┘  └────────┬────────┘  └───────────┬────────────┘  │
│           │                    │                       │               │
│  ┌────────▼────────────────────▼───────────────────────▼────────────┐  │
│  │                    Core Daily Record State                       │  │
│  │  • Machine 1 & 2 Meter Readings (Petrol & Diesel)                │  │
│  │  • Digital Payments Ledger (Paytm, UPI, Card lists)              │  │
│  │  • Testing Entries (Litres mode & Direct Rupee mode)             │  │
│  │  • Cash Denominations (₹500, ₹200, ₹100, ₹50, ₹20, ₹10, Coins)   │  │
│  │  • Cash Adjustments (Deposits / Withdrawals)                     │  │
│  └────────┬────────────────────────────────────────────┬────────────┘  │
│           │                                            │               │
│  ┌────────▼──────────────┐                    ┌────────▼─────────────┐ │
│  │ Mathematical Engine   │                    │ Storage & Sync Hub   │ │
│  │ • Litres = Close - Open│                   │ • LocalStorage Sync  │ │
│  │ • Sales = Litres × Rate│                   │ • JSON Backup/Export │ │
│  │ • Expected Cash Calc  │                    │ • Historical Archive │ │
│  │ • Discrepancy (Diff)  │                    │ • Print / PDF Engine │ │
│  └────────┬──────────────┘                    └──────────────────────┘ │
│           │                                                            │
│  ┌────────▼─────────────────────────────────────────────────────────┐  │
│  │                        App Views & Navigation                    │  │
│  │  [Dashboard]  [Meters]  [Digital Pay]  [Testing & Cash] [Reports]│  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Schema (`DayRecord`)

```typescript
export interface MeterReading {
  opening: number;
  closing: number;
}

export interface MachineData {
  petrol: MeterReading;
  diesel: MeterReading;
}

export interface DigitalTransaction {
  id: string;
  type: 'paytm' | 'upi' | 'card';
  amount: number;
  time: string;
  note?: string;
}

export interface TestingEntry {
  id: string;
  fuelType: 'petrol' | 'diesel';
  mode: 'litres' | 'rupees';
  litres?: number;
  amount: number;
  time: string;
}

export interface CashDenominations {
  500: number;
  200: number;
  100: number;
  50: number;
  20: number;
  10: number;
  coins: number;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  rates: {
    petrol: number;
    diesel: number;
  };
  machines: {
    machine1: MachineData;
    machine2: MachineData;
  };
  digitalTransactions: DigitalTransaction[];
  testingEntries: TestingEntry[];
  cashCount: CashDenominations;
  cashAdjustments: {
    deposits: number;    // e.g. bank deposit made from counter cash
    withdrawals: number; // e.g. owner withdrawal
    note?: string;
  };
  notes?: string;
  isClosed?: boolean;
}
```

---

## 5. Execution Steps

1. **Step 1: PWA & Metadata Setup**: Update `index.html` with mobile meta tags, `metadata.json` with app title and description, and configure icons and PWA manifest.
2. **Step 2: Bilingual Dictionaries & State Store**: Create robust translation dictionary (`en` & `hi`) and central localStorage store with helper hooks for reactive persistence, date switching, and backup/restore.
3. **Step 3: Core Calculations Module**: Implement strictly verified arithmetic functions for litres sold, revenue per nozzle, digital category totals, testing deductions, expected cash, note multiplications, and short/excess difference.
4. **Step 4: View Components**:
   - `DashboardView`: KPI overview, short/excess badge, quick navigation triggers.
   - `MetersView`: Machine 1 & 2 cards with Petrol/Diesel opening & closing inputs and live sales math.
   - `DigitalPaymentsView`: Categorized transaction ledger with quick add/edit/delete modal and category summaries.
   - `TestingAndCashView`: Testing tabs (Petrol/Diesel, Litre vs Rupee modes) + Indian Currency Note Counter with live multipliers.
   - `ReportsView`: Date browser, printable slip generator, thermal receipt / A4 format preview, and PDF trigger.
   - `SettingsBackupModal`: Pump branding editor, English/Hindi selector, JSON export/import.
5. **Step 5: Verification & Testing**: Execute tests across all sample calculations, edge cases (zero closing, negative readings, multiple Paytm payments, dual testing modes), and compile the app.
