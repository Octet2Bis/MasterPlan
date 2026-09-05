/**
 * SENTINELLE LINGUISTIQUE & JURIDIQUE (Inspecteur 1)
 * Pilier : 02_Assistant_Personnel (< 70 lignes)
 * Contrat : Vérifie que la langue de travail et les exigences sont 100% FR ou EN.
 */

function evaluateLanguage(job, taxonomy) {
  const fullText = `${job.title} ${job.description} ${job.skills_required} ${job.company} ${job.company_hq || ''}`.toLowerCase();
  
  // 1. Rejet cyrillique / grec
  if (/[\u0400-\u04FF\u0370-\u03FF]/.test(fullText)) {
    return { pass: false, reason: 'Alphabet non latin détecté (cyrillique / grec)' };
  }

  // 2. Rejet universel des marqueurs légaux de genre européens dans le titre (DE, NL, ES, IT, etc.)
  if (/(?:[:*_]in\b|\b[a-z]+:in\b|\b[a-z]+\*in\b|\b[a-z]+_in\b|\([a-z]\/[a-z](?:\/[a-z])?\)|\bgn\b)/i.test(job.title || '')) {
    return { pass: false, reason: 'Marqueur légal de genre européen non-FR/EN détecté dans le titre (:in, *in, m/w/d, m/v/x, h/m...)' };
  }

  const legalMarkers = taxonomy?.foreign_legal_gender_markers || [
    '(m/w/d)', '(m/f/d)', '(d/m/w)', '(w/m/d)', '(m/v/x)', '(m/v/d)', '(m/v)', '(f/m/d)',
    '(m/w/x)', '(d/w/m)', '(all genders)', '(alle geschlechter)', '(m/f/x)', 'm/w/d', 'm/v/x',
    ':in', '*in', '_in', '/in', ' (gn)', ' gn', '(d/f/m)', '(m/w/div)',
    '(v/m/x)', '(v/m)', '(v/m/d)', '(h/m/d)', '(h/m/x)', '(h/m)', '(h/f/d)', '(f/m)', '(m/f)'
  ];
  for (const m of legalMarkers) {
    if (fullText.includes(m.toLowerCase())) {
      return { pass: false, reason: `Marqueur linguistique/juridique étranger détecté : "${m}"` };
    }
  }

  // 3. Détection par URL géolocalisée (ex: de.linkedin.com, es.linkedin.com, nl.linkedin.com)
  const isForeignSubdomain = /^https?:\/\/(?:de|at|ch|es|it|nl|pl|pt|se|dk|no|fi)\.linkedin\.com/i.test(job.link || '');

  // 4. Détection par stop-words exhaustifs
  const markers = taxonomy?.disallowed_language_markers || {};
  for (const [lang, words] of Object.entries(markers)) {
    let hits = 0;
    const found = [];
    for (const w of words) {
      if (new RegExp(`\\b${w}\\b`, 'i').test(fullText)) {
        hits++;
        found.push(w);
      }
      const maxAllowed = isForeignSubdomain ? 1 : 2;
      if (hits >= maxAllowed) {
        return { pass: false, reason: `Langue étrangère non autorisée détectée (${lang.toUpperCase()}) : [${found.join(', ')}]` };
      }
    }
  }

  return { pass: true, reason: 'Langue de travail FR / EN validée' };
}

module.exports = { evaluateLanguage };
