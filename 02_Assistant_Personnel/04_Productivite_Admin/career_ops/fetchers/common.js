/**
 * common.js — Utilitaires HTTP et Normalisation Partagés (Pilier 02)
 * Plafond strict : < 80 lignes (AGENTS.md).
 */

const https = require('node:https');
const http = require('node:http');

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml,application/json;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8'
};

function fetchUrl(url, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: DEFAULT_HEADERS, timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', () => resolve({ status: 500, data: '' }));
    req.setTimeout(timeoutMs, () => { req.destroy(); resolve({ status: 408, data: '' }); });
  });
}

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
}

function isFreshUnder48h(dateStr) {
  if (!dateStr) return false;
  const d = String(dateStr).toLowerCase().trim();
  if (['hour', 'minute', 'today', 'aujourd', 'yesterday', 'hier', '1 day', '24h', '48h', '1 j', '2 j'].some(t => d.includes(t))) return true;
  if (['3 day', '4 day', '5 day', '6 day', '7 day', 'week', 'month', 'year', 'semaine', 'mois', 'an'].some(t => d.includes(t))) return false;
  const match = d.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const diff = (Date.now() - new Date(match[1], parseInt(match[2], 10) - 1, match[3]).getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 2;
  }
  return d.includes('récent') || d.includes('recent');
}

function stripHtml(str) {
  return (str || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  fetchUrl,
  hashStr,
  isFreshUnder48h,
  stripHtml,
  sleep,
  DEFAULT_HEADERS
};
