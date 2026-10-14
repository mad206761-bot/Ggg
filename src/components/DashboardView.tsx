import React from 'react';
import { ActiveTab, DayRecord, Language } from '../types';
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
  Gauge,
  Smartphone,
  FlaskConical,
  Coins,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
} from 'lucide-react';

interface DashboardViewProps {
  record: DayRecord;
  onNavigate: (tab: ActiveTab) => void;
  language: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ record, onNavigate, language }) => {
  const t = getTranslation(language);

  const fuelTotals = calculateFuelTotals(record.machines, record.rates);
  const digitalTotals = calculateDigitalTotals(record.digitalTransactions);
  const testingTotals = calculateTestingTotals(record.testingEntries);
  const cashTotals = calculateCashSubtotals(record.cashCount);
  const recon = calculateReconciliation(record);

  return (
    <div className="space-y-4 pb-20">
      {/* Primary Reconciliation Hero Card: Expected vs Actual Cash Difference */}
      <div
        className={`rounded-2xl p-4 sm:p-5 text-white shadow-lg border transition-all ${
          recon.status === 'exact'
            ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 border-emerald-500/40'
            : recon.status === 'excess'
            ? 'bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 border-blue-500/40'
            : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-900 border-rose-500/50'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full animate-pulse ${
                recon.status === 'exact'
                  ? 'bg-emerald-400'
                  : recon.status === 'excess'
                  ? 'bg-blue-400'
                  : 'bg-rose-400'
              }`}
            />
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
              {t.reconciliationTitle}
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
              recon.status === 'exact'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                : recon.status === 'excess'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
            }`}
          >
            {recon.status === 'exact' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.statusExact}</span>
              </>
            ) : recon.status === 'excess' ? (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{t.statusExcess}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t.statusShort}</span>
              </>
            )}
          </div>
        </div>

        {/* Big Discrepancy Figure */}
        <div className="my-2">
          <div className="text-xs text-slate-400 font-medium">{t.cashDifference}</div>
          <div
            className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums mt-0.5 ${
              recon.status === 'exact'
                ? 'text-emerald-400'
                : recon.status === 'excess'
                ? 'text-blue-400'
                : 'text-rose-400'
            }`}
          >
            {recon.status === 'excess' ? '+' : ''}
            {formatCurrency(recon.cashDifference)}
          </div>
        </div>

        {/* Expected vs Actual Sub-Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px] mb-0.5">{t.expectedCash}</span>
            <span className="text-base sm:text-lg font-bold font-mono text-white tabular-nums">
              {formatCurrency(recon.expectedCashInDrawer)}
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px] mb-0.5">{t.actualCash}</span>
            <span className="text-base sm:text-lg font-bold font-mono text-emerald-300 tabular-nums">
              {formatCurrency(recon.actualCashCounted)}
            </span>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Sales */}
        <div
          onClick={() => onNavigate('meters')}
          className="col-span-2 sm:col-span-2 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">{t.totalSales}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:scale-110 transition">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {formatCurrency(fuelTotals.totalFuelSales)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{formatLitres(fuelTotals.totalFuelLitres)} sold</span>
            <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
              <span>View Meters</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Digital Payments Total */}
        <div
          onClick={() => onNavigate('digital')}
          className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs hover:border-blue-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">{t.digitalPayments}</span>
            <div className="p-1 rounded-lg bg-blue-50 text-blue-700 group-hover:scale-110 transition">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(digitalTotals.totalDigital)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {digitalTotals.totalCount} txns (Paytm/UPI/Card)
          </div>
        </div>

        {/* Fuel Testing Total */}
        <div
          onClick={() => onNavigate('cash')}
          className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs hover:border-amber-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">{t.totalTestingDeductions}</span>
            <div className="p-1 rounded-lg bg-amber-50 text-amber-700 group-hover:scale-110 transition">
              <FlaskConical className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(testingTotals.totalTestingAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            MS: {formatCurrency(testingTotals.petrolTestingAmount, false)} · HSD: {formatCurrency(testingTotals.dieselTestingAmount, false)}
          </div>
        </div>
      </div>

      {/* Fuel Breakdown Strip (Petrol & Diesel Details) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
          Fuel Sales Breakdown (MS & HSD)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Petrol Summary */}
          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Petrol (MS)
              </span>
              <span className="text-[11px] font-mono font-semibold text-emerald-700">
                @{formatCurrency(record.rates.petrol)}/L
              </span>
            </div>
            <div className="text-lg font-bold text-emerald-950 font-mono tabular-nums">
              {formatCurrency(fuelTotals.petrolTotalSales)}
            </div>
            <div className="text-xs text-emerald-800 font-mono mt-0.5">
              {formatLitres(fuelTotals.petrolTotalLitres)}
            </div>
            {testingTotals.petrolTestingAmount > 0 && (
              <div className="mt-1.5 text-[10px] text-emerald-700 pt-1 border-t border-emerald-200/60">
                Testing: -{formatCurrency(testingTotals.petrolTestingAmount)}
              </div>
            )}
          </div>

          {/* Diesel Summary */}
          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Diesel (HSD)
              </span>
              <span className="text-[11px] font-mono font-semibold text-amber-700">
                @{formatCurrency(record.rates.diesel)}/L
              </span>
            </div>
            <div className="text-lg font-bold text-amber-950 font-mono tabular-nums">
              {formatCurrency(fuelTotals.dieselTotalSales)}
            </div>
            <div className="text-xs text-amber-800 font-mono mt-0.5">
              {formatLitres(fuelTotals.dieselTotalLitres)}
            </div>
            {testingTotals.dieselTestingAmount > 0 && (
              <div className="mt-1.5 text-[10px] text-amber-700 pt-1 border-t border-amber-200/60">
                Testing: -{formatCurrency(testingTotals.dieselTestingAmount)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Digital & Deductions Summary Strip */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Paytm Total */}
        <div
          onClick={() => onNavigate('digital')}
          className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-xs cursor-pointer hover:border-sky-400 transition"
        >
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-center gap-1">
            <QrCode className="w-3 h-3 text-sky-600" />
            <span>Paytm Total</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(digitalTotals.paytmTotal)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{digitalTotals.paytmCount} txns</div>
        </div>

        {/* UPI Total */}
        <div
          onClick={() => onNavigate('digital')}
          className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-xs cursor-pointer hover:border-indigo-400 transition"
        >
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-center gap-1">
            <Smartphone className="w-3 h-3 text-indigo-600" />
            <span>UPI Total</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(digitalTotals.upiTotal)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{digitalTotals.upiCount} txns</div>
        </div>

        {/* Card Total */}
        <div
          onClick={() => onNavigate('digital')}
          className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-xs cursor-pointer hover:border-purple-400 transition"
        >
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-center gap-1">
            <CreditCard className="w-3 h-3 text-purple-600" />
            <span>Card POS</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {formatCurrency(digitalTotals.cardTotal)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{digitalTotals.cardCount} txns</div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
          {t.quickActions}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => onNavigate('meters')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition active:scale-98"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Gauge className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 leading-tight">{t.tabMeters}</div>
              <div className="text-[10px] text-slate-500 truncate">Machines 1 & 2</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('digital')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition active:scale-98"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 leading-tight">Paytm & UPI</div>
              <div className="text-[10px] text-slate-500 truncate">{digitalTotals.totalCount} entries</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('cash')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition active:scale-98"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 leading-tight">{t.tabTesting}</div>
              <div className="text-[10px] text-slate-500 truncate">Litres & Rupees</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('cash')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition active:scale-98"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 leading-tight">{t.tabCash}</div>
              <div className="text-[10px] text-slate-500 truncate">{cashTotals.totalNotesCount} notes</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="col-span-2 sm:col-span-2 flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-left transition active:scale-98 shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white leading-tight">{t.dailyReportTitle}</div>
              <div className="text-[10px] text-slate-300 truncate">Print receipt slip or save PDF</div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
