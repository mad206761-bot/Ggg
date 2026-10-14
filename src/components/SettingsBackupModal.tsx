import React, { useRef, useState } from 'react';
import { Language, StationSettings } from '../types';
import { getTranslation } from '../utils/translations';
import {
  exportBackupJson,
  importBackupJson,
  saveSettings,
} from '../utils/storage';
import {
  Settings,
  Download,
  Upload,
  Check,
  AlertCircle,
  X,
  Building,
  RotateCcw,
} from 'lucide-react';

interface SettingsBackupModalProps {
  settings: StationSettings;
  onUpdateSettings: (settings: StationSettings) => void;
  onReloadRecords: () => void;
  onClose: () => void;
  language: Language;
}

export const SettingsBackupModal: React.FC<SettingsBackupModalProps> = ({
  settings,
  onUpdateSettings,
  onReloadRecords,
  onClose,
  language,
}) => {
  const t = getTranslation(language);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stationName, setStationName] = useState(settings.stationName);
  const [dealerName, setDealerName] = useState(settings.dealerName);
  const [location, setLocation] = useState(settings.location);
  const [roCode, setRoCode] = useState(settings.roCode);
  const [defaultPetrol, setDefaultPetrol] = useState(settings.defaultPetrolRate.toString());
  const [defaultDiesel, setDefaultDiesel] = useState(settings.defaultDieselRate.toString());

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StationSettings = {
      ...settings,
      stationName: stationName.trim(),
      dealerName: dealerName.trim(),
      location: location.trim(),
      roCode: roCode.trim(),
      defaultPetrolRate: parseFloat(defaultPetrol) || settings.defaultPetrolRate,
      defaultDieselRate: parseFloat(defaultDiesel) || settings.defaultDieselRate,
    };
    saveSettings(updated);
    onUpdateSettings(updated);
    setMessage({ text: t.saveSettings + ' successful!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportBackup = () => {
    try {
      const json = exportBackupJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `FuelLedger-Backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ text: t.exportSuccess, type: 'success' });
    } catch (err) {
      setMessage({ text: 'Error generating backup file.', type: 'error' });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(t.importConfirm)) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = importBackupJson(content);
        if (success) {
          onReloadRecords();
          setMessage({ text: t.importSuccess, type: 'success' });
        } else {
          setMessage({ text: t.importError, type: 'error' });
        }
      } catch {
        setMessage({ text: t.importError, type: 'error' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-slate-900">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 sm:p-6 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">{t.stationSettings}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message Toast */}
        {message && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Station Details Form */}
        <form onSubmit={handleSaveStation} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.stationNameLabel}
              </label>
              <input
                type="text"
                required
                value={stationName}
                placeholder="e.g. Kisan Fuel Station (IndianOil)"
                onChange={(e) => setStationName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.dealerNameLabel}
              </label>
              <input
                type="text"
                value={dealerName}
                placeholder="e.g. Rajesh Sharma"
                onChange={(e) => setDealerName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.roCodeLabel}
              </label>
              <input
                type="text"
                value={roCode}
                placeholder="e.g. IOC-782910"
                onChange={(e) => setRoCode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.locationLabel}
              </label>
              <input
                type="text"
                value={location}
                placeholder="e.g. NH-48 Mile 42, Jaipur"
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Petrol Price (₹/L)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={defaultPetrol}
                onChange={(e) => setDefaultPetrol(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Diesel Price (₹/L)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={defaultDiesel}
                onChange={(e) => setDefaultDiesel(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition"
          >
            {t.saveSettings}
          </button>
        </form>

        {/* Data Backup & Restore Section */}
        <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t.backupTitle}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            All records are safely preserved in browser offline storage. You can download a full backup file (.json) to transfer to another phone or keep as a master backup.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>{t.backupExport}</span>
            </button>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span>{t.backupImport}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
