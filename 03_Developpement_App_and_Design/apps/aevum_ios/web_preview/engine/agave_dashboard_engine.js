/**
 * AEVUM SIMULATOR — AGAVE DASHBOARD & TRANSIT SWISS ENGINE
 * Module étanche (< 240 lignes)
 * Gère l'Agave biométrique, le Streak 14j, le sas Vidéo->Article et le Memory 4x4.
 */

window.agaveEngine = {
  biometrics: null,
  streakData: null,
  articleData: null,
  memoryState: {
    cards: [],
    flipped: [],
    matched: new Set(),
    score: 1250,
    timer: 45,
    timerId: null,
    isPaused: false
  },
  videoTimerId: null,
  videoSeconds: 42,

  async init() {
    try {
      const [bRes, sRes, aRes] = await Promise.all([
        fetch('./data/agave_biometrics.json'),
        fetch('./data/streak_rewards.json'),
        fetch('./data/decompression_articles.json')
      ]);
      this.biometrics = await bRes.json();
      this.streakData = await sRes.json();
      this.articleData = await aRes.json();
      this.renderDashboard();
      this.bindEvents();
    } catch (err) {
      console.error('[AGAVE_ENGINE] Erreur init:', err);
    }
  },

  renderDashboard() {
    if (!this.biometrics) return;
    // Mise à jour des valeurs des feuilles si éléments présents
    this.biometrics.agave_leaves.forEach(leaf => {
      const tag = document.getElementById(`leaf-val-${leaf.id}`);
      if (tag) tag.textContent = `${leaf.percentage}%`;
    });
  },

  openModal(modalId) {
    document.querySelectorAll('.agave-modal').forEach(m => m.classList.add('hidden'));
    const target = document.getElementById(modalId);
    if (target) target.classList.remove('hidden');
  },

  closeModals() {
    document.querySelectorAll('.agave-modal').forEach(m => m.classList.add('hidden'));
    if (this.memoryState.timerId) clearInterval(this.memoryState.timerId);
    if (this.videoTimerId) clearInterval(this.videoTimerId);
  },

  // 1. MODALE SUIVI AGAVE (IMAGE 1)
  openSuiviAgave() {
    const listEl = document.getElementById('agave-stats-list');
    if (listEl && this.biometrics) {
      listEl.innerHTML = this.biometrics.detailed_statistics.map(s => `
        <div class="stat-row-item">
          <div class="stat-icon-box">${this.getStatIcon(s.icon)}</div>
          <div class="stat-text-col">
            <span class="stat-row-title">${s.label}</span>
            <span class="stat-row-sub">${s.subtext}</span>
          </div>
          <div class="stat-row-val-col">
            <span class="stat-row-value">${s.value}</span>
            <span class="stat-row-arrow">›</span>
          </div>
        </div>
      `).join('');
    }
    this.openModal('modal-suivi-agave');
  },

  // 2. MODALE STREAK & BADGES (IMAGE 3)
  openStreakDetails() {
    const badgesEl = document.getElementById('streak-badges-row');
    if (badgesEl && this.streakData) {
      badgesEl.innerHTML = this.streakData.badges.map(b => `
        <div class="badge-item-card ${b.unlocked ? 'unlocked' : 'locked'}">
          <div class="badge-icon-disc">${this.getBadgeIcon(b.icon)}</div>
          <span class="badge-label">${b.label}</span>
          <span class="badge-date">${b.date}</span>
        </div>
      `).join('');
    }
    this.openModal('modal-streak-rewards');
  },

  // 3. MODALE VIDÉO -> ARTICLE (IMAGE 2)
  openVideoArticle() {
    this.videoSeconds = 42;
    const timeDisplay = document.getElementById('video-timer-display');
    const bar = document.getElementById('video-progress-fill');
    if (this.videoTimerId) clearInterval(this.videoTimerId);

    this.videoTimerId = setInterval(() => {
      if (this.videoSeconds < 45) {
        this.videoSeconds++;
        const pct = (this.videoSeconds / 45) * 100;
        if (timeDisplay) timeDisplay.textContent = `00:${String(this.videoSeconds).padStart(2, '0')} / 00:45`;
        if (bar) bar.style.width = `${pct}%`;
      } else {
        clearInterval(this.videoTimerId);
        const articleSection = document.getElementById('decompression-article-content');
        if (articleSection) articleSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1000);

    this.openModal('modal-video-article');
  },

  // 4. MODALE MINI-JEU MEMORY 4x4 (IMAGE 4)
  initMemoryGame() {
    const symbols = ['⭐', '⭕', '🔺', '⬛', '💠', '🌙', '⚡', '🫁'];
    const deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    this.memoryState = {
      cards: deck,
      flipped: [],
      matched: new Set(),
      score: 1250,
      timer: 45,
      timerId: null,
      isPaused: false
    };

    this.renderMemoryGrid();
    this.startMemoryTimer();
    this.openModal('modal-mini-jeu');
  },

  renderMemoryGrid() {
    const grid = document.getElementById('memory-grid-4x4');
    if (!grid) return;
    grid.innerHTML = '';

    this.memoryState.cards.forEach((sym, idx) => {
      const card = document.createElement('button');
      card.className = 'memory-cell-btn';
      card.dataset.idx = idx;
      const isFlipped = this.memoryState.flipped.includes(idx) || this.memoryState.matched.has(idx);
      card.innerHTML = isFlipped ? `<span class="sym">${sym}</span>` : `<span class="quest">?</span>`;
      card.classList.toggle('revealed', isFlipped);
      card.onclick = () => this.handleCardClick(idx);
      grid.appendChild(card);
    });

    const scoreEl = document.getElementById('memory-score-val');
    if (scoreEl) scoreEl.textContent = this.memoryState.score;
  },

  handleCardClick(idx) {
    if (this.memoryState.isPaused || this.memoryState.matched.has(idx)) return;
    if (this.memoryState.flipped.length >= 2 || this.memoryState.flipped.includes(idx)) return;

    this.memoryState.flipped.push(idx);
    this.renderMemoryGrid();

    if (this.memoryState.flipped.length === 2) {
      const [i1, i2] = this.memoryState.flipped;
      if (this.memoryState.cards[i1] === this.memoryState.cards[i2]) {
        this.memoryState.matched.add(i1);
        this.memoryState.matched.add(i2);
        this.memoryState.score += 200;
        this.memoryState.flipped = [];
        setTimeout(() => this.renderMemoryGrid(), 300);
      } else {
        setTimeout(() => {
          this.memoryState.flipped = [];
          this.renderMemoryGrid();
        }, 900);
      }
    }
  },

  startMemoryTimer() {
    if (this.memoryState.timerId) clearInterval(this.memoryState.timerId);
    const timerEl = document.getElementById('memory-timer-val');
    this.memoryState.timerId = setInterval(() => {
      if (!this.memoryState.isPaused && this.memoryState.timer > 0) {
        this.memoryState.timer--;
        if (timerEl) timerEl.textContent = `00:${String(this.memoryState.timer).padStart(2, '0')}`;
      } else if (this.memoryState.timer === 0) {
        clearInterval(this.memoryState.timerId);
      }
    }, 1000);
  },

  toggleMemoryPause() {
    this.memoryState.isPaused = !this.memoryState.isPaused;
    const btn = document.getElementById('btn-memory-pause');
    if (btn) btn.innerHTML = this.memoryState.isPaused ? '<span>▶ REPRENDRE</span>' : '<span>⏸ PAUSE</span>';
  },

  getStatIcon(icon) {
    const map = { clock: '⏱️', bars: '📊', spine: '🦴', wind: '🫁', shoe: '👟', flame: '🔥', moon: '🌙', heart: '❤️' };
    return map[icon] || '•';
  },

  getBadgeIcon(icon) {
    const map = { star: '⭐', flame: '🔥', trophy: '🏆', medal: '🎖️', diamond: '💎', lock: '🔒' };
    return map[icon] || '🏅';
  },

  bindEvents() {
    document.getElementById('card-agave-hero')?.addEventListener('click', () => this.openSuiviAgave());
    document.getElementById('widget-streak-header')?.addEventListener('click', () => this.openStreakDetails());
    document.getElementById('card-bento-video')?.addEventListener('click', () => this.openVideoArticle());
    document.getElementById('card-bento-game')?.addEventListener('click', () => this.initMemoryGame());
    document.querySelectorAll('.btn-modal-close').forEach(b => b.addEventListener('click', () => this.closeModals()));
    document.getElementById('btn-memory-restart')?.addEventListener('click', () => this.initMemoryGame());
    document.getElementById('btn-memory-pause')?.addEventListener('click', () => this.toggleMemoryPause());
  }
};

window.addEventListener('DOMContentLoaded', () => window.agaveEngine.init());
