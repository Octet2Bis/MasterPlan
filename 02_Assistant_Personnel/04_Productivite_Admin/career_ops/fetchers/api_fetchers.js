/**
 * api_fetchers.js — Connecteurs REST JSON Directs pour Plateformes Ouvertes
 * Pilier : 02_Assistant_Personnel / Career Ops
 * Plafond strict : < 170 lignes (AGENTS.md).
 */

const { fetchUrl, hashStr, isFreshUnder48h, stripHtml } = require('./common');

async function fetchHimalayasLive(endpoint) {
  const url = endpoint || 'https://himalayas.app/jobs/api?limit=40';
  const res = await fetchUrl(url);
  if (res.status !== 200 || !res.data) return [];
  try {
    const data = JSON.parse(res.data);
    return (data.jobs || []).filter(i => {
      const pub = i.pubDate ? new Date(i.pubDate * 1000).toISOString().slice(0, 10) : '';
      return isFreshUnder48h(pub);
    }).map(i => ({
      id: `HIM-${hashStr(i.applicationLink || i.guid || i.title)}`,
      company: i.companyName || 'Remote Startup',
      title: i.title || '',
      location: '100% Full Remote',
      company_hq: i.companyLocation || 'International (US / EU)',
      skills_required: (i.categories || []).join(', '),
      description: stripHtml(i.excerpt || '').slice(0, 400),
      salary_range: i.minSalary ? `$${i.minSalary} - $${i.maxSalary}` : 'Selon profil',
      link: i.applicationLink || i.guid,
      date_published: i.pubDate ? new Date(i.pubDate * 1000).toISOString().slice(0, 10) : 'Aujourd’hui',
      source: 'Himalayas'
    }));
  } catch { return []; }
}

async function fetchWorkingNomadsLive(endpoint) {
  const url = endpoint || 'https://www.workingnomads.com/api/exposed_jobs/';
  const res = await fetchUrl(url);
  if (res.status !== 200 || !res.data) return [];
  try {
    const data = JSON.parse(res.data);
    return (Array.isArray(data) ? data.slice(0, 35) : []).filter(i => isFreshUnder48h(i.pub_date || '')).map(i => ({
      id: `WN-${hashStr(i.url || i.title)}`,
      company: i.company_name || 'Tech Startup',
      title: i.title || '',
      location: '100% Full Remote',
      company_hq: i.location || 'Europe / Global',
      skills_required: i.tags || 'Marketing, Growth',
      description: stripHtml(i.description || '').slice(0, 400),
      salary_range: 'Selon profil',
      link: i.url,
      date_published: (i.pub_date || '').slice(0, 10) || 'Aujourd’hui',
      source: 'Working Nomads'
    }));
  } catch { return []; }
}

async function fetchRemoteOKLive(endpoint) {
  const url = endpoint || 'https://remoteok.com/api?tag=marketing';
  const res = await fetchUrl(url);
  if (res.status !== 200 || !res.data) return [];
  try {
    const data = JSON.parse(res.data);
    return (Array.isArray(data) ? data.slice(1, 25) : []).filter(i => isFreshUnder48h((i.date || '').slice(0, 10))).map(i => ({
      id: `ROK-${i.id || hashStr(i.url || i.position)}`,
      company: i.company || 'Tech SaaS',
      title: i.position || '',
      location: '100% Full Remote',
      company_hq: i.location || 'Worldwide',
      skills_required: (i.tags || []).join(', '),
      description: stripHtml(i.description || '').slice(0, 400),
      salary_range: i.salary || 'Selon profil',
      link: i.url || 'https://remoteok.com',
      date_published: (i.date || '').slice(0, 10) || 'Aujourd’hui',
      source: 'RemoteOK'
    }));
  } catch { return []; }
}

async function fetchRemotiveLive(endpoint) {
  const url = endpoint || 'https://remotive.com/api/remote-jobs?category=marketing&limit=30';
  const res = await fetchUrl(url);
  if (res.status !== 200 || !res.data) return [];
  try {
    const data = JSON.parse(res.data);
    return (data.jobs || []).filter(i => isFreshUnder48h(i.publication_date?.slice(0, 10) || '')).map(i => ({
      id: `REM-${i.id || hashStr(i.url || i.title)}`,
      company: i.company_name || 'Remote Scale-up',
      title: i.title || '',
      location: '100% Full Remote',
      company_hq: i.candidate_required_location || 'Europe / Global',
      skills_required: (i.tags || []).join(', '),
      description: stripHtml(i.description || '').slice(0, 400),
      salary_range: i.salary || 'Selon profil',
      link: i.url,
      date_published: (i.publication_date || '').slice(0, 10) || 'Aujourd’hui',
      source: 'Remotive'
    }));
  } catch { return []; }
}

async function fetchArbeitnowLive(endpoint) {
  const url = endpoint || 'https://www.arbeitnow.com/api/job-board-api';
  const res = await fetchUrl(url);
  if (res.status !== 200 || !res.data) return [];
  try {
    const json = JSON.parse(res.data);
    const list = Array.isArray(json.data) ? json.data : [];
    return list.filter(i => {
      if (!i.remote) return false;
      const pubDate = i.created_at ? (typeof i.created_at === 'number' ? new Date(i.created_at * 1000).toISOString().slice(0, 10) : String(i.created_at).slice(0, 10)) : '';
      return isFreshUnder48h(pubDate);
    }).map(i => {
      const pubDate = i.created_at ? (typeof i.created_at === 'number' ? new Date(i.created_at * 1000).toISOString().slice(0, 10) : String(i.created_at).slice(0, 10)) : 'Aujourd’hui';
      return {
        id: `ARB-${hashStr(i.slug || i.url || i.title)}`,
        company: i.company_name || 'Tech Company',
        title: i.title || '',
        location: '100% Full Remote',
        company_hq: i.location || 'Europe / Remote',
        skills_required: Array.isArray(i.tags) ? i.tags.join(', ') : 'Growth, Marketing, Tech',
        description: stripHtml(i.description || '').slice(0, 400),
        salary_range: 'Selon profil',
        link: i.url || `https://www.arbeitnow.com/view/${i.slug}`,
        date_published: pubDate,
        source: 'Arbeitnow'
      };
    });
  } catch { return []; }
}

module.exports = {
  fetchHimalayasLive,
  fetchWorkingNomadsLive,
  fetchRemoteOKLive,
  fetchRemotiveLive,
  fetchArbeitnowLive
};
