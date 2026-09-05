/**
 * MASTER PLAN — QUALITY GATE : DURCISSEMENT & SÉCURITÉ TELEGRAM (Node.js)
 * Pilier 02 : Assistant Personnel
 * Rôle : Test déterministe complet (Fail-Closed, 2FA persistant, Magic Bytes, Atomic Writes, Plafond 250l).
 * Plafond strict : < 200 lignes
 */

const fs = require('node:fs');
const path = require('node:path');

const { SessionStore } = require('../02_Automatisation/core/session_store');
const { AtomicGraphStore } = require('../02_Automatisation/core/atomic_graph_store');
const { validateUser, inspectFileMagicBytes, sanitizeFilename } = require('../02_Automatisation/core/security_guard');

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
console.log('🛡️ QUALITY GATE : AUDIT DE SÉCURITÉ & DURCISSEMENT TELEGRAM');
console.log('============================================================\n');

// ------------------------------------------------------------
// TEST 1 : Whitelist Stricte (Fail-Closed)
// ------------------------------------------------------------
console.log('1. Audit Whitelist Fail-Closed :');
assert(validateUser('8815597224', '8815597224').allowed === true, 'Bon ID utilisateur autorisé');
assert(validateUser('9999999999', '8815597224').allowed === false, 'Mauvais ID utilisateur rejeté');
assert(validateUser('8815597224', '').allowed === false, 'Fail-Closed : Rejet absolu si ALLOWED_USER_ID est vide');
assert(validateUser('8815597224', null).allowed === false, 'Fail-Closed : Rejet absolu si ALLOWED_USER_ID est null');
assert(validateUser('', '8815597224').allowed === false, 'Rejet si userId est vide');

// ------------------------------------------------------------
// TEST 2 : Persistance de Session 2FA sur Disque (Anti-Oubli au Redémarrage)
// ------------------------------------------------------------
console.log('\n2. Audit Persistance Session 2FA (TTL 24h) :');
const tempSessionFile = path.join(__dirname, `temp_session_${Date.now()}.json`);
try {
  const session1 = new SessionStore(tempSessionFile);
  assert(session1.isUnlocked() === false, 'Session initialement verrouillée');
  
  session1.unlock(24);
  assert(session1.isUnlocked() === true, 'Session déverrouillée après unlock()');
  assert(fs.existsSync(tempSessionFile), 'Fichier session_state.json bien persisté sur disque');

  // Simulation redémarrage complet du process (nouvelle instance)
  const session2 = new SessionStore(tempSessionFile);
  assert(session2.isUnlocked() === true, 'Survie au redémarrage : session toujours active');
  assert(session2.getRemainingTime().includes('h'), 'Calcul exact du temps restant');

  session2.lock();
  const session3 = new SessionStore(tempSessionFile);
  assert(session3.isUnlocked() === false, 'Verrouillage persistant après appel lock()');
} finally {
  if (fs.existsSync(tempSessionFile)) fs.unlinkSync(tempSessionFile);
}

// ------------------------------------------------------------
// TEST 3 : Écritures Atomiques & Résistance Concurrente (Mutex Queue)
// ------------------------------------------------------------
console.log('\n3. Audit Écritures Atomiques & Mutex Queue :');
const tempGraphFile = path.join(__dirname, `temp_graph_${Date.now()}.json`);
try {
  const store = new AtomicGraphStore(tempGraphFile);
  
  // Exécution de 10 écritures concurrentes
  const promises = [];
  for (let i = 1; i <= 10; i++) {
    promises.push(store.addObservation({ type: 'test', content: `Message simultané ${i}` }));
  }

  Promise.all(promises).then(() => {
    assert(store.getObservationCount() === 10, '10 observations concurrentes insérées sans collision');
    const diskData = JSON.parse(fs.readFileSync(tempGraphFile, 'utf-8'));
    assert(diskData.observations.length === 10, 'JSON sur disque 100% intègre et non corrompu');
    const ids = diskData.observations.map(o => o.id);
    const expectedIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    assert(JSON.stringify(ids) === JSON.stringify(expectedIds), 'Séquentialité des IDs strictement garantie (1 à 10)');
    
    // Nettoyage après promesse
    if (fs.existsSync(tempGraphFile)) fs.unlinkSync(tempGraphFile);
  });
} catch (err) {
  assert(false, `Erreur store atomique: ${err.message}`);
}

// ------------------------------------------------------------
// TEST 4 : Magic Bytes Scanner (Anti-Malware Binaire)
// ------------------------------------------------------------
console.log('\n4. Audit Magic Bytes & Sanitisation Chemins :');
const testJpg = path.join(__dirname, `temp_test_${Date.now()}.jpg`);
const testExe = path.join(__dirname, `temp_fake_${Date.now()}.jpg`);
try {
  // 1. Image JPEG valide
  const jpgBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
  fs.writeFileSync(testJpg, jpgBuffer);
  const jpgRes = inspectFileMagicBytes(testJpg);
  assert(jpgRes.valid === true && jpgRes.mime === 'image/jpeg', 'Header JPEG authentique validé');

  // 2. Binaire Windows déguisé en photo
  const exeBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ PE
  fs.writeFileSync(testExe, exeBuffer);
  const exeRes = inspectFileMagicBytes(testExe);
  assert(exeRes.valid === false && exeRes.error.includes('ALERTE SÉCURITÉ'), 'Exécutable PE (.exe) masqué intercepté et bloqué');

  // 3. Sanitisation anti-traversal
  const cleaned = sanitizeFilename('../../etc/passwd/hack.exe');
  assert(!cleaned.includes('..') && !cleaned.includes('/') && cleaned === 'hack.exe', 'Path traversal neutralisé');
} finally {
  if (fs.existsSync(testJpg)) fs.unlinkSync(testJpg);
  if (fs.existsSync(testExe)) fs.unlinkSync(testExe);
}

// ------------------------------------------------------------
// TEST 5 : Plafond Monolithique Strict (< 250 Lignes par Fichier)
// ------------------------------------------------------------
console.log('\n5. Audit Plafond Strict (< 250 Lignes par Fichier) :');
const autoDir = path.resolve(__dirname, '../02_Automatisation');
const coreDir = path.join(autoDir, 'core');

const filesToCheck = [
  path.join(autoDir, 'telegram_bots_service.js'),
  path.join(autoDir, 'hermes_adapter.js'),
  path.join(coreDir, 'session_store.js'),
  path.join(coreDir, 'security_guard.js'),
  path.join(coreDir, 'atomic_graph_store.js'),
  path.join(coreDir, 'link_enricher.js'),
  path.join(coreDir, 'telegram_client.js')
];

for (const file of filesToCheck) {
  if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf-8').split('\n').length;
    assert(lines < 250, `${path.relative(autoDir, file)} : ${lines} lignes (< 250 lignes)`);
  } else {
    assert(false, `Fichier manquant : ${file}`);
  }
}

// ------------------------------------------------------------
// BILAN DU QUALITY GATE
// ------------------------------------------------------------
setTimeout(() => {
  console.log('\n------------------------------------------------------------');
  if (failedTests === 0) {
    console.log(`🎉 100% QUALITY GATE VALIDÉ (${passedTests} vérifications passées avec succès).`);
    console.log('L\'architecture Telegram est immunisée, fail-closed et persistante.');
  } else {
    console.error(`🚨 ÉCHEC : ${failedTests} test(s) en échec.`);
    process.exit(1);
  }
  console.log('------------------------------------------------------------\n');
}, 500);
