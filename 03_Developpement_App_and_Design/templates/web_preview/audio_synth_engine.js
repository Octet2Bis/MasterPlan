/**
 * MOTEUR WEBAUDIO PROCÉDURAL & HAPTIQUE VIRTUELLE
 * Master Plan — Core Web Templates (03_Developpement_App_and_Design)
 * Zero-dependency WebAudio API
 * Plafond strict : < 90 lignes
 */

class WebAudioSynthEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq = 432, duration = 0.15, type = 'sine', gainVal = 0.1) {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio non disponible:', e);
    }
  }

  playClick() {
    this.playTone(800, 0.04, 'triangle', 0.05);
    if (navigator.vibrate) navigator.vibrate(15);
  }

  playChime() {
    this.playTone(528, 0.3, 'sine', 0.08); // Fréquence Solfeggio 528Hz
    if (navigator.vibrate) navigator.vibrate([10, 30, 20]);
  }

  playSuccess() {
    this.playTone(440, 0.1, 'sine', 0.06);
    setTimeout(() => this.playTone(880, 0.25, 'sine', 0.08), 100);
    if (navigator.vibrate) navigator.vibrate([20, 50, 40]);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WebAudioSynthEngine };
}
