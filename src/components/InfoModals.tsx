import React from 'react';
import { X, Shield, FileText, Info, Award, Phone, CheckCircle, ExternalLink } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import { Language } from '../types';

export type ModalType =
  | 'about'
  | 'services'
  | 'notices'
  | 'downloads'
  | 'contact'
  | 'accessibility'
  | 'privacy'
  | 'terms';

interface InfoModalsProps {
  activeModal: ModalType | null;
  onClose: () => void;
  lang: Language;
}

export const InfoModals: React.FC<InfoModalsProps> = ({ activeModal, onClose, lang }) => {
  if (!activeModal) return null;

  const t = TRANSLATIONS[lang];

  let title = '';
  let content: React.ReactNode = null;

  switch (activeModal) {
    case 'about':
      title = "About Dhruv Urja (ध्रुव ऊर्जा) - Prototype Overview";
      content = (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            <strong>Problem Statement 26061:</strong> AI-Driven Smart Energy Management System for Polar Research Stations.
          </p>
          <p>
            Developed for Problem Statement 26061 (MoES / NCPOR). Bharati Station (69°24'S, 76°11'E, Larsemann Hills) is referenced as an <em>assumed example</em> to demonstrate simulated microgrid optimization.
          </p>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-1">Key Engineering Goals:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Prevent diesel generator wet-stacking by enforcing a strict 40% minimum loading rule.</li>
              <li>Integrate wind turbines (assumed value: 60 kW) and bifacial solar arrays (assumed value: 50 kW).</li>
              <li>Coordinate containerized LiFePO4 battery storage (assumed value: 200 kWh) with subzero thermal management.</li>
              <li>Provide rolling 24-hour horizon XGBoost load forecasts and advisory dispatch instructions.</li>
            </ul>
          </div>
        </div>
      );
      break;

    case 'services':
      title = "Microgrid Advisory Services & Capabilities";
      content = (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Dhruv Urja runs continuous advisory microgrid optimization across three operational layers:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">1. Predictive Forecasting</h4>
              <p className="text-xs text-slate-500 mt-1">
                Rolling online XGBoost machine learning model trained with extreme katabatic wind, solar elevation, and thermal infiltration features.
              </p>
            </div>
            <div className="p-3 rounded border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">2. Cold-Derated BESS Control</h4>
              <p className="text-xs text-slate-500 mt-1">
                Temperature-compensated charge and discharge limits protecting lithium cells from plating below -5°C.
              </p>
            </div>
            <div className="p-3 rounded border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">3. Waste Heat Recovery (WHRU)</h4>
              <p className="text-xs text-slate-500 mt-1">
                Hydronic thermal looping capturing 55% of engine jacket waste heat to maintain indoor living temperatures above 20°C.
              </p>
            </div>
            <div className="p-3 rounded border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">4. Fail-Safe Always-On Rule</h4>
              <p className="text-xs text-slate-500 mt-1">
                Autonomous fallback to the legacy continuous generator run rule whenever sensors become stale or forecast confidence drops below 70%.
              </p>
            </div>
          </div>
        </div>
      );
      break;

    case 'notices':
      title = "Prototype Operational Notices";
      content = (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-300 dark:border-amber-800">
            <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">Notice Ref: DU/PROTO/2026</span>
            <h4 className="font-bold text-amber-900 dark:text-amber-200 mt-0.5">Prototype Deployment Stage</h4>
            <p className="mt-1 text-xs">
              This system operates in <strong>advisory prototype mode</strong> with simulated sensor telemetry. It is not an official Government of India website.
            </p>
          </div>
          <div className="p-3 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-mono text-slate-400">01 October 2026</span>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Bifacial PV Albedo Calibration</h4>
            <p className="text-xs text-slate-500 mt-1">
              Simulated snow reflection models show an estimated 14.8% rear irradiance gain on vertical 65° mounts.
            </p>
          </div>
        </div>
      );
      break;

    case 'downloads':
      title = "Downloads & Prototype Documents";
      content = (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <ul className="space-y-2">
            <li className="p-3 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">Dhruv Urja System Architecture Specification (Prototype)</div>
                <div className="text-xs text-slate-400">PDF • Technical Document (Problem 26061)</div>
              </div>
              <button onClick={() => window.print()} className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold hover:bg-blue-100">
                Print/Save
              </button>
            </li>
            <li className="p-3 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">Station Simulated Telemetry (CSV)</div>
                <div className="text-xs text-slate-400">CSV • Modbus/CAN Virtual Sensor Tags</div>
              </div>
              <button onClick={onClose} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold hover:bg-emerald-100">
                Download
              </button>
            </li>
          </ul>
        </div>
      );
      break;

    case 'contact':
      title = "Project Contact Information";
      content = (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p>
            For engineering inquiries regarding Problem Statement ID 26061:
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 space-y-2">
            <div>
              <strong>Engineering Prototype Team (Problem 26061)</strong>
              <div className="text-slate-500">Theme: Clean & Green Technology | Category: Software</div>
            </div>
            <div>
              <strong>Email Contact:</strong> <span className="font-mono text-blue-600">polar-energy-prototype@example.com</span>
            </div>
          </div>
        </div>
      );
      break;

    case 'accessibility':
      title = "Accessibility Statement (WCAG 2.1 AA Compliance)";
      content = (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Dhruv Urja adheres to the Guidelines for Indian Government Websites (GIGW) and the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><strong>Text Scaling:</strong> Interactive font adjustments (A-, A, A+) without loss of layout integrity.</li>
            <li><strong>High Contrast Mode:</strong> High contrast color schemes for low-vision users.</li>
            <li><strong>Keyboard Navigation:</strong> Fully operable via standard keyboard (Tab, Enter, Esc).</li>
            <li><strong>Screen Reader Support:</strong> ARIA labels, semantic landmark roles, and chart text summaries.</li>
          </ul>
        </div>
      );
      break;

    case 'privacy':
    case 'terms':
      title = activeModal === 'privacy' ? "Privacy Policy" : "Terms of Use & Disclaimer";
      content = (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            This portal is an engineering simulation prototype developed for MoES/NCPOR Problem ID 26061.
          </p>
          <p>
            <strong>Disclaimer:</strong> All telemetry displayed within this demonstration application is synthesized through polar physical transfer models and simulated sensor tags. Do not use for real-world life-support microgrid switching.
          </p>
        </div>
      );
      break;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-xl overflow-hidden text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#1E3A68] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-base">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {content}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#1E3A68] text-white font-semibold text-xs sm:text-sm hover:bg-[#15294a]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
