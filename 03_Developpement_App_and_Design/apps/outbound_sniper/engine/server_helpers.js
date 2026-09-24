/**
 * SERVER HELPERS — RÉPONSES JSON, LECTURE DU CORPS & GARDE ANTI-CSRF / DNS-REBINDING (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * L'API /api/* n'accepte que des requêtes du navigateur local sur l'origine de l'app :
 * pas d'en-tête CORS, Host local obligatoire, Origin identique et Content-Type JSON pour les écritures.
 */
const MAX_BODY_BYTES = 5 * 1024 * 1024;
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) { reject(Object.assign(new Error('Corps de requête trop volumineux.'), { status: 413 })); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(Object.assign(new Error('JSON invalide.'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

/** @returns {string|null} message d'erreur si la requête doit être refusée */
function rejectUnsafeApiRequest(req) {
  const host = String(req.headers.host || '');
  const hostname = host.replace(/:\d+$/, '');
  if (!LOCAL_HOSTS.has(hostname)) return 'Hôte non autorisé : ouvrez l\'application via http://localhost.';
  if (req.method === 'GET' || req.method === 'HEAD') return null;
  const origin = req.headers.origin;
  if (origin && origin !== `http://${host}`) return 'Origine non autorisée.';
  if (!String(req.headers['content-type'] || '').includes('application/json')) return 'Content-Type application/json requis.';
  return null;
}

module.exports = { sendJSON, parseBody, rejectUnsafeApiRequest };
