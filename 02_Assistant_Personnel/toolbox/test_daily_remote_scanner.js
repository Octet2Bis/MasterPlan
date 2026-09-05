/**
 * TEST SUITE: SCANNER QUOTIDIEN ENTREPRISES 100% REMOTE
 * Pilier : 02_Assistant_Personnel (< 80 lignes)
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { formatDailyDigestMarkdown } = require('../04_Productivite_Admin/career_ops/daily_remote_company_scanner');

console.log('🧪 ========================================================');
console.log('🧪 TEST SUITE: SCANNER QUOTIDIEN ENTREPRISES REMOTE');
console.log('🧪 ========================================================\n');

// Test 1 : Formatage du rapport vide
console.log('▶ [1/3] Test du rapport sans nouvelle offre...');
const emptyStats = { companiesScanned: 44, totalJobsFound: 120, qualifiedCount: 0 };
const emptyMd = formatDailyDigestMarkdown(emptyStats, []);
assert(emptyMd.includes('RAPPORT DU SCAN QUOTIDIEN'), 'Le titre doit être présent');
assert(emptyMd.includes('Entreprises cibles auditées : *44*'), 'Le nombre d entreprises doit être présent');
assert(emptyMd.includes('/spontane'), 'Le renvoi vers spontane doit être présent');
console.log('  ✅ Rapport sans offre validé.');

// Test 2 : Formatage du rapport avec opportunités qualifiées
console.log('▶ [2/3] Test du rapport avec opportunités...');
const mockJobs = [
  {
    company: 'GitBook',
    title: 'Growth Marketing Associate',
    match_score: 85,
    target_role: 'Head of Growth',
    link: 'https://example.com/gitbook-job'
  }
];
const withHitsMd = formatDailyDigestMarkdown({ companiesScanned: 44, totalJobsFound: 130, qualifiedCount: 1 }, mockJobs);
assert(withHitsMd.includes('GitBook'), 'L entreprise doit être mentionnée');
assert(withHitsMd.includes('Growth Marketing Associate'), 'Le titre doit être mentionné');
assert(withHitsMd.includes('Score : *85%*'), 'Le score doit être mentionné');
console.log('  ✅ Rapport avec opportunités validé.');

// Test 3 : Fichier verified_remote_companies.json
console.log('▶ [3/3] Test de l intégrité de verified_remote_companies.json...');
const compFile = path.resolve(__dirname, '../Workspace/career/verified_remote_companies.json');
assert(fs.existsSync(compFile), 'Le fichier d entreprises doit exister');
const companies = JSON.parse(fs.readFileSync(compFile, 'utf8'));
assert(Array.isArray(companies) && companies.length >= 40, 'Au moins 40 entreprises vérifiées attendues');
assert(companies.every(c => c.name && c.careers_url), 'Chaque entreprise doit avoir un nom et une URL carrières');
console.log(`  ✅ Base d'entreprises 100% remote conforme (${companies.length} entreprises vérifiées).`);

console.log('\n🎉 TOUS LES TESTS DU SCANNER QUOTIDIEN ONT RÉUSSI AVEC SUCCÈS (3/3) !');
