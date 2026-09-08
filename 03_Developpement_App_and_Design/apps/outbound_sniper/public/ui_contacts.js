/**
 * UI CONTACTS & IMPORTS — MODULE DÉDIÉ (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI (< 230 lignes)
 */

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('toast-fadeout'); setTimeout(() => toast.remove(), 250); }, 3500);
}

function getStatusBadgeClass(status) {
  if (status === 'SENT') return 'badge-sent';
  if (status === 'VERIFIED') return 'badge-verified';
  if (status === 'LOADING') return 'badge-loading';
  if (status === 'RISKY' || status === 'CATCH_ALL' || status === 'ROLE_ACCOUNT') return 'badge-disposable';
  if (status === 'DISPOSABLE') return 'badge-disposable';
  return 'badge-invalid';
}

function getStatusLabel(c) {
  if (c.status === 'SENT') {
    const timeStr = c.sent_at ? new Date(c.sent_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    return `✅ Expédié ${timeStr ? '(' + timeStr + ')' : ''}`;
  }
  if (c.status === 'LOADING') return 'Vérification...';
  if (c.status === 'VERIFIED') {
    const cloudTag = c.cloud_label ? ` ☁️ ${c.cloud_label}` : (c.is_m365 ? ' ☁️ M365' : '');
    return `Délivrable (${c.score || 98}%)${cloudTag}`;
  }
  if (c.status === 'ROLE_ACCOUNT') return '🏢 Rôle Générique (contact/info)';
  if (c.status === 'RISKY') return '🟠 Inconnu / Risque Rebond (Orange/Wanadoo)';
  if (c.status === 'CATCH_ALL') return `🟡 Catch-All (Risqué)${c.cloud_label ? ' ☁️ ' + c.cloud_label : ''}`;
  if (c.status === 'INVALID_MAILBOX') return '🔴 Boîte inexistante (550)';
  if (c.status === 'DISPOSABLE') return 'Domaine jetable';
  if (c.status === 'NO_MX') return 'Erreur DNS / MX';
  return c.reason || c.status || 'En attente';
}

let currentFilter = 'ALL';
let currentPage = 1;
const PAGE_SIZE = 8;

function setFilter(filterKey) {
  currentFilter = filterKey;
  currentPage = 1;
  renderContactsTable(window.SniperState?.contacts || []);
}

function changePage(delta) {
  currentPage += delta;
  renderContactsTable(window.SniperState?.contacts || []);
}

function renderPaginationBar(p) {
  const info = document.getElementById('pagination-info');
  const prev = document.getElementById('btn-prev-page');
  const next = document.getElementById('btn-next-page');
  const current = document.getElementById('pagination-current');
  if (info) info.textContent = p.totalCount > 0 ? `${p.startIdx}-${p.endIdx} sur ${p.totalCount}` : '0 contact';
  if (current) current.textContent = `${p.curPage} / ${p.totalPages}`;
  if (prev) prev.disabled = p.curPage <= 1;
  if (next) next.disabled = p.curPage >= p.totalPages;
}

function renderContactsTable(contacts) {
  const tbody = document.getElementById('contacts-tbody');
  const countEl = document.getElementById('contacts-count');
  const tabCountEl = document.getElementById('tab-count-contacts');
  const list = contacts || [];
  if (countEl) countEl.textContent = list.length;
  if (tabCountEl) tabCountEl.textContent = list.length;

  const h = window.SniperUIHelpers;
  const counts = h ? h.getContactsTriageCounts(list) : { all: list.length, deliverable: 0, risky: 0, invalid: 0 };
  const updatePill = (id, count) => { const el = document.getElementById(id); if (el) el.textContent = count; };
  updatePill('filter-count-all', counts.all);
  updatePill('filter-count-deliverable', counts.deliverable);
  updatePill('filter-count-risky', counts.risky);
  updatePill('filter-count-invalid', counts.invalid);

  document.querySelectorAll('.triage-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === currentFilter);
  });

  const fullDrop = document.getElementById('contacts-dropzone-full');
  const compactDrop = document.getElementById('contacts-dropzone-compact');
  if (fullDrop && compactDrop) {
    fullDrop.style.display = list.length === 0 ? 'block' : 'none';
    compactDrop.style.display = list.length > 0 ? 'flex' : 'none';
  }

  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:24px; color:var(--text-muted);">Aucun contact importé. Glissez un fichier CSV pour démarrer.</td></tr>`;
    renderPaginationBar({ totalPages: 1, curPage: 1, totalCount: 0, startIdx: 0, endIdx: 0 });
    return;
  }

  const filtered = h ? h.filterContacts(list, currentFilter) : list;
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:24px; color:var(--text-muted);">Aucun contact dans cette catégorie (${currentFilter}).</td></tr>`;
    renderPaginationBar({ totalPages: 1, curPage: 1, totalCount: 0, startIdx: 0, endIdx: 0 });
    return;
  }

  const p = h ? h.paginate(filtered, currentPage, PAGE_SIZE) : { items: filtered, totalPages: 1, curPage: 1, totalCount: filtered.length, startIdx: 1, endIdx: filtered.length };
  currentPage = p.curPage;
  renderPaginationBar(p);

  tbody.innerHTML = p.items.map(c => {
    const typoBtn = c.typo_suggestion ? `<button class="btn-typo-fix" onclick="window.SniperUIContacts.applyTypoFix('${c.id}')" title="Appliquer la correction">🪄 Corriger : ${c.email}</button>` : '';
    const patternBtn = (c.status === 'INVALID_MAILBOX' && !c.pattern_resolved) ? `<button class="btn-typo-fix" onclick="window.SniperUIContacts.autoResolvePattern('${c.id}')" title="Tester les patterns">🔍 Trouver</button>` : '';
    const patternTag = c.hunter_verified
      ? `<small style="display:block; font-size:12.5px; color:#6D28D9; font-weight:600;">🎯 Hunter.io (${c.score || 85}%)</small>`
      : (c.pattern_label ? `<small style="display:block; font-size:12.5px; color:#1E6091; font-weight:600;">🎯 Pattern : ${c.pattern_label}</small>` : '');
    const initials = `${(c.prenom || 'C')[0]}${(c.nom || '')[0] || ''}`.toUpperCase();

    return `
      <tr id="row-contact-${c.id}">
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="lemlist-avatar" style="width:28px; height:28px; font-size:12px;">${initials}</div>
            <div>
              <strong style="color:var(--text-primary); display:block; font-size:13.5px;">${c.prenom || ''} ${c.nom || ''}</strong>
              <small class="text-secondary" style="font-size:12.5px;">${c.role || '-'}</small>
            </div>
          </div>
        </td>
        <td><span style="font-size:13px;">${c.entreprise || '-'}</span></td>
        <td>
          <span style="font-family:var(--font-mono); font-size:13px; color:var(--accent-primary);">${c.email}</span>
          ${patternTag} ${typoBtn} ${patternBtn}
        </td>
        <td>
          <span class="badge-status ${getStatusBadgeClass(c.status)}" style="font-size:12.5px;">${getStatusLabel(c)}</span>
          ${c.security_gateway ? `<small class="text-secondary" style="display:block; font-size:12.5px; margin-top:2px;">🛡️ ${c.security_gateway}</small>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

function applyTypoFix(contactId) {
  const c = window.SniperState?.contacts?.find(x => x.id === contactId);
  if (!c) return;
  c.typo_suggestion = null; c.status = 'PENDING';
  renderContactsTable(window.SniperState.contacts);
  showToast(`🪄 Email corrigé pour ${c.prenom} ${c.nom}`, 'success');
  fetch(`/api/campaign/contacts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaign_id: window.SniperState.selectedCampaignId, contacts: window.SniperState.contacts }) });
}

async function autoResolvePattern(contactId) {
  const c = window.SniperState?.contacts?.find(x => x.id === contactId);
  if (!c) return;
  c.status = 'LOADING';
  renderContactsTable(window.SniperState.contacts);
  showToast(`🔍 Recherche pour ${c.prenom} ${c.nom}...`, 'info');
  try {
    const res = await (await fetch('/api/contacts/resolve-pattern', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact: c }) })).json();
    if (res.success && res.contact) {
      Object.assign(c, res.contact, { pattern_resolved: true });
      showToast(`🎯 Trouvé : ${res.contact.email}`, 'success');
    } else showToast(`❌ Aucun pattern détecté.`, 'error');
  } catch { showToast(`❌ Erreur pattern.`, 'error'); }
  renderContactsTable(window.SniperState.contacts);
  fetch(`/api/campaign/contacts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaign_id: window.SniperState.selectedCampaignId, contacts: window.SniperState.contacts }) });
}

async function clearCurrentContacts() {
  if (!window.SniperState?.selectedCampaignId) return;
  if (!window.SniperState.contacts || window.SniperState.contacts.length === 0) return showToast("La liste est déjà vide.", "info");
  if (!confirm("Voulez-vous supprimer les contacts actuels pour importer une nouvelle liste ?")) return;
  window.SniperState.contacts = [];
  renderContactsTable([]);
  await fetch('/api/campaign/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaign_id: window.SniperState.selectedCampaignId, contacts: [] }) });
  showToast("🗑️ Liste vidée. Vous pouvez déposer votre nouveau fichier CSV.", "success");
}

async function applyCleanListInPlace() {
  if (!window.SniperState?.selectedCampaignId) return;
  const initial = window.SniperState.contacts || [];
  if (initial.length === 0) return showToast("Aucun contact dans cette campagne.", "error");

  const clean = initial.filter(c => c.status === 'VERIFIED' && (c.score || 0) >= 80);
  if (clean.length === 0) return showToast("Aucun contact vérifié (score >= 80). Lancez d'abord la vérification.", "error");

  const removedCount = initial.length - clean.length;
  if (removedCount > 0) {
    if (!confirm(`Conserver uniquement les ${clean.length} contacts vérifiés pour cette campagne ? (${removedCount} contacts à risque ou rejetés seront retirés)`)) return;
  }

  window.SniperState.contacts = clean;
  renderContactsTable(clean);
  await fetch('/api/campaign/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaign_id: window.SniperState.selectedCampaignId, contacts: clean }) });
  showToast(`✨ Campagne mise à jour : ${clean.length} contacts sains conservés !`, "success");
}

function exportCleanCSV(campaignId, contacts) {
  const cleanList = (contacts || []).filter(c => c.status === 'VERIFIED' && (c.score || 0) >= 80);
  if (cleanList.length === 0) return showToast("Aucun contact 100% vérifié (Délivrable).", "error");
  downloadCSV(`${campaignId || 'campaign'}_clean_zero_bounce.csv`, cleanList);
  showToast(`📥 Exporté ${cleanList.length} contacts propres (Zero-Bounce)`, "success");
}

function showError(msg) {
  const banner = document.getElementById('error-banner');
  const msgEl = document.getElementById('error-message');
  if (msgEl) msgEl.textContent = msg;
  if (banner) banner.style.display = 'flex';
  showToast(msg, 'error');
}

function hideError() {
  const banner = document.getElementById('error-banner');
  if (banner) banner.style.display = 'none';
}

function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) return showToast('Aucun contact dans cette liste.', 'error');
  window.SniperUIHelpers.downloadCSV(filename, rows);
}

function parseCSVFiles(files, onParsed) {
  if (!files || files.length === 0) return;
  hideError();
  const reader = new FileReader();
  reader.onload = (e) => {
    const res = window.SniperUIHelpers.parseCSVContent(e.target.result, window.SniperState?.selectedCampaignId || 'camp_1');
    if (res.error) return showError(res.error);
    showToast(`📂 Importé ${res.parsed.length} contacts (${res.headers.length} colonnes)`, 'success');
    if (typeof onParsed === 'function') onParsed(res.parsed, res.headers);
  };
  reader.readAsText(files[0]);
}

window.SniperUIContacts = {
  renderContactsTable, setFilter, changePage,
  getStatusBadgeClass, getStatusLabel, showError, hideError, showToast,
  clearCurrentContacts, applyCleanListInPlace, downloadCSV, exportCleanCSV,
  applyTypoFix, autoResolvePattern, parseCSVFiles
};
