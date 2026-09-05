/**
 * DAILY REMOTE COMPANY SCANNER (Pilier 02 - Career Ops)
 * Scanne 1x par jour les pages carrières des entreprises 100% remote vérifiées.
 * Plafond strict : < 200 lignes (AGENTS.md).
 */

const fs = require('node:fs');
const path = require('node:path');
const { fetchUrl, stripHtml, hashStr, sleep } = require('./fetchers/common');
const { runJuryEvaluation } = require('./inspectors/jury_pipeline');
const { sendTelegramRaw } = require('./live_job_scraper');

const CAREER_DIR = path.resolve(__dirname, '../../Workspace/career');

async function scanCompanyCareers(company) {
  const url = company.careers_url;
  if (!url) return [];
  const jobs = [];

  try {
    // 1. Détection ATS Ashby
    const ashbyMatch = url.match(/jobs\.ashbyhq\.com\/([^/?#]+)/i);
    if (ashbyMatch) {
      const org = ashbyMatch[1];
      const res = await fetchUrl(`https://api.ashbyhq.com/posting-api/job-board/${org}`, 4000);
      if (res.status === 200 && res.data) {
        const data = JSON.parse(res.data);
        (data.jobs || []).forEach(j => {
          jobs.push({
            id: `REM-${hashStr(j.jobUrl || j.title)}`,
            company: company.name,
            title: j.title,
            location: j.location || company.remote_status,
            company_hq: company.name,
            skills_required: 'GTM / Growth',
            description: stripHtml(j.descriptionHtml || j.title),
            link: j.jobUrl || `https://jobs.ashbyhq.com/${org}/${j.id}`,
            date_published: new Date().toISOString().split('T')[0],
            source: `${company.name} (Direct Career)`
          });
        });
        return jobs;
      }
    }

    // 2. Détection ATS Greenhouse
    const ghMatch = url.match(/boards\.greenhouse\.io\/([^/?#]+)/i);
    if (ghMatch) {
      const org = ghMatch[1];
      const res = await fetchUrl(`https://boards-api.greenhouse.io/v1/boards/${org}/jobs`, 4000);
      if (res.status === 200 && res.data) {
        const data = JSON.parse(res.data);
        (data.jobs || []).forEach(j => {
          jobs.push({
            id: `REM-${hashStr(j.absolute_url || j.title)}`,
            company: company.name,
            title: j.title,
            location: j.location?.name || company.remote_status,
            company_hq: company.name,
            skills_required: 'GTM / Growth',
            description: `${j.title} chez ${company.name}`,
            link: j.absolute_url,
            date_published: new Date().toISOString().split('T')[0],
            source: `${company.name} (Direct Career)`
          });
        });
        return jobs;
      }
    }

    // 3. Détection ATS Lever
    const leverMatch = url.match(/jobs\.lever\.co\/([^/?#]+)/i);
    if (leverMatch) {
      const org = leverMatch[1];
      const res = await fetchUrl(`https://api.lever.co/v0/postings/${org}?mode=json`, 4000);
      if (res.status === 200 && res.data) {
        const data = JSON.parse(res.data);
        if (Array.isArray(data)) {
          data.forEach(j => {
            jobs.push({
              id: `REM-${hashStr(j.hostedUrl || j.text)}`,
              company: company.name,
              title: j.text,
              location: j.categories?.location || company.remote_status,
              company_hq: company.name,
              skills_required: 'GTM / Growth',
              description: stripHtml(j.descriptionPlain || j.text),
              link: j.hostedUrl,
              date_published: new Date().toISOString().split('T')[0],
              source: `${company.name} (Direct Career)`
            });
          });
          return jobs;
        }
      }
    }

    // 4. Fetch HTML direct pour autres sites
    const htmlRes = await fetchUrl(url, 4500);
    if (htmlRes.status === 200 && htmlRes.data) {
      const links = [...htmlRes.data.matchAll(/<a[^>]+href="([^"]*(?:jobs?|careers?|positions?)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)];
      for (const m of links.slice(0, 10)) {
        const rawTitle = stripHtml(m[2]);
        let jobLink = m[1];
        if (jobLink.startsWith('/')) {
          const origin = new URL(url).origin;
          jobLink = `${origin}${jobLink}`;
        }
        if (rawTitle.length > 5 && rawTitle.length < 80) {
          jobs.push({
            id: `REM-${hashStr(jobLink)}`,
            company: company.name,
            title: rawTitle,
            location: company.remote_status,
            company_hq: company.name,
            skills_required: 'GTM / Growth',
            description: `Poste chez ${company.name} : ${rawTitle}`,
            link: jobLink,
            date_published: new Date().toISOString().split('T')[0],
            source: `${company.name} (Direct Career)`
          });
        }
      }
    }
  } catch {}

  return jobs;
}

function formatDailyDigestMarkdown(stats, qualifiedJobs) {
  const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

  let msg = `🏢 *RAPPORT DU SCAN QUOTIDIEN — ENTREPRISES 100% REMOTE VÉRIFIÉES*\n` +
            `⏱️ _${dateStr} à ${timeStr}_\n\n` +
            `📊 *Bilan du scan :*\n` +
            ` • Entreprises cibles auditées : *${stats.companiesScanned}*\n` +
            ` • Postes bruts explorés : *${stats.totalJobsFound}*\n` +
            ` • Opportunités qualifiées GTM / Growth (1-3 ans) : *${qualifiedJobs.length}*\n\n`;

  if (qualifiedJobs.length > 0) {
    msg += `🎯 *Postes repérés sur les sites officiels :*\n`;
    qualifiedJobs.slice(0, 5).forEach((j, idx) => {
      msg += ` ${idx + 1}. *${j.company}* — ${j.title}\n` +
             `    📊 Score : *${j.match_score}%* | 👤 Décideur : \`${j.target_role || 'Head of Growth'}\`\n` +
             `    🔗 [Voir l'annonce originale](${j.link})\n\n`;
    });
    msg += `👉 Pour postuler ou préparer un message spontané : \`/spontane <id>\``;
  } else {
    msg += `ℹ️ _Aucune nouvelle ouverture GTM junior détectée aujourd'hui sur les pages carrières directes._\n` +
           `💡 _Vous pouvez utiliser \`/spontane\` pour engager une démarche spontanée ciblée auprès des décideurs._`;
  }

  return msg;
}

async function runDailyRemoteScanner(options = {}) {
  const cDir = options.careerDir || CAREER_DIR;
  const envPath = options.envPath || path.resolve(__dirname, '../../.secrets/.env');
  const compFile = path.join(cDir, 'verified_remote_companies.json');
  const taxFile = path.join(cDir, 'career_taxonomy.json');

  if (!fs.existsSync(compFile)) return { count: 0, qualified: [] };
  const companies = JSON.parse(fs.readFileSync(compFile, 'utf8'));
  const tax = fs.existsSync(taxFile) ? JSON.parse(fs.readFileSync(taxFile, 'utf8')) : {};

  let totalJobsFound = 0;
  const allCandidateJobs = [];

  for (const company of companies) {
    const jobs = await scanCompanyCareers(company);
    totalJobsFound += jobs.length;
    for (const j of jobs) {
      const jury = runJuryEvaluation(j, tax);
      if (jury.pass && jury.final_score >= 70) {
        allCandidateJobs.push({
          ...j,
          match_score: jury.final_score,
          tier: jury.tier,
          target_role: company.decision_maker_role || 'Head of Growth',
          attack_angle: company.attack_angle
        });
      }
    }
    await sleep(200);
  }

  // Déduplication
  const seen = new Set();
  const qualifiedJobs = allCandidateJobs.filter(j => {
    const k = `${j.company.toLowerCase()}|${j.title.toLowerCase()}`;
    if (seen.has(k) || seen.has(j.link)) return false;
    seen.add(k); seen.add(j.link);
    return true;
  });

  const stats = { companiesScanned: companies.length, totalJobsFound, qualifiedCount: qualifiedJobs.length };
  const reportMd = formatDailyDigestMarkdown(stats, qualifiedJobs);

  fs.writeFileSync(path.join(cDir, 'daily_remote_company_openings.json'), JSON.stringify({
    stats,
    updated_at: new Date().toISOString(),
    jobs: qualifiedJobs
  }, null, 2), 'utf8');

  if (options.sendReport !== false) {
    await sendTelegramRaw(reportMd, envPath, false);
  }

  return { stats, qualifiedJobs, reportMd };
}

if (require.main === module) {
  runDailyRemoteScanner({ sendReport: false }).then(res => {
    console.log(`Scan terminé : ${res.stats.companiesScanned} entreprises scannées, ${res.qualifiedJobs.length} opportunités qualifiées.`);
    console.log(res.reportMd);
  });
}

module.exports = { runDailyRemoteScanner, formatDailyDigestMarkdown };
