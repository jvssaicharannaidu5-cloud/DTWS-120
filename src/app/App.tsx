import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Well, OptimizationControls, CSSStage, Alert, EventItem, TwinViewMode } from '../types';
import { INITIAL_WELLS, jitter, clamp } from '../data/wells';
import { FIELD } from '../data/field';
import { INITIAL_AI_ALERTS } from '../data/alerts';
import { INITIAL_EVENTS } from '../data/events';
import { INITIAL_CSS_STAGES } from '../data/cssCycles';
import { formatTimeIST } from '../utils/formatting';
import { calculateSimulation } from '../services/simulationService';
import { emailClient, TriggerAlertPayload } from '../services/emailClient';
import { TopNav } from '../components/navigation/TopNav';
import { WellInventory } from '../components/wells/WellInventory';
import { DigitalTwinViewport } from '../components/digital-twin/DigitalTwinViewport';
import { KpiGrid } from '../components/telemetry/KpiGrid';
import { AnalyticsWorkspace } from '../components/analytics/AnalyticsWorkspace';
import { AnomalyPanel } from '../components/alerts/AnomalyPanel';
import { OptimizationPanel } from '../components/optimization/OptimizationPanel';
import { RecommendationCard } from '../components/optimization/RecommendationCard';
import { CssScheduler } from '../components/scheduler/CssScheduler';
import { FieldOverview } from '../components/field/FieldOverview';
import { OperationsTimeline } from '../components/timeline/OperationsTimeline';
import { Footer } from '../components/layout/Footer';
import { ToastContainer, ToastItem } from '../components/layout/ToastContainer';
import { EmailSettingsModal } from '../components/navigation/EmailSettingsModal';
import { AriseVoiceModal } from '../components/voice/AriseVoiceModal';
import { MinimizedCallBar } from '../components/voice/MinimizedCallBar';
import {
  millisVoiceService,
  VoiceSessionState,
  VoiceContextPayload
} from '../services/millisVoiceService';

export const App: React.FC = () => {
  // 1. Core State
  const [wells, setWells] = useState<Well[]>(INITIAL_WELLS);
  const [selectedId, setSelectedId] = useState<string>('BGW-004'); // PRD Default
  const [filter, setFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('id');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(new Date());
  const [paused, setPaused] = useState<boolean>(false);
  const [twinView, setTwinView] = useState<TwinViewMode>('3d');

  // Optimization Parameters State
  const [spmSet, setSpmSet] = useState<number>(5.8);
  const [chokeSet, setChokeSet] = useState<number>(24);
  const [steamSet, setSteamSet] = useState<number>(0);
  const [freqSet, setFreqSet] = useState<number>(41.2);

  // Dynamic Lists
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [aiAlerts, setAiAlerts] = useState<Alert[]>(INITIAL_AI_ALERTS);
  const [cssStages, setCssStages] = useState<CSSStage[]>(INITIAL_CSS_STAGES);
  const [recAccepted, setRecAccepted] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [health] = useState<number>(98.6);

  // Email Automation State
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [emailAutomationActive, setEmailAutomationActive] = useState<boolean>(true);

  // Arise Voice Assistant State
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [voiceMinimized, setVoiceMinimized] = useState<boolean>(false);
  const [voiceState, setVoiceState] = useState<VoiceSessionState>(millisVoiceService.getState());
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [voiceCallDuration, setVoiceCallDuration] = useState<number>(0);
  const [voiceMicAnalyser, setVoiceMicAnalyser] = useState<AnalyserNode | null>(null);
  const [voiceSpeakerAnalyser, setVoiceSpeakerAnalyser] = useState<AnalyserNode | null>(null);

  // Subscribe to Millis Voice Agent lifecycle
  useEffect(() => {
    const unsub = millisVoiceService.subscribe({
      onStateChange: (newState) => {
        setVoiceState(newState);
        setIsVoiceMuted(millisVoiceService.getIsMuted());
        if (newState === 'ENDED' || newState === 'IDLE') {
          setVoiceMinimized(false);
        }
      },
      onMicAnalyserReady: setVoiceMicAnalyser,
      onSpeakerAnalyserReady: setVoiceSpeakerAnalyser
    });
    return unsub;
  }, []);

  // Voice Call Duration Timer
  useEffect(() => {
    let timer: any = null;
    const isCallActive =
      voiceState === 'CONNECTED' ||
      voiceState === 'LISTENING' ||
      voiceState === 'USER_SPEAKING' ||
      voiceState === 'PROCESSING' ||
      voiceState === 'ARISE_SPEAKING' ||
      voiceState === 'MUTED';

    if (isCallActive) {
      timer = setInterval(() => {
        setVoiceCallDuration((prev) => prev + 1);
      }, 1000);
    } else if (voiceState === 'ENDED' || voiceState === 'IDLE') {
      setVoiceCallDuration(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [voiceState]);

  // Active well reference
  const well = useMemo(() => {
    return wells.find((w) => w.id === selectedId) || wells[3] || wells[0];
  }, [wells, selectedId]);

  // Sync optimization controls when selected well changes
  useEffect(() => {
    setSpmSet(well.spm || 5.8);
    setSteamSet(well.steam || 0);
    setChokeSet(well.status === 'critical' ? 18 : 24);
    setFreqSet(41.2);
    setRecAccepted(false);
  }, [selectedId]);

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast Push Helper
  const pushToast = useCallback((msg: string, tone: 'ok' | 'warn' | 'crit' = 'ok') => {
    const id = Date.now();
    setToasts((ts) => [...ts, { id, msg, tone }]);
    setTimeout(() => {
      setToasts((ts) => ts.filter((x) => x.id !== id));
    }, 3400);
  }, []);

  // Fetch initial email settings to check active state
  useEffect(() => {
    emailClient.getStatus().then((st) => {
      if (st.settings) {
        setEmailAutomationActive(st.settings.enabled);
      }
    });
  }, []);

  // Automated Email Trigger Helper
  const dispatchAutomatedEmail = useCallback(
    async (payload: TriggerAlertPayload) => {
      if (!emailAutomationActive) return;

      pushToast('Email notification queued...', 'ok');
      try {
        const res = await emailClient.triggerAlert(payload);
        if (res.success) {
          pushToast(`Email notification sent: ${payload.title}`, 'ok');
        } else if (res.skipped) {
          console.log(`[Email Automation] ${res.reason}`);
        } else if (res.error) {
          pushToast(`Email delivery failed: ${res.error}`, 'crit');
        }
      } catch (err: any) {
        pushToast(`Email delivery failed: ${err.message}`, 'crit');
      }
    },
    [emailAutomationActive, pushToast]
  );

  // Live Telemetry Simulation Loop
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setWells((ws) =>
        ws.map((w) => {
          if (w.status === 'offline') return w;

          const rate = clamp(
            jitter(w.rate, w.status === 'critical' ? 3.5 : 1.2),
            0,
            240
          );
          const thp = clamp(jitter(w.thp, 4), 10, 500);
          const temp = clamp(jitter(w.temp, 0.6), 30, 190);
          const pumpEff =
            w.status === 'purging'
              ? w.pumpEff
              : clamp(jitter(w.pumpEff, 0.5), 15, 98);
          const fillage = w.spm ? clamp(jitter(w.fillage, 0.7), 20, 99) : 0;
          const pumpLoad = w.pumpLoad
            ? clamp(jitter(w.pumpLoad, 0.8), 20, 100)
            : 68.4;

          const lastSpark = w.spark[w.spark.length - 1];
          const newSparkVal = clamp(
            lastSpark + (Math.random() - 0.48) * 8,
            8,
            95
          );
          const spark = [...w.spark.slice(1), Math.round(newSparkVal * 10) / 10];

          // Trigger email on critical condition if fillage or load trips
          if (w.status === 'critical' && fillage < 45 && Math.random() < 0.08) {
            dispatchAutomatedEmail({
              eventType: 'CRITICAL_WELL',
              wellId: w.id,
              title: `Critical Pump Fillage Collapse on ${w.id}`,
              severity: 'CRITICAL',
              confidence: 94,
              parameter: 'Dynamometer Card Fillage',
              currentValue: `${fillage.toFixed(0)}% fillage (${pumpLoad.toFixed(1)} kN load)`,
              threshold: '< 50% fillage',
              recommendedAction: 'Throttle SPM or verify casing gas venting to avoid rod string parting'
            });
          }

          return {
            ...w,
            rate: Math.round(rate * 10) / 10,
            thp: Math.round(thp),
            temp: Math.round(temp * 10) / 10,
            pumpEff: Math.round(pumpEff * 10) / 10,
            fillage: Math.round(fillage),
            pumpLoad: Math.round(pumpLoad * 10) / 10,
            spark
          };
        })
      );
    }, 1600);

    return () => clearInterval(interval);
  }, [paused, dispatchAutomatedEmail]);

  // Derived Simulation Calculation
  const controls: OptimizationControls = useMemo(
    () => ({
      spm: spmSet,
      choke: chokeSet,
      steam: steamSet,
      freq: freqSet,
      stroke: well.stroke || 144,
      cycleDuration: 40,
      soakDays: 4
    }),
    [spmSet, chokeSet, steamSet, freqSet, well.stroke]
  );

  const simulation = useMemo(() => {
    return calculateSimulation(well, controls);
  }, [well, controls]);

  const { time: currentTimeStr, date: currentDateStr } = useMemo(
    () => formatTimeIST(now),
    [now]
  );

  // Field Summary Data for Daily Digest
  const fieldSummaryData = useMemo(() => {
    const totalProduction = wells.reduce((s, w) => s + w.rate, 0);
    const totalSteam = wells.reduce((s, w) => s + w.steam, 0);
    const activeWells = wells.filter((w) => w.status === 'active' || w.status === 'optimizing').length;
    const criticalWells = wells.filter((w) => w.status === 'critical').length;
    const validEffs = wells.filter((w) => w.status !== 'offline').map((w) => w.pumpEff);
    const avgEff = validEffs.length > 0 ? (validEffs.reduce((a, b) => a + b, 0) / validEffs.length).toFixed(1) + '%' : '0%';

    return {
      dateStr: currentDateStr,
      totalWells: wells.length,
      activeWells,
      criticalWells,
      avgEfficiency: avgEff,
      totalProduction: `${totalProduction.toFixed(1)} bbl/d`,
      steamInjection: `${totalSteam.toFixed(0)} CWE bbl/d`,
      majorAlerts: aiAlerts.slice(0, 3).map((a) => `${a.well}: ${a.title}`),
      aiRecommendations: [
        'BGW-004: Increase SPM to 6.8 for +8.4 bbl/d lift uplift',
        'BGW-002: Adjust choke to 26/64" to stabilize wellhead THP'
      ]
    };
  }, [wells, aiAlerts, currentDateStr]);

  // Handlers
  const handleSelectWell = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleTogglePause = useCallback(() => {
    setPaused((prev) => {
      const next = !prev;
      if (next) {
        // Paused -> alert telemetry disconnect
        dispatchAutomatedEmail({
          eventType: 'TELEMETRY_CONNECTION',
          wellId: 'SCADA_BUS',
          title: 'Simulated Telemetry Stream Paused by Operator',
          severity: 'WARNING',
          confidence: 99,
          parameter: 'OPC-UA Tag Bus',
          currentValue: 'STREAM HOLD / PAUSED',
          threshold: 'Continuous Stream Required',
          recommendedAction: 'Resume live telemetry stream via console top bar'
        });
      }
      return next;
    });
  }, [dispatchAutomatedEmail]);

  const handleApplyRec = useCallback(() => {
    setRecAccepted(true);
    setSpmSet(6.8);
    setWells((ws) =>
      ws.map((w) => (w.id === well.id ? { ...w, spm: 6.8, status: 'optimizing' } : w))
    );
    setEvents((ev) => [
      {
        t: currentTimeStr,
        sev: 'ok',
        msg: `${well.id} AI recommendation applied — SPM adjusted to 6.8 (Simulated)`
      },
      ...ev
    ]);
    pushToast('Setpoint written to SCADA bus (Simulated)');

    // Trigger AI Recommendation Email
    dispatchAutomatedEmail({
      eventType: 'AI_RECOMMENDATION',
      wellId: well.id,
      title: `AI Recommendation Applied on ${well.id}`,
      severity: 'INFO',
      confidence: 86,
      metrics: {
        currentEfficiency: `${well.pumpEff.toFixed(1)}%`,
        predictedEfficiency: `${(well.pumpEff + 6.2).toFixed(1)}%`,
        currentProduction: `${well.rate.toFixed(1)} bbl/d`,
        predictedProduction: `${(well.rate + 8.4).toFixed(1)} bbl/d`,
        energyImpact: '-4.2 kWh/day (-3.1%)'
      },
      recommendationText: `Increase SPM from ${well.spm} → 6.8. Hold choke at 24/64". Defer CSS steam cycle by 14 days.`
    });
  }, [well, currentTimeStr, pushToast, dispatchAutomatedEmail]);

  const handleWriteScada = useCallback(() => {
    setWells((ws) =>
      ws.map((w) =>
        w.id === well.id
          ? {
              ...w,
              spm: spmSet,
              steam: steamSet,
              rate: simulation.predictedRate,
              pumpEff: simulation.predictedEff
            }
          : w
      )
    );
    setEvents((ev) => [
      {
        t: currentTimeStr,
        sev: 'info',
        msg: `${well.id} setpoints downloaded · SPM ${spmSet.toFixed(1)} · Choke ${chokeSet}/64 · Steam ${steamSet} CWE`
      },
      ...ev
    ]);
    pushToast('DOWNLOAD COMPLETE · RTU ACKNOWLEDGED', 'ok');
  }, [well.id, spmSet, steamSet, chokeSet, simulation, currentTimeStr, pushToast]);

  const handleResetControls = useCallback(() => {
    setSpmSet(well.spm || 5.8);
    setSteamSet(well.steam || 0);
    setChokeSet(24);
    setFreqSet(41.2);
    pushToast('Optimization parameters reset to telemetry baseline');
  }, [well, pushToast]);

  const handleAcknowledgeAlert = useCallback(
    (alertId: number) => {
      setAiAlerts((prev) => prev.filter((a) => a.id !== alertId));
      pushToast('Alert acknowledged & filed in historian');
    },
    [pushToast]
  );

  // Context for Arise Voice Assistant
  const voiceContext: VoiceContextPayload = useMemo(() => {
    return {
      selectedWellId: well.id,
      wellStatus: well.status.toUpperCase(),
      pumpEfficiency: `${well.pumpEff.toFixed(1)}%`,
      productionRate: `${well.rate.toFixed(1)} m³/d`,
      steamPressure: `${(well.steam || well.thp).toFixed(1)} bar`,
      steamTemperature: `${well.temp.toFixed(1)}°C`,
      activeAlerts: aiAlerts.map((a) => `${a.well}: ${a.title} (${a.sev})`),
      recommendations: [
        'Kinematic trim: adjust SPM to 5.2 to reduce gas interference',
        'CSS cycle: steam soaking duration scheduled for 48 hours'
      ],
      cssStage: cssStages[0]?.stage || 'PRODUCE',
      fieldStatus: 'Normal Field Operations'
    };
  }, [well, aiAlerts, cssStages]);

  const handleOpenVoice = () => {
    setVoiceMinimized(false);
    setVoiceModalOpen(true);
  };

  const handleMinimizeVoice = () => {
    setVoiceModalOpen(false);
    setVoiceMinimized(true);
  };

  const handleExpandVoice = () => {
    setVoiceMinimized(false);
    setVoiceModalOpen(true);
  };

  const handleCloseVoice = () => {
    setVoiceModalOpen(false);
    setVoiceMinimized(false);
  };

  const handleVoiceToggleMute = () => {
    const muted = millisVoiceService.toggleMute();
    setIsVoiceMuted(muted);
  };

  const handleVoiceEndCall = async () => {
    await millisVoiceService.endCall();
    setVoiceModalOpen(false);
    setVoiceMinimized(false);
  };

  const formatVoiceDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dash-shell h-screen flex flex-col bg-void text-slate-200 overflow-hidden select-none">
      {/* 1. TOP NAVIGATION */}
      <TopNav
        field={FIELD}
        currentTimeStr={currentTimeStr}
        currentDateStr={currentDateStr}
        alerts={aiAlerts}
        health={health}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFocusWell={handleSelectWell}
        userEmail="jvssaicharannaidu5@gmail.com"
        onOpenEmailSettings={() => setEmailModalOpen(true)}
        emailAutomationActive={emailAutomationActive}
        onOpenVoiceAssistant={handleOpenVoice}
        voiceState={voiceState}
      />

      {/* 2. BODY CONTAINER */}
      <div className="flex-1 min-h-0 flex relative">
        {/* Left Well Inventory Sidebar */}
        <WellInventory
          wells={wells}
          selectedId={selectedId}
          onSelectWell={handleSelectWell}
          isOpenMobile={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          filter={filter}
          setFilter={setFilter}
          sort={sort}
          setSort={setSort}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Main Operational Dashboard Content */}
        <main className="flex-1 min-w-0 overflow-auto xl:overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-2 p-2">
            {/* LEFT / CENTER COLUMN (Col 8): Digital Twin + Telemetry + Analytics */}
            <section className="xl:col-span-8 flex flex-col gap-2 min-h-0">
              {/* Digital Twin Viewport */}
              <DigitalTwinViewport
                well={well}
                view={twinView}
                onViewChange={setTwinView}
                paused={paused}
                onTogglePause={handleTogglePause}
              />

              {/* Real-time Telemetry KPI Grid */}
              <KpiGrid well={well} />

              {/* Predictive Analytics Workspace */}
              <AnalyticsWorkspace well={well} />
            </section>

            {/* RIGHT COLUMN (Col 4): AI Anomaly Detection + Optimization Controls + Recommendations */}
            <section className="xl:col-span-4 flex flex-col gap-2 min-h-0 overflow-y-auto hide-scroll">
              {/* AI Anomaly Detection */}
              <AnomalyPanel
                alerts={aiAlerts}
                onFocusWell={handleSelectWell}
                onAcknowledge={handleAcknowledgeAlert}
              />

              {/* Simulation Optimization Control Panel */}
              <OptimizationPanel
                well={well}
                controls={controls}
                onChangeControls={(c) => {
                  setSpmSet(c.spm);
                  setChokeSet(c.choke);
                  setSteamSet(c.steam);
                  setFreqSet(c.freq);
                }}
                simulation={simulation}
                onWriteScada={handleWriteScada}
                onReset={handleResetControls}
              />

              {/* AI Recommendation Engine */}
              <RecommendationCard
                well={well}
                recAccepted={recAccepted}
                onApplyRec={handleApplyRec}
                onSnooze={() => pushToast('Recommendation snoozed for 4 hours', 'warn')}
              />
            </section>

            {/* BOTTOM SECTION (Col 12 subdivided into 3 cards of Col 4 each) */}
            {/* CSS Scheduler */}
            <section className="xl:col-span-4">
              <CssScheduler
                stages={cssStages}
                onSelectWell={handleSelectWell}
                onUpdateStage={setCssStages}
                onPushToast={pushToast}
              />
            </section>

            {/* Field Overview */}
            <section className="xl:col-span-4">
              <FieldOverview
                wells={wells}
                selectedId={selectedId}
                field={FIELD}
                onSelectWell={handleSelectWell}
              />
            </section>

            {/* Operations Timeline */}
            <section className="xl:col-span-4">
              <OperationsTimeline events={events} />
            </section>
          </div>
        </main>
      </div>

      {/* 3. INDUSTRIAL STATUS FOOTER */}
      <Footer paused={paused} />

      {/* 4. TOAST CONTAINER */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((ts) => ts.filter((x) => x.id !== id))}
      />

      {/* 5. EMAIL AUTOMATION & SETTINGS MODAL */}
      <EmailSettingsModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onPushToast={pushToast}
        fieldSummaryData={fieldSummaryData}
      />

      {/* 6. ARISE VOICE ASSISTANT MODAL */}
      <AriseVoiceModal
        isOpen={voiceModalOpen}
        onClose={handleCloseVoice}
        onMinimize={handleMinimizeVoice}
        contextData={voiceContext}
      />

      {/* 7. MINIMIZED VOICE CALL BAR */}
      {voiceMinimized && (
        <MinimizedCallBar
          state={voiceState}
          callDurationStr={formatVoiceDuration(voiceCallDuration)}
          isMuted={isVoiceMuted}
          micAnalyser={voiceMicAnalyser}
          speakerAnalyser={voiceSpeakerAnalyser}
          onToggleMute={handleVoiceToggleMute}
          onExpand={handleExpandVoice}
          onEndCall={handleVoiceEndCall}
        />
      )}
    </div>
  );
};

export default App;
