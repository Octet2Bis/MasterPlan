/**
 * PASSERELLE PUBLIQUE DE TRACKING DES CLICS — À DÉPLOYER SUR LA VM (Node.js 20+, zéro dépendance)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Gateway
 *
 * Lancement (depuis le dossier outbound_sniper copié sur la VM) :
 *   TRACKING_SECRET=<tracking.secret de data/config.json> PORT=3000 node gateway/tracking_gateway.js
 * Endpoints :
 *   GET /t/click?cid&uid&target&sig  → enregistre le clic puis redirige (signature HMAC obligatoire)
 *   GET /api/tracking/events          → journal des clics (en-tête Authorization: Bearer <secret>)
 *   GET /api/tracking/ping            → test de liaison
 * Mettre un reverse proxy HTTPS (Caddy, Nginx) sur un sous-domaine : un lien en IP brute/HTTP est pénalisé.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { verifyClick, makeClickEvent } = require('../engine/tracking');

const SECRET = process.env.TRACKING_SECRET || '';
const PORT = Number(process.env.PORT || 3000);
const EVENTS_FILE = process.env.EVENTS_FILE || path.join(__dirname, 'gateway_events.json');

function loadEvents() {
  try { return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf-8')); } catch { return { events: [] }; }
}

function appendEvent(event) {
  const store = loadEvents();
  store.events.push(event);
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(store), 'utf-8');
}

function isAuthorized(req) {
  const given = Buffer.from(String(req.headers.authorization || ''));
  const expected = Buffer.from(`Bearer ${SECRET}`);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://gateway');
  if (url.pathname === '/t/click') {
    const click = verifyClick(url.searchParams, SECRET);
    if (!click) { res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Lien invalide.'); }
    appendEvent(makeClickEvent(click.cid, click.uid, click.target, req.headers['user-agent']));
    res.writeHead(302, { Location: click.target, 'Cache-Control': 'no-store' });
    return res.end();
  }
  if (url.pathname === '/api/tracking/ping') return json(res, 200, { success: true, service: 'Outbound Sniper Click Gateway', secured: Boolean(SECRET) });
  if (url.pathname === '/api/tracking/events') {
    if (!isAuthorized(req)) return json(res, 401, { success: false, error: 'Non autorisé.' });
    return json(res, 200, loadEvents());
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

if (require.main === module) {
  if (!SECRET) { console.error('TRACKING_SECRET manquant : copiez tracking.secret depuis data/config.json.'); process.exit(1); }
  server.listen(PORT, () => console.log(`🛰️ Passerelle de clics active sur le port ${PORT}`));
}

module.exports = { server };
