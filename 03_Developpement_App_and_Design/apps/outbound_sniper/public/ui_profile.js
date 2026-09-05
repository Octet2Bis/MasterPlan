/**
 * OUTBOUND CAMPAIGNS — MODULE UI PROFIL EXPÉDITEUR & GOOGLE OAUTH2 (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI (< 210 lignes)
 */

window.SniperUIProfile = (function() {
  let modalEl, statusEl, lastVerifiedAt = null;

  function init() {
    modalEl = document.getElementById('modal-profile');
    statusEl = document.getElementById('profile-status-box');

    const btnOpen = document.getElementById('btn-open-profile');
    const btnClose = document.getElementById('btn-close-profile');
    const btnSave = document.getElementById('btn-save-profile');
    const btnTest = document.getElementById('btn-test-profile-smtp');
    const togglePass = document.getElementById('btn-toggle-profile-pass');
    const btnGoogleAuth = document.getElementById('btn-google-auth');
    const btnGoogleDisconnect = document.getElementById('btn-google-disconnect');

    if (btnOpen) btnOpen.onclick = openProfileModal;
    if (btnClose) btnClose.onclick = closeProfileModal;
    if (btnSave) btnSave.onclick = saveProfile;
    if (btnTest) btnTest.onclick = testSmtpConnection;
    if (btnGoogleAuth) btnGoogleAuth.onclick = startGoogleOAuth;
    if (btnGoogleDisconnect) btnGoogleDisconnect.onclick = disconnectGoogleOAuth;
    const btnTestHunter = document.getElementById('btn-test-hunter');
    if (btnTestHunter) btnTestHunter.onclick = testHunterKey;
    if (togglePass) {
      togglePass.onclick = () => {
        const input = document.getElementById('profile-app-password');
        input.type = input.type === 'password' ? 'text' : 'password';
      };
    }

    // Gestion du retour d'authentification Google
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      window.SniperUIContacts.showToast("🟢 Connecté avec succès via Google OAuth2 !", "success");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('auth_error')) {
      window.SniperUIContacts.showToast(`❌ Échec Google OAuth : ${urlParams.get('auth_error')}`, "error");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const headerHunterBadge = document.getElementById('header-hunter-badge');
    if (headerHunterBadge) headerHunterBadge.onclick = openProfileModal;
    checkGoogleOAuthStatus();
    checkHunterStatus();
  }

  function updateTopHunterBadge(data) {
    const badge = document.getElementById('header-hunter-badge');
    const creditsEl = document.getElementById('header-hunter-credits');
    if (!badge || !creditsEl) return;
    if (data && data.success) {
      badge.style.display = 'inline-flex';
      creditsEl.textContent = `${data.total_available} crédits`;
      badge.title = `Hunter.io (${data.plan_name}) : ${data.searches_available} recherches, ${data.verifications_available} vérifs dispo`;
    } else {
      badge.style.display = 'none';
    }
  }

  async function checkHunterStatus() {
    try {
      const res = await fetch('/api/hunter/account');
      const data = await res.json();
      updateTopHunterBadge(data);
      return data;
    } catch { return null; }
  }

  async function checkGoogleOAuthStatus() {
    try {
      const res = await fetch('/api/auth/google/status');
      const auth = await res.json();
      renderGoogleOAuthCard(auth);
    } catch {}
  }

  function renderGoogleOAuthCard(auth) {
    const boxNotConnected = document.getElementById('google-auth-not-connected');
    const boxConnected = document.getElementById('google-auth-connected');
    const statusText = document.getElementById('google-connected-user-text');
    const avatarEl = document.getElementById('google-user-avatar');
    const clientIdInput = document.getElementById('google-client-id');
    const clientSecretInput = document.getElementById('google-client-secret');

    if (clientIdInput && auth?.client_id) clientIdInput.value = auth.client_id;
    if (clientSecretInput && auth?.client_secret) clientSecretInput.value = auth.client_secret;

    const isConn = Boolean(auth && auth.connected && auth.user);
    if (boxNotConnected) boxNotConnected.style.display = isConn ? 'none' : 'block';
    if (boxConnected) boxConnected.style.display = isConn ? 'flex' : 'none';
    if (isConn) {
      if (statusText) statusText.innerHTML = `<strong>${auth.user.name || 'Compte Google'}</strong> <span style="color:var(--text-secondary); font-size:12px;">(${auth.user.email})</span>`;
      if (avatarEl) { avatarEl.src = auth.user.picture || ''; avatarEl.style.display = auth.user.picture ? 'block' : 'none'; }
      setUIState('SUCCESS', `Connecté via Google OAuth2 (${auth.user.email}). Envois via Gmail API.`);
    }
  }

  async function startGoogleOAuth() {
    const clientId = document.getElementById('google-client-id')?.value.trim();
    const clientSecret = document.getElementById('google-client-secret')?.value.trim();
    if (!clientId) {
      alert("Veuillez renseigner votre Client ID Google Cloud.");
      return;
    }
    try {
      const res = await fetch(`/api/auth/google/url?client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`);
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(`Erreur : ${data.error || 'Impossible de générer le lien de connexion'}`);
      }
    } catch {
      alert("Erreur de communication avec le serveur.");
    }
  }

  async function disconnectGoogleOAuth() {
    if (!confirm("Voulez-vous déconnecter ce compte Google ?")) return;
    try {
      await fetch('/api/auth/google/disconnect', { method: 'POST' });
      await checkGoogleOAuthStatus();
      setUIState('EMPTY', 'Compte Google déconnecté.');
      window.SniperUIContacts.showToast("Compte Google déconnecté.", "info");
    } catch {}
  }

  async function openProfileModal() {
    if (!modalEl) return;
    modalEl.style.display = 'flex';
    setUIState('LOADING');
    try {
      const [configRes, sendersRes, authRes] = await Promise.all([fetch('/api/config'), fetch('/api/senders'), fetch('/api/auth/google/status')]);
      const config = await configRes.json();
      const senders = await sendersRes.json();
      const auth = await authRes.json();
      const defaultSender = senders[0] || config.sender || {};

      document.getElementById('profile-name').value = defaultSender.display_name || defaultSender.name || (auth.user?.name || '');
      document.getElementById('profile-email').value = defaultSender.master_email || config.sender?.email || (auth.user?.email || '');
      document.getElementById('profile-app-password').value = config.sender?.app_password || '';
      document.getElementById('profile-signature').value = defaultSender.signature || config.sender?.signature || '';
      document.getElementById('profile-vm-url').value = config.tracking?.vm_tracking_url || 'http://localhost:3000';
      if (document.getElementById('profile-hunter-key')) {
        const hKey = config.hunter?.api_key || '';
        document.getElementById('profile-hunter-key').value = hKey;
        const hbox = document.getElementById('hunter-status-box');
        if (hKey) testHunterKey();
        else if (hbox) hbox.innerHTML = `<span style="color:var(--text-muted); font-size:12px;">Clé absente. Repli transparent sur les MX DNS locaux (100% gratuit).</span>`;
      }

      renderGoogleOAuthCard(auth);
      const isEmpty = !auth.connected && !document.getElementById('profile-email').value && !document.getElementById('profile-app-password').value;
      if (!auth.connected) setUIState(isEmpty ? 'EMPTY' : (lastVerifiedAt ? 'STALE' : 'SUCCESS'));
    } catch {
      setUIState('ERROR', "Erreur lors du chargement des paramètres de profil.");
    }
  }

  function closeProfileModal() { if (modalEl) modalEl.style.display = 'none'; }

  function setUIState(state, message = '') {
    if (!statusEl) return;
    statusEl.className = 'profile-status-card';
    const cfg = {
      EMPTY: ['state-empty', '💡', 'Authentification requise', message || "Connectez-vous via Google OAuth2 ou renseignez un mot de passe d'application."],
      LOADING: ['state-loading', '⏳', 'Connexion en cours...', message || 'Vérification TLS 465 / OAuth2...'],
      SUCCESS: ['state-success', '✅', 'Profil opérationnel', message || 'Prêt pour les envois réels sécurisés.'],
      ERROR: ['state-error', '⚠️', "Échec d'authentification", message],
      STALE: ['state-stale', '🕒', `Dernière validation : ${lastVerifiedAt}`, 'Identifiants mémorisés localement.']
    }[state] || ['state-empty', '💡', 'Profil', message];
    statusEl.classList.add(cfg[0]);
    statusEl.innerHTML = `<div class="status-icon">${cfg[1]}</div><div><strong>${cfg[2]}</strong><p>${cfg[3]}</p></div>`;
  }

  async function testSmtpConnection() {
    const email = document.getElementById('profile-email').value.trim();
    const pass = document.getElementById('profile-app-password').value.trim();
    if (!email || !pass) return setUIState('ERROR', 'Veuillez renseigner votre email et mot de passe d\'application.');
    setUIState('LOADING', 'Vérification du handshake TLS et authentification SMTP...');
    try {
      const res = await fetch('/api/smtp/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pass }) });
      const result = await res.json();
      if (result.success) {
        lastVerifiedAt = new Date().toLocaleTimeString();
        setUIState('SUCCESS', result.message || 'Authentification Google SMTP validée avec succès.');
      } else { setUIState('ERROR', result.message || 'Identifiants rejetés par Google.'); }
    } catch { setUIState('ERROR', 'Erreur réseau avec le serveur local.'); }
  }

  async function testHunterKey() {
    const key = document.getElementById('profile-hunter-key')?.value.trim();
    const box = document.getElementById('hunter-status-box');
    if (!key) {
      if (box) box.innerHTML = `<span style="color:var(--text-muted); font-size:12px;">Clé absente. Repli transparent sur les MX DNS locaux (100% gratuit).</span>`;
      updateTopHunterBadge(null);
      return;
    }
    if (box) box.innerHTML = `<span style="font-size:12px; color:var(--text-secondary);">⏳ Interrogation des quotas Hunter.io...</span>`;
    await fetch('/api/hunter/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: key }) });
    const res = await fetch('/api/hunter/account');
    const data = await res.json();
    if (box) {
      if (data.success) {
        const resetStr = data.reset_date ? ` · Renouvellement : ${data.reset_date}` : '';
        box.innerHTML = `<div style="background:#ECFDF5; border:1px solid #10B981; border-radius:4px; padding:6px 10px; font-size:12px; color:#065F46;">
          <strong>✅ Hunter.io connecté (${data.plan_name})</strong><br>
          🔍 Recherches : <strong>${data.searches_available}</strong> dispo (${data.searches_used} utilisées)<br>
          🛡️ Vérifications : <strong>${data.verifications_available}</strong> dispo (${data.verifications_used} utilisées)${resetStr}
        </div>`;
        updateTopHunterBadge(data);
      } else {
        box.innerHTML = `<span style="color:var(--accent-error); font-weight:600; font-size:12px;">❌ Échec : ${data.error || 'Clé rejetée'}</span>`;
        updateTopHunterBadge(null);
      }
    }
  }

  async function saveProfile() {
    const name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const pass = document.getElementById('profile-app-password').value.trim();
    const signature = document.getElementById('profile-signature').value.trim();
    const vmUrl = document.getElementById('profile-vm-url').value.trim() || 'http://localhost:3000';
    const hunterKey = document.getElementById('profile-hunter-key')?.value.trim() || '';
    setUIState('LOADING', 'Enregistrement de la configuration...');
    try {
      await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sender: { name, email, signature, app_password: pass }, tracking: { vm_tracking_url: vmUrl }, hunter: { api_key: hunterKey } }) });
      await fetch('/api/senders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'sender_default', name: 'Compte Principal', display_name: name, master_email: email, send_as_email: email, signature, is_subdomain: false }) });
      lastVerifiedAt = new Date().toLocaleTimeString();
      setUIState('SUCCESS', 'Profil sauvegardé avec succès.');
      checkHunterStatus();
      if (typeof window.SniperAppReloadSenders === 'function') window.SniperAppReloadSenders();
    } catch { setUIState('ERROR', 'Erreur lors de la sauvegarde.'); }
  }

  return { init, openProfileModal, closeProfileModal, setUIState, testHunterKey };
})();
