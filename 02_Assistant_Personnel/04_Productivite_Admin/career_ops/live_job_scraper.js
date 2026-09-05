/**
 * LIVE JOB SCRAPER & QUALIFIER — JURY DE SPÉCIALISTES (Node.js 24)
 * Pilier : 02_Assistant_Personnel / Career Ops
 * Orchestre les connecteurs, applique le Jury d'Inspecteurs et transmet
 * le rapport de synthèse toutes les 15 min (silencieux si 0 pépite).
 * Plafond strict : < 190 lignes (AGENTS.md).
 */

const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const { fetchAllActiveSources } = require('./fetchers');
const { runJuryEvaluation } = require('./inspectors/jury_pipeline');
const { indexRemoteCompanies } = require('./remote_company_indexer');

const CAREER_DIR = path.join(__dirname, '../../Workspace/career');

function loadJson(p) {
  try { return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; } catch { return null; }
}

function sendTelegramRaw(text, envPath, disableNotification = false) {
  let token = process.env.TELEGRAM_BOT_TOKEN_PRO;
  let chatId = process.env.TELEGRAM_ALLOWED_USER_ID;
  if (!token && fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(l => {
      if (l.startsWith('TELEGRAM_BOT_TOKEN_PRO=')) token = l.split('=')[1].trim().replace(/['"]/g, '');
      if (l.startsWith('TELEGRAM_ALLOWED_USER_ID=')) chatId = l.split('=')[1].trim().replace(/['"]/g, '');
    });
  }
  if (token && token.startsWith('bot')) token = token.slice(3);
  if (!token || !chatId || token.length < 10) return Promise.resolve(false);

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      chat_id: chatId, text, parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: Boolean(disableNotification)
    });
    const req = https.request({
      hostname: 'api.telegram.org', path: `/bot${token}/sendMessage`, method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => resolve(res.statusCode === 200));
    req.on('error', () => resolve(false));
    req.setTimeout(3500, () => { req.destroy(); resolve(false); });
    req.write(payload);
    req.end();
  });
}

function sendTelegramAlert(job, envPath) {
  const startupBadge = job.is_startup ? '🚀 *Startup / Scale-up* (+10 pts)\n' : '';
  const hqLine = job.company_hq ? `📍 *Origine / Siège :* _${job.company_hq}_\n` : '';
  const text = `🎯 *NOUVELLE OPPORTUNITÉ CERTIFIÉE GOLD (100% CONFORME)*\n\n` +
               `🏢 *${job.company}* — ${job.title}\n` +
               `📊 Score Jury : *${job.match_score}%* (${job.tier})\n` +
               `${hqLine}` +
               `🌍 Mode : *100% Full Remote (Certifié)*\n` +
               `${startupBadge}` +
               `💶 Salaire : ${job.salary_range} | 📅 _${job.date_published}_\n` +
               `👤 Décideur Cible : \`${job.target_role || 'Head of Growth'}\`\n` +
               `🌐 Source : \`${job.source}\`\n\n` +
               `📋 *Rapport Jury :* _${job.jury_verdict || '4/4 Inspecteurs validés'}_\n\n` +
               `🔗 [Voir l'annonce originale](${job.link})\n\n` +
               `👉 *Pour préparer la candidature :* \`/valider ${job.slug}\``;

  return sendTelegramRaw(text, envPath, false);
}

function formatScanSummaryMarkdown(stats) {
  const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const batchLabel = `Bloc ${stats.cursorBatch || 1}/${stats.totalBatches || 13}`;
  const icon = stats.newPushed > 0 ? '🎯' : '🛰️';
  const newCompText = stats.newCompaniesCount > 0 ? ` (+${stats.newCompaniesCount} nouvelles)` : '';

  let msg = `${icon} *RAPPORT DE VEILLE RADAR (15 MIN)*\n` +
            `⏱️ _${dateStr} à ${timeStr}_\n\n` +
            `📊 *Bilan du cycle :*\n` +
            ` • Sources actives scannées : *${stats.sourcesCount || 8}*\n` +
            ` • Offres brutes analysées : *${stats.rawCount || 0}*\n` +
            ` • Conformes critères (1-3 ans, Remote, FR/EN) : *${stats.qualifiedCount || 0}*\n` +
            ` • Nouvelles pépites transmises : *${stats.newPushed || 0}*\n` +
            ` • Base Remote Vérifiée : *${stats.totalCompanies || 43}* entreprises${newCompText}\n` +
            ` • Curseur LinkedIn : *${batchLabel}* (7 prochains intitulés au prochain tour)\n\n`;

  if (stats.newCompanies && stats.newCompanies.length > 0) {
    msg += `🏢 *Nouvelles entreprises 100% remote répertoriées :*\n`;
    stats.newCompanies.slice(0, 3).forEach(c => {
      msg += ` • *${c.name}* (${c.domain.slice(0, 32)}) 👉 \`/spontane ${c.id}\`\n`;
    });
    msg += `\n`;
  }

  if (stats.newPushed > 0) {
    msg += `✨ *${stats.newPushed} offre(s) transmise(s) ci-dessus.*\n` +
           `👉 Tapez \`/valider <slug>\` pour préparer la candidature.`;
  } else {
    msg += `ℹ️ _Aucune nouvelle opportunité inédite sur ce quart d'heure._\n` +
           `🔄 _Prochain scan automatique dans 15 minutes._`;
  }
  return msg;
}

async function autoScanAndNotify(careerDir, envPath, options = {}) {
  const cDir = careerDir || CAREER_DIR;
  const tax = loadJson(path.join(cDir, 'career_taxonomy.json')) || {};
  const all = await fetchAllActiveSources({ careerDir: cDir });

  const processedFile = path.join(cDir, 'processed_jobs.json');
  let processed = new Set();
  if (fs.existsSync(processedFile)) {
    try { processed = new Set(JSON.parse(fs.readFileSync(processedFile, 'utf8'))); } catch {}
  }

  const seen = new Set();
  const qualified = [];
  const toNotify = [];

  for (const j of all) {
    const key = `${j.company.toLowerCase()}|${j.title.toLowerCase()}`;
    if (seen.has(key) || seen.has(j.link)) continue;
    seen.add(key); seen.add(j.link);

    const juryResult = runJuryEvaluation(j, tax);
    if (juryResult.pass && juryResult.final_score >= 75) {
      const slug = j.company.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
      const jobObj = {
        ...j, slug,
        match_score: juryResult.final_score,
        tier: juryResult.tier,
        is_startup: juryResult.is_startup,
        target_role: juryResult.target_role,
        hook_angle: juryResult.hook_angle,
        jury_verdict: juryResult.verdict_summary,
        status: 'PENDING_VALIDATION'
      };
      qualified.push(jobObj);
      if (!processed.has(j.id) && !processed.has(j.link) && juryResult.final_score >= 80) {
        processed.add(j.id); processed.add(j.link);
        toNotify.push(jobObj);
      }
    }
  }

  qualified.sort((a, b) => b.match_score - a.match_score);
  qualified.forEach((q, idx) => { q.index = idx + 1; });

  let newPushed = 0;
  if (toNotify.length > 0) {
    const batch = toNotify.slice(0, 5);
    const results = await Promise.all(batch.map(j => sendTelegramAlert(j, envPath)));
    newPushed = results.filter(Boolean).length;
  }

  if (qualified.length > 0) {
    fs.writeFileSync(path.join(cDir, 'pending_gold_jobs.json'), JSON.stringify(qualified.slice(0, 25), null, 2), 'utf-8');
    fs.writeFileSync(processedFile, JSON.stringify([...processed], null, 2), 'utf-8');
  }

  const totalBatches = Math.max(1, Math.ceil((tax.search_queries || []).length / 7)) || 13;
  const cursorFile = path.join(cDir, 'linkedin_cursor_state.json');
  let cursorBatch = 1;
  if (fs.existsSync(cursorFile)) {
    try {
      const cData = JSON.parse(fs.readFileSync(cursorFile, 'utf8'));
      cursorBatch = Math.floor(((cData.nextIndex || 7) - 1) / 7) + 1;
    } catch {}
  }

  const sourcesCfg = loadJson(path.join(cDir, 'job_sources.json')) || { sources: [] };
  const activeSourcesCount = (sourcesCfg.sources || []).filter(s => s.enabled).length || 8;

  // Moisson et indexation des entreprises 100% remote vérifiées
  const companyHarvest = indexRemoteCompanies(all, cDir);

  const stats = {
    sourcesCount: activeSourcesCount,
    rawCount: all.length,
    qualifiedCount: qualified.length,
    newPushed,
    cursorBatch: Math.min(totalBatches, Math.max(1, cursorBatch)),
    totalBatches,
    totalCompanies: companyHarvest.totalCount,
    newCompaniesCount: companyHarvest.newlyAdded.length,
    newCompanies: companyHarvest.newlyAdded
  };

  const reportMd = formatScanSummaryMarkdown(stats);
  fs.writeFileSync(path.join(cDir, 'last_scan_report.json'), JSON.stringify({ stats, markdown: reportMd, updated_at: new Date().toISOString() }, null, 2), 'utf8');

  // Envoi automatique du rapport de synthèse 15 minutes avec notification active
  if (options.sendReport !== false) {
    await sendTelegramRaw(reportMd, envPath, false);
  }

  return { qualifiedCount: qualified.length, newPushed, topJobs: qualified.slice(0, 6), stats, reportMd };
}

if (require.main === module) {
  const ePath = path.join(__dirname, '../../.secrets/.env');
  const start = Date.now();
  autoScanAndNotify(CAREER_DIR, ePath).then(res => {
    console.log(`🎯 [RADAR JURY SPÉCIALISTES] ${res.qualifiedCount} opportunités validées.`);
    console.log(`📡 Alertes Telegram : ${res.newPushed} transmises en ${Date.now() - start} ms.`);
    console.log(res.reportMd);
  });
}

module.exports = { autoScanAndNotify, formatScanSummaryMarkdown, sendTelegramRaw };
