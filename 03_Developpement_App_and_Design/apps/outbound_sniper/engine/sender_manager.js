/**
 * SENDER MANAGER — GESTION DES IDENTITÉS & SOUS-DOMAINES (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 180 lignes)
 * Gère le découplage Enveloppe/From et la validation DNS des sous-domaines anti-brûlure.
 */

const dns = require('node:dns').promises;
const fs = require('node:fs');
const path = require('node:path');

const SENDERS_FILE = path.join(__dirname, '../data/senders.json');

class SenderManager {
  constructor() {
    this.senders = this.loadSenders();
  }

  loadSenders() {
    try {
      if (fs.existsSync(SENDERS_FILE)) {
        return JSON.parse(fs.readFileSync(SENDERS_FILE, 'utf-8'));
      }
    } catch {}
    return [];
  }

  saveSenders() {
    try {
      fs.writeFileSync(SENDERS_FILE, JSON.stringify(this.senders, null, 2), 'utf-8');
    } catch {}
  }

  getSender(id) {
    return this.senders.find(s => s.id === id) || this.senders[0] || null;
  }

  async checkSubdomainDNS(domain) {
    const report = { domain, has_mx: false, has_spf: false, score: 0, recommendations: [] };
    if (!domain) return report;

    try {
      const mxRecords = await dns.resolveMx(domain);
      if (Array.isArray(mxRecords) && mxRecords.length > 0) report.has_mx = true;
    } catch {
      report.recommendations.push("Ajoutez un enregistrement MX pointant vers Google Workspace ou votre relais.");
    }

    try {
      const txtRecords = await dns.resolveTxt(domain);
      const flat = txtRecords.flat().join(' ');
      if (flat.includes('v=spf1')) {
        report.has_spf = true;
        if (!flat.includes('_spf.google.com')) {
          report.recommendations.push("Incluez 'include:_spf.google.com' dans votre enregistrement SPF.");
        }
      } else {
        report.recommendations.push("Enregistrement SPF introuvable sur ce sous-domaine.");
      }
    } catch {
      report.recommendations.push("Aucun enregistrement TXT/SPF résolu sur ce sous-domaine.");
    }

    let score = 30;
    if (report.has_mx) score += 35;
    if (report.has_spf) score += 35;
    report.score = score;
    return report;
  }

  async addOrUpdateSender(payload) {
    const id = payload.id || `snd_${Date.now()}`;
    const domain = payload.send_as_email ? payload.send_as_email.split('@')[1] : null;
    let dnsStatus = { score: 100 };

    if (payload.is_subdomain && domain) {
      dnsStatus = await this.checkSubdomainDNS(domain);
    }

    const newSender = {
      id,
      name: payload.name || 'Nouvel Expéditeur',
      master_email: payload.master_email,
      send_as_email: payload.send_as_email,
      display_name: payload.display_name || 'Équipe Outbound',
      signature: payload.signature || '',
      is_subdomain: Boolean(payload.is_subdomain),
      subdomain: domain,
      dns_status: dnsStatus
    };

    const idx = this.senders.findIndex(s => s.id === id);
    if (idx >= 0) this.senders[idx] = newSender;
    else this.senders.push(newSender);

    this.saveSenders();
    return newSender;
  }

  deleteSender(id) {
    this.senders = this.senders.filter(s => s.id !== id);
    this.saveSenders();
    return { success: true };
  }
}

module.exports = { SenderManager };
