/**
 * TESTS SERVEUR — SÉCURITÉ DE L'API, REDIRECTION DE CLICS SIGNÉE, BLOCAGES D'ENVOI
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Tests
 */
const { run } = require('./helpers');
const assert = require('node:assert');
const http = require('node:http');
const { server, engine } = require('../server');
const { buildClickUrl } = require('../engine/tracking');

let base;
function request(method, path, { body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : (typeof body === 'string' ? body : JSON.stringify(body));
    const req = http.request(`${base}${path}`, { method, headers: { Host: `localhost:${server.address().port}`, ...(payload && !headers['Content-Type'] ? { 'Content-Type': 'application/json' } : {}), ...headers } }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => { let json = null; try { json = JSON.parse(data); } catch {} resolve({ status: res.statusCode, headers: res.headers, json, text: data }); });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

module.exports = async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
  const camp = (await request('POST', '/api/campaigns', { body: { name: 'T', subject: 'Bonjour {{prenom}}', body: 'Un échange ?\nRépondez stop pour ne plus recevoir de messages.', target_url: '' } })).json.campaign;
  await request('POST', '/api/campaign/contacts', { body: { campaign_id: camp.id, contacts: [{ id: 'c1', email: 'a@example.com', prenom: 'Ana', status: 'VERIFIED', verified_at: '2026-09-24T00:00:00Z' }] } });

  const failed = await run('Serveur Outbound Sniper', [
    ['P0-5 : /api/config sans secret, sans clé, sans en-tête CORS', async () => {
      const r = await request('GET', '/api/config');
      assert.strictEqual(r.status, 200);
      assert.ok(!r.text.includes(engine.config.tracking.secret));
      assert.ok(!('api_key' in r.json.hunter));
      assert.strictEqual(r.headers['access-control-allow-origin'], undefined);
      const auth = await request('GET', '/api/auth/google/status');
      assert.deepStrictEqual(Object.keys(auth.json).sort(), ['client_id', 'connected', 'has_client_secret', 'user']);
    }],
    ['P0-6 : écriture cross-site refusée (Origin tierce, text/plain, Host non local)', async () => {
      assert.strictEqual((await request('POST', '/api/config', { body: { sender: { name: 'x' } }, headers: { Origin: 'https://evil.example' } })).status, 403);
      assert.strictEqual((await request('POST', '/api/config', { body: '{"sender":{"name":"x"}}', headers: { 'Content-Type': 'text/plain' } })).status, 403);
      assert.strictEqual((await request('GET', '/api/config', { headers: { Host: 'evil.example' } })).status, 403);
    }],
    ['Clics : signature valide → 302 + enregistrement ; falsifiée → 400', async () => {
      const link = buildClickUrl(base, engine.config.tracking.secret, camp.id, 'c1', 'https://example.com/');
      const ok = await request('GET', link.replace(base, ''), { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh) Safari/605' } });
      assert.strictEqual(ok.status, 302);
      assert.strictEqual(ok.headers.location, 'https://example.com/');
      assert.strictEqual((await request('GET', link.replace(base, '').replace('example.com', 'evil.example'))).status, 400);
      const stats = (await request('GET', `/api/stats?cid=${camp.id}`)).json;
      assert.strictEqual(stats.unique_clickers, 1);
    }],
    ['P0-1 : envoi réel refusé sans compte Google ; simulation acceptée sans consommer le quota', async () => {
      const live = await request('POST', '/api/dispatch/start', { body: { campaign_id: camp.id, dry_run: false } });
      assert.strictEqual(live.status, 400);
      assert.ok(live.json.error.includes('Google'));
      const before = (await request('GET', '/api/dispatch/status')).json.global_sent_today;
      const dry = await request('POST', '/api/dispatch/start', { body: { campaign_id: camp.id, dry_run: true } });
      assert.strictEqual(dry.status, 200, dry.text);
      await new Promise(r => setTimeout(r, 50));
      assert.strictEqual((await request('GET', '/api/dispatch/status')).json.global_sent_today, before);
    }],
    ['Statuts hérités de l\'ancien vérificateur (sans preuve) → remis à vérifier', async () => {
      await request('POST', '/api/campaign/contacts', { body: { campaign_id: camp.id, contacts: [{ id: 'old', email: 'o@example.com', status: 'VERIFIED', score: 85 }] } });
      assert.strictEqual((await request('GET', `/api/campaign/contacts?cid=${camp.id}`)).json[0].status, 'PENDING');
    }],
    ['Contrôle avant envoi : variable manquante → lancement bloqué', async () => {
      await request('POST', '/api/campaign/contacts', { body: { campaign_id: camp.id, contacts: [{ id: 'c2', email: 'b@example.com', status: 'VERIFIED', verified_at: '2026-09-24T00:00:00Z' }] } });
      const r = await request('POST', '/api/dispatch/start', { body: { campaign_id: camp.id, dry_run: true } });
      assert.strictEqual(r.status, 400);
      assert.ok(r.json.preflight.issues.some(i => i.code === 'ORPHAN_VARIABLES'));
    }],
    ['Passerelle VM : clic signé accepté, journal protégé par le secret', async () => {
      process.env.TRACKING_SECRET = 'gateway-test-secret';
      process.env.EVENTS_FILE = require('node:path').join(require('./helpers').DATA_DIR, 'gw.json');
      const gw = require('../gateway/tracking_gateway').server;
      await new Promise(r => gw.listen(0, '127.0.0.1', r));
      const gbase = `http://127.0.0.1:${gw.address().port}`;
      const get = (p, headers = {}) => new Promise(res => http.get(`${gbase}${p}`, { headers }, r => { let d = ''; r.on('data', c => { d += c; }); r.on('end', () => res({ status: r.statusCode, text: d })); }));
      const link = buildClickUrl(gbase, 'gateway-test-secret', 'camp', 'c1', 'https://example.com/');
      assert.strictEqual((await get(link.replace(gbase, ''), { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) Firefox/130' })).status, 302);
      assert.strictEqual((await get('/api/tracking/events')).status, 401);
      const ev = await get('/api/tracking/events', { Authorization: 'Bearer gateway-test-secret' });
      assert.strictEqual(JSON.parse(ev.text).events.length, 1);
      await new Promise(r => gw.close(r));
    }],
    ['Fichiers statiques : traversée de répertoire impossible', async () => {
      assert.strictEqual((await request('GET', '/../server.js')).status, 404);
      assert.strictEqual((await request('GET', '/%2e%2e/server.js')).status, 404);
      assert.strictEqual((await request('GET', '/')).status, 200);
    }]
  ]);
  engine.dispatchManager.campaignWorkers.forEach((_w, cid) => engine.dispatchManager.stopCampaign(cid));
  await new Promise(r => server.close(r));
  return failed;
};
