/**
 * index.js — Orchestrateur Furtif et Dispatcher Multi-Sources (Pilier 02)
 * Rôle : Lit job_sources.json, orchestre les connecteurs actifs et applique
 *        le filtrage sémantique in-memory sur les 35+ requêtes cibles.
 * Plafond strict : < 180 lignes (AGENTS.md).
 */

const fs = require('node:fs');
const path = require('node:path');

const { fetchLinkedInLive } = require('./linkedin_fetcher');
const {
  fetchHimalayasLive,
  fetchWorkingNomadsLive,
  fetchRemoteOKLive,
  fetchRemotiveLive,
  fetchArbeitnowLive
} = require('./api_fetchers');
const {
  fetchJobspressoLive,
  fetchWeWorkRemotelyLive
} = require('./rss_fetchers');
const { fetchFirecrawlJobs } = require('./firecrawl_fetcher');

function loadJsonSafe(filePath) {
  try {
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null;
  } catch {
    return null;
  }
}

function matchesAnyTargetQuery(job, queries = []) {
  if (!queries || queries.length === 0) return true;
  const full = `${job.title} ${job.skills_required || ''} ${job.description || ''}`.toLowerCase();
  const titleLower = (job.title || '').toLowerCase();

  // Priorité 1 : Le titre correspond directement à un intitulé ou un mot clé cœur
  const matchedInTitle = queries.some(q => {
    const ql = q.toLowerCase();
    return titleLower.includes(ql) || ql.split(' ').every(w => w.length > 3 && titleLower.includes(w));
  });
  if (matchedInTitle) return true;

  // Priorité 2 : Le corps mentionne l'intitulé exact
  return queries.some(q => full.includes(q.toLowerCase()));
}

async function fetchAllActiveSources(options = {}) {
  const careerDir = options.careerDir || path.resolve(__dirname, '../../../Workspace/career');
  const sourcesConfig = loadJsonSafe(path.join(careerDir, 'job_sources.json')) || { sources: [] };
  const taxonomy = loadJsonSafe(path.join(careerDir, 'career_taxonomy.json')) || { search_queries: [] };
  const queries = taxonomy.search_queries || [];

  const isEnabled = (namePattern) => {
    const s = sourcesConfig.sources.find(src => src.name.toLowerCase().includes(namePattern.toLowerCase()));
    return s ? Boolean(s.enabled) : true;
  };
  const getEndpoint = (namePattern) => {
    return sourcesConfig.sources.find(src => src.name.toLowerCase().includes(namePattern.toLowerCase()))?.endpoint;
  };

  const tasks = [];

  // 1. LinkedIn (Rotation furtive)
  if (isEnabled('linkedin')) {
    tasks.push(fetchLinkedInLive(queries, { careerDir }));
  }

  // 2. Flux JSON (APIs ouvertes)
  if (isEnabled('himalayas')) tasks.push(fetchHimalayasLive(getEndpoint('himalayas')));
  if (isEnabled('working nomads')) tasks.push(fetchWorkingNomadsLive(getEndpoint('working nomads')));
  if (isEnabled('remoteok')) tasks.push(fetchRemoteOKLive(getEndpoint('remoteok')));
  if (isEnabled('remotive')) tasks.push(fetchRemotiveLive(getEndpoint('remotive')));
  if (isEnabled('arbeitnow')) tasks.push(fetchArbeitnowLive(getEndpoint('arbeitnow')));

  // 3. Flux RSS XML
  if (isEnabled('jobspresso')) tasks.push(fetchJobspressoLive(getEndpoint('jobspresso')));
  if (isEnabled('weworkremotely') || isEnabled('we work remotely')) {
    tasks.push(fetchWeWorkRemotelyLive(getEndpoint('weworkremotely') || getEndpoint('we work remotely')));
  }

  // 4. Firecrawl Cloud (si activé)
  if (isEnabled('firecrawl')) {
    const topQuery = queries[0] || 'growth marketing';
    tasks.push(fetchFirecrawlJobs(topQuery, options.firecrawlApiKey));
  }

  const results = await Promise.allSettled(tasks);
  const rawJobs = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      rawJobs.push(...r.value);
    }
  }

  // Filtrage sémantique in-memory pour toutes les offres non issues de requêtes précises
  const filteredJobs = [];
  const seenUrls = new Set();

  for (const j of rawJobs) {
    if (!j || !j.link || !j.title) continue;
    const key = j.link.toLowerCase();
    if (seenUrls.has(key)) continue;
    seenUrls.add(key);

    // LinkedIn a déjà été requêté par intitulé ciblé ; pour les autres, on valide la pertinence sémantique
    if (j.source.startsWith('LinkedIn') || matchesAnyTargetQuery(j, queries)) {
      filteredJobs.push(j);
    }
  }

  return filteredJobs;
}

module.exports = {
  fetchAllActiveSources,
  fetchLinkedInLive,
  fetchHimalayasLive,
  fetchWorkingNomadsLive,
  fetchRemoteOKLive,
  fetchRemotiveLive,
  fetchArbeitnowLive,
  fetchJobspressoLive,
  fetchWeWorkRemotelyLive,
  fetchFirecrawlJobs
};
