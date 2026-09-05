/**
 * EMAIL PATTERN RESOLVER — RÉSOLUTEUR D'ADRESSES PAR PATTERN D'ENTREPRISE (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 150 lignes)
 * Déduit et permute automatiquement les conventions de messagerie B2B.
 */

class EmailPatternResolver {
  constructor() {
    this.domainPatterns = new Map();
  }

  cleanString(str) {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  cleanDomain(domain) {
    if (!domain) return '';
    return domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
  }

  generateCandidates(prenom, nom, domain) {
    const f = this.cleanString(prenom);
    const l = this.cleanString(nom);
    const d = this.cleanDomain(domain);

    if (!d || (!f && !l)) return [];
    const fi = f ? f[0] : '';
    const li = l ? l[0] : '';

    const candidates = [];
    if (f && l) {
      candidates.push({ email: `${f}.${l}@${d}`, pattern: '{first}.{last}', label: 'Prénom.Nom' });
      candidates.push({ email: `${fi}${l}@${d}`, pattern: '{f}{last}', label: 'PNom' });
      candidates.push({ email: `${fi}.${l}@${d}`, pattern: '{f}.{last}', label: 'P.Nom' });
      candidates.push({ email: `${f}${l}@${d}`, pattern: '{first}{last}', label: 'PrénomNom' });
      candidates.push({ email: `${l}.${f}@${d}`, pattern: '{last}.{first}', label: 'Nom.Prénom' });
      candidates.push({ email: `${f}@${d}`, pattern: '{first}', label: 'Prénom seul' });
    } else if (f) {
      candidates.push({ email: `${f}@${d}`, pattern: '{first}', label: 'Prénom seul' });
    } else if (l) {
      candidates.push({ email: `${l}@${d}`, pattern: '{last}', label: 'Nom seul' });
    }
    return candidates;
  }

  getKnownPattern(domain) {
    const d = this.cleanDomain(domain);
    return this.domainPatterns.get(d) || null;
  }

  predictEmail(prenom, nom, domain) {
    const d = this.cleanDomain(domain);
    const known = this.getKnownPattern(d);
    if (!known) return null;

    const f = this.cleanString(prenom);
    const l = this.cleanString(nom);
    const fi = f ? f[0] : '';

    if (known === '{first}.{last}' && f && l) return `${f}.${l}@${d}`;
    if (known === '{f}{last}' && f && l) return `${fi}${l}@${d}`;
    if (known === '{f}.{last}' && f && l) return `${fi}.${l}@${d}`;
    if (known === '{first}' && f) return `${f}@${d}`;
    if (known === '{last}.{first}' && f && l) return `${l}.${f}@${d}`;
    return null;
  }

  async resolveBestEmail(contact, verifier) {
    const domain = contact.domain || (contact.email?.includes('@') ? contact.email.split('@')[1] : null);
    if (!domain) return contact;

    const candidates = this.generateCandidates(contact.prenom, contact.nom, domain);
    if (candidates.length === 0) return contact;

    const d = this.cleanDomain(domain);
    const known = this.getKnownPattern(d);
    if (known) {
      const predicted = this.predictEmail(contact.prenom, contact.nom, d);
      if (predicted) {
        return {
          ...contact,
          email: predicted,
          pattern_used: known,
          pattern_source: 'DOMAIN_CACHE'
        };
      }
    }

    if (!verifier) return { ...contact, email: candidates[0].email, pattern_candidates: candidates };

    for (const cand of candidates) {
      const res = await verifier.verify({ ...contact, email: cand.email });
      if (res.status === 'VERIFIED' && res.score >= 90) {
        this.domainPatterns.set(d, cand.pattern);
        return {
          ...res,
          email: cand.email,
          pattern_used: cand.pattern,
          pattern_label: cand.label,
          pattern_confirmed: true
        };
      }
    }

    // Fallback sur le pattern le plus classique ({first}.{last})
    return {
      ...contact,
      email: candidates[0].email,
      pattern_used: candidates[0].pattern,
      pattern_candidates: candidates
    };
  }
}

module.exports = { EmailPatternResolver };
