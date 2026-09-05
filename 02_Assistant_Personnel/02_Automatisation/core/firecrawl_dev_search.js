/**
 * firecrawl_dev_search.js — Client Firecrawl Developer Index (Zero-Config / Keyless)
 * Localisation : 02_Assistant_Personnel/02_Automatisation/core/
 * Rôle : Module noyau partagé par les 3 piliers du Master Plan.
 *        Recherche sémantique dans 70M+ READMEs, issues, PRs et docs techniques.
 * Plafond strict : < 120 lignes (AGENTS.md Commandement 1).
 */

const https = require('node:https');

const FIRECRAWL_BASE = 'https://api.firecrawl.dev/v2/search/developer';

/**
 * Recherche basique dans le Developer Index (GET, keyless).
 * @param {string} query — Question en langage naturel
 * @param {number} limit — Nombre de résultats (1-10, défaut 3)
 * @returns {Promise<Array<{id,url,title,snippet}>>}
 */
async function searchDeveloperIndex(query, limit = 3) {
  if (!query || typeof query !== 'string') return [];
  const cleanQuery = encodeURIComponent(query.trim());
  const url = `${FIRECRAWL_BASE}?query=${cleanQuery}&k=${Math.min(limit, 10)}`;
  return _httpGet(url);
}

/**
 * Recherche avancée avec filtres (POST, keyless).
 * @param {string} query — Question en langage naturel
 * @param {object} options — { types, repos, sources, language, limit }
 *   types: ['doc','issue','pull_request','readme']
 *   repos: ['owner/repo', ...]
 *   sources: ['docs.example.com', ...]
 *   language: 'Swift' | 'Python' | 'JavaScript' | ...
 *   limit: number (1-10)
 * @returns {Promise<Array<{id,url,title,snippet}>>}
 */
async function searchDeveloperFiltered(query, options = {}) {
  if (!query || typeof query !== 'string') return [];
  const body = { query: query.trim(), k: Math.min(options.limit || 5, 10) };
  if (options.types) body.types = options.types;
  if (options.repos) body.repos = options.repos;
  if (options.sources) body.sources = options.sources;
  if (options.language) body.language = options.language;
  return _httpPost(FIRECRAWL_BASE, body);
}

function _parseResults(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.success && Array.isArray(parsed.results)) {
      return parsed.results.map(r => ({
        id: r.id || '',
        url: r.url || '',
        title: r.title || r.url || '',
        snippet: (r.passages && r.passages[0]?.text) ? r.passages[0].text.trim() : ''
      }));
    }
  } catch { /* silent */ }
  return [];
}

function _httpGet(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 12000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(_parseResults(data)));
    });
    req.on('timeout', () => { req.destroy(); resolve([]); });
    req.on('error', () => resolve([]));
  });
}

function _httpPost(url, body) {
  const payload = JSON.stringify(body);
  const parsed = new URL(url);
  const opts = {
    hostname: parsed.hostname, path: parsed.pathname,
    method: 'POST', timeout: 12000,
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  };
  return new Promise((resolve) => {
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(_parseResults(data)));
    });
    req.on('timeout', () => { req.destroy(); resolve([]); });
    req.on('error', () => resolve([]));
    req.write(payload);
    req.end();
  });
}

function formatDevSearchResults(results) {
  if (!results.length) return 'No results found in Firecrawl Developer Index.';
  let msg = `🔥 *FIRECRAWL DEVELOPER INDEX (${results.length} résultats)* :\n\n`;
  results.forEach((r, idx) => {
    msg += `[${idx + 1}] *${r.title}*\n`;
    msg += `    🔗 ${r.url}\n`;
    if (r.snippet) {
      msg += `    📝 _« ${r.snippet.replace(/\n+/g, ' ').substring(0, 160)}... »_\n`;
    }
    msg += '\n';
  });
  return msg.trim();
}

module.exports = { searchDeveloperIndex, searchDeveloperFiltered, formatDevSearchResults };
