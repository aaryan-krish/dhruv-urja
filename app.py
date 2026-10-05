"""
Dhruv Urja (ध्रुव ऊर्जा) - Smart Power for the Poles
Ministry of Earth Sciences (MoES) / NCPOR - Problem Statement ID: 26061

Backend Server (Python 3)
Can be executed with:
    python app.py
Serves REST API on http://localhost:5000 (Flask or Standard Library HTTPServer fallback)
"""

import os
import json
import math
import sqlite3
from datetime import datetime

# Try importing Flask; if not installed, standard library HTTP server fallback is used
try:
    from flask import Flask, jsonify, request
    from flask_cors import CORS
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False
    import http.server
    import urllib.parse

DB_PATH = os.path.join(os.environ.get("DATA_DIR", os.path.dirname(__file__)), "dhruv_urja.db")
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.json")
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend_dist")

def load_config():
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            verified_by_name TEXT NOT NULL,
            role TEXT NOT NULL,
            employee_id TEXT NOT NULL,
            dataset_id TEXT NOT NULL,
            notes TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Real Decision Stump for Gradient Boosting
class RegressionStump:
    def __init__(self):
        self.feature_index = 0
        self.threshold = 0.0
        self.left_val = 0.0
        self.right_val = 0.0
        self.gain = 0.0

    def fit(self, X, residuals):
        n_samples = len(X)
        n_features = len(X[0])
        best_gain = -1.0

        mean_res = sum(residuals) / n_samples
        total_var = sum((r - mean_res) ** 2 for r in residuals)

        for f in range(n_features):
            step = max(1, n_samples // 12)
            vals = sorted([X[i][f] for i in range(0, n_samples, step)])
            for t in range(len(vals) - 1):
                thresh = (vals[t] + vals[t + 1]) / 2.0
                left_res = [residuals[i] for i in range(n_samples) if X[i][f] <= thresh]
                right_res = [residuals[i] for i in range(n_samples) if X[i][f] > thresh]

                if len(left_res) < 2 or len(right_res) < 2:
                    continue

                left_mean = sum(left_res) / len(left_res)
                right_mean = sum(right_res) / len(right_res)

                left_var = sum((r - left_mean) ** 2 for r in left_res)
                right_var = sum((r - right_mean) ** 2 for r in right_res)

                gain = total_var - (left_var + right_var)
                if gain > best_gain:
                    best_gain = gain
                    self.feature_index = f
                    self.threshold = thresh
                    self.left_val = left_mean
                    self.right_val = right_mean
                    self.gain = gain

    def predict(self, x):
        if x[self.feature_index] <= self.threshold:
            return self.left_val
        return self.right_val

# Real Gradient Boosted Trees Ensemble
class RealGBDTRegressor:
    def __init__(self, n_estimators=30, learning_rate=0.15):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.trees = []
        self.base_pred = 0.0
        self.feature_importances = []

    def fit(self, X_train, y_train, X_val, y_val):
        n_train = len(y_train)
        n_val = len(y_val)
        n_features = len(X_train[0])

        self.base_pred = sum(y_train) / n_train
        pred_train = [self.base_pred] * n_train
        pred_val = [self.base_pred] * n_val

        train_losses = []
        val_losses = []
        total_gains = [0.0] * n_features

        for _ in range(self.n_estimators):
            residuals = [y_train[i] - pred_train[i] for i in range(n_train)]
            stump = RegressionStump()
            stump.fit(X_train, residuals)
            self.trees.append(stump)

            total_gains[stump.feature_index] += stump.gain

            train_err_sq = 0.0
            for i in range(n_train):
                pred_train[i] += self.learning_rate * stump.predict(X_train[i])
                train_err_sq += (y_train[i] - pred_train[i]) ** 2

            val_err_sq = 0.0
            for i in range(n_val):
                pred_val[i] += self.learning_rate * stump.predict(X_val[i])
                val_err_sq += (y_val[i] - pred_val[i]) ** 2

            train_losses.append(round(math.sqrt(train_err_sq / n_train), 2))
            val_losses.append(round(math.sqrt(val_err_sq / n_val), 2))

        # Held-out validation metrics
        abs_errs = [abs(y_val[i] - pred_val[i]) for i in range(n_val)]
        mae = round(sum(abs_errs) / n_val, 2)
        rmse = round(math.sqrt(sum(e ** 2 for e in abs_errs) / n_val), 2)
        mape = round(sum(abs_errs[i] / max(1.0, y_val[i]) * 100 for i in range(n_val)) / n_val, 1)

        sum_gains = sum(total_gains) or 1.0
        self.feature_importances = [round((g / sum_gains) * 100, 1) for g in total_gains]

        # Diurnal mean baseline evaluated on held-out validation set
        baseline_pred = sum(y_train) / n_train
        base_abs_errs = [abs(y_val[i] - baseline_pred) for i in range(n_val)]
        base_mae = round(sum(base_abs_errs) / n_val, 2)
        base_rmse = round(math.sqrt(sum(e ** 2 for e in base_abs_errs) / n_val), 2)
        base_mape = round(sum(base_abs_errs[i] / max(1.0, y_val[i]) * 100 for i in range(n_val)) / n_val, 1)

        feature_names = [
            "Lag 1h (Past Load)",
            "Lag 2h (Past Load)",
            "Lag 24h (Diurnal Load)",
            "Past 6h Rolling Mean",
            "Ambient Temp (°C)",
            "Wind Speed (m/s)",
            "Solar GHI (W/m²)",
            "Hour Sin",
            "Hour Cos"
        ]

        formatted_importances = [
            {"name": feature_names[i], "importance": self.feature_importances[i]}
            for i in range(len(feature_names))
        ]
        formatted_importances.sort(key=lambda x: x["importance"], reverse=True)

        return {
            "train_loss_curve": train_losses,
            "val_loss_curve": val_losses,
            "mae": mae,
            "rmse": rmse,
            "mape": mape,
            "baseline_mae": base_mae,
            "baseline_rmse": base_rmse,
            "baseline_mape": base_mape,
            "feature_importances": formatted_importances
        }

def process_train_xgboost(telemetry):
    if len(telemetry) < 30:
        return {"error": "Insufficient telemetry data for training (minimum 30 steps required)"}, 400

    # Build feature matrix strictly from past data (NO future leakage!)
    X = []
    y = []
    for i in range(24, len(telemetry)):
        lag1 = telemetry[i - 1]['station_load_kw']
        lag2 = telemetry[i - 2]['station_load_kw']
        lag24 = telemetry[i - 24]['station_load_kw']
        rolling6 = sum(telemetry[i - k]['station_load_kw'] for k in range(1, 7)) / 6.0
        pt = telemetry[i]
        hour_rad = (pt['hour_of_day'] / 24.0) * 2 * math.pi
        X.append([
            lag1,
            lag2,
            lag24,
            rolling6,
            pt['ambient_temp_c'],
            pt['wind_speed_mps'],
            pt['solar_ghi_wm2'],
            math.sin(hour_rad),
            math.cos(hour_rad)
        ])
        y.append(pt['station_load_kw'])

    # Strict Time-Series Split (75% train on past, 25% held-out test on later period)
    split_idx = int(len(X) * 0.75)
    X_train, y_train = X[:split_idx], y[:split_idx]
    X_val, y_val = X[split_idx:], y[split_idx:]

    try:
        import xgboost as xgb
        model = xgb.XGBRegressor(n_estimators=30, learning_rate=0.15, max_depth=3)
        model.fit(X_train, y_train, eval_set=[(X_train, y_train), (X_val, y_val)], verbose=False)
        evals = model.evals_result()
        preds = model.predict(X_val)
        mae = float(sum(abs(y_val[i] - preds[i]) for i in range(len(y_val))) / len(y_val))
        rmse = float(math.sqrt(sum((y_val[i] - preds[i]) ** 2 for i in range(len(y_val))) / len(y_val)))
        mape = float(sum(abs(y_val[i] - preds[i]) / max(1.0, y_val[i]) * 100 for i in range(len(y_val))) / len(y_val))

        feature_names = [
            "Lag 1h (Past Load)",
            "Lag 2h (Past Load)",
            "Lag 24h (Diurnal Load)",
            "Past 6h Rolling Mean",
            "Ambient Temp (°C)",
            "Wind Speed (m/s)",
            "Solar GHI (W/m²)",
            "Hour Sin",
            "Hour Cos"
        ]
        importances = [
            {"name": feature_names[i], "importance": round(float(model.feature_importances_[i]) * 100, 1)}
            for i in range(len(feature_names))
        ]
        importances.sort(key=lambda x: x["importance"], reverse=True)

        baseline_pred = sum(y_train) / len(y_train)
        base_abs_errs = [abs(y_val[i] - baseline_pred) for i in range(len(y_val))]
        base_mae = round(sum(base_abs_errs) / len(y_val), 2)
        base_rmse = round(math.sqrt(sum(e ** 2 for e in base_abs_errs) / len(y_val)), 2)
        base_mape = round(sum(base_abs_errs[i] / max(1.0, y_val[i]) * 100 for i in range(len(y_val))) / len(y_val), 1)

        result = {
            "train_loss_curve": [round(x, 2) for x in evals['validation_0']['rmse']],
            "val_loss_curve": [round(x, 2) for x in evals['validation_1']['rmse']],
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape, 1),
            "baseline_mae": base_mae,
            "baseline_rmse": base_rmse,
            "baseline_mape": base_mape,
            "feature_importances": importances
        }
        return result, 200
    except Exception:
        gbdt = RealGBDTRegressor(n_estimators=30, learning_rate=0.15)
        res = gbdt.fit(X_train, y_train, X_val, y_val)
        return res, 200

# ----------------- Flask Implementation -----------------
if HAS_FLASK:
    from flask import send_from_directory, send_file

    app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
    CORS(app)

    @app.route('/api/config', methods=['GET'])
    def api_config():
        return jsonify(load_config())

    @app.route('/api/audit-logs', methods=['GET', 'POST'])
    def api_audit_logs():
        if request.method == 'POST':
            data = request.json or {}
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO audit_logs (timestamp, verified_by_name, role, employee_id, dataset_id, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                datetime.utcnow().isoformat() + "Z",
                data.get('name', ''),
                data.get('role', ''),
                data.get('employee_id', ''),
                data.get('dataset_id', 'DATASET-30D-SIM'),
                data.get('notes', '')
            ))
            conn.commit()
            log_id = cursor.lastrowid
            conn.close()
            return jsonify({"status": "success", "id": log_id}), 201
        else:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('SELECT id, timestamp, verified_by_name, role, employee_id, dataset_id, notes FROM audit_logs ORDER BY id DESC LIMIT 50')
            rows = cursor.fetchall()
            conn.close()
            logs = [
                {
                    "id": f"AUDIT-{r[0]}",
                    "timestamp": r[1],
                    "verified_by": r[2],
                    "role": r[3],
                    "employee_id": r[4],
                    "dataset_id": r[5],
                    "notes": r[6]
                }
                for r in rows
            ]
            return jsonify(logs)

    @app.route('/api/train_xgboost', methods=['POST'])
    def api_train_xgboost():
        req_data = request.json or {}
        telemetry = req_data.get('telemetry', [])
        res, code = process_train_xgboost(telemetry)
        return jsonify(res), code

    # Serve React app — catch-all for client-side routing
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path and os.path.exists(os.path.join(FRONTEND_DIST, path)):
            return send_from_directory(FRONTEND_DIST, path)
        return send_from_directory(FRONTEND_DIST, 'index.html')

# ----------------- Standard Library Fallback -----------------
else:
    class StandaloneHTTPServer(http.server.HTTPServer):
        allow_reuse_address = True

    class StandaloneHTTPHandler(http.server.BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            pass  # Suppress default noisy stderr request logging

        def _set_headers(self, status=200):
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()

        def do_OPTIONS(self):
            self._set_headers(200)

        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path == '/api/config':
                self._set_headers(200)
                self.wfile.write(json.dumps(load_config()).encode('utf-8'))
            elif parsed.path == '/api/audit-logs':
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute('SELECT id, timestamp, verified_by_name, role, employee_id, dataset_id, notes FROM audit_logs ORDER BY id DESC LIMIT 50')
                rows = cursor.fetchall()
                conn.close()
                logs = [
                    {
                        "id": f"AUDIT-{r[0]}",
                        "timestamp": r[1],
                        "verified_by": r[2],
                        "role": r[3],
                        "employee_id": r[4],
                        "dataset_id": r[5],
                        "notes": r[6]
                    }
                    for r in rows
                ]
                self._set_headers(200)
                self.wfile.write(json.dumps(logs).encode('utf-8'))
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Not Found"}).encode('utf-8'))

        def do_POST(self):
            parsed = urllib.parse.urlparse(self.path)
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b'{}'
            try:
                data = json.loads(body.decode('utf-8'))
            except Exception:
                data = {}

            if parsed.path == '/api/audit-logs':
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO audit_logs (timestamp, verified_by_name, role, employee_id, dataset_id, notes)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    datetime.utcnow().isoformat() + "Z",
                    data.get('name', ''),
                    data.get('role', ''),
                    data.get('employee_id', ''),
                    data.get('dataset_id', 'DATASET-30D-SIM'),
                    data.get('notes', '')
                ))
                conn.commit()
                log_id = cursor.lastrowid
                conn.close()
                self._set_headers(201)
                self.wfile.write(json.dumps({"status": "success", "id": log_id}).encode('utf-8'))
            elif parsed.path == '/api/train_xgboost':
                telemetry = data.get('telemetry', [])
                res, code = process_train_xgboost(telemetry)
                self._set_headers(code)
                self.wfile.write(json.dumps(res).encode('utf-8'))
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Not Found"}).encode('utf-8'))

if __name__ == '__main__':
    print("=" * 60)
    print(" Dhruv Urja - Smart Energy Management Prototype")
    print(" Problem Statement ID: 26061")
    print(" Starting Python backend on http://0.0.0.0:5000...")
    print("=" * 60)
    if HAS_FLASK:
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        server = StandaloneHTTPServer(('0.0.0.0', 5000), StandaloneHTTPHandler)
        print("Running with standard library HTTP server (Flask not installed).")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("Server stopped by user.")
        except Exception as e:
            print("Server error:", e)
        finally:
            server.server_close()
