/**
 * OUTBOUND SNIPER — STANDALONE PACKAGING SCRIPT
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper (< 100 lignes)
 * Génère une archive ZIP autonome prête pour déploiement sur une autre machine.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SOURCE_DIR = __dirname;
const APP_NAME = 'outbound_sniper_standalone';
const LOCAL_ZIP = path.join(SOURCE_DIR, '..', `${APP_NAME}.zip`);
const DESKTOP_DIR = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Desktop');
const DESKTOP_ZIP = path.join(DESKTOP_DIR, `${APP_NAME}.zip`);

console.log('📦 Création de l\'archive autonome Outbound Sniper Studio...');

// Éléments à inclure dans le package autonome
const includeItems = [
  'server.js', 'package.json', 'tokens.css',
  'start_windows.bat', 'start_mac_linux.sh',
  'README.md', 'AGENTS.md', 'ROADMAP.md', 'PRD.md', 'BRIEF.md',
  'data', 'engine', 'public'
];

// Vérification de la présence des fichiers clés
includeItems.forEach(item => {
  if (!fs.existsSync(path.join(SOURCE_DIR, item))) {
    console.warn(`⚠️ Attention : élément manquant : ${item}`);
  }
});

try {
  // Suppression des anciens zip s'ils existent
  if (fs.existsSync(LOCAL_ZIP)) fs.unlinkSync(LOCAL_ZIP);
  if (fs.existsSync(DESKTOP_ZIP)) fs.unlinkSync(DESKTOP_ZIP);

  if (process.platform === 'win32') {
    // PowerShell Compress-Archive sous Windows avec tableau explicite @(...)
    const pathsArray = includeItems
      .map(item => `'${path.join(SOURCE_DIR, item).replace(/'/g, "''")}'`)
      .join(', ');

    const psCmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "$files = @(${pathsArray}); Compress-Archive -Path $files -DestinationPath '${LOCAL_ZIP.replace(/'/g, "''")}' -Force"`;
    execSync(psCmd, { stdio: 'inherit' });
  } else {
    // Commande zip native sous macOS / Linux
    const cmd = `cd "${SOURCE_DIR}" && zip -r "${LOCAL_ZIP}" ${includeItems.join(' ')}`;
    execSync(cmd, { stdio: 'inherit' });
  }

  // Copie vers le Bureau si accessible
  if (fs.existsSync(DESKTOP_DIR)) {
    fs.copyFileSync(LOCAL_ZIP, DESKTOP_ZIP);
    console.log(`✅ Copie sur le Bureau : ${DESKTOP_ZIP}`);
  }

  const stat = fs.statSync(LOCAL_ZIP);
  const sizeKb = Math.round(stat.size / 1024);

  console.log(`\n🎉 ARCHIVE AUTONOME PRÊTE (${sizeKb} Ko) :`);
  console.log(`📍 Emplacement 1 : ${LOCAL_ZIP}`);
  if (fs.existsSync(DESKTOP_ZIP)) {
    console.log(`📍 Emplacement 2 (Bureau) : ${DESKTOP_ZIP}`);
  }
  console.log('\n💡 Zéro npm install nécessaire : le destinataire dézippe et clique sur start_windows.bat ou start_mac_linux.sh !');
} catch (err) {
  console.error('❌ Erreur lors de la compression :', err.message);
  process.exit(1);
}
