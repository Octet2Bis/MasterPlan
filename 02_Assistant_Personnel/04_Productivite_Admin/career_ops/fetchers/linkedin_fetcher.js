/**
 * linkedin_fetcher.js — Connecteur Furtif LinkedIn Guest API avec Rotation Round-Robin
 * Pilier : 02_Assistant_Personnel / Career Ops
 * Plafond strict : < 110 lignes (AGENTS.md).
 */

const fs = require('node:fs');
const path = require('node:path');
const { fetchUrl, hashStr, isFreshUnder48h, sleep } = require('./common');

const BATCH_SIZE = 7;
const JITTER_MS = 650;

function getCursorState(cursorFile, totalQueries) {
  let index = 0;
  if (fs.existsSync(cursorFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(cursorFile, 'utf8'));
      if (typeof data.nextIndex === 'number') index = data.nextIndex;
    } catch {}
  }
  return totalQueries > 0 ? index % totalQueries : 0;
}

function saveCursorState(cursorFile, nextIndex) {
  try {
    fs.writeFileSync(cursorFile, JSON.stringify({ nextIndex, updated_at: new Date().toISOString() }), 'utf8');
  } catch {}
}

async function fetchLinkedInLive(queries = [], options = {}) {
  const allQueries = Array.isArray(queries) && queries.length > 0 ? queries : ['growth marketing'];
  const careerDir = options.careerDir || path.resolve(__dirname, '../../../Workspace/career');
  const cursorFile = path.join(careerDir, 'linkedin_cursor_state.json');

  const startIndex = getCursorState(cursorFile, allQueries.length);
  const selectedQueries = [];
  for (let i = 0; i < Math.min(BATCH_SIZE, allQueries.length); i++) {
    selectedQueries.push(allQueries[(startIndex + i) % allQueries.length]);
  }
  const nextCursor = (startIndex + selectedQueries.length) % allQueries.length;
  saveCursorState(cursorFile, nextCursor);

  const jobs = [];
  for (const kw of selectedQueries) {
    try {
      const encoded = encodeURIComponent(`${kw} remote`);
      const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encoded}&location=Europe&f_WT=2&f_TPR=r86400&sortBy=DD&start=0`;
      const res = await fetchUrl(url, 4500);
      if (res.status === 200 && res.data) {
        const titles = [...res.data.matchAll(/<h3 class="base-search-card__title">\s*([\s\S]*?)\s*<\/h3>/g)].map(m => m[1].trim());
        const comps = [...res.data.matchAll(/<h4 class="base-search-card__subtitle">[\s\S]*?<a[^>]*>\s*([\s\S]*?)\s*<\/a>/g)].map(m => m[1].trim());
        const links = [...res.data.matchAll(/<a class="base-card__full-link[^"]*" href="([^"?]*)/g)].map(m => m[1].trim());
        const dates = [...res.data.matchAll(/<time[^>]*datetime="([^"]*)"/g)].map(m => m[1].trim());
        const locs = [...res.data.matchAll(/<span class="job-search-card__location">\s*([\s\S]*?)\s*<\/span>/g)].map(m => m[1].trim());

        for (let i = 0; i < titles.length; i++) {
          const dt = dates[i] || "Aujourd'hui";
          const loc = locs[i] || 'Europe';
          if (links[i] && titles[i] && isFreshUnder48h(dt)) {
            // Rejet préventif immédiat si le titre contient des marqueurs légaux de genre européens
            if (/(?:[:*_]in\b|\b[a-z]+:in\b|\b[a-z]+\*in\b|\([a-z]\/[a-z](?:\/[a-z])?\)|\bgn\b)/i.test(titles[i])) {
              continue;
            }

            // Récupération de la description réelle uniquement pour les sous-domaines étrangers
            let realDescription = `Poste 1-3 ans chez ${comps[i] || 'Entreprise'} : ${titles[i]} (Siège: ${loc}).`;
            const isForeignSub = /^https?:\/\/(?:de|at|ch|es|it|nl|pl|pt|se|dk|no|fi)\.linkedin\.com/i.test(links[i]);
            const jId = (links[i].match(/(\d{8,12})/) || [])[1];
            if (isForeignSub && jId) {
              try {
                const descRes = await fetchUrl(`https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jId}`, 1500);
                if (descRes.status === 200 && descRes.data) {
                  const cleaned = stripHtml(descRes.data).slice(0, 1500);
                  if (cleaned && cleaned.length > 50) realDescription = cleaned;
                }
              } catch {}
            }

            jobs.push({
              id: `LI-${hashStr(links[i])}`,
              company: comps[i] || 'Scale-up Tech',
              title: titles[i],
              location: loc,
              company_hq: loc,
              skills_required: kw,
              description: realDescription,
              salary_range: '38k€ - 50k€ (1-3 ans)',
              link: links[i],
              date_published: dt,
              source: 'LinkedIn (Live 24h)'
            });
          }
        }
      }
    } catch {}
    await sleep(JITTER_MS);
  }

  return jobs;
}

module.exports = { fetchLinkedInLive, BATCH_SIZE };
