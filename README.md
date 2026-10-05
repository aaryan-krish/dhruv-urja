# Dhruv Urja (ध्रुव ऊर्जा) - Smart Power for the Poles
### AI-Driven Smart Energy Management System for Polar Research Stations (Prototype)
**Problem Statement ID:** 26061  
**Organization:** Ministry of Earth Sciences (MoES)  
**Department:** National Centre for Polar and Ocean Research (NCPOR)  
**Target Station:** Polar Research Station (assumed example: Bharati Station, 69°24'S, 76°11'E)  
**Theme:** Clean & Green Technology | Category: Software  

---

## ⚠️ PROTOTYPE DISCLAIMER / चेतावनी
> **Prototype - simulated data - not an official Government of India website**  
> **प्रारूप - अनुकारित डेटा - यह भारत सरकार की आधिकारिक वेबसाइट नहीं है**  
> **PROTOTYPE - SIMULATED SENSOR DATA. This is NOT real station data. Do not use for operational decisions.**

This application is an engineering software prototype developed for Problem Statement ID 26061. All telemetry streams are synthesized through physical polar transfer equations and virtual sensor tags. Equipment ratings and station parameters are assumed values for demonstration purposes.

---

## 1. System Architecture (Offline, Basic PC Compatible)
The application is designed to operate offline on standard low-spec computers (4 GB RAM, older browsers, no external internet connection required, zero external CDNs, zero cloud dependencies).

- **Frontend:** React 19 + TypeScript + Tailwind CSS with custom SVG graphics (<1000 points per chart, decimation enabled).
- **Backend / Standalone:** Python 3 (`app.py`, SQLite) with standard library GBDT engine and support for XGBoost if installed.
- **Protocols Supported (Virtual Driver Tags):** Modbus RTU (RS-485), Modbus TCP/IP, CAN bus (J1939 for generator ECUs and BMS), and OPC UA.

---

## 2. Assumed Engineering Parameters (Configured in `config.json`)
Every assumption is centrally documented and modifiable in `config.json`:
1. **Station Base Load & Occupancy (assumed values):**
   - Life-support baseline electrical load: 24.0 kW (assumed value).
   - Target indoor temperature: 20.0 °C; safe emergency minimum: 16.0 °C.
   - Thermal loss coefficient: 0.45 kW/°C difference; wind infiltration factor: 0.015.
2. **Dual Diesel Generators (assumed values):**
   - Generator 1 (Primary): 80 kW rated (assumed value); 40% minimum stable load = 32 kW.
   - Generator 2 (Secondary): 60 kW rated (assumed value); 40% minimum stable load = 24 kW.
   - Fuel curves: `L/h = a * P + b` (a = 0.22 - 0.24 L/kWh, idle fuel = 3.2 - 3.8 L/h).
   - Waste heat recovery efficiency: 50% to 55%.
   - Start delay: 3 minutes (0.05 h).
3. **Battery Energy Storage System - BESS (assumed values):**
   - Chemistry: LiFePO4 containerized with auxiliary thermal insulation.
   - Nominal capacity: 200 kWh (assumed value); nominal continuous power: 80 kW (assumed value).
   - Cold derating: Discharge power derates to 75% at 0 °C, 45% at -10 °C, and 15% at -20 °C.
   - Charging cutoff: Blocked strictly below -5.0 °C to prevent lithium plating.
4. **Wind Turbine Generation - WTG (assumed values):**
   - 2 units × 30 kW = 60 kW total capacity (assumed value).
   - Cut-in: 3.5 m/s; rated: 12.0 m/s; cut-out: 25.0 m/s; extreme cold shutdown: -40.0 °C.
   - Aerodynamic blade icing derating: Up to 40% loss when humidity > 82% and -15 °C ≤ temp ≤ -1 °C.
5. **Solar Photovoltaic - PV (assumed values):**
   - Total capacity: 50 kW bifacial vertical/high-tilt panels (assumed value).
   - Polar night: Zero solar irradiance during Antarctic winter months.
6. **Carbon & Logistics Factors (assumed values):**
   - Diesel emissions factor: 2.68 kg CO2 per litre.
   - Landed polar fuel logistics cost: ₹310 / litre.

---

## 3. Strict Physical Rules & Zero-Fake Verification
- **Dual-Generator Loading:** Enforces $\ge 40\%$ minimum engine loading rule on whichever generator runs to prevent exhaust wet-stacking.
- **Generator OFF Safety Criterion:** Before a generator switches OFF, the optimizer strictly checks that the battery's current temperature-derated discharge power and stored usable energy cover the worst-case renewable drop for the 3-minute generator start delay, and that indoor temperature stays above 16.0 °C.
- **Always-On Safety Fallback:** If sensor telemetry is STALE / FAULT or forecast confidence is low (<70%), the generator always-on rule is immediately engaged.
- **True Computed Metrics:** Renewable utilisation %, reserve violations, and model confidence are all dynamically computed from the data stream (no hardcoded constants).
- **Zero Data Leakage:** The rolling gradient boosted decision tree model strictly uses historical load lags ($t-1, t-2, t-24$) and horizon weather features, never peaking into current or future actual load.

---

## 4. Running Unit Tests
A Python unit test suite (`test_simulation.py`) validates the physical constraints and algorithms:
```bash
python3 test_simulation.py
```
Test results verify:
1. Generator 40% minimum loading rule ($P_{\text{gen}} \ge 40\%$).
2. Indoor temperature safety constraint ($T_{\text{indoor}} \ge 16.0^\circ\text{C}$).
3. Cold battery charging block below $-5.0^\circ\text{C}$.
4. Start delay reserve buffering before generator shutdown.
5. Absence of data leakage in predictive features.

---

## 5. How to Run Locally

### Web Application (Vite / React)
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Python Backend
```bash
python test_simulation.py
python app.py
```
