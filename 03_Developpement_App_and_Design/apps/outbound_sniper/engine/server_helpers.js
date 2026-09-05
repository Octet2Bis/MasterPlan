/**
 * SERVER HTTP UTILITIES & DISPATCH HELPER (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 60 lignes)
 */
const googleOAuth = require('./google_oauth');

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { resolve({}); }
    });
  });
}

async function dispatchMessage(engine, { from, to, subject, htmlBody, textBody, fromName }) {
  const auth = googleOAuth.loadAuthData();
  if (auth.connected) {
    return await googleOAuth.sendGmailMessage({ to, subject, htmlBody, plainBody: textBody, fromName, fromEmail: from });
  }
  return await engine.smtpClient.sendEmail({ from, to, subject, htmlBody, textBody });
}

module.exports = { sendJSON, parseBody, dispatchMessage };
