/**
 * DELIVERABILITY & ANTI-SPAM LINTER ENGINE (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * Règles lexicales déterministes (data/spam_rules.json). Aucun placement en boîte n'est « prédit » :
 * seul un test réel (Mail-Tester, SpamAssassin) mesure le placement.
 */
const { loadRef } = require('./store');

function normalizeStr(str) {
  return String(str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function loadSpamRules() {
  return loadRef('spam_rules.json', { spam_words_fr: [], opt_out_patterns: [], penalties: {}, spintax_presets: [], shortener_domains: [] });
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

  // 5. Longueur & question finale : conseils rédactionnels (sans impact sur le score).
  const wordCount = cleanBody.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount > 200) {
    issues.push({ type: 'LONG_BODY', severity: 'LOW', message: `Message long (${wordCount} mots).`, tip: 'Un email de prospection court (50 à 125 mots) est plus lu et plus répondu.' });
  }
  const hasReplyTrigger = cleanBody.slice(-200).includes('?');
  if (!hasReplyTrigger) {
    issues.push({ type: 'NO_REPLY_TRIGGER', severity: 'LOW', message: 'Pas de question en fin de message.', tip: 'Terminez par une question courte pour inviter à répondre.' });
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
    wordCount,
    hasReplyTrigger,
    issues,
    isHealthy: score >= 80 && hasOptOut
  };
}

module.exports = { auditMessage, loadSpamRules };
