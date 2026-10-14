import React from 'react';
import { ActiveTab, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { LayoutDashboard, Gauge, Smartphone, Coins, FileSpreadsheet } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab, language }) => {
  const t = getTranslation(language);

  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: t.tabDashboard, icon: LayoutDashboard },
    { id: 'meters', label: t.tabMeters, icon: Gauge },
    { id: 'digital', label: 'Paytm/UPI', icon: Smartphone },
    { id: 'cash', label: 'Testing/Cash', icon: Coins },
    { id: 'reports', label: t.tabReports, icon: FileSpreadsheet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg no-print">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors relative group ${
                isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-b-full"></span>
              )}
              <div
                className={`p-1 rounded-xl transition-transform ${
                  isActive ? 'scale-110 bg-emerald-50 text-emerald-700' : 'group-hover:scale-105'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-semibold tracking-tight mt-0.5 truncate max-w-[64px] ${
                  isActive ? 'text-emerald-700 font-bold' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
