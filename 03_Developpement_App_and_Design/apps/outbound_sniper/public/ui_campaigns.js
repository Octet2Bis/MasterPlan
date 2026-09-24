/**
 * UI CAMPAIGNS — ACCUEIL, ÉDITEUR DE MESSAGE, SPINTAX, LINTER & APERÇU
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI
 */

function renderCampaignsHomeGrid(campaigns, onOpenCampaign, onNewCampaign) {
  const container = document.getElementById('campaigns-grid-container');
  const emptyState = document.getElementById('campaigns-empty-state');
  if (!container) return;
  if (!campaigns || campaigns.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    bindCreateButtons(onNewCampaign);
    return;
  }
  if (emptyState) emptyState.style.display = 'none';
  const e = window.SniperUIHelpers.esc;
  const cardsHTML = campaigns.map(c => `
    <div class="campaign-home-card" data-id="${e(c.id)}">
      <div class="card-top"><span class="tab-pill">${c.track_clicks ? '🖱️ Clics suivis' : 'Lien direct'}</span></div>
      <h3 class="card-title">${e(c.name)}</h3>
      <p class="card-subject"><strong>Objet :</strong> ${e(c.subject)}</p>
      <div class="card-footer"><span class="text-secondary" style="font-family:var(--font-mono); font-size:12.5px; font-weight:600;">📁 ${c.contacts_count || 0} contacts</span><button class="btn btn-primary btn-sm btn-open-camp" data-id="${e(c.id)}">Ouvrir</button></div>
    </div>`).join('');
  container.innerHTML = (emptyState ? emptyState.outerHTML.replace('style="display: flex"', 'style="display:none"').replace('style="display:flex"', 'style="display:none"') : '') + cardsHTML;
  if (document.getElementById('campaigns-empty-state')) document.getElementById('campaigns-empty-state').style.display = 'none';
  container.querySelectorAll('.btn-open-camp').forEach(btn => btn.onclick = (e) => { e.stopPropagation(); onOpenCampaign(btn.getAttribute('data-id')); });
  container.querySelectorAll('.campaign-home-card').forEach(card => card.onclick = () => onOpenCampaign(card.getAttribute('data-id')));
  bindCreateButtons(onNewCampaign);
}

function bindCreateButtons(onNewCampaign) {
  ['btn-create-campaign-empty', 'btn-create-campaign-home'].forEach(id => { const b = document.getElementById(id); if (b) b.onclick = onNewCampaign; });
}


function cleanVarName(v) {
  const map = { prenom: 'Prénom', pr_nom: 'Prénom', nom: 'Nom', entreprise: 'Entreprise', soci_t_: 'Entreprise', role: 'Rôle', roles: 'Rôle', civilite: 'Civilité', civilit_: 'Civilité', telephone: 'Téléphone' };
  const k = v.toLowerCase().replace(/_+/g, '_').trim();
  return map[k] || (k.length > 12 ? k.slice(0, 10) + '..' : k);
}

async function loadSpintaxPresets() {
  const sel = document.getElementById('select-spintax-preset');
  if (!sel) return;
  try {
    const res = await fetch('/api/spintax/presets');
    const presets = await res.json();
    sel.innerHTML = `<option value="">+ Insérer variation Spintax...</option>` +
      presets.map((p, i) => `<option value="${i}">🎲 ${window.SniperUIHelpers.esc(p.category)}</option>`).join('');
    sel.onchange = () => {
      const idx = sel.value;
      if (idx !== '' && presets[idx]) {
        insertTextIntoBody(presets[idx].syntax);
        sel.value = '';
      }
    };
  } catch {}
}

function renderDynamicVariableChips(contacts) {
  const container = document.getElementById('variables-toolbar-chips');
  if (!container) return;
  const standard = ['prenom', 'nom', 'entreprise', 'role'];
  const custom = new Set();
  const ignored = ['email', 'id', 'status', 'pr_nom', 'soci_t_', 'unnamed__13', 'roles', 'nom', 'prenom', 'entreprise'];
  (contacts || []).slice(0, 15).forEach(c => {
    if (c.custom_fields) Object.keys(c.custom_fields).forEach(k => {
      const lk = k.toLowerCase().replace(/_+/g, '_').replace(/^_|_$/g, '');
      if (!standard.includes(lk) && !ignored.includes(lk) && !lk.includes('linkedin') && !lk.includes('adresse') && !lk.includes('postal') && lk.length < 20) custom.add(lk);
    });
  });
  const e = window.SniperUIHelpers.esc;
  const chips = standard.map(v => `<button type="button" class="var-chip" data-var="{{${v}}}">+ ${cleanVarName(v)}</button>`);
  Array.from(custom).slice(0, 2).forEach(v => chips.push(`<button type="button" class="var-chip" data-var="{{${e(v)}}}">+ ${e(cleanVarName(v))}</button>`));
  chips.push(`<button type="button" class="var-chip" style="color:var(--accent-primary);" data-var="{{prenom|Bonjour}}">+ Fallback</button>`);
  container.innerHTML = chips.join('');
}

function insertTextIntoBody(textToInsert) {
  const el = document.getElementById('edit-campaign-body');
  if (!el || !textToInsert) return;
  const start = el.selectionStart || el.value.length;
  el.value = el.value.slice(0, start) + textToInsert + el.value.slice(start);
  el.focus();
  el.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
  el.dispatchEvent(new Event('input'));
}

function populateMessageEditor(campaign) {
  if (!campaign) return;
  const [s, b, l, u] = ['edit-campaign-subject', 'edit-campaign-body', 'edit-campaign-cta-label', 'edit-campaign-cta-url'].map(id => document.getElementById(id));
  if (s) s.value = campaign.subject || '';
  if (b) b.value = campaign.body || '';
  if (l) l.value = campaign.cta_label || '';
  if (u) u.value = campaign.target_url || '';
  const tc = document.getElementById('edit-campaign-track-clicks');
  if (tc) tc.checked = typeof campaign.track_clicks === 'boolean' ? campaign.track_clicks : campaign.stealth_mode === false;
  updateWordCount();
  updateDeliverabilityAudit();
  loadSpintaxPresets();
}

function updateWordCount() {
  const body = document.getElementById('edit-campaign-body')?.value || '';
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const counter = document.getElementById('body-word-counter');
  if (counter) {
    const timeSec = Math.round((words / 200) * 60);
    counter.textContent = `${words} mots · ~${timeSec}s ${words > 125 ? '(⚠️ Trop long)' : '(✅ Optimal)'}`;
    counter.style.color = words > 125 ? 'var(--accent-warning)' : 'var(--text-muted)';
  }
}

let auditDebounce = null;
async function updateDeliverabilityAudit() {
  clearTimeout(auditDebounce);
  auditDebounce = setTimeout(async () => {
    updateWordCount();
    const subject = document.getElementById('edit-campaign-subject')?.value || '';
    const body = document.getElementById('edit-campaign-body')?.value || '';
    const cta_label = document.getElementById('edit-campaign-cta-label')?.value || '';
    const target_url = document.getElementById('edit-campaign-cta-url')?.value || '';
    try {
      const res = await fetch('/api/campaign/audit-deliverability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, body, cta_label, target_url }) });
      const audit = await res.json();
      renderDeliverabilityWidget(audit);
      if (window.SniperUIScoreChecker) window.SniperUIScoreChecker.runFullAudit();
    } catch {}
  }, 250);
}

function renderDeliverabilityWidget(audit) {
  const badge = document.getElementById('deliverability-score-badge');
  const details = document.getElementById('deliverability-details');
  const tabPill = document.getElementById('tab-score-pill');
  if (!badge) return;
  const colorMap = { green: 'tab-pill-green', amber: 'tab-pill-amber', red: 'badge-invalid' };
  badge.className = `tab-pill ${colorMap[audit.badgeColor] || 'tab-pill-green'}`;
  badge.textContent = `Score contenu : ${audit.score}/100`;
  if (tabPill) { tabPill.className = `tab-pill ${colorMap[audit.badgeColor] || 'tab-pill-green'}`; tabPill.textContent = `${audit.score}/100`; }

  if (details) {
    if (audit.issues.length === 0) {
      details.innerHTML = `<span style="color:var(--accent-success); font-size:13px; font-weight:600;">✅ Opt-out présent, aucun terme à risque, liens en nombre raisonnable.</span>`;
    } else {
      const e = window.SniperUIHelpers.esc;
      details.innerHTML = audit.issues.map(iss => `<div style="font-size:13px; color:${iss.severity === 'HIGH' ? 'var(--accent-error-text)' : '#92400E'}; margin-top:2px;">⚠️ <strong>${e(iss.message)}</strong> ${e(iss.tip)}</div>`).join('');
    }
  }
}

function setupMessageEditorEvents(onSave, onLiveChange) {
  ['edit-campaign-subject', 'edit-campaign-body', 'edit-campaign-cta-label', 'edit-campaign-cta-url'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => { onLiveChange(); updateDeliverabilityAudit(); });
  });
  document.getElementById('edit-campaign-track-clicks')?.addEventListener('change', () => { onLiveChange(); updateDeliverabilityAudit(); });

  const container = document.getElementById('variables-toolbar-chips');
  if (container) {
    container.onclick = (e) => {
      const chip = e.target.closest('.var-chip');
      if (chip) insertTextIntoBody(chip.getAttribute('data-var'));
    };
  }

  document.getElementById('deliverability-score-badge')?.addEventListener('click', () => document.getElementById('tab-score-checker')?.click());
  document.getElementById('header-score-badge')?.addEventListener('click', () => document.getElementById('tab-score-checker')?.click());

  document.getElementById('btn-save-message')?.addEventListener('click', () => {
    onSave({
      subject: document.getElementById('edit-campaign-subject')?.value.trim(),
      body: document.getElementById('edit-campaign-body')?.value.trim(),
      cta_label: document.getElementById('edit-campaign-cta-label')?.value.trim(),
      target_url: document.getElementById('edit-campaign-cta-url')?.value.trim(),
      track_clicks: document.getElementById('edit-campaign-track-clicks')?.checked === true
    });
  });
}

function renderContactPicker(contacts, onSelect) {
  const select = document.getElementById('preview-contact-select');
  if (!select) return;
  if (!contacts || contacts.length === 0) { select.innerHTML = `<option value="">Aucun contact importé</option>`; return; }
  const e = window.SniperUIHelpers.esc;
  select.innerHTML = contacts.slice(0, 40).map((c, i) => `<option value="${i}">${e(c.prenom || '(sans prénom)')} ${e(c.nom)} — ${e(c.email)}</option>`).join('');
  select.onchange = (e) => onSelect(parseInt(e.target.value, 10));
}

function renderCampaignCardPreview(campaign, contact, sender) {
  if (!campaign) return;
  const s = contact || {};
  const h = window.SniperUIHelpers;
  const resSubj = h ? h.resolveFrontVariables(document.getElementById('edit-campaign-subject')?.value || campaign.subject, s) : { text: '' };
  const resBody = h ? h.resolveFrontVariables(document.getElementById('edit-campaign-body')?.value || campaign.body, s) : { text: '' };
  const [subjEl, bodyEl, senderEl, ctaBox, ctaBtn, pokaEl, bEl] = ['preview-subject', 'preview-body', 'preview-sender-meta', 'preview-cta-container', 'preview-cta-btn', 'preview-poka-warning', 'preview-stealth-badge'].map(id => document.getElementById(id));
  if (subjEl) subjEl.innerHTML = resSubj.text;
  if (bodyEl) bodyEl.innerHTML = resBody.text;
  if (senderEl) senderEl.textContent = sender?.email ? `${sender.name || ''} <${sender.email}>`.trim() : 'Compte Google non connecté';
  const tracked = document.getElementById('edit-campaign-track-clicks')?.checked === true;
  if (bEl) { bEl.className = tracked ? 'badge-status badge-disposable' : 'badge-status badge-verified'; bEl.textContent = tracked ? '🖱️ Clics suivis' : 'Lien direct'; }
  if (ctaBox && ctaBtn) {
    const l = document.getElementById('edit-campaign-cta-label')?.value || campaign.cta_label;
    ctaBox.style.display = l?.trim() ? 'block' : 'none';
    if (l?.trim()) { ctaBtn.innerHTML = h ? h.resolveFrontVariables(l, s).text : ''; ctaBtn.href = document.getElementById('edit-campaign-cta-url')?.value || campaign.target_url || '#'; }
  }
  if (pokaEl) {
    const unres = [...(resSubj.unresolved || []), ...(resBody.unresolved || [])];
    pokaEl.style.display = unres.length > 0 ? 'block' : 'none';
    const e = window.SniperUIHelpers.esc;
    if (unres.length > 0) pokaEl.innerHTML = `⚠️ <strong>Variable manquante pour ce contact :</strong> ${e(unres.join(', '))}. L'envoi sera bloqué ; écrivez <code>{{${e(unres[0])}|texte par défaut}}</code> ou complétez le fichier.`;
  }
}

function showHomeView() {
  document.getElementById('view-home').style.display = 'block';
  document.getElementById('view-workspace').style.display = 'none';
  document.getElementById('nav-breadcrumb-back').style.display = 'none';
}

function showWorkspaceView(name) {
  document.getElementById('view-home').style.display = 'none';
  document.getElementById('view-workspace').style.display = 'flex';
  const b = document.getElementById('nav-breadcrumb-back');
  if (b) { b.style.display = 'inline-flex'; document.getElementById('active-campaign-title').textContent = name || 'Campagne'; }
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      const tid = btn.getAttribute('data-target');
      document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
      document.getElementById(tid)?.classList.add('active');
      if (tid === 'panel-score-checker' && window.SniperUIScoreChecker) window.SniperUIScoreChecker.runFullAudit();
    };
  });
  document.getElementById('btn-back-home')?.addEventListener('click', showHomeView);
}

window.SniperUICampaigns = {
  renderCampaignsHomeGrid, renderDynamicVariableChips,
  renderCampaignCardPreview, populateMessageEditor, setupMessageEditorEvents,
  renderContactPicker, showHomeView, showWorkspaceView, setupTabs, updateDeliverabilityAudit,
  loadSpintaxPresets
};
