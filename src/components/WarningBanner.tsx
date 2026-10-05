import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import { Language } from '../types';

export const WarningBanner: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div
      role="alert"
      aria-live="polite"
      className="w-full bg-amber-500/15 dark:bg-amber-950/40 border-b-2 border-amber-500 text-amber-950 dark:text-amber-200 px-4 py-2.5 text-xs sm:text-sm font-medium shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="font-bold tracking-wide uppercase text-amber-800 dark:text-amber-300">
            {t.warning_banner_en}
          </span>
          <span className="hidden sm:inline text-amber-400">|</span>
          <span className="font-semibold text-amber-900/90 dark:text-amber-200">
            {t.warning_banner_hi}
          </span>
        </div>
      </div>
    </div>
  );
};
