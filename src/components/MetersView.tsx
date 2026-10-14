import React from 'react';
import { DayRecord, Language, MachinesState } from '../types';
import { getTranslation } from '../utils/translations';
import {
  calculateFuelTotals,
  calculateLitres,
  calculateSales,
  formatCurrency,
  formatLitres,
} from '../utils/calculations';
import { Gauge, Fuel, AlertCircle, ArrowUpRight } from 'lucide-react';

interface MetersViewProps {
  record: DayRecord;
  onUpdateMachines: (machines: MachinesState) => void;
  language: Language;
}

export const MetersView: React.FC<MetersViewProps> = ({ record, onUpdateMachines, language }) => {
  const t = getTranslation(language);
  const { machines, rates } = record;
  const totals = calculateFuelTotals(machines, rates);

  const handleReadingChange = (
    machine: 'machine1' | 'machine2',
    fuel: 'petrol' | 'diesel',
    field: 'opening' | 'closing',
    valStr: string
  ) => {
    const val = valStr === '' ? 0 : parseFloat(valStr);
    const updated: MachinesState = {
      ...machines,
      [machine]: {
        ...machines[machine],
        [fuel]: {
          ...machines[machine][fuel],
          [field]: isNaN(val) ? 0 : val,
        },
      },
    };
    onUpdateMachines(updated);
  };

  const renderNozzleCard = (
    machineKey: 'machine1' | 'machine2',
    fuelKey: 'petrol' | 'diesel',
    title: string,
    colorScheme: 'emerald' | 'amber'
  ) => {
    const reading = machines[machineKey][fuelKey];
    const rate = rates[fuelKey];
    const litres = calculateLitres(reading.opening, reading.closing);
    const sales = calculateSales(litres, rate);
    const isInvalid = reading.closing < reading.opening && reading.closing > 0;

    const isEmerald = colorScheme === 'emerald';

    return (
      <div
        className={`rounded-2xl p-4 border transition-all ${
          isEmerald
            ? 'bg-emerald-50/40 border-emerald-200/80'
            : 'bg-amber-50/40 border-amber-200/80'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isEmerald ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <h4
              className={`text-sm font-bold ${
                isEmerald ? 'text-emerald-950' : 'text-amber-950'
              }`}
            >
              {title}
            </h4>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 font-medium mr-1">{t.pricePerLitre}:</span>
            <span
              className={`text-xs font-mono font-bold ${
                isEmerald ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {formatCurrency(rate)}/L
            </span>
          </div>
        </div>

        {/* Inputs Grid: Opening & Closing */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t.openingReading}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={reading.opening === 0 ? '' : reading.opening}
              placeholder="0.00"
              onChange={(e) =>
                handleReadingChange(machineKey, fuelKey, 'opening', e.target.value)
              }
              className="w-full px-3 py-2.5 text-sm sm:text-base font-mono font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden shadow-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t.closingReading}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={reading.closing === 0 ? '' : reading.closing}
              placeholder="0.00"
              onChange={(e) =>
                handleReadingChange(machineKey, fuelKey, 'closing', e.target.value)
              }
              className={`w-full px-3 py-2.5 text-sm sm:text-base font-mono font-semibold text-slate-900 bg-white rounded-xl border outline-hidden shadow-xs focus:ring-2 ${
                isInvalid
                  ? 'border-rose-400 focus:ring-rose-400'
                  : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
            />
          </div>
        </div>

        {/* Validation Warning */}
        {isInvalid && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{t.invalidReading}</span>
          </div>
        )}

        {/* Calculated Result Ribbon */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/80 rounded-xl p-2 border border-slate-200/60">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">
              {t.litresSold}
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-slate-900 tabular-nums">
              {formatLitres(litres)}
            </span>
          </div>

          <div className="bg-white/80 rounded-xl p-2 border border-slate-200/60">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">
              {t.salesAmount}
            </span>
            <span
              className={`text-sm sm:text-base font-mono font-bold tabular-nums ${
                isEmerald ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {formatCurrency(sales)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Overview Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{t.allMachinesTotal}</h3>
              <p className="text-xs text-slate-400">Machines 1 & 2 Dispenser Summary</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">{t.totalSales}</span>
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-400 tabular-nums">
              {formatCurrency(totals.totalFuelSales)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/80 rounded-xl p-2.5">
            <div className="text-slate-400 flex items-center justify-between">
              <span>Petrol Total</span>
              <span className="text-emerald-400 font-mono font-bold">
                {formatCurrency(totals.petrolTotalSales)}
              </span>
            </div>
            <div className="text-sm font-mono font-bold text-slate-200 mt-1">
              {formatLitres(totals.petrolTotalLitres)}
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-2.5">
            <div className="text-slate-400 flex items-center justify-between">
              <span>Diesel Total</span>
              <span className="text-amber-400 font-mono font-bold">
                {formatCurrency(totals.dieselTotalSales)}
              </span>
            </div>
            <div className="text-sm font-mono font-bold text-slate-200 mt-1">
              {formatLitres(totals.dieselTotalLitres)}
            </div>
          </div>
        </div>
      </div>

      {/* Machine 1 Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              M1
            </span>
            <h3 className="text-sm font-bold text-slate-900">{t.machine1}</h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
              {formatCurrency(totals.machine1.totalSales)}
            </span>
            <span className="text-[11px] text-slate-500 block font-mono">
              {formatLitres(totals.machine1.totalLitres)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderNozzleCard('machine1', 'petrol', 'Machine 1 - Petrol (MS)', 'emerald')}
          {renderNozzleCard('machine1', 'diesel', 'Machine 1 - Diesel (HSD)', 'amber')}
        </div>
      </div>

      {/* Machine 2 Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              M2
            </span>
            <h3 className="text-sm font-bold text-slate-900">{t.machine2}</h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
              {formatCurrency(totals.machine2.totalSales)}
            </span>
            <span className="text-[11px] text-slate-500 block font-mono">
              {formatLitres(totals.machine2.totalLitres)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderNozzleCard('machine2', 'petrol', 'Machine 2 - Petrol (MS)', 'emerald')}
          {renderNozzleCard('machine2', 'diesel', 'Machine 2 - Diesel (HSD)', 'amber')}
        </div>
      </div>
    </div>
  );
};
