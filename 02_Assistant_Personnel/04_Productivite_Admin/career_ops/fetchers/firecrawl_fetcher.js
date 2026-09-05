/**
 * firecrawl_fetcher.js — Connecteur Cloud Furtif Firecrawl pour Cibles Verrouillées
 * Pilier : 02_Assistant_Personnel / Career Ops
 * Plafond strict : < 80 lignes (AGENTS.md).
 */

const https = require('node:https');
const { hashStr } = require('./common');

async function fetchFirecrawlJobs(searchQuery, apiKey) {
  const key = apiKey || process.env.FIRECRAWL_API_KEY;
  if (!key || key.length < 10) return []; // Fail-safe si aucune clé n'est configurée

  const payload = JSON.stringify({
    query: `${searchQuery || 'growth marketing'} remote jobs europe`,
    pageOptions: { fetchPageContent: false }
  });

  return new Promise((resolve) => {
    const req = https.request('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      timeout: 10000
    }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          const data = json.data || [];
          const jobs = data.slice(0, 10).map(item => ({
            id: `FC-${hashStr(item.url)}`,
            company: item.metadata?.title?.split(/[-–|]/)[0]?.trim() || 'Scale-up Cloud',
            title: item.metadata?.title || 'Growth Role',
            location: '100% Full Remote',
            company_hq: 'Europe',
            skills_required: searchQuery || 'Growth, Marketing',
            description: (item.markdown || item.description || '').slice(0, 400),
            salary_range: 'Selon profil',
            link: item.url,
            date_published: new Date().toISOString().slice(0, 10),
            source: 'Firecrawl Search'
          }));
          resolve(jobs);
        } catch { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.setTimeout(10000, () => { req.destroy(); resolve([]); });
    req.write(payload);
    req.end();
  });
}

module.exports = { fetchFirecrawlJobs };
