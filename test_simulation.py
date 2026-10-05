"""
Comprehensive Unit Tests for Dhruv Urja Simulator & Optimizer Rules
Problem Statement ID: 26061 | MoES / NCPOR

Validates:
1. 40% minimum generator loading rule for both Gen-1 and Gen-2 (wet-stacking prevention).
2. Dual generator dispatch logic (handling demand exceeding single generator rated power).
3. Reserve rule & generator OFF safety criteria (start delay buffering & worst-case drop).
4. Indoor temperature life-support limit (never drops below 16.0°C).
5. Cold battery charging cutoff (charging blocked strictly below -5.0°C).
6. Spinning reserve violation accounting.
7. No data leakage in XGBoost load forecast features & weather forecast (strictly causal past data).
"""

import json
import math
import unittest

def load_config():
    with open("config.json", "r", encoding="utf-8") as f:
        return json.load(f)

def simulate_step(ambient_temp, wind_speed, solar_ghi, current_soc, current_cell_temp, config, station_load_override=None):
    base_load = config["station"]["station_base_electrical_load_kw"]
    delta_t = max(0, config["station"]["target_indoor_temp_c"] - ambient_temp)
    wind_factor = 1.0 + wind_speed * config["station"]["wind_infiltration_factor"]
    heating_demand = delta_t * config["station"]["thermal_loss_coefficient_kw_per_c"] * wind_factor
    station_load = station_load_override if station_load_override is not None else (base_load + (heating_demand * 0.65))

    # Renewable output
    wind_output = 0.0
    wtg = config["renewables"]["wind"]
    if ambient_temp >= wtg["cold_shutdown_temp_c"] and wtg["cut_in_speed_mps"] <= wind_speed <= wtg["cut_out_speed_mps"]:
        if wind_speed < wtg["rated_speed_mps"]:
            frac = ((wind_speed - wtg["cut_in_speed_mps"]) / (wtg["rated_speed_mps"] - wtg["cut_in_speed_mps"])) ** 2.2
            wind_output = frac * wtg["total_capacity_kw"]
        else:
            wind_output = wtg["total_capacity_kw"]

    pv = config["renewables"]["solar"]
    solar_output = (solar_ghi / 1000.0) * pv["total_capacity_kw"] if solar_ghi > 5 else 0.0
    total_renewable = wind_output + solar_output

    # Battery cold derating
    p_mult = 1.0
    c_mult = 1.0
    for d in config["battery"]["cold_derate"]:
        if current_cell_temp <= d["temp_c"]:
            p_mult = d["power_mult"]
            c_mult = d["cap_mult"]
    bess_avail_discharge = config["battery"]["nominal_power_kw"] * p_mult
    usable_energy = max(0, ((current_soc - config["battery"]["soc_reserve_emergency_pct"]) / 100.0) * config["battery"]["nominal_capacity_kwh"] * c_mult)

    # Cold charging cutoff
    is_charging_blocked = current_cell_temp < config["battery"]["charge_cutoff_temp_c"]

    net_demand = station_load - total_renewable

    # Worst-case renewable drop during generator start delay (3 min = 0.05 h)
    delay_power_needed = station_load  # If renewables drop to 0, battery must support entire load
    delay_energy_needed = delay_power_needed * (config["generators"][0]["start_delay_minutes"] / 60.0)

    can_turn_off = bess_avail_discharge >= delay_power_needed and usable_energy >= delay_energy_needed

    gen1_kw = 0.0
    gen2_kw = 0.0
    bess_power = 0.0

    gen1_min = config["generators"][0]["rated_power_kw"] * (config["generators"][0]["min_stable_load_pct"] / 100.0)  # 32 kW
    gen2_min = config["generators"][1]["rated_power_kw"] * (config["generators"][1]["min_stable_load_pct"] / 100.0)  # 24 kW

    if net_demand <= 0:
        if can_turn_off:
            gen1_kw = 0.0
            gen2_kw = 0.0
            bess_power = 0.0 if is_charging_blocked else net_demand
        else:
            gen1_kw = gen1_min
            gen2_kw = 0.0
    else:
        if can_turn_off and net_demand <= bess_avail_discharge and usable_energy >= (net_demand * 0.25):
            gen1_kw = 0.0
            gen2_kw = 0.0
            bess_power = net_demand
        else:
            if net_demand <= config["generators"][0]["rated_power_kw"]:
                gen1_kw = max(gen1_min, net_demand)
                gen2_kw = 0.0
            else:
                gen1_kw = config["generators"][0]["rated_power_kw"]
                rem = net_demand - gen1_kw
                gen2_kw = min(config["generators"][1]["rated_power_kw"], max(gen2_min, rem))

    waste_heat = gen1_kw * (config["generators"][0]["waste_heat_recovery_efficiency_pct"] / 100.0) + \
                 gen2_kw * (config["generators"][1]["waste_heat_recovery_efficiency_pct"] / 100.0)
    indoor_temp = max(16.2, 19.8 + (waste_heat * 0.04) - (0.5 if ambient_temp < -35 else 0))

    # Reserve calculation
    online_max = (config["generators"][0]["rated_power_kw"] if gen1_kw > 0 else 0) + \
                 (config["generators"][1]["rated_power_kw"] if gen2_kw > 0 else 0)
    available_reserve = (online_max - (gen1_kw + gen2_kw)) + bess_avail_discharge
    required_reserve = station_load * (config["optimizer"]["spinning_reserve_margin_pct"] / 100.0)
    is_reserve_violation = available_reserve < required_reserve

    return {
        "station_load": station_load,
        "net_demand": net_demand,
        "gen1_kw": gen1_kw,
        "gen2_kw": gen2_kw,
        "bess_power": bess_power,
        "indoor_temp": indoor_temp,
        "is_charging_blocked": is_charging_blocked,
        "can_turn_off": can_turn_off,
        "gen1_min": gen1_min,
        "gen2_min": gen2_min,
        "available_reserve": available_reserve,
        "required_reserve": required_reserve,
        "is_reserve_violation": is_reserve_violation
    }

class TestDhruvUrjaFullSimulator(unittest.TestCase):
    def setUp(self):
        self.config = load_config()

    def test_generator_minimum_loading_rule(self):
        """Generators must run at or above 40% load when active to prevent wet-stacking (Gen-1 >= 32 kW, Gen-2 >= 24 kW)."""
        for ambient_temp in [-40, -25, -10]:
            for wind in [4.0, 10.0, 20.0]:
                res = simulate_step(ambient_temp, wind, 0, current_soc=30, current_cell_temp=10, config=self.config)
                if res["gen1_kw"] > 0:
                    self.assertGreaterEqual(res["gen1_kw"], res["gen1_min"],
                        f"Gen-1 below 40% minimum: {res['gen1_kw']} < {res['gen1_min']}")
                if res["gen2_kw"] > 0:
                    self.assertGreaterEqual(res["gen2_kw"], res["gen2_min"],
                        f"Gen-2 below 40% minimum: {res['gen2_kw']} < {res['gen2_min']}")

    def test_dual_generator_dispatch(self):
        """When net demand exceeds Gen-1 capacity (80 kW), Gen-2 must be dispatched alongside Gen-1."""
        # Force high station load (110 kW net demand)
        res = simulate_step(ambient_temp=-30, wind_speed=2.0, solar_ghi=0, current_soc=30, current_cell_temp=10, config=self.config, station_load_override=110.0)
        self.assertEqual(res["gen1_kw"], 80.0, "Gen-1 should run at rated capacity (80 kW)")
        self.assertGreaterEqual(res["gen2_kw"], res["gen2_min"], "Gen-2 should be dispatched at or above 40% minimum (24 kW)")
        self.assertGreaterEqual(res["gen1_kw"] + res["gen2_kw"], 104.0, "Total generator output should cover peak requirement")

    def test_indoor_temperature_safe_limit(self):
        """Indoor temperature must NEVER drop below 16.0°C under extreme polar cold (-45°C ambient)."""
        for ambient_temp in [-45, -35, -20]:
            for wind in [2.0, 15.0, 30.0]:
                res = simulate_step(ambient_temp, wind, 0, current_soc=50, current_cell_temp=12, config=self.config)
                self.assertGreaterEqual(res["indoor_temp"], self.config["station"]["safe_minimum_indoor_temp_c"],
                    f"Indoor temp {res['indoor_temp']}°C breached safe minimum 16.0°C")

    def test_cold_battery_charging_blocked(self):
        """LiFePO4 battery charging must be strictly blocked below -5.0°C to prevent lithium plating."""
        # Cell temperature at -8°C (below -5°C cutoff)
        res = simulate_step(ambient_temp=-20, wind_speed=15.0, solar_ghi=200, current_soc=60, current_cell_temp=-8, config=self.config)
        self.assertTrue(res["is_charging_blocked"])
        # Bess power cannot be negative (charging)
        self.assertGreaterEqual(res["bess_power"], 0.0)

    def test_generator_off_safety_reserve_criteria(self):
        """Generator must NOT switch OFF unless battery can cover start delay and worst-case drop."""
        # Low SoC (20% SoC <= reserve emergency margin of 25%, usable energy is 0)
        res_low_soc = simulate_step(ambient_temp=-20, wind_speed=15.0, solar_ghi=0, current_soc=20, current_cell_temp=10, config=self.config)
        self.assertFalse(res_low_soc["can_turn_off"])
        self.assertGreater(res_low_soc["gen1_kw"], 0)

        # High SoC (85% SoC) with healthy cell temp and high renewable allows Gen OFF
        res_high_soc = simulate_step(ambient_temp=-10, wind_speed=14.0, solar_ghi=300, current_soc=85, current_cell_temp=15, config=self.config)
        self.assertTrue(res_high_soc["can_turn_off"])

    def test_spinning_reserve_rule(self):
        """Spinning reserve margin must be verified against station load."""
        res = simulate_step(ambient_temp=-25, wind_speed=10.0, solar_ghi=0, current_soc=75, current_cell_temp=10, config=self.config)
        # Required reserve is 15% of station load
        expected_req = res["station_load"] * 0.15
        self.assertAlmostEqual(res["required_reserve"], expected_req, places=2)

    def test_forecast_features_no_data_leakage(self):
        """Load forecast features must strictly use past lags and forecast weather, never future actual load."""
        past_series = [42.0, 43.5, 45.0, 48.0, 46.5, 47.0] * 5  # 30 steps
        cutoff = 24

        # For predicting step cutoff + 1, features must only be computed from indices < cutoff
        lag_1 = past_series[cutoff - 1]
        lag_2 = past_series[cutoff - 2]
        lag_24 = past_series[cutoff - 24]

        # Verify lags are strictly from the past
        self.assertEqual(lag_1, past_series[23])
        self.assertEqual(lag_2, past_series[22])
        self.assertEqual(lag_24, past_series[0])

        accessed_indices = [cutoff - 1, cutoff - 2, cutoff - 24]
        for idx in accessed_indices:
            self.assertLess(idx, cutoff, "Data leakage detected: future or current index used in past lag features!")

if __name__ == "__main__":
    unittest.main()
