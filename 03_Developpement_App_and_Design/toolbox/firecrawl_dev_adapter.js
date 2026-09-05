/**
 * firecrawl_dev_adapter.js — Adapter Firecrawl pour Pilier App Development
 * Localisation : 03_Developpement_App_and_Design/toolbox/
 * Rôle : Expose des fonctions de recherche documentaire ciblées pour le développement :
 *        - Docs SwiftUI / UIKit / HealthKit / FamilyControls
 *        - Résolution d'erreurs de compilation via issues/PRs
 *        - Recherche de Swift Packages et librairies
 * Plafond strict : < 80 lignes (AGENTS.md Commandement 1).
 */

const path = require('path');
const { searchDeveloperFiltered } = require(
  path.resolve(__dirname, '../../02_Assistant_Personnel/02_Automatisation/core/firecrawl_dev_search')
);

/**
 * Recherche dans les docs d'un framework iOS/Apple.
 * Usage : Porte 1 (PRD) et Porte 3 (Core Loop) du Protocole des 4 Portes.
 * @param {string} framework — ex: 'SwiftUI', 'HealthKit', 'FamilyControls', 'WidgetKit'
 * @param {string} question — ex: 'MeshGradient animated color points'
 * @returns {Promise<Array>}
 */
async function searchSwiftDocs(framework, question) {
  return searchDeveloperFiltered(`${framework} ${question}`, {
    types: ['doc', 'readme', 'issue'],
    language: 'Swift',
    limit: 4
  });
}

/**
 * Recherche l'issue ou la PR qui résout un message d'erreur donné.
 * Usage : Porte 3 (Core Loop) — quand une erreur ne se résout pas en < 2 tentatives.
 * @param {string} errorMessage — le message d'erreur exact ou partiel
 * @returns {Promise<Array>}
 */
async function searchErrorFix(errorMessage) {
  return searchDeveloperFiltered(errorMessage, {
    types: ['issue', 'pull_request'],
    limit: 3
  });
}

/**
 * Recherche le README et les exemples d'utilisation d'un package.
 * Usage : Porte 2 (Design Freeze) — évaluer un Swift Package ou une librairie JS.
 * @param {string} packageName — ex: 'cindori/fluidgradient', 'shadergradient'
 * @returns {Promise<Array>}
 */
async function searchPackage(packageName) {
  return searchDeveloperFiltered(`${packageName} installation usage example`, {
    types: ['readme', 'doc'],
    limit: 3
  });
}

module.exports = { searchSwiftDocs, searchErrorFix, searchPackage };
