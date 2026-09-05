/**
 * TRACKING SERVER — MINI-SERVEUR D'OUVERTURES ET CLICS EN TEMPS RÉEL (Node.js 24)
 * Pilier : 01_GTM_Growth / 04_Outbound_and_CRM / Core (< 120 lignes)
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.TRACKING_PORT || 4005;
const LOG_FILE = path.join(__dirname, '../data/campaign_tracking_log.json');

// GIF transparent 1x1 pixel (Base64)
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

function readLogs() {
  try {
    return fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')) : { events: [] };
  } catch {
    return { events: [] };
  }
}

function writeLog(event) {
  const logs = readLogs();
  logs.events.push(event);
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch {}
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;
  const cid = parsedUrl.searchParams.get('cid') || 'unknown_campaign';
  const uid = parsedUrl.searchParams.get('uid') || 'unknown_user';

  // 1. Pixel d'ouverture
  if (pathname === '/t/open') {
    writeLog({
      type: 'OPEN',
      campaign_id: cid,
      contact_id: uid,
      timestamp: new Date().toISOString(),
      user_agent: req.headers['user-agent'] || 'unknown'
    });

    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': TRANSPARENT_GIF.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private'
    });
    return res.end(TRANSPARENT_GIF);
  }

  // 2. Redirection de Clic traçable
  if (pathname === '/t/click') {
    const targetUrl = parsedUrl.searchParams.get('target') || 'https://aevum.app';

    writeLog({
      type: 'CLICK',
      campaign_id: cid,
      contact_id: uid,
      target_url: targetUrl,
      timestamp: new Date().toISOString()
    });

    res.writeHead(302, { 'Location': targetUrl });
    return res.end();
  }

  // 3. API de Statistiques
  if (pathname === '/api/stats') {
    const logs = readLogs();
    const opens = logs.events.filter(e => e.type === 'OPEN');
    const clicks = logs.events.filter(e => e.type === 'CLICK');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      total_events: logs.events.length,
      total_opens: opens.length,
      total_clicks: clicks.length,
      ctr_percent: opens.length > 0 ? ((clicks.length / opens.length) * 100).toFixed(1) : 0,
      recent_events: logs.events.slice(-10)
    }));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Endpoint de tracking non trouvé');
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`📡 SERVEUR DE TRACKING OUTBOUND ACTIF SUR LE PORT ${PORT}`);
    console.log(`🔗 Endpoint Pixel : http://localhost:${PORT}/t/open`);
    console.log(`🔗 Endpoint Clic  : http://localhost:${PORT}/t/click`);
    console.log(`📊 Endpoint Stats : http://localhost:${PORT}/api/stats`);
  });
}

module.exports = { server, readLogs, writeLog };
