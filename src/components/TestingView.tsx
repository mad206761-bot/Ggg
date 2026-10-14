import React, { useState } from 'react';
import { FuelRates, FuelType, Language, TestingEntry, TestingMode } from '../types';
import { getTranslation } from '../utils/translations';
import { calculateTestingTotals, formatCurrency, formatLitres } from '../utils/calculations';
import { FlaskConical, Plus, Trash2, Edit2, X, Check, Clock, Info } from 'lucide-react';

interface TestingViewProps {
  testingEntries: TestingEntry[];
  rates: FuelRates;
  onUpdateTesting: (entries: TestingEntry[]) => void;
  language: Language;
}

export const TestingView: React.FC<TestingViewProps> = ({
  testingEntries,
  rates,
  onUpdateTesting,
  language,
}) => {
  const t = getTranslation(language);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [mode, setMode] = useState<TestingMode>('litres');
  const [litresInput, setLitresInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [note, setNote] = useState('');

  const totals = calculateTestingTotals(testingEntries);

  const handleOpenAdd = (defaultFuel?: FuelType) => {
    setEditingId(null);
    setFuelType(defaultFuel || 'petrol');
    setMode('litres');
    setLitresInput('5'); // Default 5L standard measure
    setAmountInput('');
    const d = new Date();
    setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    setNote('');
    setShowModal(true);
  };

  const handleOpenEdit = (entry: TestingEntry) => {
    setEditingId(entry.id);
    setFuelType(entry.fuelType);
    setMode(entry.mode);
    setLitresInput(entry.litres ? entry.litres.toString() : '');
    setAmountInput(entry.amount.toString());
    setTime(entry.time || '07:00');
    setNote(entry.note || '');
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    onUpdateTesting(testingEntries.filter((e) => e.id !== id));
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    let calculatedAmount = 0;
    let registeredLitres: number | undefined = undefined;

    const currentRate = rates[fuelType];

    if (mode === 'litres') {
      const parsedLitres = parseFloat(litresInput);
      if (isNaN(parsedLitres) || parsedLitres <= 0) return;
      registeredLitres = parsedLitres;
      calculatedAmount = Number((parsedLitres * currentRate).toFixed(2));
    } else {
      const parsedAmount = parseFloat(amountInput);
      if (isNaN(parsedAmount) || parsedAmount <= 0) return;
      calculatedAmount = Number(parsedAmount.toFixed(2));
      // In direct Rupee mode, DO NOT invent litres as per user prompt specification!
      registeredLitres = undefined;
    }

    if (editingId) {
      onUpdateTesting(
        testingEntries.map((item) =>
          item.id === editingId
            ? {
                ...item,
                fuelType,
                mode,
                litres: registeredLitres,
                amount: calculatedAmount,
                time,
                note: note.trim(),
              }
            : item
        )
      );
    } else {
      const newEntry: TestingEntry = {
        id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        fuelType,
        mode,
        litres: registeredLitres,
        amount: calculatedAmount,
        time,
        note: note.trim(),
      };
      onUpdateTesting([...testingEntries, newEntry]);
    }

    setShowModal(false);
  };

  const petrolEntries = testingEntries.filter((e) => e.fuelType === 'petrol');
  const dieselEntries = testingEntries.filter((e) => e.fuelType === 'diesel');

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner: Total Testing Deductions */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {t.totalTestingDeductions}
              </h3>
              <p className="text-xs text-slate-400">{t.testingSub}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-amber-400 tabular-nums">
              {formatCurrency(totals.totalTestingAmount)}
            </span>
          </div>
        </div>

        {/* Petrol vs Diesel Summary Columns */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/80 rounded-xl p-2.5">
            <div className="text-slate-400 flex items-center justify-between">
              <span>{t.petrolTesting}</span>
              <span className="text-emerald-400 font-mono font-bold">
                {formatCurrency(totals.petrolTestingAmount)}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1">
              {totals.petrolTestingLitres > 0 ? formatLitres(totals.petrolTestingLitres) : 'Direct ₹'}
              <span className="text-slate-500 ml-1.5">({totals.petrolCount} tests)</span>
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-2.5">
            <div className="text-slate-400 flex items-center justify-between">
              <span>{t.dieselTesting}</span>
              <span className="text-amber-400 font-mono font-bold">
                {formatCurrency(totals.dieselTestingAmount)}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1">
              {totals.dieselTestingLitres > 0 ? formatLitres(totals.dieselTestingLitres) : 'Direct ₹'}
              <span className="text-slate-500 ml-1.5">({totals.dieselCount} tests)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Strip: Add Button */}
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Testing Ledger Records
        </h4>
        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addTestingEntry}</span>
        </button>
      </div>

      {/* Petrol Testing Card */}
      <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <h4 className="text-sm font-bold text-emerald-950">Petrol Testing (MS)</h4>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              @{formatCurrency(rates.petrol)}/L
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold font-mono text-emerald-900 tabular-nums">
              {formatCurrency(totals.petrolTestingAmount)}
            </span>
          </div>
        </div>

        {petrolEntries.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No Petrol testing entries recorded today.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {petrolEntries.map((entry) => (
              <div
                key={entry.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {entry.mode === 'litres'
                        ? `${formatLitres(entry.litres || 0)} (Litres Mode)`
                        : 'Direct Rupee Entry'}
                    </span>
                    <span className="text-slate-400 font-mono flex items-center gap-0.5 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {entry.time}
                    </span>
                  </div>
                  {entry.note && <p className="text-slate-500 mt-0.5">{entry.note}</p>}
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-bold font-mono text-slate-900 text-sm">
                    {formatCurrency(entry.amount)}
                  </span>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 text-rose-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diesel Testing Card */}
      <div className="bg-white rounded-2xl border border-amber-200/80 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <h4 className="text-sm font-bold text-amber-950">Diesel Testing (HSD)</h4>
            <span className="text-xs font-mono text-amber-700 font-semibold">
              @{formatCurrency(rates.diesel)}/L
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold font-mono text-amber-900 tabular-nums">
              {formatCurrency(totals.dieselTestingAmount)}
            </span>
          </div>
        </div>

        {dieselEntries.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No Diesel testing entries recorded today.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {dieselEntries.map((entry) => (
              <div
                key={entry.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {entry.mode === 'litres'
                        ? `${formatLitres(entry.litres || 0)} (Litres Mode)`
                        : 'Direct Rupee Entry'}
                    </span>
                    <span className="text-slate-400 font-mono flex items-center gap-0.5 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {entry.time}
                    </span>
                  </div>
                  {entry.note && <p className="text-slate-500 mt-0.5">{entry.note}</p>}
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-bold font-mono text-slate-900 text-sm">
                    {formatCurrency(entry.amount)}
                  </span>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 text-rose-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Testing Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-slate-900">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? t.editTestingEntry : t.addTestingEntry}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="mt-4 space-y-4">
              {/* Fuel Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fuel Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFuelType('petrol')}
                    className={`py-2 text-xs font-bold rounded-lg transition ${
                      fuelType === 'petrol'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Petrol (MS @ ₹{rates.petrol}/L)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelType('diesel')}
                    className={`py-2 text-xs font-bold rounded-lg transition ${
                      fuelType === 'diesel'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Diesel (HSD @ ₹{rates.diesel}/L)
                  </button>
                </div>
              </div>

              {/* Mode Selector: Mode A vs Mode B */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Testing Input Mode
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-center">
                  <button
                    type="button"
                    onClick={() => setMode('litres')}
                    className={`p-2 text-xs font-bold rounded-lg transition text-left ${
                      mode === 'litres'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div>{t.modeLitres}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Auto-computes ₹
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('rupees')}
                    className={`p-2 text-xs font-bold rounded-lg transition text-left ${
                      mode === 'rupees'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div>{t.modeRupees}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Direct Rupee deduction
                    </div>
                  </button>
                </div>
              </div>

              {/* Mode A: Litres Input */}
              {mode === 'litres' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{t.testingQuantity}</span>
                    <span className="text-[11px] text-emerald-600 font-normal">Litres</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      required
                      autoFocus
                      value={litresInput}
                      placeholder="e.g. 5"
                      onChange={(e) => setLitresInput(e.target.value)}
                      className="w-full px-3 py-2.5 text-lg font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50"
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                      Litres
                    </span>
                  </div>

                  {/* Preset Litres Buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 5, 10, 20].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLitresInput(l.toString())}
                        className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                      >
                        {l}L
                      </button>
                    ))}
                  </div>

                  {/* Auto-calculated Preview */}
                  <div className="mt-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                    <span className="text-emerald-800 font-medium">{t.autoCalculated}:</span>
                    <span className="font-mono font-extrabold text-emerald-900 text-sm">
                      {formatCurrency((parseFloat(litresInput) || 0) * rates[fuelType])}
                    </span>
                  </div>
                </div>
              ) : (
                /* Mode B: Direct Rupee Input */
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.testingAmount}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-base text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      autoFocus
                      value={amountInput}
                      placeholder="e.g. 522.50"
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 text-lg font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-hidden bg-slate-50"
                    />
                  </div>

                  <div className="mt-2 text-[11px] text-amber-700 flex items-start gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{t.directRupeeNotice}</span>
                  </div>
                </div>
              )}

              {/* Time & Note */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.txTime}
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-hidden bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Note / Reason
                  </label>
                  <input
                    type="text"
                    value={note}
                    placeholder="e.g. Morning 5L Calibration"
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-hidden bg-slate-50"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingId ? t.save : t.addTestingEntry}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
