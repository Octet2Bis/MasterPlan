/**
 * GOOGLE WORKSPACE DISPATCHER — ENVOI CADENCÉ & ANTI-SPAM SÉCURISÉ (Node.js 24)
 * Pilier : 01_GTM_Growth / 04_Outbound_and_CRM / Core (< 140 lignes)
 */

const fs = require('node:fs');
const path = require('node:path');
const { EmailVerifierService } = require('./email_verifier_service');
const { OutboundCampaignEngine } = require('./outbound_campaign_engine');

const LOG_FILE = path.join(__dirname, '../data/campaign_tracking_log.json');
const DAILY_LIMIT = 30; // Plafond strict pour préserver la réputation de l'adresse Google Pro

class GoogleWorkspaceDispatcher {
  constructor(isDryRun = true) {
    this.isDryRun = isDryRun;
    this.verifier = new EmailVerifierService();
    this.engine = new OutboundCampaignEngine();
  }

  async runCampaignBatch(maxToSend = DAILY_LIMIT) {
    console.log(`\n============================================================`);
    console.log(`🚀 LANCEMENT DU DISPATCH OUTBOUND SNIPER (Mode: ${this.isDryRun ? 'SIMULATION / DRY-RUN' : 'ENVOI RÉEL'})`);
    console.log(`============================================================\n`);

    const contacts = this.engine.loadContacts();
    console.log(`📋 Contacts chargés : ${contacts.length} contacts`);

    const dispatchPlan = [];
    let sentToday = 0;

    for (const contact of contacts) {
      if (sentToday >= maxToSend) {
        console.log(`⚠️ Plafond quotidien de sécurité atteint (${DAILY_LIMIT} emails/jour). Arrêt préventif.`);
        break;
      }

      // 1. Vérification préalable de délivrabilité
      const verification = await this.verifier.verifyEmail(contact.email);
      if (!verification.valid) {
        console.log(`  ❌ [IGNORÉ] ${contact.email} -> Invalide (${verification.reason})`);
        continue;
      }

      // 2. Génération de l'email personnalisé avec tracking
      const email = this.engine.generatePersonalizedEmail(contact);
      const delaySeconds = Math.floor(Math.random() * (300 - 180 + 1)) + 180; // 180s à 300s

      dispatchPlan.push({
        contact_id: contact.id,
        to: `${contact.prenom} ${contact.nom} <${contact.email}>`,
        subject: email.subject,
        campaign: email.campaign_name,
        delay_before_next_sec: delaySeconds,
        status: this.isDryRun ? 'SIMULATED_READY' : 'QUEUED'
      });

      sentToday++;
      console.log(`  ✅ [VÉRIFIÉ & PRÊT] -> ${email.to_name} (${contact.entreprise})`);
      console.log(`     📌 Objet : "${email.subject}"`);
      console.log(`     ⏳ Délai anti-détection programmé : ${delaySeconds}s\n`);
    }

    const summary = {
      timestamp: new Date().toISOString(),
      total_processed: contacts.length,
      ready_to_send: dispatchPlan.length,
      mode: this.isDryRun ? 'DRY_RUN' : 'LIVE',
      daily_limit: DAILY_LIMIT,
      plan: dispatchPlan
    };

    return summary;
  }
}

if (require.main === module) {
  const isLive = process.argv.includes('--live');
  const dispatcher = new GoogleWorkspaceDispatcher(!isLive);
  dispatcher.runCampaignBatch().then(summary => {
    console.log(`------------------------------------------------------------`);
    console.log(`📊 BILAN DU BATCH : ${summary.ready_to_send}/${summary.total_processed} emails prêts pour envoi.`);
    console.log(`------------------------------------------------------------\n`);
  });
}

module.exports = { GoogleWorkspaceDispatcher };
