import React, { useState } from 'react';
import { TelemetryPoint, Next24HourAction } from '../types';
import { Table, Download, Eye, EyeOff } from 'lucide-react';

// Decimate points so SVG remains ultra lightweight (<1500 points)
function decimate<T>(items: T[], maxPoints = 800): T[] {
  if (items.length <= maxPoints) return items;
  const step = Math.ceil(items.length / maxPoints);
  const result: T[] = [];
  for (let i = 0; i < items.length; i += step) {
    result.push(items[i]);
  }
  return result;
}

// 1. STAGE A & C: Load vs Renewable Generation Main Chart
export const LoadVsRenewablesChart: React.FC<{
  data: TelemetryPoint[];
  title?: string;
  description?: string;
  height?: number;
}> = ({ data, title, description, height = 300 }) => {
  const [viewTable, setViewTable] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-500">No telemetry data loaded.</div>;
  }

  const sampled = decimate(data, 600);
  const maxLoad = Math.max(...sampled.map(d => Math.max(d.station_load_kw, d.renewable_total_kw, 70)));
  const width = 1000;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const getX = (idx: number) => padding.left + (idx / (sampled.length - 1)) * innerW;
  const getY = (val: number) => padding.top + innerH - (Math.max(0, val) / maxLoad) * innerH;

  const loadPoints = sampled.map((d, i) => `${getX(i)},${getY(d.station_load_kw)}`).join(' ');
  const rePoints = sampled.map((d, i) => `${getX(i)},${getY(d.renewable_total_kw)}`).join(' ');

  // Shaded area for renewables
  const reArea = `${getX(0)},${padding.top + innerH} ` +
    sampled.map((d, i) => `${getX(i)},${getY(d.renewable_total_kw)}`).join(' ') +
    ` ${getX(sampled.length - 1)},${padding.top + innerH}`;

  const hoveredItem = hoverIndex !== null && hoverIndex < sampled.length ? sampled[hoverIndex] : null;

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Station Load (kW)', 'Renewable Output (kW)', 'Wind (kW)', 'Solar (kW)', 'Net Demand (kW)'];
    const rows = sampled.map(d => [
      d.timestamp,
      d.station_load_kw,
      d.renewable_total_kw,
      d.wind_output_kw,
      d.solar_output_kw,
      (d.station_load_kw - d.renewable_total_kw).toFixed(1)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'dhruv_urja_load_vs_renewables.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg">
            {title || "Station Electrical Load vs Total Renewable Generation"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description || "Continuous 30-day time series across extreme polar weather events"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTable(!viewTable)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            aria-label="Toggle data table"
          >
            <Table className="w-3.5 h-3.5 text-blue-600" />
            {viewTable ? "View Chart" : "View as Table"}
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            aria-label="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#D97706]" />
          <span>Station Electrical Load (kW)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#059669]" />
          <span>Renewables (Wind + Bifacial Solar) (kW)</span>
        </div>
        <div className="text-[11px] text-slate-400 ml-auto">
          Hover for instant point readings (Decimated to {sampled.length} points)
        </div>
      </div>

      {!viewTable ? (
        <div className="relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none overflow-visible"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
              const y = padding.top + innerH * (1 - ratio);
              const val = Math.round(maxLoad * ratio);
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800 stroke-[1]"
                    strokeDasharray={ratio === 0 ? "none" : "3,3"}
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[11px] fill-slate-400 font-mono"
                  >
                    {val} kW
                  </text>
                </g>
              );
            })}

            {/* X Axis Time Ticks */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
              const sampleIdx = Math.min(sampled.length - 1, Math.floor((sampled.length - 1) * ratio));
              const x = getX(sampleIdx);
              const label = sampled[sampleIdx]?.timestamp.split(' ')[0] || `Day ${idx * 7}`;
              return (
                <g key={idx}>
                  <line
                    x1={x}
                    y1={padding.top + innerH}
                    x2={x}
                    y2={padding.top + innerH + 5}
                    stroke="currentColor"
                    className="text-slate-300 dark:text-slate-700"
                  />
                  <text
                    x={x}
                    y={padding.top + innerH + 18}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 font-mono"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Renewable Area Fill */}
            <polygon points={reArea} fill="#059669" fillOpacity="0.18" />

            {/* Renewable Line */}
            <polyline
              points={rePoints}
              fill="none"
              stroke="#059669"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Load Line */}
            <polyline
              points={loadPoints}
              fill="none"
              stroke="#D97706"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />

            {/* Hover overlay detector */}
            {sampled.map((_, idx) => {
              const x = getX(idx);
              const stepW = innerW / sampled.length;
              return (
                <rect
                  key={idx}
                  x={x - stepW / 2}
                  y={padding.top}
                  width={stepW}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(idx)}
                  className="cursor-crosshair"
                />
              );
            })}

            {/* Active Hover Crosshair & Point */}
            {hoverIndex !== null && (
              <g>
                <line
                  x1={getX(hoverIndex)}
                  y1={padding.top}
                  x2={getX(hoverIndex)}
                  y2={padding.top + innerH}
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(sampled[hoverIndex].station_load_kw)}
                  r="4.5"
                  fill="#D97706"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(sampled[hoverIndex].renewable_total_kw)}
                  r="4.5"
                  fill="#059669"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredItem && hoverIndex !== null && (
            <div
              className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-2.5 rounded shadow-lg text-xs font-mono border border-slate-700"
              style={{
                left: `${Math.min(75, Math.max(10, (hoverIndex / sampled.length) * 100))}%`,
                top: '12px'
              }}
            >
              <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1">
                {hoveredItem.timestamp}
              </div>
              <div className="text-amber-400">Load: {hoveredItem.station_load_kw} kW</div>
              <div className="text-emerald-400">Renewables: {hoveredItem.renewable_total_kw} kW</div>
              <div className="text-slate-300 text-[10px]">
                (Wind: {hoveredItem.wind_output_kw} kW | Solar: {hoveredItem.solar_output_kw} kW)
              </div>
              <div className="text-blue-300 text-[10px]">
                Temp: {hoveredItem.ambient_temp_c}°C | Wind: {hoveredItem.wind_speed_mps} m/s
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded text-xs font-mono">
          <table className="w-full text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 sticky top-0">
              <tr>
                <th className="p-2">Timestamp</th>
                <th className="p-2">Station Load (kW)</th>
                <th className="p-2">Renewables (kW)</th>
                <th className="p-2">Wind (kW)</th>
                <th className="p-2">Solar (kW)</th>
                <th className="p-2">Net (kW)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {sampled.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-2">{d.timestamp}</td>
                  <td className="p-2 font-semibold text-amber-600">{d.station_load_kw}</td>
                  <td className="p-2 font-semibold text-emerald-600">{d.renewable_total_kw}</td>
                  <td className="p-2">{d.wind_output_kw}</td>
                  <td className="p-2">{d.solar_output_kw}</td>
                  <td className="p-2 text-slate-500">{(d.station_load_kw - d.renewable_total_kw).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 2. STAGE B: XGBoost Loss Convergence Curve
export const LossCurveChart: React.FC<{
  trainLoss: number[];
  valLoss: number[];
  height?: number;
}> = ({ trainLoss, valLoss, height = 180 }) => {
  if (trainLoss.length < 2) return null;
  const width = 500;
  const padding = { top: 15, right: 20, bottom: 25, left: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxLoss = Math.max(...trainLoss, ...valLoss, 14);
  const minLoss = 0;

  const getX = (idx: number) => padding.left + (idx / (trainLoss.length - 1)) * innerW;
  const getY = (val: number) => padding.top + innerH - ((val - minLoss) / (maxLoss - minLoss)) * innerH;

  const trainPts = trainLoss.map((l, i) => `${getX(i)},${getY(l)}`).join(' ');
  const valPts = valLoss.map((l, i) => `${getX(i)},${getY(l)}`).join(' ');

  return (
    <div className="bg-slate-900 text-white rounded p-3 font-mono text-xs">
      <div className="flex justify-between items-center mb-1 text-[11px] text-slate-400">
        <span>XGBoost Training Loss Curve (RMSE)</span>
        <div className="flex gap-3">
          <span className="text-emerald-400">● Train Loss</span>
          <span className="text-amber-400">● Validation Loss</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <line x1={padding.left} y1={padding.top + innerH} x2={width - padding.right} y2={padding.top + innerH} stroke="#334155" />
        <polyline points={valPts} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3,3" />
        <polyline points={trainPts} fill="none" stroke="#10B981" strokeWidth="2.5" />
        <text x={padding.left - 5} y={getY(trainLoss[0]) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{trainLoss[0].toFixed(1)}</text>
        <text x={padding.left - 5} y={getY(trainLoss[trainLoss.length - 1]) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{trainLoss[trainLoss.length - 1].toFixed(1)}</text>
        <text x={width - padding.right} y={padding.top + innerH + 16} textAnchor="end" className="fill-slate-400 text-[10px]">Iter {trainLoss.length}</text>
      </svg>
    </div>
  );
};

// 3. STAGE B & C: Predicted vs Actual with 95% Confidence Band
export const PredictionBandChart: React.FC<{
  data: TelemetryPoint[];
  height?: number;
}> = ({ data, height = 220 }) => {
  const slice = data.slice(-96); // Last 24 hours of 15m intervals
  if (slice.length === 0) return null;

  const width = 600;
  const padding = { top: 20, right: 25, bottom: 30, left: 45 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...slice.map(d => Math.max(d.station_load_kw, d.predicted_load_upper_kw, 70)));
  const minVal = Math.min(...slice.map(d => Math.min(d.station_load_kw, d.predicted_load_lower_kw, 20)));

  const getX = (idx: number) => padding.left + (idx / (slice.length - 1)) * innerW;
  const getY = (val: number) => padding.top + innerH - ((val - minVal) / (maxVal - minVal)) * innerH;

  const actualPts = slice.map((d, i) => `${getX(i)},${getY(d.station_load_kw)}`).join(' ');
  const predPts = slice.map((d, i) => `${getX(i)},${getY(d.predicted_load_kw)}`).join(' ');

  // Shaded band for ±95% confidence interval
  const upperPts = slice.map((d, i) => `${getX(i)},${getY(d.predicted_load_upper_kw)}`);
  const lowerPtsReversed = slice.slice().reverse().map((d, i) => `${getX(slice.length - 1 - i)},${getY(d.predicted_load_lower_kw)}`);
  const bandPolygon = [...upperPts, ...lowerPtsReversed].join(' ');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3">
      <div className="flex justify-between items-center text-xs mb-2">
        <span className="font-semibold text-slate-800 dark:text-slate-200">Load Forecast with 95% Prediction Interval</span>
        <div className="flex gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-100 border border-blue-400 inline-block" /> 95% Band</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-blue-600 inline-block" /> XGBoost Pred</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-slate-900 dark:bg-white inline-block" /> Actual Load</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <polygon points={bandPolygon} fill="#3B82F6" fillOpacity="0.18" />
        <polyline points={predPts} fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="4,2" />
        <polyline points={actualPts} fill="none" stroke="currentColor" className="text-slate-900 dark:text-slate-100" strokeWidth="2" />
      </svg>
    </div>
  );
};

// 4. STAGE C: Next 24 Hours Plan Chart
export const Plan24hChart: React.FC<{
  plan: Next24HourAction[];
  height?: number;
}> = ({ plan, height = 240 }) => {
  if (!plan || plan.length === 0) return null;
  const width = 800;
  const padding = { top: 25, right: 30, bottom: 40, left: 50 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...plan.map(p => Math.max(p.predictedLoadKw, p.predictedRenewableKw, 65)));
  const getX = (idx: number) => padding.left + (idx / (plan.length - 1)) * innerW;
  const getY = (val: number) => padding.top + innerH - (Math.max(0, val) / maxVal) * innerH;

  const loadPts = plan.map((p, i) => `${getX(i)},${getY(p.predictedLoadKw)}`).join(' ');
  const rePts = plan.map((p, i) => `${getX(i)},${getY(p.predictedRenewableKw)}`).join(' ');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
      <div className="flex flex-wrap justify-between items-center mb-2 gap-2 text-xs">
        <div className="font-semibold text-slate-800 dark:text-slate-200">
          24-Hour Horizon: Predicted Load vs Renewable Integration
        </div>
        <div className="flex gap-3 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pred. Load</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pred. Renewable</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y Grid */}
        {[0, 0.5, 1.0].map((r, idx) => (
          <g key={idx}>
            <line
              x1={padding.left}
              y1={padding.top + innerH * (1 - r)}
              x2={width - padding.right}
              y2={padding.top + innerH * (1 - r)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800 stroke-[1]"
            />
            <text
              x={padding.left - 6}
              y={padding.top + innerH * (1 - r) + 4}
              textAnchor="end"
              className="text-[10px] fill-slate-400 font-mono"
            >
              {Math.round(maxVal * r)} kW
            </text>
          </g>
        ))}

        {/* Lines */}
        <polyline points={rePts} fill="none" stroke="#10B981" strokeWidth="2.4" />
        <polyline points={loadPts} fill="none" stroke="#F59E0B" strokeWidth="2.4" />

        {/* Hourly Markers & Action Pills */}
        {plan.map((p, idx) => {
          const x = getX(idx);
          const isHighRisk = p.riskLevel === 'HIGH';
          return (
            <g key={idx}>
              <circle
                cx={x}
                cy={getY(p.predictedLoadKw)}
                r="3"
                fill={isHighRisk ? "#EF4444" : "#F59E0B"}
              />
              {idx % 3 === 0 && (
                <text
                  x={x}
                  y={padding.top + innerH + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-500 font-mono"
                >
                  +{p.hour}h
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
