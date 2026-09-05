/**
 * VARIABLE RESOLVER & POKA-YOKE ENGINE (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 180 lignes)
 * Gère les snippets dynamiques, la syntaxe de fallback {{var|valeur}} et le garde-fou anti-fuite.
 */

const CORRUPTED_VALUES = new Set([
  'undefined', 'null', 'n/a', 'na', '-', '--', 'none', 'aucun', 'vide', 'nan', 'nil'
]);

class VariableResolver {
  /**
   * Extrait toutes les variables utilisées dans un template (ex: ['prenom', 'entreprise', 'icebreaker'])
   */
  static extractVariables(template) {
    if (!template) return [];
    const matches = template.matchAll(/\{\{([^}|]+)(?:\|([^}]+))?\}\}/g);
    const vars = new Set();
    for (const match of matches) {
      if (match[1]) vars.add(match[1].trim().toLowerCase());
    }
    return Array.from(vars);
  }

  /**
   * Récupère la valeur saine d'une variable pour un contact donné
   */
  static getSanitizedValue(contact, varName) {
    if (!contact) return null;
    const key = varName.toLowerCase();
    let raw = contact[key];

    if (raw === undefined && contact.custom_fields) {
      raw = contact.custom_fields[key];
    }

    if (raw === undefined || raw === null) return null;
    const val = String(raw).trim();
    if (val.length === 0 || CORRUPTED_VALUES.has(val.toLowerCase())) {
      return null;
    }
    return val;
  }

  /**
   * Résout les blocs Spintax {Option A|Option B|Option C} récursivement
   */
  static resolveSpintax(text) {
    if (!text || typeof text !== 'string') return text || '';
    let resolved = text;
    let iterations = 0;
    while (/\{([^{}]+)\}/.test(resolved) && iterations < 15) {
      resolved = resolved.replace(/\{([^{}]+)\}/g, (_, choices) => {
        const options = choices.split('|');
        const picked = options[Math.floor(Math.random() * options.length)];
        return picked !== undefined ? picked : choices;
      });
      iterations++;
    }
    return resolved;
  }

  /**
   * Résout un template textuel pour un contact avec gestion des fallbacks et du Spintax
   * Retourne { text, isValid, unresolvedVars }
   */
  static resolveTemplate(template, contact, globalFallbacks = {}, options = { applySpintax: true }) {
    if (!template) return { text: '', isValid: true, unresolvedVars: [] };
    const unresolved = [];

    let text = template.replace(/\{\{([^}]+)\}\}/g, (fullMatch, expr) => {
      const parts = expr.split('|');
      const varName = parts[0].trim().toLowerCase();
      const inlineFallback = parts.length > 1 ? parts.slice(1).join('|').trim() : null;

      const val = this.getSanitizedValue(contact, varName);

      if (val !== null) {
        return val;
      }

      if (inlineFallback !== null && inlineFallback.length > 0) {
        return inlineFallback;
      }

      const globalFallback = globalFallbacks[varName];
      if (globalFallback !== undefined && globalFallback !== null && globalFallback.length > 0) {
        return globalFallback;
      }

      unresolved.push(varName);
      return fullMatch;
    });

    if (options.applySpintax !== false) {
      text = this.resolveSpintax(text);
    }

    return {
      text,
      isValid: unresolved.length === 0,
      unresolvedVars: unresolved
    };
  }

  /**
   * Audit complet d'une campagne : vérifie tous les contacts contre l'objet et le corps
   */
  static auditCampaign(campaign, contacts) {
    const list = contacts || [];
    const templateSubject = campaign?.subject || '';
    const templateBody = campaign?.body || '';

    const requiredVars = Array.from(new Set([
      ...this.extractVariables(templateSubject),
      ...this.extractVariables(templateBody)
    ]));

    let readyCount = 0;
    const problematicContacts = [];

    list.forEach((contact, idx) => {
      const resSubj = this.resolveTemplate(templateSubject, contact);
      const resBody = this.resolveTemplate(templateBody, contact);
      const allUnresolved = Array.from(new Set([...resSubj.unresolvedVars, ...resBody.unresolvedVars]));

      if (allUnresolved.length === 0) {
        readyCount++;
      } else {
        problematicContacts.push({
          index: idx,
          id: contact.id,
          email: contact.email,
          prenom: contact.prenom || '',
          entreprise: contact.entreprise || '',
          missingVars: allUnresolved
        });
      }
    });

    return {
      total: list.length,
      readyCount,
      incompleteCount: problematicContacts.length,
      isFullyReady: problematicContacts.length === 0 && list.length > 0,
      requiredVars,
      problematicContacts: problematicContacts.slice(0, 50)
    };
  }
}

module.exports = { VariableResolver };
