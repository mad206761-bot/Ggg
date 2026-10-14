import React, { useState } from 'react';
import { DigitalPaymentType, DigitalTransaction, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { calculateDigitalTotals, formatCurrency } from '../utils/calculations';
import {
  Smartphone,
  CreditCard,
  QrCode,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Clock,
  FileText,
} from 'lucide-react';

interface DigitalPaymentsViewProps {
  transactions: DigitalTransaction[];
  onUpdateTransactions: (transactions: DigitalTransaction[]) => void;
  language: Language;
}

export const DigitalPaymentsView: React.FC<DigitalPaymentsViewProps> = ({
  transactions,
  onUpdateTransactions,
  language,
}) => {
  const t = getTranslation(language);
  const [activeFilter, setActiveFilter] = useState<'all' | DigitalPaymentType>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [type, setType] = useState<DigitalPaymentType>('paytm');
  const [amount, setAmount] = useState('');
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [note, setNote] = useState('');

  const totals = calculateDigitalTotals(transactions);

  const handleOpenAdd = (defaultType?: DigitalPaymentType) => {
    setEditingId(null);
    setType(defaultType || (activeFilter === 'all' ? 'paytm' : activeFilter));
    setAmount('');
    const d = new Date();
    setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    setNote('');
    setShowModal(true);
  };

  const handleOpenEdit = (tx: DigitalTransaction) => {
    setEditingId(tx.id);
    setType(tx.type);
    setAmount(tx.amount.toString());
    setTime(tx.time || '12:00');
    setNote(tx.note || '');
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.confirmDeleteTx)) {
      onUpdateTransactions(transactions.filter((tx) => tx.id !== id));
    }
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (editingId) {
      onUpdateTransactions(
        transactions.map((tx) =>
          tx.id === editingId
            ? { ...tx, type, amount: parsedAmount, time, note: note.trim() }
            : tx
        )
      );
    } else {
      const newTx: DigitalTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type,
        amount: parsedAmount,
        time,
        note: note.trim(),
      };
      onUpdateTransactions([newTx, ...transactions]);
    }

    setShowModal(false);
  };

  const filteredTransactions = transactions.filter((tx) =>
    activeFilter === 'all' ? true : tx.type === activeFilter
  );

  const getMethodBadge = (txType: DigitalPaymentType) => {
    switch (txType) {
      case 'paytm':
        return {
          label: 'Paytm',
          color: 'bg-sky-100 text-sky-800 border-sky-300',
          icon: QrCode,
        };
      case 'upi':
        return {
          label: 'UPI',
          color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          icon: Smartphone,
        };
      case 'card':
        return {
          label: 'Card POS',
          color: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: CreditCard,
        };
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Category Totals Banner Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Digital */}
        <div className="col-span-2 sm:col-span-1 bg-slate-900 text-white rounded-2xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400">{t.digitalPayments}</div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
            {formatCurrency(totals.totalDigital)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{totals.totalCount} total txns</div>
        </div>

        {/* Paytm Total */}
        <div
          onClick={() => setActiveFilter('paytm')}
          className={`rounded-2xl p-3 border transition cursor-pointer ${
            activeFilter === 'paytm'
              ? 'bg-sky-50 border-sky-400 shadow-sm'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-sky-900 mb-0.5">
            <span className="flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-sky-600" />
              Paytm
            </span>
            <span className="text-[10px] text-slate-500">{totals.paytmCount} txns</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {formatCurrency(totals.paytmTotal)}
          </div>
        </div>

        {/* UPI Total */}
        <div
          onClick={() => setActiveFilter('upi')}
          className={`rounded-2xl p-3 border transition cursor-pointer ${
            activeFilter === 'upi'
              ? 'bg-indigo-50 border-indigo-400 shadow-sm'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900 mb-0.5">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              UPI
            </span>
            <span className="text-[10px] text-slate-500">{totals.upiCount} txns</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {formatCurrency(totals.upiTotal)}
          </div>
        </div>

        {/* Card Total */}
        <div
          onClick={() => setActiveFilter('card')}
          className={`rounded-2xl p-3 border transition cursor-pointer ${
            activeFilter === 'card'
              ? 'bg-purple-50 border-purple-400 shadow-sm'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-purple-900 mb-0.5">
            <span className="flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              Card POS
            </span>
            <span className="text-[10px] text-slate-500">{totals.cardCount} txns</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {formatCurrency(totals.cardTotal)}
          </div>
        </div>
      </div>

      {/* Action Strip: Filter Tabs + Add Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setActiveFilter('paytm')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeFilter === 'paytm'
                ? 'bg-white text-sky-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paytm ({totals.paytmCount})
          </button>
          <button
            onClick={() => setActiveFilter('upi')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeFilter === 'upi'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            UPI ({totals.upiCount})
          </button>
          <button
            onClick={() => setActiveFilter('card')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeFilter === 'card'
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Card ({totals.cardCount})
          </button>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addTransaction}</span>
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Smartphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium">{t.noTransactions}</p>
            <button
              onClick={() => handleOpenAdd()}
              className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              + {t.addTransaction}
            </button>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const badge = getMethodBadge(tx.type);
            const BadgeIcon = badge.icon;
            return (
              <div
                key={tx.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl border ${badge.color}`}>
                    <BadgeIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {tx.time}
                      </span>
                    </div>
                    {tx.note && (
                      <p className="text-xs text-slate-600 truncate mt-0.5 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{tx.note}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-base sm:text-lg font-bold font-mono text-slate-900 tabular-nums">
                    {formatCurrency(tx.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(tx)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title={t.edit}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-slate-900">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? t.editTransaction : t.addTransaction}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="mt-4 space-y-4">
              {/* Payment Type Segmented Switch */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.txType}
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('paytm')}
                    className={`py-2 text-xs font-bold rounded-lg transition ${
                      type === 'paytm'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Paytm
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('upi')}
                    className={`py-2 text-xs font-bold rounded-lg transition ${
                      type === 'upi'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('card')}
                    className={`py-2 text-xs font-bold rounded-lg transition ${
                      type === 'card'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Card POS
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.txAmount}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-base text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    autoFocus
                    value={amount}
                    placeholder="e.g. 500"
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 text-lg font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-slate-50"
                  />
                </div>

                {/* Quick Amount Suggestion Chips */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                  {[100, 200, 300, 500, 1000, 2000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 border border-slate-200 transition"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

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
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle / Note
                  </label>
                  <input
                    type="text"
                    value={note}
                    placeholder="e.g. RJ-14 Swift"
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingId ? t.save : t.addTransaction}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
