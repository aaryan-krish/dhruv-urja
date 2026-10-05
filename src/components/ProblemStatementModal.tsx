import React from 'react';
import { X, ExternalLink, ShieldCheck, Award } from 'lucide-react';

interface ProblemStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProblemStatementModal: React.FC<ProblemStatementModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ps-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="bg-[#1E3A68] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 id="ps-title" className="font-extrabold text-base tracking-wide uppercase">
              PROBLEM STATEMENT DETAILS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table exactly as in Screenshot 2026-10-04 121948.png */}
        <div className="p-5 overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="w-1/3 p-3 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40">
                  Problem Statement ID
                </td>
                <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                  26061
                </td>
              </tr>

              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40">
                  Problem Statement Title
                </td>
                <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                  AI-Driven Smart Energy Management System for Polar Research Stations
                </td>
              </tr>

              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40">
                  Description
                </td>
                <td className="p-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                  Develop an intelligent energy-management system using AI for load forecasting, renewable energy integration and fuel optimization under extreme polar conditions.
                </td>
              </tr>

              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40">
                  Organization
                </td>
                <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                  Ministry of Earth Sciences (MoES)
                </td>
              </tr>

              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40">
                  Department
                </td>
                <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                  National Centre for Polar and Ocean Research (NCPOR)
                </td>
              </tr>

              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40">
                  Category
                </td>
                <td className="p-3 text-slate-800 dark:text-slate-200">
                  Software
                </td>
              </tr>

              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40">
                  Theme
                </td>
                <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                  Clean & Green Technology
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Bharati Antarctic Research Station (69°24'S, 76°11'E)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#1E3A68] text-white font-semibold text-xs sm:text-sm hover:bg-[#15294a] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
