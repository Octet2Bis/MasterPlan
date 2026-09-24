/**
 * UI PERFORMANCES — CLICS DE LA CAMPAGNE & PASSERELLE PUBLIQUE
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI
 * Seuls les clics sont mesurés (pas d'ouvertures). Le filtre anti-bot par user-agent est indicatif.
 */
(function() {
  const $ = (id) => document.getElementById(id);
  const e = (v) => window.SniperUIHelpers.esc(v);
  const api = (path, body) => window.SniperUIHelpers.api(path, body);
  let lastStats = null;

  async function pingVmGateway() {
    const statusEl = $('vm-sync-status');
    const url = $('vm-tracking-url')?.value.trim();
    if (!statusEl) return;
    if (!url) { statusEl.textContent = 'Aucune passerelle configurée : le suivi des clics est impossible.'; return; }
    statusEl.textContent = `Test de liaison vers ${url}…`;
    try {
      const data = await api(`/api/tracking/ping-vm?url=${encodeURIComponent(url)}`);
      statusEl.innerHTML = data.success
        ? `<span class="text-success" style="font-weight:700;">🟢 Passerelle joignable</span> (${e(data.service || 'service inconnu')}).`
        : `<span class="text-error">⚠️ Passerelle non joignable</span> (${e(data.error || 'erreur réseau')}).`;
    } catch { statusEl.textContent = '⚠️ Échec du test de liaison.'; }
  }

  async function syncVmEvents() {
    const btn = $('btn-sync-vm');
    btn.disabled = true;
    try {
      const data = await api('/api/tracking/sync-vm', { vm_url: $('vm-tracking-url')?.value.trim() });
      if (data.success) window.SniperUIContacts.showToast(`✅ Synchronisé : ${data.addedCount} nouveau(x) clic(s).`, 'success');
      else window.SniperUIContacts.showToast(`❌ Synchronisation impossible : ${data.error || 'passerelle injoignable'}`, 'error');
      await loadAndRenderStats();
    } catch { window.SniperUIContacts.showToast('❌ Erreur réseau lors de la synchronisation.', 'error'); }
    btn.disabled = false;
  }

  async function loadAndRenderStats() {
    const cid = window.SniperState?.selectedCampaignId;
    if (!cid) return;
    try {
      lastStats = await api(`/api/stats?cid=${encodeURIComponent(cid)}`);
      renderPerformanceStats(lastStats);
    } catch {}
  }

  function renderPerformanceStats(stats) {
    const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
    set('stat-sent', stats.sent);
    set('stat-clicks', stats.unique_clickers);
    set('stat-ctr', `${stats.click_rate}%`);
    set('tab-stat-ctr', `${stats.unique_clickers} clic${stats.unique_clickers > 1 ? 's' : ''}`);
    renderEventsTable(stats.events || []);
  }

  function renderEventsTable(events) {
    const tbody = $('tracking-events-tbody');
    const label = $('events-count-label');
    if (label) label.textContent = `${events.length} clic(s) récent(s)`;
    if (events.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-muted" style="text-align:center; padding:24px;">Aucun clic pour le moment. Cliquez sur « Synchroniser ».</td></tr>';
      return;
    }
    const contacts = new Map((window.SniperState?.contacts || []).map(c => [c.id, c]));
    tbody.innerHTML = events.map(ev => {
      const c = contacts.get(ev.contact_id);
      const who = c ? `${c.prenom || ''} ${c.nom || ''} (${c.email})` : ev.contact_id;
      const date = new Date(ev.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      const bot = ev.is_bot ? '<span class="badge-status badge-disposable">🤖 Probable robot</span>' : '<span class="badge-status badge-verified">Probable humain</span>';
      return `<tr><td style="font-family:var(--font-mono); font-size:12.5px;">${e(date)}</td><td><strong>${e(who)}</strong></td><td>${bot}</td><td style="font-size:12.5px;">${e(ev.target_url)}</td></tr>`;
    }).join('');
  }

  function exportClickers() {
    const ids = new Set(lastStats?.clicker_ids || []);
    const rows = (window.SniperState?.contacts || []).filter(c => ids.has(c.id));
    window.SniperUIContacts.downloadCSV(`${window.SniperState?.selectedCampaignId}_cliqueurs.csv`, rows);
  }

  function init() {
    $('btn-sync-vm')?.addEventListener('click', syncVmEvents);
    $('btn-refresh-stats')?.addEventListener('click', () => { loadAndRenderStats(); pingVmGateway(); });
    $('tab-performance')?.addEventListener('click', () => { loadAndRenderStats(); pingVmGateway(); });
  }

  window.SniperUIPerformance = { init, syncVmEvents, loadAndRenderStats, pingVmGateway, exportClickers };
})();
