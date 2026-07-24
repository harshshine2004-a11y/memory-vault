// Web Audio API Procedural Sound Engine
// Synthesizes ambient 3D audio soundscapes & UI sound effects without external audio files

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Muted by default until user toggles or interacts
  private currentThemeId: string = 'abyssal_ocean';

  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private masterGain: GainNode | null = null;
  private intervalTimer: any = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : 0.15;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.initCtx();
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.ctx?.currentTime || 0);
    }
    if (!this.isMuted) {
      this.playThemeAmbient(this.currentThemeId);
      this.playNodeSelectSound();
    } else {
      this.stopAmbient();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playNodeSelectSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Audio fallback
    }
  }

  public playWarpTransitionSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch {
      // Audio fallback
    }
  }

  public playThemeAmbient(themeId: string) {
    this.currentThemeId = themeId;
    if (this.isMuted) return;
    this.stopAmbient();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc2 = this.ctx.createOscillator();

      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      switch (themeId) {
        case 'underwater':
        case 'abyssal_ocean':
          this.ambientOsc1.type = 'sine';
          this.ambientOsc1.frequency.setValueAtTime(55, now);
          this.ambientOsc2.type = 'triangle';
          this.ambientOsc2.frequency.setValueAtTime(110, now);
          gain1.gain.setValueAtTime(0.12, now);
          gain2.gain.setValueAtTime(0.05, now);
          break;

        case 'garden':
        case 'rainforest':
          this.ambientOsc1.type = 'sine';
          this.ambientOsc1.frequency.setValueAtTime(320, now);
          this.ambientOsc2.type = 'sine';
          this.ambientOsc2.frequency.setValueAtTime(480, now);
          gain1.gain.setValueAtTime(0.04, now);
          gain2.gain.setValueAtTime(0.03, now);
          break;

        case 'solar_system':
        case 'galaxy':
          this.ambientOsc1.type = 'sine';
          this.ambientOsc1.frequency.setValueAtTime(65, now);
          this.ambientOsc2.type = 'sawtooth';
          this.ambientOsc2.frequency.setValueAtTime(130, now);
          gain1.gain.setValueAtTime(0.1, now);
          gain2.gain.setValueAtTime(0.03, now);
          break;

        case 'ancient_library':
          this.ambientOsc1.type = 'triangle';
          this.ambientOsc1.frequency.setValueAtTime(140, now);
          this.ambientOsc2.type = 'sine';
          this.ambientOsc2.frequency.setValueAtTime(280, now);
          gain1.gain.setValueAtTime(0.06, now);
          gain2.gain.setValueAtTime(0.03, now);
          break;

        case 'cyberpunk_city':
          this.ambientOsc1.type = 'sawtooth';
          this.ambientOsc1.frequency.setValueAtTime(87.31, now);
          this.ambientOsc2.type = 'square';
          this.ambientOsc2.frequency.setValueAtTime(174.61, now);
          gain1.gain.setValueAtTime(0.08, now);
          gain2.gain.setValueAtTime(0.02, now);
          break;

        default:
          this.ambientOsc1.type = 'sine';
          this.ambientOsc1.frequency.setValueAtTime(110, now);
          this.ambientOsc2.type = 'triangle';
          this.ambientOsc2.frequency.setValueAtTime(220, now);
          gain1.gain.setValueAtTime(0.05, now);
          gain2.gain.setValueAtTime(0.02, now);
          break;
      }

      this.ambientOsc1.connect(gain1);
      this.ambientOsc2.connect(gain2);

      gain1.connect(this.masterGain);
      gain2.connect(this.masterGain);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
    } catch {
      // Fallback
    }
  }

  public stopAmbient() {
    if (this.intervalTimer) clearInterval(this.intervalTimer);
    try {
      if (this.ambientOsc1) {
        this.ambientOsc1.stop();
        this.ambientOsc1.disconnect();
        this.ambientOsc1 = null;
      }
      if (this.ambientOsc2) {
        this.ambientOsc2.stop();
        this.ambientOsc2.disconnect();
        this.ambientOsc2 = null;
      }
    } catch {
      // Clean up
    }
  }
}

export const audioEngine = new AudioEngine();
