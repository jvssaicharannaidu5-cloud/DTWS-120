import React from 'react';
import { Well, FieldConfig } from '../../types';
import { fmt } from '../../data/wells';
import { getStatusColor } from '../../utils/formatting';
import { MapPin, Target } from 'lucide-react';

interface FieldOverviewProps {
  wells: Well[];
  selectedId: string;
  field: FieldConfig;
  onSelectWell: (wellId: string) => void;
}

export const FieldOverview: React.FC<FieldOverviewProps> = ({
  wells,
  selectedId,
  field,
  onSelectWell
}) => {
  const fieldRate = wells.reduce((s, w) => s + w.rate, 0);
  const fieldSteam = wells.reduce((s, w) => s + w.steam, 0);
  const critN = wells.filter((w) => w.status === 'critical').length;
  const attainment = (fieldRate / Math.max(1, field.target)) * 100;

  return (
    <div className="panel flex flex-col min-h-[160px] overflow-hidden">
      {/* Header with live totals */}
      <div className="panel-head">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-teal-400" />
          <h3>Field Overview · {field.name}</h3>
        </div>
        <span className="text-[9px] font-mono text-teal-300 font-semibold">
          {fmt(fieldRate, 0)} bbl/d · {fmt(fieldSteam, 0)} CWE
        </span>
      </div>

      {/* Field Map Schematic */}
      <div className="relative flex-1 min-h-[140px] grid-bg m-2 border border-[#243040] rounded overflow-hidden bg-[#080d12]">
        <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full">
          {/* North compass indicator */}
          <text x="4" y="8" fill="#6b7c90" fontSize="3.2" fontFamily="IBM Plex Mono" fontWeight="600">
            N
          </text>
          <path d="M4 12 L4 6 L2.5 8 M4 6 L5.5 8" stroke="#6b7c90" fill="none" strokeWidth="0.4" />

          {/* Heavy Oil Reservoir Sub-surface Structural Outline */}
          <path
            d="M8 20 C 30 10, 55 18, 92 22 S 90 70, 20 72 Z"
            fill="rgba(46,230,199,0.04)"
            stroke="#1a8f7c"
            strokeWidth="0.4"
            strokeDasharray="1 1"
          />

          {/* Fault line trace */}
          <path
            d="M12 45 Q 45 40 85 55"
            fill="none"
            stroke="#f5a623"
            strokeWidth="0.3"
            strokeDasharray="0.8 1.2"
            opacity="0.6"
          />

          {/* Wells as Clickable Nodes */}
          {wells.map((w) => {
            const isSelected = selectedId === w.id;
            const statusConfig = getStatusColor(w.status);

            return (
              <g
                key={w.id}
                onClick={() => onSelectWell(w.id)}
                className="cursor-pointer group"
              >
                {/* Glow ring for selected well */}
                {isSelected && (
                  <circle
                    cx={w.x}
                    cy={w.y}
                    r="4.2"
                    fill="none"
                    stroke="#2ee6c7"
                    strokeWidth="0.4"
                    className="animate-pulse"
                  />
                )}

                {/* Well head point */}
                <circle
                  cx={w.x}
                  cy={w.y}
                  r={isSelected ? 2.6 : 1.8}
                  fill={statusConfig.color}
                  stroke="#07090c"
                  strokeWidth="0.4"
                  className="transition-all"
                />

                {/* Well ID Label */}
                <text
                  x={w.x + 2.2}
                  y={w.y + 1}
                  fill={isSelected ? '#2ee6c7' : '#9aa8b8'}
                  fontSize="2.5"
                  fontFamily="IBM Plex Mono"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {w.id.replace('BGW-', '')}
                </text>
              </g>
            );
          })}

          {/* Geology context caption */}
          <text x="4" y="76" fill="#4b5c70" fontSize="2.6" fontFamily="IBM Plex Mono">
            THAR MARGIN · NAGAUR SUB-BASIN · HEAVY OIL 14–18° API
          </text>
        </svg>
      </div>

      {/* Field Aggregation KPI Bar */}
      <div className="px-2 pb-2 grid grid-cols-4 gap-1 text-center text-[9px] font-mono">
        <div className="bg-inset rounded py-1 border border-[#243040]">
          <span className="text-slate-500">WELLS</span>
          <br />
          <span className="text-slate-100 font-semibold">{wells.length}</span>
        </div>
        <div className="bg-inset rounded py-1 border border-[#243040]">
          <span className="text-slate-500">CRITICAL</span>
          <br />
          <span className="text-rose-400 font-semibold">{critN}</span>
        </div>
        <div className="bg-inset rounded py-1 border border-[#243040]">
          <span className="text-slate-500">TARGET</span>
          <br />
          <span className="text-slate-100 font-semibold">{field.target}</span>
        </div>
        <div className="bg-inset rounded py-1 border border-[#243040]">
          <span className="text-slate-500">ATTAIN</span>
          <br />
          <span className="text-teal-300 font-semibold">{fmt(attainment, 0)}%</span>
        </div>
      </div>
    </div>
  );
};
