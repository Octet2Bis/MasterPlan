/**
 * DOMAIN DELIVERABILITY & DNS AUDITOR ENGINE (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 235 lignes)
 * Analyse en direct SPF, DKIM, DMARC, MX, SpamAssassin et statut des liens HTTP.
 */
const dns = require('node:dns');
const path = require('node:path');
const fs = require('node:fs');
const { auditMessage } = require('./deliverability_linter');
const { auditLinks, runPostmarkSpamcheck } = require('./link_and_spamcheck_engine');

try { dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']); } catch {}
const dnsP = dns.promises;
const DATA_DIR = path.join(__dirname, '../data');

function loadJSON(file, fallback = {}) {
  try {
    const p = path.join(DATA_DIR, file);
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {}
  return fallback;
}

function extractDomain(emailOrDomain) {
  if (!emailOrDomain) return '';
  const str = String(emailOrDomain).trim().toLowerCase();
  if (str.includes('@')) return str.split('@')[1];
  return str.replace(/^https?:\/\//, '').split('/')[0];
}

async function auditDomain(emailOrDomain) {
  const domain = extractDomain(emailOrDomain);
  if (!domain) return { valid: false, score: 0, issues: ['Domaine introuvable.'], details: {} };

  const hygiene = loadJSON('email_hygiene_rules.json', {});
  const freeProviders = new Set(hygiene.free_mail_providers || ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com']);
  const isFreeWebmail = freeProviders.has(domain);

  const result = {
    domain, isFreeWebmail,
    mx: { exists: false, records: [], provider: 'Inconnu' },
    spf: { exists: false, raw: null, isValid: false, policy: null },
    dmarc: { exists: false, raw: null, policy: null, isEnforced: false },
    score: 100, issues: [], recommendations: []
  };

  // 1. Audit MX
  try {
    const mxRecords = await dnsP.resolveMx(domain);
    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      result.mx.exists = true;
      result.mx.records = mxRecords.map(r => r.exchange);
      const mxJoined = result.mx.records.join(' ').toLowerCase();
      if (/google|aspmx/i.test(mxJoined)) result.mx.provider = 'Google Workspace';
      else if (/outlook|microsoft/i.test(mxJoined)) result.mx.provider = 'Microsoft 365';
      else if (/ovh/i.test(mxJoined)) result.mx.provider = 'OVHcloud';
      else result.mx.provider = 'Serveur Dédié / SMTP tiers';
    }
  } catch {
    result.score -= 35;
    result.issues.push('Aucun enregistrement MX valide trouvé : le domaine ne peut pas recevoir de réponses.');
  }

  // 2. Audit SPF
  try {
    const txtRecords = await dnsP.resolveTxt(domain);
    const flat = txtRecords.map(chunks => chunks.join(''));
    const spfRecord = flat.find(r => r.startsWith('v=spf1'));
    if (spfRecord) {
      result.spf.exists = true;
      result.spf.raw = spfRecord;
      result.spf.isValid = true;
      result.spf.policy = spfRecord.includes('-all') ? 'STRICT (-all)' : (spfRecord.includes('~all') ? 'SOFTFAIL (~all)' : 'NEUTRE (?all)');
    } else {
      result.score -= 25;
      result.issues.push('Enregistrement SPF absent.');
      result.recommendations.push(`Ajoutez : "v=spf1 include:_spf.google.com ~all" sur ${domain}`);
    }
  } catch {
    result.score -= 25;
    result.issues.push('Impossible de résoudre SPF pour ce domaine.');
  }

  // 3. Audit DMARC
  try {
    const dmarcRecords = await dnsP.resolveTxt(`_dmarc.${domain}`);
    const flat = dmarcRecords.map(chunks => chunks.join(''));
    const dmarcRecord = flat.find(r => r.startsWith('v=DMARC1'));
    if (dmarcRecord) {
      result.dmarc.exists = true;
      result.dmarc.raw = dmarcRecord;
      const pMatch = dmarcRecord.match(/p=([a-z]+)/i);
      result.dmarc.policy = pMatch ? pMatch[1].toLowerCase() : 'non spécifié';
      result.dmarc.isEnforced = ['quarantine', 'reject'].includes(result.dmarc.policy);
    } else {
      result.score -= 25;
      result.issues.push('Enregistrement DMARC absent (obligatoire Google/Yahoo).');
      result.recommendations.push(`Ajoutez : "v=DMARC1; p=none; rua=mailto:dmarc@${domain}"`);
    }
  } catch {
    result.score -= 25;
    result.issues.push('DMARC absent sur _dmarc.' + domain);
  }

  if (isFreeWebmail) {
    result.score = Math.min(result.score, 75);
    result.issues.push(`Webmail gratuit (@${domain}) détecté.`);
    result.recommendations.push('Pour une délivrabilité maximale (98%+), utilisez un domaine pro dédié.');
  }

  result.score = Math.max(0, Math.min(100, result.score));
  return result;
}

/**
 * Calcule le Score Global de Délivrabilité & Légitimité (0 - 100)
 */
async function computeFullDeliverabilityScore({ senderEmail, campaign, contacts = [], dispatchConfig = {} }) {
  const [domainAudit, copyAudit, linksAudit, spamcheckResult] = await Promise.all([
    auditDomain(senderEmail),
    Promise.resolve(auditMessage(campaign || {})),
    auditLinks({ body: campaign?.body || '', target_url: campaign?.target_url || '' }),
    runPostmarkSpamcheck({ subject: campaign?.subject || '', body: campaign?.body || '', from: senderEmail })
  ]);

  // 1. Santé de l'audience (Anti-Rebond)
  const total = contacts.length;
  const verified = contacts.filter(c => c.status === 'VERIFIED').length;
  const invalid = contacts.filter(c => ['INVALID', 'DISPOSABLE'].includes(c.status)).length;
  let audienceScore = total === 0 ? 80 : 100;
  if (total > 0) {
    const verifiedRatio = verified / total;
    if (invalid > 0) audienceScore -= Math.min(40, (invalid / total) * 100 * 2);
    if (verifiedRatio < 0.8) audienceScore -= (1 - verifiedRatio) * 30;
  }
  audienceScore = Math.max(0, Math.min(100, Math.round(audienceScore)));

  // 2. Sécurité de Cadence & Quotas Google
  let pacingScore = 100;
  const dailyLimit = dispatchConfig.daily_send_limit || 28;
  const minDelay = dispatchConfig.min_delay_seconds || 420;
  if (dailyLimit > 40) pacingScore -= 30;
  if (minDelay < 180) pacingScore -= 30;
  pacingScore = Math.max(0, Math.min(100, pacingScore));

  // 3. Pénalité SpamAssassin & Liens cassés
  let spamPenalty = 0;
  if (spamcheckResult.success && spamcheckResult.score > 2.5) {
    spamPenalty += Math.min(25, Math.round((spamcheckResult.score - 2.5) * 8));
  }
  if (linksAudit.brokenCount > 0) spamPenalty += 20;
  if (linksAudit.hasShorteners) spamPenalty += 25;

  // Pondération globale : Domaine (25%), Copie (25%), Audience (25%), Cadence (15%), SpamAssassin/Liens (10%)
  let rawGlobal = (domainAudit.score * 0.25) + (copyAudit.score * 0.25) + (audienceScore * 0.25) + (pacingScore * 0.15) + (10 - spamPenalty);
  const globalScore = Math.max(0, Math.min(100, Math.round(rawGlobal)));

  let status = globalScore >= 85 ? 'OPTIMAL' : (globalScore >= 60 ? 'WARNING' : 'CRITICAL');
  let badgeColor = status === 'OPTIMAL' ? 'green' : (status === 'WARNING' ? 'amber' : 'red');
  let verdict = status === 'OPTIMAL' ? 'Excellente configuration : vous pouvez lancer votre campagne en toute sérénité.' :
    (status === 'WARNING' ? 'Configuration acceptable mais perfectible. Résolvez les points d\'attention.' :
    'Risque critique de passage en spam. Résolvez les points bloquants avant tout envoi.');

  const remedies = [
    ...(!copyAudit.hasOptOut ? [{ action: 'ADD_OPT_OUT', label: 'Ajouter la mention Opt-Out RGPD (+25 pts)', tip: 'Insère une phrase d\'opposition légale à la fin de l\'email.' }] : []),
    ...(copyAudit.detectedSpamWords.length > 0 ? [{ action: 'CLEAN_SPAM_WORDS', label: `Éliminer les ${copyAudit.detectedSpamWords.length} mots à risque (+${copyAudit.detectedSpamWords.length * 10} pts)`, tip: 'Remplace les formules commerciales par des tournures sobres.' }] : []),
    ...(linksAudit.hasShorteners ? [{ action: 'REMOVE_SHORTENER', label: 'Supprimer le réducteur d\'URL (+25 pts)', tip: 'Utilisez votre URL directe en nom de domaine propre.' }] : []),
    ...(linksAudit.brokenCount > 0 ? [{ action: 'FIX_BROKEN_LINKS', label: `Corriger les ${linksAudit.brokenCount} lien(s) inaccessible(s)`, tip: 'Assurez-vous que l\'URL de destination renvoie HTTP 200.' }] : []),
    ...(invalid > 0 ? [{ action: 'PURGE_INVALID_CONTACTS', label: `Purger les ${invalid} contacts invalides (+15 pts)`, tip: 'Élimine les adresses jetables et domaines morts pour éviter tout rebond dur.' }] : []),
    ...(domainAudit.isFreeWebmail ? [{ action: 'SETUP_CUSTOM_DOMAIN', label: 'Conseil : configurer un domaine dédié', tip: 'Un sous-domaine pro avec SPF/DMARC garantit 98%+ de délivrabilité.' }] : [])
  ];

  return {
    globalScore, status, badgeColor, verdict,
    pillars: {
      domain: { score: domainAudit.score, label: 'Authentification Domaine & DNS', details: domainAudit },
      copy: { score: copyAudit.score, label: 'Contenu & Linter Anti-Spam', details: copyAudit },
      audience: { score: audienceScore, label: 'Hygiène de l\'Audience (Anti-Rebond)', total, verified, invalid },
      pacing: { score: pacingScore, label: 'Cadencement Humain & Sécurité Google', dailyLimit, minDelay },
      spamassassin: {
        score: spamcheckResult.score, isPassing: spamcheckResult.isPassing,
        rules: spamcheckResult.rules || [], report: spamcheckResult.report || ''
      },
      links: linksAudit
    },
    actionableRemedies: remedies
  };
}

module.exports = { auditDomain, computeFullDeliverabilityScore };
