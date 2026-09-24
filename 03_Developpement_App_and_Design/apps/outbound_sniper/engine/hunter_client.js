/**
 * HUNTER.IO API V2 CLIENT (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * Permet la vérification d'email et la recherche de décideur via l'API Hunter.io.
 */

const https = require('node:https');

class HunterClient {
  constructor(apiKey = '') {
    this.apiKey = (apiKey || '').trim();
    this.baseUrl = 'https://api.hunter.io/v2';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.length >= 20);
  }

  request(endpoint, params = {}) {
    if (!this.isConfigured()) {
      return Promise.resolve({ success: false, error: 'Clé API Hunter.io non configurée.' });
    }

    const q = new URLSearchParams({ ...params, api_key: this.apiKey });
    const url = `${this.baseUrl}${endpoint}?${q.toString()}`;

    return new Promise((resolve) => {
      const req = https.get(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'OutboundSniper/2.2' },
        timeout: 6000
      }, (res) => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true, data: parsed.data });
            } else {
              const errMsg = parsed.errors?.[0]?.details || parsed.errors?.[0]?.message || `Erreur Hunter HTTP ${res.statusCode}`;
              resolve({ success: false, error: errMsg, statusCode: res.statusCode });
            }
          } catch (e) {
            resolve({ success: false, error: `Erreur parsing Hunter : ${e.message}` });
          }
        });
      });

      req.on('error', err => resolve({ success: false, error: `Erreur réseau Hunter : ${err.message}` }));
      req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Délai d\'attente Hunter dépassé (6s).' }); });
    });
  }

  async getAccountInfo() {
    const res = await this.request('/account');
    if (!res.success) return res;
    const d = res.data || {};
    const reqs = d.requests || {};
    const searches = reqs.searches || { used: d.calls?.used || 0, available: d.calls?.available || 0 };
    const verifs = reqs.verifications || { used: 0, available: 0 };
    return {
      success: true,
      email: d.email,
      plan_name: d.plan_name || 'Free',
      reset_date: d.reset_date || null,
      searches_available: searches.available ?? 0,
      searches_used: searches.used ?? 0,
      verifications_available: verifs.available ?? 0,
      verifications_used: verifs.used ?? 0,
      total_available: (searches.available ?? 0) + (verifs.available ?? 0)
    };
  }

  /** Mappe le verdict Hunter (champ `status`) vers les statuts internes, sans extrapolation. */
  async verifyEmail(email) {
    if (!email || !email.includes('@')) return { success: false, error: 'Email invalide.' };
    const res = await this.request('/email-verifier', { email });
    if (!res.success) return res;
    const d = res.data || {};
    const map = { valid: 'VERIFIED', invalid: 'INVALID_MAILBOX', accept_all: 'CATCH_ALL', disposable: 'DISPOSABLE' };
    const status = map[d.status] || (d.status === 'webmail' && d.result === 'deliverable' ? 'VERIFIED' : 'UNVERIFIED');
    return { success: true, email: d.email, status, hunter_score: d.score ?? null, reason: `Hunter.io : ${d.status || d.result || 'inconnu'}` };
  }

  async findEmail(domain, firstName, lastName) {
    if (!domain || !firstName) return { success: false, error: 'Domaine et prénom requis.' };
    const res = await this.request('/email-finder', {
      domain,
      first_name: firstName,
      last_name: lastName || ''
    });
    if (!res.success) return res;

    const d = res.data || {};
    return {
      success: true,
      email: d.email,
      hunter_score: d.score ?? null,
      verification_status: d.verification?.status || null,
      domain: d.domain,
      position: d.position
    };
  }
}

module.exports = { HunterClient };
