/**
 * AUDITEUR FULL REMOTE & TERRITORIAL (Inspecteur 2)
 * Pilier : 02_Assistant_Personnel (< 70 lignes)
 * Contrat : Vérifie l'éligibilité 100% Full Remote sans obligation de présentiel.
 */

function evaluateRemote(job) {
  const fullText = `${job.title} ${job.location} ${job.description} ${job.company_hq || ''}`.toLowerCase();

  // 1. Rejet éliminatoire immédiat des termes hybrides ou présentiels
  const disqRemote = [
    'hybrid', 'hybride', 'on-site', 'onsite', 'on site', 'sur site', 'sur-site',
    'présentiel', 'presentiel', 'in-office', 'in office', 'office-based',
    'in-person', 'days in office', 'jours sur site', 'jours par semaine',
    'au bureau', 'relocation', '80-100%', 'part-time', 'temps partiel',
    'présence requise', 'présence obligatoire'
  ];
  for (const term of disqRemote) {
    if (fullText.includes(term)) {
      return { pass: false, reason: `Mention de travail non-remote détectée : "${term}"` };
    }
  }

  // 2. Plateformes nativement remote
  if (job.source && (job.source.includes('Himalayas') || job.source.includes('Working Nomads') || job.source.includes('RemoteOK') || job.source.includes('Remotive'))) {
    return { pass: true, reason: `Plateforme certifiée 100% Remote (${job.source})` };
  }

  // 3. Validation LinkedIn / Job Boards généralistes
  const locAndTitle = `${job.location} ${job.title} ${job.company_hq || ''}`.toLowerCase();
  const remoteMarkers = [
    'remote', 'télétravail', 'teletravail', 'distanciel', 'full-remote',
    'full remote', '100% remote', '100% télétravail', 'work from anywhere',
    'home-based', 'anywhere'
  ];
  const isRemote = remoteMarkers.some(k => locAndTitle.includes(k));

  if (!isRemote) {
    return { pass: false, reason: `Localisation physique sans mention Remote explicite (${job.location || job.company_hq})` };
  }

  return { pass: true, reason: 'Contrat 100% Full Remote validé' };
}

module.exports = { evaluateRemote };
