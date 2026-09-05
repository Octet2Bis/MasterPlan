/**
 * UI PERFORMANCE & ORACLE VM TRACKING COCKPIT (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI (< 200 lignes)
 * Gère la synchronisation 24/7 avec la passerelle VM Oracle (88.96.57.168) et les KPIs.
 */
(function() {
  async function pingVmGateway() {
    const statusEl = document.getElementById('vm-sync-status');
    const inputUrl = document.getElementById('vm-tracking-url');
    const targetUrl = inputUrl ? inputUrl.value.trim() : 'http://88.96.57.168:3000';
    if (!statusEl) return;

    statusEl.innerHTML = `⏳ Test de liaison vers la VM Oracle (${targetUrl})...`;
    try {
      const res = await fetch(`/api/tracking/ping-vm?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();
      if (data.success) {
        statusEl.innerHTML = `<span class="text-success" style="font-weight:700;">🟢 Passerelle VM Active (${data.ip || '88.96.57.168'}:3000)</span> — Prête à capter les ouvertures et clics 24/7.`;
      } else {
        statusEl.innerHTML = `<span class="text-error">⚠️ Passerelle VM non joignable</span> (${data.error || 'Erreur réseau'}).`;
      }
    } catch {
      statusEl.innerHTML = `<span class="text-error">⚠️ Échec du ping vers la passerelle VM</span>.`;
    }
  }

  async function syncVmEvents() {
    const btn = document.getElementById('btn-sync-vm');
    const statusEl = document.getElementById('vm-sync-status');
    if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Synchronisation...'; }

    try {
      const inputUrl = document.getElementById('vm-tracking-url');
      const vm_url = inputUrl ? inputUrl.value.trim() : 'http://88.96.57.168:3000';
      const res = await fetch('/api/tracking/sync-vm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vm_url })
      });
      const data = await res.json();

      if (data.success) {
        window.SniperUIContacts?.showToast(`✅ Synchronisé : +${data.addedCount} événement(s) depuis la VM !`, 'success');
        if (statusEl) statusEl.innerHTML = `<span class="text-success">✅ Synchronisé avec succès</span> — ${data.totalEvents} événement(s) archivé(s).`;
        renderPerformanceStats(data.store || {});
      } else {
        window.SniperUIContacts?.showToast(`❌ Échec synchro : ${data.error || 'VM inaccessible'}`, 'error');
      }
    } catch {
      window.SniperUIContacts?.showToast('❌ Erreur réseau lors de la synchro VM.', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg><span>Synchroniser VM</span>`;
      }
    }
  }

  async function loadAndRenderStats() {
    try {
      const res = await fetch('/api/stats');
      const stats = await res.json();
      renderPerformanceStats(stats);
    } catch {}
  }

  function renderPerformanceStats(stats) {
    const events = stats.events || [];
    const humanEvents = events.filter(e => !e.is_bot);
    const cid = window.SniperState?.selectedCampaignId;

    const campEvents = cid ? humanEvents.filter(e => e.campaign_id === cid) : humanEvents;
    const opens = new Set(campEvents.filter(e => e.type === 'OPEN').map(e => e.contact_id)).size;
    const clicks = new Set(campEvents.filter(e => e.type === 'CLICK').map(e => e.contact_id)).size;

    const statOpens = document.getElementById('stat-opens');
    const statClicks = document.getElementById('stat-clicks');
    const statCtr = document.getElementById('stat-ctr');
    const badgeCtr = document.getElementById('tab-stat-ctr');

    if (statOpens) statOpens.textContent = opens;
    if (statClicks) statClicks.textContent = clicks;

    const ctrVal = opens > 0 ? Math.round((clicks / opens) * 100) : 0;
    if (statCtr) statCtr.textContent = `${ctrVal}%`;
    if (badgeCtr) badgeCtr.textContent = `${ctrVal}% CTR`;

    renderEventsTable(events);
  }

  function renderEventsTable(events) {
    const tbody = document.getElementById('tracking-events-tbody');
    const countLabel = document.getElementById('events-count-label');
    if (!tbody) return;

    if (countLabel) countLabel.textContent = `${events.length} événement(s) total`;

    if (!events || events.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center; padding:24px;">Aucun événement capté pour le moment. Cliquez sur "Synchroniser VM".</td></tr>`;
      return;
    }

    const contactsMap = new Map((window.SniperState?.contacts || []).map(c => [c.id, c]));
    const reversed = [...events].reverse().slice(0, 30);

    tbody.innerHTML = reversed.map(ev => {
      const dateStr = new Date(ev.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const contact = contactsMap.get(ev.contact_id);
      const contactDisplay = contact ? `${contact.prenom || ''} ${contact.nom || ''} (${contact.email || ''})` : ev.contact_id;
      const typeBadge = ev.type === 'OPEN'
        ? `<span class="badge-status badge-verified">👁️ Ouverture</span>`
        : `<span class="badge-status" style="background:#E0E7FF; color:#3730A3; border:1px solid #C7D2FE;">🖱️ Clic</span>`;

      const botBadge = ev.is_bot
        ? `<span class="badge-status badge-disposable" title="Robot de sécurité ou pré-scanner">🤖 Bot Filtré</span>`
        : `<span class="badge-status badge-verified">✅ Humain Réel</span>`;

      const detail = ev.target_url ? `<a href="${ev.target_url}" target="_blank" class="text-secondary" style="font-size:11px;">${ev.target_url}</a>` : `<span class="text-muted" style="font-size:11px;">Pixel 1x1</span>`;

      return `
        <tr>
          <td style="font-family:var(--font-mono); font-size:11.5px;">${dateStr}</td>
          <td>${typeBadge}</td>
          <td><strong>${contactDisplay}</strong></td>
          <td>${botBadge}</td>
          <td>${detail}</td>
        </tr>
      `;
    }).join('');
  }

  function init() {
    document.getElementById('btn-sync-vm')?.addEventListener('click', syncVmEvents);
    document.getElementById('btn-refresh-stats')?.addEventListener('click', () => {
      loadAndRenderStats();
      pingVmGateway();
    });

    document.getElementById('tab-performance')?.addEventListener('click', () => {
      loadAndRenderStats();
      pingVmGateway();
    });

    // Auto-ping de la passerelle au chargement initial
    setTimeout(pingVmGateway, 800);
  }

  window.SniperUIPerformance = {
    init,
    syncVmEvents,
    loadAndRenderStats,
    pingVmGateway
  };
})();
