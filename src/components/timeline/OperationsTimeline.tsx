import React from 'react';
import { EventItem } from '../../types';
import { getSeverityColor } from '../../utils/formatting';
import { Activity } from 'lucide-react';

interface OperationsTimelineProps {
  events: EventItem[];
}

export const OperationsTimeline: React.FC<OperationsTimelineProps> = ({ events }) => {
  return (
    <div className="panel flex flex-col min-h-[160px] overflow-hidden">
      <div className="panel-head">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-teal-400" />
          <h3>Operations Timeline</h3>
        </div>
        <span className="live-dot" />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 divide-y divide-[#1a2430] hide-scroll max-h-[160px]">
        {events.map((e, i) => {
          const color = getSeverityColor(e.sev);

          return (
            <div key={i} className="flex items-start gap-2 py-1.5 text-[11px] transition-colors hover:bg-white/[0.02]">
              <span className="font-mono text-slate-500 w-14 shrink-0 text-[10px] pt-0.5">
                {e.t}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-slate-300 leading-snug break-words">
                {e.msg}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
