#!/usr/bin/env node
/**
 * MASTER PLAN — B2B BUYING COMMITTEE DECISION ENGINE
 * Pilier 01 : GTM & Growth / Core Engines
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
const GRAPH_FILE = path.join(ROOT_DIR, '01_GTM_Growth', 'Workspace', 'campaigns', '2026-Q3_b2b_partenariats_tourisme', 'buying_committee_graph.json');

function loadGraph() {
  if (!fs.existsSync(GRAPH_FILE)) {
    console.error(`🚨 Graphe de comité d'achat introuvable : ${GRAPH_FILE}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf8'));
}

function resolveAccountStrategy(query) {
  const graph = loadGraph();
  const qLower = (query || '').toLowerCase();

  const account = graph.accounts.find(a => 
    a.id.toLowerCase().includes(qLower) || a.name.toLowerCase().includes(qLower)
  );

  if (!account) return null;

  const personaMap = new Map(graph.personas.map(p => [p.id, p]));
  const painMap = new Map(graph.pain_points.map(p => [p.id, p]));
  const collateralMap = new Map(graph.collaterals.map(c => [c.id, c]));

  const committeeMembers = account.buying_committee.map(persId => {
    const pers = personaMap.get(persId);
    if (!pers) return null;

    const pain = painMap.get(pers.primary_pain_id);
    const collateral = collateralMap.get(pers.recommended_collateral_id);

    return {
      persona: pers.name,
      role: pers.role,
      angle: pers.psychographic_angle,
      painPoint: pain ? pain.title : 'Non spécifié',
      benchmarkMetric: pain ? pain.metric_benchmark : '',
      recommendedCollateral: collateral ? collateral.title : 'Non spécifié'
    };
  }).filter(Boolean);

  return {
    accountName: account.name,
    industry: account.industry,
    dealTier: account.deal_size_potential,
    committeeCount: committeeMembers.length,
    committeeMembers
  };
}

function main() {
  const args = process.argv.slice(2);
  const graph = loadGraph();

  if (args.includes('--list-accounts')) {
    console.log('\n🏢 COMPTES INDEXÉS DANS LE BUYING COMMITTEE GRAPH :');
    console.log('='.repeat(60));
    graph.accounts.forEach(a => console.log(`• [${a.id}] : ${a.name} (${a.industry}) — ${a.deal_size_potential}`));
    console.log('='.repeat(60) + '\n');
    return;
  }

  const query = args[0] || "wonderbox";
  const res = resolveAccountStrategy(query);

  if (!res) {
    console.error(`❌ Aucun compte trouvé pour : "${query}"`);
    process.exit(1);
  }

  console.log('\n============================================================');
  console.log(`🎯 STRATÉGIE B2B BUYING COMMITTEE : ${res.accountName.toUpperCase()}`);
  console.log('============================================================\n');
  console.log(`🏢 Secteur : ${res.industry} | Potentiel : ${res.dealTier}`);
  console.log(`👥 Membres du Comité d'Achat Cartographiés : ${res.committeeCount}\n`);

  res.committeeMembers.forEach((m, idx) => {
    console.log(`👤 [${m.role.toUpperCase()}] — ${m.persona}`);
    console.log(`   💡 Angle Psychographique : ${m.angle}`);
    console.log(`   ⚠️ Pain Point : ${m.painPoint}`);
    console.log(`   📊 Chiffre Clé : ${m.benchmarkMetric}`);
    console.log(`   📄 Collateral Recommandé : ${m.recommendedCollateral}\n`);
  });

  console.log('------------------------------------------------------------');
  console.log('🎉 STRATÉGIE DÉCISIONNELLE RÉSOLUE AVEC SUCCÈS.');
  console.log('------------------------------------------------------------\n');
}

if (require.main === module) main();

module.exports = { resolveAccountStrategy };
