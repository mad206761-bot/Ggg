import { DayRecord, StationSettings, FuelRates } from '../types';

const RECORDS_STORAGE_KEY = 'fuelledger_records_v1';
const SETTINGS_STORAGE_KEY = 'fuelledger_settings_v1';

export const DEFAULT_SETTINGS: StationSettings = {
  stationName: 'Kisan Fuel Station (IndianOil Retail)',
  dealerName: 'Sharma Petroleum & Logistics',
  location: 'NH-48 Highway, Mile 42, Jaipur',
  roCode: 'IOC-RO-782910',
  defaultPetrolRate: 104.50,
  defaultDieselRate: 92.80,
  language: 'en',
};

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Creates a pristine default day record for a given date
 */
export function createBlankDayRecord(
  date: string,
  previousRecord?: DayRecord | null,
  defaultRates?: FuelRates
): DayRecord {
  const rates: FuelRates = previousRecord?.rates
    ? { ...previousRecord.rates }
    : {
        petrol: defaultRates?.petrol || DEFAULT_SETTINGS.defaultPetrolRate,
        diesel: defaultRates?.diesel || DEFAULT_SETTINGS.defaultDieselRate,
      };

  // If a previous day exists, carry forward closing meter readings as opening readings!
  const m1PetrolOpen = previousRecord?.machines?.machine1?.petrol?.closing || 12450.5;
  const m1DieselOpen = previousRecord?.machines?.machine1?.diesel?.closing || 38900.2;
  const m2PetrolOpen = previousRecord?.machines?.machine2?.petrol?.closing || 8420.0;
  const m2DieselOpen = previousRecord?.machines?.machine2?.diesel?.closing || 51200.8;

  return {
    date,
    rates,
    machines: {
      machine1: {
        petrol: { opening: m1PetrolOpen, closing: m1PetrolOpen },
        diesel: { opening: m1DieselOpen, closing: m1DieselOpen },
      },
      machine2: {
        petrol: { opening: m2PetrolOpen, closing: m2PetrolOpen },
        diesel: { opening: m2DieselOpen, closing: m2DieselOpen },
      },
    },
    digitalTransactions: [],
    testingEntries: [],
    cashCount: {
      500: 0,
      200: 0,
      100: 0,
      50: 0,
      20: 0,
      10: 0,
      coins: 0,
    },
    cashAdjustments: {
      deposits: 0,
      withdrawals: 0,
      float: 0,
      note: '',
    },
    notes: '',
    isClosed: false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Initial sample demo record for today to ensure immediate usability and testing
 */
function createSampleDemoRecord(date: string): DayRecord {
  const petrolRate = 104.50;
  const dieselRate = 92.80;

  return {
    date,
    rates: {
      petrol: petrolRate,
      diesel: dieselRate,
    },
    machines: {
      machine1: {
        // Petrol: 12450.50 -> 12850.50 = 400.00 L * 104.50 = Rs 41,800.00
        petrol: { opening: 12450.5, closing: 12850.5 },
        // Diesel: 38900.20 -> 39550.20 = 650.00 L * 92.80 = Rs 60,320.00
        diesel: { opening: 38900.2, closing: 39550.2 },
      },
      machine2: {
        // Petrol: 8420.00 -> 8670.00 = 250.00 L * 104.50 = Rs 26,125.00
        petrol: { opening: 8420.0, closing: 8670.0 },
        // Diesel: 51200.80 -> 51750.80 = 550.00 L * 92.80 = Rs 51,040.00
        diesel: { opening: 51200.8, closing: 51750.8 },
      },
    },
    // Total Fuel Sales = 41,800 + 60,320 + 26,125 + 51,040 = Rs 1,79,285.00
    digitalTransactions: [
      { id: 'tx-1', type: 'paytm', amount: 500, time: '09:15', note: 'Swift Dzire RJ-14' },
      { id: 'tx-2', type: 'paytm', amount: 300, time: '11:40', note: 'Hero Splendor' },
      { id: 'tx-3', type: 'paytm', amount: 200, time: '14:20', note: 'Activa' }, // Paytm Total: 1000
      { id: 'tx-4', type: 'upi', amount: 3500, time: '10:05', note: 'Truck GPay Fuel' },
      { id: 'tx-5', type: 'upi', amount: 1250, time: '13:30', note: 'Creta PhonePe' },
      { id: 'tx-6', type: 'upi', amount: 2250, time: '16:15', note: 'Mahindra Bolero' }, // UPI Total: 7000
      { id: 'tx-7', type: 'card', amount: 4500, time: '12:00', note: 'Innova POS HDFC' },
      { id: 'tx-8', type: 'card', amount: 2500, time: '15:45', note: 'Kia Seltos POS' }, // Card Total: 7000
      // Digital Total = 1,000 + 7,000 + 7,000 = Rs 15,000.00
    ],
    testingEntries: [
      // Mode A: 5 Litres Petrol Testing @ 104.50 = Rs 522.50
      { id: 't-1', fuelType: 'petrol', mode: 'litres', litres: 5, amount: 522.50, time: '06:30', note: 'Morning 5L Calibration Measure' },
      // Mode B: Direct Rupees Diesel Testing = Rs 464.00 (without inventing fake litres)
      { id: 't-2', fuelType: 'diesel', mode: 'rupees', amount: 464.00, time: '06:45', note: 'Direct Rupee Density Test Check' },
      // Testing Total = 522.50 + 464.00 = Rs 986.50
    ],
    // Total Sales = 1,79,285.00
    // Digital Deductions = 15,000.00
    // Testing Deductions = 986.50
    // Base Expected Cash = 1,79,285 - 15,000 - 986.50 = 1,63,298.50
    // Bank Deposit = 50,000.00
    // Drawer Cash Expected = 1,63,298.50 - 50,000 = Rs 1,13,298.50
    cashAdjustments: {
      deposits: 50000,
      withdrawals: 0,
      float: 0,
      note: 'Afternoon SBI Cash Deposit Chq #481',
    },
    // Actual Cash Counted in Till: Rs 1,13,298.50
    // 500 x 180 = 90,000
    // 200 x 70  = 14,000
    // 100 x 80  =  8,000
    // 50 x 20   =  1,000
    // 20 x 10   =    200
    // 10 x 8    =     80
    // Coins: 18.50 -> Total: 1,13,298.50 (Exact balanced!)
    cashCount: {
      500: 180,
      200: 70,
      100: 80,
      50: 20,
      20: 10,
      10: 8,
      coins: 18.5,
    },
    notes: 'Shift completed with verified calibration and full bank handover.',
    isClosed: false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Loads all daily records from localStorage
 */
export function loadAllRecords(): Record<string, DayRecord> {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) {
      const today = getTodayDateString();
      const sample = createSampleDemoRecord(today);
      const initialStore: Record<string, DayRecord> = { [today]: sample };
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(initialStore));
      return initialStore;
    }
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.error('Error loading records from storage:', err);
    return {};
  }
}

/**
 * Saves a daily record to localStorage
 */
export function saveRecord(record: DayRecord): void {
  try {
    const records = loadAllRecords();
    records[record.date] = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving record:', err);
  }
}

/**
 * Retrieves a daily record for a specific date, or initializes it if not found
 */
export function getRecordByDate(date: string, settings?: StationSettings): DayRecord {
  const records = loadAllRecords();
  if (records[date]) {
    return records[date];
  }

  // Find previous date record if available to carry forward closing readings
  const dates = Object.keys(records).sort();
  const priorDates = dates.filter((d) => d < date);
  const previousRecord = priorDates.length > 0 ? records[priorDates[priorDates.length - 1]] : null;

  const defaultRates = settings
    ? { petrol: settings.defaultPetrolRate, diesel: settings.defaultDieselRate }
    : undefined;

  const newRecord = createBlankDayRecord(date, previousRecord, defaultRates);
  saveRecord(newRecord);
  return newRecord;
}

/**
 * Deletes a record by date
 */
export function deleteRecord(date: string): void {
  try {
    const records = loadAllRecords();
    delete records[date];
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error deleting record:', err);
  }
}

/**
 * Gets sorted list of all recorded dates
 */
export function getAvailableDates(): string[] {
  const records = loadAllRecords();
  return Object.keys(records).sort().reverse();
}

/**
 * Loads station settings
 */
export function loadSettings(): StationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error loading settings:', err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Saves station settings
 */
export function saveSettings(settings: StationSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

/**
 * Exports full backup database as formatted JSON string
 */
export function exportBackupJson(): string {
  const records = loadAllRecords();
  const settings = loadSettings();
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings,
    records,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Restores full backup database from JSON string
 */
export function importBackupJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.records || typeof parsed.records !== 'object') {
      return false;
    }
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(parsed.records));
    if (parsed.settings && typeof parsed.settings === 'object') {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsed.settings));
    }
    return true;
  } catch (err) {
    console.error('Failed to import backup:', err);
    return false;
  }
}
