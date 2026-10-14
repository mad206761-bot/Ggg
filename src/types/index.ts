export type Language = 'en' | 'hi';

export interface FuelRates {
  petrol: number;
  diesel: number;
}

export interface MeterReading {
  opening: number;
  closing: number;
}

export interface MachineRecord {
  petrol: MeterReading;
  diesel: MeterReading;
}

export interface MachinesState {
  machine1: MachineRecord;
  machine2: MachineRecord;
}

export type DigitalPaymentType = 'paytm' | 'upi' | 'card';

export interface DigitalTransaction {
  id: string;
  type: DigitalPaymentType;
  amount: number;
  time: string;
  note?: string;
}

export type FuelType = 'petrol' | 'diesel';
export type TestingMode = 'litres' | 'rupees';

export interface TestingEntry {
  id: string;
  fuelType: FuelType;
  mode: TestingMode;
  litres?: number;
  amount: number;
  time: string;
  note?: string;
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

export interface CashAdjustments {
  deposits: number; // e.g. bank deposit from counter cash
  withdrawals: number; // e.g. owner withdrawal
  float: number; // opening cash float / change
  note?: string;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  rates: FuelRates;
  machines: MachinesState;
  digitalTransactions: DigitalTransaction[];
  testingEntries: TestingEntry[];
  cashCount: CashDenominations;
  cashAdjustments: CashAdjustments;
  notes?: string;
  isClosed?: boolean;
  updatedAt: string;
}

export interface StationSettings {
  stationName: string;
  dealerName: string;
  location: string;
  roCode: string;
  defaultPetrolRate: number;
  defaultDieselRate: number;
  language: Language;
}

export type ActiveTab = 'dashboard' | 'meters' | 'digital' | 'testing' | 'cash' | 'reports';
