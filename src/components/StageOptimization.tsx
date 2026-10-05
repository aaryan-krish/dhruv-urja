import React from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { Language, TelemetryPoint, XGBoostMetricState } from '../types';
import { LossCurveChart, PredictionBandChart } from './SvgCharts';
import { Cpu, Zap, Activity, CheckCircle2, TrendingUp, BarChart2, ShieldAlert } from 'lucide-react';

interface StageOptimizationProps {
  telemetry: TelemetryPoint[];
  optProgress: number; // 0 to 100
  isOptimizing: boolean;
  xgbMetrics: XGBoostMetricState;
  onFinishOptimization: () => void;
  lang: Language;
}

export const StageOptimization: React.FC<StageOptimizationProps> = ({
  telemetry,
  optProgress,
  isOptimizing,
  xgbMetrics,
  onFinishOptimization,
  lang
}) => {
  const t = TRANSLATIONS[lang];

  // Slice live simulation window based on progress
  const visibleCount = Math.max(30, Math.floor((telemetry.length * optProgress) / 100));
  const currentSlice = telemetry.slice(0, visibleCount);
  const latest = currentSlice[currentSlice.length - 1] || telemetry[0];

  // Accuracy gain vs baseline
  const maeImprovementPct = Math.round(
    ((xgbMetrics.baselineMae - xgbMetrics.mae) / xgbMetrics.baselineMae) * 100
  );

  return (
    <section className="space-y-6" aria-labelledby="stage-b-heading">
      {/* Top Stage Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              <h2 id="stage-b-heading" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t.stage_optimization} (Microgrid Dispatch & Rolling Machine Learning)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Dual execution: Real-time polar battery dispatch coordination & online XGBoost gradient boosted regression
            </p>
          </div>

          <div className="flex items-center gap-3">
            {optProgress >= 100 ? (
              <button
                onClick={onFinishOptimization}
                className="px-5 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xs transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>View Full Results & Report</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded border border-blue-200 dark:border-blue-800">
                <Activity className="w-4 h-4 animate-spin text-blue-600" />
                <span>Advancing: {optProgress}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-4 overflow-hidden">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${optProgress}%` }}
          />
        </div>
      </div>

      {/* Side-by-side Dual Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL: Optimization Run (Live Microgrid Dispatch) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                  {t.panel_opt_title}
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                Rule: ≥40% Min Engine Load
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {t.panel_opt_desc}
            </p>

            {/* Live Instant Meters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-200 dark:border-slate-700/60">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Gen-1 Output</div>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                  {latest.opt_gen1_kw} <span className="text-xs font-normal">kW</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {latest.opt_gen1_kw > 0 ? (
                    <span className="text-emerald-600 font-semibold">● RUNNING ({Math.round((latest.opt_gen1_kw/80)*100)}% load)</span>
                  ) : (
                    <span className="text-slate-400">○ OFF (Fuel zero)</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-200 dark:border-slate-700/60">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">BESS State of Charge</div>
                <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                  {latest.opt_bess_soc_pct}%
                </div>
                <div className="text-[10px] text-slate-500">
                  {latest.opt_bess_power_kw > 0 ? `Discharging (${latest.opt_bess_power_kw} kW)` : latest.opt_bess_power_kw < 0 ? `Charging (${Math.abs(latest.opt_bess_power_kw)} kW)` : 'Idle buffer'}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-200 dark:border-slate-700/60 col-span-2 sm:col-span-1">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Indoor Living Temp</div>
                <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                  {latest.opt_indoor_temp_c} °C
                </div>
                <div className="text-[10px] text-slate-500">
                  Safe minimum: 16.0 °C
                </div>
              </div>
            </div>

            {/* Live Microgrid Mini Dispatch SVG */}
            <div className="border border-slate-200 dark:border-slate-700 rounded p-3 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex justify-between">
                <span>Microgrid Generation Mix (Last 72 Hours)</span>
                <span className="text-slate-400 font-mono text-[10px]">{latest.timestamp}</span>
              </div>

              <div className="h-44 w-full">
                {/* SVG Visualizing Stacked Dispatch */}
                <svg viewBox="0 0 500 160" className="w-full h-full select-none">
                  {/* Grid */}
                  <line x1="30" y1="130" x2="480" y2="130" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />

                  {/* Draw live traces for visible telemetry */}
                  {(() => {
                    const sample = currentSlice.slice(-100);
                    if (sample.length < 2) return null;
                    const getX = (i: number) => 30 + (i / (sample.length - 1)) * 450;
                    const getY = (val: number) => 130 - (Math.min(90, Math.max(0, val)) / 90) * 110;

                    const genPts = sample.map((d, i) => `${getX(i)},${getY(d.opt_gen_total_kw)}`).join(' ');
                    const rePts = sample.map((d, i) => `${getX(i)},${getY(d.renewable_total_kw)}`).join(' ');
                    const loadPts = sample.map((d, i) => `${getX(i)},${getY(d.station_load_kw)}`).join(' ');

                    return (
                      <g>
                        <polyline points={rePts} fill="none" stroke="#10B981" strokeWidth="1.8" />
                        <polyline points={genPts} fill="none" stroke="#6366F1" strokeWidth="2" strokeDasharray="2,1" />
                        <polyline points={loadPts} fill="none" stroke="#F59E0B" strokeWidth="2.2" />
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Station Load</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Renewables</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Diesel Gen</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded p-3 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Wet-Stacking Prevention Engaged</span>
            </div>
            <p className="mt-0.5 text-[11px] opacity-90">
              Diesel generator loading is strictly maintained above 40% (32 kW). Any surplus is redirected to the LiFePO4 battery bank, eliminating soot buildup.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: XGBoost Training & Performance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                  {t.panel_xgb_title}
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold font-mono">
                Iter {xgbMetrics.currentIteration} / {xgbMetrics.maxIterations}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {t.panel_xgb_desc}
            </p>

            {/* Error Metrics Comparison Table */}
            <div className="grid grid-cols-3 gap-2 my-4 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded border border-slate-200 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">MAE</div>
                <div className="text-base font-bold font-mono text-blue-700 dark:text-blue-400">
                  {xgbMetrics.mae} kW
                </div>
                <div className="text-[10px] text-slate-400 line-through">
                  Base: {xgbMetrics.baselineMae} kW
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded border border-slate-200 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">RMSE</div>
                <div className="text-base font-bold font-mono text-blue-700 dark:text-blue-400">
                  {xgbMetrics.rmse} kW
                </div>
                <div className="text-[10px] text-slate-400 line-through">
                  Base: {xgbMetrics.baselineRmse} kW
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded border border-slate-200 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Accuracy Gain</div>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{maeImprovementPct}%</span>
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  vs Hourly-Avg
                </div>
              </div>
            </div>

            {/* Loss Curve Chart */}
            <div className="mb-4">
              <LossCurveChart
                trainLoss={xgbMetrics.trainLossCurve}
                valLoss={xgbMetrics.valLossCurve}
                height={130}
              />
            </div>

            {/* Feature Importance Rankings */}
            <div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Feature Importance Rankings (Gain %)</span>
              </div>
              <div className="space-y-1.5">
                {xgbMetrics.featureImportances.slice(0, 4).map((f) => (
                  <div key={f.name} className="flex items-center text-xs">
                    <span className="w-40 truncate text-slate-600 dark:text-slate-400 font-mono text-[11px]">{f.name}</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 mx-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(3, f.importance))}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                      {f.importance}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded p-3 text-xs text-blue-900 dark:text-blue-200">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Time-Series Split & Zero Leakage Validation</span>
            </div>
            <p className="mt-0.5 text-[11px] opacity-90">
              Rolling cross-validation with horizon weather forecasts (temperature, wind, GHI) used strictly as causal inputs.
            </p>
          </div>
        </div>
      </div>

      {/* Prediction Band Chart Across Full Width */}
      <PredictionBandChart data={currentSlice} height={200} />
    </section>
  );
};
