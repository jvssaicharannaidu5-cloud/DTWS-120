import React from 'react';
import { Well, OptimizationControls, SimulationResult } from '../../types';
import { fmt } from '../../data/wells';
import { Sliders, RotateCcw, Send } from 'lucide-react';

interface OptimizationPanelProps {
  well: Well;
  controls: OptimizationControls;
  onChangeControls: (controls: OptimizationControls) => void;
  simulation: SimulationResult;
  onWriteScada: () => void;
  onReset: () => void;
}

export const OptimizationPanel: React.FC<OptimizationPanelProps> = ({
  well,
  controls,
  onChangeControls,
  simulation,
  onWriteScada,
  onReset
}) => {
  const updateField = (field: keyof OptimizationControls, val: number) => {
    onChangeControls({
      ...controls,
      [field]: val
    });
  };

  const deltaQ = simulation.deltaRate;
  const isPosDelta = deltaQ >= 0;

  return (
    <div className="panel p-2 flex flex-col gap-2">
      <div className="panel-head -mx-2 -mt-2 mb-1">
        <div className="flex items-center gap-1.5">
          <Sliders size={12} className="text-teal-400" />
          <h3>Optimization Control Panel</h3>
        </div>
        <span className="text-[9px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
          SIMULATED WRITE
        </span>
      </div>

      {/* SPM Slider */}
      <div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
          <span>SPM Setpoint (Stroke/min)</span>
          <span className="font-mono text-teal-300 font-semibold">{fmt(controls.spm, 1)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={controls.spm}
          onChange={(e) => updateField('spm', parseFloat(e.target.value))}
        />
      </div>

      {/* Choke Slider */}
      <div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
          <span>Surface Choke Size (/64")</span>
          <span className="font-mono text-teal-300 font-semibold">{controls.choke}</span>
        </div>
        <input
          type="range"
          min="8"
          max="48"
          step="1"
          value={controls.choke}
          onChange={(e) => updateField('choke', parseInt(e.target.value, 10))}
        />
      </div>

      {/* Steam CWE Slider */}
      <div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
          <span>Steam Injection CWE (bbl/d)</span>
          <span className="font-mono text-amber-400 font-semibold">{fmt(controls.steam, 0)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="2500"
          step="10"
          value={controls.steam}
          onChange={(e) => updateField('steam', parseInt(e.target.value, 10))}
        />
      </div>

      {/* VFD Frequency Slider */}
      <div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
          <span>VFD Drive Frequency (Hz)</span>
          <span className="font-mono text-cyan-300 font-semibold">{fmt(controls.freq, 1)}</span>
        </div>
        <input
          type="range"
          min="20"
          max="60"
          step="0.1"
          value={controls.freq}
          onChange={(e) => updateField('freq', parseFloat(e.target.value))}
        />
      </div>

      {/* Live Impact Preview Cards */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mt-1">
        <div className="bg-inset border border-[#243040] rounded p-1.5">
          <div className="text-[9px] text-slate-500">ESTIMATED Δ Q</div>
          <div className={`font-semibold text-[12px] ${isPosDelta ? 'text-teal-300' : 'text-rose-400'}`}>
            {isPosDelta ? '+' : ''}
            {fmt(deltaQ, 1)} bbl/d
          </div>
          <div className="text-[8px] text-slate-500">
            Pred: {fmt(simulation.predictedRate, 1)} bbl/d
          </div>
        </div>

        <div className="bg-inset border border-[#243040] rounded p-1.5">
          <div className="text-[9px] text-slate-500">PREDICTED η</div>
          <div className="font-semibold text-emerald-400 text-[12px]">
            {fmt(simulation.predictedEff, 1)}%
          </div>
          <div className="text-[8px] text-slate-500">
            Δ η: {simulation.deltaEff >= 0 ? '+' : ''}{fmt(simulation.deltaEff, 1)}%
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={onWriteScada}
          className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-wider py-1.5 rounded bg-teal-400/20 border border-teal-400 text-teal-200 hover:bg-teal-400/30 transition-all font-semibold"
        >
          <Send size={11} />
          <span>WRITE SETPOINTS</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1 text-[10px] font-mono px-2 py-1.5 rounded border border-[#243040] text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          title="Reset to current telemetry values"
        >
          <RotateCcw size={11} />
          <span>RESET</span>
        </button>
      </div>
    </div>
  );
};
