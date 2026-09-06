/**
 * SAS D'IMMUNISATION POKA-YOKE & LINTER DÉTERMINISTE D'INTÉGRITÉ
 * Pilier : 03_Developpement_App_and_Design / Toolbox (< 200 lignes)
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '../..');
let totalErrors = [];
let totalPassed = 0;

function check(desc, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${desc}`);
    totalPassed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${desc} -> ${err.message}`);
    totalErrors.push(`${desc} -> ${err.message}`);
  }
}

console.log('\n============================================================');
console.log('🛡️ MASTER PLAN : AUDIT INTÉGRITÉ LOGICIELLE & POKA-YOKE');
console.log('============================================================\n');

// 1. Documents Régaliens & Sécurité
console.log('📌 1. Poka-Yoke — Documents Régaliens & Conformité Git :');
['LICENSE', 'SECURITY.md', 'master_router.md', 'AGENTS.md', 'SCHEMAS.md', 'AUDIT.md'].forEach(f => {
  check(`Document régalien : ${f}`, () => {
    if (!fs.existsSync(path.join(ROOT, f))) throw new Error(`Fichier manquant à la racine : ${f}`);
  });
});

// 2. Numérotation GTM
console.log('\n📌 2. Poka-Yoke — Normalisation GTM (Séquence 01 à 05) :');
['01_Strategy_and_Positioning', '02_Acquisition_and_AEO', '03_Experimentation', '04_Outbound_and_CRM', '05_Activation_and_CSM'].forEach(dir => {
  check(`Numérotation GTM complète : ${dir}`, () => {
    if (!fs.existsSync(path.join(ROOT, '01_GTM_Growth', dir))) throw new Error(`Dossier manquant : ${dir}`);
  });
});

// 3. Manifestes de Dépendances
console.log('\n📌 3. Poka-Yoke — Manifestes de Dépendances (Vaccin anti-sys.path) :');
['01_GTM_Growth/pyproject.toml', '02_Assistant_Personnel/package.json', '02_Assistant_Personnel/requirements.txt', '03_Developpement_App_and_Design/package.json'].forEach(m => {
  check(`Manifeste présent : ${m}`, () => {
    if (!fs.existsSync(path.join(ROOT, m))) throw new Error(`Manifeste manquant : ${m}`);
  });
});

// 4. Zéro Duplication Bilingue
console.log('\n📌 4. Poka-Yoke — Zéro Duplication Bilingue (.ps1 / .py) :');
check('Absence de scripts jumeaux (.ps1 / .py) dans Gestion_Fichiers', () => {
  const gDir = path.join(ROOT, '02_Assistant_Personnel/01_Gestion_Fichiers');
  if (fs.existsSync(gDir)) {
    const files = fs.readdirSync(gDir);
    const ps1 = files.filter(f => f.endsWith('.ps1')).map(f => f.replace('.ps1', ''));
    const py = files.filter(f => f.endsWith('.py')).map(f => f.replace('.py', ''));
    const twins = ps1.filter(f => py.includes(f));
    if (twins.length > 0) throw new Error(`Doublons détectés : ${twins.join(', ')}`);
  }
});

// 5. Audit Multi-Apps & Gatekeeping
console.log('\n📌 5. Audit Multi-Apps & Gatekeeping :');
const appsDir = path.join(ROOT, '03_Developpement_App_and_Design/apps');
if (fs.existsSync(appsDir)) {
  fs.readdirSync(appsDir).forEach(app => {
    const appPath = path.join(appsDir, app);
    if (!fs.statSync(appPath).isDirectory()) return;

    console.log(`🔍 [AUDIT APP] -> ${app.toUpperCase()}`);
    ['BRIEF.md', 'PRD.md'].forEach(req => {
      check(`[${app}] Fichier Porte présent : ${req}`, () => {
        if (!fs.existsSync(path.join(appPath, req))) throw new Error(`Fichier requis manquant : ${req}`);
      });
    });
    check(`[${app}] Tokens de Design scellés (tokens.css ou Theme.swift)`, () => {
      const hasTokens = fs.existsSync(path.join(appPath, 'tokens.css')) || fs.existsSync(path.join(appPath, 'AevumApp/UI/DesignSystem/Theme.swift'));
      if (!hasTokens) throw new Error('Tokens graphiques manquants (tokens.css ou Theme.swift)');
    });

    function scanDir(dir) {
      fs.readdirSync(dir).forEach(file => {
        const full = path.join(dir, file);
        if (full.includes('.git') || full.includes('node_modules') || full.includes('.build')) return;
        const stat = fs.statSync(full);
        if (stat.isDirectory()) scanDir(full);
        else if (/\.(js|ts|swift|py)$/i.test(file)) {
          const lines = fs.readFileSync(full, 'utf8').split('\n').length;
          check(`[${app}] Plafond < 250 lignes : ${path.relative(appPath, full)} (${lines}L)`, () => {
            if (lines > 250) throw new Error(`Fichier trop volumineux : ${lines} lignes`);
          });
        } else if (file.endsWith('.json')) {
          check(`[${app}] JSON Valide : ${path.relative(appPath, full)}`, () => {
            JSON.parse(fs.readFileSync(full, 'utf8'));
          });
        }
      });
    }
    scanDir(appPath);

    // Parité SHA-256 Aevum
    const nativeData = path.join(appPath, 'AevumApp/Resources/Data');
    const webData = path.join(appPath, 'web_preview/data');
    if (fs.existsSync(nativeData) && fs.existsSync(webData)) {
      fs.readdirSync(nativeData).filter(f => f.endsWith('.json')).forEach(f => {
        check(`[${app}] Parité SHA-256 : ${f}`, () => {
          const wPath = path.join(webData, f);
          if (!fs.existsSync(wPath)) throw new Error(`Fichier web manquant : ${f}`);
          const hN = crypto.createHash('sha256').update(fs.readFileSync(path.join(nativeData, f))).digest('hex');
          const hW = crypto.createHash('sha256').update(fs.readFileSync(wPath)).digest('hex');
          if (hN !== hW) throw new Error(`Divergence SHA-256 pour ${f}`);
        });
      });
    }
  });
}

// 6. Poka-Yoke — Linter Anti-IA-Slop & Standard Visuel
console.log('\n📌 6. Poka-Yoke — Linter Anti-IA-Slop & Standard Visuel (Bible Normative) :');
['anti_slop_design_bible.md', 'ui_archetype_matrix.md', 'ui_design_heuristics.md', 'ui_layers_manus_craft.md', 'venture_pipeline_standard.md'].forEach(rule => {
  check(`Règle de design canonique présente : .agents/rules/${rule}`, () => {
    if (!fs.existsSync(path.join(ROOT, '.agents/rules', rule))) throw new Error(`Règle manquante : ${rule}`);
  });
});

check('Bibliothèque de micro-icônes SVG intégrée', () => {
  const iconsDir = path.join(ROOT, '03_Developpement_App_and_Design/Ressources/Design_System/icons');
  if (!fs.existsSync(iconsDir) || fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg')).length < 5) {
    throw new Error('Dossier icons incomplet ou introuvable');
  }
});

// 7. Skylos Scanner — Audit AST, Secrets & Anti-Hallucination
console.log('\n📌 7. Poka-Yoke — Skylos Scanner (Secrets, AST & Anti-Hallucinations) :');
check('Audit Skylos Scanner validé avec 0 erreur', () => {
  const { runSkylos } = require('./skylos_scanner');
  const res = runSkylos();
  if (!res.success) throw new Error(`${res.totalErrors} violation(s) détectée(s) par Skylos`);
});

console.log('\n------------------------------------------------------------');
if (totalErrors.length === 0) {
  console.log(`🎉 100% QUALITY GATE & POKA-YOKE VALIDÉ (${totalPassed} vérifications réussies).`);
  console.log('Toutes les conventions de gouvernance et de design sont verrouillées.');
  console.log('------------------------------------------------------------\n');
  process.exit(0);
} else {
  console.error(`🚨 ${totalErrors.length} ERREUR(S) OU DÉRIVE(S) POKA-YOKE DÉTECTÉE(S) :`);
  totalErrors.forEach(err => console.error(`  ❌ ${err}`));
  console.log('------------------------------------------------------------\n');
  process.exit(1);
}
