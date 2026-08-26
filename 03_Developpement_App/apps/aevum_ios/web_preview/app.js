/**
 * AEVUM SIMULATOR — MAIN ORCHESTRATOR
 * Architecture Modulaire (< 90 lignes)
 */

window.state = {
  profile: {
    chronologicalAge: 30,
    estimatedBiologicalAge: 33.5,
    vitalityScore: 78,
    totalXp: 145,
    completedChallengesCount: 6,
    streakDays: 3,
    dailyScreenHours: 6.5,
    dailyUnconsciousUnlocks: 40,
    selectedTargets: ['postureMobility', 'nervousSystem'],
    selectedDosage: 'balanced'
  },
  currentCircadianSlot: 'afternoon',
  screenTime: { isShieldActive: true, gracePeriodSeconds: 0 },
  activeProtocol: null,
  activeHappening: null,
  activeHappeningMode: 'chalkboard',
  chalkCount: 2,
  fingersDown: new Set(),
  isShrimpFixed: false,
  selectedCaptchaCells: new Set(),
  dailyShotIndex: 0,
  vault: [
    { id: "v1", happeningId: "HAP-01", title: "Le Tableau Noir de Bart Simpson", category: "mantras", punchline: "Pardonné. Tu as prouvé que tes doigts savent encore faire autre chose que scroller.", date: "Aujourd'hui" },
    { id: "v2", happeningId: "HAP-11", title: "Le Doigt d'Honneur Anti-Flemme", category: "fingers", punchline: "Geste de défi officiellement adressé à ta procrastination.", date: "Aujourd'hui" },
    { id: "v3", happeningId: "HAP-21", title: "Le Détecteur de Crevette AR", category: "posture", punchline: "Carapace brisée ! Ton squelette est redevenu celui d'un bipède noble.", date: "Hier" },
    { id: "v4", happeningId: "HAP-31", title: "Le Captcha « Touchez de l'Herbe »", category: "neuro", punchline: "Félicitations, tu te souviens encore que l'herbe est verte et pousse dehors.", date: "Hier" }
  ],
  playerTimerInterval: null,
  graceTimerInterval: null
};

async function loadDatasets() {
  try {
    const [pRes, hRes, dRes] = await Promise.all([
      fetch('./data/longevity_catalog.json'),
      fetch('./data/happenings_catalog.json'),
      fetch('./data/daily_shots.json')
    ]);
    window.LONGEVITY_CATALOG = await pRes.json();
    window.HAPPENINGS_CATALOG = await hRes.json();
    window.DAILY_SHOTS = await dRes.json();
    if (window.graphEngine && typeof window.graphEngine.init === 'function') {
      await window.graphEngine.init('./data/protocol_graph.json');
    }
  } catch (e) {
    console.error('Erreur chargement datasets JSON:', e);
  }
}

async function initApp() {
  try {
    await loadDatasets();
    if (typeof renderProtocolList === 'function') renderProtocolList('all');
    if (typeof updateCircadianRecommendation === 'function') updateCircadianRecommendation();
    if (typeof updateUI === 'function') updateUI();
    if (typeof TransitNetworkEngine === 'function') window.transitEngine = new TransitNetworkEngine();
  } catch (err) {
    console.warn('Initialisation sécurisée:', err);
  }

  // Écouteurs globaux
  document.getElementById('btn-refresh-shot')?.addEventListener('click', refreshDailyShot);
  document.getElementById('btn-share-daily-shot')?.addEventListener('click', () => {
    const quote = document.getElementById('daily-shot-text')?.textContent || "Aevum Sagesse";
    openUGCStoryModal(quote, "DAILY SHOT", "STATION MATINALE");
  });

  // Topbar Actions
  document.getElementById('btn-trigger-happening')?.addEventListener('click', () => launchHappening('chalkboard'));
  document.getElementById('btn-open-vault')?.addEventListener('click', () => { renderVault('all'); switchScreen('screen-vault'); });
  document.getElementById('btn-go-dashboard')?.addEventListener('click', () => switchScreen('screen-dashboard'));
  document.getElementById('btn-close-happening')?.addEventListener('click', () => switchScreen('screen-dashboard'));
  document.getElementById('btn-close-vault')?.addEventListener('click', () => switchScreen('screen-dashboard'));
  document.getElementById('btn-close-breathing')?.addEventListener('click', () => switchScreen('screen-dashboard'));
  document.getElementById('btn-close-mobility')?.addEventListener('click', () => switchScreen('screen-dashboard'));
  document.getElementById('btn-finish-reward')?.addEventListener('click', () => switchScreen('screen-dashboard'));
  document.getElementById('btn-close-ugc')?.addEventListener('click', () => document.getElementById('ugc-modal-overlay')?.classList.add('hidden'));

  // Mini-jeux WarioWare
  document.querySelectorAll('.h-mode-btn').forEach(btn => btn.addEventListener('click', () => launchHappening(btn.getAttribute('data-mode'))));
  document.getElementById('btn-chalk-tap')?.addEventListener('click', stepChalkboardGame);
  document.querySelectorAll('.finger-group').forEach(fg => fg.addEventListener('click', () => toggleFingerGame(parseInt(fg.getAttribute('data-finger'), 10))));
  document.getElementById('btn-fix-shrimp-posture')?.addEventListener('click', fixShrimpPostureGame);
  document.querySelectorAll('.captcha-cell').forEach(cell => cell.addEventListener('click', () => toggleCaptchaCell(cell)));
  document.getElementById('btn-verify-captcha')?.addEventListener('click', verifyCaptchaGame);
  document.getElementById('btn-happening-done')?.addEventListener('click', () => { window.state.screenTime.gracePeriodSeconds = 900; startGracePeriodCountdown(); switchScreen('screen-dashboard'); });

  // Transit Cards Actions (Music OS)
  document.getElementById('card-action-sigh')?.addEventListener('click', () => launchProtocolById('breath-sigh'));
  document.getElementById('card-action-spine')?.addEventListener('click', () => launchProtocolById('mob-spine'));
  document.getElementById('card-action-shrimp')?.addEventListener('click', () => launchHappening('shrimp'));
  document.getElementById('btn-open-grid-keypad')?.addEventListener('click', () => switchScreen('screen-transit-network'));
  document.getElementById('btn-close-transit-top')?.addEventListener('click', () => switchScreen('screen-dashboard'));
  document.getElementById('btn-ruler-vault')?.addEventListener('click', () => { renderVault('all'); switchScreen('screen-vault'); });
  document.getElementById('btn-ruler-shield')?.addEventListener('click', () => document.getElementById('shield-native-overlay')?.classList.remove('hidden'));

  // 12-Button Keypad Tokens
  document.querySelectorAll('.token-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const protoId = btn.getAttribute('data-proto');
      window.audio.playChime(640, 'sine', 0.1);
      if (protoId) launchProtocolById(protoId);
    });
  });

  // Teenage Engineering Knobs Interaction
  document.querySelectorAll('.te-hardware-knob').forEach(knob => {
    knob.addEventListener('click', () => {
      const currentRot = knob.dataset.rot ? parseInt(knob.dataset.rot, 10) : 0;
      const nextRot = (currentRot + 45) % 360;
      knob.dataset.rot = nextRot;
      knob.style.transform = `rotate(${nextRot}deg)`;
      window.audio.playChime(700 + nextRot, 'triangle', 0.05);
    });
  });

  // Jog Wheel Center Action
  document.getElementById('btn-jog-launch')?.addEventListener('click', () => launchProtocolById('breath-sigh'));

  // Shield Native Overlay Actions
  document.getElementById('btn-shield-accept')?.addEventListener('click', () => {
    document.getElementById('shield-native-overlay')?.classList.add('hidden');
    launchProtocolById('mob-spine');
  });
  document.getElementById('btn-shield-dismiss')?.addEventListener('click', () => {
    document.getElementById('shield-native-overlay')?.classList.add('hidden');
    switchScreen('screen-dashboard');
  });
  document.getElementById('btn-shield-override')?.addEventListener('click', () => {
    document.getElementById('shield-native-overlay')?.classList.add('hidden');
    window.state.screenTime.gracePeriodSeconds = 900;
    startGracePeriodCountdown();
    switchScreen('screen-dashboard');
    window.audio.playSuccess();
  });

  // Topbar Controls (Thème, Mode Cadre, Reset)
  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  const themeIcon = document.getElementById('theme-btn-icon');
  const themeTxt = document.getElementById('theme-btn-txt');
  if (btnToggleTheme) {
    btnToggleTheme.addEventListener('click', () => {
      const isLight = document.body.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.body.removeAttribute('data-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeTxt) themeTxt.textContent = 'Mode Lumineux';
      } else {
        document.body.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeTxt) themeTxt.textContent = 'Mode Nuit';
      }
      window.audio.playChime(500, 'sine', 0.1);
    });
  }

  const btnToggleFrame = document.getElementById('btn-toggle-frame');
  const iphoneFrame = document.getElementById('iphone-frame');
  if (btnToggleFrame && iphoneFrame) {
    btnToggleFrame.addEventListener('click', () => {
      iphoneFrame.classList.toggle('no-frame');
      window.audio.playChime(420, 'sine', 0.1);
    });
  }

  const btnResetDemo = document.getElementById('btn-reset-demo');
  if (btnResetDemo) {
    btnResetDemo.addEventListener('click', () => {
      window.state.profile.vitalityScore = 78;
      window.state.profile.totalXp = 145;
      window.state.screenTime.gracePeriodSeconds = 0;
      window.state.screenTime.isShieldActive = true;
      updateUI();
      switchScreen('screen-dashboard');
      window.audio.playSuccess();
    });
  }

  // Lancement sur le Système de Grille Vivante (YOU ARE HERE)
  switchScreen('screen-dashboard');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
