import React, { useState } from 'react';
import { DayRecord, Language, StationSettings } from '../types';
import { getTranslation } from '../utils/translations';
import {
  calculateFuelTotals,
  calculateDigitalTotals,
  calculateTestingTotals,
  calculateCashSubtotals,
  calculateReconciliation,
  formatCurrency,
  formatLitres,
} from '../utils/calculations';
import {
  Printer,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

interface ReportsViewProps {
  record: DayRecord;
  settings: StationSettings;
  availableDates: string[];
  onSelectDate: (date: string) => void;
  onStartNewDay: () => void;
  language: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  record,
  settings,
  availableDates,
  onSelectDate,
  onStartNewDay,
  language,
}) => {
  const t = getTranslation(language);
  const [printLayout, setPrintLayout] = useState<'a4' | 'thermal'>('a4');

  const fuelTotals = calculateFuelTotals(record.machines, record.rates);
  const digitalTotals = calculateDigitalTotals(record.digitalTransactions);
  const testingTotals = calculateTestingTotals(record.testingEntries);
  const cashTotals = calculateCashSubtotals(record.cashCount);
  const recon = calculateReconciliation(record);

  const handlePrint = () => {
    window.print();
  };

  const handlePreviousDay = () => {
    const d = new Date(record.date);
    d.setDate(d.getDate() - 1);
    const prevDate = d.toISOString().split('T')[0];
    onSelectDate(prevDate);
  };

  const handleNextDay = () => {
    const d = new Date(record.date);
    d.setDate(d.getDate() + 1);
    const nextDate = d.toISOString().split('T')[0];
    onSelectDate(nextDate);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Toolbar: Date navigation & Action Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Day Navigation */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePreviousDay}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title={t.previousDay}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative flex items-center bg-slate-100 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
              <span>{record.date}</span>
              <input
                type="date"
                value={record.date}
                onChange={(e) => e.target.value && onSelectDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title={t.nextDay}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Buttons: New Day, Print & PDF */}
          <div className="flex items-center gap-2">
            <button
              onClick={onStartNewDay}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.newDay}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printReport}</span>
            </button>
          </div>
        </div>

        {/* Available Dates Pill Scroller */}
        {availableDates.length > 1 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-[11px] shrink-0 font-medium mr-1">
              History:
            </span>
            {availableDates.map((d) => (
              <button
                key={d}
                onClick={() => onSelectDate(d)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] shrink-0 transition ${
                  d === record.date
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Printable Sheet Wrapper */}
      <div
        id="printable-report"
        className="bg-white rounded-2xl border border-slate-300 shadow-sm p-4 sm:p-8 max-w-3xl mx-auto print-page font-sans text-slate-900"
      >
        {/* Report Official Header */}
        <div className="text-center pb-4 border-b-2 border-slate-800">
          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
            {settings.stationName || 'FUEL CENTER (INDIANOIL)'}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {settings.dealerName && `${settings.dealerName} · `}
            {settings.location}
            {settings.roCode && ` · RO Code: ${settings.roCode}`}
          </p>
          <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-bold font-mono tracking-wide">
            DAILY ACCOUNT & CASH RECONCILIATION STATEMENT
          </div>
        </div>

        {/* Date, Time & Rates Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-b border-slate-200 text-xs bg-slate-50 -mx-4 sm:-mx-8 px-4 sm:px-8">
          <div>
            <span className="text-slate-500 block text-[10px]">STATEMENT DATE</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{record.date}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">GENERATED AT</span>
            <span className="font-mono text-slate-700 text-xs">
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">PETROL RATE (MS)</span>
            <span className="font-mono font-bold text-emerald-800 text-sm">
              {formatCurrency(record.rates.petrol)}/L
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">DIESEL RATE (HSD)</span>
            <span className="font-mono font-bold text-amber-800 text-sm">
              {formatCurrency(record.rates.diesel)}/L
            </span>
          </div>
        </div>

        {/* Section 1: Meter Readings & Dispenser Sales */}
        <div className="py-4 border-b border-slate-200 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
            <span>{t.meterSection}</span>
            <span className="text-emerald-700 font-mono font-bold">
              Total: {formatCurrency(fuelTotals.totalFuelSales)}
            </span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2 px-2">Dispenser / Nozzle</th>
                  <th className="py-2 px-2 text-right">Opening</th>
                  <th className="py-2 px-2 text-right">Closing</th>
                  <th className="py-2 px-2 text-right">Litres Sold</th>
                  <th className="py-2 px-2 text-right">Rate</th>
                  <th className="py-2 px-2 text-right">Sales Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {/* M1 Petrol */}
                <tr>
                  <td className="py-2 px-2 font-sans font-semibold text-slate-900">
                    M1 - Petrol (MS)
                  </td>
                  <td className="py-2 px-2 text-right text-slate-600">
                    {record.machines.machine1.petrol.opening.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-900 font-semibold">
                    {record.machines.machine1.petrol.closing.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">
                    {formatLitres(fuelTotals.machine1.petrolLitres)}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-600">
                    ₹{record.rates.petrol.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">
                    {formatCurrency(fuelTotals.machine1.petrolSales)}
                  </td>
                </tr>

                {/* M1 Diesel */}
                <tr>
                  <td className="py-2 px-2 font-sans font-semibold text-slate-900">
                    M1 - Diesel (HSD)
                  </td>
                  <td className="py-2 px-2 text-right text-slate-600">
                    {record.machines.machine1.diesel.opening.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-900 font-semibold">
                    {record.machines.machine1.diesel.closing.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">
                    {formatLitres(fuelTotals.machine1.dieselLitres)}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-600">
                    ₹{record.rates.diesel.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">
                    {formatCurrency(fuelTotals.machine1.dieselSales)}
                  </td>
                </tr>

                {/* M2 Petrol */}
                <tr>
                  <td className="py-2 px-2 font-sans font-semibold text-slate-900">
                    M2 - Petrol (MS)
                  </td>
                  <td className="py-2 px-2 text-right text-slate-600">
                    {record.machines.machine2.petrol.opening.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-900 font-semibold">
                    {record.machines.machine2.petrol.closing.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">
                    {formatLitres(fuelTotals.machine2.petrolLitres)}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-600">
                    ₹{record.rates.petrol.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">
                    {formatCurrency(fuelTotals.machine2.petrolSales)}
                  </td>
                </tr>

                {/* M2 Diesel */}
                <tr>
                  <td className="py-2 px-2 font-sans font-semibold text-slate-900">
                    M2 - Diesel (HSD)
                  </td>
                  <td className="py-2 px-2 text-right text-slate-600">
                    {record.machines.machine2.diesel.opening.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-900 font-semibold">
                    {record.machines.machine2.diesel.closing.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">
                    {formatLitres(fuelTotals.machine2.dieselLitres)}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-600">
                    ₹{record.rates.diesel.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">
                    {formatCurrency(fuelTotals.machine2.dieselSales)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td colSpan={3} className="py-2 px-2 font-sans text-slate-900">
                    TOTAL FUEL SALES
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-emerald-900">
                    {formatLitres(fuelTotals.totalFuelLitres)}
                  </td>
                  <td className="py-2 px-2"></td>
                  <td className="py-2 px-2 text-right font-mono text-emerald-900 text-sm">
                    {formatCurrency(fuelTotals.totalFuelSales)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Section 2 & 3: Digital Payments & Testing Deductions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
          {/* Digital Deductions */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-2 flex items-center justify-between">
              <span>{t.digitalSection}</span>
              <span className="font-mono text-rose-700">
                -{formatCurrency(digitalTotals.totalDigital)}
              </span>
            </h4>
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">Paytm ({digitalTotals.paytmCount} txns):</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(digitalTotals.paytmTotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">UPI ({digitalTotals.upiCount} txns):</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(digitalTotals.upiTotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">Card POS ({digitalTotals.cardCount} txns):</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(digitalTotals.cardTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Testing Deductions */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-2 flex items-center justify-between">
              <span>{t.testingSection}</span>
              <span className="font-mono text-rose-700">
                -{formatCurrency(testingTotals.totalTestingAmount)}
              </span>
            </h4>
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">
                  Petrol Testing ({testingTotals.petrolTestingLitres > 0 ? formatLitres(testingTotals.petrolTestingLitres) : '₹'}):
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(testingTotals.petrolTestingAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">
                  Diesel Testing ({testingTotals.dieselTestingLitres > 0 ? formatLitres(testingTotals.dieselTestingLitres) : '₹'}):
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(testingTotals.dieselTestingAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Cash Notes Denomination Table */}
        <div className="py-4 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            {t.cashSection}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold block text-slate-600">₹500</span>
              <span className="font-mono text-slate-500 text-[11px]">× {record.cashCount[500] || 0}</span>
              <span className="font-mono font-bold block text-slate-900 mt-1">
                {formatCurrency(cashTotals[500], false)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold block text-slate-600">₹200</span>
              <span className="font-mono text-slate-500 text-[11px]">× {record.cashCount[200] || 0}</span>
              <span className="font-mono font-bold block text-slate-900 mt-1">
                {formatCurrency(cashTotals[200], false)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold block text-slate-600">₹100</span>
              <span className="font-mono text-slate-500 text-[11px]">× {record.cashCount[100] || 0}</span>
              <span className="font-mono font-bold block text-slate-900 mt-1">
                {formatCurrency(cashTotals[100], false)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold block text-slate-600">₹50</span>
              <span className="font-mono text-slate-500 text-[11px]">× {record.cashCount[50] || 0}</span>
              <span className="font-mono font-bold block text-slate-900 mt-1">
                {formatCurrency(cashTotals[50], false)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold block text-slate-600">₹20</span>
              <span className="font-mono text-slate-500 text-[11px]">× {record.cashCount[20] || 0}</span>
              <span className="font-mono font-bold block text-slate-900 mt-1">
                {formatCurrency(cashTotals[20], false)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold block text-slate-600">₹10 & Coins</span>
              <span className="font-mono text-slate-500 text-[11px]">× {record.cashCount[10] || 0} + ₹{record.cashCount.coins}</span>
              <span className="font-mono font-bold block text-slate-900 mt-1">
                {formatCurrency(cashTotals[10] + cashTotals.coins, false)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: End of Day Cash Audit & Reconciliation */}
        <div className="py-4 border-b-2 border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t.reconciliationSummary}
          </h3>

          <div className="bg-slate-100 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between font-medium text-slate-700">
              <span>Gross Total Fuel Sales:</span>
              <span className="font-mono font-bold text-slate-900">
                +{formatCurrency(recon.totalFuelSales)}
              </span>
            </div>
            <div className="flex justify-between font-medium text-slate-700">
              <span>Total Digital Collections (Paytm + UPI + Card):</span>
              <span className="font-mono font-bold text-rose-600">
                -{formatCurrency(recon.totalDigitalDeductions)}
              </span>
            </div>
            <div className="flex justify-between font-medium text-slate-700">
              <span>Total Fuel Testing Deductions (Petrol + Diesel):</span>
              <span className="font-mono font-bold text-rose-600">
                -{formatCurrency(recon.totalTestingDeductions)}
              </span>
            </div>

            {recon.deposits > 0 && (
              <div className="flex justify-between font-medium text-slate-700">
                <span>Bank Deposit Handover:</span>
                <span className="font-mono font-bold text-rose-600">
                  -{formatCurrency(recon.deposits)}
                </span>
              </div>
            )}

            {recon.withdrawals > 0 && (
              <div className="flex justify-between font-medium text-slate-700">
                <span>Cash Withdrawals / Expenses:</span>
                <span className="font-mono font-bold text-rose-600">
                  -{formatCurrency(recon.withdrawals)}
                </span>
              </div>
            )}

            {recon.float > 0 && (
              <div className="flex justify-between font-medium text-slate-700">
                <span>Opening Cash Float:</span>
                <span className="font-mono font-bold text-emerald-700">
                  +{formatCurrency(recon.float)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-slate-900 text-sm">
              <span>EXPECTED CASH IN HAND:</span>
              <span className="font-mono">{formatCurrency(recon.expectedCashInDrawer)}</span>
            </div>

            <div className="flex justify-between font-bold text-emerald-900 text-sm">
              <span>ACTUAL CASH COUNTED:</span>
              <span className="font-mono">{formatCurrency(recon.actualCashCounted)}</span>
            </div>

            <div
              className={`pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-extrabold ${
                recon.status === 'exact'
                  ? 'text-emerald-700'
                  : recon.status === 'excess'
                  ? 'text-blue-700'
                  : 'text-rose-700'
              }`}
            >
              <span className="uppercase">
                CASH DIFFERENCE ({recon.status === 'exact' ? t.statusExact : recon.status === 'excess' ? t.statusExcess : t.statusShort}):
              </span>
              <span className="font-mono text-base">
                {recon.status === 'excess' ? '+' : ''}
                {formatCurrency(recon.cashDifference)}
              </span>
            </div>
          </div>
        </div>

        {/* Signatures Footer */}
        <div className="grid grid-cols-2 gap-8 pt-10 text-xs">
          <div className="text-center">
            <div className="border-t border-slate-400 pt-1.5 font-bold text-slate-700">
              {t.managerSignature}
            </div>
            <span className="text-[10px] text-slate-400">Shift In-charge / Cashier</span>
          </div>

          <div className="text-center">
            <div className="border-t border-slate-400 pt-1.5 font-bold text-slate-700">
              {t.dealerSignature}
            </div>
            <span className="text-[10px] text-slate-400">Authorized Dealer / Proprietor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
