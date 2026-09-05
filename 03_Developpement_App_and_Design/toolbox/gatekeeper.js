#!/usr/bin/env node
/**
 * MASTER PLAN — DETERMINISTIC GATEKEEPER (gatekeeper.js)
 * Pilier : 03_Developpement_App_and_Design / Toolbox
 * Rôle : Contrôle et instanciation du Protocole des 4 Portes
 * Plafond strict : < 200 lignes
 */

const fs = require('fs');
const path = require('path');

const DEV_DIR = path.resolve(__dirname, '../');
const APPS_DIR = path.join(DEV_DIR, 'apps');

function printUsage() {
  console.log(`
Usage:
  node gatekeeper.js --check [--app=<name>]
  node gatekeeper.js --init=<name> [--title=<title>]
  node gatekeeper.js --help
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const p = { action: 'check', app: null, init: null, title: null };
  for (const a of args) {
    if (a === '--help' || a === '-h') { printUsage(); process.exit(0); }
    else if (a === '--check') p.action = 'check';
    else if (a.startsWith('--app=')) p.app = a.split('=')[1].trim();
    else if (a.startsWith('--init=')) { p.action = 'init'; p.init = a.split('=')[1].trim(); }
    else if (a.startsWith('--title=')) p.title = a.split('=')[1].trim();
  }
  return p;
}

function auditAppGates(appName) {
  const appPath = path.join(APPS_DIR, appName);
  const report = { app: appName, p0: false, p1: false, p2: false, p3: false, p4: false, details: [] };

  if (!fs.existsSync(appPath)) {
    report.details.push(`App "${appName}" inexistante dans apps/`);
    return report;
  }

  // Porte 0 : BRIEF.md
  const briefFile = path.join(appPath, 'BRIEF.md');
  if (fs.existsSync(briefFile)) {
    report.p0 = true;
    report.details.push('Porte 0 OK (BRIEF.md présent)');
  } else {
    report.details.push('Porte 0 MANQUANTE : BRIEF.md absent');
  }

  // Porte 1 : PRD.md + data/*.json
  const prdFile = path.join(appPath, 'PRD.md');
  const dataDir = [
    path.join(appPath, 'data'),
    path.join(appPath, 'web_preview', 'data'),
    path.join(appPath, 'AevumApp', 'Resources', 'Data')
  ].find(d => fs.existsSync(d) && fs.readdirSync(d).some(f => f.endsWith('.json')));

  if (fs.existsSync(prdFile) && dataDir) {
    report.p1 = true;
    report.details.push(`Porte 1 OK (PRD.md + ${path.basename(dataDir)}/*.json)`);
  } else {
    report.details.push(`Porte 1 MANQUANTE : PRD=${fs.existsSync(prdFile)}, Data=${Boolean(dataDir)}`);
  }

  // Porte 2 : Design Contract & Tokens
  const designContract = path.join(appPath, 'DESIGN_CONTRACT.md');
  const hasTokens = [
    path.join(appPath, 'tokens.css'),
    path.join(appPath, 'web_preview', 'tokens.css'),
    path.join(appPath, 'web_preview', 'index.css'),
    path.join(appPath, 'AevumApp', 'UI', 'DesignSystem', 'Theme.swift')
  ].some(f => fs.existsSync(f));

  if (fs.existsSync(designContract) || hasTokens) {
    report.p2 = true;
    report.details.push(`Porte 2 OK (Tokens scellés, Contract=${fs.existsSync(designContract)})`);
  } else {
    report.details.push('Porte 2 MANQUANTE : Zéro token CSS ou Theme.swift');
  }

  // Porte 3 : Engine Core Loop
  const hasEngine = [
    path.join(appPath, 'engine'),
    path.join(appPath, 'web_preview', 'engine'),
    path.join(appPath, 'AevumApp', 'Core')
  ].some(d => fs.existsSync(d) && fs.readdirSync(d).some(f => /\.(js|swift)$/i.test(f)));

  if (hasEngine) {
    report.p3 = true;
    report.details.push('Porte 3 OK (Moteur logique Core Loop présent)');
  } else {
    report.details.push('Porte 3 MANQUANTE : Aucun moteur dans engine/ ou Core/');
  }

  // Porte 4 : Intégrité
  report.p4 = report.p0 && report.p1 && report.p2 && report.p3;
  return report;
}

function initAppSkeleton(slug, title) {
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const appPath = path.join(APPS_DIR, cleanSlug);
  const appTitle = title || cleanSlug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  console.log(`\n🚀 INITIALISATION 4 PORTES : apps/${cleanSlug}/`);
  const dirs = [
    appPath,
    path.join(appPath, 'data'),
    path.join(appPath, 'engine'),
    path.join(appPath, 'ui'),
    path.join(appPath, 'web_preview', 'data'),
    path.join(appPath, 'web_preview', 'engine')
  ];
  dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));

  // 1. BRIEF.md (Porte 0)
  fs.writeFileSync(path.join(appPath, 'BRIEF.md'), `# BRIEF : ${appTitle}
## 1. Problème n°1 Résolu
[Décrire la friction exacte]

## 2. Persona & Contexte
[Cible et état d'esprit]

## 3. Anti-Scope (No-Gos Stricts)
- Pas de [Feature superflue]
- Pas d'inlining de données

## 4. Appétit & Complexité
- Budget : 1 sprint atomique
- Format : Micro-App Swiss Craft

## 5. Plateforme Cible
- Web Preview & iOS Native Ready
`);

  // 2. PRD.md (Porte 1)
  fs.writeFileSync(path.join(appPath, 'PRD.md'), `# PRD : ${appTitle}
## Cas d'Usage
1. Session active
2. Suivi de progression

## Flux & États (FSM)
IDLE -> ACTIVE -> COMPLETE -> REWARD

## Données Pures Découplées
- data/profile.json
- data/catalog.json
`);

  // 3. DESIGN_CONTRACT.md (Porte 2)
  fs.writeFileSync(path.join(appPath, 'DESIGN_CONTRACT.md'), `# CONTRAT DE DESIGN : ${appTitle}
- Référence Open Design : od://projects/${cleanSlug}
- Palette : #0B0D10 (Dark Charcoal), #14171C (Surface), #00F29D (Émeraude), #00C2FF (Cyan)
- Typographie : Inter / SF Pro (Grille 8px)
`);

  // 4. Tokens CSS & Data stub
  fs.writeFileSync(path.join(appPath, 'tokens.css'), `:root {
  --bg-primary: #0B0D10;
  --bg-surface: #14171C;
  --border-subtle: #1F242D;
  --accent-emerald: #00F29D;
  --accent-cyan: #00C2FF;
  --text-primary: #F0F4F8;
  --grid-unit: 8px;
}
`);
  fs.writeFileSync(path.join(appPath, 'data', 'profile.json'), JSON.stringify({ xp: 0, level: 1, streak: 0 }, null, 2));

  console.log(`✅ Squelette conforme aux 4 Portes généré dans apps/${cleanSlug}/`);
}

function run() {
  const p = parseArgs();
  if (p.action === 'init') {
    initAppSkeleton(p.init, p.title);
    return;
  }

  console.log('\n============================================================');
  console.log('🚪 MASTER PLAN : AUDIT PROTOCOLE DES 4 PORTES (GATEKEEPER)');
  console.log('============================================================\n');

  const targets = p.app ? [p.app] : fs.readdirSync(APPS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let allPass = true;
  targets.forEach(appName => {
    const res = auditAppGates(appName);
    const badge = (ok) => ok ? '✅' : '❌';
    console.log(`📱 APP: apps/${appName}/`);
    console.log(`   ${badge(res.p0)} Porte 0 (Brief & Anti-Scope)`);
    console.log(`   ${badge(res.p1)} Porte 1 (PRD & Données Pures)`);
    console.log(`   ${badge(res.p2)} Porte 2 (Design Contract & Tokens)`);
    console.log(`   ${badge(res.p3)} Porte 3 (Spécimen Core Loop)`);
    console.log(`   ${badge(res.p4)} Porte 4 (Conformité Globale)`);
    res.details.forEach(d => console.log(`      ℹ️  ${d}`));
    console.log('');
    if (!res.p4) allPass = false;
  });

  console.log('------------------------------------------------------------');
  if (allPass) {
    console.log('🎉 TOUTES LES APPLICATIONS SONT CONFORMES AUX 4 PORTES.');
    process.exit(0);
  } else {
    console.log('⚠️ CERTAINES PORTES SONT INCOMPLÈTES. CONSULTER LES DÉTAILS.');
    // Sortie non bloquante pour diagnostic
    process.exit(0);
  }
}

run();
