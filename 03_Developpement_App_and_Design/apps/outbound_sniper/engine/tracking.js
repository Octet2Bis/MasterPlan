/**
 * TRACKING DES CLICS — SIGNATURE HMAC, FILTRE ANTI-BOTS & CONTRÔLE DE L'URL PUBLIQUE (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * Partagé par server.js (local) et gateway/tracking_gateway.js (VM publique).
 * Pas de pixel d'ouverture : les ouvertures ne sont pas mesurables de façon fiable
 * (Apple Mail Privacy Protection, proxy d'images Gmail) et le pixel dégrade la délivrabilité.
 */
const crypto = require('node:crypto');
const net = require('node:net');
const { loadRef } = require('./store');

const BOT_PATTERNS = (loadRef('tracking_rules.json', {}).bot_user_agents || []).map(p => new RegExp(p, 'i'));

/** Filtre par user-agent : indicatif. Certains scanners de sécurité (ex. Safe Links) imitent un navigateur. */
function isBot(ua) {
  if (!ua || ua.length < 10) return true;
  return BOT_PATTERNS.some(rx => rx.test(ua));
}

function sign(secret, cid, uid, target) {
  return crypto.createHmac('sha256', secret).update(`${cid}|${uid}|${target}`).digest('hex').slice(0, 20);
}

function buildClickUrl(baseUrl, secret, cid, uid, target) {
  const q = new URLSearchParams({ cid, uid, target, sig: sign(secret, cid, uid, target) });
  return `${baseUrl.replace(/\/+$/, '')}/t/click?${q.toString()}`;
}

/** Retourne la cible si la signature est valide, sinon null (empêche la redirection ouverte). */
function verifyClick(searchParams, secret) {
  const cid = searchParams.get('cid') || '';
  const uid = searchParams.get('uid') || '';
  const target = searchParams.get('target') || '';
  const sig = searchParams.get('sig') || '';
  if (!secret || !target || !/^https?:\/\//i.test(target)) return null;
  const expected = sign(secret, cid, uid, target);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return { cid, uid, target };
}

function makeClickEvent(cid, uid, target, ua) {
  return { type: 'CLICK', campaign_id: cid, contact_id: uid, target_url: target, is_bot: isBot(ua), ua: ua || '', timestamp: new Date().toISOString() };
}

/**
 * Évalue l'URL publique de tracking. Un destinataire doit pouvoir la joindre depuis Internet,
 * et une IP brute ou du HTTP simple dans un lien est pénalisé par les filtres anti-spam.
 */
function assessTrackingUrl(url) {
  if (!url) return { level: 'BLOCKED', message: 'URL publique de tracking non configurée.' };
  let u;
  try { u = new URL(url); } catch { return { level: 'BLOCKED', message: `URL de tracking invalide (${url}).` }; }
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) || host === '::1') {
    return { level: 'BLOCKED', message: `URL de tracking locale (${host}) : injoignable par les destinataires, les liens seraient cassés.` };
  }
  const issues = [];
  if (net.isIP(host)) issues.push('adresse IP brute');
  if (u.protocol !== 'https:') issues.push('HTTP non chiffré');
  if (issues.length) return { level: 'WARNING', message: `Lien de tracking avec ${issues.join(' et ')} : pénalisé par les filtres anti-spam. Utilisez un sous-domaine HTTPS de votre domaine.` };
  return { level: 'OK', message: 'URL de tracking publique en HTTPS.' };
}

module.exports = { isBot, sign, buildClickUrl, verifyClick, makeClickEvent, assessTrackingUrl };
