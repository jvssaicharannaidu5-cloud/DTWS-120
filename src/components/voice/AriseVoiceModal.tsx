/**
 * AriseVoiceModal.tsx
 * High-Fidelity Phone Call Modal Overlay for the Digital Twin Well-Surface Optimization Platform.
 * Powered by Arise and Millis Voice Agent (Agent ID: -P2gcPI5t_7Djy8toIcp).
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  millisVoiceService,
  VoiceSessionState,
  TranscriptMessage,
  VoiceContextPayload
} from '../../services/millisVoiceService';
import { AriseAvatarOrb } from './AriseAvatarOrb';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';
import {
  Mic,
  MicOff,
  PhoneOff,
  Minimize2,
  Maximize2,
  X,
  Radio,
  RefreshCw,
  Sparkles,
  Activity,
  Layers,
  Flame,
  Gauge,
  Bot
} from 'lucide-react';

interface AriseVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  contextData: VoiceContextPayload;
}

export const AriseVoiceModal: React.FC<AriseVoiceModalProps> = ({
  isOpen,
  onClose,
  onMinimize,
  contextData
}) => {
  const [state, setState] = useState<VoiceSessionState>(millisVoiceService.getState());
  const [messages, setMessages] = useState<TranscriptMessage[]>(millisVoiceService.getMessages());
  const [partialTranscript, setPartialTranscript] = useState<{ sender: 'YOU' | 'ARISE'; text: string } | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(millisVoiceService.getIsMuted());
  const [callDuration, setCallDuration] = useState<number>(0);
  const [micAnalyser, setMicAnalyser] = useState<AnalyserNode | null>(millisVoiceService.getMicAnalyser());
  const [speakerAnalyser, setSpeakerAnalyser] = useState<AnalyserNode | null>(millisVoiceService.getSpeakerAnalyser());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Subscribe to Voice Service
  useEffect(() => {
    const unsubscribe = millisVoiceService.subscribe({
      onStateChange: (newState) => {
        setState(newState);
        if (newState === 'ARISE_SPEAKING' || newState === 'LISTENING') {
          setPartialTranscript(null);
        }
      },
      onTranscript: (updatedMessages) => {
        setMessages(updatedMessages);
        setPartialTranscript(null);
      },
      onPartialTranscript: (sender, text) => {
        setPartialTranscript({ sender, text });
      },
      onMicAnalyserReady: (analyser) => {
        setMicAnalyser(analyser);
      },
      onSpeakerAnalyserReady: (analyser) => {
        setSpeakerAnalyser(analyser);
      },
      onError: (err) => {
        setErrorMessage(err);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Start Call on Open (if IDLE)
  useEffect(() => {
    if (isOpen && (state === 'IDLE' || state === 'ENDED')) {
      setCallDuration(0);
      setErrorMessage(null);
      millisVoiceService.startCall(contextData);
    }
  }, [isOpen]);

  // 3. Keep current context synchronized
  useEffect(() => {
    if (isOpen) {
      millisVoiceService.updateContext(contextData);
    }
  }, [isOpen, contextData]);

  // 4. Call Duration Timer
  useEffect(() => {
    let interval: any = null;
    const isCallActive =
      state === 'CONNECTED' ||
      state === 'LISTENING' ||
      state === 'USER_SPEAKING' ||
      state === 'PROCESSING' ||
      state === 'ARISE_SPEAKING' ||
      state === 'MUTED';

    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else if (state === 'ENDED' || state === 'IDLE') {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state]);

  // 5. Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partialTranscript]);

  // 6. Keyboard navigation (Escape to minimize)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onMinimize();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onMinimize]);

  if (!isOpen) return null;

  // Format Duration mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const muted = millisVoiceService.toggleMute();
    setIsMuted(muted);
  };

  const handleEndCall = async () => {
    await millisVoiceService.endCall();
    onClose();
  };

  const handleReconnect = () => {
    setErrorMessage(null);
    millisVoiceService.startCall(contextData);
  };

  const handleQuickAction = (actionPrompt: string) => {
    setPartialTranscript({ sender: 'YOU', text: actionPrompt });
    setTimeout(() => {
      millisVoiceService.handleSpokenQuery(actionPrompt);
    }, 400);
  };

  // Header status indicator badge
  let statusBadge = (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#20D6C7]/10 border border-[#20D6C7]/30 text-[#20D6C7] text-xs font-mono">
      <span className="w-2 h-2 rounded-full bg-[#20D6C7] animate-pulse" />
      <span>● LISTENING</span>
    </div>
  );

  if (state === 'CONNECTING') {
    statusBadge = (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#37E6FF]/10 border border-[#37E6FF]/30 text-[#37E6FF] text-xs font-mono">
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span>● CONNECTING</span>
      </div>
    );
  } else if (state === 'USER_SPEAKING') {
    statusBadge = (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#36D399]/15 border border-[#36D399]/40 text-[#36D399] text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-[#36D399] animate-ping" />
        <span>● USER SPEAKING</span>
      </div>
    );
  } else if (state === 'PROCESSING') {
    statusBadge = (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F6C453]/15 border border-[#F6C453]/40 text-[#F6C453] text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-[#F6C453] animate-pulse" />
        <span>● PROCESSING</span>
      </div>
    );
  } else if (state === 'ARISE_SPEAKING') {
    statusBadge = (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#37E6FF]/15 border border-[#37E6FF]/50 text-[#37E6FF] text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-[#37E6FF] animate-ping" />
        <span>● ARISE IS SPEAKING</span>
      </div>
    );
  } else if (state === 'MUTED') {
    statusBadge = (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FF5C5C]/15 border border-[#FF5C5C]/40 text-[#FF5C5C] text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-[#FF5C5C]" />
        <span>● MUTED</span>
      </div>
    );
  } else if (state === 'ERROR' || state === 'DISCONNECTED') {
    statusBadge = (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FF5C5C]/15 border border-[#FF5C5C]/40 text-[#FF5C5C] text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-[#FF5C5C]" />
        <span>● DISCONNECTED</span>
      </div>
    );
  }

  const isSpeaking = state === 'ARISE_SPEAKING';
  const activeAnalyser = isSpeaking ? speakerAnalyser : micAnalyser;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="arise-call-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
    >
      <div
        className={`relative flex flex-col bg-[#10161A] border border-[#26343B] rounded-2xl md:rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full max-w-none rounded-none'
            : 'w-full max-w-[580px] h-[750px] max-h-[92vh]'
        }`}
      >
        {/* Top subtle metallic accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#20D6C7] to-transparent opacity-80" />

        {/* 1. CONTROL-ROOM MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#26343B] bg-[#0C1114]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#151D22] border border-[#20D6C7]/30 flex items-center justify-center text-[#20D6C7]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="arise-call-title" className="text-sm font-bold tracking-wider text-[#F5F7F8]">
                  ARISE
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151D22] border border-[#26343B] text-[#78858D]">
                  MILLIS AI
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#78858D] leading-none mt-0.5">
                DIGITAL TWIN VOICE ASSISTANT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {statusBadge}

            <div className="flex items-center gap-1 border-l border-[#26343B] pl-2 ml-1">
              {/* Minimize */}
              <button
                onClick={onMinimize}
                title="Minimize call"
                aria-label="Minimize call"
                className="p-1.5 rounded-lg text-[#78858D] hover:text-[#F5F7F8] hover:bg-[#151D22] transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              {/* Fullscreen / Expand */}
              <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                title={isFullscreen ? 'Restore window' : 'Expand full window'}
                aria-label="Toggle full window"
                className="p-1.5 rounded-lg text-[#78858D] hover:text-[#F5F7F8] hover:bg-[#151D22] transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                onClick={handleEndCall}
                title="End & Close"
                aria-label="Close voice modal"
                className="p-1.5 rounded-lg text-[#78858D] hover:text-[#FF5C5C] hover:bg-[#FF5C5C]/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. BODY CONTENT (SCROLLABLE) */}
        <div className="flex-1 min-h-0 flex flex-col px-5 py-4 overflow-y-auto space-y-4">
          {/* A. Identity & Avatar Orb */}
          <div className="flex flex-col items-center justify-center pt-2">
            <AriseAvatarOrb state={state} isMuted={isMuted} size="normal" />

            <div className="text-center mt-3">
              <h3 className="text-base font-semibold text-[#F5F7F8] tracking-wide">ARISE</h3>
              <p className="text-xs text-[#78858D] font-mono mt-0.5">
                Industrial Digital Twin Voice Operations
              </p>

              {/* Well Context Pill */}
              <div className="inline-flex items-center gap-2 mt-2 px-2.5 py-1 rounded-md bg-[#151D22] border border-[#26343B] text-[11px] font-mono text-[#B7C1C7]">
                <span className="text-[#20D6C7] font-semibold">{contextData.selectedWellId || 'BGW-04'}</span>
                <span className="text-[#78858D]">|</span>
                <span>{contextData.pumpEfficiency || '87.4%'} EFF</span>
                <span className="text-[#78858D]">|</span>
                <span className="text-[#36D399]">{contextData.wellStatus || 'ACTIVE'}</span>
              </div>
            </div>
          </div>

          {/* B. Live Audio Waveform Visualization */}
          <div className="bg-[#080B0D] rounded-xl border border-[#26343B] p-2.5 flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#78858D] mb-1 px-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-[#20D6C7]" />
                LIVE AUDIO SPECTRUM
              </span>
              <span>
                {isSpeaking
                  ? 'ARISE AUDIO BUS'
                  : state === 'USER_SPEAKING'
                  ? 'MIC AUDIO IN'
                  : isMuted
                  ? 'MIC MUTED'
                  : 'READY FOR INPUT'}
              </span>
            </div>

            <AudioWaveformVisualizer
              analyser={activeAnalyser}
              state={state}
              isMuted={isMuted}
              height={56}
              barCount={32}
            />
          </div>

          {/* C. Quick Voice Actions */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-[#78858D] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#20D6C7]" />
              Quick Operational Requests
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleQuickAction('What is the current status of well ' + (contextData.selectedWellId || 'BGW-04') + '?')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#151D22] hover:bg-[#1A252C] border border-[#26343B] hover:border-[#20D6C7]/50 text-[#B7C1C7] hover:text-[#20D6C7] transition-all flex items-center gap-1.5"
              >
                <Layers className="w-3 h-3" />
                Check Well Status
              </button>
              <button
                onClick={() => handleQuickAction('Please summarize current active alerts on the field.')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#151D22] hover:bg-[#1A252C] border border-[#26343B] hover:border-[#F6C453]/50 text-[#B7C1C7] hover:text-[#F6C453] transition-all flex items-center gap-1.5"
              >
                <Activity className="w-3 h-3" />
                Current Alerts
              </button>
              <button
                onClick={() => handleQuickAction('How is the pump performance and load deviation?')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#151D22] hover:bg-[#1A252C] border border-[#26343B] hover:border-[#20D6C7]/50 text-[#B7C1C7] hover:text-[#20D6C7] transition-all flex items-center gap-1.5"
              >
                <Gauge className="w-3 h-3" />
                Pump Performance
              </button>
              <button
                onClick={() => handleQuickAction('What are the steam pressure and temperature trends?')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#151D22] hover:bg-[#1A252C] border border-[#26343B] hover:border-[#37E6FF]/50 text-[#B7C1C7] hover:text-[#37E6FF] transition-all flex items-center gap-1.5"
              >
                <Flame className="w-3 h-3" />
                Steam Status
              </button>
              <button
                onClick={() => handleQuickAction('What does the AI recommendation engine suggest for optimization?')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#151D22] hover:bg-[#1A252C] border border-[#26343B] hover:border-[#20D6C7]/50 text-[#B7C1C7] hover:text-[#20D6C7] transition-all flex items-center gap-1.5"
              >
                <Bot className="w-3 h-3" />
                AI Optimization
              </button>
            </div>
          </div>

          {/* D. Live Transcript Panel */}
          <div className="flex-1 min-h-[160px] bg-[#080B0D] rounded-xl border border-[#26343B] p-3 flex flex-col">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#78858D] pb-2 border-b border-[#26343B]/60 mb-2">
              <span className="tracking-wider uppercase text-[#B7C1C7]">LIVE TRANSCRIPT</span>
              <span className="text-[9px] text-[#78858D]">SIMULATED TELEMETRY ADVISORY</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {messages.length === 0 && !partialTranscript && (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#78858D] font-mono text-xs py-6">
                  <p>Voice session active.</p>
                  <p className="text-[11px] mt-1 text-[#78858D]/70">Speak into your microphone or click a quick operational request.</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'YOU' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#78858D] mb-1">
                    <span
                      className={`font-semibold ${
                        msg.sender === 'YOU' ? 'text-[#36D399]' : 'text-[#20D6C7]'
                      }`}
                    >
                      {msg.sender === 'YOU' ? 'YOU' : 'ARISE'}
                    </span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[88%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                      msg.sender === 'YOU'
                        ? 'bg-[#151D22] border border-[#26343B] text-[#F5F7F8] rounded-tr-none'
                        : 'bg-[#10191F] border border-[#20D6C7]/30 text-[#E0F7F6] rounded-tl-none shadow-[0_2px_12px_rgba(32,214,199,0.08)]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Partial / In-flight Speech */}
              {partialTranscript && (
                <div
                  className={`flex flex-col animate-pulse ${
                    partialTranscript.sender === 'YOU' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="text-[10px] font-mono text-[#78858D] mb-1">
                    <span className="text-[#F6C453] font-semibold">
                      {partialTranscript.sender === 'YOU' ? 'YOU (SPEAKING...)' : 'ARISE (THINKING...)'}
                    </span>
                  </div>
                  <div className="max-w-[88%] px-3.5 py-2 rounded-xl text-xs bg-[#151D22]/60 border border-dashed border-[#F6C453]/40 text-[#F6C453]">
                    {partialTranscript.text}
                  </div>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* Error / Reconnect Banner if encountered */}
          {errorMessage && (
            <div className="px-3.5 py-2.5 rounded-xl bg-[#FF5C5C]/15 border border-[#FF5C5C]/40 text-xs text-[#FF5C5C] flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                onClick={handleReconnect}
                className="px-2.5 py-1 rounded bg-[#FF5C5C] text-[#080B0D] font-mono font-semibold text-[11px] hover:bg-white transition-colors"
              >
                RECONNECT
              </button>
            </div>
          )}
        </div>

        {/* 3. TECHNICAL METRICS & CONTROLS FOOTER */}
        <div className="px-5 py-4 border-t border-[#26343B] bg-[#0C1114] space-y-3">
          {/* Technical Connection Info Strip */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#78858D] px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#20D6C7]" />
                MILLIS: <span className="text-[#B7C1C7]">CONNECTED</span>
              </span>
              <span>•</span>
              <span>AUDIO: <span className="text-[#36D399]">ACTIVE</span></span>
              <span>•</span>
              <span>MIC: <span className={isMuted ? 'text-[#FF5C5C]' : 'text-[#36D399]'}>{isMuted ? 'MUTED' : 'READY'}</span></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#B7C1C7] font-semibold">CALL ACTIVE</span>
              <span className="font-bold text-[#F5F7F8] bg-[#151D22] px-2 py-0.5 rounded border border-[#26343B]">
                {formatTime(callDuration)}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Mic Toggle Button */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              className={`flex-1 py-3 px-4 rounded-xl border font-mono font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                isMuted
                  ? 'bg-[#FF5C5C]/15 border-[#FF5C5C]/50 text-[#FF5C5C] hover:bg-[#FF5C5C]/25'
                  : 'bg-[#151D22] border-[#20D6C7]/50 text-[#20D6C7] hover:bg-[#1A252C] hover:border-[#20D6C7] shadow-[0_0_15px_rgba(32,214,199,0.15)]'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMuted ? 'UNMUTE MIC' : 'MUTE MIC'}</span>
            </button>

            {/* Minimize Button */}
            <button
              onClick={onMinimize}
              title="Minimize call to floating bar"
              aria-label="Minimize call"
              className="px-4 py-3 rounded-xl bg-[#151D22] hover:bg-[#1A252C] border border-[#26343B] hover:border-[#B7C1C7] text-[#B7C1C7] hover:text-[#F5F7F8] font-mono text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="hidden sm:inline">MINIMIZE</span>
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              title="End voice session"
              aria-label="End call"
              className="flex-1 py-3 px-4 rounded-xl bg-[#FF5C5C]/20 border border-[#FF5C5C]/60 text-[#FF5C5C] hover:bg-[#FF5C5C] hover:text-[#080B0D] font-mono font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,92,92,0.2)]"
            >
              <PhoneOff className="w-4 h-4" />
              <span>END CALL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
