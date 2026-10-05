export type Language = 'en' | 'hi';

export type SensorProtocol = 'Modbus RTU' | 'Modbus TCP' | 'CAN bus (J1939)' | 'OPC UA';

export type SensorStatus = 'OK' | 'STALE' | 'FAULT';

export interface SensorTag {
  id: string;
  name: string;
  name_hi: string;
  device: string;
  device_hi: string;
  protocol: SensorProtocol;
  value: number | string;
  unit: string;
  timestamp: string;
  status: SensorStatus;
  fault_reason?: string;
}

export interface TelemetryPoint {
  timestamp: string;
  hour_of_day: number;
  day_index: number;
  // Weather
  ambient_temp_c: number;
  wind_speed_mps: number;
  wind_gust_mps: number;
  solar_ghi_wm2: number;
  rel_humidity_pct: number;
  icing_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  // Station load
  station_load_kw: number;
  base_load_kw: number;
  heating_load_kw: number;
  // Renewables
  wind_output_kw: number;
  solar_output_kw: number;
  renewable_total_kw: number;
  // Baseline (always-on generator)
  baseline_gen_kw: number;
  baseline_fuel_lph: number;
  baseline_is_wet_stacking: boolean;
  // Optimized dispatch
  opt_gen1_kw: number;
  opt_gen2_kw: number;
  opt_gen_total_kw: number;
  opt_fuel_lph: number;
  opt_bess_soc_pct: number;
  opt_bess_power_kw: number; // positive = discharge, negative = charge
  opt_bess_status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  opt_bess_temp_c: number;
  opt_waste_heat_kw: number;
  opt_indoor_temp_c: number;
  opt_is_wet_stacking: boolean;
  opt_spinning_reserve_kw: number;
  // Forecast & AI
  predicted_load_kw: number;
  predicted_load_lower_kw: number;
  predicted_load_upper_kw: number;
  predicted_renewable_kw: number;
}

export interface SummaryKPIs {
  totalRecords: number;
  meanTemperature: number;
  avgLoadKw: number;
  peakLoadKw: number;
  totalRenewableKwh: number;
  renewableMixPct: number;
  baselineFuelLitres: number;
  optimizedFuelLitres: number;
  fuelSavedLitres: number;
  fuelSavedPct: number;
  baselineGenHours: number;
  optimizedGenHours: number;
  genHoursReducedPct: number;
  baselineWetStackHours: number;
  optimizedWetStackHours: number;
  reserveViolationsHours: number;
  renewableUtilisationPct: number;
  batteryCycles: number;
  co2AvoidedKg: number;
  costSavedInr: number;
}

export interface Next24HourAction {
  hour: number;
  timeStr: string;
  predictedLoadKw: number;
  predictedRenewableKw: number;
  netRequirementKw: number;
  batteryAvailableKw: number;
  batteryAvailableKwh: number;
  forecastTempC: number;
  forecastWindMps: number;
  generatorAction: 'OFF' | 'GEN-1 (65%)' | 'GEN-1 (85%)' | 'GEN-1+2 (75%)';
  batteryAction: 'CHARGE' | 'DISCHARGE' | 'IDLE' | 'TRICKLE-HEATING';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  confidencePct: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  verifiedByName: string;
  role: 'Scientist' | 'Station Engineer';
  employeeId: string;
  datasetId: string;
  declarationAccepted: boolean;
  notes?: string;
}

export interface XGBoostMetricState {
  currentIteration: number;
  maxIterations: number;
  trainLossCurve: number[];
  valLossCurve: number[];
  mae: number;
  rmse: number;
  mape: number;
  baselineMae: number;
  baselineRmse: number;
  baselineMape: number;
  featureImportances: { name: string; importance: number }[];
}
