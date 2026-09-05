/**
 * TEST OUTBOUND SUITE — VALIDATION DU MOTEUR D'OUTBOUND SNIPER & TRACKING
 * Pilier : 01_GTM_Growth / Toolbox / Tests (< 120 lignes)
 */

const assert = require('node:assert');
const { EmailVerifierService } = require('../../04_Outbound_and_CRM/core/email_verifier_service');
const { OutboundCampaignEngine } = require('../../04_Outbound_and_CRM/core/outbound_campaign_engine');
const { writeLog, readLogs } = require('../../04_Outbound_and_CRM/core/tracking_server');

async function runOutboundSuite() {
  console.log('\n============================================================');
  console.log('🧪 TEST SUITE : MOTEUR D\'OUTBOUND SNIPER & TRACKING');
  console.log('============================================================\n');

  // 1. Test du Vérificateur d'Emails
  const verifier = new EmailVerifierService();
  
  const v1 = await verifier.verifyEmail('invalid-syntax');
  assert.strictEqual(v1.valid, false, 'Doit rejeter une syntaxe invalide');
  console.log('  ✅ [PASS] Rejet syntaxe invalide');

  const v2 = await verifier.verifyEmail('test@yopmail.com');
  assert.strictEqual(v2.valid, false, 'Doit rejeter un domaine jetable (yopmail)');
  console.log('  ✅ [PASS] Rejet domaine jetable');

  const v3 = await verifier.verifyEmail('contact@google.com');
  assert.strictEqual(v3.valid, true, 'Doit valider un domaine réel');
  console.log('  ✅ [PASS] Validation domaine réel (google.com)');

  // 2. Test du Séquenceur de Campagne
  const engine = new OutboundCampaignEngine("http://localhost:4005");
  const testContact = {
    id: "cnt_999",
    prenom: "Claire",
    nom: "Bernard",
    entreprise: "Qonto",
    role: "Head of Culture",
    campaign_id: "camp_loss_aversion",
    email: "claire.bernard@qonto.com"
  };

  const email = engine.generatePersonalizedEmail(testContact);
  assert.ok(email.subject.includes('Qonto'), 'L\'objet doit contenir le nom de l\'entreprise');
  assert.ok(email.html_body.includes('/t/open?cid=camp_loss_aversion&uid=cnt_999'), 'L\'HTML doit contenir le pixel de tracking');
  assert.ok(email.html_body.includes('/t/click?cid=camp_loss_aversion&uid=cnt_999'), 'L\'HTML doit contenir le lien de clic traçable');
  console.log('  ✅ [PASS] Personnalisation et injection du tracking d\'ouverture et de clic');

  // 3. Test du Journal de Tracking
  writeLog({
    type: 'OPEN',
    campaign_id: 'camp_loss_aversion',
    contact_id: 'cnt_999',
    timestamp: new Date().toISOString(),
    user_agent: 'TestRunner'
  });

  const logs = readLogs();
  const found = logs.events.find(e => e.contact_id === 'cnt_999' && e.type === 'OPEN');
  assert.ok(found, 'L\'événement d\'ouverture doit être persisté dans campaign_tracking_log.json');
  console.log('  ✅ [PASS] Persistance déterministe dans campaign_tracking_log.json');

  console.log('\n------------------------------------------------------------');
  console.log('🎉 100% OUTBOUND SNIPER & TRACKING SUITE VALIDÉE AVEC SUCCÈS.');
  console.log('------------------------------------------------------------\n');
}

if (require.main === module) {
  runOutboundSuite().catch(err => {
    console.error('❌ Échec de la suite Outbound :', err);
    process.exit(1);
  });
}

module.exports = { runOutboundSuite };
