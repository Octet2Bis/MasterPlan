/**
 * ROUTES — AUDITS, ENVOI (TEST & CAMPAGNE), STATISTIQUES DE CLICS & PASSERELLE (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / API
 */
const googleOAuth = require('../engine/google_oauth');
const { auditMessage } = require('../engine/deliverability_linter');
const { runPreFlightScan } = require('../engine/preflight_scanner');
const { computeFullDeliverabilityScore } = require('../engine/domain_deliverability_checker');
const { composeEmail } = require('../engine/mail_composer');

const PROVEN = ['VERIFIED'];
const UNPROVEN = ['UNVERIFIED', 'CATCH_ALL'];

module.exports = function deliveryRoutes({ engine }) {
  /** Campagne enregistrée, éventuellement surchargée par le contenu non sauvegardé de l'éditeur. */
  const campaignOf = (body) => ({ ...(engine.getCampaign(body.campaign_id) || {}), ...(body.campaign || {}), id: body.campaign_id });
  const eligibleContacts = (cid, includeUnverified) => {
    const allowed = includeUnverified ? [...PROVEN, ...UNPROVEN] : PROVEN;
    return engine.getCampaignContacts(cid).filter(c => allowed.includes(c.status));
  };
  const preflight = (campaign, contacts) => runPreFlightScan({ campaign, contacts, config: engine.config, senderEmail: googleOAuth.connectedEmail() });

  return {
    'POST /api/campaign/audit-deliverability': (body) => auditMessage(body),
    'POST /api/campaign/preflight': (body) => preflight(campaignOf(body), eligibleContacts(body.campaign_id, body.include_unverified === true)),
    'POST /api/deliverability/full-audit': (body) => computeFullDeliverabilityScore({
      senderEmail: googleOAuth.connectedEmail(), campaign: campaignOf(body),
      contacts: engine.getCampaignContacts(body.campaign_id), dispatchConfig: engine.config
    }),

    /** Email de test : liens directs (pas de tracking), destinataire = compte connecté par défaut. */
    'POST /api/send-test': async (body) => {
      const to = String(body.to || googleOAuth.connectedEmail() || '').trim();
      if (!to.includes('@')) return [400, { success: false, error: 'Adresse destinataire manquante.' }];
      const contact = engine.getCampaignContacts(body.campaign_id)[Number(body.contact_index) || 0];
      if (!contact) return [400, { success: false, error: 'Importez au moins un contact pour générer un test réaliste.' }];
      const mail = composeEmail({ campaign: campaignOf(body), contact, config: engine.config, trackLinks: false });
      if (!mail.isValid) return [400, { success: false, error: `Variable(s) manquante(s) pour ce contact : ${mail.unresolvedVars.join(', ')}` }];
      const r = await googleOAuth.sendGmailMessage({ to, subject: `[TEST] ${mail.subject}`, html: mail.html, text: mail.text, fromName: engine.config.sender?.name });
      return r.success ? { success: true, to } : [502, r];
    },

    'POST /api/dispatch/start': (body) => {
      const cid = body.campaign_id;
      const campaign = engine.getCampaign(cid);
      if (!campaign) return [404, { success: false, error: 'Campagne introuvable.' }];
      const isDryRun = body.dry_run !== false;
      const contacts = eligibleContacts(cid, body.include_unverified === true);
      const check = preflight(campaign, contacts);
      const blocking = check.issues.filter(i => !(isDryRun && i.code === 'NO_SENDER'));
      if (blocking.length > 0) return [400, { success: false, error: `Envoi bloqué : ${blocking.map(i => i.message).join(' | ')}`, preflight: check }];

      const sendFn = async (contact, dryRun) => {
        const mail = composeEmail({ campaign, contact, config: engine.config });
        if (!mail.isValid) return { success: false, error: `Variable(s) manquante(s) : ${mail.unresolvedVars.join(', ')}` };
        if (dryRun) return { success: true };
        const r = await googleOAuth.sendGmailMessage({ to: contact.email, subject: mail.subject, html: mail.html, text: mail.text, fromName: engine.config.sender?.name });
        if (r.success) {
          const list = engine.getCampaignContacts(cid);
          const target = list.find(c => c.id === contact.id);
          if (target) { target.status = 'SENT'; target.sent_at = new Date().toISOString(); target.gmail_id = r.messageId; engine.saveCampaignContacts(cid, list); }
        }
        return r;
      };
      const r = engine.dispatchManager.startCampaign(cid, { contacts, sendFn, isDryRun });
      return r.success ? r : [409, r];
    },
    'POST /api/dispatch/stop': (body) => engine.dispatchManager.stopCampaign(body.campaign_id),
    'GET /api/dispatch/status': () => engine.dispatchManager.getOverallStatus(),

    'GET /api/stats': (_b, url) => engine.getStats(url.searchParams.get('cid')),
    'GET /api/tracking/ping-vm': (_b, url) => engine.pingVm(url.searchParams.get('url')),
    'POST /api/tracking/sync-vm': async (body) => {
      const r = await engine.syncVmTrackingEvents(body.vm_url);
      return r.success ? r : [502, r];
    }
  };
};
