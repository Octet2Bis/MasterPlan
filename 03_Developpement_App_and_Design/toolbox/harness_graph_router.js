#!/usr/bin/env node
/**
 * HARNESS GRAPH ROUTER — PRIMARY RUNTIME (Node.js)
 * Écosystème Antigravity — Master Plan
 *
 * RÔLE ARCHITECTURAL :
 * - Runtime : ACTIF / PRIMAIRE pour l'environnement IDE, npm et simulateur Aevum.
 * - Parité : Doublé par harness_graph_router.py (pont secondaire pour agents Python).
 * - Découplage de Données (Loi AGENTS.md #1 & #2) : La matrice des intentions,
 *   compétences cibles et quality gates est externalisée dans toolbox/data/intent_graph.json.
 *   Zéro troncature fonctionnelle : 100% des règles sont préservées et chargées dynamiquement.
 *
 * Rôle métier : Transforme une intention utilisateur en sous-graphe déterministe d'exécution :
 * - Compétences requises (.agents/skills/)
 * - Fichiers cibles indissociables (Code source + Simulateurs + Docs)
 * - Quality Gates et contraintes architecturales obligatoires
 */

const fs = require('fs');
const path = require('path');

const INTENT_GRAPH_PATH = path.join(__dirname, 'data', 'intent_graph.json');

function loadIntentRegistry() {
  try {
    if (fs.existsSync(INTENT_GRAPH_PATH)) {
      const raw = fs.readFileSync(INTENT_GRAPH_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return parsed.intents || {};
    }
  } catch (err) {
    console.error(`⚠️ Erreur de chargement du Knowledge Graph d'intentions : ${err.message}`);
  }
  return {};
}

const GRAPH_INTENT_REGISTRY = loadIntentRegistry();

function findWorkspaceRoot() {
  let current = __dirname;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(current, 'master_router.md'))) {
      return current;
    }
    current = path.dirname(current);
  }
  return process.cwd();
}

function matchIntent(queryText) {
  const queryLower = (queryText || '').toLowerCase();
  let bestMatch = null;
  let maxScore = 0;

  for (const [intentKey, data] of Object.entries(GRAPH_INTENT_REGISTRY)) {
    let score = 0;
    for (const kw of data.keywords) {
      if (queryLower.includes(kw.toLowerCase())) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = { intentKey, data, score };
    }
  }

  if (bestMatch && maxScore > 0) {
    return {
      matched: true,
      intent_key: bestMatch.intentKey,
      score: maxScore,
      data: bestMatch.data
    };
  }

  return {
    matched: false,
    intent_key: "GENERIC_EXPLORATION_FALLBACK",
    data: {
      title: "Requête Non Indexée (Mode Exploration Libre)",
      primary_pillar: "master_router.md",
      skills: [".agents/skills/agent-harness-ops/SKILL.md"],
      target_files: ["master_router.md"],
      quality_gates: ["Respect absolu des 3 Couches", "Droit de veto architectural CTO"]
    }
  };
}

function formatReport(result, root) {
  const data = result.data;
  const statusIcon = result.matched ? "⚡ [GRAPH ROUTING ACTIF]" : "🧭 [MODE EXPLORATION LIBRE]";
  const lines = [];

  lines.push(`\n${statusIcon} — ${data.title}`);
  lines.push("=".repeat(70));
  lines.push(`📁 Pilier Cible : ${data.primary_pillar}`);

  lines.push("\n🧠 Compétences Spécialisées Requises :");
  for (const s of data.skills) {
    const exists = fs.existsSync(path.join(root, s)) ? "✅" : "⚠️ (non trouvé)";
    lines.push(`   • ${s} ${exists}`);
  }

  lines.push("\n🎯 Chaîne de Fichiers Indissociables à Modifier :");
  for (const f of data.target_files) {
    const exists = fs.existsSync(path.join(root, f)) ? "✅" : "⚠️ (non créé)";
    lines.push(`   • ${f} ${exists}`);
  }

  lines.push("\n🛡️ Quality Gates & Contraintes de Sécurité :");
  for (const q of data.quality_gates) {
    lines.push(`   • ${q}`);
  }

  lines.push("=".repeat(70) + "\n");
  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const root = findWorkspaceRoot();

  if (args.includes('--list-nodes')) {
    if (args.includes('--json')) {
      console.log(JSON.stringify(GRAPH_INTENT_REGISTRY, null, 2));
    } else {
      console.log("\n📦 NŒUDS INDEXÉS DANS LE KNOWLEDGE GRAPH HARNESS :");
      console.log("=".repeat(60));
      for (const [k, v] of Object.entries(GRAPH_INTENT_REGISTRY)) {
        console.log(`• [${k}] : ${v.title}`);
      }
      console.log("=".repeat(60) + "\n");
    }
    return;
  }

  const isJson = args.includes('--json');
  const cleanArgs = args.filter(a => a !== '--json');
  const query = cleanArgs.join(' ') || "aide globale";

  const result = matchIntent(query);

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatReport(result, root));
  }
}

main();
