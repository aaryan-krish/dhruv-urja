import React, { useState, useMemo } from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { Language, SensorTag, TelemetryPoint, SummaryKPIs, AuditLogEntry } from '../types';
import { LoadVsRenewablesChart } from './SvgCharts';
import {
  Play,
  RotateCw,
  Cpu,
  Layers,
  Thermometer,
  Zap,
  Wind,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Radio,
  FileSpreadsheet,
  Clock,
  Calendar,
  SlidersHorizontal,
  Filter
} from 'lucide-react';

interface StageSensorDataProps {
  telemetry: TelemetryPoint[];
  kpis: SummaryKPIs | null;
  tags: SensorTag[];
  isStreaming: boolean;
  hasData: boolean;
  verifiedEntry: AuditLogEntry | null;
  intervalMinutes: number;
  onChangeInterval: (min: number) => void;
  selectedDays: number;
  onChangeDays: (days: number) => void;
  onStartFeed: () => void;
  onRequestRunOptimization: () => void;
  lang: Language;
}

export const StageSensorData: React.FC<StageSensorDataProps> = ({
  telemetry,
  kpis,
  tags,
  isStreaming,
  hasData,
  verifiedEntry,
  intervalMinutes,
  onChangeInterval,
  selectedDays,
  onChangeDays,
  onStartFeed,
  onRequestRunOptimization,
  lang
}) => {
  const t = TRANSLATIONS[lang];
  const [showDetails, setShowDetails] = useState(false);
  const [activeSource, setActiveSource] = useState<'simulated' | 'real'>('simulated');
  const [tagFilter, setTagFilter] = useState<string>('ALL');

  // Days with Time Mapping Filter (User interactive division)
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'ALL'>('ALL');
  const [selectedHourWindow, setSelectedHourWindow] = useState<'ALL' | 'DAY' | 'NIGHT'>('ALL');

  // Filtered telemetry based on user day/time mapping
  const mappedTelemetry = useMemo(() => {
    return telemetry.filter((d) => {
      if (selectedDayFilter !== 'ALL' && d.day_index !== selectedDayFilter) {
        return false;
      }
      if (selectedHourWindow === 'DAY') {
        return d.hour_of_day >= 6.0 && d.hour_of_day <= 18.0;
      }
      if (selectedHourWindow === 'NIGHT') {
        return d.hour_of_day < 6.0 || d.hour_of_day > 18.0;
      }
      return true;
    });
  }, [telemetry, selectedDayFilter, selectedHourWindow]);

  const filteredTags = tags.filter(tag => {
    if (tagFilter === 'ALL') return true;
    if (tagFilter === 'FAULT') return tag.status !== 'OK';
    return tag.protocol.includes(tagFilter);
  });

  const totalStepsCalculated = Math.round((selectedDays * 24 * 60) / intervalMinutes);

  return (
    <section className="space-y-6" id="stage-sensors" aria-labelledby="stage-a-heading">
      {/* Top Controls & Status Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartFeed}
              disabled={isStreaming}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm shadow-xs transition-all ${
                isStreaming
                  ? 'bg-blue-600 text-white cursor-wait opacity-90'
                  : 'bg-[#1E3A68] hover:bg-[#162d54] text-white'
              }`}
              aria-label={t.btn_start_feed}
            >
              {isStreaming ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>{t.btn_feed_running}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{hasData ? `Regenerate Feed (${selectedDays}d @ ${intervalMinutes >= 60 ? `${intervalMinutes/60}h` : `${intervalMinutes}m`})` : t.btn_start_feed}</span>
                </>
              )}
            </button>

            {/* Quick summary of current division */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{totalStepsCalculated.toLocaleString()} steps</span>
              <span className="text-slate-400">|</span>
              <span>{selectedDays} Days</span>
              <span className="text-slate-400">@</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {intervalMinutes >= 60 ? `${intervalMinutes / 60} Hour${intervalMinutes > 60 ? 's' : ''}` : `${intervalMinutes} Min`}
              </span>
            </div>
          </div>

          {/* Right Controls: Verification Badge & Source Switch */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Source switch */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-md text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveSource('simulated')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeSource === 'simulated'
                    ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-700 dark:text-blue-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.source_simulated}
              </button>
              <button
                type="button"
                disabled={true}
                title="Connect via Modbus/CAN drivers - not available in prototype"
                className="px-3 py-1 rounded text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-75"
              >
                {t.source_real}
              </button>
            </div>

            {/* Verification Status Badge */}
            {verifiedEntry ? (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium"
                title={`Verified by ${verifiedEntry.verifiedByName} on ${verifiedEntry.timestamp}`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">Verified by {verifiedEntry.verifiedByName}</span>
                <span className="text-[11px] opacity-80">({verifiedEntry.role})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium">
                <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span className="font-bold">{t.status_unverified}</span>
              </div>
            )}
          </div>
        </div>

        {/* TIME DIVISION & DURATION SELECTORS (User Request: 30min, 1hr, 2hr, 3hr & 1day, 2day, 15days, 30days) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Duration Division: 1 Day, 2 Days, 7 Days, 15 Days, 30 Days */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Telemetry Duration Division:</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: '1 Day (24h)', val: 1 },
                { label: '2 Days (48h)', val: 2 },
                { label: '7 Days (1 Wk)', val: 7 },
                { label: '15 Days (Half-mo)', val: 15 },
                { label: '30 Days (Full mo)', val: 30 }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => onChangeDays(opt.val)}
                  disabled={isStreaming}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                    selectedDays === opt.val
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Resolution Division: 15 min, 30 min, 1 hr, 2 hr, 3 hr */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Time Resolution Division:</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: '15 Min', val: 15 },
                { label: '30 Min', val: 30 },
                { label: '1 Hour (1hr)', val: 60 },
                { label: '2 Hours (2hr)', val: 120 },
                { label: '3 Hours (3hr)', val: 180 }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => onChangeInterval(opt.val)}
                  disabled={isStreaming}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                    intervalMinutes === opt.val
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DAYS WITH TIME MAPPING CONTROL STRIP (Interactive Day & Hour Slicer) */}
        {hasData && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                <span>Map Days with Time:</span>
              </span>

              {/* Day filter selector */}
              <select
                value={selectedDayFilter}
                onChange={(e) => setSelectedDayFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All {selectedDays} Days Mapped</option>
                {Array.from({ length: selectedDays }, (_, i) => (
                  <option key={i} value={i}>
                    Day {i + 1} (2026-09-{String(i + 1).padStart(2, '0')})
                  </option>
                ))}
              </select>

              {/* Time window selector */}
              <select
                value={selectedHourWindow}
                onChange={(e) => setSelectedHourWindow(e.target.value as any)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Hours (00:00 - 24:00 UTC)</option>
                <option value="DAY">Active Science Window (06:00 - 18:00 UTC)</option>
                <option value="NIGHT">Life Support & Quiet Hours (18:00 - 06:00 UTC)</option>
              </select>
            </div>

            <div className="text-[11px] font-mono text-slate-500">
              Showing {mappedTelemetry.length} mapped readings across selection
            </div>
          </div>
        )}
      </div>

      {/* 4 Summary Cards */}
      {kpis ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Records Count */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">{t.card_records}</span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {kpis.totalRecords.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              {selectedDays} Days @ {intervalMinutes >= 60 ? `${intervalMinutes / 60}h` : `${intervalMinutes}m`} resolution
            </div>
          </div>

          {/* Card 2: Mean Ambient Temperature */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">{t.card_mean_temp}</span>
              <Thermometer className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-extrabold text-cyan-700 dark:text-cyan-400 font-mono">
              {kpis.meanTemperature} °C
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Larsemann Hills winter range
            </div>
          </div>

          {/* Card 3: Average Station Load with Peak */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">{t.card_avg_load}</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {kpis.avgLoadKw} <span className="text-sm font-normal text-slate-500">kW</span>
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
              Peak: {kpis.peakLoadKw} kW (Galley + lasers)
            </div>
          </div>

          {/* Card 4: Renewable Generation Total */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">{t.card_renewables}</span>
              <Wind className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
              {(kpis.totalRenewableKwh / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-500">MWh</span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              {kpis.renewableMixPct}% of station gross demand
            </div>
          </div>
        </div>
      ) : null}

      {/* ONE Main Chart: Load vs Renewable Generation (Uses Mapped Telemetry) */}
      {hasData && (
        <div className="space-y-4">
          <LoadVsRenewablesChart
            data={mappedTelemetry.length > 0 ? mappedTelemetry : telemetry}
            title={`${t.chart_load_vs_renewables} (${selectedDays} Days @ ${intervalMinutes >= 60 ? `${intervalMinutes/60}h` : `${intervalMinutes}m`})`}
            description={
              selectedDayFilter !== 'ALL'
                ? `Zoomed to Day ${Number(selectedDayFilter) + 1} with time mapping across 24 hours`
                : `${selectedDays}-day continuous profile showing extreme katabatic wind bursts and diurnal cycles`
            }
          />

          {/* Call to Action: Run Optimization Button with Verification Prompt */}
          <div className="bg-gradient-to-r from-blue-900 to-[#1E3A68] text-white rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <div className="font-bold text-base sm:text-lg flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <span>AI-Driven Microgrid Optimization & Load Forecasting</span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl">
                Execute rolling XGBoost load prediction, 40% minimum engine load constraint enforcement, and polar BESS cold-derate microgrid dispatch.
              </p>
            </div>

            <button
              onClick={onRequestRunOptimization}
              disabled={!hasData}
              className="shrink-0 px-6 py-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center gap-2 focus:ring-2 focus:ring-amber-300"
            >
              <span>{t.btn_run_optimization}</span>
              <ShieldCheck className="w-4 h-4 text-slate-900" />
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Details Panel: 18 Virtual Sensor Tags, Protocol Filters, & Raw Preview */}
      {hasData && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            aria-expanded={showDetails}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>{showDetails ? t.details_panel_hide : t.details_panel_title}</span>
              <span className="text-xs font-normal text-slate-500">
                ({tags.length} virtual telemetry tags active)
              </span>
            </div>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showDetails && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in duration-150">
              {/* Tag Protocol Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Filter Protocol:</span>
                  {(['ALL', 'Modbus RTU', 'Modbus TCP', 'CAN', 'OPC UA', 'FAULT'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTagFilter(f)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        tagFilter === f
                          ? 'bg-[#1E3A68] text-white border-[#1E3A68]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Simulated faults injected: Ultrasonic icing & Modbus telemetry delay
                </div>
              </div>

              {/* Sensor Tags Register Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-md">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5">{t.col_tag_id}</th>
                      <th className="p-2.5 font-sans">{t.col_name}</th>
                      <th className="p-2.5 font-sans">{t.col_device}</th>
                      <th className="p-2.5">{t.col_protocol}</th>
                      <th className="p-2.5 text-right">{t.col_value}</th>
                      <th className="p-2.5">{t.col_unit}</th>
                      <th className="p-2.5">{t.col_status}</th>
                      <th className="p-2.5">{t.col_timestamp}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredTags.map((tag) => {
                      const isFault = tag.status === 'FAULT';
                      const isStale = tag.status === 'STALE';

                      return (
                        <tr
                          key={tag.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                            isFault ? 'bg-red-50/60 dark:bg-red-950/20' : isStale ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <td className="p-2.5 font-bold text-blue-700 dark:text-blue-400">{tag.id}</td>
                          <td className="p-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">
                            {lang === 'hi' ? tag.name_hi : tag.name}
                            {tag.fault_reason && (
                              <div className="text-[10px] text-red-600 dark:text-red-400 font-sans italic">
                                {tag.fault_reason}
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400">
                            {lang === 'hi' ? tag.device_hi : tag.device}
                          </td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-sans">
                              {tag.protocol}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900 dark:text-slate-100">
                            {typeof tag.value === 'number' ? tag.value.toLocaleString() : tag.value}
                          </td>
                          <td className="p-2.5 text-slate-500">{tag.unit}</td>
                          <td className="p-2.5">
                            {isFault ? (
                              <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-400 font-bold">
                                <AlertOctagon className="w-3 h-3" /> FAULT
                              </span>
                            ) : isStale ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold">
                                STALE
                              </span>
                            ) : (
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                OK
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-400 text-[11px]">{tag.timestamp}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
