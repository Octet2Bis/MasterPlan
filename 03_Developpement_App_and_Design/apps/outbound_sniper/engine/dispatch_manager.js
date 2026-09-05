/**
 * DISPATCH MANAGER — ORCHESTRATEUR MULTI-QUEUES & COUPE-CIRCUIT (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 200 lignes)
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

class DispatchManager {
  constructor(options = {}) {
    const cfg = loadConfig();
    this.dailyLimit = options.dailyLimit || cfg.daily_send_limit || 30;
    this.safetyPauseThreshold = options.safetyPauseThreshold || cfg.safety_pause_threshold || 30;
    this.minDelay = options.minDelay || cfg.min_delay_seconds || 420;
    this.maxDelay = options.maxDelay || cfg.max_delay_seconds || 900;
    this.workingHours = options.workingHours || cfg.working_hours || { enabled: true, start: '08:30', end: '18:30', days: [1, 2, 3, 4, 5] };
    this.campaignWorkers = new Map();
    this.logs = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        if (data.date === new Date().toISOString().split('T')[0]) return data;
      }
    } catch {}
    return { date: new Date().toISOString().split('T')[0], global_sent_today: 0, campaigns: {}, last_sent_at: null };
  }

  saveState() {
    try { fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2), 'utf-8'); } catch {}
  }

  addLog(campaignId, message, type = 'INFO') {
    this.logs.unshift({ campaign_id: campaignId, timestamp: new Date().toLocaleTimeString('fr-FR'), message, type });
    if (this.logs.length > 80) this.logs.pop();
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

  async startCampaign(campaignId, { contacts, sendFn, isDryRun = true }) {
    if (this.campaignWorkers.get(campaignId)?.isRunning) {
      return { success: false, error: 'Cette campagne est déjà en cours d’exécution.' };
    }

    const worker = {
      campaignId, isRunning: true, mode: isDryRun ? 'DRY_RUN' : 'LIVE',
      status: isDryRun ? 'SIMULATING' : 'DISPATCHING', queue: [...contacts],
      next_dispatch_in_seconds: 0, current_contact: null, timer: null
    };

    this.campaignWorkers.set(campaignId, worker);
    this.addLog(campaignId, `Campagne lancée en mode [${worker.mode}] (${worker.queue.length} contacts).`, 'INFO');

    const tick = async () => {
      if (!worker.isRunning) return;

      // 0. Garde-fou heures de bureau
      if (!this.isWithinWorkingHours() && !isDryRun) {
        worker.status = 'PAUSED_SCHEDULE';
        this.addLog(campaignId, '🌙 PAUSE HORAIRES : Envoi suspendu hors heures ouvrées (8h30-18h30). Vérification dans 5 min.', 'WARNING');
        this.saveState();
        worker.timer = setTimeout(tick, 300000);
        return;
      }

      // 1. Coupe-circuit global (30/j)
      if (this.state.global_sent_today >= this.safetyPauseThreshold) {
        worker.isRunning = false;
        worker.status = 'PAUSED_SAFETY';
        this.addLog(campaignId, `🛑 COUPE-CIRCUIT GLOBAL : Plafond atteint (${this.state.global_sent_today}/${this.dailyLimit}). Arrêt pour protéger votre domaine.`, 'WARNING');
        this.saveState();
        return;
      }

      if (worker.queue.length === 0) {
        worker.isRunning = false;
        worker.status = 'COMPLETED';
        this.addLog(campaignId, `✅ Fin de la campagne : tous les contacts ont été traités.`, 'SUCCESS');
        return;
      }

      const contact = worker.queue.shift();
      worker.current_contact = `${contact.prenom || 'Contact'} (${contact.email})`;

      try {
        const res = await sendFn(contact, isDryRun);
        if (res.success) {
          this.state.global_sent_today++;
          this.state.campaigns[campaignId] = (this.state.campaigns[campaignId] || 0) + 1;
          this.state.last_sent_at = new Date().toISOString();
          this.saveState();
          this.addLog(campaignId, `✔️ [${worker.mode}] Expédié à ${contact.email} (${this.state.global_sent_today}/28).`, 'SUCCESS');
        } else {
          const errMsg = res.error || 'Erreur inconnue';
          this.addLog(campaignId, `❌ Échec pour ${contact.email} : ${errMsg}`, 'ERROR');
          // 2. Coupe-circuit d'urgence sur rejet dur / rebond 550
          if (/550|554|rejected|mailbox unavailable|user unknown|blocked/i.test(errMsg) && !isDryRun) {
            worker.isRunning = false;
            worker.status = 'PAUSED_CIRCUIT_BREAKER';
            this.addLog(campaignId, `🛑 COUPE-CIRCUIT D'URGENCE ACTIVÉ : Rejet détecté (${errMsg}). Campagne mise en pause pour protéger votre réputation.`, 'ERROR');
            return;
          }
        }
      } catch (err) {
        this.addLog(campaignId, `❌ Exception : ${err.message}`, 'ERROR');
      }

      if (worker.queue.length > 0 && worker.isRunning && this.state.global_sent_today < this.safetyPauseThreshold) {
        const delay = isDryRun ? 4 : this.getRandomDelay();
        worker.next_dispatch_in_seconds = delay;
        let remaining = delay;

        worker.timer = setInterval(() => {
          remaining--;
          worker.next_dispatch_in_seconds = remaining;
          if (remaining <= 0 || !worker.isRunning) {
            clearInterval(worker.timer);
            worker.timer = null;
            if (worker.isRunning) tick();
          }
        }, 1000);
      } else {
        tick();
      }
    };

    tick();
    return { success: true, mode: worker.mode, queue_count: worker.queue.length };
  }

  stopCampaign(campaignId) {
    const worker = this.campaignWorkers.get(campaignId);
    if (!worker) return { success: false, error: 'Campagne introuvable.' };
    worker.isRunning = false;
    if (worker.timer) { clearInterval(worker.timer); worker.timer = null; }
    worker.status = 'STOPPED';
    worker.next_dispatch_in_seconds = 0;
    this.addLog(campaignId, `⏹️ Campagne interrompue manuellement.`, 'WARNING');
    return { success: true };
  }

  getOverallStatus() {
    const active = {};
    this.campaignWorkers.forEach((w, cid) => {
      active[cid] = {
        isRunning: w.isRunning,
        status: w.status,
        mode: w.mode,
        remaining_contacts: w.queue.length,
        current_contact: w.current_contact,
        next_dispatch_in_seconds: w.next_dispatch_in_seconds
      };
    });
    return {
      global_sent_today: this.state.global_sent_today,
      safety_limit: this.safetyPauseThreshold,
      daily_max: this.dailyLimit,
      campaigns_status: active,
      logs: this.logs
    };
  }
}

module.exports = { DispatchManager };
