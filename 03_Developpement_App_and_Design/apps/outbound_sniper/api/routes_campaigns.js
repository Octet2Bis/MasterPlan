/**
 * ROUTES — CONFIGURATION, COMPTE GOOGLE, CAMPAGNES, CONTACTS & HUNTER.IO (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / API
 */
const googleOAuth = require('../engine/google_oauth');
const { loadSpamRules } = require('../engine/deliverability_linter');

module.exports = function campaignRoutes({ engine, redirectUri }) {
  return {
    'GET /api/config': () => engine.publicConfig(),
    'POST /api/config': (body) => { engine.updateConfig(body); return { success: true, config: engine.publicConfig() }; },

    'GET /api/auth/google/status': () => googleOAuth.publicStatus(),
    'POST /api/auth/google/url': (body) => {
      googleOAuth.saveClientCredentials(String(body.client_id || '').trim(), String(body.client_secret || '').trim());
      const clientId = googleOAuth.publicStatus().client_id;
      return { success: true, url: googleOAuth.getAuthUrl(clientId, redirectUri()), redirect_uri: redirectUri() };
    },
    'POST /api/auth/google/disconnect': () => { googleOAuth.disconnect(); return { success: true }; },

    'GET /api/campaigns': () => engine.campaigns.map(c => ({ ...c, contacts_count: engine.getCampaignContacts(c.id).length })),
    'POST /api/campaigns': (body) => ({ success: true, campaign: engine.saveCampaign(body) }),
    'GET /api/campaign/contacts': (_b, url) => engine.getCampaignContacts(url.searchParams.get('cid')),
    'POST /api/campaign/contacts': (body) => {
      if (!engine.getCampaign(body.campaign_id)) return [404, { success: false, error: 'Campagne introuvable.' }];
      engine.saveCampaignContacts(body.campaign_id, body.contacts);
      return { success: true, count: (body.contacts || []).length };
    },
    'POST /api/campaign/verify': async (body) => ({ success: true, contacts: await engine.verifyCampaignContacts(body.campaign_id, { useHunter: body.use_hunter === true }) }),
    'POST /api/contacts/resolve-pattern': async (body) => ({ success: true, contact: await engine.resolveContactPattern(body.contact || {}) }),

    'POST /api/hunter/config': (body) => { engine.updateConfig({ hunter: { api_key: String(body.api_key || '') } }); return { success: true }; },
    'GET /api/hunter/account': () => engine.getHunterAccount(),
    'GET /api/spintax/presets': () => loadSpamRules().spintax_presets || []
  };
};
