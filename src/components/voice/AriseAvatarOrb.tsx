/**
 * AriseAvatarOrb.tsx
 * Industrial circular AI orb with telemetry-inspired concentric rings,
 * state-reactive glow, and orbital status transitions for Arise Voice Assistant.
 */

import React from 'react';
import { VoiceSessionState } from '../../services/millisVoiceService';
import { Mic, Radio, Cpu, Volume2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AriseAvatarOrbProps {
  state: VoiceSessionState;
  isMuted?: boolean;
  size?: 'normal' | 'compact';
}

export const AriseAvatarOrb: React.FC<AriseAvatarOrbProps> = ({
  state,
  isMuted = false,
  size = 'normal'
}) => {
  const isCompact = size === 'compact';
  const diameter = isCompact ? 'w-16 h-16' : 'w-32 h-32 md:w-36 md:h-36';

  // State flags
  const isSpeaking = state === 'ARISE_SPEAKING';
  const isListening = state === 'LISTENING' || state === 'USER_SPEAKING';
  const isProcessing = state === 'PROCESSING';
  const isError = state === 'ERROR';
  const isConnecting = state === 'CONNECTING' || state === 'RECONNECTING';

  // Orb styling classes
  let glowColor = 'shadow-[0_0_24px_rgba(32,214,199,0.25)]';
  let ringColor = 'border-[#20D6C7]/30';
  let coreBg = 'bg-gradient-to-br from-[#10161A] via-[#151D22] to-[#0A0E11]';
  let pulseAnimation = '';

  if (isError) {
    glowColor = 'shadow-[0_0_35px_rgba(255,92,92,0.45)]';
    ringColor = 'border-[#FF5C5C]/50';
    coreBg = 'bg-gradient-to-br from-[#1A1010] via-[#221515] to-[#110A0A]';
  } else if (isSpeaking) {
    glowColor = 'shadow-[0_0_45px_rgba(55,230,255,0.65)]';
    ringColor = 'border-[#37E6FF]/80';
    pulseAnimation = 'animate-pulse';
  } else if (isProcessing) {
    glowColor = 'shadow-[0_0_35px_rgba(246,196,83,0.5)]';
    ringColor = 'border-[#F6C453]/60';
  } else if (isListening) {
    glowColor = 'shadow-[0_0_32px_rgba(32,214,199,0.5)]';
    ringColor = 'border-[#20D6C7]/60';
  } else if (isMuted) {
    glowColor = 'shadow-[0_0_20px_rgba(255,92,92,0.25)]';
    ringColor = 'border-[#FF5C5C]/30';
  }

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* 1. Outer Concentric Telemetry Ring */}
      <div
        className={`absolute rounded-full border border-dashed transition-all duration-700 pointer-events-none ${
          isCompact ? 'w-20 h-20' : 'w-44 h-44 md:w-48 md:h-48'
        } ${ringColor} ${
          isSpeaking
            ? 'scale-105 opacity-90 animate-[spin_12s_linear_infinite]'
            : isProcessing
            ? 'scale-100 opacity-80 animate-[spin_4s_linear_infinite]'
            : isListening
            ? 'scale-100 opacity-60 animate-[spin_20s_linear_infinite]'
            : 'scale-95 opacity-30'
        }`}
      />

      {/* 2. Secondary Rotating Reticle (Tick Marks) */}
      {!isCompact && (
        <div
          className={`absolute w-40 h-40 rounded-full border border-[#26343B]/80 pointer-events-none transition-all duration-500 ${
            isSpeaking ? 'border-[#37E6FF]/40 scale-102' : ''
          }`}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1.5 h-2 bg-[#20D6C7]/70 rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1.5 h-2 bg-[#20D6C7]/70 rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 h-1.5 w-2 bg-[#20D6C7]/70 rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 h-1.5 w-2 bg-[#20D6C7]/70 rounded-full" />
        </div>
      )}

      {/* 3. Main Orb Surface */}
      <div
        className={`relative ${diameter} rounded-full ${coreBg} ${glowColor} ${pulseAnimation} border-2 ${
          isError
            ? 'border-[#FF5C5C]'
            : isSpeaking
            ? 'border-[#37E6FF]'
            : isListening
            ? 'border-[#20D6C7]'
            : isProcessing
            ? 'border-[#F6C453]'
            : 'border-[#26343B]'
        } flex items-center justify-center overflow-hidden transition-all duration-500 shadow-inner`}
      >
        {/* Subtle holographic radial sheen */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(32,214,199,0.18),transparent_65%)]" />

        {/* Dynamic center icon / glyph */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {isError ? (
            <AlertTriangle className={`${isCompact ? 'w-6 h-6' : 'w-10 h-10'} text-[#FF5C5C] animate-bounce`} />
          ) : isSpeaking ? (
            <div className="flex items-center gap-1">
              <Volume2 className={`${isCompact ? 'w-6 h-6' : 'w-10 h-10'} text-[#37E6FF] animate-pulse`} />
            </div>
          ) : isProcessing ? (
            <Cpu className={`${isCompact ? 'w-6 h-6' : 'w-10 h-10'} text-[#F6C453] animate-spin`} />
          ) : isListening ? (
            <Mic className={`${isCompact ? 'w-6 h-6' : 'w-10 h-10'} text-[#20D6C7]`} />
          ) : isConnecting ? (
            <Radio className={`${isCompact ? 'w-6 h-6' : 'w-10 h-10'} text-[#20D6C7] animate-ping`} />
          ) : (
            <ShieldCheck className={`${isCompact ? 'w-6 h-6' : 'w-10 h-10'} text-[#78858D]`} />
          )}

          {!isCompact && (
            <span
              className={`text-[9px] font-mono tracking-widest mt-1.5 uppercase ${
                isError
                  ? 'text-[#FF5C5C]'
                  : isSpeaking
                  ? 'text-[#37E6FF]'
                  : isProcessing
                  ? 'text-[#F6C453]'
                  : isListening
                  ? 'text-[#20D6C7]'
                  : 'text-[#78858D]'
              }`}
            >
              {isSpeaking
                ? 'VOICE ACTIVE'
                : isProcessing
                ? 'ANALYZING'
                : isListening
                ? 'LISTENING'
                : isMuted
                ? 'MIC MUTED'
                : 'STANDBY'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
