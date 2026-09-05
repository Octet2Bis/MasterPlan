/**
 * MASTER PLAN COCKPIT — CLIENT ORCHESTRATOR (Visual Support Only)
 * Plafond strict : < 60 lignes
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/manifest');
    const manifest = await res.json();

    const nav = new NavigationEngine();
    const live = new LiveRendererEngine();

    nav.onContextChanged = ({ tab, project }) => {
      live.render(project, tab);
    };

    // Initialisation sur l'onglet par défaut (01. GTM & Growth)
    await nav.init(manifest, manifest.default_tab || 'gtm');

    // Boutons d'action système dans le header
    document.getElementById('btn-run-tests')?.addEventListener('click', () => {
      live.triggerAction('Tester Intégrité Code');
    });

    document.getElementById('btn-run-dag')?.addEventListener('click', () => {
      live.triggerAction('Valider Topologie DAG');
    });

    console.log('🌌 Master Plan Visual Cockpit actif.');
  } catch (err) {
    console.error('🚨 Erreur d\'initialisation du Cockpit :', err);
  }
});
