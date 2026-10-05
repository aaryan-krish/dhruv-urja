import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { WarningBanner } from './components/WarningBanner';
import { ProgressStrip, StageId } from './components/ProgressStrip';
import { Sidebar, ActiveNavView } from './components/Sidebar';
import { StageSensorData } from './components/StageSensorData';
import { StageOptimization } from './components/StageOptimization';
import { StageResults } from './components/StageResults';
import { StageNext24Hours } from './components/StageNext24Hours';
import { VerificationModal } from './components/VerificationModal';
import { ProblemStatementModal } from './components/ProblemStatementModal';
import { Footer } from './components/Footer';
import { InfoModals, ModalType } from './components/InfoModals';
import { generatePolarTelemetry } from './simulation/polarEngine';
import { runXGBoostTrainingSimulation } from './simulation/xgboostModel';
import { Language, TelemetryPoint, SummaryKPIs, SensorTag, Next24HourAction, AuditLogEntry, XGBoostMetricState } from './types';
import { TRANSLATIONS } from './i18n/translations';
import { Menu, PanelLeftClose, PanelLeft } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [highContrast, setHighContrast] = useState(false);

  // Workflow Stages & Sidebar View
  const [currentStage, setCurrentStage] = useState<StageId>('sensor_data');
  const [activeNavView, setActiveNavView] = useState<ActiveNavView>('sensor_data');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Simulation State & Time Division (User configurable)
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [selectedDays, setSelectedDays] = useState(30); // 1, 2, 7, 15, 30 days
  const [intervalMinutes, setIntervalMinutes] = useState(15); // 15, 30, 60 (1hr), 120 (2hr), 180 (3hr)
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [kpis, setKpis] = useState<SummaryKPIs | null>(null);
  const [tags, setTags] = useState<SensorTag[]>([]);
  const [plan24h, setPlan24h] = useState<Next24HourAction[]>([]);

  // Verification & Audit Log State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verifiedEntry, setVerifiedEntry] = useState<AuditLogEntry | null>(null);

  // Optimization & XGBoost State
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optProgress, setOptProgress] = useState(0);
  const [xgbMetrics, setXgbMetrics] = useState<XGBoostMetricState>({
    currentIteration: 0,
    maxIterations: 100,
    trainLossCurve: [],
    valLossCurve: [],
    mae: 0,
    rmse: 0,
    mape: 0,
    baselineMae: 0,
    baselineRmse: 0,
    baselineMape: 0,
    featureImportances: []
  });

  // Dialog State
  const [activeInfoModal, setActiveInfoModal] = useState<ModalType | null>(null);
  const [isProblemStatementOpen, setIsProblemStatementOpen] = useState(false);

  // Section Refs for smooth scrolling
  const sensorSectionRef = useRef<HTMLDivElement>(null);
  const optSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const predictionSectionRef = useRef<HTMLDivElement>(null);

  // Initialize dataset on mount
  useEffect(() => {
    const generated = generatePolarTelemetry({ days: selectedDays, intervalMinutes: intervalMinutes });
    setTelemetry(generated.telemetry);
    setKpis(generated.kpis);
    setTags(generated.tags);
    setPlan24h(generated.plan24h);
    setHasData(true);

    const initialXgb = runXGBoostTrainingSimulation(generated.telemetry, 20, 100);
    setXgbMetrics(initialXgb);
  }, []);

  // Handlers for Language & Accessibility
  const handleToggleLang = () => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const handleToggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  // Re-generate or re-sample when user alters Duration or Interval division
  const handleChangeDays = (days: number) => {
    setSelectedDays(days);
    setIsStreaming(true);
    setTimeout(() => {
      const generated = generatePolarTelemetry({ days, intervalMinutes });
      setTelemetry(generated.telemetry);
      setKpis(generated.kpis);
      setTags(generated.tags);
      setPlan24h(generated.plan24h);
      setIsStreaming(false);

      const updatedXgb = runXGBoostTrainingSimulation(generated.telemetry, 35, 100);
      setXgbMetrics(updatedXgb);
    }, 400);
  };

  const handleChangeInterval = (interval: number) => {
    setIntervalMinutes(interval);
    setIsStreaming(true);
    setTimeout(() => {
      const generated = generatePolarTelemetry({ days: selectedDays, intervalMinutes: interval });
      setTelemetry(generated.telemetry);
      setKpis(generated.kpis);
      setTags(generated.tags);
      setPlan24h(generated.plan24h);
      setIsStreaming(false);

      const updatedXgb = runXGBoostTrainingSimulation(generated.telemetry, 35, 100);
      setXgbMetrics(updatedXgb);
    }, 400);
  };

  const handleStartFeed = () => {
    setIsStreaming(true);
    setTimeout(() => {
      const generated = generatePolarTelemetry({ days: selectedDays, intervalMinutes });
      setTelemetry(generated.telemetry);
      setKpis(generated.kpis);
      setTags(generated.tags);
      setPlan24h(generated.plan24h);
      setHasData(true);
      setIsStreaming(false);

      const newXgb = runXGBoostTrainingSimulation(generated.telemetry, 35, 100);
      setXgbMetrics(newXgb);
    }, 800);
  };

  const handleRequestRunOptimization = () => {
    if (!hasData) return;
    setIsVerificationModalOpen(true);
  };

  const handleConfirmVerification = async (entry: AuditLogEntry) => {
    setVerifiedEntry(entry);
    setIsVerificationModalOpen(false);
    setCurrentStage('optimization');
    setActiveNavView('optimization');

    setTimeout(() => {
      optSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    setIsOptimizing(true);
    setOptProgress(10);

    // Call real Python XGBoost backend API (/api/train_xgboost)
    let backendMetrics: XGBoostMetricState | null = null;
    try {
      const response = await fetch('/api/train_xgboost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telemetry })
      });
      if (response.ok) {
        const data = await response.json();
        backendMetrics = {
          currentIteration: data.train_loss_curve?.length || 30,
          maxIterations: 30,
          trainLossCurve: data.train_loss_curve || [],
          valLossCurve: data.val_loss_curve || [],
          mae: data.mae,
          rmse: data.rmse,
          mape: data.mape,
          baselineMae: data.baseline_mae || 3.9,
          baselineRmse: data.baseline_rmse || 4.8,
          baselineMape: data.baseline_mape || 8.5,
          featureImportances: data.feature_importances || []
        };
      }
    } catch (err) {
      console.log('Backend training request failed, falling back to client GBDT model:', err);
    }

    let step = 10;
    const interval = setInterval(() => {
      step += 5;
      setOptProgress(Math.min(100, step));

      if (step >= 100) {
        clearInterval(interval);
        setIsOptimizing(false);
        if (backendMetrics) {
          setXgbMetrics(backendMetrics);
        } else {
          setXgbMetrics(runXGBoostTrainingSimulation(telemetry, 60, 60));
        }
        setCurrentStage('results');
        setActiveNavView('results');
        setTimeout(() => {
          resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }, 60);
  };

  const handleSelectNavView = (view: ActiveNavView) => {
    setActiveNavView(view);
    if (view === 'sensor_data') {
      setCurrentStage('sensor_data');
      sensorSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (view === 'optimization') {
      setCurrentStage('optimization');
      optSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (view === 'results') {
      setCurrentStage('results');
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (view === 'prediction') {
      predictionSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectStage = (stage: StageId) => {
    setCurrentStage(stage);
    setActiveNavView(stage);
    if (stage === 'sensor_data') {
      sensorSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (stage === 'optimization') {
      optSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (stage === 'results') {
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownloadCsv = () => {
    if (!telemetry || telemetry.length === 0) return;

    const headers = [
      'timestamp',
      'day_index',
      'hour_of_day',
      'ambient_temp_c',
      'wind_speed_mps',
      'wind_gust_mps',
      'solar_ghi_wm2',
      'rel_humidity_pct',
      'station_load_kw',
      'wind_output_kw',
      'solar_output_kw',
      'renewable_total_kw',
      'baseline_gen_kw',
      'baseline_fuel_lph',
      'opt_gen1_kw',
      'opt_fuel_lph',
      'opt_bess_soc_pct',
      'opt_bess_power_kw',
      'opt_indoor_temp_c',
      'predicted_load_kw'
    ];

    const rows = telemetry.map(d => [
      d.timestamp,
      d.day_index + 1,
      d.hour_of_day.toFixed(2),
      d.ambient_temp_c,
      d.wind_speed_mps,
      d.wind_gust_mps,
      d.solar_ghi_wm2,
      d.rel_humidity_pct,
      d.station_load_kw,
      d.wind_output_kw,
      d.solar_output_kw,
      d.renewable_total_kw,
      d.baseline_gen_kw,
      d.baseline_fuel_lph,
      d.opt_gen1_kw,
      d.opt_fuel_lph,
      d.opt_bess_soc_pct,
      d.opt_bess_power_kw,
      d.opt_indoor_temp_c,
      d.predicted_load_kw
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dhruv_urja_bharati_${selectedDays}d_${intervalMinutes}m_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const textScaleClass = textSize === 'sm' ? 'text-scale-sm' : textSize === 'lg' ? 'text-scale-lg' : 'text-scale-md';

  return (
    <div className={`min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${textScaleClass} ${highContrast ? 'high-contrast' : ''}`}>
      {/* 1. Clean Government Header: Pure Logo Lockup & Essential Controls */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        textSize={textSize}
        onChangeTextSize={setTextSize}
        highContrast={highContrast}
        onToggleHighContrast={handleToggleHighContrast}
        onOpenProblemStatement={() => setIsProblemStatementOpen(true)}
      />

      {/* 2. Persistent Dual-Language Warning Banner */}
      <WarningBanner lang={lang} />

      {/* Printable Report Header (Visible only when printing/exporting PDF) */}
      <div className="hidden print:block p-6 border-b-2 border-slate-800">
        <div className="text-center space-y-1">
          <div className="text-xs uppercase tracking-widest font-bold">Government of India | Ministry of Earth Sciences (MoES) - Prototype Evaluation</div>
          <div className="text-lg font-black">National Centre for Polar and Ocean Research (NCPOR)</div>
          <div className="text-sm font-semibold">Bharati Antarctic Research Station (assumed example) (69°24'S, 76°11'E)</div>
          <div className="text-xs font-mono pt-1">Document Ref: DU-PROTO-26061 | Issue Date: 04 October 2026</div>
        </div>
        <div className="mt-4 p-2 border border-black text-xs font-bold text-center">
          {TRANSLATIONS.en.warning_banner_en}
          <br />
          {TRANSLATIONS.hi.warning_banner_hi}
        </div>
        {verifiedEntry && (
          <div className="mt-2 text-xs border border-slate-400 p-2 font-mono">
            <strong>Scientist Sign-Off:</strong> {verifiedEntry.verifiedByName} ({verifiedEntry.role}) | ID: {verifiedEntry.employeeId} | Timestamp: {verifiedEntry.timestamp}
          </div>
        )}
      </div>

      {/* 3. Main Workspace with SIDE TOOLBAR & Scrolling Canvas */}
      <div className="flex-1 flex flex-row w-full max-w-[1700px] mx-auto overflow-hidden">
        {/* SIDE TOOLBAR MENU */}
        <Sidebar
          activeView={activeNavView}
          onSelectView={handleSelectNavView}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          kpis={kpis}
          hasData={hasData}
          verifiedEntry={verifiedEntry}
          optProgress={optProgress}
          onDownloadPdf={handleDownloadPdf}
          onDownloadCsv={handleDownloadCsv}
          lang={lang}
        />

        {/* MAIN SCROLLABLE CONTENT BODY */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Slim 3-Stage Progress Strip */}
          <ProgressStrip
            currentStage={currentStage}
            onSelectStage={handleSelectStage}
            hasData={hasData}
            isVerified={verifiedEntry !== null}
            lang={lang}
          />

          <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-12">
            {/* STAGE 1: Sensor Data (Divided as 1hr, 30m, 2hr, 3hr and 1 day, 2 days, 15 days, 30 days) */}
            <div ref={sensorSectionRef} id="stage-sensors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A68] text-white flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                    Stage 1: {TRANSLATIONS[lang].stage_sensor_data}
                  </h2>
                </div>
                <div className="text-xs text-slate-500 font-mono hidden sm:block">
                  Division: {selectedDays} Days @ {intervalMinutes >= 60 ? `${intervalMinutes / 60}h` : `${intervalMinutes}m`}
                </div>
              </div>

              <StageSensorData
                telemetry={telemetry}
                kpis={kpis}
                tags={tags}
                isStreaming={isStreaming}
                hasData={hasData}
                verifiedEntry={verifiedEntry}
                intervalMinutes={intervalMinutes}
                onChangeInterval={handleChangeInterval}
                selectedDays={selectedDays}
                onChangeDays={handleChangeDays}
                onStartFeed={handleStartFeed}
                onRequestRunOptimization={handleRequestRunOptimization}
                lang={lang}
              />
            </div>

            {/* STAGE 2: Optimization and XGBoost (Side by Side) */}
            {(verifiedEntry !== null || currentStage === 'optimization' || currentStage === 'results' || activeNavView === 'optimization') && (
              <div ref={optSectionRef} id="stage-optimization" className="pt-6 border-t-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A68] text-white flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                    Stage 2: {TRANSLATIONS[lang].stage_optimization}
                  </h2>
                </div>

                <StageOptimization
                  telemetry={telemetry}
                  optProgress={optProgress}
                  isOptimizing={isOptimizing}
                  xgbMetrics={xgbMetrics}
                  onFinishOptimization={() => handleSelectStage('results')}
                  lang={lang}
                />
              </div>
            )}

            {/* STAGE 3: Results and Report */}
            {(optProgress >= 100 || activeNavView === 'results') && (
              <div ref={resultsSectionRef} id="stage-results" className="pt-6 border-t-2 border-slate-200 dark:border-slate-800 print-page-break">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A68] text-white flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                    Stage 3: {TRANSLATIONS[lang].stage_results_report}
                  </h2>
                </div>

                {kpis && (
                  <StageResults
                    telemetry={telemetry}
                    kpis={kpis}
                    plan24h={plan24h}
                    verifiedEntry={verifiedEntry}
                    onDownloadPdf={handleDownloadPdf}
                    onDownloadCsv={handleDownloadCsv}
                    lang={lang}
                  />
                )}
              </div>
            )}

            {/* DEDICATED SIDE MENU VIEW: Next 24-Hour Prediction & Advisory Plan */}
            <div ref={predictionSectionRef} id="stage-prediction" className="pt-6 border-t-2 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                  ★
                </span>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  {lang === 'hi' ? 'अगले 24 घंटे का पूर्वानुमान एवं परामर्श' : 'Next 24-Hour Microgrid Advisory Plan'}
                </h2>
              </div>

              <StageNext24Hours
                plan24h={plan24h}
                lang={lang}
                onDownloadPdf={handleDownloadPdf}
              />
            </div>
          </main>
        </div>
      </div>

      {/* 4. Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onConfirm={handleConfirmVerification}
        lang={lang}
      />

      {/* Problem Statement 26061 Details Modal */}
      <ProblemStatementModal
        isOpen={isProblemStatementOpen}
        onClose={() => setIsProblemStatementOpen(false)}
      />

      {/* 5. Accessible Information Modals */}
      <InfoModals
        activeModal={activeInfoModal}
        onClose={() => setActiveInfoModal(null)}
        lang={lang}
      />

      {/* 6. Government Footer */}
      <Footer
        lang={lang}
        onOpenModal={setActiveInfoModal}
      />
    </div>
  );
}
