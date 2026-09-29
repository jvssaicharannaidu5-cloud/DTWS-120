import React from 'react';

interface FooterProps {
  paused: boolean;
}

export const Footer: React.FC<FooterProps> = ({ paused }) => {
  return (
    <footer className="h-8 shrink-0 border-t border-[#243040] bg-[#0c1118] flex items-center gap-4 px-3 text-[10px] font-mono text-slate-500 overflow-x-auto whitespace-nowrap z-20">
      <span className="text-teal-400 font-semibold flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        <span>TELEMETRY 124 Hz</span>
      </span>
      <span>SENSORS 847/852 OK</span>
      <span className="text-emerald-400 font-semibold">HISTORIAN CONNECTED</span>
      <span>OPC-UA / DA</span>
      <span>MQTT / Sparkplug B</span>
      <span>PI AF · Baghewala_Wells</span>
      
      <span className="ml-auto text-slate-400 hidden sm:inline">
        UPTIME 47d 12h 08m
      </span>
      <span className="hidden md:inline">PKT LOSS 0.02%</span>
      <span className="font-semibold text-slate-400">
        RENDER {paused ? 'HOLD' : 'LIVE'}
      </span>
      <span className="text-slate-600 hidden lg:inline">
        DTW-SOP v4.7.1 · CLASSIFICATION: INTERNAL · ENG DEMO
      </span>
    </footer>
  );
};
