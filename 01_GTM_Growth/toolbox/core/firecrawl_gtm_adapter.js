/**
 * firecrawl_gtm_adapter.js — Adapter Firecrawl pour Pilier GTM & Growth
 * Localisation : 01_GTM_Growth/toolbox/core/
 * Rôle : Expose des fonctions de recherche documentaire ciblées pour le Growth :
 *        - Specs Schema.org pour AEO/SEO
 *        - Docs de tracking GA4/GTM/Meta Pixel
 *        - Docs d'API d'enrichissement (Waterfall)
 * Plafond strict : < 80 lignes (AGENTS.md Commandement 1).
 */

const path = require('path');
const { searchDeveloperFiltered } = require(
  path.resolve(__dirname, '../../../02_Assistant_Personnel/02_Automatisation/core/firecrawl_dev_search')
);

/**
 * Recherche les spécifications Schema.org pour un type donné.
 * Usage : quand l'agent génère du JSON-LD (AEO Graph, Schema Generator).
 * @param {string} schemaType — ex: 'FAQPage', 'SoftwareApplication', 'HowTo'
 * @returns {Promise<Array>}
 */
async function searchSchemaOrgDocs(schemaType) {
  return searchDeveloperFiltered(`schema.org ${schemaType} JSON-LD specification required properties`, {
    types: ['doc', 'readme'],
    limit: 3
  });
}

/**
 * Recherche la documentation de plateformes de tracking.
 * Usage : configuration GTM, GA4 events, Meta Pixel, Consent Mode v2.
 * @param {string} platform — ex: 'GA4', 'GTM', 'Meta Pixel', 'Consent Mode'
 * @param {string} question — ex: 'custom event purchase value'
 * @returns {Promise<Array>}
 */
async function searchTrackingDocs(platform, question) {
  return searchDeveloperFiltered(`${platform} ${question}`, {
    types: ['doc', 'issue', 'readme'],
    limit: 3
  });
}

/**
 * Recherche la documentation d'une API ou d'un outil d'enrichissement.
 * Usage : intégration Waterfall, nouvelles APIs dans le pipeline.
 * @param {string} apiName — ex: 'Apollo', 'Clearbit', 'Hunter.io'
 * @returns {Promise<Array>}
 */
async function searchApiDocs(apiName) {
  return searchDeveloperFiltered(`${apiName} API documentation authentication endpoints`, {
    types: ['doc', 'readme'],
    limit: 3
  });
}

module.exports = { searchSchemaOrgDocs, searchTrackingDocs, searchApiDocs };
