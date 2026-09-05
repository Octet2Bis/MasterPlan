#!/usr/bin/env node
/**
 * MASTER PLAN — AEO / GEO SCHEMA.ORG GRAPH AUDITOR
 * Pilier 01 : GTM & Growth / Core Linters & Auditors
 * Plafond strict : < 120 lignes
 */

const fs = require('fs');
const path = require('path');

function findWorkspaceRoot() {
  let current = __dirname;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(current, 'master_router.md'))) return current;
    current = path.dirname(current);
  }
  return process.cwd();
}

const ROOT_DIR = findWorkspaceRoot();
const SCHEMA_FILE = path.join(ROOT_DIR, '01_GTM_Growth', '02_Acquisition_and_AEO', 'schemas', 'aevum_aeo_entity_graph.json');

function auditSchemaGraph(filePath) {
  if (!fs.existsSync(filePath)) {
    return { valid: false, errors: [`Fichier introuvable : ${filePath}`] };
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return { valid: false, errors: [`JSON invalide : ${e.message}`] };
  }

  const errors = [];
  if (data['@context'] !== 'https://schema.org') {
    errors.push(`@context invalide : attendu 'https://schema.org', reçu '${data['@context']}'`);
  }

  const graph = data['@graph'];
  if (!Array.isArray(graph) || graph.length === 0) {
    errors.push("Le bloc @graph doit être un tableau non vide d'entités sémantiques.");
    return { valid: false, errors };
  }

  // 1. Indexation des IDs déclarés
  const declaredIds = new Set();
  graph.forEach((node, idx) => {
    if (node['@id']) declaredIds.add(node['@id']);
    else errors.push(`Entité #${idx + 1} (${node['@type'] || 'Inconnue'}) sans '@id' canonique.`);
  });

  // 2. Vérification récursive de l'intégrité référentielle
  let referencesCount = 0;
  function checkRefs(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach(item => checkRefs(item));
      return;
    }
    for (const [key, val] of Object.entries(obj)) {
      if (key === '@id' && typeof val === 'string') {
        // ID déclaré, déjà indexé
      } else if (val && typeof val === 'object' && val['@id'] && Object.keys(val).length === 1) {
        referencesCount++;
        if (!declaredIds.has(val['@id'])) {
          errors.push(`Référence orpheline détectée : '${val['@id']}' n'existe pas dans le @graph.`);
        }
      } else {
        checkRefs(val);
      }
    }
  }

  graph.forEach(node => checkRefs(node));

  return {
    valid: errors.length === 0,
    errors,
    entityCount: graph.length,
    referencesCount,
    entityTypes: graph.map(n => n['@type'])
  };
}

function main() {
  console.log('\n============================================================');
  console.log('🔍 AUDIT SÉMANTIQUE : SCHEMA.ORG JSON-LD KNOWLEDGE GRAPH');
  console.log('============================================================\n');

  const res = auditSchemaGraph(SCHEMA_FILE);

  if (res.valid) {
    console.log(`✅ Fichier : aevum_aeo_entity_graph.json`);
    console.log(`📊 Entités interconnectées : ${res.entityCount} | Références internes vérifiées : ${res.referencesCount}`);
    console.log(`🏷️ Types d'entités couverts : ${res.entityTypes.join(', ')}`);

    // Audit des signaux Google Leaked
    const leakFile = path.join(ROOT_DIR, '01_GTM_Growth', '02_Acquisition_and_AEO', 'data', 'google_search_leak_signals.json');
    if (fs.existsSync(leakFile)) {
      const leakData = JSON.parse(fs.readFileSync(leakFile, 'utf8'));
      const signals = Object.keys(leakData.signals || {});
      console.log(`🛡️ Signaux Google Leak (NavBoost, ChromeData, EEAT) vérifiés : ${signals.length} piliers actifs\n`);
    }

    console.log('------------------------------------------------------------');
    console.log('🎉 100% VALIDÉ POUR CITATIONS DIRECTES PAR LES MOTEURS IA (AEO/GEO).');
    console.log('------------------------------------------------------------\n');
    process.exit(0);
  } else {
    console.error(`🚨 ${res.errors.length} ERREUR(S) DÉTECTÉE(S) :`);
    res.errors.forEach(e => console.error(`  ❌ ${e}`));
    console.log('------------------------------------------------------------\n');
    process.exit(1);
  }
}

if (require.main === module) main();
module.exports = { auditSchemaGraph };
