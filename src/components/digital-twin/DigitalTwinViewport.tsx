import React, { useState, useRef } from 'react';
import { Well, TwinViewMode } from '../../types';
import { ThreeDigitalTwin } from './ThreeDigitalTwin';
import { SchematicPid } from './SchematicPid';
import { Maximize2, Minimize2, Play, Pause, Layers, Eye } from 'lucide-react';

interface DigitalTwinViewportProps {
  well: Well;
  view: TwinViewMode;
  onViewChange: (v: TwinViewMode) => void;
  paused: boolean;
  onTogglePause: () => void;
}

export const DigitalTwinViewport: React.FC<DigitalTwinViewportProps> = ({
  well,
  view,
  onViewChange,
  paused,
  onTogglePause
}) => {
  const [layers, setLayers] = useState<{ steam: boolean; prod: boolean; elec: boolean }>({
    steam: true,
    prod: true,
    elec: true
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
      setIsFullscreen(false);
    }
  };

  const toggleLayer = (layer: 'steam' | 'prod' | 'elec') => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div
      ref={containerRef}
      className={`panel flex-1 min-h-[320px] flex flex-col overflow-hidden relative ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Header bar */}
      <div className="panel-head">
        <div className="flex items-center gap-2">
          <h3>Live Well Digital Twin</h3>
          <span className="live-dot" />
        </div>
        <div className="flex items-center gap-2">
          <span className="tag text-teal font-semibold">{well.id}</span>
          <span className="tag">{well.pad}</span>
          <span className="tag font-mono text-cyan-400">{well.cycle} D{well.day}</span>

          {/* 3D vs P&ID toggles */}
          <div className="flex border border-[#243040] rounded overflow-hidden">
            <button
              onClick={() => onViewChange('3d')}
              className={`text-[9px] font-mono px-2 py-0.5 transition-colors ${
                view === '3d'
                  ? 'bg-teal/20 text-teal-300 font-semibold'
                  : 'bg-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              3D TWIN
            </button>
            <button
              onClick={() => onViewChange('pid')}
              className={`text-[9px] font-mono px-2 py-0.5 border-l border-[#243040] transition-colors ${
                view === 'pid'
                  ? 'bg-teal/20 text-teal-300 font-semibold'
                  : 'bg-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              P&amp;ID
            </button>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#243040] text-slate-400 hover:bg-white/5 transition-colors"
            title={paused ? 'Resume simulation' : 'Pause simulation'}
          >
            {paused ? (
              <>
                <Play size={10} className="text-emerald-400 fill-emerald-400" />
                <span>RESUME</span>
              </>
            ) : (
              <>
                <Pause size={10} className="text-amber-400 fill-amber-400" />
                <span>PAUSE</span>
              </>
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1 border border-[#243040] rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 min-h-[260px] scanline overflow-hidden bg-[#0a1016]">
        {view === '3d' ? (
          <ThreeDigitalTwin well={well} layers={layers} paused={paused} />
        ) : (
          <SchematicPid well={well} />
        )}

        {/* Sub-system Layer filter chips */}
        <div className="absolute top-2 left-2 flex gap-1 z-20">
          {(['steam', 'prod', 'elec'] as const).map((k) => (
            <button
              key={k}
              onClick={() => toggleLayer(k)}
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all ${
                layers[k]
                  ? 'border-cyan-500 text-cyan-300 bg-cyan-950/40 shadow-sm'
                  : 'border-[#243040] text-slate-600 bg-black/40'
              }`}
            >
              {k.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Bottom Orbit Help Caption */}
        <div className="absolute left-2 bottom-2 text-[9px] font-mono text-slate-500 pointer-events-none z-20 bg-black/40 px-1.5 py-0.5 rounded">
          BAGHEWALA · {well.pad} · {well.id} · {view === '3d' ? 'DRAG TO ORBIT · SCROLL ZOOM' : 'SCHEMATIC ELEVATION VIEW'}
        </div>
      </div>
    </div>
  );
};
