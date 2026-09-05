/**
 * OUTBOUND SNIPER STUDIO — SERVEUR AUTONOME HTTP & REST API (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper (< 230 lignes)
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { SniperCoreEngine } = require('./engine/sniper_core_engine');
const googleOAuth = require('./engine/google_oauth');
const { auditMessage, loadSpamRules } = require('./engine/deliverability_linter');
const { auditDomain, computeFullDeliverabilityScore } = require('./engine/domain_deliverability_checker');
const { sendJSON, parseBody, dispatchMessage } = require('./engine/server_helpers');

const engine = new SniperCoreEngine();
const PORT = engine.config.port || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml'
};
const TRANSPARENT_GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // 1. Tracking
  if (pathname === '/t/open') {
    engine.recordTrackingEvent('OPEN', parsedUrl.searchParams.get('cid') || 'unknown', parsedUrl.searchParams.get('uid') || 'unknown', { ua: req.headers['user-agent'] });
    res.writeHead(200, { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store, no-cache' });
    return res.end(TRANSPARENT_GIF);
  }
  if (pathname === '/t/click') {
    const target = parsedUrl.searchParams.get('target') || 'https://aevum.app';
    engine.recordTrackingEvent('CLICK', parsedUrl.searchParams.get('cid') || 'unknown', parsedUrl.searchParams.get('uid') || 'unknown', { target_url: target });
    res.writeHead(302, { 'Location': target });
    return res.end();
  }
  if (pathname === '/api/tracking/sync-vm' && req.method === 'POST') {
    const b = await parseBody(req);
    const r = await engine.syncVmTrackingEvents(b.vm_url);
    return sendJSON(res, r.success ? 200 : 502, r);
  }
  if (pathname === '/api/tracking/ping-vm' && req.method === 'GET') {
    return sendJSON(res, 200, await engine.pingVm(parsedUrl.searchParams.get('url') || engine.config.tracking?.vm_tracking_url));
  }

  // 2. Google OAuth2
  if (pathname === '/api/auth/google/url' && req.method === 'GET') {
    const clientId = parsedUrl.searchParams.get('client_id') || googleOAuth.loadAuthData().client_id;
    const clientSecret = parsedUrl.searchParams.get('client_secret') || googleOAuth.loadAuthData().client_secret;
    if (clientId) googleOAuth.saveAuthData({ ...googleOAuth.loadAuthData(), client_id: clientId, client_secret: clientSecret || googleOAuth.loadAuthData().client_secret });
    try { return sendJSON(res, 200, { success: true, url: googleOAuth.getAuthUrl(clientId, `http://localhost:${PORT}/api/auth/google/callback`) }); }
    catch (e) { return sendJSON(res, 400, { success: false, error: e.message }); }
  }
  if (pathname === '/api/auth/google/callback' && req.method === 'GET') {
    const auth = googleOAuth.loadAuthData();
    try {
      await googleOAuth.exchangeCodeForTokens(parsedUrl.searchParams.get('code'), auth.client_id, auth.client_secret, `http://localhost:${PORT}/api/auth/google/callback`);
      res.writeHead(302, { 'Location': '/?auth=success' });
      return res.end();
    } catch (e) {
      res.writeHead(302, { 'Location': `/?auth_error=${encodeURIComponent(e.message)}` });
      return res.end();
    }
  }
  if (pathname === '/api/auth/google/status' && req.method === 'GET') return sendJSON(res, 200, googleOAuth.loadAuthData());
  if (pathname === '/api/auth/google/disconnect' && req.method === 'POST') {
    googleOAuth.disconnect();
    return sendJSON(res, 200, { success: true });
  }

  // 3. Configuration & Senders
  if (pathname === '/api/config' && req.method === 'GET') return sendJSON(res, 200, engine.config);
  if (pathname === '/api/config' && req.method === 'POST') {
    engine.config = { ...engine.config, ...(await parseBody(req)) };
    engine.saveJSON('config.json', engine.config);
    return sendJSON(res, 200, { success: true, config: engine.config });
  }
  if (pathname === '/api/senders' && req.method === 'GET') return sendJSON(res, 200, engine.senderManager.senders);
  if (pathname === '/api/senders' && req.method === 'POST') {
    return sendJSON(res, 200, { success: true, sender: await engine.senderManager.addOrUpdateSender(await parseBody(req)) });
  }

  // 4. Campagnes & Contacts
  if (pathname === '/api/campaigns' && req.method === 'GET') return sendJSON(res, 200, engine.campaigns);
  if (pathname === '/api/campaigns' && req.method === 'POST') {
    const body = await parseBody(req);
    const id = body.id || `camp_${Date.now()}`;
    const idx = engine.campaigns.findIndex(c => c.id === id);
    if (idx >= 0) engine.campaigns[idx] = { ...engine.campaigns[idx], ...body };
    else engine.campaigns.push({ ...body, id });
    engine.saveJSON('campaigns.json', engine.campaigns);
    return sendJSON(res, 200, { success: true, campaign: idx >= 0 ? engine.campaigns[idx] : engine.campaigns[engine.campaigns.length - 1] });
  }
  if (pathname === '/api/campaign/contacts' && req.method === 'GET') return sendJSON(res, 200, engine.getCampaignContacts(parsedUrl.searchParams.get('cid') || engine.campaigns[0]?.id));
  if (pathname === '/api/campaign/contacts' && req.method === 'POST') {
    const b = await parseBody(req);
    return sendJSON(res, 200, { success: engine.saveCampaignContacts(b.campaign_id, b.contacts || []), count: (b.contacts || []).length });
  }
  if (pathname === '/api/campaign/verify' && req.method === 'POST') {
    return sendJSON(res, 200, { success: true, contacts: await engine.verifyCampaignContacts((await parseBody(req)).campaign_id) });
  }
  if (pathname === '/api/contacts/resolve-pattern' && req.method === 'POST') {
    return sendJSON(res, 200, { success: true, contact: await engine.resolveContactPattern((await parseBody(req)).contact || {}) });
  }
  if (pathname === '/api/preview' && req.method === 'POST') {
    const b = await parseBody(req);
    return sendJSON(res, 200, engine.generateEmailPreview(b.contact, b.campaign_id, b.sender_id));
  }

  // 5. Hunter.io Integration
  if (pathname === '/api/hunter/config' && req.method === 'POST') return sendJSON(res, 200, engine.setHunterApiKey((await parseBody(req)).api_key || ''));
  if (pathname === '/api/hunter/account' && req.method === 'GET') return sendJSON(res, 200, await engine.getHunterAccount());
  if (pathname === '/api/hunter/verify' && req.method === 'POST') return sendJSON(res, 200, await engine.verifyHunterEmail((await parseBody(req)).email));
  if (pathname === '/api/hunter/find' && req.method === 'POST') {
    const b = await parseBody(req);
    return sendJSON(res, 200, await engine.findHunterEmail(b.domain, b.first_name, b.last_name));
  }

  // 6. Deliverability, DNS & Score Checker
  if (pathname === '/api/campaign/audit-deliverability' && req.method === 'POST') return sendJSON(res, 200, auditMessage(await parseBody(req)));
  if (pathname === '/api/deliverability/audit-sender' && req.method === 'POST') {
    const b = await parseBody(req);
    const auth = googleOAuth.loadAuthData();
    return sendJSON(res, 200, await auditDomain(b.email || (auth.connected ? auth.user?.email : engine.config.sender?.email)));
  }
  if (pathname === '/api/deliverability/full-audit' && req.method === 'POST') {
    const b = await parseBody(req);
    const cid = b.campaign_id || engine.campaigns[0]?.id;
    const auth = googleOAuth.loadAuthData();
    return sendJSON(res, 200, await computeFullDeliverabilityScore({
      senderEmail: b.sender_email || (auth.connected ? auth.user?.email : engine.config.sender?.email),
      campaign: b.campaign || engine.campaigns.find(c => c.id === cid) || {},
      contacts: engine.getCampaignContacts(cid),
      dispatchConfig: engine.config
    }));
  }
  if (pathname === '/api/spintax/presets' && req.method === 'GET') return sendJSON(res, 200, loadSpamRules().spintax_presets || []);

  // 7. SMTP & Dispatch
  if (pathname === '/api/smtp/test' && req.method === 'POST') {
    const b = await parseBody(req);
    engine.smtpClient.user = b.email || engine.config.sender?.email;
    engine.smtpClient.pass = b.password || engine.config.sender?.app_password;
    if (b.email) { engine.config.sender = { ...engine.config.sender, email: b.email, app_password: b.password }; engine.saveJSON('config.json', engine.config); }
    return sendJSON(res, 200, await engine.smtpClient.verifyConnection());
  }
  if (pathname === '/api/send-test' && req.method === 'POST') {
    const b = await parseBody(req);
    const auth = googleOAuth.loadAuthData();
    const to = b.to || (auth.connected ? auth.user?.email : engine.smtpClient.user);
    if (!to) return sendJSON(res, 400, { success: false, error: "Adresse destinataire manquante." });
    const emailData = engine.generateEmailPreview({ id: 'test', prenom: 'Antoine', nom: 'Lecerf', entreprise: 'Test Lab', email: to }, b.campaign_id, b.sender_id);
    return sendJSON(res, 200, await dispatchMessage(engine, {
      from: emailData.sender?.send_as_email || (auth.connected ? auth.user?.email : engine.smtpClient.user),
      to, subject: `[TEST LIVE] ${emailData.subject}`, htmlBody: emailData.htmlBody, textBody: emailData.bodyText,
      fromName: emailData.sender?.display_name || auth.user?.name || 'Antoine Lecerf'
    }));
  }
  if (pathname === '/api/dispatch/start' && req.method === 'POST') {
    const b = await parseBody(req);
    const cid = b.campaign_id || engine.campaigns[0]?.id;
    const contacts = engine.getCampaignContacts(cid).filter(c => c.status === 'VERIFIED');
    if (contacts.length === 0) return sendJSON(res, 400, { success: false, error: 'Aucun contact vérifié pour cette campagne.' });

    const sendFn = async (contact, dryRun) => {
      const emailData = engine.generateEmailPreview(contact, cid, b.sender_id);
      if (!emailData.isValid || (emailData.unresolvedVars && emailData.unresolvedVars.length > 0)) {
        return { success: false, error: `Garde-Fou Poka-Yoke : Variable [{{${emailData.unresolvedVars.join(', ')}}}] manquante.` };
      }
      if (dryRun) return { success: true, mode: 'DRY_RUN' };
      const auth = googleOAuth.loadAuthData();
      const sendRes = await dispatchMessage(engine, {
        from: emailData.sender?.send_as_email || (auth.connected ? auth.user?.email : engine.config.sender?.email),
        to: contact.email, subject: emailData.subject, htmlBody: emailData.htmlBody, textBody: emailData.bodyText,
        fromName: emailData.sender?.display_name || auth.user?.name
      });
      if (sendRes.success) {
        contact.status = 'SENT'; contact.sent_at = new Date().toISOString();
        const list = engine.getCampaignContacts(cid);
        const idx = list.findIndex(c => c.id === contact.id || c.email === contact.email);
        if (idx >= 0) { list[idx].status = 'SENT'; list[idx].sent_at = contact.sent_at; engine.saveCampaignContacts(cid, list); }
      }
      return sendRes;
    };
    return sendJSON(res, 200, await engine.dispatchManager.startCampaign(cid, { contacts, sendFn, isDryRun: b.dry_run !== false }));
  }
  if (pathname === '/api/dispatch/stop' && req.method === 'POST') return sendJSON(res, 200, engine.dispatchManager.stopCampaign((await parseBody(req)).campaign_id));
  if (pathname === '/api/dispatch/status' && req.method === 'GET') return sendJSON(res, 200, engine.dispatchManager.getOverallStatus());
  if (pathname === '/api/stats' && req.method === 'GET') {
    const t = engine.loadJSON('tracking_events.json') || { total_opens: 0, total_clicks: 0, events: [] };
    return sendJSON(res, 200, { ...t, ctr_percent: t.total_opens > 0 ? ((t.total_clicks / t.total_opens) * 100).toFixed(1) : 0 });
  }

  // 8. Fichiers Statiques
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] || 'text/plain' });
    return fs.createReadStream(filePath).pipe(res);
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Ressource non trouvée');
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`🎯 OUTBOUND SNIPER STUDIO ACTIF (PORT ${PORT})\n🌐 http://localhost:${PORT}`));
}

module.exports = { server, engine };
