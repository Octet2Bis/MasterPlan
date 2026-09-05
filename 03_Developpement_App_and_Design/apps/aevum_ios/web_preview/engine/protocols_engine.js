/**
 * AEVUM SIMULATOR — PROTOCOLS & CIRCADIAN ENGINE
 * Module étanche (< 200 lignes)
 */

function calculateBioAge() {
  let delta = 0.0;
  if (window.state.profile.dailyScreenHours > 8.0) delta += 2.5;
  else if (window.state.profile.dailyScreenHours > 5.0) delta += 1.2;
  if (window.state.profile.dailyUnconsciousUnlocks > 50) delta += 1.8;
  else if (window.state.profile.dailyUnconsciousUnlocks > 25) delta += 0.8;
  delta += (window.state.profile.selectedTargets.length >= 3 || window.state.profile.selectedTargets.includes('all')) ? 1.6 : 0.8;

  window.state.profile.estimatedBiologicalAge = Number((window.state.profile.chronologicalAge + delta).toFixed(1));
  window.state.profile.vitalityScore = Math.max(35, Math.min(99, Math.round(100 - (delta * 6))));
  updateUI();
}

function updateCircadianRecommendation() {
  let recProto = null;
  if (window.graphEngine && typeof window.graphEngine.resolveIntervention === 'function') {
    const intervention = window.graphEngine.resolveIntervention({
      hour: new Date().getHours(),
      sessionMinutes: 25,
      category: window.state.profile.selectedTargets[0] || 'all'
    });
    if (intervention && window.LONGEVITY_CATALOG) {
      recProto = window.LONGEVITY_CATALOG.find(p => p.id === intervention.protocolId);
    }
  }

  if (!recProto) {
    let pool = window.LONGEVITY_CATALOG || [];
    if (!window.state.profile.selectedTargets.includes('all') && window.state.profile.selectedTargets.length > 0) {
      pool = pool.filter(p => window.state.profile.selectedTargets.includes(p.category));
    }
    if (pool.length === 0) pool = window.LONGEVITY_CATALOG || [];
    const slot = window.state.currentCircadianSlot;
    recProto = pool.find(p => p.slot && p.slot.includes(slot)) || pool[0];
  }
  if (!recProto) return;

  const btn = document.getElementById('btn-launch-recommended');
  if (btn) btn.onclick = () => launchProtocol(recProto);
}

function renderProtocolList(filter = 'all') {
  const container = document.getElementById('protocol-list-container');
  if (!container || !window.LONGEVITY_CATALOG) return;
  container.innerHTML = '';
}

function launchProtocol(proto) {
  window.state.activeProtocol = proto;
  if (proto.category === 'nervousSystem') startBreathingPlayer(proto);
  else startMobilityPlayer(proto);
}

function launchProtocolById(id) {
  let proto = (window.LONGEVITY_CATALOG || []).find(p => p.id === id);
  if (!proto) {
    const isBreath = id.includes('sigh') || id.includes('breath') || id.includes('box') || id.includes('478');
    proto = {
      id: id,
      category: isBreath ? 'nervousSystem' : 'postureMobility',
      title: isBreath ? 'Soupir Physiologique' : 'Décompression C1-C7 (Text Neck)',
      scientificSource: isBreath ? 'Stanford Medicine' : 'Dr. Hansraj (2014)',
      targetAnatomy: isBreath ? 'Nerf Vague' : 'Rachis Cervical',
      durationSeconds: isBreath ? 26 : 45,
      steps: isBreath ? [
        { phase: 'Double Inspiration', duration: 4, text: 'Inspirez à fond par le nez, puis reprenez de l’air.' },
        { phase: 'Expiration Lente', duration: 8, text: 'Expirez lentement par la bouche.' },
        { phase: 'Récupération', duration: 14, text: 'Apaisement parasympathique immédiat.' }
      ] : [
        { phase: 'Traction Axiale', duration: 15, text: 'Grandissez-vous vers le ciel.' },
        { phase: 'Ouverture Scapulaire', duration: 15, text: 'Resserrez les omoplates.' },
        { phase: 'Relâchement', duration: 15, text: 'Détendez les épaules.' }
      ]
    };
  }
  launchProtocol(proto);
}

function startBreathingPlayer(proto) {
  switchScreen('screen-player-breathing');
  const title = document.getElementById('player-breath-title');
  const source = document.getElementById('player-breath-source');
  if (title) title.textContent = proto.title;
  if (source) source.textContent = `${proto.scientificSource} • ${proto.targetAnatomy}`;

  let stepIdx = 0;
  const steps = proto.steps || [{ phase: "Respiration", duration: proto.durationSeconds, text: "Respirez calmement." }];
  
  function nextStep() {
    if (stepIdx >= steps.length) {
      completeProtocolReward(proto);
      return;
    }
    const current = steps[stepIdx];
    const phaseEl = document.getElementById('orb-phase');
    const timerEl = document.getElementById('orb-timer');
    if (phaseEl) phaseEl.textContent = current.phase.toUpperCase();
    if (current.phase.includes('Inspir')) window.audio.playInhale();
    else if (current.phase.includes('Expir')) window.audio.playExhale();

    let remaining = current.duration;
    if (timerEl) timerEl.textContent = `00:${String(Math.ceil(remaining)).padStart(2, '0')}`;

    clearInterval(window.state.playerTimerInterval);
    window.state.playerTimerInterval = setInterval(() => {
      remaining -= 0.1;
      if (timerEl) timerEl.textContent = `00:${String(Math.max(0, Math.ceil(remaining))).padStart(2, '0')}`;
      if (remaining <= 0) {
        clearInterval(window.state.playerTimerInterval);
        stepIdx++;
        nextStep();
      }
    }, 100);
  }
  nextStep();
}

function startMobilityPlayer(proto) {
  switchScreen('screen-player-mobility');
  const title = document.getElementById('player-mob-title');
  const source = document.getElementById('player-mob-source');
  const numEl = document.getElementById('mob-time-num');
  if (title) title.textContent = proto.title;
  if (source) source.textContent = `${proto.scientificSource} • ${proto.targetAnatomy}`;

  let remaining = proto.durationSeconds;
  if (numEl) numEl.textContent = `00:${String(remaining).padStart(2, '0')}`;

  clearInterval(window.state.playerTimerInterval);
  window.state.playerTimerInterval = setInterval(() => {
    remaining--;
    if (numEl) numEl.textContent = `00:${String(Math.max(0, remaining)).padStart(2, '0')}`;
    if (remaining <= 0) {
      clearInterval(window.state.playerTimerInterval);
      completeProtocolReward(proto);
    }
  }, 1000);
}

function completeProtocolReward(proto) {
  window.audio.playSuccess();
  window.state.profile.totalXp += (proto.xpReward || 15);
  window.state.profile.completedChallengesCount++;
  window.state.screenTime.gracePeriodSeconds = 900;
  startGracePeriodCountdown();

  const nameEl = document.getElementById('reward-proto-name');
  if (nameEl) nameEl.textContent = proto.title;
  switchScreen('screen-reward');
  updateUI();
}

function startGracePeriodCountdown() {
  clearInterval(window.state.graceTimerInterval);
  window.state.graceTimerInterval = setInterval(() => {
    if (window.state.screenTime.gracePeriodSeconds > 0) {
      window.state.screenTime.gracePeriodSeconds--;
      updateUI();
    } else {
      clearInterval(window.state.graceTimerInterval);
      updateUI();
    }
  }, 1000);
}

class TransitNetworkEngine {
  constructor() {
    this.btnZoom = document.getElementById('btn-transit-zoom');
    this.title = document.getElementById('transit-network-title');
    this.sub = document.getElementById('transit-network-sub');
    this.currentStage = 0;
    this.stages = [
      { title: "YOUR NETWORK<br>IS READY", sub: "PINCH TO DISCOVER YOUR NETWORK" },
      { title: "4 BIO-LINES<br>ACTIVE", sub: "POSTURE • NERVOUS • VISION • HYDRATION" }
    ];
  }
}
