/**
 * AEVUM SIMULATOR — NAVIGATION & UI ROUTER
 * Module étanche (< 120 lignes)
 */

function switchScreen(screenId) {
  document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.remove('hidden');
    target.scrollTop = 0;
  }

  // Synchronisation de la Tab Bar iOS native
  document.querySelectorAll('.ios-tab-item').forEach(tab => {
    const tabScreen = tab.getAttribute('data-screen');
    if (tabScreen === screenId) tab.classList.add('active');
    else tab.classList.remove('active');
  });
}

function getRankInfo(level) {
  if (level <= 2) return { title: "Initiate", badge: "✨", color: "var(--cyan-accent)" };
  if (level <= 5) return { title: "Bio-Architect", badge: "⚛️", color: "var(--emerald-accent)" };
  if (level <= 8) return { title: "Centenarian Mindset", badge: "🔥", color: "var(--amber-accent)" };
  return { title: "Aevum Master", badge: "👑", color: "var(--violet-accent)" };
}

function updateUI() {
  const level = Math.floor(window.state.profile.totalXp / 100) + 1;
  const rank = getRankInfo(level);
  const currentXp = window.state.profile.totalXp % 100;

  // Onboarding
  const resChron = document.getElementById('res-chron-age');
  const resBio = document.getElementById('res-bio-age');
  const resVit = document.getElementById('res-vitality-score');
  if (resChron) resChron.textContent = `${window.state.profile.chronologicalAge} ans`;
  if (resBio) resBio.textContent = `${window.state.profile.estimatedBiologicalAge} ans`;
  if (resVit) resVit.textContent = `${window.state.profile.vitalityScore} / 100`;

  // Dashboard
  const dashScore = document.getElementById('dash-score');
  const dashBio = document.getElementById('dash-bio-age');
  const dashLevel = document.getElementById('dash-level');
  const dashXpTxt = document.getElementById('dash-xp-txt');
  const dashXpBar = document.getElementById('dash-xp-bar');
  const dashStreak = document.getElementById('dash-streak');

  if (dashScore) dashScore.textContent = window.state.profile.vitalityScore;
  if (dashBio) dashBio.textContent = `${window.state.profile.estimatedBiologicalAge} ans`;
  if (dashLevel) dashLevel.textContent = `${rank.badge} ${rank.title.toUpperCase()} (NIV. ${level})`;
  if (dashXpTxt) dashXpTxt.textContent = `Progression XP : ${currentXp}/100`;
  if (dashXpBar) dashXpBar.style.width = `${currentXp}%`;
  if (dashStreak) dashStreak.textContent = window.state.profile.streakDays;

  // Sidebar inspecteur
  const sideBio = document.getElementById('side-bio-age');
  const sideVit = document.getElementById('side-vitality');
  const sideCount = document.getElementById('side-count');
  const sideStreak = document.getElementById('side-streak');
  const sideGrace = document.getElementById('side-grace');

  if (sideBio) sideBio.textContent = `${window.state.profile.estimatedBiologicalAge} ans`;
  if (sideVit) sideVit.textContent = `${window.state.profile.vitalityScore} / 100`;
  if (sideCount) sideCount.textContent = window.state.profile.completedChallengesCount;
  if (sideStreak) sideStreak.textContent = `${window.state.profile.streakDays} jours`;

  const shieldStatusTitle = document.getElementById('shield-status-title');
  const shieldBtnTxt = document.getElementById('shield-btn-txt');
  const shieldGraceSub = document.getElementById('shield-grace-sub');

  if (window.state.screenTime.gracePeriodSeconds > 0) {
    const mins = Math.ceil(window.state.screenTime.gracePeriodSeconds / 60);
    if (shieldStatusTitle) shieldStatusTitle.textContent = `Débloqué (${mins}m)`;
    if (shieldBtnTxt) shieldBtnTxt.textContent = 'Verrouiller';
    if (shieldGraceSub) shieldGraceSub.textContent = `Accès libre pendant ${mins} min`;
    if (sideGrace) sideGrace.textContent = `${mins} min restantes (Débloqué)`;
  } else if (window.state.screenTime.isShieldActive) {
    if (shieldStatusTitle) shieldStatusTitle.textContent = 'Actif';
    if (shieldBtnTxt) shieldBtnTxt.textContent = 'Pause';
    if (shieldGraceSub) shieldGraceSub.textContent = '12 apps cibles';
    if (sideGrace) sideGrace.textContent = '0 min (Verrouillé)';
  } else {
    if (shieldStatusTitle) shieldStatusTitle.textContent = 'En Pause';
    if (shieldBtnTxt) shieldBtnTxt.textContent = 'Activer';
    if (shieldGraceSub) shieldGraceSub.textContent = 'Protection désactivée';
    if (sideGrace) sideGrace.textContent = 'Pause manuelle';
  }
}

function renderVault(filter = 'all') {
  const container = document.getElementById('vault-items-container');
  const countBadge = document.getElementById('vault-count-badge');
  if (!container) return;
  container.innerHTML = '';

  if (countBadge) countBadge.textContent = `${window.state.vault.length} / 50`;

  let filtered = window.state.vault;
  if (filter !== 'all') filtered = window.state.vault.filter(v => v.category === filter);

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'vault-card';
    card.innerHTML = `
      <div class="vault-card-top">
        <span class="vault-card-cat">${item.category.toUpperCase()}</span>
        <span class="vault-card-date">${item.date}</span>
      </div>
      <p class="vault-card-quote">« ${item.punchline} »</p>
      <div class="vault-card-bot">
        <span class="vault-card-title">🏷️ ${item.title}</span>
        <button class="btn-vault-share" data-quote="${item.punchline}" data-title="${item.title}">📱 Story</button>
      </div>
    `;

    const shareBtn = card.querySelector('.btn-vault-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        openUGCStoryModal(item.punchline, item.title, "STATION LONGÉVITÉ");
      });
    }
    container.appendChild(card);
  });
}

function openUGCStoryModal(quote, title = "AEVUM PUNCHLINE", station = "DÉCOMPRESSION C1-C7") {
  const modal = document.getElementById('ugc-modal-overlay');
  const quoteEl = document.getElementById('ugc-preview-quote');
  if (quoteEl) quoteEl.textContent = quote.replace(/^«\s*|\s*»$/g, '');
  if (modal) modal.classList.remove('hidden');
  window.audio.playChime(600, 'sine', 0.15);
}

function refreshDailyShot() {
  if (!window.DAILY_SHOTS || window.DAILY_SHOTS.length === 0) return;
  window.state.dailyShotIndex = (window.state.dailyShotIndex + 1) % window.DAILY_SHOTS.length;
  const quoteEl = document.getElementById('daily-shot-text');
  if (quoteEl) {
    quoteEl.style.opacity = '0';
    setTimeout(() => {
      quoteEl.textContent = window.DAILY_SHOTS[window.state.dailyShotIndex];
      quoteEl.style.opacity = '1';
    }, 150);
  }
  window.audio.playChime(700, 'sine', 0.1);
}
