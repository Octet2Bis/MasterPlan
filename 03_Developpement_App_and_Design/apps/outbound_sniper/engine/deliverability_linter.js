/**
 * DELIVERABILITY & ANTI-SPAM LINTER ENGINE (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 140 lignes)
 */
const fs = require('fs');
const path = require('path');

const RULES_FILE = path.join(__dirname, '../data/spam_rules.json');

function normalizeStr(str) {
  return String(str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function loadSpamRules() {
  try {
    if (fs.existsSync(RULES_FILE)) return JSON.parse(fs.readFileSync(RULES_FILE, 'utf-8'));
  } catch {}
  return {
    spam_words_fr: ['gratuit', '100% gratuit', 'urgent', 'promotion', 'cliquez ici', 'gagner de l argent'],
    opt_out_patterns: ['ne souhaitez plus', 'desabonner', 'repondez stop', 'ne plus recevoir'],
    penalties: { missing_opt_out: 25, spam_word: 10, excessive_links: 15, all_caps_subject: 20, excessive_punctuation: 10 }
  };
}

function auditMessage({ subject = '', body = '', cta_label = '', target_url = '' }) {
  const rules = loadSpamRules();
  const cleanSubject = normalizeStr(subject);
  const cleanBody = normalizeStr(body);
  const fullText = `${cleanSubject} ${cleanBody}`;
  const issues = [];
  let score = 100;

  // 1. Détection de l'Opt-Out (Obligation légale CNIL/RGPD B2B)
  const hasOptOut = rules.opt_out_patterns.some(p => cleanBody.includes(normalizeStr(p)));
  if (!hasOptOut) {
    score -= rules.penalties.missing_opt_out || 25;
    issues.push({
      type: 'MISSING_OPT_OUT',
      severity: 'HIGH',
      message: 'Clause d\'opposition (Opt-Out) absente.',
      tip: 'Ajoutez : « Si vous ne souhaitez plus recevoir de messages, répondez "stop". »'
    });
  }

  // 2. Scanner de Spam Words
  const detectedSpamWords = [];
  rules.spam_words_fr.forEach(word => {
    const cleanWord = normalizeStr(word);
    if (fullText.includes(cleanWord)) {
      detectedSpamWords.push(word);
      score -= rules.penalties.spam_word || 10;
    }
  });
  if (detectedSpamWords.length > 0) {
    issues.push({
      type: 'SPAM_WORDS_DETECTED',
      severity: 'MEDIUM',
      message: `Termes à risque détectés : [${detectedSpamWords.join(', ')}]`,
      tip: 'Remplacez ces termes par des formulations plus directes et sobres.'
    });
  }

  // 3. Densité de Liens
  const bodyLinks = (body.match(/https?:\/\/[^\s]+/g) || []).length;
  const totalLinks = bodyLinks + (target_url && target_url.trim().length > 0 ? 1 : 0);
  if (totalLinks > 2) {
    score -= rules.penalties.excessive_links || 15;
    issues.push({
      type: 'EXCESSIVE_LINKS',
      severity: 'MEDIUM',
      message: `Nombre de liens élevé (${totalLinks} liens détectés).`,
      tip: 'Conservez 1 seul lien propre vers votre page de destination pour éviter les filtres de sécurité.'
    });
  }

  // 4. Analyse de l'Objet (Majuscules & Ponctuation)
  const subjectTrimmed = subject.trim();
  if (subjectTrimmed.length > 8) {
    const upperCount = (subjectTrimmed.match(/[A-Z]/g) || []).length;
    const letterCount = (subjectTrimmed.match(/[A-Za-z]/g) || []).length;
    if (letterCount > 0 && (upperCount / letterCount) > 0.6) {
      score -= rules.penalties.all_caps_subject || 20;
      issues.push({
        type: 'ALL_CAPS_SUBJECT',
        severity: 'HIGH',
        message: 'Objet rédigé en MAJUSCULES.',
        tip: 'Utilisez une casse normale pour ne pas être classé en spam immédiat.'
      });
    }
  }
  if (/[!]{2,}|\?{2,}/.test(subject) || /[!]{3,}/.test(body)) {
    score -= rules.penalties.excessive_punctuation || 10;
    issues.push({
      type: 'EXCESSIVE_PUNCTUATION',
      severity: 'LOW',
      message: 'Ponctuation agressive (ex: !!! ou ???).',
      tip: 'Supprimez la ponctuation multiple.'
    });
  }

  // Normalisation du score
  score = Math.max(0, Math.min(100, score));
  let grade = 'OPTIMAL';
  let badgeColor = 'green';
  if (score < 60) { grade = 'CRITICAL'; badgeColor = 'red'; }
  else if (score < 80) { grade = 'WARNING'; badgeColor = 'amber'; }

  return {
    score,
    grade,
    badgeColor,
    hasOptOut,
    detectedSpamWords,
    totalLinks,
    issues,
    isHealthy: score >= 80 && hasOptOut
  };
}

module.exports = { auditMessage, loadSpamRules };
