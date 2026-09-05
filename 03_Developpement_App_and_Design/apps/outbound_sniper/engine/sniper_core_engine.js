/**
 * SNIPER CORE ENGINE — MOTEUR D'EXÉCUTION UNIFIÉ (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 170 lignes)
 */

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');
const { SmtpClient } = require('./smtp_client');
const { DispatchManager } = require('./dispatch_manager');
const { SenderManager } = require('./sender_manager');
const { DeepEmailVerifier } = require('./deep_email_verifier');
const { EmailPatternResolver } = require('./email_pattern_resolver');
const { VariableResolver } = require('./variable_resolver');

const { HunterClient } = require('./hunter_client');

const DATA_DIR = path.join(__dirname, '../data');
const CONTACTS_DIR = path.join(DATA_DIR, 'campaign_contacts');

class SniperCoreEngine {
  constructor() {
    this.config = this.loadJSON('config.json') || {};
    this.campaigns = this.loadJSON('campaigns.json') || [];
    this.senderManager = new SenderManager();
    this.emailVerifier = new DeepEmailVerifier();
    this.patternResolver = new EmailPatternResolver();
    this.hunterClient = new HunterClient(this.config.hunter?.api_key || '');
    this.smtpClient = new SmtpClient({
      user: this.config.sender?.email || '',
      pass: this.config.sender?.app_password || ''
    });
    this.dispatchManager = new DispatchManager({
      dailyLimit: this.config.daily_send_limit || 30,
      safetyPauseThreshold: this.config.safety_pause_threshold || 28,
      minDelay: this.config.min_delay_seconds || 180,
      maxDelay: this.config.max_delay_seconds || 300
    });
  }

  loadJSON(filename) {
    try {
      const p = path.join(DATA_DIR, filename);
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch {}
    return null;
  }

  saveJSON(filename, data) {
    try {
      const p = path.join(DATA_DIR, filename);
      fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
    } catch {}
  }

  getCampaignContacts(campaignId) {
    try {
      const p = path.join(CONTACTS_DIR, `${campaignId}.json`);
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch {}
    const general = this.loadJSON('contacts.json') || [];
    return general.slice(0, 15);
  }

  saveCampaignContacts(campaignId, contacts) {
    try {
      if (!fs.existsSync(CONTACTS_DIR)) fs.mkdirSync(CONTACTS_DIR, { recursive: true });
      const p = path.join(CONTACTS_DIR, `${campaignId}.json`);
      fs.writeFileSync(p, JSON.stringify(contacts, null, 2), 'utf-8');
      return true;
    } catch {
      return false;
    }
  }

  async verifyContact(contact) {
    return this.emailVerifier.verify(contact);
  }

  async verifyCampaignContacts(campaignId) {
    const list = this.getCampaignContacts(campaignId);
    const updated = await this.emailVerifier.verifyBatch(list);
    this.saveCampaignContacts(campaignId, updated);
    return updated;
  }

  async resolveContactPattern(contact) {
    const res = await this.patternResolver.resolveBestEmail(contact, this.emailVerifier);
    if ((res.status !== 'VERIFIED' || res.score < 80) && this.hunterClient.isConfigured()) {
      const domain = contact.domain || (contact.email?.includes('@') ? contact.email.split('@')[1] : null);
      if (domain && contact.prenom) {
        const hRes = await this.hunterClient.findEmail(domain, contact.prenom, contact.nom);
        if (hRes.success && hRes.email) {
          return {
            ...contact,
            email: hRes.email,
            status: 'VERIFIED',
            score: hRes.score || 85,
            reason: `Hunter.io Email Finder (${hRes.score || 85}%)`,
            pattern_label: 'Hunter.io API',
            pattern_resolved: true,
            hunter_verified: true
          };
        }
      }
    }
    return res;
  }

  generatePatternCandidates(prenom, nom, domain) {
    return this.patternResolver.generateCandidates(prenom, nom, domain);
  }

  setHunterApiKey(key) {
    this.config.hunter = { ...(this.config.hunter || {}), api_key: key };
    this.hunterClient = new HunterClient(key);
    this.saveJSON('config.json', this.config);
    return { success: true };
  }
  async verifyHunterEmail(email) { return this.hunterClient.verifyEmail(email); }
  async findHunterEmail(domain, first, last) { return this.hunterClient.findEmail(domain, first, last); }
  async getHunterAccount() { return this.hunterClient.getAccountInfo(); }

  auditCampaignVariables(campaignId) {
    const camp = this.campaigns.find(c => c.id === campaignId) || this.campaigns[0];
    const contacts = this.getCampaignContacts(campaignId);
    return VariableResolver.auditCampaign(camp, contacts);
  }

  generateEmailPreview(contact, campaignId, senderId) {
    const camp = this.campaigns.find(c => c.id === campaignId) || this.campaigns[0];
    const sender = this.senderManager.getSender(senderId || camp.sender_id);
    const baseUrl = this.config.tracking?.vm_tracking_url || 'http://localhost:3000';
    const uid = contact?.id || 'usr_demo';
    const cid = camp?.id || 'camp_1';

    const subRes = VariableResolver.resolveTemplate(camp?.subject || '', contact);
    const bodyRes = VariableResolver.resolveTemplate(camp?.body || '', contact);
    const ctaRes = VariableResolver.resolveTemplate(camp?.cta_label || 'Découvrir', contact);

    const subject = subRes.text;
    const bodyText = bodyRes.text;
    const isStealth = camp?.stealth_mode !== false;
    const targetUrl = camp?.target_url || 'https://aevum.app';
    const openUrl = isStealth ? null : `${baseUrl}/t/open?cid=${cid}&uid=${uid}`;
    const clickUrl = isStealth ? targetUrl : `${baseUrl}/t/click?cid=${cid}&uid=${uid}&target=${encodeURIComponent(targetUrl)}`;
    const ctaHtml = ctaRes.text?.trim() ? `<p><a href="${clickUrl}" style="color: #10B981; font-weight: 600; text-decoration: underline;">👉 ${ctaRes.text}</a></p>` : '';
    const pixelHtml = isStealth ? '' : `<img src="${openUrl}" width="1" height="1" style="display:none;" alt="" />`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1F2937;">
        ${bodyText.replace(/\n\n/g, '<br><br>')}<br><br>${ctaHtml}
        <br><p style="font-size: 11px; color: #9CA3AF;">${sender?.display_name || 'Antoine Lecerf'} — ${sender?.signature || 'Aevum'}<br>Répondez 'STOP' pour ne plus recevoir d'emails.</p>${pixelHtml}
      </div>
    `;

    return {
      subject, bodyText, htmlBody, openUrl, clickUrl, sender, isStealth,
      campaignName: camp?.name, isValid: subRes.isValid && bodyRes.isValid,
      unresolvedVars: Array.from(new Set([...subRes.unresolvedVars, ...bodyRes.unresolvedVars]))
    };
  }

  recordTrackingEvent(type, cid, uid, extra = {}) {
    let tracking = this.loadJSON('tracking_events.json');
    if (!tracking || Array.isArray(tracking) || !tracking.events) {
      tracking = { total_opens: 0, total_clicks: 0, events: Array.isArray(tracking) ? tracking : [] };
    }
    if (type === 'OPEN' && !extra.is_bot) tracking.total_opens = (tracking.total_opens || 0) + 1;
    if (type === 'CLICK' && !extra.is_bot) tracking.total_clicks = (tracking.total_clicks || 0) + 1;

    tracking.events.push({
      type,
      campaign_id: cid,
      contact_id: uid,
      timestamp: new Date().toISOString(),
      ...extra
    });

    this.saveJSON('tracking_events.json', tracking);
    return tracking;
  }

  async syncVmTrackingEvents(targetUrl) {
    const baseUrl = targetUrl || this.config.tracking?.vm_tracking_url || 'http://88.96.57.168:3000';
    return new Promise((resolve) => {
      try {
        const u = new URL(`${baseUrl}/api/tracking/events`);
        const mod = u.protocol === 'https:' ? https : http;
        const req = mod.get(u.toString(), { timeout: 5000 }, (res) => {
          let data = '';
          res.on('data', c => { data += c; });
          res.on('end', () => {
            try {
              const remote = JSON.parse(data);
              let local = this.loadJSON('tracking_events.json');
              if (!local || Array.isArray(local) || !local.events) {
                local = { total_opens: 0, total_clicks: 0, events: [] };
              }
              const existing = new Set((local.events || []).map(e => `${e.type}_${e.contact_id}_${e.timestamp}`));
              let added = 0;
              for (const ev of (remote.events || [])) {
                const k = `${ev.type}_${ev.contact_id}_${ev.timestamp}`;
                if (!existing.has(k)) { existing.add(k); local.events.push(ev); added++; }
              }
              local.total_opens = local.events.filter(e => e.type === 'OPEN' && !e.is_bot).length;
              local.total_clicks = local.events.filter(e => e.type === 'CLICK' && !e.is_bot).length;
              this.saveJSON('tracking_events.json', local);
              resolve({ success: true, addedCount: added, totalEvents: local.events.length, store: local });
            } catch { resolve({ success: false, error: 'Réponse JSON invalide de la VM' }); }
          });
        });
        req.on('error', (e) => resolve({ success: false, error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Timeout (5s)' }); });
      } catch (e) { resolve({ success: false, error: e.message }); }
    });
  }

  async pingVm(targetUrl) {
    const baseUrl = targetUrl || this.config.tracking?.vm_tracking_url || 'http://88.96.57.168:3000';
    return new Promise((resolve) => {
      try {
        const u = new URL(`${baseUrl}/api/tracking/ping`);
        const mod = u.protocol === 'https:' ? https : http;
        const req = mod.get(u.toString(), { timeout: 3500 }, (res) => {
          let data = '';
          res.on('data', c => { data += c; });
          res.on('end', () => {
            try { resolve(JSON.parse(data)); } catch { resolve({ success: false, error: 'Réponse invalide' }); }
          });
        });
        req.on('error', (e) => resolve({ success: false, error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Timeout' }); });
      } catch (e) { resolve({ success: false, error: e.message }); }
    });
  }
}

module.exports = { SniperCoreEngine };
