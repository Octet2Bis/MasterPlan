/**
 * MASTER PLAN COCKPIT — NAVIGATION & CONTEXT LOCK ENGINE
 * Plafond strict : < 150 lignes
 */

class NavigationEngine {
  constructor() {
    this.manifest = null;
    this.activeTabId = 'dev';
    this.activeProject = null;
    this.onContextChanged = null;
  }

  async init(manifest, defaultTab = 'dev') {
    this.manifest = manifest;
    this.activeTabId = defaultTab;
    this.setupTabListeners();
    this.switchTab(this.activeTabId);
  }

  setupTabListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });
  }

  switchTab(tabId) {
    this.activeTabId = tabId;
    const tabData = this.manifest.tabs.find(t => t.id === tabId);
    if (!tabData) return;

    // Mise à jour des boutons d'onglet
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Mise à jour des en-têtes du pilier
    const pillarLabel = document.getElementById('tab-pillar-label');
    const descText = document.getElementById('tab-desc-text');
    const countBadge = document.getElementById('tab-project-count');

    if (pillarLabel) pillarLabel.textContent = tabData.pillar.toUpperCase();
    if (descText) descText.textContent = tabData.description;
    if (countBadge) countBadge.textContent = `${tabData.projects.length} PROJET(S)`;

    // Rendu de la liste des projets
    this.renderProjectList(tabData);

    // Sélection du premier projet par défaut
    if (tabData.projects.length > 0) {
      this.selectProject(tabData.projects[0]);
    }
  }

  renderProjectList(tabData) {
    const container = document.getElementById('project-list-container');
    if (!container) return;
    container.innerHTML = '';

    tabData.projects.forEach(proj => {
      const card = document.createElement('div');
      card.className = `project-card ${this.activeProject?.id === proj.id ? 'active' : ''}`;
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div class="project-title">${proj.name}</div>
          <span class="status-pill" style="font-size: 9px;">${proj.status}</span>
        </div>
        <div class="project-category">${proj.category}</div>
        <div style="margin-top: 6px;">
          ${proj.target_files.map(f => `<span class="file-tag">${f.split('/').pop()}</span>`).join('')}
        </div>
      `;
      card.addEventListener('click', () => this.selectProject(proj));
      container.appendChild(card);
    });
  }

  selectProject(project) {
    this.activeProject = project;

    // Mise à jour visuelle des cartes
    document.querySelectorAll('.project-card').forEach((card, idx) => {
      const tabData = this.manifest.tabs.find(t => t.id === this.activeTabId);
      const isTarget = tabData?.projects[idx]?.id === project.id;
      card.classList.toggle('active', isTarget);
    });

    // Déclenchement du callback de changement de contexte
    if (this.onContextChanged) {
      const tabData = this.manifest.tabs.find(t => t.id === this.activeTabId);
      this.onContextChanged({
        tab: tabData,
        project: this.activeProject
      });
    }
  }
}

window.NavigationEngine = NavigationEngine;
