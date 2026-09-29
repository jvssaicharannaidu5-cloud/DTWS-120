/**
 * MinimizedCallBar.tsx
 * Floating, dockable control-room call strip active when Arise voice session is minimized.
 * Keeps live waveform, mic controls, duration timer, and expand button accessible.
 */

import React from 'react';
import { VoiceSessionState } from '../../services/millisVoiceService';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';
import { Mic, MicOff, PhoneOff, Maximize2, Radio } from 'lucide-react';

interface MinimizedCallBarProps {
  state: VoiceSessionState;
  callDurationStr: string;
  isMuted: boolean;
  micAnalyser: AnalyserNode | null;
  speakerAnalyser: AnalyserNode | null;
  onToggleMute: () => void;
  onExpand: () => void;
  onEndCall: () => void;
}

export const MinimizedCallBar: React.FC<MinimizedCallBarProps> = ({
  state,
  callDurationStr,
  isMuted,
  micAnalyser,
  speakerAnalyser,
  onToggleMute,
  onExpand,
  onEndCall
}) => {
  const isSpeaking = state === 'ARISE_SPEAKING';
  const currentAnalyser = isSpeaking ? speakerAnalyser : micAnalyser;

  let statusBadge = (
    <span className="flex items-center gap-1.5 text-xs font-mono text-[#20D6C7]">
      <span className="w-2 h-2 rounded-full bg-[#20D6C7] animate-ping" />
      LISTENING
    </span>
  );

  if (state === 'ARISE_SPEAKING') {
    statusBadge = (
      <span className="flex items-center gap-1.5 text-xs font-mono text-[#37E6FF]">
        <span className="w-2 h-2 rounded-full bg-[#37E6FF] animate-pulse" />
        ARISE SPEAKING
      </span>
    );
  } else if (state === 'PROCESSING') {
    statusBadge = (
      <span className="flex items-center gap-1.5 text-xs font-mono text-[#F6C453]">
        <span className="w-2 h-2 rounded-full bg-[#F6C453] animate-pulse" />
        PROCESSING
      </span>
    );
  } else if (isMuted) {
    statusBadge = (
      <span className="flex items-center gap-1.5 text-xs font-mono text-[#FF5C5C]">
        <span className="w-2 h-2 rounded-full bg-[#FF5C5C]" />
        MUTED
      </span>
    );
  }

  return (
    <div
      role="region"
      aria-label="Minimized Voice Call"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-4 px-4 py-2.5 bg-[#10161A]/95 border border-[#26343B] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all duration-300 hover:border-[#20D6C7]/50 select-none max-w-[94vw]"
    >
      {/* 1. Identity & Timer */}
      <button
        onClick={onExpand}
        className="flex items-center gap-2.5 text-left focus:outline-none group"
        title="Click to expand call modal"
      >
        <div className="w-8 h-8 rounded-full bg-[#151D22] border border-[#20D6C7]/40 flex items-center justify-center text-[#20D6C7] group-hover:border-[#20D6C7]">
          <Radio className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs tracking-wider text-[#F5F7F8]">ARISE</span>
            <span className="text-[11px] font-mono text-[#78858D]">{callDurationStr}</span>
          </div>
          <div className="text-[11px]">{statusBadge}</div>
        </div>
      </button>

      {/* 2. Mini Waveform Display */}
      <div
        onClick={onExpand}
        className="w-24 h-7 bg-[#080B0D]/70 rounded-md border border-[#26343B]/60 cursor-pointer overflow-hidden flex items-center justify-center hover:border-[#20D6C7]/30"
        title="Expand full audio visualizer"
      >
        <AudioWaveformVisualizer
          analyser={currentAnalyser}
          state={state}
          isMuted={isMuted}
          height={28}
          barCount={14}
          compact
        />
      </div>

      {/* 3. Action Buttons */}
      <div className="flex items-center gap-1.5 border-l border-[#26343B] pl-3">
        {/* Mic Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          className={`p-2 rounded-xl border transition-all ${
            isMuted
              ? 'bg-[#FF5C5C]/15 border-[#FF5C5C]/50 text-[#FF5C5C] hover:bg-[#FF5C5C]/25'
              : 'bg-[#151D22] border-[#26343B] text-[#20D6C7] hover:border-[#20D6C7] hover:bg-[#1A252C]'
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Expand Modal */}
        <button
          onClick={onExpand}
          title="Expand call modal"
          className="p-2 rounded-xl bg-[#151D22] border border-[#26343B] text-[#B7C1C7] hover:text-[#F5F7F8] hover:border-[#20D6C7] transition-all"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* End Call */}
        <button
          onClick={onEndCall}
          title="End voice call"
          className="p-2 rounded-xl bg-[#FF5C5C]/15 border border-[#FF5C5C]/40 text-[#FF5C5C] hover:bg-[#FF5C5C] hover:text-[#080B0D] transition-all"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
