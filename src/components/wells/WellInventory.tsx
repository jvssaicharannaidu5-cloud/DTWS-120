import React from 'react';
import { Well, WellStatus } from '../../types';
import { Sparkline } from './Sparkline';
import { fmt } from '../../data/wells';
import { getStatusColor } from '../../utils/formatting';
import { Search, AlertCircle, X } from 'lucide-react';

interface WellInventoryProps {
  wells: Well[];
  selectedId: string;
  onSelectWell: (id: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  filter: string;
  setFilter: (f: string) => void;
  sort: string;
  setSort: (s: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const WellInventory: React.FC<WellInventoryProps> = ({
  wells,
  selectedId,
  onSelectWell,
  isOpenMobile,
  onCloseMobile,
  filter,
  setFilter,
  sort,
  setSort,
  searchQuery,
  setSearchQuery
}) => {
  const filtered = wells
    .filter((w) => (filter === 'all' ? true : w.status === filter))
    .filter(
      (w) =>
        w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.pad.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'rate') return b.rate - a.rate;
      if (sort === 'alerts') return b.alerts - a.alerts;
      if (sort === 'status') return a.status.localeCompare(b.status);
      return a.id.localeCompare(b.id);
    });

  return (
    <aside
      className={`${
        isOpenMobile ? 'fixed z-50 inset-y-0 left-0 shadow-2xl w-80' : 'hidden'
      } xl:flex xl:relative flex-col w-72 shrink-0 border-r border-[#243040] bg-[#0c1118] h-full overflow-hidden`}
    >
      {/* Sidebar Header */}
      <div className="panel-head">
        <h3>Well Inventory</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500">
            {filtered.length}/{wells.length}
          </span>
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="xl:hidden p-0.5 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-2 space-y-2 border-b border-[#243040]/50">
        <div className="flex items-center gap-1.5 bg-inset border border-[#243040] rounded px-2 h-7 focus-within:border-teal-500/60 transition-colors">
          <Search size={12} className="text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wells / pads"
            className="w-full bg-transparent text-[11px] outline-none text-slate-200 placeholder:text-slate-600"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1">
          {['all', 'active', 'optimizing', 'purging', 'critical', 'offline'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border transition-colors ${
                filter === s
                  ? 'border-teal-400 text-teal-300 bg-teal-950/30 font-medium'
                  : 'border-[#243040] text-slate-500 hover:text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
          <span>SORT BY</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-inset border border-[#243040] rounded text-[10px] px-1.5 py-0.5 text-slate-300 outline-none cursor-pointer"
          >
            <option value="id">Well ID</option>
            <option value="rate">Production Rate</option>
            <option value="status">Operating Status</option>
            <option value="alerts">Anomaly Alerts</option>
          </select>
        </div>
      </div>

      {/* Well Cards List */}
      <div className="flex-1 overflow-y-auto hide-scroll px-2 py-2 space-y-1.5">
        {filtered.map((w) => {
          const st = getStatusColor(w.status);
          const isSelected = selectedId === w.id;

          return (
            <button
              key={w.id}
              onClick={() => {
                onSelectWell(w.id);
                onCloseMobile();
              }}
              className={`well-card w-full text-left panel p-2 cursor-pointer transition-all ${
                isSelected ? 'active border-teal shadow-md shadow-teal/5' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[12px] font-semibold text-slate-100">
                    {w.id}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">({w.pad})</span>
                </div>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded font-medium"
                  style={{ color: st.color, background: st.bg }}
                >
                  {st.label}
                </span>
              </div>

              {/* Telemetry snippet */}
              <div className="mt-1.5 grid grid-cols-4 gap-1 text-[9px] font-mono text-slate-400">
                <div>η {fmt(w.pumpEff, 0)}%</div>
                <div className="text-teal-300 font-semibold">{fmt(w.rate, 0)} bbl</div>
                <div>{fmt(w.thp, 0)} psi</div>
                <div>{fmt(w.temp, 0)}°C</div>
              </div>

              {/* Sparkline & Alert Badge */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#243040]/40">
                <Sparkline data={w.spark} color={st.color} />
                {w.alerts > 0 ? (
                  <span className="flex items-center gap-0.5 text-[9px] text-amber-400 font-mono font-semibold">
                    <AlertCircle size={10} />
                    <span>{w.alerts}</span>
                  </span>
                ) : (
                  <span className="text-[8px] text-slate-600 font-mono">NOMINAL</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
