import React, { useState } from 'react';
import { CSSStage } from '../../types';
import { clamp } from '../../data/wells';
import { Flame, Edit3, Check } from 'lucide-react';

interface CssSchedulerProps {
  stages: CSSStage[];
  onSelectWell: (wellId: string) => void;
  onUpdateStage: (updated: CSSStage[]) => void;
  onPushToast: (msg: string, tone?: 'ok' | 'warn' | 'crit') => void;
}

export const CssScheduler: React.FC<CssSchedulerProps> = ({
  stages,
  onSelectWell,
  onUpdateStage,
  onPushToast
}) => {
  const [editingWell, setEditingWell] = useState<string | null>(null);

  const nudgeProgress = (index: number) => {
    const updated = stages.map((x, j) => {
      if (j === index) {
        const nextProgress = x.progress >= 1 ? 0.05 : clamp(x.progress + 0.05, 0, 1);
        return { ...x, progress: nextProgress };
      }
      return x;
    });
    onUpdateStage(updated);
    onPushToast(`${stages[index].well} CSS cycle stage nudged to ${(stages[index].progress * 100).toFixed(0)}%`);
  };

  const cycleStageType = (index: number) => {
    const stageOrder: CSSStage['stage'][] = ['INJECT', 'SOAK', 'PRODUCE', 'MONITOR', 'SHUT-IN'];
    const current = stages[index].stage;
    const nextIdx = (stageOrder.indexOf(current) + 1) % stageOrder.length;
    const nextStage = stageOrder[nextIdx];

    const colors: Record<string, string> = {
      INJECT: '#fb923c',
      SOAK: '#f5a623',
      PRODUCE: '#2ee6c7',
      MONITOR: '#22d3ee',
      'SHUT-IN': '#64748b'
    };

    const updated = stages.map((x, j) => {
      if (j === index) {
        return {
          ...x,
          stage: nextStage,
          color: colors[nextStage] || '#2ee6c7',
          progress: 0.1
        };
      }
      return x;
    });

    onUpdateStage(updated);
    onPushToast(`${stages[index].well} transitioned to ${nextStage} stage`);
  };

  return (
    <div className="panel flex flex-col min-h-[160px] overflow-hidden">
      <div className="panel-head">
        <div className="flex items-center gap-1.5">
          <Flame size={12} className="text-amber-400" />
          <h3>CSS Steam Stimulation Scheduler</h3>
        </div>
        <span className="text-[9px] font-mono text-slate-500">
          CYCLIC STEAM · 40-DAY DESIGN
        </span>
      </div>

      <div className="p-2 flex-1 flex flex-col justify-between">
        {/* Stage Timeline Legend */}
        <div className="flex text-[8px] font-mono text-slate-500 mb-1.5 px-0.5">
          <span className="w-16">WELL</span>
          <div className="flex-1 flex justify-between px-2">
            <span className="text-orange-400">INJECT (0-6d)</span>
            <span className="text-amber-400">SOAK (6-10d)</span>
            <span className="text-teal-400">PRODUCE (10-40d)</span>
          </div>
        </div>

        {/* Stage Bars */}
        <div className="space-y-1.5">
          {stages.map((c, i) => (
            <div key={c.well} className="flex items-center gap-2 group">
              <button
                onClick={() => onSelectWell(c.well)}
                className="w-16 text-left text-[10px] font-mono text-slate-300 hover:text-teal-300 flex items-center justify-between"
                title={`Select ${c.well}`}
              >
                <span>{c.well}</span>
              </button>

              <div
                className="flex-1 h-4 bg-inset border border-[#243040] rounded-sm overflow-hidden relative cursor-pointer group-hover:border-slate-600 transition-colors"
                onClick={() => nudgeProgress(i)}
                title="Click to advance stage progress"
              >
                {/* Progress bar fill */}
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-300"
                  style={{
                    width: `${Math.round(c.progress * 100)}%`,
                    backgroundColor: c.color,
                    opacity: 0.85
                  }}
                />

                {/* Stage Text overlay */}
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono tracking-wider font-semibold text-white drop-shadow-sm select-none">
                  {c.stage} {Math.round(c.progress * 100)}%
                </span>
              </div>

              {/* Stage toggle action */}
              <button
                onClick={() => cycleStageType(i)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-amber-400 text-[8px] font-mono border border-[#243040] rounded px-1 transition-opacity"
                title="Cycle to next stage"
              >
                NEXT
              </button>
            </div>
          ))}
        </div>

        <div className="mt-2 text-[9px] font-mono text-slate-500 flex justify-between pt-1 border-t border-[#243040]/50">
          <span>TOTAL STEAM POOL: 4,200 CWE bbl/d</span>
          <span>ALLOCATED: 1,840 CWE (43.8%)</span>
        </div>
      </div>
    </div>
  );
};
