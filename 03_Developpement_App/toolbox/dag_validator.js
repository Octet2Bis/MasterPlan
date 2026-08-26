#!/usr/bin/env node
/**
 * MASTER PLAN — DAG & DEPENDENCY VALIDATOR
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
      } else if (recStack.has(neighbor)) {
        return true;
      }
    }
    recStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id)) return true;
    }
  }
  return false;
}

function auditDAG(dag) {
  const nodes = dag.nodes || [];
  const edges = dag.edges || [];
  const errors = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // 1. Détection de cycle
  if (detectCycles(nodes, edges)) {
    errors.push("Cycle détecté dans le graphe ! Le graphe n'est pas un DAG valide.");
  }

  // 2. Intégrité des fichiers physiques
  nodes.forEach(node => {
    const fullPath = path.join(ROOT_DIR, node.file);
    if (!fs.existsSync(fullPath)) {
      errors.push(`[${node.id}] Fichier introuvable sur le disque : ${node.file}`);
    }
  });

  // 3. Intégrité des arêtes et conditions de blocage
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

  return { valid: errors.length === 0, errors, nodeCount: nodes.length, edgeCount: edges.length };
}

function main() {
  const dag = loadDAG();
  const res = auditDAG(dag);

  console.log('\n============================================================');
  console.log('🌌 MASTER PLAN : AUDIT DU DAG DES DÉPENDANCES CENTRALES');
  console.log('============================================================\n');
  console.log(`📊 Nœuds indexés : ${res.nodeCount} | Arêtes relationnelles : ${res.edgeCount}`);

  if (res.valid) {
    console.log('✅ Topologie DAG 100% Déterministe (Zéro cycle, zéro fichier manquant).');
    console.log('✅ Toutes les dépendances amont sont satisfaites sans blocage.\n');
    console.log('------------------------------------------------------------');
    console.log('🎉 100% DAG VALIDÉ AVEC SUCCÈS.');
    console.log('------------------------------------------------------------\n');
    process.exit(0);
  } else {
    console.error(`🚨 ${res.errors.length} ERREUR(S) OU CONDITION(S) DE BLOCAGE :`);
    res.errors.forEach(e => console.error(`  ❌ ${e}`));
    console.log('------------------------------------------------------------\n');
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { loadDAG, auditDAG, detectCycles };
