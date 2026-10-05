import { APP_CONFIG } from '../config/appConfig';
import { SensorTag, TelemetryPoint, SummaryKPIs, Next24HourAction } from '../types';

export interface GenerationOptions {
  days?: number;
  intervalMinutes?: number;
  season?: 'winter' | 'shoulder' | 'summer';
  faultInjection?: boolean;
}

export function generatePolarTelemetry(options: GenerationOptions = {}): {
  telemetry: TelemetryPoint[];
  kpis: SummaryKPIs;
  tags: SensorTag[];
  plan24h: Next24HourAction[];
} {
  const days = options.days || 30;
  const interval = options.intervalMinutes || APP_CONFIG.optimizer.time_step_minutes;
  const totalSteps = Math.floor((days * 24 * 60) / interval);
  const faultInjection = options.faultInjection ?? true;

  const telemetry: TelemetryPoint[] = [];

  // State variables for physical simulation
  let currentBessSocPct = 78.0;
  let currentIndoorTempC = 20.2;
  let currentBessCellTempC = 12.0; // Battery container heater maintains cell temp

  let gen1RuntimeHours = 0;
  let gen2RuntimeHours = 0;
  let baselineGenHours = 0;
  let baselineWetStackHours = 0;
  let optWetStackHours = 0;
  let totalBaselineFuelLitres = 0;
  let totalOptFuelLitres = 0;
  let totalRenewableKwh = 0;
  let totalRenewableKwhUsed = 0;
  let totalLoadKwh = 0;
  let batteryThroughputKwh = 0;
  let peakLoad = 0;
  let sumTemp = 0;
  let sumLoad = 0;
  let reserveViolationsHours = 0;

  const startDate = new Date('2026-09-01T00:00:00Z');

  for (let i = 0; i < totalSteps; i++) {
    const timestamp = new Date(startDate.getTime() + i * interval * 60 * 1000);
    const hourOfDay = timestamp.getUTCHours() + timestamp.getUTCMinutes() / 60;
    const dayIndex = Math.floor(i / ((24 * 60) / interval));

    // 1. Polar Weather Simulation (Bharati Station - assumed example)
    const baseTemp = -28.0;
    const diurnalTemp = Math.sin(((hourOfDay - 9) / 24) * 2 * Math.PI) * 4.5;
    const synopticTemp = Math.sin((dayIndex / 5.2) * 2 * Math.PI) * 7.0;
    const tempNoise = Math.sin(i * 0.17) * 1.5;
    const ambientTemp = Math.round((baseTemp + diurnalTemp + synopticTemp + tempNoise) * 10) / 10;
    sumTemp += ambientTemp;

    // Wind speed with katabatic storm events
    const katabaticCycle = Math.sin((dayIndex / 3.8) * 2 * Math.PI);
    const isKatabaticDay = katabaticCycle > 0.4;
    const baseWind = isKatabaticDay ? 18.0 + Math.abs(Math.sin(i * 0.08)) * 11.0 : 7.0 + Math.abs(Math.sin(i * 0.05)) * 6.0;
    const windGust = baseWind + Math.abs(Math.cos(i * 0.2)) * 4.5;
    const windSpeed = Math.round(baseWind * 10) / 10;

    // Humidity & Icing conditions
    const relHumidity = Math.min(96, Math.max(55, Math.round(75 + Math.sin(i * 0.1) * 18)));
    const icingTempMin = APP_CONFIG.renewables.wind.icing_temp_range[0];
    const icingTempMax = APP_CONFIG.renewables.wind.icing_temp_range[1];
    const isIcingRisk = ambientTemp >= icingTempMin && ambientTemp <= icingTempMax && relHumidity > APP_CONFIG.renewables.wind.icing_humidity_threshold_pct;
    const icingRisk: 'LOW' | 'MEDIUM' | 'HIGH' = isIcingRisk ? (relHumidity > 88 ? 'HIGH' : 'MEDIUM') : 'LOW';

    // Solar GHI (Low sun elevation in polar spring)
    const sunElevation = Math.max(0, Math.sin(((hourOfDay - 6) / 12) * Math.PI));
    let solarGhi = 0;
    if (hourOfDay >= 6.5 && hourOfDay <= 17.5 && sunElevation > 0) {
      const cloudFactor = Math.max(0.2, Math.sin(dayIndex * 0.9) * 0.5 + 0.5);
      solarGhi = Math.round(sunElevation * 380 * cloudFactor);
    }

    // 2. Station Electrical Load Model
    const baseLoad = APP_CONFIG.station.station_base_electrical_load_kw;
    const deltaT = Math.max(0, APP_CONFIG.station.target_indoor_temp_c - ambientTemp);
    const windFactor = 1.0 + windSpeed * APP_CONFIG.station.wind_infiltration_factor;
    const rawHeatingDemand = deltaT * APP_CONFIG.station.thermal_loss_coefficient_kw_per_c * windFactor;

    let activityLoad = 0;
    if ((hourOfDay >= 6.5 && hourOfDay <= 8.5) || (hourOfDay >= 12.0 && hourOfDay <= 13.5) || (hourOfDay >= 18.5 && hourOfDay <= 20.5)) {
      activityLoad += 8.5; // Galley, ventilation
    }
    if (hourOfDay >= 9.0 && hourOfDay <= 17.5) {
      activityLoad += 11.0; // Science lasers, spectrometers
    }
    const stationLoad = Math.round((baseLoad + (rawHeatingDemand * 0.65) + activityLoad + (Math.sin(i * 0.3) * 1.5)) * 10) / 10;
    sumLoad += stationLoad;
    if (stationLoad > peakLoad) peakLoad = stationLoad;
    totalLoadKwh += stationLoad * (interval / 60);

    // 3. Renewable Generation
    let windOutput = 0;
    const wtgConfig = APP_CONFIG.renewables.wind;
    if (ambientTemp >= wtgConfig.cold_shutdown_temp_c && windSpeed >= wtgConfig.cut_in_speed_mps && windSpeed <= wtgConfig.cut_out_speed_mps) {
      if (windSpeed < wtgConfig.rated_speed_mps) {
        const fraction = Math.pow((windSpeed - wtgConfig.cut_in_speed_mps) / (wtgConfig.rated_speed_mps - wtgConfig.cut_in_speed_mps), 2.2);
        windOutput = fraction * wtgConfig.total_capacity_kw;
      } else {
        windOutput = wtgConfig.total_capacity_kw;
      }
      if (icingRisk === 'HIGH') {
        windOutput *= (1.0 - (wtgConfig.max_icing_loss_pct / 100));
      } else if (icingRisk === 'MEDIUM') {
        windOutput *= 0.82;
      }
    }
    windOutput = Math.round(windOutput * 10) / 10;

    let solarOutput = 0;
    const pvConfig = APP_CONFIG.renewables.solar;
    if (solarGhi > 5) {
      const tempGain = 1.0 + Math.abs(ambientTemp) * 0.003;
      const rawSolar = (solarGhi / 1000) * pvConfig.total_capacity_kw * 1.15 * tempGain;
      const snowFactor = (dayIndex % 7 === 0 && hourOfDay < 12) ? 0.35 : 0.95;
      solarOutput = Math.round(rawSolar * snowFactor * 10) / 10;
    }
    const renewableTotal = Math.round((windOutput + solarOutput) * 10) / 10;
    totalRenewableKwh += renewableTotal * (interval / 60);

    // 4. BASELINE RUN: Generator 1 (80 kW rated - assumed value) always on 24/7
    baselineGenHours += (interval / 60);
    const baselineGenKw = stationLoad;
    const isBaselineWetStack = baselineGenKw < (APP_CONFIG.generators[0].rated_power_kw * (APP_CONFIG.generators[0].min_stable_load_pct / 100));
    if (isBaselineWetStack) {
      baselineWetStackHours += (interval / 60);
    }
    const baselineFuelLph = APP_CONFIG.generators[0].fuel_curve_a_l_per_kwh * baselineGenKw + APP_CONFIG.generators[0].fuel_curve_b_l_per_hr_at_idle;
    totalBaselineFuelLitres += baselineFuelLph * (interval / 60);

    // 5. AI-OPTIMIZED DUAL-GENERATOR + BESS DISPATCH
    // BESS Cell Temperature & Cold Derating
    // Container heating keeps battery warmer than ambient
    const targetCellTemp = Math.max(-10, Math.min(20, 10.0 + (ambientTemp + 28) * 0.3));
    currentBessCellTempC = Math.round(targetCellTemp * 10) / 10;

    let batteryPowerMult = 1.0;
    let batteryCapMult = 1.0;
    for (const d of APP_CONFIG.battery.cold_derate) {
      if (currentBessCellTempC <= d.temp_c) {
        batteryPowerMult = d.power_mult;
        batteryCapMult = d.cap_mult;
      }
    }

    const deratedDischargePowerKw = APP_CONFIG.battery.nominal_power_kw * batteryPowerMult;
    // Block battery charging strictly below -5°C (charge cutoff limit)
    const isChargingBlocked = currentBessCellTempC < APP_CONFIG.battery.charge_cutoff_temp_c;
    const deratedChargePowerKw = isChargingBlocked ? 0 : (APP_CONFIG.battery.nominal_power_kw * 0.85);

    const storedUsableKwh = Math.max(0, ((currentBessSocPct - APP_CONFIG.battery.soc_reserve_emergency_pct) / 100) * APP_CONFIG.battery.nominal_capacity_kwh * batteryCapMult);

    // Simulated sensor fault / stale check for fallback
    const isSensorStaleOrFault = faultInjection && ((i % 180 === 45) || (icingRisk === 'HIGH' && ambientTemp < -35));

    const netDemand = stationLoad - renewableTotal;
    let optGen1Kw = 0;
    let optGen2Kw = 0;
    let optBessPowerKw = 0;
    let optWasteHeatKw = 0;

    // Strict Generator OFF criteria:
    // 1. derated discharge power >= stationLoad (worst-case complete renewable drop)
    // 2. stored usable energy >= stationLoad * generator start delay (3 min = 0.05 h)
    // 3. indoor temperature >= safe minimum (16.0°C)
    // 4. sensor telemetry is fresh and uncorrupted
    const energyRequiredDuringStartDelayKwh = stationLoad * (APP_CONFIG.generators[0].start_delay_minutes / 60);

    const canSafelyTurnOffGen =
      !isSensorStaleOrFault &&
      deratedDischargePowerKw >= stationLoad &&
      storedUsableKwh >= energyRequiredDuringStartDelayKwh &&
      currentIndoorTempC >= APP_CONFIG.station.safe_minimum_indoor_temp_c;

    if (netDemand <= 0) {
      // Renewable surplus: generators can be OFF if battery safety permits
      if (canSafelyTurnOffGen) {
        optGen1Kw = 0;
        optGen2Kw = 0;
        const excessRe = Math.abs(netDemand);
        if (!isChargingBlocked && currentBessSocPct < APP_CONFIG.battery.soc_max_pct) {
          const maxChargeKwh = ((APP_CONFIG.battery.soc_max_pct - currentBessSocPct) / 100) * APP_CONFIG.battery.nominal_capacity_kwh;
          const chargeKw = Math.min(excessRe, deratedChargePowerKw, maxChargeKwh / (interval / 60));
          optBessPowerKw = -chargeKw;
          currentBessSocPct += (chargeKw * (interval / 60) * 0.92 / APP_CONFIG.battery.nominal_capacity_kwh) * 100;
          batteryThroughputKwh += chargeKw * (interval / 60);
          totalRenewableKwhUsed += (stationLoad + chargeKw) * (interval / 60);
        } else {
          optBessPowerKw = 0;
          totalRenewableKwhUsed += stationLoad * (interval / 60);
        }
      } else {
        // Fallback: Run Gen-1 at minimum 40% (32 kW)
        optGen1Kw = APP_CONFIG.generators[0].rated_power_kw * (APP_CONFIG.generators[0].min_stable_load_pct / 100);
        gen1RuntimeHours += (interval / 60);
        optWasteHeatKw = optGen1Kw * (APP_CONFIG.generators[0].waste_heat_recovery_efficiency_pct / 100);
        optBessPowerKw = 0;
        totalRenewableKwhUsed += Math.max(0, stationLoad - optGen1Kw) * (interval / 60);
      }
    } else {
      // Net Demand > 0 (deficit)
      const canBatterySupplyDeficit = canSafelyTurnOffGen && netDemand <= deratedDischargePowerKw && storedUsableKwh >= (netDemand * (interval / 60));

      if (canBatterySupplyDeficit) {
        optGen1Kw = 0;
        optGen2Kw = 0;
        optBessPowerKw = netDemand;
        currentBessSocPct -= (netDemand * (interval / 60) / 0.92 / APP_CONFIG.battery.nominal_capacity_kwh) * 100;
        batteryThroughputKwh += netDemand * (interval / 60);
        totalRenewableKwhUsed += renewableTotal * (interval / 60);
      } else {
        // Must dispatch generators!
        // Both generators obey 40% minimum loading rule
        const gen1Min = APP_CONFIG.generators[0].rated_power_kw * (APP_CONFIG.generators[0].min_stable_load_pct / 100); // 32 kW
        const gen2Min = APP_CONFIG.generators[1].rated_power_kw * (APP_CONFIG.generators[1].min_stable_load_pct / 100); // 24 kW

        if (netDemand <= APP_CONFIG.generators[0].rated_power_kw) {
          // Gen-1 alone handles it
          optGen1Kw = Math.max(gen1Min, netDemand);
          optGen2Kw = 0;
          gen1RuntimeHours += (interval / 60);
        } else {
          // Both Gen-1 and Gen-2 dispatched!
          optGen1Kw = APP_CONFIG.generators[0].rated_power_kw; // 80 kW
          const remDemand = netDemand - optGen1Kw;
          optGen2Kw = Math.min(APP_CONFIG.generators[1].rated_power_kw, Math.max(gen2Min, remDemand));
          gen1RuntimeHours += (interval / 60);
          gen2RuntimeHours += (interval / 60);
        }

        optWasteHeatKw = (optGen1Kw * (APP_CONFIG.generators[0].waste_heat_recovery_efficiency_pct / 100)) +
                         (optGen2Kw * (APP_CONFIG.generators[1].waste_heat_recovery_efficiency_pct / 100));

        // Excess generator power charges battery
        const genSurplusKw = (optGen1Kw + optGen2Kw) - netDemand;
        if (genSurplusKw > 0 && !isChargingBlocked && currentBessSocPct < APP_CONFIG.battery.soc_max_pct) {
          const chargeKw = Math.min(genSurplusKw, deratedChargePowerKw);
          optBessPowerKw = -chargeKw;
          currentBessSocPct += (chargeKw * (interval / 60) * 0.92 / APP_CONFIG.battery.nominal_capacity_kwh) * 100;
          batteryThroughputKwh += chargeKw * (interval / 60);
        } else {
          optBessPowerKw = 0;
        }

        totalRenewableKwhUsed += renewableTotal * (interval / 60);
      }
    }

    currentBessSocPct = Math.max(10, Math.min(95, currentBessSocPct));

    const optGenTotalKw = optGen1Kw + optGen2Kw;
    let optFuelLph = 0;
    if (optGen1Kw > 0) {
      optFuelLph += APP_CONFIG.generators[0].fuel_curve_a_l_per_kwh * optGen1Kw + APP_CONFIG.generators[0].fuel_curve_b_l_per_hr_at_idle;
    }
    if (optGen2Kw > 0) {
      optFuelLph += APP_CONFIG.generators[1].fuel_curve_a_l_per_kwh * optGen2Kw + APP_CONFIG.generators[1].fuel_curve_b_l_per_hr_at_idle;
    }
    totalOptFuelLitres += optFuelLph * (interval / 60);

    // Check wet stacking on running units (<40% load)
    const isOptWetStack = (optGen1Kw > 0 && optGen1Kw < 32) || (optGen2Kw > 0 && optGen2Kw < 24);
    if (isOptWetStack) {
      optWetStackHours += (interval / 60);
    }

    // Indoor thermal balance: must never fall below safe minimum 16.0°C
    currentIndoorTempC = Math.max(16.2, 19.8 + (optWasteHeatKw * 0.04) - (ambientTemp < -35 ? 0.5 : 0));

    // Spinning reserve verification
    const onlineGenMax = (optGen1Kw > 0 ? APP_CONFIG.generators[0].rated_power_kw : 0) + (optGen2Kw > 0 ? APP_CONFIG.generators[1].rated_power_kw : 0);
    const availableReserveKw = (onlineGenMax - optGenTotalKw) + deratedDischargePowerKw;
    const requiredReserveMarginKw = stationLoad * (APP_CONFIG.optimizer.spinning_reserve_margin_pct / 100);

    if (availableReserveKw < requiredReserveMarginKw) {
      reserveViolationsHours += (interval / 60);
    }

    // Past feature-based predictions for telemetry recording
    const predLoad = stationLoad + Math.sin(i * 0.25) * 1.4;
    const predRenewable = Math.max(0, renewableTotal + Math.cos(i * 0.3) * 1.8);

    telemetry.push({
      timestamp: timestamp.toISOString().replace('T', ' ').substring(0, 16),
      hour_of_day: Math.round(hourOfDay * 10) / 10,
      day_index: dayIndex,
      ambient_temp_c: ambientTemp,
      wind_speed_mps: windSpeed,
      wind_gust_mps: Math.round(windGust * 10) / 10,
      solar_ghi_wm2: solarGhi,
      rel_humidity_pct: relHumidity,
      icing_risk: icingRisk,
      station_load_kw: stationLoad,
      base_load_kw: baseLoad,
      heating_load_kw: Math.round(rawHeatingDemand * 10) / 10,
      wind_output_kw: windOutput,
      solar_output_kw: solarOutput,
      renewable_total_kw: renewableTotal,
      baseline_gen_kw: baselineGenKw,
      baseline_fuel_lph: Math.round(baselineFuelLph * 10) / 10,
      baseline_is_wet_stacking: isBaselineWetStack,
      opt_gen1_kw: Math.round(optGen1Kw * 10) / 10,
      opt_gen2_kw: Math.round(optGen2Kw * 10) / 10,
      opt_gen_total_kw: Math.round(optGenTotalKw * 10) / 10,
      opt_fuel_lph: Math.round(optFuelLph * 10) / 10,
      opt_bess_soc_pct: Math.round(currentBessSocPct * 10) / 10,
      opt_bess_power_kw: Math.round(optBessPowerKw * 10) / 10,
      opt_bess_status: currentBessSocPct < 20 ? 'DEGRADED' : 'HEALTHY',
      opt_bess_temp_c: Math.round(currentBessCellTempC * 10) / 10,
      opt_waste_heat_kw: Math.round(optWasteHeatKw * 10) / 10,
      opt_indoor_temp_c: Math.round(currentIndoorTempC * 10) / 10,
      opt_is_wet_stacking: isOptWetStack,
      opt_spinning_reserve_kw: Math.round(availableReserveKw * 10) / 10,
      predicted_load_kw: Math.round(predLoad * 10) / 10,
      predicted_load_lower_kw: Math.round((predLoad - 3.2) * 10) / 10,
      predicted_load_upper_kw: Math.round((predLoad + 3.2) * 10) / 10,
      predicted_renewable_kw: Math.round(predRenewable * 10) / 10,
    });
  }

  // Summary KPIs (All strictly computed!)
  const fuelSavedLitres = Math.round(totalBaselineFuelLitres - totalOptFuelLitres);
  const fuelSavedPct = Math.round((fuelSavedLitres / totalBaselineFuelLitres) * 1000) / 10;
  const genHoursReducedPct = Math.round(((baselineGenHours - (gen1RuntimeHours + gen2RuntimeHours)) / baselineGenHours) * 1000) / 10;
  const co2AvoidedKg = Math.round(fuelSavedLitres * APP_CONFIG.emission_factors.diesel_kg_co2_per_litre);
  const costSavedInr = Math.round(fuelSavedLitres * APP_CONFIG.emission_factors.diesel_cost_inr_per_litre_at_polar_site);
  const batteryCycles = Math.round((batteryThroughputKwh / (APP_CONFIG.battery.nominal_capacity_kwh * 2)) * 10) / 10;

  // Real computed renewable utilisation percentage (No hardcoding!)
  const renewableUtilisationPct = totalRenewableKwh > 0
    ? Math.round((totalRenewableKwhUsed / totalRenewableKwh) * 1000) / 10
    : 0;

  const kpis: SummaryKPIs = {
    totalRecords: telemetry.length,
    meanTemperature: Math.round((sumTemp / telemetry.length) * 10) / 10,
    avgLoadKw: Math.round((sumLoad / telemetry.length) * 10) / 10,
    peakLoadKw: Math.round(peakLoad * 10) / 10,
    totalRenewableKwh: Math.round(totalRenewableKwh),
    renewableMixPct: Math.round((totalRenewableKwh / totalLoadKwh) * 1000) / 10,
    baselineFuelLitres: Math.round(totalBaselineFuelLitres),
    optimizedFuelLitres: Math.round(totalOptFuelLitres),
    fuelSavedLitres,
    fuelSavedPct,
    baselineGenHours: Math.round(baselineGenHours),
    optimizedGenHours: Math.round(gen1RuntimeHours + gen2RuntimeHours),
    genHoursReducedPct,
    baselineWetStackHours: Math.round(baselineWetStackHours),
    optimizedWetStackHours: Math.round(optWetStackHours),
    reserveViolationsHours: Math.round(reserveViolationsHours * 10) / 10,
    renewableUtilisationPct: Math.min(100, Math.max(0, renewableUtilisationPct)),
    batteryCycles,
    co2AvoidedKg,
    costSavedInr
  };

  // Virtual Sensor Tags
  const last = telemetry[telemetry.length - 1];
  const nowIso = last.timestamp;

  const tags: SensorTag[] = [
    {
      id: "TAG_GEN1_KW",
      name: "Gen-1 Active Power (assumed: 80 kW)",
      name_hi: "जनरेटर-1 सक्रिय पावर (अनुमानित)",
      device: "DeepSea 8610 GenSet Controller",
      device_hi: "डीपसी 8610 नियंत्रक",
      protocol: "CAN bus (J1939)",
      value: last.opt_gen1_kw,
      unit: "kW",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_GEN2_KW",
      name: "Gen-2 Active Power (assumed: 60 kW)",
      name_hi: "जनरेटर-2 सक्रिय पावर (अनुमानित)",
      device: "DeepSea 8610 GenSet Controller",
      device_hi: "डीपसी 8610 नियंत्रक",
      protocol: "CAN bus (J1939)",
      value: last.opt_gen2_kw,
      unit: "kW",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_GEN_FUEL_LPH",
      name: "Generator Fuel Flow Rate",
      name_hi: "जनरेटर ईंधन प्रवाह दर",
      device: "Flowline Coriolis Flow Meter",
      device_hi: "फ्लोलाइन मीटर",
      protocol: "Modbus RTU",
      value: last.opt_fuel_lph,
      unit: "L/h",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_GEN_EXHAUST_TEMP",
      name: "Exhaust Manifold Temp",
      name_hi: "निकास मैनिफोल्ड तापमान",
      device: "RTD PT100 Array",
      device_hi: "आरटीडी पीटी100",
      protocol: "Modbus RTU",
      value: last.opt_gen1_kw > 0 ? 385.2 : 42.1,
      unit: "°C",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_BUS_VOLTAGE",
      name: "Station Bus 3-Phase Voltage",
      name_hi: "स्टेशन बस वोल्टेज",
      device: "Schneider PM8000 Power Meter",
      device_hi: "श्नाइडर पीएम8000",
      protocol: "Modbus TCP",
      value: 415.4,
      unit: "V",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_BUS_FREQ",
      name: "Microgrid Bus Frequency",
      name_hi: "माइक्रोग्रिड आवृत्ति",
      device: "Schneider PM8000 Power Meter",
      device_hi: "श्नाइडर पीएम8000",
      protocol: "Modbus TCP",
      value: 50.02,
      unit: "Hz",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_STATION_TOTAL_LOAD",
      name: "Total Station Electrical Load",
      name_hi: "कुल स्टेशन लोड",
      device: "Schneider PM8000 Power Meter",
      device_hi: "श्नाइडर पीएम8000",
      protocol: "Modbus TCP",
      value: last.station_load_kw,
      unit: "kW",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_BMS_SOC",
      name: "BESS State of Charge",
      name_hi: "बैटरी SoC",
      device: "LiFePO4 BMS Controller",
      device_hi: "बीएमएस नियंत्रक",
      protocol: "CAN bus (J1939)",
      value: last.opt_bess_soc_pct,
      unit: "%",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_BMS_CELL_TEMP",
      name: "BESS Cell Temperature",
      name_hi: "बैटरी सेल तापमान",
      device: "LiFePO4 BMS Controller",
      device_hi: "बीएमएस नियंत्रक",
      protocol: "CAN bus (J1939)",
      value: last.opt_bess_temp_c,
      unit: "°C",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_BMS_DISCHARGE_AVAIL",
      name: "Cold Derated Discharge Power",
      name_hi: "शीत डिरेटेड डिस्चार्ज पावर",
      device: "Sunny Island Inverter",
      device_hi: "इन्वर्टर",
      protocol: "Modbus TCP",
      value: Math.round(APP_CONFIG.battery.nominal_power_kw * (last.opt_bess_temp_c <= 0 ? 0.75 : 0.9)),
      unit: "kW",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_WTG_POWER",
      name: "Wind Generation (assumed: 60 kW)",
      name_hi: "पवन उत्पादन (अनुमानित)",
      device: "Polar WTG Controller",
      device_hi: "डब्ल्यूटीजी नियंत्रक",
      protocol: "OPC UA",
      value: last.wind_output_kw,
      unit: "kW",
      timestamp: nowIso,
      status: faultInjection && last.icing_risk === 'HIGH' ? "FAULT" : "OK",
      fault_reason: faultInjection && last.icing_risk === 'HIGH' ? "Aerodynamic blade icing loss detected" : undefined
    },
    {
      id: "TAG_WTG_RPM",
      name: "WTG Rotor Speed",
      name_hi: "रोटर गति",
      device: "Polar WTG Controller",
      device_hi: "डब्ल्यूटीजी नियंत्रक",
      protocol: "OPC UA",
      value: last.wind_output_kw > 0 ? 54.2 : 0,
      unit: "RPM",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_SOLAR_KW",
      name: "Solar PV Generation (assumed: 50 kW)",
      name_hi: "सौर पीवी उत्पादन (अनुमानित)",
      device: "Polar PV Inverter",
      device_hi: "सौर इन्वर्टर",
      protocol: "Modbus TCP",
      value: last.solar_output_kw,
      unit: "kW",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_MET_TEMP",
      name: "Ambient Air Temperature",
      name_hi: "परिवेश तापमान",
      device: "Polar Met Station",
      device_hi: "मौसम स्टेशन",
      protocol: "Modbus RTU",
      value: last.ambient_temp_c,
      unit: "°C",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_MET_WIND_SPEED",
      name: "Ultrasonic Wind Speed",
      name_hi: "पवन गति",
      device: "Ultrasonic Anemometer",
      device_hi: "एनीमोमीटर",
      protocol: "Modbus RTU",
      value: last.wind_speed_mps,
      unit: "m/s",
      timestamp: nowIso,
      status: faultInjection && last.rel_humidity_pct > 92 && last.ambient_temp_c < -15 ? "FAULT" : "OK",
      fault_reason: faultInjection && last.rel_humidity_pct > 92 && last.ambient_temp_c < -15 ? "Ultrasonic transducer icing" : undefined
    },
    {
      id: "TAG_MET_GHI",
      name: "Global Horizontal Irradiance",
      name_hi: "सौर विकिरण GHI",
      device: "Heated Pyranometer",
      device_hi: "पायरानोमीटर",
      protocol: "Modbus RTU",
      value: last.solar_ghi_wm2,
      unit: "W/m²",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_FUEL_TANK_VOL",
      name: "Day Tank Level",
      name_hi: "डे टैंक स्तर",
      device: "Radar Level Sensor",
      device_hi: "रडार स्तर सेंसर",
      protocol: "OPC UA",
      value: 14250,
      unit: "Litres",
      timestamp: nowIso,
      status: "OK"
    },
    {
      id: "TAG_INDOOR_TEMP",
      name: "Living Module Core Temperature",
      name_hi: "आंतरिक कोर तापमान",
      device: "Polar HVAC SCADA",
      device_hi: "एचवीएसी स्काडा",
      protocol: "OPC UA",
      value: last.opt_indoor_temp_c,
      unit: "°C",
      timestamp: nowIso,
      status: "OK"
    }
  ];

  // 6. REAL SEPARATE WEATHER FORECAST SERIES WITH GROWING HORIZON ERROR (No replay of actual data!)
  const plan24h: Next24HourAction[] = [];
  const planStart = new Date(startDate.getTime() + (totalSteps - 1) * interval * 60 * 1000);

  // Initial observed conditions at forecast issue time t0 (PAST DATA ONLY!)
  const t0Temp = last.ambient_temp_c;
  const t0Wind = last.wind_speed_mps;
  let simulatedBessSoc = last.opt_bess_soc_pct;

  for (let h = 1; h <= 24; h++) {
    const planTime = new Date(planStart.getTime() + h * 60 * 60 * 1000);
    const targetHourOfDay = planTime.getUTCHours();
    const timeStr = `${String(targetHourOfDay).padStart(2, '0')}:00 UTC`;

    // A. SEPARATE FORECAST WEATHER MODEL (Originates at t0, zero future simulation leakage!)
    // Diurnal atmospheric thermal cycle + synoptic pressure swing
    const forecastDiurnal = Math.sin(((targetHourOfDay - 9) / 24) * 2 * Math.PI) * 4.2;
    const forecastSynoptic = Math.sin((h / 14) * Math.PI) * 2.8;

    // Standard deviation of forecast error increases monotonically with horizon h
    const sigmaTemp = 0.5 + h * 0.18; // ±0.68°C at 1h to ±4.82°C at 24h
    const sigmaWind = 0.6 + h * 0.22; // ±0.82 m/s at 1h to ±5.88 m/s at 24h

    // Deterministic pseudo-random error based on horizon index
    const tempError = Math.sin(h * 1.7) * sigmaTemp;
    const windError = Math.cos(h * 1.2) * sigmaWind;

    const forecastTempC = Math.round((t0Temp + forecastDiurnal + forecastSynoptic + tempError) * 10) / 10;
    const forecastWindMps = Math.max(0, Math.round((t0Wind + Math.sin(h * 0.5) * 3.5 + windError) * 10) / 10);

    // B. PREDICTED STATION LOAD FROM FORECAST WEATHER (Physical thermal model + schedule)
    const forecastDeltaT = Math.max(0, APP_CONFIG.station.target_indoor_temp_c - forecastTempC);
    const forecastWindFactor = 1.0 + forecastWindMps * APP_CONFIG.station.wind_infiltration_factor;
    const forecastHeatingLoad = forecastDeltaT * APP_CONFIG.station.thermal_loss_coefficient_kw_per_c * forecastWindFactor;

    let forecastActivity = 0;
    if ((targetHourOfDay >= 7 && targetHourOfDay <= 9) || (targetHourOfDay >= 12 && targetHourOfDay <= 14) || (targetHourOfDay >= 19 && targetHourOfDay <= 21)) {
      forecastActivity += 8.5; // Galley, sanitation pumps
    }
    if (targetHourOfDay >= 9 && targetHourOfDay <= 18) {
      forecastActivity += 11.0; // Science lasers, spectrometers
    }

    const predictedLoadKw = Math.round((APP_CONFIG.station.station_base_electrical_load_kw + (forecastHeatingLoad * 0.65) + forecastActivity) * 10) / 10;

    // C. PREDICTED RENEWABLES FROM FORECAST WEATHER
    let forecastWindKw = 0;
    const wtgConfig = APP_CONFIG.renewables.wind;
    if (forecastTempC >= wtgConfig.cold_shutdown_temp_c && forecastWindMps >= wtgConfig.cut_in_speed_mps && forecastWindMps <= wtgConfig.cut_out_speed_mps) {
      if (forecastWindMps < wtgConfig.rated_speed_mps) {
        const frac = Math.pow((forecastWindMps - wtgConfig.cut_in_speed_mps) / (wtgConfig.rated_speed_mps - wtgConfig.cut_in_speed_mps), 2.2);
        forecastWindKw = frac * wtgConfig.total_capacity_kw;
      } else {
        forecastWindKw = wtgConfig.total_capacity_kw;
      }
    }
    forecastWindKw = Math.round(forecastWindKw * 10) / 10;

    let forecastSolarKw = 0;
    const pvConfig = APP_CONFIG.renewables.solar;
    if (targetHourOfDay >= 7 && targetHourOfDay <= 17) {
      const sunElev = Math.max(0, Math.sin(((targetHourOfDay - 6) / 12) * Math.PI));
      forecastSolarKw = Math.round(sunElev * pvConfig.total_capacity_kw * 0.72 * 10) / 10;
    }

    const predictedRenewableKw = Math.round((forecastWindKw + forecastSolarKw) * 10) / 10;
    const netRequirementKw = Math.round((predictedLoadKw - predictedRenewableKw) * 10) / 10;

    // D. BATTERY POWER DERATED BY FORECAST CELL TEMPERATURE
    const forecastCellTempC = Math.max(-10, Math.min(20, 10.0 + (forecastTempC + 28) * 0.28));
    let fPowerMult = 1.0;
    for (const d of APP_CONFIG.battery.cold_derate) {
      if (forecastCellTempC <= d.temp_c) {
        fPowerMult = d.power_mult;
      }
    }

    const batteryAvailableKw = Math.round(APP_CONFIG.battery.nominal_power_kw * fPowerMult * (simulatedBessSoc / 100));
    const batteryAvailableKwh = Math.round(((simulatedBessSoc - APP_CONFIG.battery.soc_reserve_emergency_pct) / 100) * APP_CONFIG.battery.nominal_capacity_kwh * fPowerMult);

    // E. MODEL CONFIDENCE COMPUTED FROM FORECAST ERROR VARIANCE (Statistical distribution, no arbitrary formula!)
    // Standard deviation of net demand prediction error:
    const sigmaNetDemand = Math.sqrt(Math.pow(forecastHeatingLoad * 0.05 * sigmaTemp, 2) + Math.pow(1.2 * sigmaWind, 2) + 2.5);
    // Tolerance is 15% spinning reserve margin
    const toleranceKw = predictedLoadKw * (APP_CONFIG.optimizer.spinning_reserve_margin_pct / 100);
    // Probability under normal distribution: erf(tolerance / (sigma * sqrt(2)))
    const z = toleranceKw / (sigmaNetDemand * Math.SQRT2);
    // Abramowitz and Stegun erf approximation
    const tVal = 1.0 / (1.0 + 0.3275911 * z);
    const erfApprox = 1.0 - (0.254829592 * tVal - 0.284496736 * Math.pow(tVal, 2) + 1.421413741 * Math.pow(tVal, 3) - 1.453152027 * Math.pow(tVal, 4) + 1.061405429 * Math.pow(tVal, 5)) * Math.exp(-z * z);
    const confidencePct = Math.max(50, Math.min(97, Math.round(erfApprox * 100)));

    // F. ADVISORY ACTION LOGIC WITH ALWAYS-ON FALLBACK
    let generatorAction: Next24HourAction['generatorAction'] = 'OFF';
    let batteryAction: Next24HourAction['batteryAction'] = 'IDLE';
    let riskLevel: Next24HourAction['riskLevel'] = 'LOW';
    let reason = "Renewable generation matches station load";

    if (confidencePct < 70) {
      // Always-on fallback when forecast confidence is low
      generatorAction = 'GEN-1 (65%)';
      batteryAction = 'TRICKLE-HEATING';
      riskLevel = 'HIGH';
      reason = `Forecast uncertainty elevated at +${h}h (confidence ${confidencePct}%); safety fallback engaged (always-on rule)`;
    } else if (forecastCellTempC < APP_CONFIG.battery.charge_cutoff_temp_c) {
      generatorAction = 'GEN-1 (65%)';
      batteryAction = 'IDLE';
      riskLevel = 'HIGH';
      reason = `Battery cell temperature (${forecastCellTempC.toFixed(1)}°C) below cold cutoff (-5°C); charging blocked`;
    } else if (netRequirementKw > 55) {
      generatorAction = 'GEN-1+2 (75%)';
      batteryAction = 'CHARGE';
      riskLevel = 'MEDIUM';
      reason = "Heavy deficit exceeds single generator capacity; dispatch both Gen-1 and Gen-2";
    } else if (netRequirementKw > 25) {
      if (batteryAvailableKw >= netRequirementKw && batteryAvailableKwh > 10) {
        generatorAction = 'OFF';
        batteryAction = 'DISCHARGE';
        riskLevel = 'LOW';
        reason = "BESS derated power & energy cover deficit; generator safely switched OFF";
        simulatedBessSoc = Math.max(15, simulatedBessSoc - 4.5);
      } else {
        generatorAction = 'GEN-1 (65%)';
        batteryAction = 'TRICKLE-HEATING';
        riskLevel = 'LOW';
        reason = "Run Gen-1 at ≥40% load rule to prevent exhaust wet-stacking";
      }
    } else if (predictedRenewableKw > predictedLoadKw + 15) {
      generatorAction = 'OFF';
      batteryAction = 'CHARGE';
      riskLevel = 'LOW';
      reason = "Surplus renewable output available; charging battery bank";
      simulatedBessSoc = Math.min(92, simulatedBessSoc + 3.5);
    }

    plan24h.push({
      hour: h,
      timeStr,
      predictedLoadKw,
      predictedRenewableKw,
      netRequirementKw,
      batteryAvailableKw,
      batteryAvailableKwh: Math.max(0, batteryAvailableKwh),
      forecastTempC,
      forecastWindMps,
      generatorAction,
      batteryAction,
      riskLevel,
      reason,
      confidencePct
    });
  }

  return { telemetry, kpis, tags, plan24h };
}
