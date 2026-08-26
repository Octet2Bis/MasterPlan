#!/usr/bin/env node
/**
 * CAREER SKILL-TO-PROOF BIPARTITE MATCHING ENGINE
 * Pilier 02 : Assistant Personnel / Career Ops
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
const GRAPH_FILE = path.join(ROOT_DIR, '02_Assistant_Personnel', 'Workspace', 'career', 'skill_proof_graph.json');

function loadGraph() {
  if (!fs.existsSync(GRAPH_FILE)) {
    console.error(`🚨 Graphe compétences-preuves introuvable : ${GRAPH_FILE}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf8'));
}

function matchOfferToProofs(offerText) {
  const graph = loadGraph();
  const textLower = (offerText || '').toLowerCase();
  const matchedSkills = [];
  const proofMap = new Map(graph.proofs.map(p => [p.id, p]));

  for (const skill of graph.skills) {
    const hits = skill.keywords.filter(kw => textLower.includes(kw.toLowerCase()));
    if (hits.length > 0) {
      const associatedProofs = [];
      const edges = graph.bipartite_edges.filter(e => e.skill_id === skill.id);
      
      edges.forEach(e => {
        const proof = proofMap.get(e.proof_id);
        if (proof) {
          const fullPath = path.join(ROOT_DIR, proof.file_path);
          const exists = fs.existsSync(fullPath);
          associatedProofs.push({
            ...proof,
            verified_on_disk: exists,
            strength: e.strength
          });
        }
      });

      matchedSkills.push({
        skill_id: skill.id,
        label: skill.label,
        tier: skill.competency_tier,
        hits,
        proofs: associatedProofs
      });
    }
  }

  const verifiedProofsCount = matchedSkills.reduce((acc, s) => acc + s.proofs.filter(p => p.verified_on_disk).length, 0);
  const totalProofsReferenced = matchedSkills.reduce((acc, s) => acc + s.proofs.length, 0);
  const proofConfidence = totalProofsReferenced > 0 ? Math.round((verifiedProofsCount / totalProofsReferenced) * 100) : 0;

  // Calcul du score de correspondance globale
  const baseRatio = Math.min(1.0, matchedSkills.length / 3);
  let score = Math.round((baseRatio * 75) + (proofConfidence * 0.25));
  if (textLower.includes('remote') || textLower.includes('télétravail')) score = Math.min(100, score + 10);

  let tier = "Bronze";
  if (score >= 85) tier = "Gold";
  else if (score >= 70) tier = "Silver";

  return {
    score,
    tier,
    matchedSkillsCount: matchedSkills.length,
    proofConfidence,
    matchedSkills
  };
}

function auditAllProofs() {
  const graph = loadGraph();
  console.log('\n============================================================');
  console.log('💼 AUDIT D\'INTÉGRITÉ DES PREUVES DE CODE DU MASTER PLAN');
  console.log('============================================================\n');

  let passed = 0;
  graph.proofs.forEach(p => {
    const fullPath = path.join(ROOT_DIR, p.file_path);
    const exists = fs.existsSync(fullPath);
    const status = exists ? '✅ [VÉRIFIÉ]' : '❌ [MANQUANT]';
    console.log(`  ${status} ${p.label}`);
    console.log(`     📁 ${p.file_path}`);
    console.log(`     📊 Métrique : ${p.verification_metric}\n`);
    if (exists) passed++;
  });

  console.log('------------------------------------------------------------');
  console.log(`🎉 ${passed} / ${graph.proofs.length} PREUVES CONFIRMÉES SUR LE DISQUE (${Math.round(passed / graph.proofs.length * 100)}%)`);
  console.log('------------------------------------------------------------\n');
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--audit-proofs')) {
    auditAllProofs();
    return;
  }

  const query = args.join(' ') || "Senior iOS Engineer Swift SwiftUI Screen Time Quality Gate";
  const result = matchOfferToProofs(query);

  console.log('\n============================================================');
  console.log(`🎯 RÉSULTAT MATCHING ATS & PREUVES DE CODE : TIER ${result.tier.toUpperCase()} (${result.score}/100)`);
  console.log('============================================================\n');
  console.log(`📊 Compétences Détectées : ${result.matchedSkillsCount} | Certitude des Preuves : ${result.proofConfidence}%\n`);

  result.matchedSkills.forEach(s => {
    console.log(`🔹 [${s.tier}] ${s.label}`);
    s.proofs.forEach(p => {
      const diskIcon = p.verified_on_disk ? '✅' : '⚠️';
      console.log(`   ${diskIcon} Preuve : ${p.label}`);
      console.log(`      📁 Fichier : ${p.file_path}`);
      console.log(`      📈 Preuve chiffrée : ${p.verification_metric}`);
    });
    console.log('');
  });
}

if (require.main === module) main();

module.exports = { matchOfferToProofs, auditAllProofs };
