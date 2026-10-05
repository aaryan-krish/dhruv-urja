export const TRANSLATIONS = {
  en: {
    // Header & Brand
    gov_india: "Government of India",
    gov_india_hi: "भारत सरकार",
    ministry: "Ministry of Earth Sciences (MoES)",
    ministry_sub: "पृथ्वी विज्ञान मंत्रालय",
    department: "National Centre for Polar and Ocean Research (NCPOR)",
    department_sub: "राष्ट्रीय ध्रुवीय एवं समुद्री अनुसंधान केंद्र",
    station_name: "Bharati Antarctic Research Station (69°24'S, 76°11'E)",
    station_name_sub: "भारती अंटार्कटिक अनुसंधान केंद्र",
    tagline: "Smart power for the poles",
    emblem_placeholder: "EMBLEM OF INDIA",
    emblem_desc: "State Emblem of India Placeholder (MoES/NCPOR)",
    problem_id_label: "Problem ID: 26061 | Clean & Green Tech",

    // Navigation
    nav_home: "Home",
    nav_about: "About",
    nav_services: "Services",
    nav_notices: "Notices",
    nav_downloads: "Downloads",
    nav_contact: "Contact",

    // Accessibility
    text_size: "Text Size",
    contrast_toggle: "High Contrast",
    contrast_normal: "Normal",
    skip_to_content: "Skip to main content",

    // Warning Banner
    warning_banner_en: "Prototype - simulated data - not an official Government of India website",
    warning_banner_hi: "प्रारूप - अनुकारित डेटा - यह भारत सरकार की आधिकारिक वेबसाइट नहीं है",
    warning_sub_en: "PROTOTYPE - SIMULATED SENSOR DATA. This is NOT real station data. Do not use for operational decisions.",

    // Document Details Block
    doc_ref: "Ref No: MoES/NCPOR/DU-2026/26061",
    doc_date: "Issue Date: 04 October 2026",
    last_updated: "Last Updated: 04 October 2026",

    // Progress Strip (3 small stages only)
    stage_sensor_data: "1. Sensor data",
    stage_optimization: "2. Optimization",
    stage_results_report: "3. Results and report",

    // Stage A: Sensor Data
    btn_start_feed: "Start sensor data feed (simulated)",
    btn_feed_running: "Sensor feed streaming...",
    btn_feed_active: "30-Day dataset generated",
    source_simulated: "Simulated sensors",
    source_real: "Real sensors (Modbus/CAN drivers - not available in prototype)",
    status_unverified: "Simulated - not verified",
    btn_run_optimization: "Run Optimization",
    btn_run_opt_help: "Requires data and scientific verification sign-off",
    select_interval: "Telemetry Interval:",

    // 4 Summary Cards
    card_records: "Total Records",
    card_records_sub: "15-minute telemetry intervals",
    card_mean_temp: "Mean Ambient Temp",
    card_mean_temp_sub: "Extreme polar conditions",
    card_avg_load: "Average Station Load",
    card_avg_load_sub: "Life support + heating + labs",
    card_renewables: "Renewable Generation",
    card_renewables_sub: "Wind + Bifacial Solar PV",
    peak_load_label: "Peak Load",

    // Main Chart Stage A
    chart_load_vs_renewables: "Station Electrical Load vs Total Renewable Generation",
    chart_load_vs_renewables_desc: "30-day continuous profile showing extreme katabatic wind surges and diurnal solar cycles",
    legend_load: "Station Load (kW)",
    legend_renewables: "Renewable Generation (kW)",
    legend_net: "Net Requirement (kW)",
    toggle_table_view: "Toggle table view",
    export_csv: "Export CSV",

    // Collapsible Details Stage A
    details_panel_title: "Show details (Sensor tag registers, weather charts, raw preview)",
    details_panel_hide: "Hide details",
    sensor_tags_heading: "Live Virtual Device Sensor Tags (18 Parameters)",
    col_tag_id: "Tag ID",
    col_name: "Sensor Name",
    col_device: "Virtual Device",
    col_protocol: "Protocol",
    col_value: "Value",
    col_unit: "Unit",
    col_status: "Status",
    col_timestamp: "Timestamp",

    // Verification Modal
    modal_title: "Data verification (prototype stage)",
    modal_declaration: "I declare that the current data shown matches the actual station data provided to me (paper-based records).",
    modal_name_label: "Scientist / Engineer Name *",
    modal_role_label: "Designation / Role *",
    modal_role_scientist: "Scientist / Winter-Over Team",
    modal_role_engineer: "Station Chief Engineer",
    modal_empid_label: "Employee / Mission ID *",
    modal_checkbox_text: "I confirm the paper log validation and authorize execution of the AI optimization engine on this dataset.",
    modal_btn_confirm: "Confirm and Run Optimization",
    modal_btn_cancel: "Cancel",
    modal_disclaimer: "Note: This is an engineering prototype verification flow for simulated demonstration. No real microgrid hardware breakers are triggered.",

    // Stage B: Optimization & XGBoost
    panel_opt_title: "Optimization Run (Microgrid Dispatch)",
    panel_opt_desc: "Evaluating BESS state of charge, cold derating, start delays, and spinning reserves",
    panel_xgb_title: "XGBoost Training (Rolling / Online Load Forecasting)",
    panel_xgb_desc: "Gradient boosted decision trees predicting next 24h demand with weather horizon inputs",
    xgb_status_training: "Model training in progress...",
    xgb_status_complete: "XGBoost model converged (Tree depth: 6, n_estimators: 100)",
    metric_mae: "MAE (Mean Absolute Error)",
    metric_rmse: "RMSE (Root Mean Squared Error)",
    metric_mape: "MAPE (Mean Abs. % Error)",
    baseline_comparison: "Compared to 24h-Average Baseline",
    xgb_accuracy_gain: "Model Accuracy Gain",
    feature_importance_title: "Key Predictor Feature Importance",
    pred_vs_actual_title: "Predicted vs Actual Load (with 95% Confidence Band)",
    loss_curve_title: "XGBoost Training Loss Convergence",
    live_sim_advancing: "Dispatch simulation advancing through 720 hours...",

    // Stage C: Results & Report
    kpi_section_title: "Performance KPI Comparison: Baseline vs AI-Optimized",
    kpi_section_desc: "Baseline represents standard polar operation (diesel generators running 24/7). AI-Optimized coordinates BESS and renewables with 40% minimum engine loading rule.",
    kpi_baseline_label: "Baseline (Always-On)",
    kpi_optimized_label: "Dhruv Urja (AI-Optimized)",
    kpi_fuel_saved: "Diesel Fuel Saved",
    kpi_gen_hours: "Generator Runtime",
    kpi_wet_stacking: "Wet-Stacking (<40% load)",
    kpi_co2_avoided: "CO₂ Avoided",
    kpi_cost_saved: "Logistical Cost Saved",
    kpi_renewable_used: "Renewable Energy Utilised",
    kpi_battery_cycles: "Equivalent Battery Cycles",
    kpi_reserve_violations: "Reserve Violations",

    // Plan Next 24 Hours
    plan_title: "Next 24 Hours Microgrid Advisory Plan",
    plan_subtitle: "Weather-aware rolling advisory dispatch for Station Engineers (Bharati Antarctic Station)",
    plan_advisory_notice: "ADVISORY ONLY: Fallback to the always-on generator rule occurs automatically if forecast confidence falls below 75% or sensors become stale.",
    plan_col_hour: "Hour",
    plan_col_pred_load: "Pred. Load",
    plan_col_pred_re: "Pred. Renewables",
    plan_col_net: "Net Demand",
    plan_col_bess: "Battery Avail.",
    plan_col_action: "Recommended Action",
    plan_col_risk: "Risk Level",
    plan_col_reason: "Operational Reason",

    // Charts Stage C
    chart_gen_mix: "Generation Mix vs Station Electrical Load",
    chart_bess_state: "Battery State: SoC (%), Cell Temperature (°C), & Power (kW)",
    chart_re_performance: "Renewable Efficiency & Reason for Low Output",
    reason_icing: "Aerodynamic Icing Derating",
    reason_snow: "Snow Cover on PV Array",
    reason_polar_night: "Polar Night (Zero GHI)",
    reason_low_wind: "Wind Below Cut-In (3.5 m/s)",
    reason_cold_cutoff: "Cold Temperature Limit",

    // Collapsible Details Stage C
    details_weather_audit: "Show details (Weather profiles, Engine logs, Audit log records)",
    audit_log_title: "Immutable Scientist Data Verification Audit Log",
    btn_download_pdf: "Download Report (PDF)",
    btn_download_csv: "Download Data (CSV)",
    btn_print_report: "Print Report",

    // Footer
    footer_address: "National Centre for Polar and Ocean Research (NCPOR), Headland Sada, Vasco-da-Gama, Goa 403804, India",
    footer_phone: "Email: polar-energy@ncpor.res.in",
    footer_copyright: "© 2026 Ministry of Earth Sciences, National Centre for Polar and Ocean Research. All rights reserved.",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Use",
    footer_accessibility: "Accessibility Statement",
    footer_sitemap: "Sitemap"
  },
  hi: {
    // Header & Brand
    gov_india: "भारत सरकार",
    gov_india_hi: "Government of India",
    ministry: "पृथ्वी विज्ञान मंत्रालय (MoES)",
    ministry_sub: "Ministry of Earth Sciences",
    department: "राष्ट्रीय ध्रुवीय एवं समुद्री अनुसंधान केंद्र (NCPOR)",
    department_sub: "National Centre for Polar and Ocean Research",
    station_name: "भारती अंटार्कटिक अनुसंधान केंद्र (69°24'S, 76°11'E)",
    station_name_sub: "Bharati Antarctic Research Station",
    tagline: "ध्रुवों के लिए स्मार्ट ऊर्जा",
    emblem_placeholder: "भारत का राज्य प्रतीक",
    emblem_desc: "भारत का राज्य प्रतीक स्थानधारक (MoES/NCPOR)",
    problem_id_label: "समस्या आईडी: 26061 | स्वच्छ एवं हरित प्रौद्योगिकी",

    // Navigation
    nav_home: "मुख्य पृष्ठ",
    nav_about: "परिचय",
    nav_services: "सेवाएं",
    nav_notices: "सूचनाएं",
    nav_downloads: "डाउनलोड",
    nav_contact: "संपर्क",

    // Accessibility
    text_size: "अक्षर आकार",
    contrast_toggle: "उच्च कंट्रास्ट",
    contrast_normal: "सामान्य",
    skip_to_content: "मुख्य सामग्री पर जाएं",

    // Warning Banner
    warning_banner_en: "Prototype - simulated data - not an official Government of India website",
    warning_banner_hi: "प्रारूप - अनुकारित डेटा - यह भारत सरकार की आधिकारिक वेबसाइट नहीं है",
    warning_sub_en: "PROTOTYPE - SIMULATED SENSOR DATA. This is NOT real station data. Do not use for operational decisions.",

    // Document Details Block
    doc_ref: "संदर्भ सं: MoES/NCPOR/DU-2026/26061",
    doc_date: "जारी दिनांक: 04 अक्टूबर 2026",
    last_updated: "अंतिम अद्यतन: 04 अक्टूबर 2026",

    // Progress Strip
    stage_sensor_data: "1. सेंसर डेटा",
    stage_optimization: "2. अनुकूलन (ऑप्टिमाइज़ेशन)",
    stage_results_report: "3. परिणाम और रिपोर्ट",

    // Stage A: Sensor Data
    btn_start_feed: "सेंसर डेटा फ़ीड प्रारंभ करें (अनुकारित)",
    btn_feed_running: "सेंसर फ़ीड स्ट्रीम हो रहा है...",
    btn_feed_active: "30-दिवसीय डेटासेट तैयार",
    source_simulated: "अनुकारित सेंसर (सक्रिय)",
    source_real: "वास्तविक सेंसर (मोडबस/कैन ड्राइवर - प्रोटोटाइप में अनुपलब्ध)",
    status_unverified: "अनुकारित - असत्यापित",
    btn_run_optimization: "ऑप्टिमाइज़ेशन चलाएं",
    btn_run_opt_help: "डेटा और वैज्ञानिक सत्यापन आवश्यक है",
    select_interval: "टेलीमेट्री अंतराल:",

    // 4 Summary Cards
    card_records: "कुल रिकॉर्ड",
    card_records_sub: "15-मिनट टेलीमेट्री अंतराल",
    card_mean_temp: "औसत परिवेश तापमान",
    card_mean_temp_sub: "चरम ध्रुवीय मौसम",
    card_avg_load: "औसत स्टेशन लोड",
    card_avg_load_sub: "जीवन समर्थन + ताप + प्रयोगशालाएं",
    card_renewables: "नवीकरणीय उत्पादन",
    card_renewables_sub: "पवन + बाईफेशियल सौर पीवी",
    peak_load_label: "शिखर लोड",

    // Main Chart Stage A
    chart_load_vs_renewables: "स्टेशन विद्युत लोड बनाम कुल नवीकरणीय उत्पादन",
    chart_load_vs_renewables_desc: "चरम कैटाबैटिक हवाओं और दैनिक सौर चक्रों को प्रदर्शित करने वाला 30-दिवसीय प्रोफाइल",
    legend_load: "स्टेशन लोड (kW)",
    legend_renewables: "नवीकरणीय उत्पादन (kW)",
    legend_net: "शुद्ध आवश्यकता (kW)",
    toggle_table_view: "तालिका दृश्य बदलें",
    export_csv: "सीएसवी निर्यात",

    // Collapsible Details Stage A
    details_panel_title: "विवरण देखें (सेंसर टैग रजिस्टर, मौसम चार्ट, कच्चा पूर्वावलोकन)",
    details_panel_hide: "विवरण छिपाएं",
    sensor_tags_heading: "लाइव वर्चुअल डिवाइस सेंसर टैग (18 पैरामीटर)",
    col_tag_id: "टैग आईडी",
    col_name: "सेंसर नाम",
    col_device: "वर्चुअल डिवाइस",
    col_protocol: "प्रोटोकॉल",
    col_value: "मान",
    col_unit: "इकाई",
    col_status: "स्थिति",
    col_timestamp: "समय मुहर",

    // Verification Modal
    modal_title: "डेटा सत्यापन (प्रोटोटाइप चरण)",
    modal_declaration: "मैं घोषणा करता/करती हूँ कि वर्तमान प्रदर्शित डेटा मुझे प्रदान किए गए वास्तविक स्टेशन डेटा (कागजी अभिलेखों) से मेल खाता है।",
    modal_name_label: "वैज्ञानिक / अभियंता का नाम *",
    modal_role_label: "पदनाम / भूमिका *",
    modal_role_scientist: "वैज्ञानिक / शीतकालीन दल सदस्य",
    modal_role_engineer: "स्टेशन मुख्य अभियंता",
    modal_empid_label: "कर्मचारी / मिशन आईडी *",
    modal_checkbox_text: "मैं भौतिक लॉग सत्यापन की पुष्टि करता हूँ और इस डेटासेट पर AI ऑप्टिमाइज़ेशन चलाने की अनुमति देता हूँ।",
    modal_btn_confirm: "पुष्टि करें और ऑप्टिमाइज़ेशन चलाएं",
    modal_btn_cancel: "रद्द करें",
    modal_disclaimer: "नोट: यह अनुकारित प्रदर्शन के लिए एक इंजीनियरिंग प्रोटोटाइप सत्यापन प्रवाह है। कोई वास्तविक हार्डवेयर ब्रेकर सक्रिय नहीं होता है।",

    // Stage B: Optimization & XGBoost
    panel_opt_title: "ऑप्टिमाइज़ेशन रन (माइक्रोग्रिड प्रेषण)",
    panel_opt_desc: "BESS चार्ज स्थिति, शीतलन दर, जनरेटर विलंब और रिजर्व मार्जिन का मूल्यांकन",
    panel_xgb_title: "XGBoost प्रशिक्षण (रोलिंग / ऑनलाइन लोड पूर्वानुमान)",
    panel_xgb_desc: "मौसम के आधार पर अगले 24 घंटों की मांग का पूर्वानुमान लगाने वाले ग्रेडिएंट बूस्टेड ट्री",
    xgb_status_training: "मॉडल प्रशिक्षण प्रगति पर है...",
    xgb_status_complete: "XGBoost मॉडल अभिसरित हुआ (गहराई: 6, n_estimators: 100)",
    metric_mae: "MAE (औसत पूर्ण त्रुटि)",
    metric_rmse: "RMSE (मूल माध्य वर्ग त्रुटि)",
    metric_mape: "MAPE (औसत पूर्ण प्रतिशत त्रुटि)",
    baseline_comparison: "24-घंटे औसत आधारभूत की तुलना में",
    xgb_accuracy_gain: "मॉडल सटीकता वृद्धि",
    feature_importance_title: "प्रमुख भविष्यवक्ता सुविधा महत्व",
    pred_vs_actual_title: "पूर्वानुमानित बनाम वास्तविक लोड (95% विश्वास बैंड सहित)",
    loss_curve_title: "XGBoost प्रशिक्षण हानि वक्र",
    live_sim_advancing: "720 घंटों के माध्यम से सिमुलेशन आगे बढ़ रहा है...",

    // Stage C: Results & Report
    kpi_section_title: "प्रदर्शन KPI तुलना: आधारभूत बनाम AI-अनुकूलित",
    kpi_section_desc: "आधारभूत मानक ध्रुवीय संचालन (24/7 चलने वाला जनरेटर) दर्शाता है। AI-अनुकूलित 40% न्यूनतम लोड नियम के साथ BESS और नवीकरणीय ऊर्जा का समन्वय करता है।",
    kpi_baseline_label: "आधारभूत (सदैव सक्रिय)",
    kpi_optimized_label: "ध्रुव ऊर्जा (AI-अनुकूलित)",
    kpi_fuel_saved: "डीजल ईंधन की बचत",
    kpi_gen_hours: "जनरेटर चलने के घंटे",
    kpi_wet_stacking: "वेट-स्टैकिंग (<40% लोड)",
    kpi_co2_avoided: "बचाई गई CO₂",
    kpi_cost_saved: "लॉजिस्टिक लागत बचत",
    kpi_renewable_used: "उपयोग की गई नवीकरणीय ऊर्जा",
    kpi_battery_cycles: "समतुल्य बैटरी चक्र",
    kpi_reserve_violations: "रिजर्व उल्लंघन",

    // Plan Next 24 Hours
    plan_title: "अगले 24 घंटे का माइक्रोग्रिड परामर्श प्लान",
    plan_subtitle: "स्टेशन इंजीनियरों (भारती अंटार्कटिक केंद्र) के लिए मौसम-जागरूक रोलिंग परामर्श प्रेषण",
    plan_advisory_notice: "केवल परामर्श: यदि पूर्वानुमान विश्वास 75% से कम होता है या सेंसर पुराने हो जाते हैं तो सदैव-चालू नियम स्वचालित रूप से सक्रिय हो जाता है।",
    plan_col_hour: "घंटा",
    plan_col_pred_load: "पूर्वानुमानित लोड",
    plan_col_pred_re: "पूर्वानुमानित नवीकरणीय",
    plan_col_net: "शुद्ध मांग",
    plan_col_bess: "बैटरी उपलब्ध",
    plan_col_action: "अनुशंसित कार्रवाई",
    plan_col_risk: "जोखिम स्तर",
    plan_col_reason: "परिचालन कारण",

    // Charts Stage C
    chart_gen_mix: "उत्पादन मिश्रण बनाम स्टेशन विद्युत लोड",
    chart_bess_state: "बैटरी स्थिति: SoC (%), सेल तापमान (°C), और पावर (kW)",
    chart_re_performance: "नवीकरणीय दक्षता और कम उत्पादन के कारण",
    reason_icing: "एरोडायनामिक बर्फबारी डिरेटिंग",
    reason_snow: "सौर पैनलों पर बर्फ जमाव",
    reason_polar_night: "ध्रुवीय रात्रि (शून्य GHI)",
    reason_low_wind: "कट-इन गति से कम हवा (3.5 m/s)",
    reason_cold_cutoff: "अत्यधिक शीत तापमान सीमा",

    // Collapsible Details Stage C
    details_weather_audit: "विवरण देखें (मौसम प्रोफाइल, इंजन लॉग, ऑडिट लॉग रिकॉर्ड)",
    audit_log_title: "अपरिवर्तनीय वैज्ञानिक डेटा सत्यापन ऑडिट लॉग",
    btn_download_pdf: "रिपोर्ट डाउनलोड करें (PDF)",
    btn_download_csv: "डेटा डाउनलोड करें (CSV)",
    btn_print_report: "रिपोर्ट प्रिंट करें",

    // Footer
    footer_address: "राष्ट्रीय ध्रुवीय एवं समुद्री अनुसंधान केंद्र (NCPOR), हेडलैंड साडा, वास्को-डि-गामा, गोवा 403804, भारत",
    footer_phone: "ईमेल: polar-energy@ncpor.res.in",
    footer_copyright: "© 2026 पृथ्वी विज्ञान मंत्रालय, राष्ट्रीय ध्रुवीय एवं समुद्री अनुसंधान केंद्र। सर्वाधिकार सुरक्षित।",
    footer_privacy: "गोपनीयता नीति",
    footer_terms: "उपयोग की शर्तें",
    footer_accessibility: "अभिगम्यता विवरण",
    footer_sitemap: "साइटमैप"
  }
};
