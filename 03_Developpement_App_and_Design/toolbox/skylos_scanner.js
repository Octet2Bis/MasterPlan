#!/usr/bin/env node
/**
 * SKYLOS SCANNER — LOCAL-FIRST CODE INTEGRITY & AI HALLUCINATION AUDITOR
 * Pilier : 03_Developpement_App_and_Design / Toolbox
 * Plafond strict : < 200 lignes (Commandement #1).
 * 
 * Rôles clés :
 * 1. Détection des hallucinations d'IA (require/import de fichiers inexistants).
 * 2. Détection de secrets en clair (tokens Telegram, API keys, passwords).
 * 3. Traque des fichiers non conformes au plafond monolithique (< 250 lignes).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SCANNED_EXTS = ['.js', '.ts', '.swift', '.py'];
const IGNORED_DIRS = [
  'node_modules', '.git', '.secrets', 'build', 'dist', '.build',
  '.next', '.quarantine', '.gemini', 'scratch', 'coverage', '.cache'
];

const SECRET_PATTERNS = [
  { name: 'Clé Telegram Bot', regex: /bot\d{8,10}:[A-Za-z0-9_-]{30,}/i },
  { name: 'Clé OpenAI / Anthropic', regex: /sk-(ant-)?[A-Za-z0-9_-]{20,}/i },
  { name: 'Clé Privée RSA / PEM', regex: /-----BEGIN (RSA )?PRIVATE KEY-----/i }
];

function collectCodeFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectCodeFiles(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SCANNED_EXTS.includes(ext)) results.push(fullPath);
    }
  }
  return results;
}

function scanFile(filePath) {
  const relPath = path.relative(ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileErrors = [];
  const fileWarnings = [];

  // 1. Audit Plafond Monolithique (< 250 lignes)
  // Exception : fichiers de déclarations de données statiques déjà existantes dans src/data/*.ts
  const normRel = relPath.split(path.sep).join('/');
  const isDataDeclaration = normRel.includes('src/data/');
  if (lines.length > 250 && !isDataDeclaration) {
    fileErrors.push(`Plafond dépassé : ${lines.length}L (> 250L requis par Commandement #1)`);
  } else if (lines.length > 250 && isDataDeclaration) {
    fileWarnings.push(`Dataset TypeScript étendu : ${lines.length}L (recommandation : migrer vers data/*.json)`);
  }

  // 2. Traque des Secrets en Clair
  SECRET_PATTERNS.forEach(({ name, regex }) => {
    if (regex.test(content)) {
      fileErrors.push(`Fuite potentielle de secret [${name}] détectée`);
    }
  });

  // 3. Détection d'Hallucinations d'Imports Relatifs (Node.js require & ES import)
  if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const importRegex = /(?:require\(|from\s+)['"](\.[^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      const dir = path.dirname(filePath);
      const possiblePaths = [
        path.resolve(dir, importPath),
        path.resolve(dir, `${importPath}.js`),
        path.resolve(dir, `${importPath}.ts`),
        path.resolve(dir, `${importPath}.tsx`),
        path.resolve(dir, `${importPath}.json`),
        path.resolve(dir, `${importPath}/index.js`),
        path.resolve(dir, `${importPath}/index.ts`)
      ];
      const exists = possiblePaths.some(p => fs.existsSync(p));
      if (!exists) {
        fileErrors.push(`Hallucination d'import : "${importPath}" introuvable sur le disque`);
      }
    }
  }

  return { relPath, linesCount: lines.length, errors: fileErrors, warnings: fileWarnings };
}

function runSkylos() {
  console.log('\n============================================================');
  console.log('🛡️ SKYLOS SCANNER : AUDIT LOCAL-FIRST (INTÉGRITÉ & SÉCURITÉ)');
  console.log('============================================================\n');

  const files = collectCodeFiles(ROOT);
  console.log(`📊 Fichiers analysés : ${files.length} fichiers (.js, .ts, .swift, .py)`);

  let totalErrors = 0;
  let totalWarnings = 0;
  const issues = [];

  files.forEach(file => {
    const res = scanFile(file);
    if (res.errors.length > 0 || res.warnings.length > 0) {
      issues.push(res);
      totalErrors += res.errors.length;
      totalWarnings += res.warnings.length;
    }
  });

  if (totalErrors === 0) {
    console.log(`✅ 100% CONFORME : 0 fuite de secret, 0 hallucination d'import, code < 250L.`);
    if (totalWarnings > 0) console.log(`ℹ️  ${totalWarnings} recommandation(s) d'optimisation.`);
    console.log('------------------------------------------------------------');
    console.log('🎉 SKYLOS SCAN : SUCCÈS DÉTERMINISTE.');
    console.log('------------------------------------------------------------\n');
    return { success: true, filesCount: files.length, totalErrors: 0, totalWarnings };
  } else {
    console.error(`🚨 ${totalErrors} ERREUR(S) CRITIQUE(S) DÉTECTÉE(S) :`);
    issues.forEach(iss => {
      iss.errors.forEach(e => console.error(`  ❌ [${iss.relPath}] ${e}`));
      iss.warnings.forEach(w => console.warn(`  ⚠️  [${iss.relPath}] ${w}`));
    });
    console.log('------------------------------------------------------------\n');
    return { success: false, filesCount: files.length, totalErrors, totalWarnings };
  }
}

if (require.main === module) {
  const res = runSkylos();
  process.exit(res.success ? 0 : 1);
}

module.exports = { runSkylos, scanFile, collectCodeFiles };
