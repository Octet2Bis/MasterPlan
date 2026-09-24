/**
 * UI PROFIL & CONNEXIONS — COMPTE GOOGLE (OAUTH2), SIGNATURE, PASSERELLE DE CLICS, HUNTER.IO
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI
 * Aucun secret n'est relu depuis le serveur : les champs secrets restent vides une fois enregistrés.
 */
window.SniperUIProfile = (function() {
  let modalEl, statusEl;
  const $ = (id) => document.getElementById(id);
  const e = (v) => window.SniperUIHelpers.esc(v);
  const api = (path, body) => window.SniperUIHelpers.api(path, body);
  const toast = (m, t) => window.SniperUIContacts.showToast(m, t);

  function init() {
    modalEl = $('modal-profile');
    statusEl = $('profile-status-box');
    $('btn-open-profile').onclick = openProfileModal;
    $('btn-close-profile').onclick = () => { modalEl.style.display = 'none'; };
    $('btn-save-profile').onclick = saveProfile;
    $('btn-google-auth').onclick = startGoogleOAuth;
    $('btn-google-disconnect').onclick = disconnectGoogleOAuth;
    $('btn-test-hunter').onclick = testHunterKey;
    $('header-hunter-badge').onclick = openProfileModal;
    const redirect = $('google-redirect-uri');
    if (redirect) redirect.textContent = `${window.location.origin}/api/auth/google/callback`;

    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') toast('🟢 Compte Google connecté.', 'success');
    if (params.get('auth_error')) toast(`❌ Échec Google OAuth : ${params.get('auth_error')}`, 'error');
    if (params.has('auth') || params.has('auth_error')) window.history.replaceState({}, document.title, window.location.pathname);
    refreshHunterBadge();
  }

  function setUIState(state, message = '') {
    const cfg = {
      EMPTY: ['state-empty', '💡', 'Compte Google requis', message || 'Connectez votre compte Google pour activer les envois.'],
      LOADING: ['state-loading', '⏳', 'Chargement…', message],
      SUCCESS: ['state-success', '✅', 'Prêt', message],
      ERROR: ['state-error', '⚠️', 'Erreur', message]
    }[state];
    statusEl.className = `profile-status-card ${cfg[0]}`;
    statusEl.innerHTML = `<div class="status-icon">${cfg[1]}</div><div><strong>${cfg[2]}</strong><p>${e(cfg[3])}</p></div>`;
  }

  function renderGoogleCard(auth) {
    const connected = Boolean(auth?.connected && auth.user);
    $('google-auth-not-connected').style.display = connected ? 'none' : 'block';
    $('google-auth-connected').style.display = connected ? 'flex' : 'none';
    $('google-client-id').value = auth?.client_id || '';
    $('google-client-secret').value = '';
    $('google-client-secret').placeholder = auth?.has_client_secret ? 'Client Secret enregistré (laisser vide pour le conserver)' : 'Client Secret Google Cloud';
    if (connected) {
      $('google-connected-user-text').innerHTML = `<strong>${e(auth.user.name || 'Compte Google')}</strong> <span style="color:var(--text-secondary); font-size:13px;">(${e(auth.user.email)})</span>`;
      const avatar = $('google-user-avatar');
      avatar.src = auth.user.picture || '';
      avatar.style.display = auth.user.picture ? 'block' : 'none';
      setUIState('SUCCESS', `Envois via l'API Gmail depuis ${auth.user.email}.`);
    } else setUIState('EMPTY');
  }

  async function startGoogleOAuth() {
    const client_id = $('google-client-id').value.trim();
    if (!client_id) return setUIState('ERROR', 'Renseignez le Client ID Google Cloud.');
    try {
      const data = await api('/api/auth/google/url', { client_id, client_secret: $('google-client-secret').value.trim() });
      if (data.success && data.url) window.location.href = data.url;
      else setUIState('ERROR', data.error || 'Impossible de générer le lien de connexion.');
    } catch { setUIState('ERROR', 'Erreur de communication avec le serveur local.'); }
  }

  async function disconnectGoogleOAuth() {
    if (!confirm('Déconnecter ce compte Google ?')) return;
    await api('/api/auth/google/disconnect', {});
    renderGoogleCard(await api('/api/auth/google/status'));
    window.SniperApp?.loadSenderAndConfig();
    toast('Compte Google déconnecté.', 'info');
  }

  async function openProfileModal() {
    modalEl.style.display = 'flex';
    setUIState('LOADING');
    try {
      const [config, auth] = await Promise.all([api('/api/config'), api('/api/auth/google/status')]);
      $('profile-name').value = config.sender?.name || '';
      $('profile-signature').value = config.sender?.signature || '';
      $('profile-vm-url').value = config.tracking?.vm_tracking_url || '';
      $('profile-hunter-key').value = '';
      $('profile-hunter-key').placeholder = config.hunter?.configured ? 'Clé enregistrée (laisser vide pour la conserver)' : 'Clé API Hunter.io (optionnelle)';
      renderGoogleCard(auth);
      if (config.hunter?.configured) testHunterKey();
    } catch { setUIState('ERROR', 'Erreur lors du chargement du profil.'); }
  }

  function renderHunter(data) {
    const box = $('hunter-status-box');
    const badge = $('header-hunter-badge');
    if (data?.success) {
      badge.style.display = 'inline-flex';
      $('header-hunter-credits').textContent = `${data.total_available} crédits`;
      if (box) box.innerHTML = `<div class="callout-notice" style="font-size:13px;">✅ Hunter.io (${e(data.plan_name)}) : ${data.searches_available} recherches et ${data.verifications_available} vérifications disponibles${data.reset_date ? ` · renouvellement ${e(data.reset_date)}` : ''}.</div>`;
    } else {
      badge.style.display = 'none';
      if (box) box.innerHTML = data?.error ? `<span class="text-error" style="font-size:13px;">❌ ${e(data.error)}</span>` : '';
    }
  }

  async function refreshHunterBadge() {
    try { renderHunter(await api('/api/hunter/account')); } catch {}
  }

  async function testHunterKey() {
    const key = $('profile-hunter-key').value.trim();
    if (key) await api('/api/hunter/config', { api_key: key });
    renderHunter(await api('/api/hunter/account'));
  }

  async function saveProfile() {
    setUIState('LOADING', 'Enregistrement…');
    try {
      await api('/api/config', {
        sender: { name: $('profile-name').value.trim(), signature: $('profile-signature').value.trim() },
        tracking: { vm_tracking_url: $('profile-vm-url').value.trim() }
      });
      const key = $('profile-hunter-key').value.trim();
      if (key) await api('/api/hunter/config', { api_key: key });
      setUIState('SUCCESS', 'Profil enregistré.');
      refreshHunterBadge();
      window.SniperApp?.loadSenderAndConfig();
    } catch { setUIState('ERROR', 'Erreur lors de l\'enregistrement.'); }
  }

  return { init, openProfileModal, setUIState, testHunterKey };
})();
