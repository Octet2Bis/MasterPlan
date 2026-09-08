/**
 * UI SCORE CHECKER & DELIVERABILITY COCKPIT (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI (< 230L)
 */
(function() {
  let currentAudit = null;

  async function runFullAudit(campaignId, senderEmail) {
    const cid = campaignId || window.SniperState?.selectedCampaignId;
    const email = senderEmail || window.SniperState?.senders?.find(s => s.id === window.SniperState?.selectedSenderId)?.send_as_email;
    const bodyObj = {
      campaign_id: cid, sender_email: email,
      campaign: {
        subject: document.getElementById('edit-campaign-subject')?.value || '',
        body: document.getElementById('edit-campaign-body')?.value || '',
        cta_label: document.getElementById('edit-campaign-cta-label')?.value || '',
        target_url: document.getElementById('edit-campaign-cta-url')?.value || ''
      }
    };
    try {
      const res = await fetch('/api/deliverability/full-audit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyObj)
      });
      currentAudit = await res.json();
      renderScoreCockpit(currentAudit);
      updateHeaderScoreBadge(currentAudit);
      return currentAudit;
    } catch { return null; }
  }

  function updateHeaderScoreBadge(audit) {
    const badge = document.getElementById('header-score-badge');
    if (!badge || !audit) return;
    const colorClass = audit.badgeColor === 'green' ? 'tab-pill-green' : (audit.badgeColor === 'amber' ? 'tab-pill-amber' : 'badge-invalid');
    badge.className = `tab-pill ${colorClass}`;
    badge.innerHTML = `🛡️ Délivrabilité : <strong>${audit.globalScore}/100</strong>`;
    badge.style.display = 'inline-flex';
  }

  function renderScoreCockpit(audit) {
    const container = document.getElementById('score-checker-container');
    if (!container || !audit) return;
    const { globalScore, status, badgeColor, verdict, pillars } = audit;
    const colorHex = badgeColor === 'green' ? '#10b981' : (badgeColor === 'amber' ? '#f59e0b' : '#ef4444');
    const sa = pillars.spamassassin || { score: 0, isPassing: true };
    const links = pillars.links || { total: 0, brokenCount: 0 };
    const copy = pillars.copy?.details || {};
    const placement = copy.predictedPlacement || 'PRIMARY_INBOX';
    const placementLabel = copy.placementLabel || 'Boîte Principale';
    const isPrimary = placement === 'PRIMARY_INBOX';

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: 1.35fr 1fr; gap:14px; align-items:stretch;">
        <div class="score-hero-card" style="height:100%;">
          <div class="score-gauge-box">
            <div class="score-circle" style="border-color: ${colorHex};">
              <span class="score-number" style="color: ${colorHex};">${globalScore}</span>
              <span class="score-max">/100</span>
            </div>
            <div class="score-verdict-content">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="tab-pill ${badgeColor === 'green' ? 'tab-pill-green' : 'tab-pill-amber'}">${status}</span>
                <strong style="font-size:14px; font-family:var(--font-heading);">Indice de Délivrabilité</strong>
              </div>
              <p style="font-size:12.5px; color:var(--text-secondary); margin-top:4px;">${verdict}</p>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-retest-deliverability" style="align-self:flex-start;">⚡ Re-tester</button>
        </div>

        <div class="bento-dark-card">
          <div class="bento-dark-header">
            <span style="font-size:12.5px; font-weight:700; color:var(--text-on-dark-secondary); text-transform:uppercase; letter-spacing:0.5px;">Télémétrie Google Inbox</span>
            <span class="bento-pill-badge" style="color:${isPrimary ? '#10B981' : '#F59E0B'};">${isPrimary ? '↗' : '⚠️'}</span>
          </div>
          <div>
            <div style="font-size:12.5px; color:var(--text-on-dark-secondary);">Placement Estimé</div>
            <div class="bento-dark-metric" style="color:${isPrimary ? '#10B981' : '#F59E0B'}; font-size:22px;">${placementLabel}</div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; padding-top:6px; border-top:1px solid var(--surface-dark-border); font-size:12.5px;">
            <div>
              <span style="color:var(--text-on-dark-secondary); font-size:12.5px;">Reply-Trigger :</span>
              <strong style="font-family:var(--font-mono); color:#FFF; display:block;">${copy.replyTriggerScore || 90}%</strong>
            </div>
            <div>
              <span style="color:var(--text-on-dark-secondary); font-size:12.5px;">Longueur :</span>
              <strong style="font-family:var(--font-mono); color:#FFF; display:block;">${copy.wordCount || 0} mots</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="callout-notice" style="justify-content:space-between; flex-wrap:wrap; margin-top:2px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:15px;">🛡️</span>
          <div>
            <strong>Skylos Pre-Flight Scanner</strong>
            <span class="text-secondary" style="font-size:12.5px; display:block;">Contrôle déterministe pré-vol (0 variable orpheline, 0 secret fuité).</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-run-preflight">Lancer le Pre-Flight</button>
      </div>
      <div id="preflight-results-box" style="display:none; padding:10px 14px; border-radius:var(--radius-sm); font-size:13px;"></div>

      <div class="pillars-bento-grid">
        <div class="pillar-card">
          <div class="pillar-header"><span>🌐 <strong>Domaine & DNS</strong></span><span class="tab-pill ${pillars.domain.score >= 80 ? 'tab-pill-green' : 'tab-pill-amber'}">${pillars.domain.score}/100</span></div>
          <div class="pillar-body">
            <div class="pill-row"><span>Fournisseur MX :</span><strong>${pillars.domain.details.mx?.provider || 'Inconnu'}</strong></div>
            <div class="pill-row"><span>SPF Record :</span><span class="${pillars.domain.details.spf?.exists ? 'text-success' : 'text-error'}">${pillars.domain.details.spf?.exists ? '✅ Valide' : '❌ Absent'}</span></div>
            <div class="pill-row"><span>DMARC Record :</span><span class="${pillars.domain.details.dmarc?.exists ? 'text-success' : 'text-error'}">${pillars.domain.details.dmarc?.exists ? '✅ Détecté' : '❌ Absent'}</span></div>
          </div>
        </div>

        <div class="pillar-card">
          <div class="pillar-header"><span>✍️ <strong>Linter Copy</strong></span><span class="tab-pill ${pillars.copy.score >= 80 ? 'tab-pill-green' : 'tab-pill-amber'}">${pillars.copy.score}/100</span></div>
          <div class="pillar-body">
            <div class="pill-row"><span>Opt-out RGPD :</span><span class="${copy.hasOptOut ? 'text-success' : 'text-error'}">${copy.hasOptOut ? '✅ Présent' : '❌ Absent (-25 pts)'}</span></div>
            <div class="pill-row"><span>Mots à risque :</span><span class="${copy.detectedSpamWords?.length === 0 ? 'text-success' : 'text-error'}">${copy.detectedSpamWords?.length === 0 ? '✅ 0 mot' : '⚠️ ' + copy.detectedSpamWords.join(', ')}</span></div>
            <div class="pill-row"><span>Empreinte HTML :</span><span>${copy.isCleanHtml ? '✅ Plain Text brut' : '⚠️ Balisage excessif'}</span></div>
          </div>
        </div>

        <div class="pillar-card">
          <div class="pillar-header"><span>🧪 <strong>SpamAssassin & URLs</strong></span><span class="tab-pill ${sa.isPassing ? 'tab-pill-green' : 'tab-pill-amber'}">${sa.score} (&lt; 2.5)</span></div>
          <div class="pillar-body">
            <div class="pill-row"><span>Score Postmark :</span><span class="${sa.isPassing ? 'text-success' : 'text-error'}">${sa.isPassing ? '✅ Conforme' : '⚠️ Risque (' + sa.score + ')'}</span></div>
            <div class="pill-row"><span>URLs & Redirections :</span><span class="${links.brokenCount > 0 ? 'text-error' : 'text-success'}">${links.brokenCount > 0 ? '❌ Lien mort' : '✅ Direct 200'}</span></div>
            <div class="pill-row"><span>Densité liens :</span><span>${copy.totalLinks || 0} lien (1 max)</span></div>
          </div>
        </div>

        <div class="pillar-card">
          <div class="pillar-header"><span>👥 <strong>Audience & Contacts</strong></span><span class="tab-pill ${pillars.audience.score >= 80 ? 'tab-pill-green' : 'tab-pill-amber'}">${pillars.audience.score}/100</span></div>
          <div class="pillar-body">
            <div class="pill-row"><span>Contacts totaux :</span><strong>${pillars.audience.total}</strong></div>
            <div class="pill-row"><span>Certifiés délivrables :</span><span class="text-success">✅ ${pillars.audience.verified}</span></div>
            <div class="pill-row"><span>Invalides :</span><span class="${pillars.audience.invalid > 0 ? 'text-error' : 'text-success'}">${pillars.audience.invalid > 0 ? '⚠️ ' + pillars.audience.invalid : '✅ 0'}</span></div>
          </div>
        </div>
      </div>

      <div class="smtp-box" style="margin-top:2px;">
        <div class="smtp-header">
          <div class="smtp-title"><span>📬 Test Réel d'Inbox Placement (Mail-Tester.com)</span></div>
          <a href="https://www.mail-tester.com" target="_blank" class="btn btn-ghost btn-sm" style="text-decoration:none;">Ouvrir mail-tester.com ↗</a>
        </div>
        <div class="smtp-inputs-row">
          <input type="email" id="mailtester-email-input" placeholder="ex: test-xxxx@srv1.mail-tester.com" class="input-text" />
          <button class="btn btn-action btn-sm" id="btn-send-mailtester" style="white-space:nowrap;">🚀 Envoyer le test</button>
        </div>
        <div id="mailtester-status-msg" style="font-size:13px; display:none;"></div>
      </div>
    `;

    document.getElementById('btn-retest-deliverability')?.addEventListener('click', () => runFullAudit());
    document.getElementById('btn-run-preflight')?.addEventListener('click', () => runPreFlight());
    bindMailTesterAction();
  }

  async function runPreFlight() {
    const btn = document.getElementById('btn-run-preflight');
    const box = document.getElementById('preflight-results-box');
    if (!btn || !box) return;
    btn.disabled = true; btn.textContent = 'Scan en cours...';
    try {
      const cid = window.SniperState?.selectedCampaignId;
      const res = await fetch('/api/campaign/preflight', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: cid,
          campaign: {
            subject: document.getElementById('edit-campaign-subject')?.value || '',
            template_body: document.getElementById('edit-campaign-body')?.value || '',
            target_url: document.getElementById('edit-campaign-cta-url')?.value || ''
          }
        })
      });
      const data = await res.json();
      box.style.display = 'block';
      if (data.status === 'CLEARED') {
        box.style.background = '#ECFDF5'; box.style.border = '1px solid #10B981'; box.style.color = '#065F46';
        box.innerHTML = `<strong>✅ Skylos Pre-Flight Validé</strong> : 0 variable orpheline, 0 credential fuité, ${data.contactsCount} contact(s) prêts.`;
      } else if (data.status === 'WARNING') {
        box.style.background = '#FEF3C7'; box.style.border = '1px solid #F59E0B'; box.style.color = '#92400E';
        box.innerHTML = `<strong>⚠️ Attention Pre-Flight</strong> : ${data.warnings.map(w => w.message).join(' | ')}`;
      } else {
        box.style.background = '#FEF2F2'; box.style.border = '1px solid #EF4444'; box.style.color = '#991B1B';
        box.innerHTML = `<strong>❌ Envoi Bloqué par Skylos</strong> : ${data.issues.map(i => i.message).join(' | ')}`;
      }
    } catch {
      box.style.display = 'block'; box.style.background = '#FEF2F2'; box.style.color = '#991B1B';
      box.textContent = 'Erreur lors du scan Skylos.';
    } finally {
      btn.disabled = false; btn.textContent = 'Lancer le Pre-Flight';
    }
  }

  function bindMailTesterAction() {
    const btn = document.getElementById('btn-send-mailtester');
    const input = document.getElementById('mailtester-email-input');
    const statusEl = document.getElementById('mailtester-status-msg');
    if (!btn || !input) return;
    btn.onclick = async () => {
      const to = input.value.trim();
      if (!to || !to.includes('@')) { window.SniperUIContacts?.showToast('Adresse invalide.', 'error'); return; }
      btn.disabled = true; btn.textContent = 'Envoi...';
      try {
        const res = await fetch('/api/send-test', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, campaign_id: window.SniperState?.selectedCampaignId, sender_id: window.SniperState?.selectedSenderId })
        });
        const data = await res.json();
        statusEl.style.display = 'block';
        if (data.success) {
          statusEl.className = 'text-success';
          statusEl.innerHTML = `✅ Email envoyé ! Vérifiez votre note sur <a href="https://www.mail-tester.com" target="_blank">mail-tester.com</a>.`;
        } else {
          statusEl.className = 'text-error'; statusEl.textContent = '❌ Erreur : ' + (data.error || 'Échec');
        }
      } catch { window.SniperUIContacts?.showToast('Erreur réseau.', 'error'); }
      finally { btn.disabled = false; btn.textContent = '🚀 Envoyer le test'; }
    };
  }

  window.SniperUIScoreChecker = { runFullAudit, renderScoreCockpit, updateHeaderScoreBadge, runPreFlight };
})();
