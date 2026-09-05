/**
 * MASTER PLAN COCKPIT — LIVE RENDER ENGINE
 * Plafond strict : < 160 lignes
 */

class LiveRendererEngine {
  constructor() {
    this.container = document.getElementById('live-frame-container');
    this.titleElem = document.getElementById('live-panel-title');
    this.actionsBar = document.getElementById('live-actions-bar');
  }

  render(project, tab) {
    if (!this.container || !project) return;

    if (this.titleElem) this.titleElem.textContent = project.name;
    this.renderActions(project.actions || []);

    const preview = project.live_preview;
    if (!preview) {
      this.container.innerHTML = `<div class="live-content-view"><p>Aucun aperçu disponible pour ce composant.</p></div>`;
      return;
    }

    if (preview.type === 'iframe') {
      this.container.innerHTML = `
        <iframe class="live-iframe" src="${preview.endpoint}" title="${preview.title}" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
      `;
    } else {
      this.renderSnippetOrFile(preview, project);
    }
  }

  renderActions(actions) {
    if (!this.actionsBar) return;
    this.actionsBar.innerHTML = '';

    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.className = 'btn-action';
      btn.textContent = `⚡ ${action}`;
      btn.addEventListener('click', () => this.triggerAction(action));
      this.actionsBar.appendChild(btn);
    });
  }

  async triggerAction(action) {
    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      
      // Notification d'exécution
      const statusPill = document.getElementById('system-status-pill');
      if (statusPill) {
        statusPill.textContent = data.success ? '● SUCCÈS' : '▲ ERREUR';
        statusPill.style.color = data.success ? 'var(--accent-gtm)' : 'var(--accent-danger)';
        setTimeout(() => {
          statusPill.textContent = '● OPÉRATIONNEL';
          statusPill.style.color = 'var(--accent-gtm)';
        }, 3000);
      }
      
      alert(`[ACTION] ${action}\n\n${data.output}`);
    } catch (err) {
      alert(`Erreur d'exécution : ${err.message}`);
    }
  }

  async renderSnippetOrFile(preview, project) {
    this.container.innerHTML = `
      <div class="live-content-view">
        <h3 style="font-family: var(--font-title); font-size: 16px; margin-bottom: 12px;">${preview.title}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
          Périmètre actif : <strong>${project.category}</strong>. Fichiers cibles verrouillés.
        </p>
        <div style="margin-bottom: 16px;">
          ${project.target_files.map(f => `<div style="font-family: var(--font-mono); font-size: 12px; margin: 4px 0; color: var(--accent-dev);">📄 ${f}</div>`).join('')}
        </div>
        <pre><code id="live-code-snippet">Chargement des données en direct...</code></pre>
      </div>
    `;

    try {
      const res = await fetch(preview.endpoint);
      const text = await res.text();
      const codeElem = document.getElementById('live-code-snippet');
      if (codeElem) codeElem.textContent = text.slice(0, 3000);
    } catch {
      const codeElem = document.getElementById('live-code-snippet');
      if (codeElem) codeElem.textContent = 'Prêt pour l\'intervention.';
    }
  }
}

window.LiveRendererEngine = LiveRendererEngine;
