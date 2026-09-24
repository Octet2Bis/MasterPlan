/**
 * DEEP EMAIL VERIFIER — VÉRIFICATION EN CASCADE, SANS FAUX POSITIF (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * Cascade : syntaxe → typo → jetable → MX → sonde SMTP réelle (RCPT TO + adresse aléatoire pour le catch-all).
 * Règle : `VERIFIED` uniquement sur preuve (250 sur la boîte ET refus de l'adresse aléatoire).
 * Si le port 25 sortant est bloqué (cas fréquent chez les FAI et clouds), le statut est `UNVERIFIED`.
 */
const dns = require('node:dns').promises;
const net = require('node:net');
const os = require('node:os');
const crypto = require('node:crypto');
const { loadRef } = require('./store');

const CONNECT_TIMEOUT_MS = 5000;
const SESSION_TIMEOUT_MS = 12000;
const BLOCK_CACHE_MS = 10 * 60 * 1000;

class DeepEmailVerifier {
  constructor({ heloDomain, smtpPort = 25 } = {}) {
    this.disposableDomains = new Set(loadRef('disposable_domains.json', []));
    const hygiene = loadRef('email_hygiene_rules.json', {});
    this.roleAccounts = new Set(hygiene.role_accounts || []);
    this.freeMailProviders = new Set(hygiene.free_mail_providers || []);
    this.legacyFaiDomains = new Set(hygiene.legacy_fai_domains || []);
    this.typoMappings = hygiene.typo_mappings || {};
    this.securityGateways = hygiene.security_gateways || {};
    this.heloDomain = heloDomain || os.hostname() || 'localhost';
    this.smtpPort = smtpPort;
    this.mxCache = new Map();
    this.connectFailures = 0;
    this.port25BlockedUntil = 0;
  }

  validateSyntax(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return re.test(String(email).trim().toLowerCase());
  }

  detectSecurityGateway(mxHost) {
    const lower = String(mxHost || '').toLowerCase();
    for (const [name, gw] of Object.entries(this.securityGateways)) {
      if (gw.signatures?.some(sig => lower.includes(sig))) return { name, tip: gw.tip };
    }
    return null;
  }

  providerFromMx(mxHost) {
    const h = String(mxHost || '').toLowerCase();
    if (/google\.com|googlemail\.com/.test(h)) return 'Google Workspace';
    if (/outlook\.com|protection\.outlook/.test(h)) return 'Microsoft 365';
    return null;
  }

  async resolvePrimaryMx(domain) {
    if (this.mxCache.has(domain)) return this.mxCache.get(domain);
    let mx = null;
    try {
      const records = await dns.resolveMx(domain);
      if (records.length > 0) mx = records.sort((a, b) => a.priority - b.priority)[0].exchange || null;
    } catch (e) {
      // Seules les réponses DNS définitives prouvent l'absence de MX ; une panne réseau n'invalide pas l'adresse.
      if (!['ENOTFOUND', 'ENODATA'].includes(e.code)) throw e;
    }
    this.mxCache.set(domain, mx);
    return mx;
  }

  isPort25Blocked() { return Date.now() < this.port25BlockedUntil; }

  /**
   * Ouvre UNE session SMTP sur le MX et teste chaque destinataire (RCPT TO), sans jamais envoyer de DATA.
   * @returns {Promise<{reachable: boolean, codes: number[]}>} reachable=false si connexion impossible (port 25 bloqué).
   */
  smtpSession(mxHost, recipients) {
    return new Promise((resolve) => {
      const codes = [];
      let connected = false, buffer = '', step = 'BANNER', done = false, socket;
      const finish = (reachable) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { socket.write('QUIT\r\n'); socket.destroy(); } catch {}
        resolve({ reachable, codes });
      };
      const timer = setTimeout(() => finish(connected), SESSION_TIMEOUT_MS);
      socket = net.createConnection({ host: mxHost, port: this.smtpPort });
      socket.setTimeout(CONNECT_TIMEOUT_MS, () => finish(connected));
      socket.on('connect', () => { connected = true; socket.setTimeout(0); });
      socket.on('error', () => finish(connected));
      socket.setEncoding('utf-8');
      socket.on('data', (chunk) => {
        buffer += chunk;
        const lines = buffer.split('\r\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!/^\d{3} /.test(line)) continue; // ignore les lignes intermédiaires "250-..."
          const code = parseInt(line.slice(0, 3), 10);
          if (step === 'BANNER') {
            if (code !== 220) return finish(true);
            step = 'HELO'; socket.write(`EHLO ${this.heloDomain}\r\n`);
          } else if (step === 'HELO') {
            if (code !== 250) return finish(true);
            step = 'MAIL'; socket.write('MAIL FROM:<>\r\n');
          } else if (step === 'MAIL') {
            if (code !== 250) return finish(true);
            step = 'RCPT'; socket.write(`RCPT TO:<${recipients[0]}>\r\n`);
          } else if (step === 'RCPT') {
            codes.push(code);
            if (codes.length >= recipients.length) return finish(true);
            socket.write(`RCPT TO:<${recipients[codes.length]}>\r\n`);
          }
        }
      });
    });
  }

  async probeMailbox(mxHost, email, domain) {
    if (this.isPort25Blocked()) return { reachable: false };
    const randomAddr = `sniper-${crypto.randomBytes(6).toString('hex')}@${domain}`;
    const res = await this.smtpSession(mxHost, [email, randomAddr]);
    if (!res.reachable) {
      if (++this.connectFailures >= 2) this.port25BlockedUntil = Date.now() + BLOCK_CACHE_MS;
      return { reachable: false };
    }
    this.connectFailures = 0;
    return { reachable: true, code: res.codes[0], randomCode: res.codes[1] };
  }

  async verify(contact) {
    const rawEmail = String(contact.email || '').trim().toLowerCase();
    if (!this.validateSyntax(rawEmail)) return { ...contact, status: 'INVALID', reason: 'Syntaxe invalide' };

    const [local, domain] = rawEmail.split('@');
    const cleanDomain = this.typoMappings[domain] || domain;
    const email = `${local}@${cleanDomain}`;
    const typo_suggestion = cleanDomain !== domain ? email : null;
    if (this.disposableDomains.has(cleanDomain)) return { ...contact, email, typo_suggestion, status: 'DISPOSABLE', reason: 'Domaine jetable' };

    let mxHost;
    try { mxHost = await this.resolvePrimaryMx(cleanDomain); } catch (e) {
      return { ...contact, email, typo_suggestion, status: 'UNVERIFIED', reason: `Résolution DNS impossible (${e.code || e.message}) : réessayez` };
    }
    if (!mxHost) return { ...contact, email, typo_suggestion, status: 'NO_MX', reason: 'Aucun serveur MX : le domaine ne reçoit pas d\'email' };

    const isRole = this.roleAccounts.has(local);
    const gateway = this.detectSecurityGateway(mxHost);
    const meta = { email, typo_suggestion, is_role: isRole, is_freemail: this.freeMailProviders.has(cleanDomain), cloud_label: this.providerFromMx(mxHost), security_gateway: gateway?.name || null, security_tip: gateway?.tip || null, verified_at: new Date().toISOString() };
    if (this.legacyFaiDomains.has(cleanDomain)) return { ...contact, ...meta, status: 'RISKY', reason: 'Ancien domaine FAI (rebond probable)' };

    const probe = await this.probeMailbox(mxHost, email, cleanDomain);
    if (!probe.reachable) return { ...contact, ...meta, status: 'UNVERIFIED', reason: 'MX valide, boîte non vérifiable (port 25 sortant bloqué)' };
    if (probe.code >= 550 && probe.code <= 553) return { ...contact, ...meta, status: 'INVALID_MAILBOX', reason: `Boîte refusée par le serveur (${probe.code})` };
    if (probe.code === 250 && probe.randomCode === 250) return { ...contact, ...meta, status: 'CATCH_ALL', reason: 'Domaine catch-all : accepte toute adresse, boîte non prouvée' };
    if (probe.code === 250 && probe.randomCode >= 550) return { ...contact, ...meta, status: isRole ? 'ROLE_ACCOUNT' : 'VERIFIED', reason: isRole ? 'Adresse générique (rôle) acceptée' : 'Boîte acceptée, adresse aléatoire refusée' };
    if (probe.code === 250) return { ...contact, ...meta, status: 'UNVERIFIED', reason: 'Boîte acceptée mais catch-all non déterminé' };
    return { ...contact, ...meta, status: 'UNVERIFIED', reason: `Réponse SMTP non concluante (${probe.code || 'aucune'})` };
  }

  async verifyBatch(contacts, concurrency = 5) {
    const results = new Array(contacts.length);
    let index = 0;
    const worker = async () => {
      while (index < contacts.length) {
        const i = index++;
        results[i] = await this.verify(contacts[i]);
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, contacts.length) }, worker));
    return results;
  }
}

module.exports = { DeepEmailVerifier };
