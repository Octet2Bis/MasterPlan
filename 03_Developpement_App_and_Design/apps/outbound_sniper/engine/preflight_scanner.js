/**
 * SKYLOS PRE-FLIGHT SCANNER — OUTBOUND SNIPER (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 160 lignes)
 * 
 * Rôle :
 * Audit statique déterministe pré-vol avant expédition :
 * - Zéro variable orpheline ({{var}} absente chez des contacts)
 * - Zéro fuite de secret / mot de passe dans le corps ou l'objet
 * - Télémétrie Google Inbox & Placement (Boîte Principale vs Promotions)
 */
const { auditMessage } = require('./deliverability_linter');

function extractPlaceholders(text) {
  const matches = String(text || '').match(/\{\{([^\}]+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/[{}]/g, '').trim().toLowerCase()))];
}

function runPreFlightScan(campaign, contacts = [], senderEmail = '') {
  const subject = campaign.subject || '';
  const body = campaign.template_body || '';
  const targetUrl = campaign.target_url || '';

  const issues = [];
  const warnings = [];

  // 1. Détection des variables utilisées
  const neededVars = [...new Set([...extractPlaceholders(subject), ...extractPlaceholders(body)])];

  // 2. Audit des contacts : Détection de variables orphelines
  const orphanDetails = [];
  contacts.forEach((contact, idx) => {
    neededVars.forEach(v => {
      const val = contact[v] || contact[v.toLowerCase()] || (v === 'nom' ? contact.last_name : null) || (v === 'prenom' ? contact.first_name : null);
      if (!val || String(val).trim().length === 0) {
        orphanDetails.push({
          contactIndex: idx + 1,
          email: contact.email || `Contact #${idx + 1}`,
          missingVar: v
        });
      }
    });
  });

  if (orphanDetails.length > 0) {
    issues.push({
      code: 'ORPHAN_VARIABLES_DETECTED',
      severity: 'HIGH',
      message: `${orphanDetails.length} variable(s) orpheline(s) détectée(s) sur ${contacts.length} contact(s).`,
      details: orphanDetails.slice(0, 5)
    });
  }

  // 3. Scanner anti-fuite de secrets (Tokens, Passwords, API Keys)
  const secretPatterns = [
    /(?:api[_-]?key|secret|token|password|pass|auth|bearer)\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i,
    /ghp_[a-zA-Z0-9]{36}/,
    /[0-9]{9,10}:[a-zA-Z0-9_-]{35}/,
    /sk-[a-zA-Z0-9]{32,}/
  ];
  const combinedText = `${subject} ${body}`;
  secretPatterns.forEach(pattern => {
    if (pattern.test(combinedText)) {
      issues.push({
        code: 'CREDENTIAL_LEAK_IN_CONTENT',
        severity: 'CRITICAL',
        message: 'Détection d\'un secret ou d\'une clé d\'API dans le contenu de l\'email.'
      });
    }
  });

  // 4. Audit Télémétrique & Délivrabilité
  const deliverabilityAudit = auditMessage({ subject, body, target_url: targetUrl });
  if (deliverabilityAudit.score < 80) {
    warnings.push({
      code: 'SUBOPTIMAL_DELIVERABILITY',
      message: `Score de délivrabilité sous le seuil optimal (${deliverabilityAudit.score}/100).`
    });
  }

  // 5. Statut Global
  let status = 'CLEARED';
  let badgeColor = 'green';
  if (issues.length > 0) {
    status = 'BLOCKED';
    badgeColor = 'red';
  } else if (warnings.length > 0 || deliverabilityAudit.predictedPlacement !== 'PRIMARY_INBOX') {
    status = 'WARNING';
    badgeColor = 'amber';
  }

  return {
    status,
    badgeColor,
    timestamp: new Date().toISOString(),
    campaignId: campaign.id || 'unknown',
    contactsCount: contacts.length,
    neededVariables: neededVars,
    orphanCount: orphanDetails.length,
    deliverability: deliverabilityAudit,
    issues,
    warnings,
    isCleared: status === 'CLEARED'
  };
}

module.exports = { runPreFlightScan, extractPlaceholders };
