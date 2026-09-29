import React, { useState, useMemo } from 'react';
import { Well, TimeRange } from '../../types';
import { LineChart, ChartSeries } from './LineChart';
import { DynoCard } from './DynoCard';

interface AnalyticsWorkspaceProps {
  well: Well;
}

export const AnalyticsWorkspace: React.FC<AnalyticsWorkspaceProps> = ({ well }) => {
  const [activeTab, setActiveTab] = useState<'stroke' | 'dyno' | 'steam' | 'forecast'>('stroke');
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');

  const hours = useMemo(() => {
    switch (timeRange) {
      case '1H':
        return ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50', '15:00'];
      case '6H':
        return ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
      case '7D':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case '30D':
        return ['D1', 'D5', 'D10', 'D15', 'D20', 'D25', 'D30'];
      case '24H':
      default:
        return Array.from({ length: 13 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);
    }
  }, [timeRange]);

  // Stroke / Load time series
  const strokeSeries = useMemo<ChartSeries[]>(() => {
    const strokeLen = well.stroke || 144;
    const baseLoad = well.pumpLoad || 68.4;
    const n = hours.length;

    const pos = hours.map((_, i) => strokeLen * 0.5 + Math.sin(i / 1.2) * (strokeLen * 0.45));
    const load = hours.map(
      (_, i) =>
        baseLoad +
        Math.cos(i / 1.4) * 6 +
        (well.status === 'critical' ? Math.sin(i * 2) * 8 : 0)
    );

    return [
      { name: 'Displacement (in)', data: pos, fill: true },
      { name: 'Polished Rod Load (kN)', data: load, fill: false }
    ];
  }, [well, hours]);

  // Steam / CSS cycle series
  const steamSeries = useMemo<ChartSeries[]>(() => {
    return [
      {
        name: 'Steam Inject (CWE bbl/d)',
        data: [0, 200, 900, 1600, 1840, 1840, 1200, 400, 0, 0, 0, 0, 0],
        fill: true
      },
      {
        name: 'Oil Lift (bbl/d)',
        data: [150, 148, 40, 18, 8, 6, 10, 28, 90, 160, 170, 155, 142],
        fill: true
      }
    ];
  }, []);

  // Production forecast series
  const forecastSeries = useMemo<ChartSeries[]>(() => {
    const base = well.rate;
    const actualData = hours.map((_, i) =>
      i < Math.floor(hours.length / 2) ? base + Math.sin(i) * 3 : null
    );
    const aiBaseData = hours.map((_, i) => base + Math.sin(i * 0.5) * 4);
    const optimizedData = hours.map((_, i) =>
      i >= Math.floor(hours.length / 2) - 1 ? base + (i * 1.5) + 6 : base + Math.sin(i * 0.5) * 4
    );

    return [
      { name: 'Historical Actual', data: actualData, fill: false },
      { name: 'AI Baseline Model', data: aiBaseData, fill: true },
      { name: 'Optimized Prediction', data: optimizedData, fill: false }
    ];
  }, [well, hours]);

  return (
    <div className="panel h-[210px] flex flex-col overflow-hidden">
      {/* Tab bar header */}
      <div className="panel-head">
        <div className="flex items-center gap-2">
          <h3>Predictive Analytics Workspace</h3>
          <span className="tag text-teal">{well.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Type Tabs */}
          <div className="flex gap-1">
            {[
              ['stroke', 'STROKE / LOAD'],
              ['dyno', 'DYNAMOMETER'],
              ['steam', 'STEAM / CSS'],
              ['forecast', 'PRODUCTION FCST']
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setActiveTab(k as any)}
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                  activeTab === k
                    ? 'border-teal-400 text-teal-300 bg-teal-950/30'
                    : 'border-[#243040] text-slate-500 hover:text-slate-300'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Time range selector */}
          <div className="hidden sm:flex items-center border border-[#243040] rounded overflow-hidden">
            {(['1H', '6H', '24H', '7D', '30D'] as TimeRange[]).map((tr) => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`text-[9px] font-mono px-1.5 py-0.5 transition-colors ${
                  timeRange === tr
                    ? 'bg-teal/20 text-teal-300 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 min-h-0 px-2 py-1 relative">
        {activeTab === 'stroke' && (
          <LineChart
            series={strokeSeries}
            labels={hours}
            colors={['#2ee6c7', '#f5a623']}
          />
        )}
        {activeTab === 'dyno' && <DynoCard well={well} />}
        {activeTab === 'steam' && (
          <LineChart
            series={steamSeries}
            labels={[
              'D0',
              'D2',
              'D4',
              'D6',
              'D8',
              'D10',
              'D12',
              'D14',
              'D16',
              'D18',
              'D20',
              'D22',
              'D24'
            ]}
            colors={['#fb923c', '#2ee6c7']}
          />
        )}
        {activeTab === 'forecast' && (
          <LineChart
            series={forecastSeries}
            labels={hours}
            colors={['#94a3b8', '#22d3ee', '#34d399']}
          />
        )}
      </div>
    </div>
  );
};
