/**
 * ÉCLAIREUR DÉCIDEUR & ENQUÊTEUR (Inspecteur 4)
 * Pilier : 02_Assistant_Personnel (< 70 lignes)
 * Contrat : Identifie le profil décideur cible et l'angle d'approche stratégique.
 */

function evaluateDecisionMaker(job) {
  const title = (job.title || '').toLowerCase();
  let targetRole = 'Head of Growth / CMO';
  let hookAngle = 'Tracking GTM, Automatisation n8n et Acquisition B2B/B2C';

  if (title.includes('crm') || title.includes('lifecycle') || title.includes('email')) {
    targetRole = 'Head of CRM & Retention / Lead Lifecycle';
    hookAngle = 'Automatisation de flux Klaviyo/Brevo et réactivation de base dormante';
  } else if (title.includes('paid') || title.includes('acquisition') || title.includes('sea') || title.includes('ads')) {
    targetRole = 'Head of Acquisition / Performance Marketing Lead';
    hookAngle = 'Optimisation du ROAS, scaling Google Ads / Meta Ads et Tracking CAPI';
  } else if (title.includes('product') || title.includes('ops')) {
    targetRole = 'Head of Product / VP Operations';
    hookAngle = 'Fluidification des tunnels de conversion et ponts de données No-Code/API';
  }

  return {
    pass: true,
    target_role: targetRole,
    hook_angle: hookAngle,
    reason: `Cible identifiée : ${targetRole}`
  };
}

module.exports = { evaluateDecisionMaker };
