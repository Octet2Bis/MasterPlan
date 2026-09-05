/**
 * DISPATCH QUEUE — MOTEUR DE FILE ASYNCHRONE & COUPE-CIRCUIT (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 200 lignes)
 * Throttling humain (180s - 300s) et arrêt préventif à 28 envois/jour
 */

const fs = require('node:fs');
const path = require('node:path');

const STATE_FILE = path.join(__dirname, '../data/dispatch_state.json');
const CONFIG_FILE = path.join(__dirname, '../data/config.json');

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {}
  return {};
}

class DispatchQueue {
  constructor(options = {}) {
    const cfg = loadConfig();
    this.dailyLimit = options.dailyLimit || cfg.daily_send_limit || 30;
    this.safetyPauseThreshold = options.safetyPauseThreshold || cfg.safety_pause_threshold || 30;
    this.minDelay = options.minDelay || cfg.min_delay_seconds || 420;
    this.maxDelay = options.maxDelay || cfg.max_delay_seconds || 900;
    this.workingHours = options.workingHours || cfg.working_hours || { enabled: true, start: '08:30', end: '18:30', days: [1, 2, 3, 4, 5] };
    this.isRunning = false;
    this.currentTimer = null;
    this.logs = [];
    this.subscribers = new Set();
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        const today = new Date().toISOString().split('T')[0];
        if (data.date === today) return data;
      }
    } catch {}
    return {
      date: new Date().toISOString().split('T')[0],
      sent_today: 0,
      last_sent_at: null,
      status: 'IDLE',
      current_recipient: null,
      next_dispatch_in_seconds: 0
    };
  }

  saveState() {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch {}
    this.notify();
  }

  subscribe(cb) {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  notify() {
    const payload = this.getStatus();
    this.subscribers.forEach(cb => {
      try { cb(payload); } catch {}
    });
  }

  addLog(message, type = 'INFO') {
    const entry = {
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      message,
      type
    };
    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();
    this.notify();
  }

  isWithinWorkingHours() {
    if (!this.workingHours || !this.workingHours.enabled) return true;
    const now = new Date();
    const day = now.getDay();
    if (Array.isArray(this.workingHours.days) && !this.workingHours.days.includes(day)) return false;
    const [startH, startM] = (this.workingHours.start || '08:30').split(':').map(Number);
    const [endH, endM] = (this.workingHours.end || '18:30').split(':').map(Number);
    const curM = now.getHours() * 60 + now.getMinutes();
    return curM >= (startH * 60 + startM) && curM <= (endH * 60 + endM);
  }

  getRandomDelay() {
    return Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
  }

  async startQueue({ contacts, sendFn, isDryRun = true }) {
    if (this.isRunning) return { error: 'La file est déjà en cours d’exécution.' };
    this.isRunning = true;
    this.state.status = isDryRun ? 'SIMULATING' : 'DISPATCHING';
    this.addLog(`Démarrage du dispatcheur (Mode: ${isDryRun ? 'Simulation' : 'Envoi Direct'}).`, 'INFO');

    const queue = [...contacts];

    const processNext = async () => {
      if (!this.isRunning) return;

      // 0. Garde-fou heures de bureau
      if (!this.isWithinWorkingHours() && !isDryRun) {
        this.state.status = 'PAUSED_SCHEDULE';
        this.addLog('🌙 PAUSE HORAIRES : Envoi suspendu hors heures ouvrées (8h30-18h30). Vérification dans 5 min.', 'WARNING');
        this.saveState();
        this.currentTimer = setTimeout(processNext, 300000);
        return;
      }

      // 1. Coupe-circuit préventif (Poka-Yoke)
      if (this.state.sent_today >= this.safetyPauseThreshold) {
        this.isRunning = false;
        this.state.status = 'PAUSED_SAFETY';
        this.addLog(`🛑 COUPE-CIRCUIT ACTIVÉ : Plafond journalier de sécurité atteint (${this.state.sent_today}/${this.dailyLimit}). Arrêt pour protéger votre domaine.`, 'WARNING');
        this.saveState();
        return;
      }

      // 2. Vérification fin de file
      if (queue.length === 0) {
        this.isRunning = false;
        this.state.status = 'COMPLETED';
        this.state.current_recipient = null;
        this.addLog('✅ Fin de la liste : Tous les contacts validés ont été traités.', 'SUCCESS');
        this.saveState();
        return;
      }

      const contact = queue.shift();
      this.state.current_recipient = `${contact.prenom || 'Contact'} (${contact.email})`;
      this.saveState();

      try {
        this.addLog(`Préparation de l'envoi pour ${contact.email}...`, 'INFO');
        const res = await sendFn(contact, isDryRun);

        if (res.success) {
          this.state.sent_today++;
          this.state.last_sent_at = new Date().toISOString();
          this.addLog(`✔️ [${isDryRun ? 'SIMULATION' : 'EXPÉDIÉ'}] Email envoyé à ${contact.email} (${this.state.sent_today}/${this.safetyPauseThreshold} aujourd'hui).`, 'SUCCESS');
        } else {
          this.addLog(`❌ Échec pour ${contact.email} : ${res.error || 'Erreur inconnue'}`, 'ERROR');
        }
      } catch (err) {
        this.addLog(`❌ Exception lors de l'envoi vers ${contact.email} : ${err.message}`, 'ERROR');
      }

      if (queue.length > 0 && this.isRunning && this.state.sent_today < this.safetyPauseThreshold) {
        const delaySeconds = isDryRun ? 5 : this.getRandomDelay();
        this.state.next_dispatch_in_seconds = delaySeconds;
        this.saveState();
        this.addLog(`⏳ Temporisation humaine de sécurité : prochain envoi dans ${delaySeconds} secondes...`, 'WAIT');

        let remaining = delaySeconds;
        this.currentTimer = setInterval(() => {
          remaining--;
          this.state.next_dispatch_in_seconds = remaining;
          if (remaining <= 0 || !this.isRunning) {
            clearInterval(this.currentTimer);
            this.currentTimer = null;
            if (this.isRunning) processNext();
          }
        }, 1000);
      } else {
        processNext();
      }
    };

    processNext();
    return { success: true, count: queue.length };
  }

  stopQueue() {
    this.isRunning = false;
    if (this.currentTimer) {
      clearInterval(this.currentTimer);
      this.currentTimer = null;
    }
    this.state.status = 'STOPPED';
    this.state.next_dispatch_in_seconds = 0;
    this.addLog('⏹️ Dispatcheur interrompu manuellement par l’opérateur.', 'WARNING');
    this.saveState();
    return { success: true };
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      state: this.state,
      logs: this.logs
    };
  }
}

module.exports = { DispatchQueue };
