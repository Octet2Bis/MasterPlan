/**
 * UI SCORE CHECKER & DELIVERABILITY COCKPIT (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI (< 240 lignes)
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
    const { globalScore, status, badgeColor, verdict, pillars, actionableRemedies } = audit;
    const colorHex = badgeColor === 'green' ? '#10b981' : (badgeColor === 'amber' ? '#f59e0b' : '#ef4444');
    const sa = pillars.spamassassin || { score: 0, isPassing: true, rules: [] };
    const links = pillars.links || { total: 0, hasShorteners: false, brokenCount: 0 };
    const penaltyRules = (sa.rules || []).filter(r => parseFloat(r.score) > 0);

    container.innerHTML = `
      <div class="score-hero-card">
        <div class="score-gauge-box">
          <div class="score-circle" style="border-color: ${colorHex};">
            <span class="score-number" style="color: ${colorHex};">${globalScore}</span>
            <span class="score-max">/100</span>
          </div>
          <div class="score-verdict-content">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="tab-pill ${badgeColor === 'green' ? 'tab-pill-green' : (badgeColor === 'amber' ? 'tab-pill-amber' : 'badge-invalid')}">${status}</span>
              <strong style="font-size:15px; font-family:var(--font-heading);">Indice de Confiance Délivrabilité</strong>
            </div>
            <p style="font-size:13px; color:var(--text-secondary); margin-top:4px;">${verdict}</p>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-retest-deliverability" style="align-self:flex-start;">
          ⚡ Relancer le diagnostic
        </button>
      </div>

      <div class="pillars-bento-grid">
        <!-- 1. Domaine & DNS -->
        <div class="pillar-card">
          <div class="pillar-header">
            <span class="pillar-icon">🌐</span><strong>Domaine & DNS</strong>
            <span class="tab-pill ${pillars.domain.score >= 80 ? 'tab-pill-green' : 'tab-pill-amber'}">${pillars.domain.score}/100</span>
          </div>
          <div class="pillar-body">
            <div class="pill-row"><span>Fournisseur MX :</span><strong>${pillars.domain.details.mx?.provider || 'Inconnu'}</strong></div>
            <div class="pill-row"><span>SPF Record :</span><span class="${pillars.domain.details.spf?.exists ? 'text-success' : 'text-error'}">${pillars.domain.details.spf?.exists ? '✅ ' + (pillars.domain.details.spf.policy || 'Valide') : '❌ Absent'}</span></div>
            <div class="pill-row"><span>DMARC Record :</span><span class="${pillars.domain.details.dmarc?.exists ? 'text-success' : 'text-error'}">${pillars.domain.details.dmarc?.exists ? '✅ ' + (pillars.domain.details.dmarc.policy || 'Détecté') : '❌ Absent'}</span></div>
            <div class="pill-row"><span>Type compte :</span><span>${pillars.domain.details.isFreeWebmail ? '⚠️ Webmail (@gmail.com)' : '🏢 Domaine Pro Dédié'}</span></div>
          </div>
        </div>

        <!-- 2. Contenu & Mots Spam -->
        <div class="pillar-card">
          <div class="pillar-header">
            <span class="pillar-icon">✍️</span><strong>Linter Contenu & Copy</strong>
            <span class="tab-pill ${pillars.copy.score >= 80 ? 'tab-pill-green' : 'tab-pill-amber'}">${pillars.copy.score}/100</span>
          </div>
          <div class="pillar-body">
            <div class="pill-row"><span>Opt-out RGPD :</span><span class="${pillars.copy.details.hasOptOut ? 'text-success' : 'text-error'}">${pillars.copy.details.hasOptOut ? '✅ Présent' : '❌ Absent (-25 pts)'}</span></div>
            <div class="pill-row"><span>Mots à risque :</span><span class="${pillars.copy.details.detectedSpamWords?.length === 0 ? 'text-success' : 'text-error'}">${pillars.copy.details.detectedSpamWords?.length === 0 ? '✅ 0 mot détecté' : '⚠️ ' + pillars.copy.details.detectedSpamWords.join(', ')}</span></div>
            <div class="pill-row"><span>Densité de liens :</span><span>${pillars.copy.details.totalLinks || 0} lien(s) (Max 1 conseillé)</span></div>
          </div>
        </div>

        <!-- 3. SpamAssassin (Postmark API) & Liens -->
        <div class="pillar-card">
          <div class="pillar-header">
            <span class="pillar-icon">🧪</span><strong>SpamAssassin & Liens</strong>
            <span class="tab-pill ${sa.isPassing ? 'tab-pill-green' : 'tab-pill-amber'}">Score : ${sa.score} (Seuil &lt; 2.5)</span>
          </div>
          <div class="pillar-body">
            <div class="pill-row"><span>Moteur Postmark :</span><span class="${sa.isPassing ? 'text-success' : 'text-error'}">${sa.isPassing ? '✅ Conforme (&lt; 2.5)' : '⚠️ Risque (' + sa.score + ')'}</span></div>
            <div class="pill-row"><span>Pénalités actives :</span><span class="${penaltyRules.length > 0 ? 'text-error' : 'text-success'}">${penaltyRules.length === 0 ? '✅ 0 pénalité' : '⚠️ ' + penaltyRules.map(r => r.description).slice(0, 1).join(', ') + (penaltyRules.length > 1 ? ' (+' + (penaltyRules.length - 1) + ')' : '')}</span></div>
            <div class="pill-row"><span>Santé des URLs :</span><span class="${links.brokenCount > 0 || links.hasShorteners ? 'text-error' : 'text-success'}">${links.hasShorteners ? '❌ Réducteur banni' : (links.brokenCount > 0 ? '❌ ' + links.brokenCount + ' lien mort' : '✅ 200 OK')}</span></div>
          </div>
        </div>

        <!-- 4. Audience & Rebond -->
        <div class="pillar-card">
          <div class="pillar-header">
            <span class="pillar-icon">👥</span><strong>Audience & Rebond</strong>
            <span class="tab-pill ${pillars.audience.score >= 80 ? 'tab-pill-green' : 'tab-pill-amber'}">${pillars.audience.score}/100</span>
          </div>
          <div class="pillar-body">
            <div class="pill-row"><span>Contacts totaux :</span><strong>${pillars.audience.total}</strong></div>
            <div class="pill-row"><span>Certifiés délivrables :</span><span class="text-success">✅ ${pillars.audience.verified}</span></div>
            <div class="pill-row"><span>Invalides / Jetables :</span><span class="${pillars.audience.invalid > 0 ? 'text-error' : 'text-success'}">${pillars.audience.invalid > 0 ? '⚠️ ' + pillars.audience.invalid + ' (à purger)' : '✅ 0'}</span></div>
          </div>
        </div>
      </div>

      <!-- Test Live Mail-Tester.com -->
      <div class="smtp-box" style="margin-top:4px;">
        <div class="smtp-header">
          <div class="smtp-title"><span>📬 Test Réel d'Inbox Placement (Mail-Tester.com)</span></div>
          <a href="https://www.mail-tester.com" target="_blank" class="btn btn-ghost btn-sm" style="text-decoration:none;">Ouvrir mail-tester.com ↗</a>
        </div>
        <p class="text-secondary" style="font-size:12px; margin:0;">
          Collez l'adresse temporaire générée par mail-tester.com (ex: test-abc1234@srv1.mail-tester.com) pour envoyer un tir réel et certifier votre note sur 10.
        </p>
        <div class="smtp-inputs-row">
          <input type="email" id="mailtester-email-input" placeholder="ex: test-xxxx@srv1.mail-tester.com" class="input-text" />
          <button class="btn btn-action btn-sm" id="btn-send-mailtester" style="white-space:nowrap;">🚀 Envoyer à Mail-Tester</button>
        </div>
        <div id="mailtester-status-msg" style="font-size:12px; display:none;"></div>
      </div>

      <!-- Actions de Remédiation en 1 Clic -->
      ${actionableRemedies && actionableRemedies.length > 0 ? `
        <div class="remedies-box">
          <strong style="font-size:13.5px; font-family:var(--font-heading);">⚡ Actions recommandées pour atteindre 100/100 :</strong>
          <div class="remedies-list" style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
            ${actionableRemedies.map(rem => `
              <div class="remedy-item">
                <div><strong>${rem.label}</strong><p class="text-secondary" style="font-size:12px;">${rem.tip}</p></div>
                <button class="btn btn-ghost btn-sm btn-apply-remedy" data-action="${rem.action}">Appliquer</button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `
        <div class="remedies-box remedies-perfect">
          <span style="font-size:18px;">🛡️</span>
          <div>
            <strong>Garde-fous 100% validés !</strong>
            <p class="text-secondary" style="font-size:12.5px;">Votre domaine, votre copie, vos liens et votre cadence respectent toutes les règles d'or anti-spam.</p>
          </div>
        </div>
      `}
    `;

    document.getElementById('btn-retest-deliverability')?.addEventListener('click', () => runFullAudit());
    container.querySelectorAll('.btn-apply-remedy').forEach(btn => {
      btn.onclick = () => handleRemedyAction(btn.getAttribute('data-action'));
    });
    bindMailTesterAction();
  }

  function bindMailTesterAction() {
    const btn = document.getElementById('btn-send-mailtester');
    const input = document.getElementById('mailtester-email-input');
    const statusEl = document.getElementById('mailtester-status-msg');
    if (!btn || !input) return;

    btn.onclick = async () => {
      const to = input.value.trim();
      if (!to || !to.includes('@')) {
        window.SniperUIContacts?.showToast('Adresse mail-tester invalide.', 'error');
        return;
      }
      btn.disabled = true; btn.textContent = 'Envoi en cours...';
      try {
        const res = await fetch('/api/send-test', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to, campaign_id: window.SniperState?.selectedCampaignId,
            sender_id: window.SniperState?.selectedSenderId
          })
        });
        const data = await res.json();
        statusEl.style.display = 'block';
        if (data.success) {
          statusEl.className = 'text-success';
          statusEl.innerHTML = `✅ Email envoyé ! Vérifiez votre score sur <a href="https://www.mail-tester.com" target="_blank">mail-tester.com</a>.`;
          window.SniperUIContacts?.showToast('Email envoyé à Mail-Tester !', 'success');
        } else {
          statusEl.className = 'text-error';
          statusEl.textContent = '❌ Erreur : ' + (data.error || 'Échec d\'envoi');
        }
      } catch {
        window.SniperUIContacts?.showToast('Erreur réseau lors de l\'envoi.', 'error');
      } finally {
        btn.disabled = false; btn.textContent = '🚀 Envoyer à Mail-Tester';
      }
    };
  }

  async function handleRemedyAction(action) {
    if (action === 'ADD_OPT_OUT') {
      const bodyEl = document.getElementById('edit-campaign-body');
      if (bodyEl) {
        bodyEl.value = bodyEl.value.trim() + '\n\nSi vous ne souhaitez plus recevoir de messages de ma part, répondez simplement "stop".';
        bodyEl.dispatchEvent(new Event('input'));
        window.SniperUIContacts?.showToast('✅ Clause Opt-Out ajoutée ! Sauvegardez le message.', 'success');
        await runFullAudit();
      }
    } else if (action === 'PURGE_INVALID_CONTACTS') {
      await window.SniperUIContacts?.applyCleanListInPlace();
      window.SniperUIContacts?.showToast('🧹 Contacts invalides purgés !', 'success');
      await runFullAudit();
    } else if (action === 'CLEAN_SPAM_WORDS') {
      window.SniperUIContacts?.showToast('💡 Évitez les superlatifs et les promesses dans l\'éditeur.', 'info');
      document.getElementById('tab-messages')?.click();
    } else if (action === 'REMOVE_SHORTENER') {
      const urlInput = document.getElementById('edit-campaign-cta-url');
      if (urlInput) { urlInput.value = 'https://aevum.app'; urlInput.dispatchEvent(new Event('input')); }
      window.SniperUIContacts?.showToast('✅ Réducteur remplacé par URL directe.', 'success');
      await runFullAudit();
    }
  }

  window.SniperUIScoreChecker = { runFullAudit, renderScoreCockpit, updateHeaderScoreBadge };
})();

