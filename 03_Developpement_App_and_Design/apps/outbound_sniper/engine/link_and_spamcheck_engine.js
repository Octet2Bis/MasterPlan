/**
 * LINK HEALTH & POSTMARK SPAMASSASSIN CHECKER ENGINE (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 160 lignes)
 */
const https = require('node:https');
const http = require('node:http');

const SHORTENER_DOMAINS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'ow.ly', 'is.gd',
  'buff.ly', 'rebrand.ly', 'cutt.ly', 'shorturl.at', 'rb.gy'
]);

function extractHostname(urlString) {
  try { return new URL(urlString).hostname.toLowerCase(); } catch { return ''; }
}

async function checkSingleUrl(urlString, timeoutMs = 3500) {
  const host = extractHostname(urlString);
  if (!host) return { url: urlString, ok: false, isShortener: false, error: 'URL malformée' };
  const isShortener = SHORTENER_DOMAINS.has(host) || Array.from(SHORTENER_DOMAINS).some(s => host.endsWith('.' + s));
  if (isShortener) {
    return { url: urlString, ok: false, isShortener: true, status: null, error: `Raccourcisseur interdit (${host}) : nuit gravement à la délivrabilité.` };
  }

  return new Promise((resolve) => {
    let resolved = false;
    const finish = (result) => { if (!resolved) { resolved = true; resolve(result); } };
    const timer = setTimeout(() => finish({ url: urlString, ok: false, isShortener: false, status: null, error: 'Délai d\'attente dépassé (> 3.5s)' }), timeoutMs);

    try {
      const client = urlString.startsWith('https:') ? https : http;
      const req = client.request(urlString, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OutboundSniper/1.0' } }, (res) => {
        clearTimeout(timer);
        const code = res.statusCode;
        const ok = code >= 200 && code < 400;
        finish({ url: urlString, ok, isShortener: false, status: code, error: ok ? null : `Code HTTP ${code}` });
      });
      req.on('error', (err) => { clearTimeout(timer); finish({ url: urlString, ok: false, isShortener: false, status: null, error: err.message }); });
      req.end();
    } catch (e) {
      clearTimeout(timer);
      finish({ url: urlString, ok: false, isShortener: false, status: null, error: e.message });
    }
  });
}

async function auditLinks({ body = '', target_url = '' }) {
  const urls = new Set();
  if (target_url && target_url.trim().startsWith('http')) urls.add(target_url.trim());
  const matches = body.match(/https?:\/\/[^\s<>"')]+/g) || [];
  matches.forEach(u => urls.add(u.trim()));

  const urlList = Array.from(urls);
  if (urlList.length === 0) {
    return { total: 0, okCount: 0, brokenCount: 0, hasShorteners: false, details: [], isHealthy: true };
  }

  const results = await Promise.all(urlList.map(u => checkSingleUrl(u)));
  const broken = results.filter(r => !r.ok);
  const shorteners = results.filter(r => r.isShortener);

  return {
    total: urlList.length,
    okCount: results.filter(r => r.ok).length,
    brokenCount: broken.length,
    hasShorteners: shorteners.length > 0,
    details: results,
    isHealthy: broken.length === 0 && shorteners.length === 0
  };
}

async function runPostmarkSpamcheck({ subject = '', body = '', from = 'contact@domain.com', to = 'prospect@client.fr' }) {
  const fromDomain = extractHostname('https://' + (from.includes('@') ? from.split('@')[1] : 'domain.com'));
  const rawMime = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2, 9)}@${fromDomain}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    body
  ].join('\r\n');

  return new Promise((resolve) => {
    const postData = JSON.stringify({ email: rawMime, options: 'long' });
    const req = https.request('https://spamcheck.postmarkapp.com/filter', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const score = parseFloat(parsed.score || 0);
          resolve({
            success: true,
            score,
            grade: score <= 2.5 ? 'EXCELLENT' : (score <= 5.0 ? 'ACCEPTABLE' : 'CRITIQUE'),
            rules: parsed.rules || [],
            report: parsed.report || '',
            isPassing: score <= 2.5
          });
        } catch {
          resolve({ success: false, score: null, error: 'Réponse SpamAssassin non analysable', isPassing: true });
        }
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false, score: null, error: 'Délai d\'attente Postmark dépassé (5s)', isPassing: true });
    });
    req.on('error', (err) => resolve({ success: false, score: null, error: err.message, isPassing: true }));
    req.write(postData);
    req.end();
  });
}

module.exports = { auditLinks, runPostmarkSpamcheck, checkSingleUrl };
