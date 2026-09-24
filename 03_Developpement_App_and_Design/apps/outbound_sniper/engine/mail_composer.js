/**
 * MAIL COMPOSER — CONSTRUCTION DU MESSAGE PERSONNALISÉ (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * Produit une version texte + une version HTML minimale (toutes valeurs échappées).
 */
const { VariableResolver } = require('./variable_resolver');
const { buildClickUrl } = require('./tracking');

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, ch => HTML_ESCAPES[ch]); }

/** Compatibilité : les anciennes campagnes stockent `stealth_mode` (true = pas de tracking). */
function tracksClicks(campaign) {
  if (typeof campaign?.track_clicks === 'boolean') return campaign.track_clicks;
  return campaign?.stealth_mode === false;
}

function textToHtml(text) { return escapeHtml(text).replace(/\r?\n/g, '<br>'); }

/**
 * @param {object} p
 * @param {object} p.campaign  { id, subject, body, cta_label, target_url, track_clicks }
 * @param {object} p.contact   contact normalisé (prenom, nom, entreprise, custom_fields…)
 * @param {object} p.config    configuration effective (sender, tracking)
 * @param {boolean} [p.trackLinks=true]  false pour les emails de test (pas de pollution des stats)
 */
function composeEmail({ campaign, contact, config, trackLinks = true }) {
  const subject = VariableResolver.resolveTemplate(campaign?.subject || '', contact);
  const body = VariableResolver.resolveTemplate(campaign?.body || '', contact);
  const cta = VariableResolver.resolveTemplate(campaign?.cta_label || '', contact);
  const unresolvedVars = [...new Set([...subject.unresolvedVars, ...body.unresolvedVars, ...cta.unresolvedVars])];

  const target = String(campaign?.target_url || '').trim();
  const baseUrl = config?.tracking?.vm_tracking_url || '';
  const tracked = Boolean(trackLinks && target && baseUrl && tracksClicks(campaign));
  const link = !target ? null : (tracked ? buildClickUrl(baseUrl, config.tracking.secret, campaign.id, contact?.id || 'unknown', target) : target);
  const ctaText = cta.text.trim();
  const signature = String(config?.sender?.signature || '').trim();

  const textParts = [body.text.trim()];
  if (link) textParts.push(ctaText ? `${ctaText} : ${link}` : link);
  if (signature) textParts.push(signature);

  const htmlParts = [`<p>${textToHtml(body.text.trim())}</p>`];
  if (link) htmlParts.push(`<p><a href="${escapeHtml(link)}">${escapeHtml(ctaText || target)}</a></p>`);
  if (signature) htmlParts.push(`<p>${textToHtml(signature)}</p>`);

  return {
    subject: subject.text.trim(),
    text: textParts.join('\n\n'),
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;">${htmlParts.join('')}</div>`,
    link, tracked, unresolvedVars,
    isValid: unresolvedVars.length === 0
  };
}

module.exports = { composeEmail, tracksClicks, escapeHtml };
