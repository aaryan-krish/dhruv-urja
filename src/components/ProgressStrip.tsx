import React from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { Language } from '../types';
import { Database, Cpu, FileCheck } from 'lucide-react';

export type StageId = 'sensor_data' | 'optimization' | 'results';

interface ProgressStripProps {
  currentStage: StageId;
  onSelectStage: (stage: StageId) => void;
  hasData: boolean;
  isVerified: boolean;
  lang: Language;
}

export const ProgressStrip: React.FC<ProgressStripProps> = ({
  currentStage,
  onSelectStage,
  hasData,
  isVerified,
  lang
}) => {
  const t = TRANSLATIONS[lang];

  const stages: Array<{ id: StageId; label: string; icon: React.ReactNode; enabled: boolean }> = [
    {
      id: 'sensor_data',
      label: t.stage_sensor_data,
      icon: <Database className="w-3.5 h-3.5" />,
      enabled: true
    },
    {
      id: 'optimization',
      label: t.stage_optimization,
      icon: <Cpu className="w-3.5 h-3.5" />,
      enabled: hasData && isVerified
    },
    {
      id: 'results',
      label: t.stage_results_report,
      icon: <FileCheck className="w-3.5 h-3.5" />,
      enabled: hasData && isVerified
    }
  ];

  return (
    <nav className="w-full bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-2 px-4" aria-label="Workflow Stages">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 sm:gap-4">
        {stages.map((stage, idx) => {
          const isActive = currentStage === stage.id;
          const isPassed = (stage.id === 'sensor_data' && hasData) || (stage.id === 'optimization' && isVerified);

          return (
            <React.Fragment key={stage.id}>
              <button
                onClick={() => stage.enabled && onSelectStage(stage.id)}
                disabled={!stage.enabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1E3A68] text-white shadow-xs'
                    : stage.enabled
                    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isActive
                    ? 'bg-white text-[#1E3A68]'
                    : isPassed
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {idx + 1}
                </span>
                <span>{stage.label}</span>
              </button>

              {idx < stages.length - 1 && (
                <div
                  className={`h-0.5 flex-1 max-w-[60px] sm:max-w-[100px] transition-colors ${
                    isPassed ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
