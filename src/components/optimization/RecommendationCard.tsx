import React from 'react';
import { Well } from '../../types';
import { Sparkles, Check, Clock } from 'lucide-react';

interface RecommendationCardProps {
  well: Well;
  recAccepted: boolean;
  onApplyRec: () => void;
  onSnooze: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  well,
  recAccepted,
  onApplyRec,
  onSnooze
}) => {
  return (
    <div
      className="panel p-2.5 border-teal-700/50 relative overflow-hidden"
      style={{ boxShadow: '0 0 24px rgba(46, 230, 199, 0.1)' }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-teal-300" />
          <h3 className="text-[10px] tracking-[0.16em] uppercase text-teal-300 font-semibold m-0">
            AI Recommendation Engine
          </h3>
        </div>
        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40">
          CONF 86%
        </span>
      </div>

      <p className="text-[12px] leading-snug text-slate-200 m-0">
        Increase <span className="font-mono text-teal-300 font-semibold">{well.id}</span> SPM from{' '}
        {well.spm.toFixed(1)} → <span className="font-mono text-teal-300 font-semibold">6.8</span>.
        Hold surface choke at 24/64". Defer CSS steam cycle by 14 days to maximize cold production sweep.
      </p>

      {/* Impact Indicators */}
      <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-center">
        <div className="bg-inset rounded p-1.5 border border-[#243040]">
          <div className="text-[8px] text-slate-500 font-mono uppercase">OIL GAIN</div>
          <div className="font-mono text-teal-300 text-[12px] font-semibold">+8.4 bbl/d</div>
        </div>
        <div className="bg-inset rounded p-1.5 border border-[#243040]">
          <div className="text-[8px] text-slate-500 font-mono uppercase">FILLAGE</div>
          <div className="font-mono text-emerald-400 text-[12px] font-semibold">+6.0%</div>
        </div>
        <div className="bg-inset rounded p-1.5 border border-[#243040]">
          <div className="text-[8px] text-slate-500 font-mono uppercase">TARGET SOR</div>
          <div className="font-mono text-amber-400 text-[12px] font-semibold">0.00</div>
        </div>
      </div>

      {/* Button Actions */}
      <div className="flex gap-2 mt-2.5">
        <button
          disabled={recAccepted}
          onClick={onApplyRec}
          className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-mono py-1.5 rounded font-semibold transition-all ${
            recAccepted
              ? 'bg-teal-900/40 text-teal-400 border border-teal-600/50 cursor-default'
              : 'bg-teal-400 text-black hover:bg-teal-300 active:scale-[0.99] shadow-lg shadow-teal-500/20'
          }`}
        >
          <Check size={12} />
          <span>{recAccepted ? 'APPLIED TO SIMULATION' : 'ACCEPT & WRITE'}</span>
        </button>

        <button
          onClick={onSnooze}
          className="flex items-center justify-center gap-1 text-[10px] font-mono px-2.5 rounded border border-[#243040] text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          title="Snooze recommendation for 4 hours"
        >
          <Clock size={11} />
          <span>SNOOZE</span>
        </button>
      </div>
    </div>
  );
};
