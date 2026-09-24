/**
 * EMAIL PATTERN RESOLVER — DÉDUCTION DE L'ADRESSE À PARTIR DU NOM ET DU DOMAINE (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * Une permutation n'est retenue que si le vérificateur la prouve (`VERIFIED`).
 * Sans preuve (port 25 bloqué, catch-all), le contact est renvoyé inchangé avec les candidats.
 */

class EmailPatternResolver {
  constructor() {
    this.domainPatterns = new Map();
  }

  cleanString(str) {
    return String(str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  cleanDomain(domain) {
    return String(domain || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
  }

  generateCandidates(prenom, nom, domain) {
    const f = this.cleanString(prenom);
    const l = this.cleanString(nom);
    const d = this.cleanDomain(domain);
    if (!d || (!f && !l)) return [];
    if (!l) return [{ email: `${f}@${d}`, pattern: '{first}', label: 'Prénom seul' }];
    if (!f) return [{ email: `${l}@${d}`, pattern: '{last}', label: 'Nom seul' }];
    return [
      { email: `${f}.${l}@${d}`, pattern: '{first}.{last}', label: 'Prénom.Nom' },
      { email: `${f[0]}${l}@${d}`, pattern: '{f}{last}', label: 'PNom' },
      { email: `${f[0]}.${l}@${d}`, pattern: '{f}.{last}', label: 'P.Nom' },
      { email: `${f}${l}@${d}`, pattern: '{first}{last}', label: 'PrénomNom' },
      { email: `${l}.${f}@${d}`, pattern: '{last}.{first}', label: 'Nom.Prénom' },
      { email: `${f}@${d}`, pattern: '{first}', label: 'Prénom seul' }
    ];
  }

  async resolveBestEmail(contact, verifier) {
    const domain = contact.domain || (contact.email?.includes('@') ? contact.email.split('@')[1] : null);
    const candidates = this.generateCandidates(contact.prenom, contact.nom, domain);
    if (candidates.length === 0) return { ...contact, reason: 'Prénom/nom ou domaine manquant' };

    // Pattern déjà prouvé sur ce domaine : on le teste en premier.
    const known = this.domainPatterns.get(this.cleanDomain(domain));
    const ordered = known ? [...candidates.filter(c => c.pattern === known), ...candidates.filter(c => c.pattern !== known)] : candidates;

    for (const cand of ordered) {
      const res = await verifier.verify({ ...contact, email: cand.email });
      if (res.status === 'VERIFIED') {
        this.domainPatterns.set(this.cleanDomain(domain), cand.pattern);
        return { ...res, pattern_used: cand.pattern, pattern_label: cand.label, pattern_resolved: true };
      }
      // Catch-all ou port 25 bloqué : aucune permutation ne pourra être prouvée, inutile de continuer.
      if (res.status === 'CATCH_ALL' || res.status === 'UNVERIFIED' || res.status === 'NO_MX') {
        return { ...contact, pattern_candidates: candidates, reason: `Pattern non déterminable : ${res.reason}` };
      }
    }
    return { ...contact, pattern_candidates: candidates, reason: 'Aucune permutation acceptée par le serveur' };
  }
}

module.exports = { EmailPatternResolver };
