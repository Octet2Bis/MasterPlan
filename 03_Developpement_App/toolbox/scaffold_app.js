/**
 * MASTER PLAN — APP SCAFFOLDER
 * Crée une nouvelle application isolée dans 03_Developpement_App/apps/<app_name>/
 * Usage: node scaffold_app.js <nom_app> [ios|web|fullstack]
 */

const fs = require('fs');
const path = require('path');

const appName = process.argv[2];
const appType = (process.argv[3] || 'ios').toLowerCase();

if (!appName) {
  console.log('Usage: node scaffold_app.js <nom_app> [ios|web|fullstack]');
  process.exit(1);
}

const appsDir = path.resolve(__dirname, '../apps');
const targetAppDir = path.join(appsDir, appName);

if (fs.existsSync(targetAppDir)) {
  console.error(`🚨 L'application apps/${appName} existe déjà !`);
  process.exit(1);
}

console.log(`🚀 Création de la nouvelle application : apps/${appName}/ [Type : ${appType.toUpperCase()}]`);

// Création de l'arborescence standardisée
const dirsToCreate = [
  path.join(targetAppDir, 'data'),
  path.join(targetAppDir, 'web_preview/data'),
  path.join(targetAppDir, 'web_preview/engine'),
  path.join(targetAppDir, 'web_preview/assets'),
  path.join(targetAppDir, 'Tests')
];

if (appType === 'ios') {
  dirsToCreate.push(
    path.join(targetAppDir, 'App'),
    path.join(targetAppDir, 'Core/Models'),
    path.join(targetAppDir, 'Core/Services'),
    path.join(targetAppDir, 'UI/Dashboard'),
    path.join(targetAppDir, 'UI/DesignSystem')
  );
}

dirsToCreate.forEach(d => fs.mkdirSync(d, { recursive: true }));

// Fichier README de cadrage
const readmeContent = `# ${appName.toUpperCase()} — Application Master Plan

- **Type :** ${appType.toUpperCase()}
- **Emplacement isolé :** \`03_Developpement_App/apps/${appName}/\`
- **Plafond strict :** < 250 lignes par fichier de code
- **Data :** Découplée dans \`data/*.json\`

## Structure
- \`App/\` : Point d'entrée
- \`Core/\` : Modèles & Moteurs métier
- \`UI/\` : Vues et composants déclaratifs
- \`web_preview/\` : Simulateur Web haute fidélité
`;

fs.writeFileSync(path.join(targetAppDir, 'README.md'), readmeContent, 'utf8');

console.log(`✅ Application apps/${appName}/ initialisée avec succès et 100% étanche !`);
