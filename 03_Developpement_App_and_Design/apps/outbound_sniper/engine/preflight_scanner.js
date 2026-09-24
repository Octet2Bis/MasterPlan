/**
 * PRE-FLIGHT SCANNER — CONTRÔLE BLOQUANT AVANT TOUT ENVOI (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * Exécuté par l'UI (bouton) ET par le serveur au lancement d'une campagne : un statut BLOCKED interdit l'envoi.
 * Bloquant : expéditeur absent, opt-out absent, variable non résolue, secret dans le contenu, lien de tracking injoignable.
 */
const { auditMessage } = require('./deliverability_linter');
const { VariableResolver } = require('./variable_resolver');
const { tracksClicks } = require('./mail_composer');
const { assessTrackingUrl } = require('./tracking');

const SECRET_PATTERNS = [
  /(?:api[_-]?key|secret|token|password|pass|bearer)\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{16,}/i,
  /ghp_[a-zA-Z0-9]{36}/,
  /sk-[a-zA-Z0-9]{32,}/
];

function findOrphans(campaign, contacts) {
  const orphans = [];
  contacts.forEach((contact, idx) => {
    const missing = new Set();
    for (const field of ['subject', 'body', 'cta_label']) {
      VariableResolver.resolveTemplate(campaign[field] || '', contact, {}, { applySpintax: false }).unresolvedVars.forEach(v => missing.add(v));
    }
    if (missing.size > 0) orphans.push({ contactIndex: idx + 1, email: contact.email || `Contact #${idx + 1}`, missingVars: [...missing] });
  });
  return orphans;
}

/**
 * @param {{campaign: object, contacts: object[], config: object, senderEmail: string|null}} p
 */
function runPreFlightScan({ campaign = {}, contacts = [], config = {}, senderEmail = null }) {
  const issues = [];
  const warnings = [];

  if (!senderEmail) issues.push({ code: 'NO_SENDER', message: 'Aucun compte Google connecté pour l\'envoi.' });
  if (!String(campaign.subject || '').trim() || !String(campaign.body || '').trim()) issues.push({ code: 'EMPTY_MESSAGE', message: 'Objet ou corps du message vide.' });

  const audit = auditMessage(campaign);
  if (!audit.hasOptOut) issues.push({ code: 'MISSING_OPT_OUT', message: 'Phrase d\'opposition absente (ex. « répondez stop »).' });
  if (audit.score < 80) warnings.push({ code: 'SUBOPTIMAL_CONTENT', message: `Score de contenu ${audit.score}/100 : ${audit.issues.map(i => i.message).join(' ')}` });

  const orphans = findOrphans(campaign, contacts);
  if (orphans.length > 0) {
    const sample = orphans.slice(0, 3).map(o => `${o.email} (${o.missingVars.join(', ')})`).join(' ; ');
    issues.push({ code: 'ORPHAN_VARIABLES', message: `${orphans.length} contact(s) avec variable manquante : ${sample}. Complétez le fichier ou utilisez {{variable|texte par défaut}}.`, details: orphans.slice(0, 20) });
  }

  const text = `${campaign.subject || ''} ${campaign.body || ''}`;
  if (SECRET_PATTERNS.some(rx => rx.test(text))) issues.push({ code: 'CREDENTIAL_LEAK', message: 'Un secret ou une clé d\'API semble présent dans le message.' });

  if (tracksClicks(campaign) && String(campaign.target_url || '').trim()) {
    const t = assessTrackingUrl(config.tracking?.vm_tracking_url);
    if (t.level === 'BLOCKED') issues.push({ code: 'TRACKING_URL', message: `${t.message} Désactivez le suivi des clics ou configurez la passerelle.` });
    if (t.level === 'WARNING') warnings.push({ code: 'TRACKING_URL', message: t.message });
  }
  if (contacts.length === 0) issues.push({ code: 'NO_CONTACTS', message: 'Aucun contact éligible à l\'envoi.' });

  const status = issues.length > 0 ? 'BLOCKED' : (warnings.length > 0 ? 'WARNING' : 'CLEARED');
  return { status, contactsCount: contacts.length, orphanCount: orphans.length, issues, warnings, isCleared: status !== 'BLOCKED' };
}

module.exports = { runPreFlightScan };
