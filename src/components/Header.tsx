import React from 'react';
import { DhruvUrjaLogo } from './DhruvUrjaLogo';
import { TRANSLATIONS } from '../i18n/translations';
import { Language } from '../types';
import { Languages, SunMoon, Info } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  textSize: 'sm' | 'md' | 'lg';
  onChangeTextSize: (size: 'sm' | 'md' | 'lg') => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenProblemStatement: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  textSize,
  onChangeTextSize,
  highContrast,
  onToggleHighContrast,
  onOpenProblemStatement,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs relative">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-2 focus:z-50 focus:px-3 focus:py-1 focus:bg-amber-600 focus:text-white focus:rounded text-xs font-semibold"
      >
        {t.skip_to_content}
      </a>

      {/* Compact Government Header with Logo & Essential Problem Statement 26061 Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Logo & Necessary Problem Statement Details from MoES/NCPOR */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo Lockup with Reduced Font Size */}
          <DhruvUrjaLogo size={38} showText={true} />

          {/* Divider */}
          <div className="hidden sm:block h-7 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />

          {/* Necessary Details from Problem Statement 26061 */}
          <div className="hidden sm:flex flex-col justify-center text-left leading-tight min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                MoES • NCPOR
              </span>
              <span>•</span>
              <span className="text-amber-700 dark:text-amber-400 font-mono font-bold">
                ID: 26061
              </span>
              <span>•</span>
              <span className="hidden md:inline text-emerald-600 dark:text-emerald-400">
                Clean & Green Technology
              </span>
            </div>

            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-md lg:max-w-xl">
              AI-Driven Smart Energy Management System for Polar Research Stations
            </div>
          </div>
        </div>

        {/* Right: Modal Details Button & Minimal Compact Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Details Button */}
          <button
            onClick={onOpenProblemStatement}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors"
            title="View Full Problem Statement Table"
          >
            <Info className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Details</span>
          </button>

          {/* Text Size (A-, A, A+) */}
          <div className="hidden lg:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-[10px] font-bold" role="group" aria-label="Text Size">
            <button
              onClick={() => onChangeTextSize('sm')}
              className={`px-1 py-0.2 rounded ${textSize === 'sm' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'}`}
              title="Small"
            >
              A-
            </button>
            <button
              onClick={() => onChangeTextSize('md')}
              className={`px-1 py-0.2 rounded ${textSize === 'md' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'}`}
              title="Normal"
            >
              A
            </button>
            <button
              onClick={() => onChangeTextSize('lg')}
              className={`px-1 py-0.2 rounded ${textSize === 'lg' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'}`}
              title="Large"
            >
              A+
            </button>
          </div>

          {/* High Contrast */}
          <button
            onClick={onToggleHighContrast}
            className={`p-1 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              highContrast ? 'bg-amber-400 text-slate-950 font-bold' : ''
            }`}
            title="High contrast"
            aria-label="High contrast"
          >
            <SunMoon className="w-3.5 h-3.5" />
          </button>

          {/* Language Toggle (EN / हिन्दी) */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#1E3A68] hover:bg-[#15294a] text-white font-bold text-[11px] transition-colors shadow-xs"
            aria-label="Toggle language"
          >
            <Languages className="w-3 h-3 text-amber-400" />
            <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
