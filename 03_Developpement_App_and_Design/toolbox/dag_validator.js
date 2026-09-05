#!/usr/bin/env node
/**
 * MASTER PLAN — DAG & MULTI-SCHEMAS VALIDATOR
 * Pilier : Orchestration & Quality Gate
 * Plafond strict : < 150 lignes
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
const DAG_FILE = path.join(ROOT_DIR, '.agents', 'data', 'master_plan_dag.json');

const MASTER_SCHEMAS = [
  { name: 'Master Plan DAG', file: '.agents/data/master_plan_dag.json' },
  { name: 'Intent Graph Router', file: '03_Developpement_App_and_Design/toolbox/data/intent_graph.json' },
  { name: 'Aevum Protocol Graph', file: '03_Developpement_App_and_Design/apps/aevum_ios/AevumApp/Resources/Data/protocol_graph.json' },
  { name: 'Competitor Keywords Graph', file: '01_GTM_Growth/toolbox/core/data/competitor_keywords_targets.json' },
  { name: 'Hermes Research Graph', file: '02_Assistant_Personnel/Workspace/research_graph.json' }
];

function loadDAG() {
  if (!fs.existsSync(DAG_FILE)) {
    console.error(`🚨 Fichier DAG introuvable : ${DAG_FILE}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(DAG_FILE, 'utf8'));
}

function detectCycles(nodes, edges) {
  const adj = new Map();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    if (adj.has(e.from)) adj.get(e.from).push(e.to);
  });

  const visited = new Set();
  const recStack = new Set();

  function hasCycle(nodeId) {
    visited.add(nodeId);
    recStack.add(nodeId);

    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recStack.has(neighbor)) return true;
    }
    recStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id) && hasCycle(node.id)) return true;
  }
  return false;
}

function auditDAG(dag) {
  const nodes = dag.nodes || [];
  const edges = dag.edges || [];
  const errors = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  if (detectCycles(nodes, edges)) errors.push("Cycle détecté dans le DAG central.");

  nodes.forEach(node => {
    if (!fs.existsSync(path.join(ROOT_DIR, node.file))) {
      errors.push(`[${node.id}] Fichier physique manquant : ${node.file}`);
    }
  });

  edges.forEach(edge => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode) errors.push(`Arête invalide : source inconnue "${edge.from}"`);
    if (!toNode) errors.push(`Arête invalide : cible inconnue "${edge.to}"`);
    if (fromNode && toNode && edge.required_status) {
      if (fromNode.status !== edge.required_status && fromNode.status !== 'DONE' && fromNode.status !== 'ACTIVE') {
        errors.push(`[BLOCAGE] "${toNode.label}" dépend de "${fromNode.label}" (requis: ${edge.required_status}, actuel: ${fromNode.status})`);
      }
    }
  });

  // Audit des 5 Knowledge Graphs de SCHEMAS.md
  MASTER_SCHEMAS.forEach(schema => {
    const p = path.join(ROOT_DIR, schema.file);
    if (!fs.existsSync(p)) errors.push(`Schéma manquant [${schema.name}] : ${schema.file}`);
    else {
      try { JSON.parse(fs.readFileSync(p, 'utf8')); }
      catch (e) { errors.push(`Schéma JSON invalide [${schema.name}] : ${e.message}`); }
    }
  });

  return { valid: errors.length === 0, errors, nodeCount: nodes.length, edgeCount: edges.length, schemaCount: MASTER_SCHEMAS.length };
}

function main() {
  const dag = loadDAG();
  const res = auditDAG(dag);

  console.log('\n============================================================');
  console.log('🌌 MASTER PLAN : AUDIT DAG & DES 5 KNOWLEDGE GRAPHS');
  console.log('============================================================\n');
  console.log(`📊 Nœuds DAG : ${res.nodeCount} | Arêtes : ${res.edgeCount} | Schémas maîtres : ${res.schemaCount}`);

  if (res.valid) {
    console.log('✅ Topologie DAG 100% Déterministe (0 cycle, 0 blocage).');
    console.log('✅ 5/5 Knowledge Graphs maîtres validés avec succès.\n');
    console.log('------------------------------------------------------------');
    console.log('🎉 100% DAG & SCHÉMAS VALIDÉS AVEC SUCCÈS.');
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
module.exports = { loadDAG, auditDAG, detectCycles };
