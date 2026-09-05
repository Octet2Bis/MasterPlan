/**
 * JURY D'INSPECTEURS SPÉCIALISÉS — CASCADE FAIL-FAST (Node.js 24)
 * Pilier : 02_Assistant_Personnel / Career Ops (< 110 lignes)
 */

const { evaluateLanguage } = require('./language_sentinel');
const { evaluateRemote } = require('./remote_auditor');
const { evaluateSeniority } = require('./seniority_calibrator');
const { evaluateDecisionMaker } = require('./decision_maker_scout');

function runJuryEvaluation(job, taxonomy) {
  const auditReport = {
    pass: false,
    failed_inspector: null,
    verdict_summary: '',
    scores: {},
    target_role: 'Head of Growth',
    hook_angle: 'Acquisition & Tracking'
  };

  // 1. Sentinelle Linguistique (Fail-Fast)
  const langRes = evaluateLanguage(job, taxonomy);
  auditReport.scores.language = langRes;
  if (!langRes.pass) {
    auditReport.failed_inspector = 'language_sentinel';
    auditReport.verdict_summary = `Langue non conforme : ${langRes.reason}`;
    return auditReport;
  }

  // 2. Auditeur Full Remote (Fail-Fast)
  const remoteRes = evaluateRemote(job);
  auditReport.scores.remote = remoteRes;
  if (!remoteRes.pass) {
    auditReport.failed_inspector = 'remote_auditor';
    auditReport.verdict_summary = `Remote non certifié : ${remoteRes.reason}`;
    return auditReport;
  }

  // 3. Calibreur de Séniorité (Fail-Fast)
  const senRes = evaluateSeniority(job, taxonomy);
  auditReport.scores.seniority = senRes;
  if (!senRes.pass) {
    auditReport.failed_inspector = 'seniority_calibrator';
    auditReport.verdict_summary = `Séniorité/Scope hors cible : ${senRes.reason}`;
    return auditReport;
  }

  // 4. Éclaireur Décideur
  const decRes = evaluateDecisionMaker(job);
  auditReport.scores.decision_maker = decRes;
  auditReport.target_role = decRes.target_role;
  auditReport.hook_angle = decRes.hook_angle;

  // Calcul du score Gold/Silver
  const full = `${job.title} ${job.description} ${job.skills_required} ${job.company}`.toLowerCase();
  let hits = 0;
  (taxonomy?.search_queries || []).forEach(kw => { if (full.includes(kw.toLowerCase())) hits++; });
  const isStartup = (taxonomy?.startup_scaleup_signals || []).some(s => full.includes(s));
  const finalScore = Math.min(95, 75 + (hits * 5) + (isStartup ? 10 : 0));

  auditReport.pass = true;
  auditReport.final_score = finalScore;
  auditReport.tier = finalScore >= 85 ? 'Gold' : 'Silver';
  auditReport.is_startup = isStartup;
  auditReport.verdict_summary = 'Jury unanime : 4/4 Inspecteurs validés';

  return auditReport;
}

module.exports = { runJuryEvaluation };
