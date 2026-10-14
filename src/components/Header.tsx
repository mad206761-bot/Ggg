import React, { useState } from 'react';
import { FuelRates, Language, StationSettings } from '../types';
import { getTranslation } from '../utils/translations';
import { formatCurrency } from '../utils/calculations';
import { Fuel, Calendar, Globe, Settings as SettingsIcon, Download, Smartphone, Check } from 'lucide-react';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  rates: FuelRates;
  onUpdateRates: (rates: FuelRates) => void;
  settings: StationSettings;
  onOpenSettings: () => void;
  onOpenInstallModal: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstallApp: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  rates,
  onUpdateRates,
  settings,
  onOpenSettings,
  onOpenInstallModal,
  isInstallable,
  isInstalled,
  onInstallApp,
  language,
  onToggleLanguage,
}) => {
  const t = getTranslation(language);
  const [showRateModal, setShowRateModal] = useState(false);
  const [tempPetrol, setTempPetrol] = useState(rates.petrol.toString());
  const [tempDiesel, setTempDiesel] = useState(rates.diesel.toString());

  const handleOpenRateModal = () => {
    setTempPetrol(rates.petrol.toString());
    setTempDiesel(rates.diesel.toString());
    setShowRateModal(true);
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(tempPetrol) || rates.petrol;
    const d = parseFloat(tempDiesel) || rates.diesel;
    onUpdateRates({ petrol: p, diesel: d });
    setShowRateModal(false);
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Station Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shrink-0 shadow-sm border border-emerald-400/20">
            <Fuel className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate leading-tight">
              {settings.stationName || t.appName}
            </h1>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
              <span>{settings.location || 'India'}</span>
              {settings.roCode && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono text-[10px] text-slate-400">{settings.roCode}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Controls: Language toggle, Install app, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            title={language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-semibold text-emerald-400 border border-slate-700 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Install on Android / PWA Button */}
          {isInstallable ? (
            <button
              onClick={onInstallApp}
              title={t.installApp}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.installApp}</span>
            </button>
          ) : isInstalled ? (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-[11px] text-emerald-400">
              <Check className="w-3 h-3" />
              <span>{t.installed}</span>
            </div>
          ) : (
            <button
              onClick={onOpenInstallModal}
              title="Android Guide"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {/* Settings / Backup Button */}
          <button
            onClick={onOpenSettings}
            title={t.settings}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700 transition flex items-center gap-1 text-xs"
          >
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden md:inline">{t.settings}</span>
          </button>
        </div>
      </div>

      {/* Secondary Bar: Date Selector & Fuel Rates */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 px-3 sm:px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Active Date Control */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center bg-slate-800 rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-white">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 mr-2 shrink-0" />
              <span className="font-semibold text-slate-200 mr-1.5">
                {formatDateDisplay(currentDate)}
              </span>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title={t.selectDate}
              />
            </div>

            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                onDateChange(today);
              }}
              className="px-2 py-1 text-[11px] font-medium rounded-md bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition"
            >
              {t.today}
            </button>
          </div>

          {/* Current Daily Rates Pill */}
          <button
            onClick={handleOpenRateModal}
            className="flex items-center gap-3 bg-slate-800/90 hover:bg-slate-800 text-xs px-3 py-1 rounded-lg border border-slate-700 transition group"
            title={t.rateNotice}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400 text-[11px]">MS:</span>
              <span className="font-mono font-bold text-emerald-300">
                {formatCurrency(rates.petrol)}/L
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-slate-400 text-[11px]">HSD:</span>
              <span className="font-mono font-bold text-amber-300">
                {formatCurrency(rates.diesel)}/L
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 underline ml-0.5 opacity-80 group-hover:opacity-100">
              {t.edit}
            </span>
          </button>
        </div>
      </div>

      {/* Edit Rates Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-slate-900">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">{t.fuelRates}</h3>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {currentDate}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              {t.rateNotice}
            </p>

            <form onSubmit={handleSaveRates} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{t.petrolRate} (MS)</span>
                  <span className="text-[11px] text-emerald-600 font-normal">₹ per litre</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={tempPetrol}
                    onChange={(e) => setTempPetrol(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{t.dieselRate} (HSD)</span>
                  <span className="text-[11px] text-amber-600 font-normal">₹ per litre</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={tempDiesel}
                    onChange={(e) => setTempDiesel(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition"
                >
                  {t.saveRates}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
