import { DayRecord, MachinesState, FuelRates, DigitalTransaction, TestingEntry, CashDenominations, CashAdjustments } from '../types';

export interface MachineCalculation {
  petrolLitres: number;
  petrolSales: number;
  dieselLitres: number;
  dieselSales: number;
  totalLitres: number;
  totalSales: number;
}

export interface FuelTotals {
  machine1: MachineCalculation;
  machine2: MachineCalculation;
  petrolTotalLitres: number;
  petrolTotalSales: number;
  dieselTotalLitres: number;
  dieselTotalSales: number;
  totalFuelLitres: number;
  totalFuelSales: number;
}

export interface DigitalTotals {
  paytmTotal: number;
  upiTotal: number;
  cardTotal: number;
  totalDigital: number;
  paytmCount: number;
  upiCount: number;
  cardCount: number;
  totalCount: number;
}

export interface TestingTotals {
  petrolTestingLitres: number;
  petrolTestingAmount: number;
  dieselTestingLitres: number;
  dieselTestingAmount: number;
  totalTestingAmount: number;
  petrolCount: number;
  dieselCount: number;
}

export interface CashSubtotals {
  500: number;
  200: number;
  100: number;
  50: number;
  20: number;
  10: number;
  coins: number;
  totalActualCash: number;
  totalNotesCount: number;
}

export type CashDifferenceStatus = 'exact' | 'short' | 'excess';

export interface ReconciliationReport {
  totalFuelSales: number;
  paytmTotal: number;
  upiTotal: number;
  cardTotal: number;
  totalDigitalDeductions: number;
  petrolTestingAmount: number;
  dieselTestingAmount: number;
  totalTestingDeductions: number;
  baseExpectedCash: number;
  deposits: number;
  withdrawals: number;
  float: number;
  expectedCashInDrawer: number;
  actualCashCounted: number;
  cashDifference: number;
  status: CashDifferenceStatus;
}

/**
 * Calculates litres sold safely avoiding negative numbers
 */
export function calculateLitres(opening: number, closing: number): number {
  if (isNaN(opening) || isNaN(closing) || closing < opening) {
    return 0;
  }
  return Number((closing - opening).toFixed(2));
}

/**
 * Calculates revenue for litres at given price per litre
 */
export function calculateSales(litres: number, rate: number): number {
  if (isNaN(litres) || isNaN(rate) || litres <= 0 || rate <= 0) {
    return 0;
  }
  return Number((litres * rate).toFixed(2));
}

/**
 * Calculates all machine fuel sales
 */
export function calculateFuelTotals(machines: MachinesState, rates: FuelRates): FuelTotals {
  const m1PetrolLitres = calculateLitres(machines.machine1.petrol.opening, machines.machine1.petrol.closing);
  const m1PetrolSales = calculateSales(m1PetrolLitres, rates.petrol);

  const m1DieselLitres = calculateLitres(machines.machine1.diesel.opening, machines.machine1.diesel.closing);
  const m1DieselSales = calculateSales(m1DieselLitres, rates.diesel);

  const m2PetrolLitres = calculateLitres(machines.machine2.petrol.opening, machines.machine2.petrol.closing);
  const m2PetrolSales = calculateSales(m2PetrolLitres, rates.petrol);

  const m2DieselLitres = calculateLitres(machines.machine2.diesel.opening, machines.machine2.diesel.closing);
  const m2DieselSales = calculateSales(m2DieselLitres, rates.diesel);

  const m1TotalLitres = Number((m1PetrolLitres + m1DieselLitres).toFixed(2));
  const m1TotalSales = Number((m1PetrolSales + m1DieselSales).toFixed(2));

  const m2TotalLitres = Number((m2PetrolLitres + m2DieselLitres).toFixed(2));
  const m2TotalSales = Number((m2PetrolSales + m2DieselSales).toFixed(2));

  const petrolTotalLitres = Number((m1PetrolLitres + m2PetrolLitres).toFixed(2));
  const petrolTotalSales = Number((m1PetrolSales + m2PetrolSales).toFixed(2));

  const dieselTotalLitres = Number((m1DieselLitres + m2DieselLitres).toFixed(2));
  const dieselTotalSales = Number((m1DieselSales + m2DieselSales).toFixed(2));

  const totalFuelLitres = Number((petrolTotalLitres + dieselTotalLitres).toFixed(2));
  const totalFuelSales = Number((petrolTotalSales + dieselTotalSales).toFixed(2));

  return {
    machine1: {
      petrolLitres: m1PetrolLitres,
      petrolSales: m1PetrolSales,
      dieselLitres: m1DieselLitres,
      dieselSales: m1DieselSales,
      totalLitres: m1TotalLitres,
      totalSales: m1TotalSales,
    },
    machine2: {
      petrolLitres: m2PetrolLitres,
      petrolSales: m2PetrolSales,
      dieselLitres: m2DieselLitres,
      dieselSales: m2DieselSales,
      totalLitres: m2TotalLitres,
      totalSales: m2TotalSales,
    },
    petrolTotalLitres,
    petrolTotalSales,
    dieselTotalLitres,
    dieselTotalSales,
    totalFuelLitres,
    totalFuelSales,
  };
}

/**
 * Summarizes digital payments across Paytm, UPI, and Card
 */
export function calculateDigitalTotals(transactions: DigitalTransaction[]): DigitalTotals {
  let paytmTotal = 0;
  let upiTotal = 0;
  let cardTotal = 0;
  let paytmCount = 0;
  let upiCount = 0;
  let cardCount = 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount) || 0;
    if (amount <= 0) continue;

    if (tx.type === 'paytm') {
      paytmTotal += amount;
      paytmCount += 1;
    } else if (tx.type === 'upi') {
      upiTotal += amount;
      upiCount += 1;
    } else if (tx.type === 'card') {
      cardTotal += amount;
      cardCount += 1;
    }
  }

  paytmTotal = Number(paytmTotal.toFixed(2));
  upiTotal = Number(upiTotal.toFixed(2));
  cardTotal = Number(cardTotal.toFixed(2));
  const totalDigital = Number((paytmTotal + upiTotal + cardTotal).toFixed(2));

  return {
    paytmTotal,
    upiTotal,
    cardTotal,
    totalDigital,
    paytmCount,
    upiCount,
    cardCount,
    totalCount: transactions.length,
  };
}

/**
 * Summarizes Petrol and Diesel density testing deductions
 */
export function calculateTestingTotals(entries: TestingEntry[]): TestingTotals {
  let petrolLitres = 0;
  let petrolAmount = 0;
  let dieselLitres = 0;
  let dieselAmount = 0;
  let petrolCount = 0;
  let dieselCount = 0;

  for (const entry of entries) {
    const amount = Number(entry.amount) || 0;
    const litres = Number(entry.litres) || 0;

    if (entry.fuelType === 'petrol') {
      petrolAmount += amount;
      petrolCount += 1;
      // Only accumulate litres if specified in litres mode
      if (entry.mode === 'litres') {
        petrolLitres += litres;
      }
    } else if (entry.fuelType === 'diesel') {
      dieselAmount += amount;
      dieselCount += 1;
      if (entry.mode === 'litres') {
        dieselLitres += litres;
      }
    }
  }

  petrolLitres = Number(petrolLitres.toFixed(2));
  petrolAmount = Number(petrolAmount.toFixed(2));
  dieselLitres = Number(dieselLitres.toFixed(2));
  dieselAmount = Number(dieselAmount.toFixed(2));
  const totalTestingAmount = Number((petrolAmount + dieselAmount).toFixed(2));

  return {
    petrolTestingLitres: petrolLitres,
    petrolTestingAmount: petrolAmount,
    dieselTestingLitres: dieselLitres,
    dieselTestingAmount: dieselAmount,
    totalTestingAmount,
    petrolCount,
    dieselCount,
  };
}

/**
 * Calculates subtotals for each Indian currency note and total cash counted
 */
export function calculateCashSubtotals(cashCount: CashDenominations): CashSubtotals {
  const c500 = Math.max(0, Math.floor(Number(cashCount[500]) || 0));
  const c200 = Math.max(0, Math.floor(Number(cashCount[200]) || 0));
  const c100 = Math.max(0, Math.floor(Number(cashCount[100]) || 0));
  const c50 = Math.max(0, Math.floor(Number(cashCount[50]) || 0));
  const c20 = Math.max(0, Math.floor(Number(cashCount[20]) || 0));
  const c10 = Math.max(0, Math.floor(Number(cashCount[10]) || 0));
  const coins = Math.max(0, Number(cashCount.coins) || 0);

  const sub500 = c500 * 500;
  const sub200 = c200 * 200;
  const sub100 = c100 * 100;
  const sub50 = c50 * 50;
  const sub20 = c20 * 20;
  const sub10 = c10 * 10;

  const totalActualCash = Number((sub500 + sub200 + sub100 + sub50 + sub20 + sub10 + coins).toFixed(2));
  const totalNotesCount = c500 + c200 + c100 + c50 + c20 + c10;

  return {
    500: sub500,
    200: sub200,
    100: sub100,
    50: sub50,
    20: sub20,
    10: sub10,
    coins,
    totalActualCash,
    totalNotesCount,
  };
}

/**
 * Computes Expected Cash and Cash Difference (Short / Exact / Excess)
 * Formula:
 * Base Expected Cash = Total Sales - Paytm - UPI - Card - Petrol Testing - Diesel Testing
 * Effective Drawer Cash = Base Expected Cash - Bank Deposits - Owner Withdrawals + Counter Float
 * Cash Difference = Actual Cash Counted - Effective Drawer Cash
 */
export function calculateReconciliation(record: DayRecord): ReconciliationReport {
  const fuelTotals = calculateFuelTotals(record.machines, record.rates);
  const digitalTotals = calculateDigitalTotals(record.digitalTransactions);
  const testingTotals = calculateTestingTotals(record.testingEntries);
  const cashTotals = calculateCashSubtotals(record.cashCount);

  const totalFuelSales = fuelTotals.totalFuelSales;
  const totalDigitalDeductions = digitalTotals.totalDigital;
  const totalTestingDeductions = testingTotals.totalTestingAmount;

  // Base expected cash generated from fuel transactions today
  const baseExpectedCash = Number((totalFuelSales - totalDigitalDeductions - totalTestingDeductions).toFixed(2));

  const deposits = Math.max(0, Number(record.cashAdjustments?.deposits) || 0);
  const withdrawals = Math.max(0, Number(record.cashAdjustments?.withdrawals) || 0);
  const float = Math.max(0, Number(record.cashAdjustments?.float) || 0);

  // Cash expected to physically remain in the till / cash box
  const expectedCashInDrawer = Number((baseExpectedCash - deposits - withdrawals + float).toFixed(2));
  const actualCashCounted = cashTotals.totalActualCash;

  const cashDifference = Number((actualCashCounted - expectedCashInDrawer).toFixed(2));

  let status: CashDifferenceStatus = 'exact';
  if (Math.abs(cashDifference) < 0.01) {
    status = 'exact';
  } else if (cashDifference > 0) {
    status = 'excess';
  } else {
    status = 'short';
  }

  return {
    totalFuelSales,
    paytmTotal: digitalTotals.paytmTotal,
    upiTotal: digitalTotals.upiTotal,
    cardTotal: digitalTotals.cardTotal,
    totalDigitalDeductions,
    petrolTestingAmount: testingTotals.petrolTestingAmount,
    dieselTestingAmount: testingTotals.dieselTestingAmount,
    totalTestingDeductions,
    baseExpectedCash,
    deposits,
    withdrawals,
    float,
    expectedCashInDrawer,
    actualCashCounted,
    cashDifference,
    status,
  };
}

/**
 * Indian Rupee number formatter with comma separation (e.g., ₹ 1,23,456.00)
 */
export function formatCurrency(amount: number, showDecimals = true): string {
  const val = Number(amount) || 0;
  const sign = val < 0 ? '-' : '';
  const absVal = Math.abs(val);

  const parts = showDecimals ? absVal.toFixed(2).split('.') : [Math.round(absVal).toString()];
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian currency numbering regex: last 3 digits, then groups of 2
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    integerPart = lastThree;
  }

  return `${sign}₹ ${integerPart}${showDecimals ? '.' + decimalPart : ''}`;
}

/**
 * Litres formatter
 */
export function formatLitres(litres: number): string {
  const val = Number(litres) || 0;
  const parts = val.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    integerPart = lastThree;
  }

  return `${integerPart}.${decimalPart} L`;
}
