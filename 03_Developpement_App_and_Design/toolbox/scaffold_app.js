#!/usr/bin/env node
/**
 * MASTER PLAN — DETERMINISTIC APP SCAFFOLDER (scaffold_app.js)
 * Pilier : 03_Developpement_App_and_Design / Toolbox
 * Rôle : Instanciation standardisée d'une nouvelle application respectant 100% des Quality Gates
 * Plafond strict : < 200 lignes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../../');
const DEV_DIR = path.join(ROOT_DIR, '03_Developpement_App_and_Design');
const APPS_DIR = path.join(DEV_DIR, 'apps');
const TEMPLATES_DIR = path.join(DEV_DIR, 'templates');

function printUsage() {
  console.log(`
Usage: node scaffold_app.js --name=<app_name> [options]

Options:
  --name=<app_name>    Nom de l'application (ex: chronos_lab, neuro_shield)
  --title=<title>      Titre affiché (ex: "Chronos Lab")
  --force              Écrase le dossier si déjà existant
  --dry-run            Simule la création sans écrire sur le disque
  --help               Affiche cette aide
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const params = { name: null, title: null, force: false, dryRun: false };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else if (arg.startsWith('--name=')) {
      params.name = arg.split('=')[1].trim();
    } else if (arg.startsWith('--title=')) {
      params.title = arg.split('=')[1].trim();
    } else if (arg === '--force') {
      params.force = true;
    } else if (arg === '--dry-run') {
      params.dryRun = true;
    } else if (!params.name && !arg.startsWith('--')) {
      params.name = arg.trim();
    }
  }

  if (!params.name) {
    console.error('🚨 Erreur : Le paramètre --name=<app_name> est obligatoire.');
    printUsage();
    process.exit(1);
  }

  // Sanitization
  params.slug = params.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  params.pascalName = params.slug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  params.title = params.title || params.slug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return params;
}

function scaffoldApp(params) {
  const targetAppDir = path.join(APPS_DIR, params.slug);
  console.log('\n============================================================');
  console.log(`🚀 MASTER PLAN : SCAFFOLDING D'APPLICATION -> [${params.slug.toUpperCase()}]`);
  console.log('============================================================\n');

  if (fs.existsSync(targetAppDir)) {
    if (!params.force) {
      console.error(`🚨 Erreur : L'application "${params.slug}" existe déjà dans apps/. Utiliser --force pour écraser.`);
      process.exit(1);
    }
    console.log(`⚠️ Dossier existant détecté : écrasement autorisé (--force).`);
  }

  const dirsToCreate = [
    targetAppDir,
    path.join(targetAppDir, 'AevumApp', 'App'),
    path.join(targetAppDir, 'AevumApp', 'UI'),
    path.join(targetAppDir, 'AevumApp', 'Core'),
    path.join(targetAppDir, 'AevumApp', 'Resources', 'Data'),
    path.join(targetAppDir, 'web_preview', 'data'),
    path.join(targetAppDir, 'web_preview', 'engine'),
    path.join(targetAppDir, 'web_preview', 'assets')
  ];

  if (params.dryRun) {
    console.log('🧪 MODE DRY-RUN : Simulation des dossiers et fichiers :');
    dirsToCreate.forEach(d => console.log(`  📁 [DIR] ${path.relative(ROOT_DIR, d)}`));
    console.log('\nSimulation terminée avec succès.');
    return;
  }

  dirsToCreate.forEach(d => fs.mkdirSync(d, { recursive: true }));

  // 1. Data Contract (Garantie de Parité SHA-256 Native <-> Web)
  const defaultCatalog = [
    {
      id: "ITEM-01",
      title: "Séquence Fondatrice",
      category: "core",
      durationSeconds: 30,
      scientificSource: "Master Plan Standard Architecture",
      xpReward: 10
    }
  ];
  const catalogJSON = JSON.stringify(defaultCatalog, null, 2);
  fs.writeFileSync(path.join(targetAppDir, 'AevumApp', 'Resources', 'Data', 'catalog.json'), catalogJSON);
  fs.writeFileSync(path.join(targetAppDir, 'web_preview', 'data', 'catalog.json'), catalogJSON);

  // 2. Swift Files (Natif iOS)
  const swiftTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'mobile_ios', 'TCA_Feature_Template.swift'), 'utf8');
  fs.writeFileSync(path.join(targetAppDir, 'AevumApp', 'Core', `${params.pascalName}Feature.swift`), swiftTemplate);

  const bentoTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'mobile_ios', 'Bento_Card_Component.swift'), 'utf8');
  fs.writeFileSync(path.join(targetAppDir, 'AevumApp', 'UI', 'BentoCard.swift'), bentoTemplate);

  // 3. Web Preview Assets & Engines
  const cssTokens = fs.readFileSync(path.join(TEMPLATES_DIR, 'web_preview', 'swiss_craft_tokens.css'), 'utf8');
  fs.writeFileSync(path.join(targetAppDir, 'web_preview', 'index.css'), cssTokens);

  const storeJs = fs.readFileSync(path.join(TEMPLATES_DIR, 'web_preview', 'store_unidirectional.js'), 'utf8');
  fs.writeFileSync(path.join(targetAppDir, 'web_preview', 'engine', 'store.js'), storeJs);

  const audioJs = fs.readFileSync(path.join(TEMPLATES_DIR, 'web_preview', 'audio_synth_engine.js'), 'utf8');
  fs.writeFileSync(path.join(targetAppDir, 'web_preview', 'engine', 'audio.js'), audioJs);

  // 4. HTML App Shell (Balises section équilibrées)
  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title} — Swiss Craft Simulator</title>
  <link rel="stylesheet" href="./index.css">
</head>
<body>
  <div style="max-width: 480px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 16px;">
    <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px;">
      <div>
        <span class="badge-status">SYSTÈME OPÉRATIONNEL</span>
        <h1 class="hero-title">${params.title}</h1>
      </div>
    </header>
    <main style="display: flex; flex-direction: column; gap: 16px;">
      <section id="sec-cockpit" class="bento-card">
        <span class="badge-status">COCKPIT UNIDIRECTIONNEL</span>
        <h2 style="font-size: 1.125rem; font-weight: 700; margin-top: 4px;">État Courant</h2>
        <div style="font-size: 2rem; font-weight: 800; color: var(--accent-main); margin: 8px 0;" id="state-val">0</div>
        <div style="display: flex; gap: 8px;">
          <button id="btn-dec" class="btn-primary" style="background: var(--surface-2); color: var(--text-primary);">Décrémenter</button>
          <button id="btn-inc" class="btn-primary">Incrémenter</button>
        </div>
      </section>
    </main>
  </div>
  <script src="./engine/store.js"></script>
  <script src="./engine/audio.js"></script>
  <script src="./app.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(targetAppDir, 'web_preview', 'index.html'), htmlContent);

  // 5. App.js Orchestrateur (< 50 lignes)
  const appJsContent = `/**
 * ${params.pascalName} — Web Preview Orchestrator
 */
const audio = new WebAudioSynthEngine();
function reducer(state = { val: 0 }, action) {
  switch (action.type) {
    case 'INC': return { ...state, val: state.val + 1 };
    case 'DEC': return { ...state, val: Math.max(0, state.val - 1) };
    default: return state;
  }
}
const store = createStore(reducer, { val: 0 });
store.subscribe((state) => {
  document.getElementById('state-val').textContent = state.val;
});
document.getElementById('btn-inc')?.addEventListener('click', () => { audio.playClick(); store.dispatch({ type: 'INC' }); });
document.getElementById('btn-dec')?.addEventListener('click', () => { audio.playClick(); store.dispatch({ type: 'DEC' }); });
`;
  fs.writeFileSync(path.join(targetAppDir, 'web_preview', 'app.js'), appJsContent);

  console.log(`✅ Structure créée dans : 03_Developpement_App_and_Design/apps/${params.slug}/`);
  console.log(`✅ Datasets synchronisés en parité SHA-256.`);
  console.log(`✅ Modèles Swift et Web Preview initialisés.`);

  // Validation immédiate du Quality Gate
  console.log('\n🔍 Lancement du Quality Gate sur la nouvelle application...');
  try {
    const output = execSync('node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js', { cwd: ROOT_DIR, encoding: 'utf8' });
    console.log(output);
    console.log('🎉 INITIALISATION RÉUSSIE : L\'application passe 100% des Quality Gates dès la seconde 0 !');
  } catch (err) {
    console.error('🚨 Échec du Quality Gate après scaffolding :', err.stdout || err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  const params = parseArgs();
  scaffoldApp(params);
}

module.exports = { scaffoldApp };
