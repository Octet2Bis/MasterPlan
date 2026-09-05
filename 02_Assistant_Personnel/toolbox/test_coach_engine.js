/**
 * MASTER PLAN — QUALITY GATE : TEST DU MOTEUR COACH PERSONNEL 3x3 (Node.js)
 * Pilier 02 : Assistant Personnel
 * Rôle : Test déterministe complet (Catalogues JSON, Rituels Matin/Midi/Soir, Dérivation, Plafond 250l).
 * Plafond strict : < 170 lignes
 */

const fs = require('node:fs');
const path = require('node:path');
const { CoachEngine } = require('../02_Automatisation/core/coach_engine');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failedTests++;
  }
}

console.log('\n============================================================');
console.log('🧠 QUALITY GATE : AUDIT DU COACH PERSONNEL 3x3 (PILIER 02)');
console.log('============================================================\n');

const baseDir = path.resolve(__dirname, '..');
const tempJournal = path.join(baseDir, 'Workspace', `temp_coach_journal_${Date.now()}.json`);

try {
  const engine = new CoachEngine(baseDir);
  engine.journalPath = tempJournal;
  engine.journal = { entries: [], somatic_completions: [] };

  // 1. Audit Chargement des Catalogues Déclaratifs
  console.log('1. Audit des Catalogues JSON purs :');
  assert(Array.isArray(engine.catalog.morning_prompts) && engine.catalog.morning_prompts.length >= 5, 'Catalogue Matin chargé (>= 5 exercices stoïciens/focus)');
  assert(Array.isArray(engine.catalog.midday_protocols) && engine.catalog.midday_protocols.length >= 5, 'Catalogue Midi chargé (>= 5 protocoles somatiques Aevum)');
  assert(Array.isArray(engine.catalog.evening_prompts) && engine.catalog.evening_prompts.length >= 3, 'Catalogue Soir chargé (>= 3 sas de décompression)');
  assert(Boolean(engine.config.quarterly_horizon?.theme), 'Configuration trimestrielle 3x3 chargée');

  // 2. Audit Génération des Rituels (Format Markdown & Injonctions)
  console.log('\n2. Audit des Rituels Quotidiens :');
  const morning = engine.formatMorning(0);
  assert(morning.includes('COACH MATIN') && morning.includes('Exercice de rédaction'), 'Rituel Matin génère le prompt de focus et les 2 questions');
  
  const midday = engine.formatMidday(0);
  assert(midday.includes('COACH SOMATIQUE') && midday.includes('Nerf Vague'), 'Rituel Midi génère le protocole somatique et les instructions de souffle');

  const evening = engine.formatEvening(0);
  assert(evening.includes('COACH SOIR') && evening.includes('Fermeture des Boucles'), 'Rituel Soir génère la décharge mentale de clôture');

  // 3. Audit Traitement des Commandes Telegram
  console.log('\n3. Audit des Commandes Interactives :');
  assert(engine.handleCommand('/coach').includes('MENU COACH PERSONNEL'), 'Commande /coach renvoie le menu d\'action complet');
  assert(engine.handleCommand('/matin').includes('COACH MATIN'), 'Commande /matin déclenche l\'exercice d\'écriture');
  assert(engine.handleCommand('/respi').includes('COACH SOMATIQUE'), 'Commande /respi déclenche le reset vagal');
  assert(engine.handleCommand('/soir').includes('COACH SOIR'), 'Commande /soir déclenche le sas de déconnexion');
  
  const faitRes = engine.handleCommand('/fait', 'Antoine');
  assert(faitRes.includes('Reset somatique validé'), 'Commande /fait enregistre l\'exercice somatique avec succès');
  assert(engine.journal.somatic_completions.length === 1, 'Incrémentation exacte du compteur somatique');

  // 4. Audit Enregistrement des Écrits & Extraction de Mots-Clés
  console.log('\n4. Audit Rédaction & Extraction Intentionnelle :');
  const entry = engine.recordResponse('matin', 'Finaliser Aevum et couper les notifications de dispersion', 'Antoine');
  assert(entry.id === 1 && entry.phase === 'matin', 'Enregistrement de la réflexion matinale');
  assert(entry.keywords.includes('finaliser') && entry.keywords.includes('aevum'), 'Extraction sémantique des mots-clés de focus');

  // 5. Audit Dérivation du Bilan Hebdomadaire (3x3 Meryl)
  console.log('\n5. Audit Dérivation Hebdomadaire (Méthode 3x3) :');
  const weekly = engine.formatWeeklySummary();
  assert(weekly.includes('BILAN HEBDOMADAIRE DU COACH') && weekly.includes('Tes 3 Ajustements Comportementaux Dérivés'), 'Génération de la synthèse hebdomadaire avec les 3 ajustements dérivés');

  // 6. Audit Déclencheur Automatique Proactif (Scheduled Push)
  console.log('\n6. Audit Déclencheur Automatique Proactif :');
  const sentPush = [];
  const mockBot = { sendMessage: (cid, text) => sentPush.push({ cid, text }) };
  const now = new Date();
  const currentHhMm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  engine.config.cadence.morning_time = currentHhMm;
  engine.checkScheduledTriggers(mockBot, '123456');
  assert(sentPush.length === 1 && sentPush[0].text.includes('COACH MATIN'), 'Déclencheur automatique matinal a poussé la notification sans commande');
  assert(engine.journal.scheduler_state.lastMorning !== undefined, 'Enregistrement anti-doublon dans le scheduler state');
  // Deuxième appel : ne doit pas renvoyer
  engine.checkScheduledTriggers(mockBot, '123456');
  assert(sentPush.length === 1, 'Idempotence validée : zéro spam dans la même minute');

  // 7. Audit Plafond Strict (< 250 Lignes par Fichier)
  console.log('\n7. Audit Plafond Strict (< 250 Lignes par Fichier) :');
  const engineLines = fs.readFileSync(path.join(baseDir, '02_Automatisation', 'core', 'coach_engine.js'), 'utf-8').split('\n').length;
  assert(engineLines < 250, `coach_engine.js : ${engineLines} lignes (< 250 lignes)`);

  const clientLines = fs.readFileSync(path.join(baseDir, '02_Automatisation', 'core', 'telegram_client.js'), 'utf-8').split('\n').length;
  assert(clientLines < 250, `telegram_client.js : ${clientLines} lignes (< 250 lignes)`);

  const serviceLines = fs.readFileSync(path.join(baseDir, '02_Automatisation', 'telegram_bots_service.js'), 'utf-8').split('\n').length;
  assert(serviceLines < 250, `telegram_bots_service.js : ${serviceLines} lignes (< 250 lignes)`);

} finally {
  if (fs.existsSync(tempJournal)) fs.unlinkSync(tempJournal);
}

// Bilan
console.log('\n------------------------------------------------------------');
if (failedTests === 0) {
  console.log(`🎉 100% QUALITY GATE VALIDÉ (${passedTests} vérifications passées avec succès).`);
  console.log('Le Coach Personnel 3x3 est opérationnel, interactif et déterministe.');
} else {
  console.error(`🚨 ÉCHEC : ${failedTests} test(s) en échec.`);
  process.exit(1);
}
console.log('------------------------------------------------------------\n');
