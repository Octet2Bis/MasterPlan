/**
 * SNIPER STUDIO — LOGIQUE APPLICATIVE & CONTRÔLEUR CENTRAL (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI (< 230 lignes)
 */
const state = {
  selectedCampaignId: 'camp_loss_aversion',
  selectedSenderId: 'snd_director',
  previewContactIndex: 0,
  campaigns: [],
  senders: [],
  contacts: [],
  stats: {},
  isVerifying: false
};

async function init() {
  window.SniperUICampaigns.setupTabs();
  if (window.SniperUIProfile) window.SniperUIProfile.init();
  window.SniperState = state;
  window.SniperAppReloadSenders = loadSenders;
  await Promise.all([loadSenders(), loadCampaigns(), loadStats(), loadConfig()]);
  setupEvents();
  setInterval(loadStats, 5000);
  setInterval(pollQueueStatus, 1500);
}

async function loadSenders() {
  try {
    const res = await fetch('/api/senders');
    state.senders = await res.json();
    if (state.senders.length > 0) state.selectedSenderId = state.senders[0].id;
    window.SniperUICampaigns.renderSenderSelector(state.senders, state.selectedSenderId, (id) => {
      state.selectedSenderId = id;
      refreshPreview();
      window.SniperUIScoreChecker?.runFullAudit();
    });
  } catch {}
}

async function loadCampaigns() {
  try {
    const res = await fetch('/api/campaigns');
    state.campaigns = await res.json();
    window.SniperUICampaigns.renderCampaignsHomeGrid(state.campaigns, openCampaign, createNewCampaign);
  } catch {}
}

async function openCampaign(cid) {
  state.selectedCampaignId = cid;
  state.previewContactIndex = 0;
  const camp = state.campaigns.find(c => c.id === cid);
  window.SniperUICampaigns.showWorkspaceView(camp?.name);
  window.SniperUICampaigns.populateMessageEditor(camp);
  await loadCampaignContacts(cid);
  window.SniperUICampaigns.renderDynamicVariableChips(state.contacts);
  window.SniperUICampaigns.renderContactPicker(state.contacts, (idx) => {
    state.previewContactIndex = idx;
    refreshPreview();
  });
  refreshPreview();
  window.SniperUIScoreChecker?.runFullAudit(cid);
}

async function createNewCampaign() {
  const name = prompt("Nom de la nouvelle campagne :", "Nouvelle Campagne QVT");
  if (!name?.trim()) return;
  const res = await (await fetch('/api/campaigns', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim(), subject: "Collaboration — {{entreprise}}", body: "Bonjour {{prenom}},\n\nSeriez-vous disponible pour un échange ?\n\nSi vous ne souhaitez plus recevoir de messages, répondez 'stop'.", cta_label: "En savoir plus", target_url: "https://aevum.app" })
  })).json();
  if (res.success) { await loadCampaigns(); openCampaign(res.campaign.id); }
}

async function loadCampaignContacts(cid) {
  try {
    const res = await fetch(`/api/campaign/contacts?cid=${cid}`);
    state.contacts = await res.json();
    window.SniperUIContacts.renderContactsTable(state.contacts);
  } catch { window.SniperUIContacts.showError("Erreur chargement contacts."); }
}

function refreshPreview() {
  const camp = state.campaigns.find(c => c.id === state.selectedCampaignId);
  const sender = state.senders.find(s => s.id === state.selectedSenderId);
  const contact = state.contacts[state.previewContactIndex || 0];
  window.SniperUICampaigns.renderCampaignCardPreview(camp, contact, sender);
  const pendingCount = (state.contacts || []).filter(c => c.status === 'VERIFIED').length;
  const etaEl = document.getElementById('dispatch-eta-banner');
  if (etaEl && window.SniperUICampaigns.calculateETA) etaEl.textContent = window.SniperUICampaigns.calculateETA(pendingCount);
}

async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    state.stats = await res.json();
    document.getElementById('stat-opens').textContent = state.stats.total_opens || 0;
    document.getElementById('stat-clicks').textContent = state.stats.total_clicks || 0;
    const ctrStr = `${state.stats.ctr_percent || 0}%`;
    document.getElementById('stat-ctr').textContent = ctrStr;
    document.getElementById('tab-stat-ctr').textContent = `${ctrStr} CTR`;
  } catch {}
}

async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    const cfg = await res.json();
    if (cfg.sender?.email) document.getElementById('smtp-email').value = cfg.sender.email;
    if (cfg.tracking?.vm_tracking_url) document.getElementById('vm-tracking-url').value = cfg.tracking.vm_tracking_url;
  } catch {}
}

async function pollQueueStatus() {
  try {
    const res = await fetch('/api/dispatch/status');
    const { global_sent_today, campaigns_status, logs } = await res.json();
    document.getElementById('header-quota').innerHTML = `Quota : <strong>${global_sent_today || 0} / 28</strong> (Max 30/j)`;
    const currentWorker = campaigns_status[state.selectedCampaignId];
    const isRunning = currentWorker?.isRunning;
    document.getElementById('btn-launch-dispatch').style.display = isRunning ? 'none' : 'inline-flex';
    document.getElementById('btn-stop-dispatch').style.display = isRunning ? 'inline-flex' : 'none';
    document.getElementById('countdown-row').style.display = (isRunning && currentWorker.next_dispatch_in_seconds > 0) ? 'flex' : 'none';
    if (isRunning) document.getElementById('countdown-display').textContent = `${currentWorker.next_dispatch_in_seconds}s`;
    const badge = document.getElementById('tab-status-badge');
    badge.textContent = isRunning ? `${currentWorker.mode} (${currentWorker.remaining_contacts})` : '28/j max';
    badge.className = isRunning ? 'tab-pill tab-pill-green' : 'tab-pill tab-pill-amber';
    if (Array.isArray(logs) && logs.length > 0) {
      document.getElementById('dispatch-log').innerHTML = logs.slice(0, 15).map(l => `[${l.timestamp}] ${l.message}`).join('<br>');
    }
  } catch {}
}

function setupEvents() {
  const [dropzone, fileInput] = ['dropzone', 'file-input'].map(id => document.getElementById(id));
  document.getElementById('btn-import-trigger').onclick = () => fileInput.click();
  document.getElementById('btn-error-action').onclick = () => { window.SniperUIContacts.hideError(); fileInput.click(); };
  dropzone.onclick = () => fileInput.click();
  ['dragenter', 'dragover'].forEach(e => dropzone.addEventListener(e, (ev) => { ev.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(e => dropzone.addEventListener(e, (ev) => { ev.preventDefault(); dropzone.classList.remove('dragover'); }));

  const onFiles = (files) => window.SniperUIContacts.parseCSVFiles(files, async (parsed) => {
    state.contacts = parsed;
    window.SniperUIContacts.renderContactsTable(parsed);
    window.SniperUICampaigns.renderDynamicVariableChips(parsed);
    window.SniperUICampaigns.renderContactPicker(parsed, (idx) => { state.previewContactIndex = idx; refreshPreview(); });
    refreshPreview();
    window.SniperUIScoreChecker?.runFullAudit();
    await fetch('/api/campaign/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaign_id: state.selectedCampaignId, contacts: parsed }) });
  });

  dropzone.addEventListener('drop', (e) => onFiles(e.dataTransfer.files));
  fileInput.addEventListener('change', (e) => onFiles(e.target.files));
  document.getElementById('btn-clear-contacts').onclick = () => window.SniperUIContacts.clearCurrentContacts();

  const btnVerify = document.getElementById('btn-verify');
  const btnVerifyText = document.getElementById('btn-verify-text');
  btnVerify.onclick = async () => {
    if (state.isVerifying || state.contacts.length === 0) {
      if (state.contacts.length === 0) window.SniperUIContacts.showToast("Importez d'abord une liste.", "error");
      return;
    }
    state.isVerifying = true;
    btnVerify.disabled = true;
    if (btnVerifyText) btnVerifyText.textContent = `Vérification (${state.contacts.length})...`;
    window.SniperUIContacts.showToast(`⚡ Analyse de délivrabilité en cours...`, 'info');
    state.contacts.forEach(c => { c.status = 'LOADING'; });
    window.SniperUIContacts.renderContactsTable(state.contacts);

    try {
      const res = await fetch('/api/campaign/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaign_id: state.selectedCampaignId }) });
      const data = await res.json();
      state.contacts = data.contacts || [];
      const validCount = state.contacts.filter(c => c.status === 'VERIFIED').length;
      window.SniperUIContacts.showToast(`✅ ${validCount}/${state.contacts.length} délivrables certifiés !`, 'success');
      window.SniperUIScoreChecker?.runFullAudit();
    } catch { window.SniperUIContacts.showToast(`❌ Erreur vérification.`, 'error'); }

    state.isVerifying = false;
    btnVerify.disabled = false;
    if (btnVerifyText) btnVerifyText.textContent = `Relancer le check`;
    window.SniperUIContacts.renderContactsTable(state.contacts);
  };

  // Édition de Message & Sauvegarde
  window.SniperUICampaigns.setupMessageEditorEvents(async (updatedFields) => {
    const camp = state.campaigns.find(c => c.id === state.selectedCampaignId) || {};
    const updated = { ...camp, ...updatedFields, id: state.selectedCampaignId };
    const res = await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
    const data = await res.json();
    if (data.success) {
      const idx = state.campaigns.findIndex(c => c.id === state.selectedCampaignId);
      if (idx >= 0) state.campaigns[idx] = data.campaign;
      window.SniperUIContacts.showToast("💾 Message enregistré avec succès !", "success");
      refreshPreview();
      window.SniperUIScoreChecker?.runFullAudit();
    }
  }, refreshPreview);

  document.getElementById('btn-test-smtp').onclick = async () => {
    const status = document.getElementById('smtp-status');
    status.textContent = 'Diagnostic SMTP...';
    const email = document.getElementById('smtp-email').value.trim(), pass = document.getElementById('smtp-pass').value.trim();
    const res = await (await fetch('/api/smtp/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pass }) })).json();
    status.textContent = res.message || (res.success ? 'Connexion SMTP réussie.' : 'Échec SMTP.');
    status.style.color = res.success ? 'var(--accent-success)' : 'var(--accent-error)';
  };

  const btnSendLive = document.getElementById('btn-send-live-test');
  if (btnSendLive) btnSendLive.onclick = async () => {
    const status = document.getElementById('smtp-status'), email = document.getElementById('smtp-email').value.trim(), pass = document.getElementById('smtp-pass').value.trim();
    const to = document.getElementById('smtp-target-test').value.trim() || email;
    if (!to) return alert("Veuillez saisir votre adresse email pour recevoir le test réel.");
    status.textContent = `Envoi vers ${to}...`;
    const res = await (await fetch('/api/send-test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pass, to, campaign_id: state.selectedCampaignId, sender_id: state.selectedSenderId }) })).json();
    status.textContent = res.success ? `✅ Email expédié à ${to} !` : `❌ Échec : ${res.error || 'Erreur'}`;
    status.style.color = res.success ? 'var(--accent-success)' : 'var(--accent-error)';
  };

  const btnSendPreview = document.getElementById('btn-send-preview-test');
  if (btnSendPreview) btnSendPreview.onclick = async () => {
    btnSendPreview.disabled = true; btnSendPreview.textContent = 'Envoi...';
    try {
      const d = await (await fetch('/api/send-test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaign_id: state.selectedCampaignId, sender_id: state.selectedSenderId }) })).json();
      window.SniperUIContacts.showToast(d.success ? `✅ Test envoyé à ${d.to || 'votre boîte'} !` : `❌ Échec : ${d.error || 'Erreur'}`, d.success ? 'success' : 'error');
    } catch { window.SniperUIContacts.showToast("❌ Erreur réseau lors du test.", 'error'); }
    finally { btnSendPreview.disabled = false; btnSendPreview.innerHTML = '📨 M\'envoyer un email de test'; }
  };

  document.getElementById('btn-launch-dispatch').onclick = () => fetch('/api/dispatch/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaign_id: state.selectedCampaignId, sender_id: state.selectedSenderId, dry_run: document.getElementById('toggle-dry-run').checked }) });
  document.getElementById('btn-stop-dispatch').onclick = () => fetch('/api/dispatch/stop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaign_id: state.selectedCampaignId }) });
  document.getElementById('btn-save-vm-url').onclick = async () => {
    const url = document.getElementById('vm-tracking-url').value.trim();
    await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tracking: { vm_tracking_url: url } }) });
    document.getElementById('vm-sync-status').textContent = `URL enregistrée : ${url}`;
  };
  document.getElementById('btn-refresh-stats').onclick = loadStats;

  [['btn-export-clean', () => window.SniperUIContacts.exportCleanCSV(state.selectedCampaignId, state.contacts)],
   ['btn-apply-clean', async () => { await window.SniperUIContacts.applyCleanListInPlace(); refreshPreview(); window.SniperUIScoreChecker?.runFullAudit(); }],
   ['btn-export-all', () => window.SniperUIContacts.downloadCSV(`${state.selectedCampaignId}_tous.csv`, state.contacts)],
   ['btn-export-opened', () => { const ids = new Set((state.stats.events || []).filter(e => e.type === 'OPEN' && e.campaign_id === state.selectedCampaignId).map(e => e.contact_id)); window.SniperUIContacts.downloadCSV(`${state.selectedCampaignId}_ouvreurs.csv`, state.contacts.filter(c => ids.has(c.id))); }],
   ['btn-export-clicked', () => { const ids = new Set((state.stats.events || []).filter(e => e.type === 'CLICK' && e.campaign_id === state.selectedCampaignId).map(e => e.contact_id)); window.SniperUIContacts.downloadCSV(`${state.selectedCampaignId}_hot_leads.csv`, state.contacts.filter(c => ids.has(c.id))); }]
  ].forEach(([id, fn]) => { const el = document.getElementById(id); if (el) el.onclick = fn; });
  window.SniperUIPerformance?.init();
}

window.addEventListener('DOMContentLoaded', init);
