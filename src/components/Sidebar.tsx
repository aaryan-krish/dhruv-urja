import React from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { Language, SummaryKPIs, AuditLogEntry } from '../types';
import {
  Database,
  Cpu,
  FileCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  BatteryCharging,
  Flame,
  Radio,
  Clock,
  Download,
  FileText
} from 'lucide-react';

export type ActiveNavView = 'sensor_data' | 'optimization' | 'results' | 'prediction';

interface SidebarProps {
  activeView: ActiveNavView;
  onSelectView: (view: ActiveNavView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  kpis: SummaryKPIs | null;
  hasData: boolean;
  verifiedEntry: AuditLogEntry | null;
  optProgress: number;
  onDownloadPdf: () => void;
  onDownloadCsv: () => void;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  kpis,
  hasData,
  verifiedEntry,
  optProgress,
  onDownloadPdf,
  onDownloadCsv,
  lang
}) => {
  const t = TRANSLATIONS[lang];

  const navItems = [
    {
      id: 'sensor_data' as ActiveNavView,
      title: lang === 'hi' ? 'सेंसर डेटा' : 'Sensor Data',
      subtitle: lang === 'hi' ? 'वर्चुअल डिवाइस टेलीमेट्री' : 'Live Virtual Tags & Feed',
      icon: <Database className="w-5 h-5" />,
      badge: hasData ? (lang === 'hi' ? 'डेटा सक्रिय' : 'Active') : (lang === 'hi' ? 'प्रतीक्षारत' : 'Pending'),
      badgeColor: hasData ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 text-slate-600',
      enabled: true
    },
    {
      id: 'optimization' as ActiveNavView,
      title: lang === 'hi' ? 'ऑप्टिमाइज़ेशन एवं XGBoost' : 'Optimization & XGBoost',
      subtitle: lang === 'hi' ? 'माइक्रोग्रिड प्रेषण एवं एमएल' : 'Dispatch Engine & Loss Curve',
      icon: <Cpu className="w-5 h-5" />,
      badge: optProgress >= 100 ? (lang === 'hi' ? 'पूर्ण' : '100%') : optProgress > 0 ? `${optProgress}%` : (verifiedEntry ? 'Ready' : 'Locked'),
      badgeColor: optProgress >= 100 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : optProgress > 0 ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300' : 'bg-slate-200 text-slate-600',
      enabled: hasData && (verifiedEntry !== null || optProgress > 0)
    },
    {
      id: 'results' as ActiveNavView,
      title: lang === 'hi' ? 'परिणाम एवं रिपोर्ट' : 'Results & Report',
      subtitle: lang === 'hi' ? 'KPI तुलना और औपचारिक PDF' : 'KPIs vs Baseline & Audit Log',
      icon: <FileCheck className="w-5 h-5" />,
      badge: kpis ? (lang === 'hi' ? 'तैयार' : 'Ready') : (lang === 'hi' ? 'लॉक्ड' : 'Locked'),
      badgeColor: kpis ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 text-slate-600',
      enabled: hasData && optProgress >= 100
    },
    {
      id: 'prediction' as ActiveNavView,
      title: lang === 'hi' ? 'अगले 24 घंटे का पूर्वानुमान' : 'Next 24h Prediction',
      subtitle: lang === 'hi' ? 'मौसम-जागरूक प्रेषण परामर्श' : 'Hourly Microgrid Advisory Plan',
      icon: <Sparkles className="w-5 h-5" />,
      badge: hasData ? (lang === 'hi' ? '24 घंटे' : '24h Plan') : 'Pending',
      badgeColor: hasData ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-slate-200 text-slate-600',
      enabled: hasData
    }
  ];

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 select-none shrink-0 flex flex-col justify-between ${
        isCollapsed ? 'w-16' : 'w-64 lg:w-72'
      }`}
      aria-label="Side Toolbar Navigation"
    >
      <div>
        {/* Sidebar Header with Collapse Toggle */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === 'hi' ? 'नेविगेशन टूलबार' : 'Control Menu'}
              </span>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 mx-auto transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="p-2 space-y-1.5" aria-label="Microgrid Views">
          {navItems.map((item) => {
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => item.enabled && onSelectView(item.id)}
                disabled={!item.enabled}
                title={isCollapsed ? `${item.title} - ${item.subtitle}` : undefined}
                className={`w-full text-left rounded-lg transition-all flex items-center ${
                  isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5 gap-3'
                } ${
                  isActive
                    ? 'bg-[#1E3A68] text-white shadow-xs'
                    : item.enabled
                    ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={`shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs sm:text-sm truncate">
                        {item.title}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate ${isActive ? 'text-blue-100/90' : 'text-slate-400'}`}>
                      {item.subtitle}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Microgrid Live Snapshot Box (Visible when expanded) */}
        {!isCollapsed && kpis && (
          <div className="mx-3 mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1.5">
              <span>Station Microgrid Status</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-sans">
                  <Flame className="w-3 h-3 text-amber-500" /> Fuel Saved:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {kpis.fuelSavedPct}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-sans">
                  <BatteryCharging className="w-3 h-3 text-blue-500" /> BESS Health:
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  98.4% (Healthy)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-sans">
                  <Zap className="w-3 h-3 text-emerald-500" /> Engine Loading:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ≥40% (Clean)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Quick Export Actions & Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={onDownloadPdf}
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1E3A68] hover:bg-[#15294a] text-white font-semibold text-xs transition-colors"
                title="Download PDF Report"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Report</span>
              </button>
              <button
                onClick={onDownloadCsv}
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors"
                title="Download CSV Data"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV Data</span>
              </button>
            </div>
            <div className="text-[10px] text-slate-400 text-center font-mono">
              MoES NCPOR ID: 26061
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onDownloadPdf}
              className="p-2 rounded bg-[#1E3A68] text-white hover:bg-[#15294a]"
              title="Download PDF Report"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={onDownloadCsv}
              className="p-2 rounded bg-emerald-700 text-white hover:bg-emerald-600"
              title="Download CSV Data"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
