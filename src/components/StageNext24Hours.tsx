import React, { useState } from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { Language, Next24HourAction } from '../types';
import { Plan24hChart } from './SvgCharts';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Thermometer,
  Wind,
  Battery,
  Zap,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';

interface StageNext24HoursProps {
  plan24h: Next24HourAction[];
  lang: Language;
  onDownloadPdf?: () => void;
}

export const StageNext24Hours: React.FC<StageNext24HoursProps> = ({
  plan24h,
  lang,
  onDownloadPdf
}) => {
  const t = TRANSLATIONS[lang];
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedHour, setSelectedHour] = useState<Next24HourAction | null>(plan24h[0] || null);

  const filteredPlan = plan24h.filter(p => {
    if (riskFilter === 'ALL') return true;
    return p.riskLevel === riskFilter;
  });

  const highRiskCount = plan24h.filter(p => p.riskLevel === 'HIGH').length;
  const mediumRiskCount = plan24h.filter(p => p.riskLevel === 'MEDIUM').length;

  return (
    <section className="space-y-6" id="stage-prediction" aria-labelledby="prediction-heading">
      {/* Header & Quick Risk Tally */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 id="prediction-heading" className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {t.plan_title} (Hour +1 to +24 Horizon)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              Real-time weather-coupled microgrid dispatch recommendations for Bharati Antarctic Station (assumed example).
            </p>
          </div>

          {/* Quick Risk Stat Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold font-mono">
              Horizon: 24 Hours
            </span>
            <span className="px-3 py-1 rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-bold font-mono">
              {highRiskCount} High Risk Alert{highRiskCount !== 1 ? 's' : ''}
            </span>
            <span className="px-3 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold font-mono">
              {mediumRiskCount} Moderate Alert{mediumRiskCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Advisory Mandatory Notice Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-sm text-amber-950 dark:text-amber-100">
            Advisory Operational Rules (Strict Hardware Override Safeguard)
          </div>
          <p className="leading-relaxed opacity-95">
            {t.plan_advisory_notice} Generator is ordered OFF only when battery available discharge power and stored energy (after subzero temperature derating) completely buffer the worst-case drop during cold engine start.
          </p>
        </div>
      </div>

      {/* Main 24-Hour Horizon Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
            Predicted Electrical Load vs Renewable Availability
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {plan24h.length > 0 ? `Confidence: ${plan24h[0].confidencePct}% (+1h) → ${plan24h[plan24h.length - 1].confidencePct}% (+24h)` : ''}
          </span>
        </div>
        <Plan24hChart plan={plan24h} height={220} />
      </div>

      {/* Interactive Hour Inspector & Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Hourly Dispatch Table with Risk Filter */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Hourly Advisory Dispatch Table
            </h3>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px] font-semibold mr-1">Filter:</span>
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    riskFilter === r
                      ? 'bg-[#1E3A68] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 sticky top-0">
                <tr>
                  <th className="p-2.5 font-sans">Hour</th>
                  <th className="p-2.5">Load</th>
                  <th className="p-2.5">Renewable</th>
                  <th className="p-2.5">Net Deficit</th>
                  <th className="p-2.5 font-sans">Generator</th>
                  <th className="p-2.5 font-sans">Battery</th>
                  <th className="p-2.5 font-sans">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredPlan.map((p) => {
                  const isSelected = selectedHour?.hour === p.hour;
                  const isHigh = p.riskLevel === 'HIGH';
                  const isMed = p.riskLevel === 'MEDIUM';

                  return (
                    <tr
                      key={p.hour}
                      onClick={() => setSelectedHour(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-2.5 font-sans font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>+{p.hour}h</span>
                        <span className="text-[10px] text-slate-400 font-mono">({p.timeStr})</span>
                      </td>
                      <td className="p-2.5 text-amber-600 dark:text-amber-400 font-bold">{p.predictedLoadKw} kW</td>
                      <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">{p.predictedRenewableKw} kW</td>
                      <td className="p-2.5 text-slate-700 dark:text-slate-300">
                        {p.netRequirementKw > 0 ? `+${p.netRequirementKw}` : p.netRequirementKw} kW
                      </td>
                      <td className="p-2.5 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.generatorAction === 'OFF'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {p.generatorAction}
                        </span>
                      </td>
                      <td className="p-2.5 font-sans font-medium text-blue-600 dark:text-blue-400">
                        {p.batteryAction}
                      </td>
                      <td className="p-2.5 font-sans font-bold">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          isHigh
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : isMed
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {p.riskLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Click any row to inspect environmental conditions and specific physical reasons in the inspector card on the right.
          </p>
        </div>

        {/* Right Col: Hour Inspector Card */}
        {selectedHour && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hour Detail Inspector</span>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                  +{selectedHour.hour}h Horizon ({selectedHour.timeStr})
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                selectedHour.riskLevel === 'HIGH'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  : selectedHour.riskLevel === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {selectedHour.riskLevel} RISK
              </span>
            </div>

            {/* Environmental Conditions */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-600" />
                  Forecast Temp:
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{selectedHour.forecastTempC} °C</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Wind className="w-3.5 h-3.5 text-blue-600" />
                  Forecast Wind:
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{selectedHour.forecastWindMps} m/s</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Battery className="w-3.5 h-3.5 text-emerald-600" />
                  Cold-Derated Battery:
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedHour.batteryAvailableKw} kW ({selectedHour.batteryAvailableKwh} kWh)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  Forecast Confidence:
                </span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{selectedHour.confidencePct}%</span>
              </div>
            </div>

            {/* Operational Reason Box */}
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded p-3 text-xs space-y-1">
              <span className="font-bold text-blue-900 dark:text-blue-200">Recommended Action & Logic:</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedHour.reason}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
