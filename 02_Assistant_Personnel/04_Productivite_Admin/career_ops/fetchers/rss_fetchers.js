/**
 * rss_fetchers.js — Connecteurs RSS XML Légers (Jobspresso, WeWorkRemotely)
 * Pilier : 02_Assistant_Personnel / Career Ops
 * Plafond strict : < 110 lignes (AGENTS.md).
 */

const { fetchUrl, hashStr, isFreshUnder48h, stripHtml } = require('./common');

function cleanCdata(text = '') {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function parseRssItems(xmlText) {
  const items = [];
  const itemMatches = [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  for (const match of itemMatches) {
    const raw = match[1];
    const titleMatch = raw.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = raw.match(/<link>([\s\S]*?)<\/link>/i);
    const dateMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const descMatch = raw.match(/<description>([\s\S]*?)<\/description>/i);

    const title = cleanCdata(titleMatch ? titleMatch[1] : '');
    const link = cleanCdata(linkMatch ? linkMatch[1] : '');
    const pubDate = cleanCdata(dateMatch ? dateMatch[1] : '');
    const desc = stripHtml(cleanCdata(descMatch ? descMatch[1] : '')).slice(0, 400);

    if (title && link) {
      items.push({ title, link, pubDate, desc });
    }
  }
  return items;
}

async function fetchJobspressoLive(endpoint) {
  const url = endpoint || 'https://jobspresso.co/feed/';
  const res = await fetchUrl(url);
  if (res.status !== 200 || !res.data) return [];
  try {
    const items = parseRssItems(res.data);
    return items.filter(i => isFreshUnder48h(i.pubDate)).map(i => {
      const parts = i.title.split(/\sat\s|@|–|-/i);
      const title = (parts[0] || i.title).trim();
      const comp = parts.length > 1 ? parts[1].trim() : 'Remote Tech';
      return {
        id: `JBP-${hashStr(i.link)}`,
        company: comp,
        title,
        location: '100% Full Remote',
        company_hq: 'International / Remote',
        skills_required: 'Marketing, Growth, Ops',
        description: i.desc,
        salary_range: 'Selon profil',
        link: i.link,
        date_published: i.pubDate.slice(0, 16) || 'Aujourd’hui',
        source: 'Jobspresso'
      };
    });
  } catch { return []; }
}

async function fetchWeWorkRemotelyLive(endpoint) {
  const url = endpoint || 'https://weworkremotely.com/categories/remote-marketing-jobs.rss';
  const res = await fetchUrl(url);
  if (res.status !== 200 || !res.data) return [];
  try {
    const items = parseRssItems(res.data);
    return items.filter(i => isFreshUnder48h(i.pubDate)).map(i => {
      const parts = i.title.includes(':') ? i.title.split(':') : [i.title, i.title];
      const comp = (parts[0] || 'Scale-up Tech').trim();
      const title = (parts[1] || parts[0]).trim();
      return {
        id: `WWR-${hashStr(i.link)}`,
        company: comp,
        title,
        location: '100% Full Remote',
        company_hq: 'International / Remote',
        skills_required: 'Marketing, Growth, Demand Gen',
        description: i.desc,
        salary_range: 'Selon profil',
        link: i.link,
        date_published: i.pubDate.slice(0, 16) || 'Aujourd’hui',
        source: 'WeWorkRemotely'
      };
    });
  } catch { return []; }
}

module.exports = {
  fetchJobspressoLive,
  fetchWeWorkRemotelyLive
};
