/**
 * CALIBREUR DE SÉNIORITÉ & SCOPE (Inspecteur 3)
 * Pilier : 02_Assistant_Personnel (< 70 lignes)
 * Contrat : Vérifie que le niveau exigé est strictement de 1 à 3 ans et dans le domaine Growth / Marketing.
 */

const CORE_DOMAINS = [
  'growth', 'marketing', 'acquisition', 'crm', 'traffic', 'media', 'paid',
  'seo', 'sea', 'cro', 'revops', 'demand', 'lifecycle', 'inbound', 'ads',
  'conversion', 'digital', 'content', 'ops', 'gtm', 'automation', 'operations'
];

function evaluateSeniority(job, taxonomy) {
  const fullText = `${job.title} ${job.description} ${job.skills_required}`.toLowerCase();
  const disqLabels = taxonomy?.target_experience?.disqualified_labels || [
    'senior', 'sr.', 'lead', 'principal', 'staff', 'director', 'directeur', 'head of',
    'vp', 'chief', 'c-level', '4+ years', '5+ years', '6+ years', '10+ years', '3-5 ans'
  ];

  for (const label of disqLabels) {
    if (new RegExp(`\\b${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(fullText)) {
      return { pass: false, reason: `Critère d'expérience trop élevé détecté : "${label}"` };
    }
  }

  // Vérification du domaine Growth / Marketing / Ops dans le titre ou correspondance taxonomie
  const titleLower = job.title.toLowerCase();
  const queries = taxonomy?.search_queries || [];
  const matchesTaxonomy = queries.some(q => {
    const ql = q.toLowerCase();
    return titleLower.includes(ql) || ql.includes(titleLower);
  });
  const hasDomain = CORE_DOMAINS.some(d => titleLower.includes(d)) || matchesTaxonomy;
  if (!hasDomain) {
    return { pass: false, reason: `Titre hors domaine Growth / Marketing Digital : "${job.title}"` };
  }

  return { pass: true, reason: 'Calibrage 1-3 ans et adéquation métier validés' };
}

module.exports = { evaluateSeniority };
