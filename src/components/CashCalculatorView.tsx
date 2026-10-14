import React, { useState } from 'react';
import { CashAdjustments, CashDenominations, DayRecord, Language } from '../types';
import { getTranslation } from '../utils/translations';
import {
  calculateCashSubtotals,
  calculateReconciliation,
  formatCurrency,
} from '../utils/calculations';
import {
  Coins,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Banknote,
  Minus,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface CashCalculatorViewProps {
  record: DayRecord;
  onUpdateCashCount: (cashCount: CashDenominations) => void;
  onUpdateAdjustments: (adjustments: CashAdjustments) => void;
  language: Language;
}

export const CashCalculatorView: React.FC<CashCalculatorViewProps> = ({
  record,
  onUpdateCashCount,
  onUpdateAdjustments,
  language,
}) => {
  const t = getTranslation(language);
  const [showAdjustments, setShowAdjustments] = useState(
    (record.cashAdjustments?.deposits || 0) > 0 ||
    (record.cashAdjustments?.withdrawals || 0) > 0 ||
    (record.cashAdjustments?.float || 0) > 0
  );

  const cashSubtotals = calculateCashSubtotals(record.cashCount);
  const recon = calculateReconciliation(record);

  const denominations: (keyof Omit<CashDenominations, 'coins'>)[] = [500, 200, 100, 50, 20, 10];

  const handleNoteChange = (denom: keyof Omit<CashDenominations, 'coins'>, valueStr: string) => {
    const val = valueStr === '' ? 0 : parseInt(valueStr, 10);
    onUpdateCashCount({
      ...record.cashCount,
      [denom]: isNaN(val) ? 0 : Math.max(0, val),
    });
  };

  const handleStep = (denom: keyof Omit<CashDenominations, 'coins'>, delta: number) => {
    const current = record.cashCount[denom] || 0;
    const nextVal = Math.max(0, current + delta);
    onUpdateCashCount({
      ...record.cashCount,
      [denom]: nextVal,
    });
  };

  const handleCoinsChange = (valStr: string) => {
    const val = valStr === '' ? 0 : parseFloat(valStr);
    onUpdateCashCount({
      ...record.cashCount,
      coins: isNaN(val) ? 0 : Math.max(0, val),
    });
  };

  const handleResetCount = () => {
    if (window.confirm('Reset all note counts to 0?')) {
      onUpdateCashCount({
        500: 0,
        200: 0,
        100: 0,
        50: 0,
        20: 0,
        10: 0,
        coins: 0,
      });
    }
  };

  const handleAdjustmentChange = (
    field: keyof Omit<CashAdjustments, 'note'>,
    valStr: string
  ) => {
    const val = valStr === '' ? 0 : parseFloat(valStr);
    onUpdateAdjustments({
      ...record.cashAdjustments,
      [field]: isNaN(val) ? 0 : Math.max(0, val),
    });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Reconciliation Settlement Top Banner */}
      <div
        className={`rounded-2xl p-4 sm:p-5 text-white shadow-lg border transition-all ${
          recon.status === 'exact'
            ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border-emerald-500/40'
            : recon.status === 'excess'
            ? 'bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 border-blue-500/40'
            : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-900 border-rose-500/50'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              {t.reconciliationTitle}
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">
              {t.actualCash}: {formatCurrency(recon.actualCashCounted)}
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              recon.status === 'exact'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                : recon.status === 'excess'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
            }`}
          >
            {recon.status === 'exact' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.statusExact}</span>
              </>
            ) : recon.status === 'excess' ? (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>{t.statusExcess}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>{t.statusShort}</span>
              </>
            )}
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-3 gap-2 pt-3 text-xs">
          <div className="bg-slate-800/60 rounded-xl p-2.5">
            <span className="text-slate-400 block text-[10px] uppercase font-medium">
              {t.expectedCash}
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-white tabular-nums">
              {formatCurrency(recon.expectedCashInDrawer)}
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5">
            <span className="text-slate-400 block text-[10px] uppercase font-medium">
              {t.actualCash}
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-emerald-300 tabular-nums">
              {formatCurrency(recon.actualCashCounted)}
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5">
            <span className="text-slate-400 block text-[10px] uppercase font-medium">
              {t.cashDifference}
            </span>
            <span
              className={`text-sm sm:text-base font-bold font-mono tabular-nums ${
                recon.status === 'exact'
                  ? 'text-emerald-400'
                  : recon.status === 'excess'
                  ? 'text-blue-400'
                  : 'text-rose-400'
              }`}
            >
              {recon.status === 'excess' ? '+' : ''}
              {formatCurrency(recon.cashDifference)}
            </span>
          </div>
        </div>
      </div>

      {/* Indian Currency Note Counter Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.cashCalculatorTitle}</h3>
              <p className="text-[11px] text-slate-500">
                {cashSubtotals.totalNotesCount} notes counted
              </p>
            </div>
          </div>
          <button
            onClick={handleResetCount}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Note Rows Table */}
        <div className="divide-y divide-slate-100">
          {denominations.map((denom) => {
            const count = record.cashCount[denom] || 0;
            const sub = cashSubtotals[denom];
            const colorClass =
              denom === 500
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : denom === 200
                ? 'bg-orange-100 text-orange-900 border-orange-300'
                : denom === 100
                ? 'bg-purple-100 text-purple-900 border-purple-300'
                : denom === 50
                ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                : denom === 20
                ? 'bg-rose-100 text-rose-900 border-rose-300'
                : 'bg-emerald-100 text-emerald-900 border-emerald-300';

            return (
              <div
                key={denom}
                className="py-2.5 flex items-center justify-between gap-2 sm:gap-4"
              >
                {/* Denomination Badge */}
                <div className="w-16 sm:w-20 shrink-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs sm:text-sm border ${colorClass}`}
                  >
                    ₹{denom}
                  </span>
                </div>

                {/* Counter Steppers & Input */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-1 max-w-[200px]">
                  <button
                    type="button"
                    onClick={() => handleStep(denom, -1)}
                    disabled={count <= 0}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={count === 0 ? '' : count}
                    placeholder="0"
                    onChange={(e) => handleNoteChange(denom, e.target.value)}
                    className="w-14 sm:w-16 text-center py-1.5 text-sm sm:text-base font-mono font-bold text-slate-900 bg-slate-50 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />

                  <button
                    type="button"
                    onClick={() => handleStep(denom, 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStep(denom, 5)}
                    className="hidden sm:flex px-1.5 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 items-center justify-center text-[10px] font-mono font-semibold text-slate-600 transition"
                  >
                    +5
                  </button>
                </div>

                {/* Subtotal */}
                <div className="w-24 sm:w-28 text-right shrink-0">
                  <span className="text-sm sm:text-base font-bold font-mono text-slate-900 tabular-nums">
                    {formatCurrency(sub, false)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Coins & Additional Cash Row */}
          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">{t.coinsAndChange}</span>
            </div>

            <div className="relative max-w-[140px]">
              <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={record.cashCount.coins === 0 ? '' : record.cashCount.coins}
                placeholder="0.00"
                onChange={(e) => handleCoinsChange(e.target.value)}
                className="w-full pl-6 pr-2 py-1.5 text-sm font-mono font-bold text-right rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Total Cash Counted Ribbon */}
        <div className="pt-3 mt-2 border-t border-slate-200 flex items-center justify-between bg-emerald-50/80 -mx-4 -mb-4 p-4 rounded-b-2xl">
          <div>
            <div className="text-xs font-bold text-emerald-950">{t.totalCashCounted}</div>
            <div className="text-[11px] text-emerald-700">
              {cashSubtotals.totalNotesCount} notes + ₹{cashSubtotals.coins.toFixed(2)} coins
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-950 tabular-nums">
            {formatCurrency(cashSubtotals.totalActualCash)}
          </div>
        </div>
      </div>

      {/* Deductions & Expected Cash Breakdown Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {t.reconciliationFormula}
          </h4>
          <span className="text-[11px] text-slate-500">Step-by-step Audit</span>
        </div>

        <div className="space-y-2 text-xs divide-y divide-slate-100">
          {/* Total Fuel Sales */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-600 font-medium">1. Total Fuel Sales (M1 + M2)</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              +{formatCurrency(recon.totalFuelSales)}
            </span>
          </div>

          {/* Digital Deductions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-slate-600 font-medium">2. Digital Payments Total</span>
              <span className="text-[10px] text-slate-400 block">
                Paytm ({formatCurrency(recon.paytmTotal, false)}) + UPI ({formatCurrency(recon.upiTotal, false)}) + Card ({formatCurrency(recon.cardTotal, false)})
              </span>
            </div>
            <span className="font-mono font-bold text-rose-600 text-sm">
              -{formatCurrency(recon.totalDigitalDeductions)}
            </span>
          </div>

          {/* Testing Deductions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-slate-600 font-medium">3. Fuel Testing Deductions</span>
              <span className="text-[10px] text-slate-400 block">
                Petrol ({formatCurrency(recon.petrolTestingAmount, false)}) + Diesel ({formatCurrency(recon.dieselTestingAmount, false)})
              </span>
            </div>
            <span className="font-mono font-bold text-rose-600 text-sm">
              -{formatCurrency(recon.totalTestingDeductions)}
            </span>
          </div>

          {/* Base Expected Cash */}
          <div className="flex items-center justify-between pt-2 bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg">
            <span className="font-bold text-slate-800">Base Fuel Sales Cash Expected:</span>
            <span className="font-mono font-extrabold text-slate-900 text-sm">
              {formatCurrency(recon.baseExpectedCash)}
            </span>
          </div>

          {/* Toggle Cash Adjustments */}
          <div className="pt-2">
            <button
              onClick={() => setShowAdjustments(!showAdjustments)}
              className="flex items-center justify-between w-full text-left font-bold text-emerald-800 hover:text-emerald-900 py-1"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t.cashAdjustments} (Bank Deposits / Float)</span>
              </span>
              <span className="text-[11px] underline">
                {showAdjustments ? 'Hide' : 'Configure'}
              </span>
            </button>

            {showAdjustments && (
              <div className="mt-2.5 space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-[11px] text-slate-500 leading-tight">
                  {t.adjustmentsHelp}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {t.bankDeposits} (-)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={record.cashAdjustments?.deposits || ''}
                        placeholder="0.00"
                        onChange={(e) => handleAdjustmentChange('deposits', e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-mono font-semibold rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {t.withdrawals} (-)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={record.cashAdjustments?.withdrawals || ''}
                        placeholder="0.00"
                        onChange={(e) => handleAdjustmentChange('withdrawals', e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-mono font-semibold rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {t.cashFloat} (+)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={record.cashAdjustments?.float || ''}
                        placeholder="0.00"
                        onChange={(e) => handleAdjustmentChange('float', e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-mono font-semibold rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Adjustment Note
                    </label>
                    <input
                      type="text"
                      value={record.cashAdjustments?.note || ''}
                      placeholder="e.g. Afternoon SBI deposit"
                      onChange={(e) =>
                        onUpdateAdjustments({
                          ...record.cashAdjustments,
                          note: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Final Drawer Cash Expected */}
          <div className="flex items-center justify-between pt-2 font-bold text-slate-900">
            <span>Effective Drawer Cash Expected:</span>
            <span className="font-mono text-base text-emerald-800 tabular-nums">
              {formatCurrency(recon.expectedCashInDrawer)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
