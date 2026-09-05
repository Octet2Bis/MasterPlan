/**
 * EMAIL VERIFIER SERVICE — CASCADE DE VÉRIFICATION DÉTERMINISTE 0€ (Node.js 24)
 * Pilier : 01_GTM_Growth / 04_Outbound_and_CRM / Core (< 130 lignes)
 */

const dns = require('node:dns').promises;
const fs = require('node:fs');
const path = require('node:path');

const DISPOSABLE_FILE = path.join(__dirname, '../data/disposable_domains.json');

class EmailVerifierService {
  constructor() {
    this.disposableDomains = new Set(this.loadDisposableDomains());
  }

  loadDisposableDomains() {
    try {
      if (fs.existsSync(DISPOSABLE_FILE)) {
        return JSON.parse(fs.readFileSync(DISPOSABLE_FILE, 'utf-8'));
      }
    } catch {}
    return [];
  }

  validateSyntax(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return re.test(String(email).trim().toLowerCase());
  }

  async checkMxRecords(domain) {
    try {
      const records = await dns.resolveMx(domain);
      if (Array.isArray(records) && records.length > 0) return true;
    } catch {}

    // Fallback résilient : Résolution d'hôte via le résolveur natif de l'OS (getaddrinfo)
    try {
      const res = await dns.lookup(domain);
      return Boolean(res && res.address);
    } catch {
      return false;
    }
  }

  isDisposable(domain) {
    return this.disposableDomains.has(domain.toLowerCase());
  }

  async verifyEmail(email) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    
    // 1. Validation syntaxe
    if (!this.validateSyntax(cleanEmail)) {
      return { email: cleanEmail, valid: false, reason: 'INVALID_SYNTAX', score: 0 };
    }

    const domain = cleanEmail.split('@')[1];

    // 2. Filtre anti-poubelle
    if (this.isDisposable(domain)) {
      return { email: cleanEmail, valid: false, reason: 'DISPOSABLE_DOMAIN', score: 0 };
    }

    // 3. Résolution DNS MX
    const hasMx = await this.checkMxRecords(domain);
    if (!hasMx) {
      return { email: cleanEmail, valid: false, reason: 'NO_MX_RECORDS', score: 0 };
    }

    return {
      email: cleanEmail,
      domain,
      valid: true,
      reason: 'VERIFIED_DELIVERABLE',
      score: 95,
      timestamp: new Date().toISOString()
    };
  }

  async verifyBatch(emails) {
    const results = [];
    for (const email of emails) {
      const res = await this.verifyEmail(email);
      results.push(res);
    }
    return {
      total: results.length,
      valid_count: results.filter(r => r.valid).length,
      invalid_count: results.filter(r => !r.valid).length,
      details: results
    };
  }
}

if (require.main === module) {
  const verifier = new EmailVerifierService();
  console.log('=== TEST DU VÉRIFICATEUR CASCADE 0€ ===');
  const testList = ['test@google.com', 'bad-email-format', 'temp@yopmail.com', 'contact@invalid-domain-xyz123.org'];
  verifier.verifyBatch(testList).then(report => {
    console.log(`📊 Rapport : ${report.valid_count}/${report.total} valides`);
    report.details.forEach(d => console.log(`  • ${d.email} -> [${d.reason}] (Score: ${d.score})`));
  });
}

module.exports = { EmailVerifierService };
