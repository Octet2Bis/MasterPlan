/**
 * MASTER PLAN — QUALITY GATE : TEST DU CONNECTEUR MEETILY (Node.js)
 * Pilier 02 : Assistant Personnel
 * Rôle : Test déterministe complet (Parsing, Extraction décisions/actions, Ingestion atomique, Alertes Telegram).
 * Plafond strict : < 170 lignes
 */

const fs = require('node:fs');
const path = require('node:path');
const { MeetingIngestor } = require('../02_Automatisation/core/meeting_ingestor');
const { AtomicGraphStore } = require('../02_Automatisation/core/atomic_graph_store');

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
console.log('🎙️ QUALITY GATE : AUDIT DU CONNECTEUR MEETILY (PILIER 02)');
console.log('============================================================\n');

const baseDir = path.resolve(__dirname, '..');
const tempDbFile = path.join(baseDir, 'Workspace', `temp_meetily_db_${Date.now()}.json`);
const sampleMeetingFile = path.join(baseDir, 'Inbox', 'Meetings', 'sample_test_meeting.md');

try {
  const ingestor = new MeetingIngestor(baseDir);
  const dbStore = new AtomicGraphStore(tempDbFile);

  // 1. Audit Configuration & Dossiers
  console.log('1. Audit Configuration & Dossiers :');
  assert(Boolean(ingestor.config.inbox_directory), 'Configuration meetily_config.json chargée');
  assert(fs.existsSync(ingestor.inboxDir), 'Dossier Inbox/Meetings vérifié');
  assert(fs.existsSync(ingestor.archiveDir), 'Dossier Workspace/Meetings vérifié');

  // 2. Audit Parsing Réunion & Extraction Intelligente
  console.log('\n2. Audit Parsing Réunion & Extraction Décisions/Actions :');
  const sampleContent = `# Point Stratégique Aevum & GTM Growth\n` +
    `Date : 2026-08-27\n` +
    `Participants : Antoine, Consultant GTM\n\n` +
    `## Synthèse\n` +
    `Discussion sur l'intégration des protocoles de respiration Aevum et de la campagne GTM.\n\n` +
    `## Décisions\n` +
    `- Décision : Lancement de la campagne GTM pour Q4 2026.\n` +
    `- Accord : Partage des rôles validé.\n\n` +
    `## Actions & Engagements\n` +
    `- Action : Antoine doit finaliser les écrans Aevum avant vendredi 18h.\n` +
    `- Todo : Valider le plan de tracking GTM.\n` +
    `- Engagement : Déployer le nouveau build d'ici lundi.`;

  fs.writeFileSync(sampleMeetingFile, sampleContent, 'utf-8');

  const parsed = ingestor.parseContent(sampleContent, 'sample_test_meeting.md');
  assert(parsed.title.includes('Aevum & GTM'), 'Titre de réunion extrait avec succès');
  assert(parsed.participants.length >= 2, 'Participants identifiés (Antoine, Consultant GTM)');
  assert(parsed.decisions.length >= 2, 'Décisions clés extraites (Campagne GTM, Partage des rôles)');
  assert(parsed.actions.length >= 2, 'Actions à faire extraites (Écrans Aevum, Plan tracking)');
  assert(parsed.entities.includes('AEVUM') && parsed.entities.includes('GTM_GROWTH'), 'Entités canoniques AEVUM et GTM_GROWTH détectées via Hermes');

  // 3. Audit Ingestion Atomique dans le Graphe
  console.log('\n3. Audit Ingestion Atomique dans le Second Cerveau :');
  const ingestPromise = ingestor.ingestFile(sampleMeetingFile, dbStore);
  // Attendre l'ingestion
  return ingestPromise.then((res) => {
    assert(res.title.includes('Aevum & GTM'), 'Ingestion du fichier exécutée avec succès');
    const obsCount = dbStore.getObservationCount();
    assert(obsCount === 1, `Observation enregistrée dans le graphe (${obsCount} obs)`);

    // 4. Audit Alerte Push Telegram
    console.log('\n4. Audit Alerte Push Telegram :');
    const alert = ingestor.formatTelegramAlert(res);
    assert(alert.includes('NOUVELLE RÉUNION INDEXÉE (MEETILY)'), 'En-tête de notification push présent');
    assert(alert.includes('Décisions Clés') && alert.includes('Engagements & Actions'), 'Formatage complet des décisions et actions');

    // 5. Audit Plafond Strict (< 250 Lignes par Fichier)
    console.log('\n5. Audit Plafond Strict (< 250 Lignes par Fichier) :');
    const ingestorLines = fs.readFileSync(path.join(baseDir, '02_Automatisation', 'core', 'meeting_ingestor.js'), 'utf-8').split('\n').length;
    assert(ingestorLines < 250, `meeting_ingestor.js : ${ingestorLines} lignes (< 250 lignes)`);

    const serviceLines = fs.readFileSync(path.join(baseDir, '02_Automatisation', 'telegram_bots_service.js'), 'utf-8').split('\n').length;
    assert(serviceLines < 250, `telegram_bots_service.js : ${serviceLines} lignes (< 250 lignes)`);

    // Nettoyage
    cleanup();
    printFinalSummary();
  });

} catch (err) {
  console.error(`❌ Erreur d'exécution: ${err.message}`);
  failedTests++;
  cleanup();
  printFinalSummary();
}

function cleanup() {
  if (fs.existsSync(tempDbFile)) fs.unlinkSync(tempDbFile);
  if (fs.existsSync(sampleMeetingFile)) fs.unlinkSync(sampleMeetingFile);
  const archivedSample = path.join(baseDir, 'Workspace', 'Meetings', 'sample_test_meeting.md');
  if (fs.existsSync(archivedSample)) fs.unlinkSync(archivedSample);
}

function printFinalSummary() {
  console.log('\n------------------------------------------------------------');
  if (failedTests === 0) {
    console.log(`🎉 100% QUALITY GATE VALIDÉ (${passedTests} vérifications passées avec succès).`);
    console.log('Le Connecteur Meetily est opérationnel, souverain et atomique.');
  } else {
    console.error(`🚨 ÉCHEC : ${failedTests} test(s) en échec.`);
    process.exit(1);
  }
  console.log('------------------------------------------------------------\n');
}
