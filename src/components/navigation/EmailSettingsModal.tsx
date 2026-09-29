import React, { useState, useEffect } from 'react';
import {
  emailClient,
  EmailSettings,
  EmailStatusResponse,
  EmailLogEntry
} from '../../services/emailClient';
import {
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  RotateCw,
  Send,
  Shield,
  FileText,
  AlertTriangle,
  Flame,
  Activity,
  Cpu,
  Radio,
  Sliders,
  X
} from 'lucide-react';

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPushToast: (msg: string, tone?: 'ok' | 'warn' | 'crit') => void;
  fieldSummaryData?: any;
}

export const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  isOpen,
  onClose,
  onPushToast,
  fieldSummaryData
}) => {
  const [statusData, setStatusData] = useState<EmailStatusResponse | null>(null);
  const [settings, setSettings] = useState<EmailSettings>({
    enabled: true,
    recipientEmail: 'jvssaicharannaidu5@gmail.com',
    criticalAlerts: true,
    pumpAlerts: true,
    steamAlerts: true,
    aiRecommendations: true,
    cssSchedule: true,
    telemetryAlerts: true,
    dailySummary: true
  });
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'outbox'>('settings');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingDigest, setIsSendingDigest] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const st = await emailClient.getStatus();
      setStatusData(st);
      if (st.settings) {
        setSettings(st.settings);
      }
      const lg = await emailClient.getLogs();
      setLogs(lg);
    } catch (err) {
      console.warn('Failed to load email settings:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = async (key: keyof EmailSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    const res = await emailClient.updateSettings(updated);
    if (res.success) {
      onPushToast(`Setting updated: ${key} = ${updated[key] ? 'ENABLED' : 'DISABLED'}`);
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setSettings((s) => ({ ...s, recipientEmail: newEmail }));
  };

  const handleSaveEmail = async () => {
    const res = await emailClient.updateSettings({ recipientEmail: settings.recipientEmail });
    if (res.success) {
      onPushToast(`Recipient updated to ${settings.recipientEmail}`);
      loadData();
    } else {
      onPushToast('Failed to update recipient', 'warn');
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    onPushToast('Email notification queued...', 'ok');
    try {
      const res = await emailClient.sendTestEmail(settings.recipientEmail);
      if (res.success) {
        onPushToast('Email notification sent (Test Verification)', 'ok');
        loadData();
      } else {
        onPushToast(`Email delivery failed: ${res.error || 'Unknown error'}`, 'crit');
      }
    } catch (err: any) {
      onPushToast(`Email delivery failed: ${err.message}`, 'crit');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendDailyDigest = async () => {
    setIsSendingDigest(true);
    onPushToast('Generating and queuing daily field summary...', 'ok');
    try {
      const res = await emailClient.sendDailyDigest(fieldSummaryData || {});
      if (res.success) {
        onPushToast('Daily summary digest sent successfully', 'ok');
        loadData();
      } else {
        onPushToast(res.reason || 'Failed to dispatch daily summary', 'warn');
      }
    } catch (err: any) {
      onPushToast(`Digest failed: ${err.message}`, 'crit');
    } finally {
      setIsSendingDigest(false);
    }
  };

  const handleRetryEmail = async (id: string) => {
    setRetryingId(id);
    onPushToast(`Retrying email dispatch ${id}...`, 'ok');
    try {
      const res = await emailClient.retryEmail(id);
      if (res.success) {
        onPushToast('Email retry dispatched successfully', 'ok');
        loadData();
      } else {
        onPushToast(`Retry failed: ${res.error || 'Server error'}`, 'crit');
      }
    } catch (err: any) {
      onPushToast(`Retry error: ${err.message}`, 'crit');
    } finally {
      setRetryingId(null);
    }
  };

  const isConnected = statusData?.status === 'CONNECTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="panel w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-slate-700">
        {/* Modal Header */}
        <div className="panel-head py-3 px-4 flex items-center justify-between border-b border-[#243040]">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-teal-400" />
            <div className="leading-tight">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-slate-100 m-0">
                Email Automation &amp; Notification Engine
              </h2>
              <div className="text-[10px] font-mono text-slate-500">
                Baghewala SCADA Bus · Multi-Event Alert Dispatcher
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-[#0c1016] border-b border-[#243040] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">EMAIL SERVICE:</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                isConnected
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                  : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
              }`}
            >
              {isConnected ? <CheckCircle size={10} /> : <XCircle size={10} />}
              {statusData?.status || 'CONNECTED'} ({statusData?.serviceMode?.toUpperCase() || 'SIMULATION'})
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <div>
              <span className="text-slate-500">SENT TODAY:</span>{' '}
              <span className="text-teal-300 font-semibold">{statusData?.emailsSentToday ?? 0}</span>
            </div>
            <div>
              <span className="text-slate-500">FAILED:</span>{' '}
              <span className="text-rose-400 font-semibold">{statusData?.failedEmails ?? 0}</span>
            </div>
            <div>
              <span className="text-slate-500">LAST SENT:</span>{' '}
              <span className="text-slate-200">
                {statusData?.lastEmail ? new Date(statusData.lastEmail).toLocaleTimeString() : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#243040] bg-[#10151c] px-4 pt-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2 px-3 text-xs font-mono font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            AUTOMATION SETTINGS
          </button>
          <button
            onClick={() => setActiveTab('outbox')}
            className={`pb-2 px-3 text-xs font-mono font-medium border-b-2 transition-colors ${
              activeTab === 'outbox'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            DISPATCH OUTBOX LOGS ({logs.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 flex-1 overflow-y-auto hide-scroll space-y-4">
          {activeTab === 'settings' ? (
            <>
              {/* Master Toggle & Recipient Input */}
              <div className="panel p-3 space-y-3 bg-[#0c1016]">
                <div className="flex items-center justify-between pb-2 border-b border-[#243040]">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      Enable Email Automation
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Master switch for simulated and live operational dispatch
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('enabled')}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 border ${
                      settings.enabled
                        ? 'bg-teal-500 border-teal-400'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform ${
                        settings.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Target Notification Email */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    TARGET NOTIFICATION EMAIL RECIPIENT
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={settings.recipientEmail}
                      onChange={handleEmailChange}
                      placeholder="operator@domain.com"
                      className="flex-1 bg-inset border border-[#243040] rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-teal-500/70 outline-none"
                    />
                    <button
                      onClick={handleSaveEmail}
                      className="px-3 py-1.5 rounded bg-teal-400/20 border border-teal-400 text-teal-300 hover:bg-teal-400/30 text-xs font-mono font-semibold transition-colors"
                    >
                      SAVE
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Configured in server environment as primary alert destination.
                  </div>
                </div>
              </div>

              {/* Supported Event Toggles */}
              <div className="panel p-3 bg-[#0c1016]">
                <div className="text-xs font-semibold text-slate-200 mb-2 font-mono flex items-center gap-1.5">
                  <Sliders size={13} className="text-teal-400" />
                  <span>SUPPORTED NOTIFICATION TRIGGERS</span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* 1. Critical Well Alert */}
                  <div className="flex items-center justify-between py-1.5 border-b border-[#243040]/50">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-rose-400" />
                      <div>
                        <div className="text-slate-200">Critical Well Alert</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Trigger when well enters CRITICAL status
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.criticalAlerts}
                      onChange={() => handleToggle('criticalAlerts')}
                      className="accent-teal-400 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* 2. Pump Load Anomaly */}
                  <div className="flex items-center justify-between py-1.5 border-b border-[#243040]/50">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-amber-400" />
                      <div>
                        <div className="text-slate-200">Pump Load &amp; Fillage Anomaly</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Trigger on fluid pound or load deviation
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.pumpAlerts}
                      onChange={() => handleToggle('pumpAlerts')}
                      className="accent-teal-400 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* 3. Steam Pressure Alert */}
                  <div className="flex items-center justify-between py-1.5 border-b border-[#243040]/50">
                    <div className="flex items-center gap-2">
                      <Flame size={14} className="text-orange-400" />
                      <div>
                        <div className="text-slate-200">Steam Injection Pressure Alert</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Trigger when CSS boiler/header pressure is abnormal
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.steamAlerts}
                      onChange={() => handleToggle('steamAlerts')}
                      className="accent-teal-400 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* 4. AI Optimization Recommendation */}
                  <div className="flex items-center justify-between py-1.5 border-b border-[#243040]/50">
                    <div className="flex items-center gap-2">
                      <Cpu size={14} className="text-cyan-400" />
                      <div>
                        <div className="text-slate-200">AI Optimization Recommendation</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Email when recommendation provides &gt;5% uplift
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.aiRecommendations}
                      onChange={() => handleToggle('aiRecommendations')}
                      className="accent-teal-400 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* 5. CSS Schedule Reminder */}
                  <div className="flex items-center justify-between py-1.5 border-b border-[#243040]/50">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-amber-300" />
                      <div>
                        <div className="text-slate-200">CSS Cycle Stage Reminders</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Notify for upcoming inject, soak, and produce transitions
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.cssSchedule}
                      onChange={() => handleToggle('cssSchedule')}
                      className="accent-teal-400 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* 6. Telemetry Connection Alert */}
                  <div className="flex items-center justify-between py-1.5 border-b border-[#243040]/50">
                    <div className="flex items-center gap-2">
                      <Radio size={14} className="text-emerald-400" />
                      <div>
                        <div className="text-slate-200">Telemetry Bus Disconnect Alert</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Notify when SCADA telemetry stream pauses/disconnects
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.telemetryAlerts}
                      onChange={() => handleToggle('telemetryAlerts')}
                      className="accent-teal-400 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* 7. Daily Field Summary Digest */}
                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-teal-300" />
                      <div>
                        <div className="text-slate-200">Daily Field Operations Digest</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          End-of-shift field production and anomaly compilation
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.dailySummary}
                      onChange={() => handleToggle('dailySummary')}
                      className="accent-teal-400 w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Test Email & Manual Digest */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  disabled={isSendingTest}
                  onClick={handleSendTestEmail}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded bg-teal-400 text-black font-semibold text-xs font-mono hover:bg-teal-300 transition-colors disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>{isSendingTest ? 'SENDING TEST...' : 'SEND TEST EMAIL'}</span>
                </button>

                <button
                  disabled={isSendingDigest}
                  onClick={handleSendDailyDigest}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded border border-teal-600/60 bg-teal-950/30 text-teal-300 font-semibold text-xs font-mono hover:bg-teal-900/40 transition-colors disabled:opacity-50"
                >
                  <FileText size={13} />
                  <span>{isSendingDigest ? 'GENERATING...' : 'DISPATCH DAILY SUMMARY NOW'}</span>
                </button>
              </div>

              {/* Security Banner */}
              <div className="p-2.5 rounded bg-[#0c1016] border border-[#243040] text-[10px] font-mono text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
                  <Shield size={12} />
                  <span>SECURITY &amp; SUPPRESSION ACTIVE</span>
                </div>
                <div>
                  • Credentials protected server-side via environment variables (never in frontend bundle).
                </div>
                <div>
                  • Duplicate alert suppression window: <strong>15 minutes cooldown</strong> per well &amp; anomaly.
                </div>
                <div>
                  • Hourly throttle: Maximum <strong>60 notifications/hour</strong>.
                </div>
              </div>
            </>
          ) : (
            /* Outbox Activity Logs */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1">
                <span>RECENT DISPATCHED MESSAGES ({logs.length})</span>
                <button
                  onClick={loadData}
                  className="flex items-center gap-1 hover:text-teal-300 transition-colors"
                >
                  <RotateCw size={11} />
                  <span>REFRESH</span>
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="panel p-6 text-center text-slate-500 font-mono text-xs">
                  No automated emails dispatched yet. Click "Send Test Email" to generate a record.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {logs.map((log) => {
                    const isSuccess = log.status === 'DELIVERED' || log.status === 'SIMULATED_DELIVERY';
                    const isRetrying = retryingId === log.id;

                    return (
                      <div
                        key={log.id}
                        className="panel p-2.5 bg-[#0c1016] border-[#243040] space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                              isSuccess
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                            }`}
                          >
                            {log.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString()} · {log.to}
                          </span>
                        </div>

                        <div className="font-semibold text-slate-200 text-xs">
                          {log.subject}
                        </div>

                        {log.preview && (
                          <div className="text-[10px] text-slate-400 font-mono line-clamp-2 bg-black/40 p-1.5 rounded">
                            {log.preview}
                          </div>
                        )}

                        {log.error && (
                          <div className="text-[10px] text-rose-400 font-mono bg-rose-950/30 p-1.5 rounded border border-rose-900/50">
                            Error: {log.error}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-500">
                          <span>TYPE: {log.eventType} {log.wellId ? `(${log.wellId})` : ''}</span>
                          <button
                            disabled={isRetrying}
                            onClick={() => handleRetryEmail(log.id)}
                            className="text-teal-400 hover:text-teal-300 font-semibold px-2 py-0.5 rounded border border-teal-800/50 hover:bg-teal-900/30 transition-colors disabled:opacity-50"
                          >
                            {isRetrying ? 'RETRYING...' : 'RETRY DISPATCH'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="panel-head py-2.5 px-4 flex justify-between items-center border-t border-[#243040]">
          <span className="text-[10px] font-mono text-slate-500">
            DTW-SOP v4.7.1 · SIMULATED TELEMETRY NOTIFICATION SYSTEM
          </span>
          <button
            onClick={onClose}
            className="text-xs font-mono py-1 px-4 rounded border border-[#243040] hover:bg-white/5 text-slate-300 transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
