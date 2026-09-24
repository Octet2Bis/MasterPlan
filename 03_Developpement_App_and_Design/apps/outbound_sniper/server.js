/**
 * OUTBOUND SNIPER STUDIO — SERVEUR HTTP LOCAL (Node.js 20+, zéro dépendance)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper
 * Orchestrateur : garde de sécurité, routage vers api/*, redirection de clics signée, fichiers statiques.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const googleOAuth = require('./engine/google_oauth');
const { SniperCoreEngine } = require('./engine/sniper_core_engine');
const { verifyClick, makeClickEvent } = require('./engine/tracking');
const { sendJSON, parseBody, rejectUnsafeApiRequest } = require('./engine/server_helpers');

const engine = new SniperCoreEngine();
const PORT = Number(process.env.PORT || engine.config.port);
const HOST = engine.config.host || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME_TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
const redirectUri = () => `http://localhost:${PORT}/api/auth/google/callback`;

const routes = {
  ...require('./api/routes_campaigns')({ engine, redirectUri }),
  ...require('./api/routes_delivery')({ engine })
};

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

/** Clic signé : enregistre puis redirige. Signature invalide → 400 (pas de redirection ouverte). */
function handleClick(req, res, url) {
  const click = verifyClick(url.searchParams, engine.config.tracking?.secret);
  if (!click) { res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Lien invalide.'); }
  engine.recordClick(makeClickEvent(click.cid, click.uid, click.target, req.headers['user-agent']));
  return redirect(res, click.target);
}

async function handleOAuthCallback(url, res) {
  if (!googleOAuth.consumeState(url.searchParams.get('state'))) return redirect(res, `/?auth_error=${encodeURIComponent('Session OAuth expirée ou invalide, recommencez.')}`);
  try {
    await googleOAuth.exchangeCodeForTokens(url.searchParams.get('code'), redirectUri());
    return redirect(res, '/?auth=success');
  } catch (e) {
    return redirect(res, `/?auth_error=${encodeURIComponent(e.message)}`);
  }
}

function serveStatic(pathname, res) {
  const filePath = path.resolve(PUBLIC_DIR, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Ressource non trouvée');
  }
  res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
  return fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/t/click') return handleClick(req, res, url);

  if (url.pathname.startsWith('/api/')) {
    const refusal = rejectUnsafeApiRequest(req);
    if (refusal) return sendJSON(res, 403, { success: false, error: refusal });
    if (url.pathname === '/api/auth/google/callback') return handleOAuthCallback(url, res);
    const handler = routes[`${req.method} ${url.pathname}`];
    if (!handler) return sendJSON(res, 404, { success: false, error: 'Route inconnue.' });
    try {
      const body = req.method === 'POST' ? await parseBody(req) : {};
      const out = await handler(body, url);
      const [status, payload] = Array.isArray(out) && typeof out[0] === 'number' ? out : [200, out];
      return sendJSON(res, status, payload);
    } catch (e) {
      return sendJSON(res, e.status || 500, { success: false, error: e.message });
    }
  }
  return serveStatic(url.pathname, res);
});

if (require.main === module) {
  server.listen(PORT, HOST, () => console.log(`🎯 OUTBOUND SNIPER STUDIO — http://localhost:${PORT} (écoute sur ${HOST})`));
}

module.exports = { server, engine, routes };
