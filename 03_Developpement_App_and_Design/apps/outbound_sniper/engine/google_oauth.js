/**
 * GOOGLE OAUTH2 & GMAIL API — SEUL CANAL D'ENVOI (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * Jetons stockés dans data/google_auth.json (ignoré par git), jamais renvoyés au navigateur.
 */
const crypto = require('node:crypto');
const store = require('./store');

const AUTH_FILE = 'google_auth.json';
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');
const EMPTY_AUTH = { connected: false, client_id: '', client_secret: '', tokens: null, user: null };
const pendingStates = new Map();

function loadAuthData() { return { ...EMPTY_AUTH, ...store.load(AUTH_FILE, {}) }; }
function saveAuthData(data) { store.save(AUTH_FILE, { ...data, updated_at: new Date().toISOString() }); }

/** Vue sûre pour le navigateur : aucun secret, aucun jeton. */
function publicStatus() {
  const a = loadAuthData();
  const user = a.user ? { email: a.user.email, name: a.user.name, picture: a.user.picture } : null;
  return { connected: Boolean(a.connected && a.tokens), user, client_id: a.client_id || '', has_client_secret: Boolean(a.client_secret) };
}

function connectedEmail() {
  const a = loadAuthData();
  return a.connected ? (a.user?.email || null) : null;
}

function getAuthUrl(clientId, redirectUri) {
  if (!clientId) throw new Error('Client ID Google manquant.');
  const state = crypto.randomBytes(16).toString('hex');
  pendingStates.set(state, Date.now() + 10 * 60 * 1000);
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: SCOPES, access_type: 'offline', prompt: 'consent', state });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function consumeState(state) {
  const exp = pendingStates.get(state);
  pendingStates.delete(state);
  return Boolean(exp && exp > Date.now());
}

async function tokenRequest(params) {
  const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) });
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  return { ...data, expires_at: Date.now() + ((data.expires_in || 3600) * 1000) };
}

async function exchangeCodeForTokens(code, redirectUri) {
  const auth = loadAuthData();
  const tokens = await tokenRequest({ code, client_id: auth.client_id, client_secret: auth.client_secret, redirect_uri: redirectUri, grant_type: 'authorization_code' });
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  saveAuthData({ ...auth, connected: true, tokens, user: await userRes.json() });
}

async function getValidAccessToken() {
  const auth = loadAuthData();
  if (!auth.connected || !auth.tokens) throw new Error('Compte Google non connecté.');
  if (auth.tokens.expires_at > Date.now() + 60000) return auth.tokens.access_token;
  if (!auth.tokens.refresh_token) throw new Error('Refresh token manquant : reconnectez le compte Google.');
  const fresh = await tokenRequest({ client_id: auth.client_id, client_secret: auth.client_secret, refresh_token: auth.tokens.refresh_token, grant_type: 'refresh_token' });
  auth.tokens = { ...auth.tokens, ...fresh };
  saveAuthData(auth);
  return auth.tokens.access_token;
}

const b64 = (s) => Buffer.from(String(s || ''), 'utf-8').toString('base64');
const wrap76 = (s) => s.replace(/.{1,76}/g, '$&\r\n').trimEnd();
const encodeWord = (s) => `=?UTF-8?B?${b64(s)}?=`;

function buildRawMime({ to, subject, html, text, fromName, fromEmail }) {
  const boundary = `sniper_${crypto.randomBytes(12).toString('hex')}`;
  const lines = [
    `From: ${fromName ? `${encodeWord(fromName)} ` : ''}<${fromEmail}>`,
    `To: <${to}>`,
    `Subject: ${encodeWord(subject)}`,
    `List-Unsubscribe: <mailto:${fromEmail}?subject=stop>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', wrap76(b64(text)),
    `--${boundary}`, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', wrap76(b64(html || text)),
    `--${boundary}--`, ''
  ];
  return Buffer.from(lines.join('\r\n')).toString('base64url');
}

/**
 * Envoie via l'API Gmail. Ne lève jamais : renvoie { success, error, fatal }.
 * fatal = erreur qui rendra tous les envois suivants inutiles (auth, quota) → coupe-circuit.
 * Les rebonds (adresse inexistante) arrivent plus tard par email et ne sont PAS détectés ici.
 */
async function sendGmailMessage({ to, subject, html, text, fromName }) {
  try {
    const fromEmail = connectedEmail();
    if (!fromEmail) return { success: false, fatal: true, error: 'Compte Google non connecté.' };
    const token = await getValidAccessToken();
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: buildRawMime({ to, subject, html, text, fromName, fromEmail }) })
    });
    const data = await res.json();
    if (res.ok) return { success: true, messageId: data.id };
    const error = data.error?.message || `Gmail HTTP ${res.status}`;
    return { success: false, error, fatal: res.status === 401 || res.status === 403 || res.status === 429 || /limit/i.test(error) };
  } catch (e) {
    return { success: false, error: e.message, fatal: /connecté|refresh|invalid_grant/i.test(e.message) };
  }
}

function saveClientCredentials(clientId, clientSecret) {
  const auth = loadAuthData();
  saveAuthData({ ...auth, client_id: clientId || auth.client_id, client_secret: clientSecret || auth.client_secret });
}

function disconnect() { saveAuthData({ ...loadAuthData(), connected: false, tokens: null, user: null }); }

module.exports = { publicStatus, connectedEmail, getAuthUrl, consumeState, exchangeCodeForTokens, sendGmailMessage, saveClientCredentials, disconnect, buildRawMime };
