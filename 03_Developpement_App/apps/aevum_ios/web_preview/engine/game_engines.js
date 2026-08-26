/**
 * AEVUM SIMULATOR — WARIO-WARE MINI GAMES ENGINE
 * Module étanche (< 150 lignes)
 */

function launchHappening(happeningOrMode = 'chalkboard') {
  let happening = null;
  const catalog = window.HAPPENINGS_CATALOG || [];

  if (typeof happeningOrMode === 'string') {
    if (happeningOrMode === 'chalkboard') happening = catalog[0];
    else if (happeningOrMode === 'finger') happening = catalog[10] || catalog[0];
    else if (happeningOrMode === 'shrimp') happening = catalog[20] || catalog[0];
    else if (happeningOrMode === 'captcha') happening = catalog[30] || catalog[0];
    else happening = catalog.find(h => h.id === happeningOrMode) || catalog[0];
  } else {
    happening = happeningOrMode;
  }

  if (!happening) {
    happening = {
      id: "HAP-01",
      title: "Le Tableau Noir de Bart Simpson",
      category: "mantras",
      type: "rapidTapping",
      durationSeconds: 5,
      anatomy: "Cortex & Motricité fine",
      benefit: "Rupture de transe dopaminergique",
      punchline: "Pardonné. Tu as prouvé que tes doigts savent encore faire autre chose que scroller.",
      promptInstruction: "Tapez 5 fois rapidement pour écrire la punition à la craie."
    };
  }

  window.state.activeHappening = happening;
  window.state.activeHappeningMode = happening.type === 'rapidTapping' ? 'chalkboard' :
                                    happening.type === 'fingerSculptor' ? 'finger' :
                                    happening.type === 'arCamera' ? 'shrimp' :
                                    happening.type === 'captcha' ? 'captcha' : 'chalkboard';

  const titleEl = document.getElementById('happening-top-title');
  const timerBadge = document.getElementById('happening-timer-badge');
  const targetEl = document.getElementById('happening-anatomy-target');
  const benefitEl = document.getElementById('happening-benefit-target');
  const rewardCard = document.getElementById('happening-reward-card');
  const rewardText = document.getElementById('happening-reward-text');

  if (titleEl) titleEl.textContent = happening.title;
  if (timerBadge) timerBadge.textContent = `${happening.durationSeconds}s`;
  if (targetEl) targetEl.textContent = `🎯 ${happening.anatomy}`;
  if (benefitEl) benefitEl.textContent = `🔬 ${happening.benefit}`;
  if (rewardCard) rewardCard.classList.add('hidden');
  if (rewardText) rewardText.textContent = `« ${happening.punchline} »`;

  document.querySelectorAll('.h-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === window.state.activeHappeningMode);
  });

  document.querySelectorAll('.game-view').forEach(v => v.classList.add('hidden'));
  const activeView = document.getElementById(`game-${window.state.activeHappeningMode}-view`);
  if (activeView) activeView.classList.remove('hidden');

  resetHappeningGameState();
  switchScreen('screen-happening-player');
  window.audio.playChime(500, 'sine', 0.2);
}

function resetHappeningGameState() {
  window.state.chalkCount = 2;
  const chalkStamp = document.getElementById('chalk-stamp-cleared');
  const chalkCountEl = document.getElementById('chalk-count');
  if (chalkStamp) chalkStamp.classList.add('hidden');
  if (chalkCountEl) chalkCountEl.textContent = window.state.chalkCount;
  renderChalkboardLines();

  window.state.fingersDown.clear();
  document.querySelectorAll('.finger-group').forEach(fg => fg.classList.remove('folded'));
  updateFingerCountUI();

  window.state.isShrimpFixed = false;
  const shrimpCircle = document.getElementById('shrimp-ar-circle');
  const shrimpEmoji = document.getElementById('shrimp-emoji');
  const shrimpLevel = document.getElementById('shrimp-level-txt');
  if (shrimpCircle) shrimpCircle.classList.remove('fixed');
  if (shrimpEmoji) shrimpEmoji.textContent = '🦞';
  if (shrimpLevel) {
    shrimpLevel.textContent = 'NIVEAU DE CREVETTE : 94%';
    shrimpLevel.style.color = 'var(--accent-red)';
  }

  window.state.selectedCaptchaCells.clear();
  document.querySelectorAll('.captcha-cell').forEach(c => c.classList.remove('selected'));
}

function stepChalkboardGame() {
  window.audio.playChalkScreech();
  window.state.chalkCount = Math.min(5, window.state.chalkCount + 1);
  const chalkCountEl = document.getElementById('chalk-count');
  if (chalkCountEl) chalkCountEl.textContent = window.state.chalkCount;
  renderChalkboardLines();

  if (window.state.chalkCount >= 5) {
    const chalkStamp = document.getElementById('chalk-stamp-cleared');
    if (chalkStamp) chalkStamp.classList.remove('hidden');
    window.audio.playVintageStamp();
    setTimeout(completeHappeningSuccess, 400);
  }
}

function renderChalkboardLines() {
  const container = document.getElementById('chalkboard-lines-container');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 1; i <= window.state.chalkCount; i++) {
    const p = document.createElement('p');
    p.className = 'chalk-line written';
    p.textContent = `${i}. Je suis génial et je m'aime.`;
    container.appendChild(p);
  }
  if (window.state.chalkCount < 5) {
    const p = document.createElement('p');
    p.className = 'chalk-line placeholder';
    p.textContent = `${window.state.chalkCount + 1}. [Tapez pour écrire la ligne suivante à la craie...]`;
    container.appendChild(p);
  }
}

function toggleFingerGame(fingerIndex) {
  const fingerGroup = document.getElementById(`svg-finger-${fingerIndex}`);
  if (window.state.fingersDown.has(fingerIndex)) {
    window.state.fingersDown.delete(fingerIndex);
    if (fingerGroup) fingerGroup.classList.remove('folded');
    window.audio.playChime(300 + fingerIndex * 50, 'sine', 0.1);
  } else {
    window.state.fingersDown.add(fingerIndex);
    if (fingerGroup) fingerGroup.classList.add('folded');
    window.audio.playChime(200 + fingerIndex * 40, 'triangle', 0.1);
  }
  updateFingerCountUI();

  if (!window.state.fingersDown.has(2) && window.state.fingersDown.size === 4) {
    window.audio.playCartoonHorn();
    setTimeout(completeHappeningSuccess, 500);
  }
}

function updateFingerCountUI() {
  const countEl = document.getElementById('fingers-down-count');
  if (countEl) countEl.textContent = window.state.fingersDown.size;
}

function fixShrimpPostureGame() {
  window.state.isShrimpFixed = true;
  window.audio.playGlassShatter();
  const shrimpCircle = document.getElementById('shrimp-ar-circle');
  const shrimpEmoji = document.getElementById('shrimp-emoji');
  const shrimpLevel = document.getElementById('shrimp-level-txt');
  if (shrimpCircle) shrimpCircle.classList.add('fixed');
  if (shrimpEmoji) shrimpEmoji.textContent = '👑';
  if (shrimpLevel) {
    shrimpLevel.textContent = 'POSTURE ROYALE RÉTABLIE (0 kg)';
    shrimpLevel.style.color = 'var(--emerald-accent)';
  }
  setTimeout(completeHappeningSuccess, 600);
}

function toggleCaptchaCell(cellElement) {
  cellElement.classList.toggle('selected');
  window.audio.playChime(450, 'sine', 0.1);
}

function verifyCaptchaGame() {
  const selected = document.querySelectorAll('.captcha-cell.selected');
  let isAllGrass = selected.length === 3;
  selected.forEach(cell => {
    if (cell.getAttribute('data-is-grass') !== 'true') isAllGrass = false;
  });

  if (isAllGrass) {
    window.audio.playVintageStamp();
    completeHappeningSuccess();
  } else {
    window.audio.playChime(150, 'sawtooth', 0.2);
    alert("Sélection incorrecte ! Cliquez uniquement sur les 3 cases contenant de l'herbe réelle.");
  }
}

function completeHappeningSuccess() {
  window.audio.playSuccess();
  const rewardCard = document.getElementById('happening-reward-card');
  if (rewardCard) rewardCard.classList.remove('hidden');

  if (window.state.activeHappening) {
    const existing = window.state.vault.find(v => v.happeningId === window.state.activeHappening.id);
    if (!existing) {
      window.state.vault.unshift({
        id: `v_${Date.now()}`,
        happeningId: window.state.activeHappening.id,
        title: window.state.activeHappening.title,
        category: window.state.activeHappening.category,
        punchline: window.state.activeHappening.punchline,
        date: "Aujourd'hui"
      });
    }
  }
}
