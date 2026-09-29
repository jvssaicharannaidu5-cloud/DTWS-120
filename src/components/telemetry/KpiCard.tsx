import React from 'react';

interface KpiCardProps {
  tag: string;
  label: string;
  value: string | number;
  unit: string;
  tone?: 'teal' | 'cyan' | 'green' | 'amber' | 'red' | 'white';
  sub?: string;
  trend?: 'up' | 'down' | 'flat';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  tag,
  label,
  value,
  unit,
  tone = 'teal',
  sub
}) => {
  const tones = {
    teal: 'text-teal-300',
    cyan: 'text-cyan-300',
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-rose-400',
    white: 'text-slate-100'
  };

  return (
    <div className="panel px-3 py-2 min-w-0 transition-colors hover:border-slate-700">
      <div className="flex items-center justify-between mb-1">
        <span className="tag">{tag}</span>
        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-medium truncate ml-1">
          {label}
        </span>
      </div>
      <div className={`kpi-val text-xl font-semibold font-mono leading-none tracking-tight ${tones[tone]}`}>
        {value}
        <span className="text-[10px] ml-1 text-slate-500 font-medium">{unit}</span>
      </div>
      {sub && (
        <div className="text-[10px] text-slate-500 mt-1 font-mono truncate">
          {sub}
        </div>
      )}
    </div>
  );
};
