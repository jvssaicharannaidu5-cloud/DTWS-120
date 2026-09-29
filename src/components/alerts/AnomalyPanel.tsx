import React from 'react';
import { Alert } from '../../types';
import { getSeverityColor } from '../../utils/formatting';
import { AlertTriangle, Check, Search } from 'lucide-react';

interface AnomalyPanelProps {
  alerts: Alert[];
  onFocusWell: (wellId: string) => void;
  onAcknowledge: (alertId: number) => void;
  onInvestigate?: (alert: Alert) => void;
}

export const AnomalyPanel: React.FC<AnomalyPanelProps> = ({
  alerts,
  onFocusWell,
  onAcknowledge,
  onInvestigate
}) => {
  return (
    <div className="panel flex flex-col overflow-hidden">
      <div className="panel-head">
        <div className="flex items-center gap-2">
          <AlertTriangle size={12} className="text-amber-400" />
          <h3>AI Insights · Anomaly Detection</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-dot amber" />
          <span className="text-[9px] font-mono text-slate-400">{alerts.length} ACTIVE</span>
        </div>
      </div>

      <div className="max-h-52 overflow-y-auto divide-y divide-[#243040] hide-scroll">
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-slate-500 font-mono text-[11px]">
            ✓ No operational anomalies detected. Well operating within normal envelope.
          </div>
        ) : (
          alerts.map((a) => {
            const color = getSeverityColor(a.sev);

            return (
              <div key={a.id} className="p-2 transition-colors hover:bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded"
                    style={{ color, background: `${color}22` }}
                  >
                    {a.sev}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    <strong className="text-slate-300">{a.well}</strong> · {a.ts} · {a.conf}% CONF
                  </span>
                </div>

                <div className="text-[12px] font-medium mt-1 text-slate-100 leading-snug">
                  {a.title}
                </div>

                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                  {a.detail}
                </div>

                {a.action && (
                  <div className="text-[9px] font-mono text-teal-400 mt-1 flex items-center gap-1">
                    <span className="text-slate-500">ACTION:</span> {a.action}
                  </div>
                )}

                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => onFocusWell(a.well)}
                    className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 border border-cyan-700/80 text-cyan-300 rounded hover:bg-cyan-900/30 transition-colors"
                  >
                    <Search size={10} />
                    <span>FOCUS</span>
                  </button>

                  <button
                    onClick={() => onAcknowledge(a.id)}
                    className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 border border-[#243040] text-slate-400 rounded hover:bg-white/5 transition-colors"
                  >
                    <Check size={10} />
                    <span>ACK</span>
                  </button>

                  {onInvestigate && (
                    <button
                      onClick={() => onInvestigate(a)}
                      className="text-[9px] font-mono px-2 py-0.5 border border-[#243040] text-slate-400 rounded hover:text-slate-200 transition-colors"
                    >
                      DETAILS
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
