/**
 * MASTER PLAN — LINK ENRICHER & METADATA SCRAPER (Node.js)
 * Pilier 02 : Assistant Personnel
 * Rôle : Extraction OpenGraph sécurisée & Tagging untrusted_external.
 * Plafond strict : < 110 lignes
 */

const https = require('node:https');
const http = require('node:http');
const { URL } = require('node:url');

function sanitizeText(raw, maxLen = 300) {
  if (!raw) return null;
  return String(raw)
    .replace(/&#x201c;|&#x201d;|&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen);
}

async function enrichLinkMetadata(targetUrl) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(targetUrl);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const req = client.get(targetUrl, {
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'
        },
        timeout: 6000
      }, (res) => {
        // Redirections éventuelles
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          try {
            const redirectUrl = new URL(res.headers.location, targetUrl).toString();
            return enrichLinkMetadata(redirectUrl).then(resolve);
          } catch {
            return resolve({ url: targetUrl, source: 'untrusted_external', title: null, summary: null });
          }
        }

        let html = '';
        res.on('data', chunk => {
          if (html.length < 150000) html += chunk; // Limite de taille tampon
        });

        res.on('end', () => {
          const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                             html.match(/<title>([^<]+)<\/title>/i);
          const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) ||
                            html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);

          resolve({
            url: targetUrl,
            source: 'untrusted_external',
            title: titleMatch ? sanitizeText(titleMatch[1], 160) : null,
            summary: descMatch ? sanitizeText(descMatch[1], 350) : null,
            isEnriched: true
          });
        });
      });

      req.on('timeout', () => { req.destroy(); resolve({ url: targetUrl, source: 'untrusted_external', title: null, summary: null }); });
      req.on('error', () => resolve({ url: targetUrl, source: 'untrusted_external', title: null, summary: null }));
    } catch {
      resolve({ url: targetUrl, source: 'untrusted_external', title: null, summary: null });
    }
  });
}

module.exports = { enrichLinkMetadata, sanitizeText };
