/**
 * TESTS MOTEUR — NON-RÉGRESSION DES DÉFAUTS P0/P1 DE L'AUDIT (sans réseau externe)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Tests
 */
const { startFakeSmtp, run, DATA_DIR } = require('./helpers');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const store = require('../engine/store');
const { DeepEmailVerifier } = require('../engine/deep_email_verifier');
const { EmailPatternResolver } = require('../engine/email_pattern_resolver');
const { DispatchManager } = require('../engine/dispatch_manager');
const { composeEmail } = require('../engine/mail_composer');
const { verifyClick, assessTrackingUrl } = require('../engine/tracking');
const { runPreFlightScan } = require('../engine/preflight_scanner');
const googleOAuth = require('../engine/google_oauth');
const { auditDomain } = require('../engine/domain_deliverability_checker');

const CONFIG = store.loadConfig();
const CAMPAIGN = { id: 'camp_t', subject: 'Question pour {{entreprise}}', body: 'Bonjour {{prenom}},\nUn échange ?\nSi vous ne souhaitez plus recevoir de messages, répondez stop.', cta_label: 'Voir', target_url: 'https://example.com/page', track_clicks: true };
const CONTACT = { id: 'c1', email: 'jean@example.com', prenom: 'Jean', entreprise: 'ACME' };
const cfgWithUrl = (url) => ({ ...CONFIG, tracking: { ...CONFIG.tracking, vm_tracking_url: url } });

async function verifierAgainst(rcptCode) {
  const smtp = await startFakeSmtp(rcptCode);
  const v = new DeepEmailVerifier({ smtpPort: smtp.port });
  v.resolvePrimaryMx = async () => '127.0.0.1';
  return { v, close: () => smtp.server.close() };
}

function loadUiHelpers() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/ui_helpers.js'), 'utf-8'), ctx);
  return ctx.window.SniperUIHelpers;
}

module.exports = () => run('Moteur Outbound Sniper', [
  ['Config : défauts depuis config.example.json + secret de signature généré et persistant', () => {
    assert.strictEqual(CONFIG.port, 3500);
    assert.ok(CONFIG.tracking.secret.length >= 32);
    assert.strictEqual(store.loadConfig().tracking.secret, CONFIG.tracking.secret);
    assert.ok(DATA_DIR.includes('sniper-test-'), 'les tests ne doivent pas écrire dans data/');
  }],
  ['P0-3 : port 25 injoignable → UNVERIFIED (jamais VERIFIED)', async () => {
    const v = new DeepEmailVerifier({ smtpPort: 1 });
    v.resolvePrimaryMx = async () => '127.0.0.1';
    const r = await v.verify({ email: 'jean@example.com' });
    assert.strictEqual(r.status, 'UNVERIFIED');
  }],
  ['P0-3 : boîte acceptée + adresse aléatoire refusée → VERIFIED', async () => {
    const { v, close } = await verifierAgainst(a => (a.startsWith('jean@') ? 250 : 550));
    assert.strictEqual((await v.verify({ email: 'jean@example.com' })).status, 'VERIFIED');
    close();
  }],
  ['P0-3 : domaine catch-all → CATCH_ALL ; boîte refusée → INVALID_MAILBOX', async () => {
    const all = await verifierAgainst(() => 250);
    assert.strictEqual((await all.v.verify({ email: 'jean@example.com' })).status, 'CATCH_ALL');
    all.close();
    const none = await verifierAgainst(() => 550);
    assert.strictEqual((await none.v.verify({ email: 'jean@example.com' })).status, 'INVALID_MAILBOX');
    none.close();
  }],
  ['Sonde SMTP : un refus de politique (IP) n\'est pas lu comme « boîte inexistante »', async () => {
    const cases = [
      ['550 5.7.1 Client host [1.2.3.4] blocked using zen.spamhaus.org', 'UNVERIFIED'],
      ['550 Rejected', 'UNVERIFIED'],
      ['550 5.1.1 The email account that you tried to reach does not exist', 'INVALID_MAILBOX'],
      ['550 User unknown in local recipient table', 'INVALID_MAILBOX']
    ];
    for (const [reply, expected] of cases) {
      const { v, close } = await verifierAgainst(() => reply);
      assert.strictEqual((await v.verify({ email: 'jean@example.com' })).status, expected, reply);
      close();
    }
  }],
  ['Diagnostic DNS : panne = indéterminé sans pénalité ; secours sur 2e résolveur ; absence prouvée pénalisée', async () => {
    const fail = (code) => ({ resolveMx: async () => { throw Object.assign(new Error(code), { code }); }, resolveTxt: async () => { throw Object.assign(new Error(code), { code }); } });
    const ok = { resolveMx: async () => [{ exchange: 'aspmx.l.google.com', priority: 1 }], resolveTxt: async (n) => (n.startsWith('_dmarc') ? [['v=DMARC1; p=none']] : (n.startsWith('google._domainkey') ? [['v=DKIM1; p=abc']] : [['v=spf1 include:_spf.google.com ~all']])) };
    const down = await auditDomain('me@acme-test.fr', { resolvers: [fail('ETIMEOUT')] });
    assert.strictEqual(down.spf.exists, null);
    assert.strictEqual(down.dmarc.exists, null);
    assert.strictEqual(down.score, 100);
    assert.ok(down.issues.some(i => i.includes('indéterminé')));
    const fallback = await auditDomain('me@acme-test.fr', { resolvers: [fail('ETIMEOUT'), ok] });
    assert.ok(fallback.spf.exists && fallback.dmarc.exists && fallback.dkim.exists && fallback.mx.exists);
    const absent = await auditDomain('me@acme-test.fr', { resolvers: [fail('ENODATA')] });
    assert.strictEqual(absent.spf.exists, false);
    assert.ok(absent.score < 50);
  }],
  ['P0-3 : résolveur de patterns — aucune permutation « confirmée » sur un catch-all', async () => {
    const { v, close } = await verifierAgainst(() => 250);
    const r = await new EmailPatternResolver().resolveBestEmail({ prenom: 'Jean', nom: 'Dupont', email: 'x@example.com' }, v);
    assert.strictEqual(r.email, 'x@example.com');
    assert.ok(!r.pattern_resolved);
    close();
  }],
  ['P0-1 : envoi sans compte Google → échec fatal, jamais un faux succès', async () => {
    const r = await googleOAuth.sendGmailMessage({ to: 'a@example.com', subject: 's', html: 'h', text: 't' });
    assert.strictEqual(r.success, false);
    assert.strictEqual(r.fatal, true);
  }],
  ['P0-2 : la simulation ne consomme pas le quota ; le coupe-circuit arrête sur erreur fatale', async () => {
    const dm = new DispatchManager({ ...CONFIG, working_hours: { enabled: false } });
    dm.startCampaign('dry', { contacts: [CONTACT], sendFn: async () => ({ success: true }), isDryRun: true });
    await new Promise(r => setTimeout(r, 50));
    assert.strictEqual(dm.sentToday(), 0);
    dm.startCampaign('live', { contacts: [CONTACT, { ...CONTACT, id: 'c2' }], sendFn: async () => ({ success: false, fatal: true, error: 'quota' }), isDryRun: false });
    await new Promise(r => setTimeout(r, 50));
    assert.strictEqual(dm.getOverallStatus().campaigns_status.live.status, 'PAUSED_CIRCUIT_BREAKER');
  }],
  ['Quota : un envoi réel réussi est compté ; quota atteint → lancement refusé', async () => {
    const dm = new DispatchManager({ ...CONFIG, daily_send_limit: 1, working_hours: { enabled: false } });
    dm.state.global_sent_today = 0;
    dm.startCampaign('q', { contacts: [CONTACT], sendFn: async () => ({ success: true }), isDryRun: false });
    await new Promise(r => setTimeout(r, 50));
    assert.strictEqual(dm.sentToday(), 1);
    assert.strictEqual(dm.startCampaign('q2', { contacts: [CONTACT], sendFn: async () => ({ success: true }), isDryRun: false }).success, false);
  }],
  ['Composition : HTML échappé, lien de clic signé, cible falsifiée refusée', () => {
    const mail = composeEmail({ campaign: CAMPAIGN, contact: { ...CONTACT, prenom: '<img src=x>' }, config: cfgWithUrl('https://clics.example.com') });
    assert.ok(!mail.html.includes('<img'));
    assert.ok(mail.tracked && mail.link.startsWith('https://clics.example.com/t/click?'));
    const params = new URL(mail.link).searchParams;
    assert.strictEqual(verifyClick(params, CONFIG.tracking.secret).target, CAMPAIGN.target_url);
    params.set('target', 'https://evil.example');
    assert.strictEqual(verifyClick(params, CONFIG.tracking.secret), null);
  }],
  ['Composition : email de test sans tracking ; variable manquante détectée', () => {
    const mail = composeEmail({ campaign: CAMPAIGN, contact: { id: 'c9', email: 'a@b.fr' }, config: cfgWithUrl('https://clics.example.com'), trackLinks: false });
    assert.strictEqual(mail.link, CAMPAIGN.target_url);
    assert.deepStrictEqual(mail.unresolvedVars.sort(), ['entreprise', 'prenom']);
  }],
  ['P1-1 : le contrôle avant envoi lit le corps et bloque (opt-out, variable, tracking local)', () => {
    const ok = runPreFlightScan({ campaign: CAMPAIGN, contacts: [CONTACT], config: cfgWithUrl('https://clics.example.com'), senderEmail: 'me@example.com' });
    assert.strictEqual(ok.status, 'CLEARED', JSON.stringify(ok.issues));
    const bad = runPreFlightScan({ campaign: { ...CAMPAIGN, body: 'Bonjour {{prenom}} ?' }, contacts: [{ email: 'x@y.fr' }], config: cfgWithUrl('http://localhost:3500'), senderEmail: null });
    const codes = bad.issues.map(i => i.code);
    ['NO_SENDER', 'MISSING_OPT_OUT', 'ORPHAN_VARIABLES', 'TRACKING_URL'].forEach(c => assert.ok(codes.includes(c), c));
    assert.strictEqual(assessTrackingUrl('http://88.96.57.168:3000').level, 'WARNING');
  }],
  ['P0-4 / P1-3 : import CSV — guillemets respectés, aucune valeur inventée', () => {
    const h = loadUiHelpers();
    const res = h.parseCSVContent('Email;Prénom;Société\n"a@b.fr";;"Dupont, Fils & Cie"\n');
    assert.strictEqual(res.parsed.length, 1);
    assert.strictEqual(res.parsed[0].prenom, '');
    assert.strictEqual(res.parsed[0].entreprise, 'Dupont, Fils & Cie');
    assert.strictEqual(h.esc('<b>"x"</b>'), '&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
  }],
  ['MIME Gmail : parties base64 repliées à 76 caractères, List-Unsubscribe présent', () => {
    const raw = Buffer.from(googleOAuth.buildRawMime({ to: 'a@b.fr', subject: 'é', html: 'x'.repeat(500), text: 'y'.repeat(500), fromName: 'Moi', fromEmail: 'me@example.com' }), 'base64url').toString();
    assert.ok(raw.split('\r\n').every(l => l.length <= 998));
    assert.ok(raw.includes('List-Unsubscribe: <mailto:me@example.com?subject=stop>'));
    assert.ok(raw.split('\r\n').filter(l => /^[A-Za-z0-9+/=]{60,}$/.test(l)).every(l => l.length <= 76));
  }]
]);
