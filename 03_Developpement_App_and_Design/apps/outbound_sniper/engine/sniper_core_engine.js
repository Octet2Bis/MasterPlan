/**
 * SNIPER CORE ENGINE — FAÇADE MÉTIER (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * Campagnes, contacts, vérification, résolution de patterns, Hunter.io, tracking des clics.
 */
const http = require('node:http');
const https = require('node:https');
const store = require('./store');
const googleOAuth = require('./google_oauth');
const { DispatchManager } = require('./dispatch_manager');
const { DeepEmailVerifier } = require('./deep_email_verifier');
const { EmailPatternResolver } = require('./email_pattern_resolver');
const { HunterClient } = require('./hunter_client');

const TRACKING_FILE = 'tracking_events.json';
const contactsFile = (cid) => `campaign_contacts/${String(cid).replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;

function httpGetJson(url, headers = {}, timeout = 5000) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = (u.protocol === 'https:' ? https : http).get(u, { headers, timeout }, (res) => {
        let data = '';
        res.on('data', c => { data += c; });
        res.on('end', () => {
          if (res.statusCode === 401) return resolve({ success: false, error: 'Secret de tracking refusé par la passerelle (401).' });
          try { resolve({ success: true, json: JSON.parse(data) }); } catch { resolve({ success: false, error: 'Réponse JSON invalide de la passerelle.' }); }
        });
      });
      req.on('error', e => resolve({ success: false, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ success: false, error: `Délai dépassé (${timeout / 1000}s)` }); });
    } catch (e) { resolve({ success: false, error: e.message }); }
  });
}

class SniperCoreEngine {
  constructor() {
    this.config = store.loadConfig();
    this.campaigns = store.load('campaigns.json', []);
    this.patternResolver = new EmailPatternResolver();
    this.hunterClient = new HunterClient(this.config.hunter?.api_key || '');
    this.dispatchManager = new DispatchManager(this.config);
  }

  /** Patch utilisateur limité aux champs éditables depuis l'UI. */
  updateConfig(patch = {}) {
    const safe = {};
    if (patch.sender) safe.sender = { name: String(patch.sender.name || ''), signature: String(patch.sender.signature || '') };
    if (patch.tracking && typeof patch.tracking.vm_tracking_url === 'string') safe.tracking = { vm_tracking_url: patch.tracking.vm_tracking_url.trim() };
    if (patch.hunter && typeof patch.hunter.api_key === 'string') safe.hunter = { api_key: patch.hunter.api_key.trim() };
    store.saveConfigPatch(safe);
    this.config = store.loadConfig();
    this.hunterClient = new HunterClient(this.config.hunter?.api_key || '');
    this.dispatchManager.applyConfig(this.config);
  }

  /** Configuration renvoyée au navigateur : aucune clé ni secret. */
  publicConfig() {
    const { hunter, tracking, ...rest } = this.config;
    return { ...rest, tracking: { vm_tracking_url: tracking?.vm_tracking_url || '' }, hunter: { configured: this.hunterClient.isConfigured() } };
  }

  getCampaign(cid) { return this.campaigns.find(c => c.id === cid) || null; }

  saveCampaign(body) {
    const id = body.id || `camp_${Date.now()}`;
    const fields = ['name', 'subject', 'body', 'cta_label', 'target_url', 'track_clicks'];
    const clean = Object.fromEntries(fields.filter(k => body[k] !== undefined).map(k => [k, body[k]]));
    const idx = this.campaigns.findIndex(c => c.id === id);
    const campaign = idx >= 0 ? { ...this.campaigns[idx], ...clean } : { ...clean, id };
    if (idx >= 0) this.campaigns[idx] = campaign; else this.campaigns.push(campaign);
    store.save('campaigns.json', this.campaigns);
    return campaign;
  }

  /** Les statuts produits par l'ancien vérificateur (sans `verified_at`) ne sont pas fiables : à revérifier. */
  getCampaignContacts(cid) {
    const PROOF_STATUSES = ['VERIFIED', 'CATCH_ALL', 'ROLE_ACCOUNT', 'RISKY', 'UNVERIFIED', 'INVALID_MAILBOX'];
    return (cid ? store.load(contactsFile(cid), []) : []).map(c => (PROOF_STATUSES.includes(c.status) && !c.verified_at && !c.hunter_verified
      ? { ...c, status: 'PENDING', reason: 'Vérification antérieure à la v2 : à refaire' } : c));
  }
  saveCampaignContacts(cid, contacts) { store.save(contactsFile(cid), Array.isArray(contacts) ? contacts : []); return true; }

  newVerifier() {
    const sender = googleOAuth.connectedEmail();
    return new DeepEmailVerifier({ heloDomain: sender ? sender.split('@')[1] : undefined });
  }

  /** Vérifie les contacts non envoyés. Hunter (payant) n'est appelé que sur demande, pour les cas non concluants. */
  async verifyCampaignContacts(cid, { useHunter = false } = {}) {
    const verifier = this.newVerifier();
    const list = this.getCampaignContacts(cid);
    const pending = list.filter(c => c.status !== 'SENT');
    const verified = await verifier.verifyBatch(pending);
    if (useHunter && this.hunterClient.isConfigured()) {
      for (let i = 0; i < verified.length; i++) {
        if (!['UNVERIFIED', 'CATCH_ALL'].includes(verified[i].status)) continue;
        const h = await this.hunterClient.verifyEmail(verified[i].email);
        if (h.success) verified[i] = { ...verified[i], status: h.status, reason: h.reason, hunter_score: h.hunter_score, hunter_verified: true };
      }
    }
    const byId = new Map(verified.map(c => [c.id, c]));
    const updated = list.map(c => byId.get(c.id) || c);
    this.saveCampaignContacts(cid, updated);
    return updated;
  }

  async resolveContactPattern(contact) {
    const res = await this.patternResolver.resolveBestEmail(contact, this.newVerifier());
    if (res.status === 'VERIFIED' || !this.hunterClient.isConfigured()) return res;
    const domain = contact.domain || (contact.email?.includes('@') ? contact.email.split('@')[1] : null);
    if (!domain || !contact.prenom) return res;
    const h = await this.hunterClient.findEmail(domain, contact.prenom, contact.nom);
    if (!h.success || !h.email) return res;
    const proven = h.verification_status === 'valid';
    return {
      ...contact, email: h.email, hunter_score: h.hunter_score, hunter_verified: true, pattern_label: 'Hunter.io Email Finder',
      status: proven ? 'VERIFIED' : 'UNVERIFIED',
      reason: proven ? 'Hunter.io : adresse trouvée et vérifiée' : `Hunter.io : adresse trouvée, non vérifiée (confiance ${h.hunter_score ?? '?'}%)`
    };
  }

  async getHunterAccount() { return this.hunterClient.getAccountInfo(); }

  loadTracking() {
    const t = store.load(TRACKING_FILE, null);
    return { events: Array.isArray(t?.events) ? t.events : [] };
  }

  recordClick(event) {
    const t = this.loadTracking();
    t.events.push(event);
    store.save(TRACKING_FILE, t);
  }

  trackingHeaders() { return { Authorization: `Bearer ${this.config.tracking?.secret || ''}` }; }

  async syncVmTrackingEvents(url) {
    const base = (url || this.config.tracking?.vm_tracking_url || '').replace(/\/+$/, '');
    if (!base) return { success: false, error: 'URL publique de tracking non configurée.' };
    const r = await httpGetJson(`${base}/api/tracking/events`, this.trackingHeaders());
    if (!r.success) return r;
    const local = this.loadTracking();
    const key = (e) => `${e.type}_${e.campaign_id}_${e.contact_id}_${e.timestamp}`;
    const seen = new Set(local.events.map(key));
    let added = 0;
    for (const ev of (r.json.events || [])) {
      if (ev.type === 'CLICK' && !seen.has(key(ev))) { seen.add(key(ev)); local.events.push(ev); added++; }
    }
    store.save(TRACKING_FILE, local);
    return { success: true, addedCount: added, totalEvents: local.events.length };
  }

  async pingVm(url) {
    const base = (url || this.config.tracking?.vm_tracking_url || '').replace(/\/+$/, '');
    if (!base) return { success: false, error: 'URL publique de tracking non configurée.' };
    const r = await httpGetJson(`${base}/api/tracking/ping`, {}, 3500);
    return r.success ? { success: Boolean(r.json.success), service: r.json.service || null } : r;
  }

  /** Statistiques de clics d'une campagne. Les ouvertures ne sont pas mesurées (voir engine/tracking.js). */
  getStats(cid) {
    const clicks = this.loadTracking().events.filter(e => e.type === 'CLICK' && (!cid || e.campaign_id === cid));
    const human = clicks.filter(e => !e.is_bot);
    const sent = cid ? this.getCampaignContacts(cid).filter(c => c.status === 'SENT').length : 0;
    const clickerIds = [...new Set(human.map(e => e.contact_id))];
    const unique = clickerIds.length;
    return {
      sent, human_clicks: human.length, bot_clicks: clicks.length - human.length, unique_clickers: unique, clicker_ids: clickerIds,
      click_rate: sent > 0 ? Math.round((unique / sent) * 1000) / 10 : 0,
      events: clicks.slice(-50).reverse()
    };
  }
}

module.exports = { SniperCoreEngine, httpGetJson };
