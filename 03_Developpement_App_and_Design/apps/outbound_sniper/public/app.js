/**
 * SNIPER STUDIO — CONTRÔLEUR CENTRAL DE L'INTERFACE
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI
 */
const state = {
  selectedCampaignId: null,
  previewContactIndex: 0,
  campaigns: [],
  contacts: [],
  config: null,
  sender: null,
  isVerifying: false
};
const H = () => window.SniperUIHelpers;
const toast = (msg, type) => window.SniperUIContacts.showToast(msg, type);

async function init() {
  window.SniperState = state;
  window.SniperApp = { loadSenderAndConfig };
  window.SniperUICampaigns.setupTabs();
  window.SniperUIProfile?.init();
  await Promise.all([loadSenderAndConfig(), loadCampaigns()]);
  setupEvents();
  setInterval(pollQueueStatus, 1500);
}

/** Expéditeur = compte Google connecté ; nom et signature = profil. */
async function loadSenderAndConfig() {
  try {
    const [cfg, auth] = await Promise.all([H().api('/api/config'), H().api('/api/auth/google/status')]);
    state.config = cfg;
    state.sender = auth.connected ? { email: auth.user?.email, name: cfg.sender?.name || auth.user?.name || '' } : null;
    const hs = document.getElementById('header-sender');
    if (hs) { hs.textContent = state.sender ? `✉️ ${state.sender.email}` : 'Google non connecté'; hs.className = `tab-pill ${state.sender ? 'tab-pill-green' : 'tab-pill-amber'}`; }
    const ds = document.getElementById('dispatch-sender-status');
    if (ds) ds.textContent = state.sender ? `Envoi depuis ${state.sender.email} (API Gmail).` : 'Aucun compte Google connecté : ouvrez « Profil & connexions ». La simulation reste possible.';
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('cfg-delay', `${Math.round(cfg.min_delay_seconds / 60)} à ${Math.round(cfg.max_delay_seconds / 60)} min`);
    set('cfg-limit', `${cfg.daily_send_limit} emails / jour`);
    const wh = cfg.working_hours || {};
    set('cfg-hours', wh.enabled ? `${wh.start} – ${wh.end}, jours ${(wh.days || []).join(', ')} (1 = lundi)` : 'Aucune restriction');
    const vm = document.getElementById('vm-tracking-url');
    if (vm) vm.value = cfg.tracking?.vm_tracking_url || '';
    refreshPreview();
  } catch {}
}

async function loadCampaigns() {
  try {
    state.campaigns = await H().api('/api/campaigns');
    window.SniperUICampaigns.renderCampaignsHomeGrid(state.campaigns, openCampaign, createNewCampaign);
  } catch { toast('Erreur de chargement des campagnes.', 'error'); }
}

async function openCampaign(cid) {
  state.selectedCampaignId = cid;
  state.previewContactIndex = 0;
  const camp = state.campaigns.find(c => c.id === cid);
  window.SniperUICampaigns.showWorkspaceView(camp?.name);
  window.SniperUICampaigns.populateMessageEditor(camp);
  await loadCampaignContacts(cid);
  refreshContactViews();
  window.SniperUIScoreChecker?.runFullAudit(cid);
  window.SniperUIPerformance?.loadAndRenderStats();
}

async function createNewCampaign() {
  const name = prompt('Nom de la nouvelle campagne :');
  if (!name?.trim()) return;
  const res = await H().api('/api/campaigns', { name: name.trim(), subject: '', body: '', cta_label: '', target_url: '', track_clicks: false });
  if (res.success) { await loadCampaigns(); openCampaign(res.campaign.id); }
}

async function loadCampaignContacts(cid) {
  try {
    state.contacts = await H().api(`/api/campaign/contacts?cid=${encodeURIComponent(cid)}`);
    window.SniperUIContacts.renderContactsTable(state.contacts);
  } catch { window.SniperUIContacts.showError('Erreur de chargement des contacts.'); }
}

function refreshContactViews() {
  window.SniperUIContacts.renderContactsTable(state.contacts);
  window.SniperUICampaigns.renderDynamicVariableChips(state.contacts);
  window.SniperUICampaigns.renderContactPicker(state.contacts, (idx) => { state.previewContactIndex = idx; refreshPreview(); });
  refreshPreview();
}

function refreshPreview() {
  const camp = state.campaigns.find(c => c.id === state.selectedCampaignId);
  window.SniperUICampaigns.renderCampaignCardPreview(camp, state.contacts[state.previewContactIndex || 0], state.sender);
  const includeUnverified = document.getElementById('toggle-include-unverified')?.checked;
  const allowed = includeUnverified ? ['VERIFIED', 'UNVERIFIED', 'CATCH_ALL'] : ['VERIFIED'];
  const eligible = state.contacts.filter(c => allowed.includes(c.status)).length;
  const etaEl = document.getElementById('dispatch-eta-banner');
  if (etaEl) etaEl.textContent = H().calculateETA(eligible, state.config);
}

async function pollQueueStatus() {
  try {
    const { global_sent_today, daily_max, campaigns_status, logs } = await H().api('/api/dispatch/status');
    document.getElementById('header-quota').innerHTML = `Quota du jour : <strong>${global_sent_today} / ${daily_max}</strong>`;
    const w = campaigns_status[state.selectedCampaignId];
    const running = Boolean(w?.isRunning);
    document.getElementById('btn-launch-dispatch').style.display = running ? 'none' : 'inline-flex';
    document.getElementById('btn-stop-dispatch').style.display = running ? 'inline-flex' : 'none';
    document.getElementById('countdown-row').style.display = running && w.next_dispatch_in_seconds > 0 ? 'flex' : 'none';
    if (running) document.getElementById('countdown-display').textContent = `${w.next_dispatch_in_seconds}s`;
    const badge = document.getElementById('tab-status-badge');
    badge.textContent = running ? `${w.mode === 'DRY_RUN' ? 'Simulation' : 'Envoi'} (${w.remaining_contacts})` : `${global_sent_today}/${daily_max}`;
    badge.className = running ? 'tab-pill tab-pill-green' : 'tab-pill tab-pill-amber';
    const own = logs.filter(l => l.campaign_id === state.selectedCampaignId).slice(0, 15);
    if (own.length) document.getElementById('dispatch-log').textContent = own.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
  } catch {}
}

async function verifyContacts(btn) {
  if (state.isVerifying) return;
  if (state.contacts.length === 0) return toast("Importez d'abord une liste.", 'error');
  state.isVerifying = true;
  btn.disabled = true;
  const label = document.getElementById('btn-verify-text');
  label.textContent = `Vérification (${state.contacts.length})…`;
  const snapshot = state.contacts;
  state.contacts = snapshot.map(c => (c.status === 'SENT' ? c : { ...c, status: 'LOADING' }));
  window.SniperUIContacts.renderContactsTable(state.contacts);
  try {
    const useHunter = document.getElementById('toggle-use-hunter')?.checked === true;
    const data = await H().api('/api/campaign/verify', { campaign_id: state.selectedCampaignId, use_hunter: useHunter });
    state.contacts = data.contacts || snapshot;
    const n = (s) => state.contacts.filter(c => c.status === s).length;
    toast(`${n('VERIFIED')} vérifiée(s), ${n('UNVERIFIED') + n('CATCH_ALL')} non prouvée(s), ${state.contacts.length - n('VERIFIED') - n('UNVERIFIED') - n('CATCH_ALL') - n('SENT')} à écarter.`, 'success');
  } catch { state.contacts = snapshot; toast('❌ Erreur pendant la vérification.', 'error'); }
  state.isVerifying = false;
  btn.disabled = false;
  label.textContent = 'Relancer la vérification';
  refreshContactViews();
  window.SniperUIScoreChecker?.runFullAudit();
}

function setupEvents() {
  const [dropzone, fileInput] = ['dropzone', 'file-input'].map(id => document.getElementById(id));
  document.getElementById('btn-import-trigger').onclick = () => fileInput.click();
  document.getElementById('btn-error-action').onclick = () => { window.SniperUIContacts.hideError(); fileInput.click(); };
  dropzone.onclick = () => fileInput.click();
  ['dragenter', 'dragover'].forEach(e => dropzone.addEventListener(e, (ev) => { ev.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(e => dropzone.addEventListener(e, (ev) => { ev.preventDefault(); dropzone.classList.remove('dragover'); }));

  const onFiles = (files) => window.SniperUIContacts.parseCSVFiles(files, async (parsed) => {
    const sent = state.contacts.filter(c => c.status === 'SENT');
    if (sent.length && !confirm(`${sent.length} contact(s) déjà envoyé(s) seront conservés pour éviter tout doublon. Continuer ?`)) return;
    const sentEmails = new Set(sent.map(c => c.email));
    state.contacts = [...sent, ...parsed.filter(c => !sentEmails.has(c.email))];
    refreshContactViews();
    await H().api('/api/campaign/contacts', { campaign_id: state.selectedCampaignId, contacts: state.contacts });
    window.SniperUIScoreChecker?.runFullAudit();
  });
  dropzone.addEventListener('drop', (e) => onFiles(e.dataTransfer.files));
  fileInput.addEventListener('change', (e) => { onFiles(e.target.files); e.target.value = ''; });
  document.getElementById('btn-clear-contacts').onclick = () => window.SniperUIContacts.clearCurrentContacts();
  const btnVerify = document.getElementById('btn-verify');
  btnVerify.onclick = () => verifyContacts(btnVerify);

  window.SniperUICampaigns.setupMessageEditorEvents(async (fields) => {
    const data = await H().api('/api/campaigns', { ...fields, id: state.selectedCampaignId });
    if (!data.success) return toast('❌ Enregistrement impossible.', 'error');
    const idx = state.campaigns.findIndex(c => c.id === state.selectedCampaignId);
    if (idx >= 0) state.campaigns[idx] = data.campaign;
    toast('💾 Message enregistré.', 'success');
    refreshPreview();
    window.SniperUIScoreChecker?.runFullAudit();
  }, refreshPreview);

  const btnSendPreview = document.getElementById('btn-send-preview-test');
  btnSendPreview.onclick = async () => {
    btnSendPreview.disabled = true;
    try {
      const d = await H().api('/api/send-test', { campaign_id: state.selectedCampaignId, contact_index: state.previewContactIndex, campaign: window.SniperUIScoreChecker.editorCampaign() });
      toast(d.success ? `✅ Test envoyé à ${d.to}.` : `❌ ${d.error || 'Échec'}`, d.success ? 'success' : 'error');
    } catch { toast('❌ Erreur réseau lors du test.', 'error'); }
    btnSendPreview.disabled = false;
  };

  document.getElementById('toggle-include-unverified').onchange = refreshPreview;
  document.getElementById('btn-launch-dispatch').onclick = async () => {
    const dryRun = document.getElementById('toggle-dry-run').checked;
    if (!dryRun && !confirm('Lancer un envoi RÉEL depuis votre compte Google ?')) return;
    const r = await H().api('/api/dispatch/start', { campaign_id: state.selectedCampaignId, dry_run: dryRun, include_unverified: document.getElementById('toggle-include-unverified').checked });
    if (!r.success) toast(r.error || 'Lancement refusé.', 'error');
  };
  document.getElementById('btn-stop-dispatch').onclick = () => H().api('/api/dispatch/stop', { campaign_id: state.selectedCampaignId });
  document.getElementById('btn-save-vm-url').onclick = async () => {
    const url = document.getElementById('vm-tracking-url').value.trim();
    await H().api('/api/config', { tracking: { vm_tracking_url: url } });
    document.getElementById('vm-sync-status').textContent = `URL enregistrée : ${url || '(aucune)'}`;
    await loadSenderAndConfig();
    window.SniperUIPerformance?.pingVmGateway();
  };

  [['btn-export-clean', () => window.SniperUIContacts.exportCleanCSV(state.selectedCampaignId, state.contacts)],
   ['btn-apply-clean', async () => { await window.SniperUIContacts.applyCleanListInPlace(); refreshContactViews(); window.SniperUIScoreChecker?.runFullAudit(); }],
   ['btn-export-all', () => window.SniperUIContacts.downloadCSV(`${state.selectedCampaignId}_tous.csv`, state.contacts)],
   ['btn-export-clicked', () => window.SniperUIPerformance?.exportClickers()]
  ].forEach(([id, fn]) => { const el = document.getElementById(id); if (el) el.onclick = fn; });
  window.SniperUIPerformance?.init();
}

window.addEventListener('DOMContentLoaded', init);
