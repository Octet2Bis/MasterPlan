/**
 * DEEP EMAIL VERIFIER — MOTEUR D'ARMURE EN CASCADE (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 240 lignes)
 * Cascade : Typo -> Jetables/Rôles -> HTTPS Microsoft Direct -> Passerelles -> MX -> Fast Probe
 */
const dns = require('node:dns').promises;
const net = require('node:net');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, '../data');

class DeepEmailVerifier {
  constructor() {
    this.disposableDomains = new Set(this.loadJSON('disposable_domains.json', []));
    const hygiene = this.loadJSON('email_hygiene_rules.json', {});
    this.roleAccounts = new Set(hygiene.role_accounts || []);
    this.freeMailProviders = new Set(hygiene.free_mail_providers || []);
    this.legacyFaiDomains = new Set(hygiene.legacy_fai_domains || []);
    this.typoMappings = hygiene.typo_mappings || {};
    this.securityGateways = hygiene.security_gateways || {};
    this.domainCache = new Map();
    this.port25Status = undefined;
  }

  loadJSON(file, fallback) {
    try {
      const p = path.join(DATA_DIR, file);
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch {}
    return fallback;
  }

  validateSyntax(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return re.test(String(email).trim().toLowerCase());
  }

  detectSecurityGateway(mxHost) {
    if (!mxHost) return null;
    const lower = mxHost.toLowerCase();
    for (const [name, gw] of Object.entries(this.securityGateways)) {
      if (gw.signatures?.some(sig => lower.includes(sig))) return { name, tip: gw.tip };
    }
    return null;
  }

  async checkCloudTenant(email, mxHost) {
    if (mxHost && /google\.com|googlemail\.com|aspmx/i.test(mxHost)) {
      return { isCloud: true, provider: 'GOOGLE_WORKSPACE', label: 'Google Workspace' };
    }
    return new Promise((resolve) => {
      const url = `https://login.microsoftonline.com/getuserrealm.srf?login=${encodeURIComponent(email)}&json=1`;
      https.get(url, { timeout: 2000 }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const ns = JSON.parse(data).NameSpaceType;
            if (ns === 'Managed' || ns === 'Federated') return resolve({ isCloud: true, provider: 'MICROSOFT_365', label: 'Microsoft 365' });
          } catch {}
          resolve({ isCloud: false, provider: null, label: null });
        });
      }).on('error', () => resolve({ isCloud: false, provider: null, label: null }));
    });
  }

  async checkMSAccount(email) {
    return new Promise((resolve) => {
      const data = JSON.stringify({ username: email, isOtherIdpSupported: true });
      const req = https.request({
        hostname: 'login.microsoftonline.com', path: '/common/GetCredentialType', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
      }, (res) => {
        let b = '';
        res.on('data', chunk => { b += chunk; });
        res.on('end', () => {
          try {
            const j = JSON.parse(b);
            if (j.IfExistsResult === 1) return resolve({ exists: false, isMS: true });
            if (j.IfExistsResult === 0 || j.IfExistsResult === 5) return resolve({ exists: true, isMS: true });
          } catch {}
          resolve({ exists: null, isMS: false });
        });
      });
      req.on('error', () => resolve({ exists: null, isMS: false }));
      req.setTimeout(2500, () => { req.destroy(); resolve({ exists: null, isMS: false }); });
      req.write(data);
      req.end();
    });
  }

  async resolvePrimaryMx(domain) {
    try {
      const records = await dns.resolveMx(domain);
      if (Array.isArray(records) && records.length > 0) {
        records.sort((a, b) => a.priority - b.priority);
        return records[0].exchange;
      }
    } catch {}
    try {
      const res = await dns.lookup(domain);
      return res?.address ? domain : null;
    } catch { return null; }
  }

  async isPort25Usable() {
    if (this.port25Status !== undefined) return this.port25Status;
    return new Promise((resolve) => {
      const s = net.createConnection(25, '127.0.0.1');
      const t = setTimeout(() => { s.destroy(); this.port25Status = false; resolve(false); }, 150);
      s.on('error', () => { clearTimeout(t); s.destroy(); this.port25Status = false; resolve(false); });
    });
  }

  async probeSmtpRecipient(mxHost, senderDomain, recipientEmail, timeout = 1500) {
    if (!(await this.isPort25Usable())) return { deliverable: false, code: 'PORT25_BLOCKED' };
    return new Promise((resolve) => {
      let socket, buffer = '', step = 'INIT', resolved = false;
      const finish = (result) => {
        if (resolved) return;
        resolved = true;
        try { if (socket && !socket.destroyed) { socket.write('QUIT\r\n'); socket.end(); socket.destroy(); } } catch {}
        resolve(result);
      };
      const timer = setTimeout(() => finish({ deliverable: false, code: 'TIMEOUT' }), timeout);
      try {
        socket = net.createConnection(25, mxHost);
        socket.setEncoding('utf-8');
        socket.on('data', (data) => {
          buffer += data;
          const lines = buffer.split('\r\n');
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.trim()) continue;
            const code = parseInt(line.substring(0, 3), 10);
            if (step === 'INIT' && (code === 220 || line.startsWith('220 '))) {
              step = 'HELO';
              socket.write(`HELO ${senderDomain || 'aevum.app'}\r\n`);
            } else if (step === 'HELO' && (code === 250 || line.startsWith('250 '))) {
              step = 'MAIL_FROM';
              socket.write(`MAIL FROM:<probe@${senderDomain || 'aevum.app'}>\r\n`);
            } else if (step === 'MAIL_FROM' && (code === 250 || line.startsWith('250 '))) {
              step = 'RCPT_TO';
              socket.write(`RCPT TO:<${recipientEmail}>\r\n`);
            } else if (step === 'RCPT_TO') {
              clearTimeout(timer);
              if (code === 250) return finish({ deliverable: true, code: 250 });
              if (code >= 550 && code <= 554) return finish({ deliverable: false, code });
              return finish({ deliverable: false, code });
            }
          }
        });
        socket.on('error', () => { clearTimeout(timer); finish({ deliverable: false, code: 'ERR_PORT25' }); });
      } catch { clearTimeout(timer); finish({ deliverable: false, code: 'EXCEPTION' }); }
    });
  }

  async checkDomainCatchAll(domain, mxHost) {
    if (this.domainCache.has(domain)) return this.domainCache.get(domain);
    const fakeProbe = `probe_${Date.now().toString(36)}@${domain}`;
    const probe = await this.probeSmtpRecipient(mxHost, 'aevum.app', fakeProbe, 1200);
    const info = { isCatchAll: Boolean(probe.deliverable && probe.code === 250), mxHost };
    this.domainCache.set(domain, info);
    return info;
  }

  async verify(contact) {
    const rawEmail = String(contact.email || '').trim().toLowerCase();
    if (!this.validateSyntax(rawEmail)) return { ...contact, status: 'INVALID', score: 0, reason: 'Syntaxe invalide' };

    const [userPrefix, domain] = rawEmail.split('@');
    const cleanDomain = this.typoMappings[domain] || domain;
    const cleanEmail = `${userPrefix}@${cleanDomain}`;

    if (this.disposableDomains.has(cleanDomain)) return { ...contact, email: cleanEmail, status: 'DISPOSABLE', score: 0, reason: 'Domaine jetable' };

    const isRole = this.roleAccounts.has(userPrefix);
    const isFreeMail = this.freeMailProviders.has(cleanDomain);
    const isLegacyFai = this.legacyFaiDomains.has(cleanDomain);
    const mxHost = await this.resolvePrimaryMx(cleanDomain);
    if (!mxHost) return { ...contact, email: cleanEmail, status: 'NO_MX', score: 0, reason: 'Aucun serveur MX' };

    const gateway = this.detectSecurityGateway(mxHost);
    const cloud = await this.checkCloudTenant(cleanEmail, mxHost);
    const baseMeta = { email: cleanEmail, is_role: isRole, is_freemail: isFreeMail, cloud_provider: cloud.provider, cloud_label: cloud.label, security_gateway: gateway?.name, security_tip: gateway?.tip, typo_suggestion: cleanDomain !== domain ? cleanEmail : null };

    if (isLegacyFai) return { ...contact, ...baseMeta, status: 'RISKY', score: 35, reason: 'Ancien domaine FAI obsolète' };

    // Sonde Directe HTTPS Microsoft (Hotmail, Outlook, M365)
    if (/hotmail|outlook|live|msn/i.test(cleanDomain) || cloud.provider === 'MICROSOFT_365') {
      const ms = await this.checkMSAccount(cleanEmail);
      if (ms.exists === false) return { ...contact, ...baseMeta, status: 'INVALID_MAILBOX', score: 0, reason: 'Boîte inexistante (Microsoft 550)' };
      if (ms.exists === true) return { ...contact, ...baseMeta, status: isRole ? 'ROLE_ACCOUNT' : 'VERIFIED', score: isRole ? 70 : 100, cloud_provider: 'MICROSOFT_365', cloud_label: 'Microsoft 365 Certifié', reason: isRole ? 'Rôle Microsoft' : 'Compte Microsoft certifié actif' };
    }

    const domainInfo = await this.checkDomainCatchAll(cleanDomain, mxHost);
    if (domainInfo.isCatchAll) return { ...contact, ...baseMeta, status: 'CATCH_ALL', score: isRole ? 35 : (cloud.isCloud ? 68 : 45), reason: isRole ? 'Rôle sur Catch-All' : 'Domaine Catch-All' };

    const probe = await this.probeSmtpRecipient(mxHost, 'aevum.app', cleanEmail, 1500);
    if (probe.deliverable) return { ...contact, ...baseMeta, status: isRole ? 'ROLE_ACCOUNT' : 'VERIFIED', score: isRole ? 70 : 98, reason: isRole ? 'Email de rôle' : 'Boîte active (250 OK)' };
    if (probe.code >= 550 && probe.code <= 554) return { ...contact, ...baseMeta, status: 'INVALID_MAILBOX', score: 0, reason: 'Boîte inexistante (550 User Unknown)' };

    const isRiskyWebmail = isFreeMail && /orange|wanadoo|sfr|laposte|free/i.test(cleanDomain);
    return {
      ...contact, ...baseMeta,
      status: isRole ? 'ROLE_ACCOUNT' : (isRiskyWebmail ? 'RISKY' : 'VERIFIED'),
      score: isRole ? 50 : (cloud.isCloud ? 95 : (isRiskyWebmail ? 65 : 85)),
      reason: isRiskyWebmail ? 'Webmail FAI (Rebond potentiel)' : (cloud.isCloud ? `Organisation ${cloud.label} (Domaine certifié)` : 'Serveur MX actif (Non vérifiable en direct)')
    };
  }

  async verifyBatch(contacts, concurrency = 15) {
    const results = new Array(contacts.length);
    let index = 0;
    const worker = async () => {
      while (index < contacts.length) {
        const i = index++;
        results[i] = await this.verify(contacts[i]);
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, contacts.length) }, () => worker()));
    return results;
  }
}

module.exports = { DeepEmailVerifier };
