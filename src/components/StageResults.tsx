import React, { useState } from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { Language, TelemetryPoint, SummaryKPIs, Next24HourAction, AuditLogEntry } from '../types';
import { Plan24hChart } from './SvgCharts';
import {
  FileText,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  CloudSnow,
  TrendingDown,
  BatteryCharging,
  Leaf,
  Layers,
  Info
} from 'lucide-react';

interface StageResultsProps {
  telemetry: TelemetryPoint[];
  kpis: SummaryKPIs;
  plan24h: Next24HourAction[];
  verifiedEntry: AuditLogEntry | null;
  onDownloadPdf: () => void;
  onDownloadCsv: () => void;
  lang: Language;
}

export const StageResults: React.FC<StageResultsProps> = ({
  telemetry,
  kpis,
  plan24h,
  verifiedEntry,
  onDownloadPdf,
  onDownloadCsv,
  lang
}) => {
  const t = TRANSLATIONS[lang];
  const [showDetails, setShowDetails] = useState(false);
  const [weatherSource, setWeatherSource] = useState<'simulated' | 'open-meteo'>('simulated');

  // Weather forecast vs actual sample
  const forecastHorizonSample = plan24h.slice(0, 12);

  return (
    <section className="space-y-6" aria-labelledby="stage-c-heading">
      {/* Top Banner & Export Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 id="stage-c-heading" className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {t.kpi_section_title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              {t.kpi_section_desc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onDownloadPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#1E3A68] hover:bg-[#162d54] text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>{t.btn_download_pdf}</span>
            </button>

            <button
              onClick={onDownloadCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t.btn_download_csv}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Comparison Cards (BASELINE vs AI-OPTIMIZED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Fuel Saved */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.kpi_fuel_saved}</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {kpis.fuelSavedLitres.toLocaleString()} <span className="text-sm font-normal">Litres</span>
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{kpis.fuelSavedPct}% Diesel Consumed Less</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
            Baseline: {kpis.baselineFuelLitres.toLocaleString()} L → Opt: {kpis.optimizedFuelLitres.toLocaleString()} L
          </div>
        </div>

        {/* KPI 2: Generator Runtime Hours */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.kpi_gen_hours}</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-400 font-mono">
            {kpis.optimizedGenHours} <span className="text-sm font-normal">Hours</span>
          </div>
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{kpis.genHoursReducedPct}% Engine Hours Avoided</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
            Baseline: {kpis.baselineGenHours} h (24/7 continuous run)
          </div>
        </div>

        {/* KPI 3: Wet-Stacking Elimination (<40% loading) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.kpi_wet_stacking}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {kpis.optimizedWetStackHours} <span className="text-sm font-normal">Hours</span>
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {kpis.baselineWetStackHours > 0
                ? `${Math.round(((kpis.baselineWetStackHours - kpis.optimizedWetStackHours) / kpis.baselineWetStackHours) * 100)}% Wet-Stacking Reduced`
                : 'Zero Low-Load Wet-Stacking'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
            Baseline had {kpis.baselineWetStackHours} h of low-load soot buildup
          </div>
        </div>

        {/* KPI 4: CO2 Avoided & Landed Fuel Cost */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.kpi_co2_avoided}</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {(kpis.co2AvoidedKg / 1000).toFixed(1)} <span className="text-sm font-normal">Tonnes</span>
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(kpis.costSavedInr / 100000).toFixed(2)} Lakhs Landed Saved
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            Factor: 2.68 kg CO₂/L | ₹310/L polar logistics
          </div>
        </div>
      </div>

      {/* Secondary Metrics Strip: Battery Cycles & Unserved Violations */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BatteryCharging className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">BESS Degradation Health:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
            {kpis.batteryCycles} Eq. Cycles
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 dark:text-slate-400">
            SoH: {Math.max(70, Math.round((100 - kpis.batteryCycles * 0.015) * 10) / 10)}% (Healthy LiFePO4)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Renewable Energy Utilisation:</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {kpis.renewableUtilisationPct}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Microgrid Reserve Violations:</span>
          <span className={`px-2 py-0.5 rounded font-bold font-mono ${
            kpis.reserveViolationsHours === 0
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
          }`}>
            {kpis.reserveViolationsHours.toFixed(1)} Hours {kpis.reserveViolationsHours === 0 ? '(100% Reserve Maintained)' : '(Reserve Shortfall)'}
          </span>
        </div>
      </div>

      {/* 3B. NEXT 24 HOURS PLAN (Advisory Microgrid Dispatch Plan) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                {t.plan_title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.plan_subtitle}
            </p>
          </div>

          {/* Weather Source Toggle */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Weather Forecast Source:</span>
            <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold font-mono">
              ● Simulated Polar Horizon (Growing Error ±3.8°)
            </span>
          </div>
        </div>

        {/* Advisory Warning Callout */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            {t.plan_advisory_notice}
          </p>
        </div>

        {/* 24-Hour Horizon Chart with Shaded Band */}
        <Plan24hChart plan={plan24h} height={200} />

        {/* Next 24 Hours Advisory Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-md">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="p-2.5 font-sans">{t.plan_col_hour}</th>
                <th className="p-2.5">{t.plan_col_pred_load}</th>
                <th className="p-2.5">{t.plan_col_pred_re}</th>
                <th className="p-2.5">{t.plan_col_net}</th>
                <th className="p-2.5">{t.plan_col_bess}</th>
                <th className="p-2.5 font-sans">{t.plan_col_action}</th>
                <th className="p-2.5 font-sans">{t.plan_col_risk}</th>
                <th className="p-2.5 font-sans min-w-[280px]">{t.plan_col_reason}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {plan24h.map((p) => {
                const isHighRisk = p.riskLevel === 'HIGH';
                const isMedRisk = p.riskLevel === 'MEDIUM';

                return (
                  <tr
                    key={p.hour}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      isHighRisk ? 'bg-red-50/50 dark:bg-red-950/20' : ''
                    }`}
                  >
                    <td className="p-2.5 font-sans font-bold text-slate-800 dark:text-slate-200">
                      +{p.hour}h ({p.timeStr})
                    </td>
                    <td className="p-2.5 text-amber-600 dark:text-amber-400 font-bold">{p.predictedLoadKw} kW</td>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">{p.predictedRenewableKw} kW</td>
                    <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-300">
                      {p.netRequirementKw > 0 ? `+${p.netRequirementKw} kW` : `${p.netRequirementKw} kW`}
                    </td>
                    <td className="p-2.5 text-blue-600 dark:text-blue-400">
                      {p.batteryAvailableKw} kW ({p.batteryAvailableKwh} kWh)
                    </td>
                    <td className="p-2.5 font-sans font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        p.generatorAction === 'OFF'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}>
                        {p.generatorAction}
                      </span>
                    </td>
                    <td className="p-2.5 font-sans font-bold">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        isHighRisk
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : isMedRisk
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {p.riskLevel}
                      </span>
                    </td>
                    <td className="p-2.5 font-sans text-slate-600 dark:text-slate-300 text-[11px]">
                      {p.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Charts: Generation Mix vs Load & Battery State */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Mix Breakdown (Dynamically Computed from Telemetry) */}
        {(() => {
          const totalWindKwh = Math.round(telemetry.reduce((acc, d) => acc + d.wind_output_kw * 0.25, 0));
          const totalSolarKwh = Math.round(telemetry.reduce((acc, d) => acc + d.solar_output_kw * 0.25, 0));
          const totalGenKwh = Math.round(telemetry.reduce((acc, d) => acc + d.opt_gen_total_kw * 0.25, 0));
          const totalGrossKwh = Math.max(1, totalWindKwh + totalSolarKwh + totalGenKwh);

          const windPct = ((totalWindKwh / totalGrossKwh) * 100).toFixed(1);
          const solarPct = ((totalSolarKwh / totalGrossKwh) * 100).toFixed(1);
          const genPct = ((totalGenKwh / totalGrossKwh) * 100).toFixed(1);

          return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Generation Dispatch Mix vs Station Demand
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">Computed Share</span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Polar Wind Turbines (assumed value: 60 kW)</span>
                    <span className="font-mono font-bold text-emerald-600">{windPct}% ({totalWindKwh.toLocaleString()} kWh)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${windPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Bifacial Snow-Albedo Solar PV (assumed value: 50 kW)</span>
                    <span className="font-mono font-bold text-amber-500">{solarPct}% ({totalSolarKwh.toLocaleString()} kWh)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${solarPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Dual Diesel Gen-1 & Gen-2 (assumed values: 80 kW & 60 kW)</span>
                    <span className="font-mono font-bold text-indigo-600">{genPct}% ({totalGenKwh.toLocaleString()} kWh)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${genPct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Reason for Low Renewable Output Logic Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Renewable Output Derating & Curtailment Diagnostics
            </h4>
            <span className="text-[11px] text-slate-500">Physics Engine</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <CloudSnow className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{t.reason_icing}: </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Triggered during 82%+ humidity between -15°C and -1°C. Wind generation is automatically derated by up to 40% with blade heating cycled.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <Layers className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{t.reason_snow}: </span>
                <span className="text-slate-600 dark:text-slate-400">
                  65° vertical panel tilt sheds 80% snow; 20% residual accumulation accounted for after blizzards.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{t.reason_cold_cutoff}: </span>
                <span className="text-slate-600 dark:text-slate-400">
                  LiFePO4 charging blocked if internal cell temperature falls below -5°C; insulated container heater draws 1.8 kW auxiliary power.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Details: Weather, Generator Logs, Audit Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          aria-expanded={showDetails}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>{showDetails ? "Hide details" : t.details_weather_audit}</span>
          </div>
          {showDetails ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showDetails && (
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in duration-150">
            {/* Audit Log Table */}
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">
                {t.audit_log_title}
              </h4>
              <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                    <tr>
                      <th className="p-2">Log ID</th>
                      <th className="p-2">Timestamp (UTC)</th>
                      <th className="p-2 font-sans">Verified By</th>
                      <th className="p-2 font-sans">Role</th>
                      <th className="p-2">Employee ID</th>
                      <th className="p-2">Dataset Reference</th>
                      <th className="p-2 font-sans">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifiedEntry ? (
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2 text-blue-600 font-bold">{verifiedEntry.id}</td>
                        <td className="p-2">{verifiedEntry.timestamp}</td>
                        <td className="p-2 font-sans font-semibold text-slate-800 dark:text-slate-100">
                          {verifiedEntry.verifiedByName}
                        </td>
                        <td className="p-2 font-sans">{verifiedEntry.role}</td>
                        <td className="p-2 font-bold">{verifiedEntry.employeeId}</td>
                        <td className="p-2">{verifiedEntry.datasetId}</td>
                        <td className="p-2 text-emerald-600 font-bold">VERIFIED</td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-400">
                          No verification log entries recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
