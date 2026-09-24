/**
 * UI SCORE CHECKER — DIAGNOSTIC DE DÉLIVRABILITÉ, CONTRÔLE AVANT ENVOI & TEST MAIL-TESTER
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI
 * N'affiche que des contrôles réels ; aucun placement en boîte n'est prédit.
 */
(function() {
  const e = (v) => window.SniperUIHelpers.esc(v);
  const pill = (ok) => (ok ? 'tab-pill-green' : 'tab-pill-amber');
  const row = (label, value, ok) => `<div class="pill-row"><span>${label}</span><span class="${ok === undefined ? '' : (ok ? 'text-success' : 'text-error')}">${value}</span></div>`;

  /** Contrôle DNS à trois états : présent, absent, indéterminé (panne DNS, sans pénalité). */
  const dnsCell = (domain, rec, okText, koText) => (!domain ? '—' : (rec?.exists === null ? '⚪ Indéterminé (erreur DNS)' : (rec?.exists ? okText : koText)));
  const dnsOk = (rec) => (rec?.exists === null || rec?.exists === undefined ? undefined : rec.exists);

  /** Contenu courant de l'éditeur (éventuellement non enregistré). */
  function editorCampaign() {
    const v = (id) => document.getElementById(id)?.value || '';
    return { subject: v('edit-campaign-subject'), body: v('edit-campaign-body'), cta_label: v('edit-campaign-cta-label'), target_url: v('edit-campaign-cta-url'), track_clicks: document.getElementById('edit-campaign-track-clicks')?.checked === true };
  }

  async function runFullAudit(campaignId) {
    const cid = campaignId || window.SniperState?.selectedCampaignId;
    if (!cid) return null;
    try {
      const audit = await window.SniperUIHelpers.api('/api/deliverability/full-audit', { campaign_id: cid, campaign: editorCampaign() });
      renderScoreCockpit(audit);
      updateHeaderScoreBadge(audit);
      return audit;
    } catch { return null; }
  }

  function updateHeaderScoreBadge(audit) {
    const badge = document.getElementById('header-score-badge');
    if (!badge || !audit) return;
    badge.className = `tab-pill ${audit.badgeColor === 'green' ? 'tab-pill-green' : (audit.badgeColor === 'amber' ? 'tab-pill-amber' : 'badge-invalid')}`;
    badge.innerHTML = `🛡️ Indice : <strong>${audit.globalScore}/100</strong>`;
    badge.style.display = 'inline-flex';
  }

  function renderScoreCockpit(audit) {
    const container = document.getElementById('score-checker-container');
    if (!container || !audit?.pillars) return;
    const { globalScore, status, badgeColor, verdict, pillars, actionableRemedies } = audit;
    const d = pillars.domain.details;
    const copy = pillars.copy.details;
    const sa = pillars.spamassassin;
    const links = pillars.links;
    const aud = pillars.audience;
    const colorVar = badgeColor === 'green' ? 'var(--accent-success)' : (badgeColor === 'amber' ? 'var(--accent-warning)' : 'var(--accent-error)');
    const saValue = !sa.available ? `⚪ Indisponible (${e(sa.error)})` : (sa.isPassing ? `✅ ${sa.score} (seuil 2,5)` : `⚠️ ${sa.score} (seuil 2,5)`);

    container.innerHTML = `
      <div class="score-hero-card">
        <div class="score-gauge-box">
          <div class="score-circle" style="border-color:${colorVar};">
            <span class="score-number" style="color:${colorVar};">${globalScore}</span><span class="score-max">/100</span>
          </div>
          <div class="score-verdict-content">
            <div style="display:flex; align-items:center; gap:8px;"><span class="tab-pill ${pill(badgeColor === 'green')}">${status}</span><strong style="font-size:14px;">Indice indicatif</strong></div>
            <p style="font-size:12.5px; color:var(--text-secondary); margin-top:4px;">${e(verdict)}</p>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-retest-deliverability" style="align-self:flex-start;">⚡ Re-tester</button>
      </div>

      ${actionableRemedies?.length ? `<div class="callout-notice" style="flex-direction:column; align-items:flex-start;">${actionableRemedies.map(r => `<div>➜ ${e(r.label)}</div>`).join('')}</div>` : ''}

      <div class="callout-notice" style="justify-content:space-between; flex-wrap:wrap;">
        <div><strong>Contrôle avant envoi</strong><span class="text-secondary" style="font-size:12.5px; display:block;">Rejoué automatiquement au lancement : un point bloquant empêche l'envoi.</span></div>
        <button class="btn btn-primary btn-sm" id="btn-run-preflight">Lancer le contrôle</button>
      </div>
      <div id="preflight-results-box" style="display:none; padding:10px 14px; border-radius:var(--radius-sm); font-size:13px;"></div>

      <div class="pillars-bento-grid">
        <div class="pillar-card">
          <div class="pillar-header"><span>🌐 <strong>Domaine d'envoi</strong></span><span class="tab-pill ${pill(pillars.domain.score >= 80)}">${pillars.domain.score}/100</span></div>
          <div class="pillar-body">
            ${row('Domaine :', e(d.domain || 'Google non connecté'))}
            ${row('SPF :', dnsCell(d.domain, d.spf, `✅ ${e(d.spf?.policy)}`, '❌ Absent'), dnsOk(d.spf))}
            ${row('DKIM (google) :', d.domain && !d.dkim?.checked ? 'Géré par le fournisseur' : dnsCell(d.domain, d.dkim, '✅ Présent', '❌ Introuvable'), d.dkim?.checked ? dnsOk(d.dkim) : undefined)}
            ${row('DMARC :', dnsCell(d.domain, d.dmarc, `✅ p=${e(d.dmarc?.policy)}`, '❌ Absent'), dnsOk(d.dmarc))}
          </div>
        </div>
        <div class="pillar-card">
          <div class="pillar-header"><span>✍️ <strong>Contenu</strong></span><span class="tab-pill ${pill(pillars.copy.score >= 80)}">${pillars.copy.score}/100</span></div>
          <div class="pillar-body">
            ${row('Opt-out :', copy.hasOptOut ? '✅ Présent' : '❌ Absent (bloquant)', copy.hasOptOut)}
            ${row('Termes à risque :', copy.detectedSpamWords.length === 0 ? '✅ Aucun' : `⚠️ ${e(copy.detectedSpamWords.join(', '))}`, copy.detectedSpamWords.length === 0)}
            ${row('Longueur :', `${copy.wordCount} mots`)}
          </div>
        </div>
        <div class="pillar-card">
          <div class="pillar-header"><span>🧪 <strong>SpamAssassin & liens</strong></span></div>
          <div class="pillar-body">
            ${row('SpamAssassin (Postmark) :', saValue, sa.available ? sa.isPassing : undefined)}
            ${row('Liens :', links.total === 0 ? 'Aucun lien' : (links.brokenCount > 0 ? `❌ ${links.brokenCount} inaccessible(s)` : `✅ ${links.okCount} accessible(s)`), links.total === 0 ? undefined : links.brokenCount === 0)}
            ${row('Raccourcisseur :', links.hasShorteners ? '❌ Détecté' : '✅ Aucun', !links.hasShorteners)}
          </div>
        </div>
        <div class="pillar-card">
          <div class="pillar-header"><span>👥 <strong>Audience (non envoyée)</strong></span><span class="tab-pill ${pill(aud.score >= 80)}">${aud.score}/100</span></div>
          <div class="pillar-body">
            ${row('Vérifiées :', `${aud.verified} / ${aud.total}`, aud.total > 0 && aud.verified === aud.total)}
            ${row('Non prouvées :', String(aud.unverified), aud.unverified === 0)}
            ${row('Invalides :', String(aud.invalid), aud.invalid === 0)}
          </div>
        </div>
      </div>

      <div class="smtp-box">
        <div class="smtp-header">
          <div class="smtp-title"><span>📬 Test réel de placement (Mail-Tester.com)</span></div>
          <a href="https://www.mail-tester.com" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" style="text-decoration:none;">Ouvrir mail-tester.com ↗</a>
        </div>
        <div class="smtp-inputs-row">
          <input type="email" id="mailtester-email-input" placeholder="ex: test-xxxx@srv1.mail-tester.com" class="input-text" />
          <button class="btn btn-action btn-sm" id="btn-send-mailtester" style="white-space:nowrap;">🚀 Envoyer le test</button>
        </div>
        <div id="mailtester-status-msg" style="font-size:13px; display:none;"></div>
      </div>`;

    document.getElementById('btn-retest-deliverability')?.addEventListener('click', () => runFullAudit());
    document.getElementById('btn-run-preflight')?.addEventListener('click', runPreFlight);
    bindMailTesterAction();
  }

  async function runPreFlight() {
    const btn = document.getElementById('btn-run-preflight');
    const box = document.getElementById('preflight-results-box');
    btn.disabled = true;
    try {
      const data = await window.SniperUIHelpers.api('/api/campaign/preflight', {
        campaign_id: window.SniperState?.selectedCampaignId, campaign: editorCampaign(),
        include_unverified: document.getElementById('toggle-include-unverified')?.checked === true
      });
      const styles = { CLEARED: ['#ECFDF5', '#10B981', '#065F46', '✅ Prêt à envoyer'], WARNING: ['#FEF3C7', '#F59E0B', '#92400E', '⚠️ Envoi possible, points d\'attention'], BLOCKED: ['#FEF2F2', '#EF4444', '#991B1B', '❌ Envoi bloqué'] }[data.status];
      const items = [...data.issues, ...data.warnings].map(i => `<li>${e(i.message)}</li>`).join('');
      box.style.cssText = `display:block; padding:10px 14px; border-radius:var(--radius-sm); font-size:13px; background:${styles[0]}; border:1px solid ${styles[1]}; color:${styles[2]};`;
      box.innerHTML = `<strong>${styles[3]}</strong> — ${data.contactsCount} contact(s) éligible(s).${items ? `<ul style="margin:6px 0 0 16px;">${items}</ul>` : ''}`;
    } catch {
      box.style.display = 'block';
      box.textContent = 'Erreur lors du contrôle.';
    } finally { btn.disabled = false; }
  }

  function bindMailTesterAction() {
    const btn = document.getElementById('btn-send-mailtester');
    const input = document.getElementById('mailtester-email-input');
    const statusEl = document.getElementById('mailtester-status-msg');
    btn.onclick = async () => {
      const to = input.value.trim();
      if (!to.includes('@')) return window.SniperUIContacts.showToast('Adresse invalide.', 'error');
      btn.disabled = true;
      try {
        const data = await window.SniperUIHelpers.api('/api/send-test', { to, campaign_id: window.SniperState?.selectedCampaignId, contact_index: window.SniperState?.previewContactIndex, campaign: editorCampaign() });
        statusEl.style.display = 'block';
        statusEl.className = data.success ? 'text-success' : 'text-error';
        statusEl.textContent = data.success ? '✅ Email envoyé : consultez votre note sur mail-tester.com.' : `❌ ${data.error || 'Échec'}`;
      } catch { window.SniperUIContacts.showToast('Erreur réseau.', 'error'); }
      btn.disabled = false;
    };
  }

  window.SniperUIScoreChecker = { runFullAudit, renderScoreCockpit, updateHeaderScoreBadge, runPreFlight, editorCampaign };
})();
