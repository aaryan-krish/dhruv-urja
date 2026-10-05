import rawConfig from '../../config.json';

export interface AppConfig {
  station: {
    name: string;
    name_hi: string;
    location: string;
    elevation_m: number;
    design_winter_temp_c: number;
    design_summer_temp_c: number;
    safe_minimum_indoor_temp_c: number;
    target_indoor_temp_c: number;
    thermal_loss_coefficient_kw_per_c: number;
    wind_infiltration_factor: number;
    station_base_electrical_load_kw: number;
    occupancy_nominal: number;
    occupancy_max: number;
  };
  generators: Array<{
    id: string;
    name: string;
    rated_power_kw: number;
    min_stable_load_pct: number;
    fuel_curve_a_l_per_kwh: number;
    fuel_curve_b_l_per_hr_at_idle: number;
    start_delay_minutes: number;
    min_run_time_minutes: number;
    min_stop_time_minutes: number;
    waste_heat_recovery_efficiency_pct: number;
    wet_stacking_threshold_pct: number;
  }>;
  battery: {
    id: string;
    chemistry: string;
    nominal_capacity_kwh: number;
    nominal_power_kw: number;
    soc_min_pct: number;
    soc_max_pct: number;
    soc_reserve_emergency_pct: number;
    round_trip_efficiency_pct: number;
    charge_cutoff_temp_c: number;
    discharge_cutoff_temp_c: number;
    thermal_management_heater_kw: number;
    cold_derate: Array<{
      temp_c: number;
      power_mult: number;
      cap_mult: number;
    }>;
  };
  renewables: {
    wind: {
      id: string;
      count: number;
      rated_power_per_unit_kw: number;
      total_capacity_kw: number;
      cut_in_speed_mps: number;
      rated_speed_mps: number;
      cut_out_speed_mps: number;
      cold_shutdown_temp_c: number;
      icing_temp_range: number[];
      icing_humidity_threshold_pct: number;
      max_icing_loss_pct: number;
    };
    solar: {
      id: string;
      total_capacity_kw: number;
      tilt_angle_deg: number;
      temp_coefficient_pct_per_c: number;
      nominal_operating_temp_c: number;
      snow_coverage_loss_max_pct: number;
      polar_night_months: number[];
      polar_day_months: number[];
    };
  };
  emission_factors: {
    diesel_kg_co2_per_litre: number;
    diesel_cost_inr_per_litre_at_polar_site: number;
  };
  optimizer: {
    time_step_minutes: number;
    forecast_horizon_hours: number;
    safety_margin_kwh: number;
    battery_degraded_soh_threshold_pct: number;
    stale_sensor_timeout_seconds: number;
    generator_min_loading_rule_pct: number;
    spinning_reserve_margin_pct: number;
  };
  metadata: {
    system_name: string;
    system_name_hindi: string;
    tagline_en: string;
    tagline_hi: string;
    ref_number: string;
    issue_date: string;
    organization: string;
    department: string;
    problem_id: string;
  };
}

export const APP_CONFIG: AppConfig = rawConfig as unknown as AppConfig;
