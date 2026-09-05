/**
 * GOOGLE OAUTH2 & GMAIL API ENGINE (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 150 lignes)
 */
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '../data/google_auth.json');
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');

function loadAuthData() {
  try {
    if (fs.existsSync(AUTH_FILE)) return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
  } catch {}
  return { connected: false, client_id: '', client_secret: '', tokens: null, user: null };
}

function saveAuthData(data) {
  try {
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ ...data, updated_at: new Date().toISOString() }, null, 2), 'utf-8');
  } catch {}
}

function getAuthUrl(clientId, redirectUri) {
  if (!clientId) throw new Error("Client ID Google manquant.");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent'
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCodeForTokens(code, clientId, clientSecret, redirectUri) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  const user = await getUserInfo(data.access_token);
  const authState = {
    connected: true,
    client_id: clientId,
    client_secret: clientSecret,
    tokens: { ...data, expires_at: Date.now() + ((data.expires_in || 3600) * 1000) },
    user
  };
  saveAuthData(authState);
  return authState;
}

async function refreshAccessToken(clientId, clientSecret, refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);
  return { ...data, expires_at: Date.now() + ((data.expires_in || 3600) * 1000) };
}

async function getValidAccessToken() {
  const auth = loadAuthData();
  if (!auth.connected || !auth.tokens) throw new Error("Google OAuth non connecté.");
  if (auth.tokens.expires_at && auth.tokens.expires_at > Date.now() + 60000) {
    return auth.tokens.access_token;
  }
  if (!auth.tokens.refresh_token) throw new Error("Refresh token manquant. Reconnexion requise.");
  const newTokens = await refreshAccessToken(auth.client_id, auth.client_secret, auth.tokens.refresh_token);
  auth.tokens = { ...auth.tokens, ...newTokens };
  saveAuthData(auth);
  return auth.tokens.access_token;
}

async function getUserInfo(accessToken) {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
    return await res.json();
  } catch { return null; }
}

function buildRawMime({ to, subject, htmlBody, plainBody, fromName, fromEmail }) {
  const boundary = `__boundary_${Date.now()}__`;
  const headers = [
    `From: =?UTF-8?B?${Buffer.from(fromName || '').toString('base64')}?= <${fromEmail}>`,
    `To: <${to}>`,
    `Subject: =?UTF-8?B?${Buffer.from(subject || '').toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`
  ];
  const bodyParts = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    plainBody || '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody || plainBody || '',
    `--${boundary}--`
  ];
  const fullMessage = `${headers.join('\r\n')}\r\n\r\n${bodyParts.join('\r\n')}`;
  return Buffer.from(fullMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendGmailMessage({ to, subject, htmlBody, plainBody, fromName, fromEmail }) {
  const token = await getValidAccessToken();
  const raw = buildRawMime({ to, subject, htmlBody, plainBody, fromName, fromEmail });
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return { success: true, messageId: data.id, threadId: data.threadId };
}

function disconnect() {
  saveAuthData({ connected: false, client_id: '', client_secret: '', tokens: null, user: null });
}

module.exports = {
  loadAuthData,
  saveAuthData,
  getAuthUrl,
  exchangeCodeForTokens,
  getValidAccessToken,
  sendGmailMessage,
  disconnect
};
