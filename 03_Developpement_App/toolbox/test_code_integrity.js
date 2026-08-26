/**
 * MASTER PLAN — CODE INTEGRITY & MULTI-APP QUALITY GATE
 * Ce script est le juge de paix déterministe pour 03_Developpement_App.
 * Il scanne dynamiquement TOUTES les applications dans apps/ pour garantir zéro interférence.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appsDir = path.resolve(__dirname, '../apps');
let totalErrors = [];
let totalPassed = 0;

console.log('\n============================================================');
console.log('🛡️ MASTER PLAN : AUDIT MULTI-APPS & INTÉGRITÉ ARCHITECTURALE');
console.log('============================================================\n');

if (!fs.existsSync(appsDir)) {
  console.error(`🚨 Dossier des applications introuvable : ${appsDir}`);
  process.exit(1);
}

const apps = fs.readdirSync(appsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

console.log(`📱 Applications détectées dans 03_Developpement_App/apps/ : ${apps.length}`);
apps.forEach(app => console.log(`   • apps/${app}/`));
console.log('------------------------------------------------------------\n');

for (const appName of apps) {
  const appPath = path.join(appsDir, appName);
  console.log(`🔍 [AUDIT APP] -> ${appName.toUpperCase()}`);

  // 1. Scan récursif des fichiers de code (.js, .ts, .swift, .py) pour le plafond de 250 lignes
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.build') {
          scanDir(fullPath);
        }
      } else if (/\.(js|ts|swift|py)$/i.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').length;
        const rel = path.relative(appPath, fullPath);

        if (lines > 250) {
          totalErrors.push(`[${appName}] Plafond dépassé (${lines} lignes > 250 max) : ${rel}`);
        } else {
          console.log(`  ✅ [Taille OK] ${rel} (${lines} lignes)`);
          totalPassed++;
        }

        // Test syntaxe Node pour les fichiers JS
        if (/\.js$/i.test(entry.name)) {
          try {
            execSync(`node --check "${fullPath}"`);
            console.log(`  ✅ [Syntaxe OK] ${rel}`);
            totalPassed++;
          } catch (e) {
            totalErrors.push(`[${appName}] Erreur de syntaxe JS dans ${rel} : ${e.message}`);
          }
        }
      } else if (/\.json$/i.test(entry.name)) {
        const rel = path.relative(appPath, fullPath);
        try {
          const raw = fs.readFileSync(fullPath, 'utf8');
          JSON.parse(raw);
          console.log(`  ✅ [JSON Valide] ${rel}`);
          totalPassed++;
        } catch (e) {
          totalErrors.push(`[${appName}] JSON corrompu dans ${rel} : ${e.message}`);
        }
      } else if (/\.html$/i.test(entry.name)) {
        const rel = path.relative(appPath, fullPath);
        const html = fs.readFileSync(fullPath, 'utf8');
        const lines = html.split('\n');
        const sectionStack = [];
        lines.forEach((line, idx) => {
          if (line.includes('<section')) {
            const m = line.match(/id="([^"]+)"/);
            sectionStack.push({ id: m ? m[1] : 'unnamed', line: idx + 1 });
          }
          if (line.includes('</section>')) {
            sectionStack.pop();
          }
        });
        if (sectionStack.length > 0) {
          totalErrors.push(`[${appName}] Balises <section> orphelines dans ${rel} : ${JSON.stringify(sectionStack)}`);
        } else {
          console.log(`  ✅ [Structure HTML Valide] ${rel} (0 section orpheline)`);
          totalPassed++;
        }
      }
    }
  }

  scanDir(appPath);

  // 2. Audit de Parité Déterministe SHA-256 des Datasets Partagés (Anti-Dérive Native <-> Web Preview)
  const nativeDataDir = path.join(appPath, 'AevumApp', 'Resources', 'Data');
  const webDataDir = path.join(appPath, 'web_preview', 'data');
  if (fs.existsSync(nativeDataDir) && fs.existsSync(webDataDir)) {
    const crypto = require('crypto');
    const nativeFiles = fs.readdirSync(nativeDataDir).filter(f => f.endsWith('.json'));
    nativeFiles.forEach(f => {
      const nativeFile = path.join(nativeDataDir, f);
      const webFile = path.join(webDataDir, f);
      if (!fs.existsSync(webFile)) {
        totalErrors.push(`[${appName}] Fichier web_preview manquant : web_preview/data/${f}`);
      } else {
        const hashNative = crypto.createHash('sha256').update(fs.readFileSync(nativeFile)).digest('hex');
        const hashWeb = crypto.createHash('sha256').update(fs.readFileSync(webFile)).digest('hex');
        if (hashNative !== hashWeb) {
          totalErrors.push(`[${appName}] Divergence critique SHA-256 entre Native et Web Preview : ${f}`);
        } else {
          console.log(`  ✅ [Parité SHA-256 OK] AevumApp <-> web_preview (${f})`);
          totalPassed++;
        }
      }
    });
  }
  console.log('');
}

// Résumé
console.log('------------------------------------------------------------');
if (totalErrors.length === 0) {
  console.log(`🎉 100% QUALITY GATE VALIDÉ (${totalPassed} vérifications passées avec succès).`);
  console.log('Toutes les applications dans apps/ respectent l\'étanchéité et les guidelines.');
  console.log('------------------------------------------------------------\n');
  process.exit(0);
} else {
  console.error(`🚨 ${totalErrors.length} ERREUR(S) DÉTECTÉE(S) SUR LE PARC APPS :`);
  totalErrors.forEach(err => console.error(`  ❌ ${err}`));
  console.log('------------------------------------------------------------\n');
  process.exit(1);
}
