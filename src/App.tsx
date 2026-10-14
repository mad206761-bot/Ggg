/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ActiveTab,
  CashAdjustments,
  CashDenominations,
  DayRecord,
  DigitalTransaction,
  FuelRates,
  Language,
  MachinesState,
  StationSettings,
  TestingEntry,
} from './types';
import {
  getAvailableDates,
  getRecordByDate,
  getTodayDateString,
  loadSettings,
  saveRecord,
  saveSettings,
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { MetersView } from './components/MetersView';
import { DigitalPaymentsView } from './components/DigitalPaymentsView';
import { TestingView } from './components/TestingView';
import { CashCalculatorView } from './components/CashCalculatorView';
import { ReportsView } from './components/ReportsView';
import { SettingsBackupModal } from './components/SettingsBackupModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Coins, FlaskConical } from 'lucide-react';

export default function App() {
  const [currentDate, setCurrentDate] = useState<string>(() => getTodayDateString());
  const [settings, setSettings] = useState<StationSettings>(() => loadSettings());
  const [record, setRecord] = useState<DayRecord>(() => getRecordByDate(getTodayDateString(), loadSettings()));
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [cashSubView, setCashSubView] = useState<'cash' | 'testing'>('cash');

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Load record whenever active date changes
  useEffect(() => {
    const loaded = getRecordByDate(currentDate, settings);
    setRecord(loaded);
  }, [currentDate]);

  // Sync settings when language changes
  const handleToggleLanguage = () => {
    const nextLang: Language = settings.language === 'en' ? 'hi' : 'en';
    const updated = { ...settings, language: nextLang };
    setSettings(updated);
    saveSettings(updated);
  };

  // State update handlers with automatic persistence
  const handleUpdateRecord = (updated: DayRecord) => {
    setRecord(updated);
    saveRecord(updated);
  };

  const handleUpdateRates = (rates: FuelRates) => {
    handleUpdateRecord({
      ...record,
      rates,
    });
  };

  const handleUpdateMachines = (machines: MachinesState) => {
    handleUpdateRecord({
      ...record,
      machines,
    });
  };

  const handleUpdateDigitalTransactions = (digitalTransactions: DigitalTransaction[]) => {
    handleUpdateRecord({
      ...record,
      digitalTransactions,
    });
  };

  const handleUpdateTestingEntries = (testingEntries: TestingEntry[]) => {
    handleUpdateRecord({
      ...record,
      testingEntries,
    });
  };

  const handleUpdateCashCount = (cashCount: CashDenominations) => {
    handleUpdateRecord({
      ...record,
      cashCount,
    });
  };

  const handleUpdateAdjustments = (cashAdjustments: CashAdjustments) => {
    handleUpdateRecord({
      ...record,
      cashAdjustments,
    });
  };

  const handleStartNewDay = () => {
    const nextDate = prompt(
      settings.language === 'hi'
        ? 'नया दिन शुरू करने के लिए तारीख दर्ज करें (YYYY-MM-DD):'
        : 'Enter date for the new daily record (YYYY-MM-DD):',
      (() => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
      })()
    );

    if (nextDate && nextDate.trim()) {
      const validDate = nextDate.trim();
      setCurrentDate(validDate);
      setActiveTab('meters');
    }
  };

  const handleReloadRecords = () => {
    const loaded = getRecordByDate(currentDate, settings);
    setRecord(loaded);
    setSettings(loadSettings());
  };

  const availableDates = getAvailableDates();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        rates={record.rates}
        onUpdateRates={handleUpdateRates}
        settings={settings}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenInstallModal={() => setShowInstallModal(true)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstallApp={install}
        language={settings.language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <DashboardView
            record={record}
            onNavigate={(tab) => {
              if (tab === 'testing') {
                setActiveTab('cash');
                setCashSubView('testing');
              } else if (tab === 'cash') {
                setActiveTab('cash');
                setCashSubView('cash');
              } else {
                setActiveTab(tab);
              }
            }}
            language={settings.language}
          />
        )}

        {/* Meters Tab */}
        {activeTab === 'meters' && (
          <MetersView
            record={record}
            onUpdateMachines={handleUpdateMachines}
            language={settings.language}
          />
        )}

        {/* Digital Payments Tab */}
        {activeTab === 'digital' && (
          <DigitalPaymentsView
            transactions={record.digitalTransactions}
            onUpdateTransactions={handleUpdateDigitalTransactions}
            language={settings.language}
          />
        )}

        {/* Testing & Cash Tab with Segmented Switch */}
        {(activeTab === 'cash' || activeTab === 'testing') && (
          <div className="space-y-4">
            {/* Sub-view segmented tabs */}
            <div className="flex items-center justify-center p-1 bg-slate-200 rounded-xl max-w-xs mx-auto">
              <button
                onClick={() => setCashSubView('cash')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                  cashSubView === 'cash'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-emerald-700" />
                <span>{settings.language === 'hi' ? 'कैश कैलकुलेटर' : 'Cash Counter'}</span>
              </button>
              <button
                onClick={() => setCashSubView('testing')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                  cashSubView === 'testing'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                <span>{settings.language === 'hi' ? 'फ्यूल टेस्टिंग' : 'Fuel Testing'}</span>
              </button>
            </div>

            {cashSubView === 'cash' ? (
              <CashCalculatorView
                record={record}
                onUpdateCashCount={handleUpdateCashCount}
                onUpdateAdjustments={handleUpdateAdjustments}
                language={settings.language}
              />
            ) : (
              <TestingView
                testingEntries={record.testingEntries}
                rates={record.rates}
                onUpdateTesting={handleUpdateTestingEntries}
                language={settings.language}
              />
            )}
          </div>
        )}

        {/* Daily Report Tab */}
        {activeTab === 'reports' && (
          <ReportsView
            record={record}
            settings={settings}
            availableDates={availableDates}
            onSelectDate={setCurrentDate}
            onStartNewDay={handleStartNewDay}
            language={settings.language}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab === 'testing' ? 'cash' : activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'cash') {
            setCashSubView('cash');
          }
        }}
        language={settings.language}
      />

      {/* Settings & Backup Modal */}
      {showSettingsModal && (
        <SettingsBackupModal
          settings={settings}
          onUpdateSettings={setSettings}
          onReloadRecords={handleReloadRecords}
          onClose={() => setShowSettingsModal(false)}
          language={settings.language}
        />
      )}

      {/* Android Installation Instructions Modal */}
      {showInstallModal && (
        <AndroidInstallModal
          onClose={() => setShowInstallModal(false)}
          language={settings.language}
          onTriggerInstall={install}
          isInstallable={isInstallable}
        />
      )}
    </div>
  );
}
