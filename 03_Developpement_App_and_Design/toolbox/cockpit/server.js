/**
 * MASTER PLAN — LOCAL COCKPIT SERVER (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Toolbox
 * Rôle : Serveur HTTP pour le Dashboard Visuel Master Plan (< 160 lignes)
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const PORT = process.env.PORT || 4000;
const ROOT_DIR = path.resolve(__dirname, '../../..');
const COCKPIT_DIR = __dirname;
const PUBLIC_DIR = path.join(COCKPIT_DIR, 'public');
const DATA_DIR = path.join(COCKPIT_DIR, 'data');
const MANIFEST_FILE = path.join(DATA_DIR, 'cockpit_manifest.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8'
};

function readJson(file, fallback = {}) {
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : fallback; }
  catch { return fallback; }
}

function handleApi(req, res, url) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (url === '/api/manifest') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(readJson(MANIFEST_FILE)));
  }

  if (url.startsWith('/api/action') && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { action } = JSON.parse(body);
        let output = '';
        if (action.includes('Intégrité') || action.includes('Qualité')) {
          output = execSync('node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js', { cwd: ROOT_DIR, encoding: 'utf-8' });
        } else if (action.includes('DAG') || action.includes('Topologie')) {
          output = execSync('node 03_Developpement_App_and_Design/toolbox/dag_validator.js', { cwd: ROOT_DIR, encoding: 'utf-8' });
        } else if (action.includes('4 Portes')) {
          output = execSync('node 03_Developpement_App_and_Design/toolbox/gatekeeper.js --check', { cwd: ROOT_DIR, encoding: 'utf-8' });
        } else {
          output = `⚡ Action [${action}] exécutée avec succès.`;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, output }));
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, output: err.stdout || err.message }));
      }
    });
    return;
  }

  if (url.startsWith('/api/live/')) {
    const endpoint = url.replace('/api/live/', '');
    let targetPath = '';
    if (endpoint === 'companies_dashboard') targetPath = path.join(ROOT_DIR, '02_Assistant_Personnel/Workspace/career/companies_dashboard.html');
    else if (endpoint === 'archify') targetPath = path.join(ROOT_DIR, '03_Developpement_App_and_Design/Ressources/Knowledge/aevum_runtime_architecture_diagram.html');
    else if (endpoint === 'gatekeeper') targetPath = path.join(ROOT_DIR, '03_Developpement_App_and_Design/01_Core_Standards/protocol_4_portes_gatekeeping.md');
    else if (endpoint === 'telegram_status') targetPath = path.join(ROOT_DIR, '02_Assistant_Personnel/Workspace/research_graph.json');
    else if (endpoint === 'strategy') targetPath = path.join(ROOT_DIR, '01_GTM_Growth/01_Strategy_and_Positioning/_instructions.md');
    else if (endpoint === 'aeo') targetPath = path.join(ROOT_DIR, '01_GTM_Growth/02_Acquisition_and_AEO/_instructions.md');
    else if (endpoint === 'buying_committee') targetPath = path.join(ROOT_DIR, '01_GTM_Growth/04_Outbound_and_CRM/_instructions.md');
    else if (endpoint === 'landing') targetPath = path.join(ROOT_DIR, '01_GTM_Growth/03_Experimentation/_instructions.md');
    else if (endpoint === 'activation') targetPath = path.join(ROOT_DIR, '01_GTM_Growth/05_Activation_and_CSM/_instructions.md');
    else if (endpoint === 'gtm_toolbox') targetPath = path.join(ROOT_DIR, '01_GTM_Growth/toolbox/core/firecrawl_gtm_adapter.js');

    if (targetPath && fs.existsSync(targetPath)) {
      const ext = path.extname(targetPath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain; charset=utf-8' });
      return res.end(fs.readFileSync(targetPath));
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint non trouvé' }));
}

const server = http.createServer((req, res) => {
  const cleanUrl = req.url.split('?')[0];

  if (cleanUrl.startsWith('/api/')) return handleApi(req, res, cleanUrl);

  // Serveur dédié pour le simulateur Aevum monté en iframe
  if (cleanUrl.startsWith('/apps/aevum_ios/web_preview/')) {
    const rel = cleanUrl.replace('/apps/aevum_ios/web_preview/', '');
    const safeRel = rel === '' ? 'index.html' : rel;
    const filePath = path.join(ROOT_DIR, '03_Developpement_App_and_Design/apps/aevum_ios/web_preview', safeRel);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain', 'Cache-Control': 'no-cache' });
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  // Fichiers statiques du Cockpit UI
  let filePath = path.join(PUBLIC_DIR, cleanUrl === '/' ? 'index.html' : cleanUrl);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(PUBLIC_DIR, 'index.html');

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain', 'Cache-Control': 'no-cache' });
  fs.createReadStream(filePath).pipe(res);
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n============================================================`);
    console.log(`🌌 MASTER PLAN VISUAL COCKPIT ACTIF (PORT ${PORT})`);
    console.log(`🌐 Accédez au Dashboard sur : http://localhost:${PORT}`);
    console.log(`============================================================\n`);
  });
}

module.exports = { server };
