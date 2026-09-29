/**
 * AudioWaveformVisualizer.tsx
 * Real-time Canvas-based audio spectrum and waveform visualization for Arise Voice Assistant.
 * Connects directly to Web Audio AnalyserNode (mic and speaker) with high FPS rendering and idle states.
 */

import React, { useEffect, useRef } from 'react';
import { VoiceSessionState } from '../../services/millisVoiceService';

interface AudioWaveformVisualizerProps {
  analyser: AnalyserNode | null;
  state: VoiceSessionState;
  isMuted?: boolean;
  height?: number;
  barCount?: number;
  compact?: boolean;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  analyser,
  state,
  isMuted = false,
  height = 70,
  barCount = 36,
  compact = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let idlePhase = 0;

    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationId = requestAnimationFrame(render);
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      const isListening = state === 'LISTENING' || state === 'USER_SPEAKING';
      const isSpeaking = state === 'ARISE_SPEAKING';
      const isProcessing = state === 'PROCESSING';

      // 1. Gather audio data if available
      let audioLevel = 0;
      if (analyser && !isMuted) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        audioLevel = sum / dataArray.length;
      }

      // 2. Render Modes
      const actualBars = compact ? Math.min(barCount, 16) : barCount;
      const barSpacing = compact ? 2 : 3;
      const totalSpacing = (actualBars - 1) * barSpacing;
      const barWidth = Math.max(2, (width - totalSpacing) / actualBars);
      const centerY = h / 2;

      idlePhase += isSpeaking ? 0.08 : isProcessing ? 0.05 : 0.02;

      for (let i = 0; i < actualBars; i++) {
        const x = i * (barWidth + barSpacing);
        let barHeight = 4;

        if (isMuted) {
          // Flat muted line
          barHeight = 2;
        } else if (isSpeaking) {
          // Arise output frequency response + synthetic carrier
          const freqIndex = Math.floor((i / actualBars) * (dataArray.length * 0.7));
          const val = dataArray[freqIndex] || 0;
          const reactiveVal = (val / 255) * (h * 0.85);
          const carrier = Math.sin(idlePhase * 2 + i * 0.35) * 8;
          barHeight = Math.max(6, reactiveVal + carrier);
        } else if (state === 'USER_SPEAKING' || (isListening && audioLevel > 14)) {
          // Real live mic frequency reaction
          const freqIndex = Math.floor((i / actualBars) * (dataArray.length * 0.5));
          const val = dataArray[freqIndex] || 0;
          barHeight = Math.max(4, (val / 255) * (h * 0.8));
        } else if (isProcessing) {
          // Thinking animation wave
          barHeight = 4 + Math.sin(idlePhase * 3 + i * 0.4) * (h * 0.3);
        } else {
          // Subtle idle ambient breathing
          const wave = Math.sin(idlePhase + i * 0.25) * 0.5 + 0.5;
          barHeight = compact ? 3 + wave * 4 : 4 + wave * 7;
        }

        // Color grading based on voice state
        let gradient: CanvasGradient;
        if (isMuted) {
          ctx.fillStyle = 'rgba(255, 92, 92, 0.4)';
        } else if (isSpeaking) {
          gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
          gradient.addColorStop(0, '#37E6FF');
          gradient.addColorStop(0.5, '#20D6C7');
          gradient.addColorStop(1, '#0F8279');
          ctx.fillStyle = gradient;
        } else if (state === 'USER_SPEAKING' || audioLevel > 18) {
          gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
          gradient.addColorStop(0, '#36D399');
          gradient.addColorStop(0.5, '#20D6C7');
          gradient.addColorStop(1, '#155B54');
          ctx.fillStyle = gradient;
        } else if (isProcessing) {
          gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
          gradient.addColorStop(0, '#F6C453');
          gradient.addColorStop(1, '#20D6C7');
          ctx.fillStyle = gradient;
        } else {
          // Subtle idle cyan
          ctx.fillStyle = 'rgba(32, 214, 199, 0.35)';
        }

        // Draw symmetric centered pill bar
        const barY = centerY - barHeight / 2;
        const radius = barWidth / 2;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, barY, barWidth, barHeight, radius);
        } else {
          ctx.rect(x, barY, barWidth, barHeight);
        }
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyser, state, isMuted, barCount, compact, height]);

  return (
    <div className={`w-full flex items-center justify-center ${compact ? 'px-1' : 'px-4'}`}>
      <canvas
        ref={canvasRef}
        width={compact ? 120 : 460}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};
