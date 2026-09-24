/**
 * DISPATCH MANAGER — ENVOI CADENCÉ, QUOTA JOURNALIER & COUPE-CIRCUIT (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * - Quota : seuls les envois RÉELS réussis le consomment (la simulation n'y touche pas).
 * - Coupe-circuit : arrêt sur erreur fatale renvoyée par l'envoi (auth / quota Gmail).
 * - La file est en mémoire : après un redémarrage, relancer la campagne (les contacts SENT sont exclus).
 */
const store = require('./store');

const STATE_FILE = 'dispatch_state.json';
const localDate = () => new Date().toLocaleDateString('sv-SE');

class DispatchManager {
  constructor(config = {}) {
    this.applyConfig(config);
    this.campaignWorkers = new Map();
    this.logs = [];
    this.state = this.loadState();
  }

  applyConfig(config) {
    this.dailyLimit = config.daily_send_limit;
    this.minDelay = config.min_delay_seconds;
    this.maxDelay = Math.max(config.max_delay_seconds, config.min_delay_seconds);
    this.workingHours = config.working_hours || { enabled: false };
  }

  loadState() {
    const data = store.load(STATE_FILE, null);
    if (data && data.date === localDate()) return data;
    return { date: localDate(), global_sent_today: 0, campaigns: {}, last_sent_at: null };
  }

  saveState() { store.save(STATE_FILE, this.state); }

  sentToday() {
    if (this.state.date !== localDate()) this.state = this.loadState();
    return this.state.global_sent_today;
  }

  addLog(campaignId, message, type = 'INFO') {
    this.logs.unshift({ campaign_id: campaignId, timestamp: new Date().toLocaleTimeString('fr-FR'), message, type });
    if (this.logs.length > 80) this.logs.pop();
  }

  isWithinWorkingHours(now = new Date()) {
    const wh = this.workingHours;
    if (!wh || !wh.enabled) return true;
    if (Array.isArray(wh.days) && !wh.days.includes(now.getDay())) return false;
    const toMin = (hhmm) => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; };
    const cur = now.getHours() * 60 + now.getMinutes();
    return cur >= toMin(wh.start) && cur <= toMin(wh.end);
  }

  getRandomDelay() {
    return Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
  }

  /**
   * @param {string} campaignId
   * @param {{contacts: object[], sendFn: (contact, dryRun) => Promise<{success, error?, fatal?}>, isDryRun: boolean}} opts
   */
  startCampaign(campaignId, { contacts, sendFn, isDryRun = true }) {
    if (this.campaignWorkers.get(campaignId)?.isRunning) return { success: false, error: 'Cette campagne est déjà en cours.' };
    if (!isDryRun && this.sentToday() >= this.dailyLimit) return { success: false, error: `Quota du jour atteint (${this.sentToday()}/${this.dailyLimit}).` };

    const worker = {
      isRunning: true, mode: isDryRun ? 'DRY_RUN' : 'LIVE', status: isDryRun ? 'SIMULATING' : 'DISPATCHING',
      queue: [...contacts], next_dispatch_in_seconds: 0, current_contact: null, timer: null, simulated: 0
    };
    this.campaignWorkers.set(campaignId, worker);
    this.addLog(campaignId, `Campagne lancée en mode ${worker.mode} (${worker.queue.length} contacts).`);

    const stop = (status, message, type) => {
      worker.isRunning = false;
      worker.status = status;
      worker.next_dispatch_in_seconds = 0;
      this.addLog(campaignId, message, type);
    };

    const scheduleNext = () => {
      let remaining = isDryRun ? 2 : this.getRandomDelay();
      worker.next_dispatch_in_seconds = remaining;
      worker.timer = setInterval(() => {
        worker.next_dispatch_in_seconds = --remaining;
        if (remaining <= 0 || !worker.isRunning) {
          clearInterval(worker.timer);
          worker.timer = null;
          if (worker.isRunning) tick();
        }
      }, 1000);
    };

    const tick = async () => {
      if (!worker.isRunning) return;
      if (!isDryRun && !this.isWithinWorkingHours()) {
        worker.status = 'PAUSED_SCHEDULE';
        this.addLog(campaignId, 'Hors horaires ouvrés : nouvelle vérification dans 5 min.', 'WARNING');
        worker.timer = setTimeout(tick, 300000);
        return;
      }
      if (!isDryRun && this.sentToday() >= this.dailyLimit) {
        return stop('PAUSED_SAFETY', `Quota journalier atteint (${this.sentToday()}/${this.dailyLimit}) : arrêt pour protéger le domaine.`, 'WARNING');
      }
      if (worker.queue.length === 0) return stop('COMPLETED', 'Fin de la campagne : tous les contacts ont été traités.', 'SUCCESS');

      worker.status = isDryRun ? 'SIMULATING' : 'DISPATCHING';
      const contact = worker.queue.shift();
      worker.current_contact = contact.email;
      let res;
      try { res = await sendFn(contact, isDryRun); } catch (err) { res = { success: false, error: err.message }; }

      if (res.success && isDryRun) {
        worker.simulated++;
        this.addLog(campaignId, `[SIMULATION] Prêt pour ${contact.email} (aucun envoi, quota non consommé).`, 'SUCCESS');
      } else if (res.success) {
        this.state.global_sent_today++;
        this.state.campaigns[campaignId] = (this.state.campaigns[campaignId] || 0) + 1;
        this.state.last_sent_at = new Date().toISOString();
        this.saveState();
        this.addLog(campaignId, `Envoyé à ${contact.email} (${this.state.global_sent_today}/${this.dailyLimit} aujourd'hui).`, 'SUCCESS');
      } else {
        this.addLog(campaignId, `Échec pour ${contact.email} : ${res.error || 'erreur inconnue'}`, 'ERROR');
        if (res.fatal) return stop('PAUSED_CIRCUIT_BREAKER', `Coupe-circuit : ${res.error}. Campagne mise en pause.`, 'ERROR');
      }

      if (worker.queue.length > 0) scheduleNext();
      else tick();
    };

    tick();
    return { success: true, mode: worker.mode, queue_count: worker.queue.length };
  }

  stopCampaign(campaignId) {
    const worker = this.campaignWorkers.get(campaignId);
    if (!worker) return { success: false, error: 'Campagne introuvable.' };
    worker.isRunning = false;
    if (worker.timer) { clearInterval(worker.timer); clearTimeout(worker.timer); worker.timer = null; }
    worker.status = 'STOPPED';
    worker.next_dispatch_in_seconds = 0;
    this.addLog(campaignId, 'Campagne interrompue manuellement.', 'WARNING');
    return { success: true };
  }

  getOverallStatus() {
    const campaigns_status = {};
    this.campaignWorkers.forEach((w, cid) => {
      campaigns_status[cid] = { isRunning: w.isRunning, status: w.status, mode: w.mode, remaining_contacts: w.queue.length, current_contact: w.current_contact, next_dispatch_in_seconds: w.next_dispatch_in_seconds };
    });
    return { global_sent_today: this.sentToday(), daily_max: this.dailyLimit, campaigns_status, logs: this.logs };
  }
}

module.exports = { DispatchManager };
