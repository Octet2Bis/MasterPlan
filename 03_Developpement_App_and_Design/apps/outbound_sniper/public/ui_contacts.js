/**
 * UI CONTACTS & IMPORTS
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI
 */
const esc = (v) => window.SniperUIHelpers.esc(v);
const saveContacts = () => window.SniperUIHelpers.api('/api/campaign/contacts', { campaign_id: window.SniperState.selectedCampaignId, contacts: window.SniperState.contacts });

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const span = document.createElement('span');
  span.textContent = msg;
  toast.appendChild(span);
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('toast-fadeout'); setTimeout(() => toast.remove(), 250); }, 3500);
}

const STATUS_VIEW = {
  SENT: ['badge-sent', '✅ Envoyé'],
  VERIFIED: ['badge-verified', '🟢 Vérifiée'],
  LOADING: ['badge-loading', 'Vérification…'],
  UNVERIFIED: ['badge-loading', '⚪ Non prouvée'],
  CATCH_ALL: ['badge-disposable', '🟡 Catch-all'],
  ROLE_ACCOUNT: ['badge-disposable', '🏢 Adresse générique'],
  RISKY: ['badge-disposable', '🟠 Risquée'],
  INVALID_MAILBOX: ['badge-invalid', '🔴 Boîte inexistante'],
  DISPOSABLE: ['badge-invalid', '🔴 Jetable'],
  NO_MX: ['badge-invalid', '🔴 Domaine sans MX'],
  INVALID: ['badge-invalid', '🔴 Syntaxe invalide'],
  PENDING: ['badge-loading', 'À vérifier']
};

function getStatusBadgeClass(status) { return (STATUS_VIEW[status] || STATUS_VIEW.PENDING)[0]; }

function getStatusLabel(c) {
  const label = (STATUS_VIEW[c.status] || STATUS_VIEW.PENDING)[1];
  if (c.status === 'SENT' && c.sent_at) return `${label} (${new Date(c.sent_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })})`;
  return c.cloud_label && c.status !== 'PENDING' ? `${label} · ${c.cloud_label}` : label;
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
  updatePill('filter-count-unverified', counts.unverified);
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
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:24px; color:var(--text-muted);">Aucun contact dans cette catégorie.</td></tr>`;
    renderPaginationBar({ totalPages: 1, curPage: 1, totalCount: 0, startIdx: 0, endIdx: 0 });
    return;
  }

  const p = h ? h.paginate(filtered, currentPage, PAGE_SIZE) : { items: filtered, totalPages: 1, curPage: 1, totalCount: filtered.length, startIdx: 1, endIdx: filtered.length };
  currentPage = p.curPage;
  renderPaginationBar(p);

  tbody.innerHTML = p.items.map(c => {
    const id = esc(c.id);
    const typoBtn = c.typo_suggestion ? `<button class="btn-typo-fix" onclick="window.SniperUIContacts.applyTypoFix('${id}')" title="Faute de frappe corrigée automatiquement : revérifier">🪄 Domaine corrigé, revérifier</button>` : '';
    const patternBtn = (c.status === 'INVALID_MAILBOX' && !c.pattern_resolved && c.prenom) ? `<button class="btn-typo-fix" onclick="window.SniperUIContacts.autoResolvePattern('${id}')" title="Tester les formats prenom.nom, pnom…">🔍 Trouver l'adresse</button>` : '';
    const source = c.pattern_label ? `<small style="display:block; font-size:12.5px; color:#1E6091; font-weight:600;">🎯 ${esc(c.pattern_label)}</small>` : '';
    const initials = esc(`${(c.prenom || c.email || '?')[0]}${(c.nom || '')[0] || ''}`.toUpperCase());
    return `
      <tr id="row-contact-${id}">
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="lemlist-avatar" style="width:28px; height:28px; font-size:12px;">${initials}</div>
            <div>
              <strong style="color:var(--text-primary); display:block; font-size:13.5px;">${esc(c.prenom)} ${esc(c.nom)}</strong>
              <small class="text-secondary" style="font-size:12.5px;">${esc(c.role) || '-'}</small>
            </div>
          </div>
        </td>
        <td><span style="font-size:13px;">${esc(c.entreprise) || '-'}</span></td>
        <td>
          <span style="font-family:var(--font-mono); font-size:13px; color:var(--accent-primary);">${esc(c.email)}</span>
          ${source} ${typoBtn} ${patternBtn}
        </td>
        <td>
          <span class="badge-status ${getStatusBadgeClass(c.status)}" style="font-size:12.5px;" title="${esc(c.reason)}">${esc(getStatusLabel(c))}</span>
          ${c.security_gateway ? `<small class="text-secondary" style="display:block; font-size:12.5px; margin-top:2px;" title="${esc(c.security_tip)}">🛡️ ${esc(c.security_gateway)}</small>` : ''}
        </td>
      </tr>`;
  }).join('');
}

function applyTypoFix(contactId) {
  const c = window.SniperState?.contacts?.find(x => x.id === contactId);
  if (!c) return;
  c.typo_suggestion = null; c.status = 'PENDING';
  renderContactsTable(window.SniperState.contacts);
  showToast(`Adresse ${c.email} à revérifier.`, 'info');
  saveContacts();
}

async function autoResolvePattern(contactId) {
  const c = window.SniperState?.contacts?.find(x => x.id === contactId);
  if (!c) return;
  c.status = 'LOADING';
  renderContactsTable(window.SniperState.contacts);
  const previous = { ...c };
  showToast(`🔍 Recherche pour ${c.prenom} ${c.nom}…`, 'info');
  try {
    const res = await window.SniperUIHelpers.api('/api/contacts/resolve-pattern', { contact: previous });
    Object.assign(c, previous, res.contact || {}, { pattern_resolved: true });
    showToast(c.status === 'VERIFIED' ? `🎯 Adresse prouvée : ${c.email}` : `Aucune adresse prouvée. ${c.reason || ''}`, c.status === 'VERIFIED' ? 'success' : 'error');
  } catch { Object.assign(c, previous); showToast('❌ Erreur lors de la recherche.', 'error'); }
  renderContactsTable(window.SniperState.contacts);
  saveContacts();
}

async function clearCurrentContacts() {
  if (!window.SniperState?.selectedCampaignId) return;
  if (!window.SniperState.contacts || window.SniperState.contacts.length === 0) return showToast("La liste est déjà vide.", "info");
  if (!confirm("Voulez-vous supprimer les contacts actuels pour importer une nouvelle liste ?")) return;
  window.SniperState.contacts = [];
  renderContactsTable([]);
  await saveContacts();
  showToast("🗑️ Liste vidée. Vous pouvez déposer un nouveau fichier CSV.", "success");
}

async function applyCleanListInPlace() {
  if (!window.SniperState?.selectedCampaignId) return;
  const initial = window.SniperState.contacts || [];
  if (initial.length === 0) return showToast("Aucun contact dans cette campagne.", "error");

  const clean = initial.filter(c => c.status === 'VERIFIED' || c.status === 'SENT');
  if (clean.length === 0) return showToast("Aucune adresse vérifiée. Lancez d'abord la vérification.", "error");

  const removedCount = initial.length - clean.length;
  if (removedCount > 0) {
    if (!confirm(`Conserver uniquement les ${clean.length} contacts vérifiés pour cette campagne ? (${removedCount} contacts à risque ou rejetés seront retirés)`)) return;
  }

  window.SniperState.contacts = clean;
  renderContactsTable(clean);
  await saveContacts();
  showToast(`✨ ${clean.length} contact(s) vérifié(s) conservé(s).`, "success");
}

function exportCleanCSV(campaignId, contacts) {
  const cleanList = (contacts || []).filter(c => c.status === 'VERIFIED');
  if (cleanList.length === 0) return showToast("Aucune adresse vérifiée à exporter.", "error");
  downloadCSV(`${campaignId || 'campaign'}_verifiees.csv`, cleanList);
  showToast(`📥 ${cleanList.length} adresse(s) vérifiée(s) exportée(s).`, "success");
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
    const res = window.SniperUIHelpers.parseCSVContent(e.target.result);
    if (res.error) return showError(res.error);
    showToast(`📂 Importé ${res.parsed.length} contacts (${res.headers.length} colonnes)`, 'success');
    if (typeof onParsed === 'function') onParsed(res.parsed, res.headers);
  };
  if (!/\.csv$/i.test(files[0].name)) return showError('Format non pris en charge : exportez votre fichier en CSV (UTF-8).');
  reader.readAsText(files[0], 'utf-8');
}

window.SniperUIContacts = {
  renderContactsTable, setFilter, changePage,
  getStatusBadgeClass, getStatusLabel, showError, hideError, showToast,
  clearCurrentContacts, applyCleanListInPlace, downloadCSV, exportCleanCSV,
  applyTypoFix, autoResolvePattern, parseCSVFiles
};
