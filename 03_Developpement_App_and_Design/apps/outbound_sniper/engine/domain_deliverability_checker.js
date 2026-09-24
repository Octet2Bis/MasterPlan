/**
 * DOMAIN DELIVERABILITY & DNS AUDITOR (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * Contrôles réels : MX, SPF, DMARC, DKIM (sélecteur Google « google »), liens, SpamAssassin (Postmark).
 * L'indice global est une pondération indicative de ces contrôles, pas une prédiction de placement.
 */
const { Resolver } = require('node:dns').promises;
const { loadRef } = require('./store');
const { auditMessage } = require('./deliverability_linter');
const { auditLinks, runPostmarkSpamcheck } = require('./link_and_spamcheck_engine');

// Résolveur dédié (n'altère pas le DNS du reste du process).
const resolver = new Resolver();
try { resolver.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

async function txtRecords(name) {
  try { return (await resolver.resolveTxt(name)).map(chunks => chunks.join('')); } catch { return []; }
}

async function auditDomain(email) {
  const domain = String(email || '').trim().toLowerCase().split('@')[1] || '';
  if (!domain) return { domain: null, score: 0, issues: ['Aucun expéditeur : connectez votre compte Google.'], recommendations: [], mx: {}, spf: {}, dmarc: {}, dkim: {} };

  const freeProviders = new Set(loadRef('email_hygiene_rules.json', {}).free_mail_providers || []);
  const isFreeWebmail = freeProviders.has(domain);
  const result = { domain, isFreeWebmail, mx: { exists: false, provider: null }, spf: { exists: false, policy: null }, dmarc: { exists: false, policy: null }, dkim: { checked: false, exists: false }, score: 100, issues: [], recommendations: [] };

  try {
    const mx = await resolver.resolveMx(domain);
    result.mx.exists = mx.length > 0;
    const joined = mx.map(r => r.exchange).join(' ').toLowerCase();
    result.mx.provider = /google/.test(joined) ? 'Google Workspace' : (/outlook|microsoft/.test(joined) ? 'Microsoft 365' : 'Autre');
  } catch {}
  if (!result.mx.exists) { result.score -= 25; result.issues.push('Aucun MX : le domaine ne peut pas recevoir les réponses.'); }

  const spf = (await txtRecords(domain)).find(r => r.startsWith('v=spf1'));
  if (spf) {
    result.spf = { exists: true, raw: spf, policy: /-all/.test(spf) ? '-all' : (/~all/.test(spf) ? '~all' : 'neutre'), includesGoogle: spf.includes('_spf.google.com') };
    if (!result.spf.includesGoogle && !isFreeWebmail) result.recommendations.push('Le SPF n\'inclut pas include:_spf.google.com alors que vous envoyez via Gmail.');
  } else {
    result.score -= 25;
    result.issues.push('Enregistrement SPF absent.');
    result.recommendations.push(`Ajoutez sur ${domain} : v=spf1 include:_spf.google.com ~all`);
  }

  const dmarc = (await txtRecords(`_dmarc.${domain}`)).find(r => r.startsWith('v=DMARC1'));
  if (dmarc) {
    const p = (dmarc.match(/p=([a-z]+)/i) || [])[1] || 'none';
    result.dmarc = { exists: true, raw: dmarc, policy: p.toLowerCase() };
  } else {
    result.score -= 25;
    result.issues.push('Enregistrement DMARC absent (exigé par Gmail et Yahoo).');
    result.recommendations.push(`Ajoutez sur _dmarc.${domain} : v=DMARC1; p=none; rua=mailto:dmarc@${domain}`);
  }

  // DKIM : le sélecteur n'est pas découvrable par DNS ; on teste celui de Google Workspace par défaut.
  if (!isFreeWebmail) {
    const dkim = (await txtRecords(`google._domainkey.${domain}`)).find(r => /v=DKIM1|p=/.test(r));
    result.dkim = { checked: true, exists: Boolean(dkim), selector: 'google' };
    if (!dkim) {
      result.score -= 15;
      result.issues.push('DKIM Google (sélecteur « google ») introuvable.');
      result.recommendations.push('Activez DKIM dans la console Admin Google (Applications > Gmail > Authentifier les e-mails).');
    }
  }

  if (isFreeWebmail) {
    result.score = Math.min(result.score, 75);
    result.issues.push(`Adresse webmail gratuite (@${domain}) : SPF/DKIM/DMARC gérés par le fournisseur, domaine non personnalisable.`);
  }
  result.score = Math.max(0, Math.min(100, result.score));
  return result;
}

function audienceHealth(contacts) {
  const pending = contacts.filter(c => c.status !== 'SENT');
  const count = (statuses) => pending.filter(c => statuses.includes(c.status)).length;
  const total = pending.length;
  const verified = count(['VERIFIED']);
  const invalid = count(['INVALID', 'INVALID_MAILBOX', 'NO_MX', 'DISPOSABLE']);
  const unverified = count(['UNVERIFIED', 'CATCH_ALL', 'RISKY', 'ROLE_ACCOUNT', 'PENDING']) + pending.filter(c => !c.status).length;
  let score = total === 0 ? 0 : 100 - Math.min(60, (invalid / total) * 200) - (unverified / total) * 30;
  return { score: Math.max(0, Math.round(score)), total, verified, invalid, unverified };
}

async function computeFullDeliverabilityScore({ senderEmail, campaign = {}, contacts = [], dispatchConfig = {} }) {
  const [domainAudit, linksAudit, spamcheck] = await Promise.all([
    auditDomain(senderEmail),
    auditLinks({ body: campaign.body || '', target_url: campaign.target_url || '' }),
    runPostmarkSpamcheck({ subject: campaign.subject || '', body: campaign.body || '', from: senderEmail || 'expediteur@example.com' })
  ]);
  const copyAudit = auditMessage(campaign);
  const audience = audienceHealth(contacts);

  let pacingScore = 100;
  if (dispatchConfig.daily_send_limit > 40) pacingScore -= 40;
  if (dispatchConfig.min_delay_seconds < 180) pacingScore -= 40;

  let techScore = 100;
  if (spamcheck.success && spamcheck.score > 2.5) techScore -= Math.min(60, Math.round((spamcheck.score - 2.5) * 20));
  if (linksAudit.brokenCount > 0) techScore -= 40;
  if (linksAudit.hasShorteners) techScore -= 50;
  techScore = Math.max(0, techScore);

  // Pondération indicative : Domaine 25 %, Contenu 25 %, Audience 25 %, Cadence 10 %, SpamAssassin & liens 15 %.
  const globalScore = Math.round(domainAudit.score * 0.25 + copyAudit.score * 0.25 + audience.score * 0.25 + pacingScore * 0.10 + techScore * 0.15);
  const status = globalScore >= 85 ? 'OPTIMAL' : (globalScore >= 60 ? 'WARNING' : 'CRITICAL');
  const verdicts = {
    OPTIMAL: 'Contrôles au vert. Confirmez avec un test réel Mail-Tester avant le lancement.',
    WARNING: 'Configuration perfectible : traitez les points signalés.',
    CRITICAL: 'Risque élevé : corrigez les points bloquants avant tout envoi.'
  };

  const remedies = [
    ...(!senderEmail ? [{ label: 'Connecter le compte Google d\'envoi' }] : []),
    ...(!copyAudit.hasOptOut ? [{ label: 'Ajouter une phrase d\'opposition (ex. « répondez stop »)' }] : []),
    ...(copyAudit.detectedSpamWords.length > 0 ? [{ label: `Reformuler ${copyAudit.detectedSpamWords.length} terme(s) à risque` }] : []),
    ...(linksAudit.hasShorteners ? [{ label: 'Supprimer le raccourcisseur d\'URL' }] : []),
    ...(linksAudit.brokenCount > 0 ? [{ label: `Corriger ${linksAudit.brokenCount} lien(s) inaccessible(s)` }] : []),
    ...(audience.invalid > 0 ? [{ label: `Retirer ${audience.invalid} contact(s) invalide(s)` }] : []),
    ...domainAudit.recommendations.map(label => ({ label }))
  ];

  return {
    globalScore, status, badgeColor: { OPTIMAL: 'green', WARNING: 'amber', CRITICAL: 'red' }[status], verdict: verdicts[status],
    pillars: {
      domain: { score: domainAudit.score, details: domainAudit },
      copy: { score: copyAudit.score, details: copyAudit },
      audience: { ...audience },
      pacing: { score: pacingScore, dailyLimit: dispatchConfig.daily_send_limit, minDelay: dispatchConfig.min_delay_seconds, maxDelay: dispatchConfig.max_delay_seconds },
      spamassassin: { available: spamcheck.success, score: spamcheck.score, isPassing: spamcheck.isPassing, error: spamcheck.error || null, rules: spamcheck.rules || [] },
      links: linksAudit
    },
    actionableRemedies: remedies
  };
}

module.exports = { auditDomain, computeFullDeliverabilityScore, audienceHealth };
