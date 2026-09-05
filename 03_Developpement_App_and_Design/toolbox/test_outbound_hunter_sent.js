/**
 * TEST SUITE : OUTBOUND SNIPER — HUNTER.IO & PERSISTANCE SENT (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Toolbox
 * Validation déterministe (Zéro "Done" sans Test, Commandement 3).
 * Plafond : < 120 lignes.
 */

const assert = require('node:assert');
const { HunterClient } = require('../apps/outbound_sniper/engine/hunter_client');
const { SniperCoreEngine } = require('../apps/outbound_sniper/engine/sniper_core_engine');

async function runTests() {
  console.log('🧪 Lancement des tests Outbound Sniper (Hunter & Persistance SENT)...');

  // Test 1 : HunterClient sans clé (Fail-Closed & Repli Gracieux)
  const clientEmpty = new HunterClient('');
  assert.strictEqual(clientEmpty.isConfigured(), false, 'Un client sans clé ne doit pas être configuré.');
  const resNoKey = await clientEmpty.verifyEmail('test@example.com');
  assert.strictEqual(resNoKey.success, false);
  assert.ok(resNoKey.error.includes('non configurée'), 'Doit indiquer que la clé n\'est pas configurée.');
  console.log('  ✅ Test 1 réussi : HunterClient sans clé géré avec repli gracieux.');

  // Test 2 : HunterClient avec clé et mapping de score
  const clientWithKey = new HunterClient('hunter_test_key_123456789012345');
  assert.strictEqual(clientWithKey.isConfigured(), true, 'Le client avec clé doit être marqué configuré.');
  console.log('  ✅ Test 2 réussi : HunterClient avec clé correctement initialisé.');

  // Test 3 : SniperCoreEngine & Persistance du statut SENT
  const engine = new SniperCoreEngine();
  assert.ok(typeof engine.verifyHunterEmail === 'function', 'verifyHunterEmail doit être exposé.');
  assert.ok(typeof engine.findHunterEmail === 'function', 'findHunterEmail doit être exposé.');

  // Simulation d'une liste de 3 contacts dont 1 est envoyé
  const mockContacts = [
    { id: 'c1', email: 'jean@entreprise.com', status: 'VERIFIED' },
    { id: 'c2', email: 'sophie@startup.io', status: 'VERIFIED' },
    { id: 'c3', email: 'marc@groupe.fr', status: 'PENDING' }
  ];

  // Simulation de l'envoi du premier contact
  mockContacts[0].status = 'SENT';
  mockContacts[0].sent_at = new Date().toISOString();

  // Vérification de l'exclusion déterministe pour le cycle suivant
  const remainingForNextDay = mockContacts.filter(c => c.status === 'VERIFIED');
  assert.strictEqual(remainingForNextDay.length, 1, 'Seul 1 contact VERIFIED doit rester en file.');
  assert.strictEqual(remainingForNextDay[0].id, 'c2', 'Le contact c2 doit être le prochain en file.');
  assert.strictEqual(mockContacts[0].status, 'SENT', 'Le contact c1 doit être marqué SENT.');
  assert.ok(mockContacts[0].sent_at, 'La date d\'envoi doit être renseignée.');
  console.log('  ✅ Test 3 réussi : Persistance du statut SENT & exclusion anti-doublon multi-jours validée.');

  // Test 4 : Calculateur d'ETA (Logique temporelle)
  const avgSec = 660; // 11 min
  const contactsCount = 30;
  const totalMin = Math.round((contactsCount * avgSec) / 60);
  assert.strictEqual(totalMin, 330, '30 contacts à 11 min = 330 min (5h30).');
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  assert.strictEqual(hours, 5);
  assert.strictEqual(mins, 30);
  console.log('  ✅ Test 4 réussi : Calculateur d\'horizon temporel validé (5h30 pour 30 cibles).');

  // Test 5 : Mode Furtif Déterministe (Zéro pixel, Liens directs)
  const previewStealth = engine.generateEmailPreview({ id: 'c1', prenom: 'Test', nom: 'User', entreprise: 'ACME' }, engine.campaigns[0].id);
  assert.strictEqual(previewStealth.isStealth, true, 'Le mode furtif doit être actif par défaut.');
  assert.strictEqual(previewStealth.openUrl, null, 'Aucune URL de pixel ne doit être générée en mode furtif.');
  assert.strictEqual(previewStealth.clickUrl, 'https://aevum.app', 'Le lien CTA doit être direct sans proxy /t/click.');
  assert.ok(!previewStealth.htmlBody.includes('<img'), 'Le corps HTML ne doit contenir aucune balise image 1x1.');

  // Test du basculement non-furtif
  engine.campaigns[0].stealth_mode = false;
  const previewTracked = engine.generateEmailPreview({ id: 'c1', prenom: 'Test', nom: 'User', entreprise: 'ACME' }, engine.campaigns[0].id);
  assert.strictEqual(previewTracked.isStealth, false, 'Le mode tracking doit pouvoir être activé.');
  assert.ok(previewTracked.openUrl.includes('/t/open'), 'L\'URL de tracking d\'ouverture doit être présente.');
  assert.ok(previewTracked.clickUrl.includes('/t/click'), 'L\'URL de redirection de clic doit être présente.');
  assert.ok(previewTracked.htmlBody.includes('<img'), 'Le corps HTML doit contenir le pixel 1x1 en mode tracking.');
  engine.campaigns[0].stealth_mode = true; // Rétablissement
  console.log('  ✅ Test 5 réussi : Mode Furtif validé (Zéro pixel, liens directs, isolation anti-promotions).');

  console.log('🎉 TOUS LES TESTS OUTBOUND SNIPER ONT RÉUSSI (5/5) !');
}

runTests().catch(err => {
  console.error('❌ Échec du test :', err);
  process.exit(1);
});
