/**
 * AEVUM SIMULATOR — AUDIO ENGINE (Web Audio API Haptics)
 * Module étanche (< 90 lignes)
 */
class AudioEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playChime(freq = 440, type = 'sine', duration = 0.5) {
    try {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playInhale() { this.playChime(320, 'sine', 0.8); }
  playExhale() { this.playChime(240, 'sine', 1.0); }
  
  playSuccess() {
    this.playChime(523.25, 'sine', 0.15);
    setTimeout(() => this.playChime(659.25, 'sine', 0.15), 120);
    setTimeout(() => this.playChime(783.99, 'sine', 0.35), 240);
  }

  playChalkScreech() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400 + Math.random() * 600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch(e) {}
  }

  playCartoonHorn() {
    try {
      this.init();
      if (!this.ctx) return;
      this.playChime(220, 'sawtooth', 0.15);
      setTimeout(() => this.playChime(277.18, 'sawtooth', 0.25), 100);
      setTimeout(() => this.playChime(329.63, 'sawtooth', 0.35), 200);
    } catch(e) {}
  }

  playGlassShatter() {
    try {
      this.init();
      if (!this.ctx) return;
      this.playChime(2200, 'square', 0.08);
      setTimeout(() => this.playChime(1800, 'triangle', 0.1), 50);
      setTimeout(() => this.playChime(900, 'sine', 0.15), 100);
    } catch(e) {}
  }

  playVintageStamp() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch(e) {}
  }
}

window.audio = new AudioEngine();
