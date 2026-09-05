/**
 * TRACKING ROUTER — OUTBOUND SNIPER & ORACLE VM GATEWAY (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Aevum & Outbound Sniper (< 130 lignes)
 * Gère le pixel d'ouverture (1x1 GIF), les redirections de clics et le filtrage anti-bots.
 */
const fs = require('fs');
const path = require('path');

const TRACKING_FILE = path.join(__dirname, 'tracking_events.json');
const TRANSPARENT_GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

// Détection des robots anti-spam d'entreprise (scanners d'ouverture/clic automatique)
const BOT_PATTERNS = [
  /googleimageproxy/i, /bingpreview/i, /yahoo.*proxy/i,
  /proofpoint/i, /barracuda/i, /symantec/i, /virustotal/i,
  /spider/i, /crawler/i, /bot/i, /scanner/i, /headless/i
];

function isBot(ua) {
  if (!ua || ua.length < 10) return true;
  return BOT_PATTERNS.some(rx => rx.test(ua));
}

function loadEvents() {
  try {
    if (fs.existsSync(TRACKING_FILE)) {
      return JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
    }
  } catch {}
  return { total_opens: 0, total_clicks: 0, events: [] };
}

function saveEvents(data) {
  try {
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('❌ Erreur écriture tracking VM:', e.message);
  }
}

function recordEvent(type, cid, uid, extra = {}) {
  const store = loadEvents();
  const botDetected = isBot(extra.ua);

  if (!botDetected) {
    if (type === 'OPEN') store.total_opens = (store.total_opens || 0) + 1;
    if (type === 'CLICK') store.total_clicks = (store.total_clicks || 0) + 1;
  }

  store.events.push({
    type,
    campaign_id: cid,
    contact_id: uid,
    is_bot: botDetected,
    timestamp: new Date().toISOString(),
    ip: extra.ip || 'unknown',
    ua: extra.ua || 'unknown',
    target_url: extra.target_url || null
  });

  saveEvents(store);
  return store;
}

function handleTracking(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;

  // 1. GET /t/open — Pixel d'ouverture transparent
  if (pathname === '/t/open') {
    const cid = parsedUrl.searchParams.get('cid') || 'unknown';
    const uid = parsedUrl.searchParams.get('uid') || 'unknown';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ua = req.headers['user-agent'] || '';

    recordEvent('OPEN', cid, uid, { ip, ua });

    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': TRANSPARENT_GIF.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(TRANSPARENT_GIF);
    return true;
  }

  // 2. GET /t/click — Redirection transparente & enregistrement
  if (pathname === '/t/click') {
    const cid = parsedUrl.searchParams.get('cid') || 'unknown';
    const uid = parsedUrl.searchParams.get('uid') || 'unknown';
    const target = parsedUrl.searchParams.get('target') || 'https://aevum.app';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ua = req.headers['user-agent'] || '';

    recordEvent('CLICK', cid, uid, { ip, ua, target_url: target });

    res.writeHead(302, { 'Location': target });
    res.end();
    return true;
  }

  // 3. GET /api/tracking/events — Synchronisation avec Outbound Sniper local
  if (pathname === '/api/tracking/events') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(loadEvents()));
    return true;
  }

  // 4. GET /api/tracking/ping — Test de connectivité
  if (pathname === '/api/tracking/ping') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      success: true,
      service: 'Outbound Sniper VM Gateway',
      ip: '88.96.57.168',
      timestamp: new Date().toISOString()
    }));
    return true;
  }

  return false;
}

module.exports = { handleTracking, loadEvents, recordEvent };
