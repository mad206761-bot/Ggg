import React from 'react';
import { Smartphone, Download, Chrome, ShieldCheck, X, HardDrive, Check } from 'lucide-react';
import { Language } from '../types';

interface AndroidInstallModalProps {
  onClose: () => void;
  language: Language;
  onTriggerInstall?: () => void;
  isInstallable?: boolean;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  onClose,
  language,
  onTriggerInstall,
  isInstallable,
}) => {
  const isHindi = language === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-slate-900">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 sm:p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              {isHindi ? 'एंड्रॉयड फोन पर इंस्टॉल एवं उपयोग निर्देश' : 'Android Mobile Installation Guide'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-600">
          {/* Quick Install Button if browser supports beforeinstallprompt */}
          {isInstallable && onTriggerInstall && (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
              <p className="font-bold text-emerald-900 mb-2">
                {isHindi ? '1-क्लिक में होम स्क्रीन पर जोड़ें:' : 'Quick 1-Click Install Ready:'}
              </p>
              <button
                onClick={() => {
                  onTriggerInstall();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isHindi ? 'अभी ऐप इंस्टॉल करें' : 'Install App Now'}</span>
              </button>
            </div>
          )}

          {/* Step 1: Chrome installation */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Chrome className="w-3.5 h-3.5 text-blue-600" />
                {isHindi ? 'Chrome ब्राउज़र में खोलें' : 'Open in Google Chrome'}
              </h4>
              <p className="mt-0.5 text-slate-500">
                {isHindi
                  ? 'अपने एंड्रॉयड फोन पर Chrome ब्राउज़र में ऐप URL खोलें।'
                  : 'Open the web app URL inside Google Chrome on your Android smartphone.'}
              </p>
            </div>
          </div>

          {/* Step 2: Add to Home screen */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-900">
                {isHindi ? 'तीन बिंदुओं (⋮) पर टैप करें' : 'Tap Menu (⋮) & "Add to Home screen"'}
              </h4>
              <p className="mt-0.5 text-slate-500">
                {isHindi
                  ? 'दाएं कोने में तीन बिंदुओं पर टैप करें और "Install app" या "Add to Home screen" चुनें। यह फोन में असली ऐप की तरह आइकन बना देगा।'
                  : 'Tap the 3 dots menu in Chrome, then select "Install app" or "Add to Home screen". A native app icon will appear on your phone.'}
              </p>
            </div>
          </div>

          {/* Step 3: Offline Data & Backup */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                {isHindi ? 'ऑफलाइन सुरक्षित डाटा' : '100% Offline Persistence'}
              </h4>
              <p className="mt-0.5 text-slate-500">
                {isHindi
                  ? 'सभी रिकॉर्ड्स बिना इंटरनेट के सुरक्षित रहते हैं। सेटिंग्स से समय-समय पर बैकअप JSON फाइल डाउनलोड करके सुरक्षित रखें।'
                  : 'All meter, cash, and digital records stay stored offline on your phone even without internet. Export JSON backups regularly via Settings.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            {isHindi ? 'समझ गया (Close)' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
