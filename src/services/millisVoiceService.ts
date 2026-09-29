/**
 * millisVoiceService.ts
 * Dedicated service for ARISE Digital Twin Voice Assistant using Millis AI Voice Agent.
 * Agent ID: -P2gcPI5t_7Djy8toIcp
 * 
 * Supports:
 * - Official @millisai/web-sdk real-time streaming
 * - Dual Web Audio AnalyserNode taps (user microphone + Arise output) for live waveform visualization
 * - Browser speech recognition & synthesis hybrid fallback when API keys are not provisioned
 * - Application context awareness (selected well, telemetry, alerts, CSS stage)
 * - Safe resource cleanup & anti-loop debouncing
 */

import Millis from '@millisai/web-sdk';

export type VoiceSessionState =
  | 'IDLE'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'LISTENING'
  | 'USER_SPEAKING'
  | 'PROCESSING'
  | 'ARISE_SPEAKING'
  | 'MUTED'
  | 'RECONNECTING'
  | 'DISCONNECTED'
  | 'ERROR'
  | 'ENDED';

export interface TranscriptMessage {
  id: string;
  sender: 'YOU' | 'ARISE' | 'SYSTEM';
  text: string;
  timestamp: string;
  isPartial?: boolean;
}

export interface VoiceContextPayload {
  selectedWellId?: string;
  wellStatus?: string;
  pumpEfficiency?: string | number;
  productionRate?: string | number;
  steamPressure?: string | number;
  steamTemperature?: string | number;
  activeAlerts?: string[];
  recommendations?: string[];
  cssStage?: string;
  fieldStatus?: string;
}

export interface VoiceServiceListener {
  onStateChange?: (state: VoiceSessionState) => void;
  onTranscript?: (messages: TranscriptMessage[]) => void;
  onPartialTranscript?: (sender: 'YOU' | 'ARISE', text: string) => void;
  onMicAnalyserReady?: (analyser: AnalyserNode | null) => void;
  onSpeakerAnalyserReady?: (analyser: AnalyserNode | null) => void;
  onError?: (error: string) => void;
}

class MillisVoiceService {
  public static readonly AGENT_ID = '-P2gcPI5t_7Djy8toIcp';

  private state: VoiceSessionState = 'IDLE';
  private listeners: Set<VoiceServiceListener> = new Set();
  private messages: TranscriptMessage[] = [];
  private isMuted: boolean = false;
  private millisClient: any = null;
  private isConnecting: boolean = false;

  // Web Audio resources
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private speakerAnalyser: AnalyserNode | null = null;
  private speakerGain: GainNode | null = null;

  // Web Speech fallback
  private speechRecognition: any = null;
  private isUsingFallback: boolean = false;
  private lastGreetingGiven: boolean = false;
  private currentContext: VoiceContextPayload = {};

  constructor() {
    // Single instance initialized
  }

  public subscribe(listener: VoiceServiceListener): () => void {
    this.listeners.add(listener);
    // Push current snapshot
    listener.onStateChange?.(this.state);
    listener.onTranscript?.([...this.messages]);
    listener.onMicAnalyserReady?.(this.micAnalyser);
    listener.onSpeakerAnalyserReady?.(this.speakerAnalyser);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): VoiceSessionState {
    return this.state;
  }

  public getMessages(): TranscriptMessage[] {
    return [...this.messages];
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getMicAnalyser(): AnalyserNode | null {
    return this.micAnalyser;
  }

  public getSpeakerAnalyser(): AnalyserNode | null {
    return this.speakerAnalyser;
  }

  private setState(newState: VoiceSessionState) {
    if (this.state === newState) return;
    this.state = newState;
    this.listeners.forEach((l) => l.onStateChange?.(newState));
  }

  private addMessage(sender: 'YOU' | 'ARISE' | 'SYSTEM', text: string) {
    const msg: TranscriptMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    this.messages.push(msg);
    this.listeners.forEach((l) => l.onTranscript?.([...this.messages]));
  }

  public updateContext(context: VoiceContextPayload) {
    this.currentContext = { ...this.currentContext, ...context };
  }

  /**
   * Start a voice call with Millis Voice Agent.
   * Debounced to prevent duplicate simultaneous calls.
   */
  public async startCall(contextPayload?: VoiceContextPayload): Promise<void> {
    if (this.isConnecting || this.state === 'CONNECTED' || this.state === 'LISTENING' || this.state === 'ARISE_SPEAKING') {
      console.warn('[MillisVoice] Call already in progress or connecting. Debouncing duplicate request.');
      return;
    }

    if (contextPayload) {
      this.currentContext = { ...this.currentContext, ...contextPayload };
    }

    this.isConnecting = true;
    this.setState('CONNECTING');
    this.isMuted = false;
    this.lastGreetingGiven = false;

    try {
      // 1. Fetch public voice config from backend
      let voiceConfig = {
        agentId: MillisVoiceService.AGENT_ID,
        publicKey: ''
      };

      try {
        const res = await fetch('/api/voice/config');
        if (res.ok) {
          const data = await res.json();
          voiceConfig = { ...voiceConfig, ...data };
        }
      } catch (err) {
        console.warn('[MillisVoice] Could not fetch /api/voice/config, using default agent configuration.');
      }

      // 2. Initialize Web Audio Context for microphone waveform
      await this.initMicrophoneAudio();

      // 3. Attempt Millis SDK initialization if public key available
      if (voiceConfig.publicKey && voiceConfig.publicKey.trim().length > 0) {
        try {
          await this.initMillisSdkSession(voiceConfig.publicKey);
          this.isUsingFallback = false;
          this.isConnecting = false;
          return;
        } catch (sdkError: any) {
          console.warn('[MillisVoice] Millis SDK cloud connection deferred, engaging control-room hybrid mode:', sdkError.message);
        }
      }

      // 4. Hybrid Intelligent Fallback Mode
      // When public key is not provisioned or offline, maintain full high-fidelity control-room voice interaction
      this.isUsingFallback = true;
      this.setState('CONNECTED');
      this.isConnecting = false;

      // Welcome greeting from Arise
      setTimeout(() => {
        const greeting = `Hello, I am Arise, your Digital Twin operations assistant for Baghewala Field. Currently monitoring well ${this.currentContext.selectedWellId || 'BGW-04'}. How can I assist you with simulated telemetry, pump performance, or AI optimization?`;
        this.speakArise(greeting);
      }, 500);

    } catch (err: any) {
      console.error('[MillisVoice] Failed to start voice session:', err);
      this.isConnecting = false;
      this.setState('ERROR');
      this.listeners.forEach((l) => l.onError?.(err.message || 'Microphone or audio device initialization failed.'));
    }
  }

  /**
   * Initializes real microphone stream and Web Audio AnalyserNode
   */
  private async initMicrophoneAudio(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access is not supported by your browser environment.');
    }

    // Request user media
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Create AudioContext
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioCtx();
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Setup Mic Analyser Node
    const micSource = this.audioContext.createMediaStreamSource(this.micStream);
    this.micAnalyser = this.audioContext.createAnalyser();
    this.micAnalyser.fftSize = 128;
    this.micAnalyser.smoothingTimeConstant = 0.8;
    micSource.connect(this.micAnalyser);

    // Setup Speaker Analyser Node
    this.speakerAnalyser = this.audioContext.createAnalyser();
    this.speakerAnalyser.fftSize = 128;
    this.speakerAnalyser.smoothingTimeConstant = 0.8;

    this.speakerGain = this.audioContext.createGain();
    this.speakerGain.connect(this.speakerAnalyser);
    this.speakerAnalyser.connect(this.audioContext.destination);

    // Notify listeners of analyser nodes
    this.listeners.forEach((l) => {
      l.onMicAnalyserReady?.(this.micAnalyser);
      l.onSpeakerAnalyserReady?.(this.speakerAnalyser);
    });
  }

  /**
   * Connect to official Millis AI SDK
   */
  private async initMillisSdkSession(publicKey: string): Promise<void> {
    this.millisClient = Millis.createClient({
      publicKey
    });

    this.millisClient.on('onopen', () => {
      console.log('[MillisVoice] WebSocket connection established with Millis cloud.');
      this.setState('CONNECTED');
    });

    this.millisClient.on('onready', (payload?: any) => {
      console.log('[MillisVoice] Session ready:', payload?.session_id);
      this.setState('LISTENING');
      this.startMicLevelMonitor();
    });

    this.millisClient.on('analyzer', (analyzerNode: AnalyserNode) => {
      this.speakerAnalyser = analyzerNode;
      this.listeners.forEach((l) => l.onSpeakerAnalyserReady?.(analyzerNode));
    });

    this.millisClient.on('useraudioready', (data: { analyser: AnalyserNode; stream: MediaStream }) => {
      if (data.analyser) {
        this.micAnalyser = data.analyser;
        this.listeners.forEach((l) => l.onMicAnalyserReady?.(data.analyser));
      }
    });

    this.millisClient.on('ontranscript', (text: string, payload?: { is_final?: boolean }) => {
      if (payload?.is_final) {
        this.addMessage('YOU', text);
        this.setState('PROCESSING');
      } else {
        this.setState('USER_SPEAKING');
        this.listeners.forEach((l) => l.onPartialTranscript?.('YOU', text));
      }
    });

    this.millisClient.on('onresponsetext', (text: string, payload?: { is_final?: boolean }) => {
      if (payload?.is_final) {
        this.addMessage('ARISE', text);
      } else {
        this.listeners.forEach((l) => l.onPartialTranscript?.('ARISE', text));
      }
    });

    this.millisClient.on('onagentstate', (agentState: string) => {
      if (agentState === 'answer') {
        this.setState('ARISE_SPEAKING');
      } else if (agentState === 'idle' || agentState === 'pause') {
        this.setState(this.isMuted ? 'MUTED' : 'LISTENING');
      } else if (agentState === 'prepare_answer') {
        this.setState('PROCESSING');
      }
    });

    this.millisClient.on('onerror', (error: any) => {
      console.error('[MillisVoice] Millis SDK error:', error);
      this.setState('ERROR');
      this.listeners.forEach((l) => l.onError?.('Voice agent connection encountered an issue.'));
    });

    this.millisClient.on('onclose', () => {
      console.log('[MillisVoice] Millis session closed.');
      this.setState('DISCONNECTED');
    });

    // Start with exact Millis Agent ID and telemetry context
    await this.millisClient.start({
      agent: {
        agent_id: MillisVoiceService.AGENT_ID
      },
      metadata: {
        ...this.currentContext,
        platform: 'Digital Twin Well-Surface Optimization Platform',
        field: 'Baghewala Field',
        mode: 'Simulated SCADA Control-Room'
      },
      include_metadata_in_prompt: true
    });
  }

  /**
   * Continuous mic level monitor to detect user speech activity for waveform & state
   */
  private startMicLevelMonitor(): void {
    if (!this.micAnalyser) return;
    const buffer = new Uint8Array(this.micAnalyser.frequencyBinCount);

    const checkAudioLevel = () => {
      if (this.state === 'IDLE' || this.state === 'ENDED' || this.state === 'DISCONNECTED') {
        return;
      }

      if (!this.isMuted && this.micAnalyser) {
        this.micAnalyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;

        // If user is actively speaking and agent is not speaking
        if (avg > 18 && this.state === 'LISTENING') {
          this.setState('USER_SPEAKING');
        } else if (avg <= 12 && this.state === 'USER_SPEAKING') {
          // Returned to listening after short pause
          setTimeout(() => {
            if (this.state === 'USER_SPEAKING') {
              this.setState('LISTENING');
            }
          }, 600);
        }
      }

      requestAnimationFrame(checkAudioLevel);
    };

    requestAnimationFrame(checkAudioLevel);

    // If using hybrid fallback, also initialize browser speech recognition
    if (this.isUsingFallback) {
      this.initSpeechRecognitionFallback();
    }
  }

  /**
   * Browser SpeechRecognition Fallback
   */
  private initSpeechRecognitionFallback(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('[MillisVoice] Web Speech API recognition not available in this browser.');
      return;
    }

    try {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-US';

      this.speechRecognition.onresult = (event: any) => {
        if (this.isMuted || this.state === 'ARISE_SPEAKING') return;

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim.trim()) {
          this.setState('USER_SPEAKING');
          this.listeners.forEach((l) => l.onPartialTranscript?.('YOU', interim));
        }

        if (final.trim()) {
          this.addMessage('YOU', final.trim());
          this.handleSpokenQuery(final.trim());
        }
      };

      this.speechRecognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('[MillisVoice:SpeechRecognition]', e.error);
        }
      };

      this.speechRecognition.onend = () => {
        // Automatically restart speech recognition if session is active
        if (
          this.state !== 'IDLE' &&
          this.state !== 'ENDED' &&
          this.state !== 'DISCONNECTED' &&
          this.state !== 'ERROR' &&
          !this.isMuted
        ) {
          try {
            this.speechRecognition.start();
          } catch (_) {}
        }
      };

      this.speechRecognition.start();
    } catch (err) {
      console.warn('[MillisVoice] Could not start speech recognition:', err);
    }
  }

  /**
   * Handle user voice queries using the industrial Baghewala Field knowledge base
   */
  public handleSpokenQuery(queryText: string): void {
    this.setState('PROCESSING');
    this.listeners.forEach((l) => l.onPartialTranscript?.('ARISE', 'Analyzing SCADA telemetry...'));

    const q = queryText.toLowerCase();
    const well = this.currentContext.selectedWellId || 'BGW-04';
    const eff = this.currentContext.pumpEfficiency || '87.4%';
    const prod = this.currentContext.productionRate || '38.6 m³/day';
    const press = this.currentContext.steamPressure || '42.8 bar';
    const temp = this.currentContext.steamTemperature || '287°C';
    const alerts = this.currentContext.activeAlerts || [];

    let answer = '';

    if (q.includes('status') || q.includes('well status') || q.includes('how is') || q.includes('bgw')) {
      answer = `Well ${well} is currently operating in ACTIVE status on the Baghewala Field test bench. Simulated pump efficiency is measured at ${eff}, with a modeled production rate of ${prod}. Steam injection pressure is steady at ${press}.`;
    } else if (q.includes('alert') || q.includes('alarm') || q.includes('critical')) {
      if (alerts.length > 0) {
        answer = `Currently, there are active simulated alerts on the field bus: ${alerts.slice(0, 2).join('. ')}. Recommend checking downhole pump fillage and polish rod loads.`;
      } else {
        answer = `Field telemetry bus is normal. All sensors for well ${well} are reporting within safe operating thresholds with zero critical alerts.`;
      }
    } else if (q.includes('pump') || q.includes('efficiency') || q.includes('load') || q.includes('srp')) {
      answer = `The sucker rod pumping unit on ${well} is running at simulated ${eff} efficiency. Dynamometer card modeling indicates normal fluid entry without severe gas interference.`;
    } else if (q.includes('steam') || q.includes('pressure') || q.includes('temperature') || q.includes('css')) {
      answer = `Thermal front parameters for ${well} indicate steam injection pressure of ${press} at ${temp}. The Cyclic Steam Stimulation cycle is currently within modeled heat transfer limits.`;
    } else if (q.includes('recommend') || q.includes('optimization') || q.includes('ai')) {
      answer = `The AI recommendation engine estimates a 4.2 percent efficiency gain on ${well} by trimming strokes per minute to 5.2. This modeled adjustment would save an estimated 3.8 kilowatt-hours per day in electrical lift power.`;
    } else if (q.includes('summary') || q.includes('field') || q.includes('overview')) {
      answer = `Baghewala Heavy-Oil Field summary: 12 total simulated wells, 10 currently active, with an average field pump efficiency of 84.6 percent. Overall modeled oil production is approximately 380 cubic meters per day.`;
    } else {
      answer = `Understood. For ${well}, current simulated telemetry displays ${eff} pump efficiency and ${prod} output. All control recommendations are advisory simulations for operator review.`;
    }

    setTimeout(() => {
      this.speakArise(answer);
    }, 600);
  }

  /**
   * Speak response via synthesized speech with Web Audio analyser connection
   */
  public speakArise(text: string): void {
    this.setState('ARISE_SPEAKING');
    this.addMessage('ARISE', text);

    // If Millis live agent is handling speech, skip browser TTS
    if (!this.isUsingFallback && this.millisClient) {
      return;
    }

    if (!('speechSynthesis' in window)) {
      setTimeout(() => {
        this.setState(this.isMuted ? 'MUTED' : 'LISTENING');
      }, 3000);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    // Pick an authoritative English voice
    const voices = window.speechSynthesis.getVoices();
    const chosenVoice =
      voices.find((v) => v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google UK English Female') || v.name.includes('Samantha')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null;

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onend = () => {
      if (this.state === 'ARISE_SPEAKING') {
        this.setState(this.isMuted ? 'MUTED' : 'LISTENING');
      }
    };

    utterance.onerror = () => {
      this.setState(this.isMuted ? 'MUTED' : 'LISTENING');
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Mute or unmute microphone
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;

    if (this.micStream) {
      this.micStream.getAudioTracks().forEach((track) => {
        track.enabled = !this.isMuted;
      });
    }

    if (this.millisClient) {
      if (this.isMuted) {
        this.millisClient.mute();
      } else {
        this.millisClient.unmute();
      }
    }

    if (this.isMuted) {
      if (this.state === 'LISTENING' || this.state === 'USER_SPEAKING') {
        this.setState('MUTED');
      }
    } else {
      if (this.state === 'MUTED') {
        this.setState('LISTENING');
      }
    }

    return this.isMuted;
  }

  /**
   * End current call and release all audio/media resources cleanly
   */
  public async endCall(): Promise<void> {
    if (this.state === 'IDLE' || this.state === 'ENDED') {
      return;
    }

    this.setState('ENDED');
    this.isConnecting = false;

    // 1. Cancel browser TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // 2. Stop Speech Recognition
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
        this.speechRecognition.abort();
      } catch (_) {}
      this.speechRecognition = null;
    }

    // 3. Stop Millis SDK client
    if (this.millisClient) {
      try {
        await this.millisClient.stop();
      } catch (err) {
        console.warn('[MillisVoice] Error stopping Millis client:', err);
      }
      this.millisClient = null;
    }

    // 4. Release Microphone Stream
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }

    // 5. Close AudioContext
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        await this.audioContext.close();
      } catch (_) {}
      this.audioContext = null;
    }

    this.micAnalyser = null;
    this.speakerAnalyser = null;
    this.listeners.forEach((l) => {
      l.onMicAnalyserReady?.(null);
      l.onSpeakerAnalyserReady?.(null);
    });

    // Reset to IDLE after brief transition
    setTimeout(() => {
      if (this.state === 'ENDED') {
        this.setState('IDLE');
      }
    }, 400);
  }

  /**
   * Clear transcript messages
   */
  public clearTranscript(): void {
    this.messages = [];
    this.listeners.forEach((l) => l.onTranscript?.([]));
  }
}

export const millisVoiceService = new MillisVoiceService();
